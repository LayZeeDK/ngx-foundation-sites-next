# 11. Native web platform features that can replace Foundation JavaScript

Type: research
Status: resolved
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

Which native HTML and CSS features, as of September 2026, can replace Foundation plugin JavaScript outright or shrink it to a thin directive, and what is their Baseline browser-support status? The library's first rung is the platform, so every spec must know what the platform already does.

Cover: `<dialog>` (modal, `closedby`, `requestClose`, top layer, `::backdrop`); the `popover` attribute (`auto`, `manual`, `hint`), `popovertarget`, and its light-dismiss and top-layer behaviour; CSS anchor positioning (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`); `<details>` and `<summary>` with the `name` attribute for exclusive accordions and `::details-content`; `interpolate-size` and `calc-size()` for height animations; `@starting-style`, `transition-behavior: allow-discrete`, and `overlay`; scroll-driven animations; `position: sticky`; `scroll-snap-*`, `scrollIntoView`, `scroll-behavior`, `scroll-margin`, `scrollend`; IntersectionObserver and ResizeObserver; container queries and container units; `<picture>`, `srcset`, `sizes`, and `loading=lazy`; the Constraint Validation API and `:user-invalid`; `<input type="range">` styling limits including multi-thumb; the `inert` attribute; `:has()`; View Transitions; `prefers-reduced-motion`; `inputmode`; the Invoker Commands API (`command`, `commandfor`); `CloseWatcher`.

Sources: the WHATWG HTML standard at https://html.spec.whatwg.org/multipage/ (fetch the specific section pages via markdown.new), CSS specs at https://drafts.csswg.org/, MDN pages for Baseline status (https://developer.mozilla.org/en-US/docs/Web/...), and https://web.dev/baseline. Fetch fallback chain: markdown.new (POST JSON `{"url": "<target_url>", "method": "auto", "retain_images": true}` to `https://markdown.new/`), then WebFetch, then `node D:/projects/github/LayZeeDK/lz-cybernetics-ai-plugins/tools/url-to-markdown/url-to-markdown.mjs <url> --output <path>`, then playwright-cli.

Browser support target (added by the user while this ticket was in progress): the library follows Angular 22's browser support, which is the Baseline "widely available" set on 2026-05-07 (https://web-platform-dx.github.io/supported-browsers/?widelyAvailableOnDate=2026-05-07&includeDownstream=false). For every feature, state whether it was Baseline widely available on 2026-05-07 (that is, newly available on or before roughly 2023-11-07), so later tickets can tell at a glance what is usable without a fallback.

## Deliverable

`research/web-platform-features.md`: one section per feature with what it does, its Baseline status and date, whether it meets the 2026-05-07 widely-available target, known gaps, and the Foundation plugins it could serve (name them). End with a table: plugin, platform features that apply, and whether the platform alone plausibly covers the plugin. Cite URLs. Plain ASCII.

## Answer

Findings: ../research/web-platform-features.md

Gist (all statuses read on 2026-09-25 from MDN banners, web-features 3.40.0 and mdn/browser-compat-data; target set is Chrome/Edge/Firefox 119 and Safari 17):

- In the target set: `<dialog>` with `showModal()`, top layer, `::backdrop`, `:modal`; `<details>`/`<summary>` and `toggle`; `position: sticky`; scroll snap, `scrollIntoView()`, `scroll-behavior`, `scroll-margin`/`scroll-padding`; IntersectionObserver and ResizeObserver; container size queries and `cq*` units; `<picture>`, `srcset`, `sizes`, `<img loading="lazy">`; Constraint Validation API and `:user-invalid` (Chrome 119 exactly); `<input type="range">` with `appearance: none`; `inert`; `prefers-reduced-motion`; `inputmode`.
- Out of the target set, newly available: popover (`auto`/`manual`, `popovertarget`; Firefox 125, Baseline 2024-04 / API 2025-01), CSS anchor positioning (Baseline 2026-01; `position-anchor` conformant only from Chrome 151 / Firefox 151 / Safari 27, 2026-09), `<details name>` (Chrome 120, one version past), `::details-content` (2025-09), `@starting-style` and `transition-behavior: allow-discrete` (2024-08), `scrollend` (2025-12), same-document View Transitions (2025-10), Invoker Commands (2025-12), `:has()` (Firefox 121, two versions past; widely available 2026-06-19), container style queries (2026-05-19), vertical range via `writing-mode` (2024-04).
- Limited availability, no Baseline: `<dialog closedby>` and `CloseWatcher` (no WebKit release), `popover="hint"` (no WebKit), `interpolate-size`/`calc-size()`, `overlay`, scroll-driven animations (Firefox unshipped), container scroll-state queries, cross-document view transitions, `<img sizes="auto">`, standard `::slider-*` pseudo-elements (unshipped everywhere), multi-thumb range (not in the spec at all).
- Plugins the platform covers outright on the target set: SmoothScroll, Interchange (images), Equalizer (CSS layout plus ResizeObserver), Magellan and Sticky (with a thin IntersectionObserver directive), Orbit (scroll snap plus a thin directive), Reveal (`<dialog>`; click-outside and animation need a few lines), Slider single-handle.
- Plugins whose natural platform replacement lies entirely outside the target set: Dropdown, DropdownMenu, Tooltip. They wait on popover and anchor positioning; specs need a CDK Overlay or measured-position fallback behind `'popover' in HTMLElement.prototype` and `@supports (anchor-name: --x)`.
- Every animated open/close (Reveal, OffCanvas, Dropdown, Tooltip, Toggler, Accordion, Orbit) keeps the Motion UI class-toggle path as primary; `@starting-style`/`overlay` are enhancement only until 2027-02 at the earliest.

Surprises: the web-features `anchor-positioning` umbrella still reports `baseline: false` although every property in it is Baseline 2026, because two `position-visibility` values are Safari-27-only. `position-anchor`'s initial value changed four times (`implicit` -> `auto` -> `none` -> `normal`), so styles must set it explicitly. web.dev/baseline's own copy dates Constraint Validation to March 2023 and `:user-invalid` to October 2023, while the dataset MDN renders says 2018-12 and 2023-11-02; the deliverable uses the dataset. `:has()` and `<details name>` miss the target by one or two browser versions.

Open questions (not settled from sources): whether Foundation's `.dropdown-pane` and `.tooltip` Sass positions correctly once the element is in the top layer (they are `position: absolute` relative to an offset parent; anchor positioning changes the containing block); which `<summary>` heading structure exposes the right accessible name across engines for the APG accordion pattern; whether `sizes="auto"` and `<iframe loading="lazy">` matter for Interchange at all. These are prototype-ticket material (popover plus anchor positioning under Foundation CSS is already listed in map.md).
