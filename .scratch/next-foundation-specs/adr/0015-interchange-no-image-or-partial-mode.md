---
status: accepted
---

# Interchange has no image mode and no HTML-partial mode

Foundation's Interchange swaps an `<img>` `src`, an inline `background-image`, or fetched HTML by media query (`research/foundation-inventory-forms-media.md` Interchange). Under this library's rendering modes a directive that binds `src` renders the Server breakpoint's file on the server and swaps it after hydration, so a visitor on another breakpoint downloads two files, the largest contentful paint waits for JavaScript, and inside `@defer (hydrate never)` the wrong file stays; `<picture>`, `srcset`, and `sizes` choose the file at parse time with no script and are in the Browser target (`research/web-platform-features.md` 12), and Angular's `NgOptimizedImage` already generates `srcset` and `sizes` (it does not support `<picture>` in 22.2). Fetched HTML inserted with `innerHTML` is not compiled by Angular, so Foundation's `$(response).foundation()` step has no counterpart. We decided that Interchange keeps only a background mode (`NfsInterchange`) and a template mode (`NfsInterchangeOutlet`) on the `nfsInterchange` attribute, that images are documented as `<picture>` (art direction) and `NgOptimizedImage` or `srcset`/`sizes` (resolution switching) with a development-mode error on `img[nfsInterchange]`, and that HTML partials become template mode with a consumer `@defer` block and `httpResource` or `resource`.

## Considered options

- A `src`-binding image mode for parity with Foundation: rejected for the double download, the post-hydration swap, and the `hydrate never` residue above.
- A fetch-and-`innerHTML` partial mode, optionally held open with `PendingTasks` so the partial reaches server HTML: rejected; the markup is inert to Angular, it is a sanitisation surface, and fetching data is what `httpResource` already does.

## Consequences

- Foundation migrants rewrite `<img data-interchange>` as `<picture>`; the development error tells them so.
- When `NgOptimizedImage` supports `<picture>`, the image guidance moves to it with no library change.
