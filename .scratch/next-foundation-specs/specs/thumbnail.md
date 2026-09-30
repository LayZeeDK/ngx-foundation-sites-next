# Spec: Thumbnail

Ticket: [Spec: Thumbnail](../issues/97-spec-thumbnail.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)); the Thumbnail has no Variant class, so the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)) add nothing to its API.

## Problem Statement

A developer on Foundation for Sites who wants a framed image, a photo in a gallery, a product shot, an avatar, or an image that links to a larger version, writes Foundation's Thumbnail markup: the `.thumbnail` class on an `<img>`, or on an `<a>` that wraps the image. Foundation's Media Object docs put the same class on a `div` around an image. Thumbnail is a CSS-only component: it ships Sass and one class and no Plugin. The docs say "Make sure the `<img>` has an `alt` attribute that describes the contents of the image", and the markup contract leaves the rest to the author:

- Most of Foundation's own pages that show thumbnails (Tabs, Sticky, Responsive Accordion Tabs, Motion UI) write `<img class="thumbnail">` with no `alt`, which axe reports as `image-alt` (WCAG 2.2 success criterion 1.1.1), and a linked thumbnail whose image has `alt=""` is a link with no name (axe `link-name`, 2.4.4 and 4.1.2).
- Foundation gives a hover and focus shadow only to `a.thumbnail`. A developer who writes the class on the image inside a plain link loses that shadow, and Firefox then draws the link's focus ring as a 17 px band across the middle of the picture, the inline link's line box, where Chromium and WebKit draw it around the image (measured). axe reports nothing for it.
- An ancestor that clips (`overflow: hidden`, a scroll container) cuts the focus ring and the shadow off on every side where a linked thumbnail touches its edge, as it does for any link written flush in a card (measured in three engines).
- The docs' link is `href="#"`. A link without `href` is not focusable, so a developer who drops the placeholder `#` gets a thumbnail that looks linked on hover and cannot be reached from the keyboard.
- `.thumbnail { display: inline-block }` follows normalize's `[hidden] { display: none }`, so a bare `hidden` attribute does not hide a thumbnail (measured in three engines).
- Angular's `NgOptimizedImage`, the project's image rule, requires `width` and `height`. Under Foundation's global `border-box` sizing the thumbnail's 4 px border then sits inside those dimensions: the picture renders 8 px narrower and shorter than declared, and `NgOptimizedImage` reports a distortion that is not there for small wide images (its NG02952 warning at 120 by 60, 100 by 56, and 80 by 40 px, measured in three engines).
- Under the library's class rule the developer writes no Foundation class at all, so `.thumbnail` needs an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, must leave the thumbnail framed before hydration and inside dehydrated `@defer` blocks, and must not stop a linked thumbnail from navigating natively.

## Solution

One attribute directive, `nfsThumbnail`, on the element the developer already writes: the image itself, the link around the image, or a wrapper element around the image, as Foundation's Media Object writes it. It binds Foundation's `.thumbnail` class as a static host class and nothing else: no input, no role, no listener. The image, its `alt`, `NgOptimizedImage`, and the link's destination stay the developer's.

A linked thumbnail puts the directive on the link. This is the reverse of the Label's rule, which moves a label inside its link because Foundation's link colour replaces the label's text colour: `.thumbnail` sets no colour and holds only an image, so the link's hover colour changes nothing visible, and the link form is the one Foundation styles for hover and focus. The directive's JSDoc and the docs state three usage rules: every thumbnail image has a text alternative, a linked thumbnail has an `href` and an accessible name, and a thumbnail inside a link goes on the link itself.

The docs give the three forms and when each fits, the `NgOptimizedImage` sizing rule, a `figure` recipe for a caption, and the hiding rule (`@if`, a Toggler, which binds Foundation's `.is-hidden`, or Foundation's `.hide` written as a normal class). The library adds no CSS: Foundation's thumbnail passes WCAG 2.2 AA with its defaults, so there is no `nfs-thumbnail` mixin and no required setting.

## User Stories

1. As an application developer, I want to put `nfsThumbnail` on an `<img>` and get Foundation's framed look, so that I write no Foundation class.
2. As an application developer, I want to put `nfsThumbnail` on the link around an image, so that my linked thumbnail gets Foundation's hover and focus shadow.
3. As an application developer migrating Foundation's Media Object markup, I want to put `nfsThumbnail` on the `div` around an image, so that Foundation's wrapper form keeps its class without my writing it.
4. As an application developer, I want `nfsThumbnail` on a `picture` wrapper to frame an art-directed image, so that one frame surrounds every source.
5. As an application developer, I want `nfsThumbnail` beside `ngSrc` on one image, so that my thumbnails are optimised like every other image.
6. As an application developer using `NgOptimizedImage`, I want the docs to tell me that the frame sits inside the image's `width` and `height` on the image form, so that I know why the picture renders 8 px smaller.
7. As an application developer who sees NG02952 on a small, wide thumbnail, I want the docs to explain that the warning comes from the frame and to give the wrapper form that silences it, so that I do not chase a distortion that is not there.
8. As an application developer, I want the wrapper and link forms to render the picture at exactly its declared size, so that small avatars and logos stay sharp.
9. As an application developer, I want the docs to state that every thumbnail image needs an `alt` attribute, so that Foundation's alt-less markup does not reach production.
10. As an application developer, I want the docs to tell me when `alt=""` is right (the text beside the image already says it, or the image is decoration) and that an image I hid from assistive technology on purpose needs none, so that decorative images are skipped.
11. As an application developer, I want the docs to state that a linked thumbnail is named by its image's `alt`, so that an image link with `alt=""` never ships without a name.
12. As an application developer, I want the docs to state that a linked thumbnail needs a real `href` and that an action is a `<button type="button">`, so that no placeholder link is out of the keyboard's reach.
13. As an application developer, I want the docs to tell me to put `nfsThumbnail` on the link, not on the image or wrapper inside a plain link, so that my linked thumbnail keeps Foundation's shadow and a whole focus ring.
14. As an application developer, I want `nfsThumbnail` on a link to work with `routerLink`, so that thumbnails navigate inside my application.
15. As an application developer, I want a recipe for a thumbnail with a caption, so that the caption is tied to the image for assistive technology.
16. As an application developer, I want to hide and show thumbnails with a Toggler or `@if`, and to be told that a bare `hidden` does not hide one, so that hiding works.
17. As an application developer, I want `nfsThumbnail` to sit beside `nfsToggler`, `NgOptimizedImage`, `routerLink`, and a Tooltip on one element and bind nothing they bind, so that each directive owns its own attributes.
18. As an application developer, I want my own avatar component to host `NfsThumbnail` through `hostDirectives`, so that its host metadata names no Foundation class.
19. As an application developer, I want the docs to tell me how to keep a linked thumbnail's focus ring visible inside a card, an Orbit, or a scrolling strip, so that clipping ancestors do not cut it off.
20. As an application developer, I want the directive to add no role and no ARIA, so that the image, the link, and the `figure` keep their native semantics.
21. As an application developer, I want the directive to take no input and set no class but `.thumbnail`, so that Foundation's Sass settings stay the only way to change the frame.
22. As a screen reader user, I want every informative thumbnail to have a text alternative and every decorative one to be skipped, so that I get what sighted users get without noise.
23. As a screen reader user, I want a linked thumbnail to be named by its image's text alternative, so that I know where the link goes.
24. As a screen reader user, I want a captioned thumbnail to be a named figure, so that the caption is read with the image.
25. As a keyboard user, I want a linked thumbnail's focus ring to surround the whole picture in every browser, so that I can see where I am.
26. As a keyboard user, I want every linked thumbnail to be reachable with Tab, so that no image link is mouse-only.
27. As a user with a motor impairment, I want a linked thumbnail to be at least 24 by 24 CSS px, so that I can hit it.
28. As a user at a 320 CSS px viewport, I want thumbnails to shrink to their container, so that nothing scrolls sideways.
29. As a user of a Windows contrast theme, I want a thumbnail's frame and a linked thumbnail's focus ring to stay visible, so that I can still see the image's edge and where focus is.
30. As a developer of a server-rendered application, I want the server HTML to carry `.thumbnail`, so that the first paint is final and hydration changes nothing.
31. As a developer using `@defer (hydrate never)`, I want thumbnails there to stay framed and linked ones to keep navigating, so that static regions work without JavaScript.
32. As a developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
33. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it.
34. As a library maintainer, I want every behaviour asserted through roles, names, classes, computed style, geometry, and focus-ring pixels in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Thumbnail has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's thumbnail Sass partial, its docs page, the Media Object page's wrapper form, and Foundation's global `img` rule. Dropped options: none, because there are none.

| Feature | Class or markup | Source | Notes |
| --- | --- | --- | --- |
| Thumbnail | `.thumbnail` | `@mixin foundation-thumbnail`, through `thumbnail` | Structural class on any element. `display: inline-block`, `max-width: 100%`, `margin-bottom: $thumbnail-margin-bottom` (`$global-margin`, 1rem), `border: $thumbnail-border` (`4px solid $white`), `border-radius: $thumbnail-radius` (`$global-radius`, 0), `box-shadow: $thumbnail-shadow` (a 1 px ring of `rgba($black, 0.2)`), `line-height: 0`. The white border is invisible on Foundation's `#fefefe` page, and the ring marks the edge |
| Linked thumbnail | `a.thumbnail` | `thumbnail-link` | `transition: $thumbnail-transition` (`box-shadow 200ms ease-out`); on `:hover` and `:focus`, `box-shadow: $thumbnail-shadow-hover` (`0 0 6px 1px rgba($primary-color, 0.5)`). Its `image { box-shadow: none; }` is a typo for `img`: it matches only SVG `<image>` elements and has no visible effect |
| Wrapper | `div.thumbnail` around an `img` | Foundation's Media Object docs | The same rule; `line-height: 0` removes the gap under the inline image |
| The image | `img` | `foundation-global-styles` | `display: inline-block; vertical-align: middle; max-width: 100%; height: auto`, and `border-box` sizing on every element (`html { box-sizing: border-box }`, `* { box-sizing: inherit }`), so a border on the image counts inside its `width` |

Docs conventions kept or corrected: the image form and the link form (kept); `alt` on every image (kept, and required of every recipe, 1.1.1, where Foundation's other pages leave it out); `href="#"` (corrected: a real destination, D3); the Media Object's `div` wrapper (kept as a documented form, D1).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.thumbnail` | `NfsThumbnail` (`[nfsThumbnail]`), static host class | - | - | `thumbnail` | - |

Variant classes: none. Foundation's thumbnail has no size, colour, or modifier class; its frame, shadow, radius, margin, and transition are Sass settings, compile-time configuration and never inputs (building-blocks 1.13). State classes: none; the hover and focus look is Foundation's `a.thumbnail:hover` and `:focus`, pseudo-classes the browser owns. No class is left for the consumer to write (ADR 0039).

### Hierarchy and DI shape

```
[nfsThumbnail]      NfsThumbnail (standalone directive, no template)
```

- One directive, with no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a thumbnail through DI.
- No Defaults token: the Thumbnail has no Options.
- Injection: none.
- Entry point: `ngx-foundation-sites/thumbnail` (one per Foundation docs page), so a consumer's `@defer` can split it.

### API: `NfsThumbnail`

Selector `[nfsThumbnail]`; standalone; no template; `exportAs: 'nfsThumbnail'`.

| Directive | Host binding | Foundation equivalent | Delta |
| --- | --- | --- | --- |
| `NfsThumbnail` | static `class: 'thumbnail'` | `class="thumbnail"` | none |

- Inputs, models, outputs, and methods: none.
- Hosts: any element. The docs name three forms (D1):
  - on the image: `<img nfsThumbnail ...>`, Foundation's first form;
  - on the link around the image: `<a href="..." nfsThumbnail><img ...></a>`, the Linked thumbnail, the only form Foundation gives a hover and focus shadow (D3);
  - on a wrapper element around the image: `<span nfsThumbnail>` or `<div nfsThumbnail>` (Foundation's Media Object form), or `<picture nfsThumbnail>` for an art-directed image.
  A `<button nfsThumbnail>` around an image, for a thumbnail that opens something, takes Foundation's base look and the browser's focus ring (measured); Foundation gives it no shadow, and the consumer writes `type="button"` (D8).
- Attribute ownership: the directive owns `.thumbnail`. It never touches `alt`, `src`, `href`, `role`, `tabindex`, `hidden`, or `aria-*`, which stay the consumer's, and none of the attributes and styles `NgOptimizedImage` binds (`src`, `srcset`, `sizes`, `loading`, `fetchpriority`, its `fill` position and size, its placeholder background and filter).
- Composition: `nfsThumbnail` sits beside `ngSrc`, `routerLink` on a link host, `nfsToggler` (which owns `hidden`, `.is-hidden`, and the Motion classes; the Toggler spec's multiple-targets example), a Tooltip, `nfsEqualizerWatch`, and a Trigger on a button host, and binds nothing they bind. A consumer component that is always a thumbnail hosts `NfsThumbnail` through `hostDirectives`.
- Usage rules (the directive's JSDoc states them, and the usage examples follow them) (D4):
  1. Every thumbnail image has an `alt` attribute (WCAG 1.1.1), on the host when it is an `img` or on the `img` inside it: a description of what it shows, or `alt=""` when the text beside it already says it or the image is decoration. An image hidden from assistive technology on purpose (`role="none"`, `role="presentation"`, or `aria-hidden="true"`) needs none.
  2. A Linked thumbnail has a real `href` (WCAG 2.1.1): a link without `href` is not focusable, and a thumbnail that runs an action is a `<button type="button">` (D8). Its accessible name is its image's `alt`, which names the link's destination, or the link's own text or `aria-label` (WCAG 2.4.4, 4.1.2).
  3. A thumbnail inside a link goes on the link (WCAG 2.4.7): `<a href="..." nfsThumbnail><img ...></a>`, never on the image or a wrapper inside a plain link, where the thumbnail loses Foundation's hover and focus shadow and Firefox draws the link's focus ring as a band across the picture, and never inside a Linked thumbnail, whose two frames would double.
- The Thumbnail writes no Variant property. A redundant `thumbnail` merges with the static host class (building-blocks 1.4), and there is no Variant or State class to strip.

### Comparison with Angular Material (22.2) and `NgOptimizedImage`

| Concern | Material `MatCardImage`, `MatCardAvatar` | `NgOptimizedImage` | `NfsThumbnail` |
| --- | --- | --- | --- |
| Selector and kind | `[mat-card-image]`, `[matCardImage]`, `[mat-card-avatar]`, `[matCardAvatar]`: directives with a static host class on any element | `img[ngSrc]`, a directive on the image | `[nfsThumbnail]` on any element, a static host class |
| What it does | Sizes an image inside a card | Loading, `srcset`, priority preloading, and its own sizing diagnostics | Foundation's frame and, on a link, its hover and focus shadow |
| Text alternative | The consumer's `alt` | The consumer's `alt`; no check of it | The consumer's `alt`, which the docs require (usage rule 1) |
| Testing | `MatCardHarness` for the card | None | DOM-first assertions; no harness |

Borrowed: Material's shape for an image-styling directive, a static host class on whatever element the consumer writes. `NgOptimizedImage` composes on the same `img` and is the project's image rule. Not borrowed: an image component that renders the `img` (Foundation generates nothing, ADR 0001), and any input.

### Implementation level and primitives

Implementation level: native platform. A thumbnail is the consumer's image, link, or wrapper with Foundation's CSS; its meaning is the image's `alt`, the link's `href`, and a `figure`'s `figcaption`. `@angular/aria` has no image or link pattern in 22.2, and `@angular/cdk` has nothing to add. The Angular layer is one static host class; no signal, `computed`, `effect`, render callback, listener, timer, or observer.

Fallback: none needed. The risks the directive owns, the linked forms' focus rings, clipping, `hidden`, `NgOptimizedImage` sizing, target size, and the usage rules' cases, were measured by this spec's ticket in three engines and with axe.

### ARIA and keyboard

APG pattern: none. An image is an image, a Linked thumbnail is a link, and a captioned thumbnail is a figure.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `img[nfsThumbnail]` | `img` named by its `alt`; with `alt=""`, presentational and skipped | HTML-AAM; WCAG 1.1.1 |
| `a[nfsThumbnail]` around an image | `link` named by the image's `alt`, which names the destination ("Neptune", "Photo of Neptune"); an image with `alt=""` leaves the link nameless unless the link has text or an `aria-label` (axe `link-name`, measured) | accname (name from content); WCAG 2.4.4 |
| A wrapper (`span`, `div`, `picture`) | `generic`; the image inside is the `img` | HTML-AAM |
| A captioned thumbnail | `figure` named by its `figcaption`, with the image inside | HTML-AAM |
| Hover and focus on a Linked thumbnail | Foundation's shadow; the browser's own focus ring stays, because Foundation removes outlines only under what-input's `data-whatinput="mouse"`, which the library never loads | Foundation's Sass |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches a Linked thumbnail (it needs an `href`) or a button thumbnail; skips an image or wrapper | Native |
| Enter | Follows a Linked thumbnail's link | Native |
| Enter, Space | Activates a button thumbnail | Native |

Focus: the directive moves no focus and adds no tab stop. Measured in three engines, the browser's focus ring surrounds a Linked thumbnail's whole frame (1 px outside plus a 1 px line inside the frame in Chromium, 2 px outside in Firefox and WebKit; with Foundation's shadow the focus look reaches 4 to 5 px outside). On an image or wrapper inside a plain link, Chromium and WebKit draw the ring around the image, while Firefox draws it around the link's 17 px line box, a band across the middle of the picture (usage rule 3). A clipping ancestor cuts the ring and the shadow off on each side where the thumbnail touches its edge: flush in a 200 px `overflow: hidden` box, Firefox and WebKit keep only the bottom edge (the thumbnail's bottom margin lies inside the box), and Chromium the bottom edge and its inner line. Inside a card section the whole ring shows. The recipes keep a Linked thumbnail off a clipping ancestor's edges, inside padding such as a card section's, as the Card's D6 does for links in a card (D7).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Geometry and focus-ring pixels were measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0 and Angular 22.2.0's `NgOptimizedImage`. The Thumbnail has no text of its own, so no text contrast pair; links on the page are the Card's figures (`$anchor-color` 4.647:1 and its hover colour 5.920:1 on `#fefefe`), which matter only for a broken image's `alt` text.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.1.1 Non-text Content | Every thumbnail image has an `alt`: descriptive where it carries information, `alt=""` where the text beside it says the same or it is decoration; a Linked thumbnail's image describes the destination (usage rule 1) | The Thumbnail page's images have `alt`; its Tabs, Sticky, Responsive Accordion Tabs, and Motion UI examples do not (axe `image-alt`, measured) | axe `image-alt` in every story; every play function finds each informative image by `getByRole('img', {name})` |
| 2.4.4 Link Purpose (In Context), 4.1.2 Name, Role, Value | A Linked thumbnail is a native link whose name is its image's `alt` (or the link's own `aria-label` or text) (usage rule 2) | Foundation's example is named; an image link with `alt=""` fails axe `link-name` (measured) | axe `link-name` in every story; `thumbnail--gallery` finds every link by `getByRole('link', {name})` |
| 2.1.1 Keyboard | Every Linked thumbnail has an `href`, so it is focusable; an action is a `<button type="button">` (usage rule 2) | Foundation writes `href="#"`; an `a.thumbnail` with no `href` passes axe and is not focusable (measured) | `thumbnail--gallery` tabs to every link |
| 2.4.7 Focus Visible | A Linked thumbnail shows the browser's focus ring around its whole frame: the class is on the link, never on the image or wrapper inside a plain link (usage rule 3), and the recipes keep it off a clipping ancestor's edges (D3, D7) | Foundation's link form passes in three engines; the image inside a plain link gets a 17 px band across the picture in Firefox, which axe does not report (measured) | e2e in three engines on `thumbnail--gallery`: after Tab, pixels change on all four sides within 6 px outside the focused link's box; the play function asserts each link's box encloses its image and that no ancestor clips it |
| 1.4.11 Non-text Contrast | Nothing is required of the frame: an image identifies its link without a boundary, and the thumbnail's white border and 1 px ring mark no state. The focus indicator is the browser's own ring, unmodified; Foundation's shadow is an addition beside it | Passes | e2e above |
| 2.5.8 Target Size (Minimum) | A Linked thumbnail's box is its image plus twice the border width, so with Foundation's 4 px border an image of 16 px or more makes a 24 by 24 px target; a smaller image needs the spacing exception or a larger image. With `$thumbnail-border` of width b, the image needs `24 - 2b` px | Two adjacent 12 px images make 20 by 20 px links, which axe `target-size` fails; 16 px images make 24 by 24 px links, which pass (measured) | axe `target-size` in every story |
| 1.4.10 Reflow | At 320 CSS px no thumbnail scrolls the page sideways: Foundation's `max-width: 100%` on the thumbnail and on the image shrinks every form to its container | Passes: in a 200 px container at a 320 px viewport every form is 200 px wide with a 192 px picture, and the page's `scrollWidth` is 320 in three engines (measured) | e2e in three engines at 320 by 640 px: `document.documentElement.scrollWidth` is at most 320 in `thumbnail--default` and `thumbnail--sizing` |
| 1.3.1 Info and Relationships | A caption is a `figcaption` in a `figure` that holds the thumbnail, so the figure is named by it | Foundation shows no caption | `thumbnail--captioned` finds `getByRole('figure', {name})` |
| 2.4.11 Focus Not Obscured (Minimum) | Nothing covers a focused thumbnail; the directive adds no overlay | Passes | None in this library |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). It sees a missing `alt`, a nameless image link, and small adjacent links, but not a missing `href` or Firefox's band ring, which is why usage rules 2 and 3 state them and 2.4.7 is an e2e case.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directive declares no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfsthumbnail=""`, `ngsrc="..."`), and `NgOptimizedImage` its own (`src`, `loading`, `fetchpriority`, and the like), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- On the image: the frame sits inside the declared 300 by 200 px, so the picture renders 292 by 194.7 px -->
<img nfsThumbnail ngSrc="/assets/thumbnail/uranus.jpg" width="300" height="200" alt="Photo of Uranus.">

<img width="300" height="200" alt="Photo of Uranus." class="thumbnail">

<!-- A Linked thumbnail: the class on the link, a plain image inside at its declared size -->
<a href="/planets/neptune" nfsThumbnail><img ngSrc="/assets/thumbnail/neptune.jpg" width="300" height="200" alt="Photo of Neptune."></a>

<a href="/planets/neptune" class="thumbnail"><img width="300" height="200" alt="Photo of Neptune."></a>

<!-- On a wrapper: Foundation's Media Object form, and the form for a small, wide optimised image -->
<span nfsThumbnail><img ngSrc="/assets/logos/partner.png" width="120" height="60" alt="Northwind Traders"></span>

<span class="thumbnail"><img width="120" height="60" alt="Northwind Traders"></span>

<!-- A captioned thumbnail -->
<figure>
  <img nfsThumbnail ngSrc="/assets/thumbnail/pluto.jpg" width="300" height="200" alt="Pluto's heart-shaped plain">
  <figcaption>Pluto, photographed by New Horizons in 2015.</figcaption>
</figure>

<figure>
  <img width="300" height="200" alt="Pluto's heart-shaped plain" class="thumbnail">
  <figcaption>Pluto, photographed by New Horizons in 2015.</figcaption>
</figure>
```

### Animation

None of the library's. Foundation's `a.thumbnail` transitions its `box-shadow` over `$thumbnail-transition` (200 ms) on hover and focus; the library neither awaits nor overrides it, and reduced motion is Foundation's own concern there (a 200 ms shadow fade moves nothing). A thumbnail that appears or disappears takes the Toggler's typed Motion input (the Toggler spec's multiple-targets example) or, inside `@if`, only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.thumbnail` exactly as the hydrated DOM does, and the consumer's `alt`, `href`, and `NgOptimizedImage` attributes are in it, so the first paint is final.
- Before hydration: the directive touches no DOM outside its static host class, measures nothing, and starts no timer.
- Full and incremental hydration: the host class equals the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own.
- Event replay: `NfsThumbnail` declares no listener and adds no `jsaction`, so a Linked thumbnail inside a dehydrated block navigates natively. A consumer `(click)` or `routerLink` on the link adds `jsaction`, and a pre-hydration click then replays through that listener once its block hydrates (building-blocks 1.11 decision 5). A Linked thumbnail that is itself a root node of a `@defer (hydrate on interaction)` block has its click cancelled by the trigger; the docs tell consumers to wrap it in an element.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a thumbnail is its server HTML; inside `@defer (hydrate never)` it stays framed for good, and a plain Linked thumbnail keeps navigating.
- Prerendering: identical to SSR; the directive reads no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the class, roles and names, the image and frame sizes, where the focus ring is drawn, and the page's scroll width. No test reads the directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Card](../issues/90-spec-card.md)'s and [Spec: Label](../issues/94-spec-label.md)'s tests, the nearest precedents.

Story ids follow `thumbnail--<story>`: `thumbnail--default`, `thumbnail--gallery`, `thumbnail--sizing`, `thumbnail--captioned`. `meta.component` is `NfsThumbnail`; there are no args, because the directive has no input. The Storybook preview needs no settings override and no Library mixin include. Every story image uses `NgOptimizedImage` (`ngSrc` with `width` and `height`) and has an `alt`. Grid scaffolding in `thumbnail--gallery` writes Foundation's XY Grid classes (`grid-x small-up-2 medium-up-3` and `cell`) as normal classes, with Foundation's global styles loaded in the preview, because the XY Grid has no first-milestone spec; the story imports no grid directive.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `image-alt`, `link-name`, and `target-size`). No story element carries a Foundation class written in the story, except the XY Grid's classes in `thumbnail--gallery`, a family with no first-milestone spec.

- `thumbnail--default`: Foundation's docs example as the recipe: two image thumbnails (Uranus, Pluto) and a Linked thumbnail (Neptune) with a real `href`. Each host carries `.thumbnail`; each image is found by `getByRole('img', {name})`; the link by `getByRole('link', {name: 'Photo of Neptune.'})`; the link's computed box-shadow at rest is Foundation's `$thumbnail-shadow`, and its box is its image's box grown by 4 px on every side.
- `thumbnail--gallery`: six Linked thumbnails in a list (`ul class="grid-x small-up-2 medium-up-3"`, each in an `li class="cell"`), each named by its image. Tab reaches each link in DOM order (`toHaveFocus()`); after each Tab the focused link's computed box-shadow becomes Foundation's `$thumbnail-shadow-hover` (`waitFor`, past the 200 ms transition); each link's box encloses its image, and no ancestor of a link up to the story root has a computed `overflow` other than `visible`, so nothing clips its ring.
- `thumbnail--sizing`: the same 120 by 60 px `NgOptimizedImage` in the three forms side by side: on the image, the picture's content box is 112 by 56 px inside a 120 by 64 px frame; on a `span` wrapper and on a link, the picture is 120 by 60 px inside a 128 by 68 px frame. The story's JSDoc explains the `border-box` rule and the NG02952 warning of the first form (D5).
- `thumbnail--captioned`: a `figure` with a thumbnail image and a `figcaption`; the play function finds `getByRole('figure', {name: 'Pluto, photographed by New Horizons in 2015.'})` and the image inside it by its name.

No Anti-pattern story: a thumbnail inside a plain link passes the gate (measured), so rendering it would show nothing the gate enforces; usage rule 3 and the docs snippet carry it.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directive over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host class, driven by data: `.thumbnail` on an `img`, an `a`, a `span`, a `div`, a `picture`, and a `button`; the consumer's own static class and a `[class]` binding stay; the directive adds no attribute (`alt`, `href`, `role`, `tabindex`, `hidden`, `aria-*` stay as written).
- Composition: beside `ngSrc`, the image keeps every attribute `NgOptimizedImage` renders and carries `.thumbnail`; beside `routerLink` on an `a` host, the link's `href` is the Router's; a test component with `hostDirectives: [NfsThumbnail]` renders `.thumbnail` on its host.
- `NgOptimizedImage` sizing, documenting Angular's check (D5): with a spy on the console, a 120 by 60 px image with `nfsThumbnail` on the image logs NG02952 once after it loads; the same image on a `span` wrapper and on a link logs nothing, and neither does a 300 by 200 px image on the image. The test fails when Angular changes its check, which is the signal to revise D5's guidance.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with an image thumbnail, a Linked thumbnail with a `routerLink`, a wrapper, and a captioned figure, all with `NgOptimizedImage`. `whenStable()` resolves; the server HTML carries `class="thumbnail"` on each host and the consumer's `alt` and `href`; `NfsThumbnail` adds no `jsaction`.
- Sass compile: none; the Thumbnail has no Library mixin.
- Pure logic: none.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Focus ring (2.4.7) in three engines on `thumbnail--gallery`: screenshot the first link's area, press Tab (in WebKit, whose Tab and Alt+Tab skip links under Playwright, measured, `locator.focus()`, which matches `:focus-visible` there), wait past the transition, screenshot again; pixels change on all four sides within 6 px outside the link's box, and do so again with Foundation's shadow neutralised by an injected style, so the browser's own ring is shown to surround the frame. This is the case where the engines differ for the wrong form, so it runs in all three.
- Reflow (1.4.10) in three engines: at 320 by 640 px, `document.documentElement.scrollWidth` is at most 320 in `thumbnail--default` and `thumbnail--sizing`.

Against the prerendered fixture app, on the Thumbnail route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; every host carries `.thumbnail` before any script runs, and a click on a Linked thumbnail without `routerLink` navigates.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

## Out of Scope

- A thumbnail component that renders the image, takes `src` or `alt` inputs, or wraps `NgOptimizedImage`: Foundation generates nothing (ADR 0001), and the image, its text alternative, and `NgOptimizedImage` are the consumer's. Category: `scope-boundary`.
- An `alt` input or a generated text alternative: `alt` is the native attribute of the consumer's image, and only the author knows what it shows (the out-of-scope triage: the alt text stays the consumer's). Category: `platform-or-a11y`.
- Variant inputs for the frame, shadow, radius, or margin: Foundation's thumbnail has no Variant class; its look is Sass settings. Category: `scope-boundary`.
- A `type` input and Foundation's hover and focus shadow for a thumbnail on a `<button>` (D8): Foundation shows no button thumbnail and styles only `a.thumbnail`; `[nfsThumbnail]` binds the class on a button, which takes the base look and the browser's focus ring (measured), and the consumer writes `type="button"`; additive later as a Library mixin that applies Foundation's own `thumbnail-link` mixin to `button.thumbnail`. Category: `scope-boundary`.
- A library `outline-offset` rule that draws a Linked thumbnail's focus ring over its frame, so that no clipping ancestor can cut it off (D7): one edge stays visible in every engine, so 2.4.7 holds; Foundation leaves the outline to the browser; the Card's D6 made the same call. Category: `other`.
- A library rule `.thumbnail[hidden] { display: none; }` (D9): every Foundation class that sets `display` outranks normalize's `[hidden]` by source order, the Toggler binds Foundation's `.is-hidden` (building-blocks 1.10), and `@if` removes the element; a rule for one component would leave the others. Category: `other`.
- A library `box-sizing` rule that keeps an `NgOptimizedImage` at its declared size on the image form (D5): `content-box` lets the frame overflow its container under `max-width: 100%` (1.4.10) unless the rule parses the width out of the `$thumbnail-border` shorthand, and it changes Foundation's rendering of every image thumbnail; the wrapper form does it with Foundation's own CSS (measured). Category: `other`.
- Fixing Foundation's `image { box-shadow: none; }` typo: it has no visible effect, and the library copies no Foundation rule. Category: `other`.
- Opening a full-size image in a lightbox: a Reveal opened by a Trigger on a button thumbnail ([Spec: Reveal](../issues/18-spec-reveal.md), [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)). Category: `scope-boundary`.
- Responsive image sources: `<picture>`, `srcset`, and `NgOptimizedImage`, documented by the [Spec: Interchange](../issues/35-spec-interchange.md). Category: `scope-boundary`.
- The Media Object's layout around a thumbnail (its `img { max-width: none; }` and stacked width rules): the [Spec: Media Object](../issues/91-spec-media-object.md). Category: `scope-boundary`.
- The grid that lays out a gallery: Foundation's XY Grid classes, which the consumer writes as normal classes; a later milestone adds the XY Grid's directives. Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `[nfsThumbnail]`, on any element, binding `.thumbnail` as a static host class; entry point `ngx-foundation-sites/thumbnail`; the docs name three forms: on the image, on the link around it, on a wrapper around it | ADR 0001 and ADR 0039: one Structural class, and Foundation generates nothing; Foundation writes the class on an `img`, an `a`, and, on its Media Object page, a `div`, so every form needs a home; Material's image directives bind a class on any element; the name follows the class (building-blocks 1.3) | `img[nfsThumbnail], a[nfsThumbnail]`, the triage's sketch (leaves the Media Object's `div.thumbnail` and a `picture` wrapper without a directive, against ADR 0039) (`other`); a component that renders the image (ADR 0001; the image is the consumer's) (`scope-boundary`); a second directive for the link form (one class, one directive, as `nfsButton` covers `button` and `a`) (`other`) |
| D2 | No inputs, Variant inputs, State classes, models, outputs, methods, Defaults token, or providers | Foundation's thumbnail has no Variant or State class and no Options; its settings are compile-time configuration (building-blocks 1.13); hover and focus are pseudo-classes | A shadow or size input (no Foundation class to set; a library class family) (`scope-boundary`); an `alt` input (the native attribute is the consumer's) (`platform-or-a11y`) |
| D3 | A Linked thumbnail is the link: `a[nfsThumbnail]` with a real `href` around a plain image; the Label's inside-the-link rule does not carry over | The Label moved inside its link because Foundation's `a:hover, a:focus` colour replaced its text colour (1.27:1) and `.label`'s `cursor: default` hid the link; `.thumbnail` sets no colour or cursor and holds no text, so the hover colour changes nothing visible and the pointer stays (measured); Foundation styles only `a.thumbnail` for hover and focus; measured in three engines, the browser's ring surrounds the link form's whole frame, while on an image inside a plain link Firefox draws it as a 17 px band across the picture | The class on the image inside a plain link (no shadow, and Firefox's band ring, which axe passes) (`platform-or-a11y`); the Label's rule applied by analogy (its reason, a text colour, does not exist here) (`other`) |
| D4 | Three usage rules, stated in the directive's JSDoc and the docs: every thumbnail image has a text alternative; a Linked thumbnail has an `href` and a name; a thumbnail inside a link goes on the link | The directive sits on the image or the link, so each rule concerns its own host or its content; Foundation's own pages write alt-less thumbnails; axe does not see a missing `href` or Firefox's band ring (measured), so the docs state what the story gate cannot prove on the consumer's page | Foundation's one `alt` sentence alone (its own pages break it, and it says nothing of links) (`platform-or-a11y`); a rule for the `alt` wording (the words are the author's) (`platform-or-a11y`); a rule against wrappers outside links (a double frame is visible to the developer at once) (`other`) |
| D5 | `NgOptimizedImage` on the image form is supported and is the default recipe; the docs explain that the frame sits inside the declared `width` and `height`, and give the wrapper or link form where the picture must render at exactly its declared size or where Angular reports NG02952 for a small, wide image | Measured with Angular 22.2.0 in three engines: on the image the picture renders `width - 8` by `height - 8` px and is not distorted; Angular's check subtracts padding but not border under `border-box`, so it compares the frame's ratio with the file's and reports NG02952 at 120 by 60, 100 by 56, and 80 by 40 px, and not at 300 by 200, 200 by 100, 160 by 90, 150 by 100, or 64 by 64 px; on a wrapper or link the picture is exactly its declared size and nothing is reported. With the 4 px border the warning appears for a landscape image of ratio r and width W when `8r(r - 1) / (W + 8(r - 1)) > 0.1`: a 2:1 image under 152 px wide, 16:9 under 104 px, 3:2 under 56 px; square images never | A library `content-box` rule (overflows the container at `max-width: 100%` unless it parses `$thumbnail-border`; changes Foundation's rendering) (`other`); the wrapper as the only recipe (Foundation's first form renders correctly, and three published specs write it) (`other`) |
| D6 | Captions are a `figure` holding the thumbnail and a `figcaption` | The figure is named by its caption (1.3.1), with no library code; Foundation shows no caption | A caption directive or input (the native elements carry the relationship) (`platform-or-a11y`) |
| D7 | The recipes keep a Linked thumbnail off a clipping ancestor's edges, inside padding such as a card section's; documented, with no outline rule | Measured in three engines: flush in an `overflow: hidden` box, the ring and shadow keep only the bottom edge (Firefox, WebKit) or that edge and Chromium's inner line; in a card section the whole ring shows; 2.4.7 holds with one edge; the Card's D6 | An `outline-offset` rule drawing the ring over the frame (styles the browser's focus ring, which Foundation leaves alone, and a `$thumbnail-border` of 0 leaves nothing to draw on) (`other`) |
| D8 | A thumbnail that opens something is `<button type="button" nfsThumbnail>` around its image with a Trigger beside it; no `type` input and no library shadow | The any-element selector already binds the class; measured, a button thumbnail gets the browser's focus ring around its frame (1 px dotted in Firefox, from Foundation's normalize, as every button does); Foundation shows no button thumbnail; a button without `type="button"` inside a form submits it | A `type` input defaulting to `button`, as the Close Button has (a documented host of images and links does not need it; additive later) (`scope-boundary`); an `nfs-thumbnail` mixin giving `button.thumbnail` Foundation's `thumbnail-link` shadow (a look Foundation never gives a button; additive later) (`scope-boundary`) |
| D9 | A thumbnail is hidden with `@if`, a Toggler in visibility mode, or Foundation's `.hide` written as a normal class, never with a bare `hidden` | Measured in three engines: `hidden` alone leaves a thumbnail displayed (`inline-block`, full size), and with Foundation's `.is-hidden`, which the Toggler binds, it is gone | A `hidden` input binding `.is-hidden` (a second spelling of the Toggler) (`scope-boundary`); a library `[hidden]` rule (`other`) |
| D10 | Native implementation level; listener-free; a static host class in server HTML | The element, its attributes, and Foundation's CSS cover everything; host bindings render on the server | A focus-within or hover State class (Foundation's look is pseudo-classes) (`scope-boundary`) |
| D11 | Four stories; e2e for the focus ring and reflow in three engines and the fixture app's first paint and hydration; a browser-level test that pins Angular's NG02952 behaviour | Firefox draws a different ring for the wrong form, so the ring needs real engines; axe cannot see clipping or reflow; the NG02952 test tells maintainers when D5's guidance goes stale | An Anti-pattern story for the thumbnail inside a plain link (it passes the gate, so it would demonstrate nothing the gate enforces) (`other`); a forced-colours e2e (measured once; the library adds nothing there) (`platform-or-a11y`) |
| D12 | Two glossary terms, **Thumbnail** and **Linked thumbnail** | Foundation's name for the component, and the one form with its own look and its own accessibility rules | A term for the wrapper form (a structural detail, not domain language) (`other`) |

### Usage examples

```html
<!-- A gallery of Linked thumbnails that is a list -->
<ul class="grid-x small-up-2 medium-up-3">
  <li class="cell">
    <a routerLink="/planets/uranus" nfsThumbnail>
      <img ngSrc="/assets/thumbnail/uranus.jpg" width="300" height="200" alt="Uranus">
    </a>
  </li>
  <li class="cell">
    <a routerLink="/planets/neptune" nfsThumbnail>
      <img ngSrc="/assets/thumbnail/neptune.jpg" width="300" height="200" alt="Neptune">
    </a>
  </li>
</ul>

<!-- A thumbnail that opens a lightbox: a button, with a Trigger beside the directive -->
<button type="button" nfsThumbnail [nfsOpen]="lightbox">
  <img ngSrc="/assets/thumbnail/pluto.jpg" width="300" height="200" alt="Pluto, full size">
</button>

<!-- Three thumbnails that one button hides together, from the Toggler spec -->
<button nfsButton [nfsToggle]="[thumb1, thumb2, thumb3]">Toggle all these</button>
<img nfsThumbnail nfsToggler #thumb1="nfsToggler" animate="hinge-in-from-top spin-out" ngSrc="01.jpg" width="300" height="200" alt="Photo of Uranus.">
```

```ts
@Component({
  selector: 'app-avatar',
  imports: [NgOptimizedImage],
  hostDirectives: [NfsThumbnail],
  template: `<img [ngSrc]="person().photo" width="64" height="64" [alt]="person().name" />`,
})
export class Avatar {
  readonly person = input.required<Person>();
}
```

`<app-avatar>` renders `class="thumbnail"` from the hosted directive, as a wrapper around its image, so its host metadata names no Foundation class and the 64 by 64 px photo renders at its declared size inside a 72 by 72 px frame. The gallery's `grid-x`, `small-up-2`, `medium-up-3`, and `cell` are Foundation's XY Grid classes, which the consumer writes as normal classes, with Foundation's global styles loaded, because the XY Grid has no first-milestone spec. An `<img>` inside an art-directed `<picture>` stays a plain `<img>` with its own `srcset`, the one exception to the project's `NgOptimizedImage` rule ([Spec: Interchange](../issues/35-spec-interchange.md), D18); `nfsThumbnail` goes on that `<img>` or on the `<picture>`.

### Platform features to adopt when the browser target moves

- Nothing in the platform research applies: the directive binds one static class. `NgOptimizedImage` support for `<picture>`, on Angular's roadmap, would let an art-directed thumbnail use `ngSrc` with no change here.

### Foundation behaviour changed or dropped

- Foundation's `href="#"` becomes a real destination, and the docs require an `href` on every Linked thumbnail (D4).
- Every recipe image has an `alt`, which Foundation's thumbnails on other docs pages lack (1.1.1).
- A linked thumbnail is always the link form; the docs never put the directive on the image inside a plain link (D3).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-thumbnail`, configured through the `$thumbnail-*` settings, and on `foundation-global-styles` for the `img` rule and `border-box` sizing. No library CSS; there is no `nfs-thumbnail` mixin.

1. Rules: none. Foundation's defaults pass WCAG 2.2 AA for every form the recipes write (the WCAG table above).
2. Reused settings and mixins: none beyond the export mixins named.
3. Custom properties the directive writes: none.
4. Motion classes: none, and no `prefers-reduced-motion` override; Foundation's own 200 ms shadow transition is left as it is.
5. Missing include: without `foundation-thumbnail` the class styles nothing and images show unframed; nothing of the library's is missing, because there is no Library mixin.
6. Variant properties: none; the Thumbnail has no Variant class.

Required settings: none.

### Notes

- RTL: nothing flips; the frame and the shadow are symmetric, and no `Directionality` is read.
- Forced colours: measured in Chromium and Firefox, the frame's border computes to CanvasText (an image) or LinkText (a link), the shadows to `none`, and the focus outline stays `auto`, so the image's edge and the focus ring remain.
- Without `width` and `height` attributes, as Foundation's docs write images, the frame adds to the picture's natural size (a 120 by 80 px image in a 128 by 88 px frame); the image form shrinks the picture only when its size is declared.
- The Card, Sticky, Toggler, and Media Object specs write this directive on the image form, `img[nfsThumbnail]`.
- The `hidden` attribute alone does not hide a thumbnail: Foundation's `.thumbnail` sets `display: inline-block` after normalize's `[hidden] { display: none }` at equal specificity (measured in Chromium, Firefox, and WebKit), as building-blocks 1.10 records. Remove it with `@if`, or hide it with a Toggler in Visibility mode, which binds Foundation's `.is-hidden` ([Spec: Toggler](../issues/17-spec-toggler.md), D3), or with Foundation's `.hide` (`display: none !important`), a Visibility class the consumer writes as a normal class, with Foundation's global styles loaded (D9). The same rule holds for an element that carries another Foundation class setting `display`, such as the XY Grid's or the Float Classes'.
- The Media Object's `img { max-width: none; }` and its stacked `width: 100%` reach a thumbnail image or a wrapper's image inside a section differently; the [Spec: Media Object](../issues/91-spec-media-object.md) decides which form its recipe writes.
