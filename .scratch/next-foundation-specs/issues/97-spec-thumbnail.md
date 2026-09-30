# 97. Spec: Thumbnail

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Thumbnail to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/thumbnail.md` and its Sass is `scss/components/_thumbnail.scss` in the 6.9.0 clone. Publish `specs/thumbnail.md`.

Known from the triage: Works with `NgOptimizedImage`; the alt text stays the consumer's.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5 (AFK: the agent played both sides of the interview; map Notes, AFK override).

Spec: [specs/thumbnail.md](../specs/thumbnail.md).

### Measurements made for this ticket

Several questions needed facts the bundle did not have, so the ticket measured them in a throwaway workspace (`D:/tmp/nfs-wave-97/`, not committed; no server and no port, because every page and image is served from Playwright routes on a fake origin; no junction; packages read from the existing `D:/tmp/nfs-ct-prototype` install). Foundation 6.9.0 Sass from the local clone, compiled with Dart Sass 1.104.1; Angular 22.2.0 bundled with esbuild in JIT development mode; Playwright 1.63 in Chromium, Firefox, and WebKit; axe-core 4.13.0 with the six WCAG 2.2 AA tags; real PNG images of each size.

- E1, `NgOptimizedImage` beside a directive that binds only `.thumbnail` (`e1-ngopt.mjs`, `ng/main.ts`), three engines, identical results: on the image, a 300 by 200 px declared image renders its picture at 292 by 194.7 px inside a 300 by 202.66 px frame (Foundation's global `border-box` puts the 4 px border inside the `width` attribute; the picture is not distorted); Angular's distortion check subtracts padding but not border, so it reports NG02952 ("the aspect ratio of the rendered image does not match the image's intrinsic aspect ratio") at 120 by 60, 100 by 56, and 80 by 40 px (120 by 64 rendered, 1.88 against 2), and stays quiet at 300 by 200, 200 by 100, 160 by 90, 150 by 100, and 64 by 64 px. On a `span` wrapper and on a link the picture renders at exactly its declared size in a frame 8 px larger, and nothing is reported at any size; the control image without the class is quiet. The warning condition, from Angular's 0.1 tolerance and the 4 px border, is `8r(r - 1) / (W + 8(r - 1)) > 0.1` for ratio r and width W, and it matched every case. `NgOptimizedImage`'s host bindings (fill position and size, placeholder background and filter) touch no property `.thumbnail` sets.
- E2, focus rings (`e2-focus.mjs`): the thumbnail's area screenshotted before and after keyboard focus (Tab in Chromium and Firefox; `focus()` in WebKit, which matched `:focus-visible`), changed pixels counted outside the image's box, with Foundation's shadow shipped and neutralised. Foundation's link form (`a.thumbnail > img`): the ring surrounds the whole frame in all three engines (Chromium 1 px outside plus a 1 px line inside the frame; Firefox and WebKit 2 px outside), and with Foundation's shadow the focus look reaches 4 to 5 px outside. The class on the image inside a plain link: Chromium and WebKit draw the ring 2 px around the image, Firefox around the link's 300 by 17 px line box, a band from 96 px below the picture's top to 84 px above its bottom, and no engine shows Foundation's shadow; the class on a `span` wrapper inside a plain link behaves the same (Firefox: a 308 by 17 px band). The link form flush in a 200 px `overflow: hidden` box: Firefox and WebKit keep only the bottom edge (the thumbnail's bottom margin lies inside the box), Chromium the bottom edge and its inner line on every side. Inside a card section: the whole ring. `button.thumbnail`: the ring around the frame (Chromium 1 px, WebKit 2 px, Firefox 1 px with every other pixel changed, Foundation's normalize `button:-moz-focusring` dotted outline), no shadow.
- E3, axe (`e3-axe.mjs`, Chromium): Foundation's docs example passes (apart from the harness page's own `page-has-heading-one`); a thumbnail image without `alt` reports `image-alt`; a linked thumbnail whose only image has `alt=""` reports `link-name`, and passes with an `aria-label` on the link; the class on an image inside a plain link passes; an `a.thumbnail` without `href` passes; two adjacent linked thumbnails of 12 px images are 20 by 20 px and both fail `target-size`, of 16 px images 24 by 24 px and pass; a `figure` with a thumbnail and a `figcaption` passes.
- E4, other states (`e4-misc.mjs`), three engines: a bare `hidden` leaves a thumbnail `display: inline-block` at full size, and `hidden` with `.is-hidden` gives `display: none`; at a 320 px viewport in a 200 px container every form is 200 px wide with a 192 px picture and the page's `scrollWidth` is 320; an image without `width` and `height` gets a 128 by 88 px frame around its 120 by 80 px picture; hovering a linked thumbnail changes its `color` from `#1779ba` to `#1468a0` (it holds no text, so nothing visible changes), its shadow to Foundation's glow, and keeps `cursor: pointer`. Forced colours (Chromium, Firefox): the frame's border computes to CanvasText on an image and LinkText on a link, shadows to `none`, and the focus outline stays `auto`.
- E5, keys (`e5-tab.mjs`): under Playwright, Tab focuses a link in Chromium and Firefox; in WebKit neither Tab nor Alt+Tab does, so the e2e recipe focuses the link with `focus()`, which matches `:focus-visible` there.
- Sources read: Foundation's thumbnail docs page and Sass partial and settings, its global `img`, `box-sizing`, `[hidden]`, `.is-hidden`, and outline rules, its link base styles, the Media Object page and Sass, and every docs page that writes `.thumbnail`; Angular 22.2's `NgOptimizedImage` source (host bindings, `assertNoImageDistortion`); Angular Material 22.2's `MatCardImage` and `MatCardAvatar`; the Label, Card, Button, Badge, Close Button, Interchange, Toggler, Sticky, and Triggers specs and their tickets.

### Grilling record

Round 1 (nothing settled yet).

- Q1, directive or component. For a component: it could render the image with `ngSrc` and an `alt` input. Against: ADR 0001 allows a component only for structure Foundation generates, and the triage leaves the alt to the consumer. Settled: one attribute directive, a static host class (decision 1).
- Q2, which classes. Read from the Sass: one Structural class, `.thumbnail`; `a.thumbnail` is the same class with element-qualified link rules; no Variant or State class; hover and focus are pseudo-classes. Settled: no inputs (decision 2).
- Q3, hosts. For the triage's `img[nfsThumbnail], a[nfsThumbnail]`: the two forms the Thumbnail page names. Against: Foundation's Media Object page writes `div.thumbnail` around an image, a `picture` wrapper frames an art-directed image, E1 shows a wrapper keeps an optimised image at its declared size, ADR 0039 leaves no Foundation class without a home, and Material's image directives bind a class on any element. Settled: any element, with three documented forms (decision 1).
- Q4, the linked form, against the Label's rule. For moving the thumbnail inside the link as the Label does: one rule for every one-class component on a link. Against: the Label's reason is a text colour that Foundation's `a:hover, a:focus` replaces (1.27:1) and `.label`'s `cursor: default`; `.thumbnail` sets neither and holds no text (E4); Foundation styles only `a.thumbnail` for hover and focus; and E2 shows the class on the image inside a plain link gives Firefox a band ring across the picture, which axe passes (E3). Settled: a Linked thumbnail is the link (decision 3).

Round 2 (Q1 to Q4 settled).

- Q5, the Card's clipping finding. Measured (E2): a clipping ancestor cuts the ring off where the thumbnail touches its edge, keeping the bottom edge. For an `outline-offset` rule drawing the ring over the frame: the host is the library's own. Against: 2.4.7 holds with one edge, Foundation leaves the outline to the browser, a zero `$thumbnail-border` leaves nothing to draw on, and the Card's D6 documents the same case. Settled: recipes keep a Linked thumbnail off a clipping edge, documented, not checked (decision 7).
- Q6, development checks. For none (the Card's D10): axe reports a missing `alt` and a nameless link. Against: the Card's image carries no library directive and a thumbnail's does; Foundation's own pages write alt-less thumbnails; axe does not see a missing `href` or Firefox's band ring (E3); the Close Button, Menu icon, and Button precedents. Settled: three checks, once at the first render (decision 4).
- Q7, `NgOptimizedImage`. Measured (E1): the image form renders 8 px smaller than declared and gets a false NG02952 for small wide images; the wrapper and link forms do not. Options: a library `content-box` rule (overflow under `max-width: 100%` unless it parses the border shorthand, and a change to Foundation's rendering), wrapper-only recipes (Foundation's first form renders correctly and three specs write it), a library check predicting Angular's warning (duplicates it), documentation. Settled: the image form stays the default; the docs explain the frame and give the wrapper or link for exact sizes and small wide images (decision 5).
- Q8, a thumbnail that opens something. For `button[nfsThumbnail]` with a `type` input and a library shadow: lightboxes are common, and a Trigger must be a button. Against: Foundation shows no button thumbnail; the any-element selector already binds the class; E2 shows the browser's ring around a button thumbnail; the Triggers warn on a typeless Trigger button in a form. Settled: documented composition, no `type` input and no Sass; additive later (decision 8).

Round 3 (Q5 to Q8 settled).

- Q9, hiding. Measured (E4): a bare `hidden` does not hide a thumbnail; `.is-hidden` does. Options: a `hidden` input, a library `[hidden]` rule, documentation. Every Foundation class that sets `display` has the same gap, and the Toggler already binds `.is-hidden` (building-blocks 1.10). Settled: `@if` or a Toggler, documented (decision 9).
- Q10, WCAG 2.2 AA. Settled from E1 to E4: 1.1.1, 2.4.4, 4.1.2, 2.1.1, 2.4.7 by the checks and the link form; 1.4.11 needs nothing (the ring is the browser's; the frame marks no state); 2.5.8 by an image of 16 px or more with the default border; 1.4.10 passes by Foundation's `max-width`; 1.3.1 by a `figure`; no text contrast pair; no Library mixin and no required setting (decisions 6, 10).
- Q11, rendering modes, stories, seams, and vocabulary. Settled: a static host class renders on the server; no listener, so a Linked thumbnail navigates natively in dehydrated blocks; four stories; e2e for the ring and reflow in three engines and the fixture app; a browser-level test pins Angular's NG02952 behaviour; two glossary terms (decisions 10 to 12).

The frontier is empty.

### Decisions

1. One attribute directive, `NfsThumbnail` (`[nfsThumbnail]`), on any element, binding `.thumbnail` as a static host class; entry point `ngx-foundation-sites/thumbnail`; no `exportAs`. The docs name three forms: on the image, on the link around it (the Linked thumbnail), on a wrapper around it (`span`, `div` as Foundation's Media Object writes it, or `picture`).
2. No inputs, Variant inputs, State classes, Runtime check, models, outputs, methods, Defaults token, or providers; the `$thumbnail-*` settings stay Sass.
3. A Linked thumbnail is `a[nfsThumbnail]` with a real `href` around a plain image; the Label's inside-the-link rule does not apply, because `.thumbnail` sets no colour or cursor and holds no text, and Foundation styles only the link form for hover and focus (E2, E4).
4. Development checks, once at the first render in one `afterNextRender` that exists only under `ngDevMode`: an image (the host or inside it) with no text alternative (1.1.1); an `a` host without `href` (2.1.1) or with a blank name (2.4.4, 4.1.2); a thumbnail on an image or wrapper inside a plain link, or inside a Linked thumbnail (2.4.7). No copied-class check and no Runtime check.
5. `NgOptimizedImage` on the image form is supported and is the default recipe; the docs explain that the frame sits inside the declared `width` and `height` (the picture renders 8 px smaller) and that Angular's NG02952 for a small, wide image comes from the frame, and give the wrapper or link form, which keeps the picture at its declared size and silences the check (E1). Every recipe image uses `NgOptimizedImage`, except the `<img>` of an art-directed `<picture>` (the Interchange spec's D18).
6. Captions are a `figure` with a `figcaption` holding the thumbnail.
7. The recipes keep a Linked thumbnail off a clipping ancestor's edges; documented, not checked; no `outline-offset` rule (the Card's D6).
8. A thumbnail that opens something is `<button type="button" nfsThumbnail>` around its image with a Trigger beside it; no `type` input and no library shadow; additive later.
9. A thumbnail is hidden with `@if` or a Toggler, never a bare `hidden` (E4).
10. Native implementation level; listener-free; no Library mixin, no required setting; Foundation's defaults pass WCAG 2.2 AA for every recipe form.
11. Story ids `thumbnail--default`, `thumbnail--gallery`, `thumbnail--sizing`, `thumbnail--captioned`; e2e for the focus ring and reflow in three engines and the fixture app's first paint and hydration; a browser-level test that pins Angular's NG02952 behaviour; no Anti-pattern story.
12. Two glossary terms, **Thumbnail** and **Linked thumbnail** (below).

### Triage

Rule: [map](../map.md), Orchestration rules, "Triage of human-only items".

| Item | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| The directive, its name, the any-element host, and the entry point (decisions 1, 2) | HIGH (public name; the Card, Sticky, and Toggler specs already write it) | HIGH (ADR 0001 and ADR 0039; Foundation's three forms, one on its Media Object page; Material's image directives) | Decided |
| The Linked thumbnail on the link, and check 3 (decisions 3, 4) | MEDIUM (recipes and a development warning) | HIGH (measured in three engines, E2; axe blind to it, E3; E4 for the colour and cursor) | Decided |
| `NgOptimizedImage` guidance (decision 5) | MEDIUM (docs; the image form stays the default) | HIGH (measured with Angular 22.2.0 in three engines, E1, matching its source) | Decided |
| Checks 1 and 2 (decision 4) | LOW (development-only warnings, reversible) | HIGH for the failures they catch (E3); MEDIUM for check 1, which axe also reports, against the Card's D10 | Decided |
| Clipping documented, button thumbnails composed, hiding documented (decisions 7, 8, 9) | LOW | HIGH (E2, E4; the Card's D6) | Decided |
| No library CSS, rendering modes, stories, vocabulary (decisions 6, 10 to 12) | LOW | HIGH | Decided |

Nothing is OPEN FOR HUMAN, and no prototype is needed: the questions that needed measurement were measured here.

Dissent recorded: the triage's `img[nfsThumbnail], a[nfsThumbnail]` selector, against decision 1; the Label's inside-the-link rule applied by analogy, against decision 3; the Card's no-`alt`-check rule, against check 1; an `outline-offset` rule for clipping ancestors, against decision 7; wrapper-only recipes for `NgOptimizedImage`, against decision 5; a `type` input for button thumbnails, against decision 8.

Placeholders flagged: `nfsGridX`, `nfsCell`, and `up` (the XY Grid's, as the Card writes them) appear in `thumbnail--gallery` and the usage examples until the [Spec: XY Grid](99-spec-xy-grid.md) names them.

### Proposed shared-file changes

1. `building-blocks.md`, Table D, the Thumbnail row: fill the empty cells.

   "| Thumbnail | `docs/pages/thumbnail.md` | [Spec: Thumbnail](issues/97-spec-thumbnail.md) | `[nfsThumbnail]` (`NfsThumbnail`: binds `.thumbnail` on any element: the image, the link around it, which is the only form Foundation gives a hover and focus shadow, or a wrapper around it, as Foundation's Media Object writes it); no inputs and no role; written beside `NgOptimizedImage`, `routerLink`, a Trigger on a button host, and a Toggler | Directive: `.thumbnail` is a Structural class on a consumer-written element, and Foundation generates nothing | Native platform (the consumer's image, link, or wrapper, its `alt` and `href`, and Foundation's CSS); Aria has no image or link pattern and CDK adds nothing | A static host class; development text-alternative, link `href` and name, and thumbnail-inside-a-link checks in one `afterNextRender`; no Library mixin | None; an image, a link, or a `figure` with its `figcaption` |"

2. `building-blocks.md` 1.10, a new bullet after the Label bullet:

   "- Thumbnail ([Spec: Thumbnail](issues/97-spec-thumbnail.md)): a linked thumbnail is the link, `a[nfsThumbnail]` around its image, the reverse of the Label's rule: `.thumbnail` sets no colour or cursor and holds no text, so Foundation's `a:hover, a:focus` colour changes nothing visible, and Foundation gives only `a.thumbnail` its hover and focus shadow. Written on an image or wrapper inside a plain link, a thumbnail loses that shadow, and Firefox draws the link's focus ring as a 17 px band across the picture, the inline link's line box, where Chromium and WebKit draw it around the image (measured; axe reports nothing); `NfsThumbnail` warns in development. A clipping ancestor cuts the ring off where a linked thumbnail touches its edge, as the Card found for links in a card; the recipes keep it inside padding."

3. `building-blocks.md` 1.10, the "axe cannot enforce" bullet: replace "and does not see text that an ancestor's `overflow: hidden` cuts off ([Spec: Card](issues/90-spec-card.md));" with "does not see text that an ancestor's `overflow: hidden` cuts off ([Spec: Card](issues/90-spec-card.md)), and does not see a focus ring an engine draws across a picture instead of around it ([Spec: Thumbnail](issues/97-spec-thumbnail.md));".

4. `CONTEXT.md`, Foundation side, after **Label**:

   ```markdown
   **Thumbnail**:
   Foundation's CSS-only framed image, marked by the `.thumbnail` Structural class on the image itself, on the link around it, or on a wrapper element around it; the image and its text alternative are the consumer's.
   _Avoid_: avatar (for the component), image card, framed image, preview

   **Linked thumbnail**:
   A Thumbnail whose class is on the link that holds its image, the only form Foundation gives a hover and focus shadow; the image's text alternative is the link's name.
   _Avoid_: thumbnail link (for a plain link around a thumbnail image), image link (bare), clickable thumbnail
   ```

5. `README.md`, the Plugins table, after the Label row:

   "| Thumbnail (CSS-only component) | [specs/thumbnail.md](specs/thumbnail.md) | Native platform (the consumer's image, link, or wrapper and Foundation's CSS); one listener-free directive with a static host class | No inventory: Foundation's thumbnail docs and Sass, with the [out-of-scope triage](research/out-of-scope-triage.md) (Responsive Embed, Thumbnail row) | None needed; `NgOptimizedImage` sizing and its distortion check, the linked forms' focus rings, clipping, `hidden`, reflow, forced colours, target size, and axe measured in [Spec: Thumbnail](issues/97-spec-thumbnail.md) |"

6. Placeholders in published specs. Every one is `img[nfsThumbnail]` (or `nfsThumbnail`, `NfsThumbnail`), the image form of this spec's final `[nfsThumbnail]` (`NfsThumbnail`, entry point `ngx-foundation-sites/thumbnail`), so no markup changes; only wording that calls the name provisional:
   - `specs/card.md` (Notes and Out of Scope): replace "An image inside a card section that takes Foundation's Thumbnail look is the Thumbnail's own directive, written `img[nfsThumbnail]` until the [Spec: Thumbnail](../issues/97-spec-thumbnail.md) names it; the card adds nothing to it." with "An image inside a card section that takes Foundation's Thumbnail look carries the Thumbnail's own `nfsThumbnail` ([Spec: Thumbnail](../issues/97-spec-thumbnail.md)); a linked one carries it on the link around the image; the card adds nothing to it." The Out of Scope line stands.
   - `specs/sticky.md`, the class mapping row: replace "| `img[nfsThumbnail]` | [Spec: Thumbnail](../issues/97-spec-thumbnail.md), open; the name is the Toggler spec's |" with "| `img[nfsThumbnail]` (`NfsThumbnail`) | [Spec: Thumbnail](../issues/97-spec-thumbnail.md) |"; in D19 replace "the names of the open XY Grid and Thumbnail specs are building-blocks 1.3's and the Magellan and Toggler specs', aligned by the class-rule consistency review" with "`nfsThumbnail` is the [Spec: Thumbnail](../issues/97-spec-thumbnail.md)'s name; the names of the open XY Grid spec are building-blocks 1.3's and the Magellan spec's, aligned by the class-rule consistency review". Its rendered HTML and story markup stand.
   - `specs/toggler.md`: no change; `nfsThumbnail` and `NfsThumbnail` are final, and its multiple-targets example relies on `.thumbnail`'s `display: inline-block` giving way to `.is-hidden`, which E4 confirms.
   - No placeholder use shows a need this API does not meet. Under the project's image rule (the Interchange spec's D18) those examples would write `ngSrc` with `width` and `height`; the frame then sits inside the declared size, which suits them, and a small, wide image among them would take the wrapper form (D5).
   - `research/out-of-scope-triage.md` keeps its `img[nfsThumbnail], a[nfsThumbnail]` sketch: it is that ticket's record, and the spec records the dissent.

7. `map.md`, Decisions so far: the gist at the end of this Answer.

No change to `storybook-conventions.md` (no settings override and no Library mixin include) or to any ADR. No new ADR: the one-class directive and the recipes are reversible and follow ADR 0001 and ADR 0039, so none meets the "hard to reverse" test.

### What other specs need from this one

- [Spec: Media Object](91-spec-media-object.md) (open): Foundation's `div.thumbnail` around a section's image is `<div nfsThumbnail>`, or the directive goes on the image; `NfsThumbnail` warns in development for an image without `alt`, which none of Foundation's media object images has; the Media Object's `img { max-width: none; }` and stacked `width: 100%` reach the image form and the wrapper's image differently (not measured here), so that spec decides which form its recipe writes.
- [Spec: Card](90-spec-card.md), [Re-run: Sticky spec under the class rule](120-rerun-sticky-class-rule.md), and [Re-run: Toggler spec under the class rule](109-rerun-toggler-class-rule.md) (resolved): the name is final (proposal 6).
- [Spec: XY Grid](99-spec-xy-grid.md) (open): `thumbnail--gallery` and the usage examples write `nfsGridX`, `nfsCell`, and `up` as the Card does.
- [Spec: Reveal](18-spec-reveal.md) and [Spec: Triggers (shared utility)](54-spec-triggers.md): a lightbox thumbnail is `<button type="button" nfsThumbnail>` with `nfsOpen` beside it; nothing to change.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): apply proposal 6; check the Card, Sticky, and Toggler thumbnail examples against the project's image rule (`ngSrc` with `width` and `height`); check other specs that put a thumbnail inside a plain link, which check 3 now reports.
- [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): every Out of Scope item and rejected alternative in the spec carries a category; the button thumbnail's `type` input and shadow are candidates if a lightbox recipe needs Foundation's hover look.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): nothing; the Thumbnail has no Variant registry, manifest row, or `uses` entry.

### Gist for Decisions so far

- [Spec: Thumbnail](issues/97-spec-thumbnail.md) -- one listener-free `[nfsThumbnail]` binding `.thumbnail` as a static host class on any element: the image, the link around it, or a wrapper around it as Foundation's Media Object writes it; no inputs, no role, no Library mixin, no required setting; a linked thumbnail is the link, the reverse of the Label's rule, because `.thumbnail` sets no colour or cursor, and measured in three engines: on the image inside a plain link it loses Foundation's shadow and Firefox draws the focus ring as a 17 px band across the picture, which axe passes, so development checks report that, an image without `alt`, and a link without `href` or name; measured with Angular 22.2.0: on the image, `NgOptimizedImage`'s picture renders 8 px smaller than declared and small wide images get a false NG02952, so the docs give the wrapper or link form for exact sizes; clipping ancestors and a bare `hidden` are documented, with a Toggler's `.is-hidden` or `@if` for hiding; impact MEDIUM to HIGH, confidence HIGH; no ADR. Spec: [specs/thumbnail.md](specs/thumbnail.md).

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2, group e, applying [its decisions](../research/consistency-review-decisions.md) and the review's checks CR-A to CR-D; `specs/thumbnail.md` was revised in place, and [the group's report](../research/consistency-review-group-e.md) lists every edit.

- R16: the hiding rule names its third means, `nfsVisibility` with a bare `hideFor` (the Solution and D9), and Notes gains the shared sentence on the `hidden` attribute, which points at the Toggler's `.is-hidden`, the Visibility Classes, and the four specs that state the same rule.
- A7 and CR-C: the Notes sentence on other specs' `img[nfsThumbnail]` states the fact; two more sentences that called `nfsGridX`, `nfsCell`, and `up` the Card's names "until the XY Grid spec names them" now name the [Spec: XY Grid](99-spec-xy-grid.md)'s directives.
- Unchanged (confirmed): R10, R11, R28/R29, R32/R64, R65, R74 (check 2 already counts an image's `alt`); CR-A and CR-D hold.

Triage: impact LOW (wording), confidence HIGH. Nothing is OPEN FOR HUMAN.

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsThumbnail` gains `exportAs: 'nfsThumbnail'` for the first time.

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group e](169-rerun-specs-without-checks-group-e.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/thumbnail.md` was revised in place. The spec describes and accepts a Thumbnail with no checks: each rule a check enforced is now documented usage in its API text and usage rules (three usage rules, numbered as the checks were, stated in the directive's JSDoc).

What left the spec, per check, and where its rule now stands:

- misuse: check 1 (no text alternative) -- usage rule 1: every thumbnail image has an `alt` (WCAG 1.1.1), `alt=""` where the text beside it says the same or the image is decoration; an image hidden from assistive technology on purpose needs none. [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- misuse: check 2 (an `a` host without `href`, or with no name) -- usage rule 2: a Linked thumbnail has a real `href` (2.1.1), an action is a `<button type="button">`, and the image's `alt` names the destination (2.4.4, 4.1.2). [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- misuse: check 3 (a thumbnail inside a plain link) -- usage rule 3: the directive goes on the link, never on the image or a wrapper inside a plain link or inside a Linked thumbnail (2.4.7). [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md)
- The development-only `ElementRef` injection and the render callback that ran the checks: the directive now injects nothing and has no render callback.
- Mentions rewritten: the Solution paragraph; user stories 9 to 13 (documented-usage stories, numbering kept); Hierarchy and DI shape's injection line; the Material comparison's two rows; Implementation level and Fallback; the Focus paragraph; the WCAG rows 1.1.1, 2.4.4 and 4.1.2, 2.1.1, and 2.4.7 (their tests are now the axe rules, the play functions, and the e2e ring case) and the axe-gate paragraph; Rendering modes' before-hydration bullet; the browser-level cases for checks 1 to 3 and the once-at-first-render case; the SSR smoke's no-warning clause; the "no Runtime check, no copied-class check" bullet; three Out of Scope lines that only declined further checks (a clipping-ancestor check, an NG02952 predictor, a 2.5.8 size check); D2 (no Runtime check), D4 (now the three usage rules; its citations of the Card's D10, the Close Button's and the Menu icon's name checks, and the Button's placeholder warning are gone), D5 and D7 (rejected check alternatives dropped), D8 (the Triggers' typeless-button warning replaced by the native fact that a typeless button in a form submits it), D10; Foundation behaviour changed or dropped. The Problem Statement's and the Material comparison's words for `NgOptimizedImage`'s own NG02952 diagnostic, and the browser-level test that pins it (now "a spy on the console"), no longer use the word the checks used.

Kept: no parent and no injection; native ARIA; no input; no Library mixin; the library's own tests (axe in every story, the play functions, the browser-level host-class, composition, and NG02952 cases, the SSR smoke, e2e); Angular's own NG02952, which the docs explain (D5).

Triage: impact LOW (development-only diagnostics leave; the rules stay as documented usage, and the stories still pass the axe gate), confidence HIGH (the ruling of ticket 158). Nothing is OPEN FOR HUMAN.
