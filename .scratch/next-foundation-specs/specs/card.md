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
- Under the library's class rule the developer writes no Foundation class at all, so `.card`, `.card-divider`, `.card-section`, and `.card-image` need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the card styled before hydration and inside dehydrated `@defer` blocks.

## Solution

Four attribute directives, one per Structural class, on the elements the developer already writes: `nfsCard` binds `.card`, `nfsCardDivider` binds `.card-divider`, `nfsCardSection` binds `.card-section`, and `nfsCardImage` binds `.card-image`. Each is a static host class and nothing else: no input, no role, no listener, and nothing injected, so the server HTML is the final DOM. The card's meaning comes from the element the developer picks (`article` for a self-contained item, a named `section` for a region, a list item in a list), and its controls are the links and buttons inside it; the recipes link the card's heading, give every image an `alt`, and write images directly in the card without the optional wrapper.

The `nfs-card` Library mixin adds one rule, `.card { overflow-wrap: anywhere; }`, so a word wider than the card breaks inside it instead of being cut off, and stops the compile when the card's text colour or a link colour (`$anchor-color`, `$anchor-color-hover`) falls under 4.5:1 on the card background or the divider background, naming the setting, the background, and the ratio. On Foundation's defaults that asks for one setting that the Callout spec already requires: `$anchor-color: scale-color($primary-color, $lightness: -15%);` (4.858:1 on the divider).

## User Stories

1. As an application developer, I want to put `nfsCard` on a `div`, `article`, `section`, or `li` and get Foundation's `.card` look, so that I write no Foundation class.
2. As an application developer, I want `nfsCardDivider` for a title band, a footer band, or a break between parts, so that I get Foundation's shaded divider without writing `.card-divider`.
3. As an application developer, I want `nfsCardSection` for padded content, so that I get Foundation's traditional card look.
4. As an application developer, I want to write an image directly in the card to span its edges, or inside a section to keep padding around it, as Foundation's docs show, so that images need no directive.
5. As an application developer migrating Foundation markup with a `.card-image` wrapper, I want `nfsCardImage` for it, so that the wrapper keeps Foundation's class without my writing it.
6. As an application developer, I want the docs to tell me the wrapper is optional in the browsers the library supports, so that I do not add elements for a bug those browsers do not have.
7. As an application developer, I want the card directives to add no role, so that the element I pick decides what a card is.
8. As an application developer, I want `nfsCard` to work beside the XY Grid, Flexbox Utilities, and Equalizer directives on one element, so that cards take part in Foundation's layouts.
9. As an application developer, I want my own card component to host `NfsCard` through `hostDirectives`, so that its host metadata names no Foundation class.
10. As an application developer, I want `NgOptimizedImage` to work on a card's image, so that card images are optimised like every other image.
11. As an application developer, I want the library's Sass to stop my build when my card's text or links fall under 4.5:1 on the card or divider background, naming the setting, the background, and the ratio, so that a theme cannot fail silently.
12. As an application developer on Foundation's defaults, I want the spec to name the one setting that passes, so that I fix the compile error with the line other components already need.
13. As an application developer with a translucent divider background, I want the check to composite it over the card background, so that the ratio it reports is the one users see.
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
| Sizing | none | Foundation's docs | "Set the width of cards with custom css or add them into the Foundation grid": the XY Grid's cells and block grid, set by that spec's directives |

Docs conventions kept or corrected: `h4` headings (kept in the stories for Foundation's look; the level follows the page outline, 1.3.1); images with no `alt` (corrected: every recipe image has one, empty where the card's text already says what it shows, 1.1.1); the `.card-image` wrapper (kept as a directive, documented as optional); `div` cards (kept, with `article` and `section` recommended where they carry meaning); the inline `style="width: 300px"` of the Basics examples (kept in stories, a value Foundation has no class for).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.card` | `NfsCard` (`[nfsCard]`), static host class | - | - | `card` | - |
| `.card-divider` | `NfsCardDivider` (`[nfsCardDivider]`), static host class | - | - | `card-divider` | - |
| `.card-section` | `NfsCardSection` (`[nfsCardSection]`), static host class | - | - | `card-section` | - |
| `.card-image` | `NfsCardImage` (`[nfsCardImage]`), static host class | - | - | `card-image` | - |
| `.grid-x`, `.grid-margin-x`, `.<bp>-up-<n>`, `.cell` (another family's: the XY Grid's) | `NfsGridX` with its `gridMarginX` and `up` Variant inputs, and `NfsCell`, around or beside `nfsCard` | The [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s types and settings | - | - | - |
| `.flex-container` (another family's: the Flexbox Utilities') | `NfsFlexContainer` on the cell of the equal-height recipe | The [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s | - | `flex-container` | - |
| `.no-bullet` (another family's: the Typography Helpers') | `NfsNoBullet` (`ul[nfsNoBullet]`) on the list of cards | The [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s | - | `no-bullet` | - |

Variant classes: none. Foundation's card has no palette, size, or modifier class, and `$global-flexbox` is a Sass boolean, compile-time configuration and never an input (building-blocks 1.13). State classes: none. No class is left for the consumer to write (ADR 0039). The layout classes on and around cards (cells, the block grid, the flex helpers) belong to the XY Grid's and Flexbox Utilities' directives, written beside `nfsCard`.

### Hierarchy and DI shape

```
[nfsCard]              NfsCard          (standalone directive, no template)
  [nfsCardDivider]     NfsCardDivider   (any number, anywhere in the card)
  [nfsCardSection]     NfsCardSection   (any number)
  [nfsCardImage]       NfsCardImage     (an optional wrapper around an image)
```

- Four directives with no parent token, no queries, no providers, and no host directives; nothing injects anything. Foundation's card rules are single-class selectors, so a divider or section styles itself wherever it sits, and no behaviour links the parts. A part outside a card is not reported: it is harmless, and a part projected into a card from another template would carry that template's DI context (building-blocks 1.9).
- No Defaults token: the Card has no Options.
- Injection: none. In development builds each directive's only code is its `nfsDirectiveCheck` call (In-family checks, below). There is no copied-class check, because the Card has no Variant or State class to strip and a redundant Structural class merges with the static host class (building-blocks 1.4), and no Runtime check, because there is no Variant property.
- Entry point: `ngx-foundation-sites/card` (one per Foundation docs page), exporting the four directives, so a consumer's `@defer` can split it.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsCard` calls `nfsDirectiveCheck('NfsCard', {children: ['NfsCardDivider', 'NfsCardSection', 'NfsCardImage']})` and probes its three parts, a nested card keeping its own; `NfsCardDivider`, `NfsCardSection`, and `NfsCardImage` each call `nfsDirectiveCheck` with their class name and probe nothing. No part has a parent check, because none injects a parent: a part outside a card is legal and not reported (above), so a forgotten `NfsCard` around imported parts is the `strictDirectiveImports` check's report and the static check's. No part has a peer linked by reference or value, and `strictParents` changes nothing. The entry point imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` for this call alone; the call sits behind the inline `ngDevMode` guard, so a production build keeps nothing of it.

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
- Composition: `nfsCard` sits beside `nfsEqualizerWatch`, the XY Grid's cell directive, and the Flexbox Utilities' directives on one element and binds nothing they bind. A consumer component that is always a card hosts `NfsCard` through `hostDirectives`, which carries the static host class, so its host metadata names no Foundation class.

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

Implementation level: native platform. A card is the consumer's element with Foundation's CSS, and its semantics are the element's and its content's. `@angular/aria` has no card pattern in 22.2, and `@angular/cdk` has nothing to add. The Angular layer is four static host classes; no signal, `computed`, `effect`, listener, render callback, observer, or injection, outside the development-only `nfsDirectiveCheck` call, whose render callback on `NfsCard` probes its parts (Hierarchy and DI shape).

Fallback: none needed. The risks the directives and the mixin own, contrast on the card's backgrounds, text cut off by `overflow: hidden`, and the image wrapper, were measured by this spec's ticket, the geometry in three engines.

### ARIA and keyboard

APG pattern: none. A card is a container of ordinary content; the APG has no card pattern, and a card's links and buttons follow their own.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsCard]` | The host element's own role: `generic` for a `div`, `article` for an `article`, `region` for a `section` with a name, `listitem` for a `li`; the directives add no role, name, or state | WHATWG HTML; HTML-AAM; measured in Chromium for `article` and a named `section` |
| A set of cards that is a list | A `ul` whose list items hold the cards (or carry `nfsCard` themselves), with `nfsNoBullet` for Foundation's markerless look and `role="list"`, because WebKit exposes a list without markers outside a navigation landmark as a group ([Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)); measured in Chromium, the `list` and `listitem` roles stay when the list is an XY block grid | HTML-AAM; WebKit's list heuristic |
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
| 1.4.3 Contrast (Minimum) | Card text and links reach 4.5:1 on the card background and on the divider background, at rest and on hover. The pairs: `$card-font-color`, `$anchor-color`, and `$anchor-color-hover` on `$card-background` (composited over `$body-background`) and on `$card-divider-background` (composited over the card background). `nfs-card` stops the compile with one `@error` naming each failing setting, background, and ratio (D8). Required consumer setting on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%);` (`#14679e`), with its hover line where an overrides file follows Foundation's settings (D9); with it links reach 4.858:1 on the divider and 6.012:1 on the card, and the hover colour `#115888` 6.063:1 and 7.503:1 | Text passes (19.630:1 on the card, 15.863:1 on the divider). Links pass on the card (4.647:1) and fail on the divider (3.755:1; axe `color-contrast` reports 3.75); the hover colour `#1468a0` passes on both (5.920 and 4.784:1) | Node-level Sass compile test; axe `color-contrast` in every story under the Storybook settings overrides, which carry the required setting; `card--divider` holds a footer link |
| 1.4.10 Reflow | At 320 CSS px no card content is cut off and nothing scrolls sideways: `nfs-card` sets `overflow-wrap: anywhere` on `.card`, so a word or URL wider than the card breaks inside it (D7). Foundation's `overflow: hidden`, which clips a full-bleed image to a rounded corner, stays | Fails for content Foundation's examples do not have: at 320 by 640 px a URL in a card's paragraph runs 113.8 px past the card's clip edge and is cut off in Chromium and WebKit; Firefox breaks it after a slash. Foundation's docs examples pass. axe cannot see clipped text | e2e in three engines at 320 by 640 px: in `card--long-words` and `card--sizing` every card's `scrollWidth` equals its `clientWidth`, no glyph lies past its padding box, and `document.documentElement.scrollWidth` is at most 320; node-level Sass compile test of the rule |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, no card text is cut off: the same rule breaks a word that the spacing makes wider than the card (D7) | Fails: at 320 px in the docs' two-up block grid (`small-up-2` with margin gutters, 140 px cards) an `h4` word of 13 letters, "Accessibility", runs 4.1 to 4.2 px past the clip edge in all three engines; the docs' own longest word, "appropriately", stays 4.5 px inside it. With the rule nothing is cut off in any engine, and no card changes width | e2e in three engines at 320 by 640 px with the text-spacing stylesheet: the 1.4.10 assertions hold in `card--long-words` and `card--sizing` |
| 1.1.1 Non-text Content | Every image in a card has a text alternative: the consumer's `alt`, descriptive where the image carries information the card's text does not, empty where it does not (a product photo beside the product's name, a decorative band). The image is the consumer's element and carries no library directive, and axe `image-alt` reports a missing `alt` on every run, so the library adds no check (D10); every recipe and story image has one | Fails: no image in Foundation's card docs has `alt`; axe reports `image-alt` on each (measured) | axe `image-alt` in every story; the play functions of `card--default` and `card--images` find each informative image by `getByRole('img', {name})` |
| 1.3.1 Info and Relationships | A card's title is a heading at the page outline's level; a self-contained card is an `article`, a card that is a region a `section` named with `aria-labelledby`, a set of cards a list; a `header` or `footer` divider sits only inside an `article`, `aside`, `main`, `nav`, or `section`, so it never becomes a second page landmark (D4). The directives add no role | Foundation's docs use `div` cards and `h4` titles | axe (`heading-order`, `landmark-no-duplicate-banner`, `landmark-no-duplicate-contentinfo`, `landmark-unique`, best-practice) in every story; `card--sizing` finds its three cards by role |
| 1.3.2 Meaningful Sequence | The card's DOM order is its reading order: an image written after a section shows after it, and the recipes never reorder parts (reordering through the Flexbox Utilities' order input is that spec's 1.3.2 concern) | Passes | The play function of `card--images` asserts the DOM order of each card's parts |
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
- Before hydration: the directives touch no DOM outside their static host classes, measure nothing, and start no timer; there is no render callback in production builds, and `NfsCard`'s development In-family callback runs only after a client render.
- Full and incremental hydration: the host classes equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own. The controls inside a card follow their own specs' boundaries.
- Event replay: the directives declare no listener and add no `jsaction`; links inside a card keep native navigation inside dehydrated blocks, and a control's pre-hydration click replays through that control's own listener.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a card is its server HTML; inside `@defer (hydrate never)` it stays styled for good, with working native links.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, roles and names, the computed backgrounds and padding, where images and text sit against the card's edges, and the DOM order. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Callout](../issues/89-spec-callout.md)'s and [Spec: Badge](../issues/93-spec-badge.md)'s tests, the nearest precedents.

Story ids follow `card--<story>`: `card--default`, `card--divider`, `card--images`, `card--sizing`, `card--long-words`. `meta.component` is `NfsCard`; there are no args, because no directive has an input. The Storybook settings overrides already carry the required setting (the Callout's `$anchor-color` line), and the preview includes `nfs-card`. Grid scaffolding uses the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s `nfsGridX`, `nfsCell`, `up`, and `gridMarginX`, the margin gutter Foundation writes on every card grid; every story image has an `alt`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `color-contrast`, `image-alt`, `heading-order`, `landmark-unique`, and `target-size`). No story element carries a Foundation class written in the story.

- `card--default`: Foundation's Basics as an `article` (`style="width: 300px"`) with a divider, a full-bleed image, and a section. The card is found by `getByRole('article')` and carries `.card`; the divider's computed background is Foundation's `$card-divider-background`, the section's computed padding 16 px; the image's width equals the card's inner width; the heading is found by role and name.
- `card--divider`: Foundation's Card Divider example (an `h4` "I'm featured" in a divider) and a second `article` with a linked `h3` title in a section and a `footer` divider holding "View due invoices". Both links are found by role and name; axe passes `color-contrast` for the footer link under the preview's required `$anchor-color`; the play function tabs to the title link and asserts its box lies at least 3 px inside the card's padding box, so its outline is not clipped.
- `card--images`: Foundation's Images examples, one card each: an image directly at the top, an image inside a section, an image directly below the content, and an image inside an `nfsCardImage` wrapper, with informative `alt` on the first and last. Each direct or wrapped image's width equals its card's inner width, the in-section image's width its section's content width; each informative image is found by `getByRole('img', {name})`; each card's parts are in the DOM order written.
- `card--sizing`: Foundation's Sizing example, three `article` cards in a block grid with margin gutters (`nfsGridX` with `gridMarginX` and `[up]="{small: 2, medium: 3}"`, each card in an `nfsCell`); the three articles and their headings are found by role.
- `card--long-words`: two cards in a two-up block grid with margin gutters (`gridMarginX`), the Card's measured 1.4.12 case, whose headings are "Internationalization" and whose paragraphs hold a long URL; each card's `scrollWidth` equals its `clientWidth`, and its computed `overflow-wrap` is `anywhere`.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host classes, driven by data: each of the four directives puts exactly its class on its host, on a `div`, an `article`, a `li`, and a `footer`; the consumer's own static class and a `[class]` binding on the same element stay; the directives add no attribute (`role`, `tabindex`, `id`, `aria-*`, and `hidden` stay as written).
- Composition: `nfsCard` beside a test directive that binds its own host class keeps both classes; a test component with `hostDirectives: [NfsCard]` renders `.card` on its host.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with the Basics card, a card with a `footer` divider holding a link, an `nfsCardImage` wrapper, and a host-directive card component. `whenStable()` resolves; the server HTML carries the four classes and the consumer's `alt` and `href` values; no element carries `jsaction` or a role from the directives.
- Sass compile, over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';`:
  - Foundation's defaults plus `@include nfs-card;` stop with one `@error` naming `$anchor-color` `#1779ba` on `$card-divider-background` `#e6e6e6` at 3.755:1, and no other pair.
  - With the required setting the include compiles and emits exactly `.card { overflow-wrap: anywhere; }`, and no other rule; so does the `$anchor-color` line alone, because Foundation's hover colour passes on both backgrounds.
  - `$card-divider-background: $white;` alone compiles (the rejected alternative of D9, 4.647:1).
  - With the required setting, `$card-background: $dark-gray;` stops naming `$anchor-color` (1.756:1) and `$anchor-color-hover` (2.191:1) on `$card-background`, and not `$card-font-color`, which passes.
  - With the required setting, `$card-divider-background: rgba(#1779ba, 0.3);` is composited over the card background and stops naming `$anchor-color` at 4.004:1; `rgba(#0a0a0a, 0.1)` compiles.
  - `$global-flexbox: false` with the required setting emits the same rule.
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
- A development check for missing `alt` on card images (D10): axe `image-alt` reports it on every run, and the image carries no library directive. Category: `platform-or-a11y`.
- A development check for `header` or `footer` dividers outside a sectioning element (D4): axe's best-practice landmark rules report the second banner or content information. Category: `platform-or-a11y`.
- Checks of typography colours other than the card's own text and link colours: `$header-color` inherits the card's text colour, and the greys of a heading `small`, a subheader, a `cite`, or a `blockquote` are the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s, checked on the page only; that spec requires them to reach 4.5:1 on the card divider (`$card-divider-background`, `$light-gray`) too and sets them to `#666666` on Foundation's defaults, which does (4.601:1), while `nfs-card` checks what Foundation's card markup puts on its backgrounds (D8). Category: `scope-boundary`.
- The grid, cell, and block-grid classes that size cards, and the flex helpers that lay out their parts: the [Spec: XY Grid](../issues/99-spec-xy-grid.md) and the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md). Category: `scope-boundary`.
- Equal-height cards and aligned card parts across a row: the [Spec: Equalizer](../issues/34-spec-equalizer.md)'s CSS answer and subgrid recipe. Category: `scope-boundary`.
- The Thumbnail look for an image inside a card section: the [Spec: Thumbnail](../issues/97-spec-thumbnail.md). Category: `scope-boundary`.
- Removing the bullets of a list of cards (`.no-bullet`): the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s `nfsNoBullet`, which the list-of-cards recipe uses. Category: `scope-boundary`.
- Responsive image sources for card images: native `srcset` and `<picture>`, and the [Spec: Interchange](../issues/35-spec-interchange.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Four attribute directives, one per Structural class (`[nfsCard]`, `exportAs: 'nfsCard'`; `[nfsCardDivider]`, `exportAs: 'nfsCardDivider'`; `[nfsCardSection]`, `exportAs: 'nfsCardSection'`; `[nfsCardImage]`, `exportAs: 'nfsCardImage'`), each a static host class on any element; entry point `ngx-foundation-sites/card` | ADR 0001 and ADR 0039: "A card is just an element with a `.card` class applied", and Foundation generates nothing; the triage's names ([Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md)) | An `nfs-card` component with named parts, Material's shape (Foundation's markup carries the elements; ADR 0001) (`scope-boundary`); one `nfsCard` whose library CSS styles its children by descendant selectors (a second rule set for Foundation's classes; ADR 0039 has one directive per class) (`other`) |
| D2 | No Variant inputs, State classes, Runtime check, models, outputs, methods, Defaults token, or providers; `$global-flexbox` stays Sass | Foundation's card has no Variant or State class and no Options; Sass booleans are compile-time configuration (building-blocks 1.13) | An `appearance` input like Material's (no Foundation class to set; a library class family) (`scope-boundary`) |
| D3 | `NfsCardImage` binds `.card-image` and is documented as optional: recipes write images directly in the card | Foundation's class is a workaround for an Internet Explorer 11 flexbox bug; measured in three engines, a bare image renders at its own ratio with no space under it, at the top or the bottom of a card; the triage decided the part, and it costs one static class | Dropping the directive (migrated markup would keep a wrapper whose Foundation class has no home, against the triage's decided part) (`other`); requiring the wrapper (an element for a bug outside the Browser target) (`superseded`) |
| D4 | No role, name, ARIA, or `tabindex`; the consumer's element carries the meaning; a `header` or `footer` divider only inside an `article`, `aside`, `main`, `nav`, or `section` | A card's role depends on its content, and a decorative container needs none (Material's own guidance); measured, a `header` divider in a `div` card outside `main` is a page `banner` | A default `role="group"`, `region`, or `article` (the content decides, and a wrong landmark or group is noise) (`platform-or-a11y`); a development check for landmark dividers (axe's best-practice landmark rules report duplicates) (`platform-or-a11y`) |
| D5 | A card is never a control: its controls are the links and buttons inside it, and a card that leads somewhere links its heading | "A role is a promise" (building-blocks 1.10); a heading link names the destination by the card's title; Foundation's docs never make a card a control | Material's `tabindex="0"` on a card that is the primary interaction (a focusable element with no role and no name) (`platform-or-a11y`); a whole-card link or stretched link (every word of the card becomes the link's name; additive later) (`scope-boundary`) |
| D6 | The recipes do not write a link directly in the card; a full-bleed image does not repeat the title link; documented, not checked | Measured in three engines: the card's `overflow: hidden` clips a directly written link's outline to one edge; inside a section or divider the outline shows whole; a duplicate image link adds a tab stop to the same place | A library rule that insets the outline of links in a card (`outline-offset`: styles the focus of the consumer's controls, which Foundation leaves to the browser, and 2.4.7 holds with one edge) (`other`); a development warning for a link written directly in the card (a content choice that leaves a visible indicator) (`other`) |
| D7 | `nfs-card` sets `overflow-wrap: anywhere` on `.card` | Measured: Foundation's `overflow: hidden` cuts off a URL at 320 px (113.8 px in Chromium and WebKit) and, with the 1.4.12 spacing, a 13-letter heading word in the docs' two-up grid (4.1 to 4.2 px in three engines); with the rule nothing is cut off and no card changes width; `anywhere` also lowers the min-content width of a table or inline block inside the card, so no descendant can outgrow the clip; the property inherits, and a consumer's own `overflow-wrap` on a descendant wins | No rule, with a content limit as the Badge's D13 (a card holds arbitrary prose and URLs; no word limit can be kept) (`other`); overriding `overflow: hidden` (Foundation clips a full-bleed image to a rounded corner with it) (`other`); `overflow-wrap: break-word` (the same breaks in every measured case, but a table or inline block keeps its longest word as its minimum width and is still cut off) (`other`); `hyphens: auto` (depends on `lang` and engine dictionaries, and rehyphenates lines that fit) (`other`); the Prototyping Utilities' text-wrap directive on each card (a per-card step every consumer must remember, and those utilities are compiled only on request) (`other`) |
| D8 | `nfs-card` stops the compile with one `@error` listing every pair under 4.5:1: `$card-font-color`, `$anchor-color`, and `$anchor-color-hover` on `$card-background` and on `$card-divider-background`, translucent backgrounds composited first, exact and unrounded | ADR 0022 and building-blocks 1.10: a container checks what sits on its own backgrounds (the Close Button's D9, the Callout's D7); the divider is the one background Foundation's link colour fails on; a card with a tinted `$card-background` is as likely | `@warn` (a consumer on Foundation's defaults would ship failing divider links wherever a page puts one) (`platform-or-a11y`); checking the divider only (a tinted card background would go unchecked) (`other`); a mixin parameter that skips the link check for sites without divider links (additive later, as the Callout's D15) (`other`) |
| D9 | Required setting on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%);` | The Callout spec already requires it (the lightness of the Accordion's required title colour) and the Storybook overrides carry it; 4.858:1 on the divider, 6.012:1 on the card; one site-wide link colour | `$card-divider-background: $white;` (passes at 4.647:1, but removes the band that is the divider's only mark) (`other`); a library rule recolouring `.card-divider a` (re-implements a Foundation style, and would outrank `.button`'s colour on a link button in a divider) (`other`); the smallest passing lightness, about `-12%` (4.62:1; a second site-wide link colour beside the Callout's) (`other`) |
| D10 | No development checks of its own and no injection: no copied-class check, no placement check, no `alt` check; only the In-family checks' `nfsDirectiveCheck` call, which every library directive makes (ADR 0046) | The Card has no Variant or State class to strip, and redundant Structural classes merge (building-blocks 1.4); a misplaced part is harmless; axe `image-alt` reports a missing `alt` on every run | An `alt` check over the card's images (the image carries no library directive, and a walk over the card's content duplicates axe) (`platform-or-a11y`); a parent token with a warning for a part outside a card (nothing depends on the parent, and projection hides the DI context) (`other`) |
| D11 | Native implementation level; listener-free; every class a static host class in server HTML | The element, its content, and Foundation's CSS cover everything; no render callback is needed | A focus-within State class for highlighting a card (Foundation has no such class or look) (`scope-boundary`) |
| D12 | Five stories; e2e only for 1.4.10 and 1.4.12 geometry in three engines and the fixture app's first paint and hydration | Clipping needs real engines and a 320 px viewport, and axe cannot see it; Firefox breaks URLs where Chromium and WebKit do not | A play function with an injected text-spacing stylesheet (one engine at the test runner's viewport, and it changes global state) (`other`) |
| D13 | Two glossary terms, **Card** and **Card divider** | Foundation's names; "divider" alone suggests a rule line | A term for each part (the section and the image wrapper are Foundation's classes, not domain language) (`other`) |

### Usage examples

```html
<!-- A set of cards that is a list, each an article with a linked title; nfsNoBullet removes the markers and the list indent, and role="list" keeps it a list in WebKit -->
<ul nfsGridX gridMarginX [up]="{small: 1, medium: 3}" nfsNoBullet role="list">
  <li nfsCell>
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

<!-- Equal-height cards in a row: the Flexbox Utilities' container on the cell -->
<div nfsGridX gridMarginX [up]="{small: 1, medium: 2}">
  <div nfsCell nfsFlexContainer><article nfsCard>...</article></div>
  <div nfsCell nfsFlexContainer><article nfsCard>...</article></div>
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

`<app-product-card>` renders `class="card"` from the hosted directive, so its host metadata names no Foundation class; the product photo's `alt` is empty because the linked name beside it says what it shows. `nfsGridX`, `nfsCell`, `up`, and `gridMarginX` are the [Spec: XY Grid](../issues/99-spec-xy-grid.md)'s; `nfsFlexContainer` is the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s; `nfsNoBullet` is the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s.

### Platform features to adopt when the browser target moves

- Nothing in the platform research applies: the directives bind static classes, and `overflow-wrap: anywhere` is in the Browser target.

### Foundation behaviour changed or dropped

- A word or URL wider than a card breaks inside it instead of being cut off (D7). Under the 1.4.12 text spacing at 320 px, the docs Sizing example's "appropriately", which Foundation lets run past the section's content box into its padding, breaks as "appropriate" and "ly" in all three engines (measured).
- On Foundation's defaults, `nfs-card` stops the compile until `$anchor-color` passes on the divider, so links on the whole site become `#14679e`, the colour the Callout spec already requires (D9).
- Every image in the recipes has an `alt` (1.1.1); `.card-image` is optional (D3).
- `header` and `footer` dividers go only inside a sectioning element or `main` (D4).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-card`, configured through the `$card-*` settings and `$global-flexbox`. Its documented custom CSS is the `nfs-card` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-card`.

1. Rules. (a) `.card { overflow-wrap: anywhere; }`. Reason: WCAG 2.2 success criteria 1.4.10 and 1.4.12; Foundation's `.card` clips with `overflow: hidden`, which it needs for full-bleed images under a border radius, and has no setting that keeps a word wider than the card inside it (D7). The selector equals Foundation's and adds one declaration Foundation does not set, so the Equalizer's `.card-row > article` recipe still outranks `.card` for `display`. (b) Compile-time checks that emit no CSS, D8: one `@error` listing every failing pair, each with the setting, its colour, the background setting, its colour, and the ratio, computed by the library's exact relative-luminance helper (`math.pow`), unrounded, never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal (building-blocks 1.10): `$card-font-color`, `$anchor-color`, and `$anchor-color-hover`, each against `$card-background` composited over `$body-background` and against `$card-divider-background` composited over that card background, under 4.5:1.
2. Reused, read from the consumer's compile: `$card-background`, `$card-divider-background`, `$card-font-color`, `$anchor-color`, `$anchor-color-hover`, `$body-background`. No Foundation value is copied; 4.5 is WCAG's number. The mixin takes no parameters.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: a word wider than a card is cut off again, silently, because axe cannot see clipped text; the checks do not run, so a divider link at 3.755:1 compiles and is reported only where axe renders one. No Runtime check reports the missing include, because the Card writes no Variant property; `card--long-words` and `card--divider` catch it in the library's own CI.
6. Variant properties: none; the Card has no Variant class.

Required setting on Foundation's defaults, which the Storybook settings overrides already carry for the Callout:

```scss
$anchor-color: scale-color($primary-color, $lightness: -15%);
$anchor-color-hover: scale-color($anchor-color, $lightness: -14%);
```

A consumer who edits `$anchor-color` in its own copy of Foundation's settings file gets the hover line for free, because that file computes `$anchor-color-hover` from `$anchor-color`. For the Card alone the hover line is not needed (Foundation's `#1468a0` passes on both backgrounds), but the Callout needs it.

### Notes

- RTL: nothing flips; the rule and the classes are direction-free, and no `Directionality` is read.
- Forced colours: measured in Chromium and Firefox, the card's border takes CanvasText, its background and the divider's background take Canvas, text takes CanvasText, and links LinkText, so the card's boundary stays and the divider's band disappears; the divider's content, a heading or a link, carries its meaning. No rule is needed.
- `$global-flexbox: false` makes the card and divider blocks; the rule and the checks are the same.
- A divider is a row flex container under `$global-flexbox`, so two elements written in one divider sit side by side; Foundation's docs write one element per divider, and so do the recipes.
- An image inside a card section that takes Foundation's Thumbnail look carries the Thumbnail's own `nfsThumbnail` ([Spec: Thumbnail](../issues/97-spec-thumbnail.md)); a linked one carries it on the link around the image; the card adds nothing to it.
- Composition: `nfsCard` beside `nfsEqualizerWatch`, the XY Grid's cell directive, and the Flexbox Utilities' directives binds nothing they bind; the Equalizer's subgrid recipe replaces the card's `display` from the consumer's own selector, and `nfs-card` sets no `display`.
- Other Foundation containers that clip with `overflow: hidden` (the XY Grid's frame, Orbit, Drilldown, the off-canvas wrappers, the Responsive Embed) can cut off text in the same way; their specs decide whether it can happen there. The [Spec: Responsive Embed](../issues/96-spec-responsive-embed.md) measured its box: it cuts off an `<object>`'s long fallback text and the whole focus outline of a focused video, and its Library mixin releases the clip while the box holds focus.
