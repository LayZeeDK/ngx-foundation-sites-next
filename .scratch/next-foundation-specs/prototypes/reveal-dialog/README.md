# Prototype: Reveal on native `<dialog>` under Foundation Sass

Ticket: [Prototype: Reveal on native `<dialog>` under Foundation Sass](../../issues/42-prototype-reveal-dialog.md).

Throwaway code. It answers one question and is not a design for the Reveal directive's API.

## Question

Do `dialog.reveal` elements styled by `foundation-reveal`, plus a `::backdrop` rule carrying `.reveal-overlay` styling, reproduce Foundation Reveal? The cases: the size classes, full screen below medium, `overlay: false` through `show()`, nested modals, closing on a backdrop press, focus placement per the APG (never on the dialog element), focus restore, scroll lock, and an exit keyframe that finishes before `close()`. What custom CSS is unavoidable, and what does the dialog render on the server?

## What is here

These are the decisive files only. The full runnable workspace, with `node_modules` and build output, stays at `D:/tmp/nfs-proto-reveal-dialog/app` and is not committed.

- `package.json` -- a plain Angular CLI 22.2.0 application made with `npx @angular/cli@22.2.0 new app --ssr --style=scss --zoneless=true --defaults`. Added: `@angular/cdk@22.2.0`, `foundation-sites@6.9.0`, `@playwright/test@1.63.0`, `@axe-core/playwright@4.13.0`. Installed versions: Angular 22.2.0, TypeScript 6.0.3.
- `src/styles.scss` -- Foundation 6.9 Sass in the `@import` form (ADR 0012): `foundation-global-styles`, `foundation-button`, `foundation-close-button`, `foundation-reveal`, then the library mixins. Rules below the "Fixture only" comment are test scaffolding, not library CSS.
- `src/_nfs-reveal.scss` -- the only custom CSS: a `nfs-reveal` Library mixin, plus the Reveal part of `nfs-motion`. Each rule carries its reason.
- `src/app/reveal.ts` -- a throwaway `NfsReveal` directive on `dialog[nfsReveal]`. It has an `isOpen` model, `open(origin)`, `close()` and `toggle()`, and inputs `overlay`, `closeOnClick`, `closeOnEsc`, `multipleOpened`, `autoFocus`, `restoreFocus`, plus two prototype switches, `wrapFocus` and `scrollLock`. Escape goes through `cancel`. A backdrop press is handled on `pointerdown` with a check against the dialog's border box. The exit is the `.is-closing` State class, then `animationend` or the duration plus 100 ms fallback, then `close()`. The Foundation scroll-lock port is optional.
- `src/app/cases.ts` -- every case on one server-rendered page (`/`, with `?lock=foundation` for the scroll-lock variant). `src/app/open-by-default.ts` -- the `/open-by-default` route.
- `src/app/app.*.ts` -- `RenderMode.Server` for every route, `provideClientHydration()`, and `withComponentInputBinding()`.
- `e2e/reveal.spec.ts` -- 29 Playwright tests. Each one logs what it observed and then asserts the verdict. Five of them are the WCAG 2.2 AA checks.
- `playwright.config.ts` -- projects for chromium, firefox and webkit. There is no `webServer`: the SSR server is started by hand.
- `results.log` -- the observation lines from the final run: 87 passed, 29 tests times 3 engines.

## How to run

```
cd D:/tmp/nfs-proto-reveal-dialog/app
npx ng build
PORT=4420 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs
# second shell:
npx playwright test               # or --project=chromium / firefox / webkit
```

The generator pulled `vitest@5.0.2` (the map pins Vitest 4.1.x), so it was pinned back to `vitest@4.1.11`. `@angular/build` 22.2.0 accepts `^4.0.8 || ^5.0.0`. The prototype never runs Vitest. Every other version is the map's pin. WebKit runs on this Windows arm64 machine through Playwright 1.63's own WebKit build.

## Verdict

Yes, with six small documented CSS rules and three directive behaviours the ADR did not foresee. With the `nfs-reveal` rules below, `dialog.reveal` matches Foundation's own `.reveal` inside `.reveal-overlay`, to the pixel, for the default size and `.tiny`, `.small`, `.large` and `.full` at 320, 640 and 1024 px in Chromium, Firefox and WebKit. The `::backdrop` takes the overlay colour. `overlay: false` through `show()`, stacked nested modals, closing on a backdrop press, Escape through `cancel`, the exit keyframe before `close()` (with the `animationend` path, the fallback timer, and reduced motion), server rendering, and open-by-default after hydration all hold in all three engines. The WCAG 2.2 AA checks pass with no added rule: axe with the 2.2 AA tags in every size, target size on Foundation's `.close-button` (through the spacing exception), contrast of the glyph and of the dialog against the backdrop, and focus not obscured. CDK Dialog, ADR 0007's fallback, is not needed.

The page does scroll behind an open modal in all three engines, with and without `overscroll-behavior: contain`. Foundation's `html.is-reveal-open` lock must therefore be ported: Foundation's Sass rule, plus the directive writing the class, the `top` offset, and the scroll restore. That port holds in all three engines.

The three directive findings:

1. WebKit does not focus a button on mouse click, so the invoker must come from the Trigger, not from `document.activeElement`.
2. WebKit dispatches the `::backdrop` animation's `animationend` on the dialog with `pseudoElement: ''`, so the exit wait must match on the keyframe name.
3. A static `autoFocus="..."` attribute on a `<dialog>` is the HTML `autofocus` attribute, because attribute names are case-insensitive. Firefox and WebKit then focus the dialog itself. The fix that was tested: the directive removes its host's `autofocus` attribute just before `showModal()`.

## Results (Chromium / Firefox / WebKit unless noted)

| Case | Result | Evidence (`results.log`) |
| --- | --- | --- |
| Size classes and full screen below medium, at 320 / 640 / 1024 | Pass, all equal after rules 3 and 4 | e.g. 1024 `.tiny`: dialog `358,100,307,150` = Foundation `358,100,307,150`; every size at 320: `0,0,320,800` both |
| Without rules 3 and 4 (first probe) | Fail: dialog left-aligned (x=0 in Chromium, x=16 in Firefox and WebKit) and computed `position: absolute` | the first probe run, recorded in the ticket Answer |
| `::backdrop` = `.reveal-overlay` colour | Pass | `rgba(10, 10, 10, 0.45)` both |
| Text colour | Pass after rule 6 (UA `CanvasText` gave `rgb(0,0,0)` vs body `rgb(10,10,10)`) | size tests assert computed `color` |
| Scrolled page (scrollY 1000) | Pass after rule 3: dialog at y=100, page stays at 1000 | before rule 3 the dialog sat at the document top and the page jumped to 0 |
| Tall content | Pass after rule 5: box `212,100,600,600`, end of content reachable by scrolling the dialog | without it the box was 762 px tall from y=100, 62 px below the fold |
| `overlay: false` through `show()` | Pass: not `:modal`, `.without-overlay`, fixed and centred at `212,100`, page interactive, outside press closes, Escape closes through the directive's keydown | Foundation's CSS alone leaves `.without-overlay` at x=16; its JS centred it with an inline `left` |
| Nested, `multipleOpened` | Pass: both open, inner on top, focus in the inner; Escape closes only the inner, focus returns to its Trigger in the outer; the second Escape returns focus to the page Trigger | `stacked={... topIsInner:true, focus:"im-close"}` |
| Nested, `multipleOpened: false` | Pass for the open state; focus after the inner closes is `BODY` in all three (its Trigger was inside the dialog that closed) | `focusAfterInnerClose=BODY#` |
| Backdrop `pointerdown` | Pass: closes; the press does not reach the page button underneath (count stays 0); a press on the dialog padding and a drag from the content out to the backdrop do not close; `closeOnClick: false` stays open | `behind (0)` |
| Escape | Pass: `cancel` is prevented, `.is-closing` shows while still `open`, then it closes | `during exit={"open":true,"closing":true}` |
| `closeOnEsc: false` | Holds for one Escape. Repeated Escape with no user activation in between closes the dialog natively anyway: on the 3rd press in Chromium, the 2nd in Firefox and WebKit (from the 2-press and 3-press runs). The directive re-syncs through `close`, but there is no exit animation | `noesc:closed` in the log |
| Initial focus | Directive: first tabbable (`a#basic-link`) and selector (`button#af-ok`) in all three. Native with no `autofocus`: first focusable in all three. Native `autofocus` on a child: that child. No focusable content: the dialog itself in all three | focus JSON line |
| Static `autoFocus="native"` on the dialog | Without mitigation (run 3): Chromium focused the first link, while Firefox and WebKit focused `dialog#af-collide`, the dialog itself; the server HTML carries `autofocus="native"` on the `<dialog>`. With the directive removing its host's `autofocus` attribute just before `showModal()` (final run): `a#afc-link` in all three | focus JSON line |
| Tab at the ends (native) | None of the engines wraps. Chromium: last -> `body` -> first. Firefox (headless): stays on the last element. WebKit: last -> `body` -> the dialog element -> the close button. WebKit also leaves links out of its native Tab order (Safari's default), and puts the dialog element in it | Tab sequence lines |
| Tab wrap (directive keydown, `wrapFocus`) | Pass in all three: link -> close -> link, Shift+Tab reverses | `wr-link -> wr-close -> wr-link ...` |
| Restore focus | Directive, with the invoker passed by the Trigger: back on the Trigger in all three. Native close only (`restoreFocus: false`): the Trigger in Chromium and Firefox, `BODY` in WebKit | restore lines |
| Scroll behind, no lock | The page moves in all three: wheel over the backdrop (all three), wheel over the dialog (Chromium without `contain`; Firefox and WebKit even with `contain`), keys with focus inside (Chromium without `contain`; WebKit always; Firefox did not move) | `lock=none` lines |
| Scroll behind, Foundation lock port | Pass in all three: nothing moves, no visual jump on open, scroll restored to 500, `html` classes removed | `lock=foundation` lines |
| Exit keyframe, `animationend` | Pass: closes in 247-335 ms, before the 350 ms fallback, and `closed` is emitted after | `animationend path` lines |
| Exit keyframe, fallback | Pass: with the dialog's keyframes paused, closes in 359-389 ms, and the backdrop's end is ignored | `fallback timer` lines |
| `prefers-reduced-motion` | Pass: 1 ms keyframes, `animationend` still fires, closes in 15-56 ms | reduced-motion lines |
| Server HTML | Pass: `<dialog id="basic" ... class="reveal" jsaction="pointerdown:;keydown:;">` without `open`, and the content is present | server tag lines |
| Open by default | Pass: `showModal()` after hydration, `:modal`, focus on the close button, no console errors or warnings | `{"open":true,"modal":true,"focus":"obd-close"} console=[]` |
| JavaScript disabled | Closed and hidden (`display: none`), content in the DOM; open-by-default stays closed | no-JS line |
| axe on the open dialog (WCAG 2.2 AA tags) | 0 violations, 15 passes | axe lines |
| axe, WCAG 2.2 AA tags, every size (default, tiny, small, large, full) at 320 and 1024 px | 0 violations and 0 incomplete in all three; axe's `target-size` rule passes | `axe on the open dialog in each size` lines |
| 2.5.8 target size, Foundation `.close-button` | Pass through the spacing exception: the box is 18.7 x 32 px (under 24 px wide), and the nearest other target is 134-156 px from its centre | `size":[18.7,32]`, `minDistToOtherTarget` |
| 1.4.11 / 1.4.3, close-button glyph | Pass: idle `$closebutton-color` `rgb(138,138,138)` on white = 3.45:1; the glyph is 32 px (large text), so 3:1 applies either way. Hover and focus colour `rgb(10,10,10)` = 19.63:1 | `idleVsWhite=3.45` |
| Focus indicator | The browser default ring shows on `:focus-visible` (Chromium `auto 1px rgb(16,16,16)`, Firefox `dotted 1px black`, WebKit `auto 3px`); Foundation removes outlines only under what-input's `[data-whatinput='mouse']`, which the library does not load | `focusOutline` |
| 1.4.11, dialog against the backdrop | Pass: white dialog against a white page dimmed by `$reveal-overlay-background` (`rgb(144,144,144)`) = 3.17:1, the worst case (darker page content under the backdrop gives more). The `$medium-gray` border against the dimmed page is 1.95:1, but the background edge already meets 3:1 | `dialogVsDimmedPage=3.17` |
| 2.4.11 focus not obscured | Pass: each focus stop in the dialog, the last button of the tall dialog after Tab, and the restored Trigger are inside the viewport and hit-test to themselves. WebKit scrolls the tall dialog to the focused element one frame late (probe: `dialogScrollTop 1640`, same as the other engines once settled) | 2.4.11 lines |

## Custom CSS

Everything is in `src/_nfs-reveal.scss`, and each rule carries its reason there.

1. `.reveal[open] { display: block }` -- Foundation's `reveal-modal-base` sets `display: none`; its JavaScript showed the modal inline.
2. `.reveal[open] { position: fixed }` -- the top layer computes Foundation's `position: relative` to `absolute`, whose containing block is the initial containing block.
3. `.reveal[open] { inset-inline: 0 }` -- Foundation's medium-and-up centring (`left/right: auto; margin: 0 auto`) centres only in-flow boxes.
4. `.reveal[open] { max-height: calc(100% - 200px) }` -- keeps a tall dialog's box inside the viewport. The 200 px is Foundation's literal `top: 100px`, mirrored at the bottom.
5. `.reveal[open] { color: inherit }` -- undoes the UA `color: CanvasText` on `dialog`.
6. `.reveal::backdrop { background-color: $reveal-overlay-background }` -- Foundation's `reveal-overlay` mixin cannot be included, because it prints `display: none`.
7. Motion (the `nfs-motion` part): `nfs-fade-in` / `nfs-fade-out` on `.reveal[open]` and `.reveal.is-closing`; backdrop keyframes named apart (`nfs-reveal-backdrop-in/out`) so the directive can match the dialog's own `animationend` in WebKit; a 1 ms duration under `prefers-reduced-motion`.

Reused from Foundation unchanged: the size classes, `.full`, full screen below medium, `.collapse`, `.without-overlay`, `html.is-reveal-open` / `.zf-has-scroll`, and the padding, border, radius and background.

Workspace: `D:/tmp/nfs-proto-reveal-dialog/app`, with the helper scripts `restart.sh` and `run*.log` one level up.
