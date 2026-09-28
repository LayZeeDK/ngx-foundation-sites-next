# Spec: Badge

Ticket: [Spec: Badge](../issues/93-spec-badge.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites who wants to show a count next to something (unread messages, items in a cart, open tasks) writes Foundation's Badge markup: an element, usually a `span`, with the `.badge` class, and a palette class such as `.alert` for its colour. Badge is a CSS-only component: it ships Sass and classes and no Plugin. The docs pair a badge with the element it counts through `aria-describedby`, add context for screen readers with `.show-for-sr` text, and show icon badges. The markup contract leaves the hard parts to the author:

- Foundation's docs say "The default settings meet WCAG 2.0 level AA contrast requirements". They do not: the `alert` badge's `$white` text is 4.498:1 on `#cc4b37` (4.364:1 with `$black`), under the 4.5:1 of WCAG 2.2 success criterion 1.4.3; the badge's `0.6rem` text is far from large text. axe cannot see it on Foundation's own examples: every one of them holds a single character, and axe marks the contrast of one-character text incomplete (`shortTextContent`), so only a longer alert badge is a violation.
- Foundation picks each coloured badge's text from `$badge-color` and `$badge-color-alt` with `color-pick-contrast()`, which compares ratios computed through an approximate luminance and rounded to one decimal. For some colours it picks the text colour that fails while the other passes: on `#e10f69` it picks `$black` at 4.22:1 where `$white` reaches 4.65:1.
- The default badge's text is `$badge-color` on `$badge-background` with no pick at all, so a light `$badge-background` keeps white text.
- The docs describe a heading with `aria-describedby` pointing at a badge beside it. The description is not part of the heading's name (measured in Chromium: the heading "Unread Messages", described by "1"), so a user who moves by headings hears "Unread Messages" and not the count, and screen readers announce descriptions mainly when their element takes focus, which a heading does not.
- The icon examples hold only an icon font glyph, so their badges say nothing to a screen reader, and the colour classes "give badges additional meaning" that only sighted users who perceive colour receive.
- A count that changes after the user's action (items in a cart) is a status message, which nothing announces.
- Under the library's class rule the developer writes no Foundation class at all, so `.badge`, the palette classes, and `.show-for-sr` need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the badge styled before hydration and inside dehydrated `@defer` blocks.

## Solution

One attribute directive, `nfsBadge`, on the element the developer already writes. It binds Foundation's `.badge` class and sets the palette class from a typed `color` Variant input over the names of the developer's `$badge-palette`, Foundation's defaults extended by the developer's Variant declaration file, so a misspelt or removed name fails to compile; no value sets no class, so `$badge-background` is the look. The directive adds no role and declares no listener, so everything it does is a host binding already present in server HTML. In development builds it warns when a badge has no text for a screen reader, such as an icon-only badge, and when Foundation's classes were copied onto it.

A badge sits inside the element it counts, so its text becomes part of that element's content and name (a heading's text, a button's name); a badge beside a button or link is referenced from it with `aria-describedby`. The badge's text, visible or visually hidden, says what the count means and what its colour suggests. A count that the user's action changes is written in a `role="status"` badge the developer adds.

The `nfs-badge` Library mixin stops the compile when a badge's text falls under 4.5:1 on its background, naming the setting, the colour, and both ratios, and gives a coloured badge the better of Foundation's two text colours wherever Foundation's own pick is the worse one. On Foundation's defaults that asks the developer for one setting, a darker alert in `$badge-palette`. The mixin also writes the Variant property that the Runtime checks and the Variant declaration file's generator read.

## User Stories

1. As an application developer, I want to put `nfsBadge` on a `span` and get Foundation's `.badge` look, so that I write no Foundation class.
2. As an application developer, I want `nfsBadge` to work on any element, as Foundation's docs say, so that I choose the element.
3. As an application developer, I want a `color` input that takes the names of my `$badge-palette` (`primary`, `secondary`, `success`, `warning`, `alert` by default), so that I colour badges without writing their classes.
4. As an application developer who adds `purple` to `$badge-palette`, or to `$foundation-palette` in my copy of Foundation's settings file, whose Badge section then follows it, I want `color="purple"` to compile once my Variant declaration file lists it, so that my own colours are typed like Foundation's.
5. As an application developer who removes `secondary` from `$badge-palette`, I want `color="secondary"` to fail to compile, so that a badge never asks for a class my CSS lacks.
6. As an application developer, I want a misspelt colour or a Foundation class name such as `color="badge"` to fail to compile, so that a typo never ships a plain badge.
7. As an application developer, I want no `color` to give me the `$badge-background` look, so that my Sass settings stay the default.
8. As an application developer, I want to bind `[color]` from component state, so that one badge can switch between `success` and `alert` and the binding is type-checked.
9. As an application developer, I want to put a badge inside a heading or a button and have its count become part of the heading's text or the button's name, so that the count is never separated from what it counts.
10. As an application developer, I want a badge beside a button or link to describe it through `aria-describedby`, so that Foundation's pairing still works where the badge cannot sit inside.
11. As an application developer, I want the spec to tell me where `aria-describedby` does not help (a heading or other element that takes no focus), so that I do not rely on a description nobody hears.
12. As an application developer, I want to add visually hidden context to a count with the library's screen-reader-only directive, so that "3" is announced as "3 unread" without writing `.show-for-sr`.
13. As an application developer, I want an icon badge to carry visually hidden text and its icon `aria-hidden`, so that the badge means the same to every user.
14. As an application developer, I want a development warning when a badge has no text for a screen reader, so that an icon-only badge is caught before release.
15. As an application developer, I want that warning to stay silent for a badge I hid from assistive technology on purpose, or one I named as an image, so that correct markup is not reported.
16. As an application developer migrating Foundation markup, I want a copied `class="badge alert"` to be reported in development, so that I learn to bind `color`.
17. As an application developer, I want a development report when I bind a colour my compiled CSS has no class for, or forget the `nfs-badge` include, so that drift between my Sass and my types surfaces early.
18. As an application developer, I want the library's Sass to stop my build when any badge's text is under 4.5:1 on its background, naming the setting, the colour, and both ratios, so that a theme cannot fail silently where axe cannot look.
19. As an application developer on Foundation's defaults, I want the spec to name the one setting that passes, so that I fix the compile error with one line.
20. As an application developer whose brand colour takes white text at 4.65:1, I want the library to use the white text Foundation's rounding rejected, so that a passing colour is not refused.
21. As an application developer, I want a light `$badge-background` with white `$badge-color` to stop the compile, so that the default badge is checked even though Foundation picks nothing for it.
22. As an application developer, I want to show a cart count that the user's click changes in a `role="status"` badge, so that the new count is announced without moving focus.
23. As an application developer, I want `nfsBadge` to leave `role`, `id`, and `aria-*` to me, so that a status badge or a badge a control references composes with the platform.
24. As a screen reader user, I want a heading with a count to include the count in its name, so that heading navigation tells me how many messages are unread.
25. As a screen reader user, I want a button with a count to include the count in its name, so that I hear "Messages 3 unread".
26. As a screen reader user, I want an icon badge to say what its icon means, so that I get what sighted users see.
27. As a screen reader user, I want a count that changes after I add an item to my cart to be announced with its words ("2 items in cart"), so that I know the action worked.
28. As a user with low vision, I want every badge's text to contrast at least 4.5:1 with the badge, so that I can read its small text.
29. As a user who does not perceive colour, I want a badge's text to say what its colour suggests ("urgent", "done"), so that colour is not the only cue.
30. As a user who enlarges text spacing, I want a badge's text to stay on its painted background, so that I can read every character.
31. As a user of a Windows contrast theme, I want badge text and icons to stay visible when the badge's colours are replaced, so that the count survives.
32. As a developer of a server-rendered application, I want the server HTML to carry `.badge` and its palette class, so that the first paint is final and hydration changes nothing.
33. As a developer using `@defer (hydrate never)`, I want a badge there to stay styled, so that static regions look right without JavaScript.
34. As a developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
35. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it.
36. As a library maintainer, I want every behaviour asserted through roles, names, descriptions, classes, and computed colours in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Badge has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's badge Sass partial, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Badge | `.badge` | `@mixin foundation-badge` (in `foundation-everything`) | Structural class on any element ("any tag will work fine"). `display: inline-block`, `min-width: $badge-minwidth` (2.1em), `padding: $badge-padding` (0.3em), `border-radius: 50%`, `font-size: $badge-font-size` (0.6rem), centred text; `background: $badge-background` (`$primary-color`) and `color: $badge-color` (`$white`), with no pick between text colours. For one character at a 16 px root font size, 20.16 px wide and 20.1 to 21.1 px tall by the surrounding line height (measured) |
| Colours | `.primary`, `.secondary`, `.success`, `.warning`, `.alert` | The keys of `$badge-palette` (`@each $name, $color in $badge-palette`, as `.badge.<name>`), which defaults to `$foundation-palette`; Foundation's settings file assigns it from `$foundation-palette` in its Badge section | Open Variant family. Each class sets `background` to its colour and `color` to `color-pick-contrast(<colour>, ($badge-color, $badge-color-alt))`: the first candidate unless the second's ratio, rounded to one decimal through Foundation's approximate `color-luminance()`, is higher |
| Icons | an icon element inside the badge | Foundation's docs (Foundation Icon Fonts glyphs) | No class of Foundation for Sites; the icon is the consumer's |
| Context | `aria-describedby` on the described element pointing at the badge's `id`; `.show-for-sr` text inside the badge | Foundation's docs | `.show-for-sr` is a Visibility class, bound by the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s screen-reader-only directive, `nfsShowForSr` |

Docs conventions kept or corrected: the `span` (kept); `aria-describedby` from a heading to a badge beside it (corrected: the badge goes inside the heading, and `aria-describedby` is used only from a focusable control, D4); `.show-for-sr` context text (kept, as the Visibility Classes directive); icon badges (kept, corrected with hidden text and an `aria-hidden` icon, D5); colour "to give badges additional meaning" (corrected: the text says the meaning, 1.4.1); the AA claim for the default settings (corrected: the alert badge is 4.498:1, and a required setting fixes it, D10).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.badge` | `NfsBadge` (`[nfsBadge]`), static host class | - | - | `badge` | - |
| Palette classes (`.primary`, `.secondary`, `.success`, `.warning`, `.alert` by default) | `color` Variant input of `NfsBadge` | `NfsBadgeColor`, built on `NfsFoundationPaletteColor`, over `$badge-palette`, which defaults to `$foundation-palette`; `NfsBadgePaletteOverrides`, chained on `NfsFoundationPaletteOverrides` (Open Variant family) | a name | the name itself (`color="alert"` sets `.alert`); no value sets none, so `$badge-background` is the look | `--nfs-badge-palette` (`primary secondary success warning alert` by default) |

State classes: none. Foundation's Badge has no State class, and the directive binds no library hook. `.show-for-sr` inside a badge belongs to the Visibility Classes directive written on the consumer's inner element. No class is left for the consumer to write (ADR 0039). Foundation has no responsive badge colour, so `color` takes no Breakpoint query or rules object.

### Hierarchy and DI shape

```
[nfsBadge]      NfsBadge (standalone directive, no template)
```

- One directive, with no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a badge through DI.
- No Defaults token: Badge has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `ElementRef` for the development text check; in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning (D7); the Runtime checks' `nfsVariantCheck()` handle of `ngx-foundation-sites/media-query` ([ADR 0040](../adr/0040-variant-input-types.md)). Nothing else.
- Entry point: `ngx-foundation-sites/badge` (one per Foundation docs page), so a consumer's `@defer` can split it. `NfsBadgeColor` is exported beside the directive; `NfsFoundationPaletteColor`, `NfsFoundationPaletteOverrides`, and `NfsBadgePaletteOverrides` live in the primary entry point `ngx-foundation-sites` and are used here as types only.

### API: `NfsBadge`

Selector `[nfsBadge]`; `exportAs: 'nfsBadge'`; standalone; no template.

```ts
type NfsBadgeColor = NfsOverridableStringUnion<NfsFoundationPaletteColor, NfsBadgePaletteOverrides>;

class NfsBadge {
  readonly color: InputSignal<NfsBadgeColor | undefined>; // default undefined: no class
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `color` | `NfsBadgeColor`, declared with explicit type arguments that name the alias; no transform | `undefined`, which sets no class | `.badge.<color>` from `$badge-palette` | New. The JSDoc names the class template `.badge.<color>` and the setting. The consumer's own names reach the type only through its Variant declaration file; a name added to `$foundation-palette` reaches it through the chain while `$badge-palette` follows `$foundation-palette` |

- Models, outputs, and methods: none. A badge has no state; its count is the consumer's content.
- `exportAs: 'nfsBadge'` exposes the input signal to template references, as `nfsButton`, `nfsCallout`, and `nfsCloseButton` do.

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| static `class` | `badge` |
| `[class]` | one `computed` list: the `color` value when it is one class token; the static class and the consumer's own classes stay, because Angular combines static classes and class bindings |

- The class list binds nothing for a value that is not one class token; under the closed type only a cast or `$any()` reaches that guard, and the Variant check reports it.
- Attribute ownership: the directive owns `.badge` and the Variant class. It never touches `role`, `id`, `aria-*`, or `hidden`, which stay the consumer's: a `role="status"` for a live count (D8), an `id` for `aria-describedby`, `aria-hidden` for a badge whose count is already in its control's name.
- Development-mode checks, in the directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or the Variant check handle is not `null` (never on the server, and in a production build only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on, each once per instance, at the first render, because what they read must be in server HTML:
  1. No text (D5). The host's text, from its text nodes outside any element with `aria-hidden="true"` (visually hidden text counts), is blank, the host is not itself `aria-hidden="true"`, and it is not `role="img"` with a non-blank `aria-label` or `aria-labelledby`: "nfsBadge: this badge has no text for screen readers; add visually hidden text that says what it shows, and aria-hidden="true" on its icon (WCAG 1.1.1). aria-label is not allowed on a badge without a role (axe aria-prohibited-attr)". The last sentence is added only when the host carries `aria-label`.
  2. Copied classes (D7): a static class list that holds Foundation's default palette names warns, naming each class with its input, for example "class="alert" is set by nfsBadge: bind color="alert" instead". A copied Variant class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `badge` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared names are left to the Variant check (the Button spec's D22 rule).
- Runtime check: in the same read phase, on every run, `NfsBadge` calls `include('nfs-badge', ['badge-palette'])` whether or not `color` is bound, then `value('color', color, needs)` with the need `{setting: 'badge-palette', name: color}` for a one-token value and `null` otherwise (D11). `strictVariantNames` compares a bound `color` with `--nfs-badge-palette` and reports a value that is not one class token; `strictVariantProperties` reports a missing `@include nfs-badge;` when that property reads empty. Only `nfs-badge` writes it, so the one-writer rule holds. The report shape, the per-realm read, and the configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).

### Comparison with Angular Material (22.2)

| Concern | Material `MatBadge` | `NfsBadge` |
| --- | --- | --- |
| Selector and kind | `[matBadge]` on the host it decorates; it creates the badge `span` itself, appended to the host, from the `matBadge` content input | `[nfsBadge]` on the badge element the consumer writes, as Foundation's markup has it; its content is the consumer's |
| Announcement | The created badge is `aria-hidden="true"`; `matBadgeDescription` describes the host through CDK `AriaDescriber` when the host is focusable, and is written inline as visually hidden text when it is not ("We don't add `aria-describedby` for non-interactive hosts elements because we instead insert the description inline") | The badge's own text, visible and visually hidden, read in place inside the element it counts; `aria-describedby` from a focusable control to a badge beside it (D4) |
| Colour | `matBadgeColor` palette string (M2) | `color` Variant input over `$badge-palette`, typed through the Variant registry |
| Layout | `matBadgeOverlap`, `matBadgePosition`, `matBadgeSize` | None: Foundation's badge is an inline block in the flow, with no position or size |
| Hiding | `matBadgeHidden`, and hidden while the content is empty | The consumer's `@if` |
| Testing | `MatBadgeHarness` | DOM-first assertions; no harness |

Borrowed: the rule that `aria-describedby` suits focusable hosts only and that elsewhere the text belongs inline (D4). Not borrowed: creating the badge element (Foundation's markup carries it, ADR 0001), overlap, position, size, the hidden input, and `AriaDescriber` (the text is already in the DOM where it is read).

### Implementation level and primitives

Implementation level: native platform. The badge is the consumer's element with Foundation's CSS; its meaning is text in the DOM; a live count is a native `status` live region the consumer writes. `@angular/aria` has no badge or status pattern in 22.2, and `@angular/cdk` has nothing to add: `AriaDescriber` and `LiveAnnouncer` would copy text the page already holds. The Angular layer is two host bindings over one `input()` signal, one `computed` class list, a development-only render callback, and the Runtime check requests. No `effect`, no listener, no timer, no observer.

Fallback: none needed. The risks the directive and mixin own, text contrast and Foundation's text colour pick, were measured by this spec's ticket with the exact formula and axe, and the geometry of text on the painted ellipse in three engines.

### ARIA and keyboard

APG pattern: none for a badge, which is text. A count that reports the result of the user's action is a `status` live region (WAI-ARIA `status`; WCAG 4.1.3). A badge inside a control follows that control's pattern.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsBadge]` | The host element's own role (`generic` for a `span`); its text is content of whatever contains it; the directive adds no role, name, or state | WHATWG HTML; HTML-AAM |
| A badge inside a heading, button, or link | Its text is part of that element's name: measured in Chromium, "Unread messages 1 unread message" for a heading, "Messages 3 unread" for a button (the visible count first, so 2.5.3 holds) | accname (name from content) |
| A badge beside a focusable control | The control's `aria-describedby` references the badge's `id`: measured, the button "Cart" with the description "2 items" | APG "Providing Accessible Names and Descriptions"; Angular Material's badge |
| A badge beside a heading or other element that takes no focus | Not referenced: it goes inside the element instead. Chromium exposes a heading's description (measured), but screen readers announce descriptions chiefly on focus | Angular Material's badge (inline text on non-interactive hosts) |
| Colour | Not exposed; the text says what the colour suggests (1.4.1) | WCAG 2.2 |
| Icon | `aria-hidden="true"` on the icon, visually hidden text in the badge; or the badge `role="img"` with an `aria-label` (measured: the image "Done"). A bare `aria-label` on a `span` badge is prohibited (axe `aria-prohibited-attr`, measured) | WAI-ARIA `generic` (naming prohibited); `img` |
| A count the user's action changes | The consumer's `role="status"` on the badge, which exists before the count changes and holds the whole message ("2 items in cart"); `status` is atomic by default, so the words are read with the number | WAI-ARIA `status`; the Understanding document for 4.1.3 (its shopping-cart examples) |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Skips the badge, which is not focusable; reaches the control that holds or references it | Native |

Focus: the directive moves no focus. A badge is not a control: a `button` or link carries the count, and the badge sits inside it or beside it (D12).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios were computed by this spec's ticket with the exact WCAG relative-luminance formula (`math.pow`) from Foundation 6.9.0's default settings, unrounded, never Foundation's `color-luminance()` or `color-contrast()` (the [Spec: Top Bar](../issues/86-spec-top-bar.md) measured the first's false passes); axe computes from rendered 8-bit colours, so its figures differ in the second decimal. Geometry was measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.3 Contrast (Minimum) | Every badge's text reaches 4.5:1 on its background; the badge's `0.6rem` normal-weight text is never large text. The pairs: `$badge-color` on `$badge-background` for the uncoloured badge (Foundation picks nothing there); for each `$badge-palette` entry, the better of `$badge-color` and `$badge-color-alt` by the exact ratio, which `nfs-badge` applies where Foundation's `color-pick-contrast()` picked the other (D9). `nfs-badge` stops the compile with one `@error` naming the setting, the palette name, the colour, and both ratios for every pair under 4.5:1 (D8). Required consumer setting on Foundation's defaults: `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));` (5.255:1 with `$white`), the alert the Button, Abide, and Progress Bar specs already require (D10) | Fails on alert: `$white` 4.498:1 on `#cc4b37`, `$black` 4.364:1; passes on the uncoloured and primary badge (4.647:1), secondary (4.504:1), success and warning (`$black` 10.91 and 10.66:1). axe marks the contrast of one-character text incomplete (`shortTextContent`), so on Foundation's own examples ("1", "A") it reports no violation; on "12" or "New" it reports 4.49 | Node-level Sass compile test; axe `color-contrast` in every story under the Storybook settings overrides; `badge--colors` asserts each badge's computed text colour |
| 1.4.1 Use of Color | A coloured badge's text, visible or visually hidden, says what its colour suggests ("3 urgent", "Done"); the colour is a look. The directive cannot check wording; the docs require it, every recipe shows it, and every story's play function asserts it, as the Callout requires its text to name its kind | Foundation's docs add colour "to give badges additional meaning" and say it only in colour | Play functions of `badge--colors` and `badge--icons` assert each badge's text |
| 1.1.1 Non-text Content | An icon badge carries text for screen readers (visually hidden text with an `aria-hidden` icon, or `role="img"` with an `aria-label`); the directive warns in development when a badge has none (D5) | Foundation's icon examples have no text, and axe reports nothing for them | Browser-level tests of the check; play function of `badge--icons` finds each badge's text |
| 1.4.11 Non-text Contrast | An icon draws in `currentColor`, so it takes the badge's text colour, which reaches 4.5:1 and so 3:1. The painted circle against the page needs no ratio: a badge is not a user interface component, and its text carries its information | Foundation's icon font glyphs are text in the text colour | `badge--icons` asserts each icon's computed stroke equals its badge's computed colour |
| 1.3.1 Info and Relationships | A badge's relationship to what it counts is programmatic: it sits inside that element, or a focusable control references it with `aria-describedby` (D4) | Foundation's heading example references the badge from an element that takes no focus | `badge--in-controls` asserts the heading's and button's names and the link's description |
| 2.5.3 Label in Name | A badge inside a control adds its visible count to the control's visible label, and the name starts with the visible words ("Messages 3 unread") | Passes | `badge--in-controls` finds the button by its full name |
| 4.1.3 Status Messages | A count that changes as the result of the user's action is announced without moving focus: the consumer writes `role="status"` on the badge, which exists before the change and holds the whole message. A count that changes on its own (a background poll) is the consumer's choice, because a status region would speak every change. The directive adds no role (D8) | Foundation's docs add none | `badge--status`: after the click the status badge's text is "1 item in cart" and focus stays on the button |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, a badge's text stays on its painted background. Foundation's badge has no fixed size and grows with its text, but its `border-radius: 50%` paints an ellipse; measured, the text's line box, which bounds its glyphs, stays inside the ellipse up to three characters ("99+") in every engine with the text spacing, and a fourth character crosses it in Chromium (a corner at 1.05 in the ellipse's equation, where 1 is its edge). The docs keep a badge to a count of up to three characters, a letter, or an icon, and send longer text to a Label (D13) | Foundation's examples are one character | e2e in three engines at 320 by 640 px with the text-spacing stylesheet: every badge's text line box in `badge--default`, `badge--colors`, and `badge--in-controls` lies inside its ellipse |
| 1.4.10 Reflow | A badge is an inline block with no fixed width; at 320 CSS px nothing scrolls sideways | Passes | e2e at 320 by 640 px: `scrollWidth` is at most 320 in `badge--in-controls` |
| 2.5.8 Target Size (Minimum) | A badge is never a target: at Foundation's defaults it is 20.16 px across, and a link or button that is only a count would also be named by the number alone. The control that holds it meets 2.5.8 by its own spec (the `nfs-button` floor) | Foundation's badges are not controls | axe `target-size` in every story |
| 4.1.2 Name, Role, Value | The directive changes no role, name, or state | Passes | axe in every story; every play function finds controls by `getByRole` and name |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). Because axe marks one-character badges incomplete, the compile-time check is the only check that sees Foundation's own alert example.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directive declares no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfsbadge=""`, `color="alert"`), which the resulting DOM below leaves out, as the other specs do. `nfsShowForSr` is the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive for `.show-for-sr`, imported as `NfsShowForSr` from `ngx-foundation-sites/visibility`; its class belongs to that spec and is shown only to place it.

```html
<!-- Basics: the badge inside the heading it counts -->
<h2>Unread messages <span nfsBadge>1<span nfsShowForSr> unread message</span></span></h2>

<h2>Unread messages <span class="badge">1<span class="show-for-sr"> unread message</span></span></h2>

<!-- A coloured badge inside a button: the count joins the button's name -->
<button nfsButton>Messages <span nfsBadge color="alert">3<span nfsShowForSr> unread</span></span></button>

<button class="button" type="button">Messages <span class="badge alert">3<span class="show-for-sr"> unread</span></span></button>

<!-- A badge beside a link, referenced as its description -->
<a href="/cart" aria-describedby="cart-count">Cart</a>
<span nfsBadge id="cart-count">2<span nfsShowForSr> items</span></span>

<a href="/cart" aria-describedby="cart-count">Cart</a>
<span class="badge" id="cart-count">2<span class="show-for-sr"> items</span></span>

<!-- An icon badge: the icon is hidden, the text says what it means -->
<span nfsBadge color="success"><svg aria-hidden="true" ...><path stroke="currentColor" .../></svg><span nfsShowForSr>Done</span></span>

<span class="badge success"><svg aria-hidden="true" ...><path stroke="currentColor" .../></svg><span class="show-for-sr">Done</span></span>
```

Server and hydrated DOM are identical for every example: the classes are a static host class and a host binding on signal state.

### Animation

None. Foundation's badge partial declares no transition, and the library adds none; a badge that appears or disappears with `@if` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.badge` and the Variant class exactly as the hydrated DOM does, so the first paint is final, and the badge's text, the consumer's content, is in the server HTML for assistive technology.
- Before hydration: the directive touches no DOM outside host bindings, measures nothing, and starts no timer. The development checks and the Runtime check requests run in a render callback, a no-op on the server.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own. A `role="status"` badge whose count a control changes belongs to that control's Hydration boundary, so the update that the announcement follows runs once the block hydrates.
- Event replay: `NfsBadge` declares no listener and adds no `jsaction`; a pre-hydration click on the control that changes a count replays through that control's own listener.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a badge is its server HTML. Inside `@defer (hydrate never)` it stays styled at its server count for good, which suits a static count and not a live one; live counts do not go in `hydrate never`.
- Prerendering: identical to SSR; the directive reads no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, the computed background and text colour, the accessible names and descriptions, the status region's text, where focus lands, and where the text sits on the painted badge. No test reads the directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Callout](../issues/89-spec-callout.md)'s and [Spec: Progress Bar](../issues/95-spec-progress-bar.md)'s tests, the nearest precedents.

Story ids follow `badge--<story>`: `badge--default`, `badge--colors`, `badge--icons`, `badge--in-controls`, `badge--status`. `meta.component` is `NfsBadge`; `color` is an arg. Stories use Foundation's default names only, so the library's Storybook program needs no Variant declaration file (ADR 0040). The Storybook settings overrides carry this spec's required setting (Sass subsection), and the preview includes `nfs-badge`. Every story's badges say their meaning in text, visible or visually hidden.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `color-contrast`, `aria-prohibited-attr`, `button-name`, `link-name`, and `target-size`). No story element carries a Foundation class written in the story.

- `badge--default`: Foundation's Basics as a heading with a badge inside ("Unread messages", "1", and the hidden " unread message"). The badge carries `.badge` and no role; its computed background is Foundation's `$badge-background` and its text colour `$badge-color`; the heading is found by `getByRole('heading', {name: 'Unread messages 1 unread message'})`.
- `badge--colors`: Foundation's Coloring example, one badge per default palette name plus one with no `color`, each in a list item whose text and the badge's hidden text name its meaning. Each carries its name's class; each computed background differs from the uncoloured one except `primary`'s, which equals it; the computed text colour is `$white` on the uncoloured, primary, secondary, and alert badges and `$black` on success and warning; axe passes `color-contrast` under the required setting (one-character badges are incomplete in axe, which the compile test covers).
- `badge--icons`: Foundation's Icons example with inline SVG icons (`aria-hidden="true"`, `stroke` or `fill` in `currentColor`) and hidden text ("Shared", "Done", "Needs repair") on secondary, success, and warning badges, and one `role="img"` badge named by `aria-label`. Each badge's text, or the image's name, is found; each icon's computed stroke equals its badge's computed colour.
- `badge--in-controls`: a button with an alert badge inside, found by `getByRole('button', {name: 'Messages 3 unread'})`; a link "Cart" whose `aria-describedby` references a badge beside it, which the play function asserts with `toHaveAccessibleDescription('2 items')`; the Basics heading again. The button's box is at least 24 by 24 CSS px (the Button's floor, asserted here because the story renders it); the link is inline text, which 2.5.8 exempts.
- `badge--status`: an "Add to cart" button and a `role="status"` badge beside a "Cart" link that reads "0 items in cart" (the words hidden); after a click the badge's text is "1 item in cart", after a second "2 items in cart", and focus stays on the button.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directive over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data: `.badge` is present; every default colour sets exactly its class; no value sets none; a value reached through `$any()` that contains a space sets none; changing `color` swaps its class and leaves `.badge`, the consumer's own static class and `[class]` binding alone; the directive adds no attribute (`role`, `aria-*`, `id`, `hidden` stay as written).
- Development text check: a badge with text, with only visually hidden text, and with an `aria-hidden` icon beside hidden text is silent; an icon-only badge warns once; a badge whose only text is inside `aria-hidden="true"` warns; `aria-label` on a badge without a role warns with the `aria-prohibited-attr` sentence; `role="img"` with `aria-label` or `aria-labelledby` is silent; a host with `aria-hidden="true"` is silent; the check runs once, so text that arrives after the first render is not re-checked (documented).
- Copied classes: `class="badge alert"` warns once naming `color`; a redundant `class="badge"` and the consumer's own class do not warn.
- Nothing is checked or warned when `ngDevMode` is false.
- Runtime check: with `--nfs-badge-palette: primary secondary success warning alert` on the test document, a listed `color` is silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$badge-palette`; in a test file of its own, with the property absent, a badge with no `color` reports `strictVariantProperties` once, naming `@include nfs-badge;`.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with a plain badge in a heading, an alert badge in a button, a badge referenced by a link's `aria-describedby`, and a `role="status"` badge. `whenStable()` resolves; the server HTML carries `class="badge"`, the Variant class, the consumer's `id`, `role`, and hidden text; no element carries `jsaction` from the directive; no development warning or Runtime check report is made on the server.
- Sass compile, over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';`:
  - Foundation's defaults plus `@include nfs-badge;` stop with one `@error` naming `$badge-palette` alert `#cc4b37` with `$badge-color` at 4.498:1 and `$badge-color-alt` at 4.364:1.
  - With the required setting the include compiles and emits exactly `:root { --nfs-badge-palette: primary secondary success warning alert; }`, and no other rule.
  - `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` alone in the overrides file still stops the compile naming `#cc4b37`, because the settings file assigned `$badge-palette` before it (D10).
  - Foundation's docs palettes compile: the required setting merged with `purple: #bb00ff` lists `purple` (4.569:1 with `$white`); the custom palette `(black: #000000, red: #ff0000, purple: #bb00ff)` writes `--nfs-badge-palette: black red purple` and no rule (Foundation picks `$black` on red, 4.951:1).
  - A palette entry `pink: #e10f69` emits `.badge.pink { color: #fefefe; }`: Foundation picks `$black` (4.218:1), and `$white` reaches 4.654:1 (D9).
  - An entry `rgba(#1779ba, 0.5)` is composited over `$body-background` and emits a `$black` text rule, which Foundation's pick, blind to the alpha, does not give it.
  - An entry `#777777` stops the compile (4.440 and 4.421:1), and so does `#1177dd` (4.424 and 4.437:1), which Foundation's `color-luminance()` reports as 4.505:1 with `$black`, so the test pins the exact helper.
  - `$badge-background: #ffae00` with the default `$badge-color` stops the compile naming `$badge-color` on `$badge-background` at 1.84:1; with `$badge-color: $black` it compiles.
  - `$badge-palette: ()` writes an empty `--nfs-badge-palette` and no rule.
- Pure logic: none worth isolating; the value-to-class mapping is covered through the DOM in layer 2.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Text spacing (1.4.12) in three engines: at 320 by 640 px with a stylesheet that sets line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em on every element, every badge's text line box in `badge--default`, `badge--colors`, and `badge--in-controls` lies inside the ellipse its border box paints.
- Reflow (1.4.10) in three engines: at 320 by 640 px, `document.documentElement.scrollWidth` is at most 320 in `badge--in-controls`.

Against the prerendered fixture app, on the Badge route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; the badges carry their classes and text before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

Manual release test (ADR 0022): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, `badge--in-controls` announces the button's name with its count and the link's description, and `badge--status` announces "1 item in cart" after the click without moving focus.

## Out of Scope

- Creating the badge from an input on the element it decorates, and Material's overlap, position, size, and hidden inputs: Foundation's badge is an element the consumer writes, in the flow, with no position or size; `@if` hides it. Category: `scope-boundary`.
- A default live role, a `role` or politeness input, or a library announcer (D8): the consumer's native `role="status"` covers the case, and only the consumer knows which counts are status messages. Category: `platform-or-a11y`.
- An input that writes `aria-describedby` on the element a badge describes: the native attribute on the consumer's element does it, and a badge inside its element needs none (D4). Category: `platform-or-a11y`.
- A development warning for a badge on a link or button (D12): not Foundation's documented markup, and axe's `target-size` and a play function's name query catch a crowded or badly named one; additive later. Category: `platform-or-a11y`.
- A forced-colours rule: measured, badge text and a `currentColor` icon stay CanvasText on Canvas in Chromium and Firefox, and the text carries the meaning. Category: `platform-or-a11y`.
- The screen-reader-only directive for `.show-for-sr`: the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md). Category: `scope-boundary`.
- Foundation Icon Fonts (`fi-*`), a separate package the docs use for the Icons example: any icon works, and an icon library's classes are the consumer's own. Category: `scope-boundary`.
- Foundation's Label (`.label`), the rectangular tag for longer text: the [Spec: Label](../issues/94-spec-label.md). Category: `scope-boundary`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `[nfsBadge]`, on any element, binding `.badge`; `exportAs: 'nfsBadge'`; entry point `ngx-foundation-sites/badge` | ADR 0001 and ADR 0039: `.badge` is a Structural class on a consumer-written element ("any tag will work fine"), and Foundation generates nothing; parity with `nfsButton` and `nfsCallout` at no code cost | An `nfs-badge` component, or Material's decorating directive that creates the badge (Foundation's markup carries the element; ADR 0001) (`scope-boundary`) |
| D2 | `color` Variant input, alias `NfsBadgeColor = NfsOverridableStringUnion<NfsFoundationPaletteColor, NfsBadgePaletteOverrides>` | ADR 0040 and building-blocks 1.3, 1.4: the palette is an Open Variant family named `color`; `$badge-palette` is its own setting that defaults to `$foundation-palette`, so its registry chains on the shared one, as `NfsButtonColor` does for `$button-palette` | The Callout's plain alias of `NfsFoundationPaletteColor` (a consumer's `map-remove` on `$badge-palette` alone could not remove a name) (`other`); consumer-written palette classes (ADR 0039) (`variant-as-class`) |
| D3 | No State classes, role, ARIA, outputs, methods, models, Defaults token, or providers | A badge is text and has no state; the consumer's element and native attributes carry every relationship | A `hidden` input for an empty count (a second spelling of `@if`) (`scope-boundary`) |
| D4 | A badge sits inside the element it counts; `aria-describedby` references a badge only from a focusable control beside it; Foundation's heading example is corrected | Inside, the count is part of the heading's text and the control's name (measured in Chromium), so heading and control navigation carry it; a description is not part of the name, and screen readers announce it mainly on focus, which a heading never takes; Angular Material's badge makes the same split between focusable and other hosts | Foundation's heading `aria-describedby` kept (Chromium exposes it, but heading navigation drops the count) (`platform-or-a11y`); an input that writes the reference on another element (the native attribute already does it) (`platform-or-a11y`) |
| D5 | A development warning, once at the first render, for a badge with no text outside `aria-hidden` subtrees, unless the host is `aria-hidden` or `role="img"` with a name | Foundation's icon examples say nothing to a screen reader and axe reports nothing for them (measured); a bare `aria-label` on a `span` is prohibited (axe `aria-prohibited-attr`, measured), so it does not count; the Progress Bar's name check shape; the text must be in server HTML | An `aria-label` input (prohibited on a generic badge, and it would hide the visible count from assistive technology) (`platform-or-a11y`); re-checking on every render (a count that arrives later is the consumer's content, and a MutationObserver for a development check costs more than it finds) (`other`) |
| D6 | The badge's text, visible or visually hidden, says the count's meaning and what its colour suggests; stated as a requirement, shown in every recipe, asserted by every story | 1.4.1 and 1.3.1: a bare "3" in a red circle says "urgent" only in colour; the directive cannot read wording, so the requirement is content, as the Callout's and Progress Bar's are | A check for digit-only text (a count's meaning can come from its surroundings, and the check would warn on correct markup) (`other`) |
| D7 | A development warning for Foundation's default palette names copied onto the host | Building-blocks 1.4 and the Button's D22; every Foundation badge example writes `class="badge <color>"` | No check (a silent second spelling) (`other`) |
| D8 | No default live role; the consumer writes `role="status"` on a badge whose count changes after the user's action | The Understanding document for 4.1.3 names this case ("After a user presses an Add to Shopping Cart button, a section of content near the Shopping Cart icon adds the text "5 items"") and advises marking the whole "3 items" string as the status text, with offscreen words such as "in shopping cart"; most badges are static counts, and a count that polls in the background would speak every change | `role="status"` on every badge (announces background polls, and a status region inside a button is presentational) (`platform-or-a11y`); CDK `LiveAnnouncer` (announces a copy through its own element; the in-place region survives server rendering) (`platform-or-a11y`) |
| D9 | `nfs-badge` gives a coloured badge the better of `$badge-color` and `$badge-color-alt` by the exact ratio wherever Foundation's `color-pick-contrast()` picked the other; on Foundation's defaults it emits no such rule | Measured: Foundation's pick compares ratios through its approximate luminance rounded to one decimal and keeps the first candidate on a tie; on an RGB grid in steps of 15 it picked the failing candidate for 9 of the 352 colours where exactly one candidate passes and the better one is under 4.8:1 (`#e10f69`, `#c30fe1`, `#d20fb4` among them: `$black` at about 4.22:1 where `$white` reaches about 4.65:1), and it ignores the alpha of a translucent entry; the Progress Bar's D8 also picks by the exact ratio; one declaration, only where it differs | Check only, naming both ratios (a passing brand colour would stop the compile for Foundation's arithmetic, and the fix would be a different colour) (`other`); raising `$global-color-pick-contrast-tolerance` (changes every component's pick) (`other`); a text rule on every entry (copies what Foundation already emits correctly) (`other`) |
| D10 | Required setting on Foundation's defaults: `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));` | Alert fails with both candidates (4.498 and 4.364:1), so only its colour can change; `#bf3f2c` is the alert the Button, Abide, and Progress Bar specs require (5.255:1 with `$white`); measured, Foundation's settings file assigns `$badge-palette` from `$foundation-palette` in its Badge section, so an overrides file after it that merges `$foundation-palette`, as the Progress Bar's required line does in the Storybook preview, leaves `.badge.alert` at `#cc4b37` | Requiring the `$foundation-palette` line alone (it reaches badges only in a consumer's own copy of the settings file, where the Badge section follows the palette) (`other`); a library rule recolouring `.badge.alert` (re-implements a Foundation style) (`other`); `@warn` (a consumer on Foundation's defaults would ship failing text that axe cannot see) (`platform-or-a11y`) |
| D11 | The Runtime check: `include('nfs-badge', ['badge-palette'])` on every run and `value()` for a bound colour; `--nfs-badge-palette` has one writer | The include carries the contrast check and the pick correction, so a missing one is worth reporting where no `color` is bound; `$badge-palette` is the Badge's own setting, so no second mixin writes its property | Reading `--nfs-foundation-palette` (another entry point's property, and not the setting the classes loop over) (`other`) |
| D12 | A badge is never a control: a link or button carries the count, with the badge inside or beside it; documented, not checked | At Foundation's defaults a badge is 20.16 px across, under 2.5.8's 24 px, and a link that is only a count is named by the number; Foundation's docs never make a badge a control | A development warning on a `button`, `a[href]`, or focusable host (not documented markup; axe `target-size` and name queries catch a crowded or badly named one) (`platform-or-a11y`) |
| D13 | A badge holds a count of up to three characters, a letter, or an icon; longer text is a Label | Measured in three engines with the 1.4.12 text spacing: the text's line box stays inside the painted ellipse up to three characters and a fourth crosses it in Chromium, where `$badge-color` text would sit on the page | A library rule that squares the badge for long text (a different look; Foundation's Label is that look) (`other`); a development check on text length (the line box overstates the glyphs, and a check would warn on four slim digits that fit) (`other`) |
| D14 | Native implementation level; no Aria, no CDK; listener-free | The element, Foundation's CSS, and native live regions cover everything; host bindings render on the server | CDK `AriaDescriber` for descriptions (the text is already in the DOM beside the control) (`platform-or-a11y`) |
| D15 | Five stories; e2e only for 1.4.12 geometry and reflow in three engines and the fixture app's first paint and hydration; a manual screen-reader release test | Geometry needs real engines; Storybook's layer runs in Chromium; announcements need assistive technology | A forced-colours e2e (measured once; the library adds nothing there) (`platform-or-a11y`) |
| D16 | One glossary term, **Badge** | Foundation's name for the component; distinct from the Label and from Material's decorating badge | Also a term for the pick correction (an implementation rule, not domain language) (`other`) |

### Usage examples

```html
<!-- A heading with its count -->
<h2>Invoices <span nfsBadge color="warning">4<span nfsShowForSr> overdue</span></span></h2>

<!-- A button whose name carries the count -->
<button nfsButton>Messages <span nfsBadge color="alert">3<span nfsShowForSr> unread</span></span></button>

<!-- An icon badge -->
<span nfsBadge color="success">
  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10"><path d="M1 5l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2" /></svg>
  <span nfsShowForSr>Done</span>
</span>
```

```ts
@Component({
  selector: 'app-cart-button',
  imports: [NfsBadge, NfsButton, NfsShowForSr],
  template: `
    <button nfsButton (click)="add()">Add to cart</button>
    <a href="/cart" aria-describedby="cart-count">Cart</a>
    <!-- The status badge exists before the count changes and holds the whole message -->
    <span nfsBadge id="cart-count" role="status">
      {{ count() }}<span nfsShowForSr> {{ count() === 1 ? 'item' : 'items' }} in cart</span>
    </span>
  `,
})
export class CartButton {
  protected readonly count = signal(0);

  protected add(): void {
    this.count.update((n) => n + 1);
  }
}
```

The consumer's Variant declaration file, as the library's tooling generates it from `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c, purple: #bb00ff));`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsBadgePaletteOverrides {
    purple: true;
  }
}
```

With it, `color="purple"` compiles on badges; `color="pruple"` fails with the compiler's suggestion (ADR 0040). The `nfs-badge` check then also covers the purple badge's text (4.569:1 with `$white`).

`NfsButton` and `NfsShowForSr` are shown only to place them; their names and inputs belong to their own specs.

### Platform features to adopt when the browser target moves

- Nothing in the platform research applies: the directive binds classes only, and no rule depends on the badge's content.

### Foundation behaviour changed or dropped

- The docs' heading `aria-describedby` becomes a badge inside the heading; `aria-describedby` stays for a focusable control beside a badge (D4).
- Icon badges carry text for screen readers (D5), and every coloured badge's text says its meaning (D6).
- A coloured badge whose Foundation pick is the worse text colour gets the better one (D9); on Foundation's defaults nothing changes.
- On Foundation's defaults, `nfs-badge` stops the compile until the alert badge passes, so `$badge-palette`'s alert becomes `#bf3f2c` (D10).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-badge` (part of `foundation-everything`), configured through the `$badge-*` settings. Its documented custom CSS is the `nfs-badge` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-badge`.

1. Rules. (a) For each key of `$badge-palette` whose better text colour by the exact ratio, `$badge-color` or `$badge-color-alt`, is not the colour Foundation's `color-pick-contrast($color, ($badge-color, $badge-color-alt))` returns: `.badge.<name> { color: <the better one>; }`. Reason: WCAG 2.2 success criterion 1.4.3; Foundation picks through its approximate luminance, rounded to one decimal, and without compositing a translucent entry, so it can pick the failing candidate while the other passes (D9). The selector equals Foundation's in specificity and follows it in source order, and only `color` differs. On Foundation's defaults, and with the required setting, the mixin emits no such rule. (b) `:root { --nfs-badge-palette: <keys>; }`, the Variant property in (6). (c) Compile-time checks that emit no CSS, D8: one `@error` listing every failing pair, each with the setting, the palette name, the colour, and both ratios, computed by the library's exact relative-luminance helper (`math.pow`, a translucent colour composited over `$body-background` first), unrounded: `$badge-color` on `$badge-background` under 4.5:1, and every `$badge-palette` entry whose better candidate is under 4.5:1.
2. Reused, read from the consumer's compile: `$badge-background`, `$badge-color`, `$badge-color-alt`, `$badge-palette`, `$body-background`, and Foundation's `color-pick-contrast()`, called only to learn which colour Foundation emitted. No Foundation value is copied; 4.5 is WCAG's number. The mixin takes no parameters.
3. Custom properties the directive writes: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: the contrast checks do not run, so Foundation's 4.498:1 alert badge compiles silently, and axe marks it incomplete on one-character badges, so nothing reports it; a badge whose Foundation pick is the worse colour keeps failing text; the Variant property is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D11), and the Variant declaration file's generator cannot list the badge's colours.
6. Variant properties: `--nfs-badge-palette`, the keys of `$badge-palette` (`primary secondary success warning alert` by default), joined with `space`, because Sass interpolates a key list with commas, and written empty (`#{''}`) when the palette is empty, because Sass cannot print an empty list; such a consumer opts `strictVariantProperties` out, as the Callout's consumer without sizes does. Only `nfs-badge` writes it.

Required setting on Foundation's defaults, which the Storybook settings overrides mirror with the axe rule and the stories named in their comment:

```scss
$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));
```

In a consumer's own copy of Foundation's settings file, this is the Badge section's `$badge-palette` line; alternatively the alert entry of `$foundation-palette` there changes to `#bf3f2c`, the Progress Bar's required setting, and the Badge section's `$badge-palette: $foundation-palette;` then follows it. An overrides file imported after Foundation's settings, as the Storybook preview's is, needs this line even when it also merges `$foundation-palette`, because the settings file has already assigned `$badge-palette` (measured).

### Notes

- RTL: a badge is an inline block with centred text and a circular background; nothing flips, and no rule or `Directionality` is needed.
- Forced colours: measured in Chromium and Firefox, the badge's background takes Canvas and its text and a `currentColor` icon take CanvasText, so the circle disappears and the count stays; the text carries the meaning (D6).
- Inside a `.button` the badge inherits the button's `line-height: 1` and is 20.16 by 15.34 px (measured); its own background and text colour are unchanged, so its pair is still the Badge's.
- A badge beside a heading, as in Foundation's docs, reads after the heading in the reading order; put it inside the heading instead (D4).
- Composition: `nfsBadge` binds nothing another directive binds; a consumer's `role`, `id`, and `aria-*` on the same element stay theirs.
