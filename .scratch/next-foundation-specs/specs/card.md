# Spec: Card

Ticket: [Spec: Card](../issues/90-spec-card.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)); the Card has no Variant class, so the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)) add nothing to its API.

## Problem Statement

A developer on Foundation for Sites who wants a self-contained block of content about one subject (a product, an article teaser, a person, a plan) writes Foundation's Card markup: an element with the `.card` class, holding `.card-divider` bands for a title or a footer, `.card-section` blocks for padded content, and images, which the docs tell the developer to wrap in `.card-image`. Card is a CSS-only component: it ships Sass and classes and no Plugin. Foundation's docs say "A card is just an element with a `.card` class applied. You can put any kind of content inside." The markup contract leaves the hard parts to the author:

- No image in Foundation's card examples has an `alt` attribute, and axe reports `image-alt` on every one (measured), so the docs markup fails WCAG 2.2 success criterion 1.1.1 as written.
- The docs offer the divider "as a title, footer or to break up content", and a link is the obvious content of a card's footer. Such a link is `$anchor-color` (`#1779ba`) on `$card-divider-background` (`$light-gray`, `#e6e6e6`): 3.755:1, under the 4.5:1 of 1.4.3 (axe reports 3.75).
- `.card` sets `overflow: hidden`, so the card cuts off what does not fit instead of letting it overflow. At a 320 CSS px viewport a URL in a card's paragraph loses 113.8 px in Chromium and WebKit (Firefox breaks it after a slash), and in the docs' two-up block grid a 13-letter heading word ("Accessibility") loses 4.1 to 4.2 px in all three engines once the 1.4.12 text spacing is applied (measured). Clipped text fails 1.4.10 and 1.4.12, and axe cannot see it.
- The `.card-image` wrapper exists for an Internet Explorer 11 flexbox bug. In the Browser target an image written directly in the card renders at its own ratio with no space under it, wrapped or not (measured in three engines), so the wrapper is optional.
- A card is only a `div`: its meaning comes from the element the author picks, and a `header` or `footer` used as a divider in a `div` card outside `main` becomes a page `banner` or `contentinfo` landmark (measured in Chromium).
- A link written directly in the card, such as a full-bleed image link, touches the card's edges, where `overflow: hidden` clips its focus outline on three sides (measured in three engines).
- Under the library's class rule the developer writes no Foundation class of a family with a first-milestone spec, so `.card`, `.card-divider`, `.card-section`, and `.card-image` need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the card styled before hydration and inside dehydrated `@defer` blocks.

## Solution

Four attribute directives, one per Structural class, on the elements the developer already writes: `nfsCard` binds `.card`, `nfsCardDivider` binds `.card-divider`, `nfsCardSection` binds `.card-section`, and `nfsCardImage` binds `.card-image`. Each is a static host class and nothing else: no input, no role, no listener, and nothing injected, so the server HTML is the final DOM. The card's meaning comes from the element the developer picks (`article` for a self-contained item, a named `section` for a region, a list item in a list), and its controls are the links and buttons inside it; the recipes link the card's heading, give every image an `alt`, and write images directly in the card without the optional wrapper.

The `nfs-card` Library mixin adds one rule, `.card { overflow-wrap: anywhere; }`, so a word wider than the card breaks inside it instead of being cut off. The card's text colour and its link colours (`$anchor-color`, `$anchor-color-hover`) must reach 4.5:1 on the card background and on the divider background, and the spec lists each pair. On Foundation's defaults that asks for settings that the Callout spec already requires: `$anchor-color: scale-color($primary-color, $lightness: -15%);` (4.858:1 on the divider), and `#666666` for the four typography greys Foundation's global styles print inside a card (4.601:1 on the divider).

## User Stories

1. As an application developer, I want to put `nfsCard` on a `div`, `article`, `section`, or `li` and get Foundation's `.card` look, so that I write no Foundation class.
2. As an application developer, I want `nfsCardDivider` for a title band, a footer band, or a break between parts, so that I get Foundation's shaded divider without writing `.card-divider`.
3. As an application developer, I want `nfsCardSection` for padded content, so that I get Foundation's traditional card look.
4. As an application developer, I want to write an image directly in the card to span its edges, or inside a section to keep padding around it, as Foundation's docs show, so that images need no directive.
5. As an application developer migrating Foundation markup with a `.card-image` wrapper, I want `nfsCardImage` for it, so that the wrapper keeps Foundation's class without my writing it.
6. As an application developer, I want the docs to tell me the wrapper is optional in the browsers the library supports, so that I do not add elements for a bug those browsers do not have.
7. As an application developer, I want the card directives to add no role, so that the element I pick decides what a card is.
8. As an application developer, I want `nfsCard` to work beside Foundation's grid and flex classes and the Equalizer directives on one element, so that cards take part in Foundation's layouts.
9. As an application developer, I want my own card component to host `NfsCard` through `hostDirectives`, so that its host metadata names no Foundation class.
10. As an application developer, I want `NgOptimizedImage` to work on a card's image, so that card images are optimised like every other image.
11. As an application developer, I want the spec to list every text and link pair a card puts on its card and divider backgrounds, with the 4.5:1 each must reach, so that I can keep a theme of my own at WCAG 2.2 AA.
12. As an application developer on Foundation's defaults, I want the spec to name the settings that pass, so that my cards pass with the lines other components already need.
13. As an application developer with a translucent divider background, I want the spec to measure the ratio with it composited over the card background, so that I compare the colour users see.
14. As an application developer who changes `$global-flexbox`, I want the directives and the rule to work unchanged, so that a Sass setting stays compile-time configuration.
15. As a user with low vision, I want links in a card divider to contrast at least 4.5:1 with it, at rest and on hover, so that I can read a card's footer link.
16. As a user who enlarges text spacing, I want no word in a card to be cut off at the card's edge, so that I can read every character.
17. As a user at a 320 CSS px viewport or 400 percent zoom, I want long words and URLs in a card to wrap inside it, so that nothing is lost and nothing scrolls sideways.
18. As a screen reader user, I want every informative card image to have a text alternative and every decorative one to be skipped, so that I get what sighted users get without noise.
19. As a screen reader user, I want a card's title to be a real heading, so that I can move between cards by heading.
20. As a screen reader user, I want a set of cards that is a list to be a list, so that I hear how many there are.
21. As a screen reader user, I want a card's header and footer bands not to become page landmarks, so that the page's banner and content information stay unique.
22. As a keyboard user, I want one tab stop per card destination, its linked title, so that I do not tab through a duplicate image link.
23. As a keyboard user, I want a focused link inside a card to show its whole focus indicator, so that I can see where I am.
24. As a user of a Windows contrast theme, I want a card's boundary and text to stay visible, so that cards stay recognisable.
25. As a developer of a server-rendered application, I want the server HTML to carry every card class, so that the first paint is final and hydration changes nothing.
26. As a developer using `@defer (hydrate never)`, I want cards there to stay styled, so that static regions look right without JavaScript.
27. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
28. As an application developer, I want to import the four directives from one entry point, so that a `@defer` block can split it.
29. As a library maintainer, I want every behaviour asserted through roles, names, classes, computed style, and geometry in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Card has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's card Sass partial, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source | Notes |
| --- | --- | --- | --- |
| Card | `.card` | `@mixin foundation-card`, through `card-container` | Structural class on any element. `margin-bottom: $card-margin-bottom` (`$global-margin`), `border: $card-border` (1px `$light-gray`), `border-radius: $card-border-radius` (`$global-radius`, 0), `background: $card-background` (`$white`), `box-shadow: $card-shadow` (none), `color: $card-font-color` (`$body-font-color`), `overflow: hidden`; the last child loses its bottom margin. Under `$global-flexbox` (on by default) also `display: flex; flex-direction: column; flex-grow: 1`, so a card fills a flex container's cell. No padding, so an image written directly inside spans its edges |
| Card divider | `.card-divider` | `card-divider` | Structural class. `padding: $card-padding` (`$global-padding`, 1rem) and `background: $card-divider-background` (`$light-gray`); under `$global-flexbox`, `display: flex; flex: 0 1 auto`, a row flex container, so several children written in one divider sit side by side. "A title, footer or to break up content" |
| Card section | `.card-section` | `card-section` | Structural class. `padding: $card-padding`; under `$global-flexbox`, `flex: 1 0 auto`, so sections share the card's free height |
| Card image | `.card-image` | `foundation-card` | Structural class on a wrapper around an image: `min-height: 1px`, Foundation's workaround for an Internet Explorer 11 flexbox bug (space under images in a column flex container). Measured: in Chromium, Firefox, and WebKit an image written directly in the card renders at its own ratio with no space under it, at the top or the bottom of the card, and the wrapper changes nothing |
| Sizing | none | Foundation's docs | "Set the width of cards with custom css or add them into the Foundation grid": the XY Grid's cells and block grid, Foundation's classes that the consumer writes as normal classes |

Docs conventions kept or corrected: `h4` headings (kept in the stories for Foundation's look; the level follows the page outline, 1.3.1); images with no `alt` (corrected: every recipe image has one, empty where the card's text already says what it shows, 1.1.1); the `.card-image` wrapper (kept as a directive, documented as optional); `div` cards (kept, with `article` and `section` recommended where they carry meaning); the inline `style="width: 300px"` of the Basics examples (kept in stories, a value Foundation has no class for).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.card` | `NfsCard` (`[nfsCard]`), static host class | - | - | `card` | - |
| `.card-divider` | `NfsCardDivider` (`[nfsCardDivider]`), static host class | - | - | `card-divider` | - |
| `.card-section` | `NfsCardSection` (`[nfsCardSection]`), static host class | - | - | `card-section` | - |
| `.card-image` | `NfsCardImage` (`[nfsCardImage]`), static host class | - | - | `card-image` | - |
| `.grid-x`, `.grid-margin-x`, `.grid-padding-x`, `.<bp>-up-<n>`, `.cell` (another family's: the XY Grid's, with no first-milestone spec) | Normal classes the consumer writes, around or beside `nfsCard` | Foundation's global styles and settings | - | - | - |
| `.flex-container` (another family's: the Flexbox Utilities', with no first-milestone spec) | A normal class the consumer writes on the cell of the equal-height recipe | Foundation's global styles | - | `flex-container` | - |
| `.no-bullet` (another family's: the Typography Helpers', with no first-milestone spec) | A normal class the consumer writes on the list of cards | Foundation's global styles | - | `no-bullet` | - |

Variant classes: none. Foundation's card has no palette, size, or modifier class, and `$global-flexbox` is a Sass boolean, compile-time configuration and never an input (building-blocks 1.13). State classes: none. No Card class is left for the consumer to write (ADR 0039). The layout classes on and around cards (cells, the block grid, the flex helpers, `.no-bullet`) belong to families with no first-milestone spec, so the consumer writes them as normal classes beside `nfsCard`, with Foundation's global styles loaded (the class rule's exception for such a family).

### Hierarchy and DI shape

```
[nfsCard]              NfsCard          (standalone directive, no template)
  [nfsCardDivider]     NfsCardDivider   (any number, anywhere in the card)
  [nfsCardSection]     NfsCardSection   (any number)
  [nfsCardImage]       NfsCardImage     (an optional wrapper around an image)
```

- Four directives with no parent token, no queries, no providers, and no host directives; nothing injects anything. Foundation's card rules are single-class selectors, so a divider or section styles itself wherever it sits, and no behaviour links the parts. A part outside a card is harmless, because it styles only itself; the docs place dividers, sections, and image wrappers inside an `nfsCard`, where Foundation's look expects them.
- No Defaults token: the Card has no Options.
- Injection: none. A redundant Structural class written beside a directive merges with its static host class (building-blocks 1.4).
- Entry point: `ngx-foundation-sites/card` (one per Foundation docs page), exporting the four directives, so a consumer's `@defer` can split it.
- Imports (documented usage): a component imports each card directive whose attribute its template writes. A forgotten one leaves its element without its class, a plain element with no error, because no card directive has an input, unless the template references it through its `exportAs` (`#card="nfsCard"`), which then fails to compile (NG8003).

### API

`NfsCard` (`[nfsCard]`, `exportAs: 'nfsCard'`), `NfsCardDivider` (`[nfsCardDivider]`, `exportAs: 'nfsCardDivider'`), `NfsCardSection` (`[nfsCardSection]`, `exportAs: 'nfsCardSection'`), and `NfsCardImage` (`[nfsCardImage]`, `exportAs: 'nfsCardImage'`): standalone, no template, no inputs, models, outputs, or methods. Each binds its Structural class as a static host class and nothing else.

| Directive | Host binding | Foundation equivalent | Delta |
| --- | --- | --- | --- |
| `NfsCard` | static `class: 'card'` | `class="card"` | none |
| `NfsCardDivider` | static `class: 'card-divider'` | `class="card-divider"` | none |
| `NfsCardSection` | static `class: 'card-section'` | `class="card-section"` | none |
| `NfsCardImage` | static `class: 'card-image'` | `class="card-image"` | documented as optional in the Browser target (D3) |

- Attribute ownership: each directive owns its class. None touches `role`, `id`, `tabindex`, `hidden`, or `aria-*`, which stay the consumer's.
- Hosts: any element. Foundation's docs use `div`; `article`, `section`, and `li` suit a card; `header` and `footer` suit a divider only inside an `article`, `aside`, `main`, `nav`, or `section` (ARIA and keyboard); a `picture` or a `figure` suits an image wrapper (a link does not, D6).
- Composition: `nfsCard` sits beside `nfsEqualizerWatch` and Foundation's grid and flex classes on one element and binds none of those classes; its static host class merges with the classes the consumer writes. A consumer component that is always a card hosts `NfsCard` through `hostDirectives`, which carries the static host class, so its host metadata names no Foundation class.

### Comparison with Angular Material (22.2)

| Concern | Material `MatCard` | `NfsCard` |
| --- | --- | --- |
| Selector and kind | `mat-card`, a component, with directive parts `mat-card-header`, `mat-card-title`, `mat-card-subtitle`, `mat-card-content`, `mat-card-actions` (with `align`), `mat-card-footer`, `img[mat-card-image]`, the sized images, and `img[mat-card-avatar]` | `[nfsCard]` on the consumer's element, with `[nfsCardDivider]`, `[nfsCardSection]`, and `[nfsCardImage]`: Foundation's four classes, nothing more |
| Look | `appearance` (`raised`, `outlined`, `filled`), with a defaults token | Foundation's `$card-*` Sass settings; no Variant input, because Foundation has no card Variant class |
| Images | `img[mat-card-image]` stretches an image to the card's width | An image written directly in the card spans it; inside a section it keeps the section's padding (Foundation's CSS) |
| Accessibility | The docs ask the author to add `role="group"`, `role="region"`, or a landmark role when the card is a meaningful grouping, none when it is decorative, and `tabindex` when cards are the primary interaction | No role: the consumer's element carries the meaning (`article`, a named `section`, `li`); no `tabindex`: the card's controls are its links and buttons (D5) |
| Testing | `MatCardHarness` | DOM-first assertions; no harness |

Borrowed: the rule that a card's role depends on its content and is the author's, and that a decorative container needs none. Not borrowed: a component with named parts for titles, subtitles, avatars, and actions (Foundation generates nothing, ADR 0001; headings, images, and buttons are the consumer's elements), an appearance input (no Foundation class), and a focusable card (D5).

### Implementation level and primitives

Implementation level: native platform. A card is the consumer's element with Foundation's CSS, and its semantics are the element's and its content's. `@angular/aria` has no card pattern in 22.2, and `@angular/cdk` has nothing to add. The Angular layer is four static host classes; no signal, `computed`, `effect`, listener, render callback, observer, or injection.

Fallback: none needed. The risks the directives and the mixin own, contrast on the card's backgrounds, text cut off by `overflow: hidden`, and the image wrapper, were measured by this spec's ticket, the geometry in three engines.

### ARIA and keyboard

APG pattern: none. A card is a container of ordinary content; the APG has no card pattern, and a card's links and buttons follow their own.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsCard]` | The host element's own role: `generic` for a `div`, `article` for an `article`, `region` for a `section` with a name, `listitem` for a `li`; the directives add no role, name, or state | WHATWG HTML; HTML-AAM; measured in Chromium for `article` and a named `section` |
| A set of cards that is a list | A `ul` whose list items hold the cards (or carry `nfsCard` themselves), with Foundation's `.no-bullet` class for the markerless look and `role="list"`, because WebKit exposes a list without markers outside a navigation landmark as a group; measured in Chromium, the `list` and `listitem` roles stay when the list is an XY block grid | HTML-AAM; WebKit's list heuristic |
| Card title | A heading at the level the page outline needs, holding the card's link when the card leads somewhere | WCAG 1.3.1, 2.4.6 |
| `[nfsCardDivider]` on a `div` | `generic` | HTML-AAM |
| `[nfsCardDivider]` on a `header` or `footer` | `sectionheader` or `sectionfooter` inside an `article`, `aside`, `main`, `nav`, or `section` (or an element with one of their roles); elsewhere `banner` or `contentinfo`, a page landmark. Measured in Chromium: a `header` divider in a `div` card outside `main` is a `banner`, and its `footer` a `contentinfo` | HTML-AAM (`header`, `footer`) |
| Image | The consumer's `img` and its `alt`: a text alternative where the image carries information the card's text does not, `alt=""` where it repeats the text or is decoration | WCAG 1.1.1 |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches the links and controls inside the card; the card and its parts are not focusable | Native |

Focus: the directives move no focus and add no tab stop. A card that leads to one place links its heading, and a full-bleed image does not repeat the link (D6): measured in three engines with a 2 px outline, the card's `overflow: hidden` clips the part of the outline drawn outside a link written directly in the card, so an image link at the top of a card shows only its bottom edge and one at the bottom only its top edge. Links and controls inside a section or divider keep 16 px of padding around them, and their whole outline shows.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios were computed by this spec's ticket with the exact WCAG relative-luminance formula (`math.pow`) on 8-bit colours, unrounded, never Foundation's `color-luminance()` or `color-contrast()` (the [Spec: Top Bar](../issues/86-spec-top-bar.md) measured the first's false passes); axe computes from rendered colours, so its figures differ in the second decimal. Geometry was measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0. Card backgrounds on Foundation's defaults: card `#fefefe`, divider `#e6e6e6`.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.3 Contrast (Minimum) | Card text and links reach 4.5:1 on the card background and on the divider background, at rest and on hover. The pairs: `$card-font-color`, `$anchor-color`, and `$anchor-color-hover` on `$card-background` (composited over `$body-background`) and on `$card-divider-background` (composited over the card background); a consumer who changes these settings keeps every pair at 4.5:1 (D8). Required consumer setting on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%);` (`#14679e`), with its hover line where an overrides file follows Foundation's settings (D9); with it links reach 4.858:1 on the divider and 6.012:1 on the card, and the hover colour `#115888` 6.063:1 and 7.503:1. The greys Foundation's global typography styles print inside a card reach 4.5:1 on the card and on the divider too: a heading's `small` (`$header-small-font-color`), a `blockquote` and its paragraphs (`$blockquote-color`), a `cite` (`$cite-color`), and a `.subheader` the consumer writes (`$subheader-color`). Required consumer settings on Foundation's defaults: the four at `#666666`, which reaches 4.601:1 on the divider, 5.742:1 on the card, and 5.693:1 on the page (D14) | Text passes (19.630:1 on the card, 15.863:1 on the divider). Links pass on the card (4.647:1) and fail on the divider (3.755:1; axe `color-contrast` reports 3.75); the hover colour `#1468a0` passes on both (5.920 and 4.784:1). The four greys fail even on the page: `$dark-gray` (`$subheader-color`, `$cite-color`, `$blockquote-color`) 3.423:1, `$medium-gray` (`$header-small-font-color`) 1.625:1 | axe `color-contrast` in every story under the Storybook settings overrides, which carry the required settings, the four greys included; `card--divider` holds a footer link; the greys' ratios are the exact formula's, because no story holds a heading `small`, a `blockquote`, a `cite`, or a `.subheader` |
| 1.4.10 Reflow | At 320 CSS px no card content is cut off and nothing scrolls sideways: `nfs-card` sets `overflow-wrap: anywhere` on `.card`, so a word or URL wider than the card breaks inside it (D7). Foundation's `overflow: hidden`, which clips a full-bleed image to a rounded corner, stays | Fails for content Foundation's examples do not have: at 320 by 640 px a URL in a card's paragraph runs 113.8 px past the card's clip edge and is cut off in Chromium and WebKit; Firefox breaks it after a slash. Foundation's docs examples pass. axe cannot see clipped text | e2e in three engines at 320 by 640 px: in `card--long-words` and `card--sizing` every card's `scrollWidth` equals its `clientWidth`, no glyph lies past its padding box, and `document.documentElement.scrollWidth` is at most 320; node-level Sass compile test of the rule |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, no card text is cut off: the same rule breaks a word that the spacing makes wider than the card (D7) | Fails: at 320 px in the docs' two-up block grid (`small-up-2` with margin gutters, 140 px cards) an `h4` word of 13 letters, "Accessibility", runs 4.1 to 4.2 px past the clip edge in all three engines; the docs' own longest word, "appropriately", stays 4.5 px inside it. With the rule nothing is cut off in any engine, and no card changes width | e2e in three engines at 320 by 640 px with the text-spacing stylesheet: the 1.4.10 assertions hold in `card--long-words` and `card--sizing` |
| 1.1.1 Non-text Content | Every image in a card has a text alternative: the consumer's `alt`, descriptive where the image carries information the card's text does not, empty where it does not (a product photo beside the product's name, a decorative band). The image is the consumer's element and carries no library directive; the docs require the `alt` on every card image (D10), and every recipe and story image has one | Fails: no image in Foundation's card docs has `alt`; axe reports `image-alt` on each (measured) | axe `image-alt` in every story; the play functions of `card--default` and `card--images` find each informative image by `getByRole('img', {name})` |
| 1.3.1 Info and Relationships | A card's title is a heading at the page outline's level; a self-contained card is an `article`, a card that is a region a `section` named with `aria-labelledby`, a set of cards a list; a `header` or `footer` divider sits only inside an `article`, `aside`, `main`, `nav`, or `section`, so it never becomes a second page landmark (D4). The directives add no role | Foundation's docs use `div` cards and `h4` titles | axe (`heading-order`, `landmark-no-duplicate-banner`, `landmark-no-duplicate-contentinfo`, `landmark-unique`, best-practice) in every story; `card--sizing` finds its three cards by role |
| 1.3.2 Meaningful Sequence | The card's DOM order is its reading order: an image written after a section shows after it, and the recipes never reorder parts (a consumer who reorders parts with Foundation's flex order classes owns that 1.3.2 concern) | Passes | The play function of `card--images` asserts the DOM order of each card's parts |
| 2.4.7 Focus Visible | Every control in a card shows its focus indicator: a control inside a section or divider keeps its whole outline; a link written directly in the card keeps one edge of it, and the recipes do not write one (D6) | Foundation's docs have no links in cards | The play function of `card--divider` tabs to the title link and asserts its box lies at least 3 px inside the card's padding box |
| 1.4.11 Non-text Contrast | Nothing is required: a card is not a user interface component, its border (1.24:1 on the page) marks no state, and the text inside carries its information; controls inside meet 1.4.11 by their own specs | Passes | None in this library |
| 2.5.8 Target Size (Minimum) | A card is never a target; controls inside meet 2.5.8 by their own specs (the `nfs-button` floor), and a heading link is inline text, which 2.5.8 exempts | Passes | axe `target-size` in every story |
| 4.1.2 Name, Role, Value | The directives change no role, name, or state | Passes | axe in every story; play functions find elements by role and name; browser-level tests assert that no attribute is added |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). It sees the divider link and missing `alt`, but not text that the card clips, which is why 1.4.10 and 1.4.12 are e2e cases.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directives declare no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attributes (`nfscard=""`), and `NgOptimizedImage` its own image attributes (`src`, `loading`, `fetchpriority`, and the like), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Basics: an article card with a divider, a full-bleed image, and a section -->
<article nfsCard style="width: 300px;">
  <div nfsCardDivider>This is a header</div>
  <img ngSrc="/assets/rectangle-1.jpg" alt="" width="600" height="300">
  <div nfsCardSection>
    <h4>This is a card.</h4>
    <p>It has an easy to override visual style, and is appropriately subdued.</p>
  </div>
</article>

<article class="card" style="width: 300px;">
  <div class="card-divider">This is a header</div>
  <img alt="" width="600" height="300">
  <div class="card-section">
    <h4>This is a card.</h4>
    <p>It has an easy to override visual style, and is appropriately subdued.</p>
  </div>
</article>

<!-- A linked title and a footer divider; footer is a section footer inside the article -->
<article nfsCard>
  <div nfsCardSection>
    <h3><a href="/invoices">Invoices</a></h3>
    <p>Three invoices are due this week.</p>
  </div>
  <footer nfsCardDivider><a href="/invoices?due=week">View due invoices</a></footer>
</article>

<article class="card">
  <div class="card-section">...</div>
  <footer class="card-divider"><a href="/invoices?due=week">View due invoices</a></footer>
</article>

<!-- Foundation's IE 11 image wrapper, kept for migrated markup; optional in the Browser target -->
<div nfsCardImage><img ngSrc="/assets/rectangle-1.jpg" alt="The team at the spring offsite" width="600" height="300"></div>

<div class="card-image"><img alt="The team at the spring offsite" width="600" height="300"></div>
```

The images use `NgOptimizedImage` (building-blocks 1.2); no card directive sits on an image.

### Animation

None. Foundation's card partial declares no transition, and the library adds none. A card that appears or disappears with `@if` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.card`, `.card-divider`, `.card-section`, and `.card-image` exactly as the hydrated DOM does, and the consumer's content, images and their `alt` included, is in it, so the first paint is final.
- Before hydration: the directives touch no DOM outside their static host classes, measure nothing, and start no timer; there is no render callback.
- Full and incremental hydration: the host classes equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own. The controls inside a card follow their own specs' boundaries.
- Event replay: the directives declare no listener and add no `jsaction`; links inside a card keep native navigation inside dehydrated blocks, and a control's pre-hydration click replays through that control's own listener.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a card is its server HTML; inside `@defer (hydrate never)` it stays styled for good, with working native links.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, roles and names, the computed backgrounds and padding, where images and text sit against the card's edges, and the DOM order. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Callout](../issues/89-spec-callout.md)'s and [Spec: Badge](../issues/93-spec-badge.md)'s tests, the nearest precedents.

Story ids follow `card--<story>`: `card--default`, `card--divider`, `card--images`, `card--sizing`, `card--long-words`. `meta.component` is `NfsCard`; there are no args, because no directive has an input. The Storybook settings overrides already carry the required settings (the Callout's `$anchor-color` line and the four greys of D14), and the preview includes `nfs-card`. Grid scaffolding writes Foundation's XY Grid classes as normal classes (`grid-x`, `grid-margin-x`, `<bp>-up-<n>`, `cell`), the margin gutter Foundation writes on every card grid, with Foundation's global styles loaded in the preview; every story image has an `alt`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `color-contrast`, `image-alt`, `heading-order`, `landmark-unique`, and `target-size`). No story element carries a Foundation class written in the story, except the grid scaffolding's classes, whose family has no first-milestone spec.

- `card--default`: Foundation's Basics as an `article` (`style="width: 300px"`) with a divider, a full-bleed image, and a section. The card is found by `getByRole('article')` and carries `.card`; the divider's computed background is Foundation's `$card-divider-background`, the section's computed padding 16 px; the image's width equals the card's inner width; the heading is found by role and name.
- `card--divider`: Foundation's Card Divider example (an `h4` "I'm featured" in a divider) and a second `article` with a linked `h3` title in a section and a `footer` divider holding "View due invoices". Both links are found by role and name; axe passes `color-contrast` for the footer link under the preview's required `$anchor-color`; the play function tabs to the title link and asserts its box lies at least 3 px inside the card's padding box, so its outline is not clipped.
- `card--images`: Foundation's Images examples, one card each: an image directly at the top, an image inside a section, an image directly below the content, and an image inside an `nfsCardImage` wrapper, with informative `alt` on the first and last. Each direct or wrapped image's width equals its card's inner width, the in-section image's width its section's content width; each informative image is found by `getByRole('img', {name})`; each card's parts are in the DOM order written.
- `card--sizing`: Foundation's Sizing example, three `article` cards in a block grid with margin gutters (`class="grid-x grid-margin-x small-up-2 medium-up-3"`, each card in a `cell`); the three articles and their headings are found by role.
- `card--long-words`: two cards in a two-up block grid with margin gutters (`grid-margin-x`), the Card's measured 1.4.12 case, whose headings are "Internationalization" and whose paragraphs hold a long URL; each card's `scrollWidth` equals its `clientWidth`, and its computed `overflow-wrap` is `anywhere`.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host classes, driven by data: each of the four directives puts exactly its class on its host, on a `div`, an `article`, a `li`, and a `footer`; the consumer's own static class and a `[class]` binding on the same element stay; the directives add no attribute (`role`, `tabindex`, `id`, `aria-*`, and `hidden` stay as written).
- Composition: `nfsCard` beside a test directive that binds its own host class keeps both classes; a test component with `hostDirectives: [NfsCard]` renders `.card` on its host.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with the Basics card, a card with a `footer` divider holding a link, an `nfsCardImage` wrapper, and a host-directive card component. `whenStable()` resolves; the server HTML carries the four classes and the consumer's `alt` and `href` values; no element carries `jsaction` or a role from the directives.
- Sass compile, over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';`:
  - `@include nfs-card;` emits exactly `.card { overflow-wrap: anywhere; }`, and no other rule, on Foundation's defaults and with the required settings.
  - `$global-flexbox: false` emits the same rule.
- Pure logic: none.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Reflow (1.4.10) in three engines: at 320 by 640 px, in `card--long-words` and `card--sizing`, every card's `scrollWidth` equals its `clientWidth`, no glyph's box lies past the card's padding box, and `document.documentElement.scrollWidth` is at most 320.
- Text spacing (1.4.12) in three engines: the same assertions at 320 by 640 px with a stylesheet that sets line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em on every element.

Against the prerendered fixture app, on the Card route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; the cards carry their classes before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

## Out of Scope

- A card component with named parts for titles, subtitles, avatars, and actions, as Material has: Foundation has only its four classes and generates nothing (ADR 0001); headings, images, and buttons are the consumer's elements. Category: `scope-boundary`.
- An appearance, colour, or size input: Foundation's card has no Variant class, and a library class would add a family Foundation lacks. Category: `scope-boundary`.
- A default role, a role input, or `tabindex` on the card (D4, D5): the consumer's element carries the meaning, and a focusable card with no role breaks the rule that a role is a promise. Category: `platform-or-a11y`.
- A card that is itself a link or a button, or a stretched-link recipe that makes the whole card clickable (D5): Foundation has no clickable card, a link around a card names it with every word inside, and the linked title is the control; additive later. Category: `scope-boundary`.
- Typography colours other than the card's own text and link colours and the four greys: `$header-color` inherits the card's text colour; the greys of a heading `small`, a `.subheader`, a `cite`, and a `blockquote` are required settings of this spec (D14), and a later milestone's typography helper directives add nothing to them. This spec lists what Foundation's card markup and global typography styles put on its backgrounds (D8). Category: `scope-boundary`.
- The grid, cell, and block-grid classes that size cards, and the flex helpers that lay out their parts: Foundation's own classes, which the consumer writes; a later milestone adds directives for them. Category: `scope-boundary`.
- Equal-height cards and aligned card parts across a row: the [Spec: Equalizer](../issues/34-spec-equalizer.md)'s CSS answer and subgrid recipe. Category: `scope-boundary`.
- The Thumbnail look for an image inside a card section: the [Spec: Thumbnail](../issues/97-spec-thumbnail.md). Category: `scope-boundary`.
- Removing the bullets of a list of cards: Foundation's `.no-bullet`, which the list-of-cards recipe writes as a normal class, and a correction of its left margin on a margin grid, which the first milestone does not make (Usage examples); a later milestone adds both. Category: `scope-boundary`.
- Responsive image sources for card images: native `srcset` and `<picture>`, and the [Spec: Interchange](../issues/35-spec-interchange.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Four attribute directives, one per Structural class (`[nfsCard]`, `exportAs: 'nfsCard'`; `[nfsCardDivider]`, `exportAs: 'nfsCardDivider'`; `[nfsCardSection]`, `exportAs: 'nfsCardSection'`; `[nfsCardImage]`, `exportAs: 'nfsCardImage'`), each a static host class on any element; entry point `ngx-foundation-sites/card` | ADR 0001 and ADR 0039: "A card is just an element with a `.card` class applied", and Foundation generates nothing; the triage's names ([Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md)) | An `nfs-card` component with named parts, Material's shape (Foundation's markup carries the elements; ADR 0001) (`scope-boundary`); one `nfsCard` whose library CSS styles its children by descendant selectors (a second rule set for Foundation's classes; ADR 0039 has one directive per class) (`other`) |
| D2 | No Variant inputs, State classes, models, outputs, methods, Defaults token, or providers; `$global-flexbox` stays Sass | Foundation's card has no Variant or State class and no Options; Sass booleans are compile-time configuration (building-blocks 1.13) | An `appearance` input like Material's (no Foundation class to set; a library class family) (`scope-boundary`) |
| D3 | `NfsCardImage` binds `.card-image` and is documented as optional: recipes write images directly in the card | Foundation's class is a workaround for an Internet Explorer 11 flexbox bug; measured in three engines, a bare image renders at its own ratio with no space under it, at the top or the bottom of a card; the triage decided the part, and it costs one static class | Dropping the directive (migrated markup would keep a wrapper whose Foundation class has no home, against the triage's decided part) (`other`); requiring the wrapper (an element for a bug outside the Browser target) (`superseded`) |
| D4 | No role, name, ARIA, or `tabindex`; the consumer's element carries the meaning; a `header` or `footer` divider only inside an `article`, `aside`, `main`, `nav`, or `section` | A card's role depends on its content, and a decorative container needs none (Material's own guidance); measured, a `header` divider in a `div` card outside `main` is a page `banner` | A default `role="group"`, `region`, or `article` (the content decides, and a wrong landmark or group is noise) (`platform-or-a11y`) |
| D5 | A card is never a control: its controls are the links and buttons inside it, and a card that leads somewhere links its heading | "A role is a promise" (building-blocks 1.10); a heading link names the destination by the card's title; Foundation's docs never make a card a control | Material's `tabindex="0"` on a card that is the primary interaction (a focusable element with no role and no name) (`platform-or-a11y`); a whole-card link or stretched link (every word of the card becomes the link's name; additive later) (`scope-boundary`) |
| D6 | The recipes do not write a link directly in the card; a full-bleed image does not repeat the title link; both are documented usage | Measured in three engines: the card's `overflow: hidden` clips a directly written link's outline to one edge; inside a section or divider the outline shows whole; a duplicate image link adds a tab stop to the same place | A library rule that insets the outline of links in a card (`outline-offset`: styles the focus of the consumer's controls, which Foundation leaves to the browser, and 2.4.7 holds with one edge) (`other`) |
| D7 | `nfs-card` sets `overflow-wrap: anywhere` on `.card` | Measured: Foundation's `overflow: hidden` cuts off a URL at 320 px (113.8 px in Chromium and WebKit) and, with the 1.4.12 spacing, a 13-letter heading word in the docs' two-up grid (4.1 to 4.2 px in three engines); with the rule nothing is cut off and no card changes width; `anywhere` also lowers the min-content width of a table or inline block inside the card, so no descendant can outgrow the clip; the property inherits, and a consumer's own `overflow-wrap` on a descendant wins | No rule, with a content limit as the Badge's D13 (a card holds arbitrary prose and URLs; no word limit can be kept) (`other`); overriding `overflow: hidden` (Foundation clips a full-bleed image to a rounded corner with it) (`other`); `overflow-wrap: break-word` (the same breaks in every measured case, but a table or inline block keeps its longest word as its minimum width and is still cut off) (`other`); `hyphens: auto` (depends on `lang` and engine dictionaries, and rehyphenates lines that fit) (`other`); a prototyping text-wrap class on each card (a per-card step every consumer must remember, and Foundation compiles those utilities only on request) (`other`) |
| D8 | Every pair a card puts on its backgrounds reaches 4.5:1, exact and unrounded: `$card-font-color`, `$anchor-color`, and `$anchor-color-hover` on `$card-background` and on `$card-divider-background`, translucent backgrounds composited first; the spec lists the pairs and the consumer's settings keep them | ADR 0022 and building-blocks 1.10: a container's spec states what sits on its own backgrounds (the Close Button's D9, the Callout's D7); the divider is the one background Foundation's link colour fails on; a card with a tinted `$card-background` is as likely | Listing the divider only (a tinted card background would go unlisted) (`other`) |
| D9 | Required setting on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%);` | The Callout spec already requires it (the lightness of the Accordion's required title colour) and the Storybook overrides carry it; 4.858:1 on the divider, 6.012:1 on the card; one site-wide link colour | `$card-divider-background: $white;` (passes at 4.647:1, but removes the band that is the divider's only mark) (`other`); a library rule recolouring `.card-divider a` (re-implements a Foundation style, and would outrank `.button`'s colour on a link button in a divider) (`other`); the smallest passing lightness, about `-12%` (4.62:1; a second site-wide link colour beside the Callout's) (`other`) |
| D10 | No injection and no parent token: a part outside a card is harmless, and every card image's `alt` is the consumer's, which the docs require | The Card has no Variant or State class, and redundant Structural classes merge (building-blocks 1.4); a misplaced part styles only itself; the image carries no library directive, and axe `image-alt` reports a missing `alt` in the library's stories | A parent token for the parts (nothing depends on the parent, and projection hides the DI context) (`other`) |
| D11 | Native implementation level; listener-free; every class a static host class in server HTML | The element, its content, and Foundation's CSS cover everything; no render callback is needed | A focus-within State class for highlighting a card (Foundation has no such class or look) (`scope-boundary`) |
| D12 | Five stories; e2e only for 1.4.10 and 1.4.12 geometry in three engines and the fixture app's first paint and hydration | Clipping needs real engines and a 320 px viewport, and axe cannot see it; Firefox breaks URLs where Chromium and WebKit do not | A play function with an injected text-spacing stylesheet (one engine at the test runner's viewport, and it changes global state) (`other`) |
| D13 | Two glossary terms, **Card** and **Card divider** | Foundation's names; "divider" alone suggests a rule line | A term for each part (the section and the image wrapper are Foundation's classes, not domain language) (`other`) |
| D14 | Required settings on Foundation's defaults for the greys Foundation's global typography styles print inside a card: `$header-small-font-color`, `$blockquote-color`, `$cite-color`, and `$subheader-color` at `#666666` (added 2026-09-30, later-milestone families) | ADR 0022 and building-blocks 1.10: a container's spec states what sits on its own backgrounds; a heading `small`, a `blockquote`, and a `cite` are base element styles that need no helper class, so a first-milestone card shows them, and the later-milestone Typography Helpers spec that required these settings is not there to require them. `#666666` is 4.601:1 on the divider (`$light-gray`), 5.742:1 on the card, and 5.693:1 on the page, where `#737373` (4.701:1 on the page) is 3.799:1 on the divider; the ratios were measured for the Typography Helpers spec with the exact formula | Leaving the requirement to the later milestone (a first-milestone card divider would show failing greys) (`other`); `#737373`, the page's minimum (fails on the divider) (`other`) |

### Usage examples

```html
<!-- A set of cards that is a list, each an article with a linked title; no-bullet removes the markers and the list indent, role="list" keeps it a list in WebKit, and the gutters are padding gutters (see below) -->
<ul class="grid-x grid-padding-x small-up-1 medium-up-3 no-bullet" role="list">
  <li class="cell">
    <article nfsCard>
      <img ngSrc="/menus/winter.jpg" alt="" width="600" height="300">
      <div nfsCardSection>
        <h3><a href="/menus/winter">Winter menu</a></h3>
        <p>Seasonal dishes from local farms.</p>
      </div>
    </article>
  </li>
</ul>

<!-- A named region with a header divider inside the section, so the header stays a section header -->
<section nfsCard aria-labelledby="plan-title">
  <header nfsCardDivider><h2 id="plan-title">Your plan</h2></header>
  <div nfsCardSection><p>Pro, renewed on 1 March.</p></div>
  <footer nfsCardDivider><a href="/billing">Change plan</a></footer>
</section>

<!-- Equal-height cards in a row: Foundation's flex-container class on the cell -->
<div class="grid-x grid-margin-x small-up-1 medium-up-2">
  <div class="cell flex-container"><article nfsCard>...</article></div>
  <div class="cell flex-container"><article nfsCard>...</article></div>
</div>
```

```ts
@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage, NfsCardSection],
  hostDirectives: [NfsCard],
  template: `
    <img [ngSrc]="product().image" width="600" height="300" alt="" />
    <div nfsCardSection>
      <h3><a [href]="product().url">{{ product().name }}</a></h3>
      <p>{{ product().summary }}</p>
    </div>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
}
```

`<app-product-card>` renders `class="card"` from the hosted directive, so its host metadata names no Foundation class; the product photo's `alt` is empty because the linked name beside it says what it shows. The grid classes, `flex-container`, and `no-bullet` are Foundation's own, written as normal classes with Foundation's global styles loaded; their families have no first-milestone spec. The list of cards uses padding gutters because Foundation's `ul.no-bullet` sets `margin-left: 0` at one class and one element, which outranks the negative left margin of `.grid-margin-x` (one class), so a margin-gutter list of cards would move half a gutter to the right; a padding grid list only loses the list indent, which is what `.no-bullet` is for. A consumer who needs margin gutters on a list of cards writes its own Application class on the list that restores the grid's negative left margin (-10 px, then -15 px from medium, on Foundation's defaults), at a specificity above `ul.no-bullet`; a later milestone adds a library correction for it.

### Platform features to adopt when the browser target moves

- Nothing in the platform research applies: the directives bind static classes, and `overflow-wrap: anywhere` is in the Browser target.

### Foundation behaviour changed or dropped

- A word or URL wider than a card breaks inside it instead of being cut off (D7). Under the 1.4.12 text spacing at 320 px, the docs Sizing example's "appropriately", which Foundation lets run past the section's content box into its padding, breaks as "appropriate" and "ly" in all three engines (measured).
- On Foundation's defaults, the spec requires an `$anchor-color` that passes on the divider, so links on the whole site become `#14679e`, the colour the Callout spec already requires (D9), and the four typography greys become `#666666` site-wide, as the Callout spec requires too (D14).
- Every image in the recipes has an `alt` (1.1.1); `.card-image` is optional (D3).
- `header` and `footer` dividers go only inside a sectioning element or `main` (D4).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-card`, configured through the `$card-*` settings and `$global-flexbox`. Its documented custom CSS is the `nfs-card` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-card`.

1. Rules. (a) `.card { overflow-wrap: anywhere; }`. Reason: WCAG 2.2 success criteria 1.4.10 and 1.4.12; Foundation's `.card` clips with `overflow: hidden`, which it needs for full-bleed images under a border radius, and has no setting that keeps a word wider than the card inside it (D7). The selector equals Foundation's and adds one declaration Foundation does not set, so the Equalizer's `.card-row > article` recipe still outranks `.card` for `display`.
2. Reused, read from the consumer's compile: nothing; the rule reads no setting. No Foundation value is copied. The mixin takes no parameters.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: a word wider than a card is cut off again, silently, because axe cannot see clipped text; `card--long-words` catches it in the library's own CI. The include is required wherever `nfsCard` is used.
6. Variant properties: none; the Card has no Variant class.

Required settings on Foundation's defaults, which the Storybook settings overrides already carry for the Callout:

```scss
$anchor-color: scale-color($primary-color, $lightness: -15%);
$anchor-color-hover: scale-color($anchor-color, $lightness: -14%);
// Foundation's typography greys inside a card (D14): #666666 is 4.601:1 on the divider
$header-small-font-color: #666666; // $medium-gray is 1.625:1 on the page
$blockquote-color: #666666; // $dark-gray is 3.423:1 on the page
$cite-color: #666666;
$subheader-color: #666666;
```

A consumer who edits `$anchor-color` in its own copy of Foundation's settings file gets the hover line for free, because that file computes `$anchor-color-hover` from `$anchor-color`. For the Card alone the hover line is not needed (Foundation's `#1468a0` passes on both backgrounds), but the Callout needs it.

### Notes

- RTL: nothing flips; the rule and the classes are direction-free, and no `Directionality` is read.
- Forced colours: measured in Chromium and Firefox, the card's border takes CanvasText, its background and the divider's background take Canvas, text takes CanvasText, and links LinkText, so the card's boundary stays and the divider's band disappears; the divider's content, a heading or a link, carries its meaning. No rule is needed.
- `$global-flexbox: false` makes the card and divider blocks; the rule is the same.
- A divider is a row flex container under `$global-flexbox`, so two elements written in one divider sit side by side; Foundation's docs write one element per divider, and so do the recipes.
- An image inside a card section that takes Foundation's Thumbnail look carries the Thumbnail's own `nfsThumbnail` ([Spec: Thumbnail](../issues/97-spec-thumbnail.md)); a linked one carries it on the link around the image; the card adds nothing to it.
- Composition: `nfsCard` beside `nfsEqualizerWatch` and Foundation's grid and flex classes binds none of those classes; the Equalizer's subgrid recipe replaces the card's `display` from the consumer's own selector, and `nfs-card` sets no `display`.
- Other Foundation containers that clip with `overflow: hidden` (the XY Grid's frame, Orbit, Drilldown, the off-canvas wrappers, the Responsive Embed) can cut off text in the same way; their specs decide whether it can happen there, the XY Grid's in a later milestone. The [Spec: Responsive Embed](../issues/96-spec-responsive-embed.md) measured its box: it cuts off an `<object>`'s long fallback text and the whole focus outline of a focused video, and its Library mixin releases the clip while the box holds focus.
