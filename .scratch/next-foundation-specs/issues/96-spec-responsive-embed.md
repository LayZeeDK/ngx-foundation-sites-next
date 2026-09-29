# 96. Spec: Responsive Embed

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Responsive Embed to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/responsive-embed.md` and its Sass is `scss/components/_responsive-embed.scss, components/_flex-video.scss` in the 6.9.0 clone. Publish `specs/responsive-embed.md`.

Known from the triage: A check that the embedded `iframe` has a title (axe `frame-title`); the deprecated `.flex-video` alias.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/responsive-embed.md](../specs/responsive-embed.md).

### Measurements made for this ticket

The Card spec found that a container's `overflow: hidden` clips focus outlines and text and named the Responsive Embed as a container to check; this ticket measured it, and measured what hydration does to embedded elements, in a throwaway workspace (`D:/tmp/nfs-wave-96/`, not committed). Packages were read from the existing `D:/tmp/nfs-ct-prototype` install (Playwright 1.63, axe-core 4.13.0, Dart Sass 1.104.1); the SSR probe was an Angular CLI 22.2.0 application copied from the animate-enter prototype's skeleton, with that prototype's `node_modules` linked by a junction that was removed afterwards (nothing was written into it); servers on ports 5380 and 5381, stopped. Foundation 6.9.0 Sass from the local clone; Chromium, Firefox, and WebKit.

- M1, axe (`axe.mjs`, three engines): Foundation's three docs examples verbatim (frame URL `about:blank`) report `frame-title` (wcag2a, 4.1.2) on every iframe, plus `frame-tested` incomplete (best-practice). An unnamed `object` reports `object-alt`; an unnamed `embed` reports nothing (axe 4.13.0 has no `embed` rule); a `video` without a captions track reports `video-caption` incomplete, and passes with one. axe's frame, object, and media rules: `frame-title`, `frame-title-unique`, `frame-focusable-content`, `object-alt`, `video-caption`, `no-autoplay-audio`.
- M2, reflow at 320 by 640 (`axe.mjs`): the docs' `width="560"` iframe written bare makes `documentElement.scrollWidth` 560; inside the widescreen box it is 320 and the frame 320 by 180; the default box 320 by 240. Three engines.
- M3, focus (`focus.mjs`, `focus2.mjs`; the browser's own indicator, screenshots before and after a Tab compared pixel by pixel inside the box and in a 10 px band around it): frames (an `iframe`, and an `object` or `embed` of an HTML document) keep their content's indicator: Chromium and WebKit focus the frame's button, 240 and 248 changed pixels inside, none outside, unchanged with the clip released; Firefox stops first on the frame's document with no indicator (0 pixels, with or without the clip), then on the button. A `<video controls>` takes focus itself (`:focus-visible`): under Foundation's box Firefox 0 and WebKit 0 changed pixels, Chromium 1081 inside (a 1 px inner line) and 0 outside. `overflow: visible` (always, or only on `:focus-within`): Chromium 1500, Firefox 3016, WebKit 3012 outside. A negative `outline-offset` (-3px) on the focused element: Chromium 1976 and Firefox 3526 inside, WebKit 0 (its `auto` ring ignores the offset). A mouse click focuses the video without `:focus-visible`: clip released, no ring. Screenshots confirm the Chromium and Firefox rings.
- M3c, layout on focus (`float.mjs`): beside a 200 px left float in a 600 px container, the box is 400 by 337.5 px at x = 200 (its `padding-bottom` resolves against the container's 600 px, so beside a float the ratio is the container's). With `overflow: visible` on `:focus-within` alone the box becomes 600 px wide at x = 0 when the video takes focus, covering the float, in three engines; with `display: flow-root` added it stays 400 px at x = 200.
- M4, content beside the embedded element (`axe.mjs`): a caption with a link written inside the box after the frame lies at 0 to 26 px, under the frame; a hit test at the link returns the `iframe`; the link stays in the tab order. Three engines.
- M5, text in the box (`fallback.mjs`, 320 px, an `object` whose type no engine can show, with and without the 1.4.12 text spacing): a one-sentence fallback with a link ends 21 px (44 to 44.5 px with the spacing) down, inside both boxes; two short paragraphs end 165 px down without the spacing (inside both) and 220 to 220.5 px with it, 40 to 40.5 px past the 16:9 box's 180 px in all three engines, inside the 4:3 box's 240 px.
- M6, writing `src` again (`reset.mjs`): the same value written to an iframe's `src` property or attribute makes a new request, a new `load`, and a new frame document; a media element fires `emptied` and returns to 0 s (Firefox 0.60 to 0.00, WebKit 0.62 to 0.00; Chromium's seek did not take, `emptied` fired). Three engines.
- M7, hydration (`hydrate.mjs` with the SSR probe in `app/`; `provideClientHydration()`, development build, `main.js` held back until the server HTML had loaded its embeds): a static-`src` iframe, a bound-`[src]` iframe (`bypassSecurityTrustResourceUrl`), a static-`src` video, and a bound-`[src]` video are each requested once before hydration and once more at hydration; an iframe in `@defer (hydrate never)` once; an iframe in `@defer (on idle)` once, on the client only. Hydration clean: 26 hydrated nodes, 0 skipped components, no console errors. Three engines. The mechanism, read in Angular 22.2: `elementLikeStartShared` calls `setupStaticAttributes` on the located server node before directives are created, and a property binding writes on the first client pass (`setDomProperty` has no hydration skip).
- M8, candidate `nfs-responsive-embed` (`_nfs-responsive-embed.scss`, `compile.mjs`): Foundation's defaults emit `:root { --nfs-responsive-embed-ratios: widescreen; } .responsive-embed { display: flow-root; } .responsive-embed:focus-within { overflow: visible; }`; the docs' map writes `vertical panorama square` (Foundation generates those three classes); a map with only `default` writes the property empty; RTL emits the same.
- M9, a runtime ratio without the box (`ratio.mjs`): an `iframe` with `width: 100%; height: auto; aspect-ratio: 21 / 9` in a 600 px container is 600 by 257.14 (Firefox 257.15). Three engines.
- Sources read: Foundation's responsive-embed and flex-video partials, settings, docs page, kitchen sink, and the docs site's example styles; the Foundation history of the rename (in 6.3.0) and of the `flex-video` mixins' removal (in 6.5.0); Angular 22.2's property and element instructions, `setupStaticAttributes`, the DOM security schema, Angular's attribute validation instruction, and NG0910; Angular Components 22.2's `youtube-player` template, placeholder, and styles; the Card, Callout, Badge, Close Button, Button, Reveal, Interchange, Breakpoint service, and Variant declaration tooling specs; building-blocks, CONTEXT, ADR 0001, 0012, 0022, 0039, 0040; the triage, catalogue, and exclusions research.

### Grilling record

Round 1 (nothing settled yet).

- Q1, directive or component. For a component with a `src` input (the Google product wrappers' shape): it could name the frame and handle loading. Against: ADR 0001 allows a component only for structure Foundation generates, and Foundation's box is one wrapper the consumer writes; a URL input moves the consumer's trust decision (`bypassSecurityTrustResourceUrl`) into the library. Settled: one attribute directive on the wrapper (decision 1).
- Q2, which classes. Read from the Sass: one Structural class, one Open Variant family over `$responsive-embed-ratios` (the `default` key gives no class), the `.flex-video` alias, no State class. Settled: static host class and `ratio` (decisions 1, 2).
- Q3, the ratio's type. By ADR 0040 and building-blocks 1.4: an Open Variant family named `ratio`, the registry `NfsResponsiveEmbedRatiosOverrides` already in the tooling table, `'default'` a library literal as the Callout's `size` has it. For a boolean `widescreen`: the docs' own map removes it. Settled (decision 2).
- Q4, `.flex-video`. For binding it: migrated markup uses it. Against: upstream renamed the component in 6.3.0 and removed the `flex-video` mixins in 6.5.0; only the selector survives, undocumented; ADR 0039 leaves no Foundation class in consumer code. Settled: no directive, and a copied one is reported (decisions 6, 10).

Round 2 (Q1 to Q4 settled).

- Q5, the frame's name. For no check (the Card's `alt` precedent): axe reports `frame-title`. Against: the triage named the check; ADR 0039 makes the directive own the check its documented markup lacks, and every docs iframe fails (M1); axe has no rule for `embed`; the box exists only to hold this element. Settled: a development check on `iframe`, `object`, and `embed` children; `video` is not checked (decision 4).
- Q6, the clip and focus (the orchestrator's question). Measured (M3): frames are unaffected; a focused video loses its whole ring in Firefox and WebKit. Options: leave it (fails 2.4.7 on Foundation's defaults, ADR 0022), a negative `outline-offset` (fails in WebKit, restyles the consumer's focus), the library's own outline on the box (a second focus style, drawn on mouse focus too), `overflow: visible` always (changes Foundation at rest), `overflow: visible` on `:focus-within`. Measured (M3c): the last shifts layout beside a float unless the box keeps its block formatting context. Settled: `display: flow-root` plus `:focus-within { overflow: visible; }` (decision 7).
- Q7, the clip and text. Measured (M5): only an `object`'s fallback is text the box holds; long fallback is cut off under the spacing. For a library rule: releasing the clip lays the text over the next content; growing the box re-implements Foundation's sizing. Settled: a content requirement, one short sentence with a link, shown and asserted (decision 8).
- Q8, content beside the embedded element. Measured (M4): covered and still focusable. Settled: a development placement check; captions in a `figcaption` outside the box; boxes with no embedded element at their first render are not checked, so `@defer` placeholders and `youtube-player` stay silent (decisions 5, 9).

Round 3 (Q5 to Q8 settled).

- Q9, rendering modes. The box itself is host bindings. Measured (M6, M7): Angular writes `src` again at hydration, static or bound, so every server-rendered frame and video loads twice and a started video resets. For a library fix: none is possible from a directive (static attributes are applied before directives exist; `ngSkipHydration` re-creates the component). Settled: documented with two recipes, `@defer (hydrate never)` and `@defer (on viewport)` with a placeholder, and a fixture-app request count; proposed as a cross-cutting fact for building-blocks 1.11 (decision 11).
- Q10, the Runtime check. The mixin now holds the focus rule every box needs, so `include()` runs on every run (the Close Button's precedent); a consumer whose map keeps only `default` opts `strictVariantProperties` out (the Callout's). Settled (decision 3).
- Q11, ratios Foundation lacks. A ratio known only at runtime: Foundation's ratios are compiled keys; measured (M9), the consumer's own `aspect-ratio` on its element does it without the box. Responsive ratios: no Foundation class. Settled: both out of scope (decision 12).
- Q12, stories, seams, and vocabulary. Settled: five stories on Foundation's default ratios; e2e for the focus pixels, the layout on focus, 1.4.10, 1.4.12, and the fixture app's first paint, hydration, and request counts; two glossary terms (decisions 13, 14).

The frontier is empty.

### Decisions

1. One attribute directive, `NfsResponsiveEmbed` (`[nfsResponsiveEmbed]`), binding `.responsive-embed` as a static host class on any element, in the entry point `ngx-foundation-sites/responsive-embed`, with `exportAs: 'nfsResponsiveEmbed'`; no role, listener, model, output, method, Defaults token, provider, or query; the embedded element carries no library directive.
2. `ratio` Variant input of type `NfsResponsiveEmbedRatio` = `NfsOverridableStringUnion<'widescreen', NfsResponsiveEmbedRatiosOverrides> | 'default'`, declared with explicit type arguments; no value and `'default'` set no class; one `computed` `[class]` list binds the value when it is one class token. Manifest: `mixins: ['nfs-responsive-embed']`, one `uses` entry with shape `name`.
3. Runtime check: `include('nfs-responsive-embed', ['responsive-embed-ratios'])` on every run and `value('ratio', ...)` for a bound value, in the directive's own `afterRenderEffect` read callback, created only when the handle is not `null`.
4. Development check 1: an `iframe`, `object`, or `embed` child without an accessible name (`aria-labelledby` to text, `aria-label`, or `title`, non-empty) warns once; `video` is not checked.
5. Development check 2: when the host has an embedded element child, any other element child (a second embedded element included) warns once; a host with no embedded child at its first render is not checked.
6. Development check 3: copied `widescreen` and `flex-video` warn once, naming the input or the alias; copied classes are not stripped; a redundant `responsive-embed` and the consumer's own classes are silent. All three checks run in one `afterNextRender` read callback that exists only when `ngDevMode` is on.
7. `nfs-responsive-embed` emits `.responsive-embed { display: flow-root; }` and `.responsive-embed:focus-within { overflow: visible; }` (2.4.7), and writes `--nfs-responsive-embed-ratios` (the keys other than `default`, joined with spaces, empty when none). No compile-time checks and no required Foundation setting.
8. An `object`'s fallback is one short sentence with a link to the resource: required, shown in the recipes, asserted by `responsive-embed--object` and e2e.
9. Captions and transcript links go outside the box, in a `figure`'s `figcaption`; a video with speech has captions; no recipe autoplays.
10. `.flex-video` gets no directive or input (`deprecated-upstream`).
11. Rendering modes: the box's classes render on the server; a server-rendered embedded element loads again at hydration (measured), and the recipes are `@defer (hydrate never)` for an embed that never changes and `@defer (on viewport)` with a placeholder inside the box for one that changes or sits below the fold; the fixture app counts requests. The embedded element's security rules are documented: resource URLs need a `SafeResourceUrl` (NG0904), and `sandbox`, `allow`, `allowfullscreen`, `referrerpolicy`, `csp`, `fetchpriority`, and `credentialless` are static-only on an `iframe` (NG0910).
12. Out of scope, each with its category in the spec: an arbitrary runtime ratio, responsive ratios, a URL-driven component or provider embeds, image sizing, `google-map` sizing, `<iframe loading="lazy">`, checks for captions, autoplay, and fallback length, a library fix for the second load, a margin input, runtime theming.
13. Story ids `responsive-embed--default`, `responsive-embed--widescreen`, `responsive-embed--video`, `responsive-embed--object`, `responsive-embed--deferred`; frames use static `srcdoc` documents; e2e for the video's focus pixels and its layout on focus beside a float, 1.4.10 and 1.4.12 at 320 px, and the fixture app's JavaScript-disabled paint, hydration, and request counts.
14. Two glossary terms, **Responsive Embed** and **Embedded element** (below).

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| The directive, its name, entry point, and `ratio` input (decisions 1, 2, 3) | HIGH (public names and a Variant type) | HIGH (mechanical under ADR 0001, ADR 0039, ADR 0040, and building-blocks 1.3 and 1.4; the registry and property names were already published by the Variant declaration tooling spec) | Decided |
| The focus rule (decision 7) | MEDIUM (library CSS on every box; reversible, no API) | HIGH (the failure and the fix measured in three engines, M3; the layout side effect found and removed, M3c) | Decided |
| The development checks (decisions 4, 5, 6) | LOW (development builds only) | HIGH (M1, M4; the Callout's copied-class rule) | Decided |
| The hydration finding and recipes (decision 11) | MEDIUM (documentation and recipes; every spec that server-renders a frame or video inherits the fact) | HIGH (measured in three engines with a clean hydration, M6 and M7, and read in Angular's source); the `hydrate on ...` triggers are read in the source, not measured | Decided |
| Content requirements, out-of-scope items, stories, vocabulary (decisions 8, 9, 10, 12, 13, 14) | LOW | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here.

Dissent recorded: no name check, as the Card has no `alt` check, against decision 4; `overflow: visible` always as the simpler rule, against decision 7; a library rule that lets fallback text grow the box, against decision 8.

Placeholders: none. No published spec names this family's directives under a placeholder; `specs/` mentions the Responsive Embed only in the Card spec's Notes (as a container to check) and in the Variant declaration tooling spec's registry table, whose `NfsResponsiveEmbedRatiosOverrides` and `--nfs-responsive-embed-ratios` this spec uses as published. The Reveal spec's full-size video example writes a bare `iframe` inside `@if (video.isOpen())`, which is client-only Lazy content, so it neither needs a box nor loads twice.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Responsive Embed row: fill the empty cells.

   "| Responsive Embed | `docs/pages/responsive-embed.md` | [Spec: Responsive Embed](issues/96-spec-responsive-embed.md) | `[nfsResponsiveEmbed]` (`NfsResponsiveEmbed`: binds `.responsive-embed`; `ratio` Variant input over `NfsResponsiveEmbedRatiosOverrides`, plus `'default'`; `exportAs: 'nfsResponsiveEmbed'`) around the consumer's `iframe`, `object`, `embed`, or `video`, which carries no directive; `.flex-video` is not bound | Directive: `.responsive-embed` is a Structural class on a consumer-written wrapper, and Foundation generates nothing | Native platform (the wrapper, Foundation's CSS, native embedded elements and media controls); Aria has no pattern for embedded content and CDK adds nothing | A static host class and one `computed` class list; development name, placement, and copied-class checks in one `afterNextRender`; the `strictVariantNames` and `strictVariantProperties` Runtime checks; `nfs-responsive-embed` (`display: flow-root` and `overflow: visible` on `:focus-within`, so a focused video's ring is not cut off, 2.4.7; `--nfs-responsive-embed-ratios`) | None; the embedded element's own semantics, a `figure` with a `figcaption` for a captioned video |"

2. `building-blocks.md` 1.10, a new bullet after the Card bullet:

   "- Responsive Embed ([Spec: Responsive Embed](issues/96-spec-responsive-embed.md)): the embedded element fills `.responsive-embed`, so the box's `overflow: hidden` cuts off the whole focus outline drawn around it: a focused `<video controls>` shows no indicator in Firefox and WebKit and a 1 px line in Chromium (measured by screenshot comparison in three engines), while frames keep their content's own indicator. `nfs-responsive-embed` sets `display: flow-root` on `.responsive-embed` and `overflow: visible` on `.responsive-embed:focus-within`, so the browser's own ring shows (2.4.7) and, because `flow-root` keeps the block formatting context `overflow: hidden` gave the box, nothing moves beside a float (measured: without it the box grew from 400 to 600 px wide on focus). The only text the box holds is an `<object>`'s fallback, which must be one short sentence with a link (two paragraphs lose 40 px at 320 px under the 1.4.12 spacing); anything else written in the box lies under the embedded element and stays focusable (2.4.11), which the directive reports in development."

3. `building-blocks.md` 1.10, the first bullet: replace "(1.4.3 text contrast, 1.4.11 non-text contrast, 2.5.8 target size, 2.4.11 focus not obscured, 1.4.12 text spacing, and 1.4.10 reflow are the ones found so far)" with "(1.4.3 text contrast, 1.4.11 non-text contrast, 2.5.8 target size, 2.4.11 focus not obscured, 1.4.12 text spacing, 1.4.10 reflow, and 2.4.7 focus visible are the ones found so far)".

4. `building-blocks.md` 1.10, the "axe cannot enforce" bullet: replace "and does not see text that an ancestor's `overflow: hidden` cuts off ([Spec: Card](issues/90-spec-card.md));" with "and does not see text or a focus outline that an ancestor's `overflow: hidden` cuts off ([Spec: Card](issues/90-spec-card.md), [Spec: Responsive Embed](issues/96-spec-responsive-embed.md));".

5. `building-blocks.md` 1.11, Facts that shape the design, a new bullet after the one on how hydration matches nodes:

   "- Hydration writes a located element's attributes again: Angular's element instruction applies its static attributes to the server-rendered node before directives are created, and its property bindings write on the first client pass, with no hydration skip (read in 22.2). Writing `src` again, even the same value, reloads a frame and resets a media element, so every server-rendered `iframe` and `video`, static or bound, is requested once from the server HTML and again at hydration, and a video the user started before hydration returns to its start (measured with Angular 22.2 in three engines by [Spec: Responsive Embed](issues/96-spec-responsive-embed.md), with a clean hydration). An embed that never changes goes inside `@defer (hydrate never)` (requested once); one that changes, or sits below the fold, is created on the client with `@defer (on viewport)` and a placeholder (requested once, on the client). Every spec whose markup server-renders a frame or a media element documents this."

6. `CONTEXT.md`, Foundation side, after **Card divider** (or after **Badge** if the Card terms are not yet applied):

   ```markdown
   **Responsive Embed**:
   Foundation's CSS-only box, marked by the `.responsive-embed` Structural class, that keeps an Embedded element at a ratio from `$responsive-embed-ratios` (4:3 by default, `widescreen` 16:9) as the page narrows; Foundation's old name for it, Flex Video, survives only as the `.flex-video` alias.
   _Avoid_: flex video, video wrapper, aspect-ratio box, embed container

   **Embedded element**:
   The `iframe`, `object`, `embed`, or `video` a Responsive Embed holds and Foundation's CSS stretches to fill it; the consumer's own element, which carries no library directive.
   _Avoid_: embed (bare), media, player, frame (for all four)
   ```

7. `README.md`, the Plugins table, after the Card row:

   "| Responsive Embed (CSS-only component) | [specs/responsive-embed.md](specs/responsive-embed.md) | Native platform (the consumer's wrapper, Foundation's CSS, native embedded elements); one listener-free directive with a `ratio` Variant input | No inventory: Foundation's responsive-embed docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Responsive Embed, Thumbnail row) | None needed; names, focus outlines under the clip, covered content, fallback text, reflow, and the second load at hydration measured in [Spec: Responsive Embed](issues/96-spec-responsive-embed.md) |"

8. `storybook-conventions.md`, section 5, the `preview.scss` block: after `@include nfs-card; ...`, add `@include nfs-responsive-embed; // Responsive Embed: the clip released while the box holds focus (2.4.7) and --nfs-responsive-embed-ratios; every responsive-embed--* story`.

9. `specs/card.md`, Notes, the last bullet: replace "Other Foundation containers that clip with `overflow: hidden` (the XY Grid's frame, Orbit, Drilldown, the off-canvas wrappers, the Responsive Embed) can cut off text in the same way; their specs decide whether it can happen there." with "Other Foundation containers that clip with `overflow: hidden` (the XY Grid's frame, Orbit, Drilldown, the off-canvas wrappers, the Responsive Embed) can cut off text in the same way; their specs decide whether it can happen there. The [Spec: Responsive Embed](../issues/96-spec-responsive-embed.md) measured its box: it cuts off an `<object>`'s long fallback text and the whole focus outline of a focused video, and its Library mixin releases the clip while the box holds focus."

10. `specs/variant-declaration-tooling.md`, the manifest bullets: after the "Known `uses` under `NfsBreakpointClassesOverrides`" bullet, add "- Known `uses` under `NfsResponsiveEmbedRatiosOverrides` ([Spec: Responsive Embed](../issues/96-spec-responsive-embed.md)): `{entryPoint: 'ngx-foundation-sites/responsive-embed', directive: 'NfsResponsiveEmbed', input: 'ratio', alias: 'NfsResponsiveEmbedRatio', shape: 'name'}`; `mixins: ['nfs-responsive-embed']`."

11. `map.md`, Decisions so far: the gist at the end of this Answer.

No new ADR: the focus rule is reversible CSS with no API, and the hydration fact is recorded in building-blocks 1.11 (proposal 5) with recipes rather than a decision between alternatives the library controls.

### What other specs need from this one

- [Spec: Float Classes](105-spec-float-classes.md) (open): a Responsive Embed beside a float keeps the ratio of its container's width, not its own (measured 400 by 337.5 px beside a 200 px float in a 600 px container), because `padding-bottom` percentages resolve against the containing block; `nfs-responsive-embed`'s `flow-root` keeps it beside the float when its video takes focus.
- [Spec: XY Grid](99-spec-xy-grid.md) and [Spec: Visibility Classes](104-spec-visibility-classes.md) (open): `nfsResponsiveEmbed` binds only `.responsive-embed` and its ratio class, and `display: flow-root` has the specificity of one class, so a Visibility class's `display: none !important` still hides the box; a box inside a cell sizes to the cell.
- Every spec whose markup server-renders an `iframe` or a media element (none among the published specs; the Reveal's video is client-only Lazy content): the second load at hydration (proposal 5).
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): the fixture app gets a Responsive Embed route with counted embed requests; check proposals 1 to 10; the Card's note (proposal 9).
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): every Out of Scope item and rejected alternative in the spec carries a category.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md) (resolved): the registry row stands as published; the `uses` entry is proposal 10.

### Gist for Decisions so far

- [Spec: Responsive Embed](issues/96-spec-responsive-embed.md) -- one listener-free `[nfsResponsiveEmbed]` binding `.responsive-embed`, with `ratio` over `NfsResponsiveEmbedRatiosOverrides` plus `'default'`; `.flex-video` (renamed in 6.3.0, its mixins removed in 6.5.0) is not bound and is reported when copied; development checks report an unnamed `iframe`, `object`, or `embed` (every docs iframe fails axe `frame-title`) and anything written beside the embedded element, which covers it while it stays focusable; measured in three engines, Foundation's `overflow: hidden` hides a focused video's whole ring in Firefox and WebKit, so `nfs-responsive-embed` sets `display: flow-root` and releases the clip on `:focus-within`, and cuts off long `<object>` fallback under the 1.4.12 spacing, so fallback is one sentence with a link; measured with Angular 22.2, every server-rendered frame and video, static or bound, loads again at hydration because Angular writes `src` again, so the recipes use `@defer (hydrate never)` or `@defer (on viewport)` with a placeholder; impact up to HIGH (public names), confidence HIGH; no ADR. Spec: [specs/responsive-embed.md](specs/responsive-embed.md).

### Note, 2026-09-28 (out-of-scope reasons)

- 2026-09-28: the Out of Scope reasons named in [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) are corrected in the spec.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group d, applying the coordinator's decisions in [research/consistency-review-decisions.md](../research/consistency-review-decisions.md) and the forgotten-import checks spec's rules for family checks; `specs/responsive-embed.md` was revised in place. The reviewer's record is [research/consistency-review-group-d.md](../research/consistency-review-group-d.md).

- R59: the missing-property browser-level case sits in a test file of its own.
- R74: check 1 counts an image's non-blank `alt` (or a `role="img"` element's non-blank `aria-label`) in the element `aria-labelledby` references; the check 1 cases gain the silent image-only case.
- CR-C: the Notes line "the Float Classes spec can note it" reads "notes it too"; that spec does.
- Unchanged, confirmed: R26, R31, CR-A, CR-D.
