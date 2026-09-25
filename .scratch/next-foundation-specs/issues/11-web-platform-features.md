# 11. Native web platform features that can replace Foundation JavaScript

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which native HTML and CSS features, as of September 2026, can replace Foundation plugin JavaScript outright or shrink it to a thin directive, and what is their Baseline browser-support status? The library's first rung is the platform, so every spec must know what the platform already does.

Cover: `<dialog>` (modal, `closedby`, `requestClose`, top layer, `::backdrop`); the `popover` attribute (`auto`, `manual`, `hint`), `popovertarget`, and its light-dismiss and top-layer behaviour; CSS anchor positioning (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`); `<details>` and `<summary>` with the `name` attribute for exclusive accordions and `::details-content`; `interpolate-size` and `calc-size()` for height animations; `@starting-style`, `transition-behavior: allow-discrete`, and `overlay`; scroll-driven animations; `position: sticky`; `scroll-snap-*`, `scrollIntoView`, `scroll-behavior`, `scroll-margin`, `scrollend`; IntersectionObserver and ResizeObserver; container queries and container units; `<picture>`, `srcset`, `sizes`, and `loading=lazy`; the Constraint Validation API and `:user-invalid`; `<input type="range">` styling limits including multi-thumb; the `inert` attribute; `:has()`; View Transitions; `prefers-reduced-motion`; `inputmode`; the Invoker Commands API (`command`, `commandfor`); `CloseWatcher`.

Sources: the WHATWG HTML standard at https://html.spec.whatwg.org/multipage/ (fetch the specific section pages via markdown.new), CSS specs at https://drafts.csswg.org/, MDN pages for Baseline status (https://developer.mozilla.org/en-US/docs/Web/...), and https://web.dev/baseline. Fetch fallback chain: markdown.new (POST JSON `{"url": "<target_url>", "method": "auto", "retain_images": true}` to `https://markdown.new/`), then WebFetch, then `node D:/projects/github/LayZeeDK/lz-cybernetics-ai-plugins/tools/url-to-markdown/url-to-markdown.mjs <url> --output <path>`, then playwright-cli.

## Deliverable

`research/web-platform-features.md`: one section per feature with what it does, its Baseline status and date, known gaps, and the Foundation plugins it could serve (name them). End with a table: plugin, platform features that apply, and whether the platform alone plausibly covers the plugin. Cite URLs. Plain ASCII.
