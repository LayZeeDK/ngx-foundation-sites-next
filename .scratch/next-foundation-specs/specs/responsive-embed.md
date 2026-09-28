# Spec: Responsive Embed

Ticket: [Spec: Responsive Embed](../issues/96-spec-responsive-embed.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)); the one Variant family, the ratio, is an Open Variant family over `$responsive-embed-ratios`.

## Problem Statement

A developer on Foundation for Sites who embeds a video, a map, a calendar, or a document wraps the `iframe`, `object`, `embed`, or `video` in an element with the `.responsive-embed` class, so that the embed keeps its aspect ratio as the page narrows, and adds a ratio class (`.widescreen` for 16:9; the default is 4:3) from the keys of the `$responsive-embed-ratios` Sass map. Responsive Embed is a CSS-only component: Foundation's box is `position: relative; height: 0; padding-bottom: <ratio>; overflow: hidden`, and every embedded element inside it is absolutely positioned to fill it. The markup contract leaves the hard parts to the author:

- None of the three iframes on Foundation's docs page has a `title`: axe reports `frame-title` (WCAG 4.1.2) on every one, in Chromium, Firefox, and WebKit (measured with axe-core 4.13.0).
- The embedded element fills the box exactly, so the box's `overflow: hidden` cuts off the whole focus outline drawn around it. A keyboard user who tabs to a native `<video controls>` in the box sees no focus indicator at all in Firefox and WebKit, and only a 1 px line of the ring in Chromium (measured by screenshot comparison in three engines), which fails 2.4.7 where the Browser target includes Safari 17.
- Anything else written inside the box sits under the embedded element: a caption with a transcript link written after the frame is covered by it, yet the link stays in the tab order (measured in three engines), so a keyboard user focuses a link nobody can see (2.4.11).
- The only text the box itself can hold is an `<object>`'s fallback content, and the box cuts that off too: at 320 CSS px with the 1.4.12 text spacing, two short paragraphs of fallback lose their last 40 px, the link included, in the 16:9 box in all three engines.
- The box is also why the page reflows: Foundation's docs iframe (`width="560"`) written bare makes a 320 px page 560 px wide; inside the box it is 320 by 180 (measured), so an embed outside a box fails 1.4.10.
- Under server-side rendering, Angular writes the embedded element's `src` again when it hydrates, static or bound, so every server-rendered frame and video loads twice, and a video the user started before hydration returns to its start (measured with Angular 22.2 in three engines). Nothing on Foundation's page anticipates it.
- Foundation still styles `.flex-video`, the component's name before Foundation 6.3.0, as an undocumented alias whose mixins it removed in 6.5.0, so migrated markup carries a class the docs no longer mention.
- Under the library's class rule the developer writes no Foundation class at all, so `.responsive-embed` and its ratio classes need an Angular home, and a ratio name the consumer adds to the Sass map must reach a typed input.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the box sized before hydration and inside dehydrated `@defer` blocks.

## Solution

One attribute directive, `nfsResponsiveEmbed`, on the element the developer already writes around the embedded element. It binds `.responsive-embed` as a static host class and sets the ratio class from a typed `ratio` Variant input over `$responsive-embed-ratios` (`ratio="widescreen"`), whose names the consumer's Variant declaration file extends with the keys its Sass adds. It adds no role, no listener, and nothing to the server HTML but the classes. In development builds it reports, once per box, an `iframe`, `object`, or `embed` with no accessible name, content written beside the embedded element, and Foundation classes copied onto the box (`widescreen`, `flex-video`).

The `nfs-responsive-embed` Library mixin writes the Variant property and releases Foundation's clip while the box holds focus (`.responsive-embed:focus-within { overflow: visible; }`), with `display: flow-root` so that the box keeps the block formatting context `overflow: hidden` gave it; the browser's own focus ring then shows around a focused video in three engines, and nothing changes at rest or beside a float.

The spec's recipes carry the rest: every frame, object, and embed is named after its content; captions and transcript links go outside the box, in a `figure`'s `figcaption`; an `<object>`'s fallback is one short sentence with a link; a video has captions; and a server-rendered embed goes inside `@defer (hydrate never)` when it never changes, or is created on the client with `@defer (on viewport)` and a placeholder, so it loads once.

## User Stories

1. As an application developer, I want to put `nfsResponsiveEmbed` on the element around an `iframe`, `object`, `embed`, or `video` and get Foundation's responsive box, so that I write no Foundation class.
2. As an application developer, I want a `ratio` input that takes `'widescreen'` and every other key of my `$responsive-embed-ratios`, so that I choose a ratio without writing its class.
3. As an application developer, I want a misspelt ratio or a ratio my Sass removed to fail to compile, so that a typo never ships a box of the wrong shape.
4. As an application developer who adds `panorama: 256 by 81` to `$responsive-embed-ratios`, as Foundation's docs show, I want `ratio="panorama"` to compile once my Variant declaration file is regenerated, so that my Sass stays the source of the names.
5. As an application developer who makes 16:9 the `default` key and removes `widescreen`, I want `widescreen` to stop compiling, so that my templates follow my Sass.
6. As an application developer, I want no `ratio` to mean my Sass `default` key and `ratio="default"` to mean the same, so that the box looks as my settings say without an input.
7. As an application developer, I want a development warning when an `iframe`, `object`, or `embed` in the box has no accessible name, so that I find Foundation's untitled frames before a screen reader user does.
8. As an application developer, I want a development warning when I write a caption, a link, or a second embed inside the box, so that I learn that the embedded element covers it.
9. As an application developer migrating Foundation markup, I want a copied `class="responsive-embed widescreen"` or `class="flex-video"` to be reported in development, so that I learn to bind `ratio` and drop the alias.
10. As an application developer, I want a development report when my stylesheet lacks `@include nfs-responsive-embed;`, so that the focus rule and the Variant property never go missing silently.
11. As an application developer, I want a bound ratio my compiled CSS has no class for to be reported in development, so that a stale Variant declaration file shows up.
12. As an application developer, I want my own component to host `NfsResponsiveEmbed` through `hostDirectives` and expose `ratio`, so that a video component of mine is a Responsive Embed without naming a Foundation class.
13. As an application developer of a server-rendered application, I want to know that a server-rendered frame or video loads again at hydration, and the recipe that loads it once, so that users neither download a video twice nor lose playback they started.
14. As an application developer, I want a lazy-loading recipe built on `@defer (on viewport)` with a placeholder that holds the box, so that a frame below the fold costs nothing until it is needed and the page does not shift.
15. As an application developer, I want to know which `iframe` attributes Angular accepts only as static attributes (`allow`, `allowfullscreen`, `sandbox`, `referrerpolicy`) and what a bound `src` needs, so that my embed compiles and does not throw.
16. As an application developer who knows a video's ratio only at runtime, I want the spec to say what to write instead of a ratio input, so that I am not tempted to write inline padding on Foundation's box.
17. As an application developer using Angular's `youtube-player`, I want to know how it sits inside the box, so that I can use the Google product wrapper with Foundation's layout.
18. As a keyboard user, I want to see the focus indicator of a video, an embedded frame's controls, or an object I tab to, so that I know where I am.
19. As a keyboard user, I want nothing focusable hidden under an embed, so that focus never lands on something I cannot see.
20. As a screen reader user, I want every embedded frame, object, and embed to have a name that says what it holds, so that I can decide whether to enter it.
21. As a screen reader user, I want a video's caption and transcript link to be the video figure's caption, so that I hear them with the video.
22. As a deaf or hard-of-hearing user, I want every video with speech to have captions, so that I get its content.
23. As a user at a 320 CSS px viewport or 400 percent zoom, I want an embed to shrink to the page's width, so that nothing scrolls sideways.
24. As a user who enlarges text spacing, I want an object's fallback text and link to stay readable inside the box, so that I can still reach the document.
25. As a user whose browser cannot show an object's content, I want a fallback link to the resource, so that I can open it another way.
26. As a user who started a video before the page finished loading, I want it to keep playing when the page becomes interactive, so that my action is not undone.
27. As a developer using `@defer (hydrate never)`, I want a box there to stay sized and its embed to load once, so that static embeds cost no JavaScript and no second download.
28. As a developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
29. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it.
30. As a library maintainer, I want every behaviour asserted through classes, names, geometry, focus pixels, request counts, and computed style in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Responsive Embed has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's responsive-embed Sass partial (with the flex-video partial that only imports it), its settings, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Responsive Embed | `.responsive-embed` | `@mixin foundation-responsive-embed`, through `responsive-embed($ratio: default)` | Structural class on a wrapper. `position: relative; height: 0; margin-bottom: $responsive-embed-margin-bottom` (1rem); `padding-bottom` from the `default` ratio through `ratio-to-percentage()` (4 by 3 is 75%); `overflow: hidden`. Every `iframe`, `object`, `embed`, and `video` inside it, at any depth, is `position: absolute; top: 0; left: 0` (`$global-left`, so `right` under RTL) with `width: 100%; height: 100%` |
| Ratios | `.widescreen` by default; every key of `$responsive-embed-ratios` except `default` | `$responsive-embed-ratios: (default: 4 by 3, widescreen: 16 by 9)` | Open Variant family. Each class replaces `padding-bottom`. "Only the `default` key is required"; the docs show `default: 16 by 9` with `vertical`, `panorama`, and `square` added and `widescreen` removed |
| Custom ratio on the consumer's own selector | none of Foundation's | `@include responsive-embed(256 by 81)` | The docs' third example writes a `panorama` class the docs site defines with this mixin; the library's form is a `panorama` key in the map and `ratio="panorama"` |
| Flex Video alias | `.flex-video` | the same export mixin (`.responsive-embed, .flex-video`) | Undocumented. Flex Video was renamed Responsive Embed in 6.3.0, and its `flex-video` mixins were deprecated then and removed in 6.5.0; only the selector remains. No directive binds it (Out of Scope) |
| Margin | none | `$responsive-embed-margin-bottom` | A Sass setting, never an input |

Docs conventions kept or corrected: the wrapper `div` (kept; the directive works on any element); `frameborder="0"` and `allowfullscreen` (kept as static attributes; `frameborder` is obsolete HTML that browsers still honour, and Angular throws NG0910 on a bound `allowfullscreen`); iframes without `title` (corrected: every recipe names its frame after its content, 4.1.2); YouTube URLs (replaced in the recipes by `https://player.example/...`, as the Reveal spec's examples are).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.responsive-embed` | `NfsResponsiveEmbed` (`[nfsResponsiveEmbed]`), static host class | - | - | `responsive-embed` | - |
| `.widescreen` and every other key of `$responsive-embed-ratios` except `default` | `ratio` Variant input of `NfsResponsiveEmbed` | `NfsResponsiveEmbedRatio` over `$responsive-embed-ratios` and its registry `NfsResponsiveEmbedRatiosOverrides` (Open Variant family), plus the library literal `'default'` | a name | the name itself (`ratio="widescreen"` sets `.widescreen`); `'default'` and no value set none, so the `default` key is the look | `--nfs-responsive-embed-ratios` (`widescreen` by default) |
| `.flex-video` | none | - | - | never bound; a copied one is reported in development | - |

State classes: none. Foundation's Responsive Embed has no State class; the focus rule keys on `:focus-within`, a pseudo-class, not a class. Foundation has no responsive ratio class, so `ratio` takes no Breakpoint query or rules object. No class is left for the consumer to write (ADR 0039). The Variant manifest's `NfsResponsiveEmbedRatiosOverrides` entry gets `mixins: ['nfs-responsive-embed']` and one `uses` entry: `{entryPoint: 'ngx-foundation-sites/responsive-embed', directive: 'NfsResponsiveEmbed', input: 'ratio', alias: 'NfsResponsiveEmbedRatio', shape: 'name'}`.

### Hierarchy and DI shape

```
[nfsResponsiveEmbed]   NfsResponsiveEmbed (standalone directive, no template)
  iframe | object | embed | video   the embedded element: the consumer's own, no directive
```

- One directive, with no parent, no Parent token, no providers, no host directives, and no queries. The embedded element carries no library directive: Foundation gives it no class, and its sizing comes from Foundation's descendant selectors.
- No Defaults token: Responsive Embed has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `ElementRef` and, in development builds only, `HostAttributeToken('class')` (optional), both for the development checks; the Runtime check hook `nfsVariantCheck('nfsResponsiveEmbed')` of `ngx-foundation-sites/media-query`, which every directive with a Variant property uses ([ADR 0040](../adr/0040-variant-input-types.md)). Nothing else.
- Entry point: `ngx-foundation-sites/responsive-embed`, so a consumer's `@defer` can split it. `NfsResponsiveEmbedRatio` is exported beside the directive; `NfsResponsiveEmbedRatiosOverrides` and `NfsOverridableStringUnion` live in the primary entry point `ngx-foundation-sites` and are used here as types only.

### API: `NfsResponsiveEmbed`

Selector `[nfsResponsiveEmbed]`; `exportAs: 'nfsResponsiveEmbed'`; standalone; no template.

```ts
type NfsResponsiveEmbedRatio =
  | NfsOverridableStringUnion<'widescreen', NfsResponsiveEmbedRatiosOverrides>
  | 'default';

class NfsResponsiveEmbed {
  readonly ratio: InputSignal<NfsResponsiveEmbedRatio | undefined>; // default undefined: no class
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `ratio` | `NfsResponsiveEmbedRatio`, declared with explicit type arguments that name the alias; no transform | `undefined`, which sets no class | `.responsive-embed.<ratio>` from `$responsive-embed-ratios` | New. The name `ratio` is building-blocks 1.4's rule for `$responsive-embed-ratios`. `'default'` names the map's `default` key and sets no class; it is a library literal outside the registry, because the key never generates a class, so the Variant property never lists it (the Callout's `size` rule). The JSDoc names the class template `.responsive-embed.<ratio>` and the setting |

- Models, outputs, and methods: none. A Responsive Embed has no state and no behaviour.
- `exportAs: 'nfsResponsiveEmbed'` exposes the input signal to template references, as `nfsCallout` and `nfsBadge` do.

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| static `class` | `responsive-embed` |
| `[class]` | one `computed` list: the `ratio` value when it is one class token and not `'default'`; the static class and the consumer's own classes stay, because Angular combines static classes and the class bindings of every directive on the element |

- Attribute ownership: the directive owns `.responsive-embed` and the ratio class. It never touches `role`, `id`, `tabindex`, `hidden`, `aria-*`, or anything on the embedded element.
- Hosts: any element; Foundation's docs use `div`. A video with a caption is a `figure` holding the box and a `figcaption` (ARIA and keyboard). The embedded element is a child of the box, as in Foundation's docs; Foundation's CSS also sizes deeper descendants, which is how `youtube-player` works inside a box (Further Notes).
- Composition: `nfsResponsiveEmbed` sits beside the XY Grid's cell directive, the Visibility Classes' directives, and Float Classes' directives on one element and binds nothing they bind. A consumer component that is always a Responsive Embed hosts `NfsResponsiveEmbed` through `hostDirectives` and exposes `ratio`, which carries the static host class, so its host metadata names no Foundation class.

Development checks, in one `afterNextRender` read callback that exists only when `ngDevMode` is on (never on the server, never in production), each warning once per instance and naming the directive:

1. Name: every `iframe`, `object`, and `embed` child of the host has an accessible name from `aria-labelledby` (an id of an element with text), `aria-label`, or `title`, none of them empty after trimming. Otherwise: "nfsResponsiveEmbed: the iframe has no accessible name. Give it a title that says what it shows, for example title="Video: Foundation for Sites 6 overview"." A `video` is not checked (neither WCAG nor axe requires it a name). axe reports `frame-title` and `object-alt` too, but only where axe runs, and axe has no rule for `embed`, so the check is the only one that sees an unnamed `embed`.
2. Placement: when at least one element child of the host is an `iframe`, `object`, `embed`, or `video`, the host has no other element child. Otherwise: "nfsResponsiveEmbed: the embedded element fills the box and covers the other content in it (a p). Move captions and links outside the box, for example into a figcaption." Two embedded elements report the same way, because the second covers the first. A host with no embedded child at its first render is not checked, because its content is still to come: a `@defer` placeholder, or a component that creates its frame later such as `youtube-player`.
3. Copied classes: a static class list holding `widescreen` warns "class="widescreen" is set by nfsResponsiveEmbed: bind ratio="widescreen" instead"; `flex-video` warns "class="flex-video" is Foundation's old name for the Responsive Embed: remove it; nfsResponsiveEmbed binds .responsive-embed". A copied class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `responsive-embed` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared ratio names are not known without the Variant properties and are left to the Variant check (the Button spec's D22 rule, as the Callout applies it).

Runtime check: in its own `afterRenderEffect` read callback, created only when the handle is not `null`, `NfsResponsiveEmbed` calls `include('nfs-responsive-embed', ['responsive-embed-ratios'])` on every run, whether or not `ratio` is bound, because the mixin holds the focus rule every box needs; then `value('ratio', ratio, needs)` with the need `{setting: 'responsive-embed-ratios', name: ratio}` for a one-token value other than `'default'`, `[]` for no value and `'default'`, and `null` for anything else. `strictVariantNames` compares a bound `ratio` with `--nfs-responsive-embed-ratios` and reports a value that is not one class token; `strictVariantProperties` reports a missing `@include nfs-responsive-embed;` when the property reads empty. A consumer whose map keeps only `default` has an empty property and opts `strictVariantProperties` out, as the Callout's consumer without sizes does. The report shape, the per-realm read, and the configuration are the Runtime checks' ([ADR 0040](../adr/0040-variant-input-types.md)).

### Comparison with Angular Material (22.2)

Material has no responsive embed or aspect-ratio container. The nearest pieces are the Google product wrappers in the same repository.

| Concern | Angular's `youtube-player` and `google-map` | `NfsResponsiveEmbed` |
| --- | --- | --- |
| Selector and kind | `youtube-player` and `google-map`, components that create the provider's player or map | `[nfsResponsiveEmbed]`, a directive on the consumer's wrapper, no template; the embedded element is the consumer's |
| Sizing | `width` and `height` inputs in px (`youtube-player` passes them to the YouTube API; `google-map` sets them on its `div`) | Foundation's ratio box: the embedded element takes the box's width and the ratio's height |
| Ratio | none | `ratio` Variant input over `$responsive-embed-ratios` |
| Name | `youtube-player`'s placeholder button takes `placeholderButtonLabel`; the YouTube API creates the frame | The consumer's `title`, `aria-label`, or `aria-labelledby` on its element, checked in development |
| Loading | `youtube-player` shows a placeholder image and loads the API on click unless `disablePlaceholder` is set | The consumer's `@defer (on viewport)` with a placeholder (Rendering modes) |
| Testing | no harness | DOM-first assertions; no harness |

Borrowed: nothing from the API; `youtube-player`'s click-to-load placeholder is the model for the `@defer` recipe's placeholder. Not borrowed: a component that creates the embedded element from inputs (Foundation generates nothing, ADR 0001; a URL input would move the consumer's security decision into the library), and pixel sizes (the box is the responsive part).

### Implementation level and primitives

Implementation level: native platform. The box is the consumer's element with Foundation's CSS, and the embedded element is a native `iframe`, `object`, `embed`, or `video` with its own semantics and, for a video, the browser's own controls. `@angular/aria` has no pattern for embedded content in 22.2, and `@angular/cdk` has nothing to add. The Angular layer is one static host class, one `computed` class list over one `input()` signal, a development-only render callback, and the Runtime check request. No `effect`, listener, timer, or observer.

Fallback: none needed. The risks this spec owns (the clipped focus outline, covered content, clipped fallback text, and the second load at hydration) were measured by its ticket in three engines, and so was the rule that fixes the first.

### ARIA and keyboard

APG pattern: none. A Responsive Embed is a layout box; the content it holds follows its own semantics (a frame's document, a video's native controls).

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsResponsiveEmbed]` | The host element's own role (`generic` for a `div`); the directive adds no role, name, or state | WHATWG HTML; HTML-AAM |
| `iframe` | A frame whose accessible name is its `title`, `aria-label`, or `aria-labelledby`; its document's content follows | HTML-AAM; WCAG 4.1.2; axe `frame-title`, `frame-title-unique` |
| `object`, `embed` | Embedded content named the same way; an `object` whose resource cannot be shown renders its fallback content instead | HTML-AAM; axe `object-alt` (`object` only) |
| `video` | The browser's media element with its native controls when `controls` is set; its captions come from a `track kind="captions"` | WHATWG HTML; axe `video-caption` |
| A captioned video | A `figure` holding the box and a `figcaption`, so the caption names the figure and sits outside the box | HTML-AAM (`figure`, `figcaption`) |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches the embedded element's focusable content: a frame's first control (Chromium and WebKit), or the frame's document and then its first control (Firefox, measured); a `video`'s controls | Native |
| Space, Enter, arrows on a focused video | The browser's own media controls | Native |

Focus: the directive moves no focus and adds no tab stop. Measured in three engines through Playwright 1.63 by comparing screenshots before and after a Tab, with each browser's own focus indicator:

- A frame (an `iframe`, or an `object` or `embed` of an HTML document) keeps its content's focus indicator: Chromium and WebKit move focus to the frame's first control, whose ring is drawn inside the frame (240 and 248 changed pixels inside the box, none outside, the same with the clip released). Firefox first stops on the frame's document with no indicator anywhere, with or without the clip, and then on the control; that stop is the browser's, outside what a page can style.
- A `<video controls>` takes focus itself (`:focus-visible`), and its ring lies outside its box, which fills the Responsive Embed: under Foundation's `overflow: hidden` Firefox and WebKit change no pixel at all and Chromium only a 1 px inner line of its two-tone ring (1081 pixels inside, none outside). With the `nfs-responsive-embed` rule the ring shows outside the box: 1500 changed pixels in Chromium, 3016 in Firefox, 3012 in WebKit.
- A mouse click focuses the video without `:focus-visible`: the clip is released and no ring is drawn, so nothing visible changes.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. A requirement on content the directive cannot read is stated as a requirement, shown in every recipe, and asserted by every story's play function (ADR 0022, dated note of 2026-09-28). Measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0 and Foundation 6.9.0's compiled CSS. Responsive Embed has no colour of its own, so no contrast check applies.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 4.1.2 Name, Role, Value | Every `iframe`, `object`, and `embed` in a box has an accessible name that says what it holds, unique on the page. The directive's development check 1 reports a missing one; axe's `frame-title`, `frame-title-unique`, and `object-alt` report it where axe runs. The directive changes no role, name, or state | Fails: none of the docs' three iframes has a `title`; axe reports `frame-title` on each, in three engines | axe in every story (every story frame is named); browser-level tests of check 1 |
| 1.1.1 Non-text Content | An `object` has a text alternative (its name, and fallback content for a resource the browser cannot show) | Foundation's docs have no `object` | axe `object-alt` in every story; `responsive-embed--object` |
| 2.4.7 Focus Visible | A focused embedded element shows its whole focus indicator: `nfs-responsive-embed` releases the box's clip while the box holds focus (D6) | Fails for a `<video controls>`: no visible change on keyboard focus in Firefox and WebKit, a 1 px line in Chromium (measured); frames pass | e2e in three engines on `responsive-embed--video`: after Tab, pixels outside the box change and the box's computed `overflow` is `visible`; node-level Sass compile test of the rule |
| 2.4.11 Focus Not Obscured (Minimum) | Nothing focusable sits under the embedded element: the box holds only the embedded element, and captions, transcripts, and their links go outside it (in the recipes, a `figcaption`). Development check 2 reports anything else in the box | Measured: a caption with a link written inside the box after the frame lies under the frame (a hit test at the link returns the `iframe`) and the link stays in the tab order | Browser-level tests of check 2; the play function of `responsive-embed--video` finds the transcript link in the `figcaption`, outside the box |
| 1.4.10 Reflow | At 320 CSS px the embedded element is the page's width and nothing scrolls sideways: the box gives it `width: 100%`, whatever its `width` attribute says | Passes inside the box (320 by 180 for 16:9, 320 by 240 for 4:3); fails outside it: the docs' `width="560"` iframe written bare makes the page 560 px wide | e2e at 320 by 640 in three engines on `responsive-embed--default` and `responsive-embed--widescreen`: `document.documentElement.scrollWidth` is at most 320 and the frame's box equals the Responsive Embed's |
| 1.4.12 Text Spacing | The only text the box holds, an `object`'s fallback content, stays inside the box with the text spacing applied: the fallback is one short sentence with a link to the resource (D8) | Measured at 320 px with the spacing: a one-sentence fallback ends 44 px down, inside both boxes; two short paragraphs end 220 px down, 40 px past the 16:9 box (180 px) in all three engines, taking the link with them | e2e in three engines at 320 by 640 with the text-spacing stylesheet: in `responsive-embed--object`, the fallback's last text rectangle lies inside the box |
| 1.2.2 Captions (Prerecorded), 1.2.4 Captions (Live), 1.2.5 Audio Description (Prerecorded) | A video with speech has captions (a `track kind="captions"` on a native `video`; the provider's captions for a third-party player) and an audio description where its pictures carry information its sound does not. The directive cannot see a provider's captions; the docs require them and the recipes show a captions track | Foundation's docs show no `video` | axe `video-caption` in every story (it reports a `video` without a captions track as incomplete); the play function of `responsive-embed--video` asserts the captions track |
| 1.4.2 Audio Control, 2.2.2 Pause, Stop, Hide | No recipe autoplays. A video that plays by itself for more than five seconds has a way to pause it (its `controls`, or the consumer's own button), and one that plays sound for more than three seconds a way to stop it | Foundation's docs do not autoplay | axe `no-autoplay-audio` in every story |
| 2.1.1 Keyboard | A frame with focusable content stays in the tab order (no `tabindex="-1"` on it); a native video has `controls` or the consumer's own keyboard controls | Passes | axe `frame-focusable-content` in every story; the play function of `responsive-embed--video` reaches the video by Tab |
| 1.3.1 Info and Relationships | A caption belongs to its video through `figure` and `figcaption`, outside the box | Foundation's docs have no captions | The play function of `responsive-embed--video` finds the figure by role and name |
| 2.5.8 Target Size (Minimum) | The box is never a target; a video's native controls are user agent controls, which 2.5.8 exempts | Passes | axe `target-size` in every story |
| 1.4.11 Non-text Contrast | Nothing is required: the box draws nothing; a focus ring is the browser's own | Passes | None in this library |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). It sees untitled frames and unnamed objects but neither a clipped focus ring nor clipped fallback text, which is why 2.4.7 and 1.4.12 are e2e cases. Story frames use static `srcdoc` documents, so nothing loads from the network; axe marks each frame `frame-tested` incomplete (best-practice), which does not fail the gate.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directive declares no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attribute (`nfsresponsiveembed=""`), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Foundation's first example, 4:3, with a title -->
<div nfsResponsiveEmbed>
  <iframe width="420" height="315" src="https://player.example/embed/overview"
          title="Video: Foundation for Sites 6 overview" frameborder="0" allowfullscreen></iframe>
</div>

<div class="responsive-embed">
  <iframe width="420" height="315" src="https://player.example/embed/overview"
          title="Video: Foundation for Sites 6 overview" frameborder="0" allowfullscreen></iframe>
</div>

<!-- 16:9 -->
<div nfsResponsiveEmbed ratio="widescreen">
  <iframe src="https://maps.example/embed?q=Copenhagen" title="Map: our office in Copenhagen"></iframe>
</div>

<div class="responsive-embed widescreen">
  <iframe src="https://maps.example/embed?q=Copenhagen" title="Map: our office in Copenhagen"></iframe>
</div>

<!-- A native video with captions; its caption and transcript link outside the box -->
<figure aria-labelledby="launch-caption">
  <div nfsResponsiveEmbed ratio="widescreen">
    <video controls src="/media/launch.webm">
      <track kind="captions" srclang="en" label="English" src="/media/launch.en.vtt">
    </video>
  </div>
  <figcaption id="launch-caption">Launch event, 2 minutes. <a href="/media/launch-transcript">Read the transcript</a></figcaption>
</figure>

<figure aria-labelledby="launch-caption">
  <div class="responsive-embed widescreen">
    <video controls="" src="/media/launch.webm">
      <track kind="captions" srclang="en" label="English" src="/media/launch.en.vtt">
    </video>
  </div>
  <figcaption id="launch-caption">Launch event, 2 minutes. <a href="/media/launch-transcript">Read the transcript</a></figcaption>
</figure>

<!-- An object with a short fallback -->
<div nfsResponsiveEmbed>
  <object data="/reports/annual.pdf" type="application/pdf" aria-label="Annual report 2026">
    <p>Download the <a href="/reports/annual.pdf">annual report (PDF, 2 MB)</a>.</p>
  </object>
</div>
```

The box's server HTML is the final DOM of the box; what hydration does to the embedded element is in Rendering modes.

### Animation

None. Foundation's responsive-embed partial declares no transition, and the library adds none: the focus rule changes `overflow`, which does not animate. A box that appears or disappears with `@if` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override. A video's own motion (autoplay, looping) is the consumer's content (WCAG table).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.responsive-embed` and the ratio class exactly as the hydrated DOM does, so the box has its final size before any script runs, and the embedded element starts loading from the server HTML.
- Before hydration: the directive touches no DOM outside its host bindings, measures nothing, and starts no timer; its render callbacks run only after hydration. A frame is its own document and a native video's controls are the browser's, so both work before hydration.
- Full and incremental hydration: the box's classes equal the server's, so hydration changes nothing about the box, and the directive has no Hydration boundary of its own. The embedded element is another matter, and not the directive's doing: Angular re-applies a located element's static attributes when it hydrates it (its element instruction calls `setupStaticAttributes` on the server-rendered node too) and writes its property bindings on the first client pass, and writing `src` again, even with the same value, reloads a frame and resets a media element (measured in three engines: a new request and a new frame document; the media element fires `emptied` and returns to 0 s). Measured with Angular 22.2.0 under `provideClientHydration()` in three engines, with the counting server's requests per element: a static-`src` iframe, a bound-`[src]` iframe, a static-`src` video, and a bound-`[src]` video are each requested once from the server HTML and again at hydration, with a clean hydration (no NG05xx, no component skipped). So a video the user started before hydration returns to its start, and the embed downloads twice. The recipes (D10):
  - An embed that never changes: put the embedded element inside `@defer (hydrate never)` within the box. Measured: requested once. The box still hydrates, so the development checks and the Runtime check still run.
  - An embed whose `src` changes, or one below the fold: create it on the client with `@defer (on viewport)`, whose `@placeholder` is one element inside the box, such as a link to the video on its provider's site; the box keeps its size, so nothing shifts when the frame arrives. Measured with `@defer (on idle)`: requested once, on the client only. The server HTML and a JavaScript-disabled first paint show the placeholder, not the frame.
  - `@defer (hydrate on viewport)` or `(hydrate on interaction)` does not help: the block hydrates later, and the same element instruction then writes `src` (read in the source, not measured). Interaction inside a frame belongs to the frame's document, not to the host page's hydrate trigger.
- Event replay: the directive declares no listener and adds no `jsaction`; events inside a frame belong to the frame's document and are never replayed by the host page.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a box is its server HTML; inside `@defer (hydrate never)` it stays sized for good, and its embed loads once.
- Prerendering: identical to SSR; the directive reads no request token.
- Security, which the embedded element's bindings meet before any of this: a bound `[src]` on an `iframe` or `embed`, and a bound `[data]` on an `object`, are resource URLs, which Angular accepts only as a `SafeResourceUrl` from `DomSanitizer.bypassSecurityTrustResourceUrl` (NG0904 otherwise); a bound `sandbox`, `allow`, `allowfullscreen`, `referrerpolicy`, `csp`, `fetchpriority`, or `credentialless` on an `iframe` throws NG0910, clears its `src`, and removes it, so those are written as static attributes; a bound `[src]` on a `video` is an ordinary URL, sanitized and accepted (read in Angular 22.2's DOM security schema). Trusting a URL is the consumer's decision; the recipes use static URLs.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, names, the geometry of the box and of the embedded element, focus pixels, computed style, where text lies against the box, and how often an embedded resource is requested. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Card](../issues/90-spec-card.md)'s and [Spec: Callout](../issues/89-spec-callout.md)'s tests, the nearest precedents.

Story ids follow `responsive-embed--<story>`: `responsive-embed--default`, `responsive-embed--widescreen`, `responsive-embed--video`, `responsive-embed--object`, `responsive-embed--deferred`. `meta.component` is `NfsResponsiveEmbed`; the `ratio` control offers `default` and `widescreen`, Foundation's names, because stories compile Foundation's default ratios (custom names are the Sass compile test's and the browser-level tests'). Frames use static `srcdoc` documents (a heading and a Play button standing in for a player); the video is a short local file with a captions track; the preview includes `nfs-responsive-embed`. No story element carries a Foundation class written in the story.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `frame-title`, `frame-title-unique`, `object-alt`, `frame-focusable-content`, `no-autoplay-audio`, and `target-size`).

- `responsive-embed--default`: Foundation's first docs example with a `title`. The box carries `.responsive-embed` and no ratio class; the frame is found by its title; the frame's box equals the Responsive Embed's box, whose height is three quarters of its width (within 1 px).
- `responsive-embed--widescreen`: `ratio="widescreen"` on a titled frame. The box carries `.widescreen`; its height is nine sixteenths of its width (within 1 px); setting the `ratio` control to `default` removes `.widescreen` and restores 4:3.
- `responsive-embed--video`: the captioned-video recipe in a `figure` named by its `figcaption`. The figure is found by `getByRole('figure', {name})`; the video has a `track` whose `kind` is `captions`; the transcript link is found by role and name and lies outside the box; `userEvent.tab()` from a button before the figure focuses the video, and while it has focus the box's computed `overflow` is `visible` and its `display` `flow-root`; once the play function focuses the button after the figure, the box's `overflow` is `hidden` again (Chromium's and Firefox's next Tab stays inside the video's own controls).
- `responsive-embed--object`: an `object` named "Opening hours" whose resource type the browser cannot show (a type no engine has a viewer for), so its one-sentence fallback shows. The fallback link is found by role and name, and its box lies inside the Responsive Embed's box.
- `responsive-embed--deferred`: the lazy recipe, `@defer (on viewport)` inside the box with a placeholder link. Before the story scrolls the box into view the box holds only the placeholder link; after `scrollIntoView` the frame is found by its title and the placeholder is gone; the box's size is the same before and after (within 1 px).

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directive over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host classes, driven by data: no `ratio`, `'default'`, and `'widescreen'` give `responsive-embed` alone, alone, and `responsive-embed widescreen`; a name outside Foundation's defaults bound through a cast (`'panorama'`) sets `.panorama`; a value that is not one class token (`'a b'`, through a cast) sets nothing; the consumer's own static class and a `[class]` binding on the same element stay; changing `ratio` at runtime swaps the class; the directive adds no attribute.
- Development check 1 (name): an `iframe`, an `object`, and an `embed` with no name each warn once, naming the element; each named by `title`, by `aria-label`, and by `aria-labelledby` pointing at an element with text is silent; `aria-labelledby` pointing at a missing id and `title="  "` warn; a `video` with no name is silent.
- Development check 2 (placement): an `iframe` beside a `p`, and two `iframe`s, each warn once; a box holding only a `@defer` placeholder, or only a test component whose frame is created after the first render, is silent; comment nodes and text between elements do not count.
- Development check 3 (copied classes): a static `class="widescreen"` warns naming `ratio`; `class="flex-video"` warns naming the alias; `class="responsive-embed"` and the consumer's own class are silent; each warning is made once per instance.
- Production: with `ngDevMode` off, no development callback is created and nothing warns.
- Runtime check: with `--nfs-responsive-embed-ratios: widescreen` on the test document, `ratio="widescreen"` and `'default'` are silent; an unlisted `ratio` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$responsive-embed-ratios`; with the property absent, a box with no `ratio` bound reports `strictVariantProperties` once, naming `@include nfs-responsive-embed;`.
- Composition: a test component with `hostDirectives: [{directive: NfsResponsiveEmbed, inputs: ['ratio']}]` renders `.responsive-embed` on its host, and its `ratio` sets the class.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with the default box, a `widescreen` box, the captioned-video recipe, a `@defer (hydrate never)` box, and a `@defer (on viewport)` box. `whenStable()` resolves; the server HTML carries `responsive-embed` and `widescreen`, the consumer's `title` and `src` values, and the placeholder link in the `on viewport` box with no frame; no box carries `jsaction` or a role.
- Sass compile, over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';`:
  - Foundation's defaults plus `@include nfs-responsive-embed;` emit exactly `:root { --nfs-responsive-embed-ratios: widescreen; }`, `.responsive-embed { display: flow-root; }`, and `.responsive-embed:focus-within { overflow: visible; }`, and nothing else.
  - The docs' map `(default: 16 by 9, vertical: 9 by 16, panorama: 256 by 81, square: 1 by 1)` writes `--nfs-responsive-embed-ratios: vertical panorama square`, in the map's order and joined with spaces.
  - A map with only `default` writes the property empty and the same two rules.
  - `$global-text-direction: rtl` emits the same output.
- Pure logic: none.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Focus visible (2.4.7) in three engines: in `responsive-embed--video`, screenshots of the box and a 10 px band around it before and after a Tab onto the video differ outside the box (the browser's own ring), with no outline written by the test; the box's `overflow` is `visible` while the video has focus.
- Layout on focus in three engines: in `responsive-embed--video`, with a 200 px left float inserted before the figure by the test, the box's position and size are the same before and after the video takes focus.
- Reflow (1.4.10) in three engines: at 320 by 640 px, in `responsive-embed--default` and `responsive-embed--widescreen`, `document.documentElement.scrollWidth` is at most 320 and the frame's box equals the Responsive Embed's.
- Text spacing (1.4.12) in three engines: at 320 by 640 px with a stylesheet that sets line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em on every element, the last text rectangle of the fallback in `responsive-embed--object` lies inside the box.

Against the prerendered fixture app, on the Responsive Embed route, with every embed pointed at a route the test fulfils and counts through `page.route`:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; the boxes carry their classes and sizes before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- Loads: the `@defer (hydrate never)` recipe's frame is requested once; the `@defer (on viewport)` recipe's frame is not requested before the box scrolls into view and once after; a plain server-rendered frame is requested twice, asserted as measured, so that an Angular release that stops writing `src` at hydration shows up here and the recipes can be relaxed.

## Out of Scope

- The `.flex-video` alias: no directive or input binds it, and a copied one is reported in development. Foundation renamed Flex Video to Responsive Embed in 6.3.0, deprecated its `flex-video` mixins then, and removed them in 6.5.0; the undocumented selector is all that remains. Category: `deprecated-upstream`.
- A ratio input that takes an arbitrary ratio at runtime (a number, or `16 by 9` as a string) for a video whose size is known only from data, such as an oEmbed response: Foundation's ratios are the keys of `$responsive-embed-ratios`, compiled to classes; a known set of ratios is keys in the map, and a ratio known only at runtime is the consumer's own `aspect-ratio` style on its own element outside a Responsive Embed (measured: an `iframe` with `width: 100%; height: auto; aspect-ratio: 21 / 9` is 600 by 257.14 in a 600 px container in three engines). Category: `scope-boundary`.
- Responsive ratios per breakpoint: Foundation has no responsive ratio class, and a library class would add a family Foundation lacks. Category: `scope-boundary`.
- A component that creates the embedded element from a URL input (`<nfs-responsive-embed [src]>`), a trusted-URL pipe, or provider-specific embeds (YouTube, Vimeo, maps): Foundation generates no structure (ADR 0001), the embedded element is the consumer's, and trusting a resource URL is the consumer's security decision. Category: `scope-boundary`.
- Sizing images: Foundation's box sizes only `iframe`, `object`, `embed`, and `video`, and an image keeps its ratio natively from its `width` and `height` attributes (the [Spec: Card](../issues/90-spec-card.md) measured it); responsive image sources are the [Spec: Interchange](../issues/35-spec-interchange.md)'s. Category: `scope-boundary`.
- Sizing Angular's `google-map`, which renders a `div` that Foundation's rule does not size and has its own `width` and `height` inputs. Category: `scope-boundary`.
- Lazy loading through `<iframe loading="lazy">`: not in the Browser target (building-blocks 1.2); the `@defer (on viewport)` recipe replaces it. Category: `platform-or-a11y`.
- Development checks for captions, autoplay, and fallback length: a provider's captions and a consumer's own pause button are invisible to the directive, and whether fallback text fits depends on the viewport and the user's text spacing; axe's `video-caption` and `no-autoplay-audio` rules and the stories' play functions cover the library's own examples. Category: `platform-or-a11y`.
- A development check or library rule for the second load at hydration: it happens in Angular's hydration of the consumer's element, which the directive neither creates nor binds; the recipes avoid it. Category: `platform-or-a11y`.
- The margin below the box as an input: `$responsive-embed-margin-bottom` is a Sass setting, and Foundation has no class for it. Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `[nfsResponsiveEmbed]` (`NfsResponsiveEmbed`), binding `.responsive-embed` as a static host class on any element; entry point `ngx-foundation-sites/responsive-embed`; `exportAs: 'nfsResponsiveEmbed'` | ADR 0001 and ADR 0039: one directive per Structural class, and Foundation generates nothing; the triage's name ([Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md)); `exportAs` as the other Variant-input directives have it | An `nfs-responsive-embed` component that renders the embedded element from inputs (Foundation's markup carries the element; ADR 0001) (`scope-boundary`); a directive on the embedded element itself (Foundation's box is the wrapper, and its CSS sizes the element from it) (`other`) |
| D2 | `ratio` Variant input typed `NfsResponsiveEmbedRatio`, `NfsOverridableStringUnion<'widescreen', NfsResponsiveEmbedRatiosOverrides>` plus the library literal `'default'`; no value and `'default'` set no class | ADR 0040 and building-blocks 1.4: an Open Variant family over `$responsive-embed-ratios`, named `ratio` by the naming rule; the `default` key is the base look and never generates a class, as the Callout's `size` treats `$callout-sizes` | `(string & {})` for custom names (a typo compiles; ADR 0040) (`superseded`); a boolean `widescreen` input (the map is open, and the docs remove `widescreen`) (`other`) |
| D3 | No State classes, models, outputs, methods, Defaults token, providers, or queries | Foundation's Responsive Embed has no State class and no Options; nothing links the box to anything | A parent token so the embedded element could find its box (nothing on the element needs the box) (`other`) |
| D4 | Development check 1: an `iframe`, `object`, or `embed` child with no accessible name warns once | ADR 0039 and ADR 0022: the directive owns the check its documented markup lacks; every docs iframe fails `frame-title` in three engines; axe runs only where a team runs it and has no rule for `embed`; the triage named the check | No check, as the Card has none for `alt` (the Card's image is any content; the box exists only to hold this element, and Foundation's own examples fail) (`platform-or-a11y`); checking `video` too (no criterion or axe rule asks a video for a name) (`platform-or-a11y`) |
| D5 | Development check 2: when the box holds an embedded element, anything else in it warns; a box with no embedded element at its first render is not checked | Measured: content written after the frame lies under it, and its link stays focusable (2.4.11); skipping boxes whose content comes later keeps `@defer` placeholders and `youtube-player` silent | Checking at every render with a `MutationObserver` (development cost on every box for a mistake made in markup) (`other`); library CSS that stacks other content above the frame (re-styles Foundation's box, and the content would cover the video instead) (`other`) |
| D6 | `nfs-responsive-embed` sets `display: flow-root` on `.responsive-embed` and `overflow: visible` on `.responsive-embed:focus-within` | Measured: a focused `<video controls>` shows no ring in Firefox and WebKit and a 1 px line in Chromium under Foundation's clip; releasing it shows the browser's own ring in three engines. `:focus-within` changes nothing at rest; `flow-root` keeps the block formatting context `overflow: hidden` gave the box, so releasing the clip moves nothing beside a float (measured: without it the box beside a 200 px float grew from 400 to 600 px wide when the video took focus) | `overflow: visible` always (changes Foundation's rendering at rest, for example a consumer's rounded corners) (`other`); a negative `outline-offset` on focused embedded elements (measured: WebKit's `auto` ring ignores it and shows nothing, and it restyles the consumer's focus) (`other`); the library's own outline on the box (a second focus style, drawn on mouse focus too, since `:focus-within` cannot tell; `:has(:focus-visible)` is out of target) (`platform-or-a11y`); leaving it to the consumer (a failure on Foundation's defaults, ADR 0022) (`platform-or-a11y`) |
| D7 | Development check 3: copied `widescreen` and `flex-video` warn; copied classes are not stripped | Building-blocks 1.4 and the Callout's D11: migrated markup meets them first; the alias styles identically but is a Foundation class in consumer code (ADR 0039) | Binding `.flex-video` too, or a `legacy` input (keeps a name Foundation dropped from its docs) (`deprecated-upstream`); stripping copied classes (the `[class]` list sets only its own) (`other`) |
| D8 | An `object`'s fallback is one short sentence with a link to the resource; required by the docs, shown in the recipes, asserted by `responsive-embed--object` and e2e | Measured: a one-sentence fallback fits both boxes at 320 px with the text spacing; two short paragraphs lose 40 px in the 16:9 box in three engines; releasing the clip would lay the text over the next content instead | A library rule that lets fallback content grow the box (re-implements Foundation's sizing for an edge case) (`other`); a development check on fallback length (depends on the viewport and the user's spacing) (`platform-or-a11y`) |
| D9 | Captions and transcript links go outside the box, in a `figure`'s `figcaption`; a video with speech has captions | 1.3.1 and 2.4.11: a caption inside the box is covered; `figure` and `figcaption` tie it to the video; axe's `video-caption` sees a native video's captions track | A caption input on the directive (the caption is the consumer's content, and Foundation has no caption class for the box) (`scope-boundary`) |
| D10 | Server-rendered embeds: `@defer (hydrate never)` for an embed that never changes, `@defer (on viewport)` with a placeholder inside the box for one that changes or sits below the fold; documented, with the fixture app counting requests | Measured with Angular 22.2 in three engines: a server-rendered frame or video, static or bound, is requested again at hydration because Angular writes its attributes again; `hydrate never` and client-only `@defer` load once | `ngSkipHydration` (valid only on component hosts, and the skipped component is rendered again on the client, so the frame is created again) (`platform-or-a11y`); a library directive on the embedded element that keeps its `src` out of hydration (Angular gives a directive no hook before it re-applies static attributes) (`platform-or-a11y`) |
| D11 | Native implementation level; listener-free; every class a host binding in server HTML | The element, Foundation's CSS, and the browser's own controls cover everything; no behaviour is added | A resize or intersection observer to size or lazy-load the embed (Foundation's CSS sizes it; `@defer` loads it) (`other`) |
| D12 | Five stories; e2e for the focus pixels, the layout on focus, 1.4.10, 1.4.12, and the fixture app's first paint, hydration, and request counts | A clipped ring and clipped text need real engines and screenshots, and axe sees neither; request counts need the prerendered fixture app | A play function comparing screenshots (one engine, and Storybook's runner has no screenshot API) (`other`); a story for a custom ratio (stories compile Foundation's default settings; the Sass compile test and the browser-level tests cover custom names) (`other`) |
| D13 | Two glossary terms, **Responsive Embed** and **Embedded element** | Foundation's name for the component, and one word for "the iframe, object, embed, or video" that every rule here refers to | A term for the ratio (a Variant input, not domain language) (`other`) |

### Usage examples

```html
<!-- A static embed that loads once under SSR: the frame never hydrates, the box does -->
<div nfsResponsiveEmbed ratio="widescreen">
  @defer (hydrate never) {
    <iframe src="https://player.example/embed/overview" title="Video: Foundation for Sites 6 overview"
            frameborder="0" allowfullscreen></iframe>
  }
</div>

<!-- A frame below the fold, created on the client when it scrolls into view -->
<div nfsResponsiveEmbed ratio="widescreen">
  @defer (on viewport) {
    <iframe src="https://maps.example/embed?q=Copenhagen" title="Map: our office in Copenhagen"></iframe>
  } @placeholder {
    <a href="https://maps.example/?q=Copenhagen">Open the map of our office in Copenhagen</a>
  }
</div>
```

```ts
// A video component that is a Responsive Embed; its URL comes from trusted configuration.
@Component({
  selector: 'app-video-embed',
  hostDirectives: [{ directive: NfsResponsiveEmbed, inputs: ['ratio'] }],
  template: `<iframe [src]="url()" [title]="title()" frameborder="0" allowfullscreen></iframe>`,
})
export class VideoEmbed {
  readonly #sanitizer = inject(DomSanitizer);
  readonly videoId = input.required<string>();
  readonly title = input.required<string>();
  protected readonly url = computed(() =>
    this.#sanitizer.bypassSecurityTrustResourceUrl(`https://player.example/embed/${encodeURIComponent(this.videoId())}`),
  );
}
```

`<app-video-embed ratio="widescreen" videoId="overview" title="Video: Foundation for Sites 6 overview">` renders `class="responsive-embed widescreen"` from the hosted directive, so its host metadata names no Foundation class; `allowfullscreen` and `frameborder` are static, because Angular throws NG0910 on a bound `allowfullscreen`. Under SSR the component's frame loads again at hydration, so a page that server-renders it wraps it in `@defer (hydrate never)` when its inputs are fixed, or in `@defer (on viewport)` otherwise.

```scss
// The consumer's settings: a 16:9 default and three more ratios, as Foundation's docs show
$responsive-embed-ratios: (
  default: 16 by 9,
  vertical: 9 by 16,
  panorama: 256 by 81,
  square: 1 by 1,
);
```

The regenerated Variant declaration file then declares `widescreen: false`, `vertical: true`, `panorama: true`, and `square: true` in `NfsResponsiveEmbedRatiosOverrides`, so `ratio="panorama"` compiles and `ratio="widescreen"` fails.

### Platform features to adopt when the browser target moves

- `<iframe loading="lazy">` (Firefox 121): a native lazy frame could replace the `@defer (on viewport)` recipe where the frame may be in the server HTML; the second load at hydration would then still need `hydrate never`.
- `:has()`: `.responsive-embed:has(:focus-visible)` would release the clip only for keyboard focus; `:focus-within` releases it on mouse focus too, where no ring is drawn, so nothing visible differs.

### Foundation behaviour changed or dropped

- While the box holds focus, its clip is released, so a focused video shows the browser's whole focus ring (D6); at rest the box renders as Foundation's.
- `.flex-video` gets no directive and is reported when copied (D7).
- Every recipe frame has a `title`, and captions and transcripts sit outside the box (D4, D5, D9).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-responsive-embed`, configured through `$responsive-embed-ratios` and `$responsive-embed-margin-bottom`. Its documented custom CSS is the `nfs-responsive-embed` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-responsive-embed`.

1. Rules. (a) `.responsive-embed { display: flow-root; }` and (b) `.responsive-embed:focus-within { overflow: visible; }`. Reason: WCAG 2.2 success criterion 2.4.7. The embedded element fills Foundation's box, so the box's `overflow: hidden` cuts off the whole focus outline drawn around it (a focused video shows none in Firefox and WebKit), and Foundation has no setting for it; (b) releases the clip only while focus is inside, and (a) keeps the block formatting context that `overflow: hidden` gave the box, so the release changes no layout (D6). (a) has the specificity of Foundation's selector and adds a declaration Foundation does not set; (b) outranks Foundation's `overflow` whatever the order. Neither selects `.flex-video`, which the directive never binds.
2. Reused, read from the consumer's compile: `$responsive-embed-ratios`, for the Variant property. No Foundation value is copied. The mixin takes no parameters.
3. Custom properties the directive writes: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: a focused video's ring is cut off again, silently for users, because axe cannot see it; the Variant property is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include, and the Variant declaration file's generator cannot list the ratios.
6. Variant properties: `--nfs-responsive-embed-ratios`, the keys of `$responsive-embed-ratios` other than `default` (`widescreen` by default), joined with `space`, because Sass interpolates a key list with commas, and written empty (`#{''}`) when no other key remains, because Sass cannot print an empty list; such a consumer opts `strictVariantProperties` out. Only `nfs-responsive-embed` writes it.

No Foundation setting is required: Responsive Embed has no colours, and its sizes are ratios.

### Notes

- RTL: nothing visible flips. Foundation positions the embedded element with `$global-left`, which becomes `right` under `$global-text-direction: rtl`, and the element is 100% wide either way; the library's rules are direction-free.
- Beside a float the box keeps the ratio of its container's width, not its own: `padding-bottom` percentages resolve against the containing block, so the box beside a 200 px float in a 600 px container is 400 by 337.5 px (measured in three engines). This is Foundation's technique; the [Spec: Float Classes](../issues/105-spec-float-classes.md) can note it.
- Angular's `youtube-player` renders the YouTube API's frame inside two unpositioned `div`s (read in its 22.2 source), so Foundation's descendant rule sizes the frame to the box; its placeholder takes `width` and `height` in px and is not one of Foundation's embedded elements, so inside a box it is written with `disablePlaceholder`, and a `@defer` placeholder takes its place when the load should wait.
- Forced colours: the box draws nothing, and focus rings are the browser's, which forced-colours mode draws in its system colour.
- `.responsive-embed` beside the XY Grid's cell directive or inside a cell sizes to the cell's width, because the cell is its containing block.
