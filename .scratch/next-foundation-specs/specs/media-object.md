# Spec: Media Object

Ticket: [Spec: Media Object](../issues/91-spec-media-object.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites who wants an item, usually an image, set beside content about it (an author beside a comment, a product photo beside its summary, a thread of replies) writes Foundation's Media Object markup: a container with the `.media-object` class and two or three children with `.media-object-section`. Media Object is a CSS-only component: it ships Sass and classes and no Plugin. Foundation's docs add four Variant classes on top: `.middle` and `.bottom` align a section, `.main-section` sizes the centre section "in flexbox mode", and `.stack-for-small` stacks the sections on small screens. The markup contract leaves the hard parts to the author:

- Foundation compiles the component two ways, by the Sass boolean `$global-flexbox` (true by default). The docs' first alignment example uses `.middle` and `.bottom`, which Foundation styles only when `$global-flexbox` is false; in Foundation's default flexbox build they do nothing, and the docs switch to the Flexbox Utilities' `.align-self-middle` and `.align-self-bottom` instead. `.main-section` is styled only in the flexbox build. Measured in Chromium, Firefox, and WebKit: a `.middle` section stays at the top in a flexbox build, and an `.align-self-middle` section stays at the top in a table build. Nothing reports the mismatch.
- `.media-object img { max-width: none; }` keeps every image at its natural width, and the sections never wrap unless the author adds `.stack-for-small`. Measured at a 320 CSS px viewport in three engines, in both builds: Foundation's own Section Alignment example is 335 px wide (354 px with the WCAG 1.4.12 text spacing), its Nesting example 345 px (368 px), and its Stack example without the stacking class 566 px (579 px), so the page scrolls sideways and fails WCAG 2.2 success criterion 1.4.10. With `.stack-for-small` every one fits in 320 px. axe has no rule for reflow, so no story gate sees it.
- `.stack-for-small` is not a free-form class: Foundation generates only `.stack-for-<zero>`, named after the first key of `$breakpoints` (`small` by default), and it applies only at that Zero breakpoint.
- No image in Foundation's media-object examples has an `alt` attribute; axe reports `image-alt` on every one (measured).
- The container is only a `div`: a comment thread built from nested media objects has no structure a screen reader can move through unless the author picks elements that carry it.
- Under the library's class rule the developer writes no Foundation class at all, so `.media-object`, `.media-object-section`, and the four Variant classes need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the media object styled before hydration and inside dehydrated `@defer` blocks.

## Solution

Two attribute directives, one per Structural class, on the elements the developer already writes. `nfsMediaObject` binds `.media-object` and sets Foundation's stacking class from a typed `stackFor` input: `stackFor="small"` names the Zero breakpoint and sets `.stack-for-small`. `nfsMediaObjectSection` binds `.media-object-section`, sets `.middle` or `.bottom` from `alignment` (Foundation's classes for a build with `$global-flexbox: false`), and sets `.main-section` from the boolean `mainSection`. In Foundation's default flexbox build a section is aligned the way Foundation's docs show, with the Flexbox Utilities' `nfsFlexChild alignSelf="middle"` written beside `nfsMediaObjectSection`, and all sections at once with `nfsFlexAlign` beside `nfsMediaObject`; the Media Object declares no input for those classes.

Every value is typed: a misspelt alignment or breakpoint fails to compile, and the stacking class is built from the Zero breakpoint the application's `nfsBreakpointsToken` holds, so it follows a renamed breakpoint. A properties-only `nfs-media-object` Library mixin writes one Variant property listing which section classes the consumer's `$global-flexbox` generates, so the Runtime checks report an `alignment` bound in a flexbox build.

For WCAG 2.2 AA, a media object whose sections do not fit side by side at 320 CSS px stacks at the Zero breakpoint: this is a requirement, shown in every recipe and asserted in three engines for every story, and in development builds `nfsMediaObject` reports once, with both widths, when its content is wider than its box. The directives add no role; the element the developer picks carries the meaning, and the recipes build a comment thread from nested `article` elements.

## User Stories

1. As an application developer, I want to put `nfsMediaObject` on a `div`, `article`, or `li` and get Foundation's `.media-object` layout, so that I write no Foundation class.
2. As an application developer, I want `nfsMediaObjectSection` on each of its two or three children, so that I get Foundation's sections without writing `.media-object-section`.
3. As an application developer, I want `stackFor="small"` to stack the sections on small screens as Foundation's `.stack-for-small` does, so that a wide image does not push the page sideways.
4. As an application developer whose Sass renames the Zero breakpoint, I want `stackFor` to follow the name my `nfsBreakpointsToken` holds, so that the class matches my compiled CSS.
5. As an application developer, I want a misspelt `stackFor` value to fail to compile, so that I find the typo before release.
6. As an application developer, I want a development warning when `stackFor` names a breakpoint Foundation generates no stacking class for, so that I learn it stacks only at the Zero breakpoint.
7. As an application developer on Foundation's flexbox build, I want `mainSection` on the centre section, so that it takes the width the other sections leave, as Foundation's docs require.
8. As an application developer on Foundation's flexbox build, I want to align one section with the Flexbox Utilities' `nfsFlexChild alignSelf` beside `nfsMediaObjectSection`, so that Foundation's flexbox alignment example works without classes.
9. As an application developer on Foundation's flexbox build, I want to align every section at once with `nfsFlexAlign` beside `nfsMediaObject`, so that I learn one alignment API for every Foundation flex parent.
10. As an application developer on a build with `$global-flexbox: false`, I want `alignment="middle"` and `alignment="bottom"` on a section, so that Foundation's table-cell alignment works without classes.
11. As an application developer, I want a misspelt `alignment` to fail to compile, so that only Foundation's two names are accepted.
12. As an application developer, I want a development report when I bind `alignment` in a flexbox build, where Foundation styles no `.middle` or `.bottom`, so that a silently lost alignment is caught.
13. As an application developer, I want the report to tell me when I forgot `@include nfs-media-object;`, rather than blaming my build, so that I fix the right thing.
14. As an application developer, I want `alignment` written as a static attribute to leave my section's text alone, so that the input name does not collide with HTML's obsolete `align` attribute.
15. As an application developer migrating Foundation markup, I want a development warning when I copy `middle`, `bottom`, `main-section`, `stack-for-small`, or a Flexbox Utilities class onto a directive's host, naming the input or directive to use, so that the class rule is easy to follow.
16. As an application developer, I want a copied Variant class stripped from the host, so that the inputs are the only source of the look.
17. As an application developer, I want a development warning when a section is not a direct child of a media object, for example inside a child component's template, so that I learn to host `NfsMediaObjectSection` on that component.
18. As an application developer, I want my own avatar component to host `NfsMediaObjectSection` through `hostDirectives`, so that its host is the section and its metadata names no Foundation class.
19. As an application developer, I want a development warning when a media object's content is wider than its box, with both widths, so that a sideways scroll that axe cannot see is caught while I test at a narrow width.
20. As an application developer, I want the directives to add no role, so that the element I pick decides what a media object is.
21. As an application developer, I want the recipes to show a comment thread as nested `article` elements, so that I start from accessible structure.
22. As an application developer, I want nested media objects to indent a reply and still fit at 320 CSS px, so that a thread reflows without losing its shape.
23. As an application developer, I want `NgOptimizedImage` and the Thumbnail directive to work on a section's image, so that media-object images are optimised and styled like every other image.
24. As an application developer who changes `$global-flexbox`, I want the directives to work in both builds, so that a Sass setting stays compile-time configuration.
25. As an application developer building a right-to-left site, I want the docs to tell me that Foundation's section padding follows the compile-time `$global-text-direction`, so that I compile Foundation for my direction.
26. As a user at a 320 CSS px viewport or 400 percent zoom, I want a media object to stack instead of scrolling sideways, so that I read it in one direction.
27. As a user who enlarges text spacing, I want a media object to stay within the viewport, so that nothing needs a sideways scroll.
28. As a screen reader user, I want every informative image in a media object to have a text alternative and every decorative one to be skipped, so that I get what sighted users get without noise.
29. As a screen reader user, I want each comment in a thread to be an article with a heading, so that I can move between comments and replies.
30. As a keyboard user, I want the reading and focus order of a media object to be its visual order, stacked or not, so that focus never jumps.
31. As a developer of a server-rendered application, I want the server HTML to carry every media-object class, stacking included, so that the first paint is final and hydration changes nothing.
32. As a developer using `@defer (hydrate never)`, I want media objects there to stay styled, so that static regions look right without JavaScript.
33. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
34. As an application developer, I want to import both directives from one entry point, so that a `@defer` block can split it.
35. As a library maintainer, I want every behaviour asserted through classes, roles, names, computed style, and geometry in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Media Object has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's media-object Sass partial, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source | Notes |
| --- | --- | --- | --- |
| Media object | `.media-object` | `media-object-container`, through `foundation-media-object` | Structural class on any element. `margin-bottom: $mediaobject-margin-bottom` (`$global-margin`); `display: flex; flex-wrap: nowrap` under `$global-flexbox` (true by default), else `display: block`; `img { max-width: none; }` inside, so images keep their natural width |
| Section | `.media-object-section` | `media-object-section` | Structural class on each of the container's two or three children. `flex: 0 1 auto` under `$global-flexbox`, else `display: table-cell; vertical-align: top`. The first child gets `padding-<right>: $mediaobject-section-padding` (`$global-padding`, 1rem) and a last child that is not the second gets `padding-<left>`, both compiled against `$global-text-direction`; the last child of a section loses its bottom margin |
| Main section | `.main-section` on a section | `media-object-section`, under `$global-flexbox` only | `flex: 1 1 0px`: the section takes the width the others leave. Measured at 1280 px with short text between two images: without it the third section sits at x = 167 px; with it at the right edge. The docs: "must be added to your center section in order to properly size it" |
| Section alignment | `.middle`, `.bottom` on a section | `media-object-section`, when `$global-flexbox` is false only | `vertical-align: middle` or `bottom` on the table cell; top is the default and has no class |
| Flexbox alignment | `.align-self-top`, `.align-self-middle`, `.align-self-bottom`, `.align-self-stretch` on a section; `.align-*` on the container | `foundation-flex-classes` (the Flexbox Utilities) | The docs' flexbox form of Section Alignment. Utility classes of another family, set by its directives ([Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)) |
| Stack on small | `.stack-for-<zero>` on the container | `media-object-container` and `media-object-section` | `<zero>` is the first key of `$breakpoints` (Foundation's private `$-zf-zero-breakpoint`, `small` by default), not a Class breakpoint loop: no other breakpoint has the class. At the Zero breakpoint only: the container wraps (flexbox build), each section gets `padding: 0; padding-bottom: $mediaobject-section-padding` and `flex-basis: 100%; max-width: 100%` (or `display: block`), and images inside get `width: $mediaobject-image-width-stacked` (100%) |
| Nesting | a media object inside a section | Foundation's docs | Indents the inner object, "great for comment strings" |

Docs conventions kept or corrected: `h4` headings (kept in the stories for Foundation's look; the level follows the page outline, 1.3.1); images with no `alt` (corrected: every recipe image has one, 1.1.1); the `div.thumbnail` wrapper around each image (the recipes put the Thumbnail directive on the `img` itself, as Foundation's Thumbnail docs page directs; measured, the stacked image is 320 px wide at a 320 px viewport that way and 312 px inside the wrapper, whose own borders take 8 px); the three-section and nested examples without stacking (corrected: they stack at the Zero breakpoint, 1.4.10).

### CSS class to directive mapping

`small` in the value column stands for the Zero breakpoint, the key of `nfsBreakpointsToken`'s map whose value is 0, and `medium` for any other Class breakpoint.

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.media-object` | `NfsMediaObject` (`[nfsMediaObject]`), static host class | - | - | `media-object` | - |
| `.media-object-section` | `NfsMediaObjectSection` (`[nfsMediaObjectSection]`), static host class | - | - | `media-object-section` | - |
| `.stack-for-<zero>` | `stackFor` of `NfsMediaObject` | `NfsClassBreakpoint`; `$breakpoint-classes`, `NfsBreakpointClassesOverrides` (Open Variant family); the class itself follows `$breakpoints` | A bare Class breakpoint name | `'small'` sets `.stack-for-small`; `'medium'` sets none and warns in development (Foundation generates no `.stack-for-medium`); no value sets none | None: the class exists in every compile of `foundation-media-object`, and the Zero breakpoint's name is the `strictBreakpointSync` Runtime check's |
| `.middle`, `.bottom` | `alignment` of `NfsMediaObjectSection` | `NfsMediaObjectAlignment`, closed (`'middle' \| 'bottom'`); generated only while `$global-flexbox` is false | A name | `'middle'` sets `.middle`, `'bottom'` sets `.bottom`; no value sets none (top, Foundation's default) | `--nfs-media-object-section`, written by `nfs-media-object` |
| `.main-section` | `mainSection` of `NfsMediaObjectSection` | `boolean` through `nfsVariantBoolean`, closed; generated only while `$global-flexbox` is true | Boolean | `true`, the bare attribute, or `'true'` sets `.main-section`; `false` sets none | `--nfs-media-object-section` |
| `.align-self-<y>` on a section, `.align-<x>` and `.align-<y>` on the container | `alignSelf` of `NfsFlexChild`, and `alignX`, `alignY`, `alignCenterMiddle` of `NfsFlexAlign`, written beside ([Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)) | That spec's | That spec's | That spec's | That spec's |

State classes: none. Foundation's media object has no State class. `$global-flexbox`, `$mediaobject-margin-bottom`, `$mediaobject-section-padding`, and `$mediaobject-image-width-stacked` are Sass settings, compile-time configuration and never inputs (building-blocks 1.13). No class is left for the consumer to write (ADR 0039).

Binding rule (building-blocks 1.4). `NfsMediaObject` binds one computed class record holding `stack-for-<zero>`, `true` when `stackFor` names the Zero breakpoint and `false` otherwise; `NfsMediaObjectSection` binds one record holding `middle`, `bottom`, and `main-section`. Because Angular's styling resolution uses a static class only when every binding for it is `undefined`, a copied `stack-for-small`, `middle`, `bottom`, or `main-section` is stripped on the server and in the browser, as the [Spec: Menu](../issues/85-spec-menu.md) measured for its record, and the development check reports it. Structural classes written redundantly merge with the static host class and are not reported; the consumer's own classes stay. Flexbox Utilities classes copied onto the hosts are not stripped (this spec binds none of them) and are reported.

### Hierarchy and DI shape

```
[nfsMediaObject]            NfsMediaObject          (standalone directive, no template); stackFor
  [nfsMediaObjectSection]   NfsMediaObjectSection   (two or three direct children); alignment, mainSection
    (nested)                a media object inside a section indents it
  uses: nfsBreakpointsToken and nfsBreakpointForWidth (ngx-foundation-sites/media-query) in NfsMediaObject, for the
        Zero breakpoint; nfsVariantCheck (ngx-foundation-sites/media-query) in NfsMediaObjectSection;
        HostAttributeToken('class') and ElementRef in development builds only
written beside (their specs):
  [nfsMediaObject][nfsFlexAlign], [nfsMediaObjectSection][nfsFlexChild], img[nfsThumbnail]
```

- No Parent token, no queries, no providers, and no host directives. Foundation's section rules are single-class selectors or descendants of `.stack-for-<zero>`, so a section styles itself by DOM position, and nothing links the parts' state. The one placement fact that matters, that a section is a direct child of the media object (a flex item or a table cell of it), is a DOM fact that content projection can hide from DI, so the development check reads the DOM (D10).
- The Flexbox Utilities directives are written beside, not hosted (D4). Their spec allows either for "a directive whose element is always a Flex parent or a Flex child"; a media object is one only while `$global-flexbox` is true.
- No Defaults token: the Media Object has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `NfsMediaObject` reads the Zero breakpoint once, at construction, as `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, the same on the server and the client, without injecting `NfsMediaQuery` (building-blocks 1.4). `NfsMediaObjectSection` takes the Runtime checks' handle from `nfsVariantCheck('nfsMediaObjectSection')`. In development builds only, both read `HostAttributeToken('class')` (optional) for the copied-class warning and use `ElementRef` for the placement and overflow checks.
- Entry point: `ngx-foundation-sites/media-object` (one per Foundation docs page), exporting both directives and `NfsMediaObjectAlignment`, so a consumer's `@defer` can split it. `NfsClassBreakpoint`, `NfsVariantBoolean`, and `nfsVariantBoolean` come from the primary entry point `ngx-foundation-sites`, as types and one pure function; the entry point does not import `ngx-foundation-sites/flexbox-utilities`.

### API: `NfsMediaObject`

Selector `[nfsMediaObject]`; standalone; no template; no `exportAs`, because nothing is read through a template reference (adding one later is additive).

```ts
class NfsMediaObject {
  readonly stackFor: InputSignal<NfsClassBreakpoint | undefined>; // default undefined: no class
}
```

| Input | Transform | Default | Foundation equivalent (JSDoc) | Delta |
| --- | --- | --- | --- | --- |
| `stackFor` | none | `undefined`: no class, the sections stay side by side at every width | `.stack-for-<zero>`, the stacked layout at the Zero breakpoint (`$breakpoints`' first key), with images at `$mediaobject-image-width-stacked` | New input. A bare Class breakpoint name, Foundation's words `stack-for` kept (building-blocks 1.4 rule 5); only the Zero breakpoint sets a class |

- The input declares its explicit type argument, `NfsClassBreakpoint | undefined`, an exported alias whose write type the library's build assertion checks ([ADR 0040](../adr/0040-variant-input-types.md)). A consumer's added Class breakpoints reach it through the Variant declaration file; only the Zero breakpoint sets a class.
- Host: static `class="media-object"`; `[class]` bound to the record of the binding rule. No attribute, no listener, no role.
- A breakpoint that is not the Zero breakpoint maps to no class, because Foundation generates `.stack-for-<zero>` alone: the `.stack-for-*` selectors are built from `$-zf-zero-breakpoint`, not from a `$breakpoint-classes` loop.

### API: `NfsMediaObjectSection`

Selector `[nfsMediaObjectSection]`; standalone; no template; no `exportAs`.

```ts
type NfsMediaObjectAlignment = 'middle' | 'bottom';

class NfsMediaObjectSection {
  readonly alignment: InputSignal<NfsMediaObjectAlignment | undefined>;        // default undefined: top, no class
  readonly mainSection: InputSignalWithTransform<boolean, NfsVariantBoolean>;  // default false
}
```

| Input | Type and transform | Default | Foundation equivalent (JSDoc) | Delta |
| --- | --- | --- | --- | --- |
| `alignment` | `NfsMediaObjectAlignment`, no transform | `undefined`: top, Foundation's default | `.middle`, `.bottom` on `.media-object-section`, styled only while `$global-flexbox` is false; in a flexbox build use `alignSelf` of `nfsFlexChild` beside the section | New input. Named for the docs' Section Alignment, not `align` (D3) |
| `mainSection` | `boolean`, `nfsVariantBoolean` | `false` | `.main-section`, styled only while `$global-flexbox` is true | New input. A single class, a boolean named after it (building-blocks 1.4 rule 4) |

- Both inputs declare explicit type arguments naming exported aliases (`NfsMediaObjectAlignment | undefined`; `boolean` with `NfsVariantBoolean`), as building-blocks 1.4 requires.
- Host: static `class="media-object-section"`; `[class]` bound to the record of the binding rule. No attribute, no listener, no role.
- The directive binds a value only when it is one of the two names; under the closed type only a cast or `$any()` reaches that guard, and the Variant check reports it.
- Why both families live on the section although each works in only one build: they are Foundation's own Variant classes of `.media-object-section`, and the consumer's `$global-flexbox` decides which one Foundation's CSS styles. The library cannot know the build at render time (the server has no computed style), so both are typed, both are set as bound, and the Runtime check reports a value the compile does not style.

### Development checks and runtime checks

Development checks run in the directives' render callbacks, only when `ngDevMode` is on (never on the server, never in production), each warning once per instance and distinct subject through `console.warn`:

1. Copied classes, at the first render, read through `HostAttributeToken('class')`: on `NfsMediaObject`, `stack-for-<zero>` names `stackFor="<zero>"`, and a Flexbox Utilities parent alignment class (`align-top`, `align-middle`, `align-bottom`, `align-stretch`, `align-left`, `align-right`, `align-center`, `align-justify`, `align-spaced`, `align-center-middle`) names `nfsFlexAlign`; on `NfsMediaObjectSection`, `middle` and `bottom` name `alignment`, `main-section` names `mainSection`, and `align-self-<y>` names `nfsFlexChild alignSelf`. For example: "class="middle main-section" is set by nfsMediaObjectSection: bind alignment="middle" and mainSection instead". The binding rule has already stripped the classes this spec binds; the Flexbox Utilities classes keep styling until removed.
2. `NfsMediaObject` with `stackFor` naming a breakpoint other than the Zero breakpoint, on every run while bound, once per value: "nfsMediaObject: Foundation generates only stack-for-<zero>, so stackFor="medium" sets no class; the sections stack only at the Zero breakpoint (<zero>)".
3. `NfsMediaObjectSection` whose parent element carries no `.media-object`, read from the DOM at the first render: "nfsMediaObjectSection: this section is not a direct child of an nfsMediaObject element, so Foundation's CSS does not lay it out as a section; when a component renders it, put NfsMediaObjectSection in that component's hostDirectives" (D10).
4. Overflow (1.4.10, D8): `NfsMediaObject` creates a `ResizeObserver` on its host in `afterNextRender` and, in each callback, compares the host's `scrollWidth` with its `clientWidth`. The first time the content is more than 1 px wider than the box it warns and disconnects: "nfsMediaObject: its content is 335 px wide in a 320 px box, so the page scrolls sideways at this width (WCAG 1.4.10 Reflow); bind stackFor="small" to stack the sections at the Zero breakpoint, or narrow the side sections' content". While `stackFor` names the Zero breakpoint, the message gives only the second remedy. The observer is disconnected on destroy. Measured with the docs' content in three engines, the host's own `scrollWidth` shows every failing case at 320 px (335, 345, and 566 px) and none that fits; for a thread, the outer object reports, because the inner one's content forces the outer section wider.

Runtime checks ([ADR 0040](../adr/0040-variant-input-types.md), configured by `provideNfsRuntimeChecks` and `provideNfsProductionRuntimeChecks` of `ngx-foundation-sites/media-query`, whose spec defines how a directive reports): `NfsMediaObjectSection` calls `nfsVariantCheck('nfsMediaObjectSection')` at construction and, in a render callback it creates only when the handle is not `null`, while `alignment` has a value or `mainSection` is true, calls `include('nfs-media-object', ['media-object-section'])`, then `value('alignment', value, needs)` and `value('mainSection', true, needs)`. The needs are `[{setting: 'media-object-section', name: 'middle'}]`, `'bottom'`, or `'main-section'`, and `null` for a value that is not one of the names. `strictVariantNames` then reports an `alignment` bound in a flexbox build (the property lists `main-section`) and a `mainSection` bound in a table build (it lists `middle bottom`), for example "ngx-foundation-sites [strictVariantNames]: nfsMediaObjectSection alignment "middle" has no class in the compiled CSS: $media-object-section generates main-section"; `strictVariantProperties` reports a missing `@include nfs-media-object;` once. An application that binds neither is not asked for the include (the Off-canvas and Top Bar rule of the Runtime checks). `NfsMediaObject` reads no Variant property and makes no call: `stackFor`'s class exists in every compile of `foundation-media-object`, and a drifted Zero breakpoint name is `strictBreakpointSync`'s report. They run in the browser after the first render, never on the server.

### Comparison with Angular Material (22.2)

Material has no media object. Its nearest shapes are the list item with a leading avatar and the card header with an avatar.

| Concern | Material | `NfsMediaObject` |
| --- | --- | --- |
| Selector and kind | `mat-list-item` (a component) with directive slots `[matListItemAvatar]`, `[matListItemIcon]`, `[matListItemTitle]`, `[matListItemLine]`, `[matListItemMeta]`; `mat-card-header` with `[mat-card-avatar]`, `mat-card-title`, `mat-card-subtitle` | `[nfsMediaObject]` and `[nfsMediaObjectSection]` on the consumer's elements: Foundation's two classes and its four Variant classes, nothing more |
| Layout | Fixed slot positions, a leading avatar, a trailing meta slot | Two or three sections in DOM order; alignment, sizing, and stacking from typed inputs and the Flexbox Utilities directives |
| Narrow screens | The list item truncates or wraps lines within fixed slots | `stackFor` stacks the sections at the Zero breakpoint; a development check reports overflow |
| Accessibility | The list supplies `list` and `listitem` roles; the card header none | No role: the consumer's element carries the meaning (`article` per comment, a list of items) |
| Testing | `MatListHarness`, `MatCardHarness` | DOM-first assertions; no harness |

Borrowed: nothing of the API; the slot names confirm that an avatar beside content is ordinary content, not a widget. Not borrowed: a component with named slots (Foundation generates nothing, ADR 0001), fixed avatar sizes (Foundation's images keep their natural width), and implied list semantics (a media object is often not a list item).

### Implementation level and primitives

Implementation level: native platform. A media object is the consumer's elements laid out by Foundation's flexbox or table-cell CSS, and its semantics are the elements' and their content's. `@angular/aria` has no media-object pattern in 22.2, and `@angular/cdk` has nothing to add. The Angular layer is two static host classes, one `computed` class record per directive over `input()` signals, the Zero breakpoint read once from `nfsBreakpointsToken`, and, in development builds only, render callbacks and one `ResizeObserver` per media object for the checks. No `effect`, timer, listener, or injection of `NfsMediaQuery`.

Fallback: none needed. The risks the directives own, the two builds' Variant classes, the Zero-breakpoint class name, and overflow at 320 CSS px, were measured by this spec's ticket in three engines.

### ARIA and keyboard

APG pattern: none. A media object is a layout of ordinary content; the APG has no pattern for it, and its links and buttons follow their own.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsMediaObject]` | The host element's own role: `generic` for a `div`, `article` for an `article`, `listitem` for a `li`; the directives add no role, name, or state | WHATWG HTML; HTML-AAM |
| A comment thread | Each comment an `article` with a heading naming its author; a reply an `article` nested in its parent comment's main section. WHATWG HTML defines a nested `article` as one related to the outer one and gives user-submitted comments as the example | WHATWG HTML (`article`); WCAG 1.3.1 |
| A set of media objects that is a list | A `ul` whose items carry `nfsMediaObject` or hold one | HTML-AAM |
| `[nfsMediaObjectSection]` | The host element's own role; `generic` for a `div` | HTML-AAM |
| Image | The consumer's `img` and its `alt`: a text alternative where the image carries information the text beside it does not, `alt=""` where it repeats it (an author's avatar beside the author's name) | WCAG 1.1.1 |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches the links and controls inside the sections in DOM order; the media object and its sections are not focusable | Native |

Focus: the directives move no focus and add no tab stop. Stacking changes no order: the sections stack in DOM order, so the visual order stays the reading and focus order. Reordering sections with the Flexbox Utilities' `order` is that spec's concern, and its development check reports focusable content shown out of DOM order.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Geometry was measured by this spec's ticket in Chromium, Firefox, and WebKit through Playwright 1.63 with Foundation 6.9.0 compiled by Dart Sass 1.104.1, in both builds, with stand-in images of the docs' sizes (100 by 100 avatars, a 485 by 248 rectangle) and axe-core 4.13.0; the three engines agreed on every number below.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.10 Reflow | At 320 CSS px no media object scrolls sideways. A media object whose sections do not fit side by side at 320 CSS px binds `stackFor` to the Zero breakpoint; this holds for any side section wider than about 100 px beside prose, for three sections, and for a nested reply. In a thread, the reply stacks, which keeps it indented (D7). `nfsMediaObject` reports overflow in development (check 4) | Fails in Foundation's own docs: at 320 by 640 px the Section Alignment example is 335 px wide, the Nesting example 345 px, the Stack example without its class 566 px; with `.stack-for-small` each is 320 px. In a two-level thread, stacking the reply brings the outer object from 331 to 320 px with the reply's avatar still indented by 124 px; stacking only the outer object also fits but moves the reply under its parent's avatar. Basics (one avatar beside text) fits | e2e in three engines at 320 by 640 px on every story: each media object's `scrollWidth` equals its `clientWidth` and `document.documentElement.scrollWidth` is at most 320; browser-level tests of check 4 |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, the same holds: nothing scrolls sideways and nothing is cut off (Foundation's media object clips nothing) | Fails where 1.4.10 fails, by more: 354, 368, and 579 px; stacked, 320 px | e2e in three engines at 320 by 640 px with the text-spacing stylesheet: the 1.4.10 assertions |
| 1.1.1 Non-text Content | Every image in a media object has a text alternative: the consumer's `alt`, descriptive where the image carries information the text beside it does not, empty where it does not. The image carries no media-object directive, and axe `image-alt` reports a missing `alt` on every run, so the library adds no check (D13); every recipe and story image has one | Fails: no image in Foundation's media-object docs has `alt`; axe reports `image-alt` on each of the four images of a docs sample and nothing once they have one (measured) | axe `image-alt` in every story; the play functions find each informative image by `getByRole('img', {name})` |
| 1.3.1 Info and Relationships | The element carries the meaning: a comment is an `article` with a heading at the page outline's level, a reply an `article` nested inside it, a set of items a list (D12). The directives add no role | Foundation's docs use `div` containers and `h4` headings | axe (`heading-order`, best-practice) in every story; `media-object--nesting` finds the articles and their headings by role |
| 1.3.2 Meaningful Sequence | The DOM order is the reading order in both builds and when stacked: the directives never reorder sections, and stacking keeps DOM order | Passes | The play functions of `media-object--section-alignment` and `media-object--stack-on-small` assert that the sections' boxes follow DOM order |
| 1.4.4 Resize Text | At 200 percent text size content flows within its sections, and a stacked object stays within the viewport | Passes | Covered by the 1.4.10 cases |
| 1.4.11 Non-text Contrast | Nothing is required: a media object is not a user interface component and draws nothing; a Thumbnail's border is that spec's | Passes | None in this library |
| 2.4.7 Focus Visible, 2.5.8 Target Size (Minimum) | A media object is never a control or a target; controls inside meet these by their own specs | Passes | axe `target-size` in every story |
| 4.1.2 Name, Role, Value | The directives change no role, name, or state | Passes | axe in every story; browser-level tests assert that no attribute is added |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). It sees a missing `alt`, but not a sideways scroll, which is why 1.4.10 and 1.4.12 are e2e cases and a development check.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directives declare no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attributes and static input attributes (`nfsmediaobject=""`, `stackfor="small"`), which the resulting DOM below leaves out, as the other specs do. `nfsThumbnail` (`NfsThumbnail`) is the [Spec: Thumbnail](../issues/97-spec-thumbnail.md)'s directive, as the [Spec: Card](../issues/90-spec-card.md) writes it, and `nfsFlexChild` with `alignSelf` is the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s.

```html
<!-- Basics, flexbox build: the centre section takes the remaining width -->
<div nfsMediaObject>
  <div nfsMediaObjectSection>
    <img nfsThumbnail src="/avatars/cobb.jpg" alt="Cobb in a grey suit" width="100" height="100">
  </div>
  <div nfsMediaObjectSection mainSection>
    <h4>Dreams feel real while we're in them.</h4>
    <p>I'm going to improvise.</p>
  </div>
</div>

<div class="media-object">
  <div class="media-object-section">
    <img class="thumbnail" src="/avatars/cobb.jpg" alt="Cobb in a grey suit" width="100" height="100">
  </div>
  <div class="media-object-section main-section">
    <h4>Dreams feel real while we're in them.</h4>
    <p>I'm going to improvise.</p>
  </div>
</div>

<!-- Section alignment, flexbox build: three sections stack at the Zero breakpoint (1.4.10) -->
<div nfsMediaObject stackFor="small">
  <div nfsMediaObjectSection nfsFlexChild alignSelf="middle"><img nfsThumbnail src="/avatars/ariadne.jpg" alt="" width="100" height="100"></div>
  <div nfsMediaObjectSection mainSection><h4>Why is it so important to dream?</h4><p>...</p></div>
  <div nfsMediaObjectSection nfsFlexChild alignSelf="bottom"><img nfsThumbnail src="/avatars/eames.jpg" alt="" width="100" height="100"></div>
</div>

<div class="media-object stack-for-small">
  <div class="media-object-section align-self-middle"><img class="thumbnail" src="/avatars/ariadne.jpg" alt="" width="100" height="100"></div>
  <div class="media-object-section main-section"><h4>Why is it so important to dream?</h4><p>...</p></div>
  <div class="media-object-section align-self-bottom"><img class="thumbnail" src="/avatars/eames.jpg" alt="" width="100" height="100"></div>
</div>

<!-- Section alignment in a build compiled with $global-flexbox: false -->
<div nfsMediaObject>
  <div nfsMediaObjectSection alignment="middle">...</div>
  <div nfsMediaObjectSection>...</div>
  <div nfsMediaObjectSection alignment="bottom">...</div>
</div>

<div class="media-object">
  <div class="media-object-section middle">...</div>
  <div class="media-object-section">...</div>
  <div class="media-object-section bottom">...</div>
</div>

<!-- A comment thread: the reply stacks, so it stays indented and fits at 320 CSS px -->
<article nfsMediaObject>
  <div nfsMediaObjectSection><img nfsThumbnail src="/avatars/cobb.jpg" alt="" width="100" height="100"></div>
  <div nfsMediaObjectSection mainSection>
    <h3>Cobb</h3>
    <p>An idea is like a virus.</p>
    <article nfsMediaObject stackFor="small">
      <div nfsMediaObjectSection><img nfsThumbnail src="/avatars/mal.jpg" alt="" width="100" height="100"></div>
      <div nfsMediaObjectSection mainSection><h4>Mal</h4><p>Resilient, highly contagious.</p></div>
    </article>
  </div>
</article>

<article class="media-object">
  <div class="media-object-section"><img class="thumbnail" src="/avatars/cobb.jpg" alt="" width="100" height="100"></div>
  <div class="media-object-section main-section">
    <h3>Cobb</h3>
    <p>An idea is like a virus.</p>
    <article class="media-object stack-for-small">...</article>
  </div>
</article>
```

The avatars' `alt` is empty where the heading beside them names the person; the Basics image has a description because no text names what it shows. With a provided `nfsBreakpointsToken` whose Zero breakpoint is `xs` (and a Variant declaration file that declares `xs`), `stackFor="xs"` renders `.stack-for-xs`. An `NgOptimizedImage` image (`ngSrc`) renders the same way, because no media-object directive sits on the image.

### Animation

None. Foundation's media-object partial declares no transition, and the library adds none. A media object that appears or disappears with `@if` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.media-object`, `.media-object-section`, and every Variant class the inputs set, `.stack-for-<zero>` included, because the class records are host bindings and the Zero breakpoint comes from the token, the same on both platforms. The stacking itself is Foundation's media query, so the first paint is final at every width.
- Before hydration: the directives touch no DOM outside their host bindings, measure nothing, and start no observer; the development checks and the Variant check run in render callbacks only, which Angular skips on the server.
- Full and incremental hydration: the host classes equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own. Controls inside a section follow their own specs' boundaries.
- Event replay: the directives declare no listener and add no `jsaction`; links inside keep native navigation inside dehydrated blocks, and a control's pre-hydration click replays through that control's own listener.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a media object is its server HTML; inside `@defer (hydrate never)` it stays styled and stacks at the Zero breakpoint for good. Its development checks run only once the block hydrates.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, roles and names, computed alignment, the sections' geometry at each width, and the DOM order. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Card](../issues/90-spec-card.md)'s and [Spec: Top Bar](../issues/86-spec-top-bar.md)'s tests, the nearest precedents.

Story ids follow `media-object--<story>`: `media-object--basics`, `media-object--section-alignment`, `media-object--stack-on-small`, `media-object--nesting`. `meta.component` is `NfsMediaObject`; its `stackFor` gets an enum control from docgen. The preview compiles Foundation's flexbox build, so no story binds `alignment`, whose classes that build does not style; the table build is covered by layers 2 and 3. The preview includes `nfs-media-object` and needs no settings override. Scaffolding imports the Thumbnail directive and the Flexbox Utilities' `NfsFlexChild` from their entry points; every story image has an `alt`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>` at Vitest's 414 px viewport, which is the Zero breakpoint. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `image-alt`, `heading-order`, and `target-size`). No story element carries a Foundation class written in the story.

- `media-object--basics`: Foundation's Basics, a 100 px avatar beside text with `mainSection`. The host carries `.media-object` and the sections `.media-object-section`, the text section also `.main-section`; the image is found by `getByRole('img', {name})`; the text section's left edge is at or right of the image section's right edge (side by side at 414 px).
- `media-object--section-alignment`: the three-section example with `nfsFlexChild alignSelf` on the side sections, `mainSection` on the centre, and `stackFor="small"`. At 414 px the sections are stacked: each section's top is at or below the previous section's bottom, in DOM order, and each spans the container's width; the side sections carry `.align-self-middle` and `.align-self-bottom` from `nfsFlexChild`.
- `media-object--stack-on-small`: Foundation's Stack example with the 485 by 248 image and `stackFor` bound to the Zero breakpoint. The host carries `.stack-for-small`; the image's width equals its section's content width; the text section starts below the image section.
- `media-object--nesting`: a comment thread of two `article` media objects, the reply nested in the parent's main section with `stackFor="small"`. Both articles and their headings are found by role and name; the reply's avatar sits right of the parent's avatar (indented).

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here. Where a case needs Foundation's layout, a style block carries Foundation's compiled media-object rules from the node-level compile's output.

- Classes, driven by data: each directive puts its Structural class on a `div`, an `article`, and a `li`; `stackFor` with the Zero breakpoint sets `.stack-for-small`, with `'medium'` sets none, and changing the value moves the class; with a provided `nfsBreakpointsToken` whose Zero breakpoint is `xs`, a cast `'xs'` sets `.stack-for-xs` and `'small'` sets none; `alignment` `'middle'` and `'bottom'` set their class, `undefined` none, and a change removes the old class; `mainSection` follows `true`, the bare attribute, `'true'`, and `'false'`; a cast `alignment` that is not one of the names binds nothing. The consumer's own static class and a `[class]` binding stay; the directives add no attribute (`role`, `tabindex`, `id`, `aria-*`, `hidden`).
- Binding rule: a static `class="media-object stack-for-small"` with no `stackFor` loses `stack-for-small`, and a static `class="middle main-section"` with no inputs loses both; a static `media-object-section` and an application class stay.
- Composition: `nfsMediaObjectSection` beside `nfsFlexChild alignSelf="middle"` keeps both directives' classes, and their input names do not collide; a test component with `hostDirectives: [NfsMediaObjectSection]` inside a media object renders `.media-object-section` on its host and does not warn.
- Development checks: each of checks 1 to 3 warns once for its case and not for correct markup (a copied `stack-for-small`, `middle`, `bottom`, `main-section`, `align-self-middle`, and `align-center` each named with its input or directive; a redundant Structural class and an application class not reported; `stackFor="medium"` warns once and `'small'` does not; a section inside a wrapper `div` warns and a direct child does not). Check 4: a 485 px image beside text in a 320 px wide test container warns once with both widths and never again, and the same markup with `stackFor="small"` is silent at the 414 px test viewport; a container that narrows from 800 to 300 px warns once after the resize; destroying the host disconnects the observer. Nothing is checked when `ngDevMode` is false or during a server render.
- Runtime checks: with `--nfs-media-object-section: main-section` on the test document, `mainSection` is silent and `alignment="middle"` reports once under `strictVariantNames`, naming `nfsMediaObjectSection`, `alignment`, `middle`, and `$media-object-section`; with `middle bottom`, `alignment` is silent and `mainSection` reports once; with the property absent and `alignment` bound, `strictVariantProperties` reports once, naming `nfs-media-object`, and no name is reported; with neither input bound, nothing is requested; `provideNfsRuntimeChecks({strictVariantNames: false})` silences the name reports.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with Basics, the three-section example with `stackFor="small"`, a section with `alignment="middle"`, a nested thread, and a host-directive section component. `whenStable()` resolves; the server HTML carries `.media-object`, `.stack-for-small`, `.media-object-section`, `.main-section`, and `.middle`, and the consumer's `alt` values; no element carries `jsaction` or a role from the directives; with a server `nfsBreakpointsToken` whose Zero breakpoint is `xs`, a cast `stackFor` of `'xs'` renders `.stack-for-xs`; a `console.warn` spy records nothing.
- Sass compile, over Foundation 6.9.0's settings file with `@import 'ngx-foundation-sites';`: `@include nfs-media-object;` after `foundation-media-object` emits exactly `:root { --nfs-media-object-section: main-section; }` on Foundation's defaults and `--nfs-media-object-section: middle bottom;` under `$global-flexbox: false`, and no other rule; after `foundation-everything` (which sets `$global-flexbox` to true) it writes `main-section`; after `foundation-everything($flex: false)` with `$global-flexbox: false` it writes `middle bottom`.
- Pure logic: the `stackFor`-to-class function over every Class breakpoint and a renamed Zero breakpoint; the `alignment` and `mainSection` mapping and their needs, table-driven.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Reflow (1.4.10) in three engines: at 320 by 640 px, in every story, each media object's `scrollWidth` equals its `clientWidth` and `document.documentElement.scrollWidth` is at most 320.
- Text spacing (1.4.12) in three engines: the same assertions at 320 by 640 px with a stylesheet that sets line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em on every element.
- Wide layout at 1280 by 800 px: in `media-object--section-alignment` the sections sit side by side in DOM order, the first section's box is centred in the container's height within 1 px, the last section's bottom meets the container's bottom, and the last section's right edge is the container's (measured with the docs' content: 27 to 135 px and 53 to 161 px in a 161 px container, the last section at 1156 to 1280 px); in `media-object--nesting` the reply sits inside the parent's main section.

Against the prerendered fixture app, on the Media Object route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; the media objects carry their classes before any script runs, and at a 320 px viewport the stacked objects fit.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

## Out of Scope

- A media-object component with named slots for an avatar, a title, and a trailing item, as Material's list item has: Foundation has two classes and generates nothing (ADR 0001); images, headings, and buttons are the consumer's elements. Category: `scope-boundary`.
- A default role, a role input, or `tabindex` on the media object (D12): the consumer's element carries the meaning, and a role is a promise. Category: `platform-or-a11y`.
- A development check for missing `alt` on images in a media object (D13): axe `image-alt` reports it on every run, and the image carries no library directive. Category: `platform-or-a11y`.
- The Flexbox Utilities classes on a media object and its sections (`.align-*`, `.align-self-*`, `.flex-child-*`, the order classes): the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s directives, written beside (D4). Category: `scope-boundary`.
- The Thumbnail look of a section's image: the [Spec: Thumbnail](../issues/97-spec-thumbnail.md). Category: `scope-boundary`.
- Stacking at a breakpoint other than the Zero breakpoint (a `.stack-for-medium`): Foundation generates no such class; a consumer who needs it lays the item out with the XY Grid's directives, whose cells stack per breakpoint. Category: `scope-boundary`.
- Section padding that follows a runtime `dir` attribute: Foundation compiles the side of the section padding against `$global-text-direction`, and a right-to-left site compiles Foundation for right to left, as Foundation documents for every component (measured: under `dir="rtl"` with a left-to-right compile the gap between image and text shrinks from 20 to 4 px; a right-to-left compile restores 20 px). Category: `scope-boundary`.
- A library rule that keeps a media object inside 320 CSS px without `stackFor` (D7). Category: `other`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Two attribute directives, one per Structural class (`[nfsMediaObject]`, `[nfsMediaObjectSection]`), each on any element; entry point `ngx-foundation-sites/media-object`; no `exportAs` | ADR 0001 and ADR 0039: "a container with the class `.media-object`, and two or three sections", and Foundation generates nothing; the out-of-scope triage's names; nothing to expose, as the Card and the Top Bar sections have it | A component with named slots, Material's list-item shape (Foundation's markup carries the elements; ADR 0001) (`scope-boundary`); one directive whose library CSS styles its children (ADR 0039 has one directive per class) (`other`) |
| D2 | `stackFor` on `NfsMediaObject`, typed `NfsClassBreakpoint`: the Zero breakpoint, read from `nfsBreakpointsToken`, sets `.stack-for-<zero>`; any other name sets none and warns in development | Building-blocks 1.4 rule 5 keeps Foundation's words `stack-for` and puts the breakpoint in the value, as the Top Bar's and Button Group's `stackedFor` do; the class name follows `$breakpoints`' first key, which the token mirrors and `strictBreakpointSync` checks, so no new type or property is needed; the Top Bar's D2 accepts the same gap the other way round (its Zero breakpoint sets none) | A registry and Variant property for the Zero breakpoint's name, an exact type with one member (new public surface for one class, and the token already mirrors the name) (`other`); a boolean `stacked` or `stackForSmall` (rule 5 puts the breakpoint in the value, and the name would be wrong for a renamed Zero breakpoint) (`other`); the literal `'small'` (fails a renamed Zero breakpoint, the Menu's D11) (`other`) |
| D3 | `alignment` (`'middle' \| 'bottom'`) on `NfsMediaObjectSection` sets Foundation's `.middle` and `.bottom`; named `alignment`, not `align` | Foundation's own Variant classes of the section, named for the docs' Section Alignment (building-blocks 1.4 rule 3); Angular renders a static input attribute on the host, and measured in three engines a static `align="middle"` on a `div` centres its text (HTML's obsolete `align` presentational hint), and on `li`, `article`, `section`, `figure`, and `header` in Chromium and WebKit | `align` (the HTML presentational hint centres the section's text) (`platform-or-a11y`); `verticalAlign` (names a CSS property, not Foundation's docs term) (`other`); no input, leaving the build without `$global-flexbox` unserved (ADR 0039 gives every Variant class a typed input) (`variant-as-class`) |
| D4 | Flexbox-build alignment is the Flexbox Utilities' `nfsFlexChild alignSelf` beside a section and `nfsFlexAlign` beside the media object, written beside, not hosted | Foundation's docs use those classes in the flexbox build; their spec is the one owner of `.align-*` and `.align-self-*`, and another spec writes its directives beside or hosts them, never declaring its own inputs for them; a media object is a Flex parent only while `$global-flexbox` is true, so hosting would put an input on every section that does nothing in the other build, where `nfsFlexChild`'s own placement check warns; beside keeps the entry point free of a runtime import of `flexbox-utilities` | `alignment` also setting `.align-self-*` (two owners for one Utility class family, the Button Group's D9) (`other`); hosting `NfsFlexChild` in `NfsMediaObjectSection` and `NfsFlexAlign` in `NfsMediaObject` (the reasons above) (`other`); a library rule styling `.middle` and `.bottom` in the flexbox build (re-implements what Foundation expresses with its flex helper classes, and changes Foundation's flexbox output) (`other`) |
| D5 | `mainSection`, a boolean through `nfsVariantBoolean`, sets `.main-section` | A single class, a boolean named after it (building-blocks 1.4 rule 4); measured, it is what moves a third section to the right edge beside short text | Setting `.main-section` automatically on the widest or the middle section (the directive cannot know which section is the content; Foundation leaves it to the author) (`other`) |
| D6 | A properties-only `nfs-media-object` writes one Variant property, `--nfs-media-object-section`: `main-section` under `$global-flexbox: true`, `middle bottom` under `false`; `NfsMediaObjectSection` reports both families through it and names it in `include()` | Building-blocks 1.13 gives a flag-gated family a Variant property for the Runtime check; the two families are gated by one flag in opposite directions, so one list that names whichever classes the compile generates is never empty while the mixin is included, which is what lets `include()` tell a missing include from a build that lacks a class; the check then reports the one silent failure, `alignment` in Foundation's default build | Two properties, each empty while its flag is off (the literal reading: neither may be named in `include()`, so a missing include makes `mainSection` report as a missing class in Foundation's default build) (`other`); a development check from the section's computed `display` (building-blocks 1.13 puts flag-gated families on the Runtime checks, which a production opt-in can also run) (`other`); no check (an `alignment` in the default build is lost silently) (`other`) |
| D7 | 1.4.10 is met by stacking: a media object whose sections do not fit side by side at 320 CSS px binds `stackFor` to the Zero breakpoint; the recipes and stories do; a thread stacks its replies | Measured in three engines: Foundation's Section Alignment, Nesting, and unstacked Stack examples scroll sideways at 320 px, and `.stack-for-small` fixes each; stacking the reply keeps a thread indented; the requirement depends on the content's widths, which only the consumer knows, and the Variant Defaults rule gives no input a default class | Stacking by default (a Variant input defaults to no class, so the consumer's Sass default is the look; building-blocks 1.4) (`other`); a library rule `.media-object { flex-wrap: wrap; }` (measured: at 1280 px a two-section object without `mainSection` wraps its text below the image in three engines) (`other`); a library rule `min-width: 0; overflow-wrap: anywhere` on sections (measured: fits at 320 px, but the three-section text column is 72 px wide and the two-section example's image section shrinks to 39 px, narrower than its 108 px thumbnail) (`other`) |
| D8 | In development, `NfsMediaObject` observes its host with a `ResizeObserver` and warns once when its content is wider than its box, with both widths | axe has no reflow rule, and the docs' own overflow at 320 px is 15 to 25 px, easy to miss in a narrow window; the host's own `scrollWidth` showed every failing case and no passing one in three engines; resizing is how a developer reaches a narrow width, so a first-render reading alone would miss it; production pays nothing | No check (a silent 1.4.10 failure in Foundation's own examples) (`platform-or-a11y`); one reading at the first render (misses a window narrowed afterwards) (`other`); a check through the Breakpoint service at the Zero breakpoint only (overflow is a layout fault at any width, and the measurement needs no breakpoint) (`other`) |
| D9 | Copied Variant classes are stripped by the class records and reported in development, and copied Flexbox Utilities classes reported by name | Building-blocks 1.4: a directive whose dynamic binding meets a copied Foundation class reports it; the docs' flexbox examples write `.align-self-*` on sections, which this spec does not bind | Reporting only this spec's classes (the docs' flexbox markup would copy classes nobody reports) (`other`) |
| D10 | A section that is not a direct child of a media object warns in development, read from the DOM | A section is laid out only as a flex item or table cell of `.media-object`; a component that renders the section inside its own host makes the host the item, and projection hides DI, so the DOM is the only source; the fix is `hostDirectives` | A parent token with a warning (content projection keeps the declaration site's DI) (`other`); no check (the layout breaks without a message, since `mainSection` and alignment act on the wrong element) (`other`) |
| D11 | Native implementation level; listener-free; every class a host binding in server HTML; no Parent token, providers, or Defaults token | The elements and Foundation's CSS cover everything; nothing links the parts' state | A parent token for the sections (nothing depends on it) (`other`) |
| D12 | No role, name, ARIA, or `tabindex`; the consumer's element carries the meaning; the recipes build a comment thread from nested `article`s with headings | A media object is a layout; WHATWG HTML defines a nested `article` as related to the outer one, with user comments as its example; a list of media objects is a list | A default `role="group"` or `article` (the content decides) (`platform-or-a11y`); a development check for heading structure (axe's best-practice `heading-order` reports it) (`platform-or-a11y`) |
| D13 | No `alt` check and no image directive | The image carries no media-object directive; axe `image-alt` reports a missing `alt` on every run (the Card's D10) | An `alt` check over the sections' images (duplicates axe) (`platform-or-a11y`) |
| D14 | Four stories in Foundation's flexbox build; e2e for 1.4.10 and 1.4.12 at 320 px and the wide layout at 1280 px in three engines, and the fixture app's first paint and hydration | Layer 1 runs at 414 px, the Zero breakpoint, where stacked stories stack; viewport sweeps are Playwright's; the table build is covered by layers 2 and 3, because the preview compiles one build | A story compiled with `$global-flexbox: false` (the preview has one stylesheet) (`other`) |
| D15 | Three glossary terms: **Media Object**, **Main section**, **Flexbox mode** | Foundation's names; "flexbox mode" is the docs' own phrase for the build in which several Variant classes differ | A term for the section (Foundation's class, not domain language) (`other`) |

### Usage examples

```html
<!-- A list of posts, each a media object whose photo and heading link to the post -->
<ul>
  <li nfsMediaObject stackFor="small">
    <div nfsMediaObjectSection>
      <img nfsThumbnail src="/posts/winter.jpg" alt="" width="240" height="160">
    </div>
    <div nfsMediaObjectSection mainSection>
      <h3><a href="/posts/winter-menu">Our winter menu</a></h3>
      <p>Seasonal dishes from local farms.</p>
    </div>
  </li>
</ul>

<!-- All sections vertically centred at once, in the flexbox build -->
<div nfsMediaObject nfsFlexAlign alignY="middle">
  <div nfsMediaObjectSection><img nfsThumbnail src="/avatars/ariadne.jpg" alt="" width="100" height="100"></div>
  <div nfsMediaObjectSection mainSection><h4>Ariadne</h4><p>Architect.</p></div>
</div>
```

```ts
@Component({
  selector: 'app-avatar',
  imports: [NgOptimizedImage, NfsThumbnail],
  hostDirectives: [NfsMediaObjectSection],
  template: `<img nfsThumbnail [ngSrc]="src()" width="100" height="100" alt="" />`,
})
export class Avatar {
  readonly src = input.required<string>();
}
```

```html
<!-- The component's host is the section, so it is a direct child of the media object -->
<article nfsMediaObject>
  <app-avatar src="/avatars/cobb.jpg" />
  <div nfsMediaObjectSection mainSection><h3>Cobb</h3><p>...</p></div>
</article>
```

`<app-avatar>` renders `class="media-object-section"` from the hosted directive, so its host metadata names no Foundation class; to expose `mainSection` or `alignment` it lists them in `hostDirectives`' `inputs`. The avatar's `alt` is empty because the heading beside it names the person. `nfsThumbnail`, `NfsThumbnail`, `nfsFlexAlign`, and `alignY` are the names the [Spec: Thumbnail](../issues/97-spec-thumbnail.md) and the [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md) give; the class-rule consistency review aligns this spec's examples if they differ.

### Platform features to adopt when the browser target moves

- Nothing in the platform research applies. Container size queries are in the Browser target but would stack by the container's width, not by Foundation's viewport breakpoint, which is the documented contract (building-blocks 1.7).

### Foundation behaviour changed or dropped

- The docs' three-section and nested examples stack at the Zero breakpoint in the recipes (D7); Foundation's own markup does not.
- Every image in the recipes has an `alt` (1.1.1), and the Thumbnail directive sits on the `img` itself rather than on a wrapping `div`, as Foundation's Thumbnail docs page directs.
- Comment threads are nested `article`s in the recipes (D12).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-media-object`, configured through the `$mediaobject-*` settings, `$global-flexbox`, `$global-text-direction`, and `$breakpoints`; its flexbox-build alignment relies on `foundation-flex-classes`, whose classes the Flexbox Utilities' directives set (both are in `foundation-everything`). Its documented custom CSS is the `nfs-media-object` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-media-object`.

1. Rules: none that style anything. The mixin writes `:root { --nfs-media-object-section: main-section; }` while `$global-flexbox` is true and `:root { --nfs-media-object-section: middle bottom; }` while it is false (D6), space-separated in the Variant property format. Reason: the Runtime checks' channel for the two flag-gated families (building-blocks 1.13); Foundation cannot provide it.
2. Reused, read from the consumer's compile: `$global-flexbox`, as Foundation's partial reads it at the same point in the compile (after `foundation-everything`, which sets it to true unless called with `$flex: false`). No Foundation value is copied. The mixin takes no parameters.
3. Custom properties the directives write: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: nothing visible breaks, because the mixin styles nothing; while `alignment` or `mainSection` is bound, `strictVariantProperties` reports the missing include once, naming `nfs-media-object`, and `strictVariantNames` stays silent for the section.
6. Variant properties: `--nfs-media-object-section`, the one writer. It is not in the Variant manifest, because it is a flag-gated list, not a registry (the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md)'s rule), so the declaration file never lists it.

Required settings: none. Foundation's defaults pass every criterion the component touches once the content meets the 1.4.10 requirement. `$mediaobject-image-width-stacked: 100%` makes a stacked avatar as wide as the viewport; a consumer who prefers its natural width sets `auto`, Foundation's documented value.

### Notes

- `$global-flexbox: false` builds: `alignment` works and `mainSection` has no rule (table cells size themselves, so nothing is lost; the Runtime check says so once); the Flexbox Utilities' alignment does nothing, and `nfsFlexChild` warns that its parent is not a Flex parent.
- The Zero breakpoint, not the viewport, decides stacking: at 414 px (Vitest's default) and at 320 px the default Breakpoint map is at `small`, so stacked stories stack; from 640 px up they sit side by side.
- A renamed Zero breakpoint that the consumer also removed from `$breakpoint-classes` cannot be named, because `stackFor` is typed over Class breakpoints; Foundation generates `.stack-for-<zero>` regardless. Foundation's docs never show that setup; a consumer who has it declares the name in its Variant declaration file's `NfsBreakpointClassesOverrides`.
- Composition: `nfsMediaObject` beside `nfsFlexAlign`, and `nfsMediaObjectSection` beside `nfsFlexChild`, bind nothing the other binds, and their input names (`stackFor`, `alignment`, `mainSection` against `alignX`, `alignY`, `alignCenterMiddle`, `nfsFlexChild`, `alignSelf`, `order`) are disjoint.
- Forced colours: the media object draws nothing, so nothing changes; a Thumbnail's border is that spec's.
