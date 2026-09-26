# 69. Prototype: Reveal `'auto'` offsets in CSS

Type: prototype
Status: open
Blocked by: 18
Labels: wayfinder:prototype
Map: ../map.md

## Question

Graduated on 2026-09-26 from the `## Prototype needed` section of the [Spec: Reveal](18-spec-reveal.md) answer. That spec replaces Foundation's JavaScript placement of a Reveal (`top = (viewport height - outer height) / 4`, horizontal centring, and numeric `vOffset`/`hOffset` written as `top`/`left` with zero margin) with CSS: rule 7 of the `nfs-reveal` mixin, `.reveal[open]:not(.full) { top: var(--nfs-reveal-top, 25%); translate: 0 var(--nfs-reveal-shift, -25%); margin-left: var(--nfs-reveal-left, auto) }` at medium and up, with rule 4 as `max-height: calc(100% - 2 * var(--nfs-reveal-top, min(100px, 10%)))`. Only running code can confirm it, in Chromium, Firefox, and WebKit:

1. A top-layer `dialog.reveal` lands within 1 px of Foundation 6.9's JavaScript position for the default size, `.tiny`, `.small`, `.large`, and `.without-overlay`, at 640 x 800, 1024 x 800, and 1440 x 900.
2. The same holds under `dir="rtl"`, on a scrolled page, and with nested modals.
3. Numeric `vOffset` and `hOffset` through the custom properties land where Foundation's inline `top`/`left` would.
4. Text inside the dialog stays crisp at fractional offsets (screenshot against the same dialog with an integer `top`).
5. `nfs-*` keyframes that animate `transform` compose with the `translate` property without moving the rest position.
6. `.full` and full screen below medium stay unaffected.

The spec assumes the rule as written. Fallback if a case fails: the measured port of Foundation's `_updatePosition` in the open render callback, with inline `top`, a `ResizeObserver` on the dialog, and a `window` `resize` listener while open; that changes only the Sass subsection and one render-callback step. If a case fails, the orchestrator reopens the Reveal spec with that fallback, otherwise the verdict is appended to its decision log.

Read first: `specs/reveal.md` (the Sass subsection with rules 4 and 7, the offsets decisions, and the rendering-modes subsection), `adr/0007-reveal-native-dialog.md`, `adr/0031-reveal-dismissal.md`, the Reveal dialog prototype's answer and `prototypes/reveal-dialog/README.md`, which already records Foundation's geometry, and `research/foundation-inventory-disclosure.md` (Reveal `_updatePosition`).

## How to work it

Build the prototype per `/mattpocock-skills:prototype` at the high fidelity the map's AFK override allows: extend the Reveal dialog prototype's plain Angular CLI 22.2 `--ssr` workspace at `D:/tmp/nfs-proto-reveal-dialog/app` (Angular 22.2.0, TypeScript 6.0.x, `foundation-sites` 6.9.0) or copy it to `D:/tmp/nfs-proto-reveal-offsets/`, and add the spec's rules 4 and 7. Never modify this repo's working tree outside the effort directory. Drive it with `@playwright/test` in all three engines, measuring against a reference dialog positioned by a port of Foundation's `_updatePosition` in the same page.

Capture it: copy the decisive files into `prototypes/reveal-auto-offsets/` in the effort directory with a README that states the question, how to run it, and the verdict. The workspace under `D:/tmp/` may stay; record its path.

Under `## Answer`: the verdict in one paragraph, a results table (case, engine, result, evidence), exact error text for failures, what the prototype does not prove, the decision it hands to the Reveal spec (per case: confirmed, or the named fallback), and anything left `OPEN FOR HUMAN`.
