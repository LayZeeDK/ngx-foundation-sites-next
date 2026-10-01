# 184. Prototype: a directive that loads and unloads its family's consumer-compiled styles

Type: prototype
Status: resolved
Blocked by: 182, 183
Labels: wayfinder:prototype
Map: ../map.md

## Question

Does the strongest candidate from [Research: loading and unloading component styles from directives in Angular 22.2](182-research-lazy-style-loading-from-directives.md) work end to end on two families, given the split facts from [Research: splitting Foundation 6.9's CSS per family](183-research-foundation-sass-per-family-split.md)? Pick one family that stands alone, and one that depends on another family's rules (for example Button Group over Button). Run the second-strongest candidate too if the research leaves the choice open.

## How to work it

Build a synthetic Nx 23.2 / Angular 22.2 workspace under `D:/tmp/`, with SSR, and with the Foundation settings changed from the defaults so that a default-compiled stylesheet would show the difference. Measure, in Chromium, Firefox, and WebKit through Playwright:

1. The consumer's settings reach the rendered CSS.
2. The family's CSS is absent before the first directive instance, present while any instance exists, and removed after the last one is destroyed, including after an `animate.leave` animation finishes.
3. The CSS is in the server HTML for a server-rendered instance, with no flash of unstyled content and no duplicate at hydration. Cover full hydration, incremental hydration with `@defer (hydrate on ...)`, and a client-only `@defer` block.
4. The cascade order is the same in every load order (`@layer` or whatever the research found).
5. What the consumer writes, counted in files and lines.

Added 2026-10-01 from the two research answers. The measured gaps in Angular's style count need a working answer, or a recorded failure:

6. A destroy while any `animate.leave` runs anywhere in the app skips `removeStyles` for good (`dom_renderer.ts:683`). Find a removal that waits for the leave animation and does not leak, without private API if possible.
7. Instances still waiting for incremental hydration are not counted, so their styles are removed while their server-rendered markup is on the page. Find a way to count them.
8. Beasties' critical-CSS copy outlives an unload. Find whether it keeps a leading `@layer` order statement first.
9. Foundation's unlayered tag and attribute rules (global styles, most of Forms) beat any layered family rule. Measure whether putting them in the first layer of the order keeps Foundation's look.
10. The cost of one hidden carrier view per directive instance, against one per family with the library counting instances itself.

For the second family, use one that needs another family's rules: Button Group over Button, or the dropdown menu over `foundation-menu`, the one pair whose load order changes the result.

Capture the decisive files and a README with the question, how to run it, and the verdict under `prototypes/lazy-family-styles/` (map, Where things live).

## Answer

Resolved 2026-10-01 (Opus 5.5). Prototype: [prototypes/lazy-family-styles/README.md](../prototypes/lazy-family-styles/README.md). The workspace is Nx 23.2.1 with Angular 22.2.0 and SSR, under `D:/tmp/nfs-proto-lazy-family-styles`, measured against production builds in Chromium 153, Firefox 155, and WebKit 26.6. The mechanism is research M1' with the library counting per family: one consumer-compiled `ViewEncapsulation.None` carrier per family, loaded lazily, with Callout standing alone and Dropdown Menu depending on Menu. Nothing is decided here; [Decide: how first-milestone directives load and unload their family styles](185-decide-lazy-family-styles.md) chooses. Results were the same in all three engines unless noted.

- **1 Settings: pass.** Six non-default settings reach the computed styles (for example, callout padding 44px against the default 16px).
- **2 Lifecycle: pass.** No family `<style>` exists before the first instance. One exists while any instance is alive (count `0 1 1 1 0 1 0`), and it is removed after the last. Behaviour after `animate.leave` is under 6.
- **3 SSR: pass for full and incremental hydration** (incremental needs the 7 fix). There is one `<style>` per family in the server HTML, it is styled with JavaScript off, 0 style mutations happen after `DOMContentLoaded`, and 0 frames are unstyled. **Client-only `@defer` fails with lazy carriers**: up to 1 unstyled frame locally and 19-20 with a 300 ms chunk delay. Eager carriers (in `main.js`) give 0 unstyled frames, for about 4.4 kB more initial transfer for four families.
- **4 Order: pass with `@layer`.** With one order statement at the top of the global stylesheet, the dropdown submenu is `display: none` in every client and server load order. In the unlayered build it is `display: flex` when the dropdown-menu sheet loads first.
- **5 Consumer:** 9 new files and 63 lines for four families: a 5-line `.scss` and a 9-line carrier component per family, and a map. On top of that, 11 lines in `styles.scss`, `app.config.ts`, and `project.json`. Each further family adds 2 files and 15 lines.
- **6 Leave animations: Angular's own count leaks in all three scenarios.** The public wait on `document.getAnimations()` fixes a leaving ancestor and an unrelated leave. It still leaks while any `(animate.leave)` listener element is on the page, because that view joins Angular's leaving set when it is created (read from source, `animation.ts:416`). Waiting on the **private** `ɵallLeavingAnimations` fixes all three. So does a `repair` mode that removes and re-appends the `<style>` with DOM APIs, but it changes nodes Angular owns and leaves Angular's internal count above zero.
- **7 Dehydrated instances: fail without a fix; pass with it.** The fix is a `data-nfs-styles` host attribute plus a client bootstrap scan that holds each server-rendered instance until a directive claims it. With it, the style stays under the dehydrated callout and causes no mutation when the block hydrates. Turning off the `@if` around a dehydrated block left its server DOM on the page.
- **8 Beasties: pass.** The inlined critical `<style>` comes first in `<head>` and starts with the `@layer` order statement. It holds no family rules, and nothing styles a `.callout` after the unload.
- **9 Unlayered globals: fail; first layers: pass.** With global styles and forms unlayered, Foundation's `button` reset beats the layered `.button` (44 property differences). In `nfs.global` and `nfs.forms`, the result has 0 differences from Foundation's unlayered cascade. The running app differs only in Firefox's `font-family` serialisation.
- **10 Cost:** a carrier per instance takes about 1.8 KB more heap per instance in Chromium (12,469 against 3,572 KB at 5,000 instances). Render time is between equal and 60% slower, and not consistent across runs. Destroy time is similar.
