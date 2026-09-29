# Spec: Callout

Ticket: [Spec: Callout](../issues/89-spec-callout.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites who wants a highlighted block of content (a notice, a tip, an error summary, an aside) writes Foundation's Callout markup: an element with the `.callout` class, a palette class such as `.alert` for its colour, and `.small` or `.large` for its padding. Callout is a CSS-only component: it ships Sass and classes and no Plugin. To make it dismissible, Foundation's docs pair it with a Close Button and the `data-closable` attribute, which Foundation's JavaScript fades out. The markup contract leaves the hard parts to the author:

- Every one of Foundation's callout examples holds a link, and its docs say "Links inside the callout will be tinted to match the color of the callout". They are not: Foundation removed the tint in 2015 and left the `$callout-link-tint` setting and the sentence behind. Links keep `$anchor-color` (`#1779ba`), which reaches only 3.83:1 to 4.26:1 on the primary, secondary, success, warning, and alert callouts, under the 4.5:1 of WCAG 2.2 success criterion 1.4.3 (axe reports 3.82 to 4.25).
- The close button's glyph, `$closebutton-color` (`#8a8a8a`), reaches 2.82:1 to 2.87:1 on the primary, secondary, and alert callouts, under the 3:1 of 1.4.11, and axe cannot see it: it marks the glyph's contrast incomplete. Foundation's first closable example is an alert callout.
- The close button is absolutely positioned over the callout's content box, in its top right corner. With the text spacing of 1.4.12 at a 320 CSS px viewport, the heading of Foundation's own second closable example runs under the glyph in Chromium, Firefox, and WebKit (measured).
- A coloured callout looks like an alert but is only a `div`: nothing announces one that appears after an action, and its colour is the only thing that says "error" unless the text says it too.
- `data-closable` fades the callout out with jQuery and leaves focus on the hidden close button.
- Under the library's class rule the developer writes no Foundation class at all, so `.callout`, its palette classes, and its sizes need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the callout styled before hydration and inside dehydrated `@defer` blocks.

## Solution

One attribute directive, `nfsCallout`, on the element the developer already writes. It binds Foundation's `.callout` class and sets the palette and size classes from two typed Variant inputs, `color` and `size`. Colours are the names of the developer's `$foundation-palette` and sizes the keys of `$callout-sizes`, Foundation's defaults extended by the developer's Variant declaration file, so a misspelt or removed name fails to compile; an unset input sets no class, so the Sass settings decide the look. The directive adds no role and declares no listener, so everything it does is a host binding already present in server HTML.

A dismissible callout is composed, never configured. To hide it in place, as Foundation's `data-closable` did, the callout is also a Toggler in visibility mode, and its close button is an `nfsCloseButton` with a bare `nfsClose` beside it; to remove it, the developer wraps it in `@if` and closes it from the close button's `(click)` handler. Either way the developer moves focus to a logical next element once the callout is gone. When a close button is in the callout's content, the directive marks the callout with a `data-nfs-close-button` attribute, and the `nfs-callout` Library mixin reserves room for the button on its side, so text never runs under the glyph.

The `nfs-callout` mixin stops the compile when the callout's text, a link, or a close-button glyph falls under WCAG 2.2 AA contrast on any callout background, naming the setting and the colour. On Foundation's defaults that asks the developer for two settings: a darker `$anchor-color` and `$closebutton-color: #767676`. The mixin also writes the Variant properties that the Runtime checks and the Variant declaration file's generator read.

## User Stories

1. As an application developer, I want to put `nfsCallout` on a `div`, `aside`, or `section` and get Foundation's `.callout` look, so that I write no Foundation class.
2. As an application developer, I want a `color` input that takes the names of my `$foundation-palette` (`primary`, `secondary`, `success`, `warning`, `alert` by default), so that I use Foundation's colour names without writing its classes.
3. As an application developer who adds `purple` to `$foundation-palette`, I want `color="purple"` to compile once my Variant declaration file lists it, so that my own colours are typed like Foundation's.
4. As an application developer, I want a `size` input that takes `small` and `large`, so that I get Foundation's padding sizes by name.
5. As an application developer who adds a `huge` key to `$callout-sizes`, I want `size="huge"` to compile once my Variant declaration file lists it, so that my own sizes are typed too.
6. As an application developer, I want `size="default"` and no `size` to set no class, so that `$callout-sizes`' `default` padding stays the default look.
7. As an application developer, I want no `color` to give me the `$callout-background` look, so that my Sass settings stay the default.
8. As an application developer, I want a misspelt or removed colour or size to fail to compile, so that a typo never ships a plain callout.
9. As an application developer, I want a Foundation class name passed as a value (`color="callout"`) to fail to compile, so that the class rule holds for input values too.
10. As an application developer, I want to bind `[color]` from component state, so that one callout can switch between success and alert and the binding is type-checked.
11. As an application developer, I want to make a callout a Toggler in visibility mode with an `nfsCloseButton` and a bare `nfsClose` inside, so that it hides in place like Foundation's `data-closable`.
12. As an application developer, I want the Toggler's own Motion input to animate the closing callout, so that Foundation's `data-closable="slide-out-right"` has a counterpart.
13. As an application developer, I want to remove a callout with `@if` from its close button's `(click)` handler, so that a dismissed notice leaves the DOM.
14. As an application developer, I want `nfsCallout` alone to close nothing, so that only callouts I compose with a Toggler or a handler are dismissible.
15. As a keyboard user, I want focus to move to a logical next element when the callout I dismissed disappears, so that I do not lose my place (the developer's `closed` or handler code, shown in every recipe).
16. As a sighted user who enlarges text spacing, I want callout text never to run under the close button, so that I can read every word.
17. As a user at a 320 CSS px viewport, I want a closable callout to reflow without covering its text or scrolling sideways, so that it works on a small screen and at 400 percent zoom.
18. As a user with low vision, I want callout text and links to contrast at least 4.5:1 with every callout background, at rest, on hover, and on focus, so that I can read them.
19. As a user with low vision, I want the close button's glyph to contrast at least 3:1 with the callout it sits on, so that I can find the control.
20. As an application developer, I want the library's Sass to stop my build when a callout's text, links, or close-button glyph fail WCAG 2.2 AA on any callout background, naming the setting, the colour, and the ratio, so that a theme cannot fail silently.
21. As an application developer on Foundation's defaults, I want the spec to name the settings that pass, so that I fix the compile error with two lines.
22. As a screen reader user, I want a callout that reports the result of my action to be announced without moving my focus, so that I hear "Invoice sent" (the developer's `role="status"` or `role="alert"`, which the recipe shows).
23. As a screen reader user, I want a callout that is static page content to be announced as ordinary content, not as an alert, so that page load does not interrupt me.
24. As a user who does not perceive colour, I want the callout's text to say what kind of message it is, so that the alert colour is not the only cue.
25. As a user, I want no callout to disappear on a timer, so that I can read it at my own pace.
26. As an application developer, I want the callout to reserve room for its close button only when it holds one, so that other callouts keep Foundation's padding.
27. As an application developer who sets `$closebutton-position: left top` for a right-to-left application, I want the room reserved on the left, so that it follows the button.
28. As an application developer migrating Foundation markup, I want a copied `class="callout alert small"` to be reported in development, so that I learn to bind `color` and `size`.
29. As an application developer, I want a development-time report when I bind a colour or size my compiled CSS has no class for, or forget the `nfs-callout` include, so that drift between my Sass and my types surfaces early.
30. As an application developer, I want `nfsCallout` beside `nfsAbideAlert` or `nfsEqualizerWatch` on one element, so that a Form alert or an equalized box takes the callout look.
31. As a developer of a server-rendered application, I want the server HTML to carry `.callout`, its Variant classes, and the close-button room, so that the first paint is final and hydration changes nothing.
32. As a developer using `@defer (hydrate never)`, I want a callout there to stay styled, so that static regions look right without JavaScript.
33. As a developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
34. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it.
35. As a library maintainer, I want every behaviour asserted through roles, classes, attributes, geometry, and computed style in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Callout has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's callout Sass partial, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Callout | `.callout` | `@mixin foundation-callout` | Structural class on any element. `position: relative`, `$callout-margin`, the `default` padding of `$callout-sizes`, `$callout-border`, `$callout-radius`; no `display` rule; first and last children lose their outer margins. The background is `scale-color($callout-background, $lightness: $callout-background-fade)` and the text colour whichever of `$callout-font-color` and `$callout-font-color-alt` Foundation's `color-pick-contrast()` picks for it |
| Colours | `.primary`, `.secondary`, `.success`, `.warning`, `.alert` | The keys of `$foundation-palette` (`@each $name, $color in $foundation-palette`) | Open Variant family. Each class repaints the background from its palette colour through the same `scale-color` fade, and the text colour through `color-pick-contrast()`. Callout has no palette of its own: its colours are `$foundation-palette`'s, which must keep `primary` |
| Sizes | `.small`, `.large` | The keys of `$callout-sizes` other than `default` (`small: 0.5rem`, `default: 1rem`, `large: 3rem`) | Open Variant family; each class sets all four paddings. `default` is the base padding and has no class |
| Link tint | none | `$callout-link-tint: 30%` | A setting with no effect in 6.9.0: Foundation removed the rule that used it in 2015. The docs sentence "Links inside the callout will be tinted" is stale; links keep `$anchor-color` |
| Closable | `data-closable[="motion-class"]` on the callout, `data-close` on a Close Button inside it | Foundation's core Triggers utility | Replaced by a Toggler in visibility mode with a bare `nfsClose`, or `@if` ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md); [Spec: Toggler](../issues/17-spec-toggler.md)) |

Docs conventions kept or corrected: `h5` headings (kept in the stories for Foundation's look; the heading level follows the page outline, 1.3.1); a link in every example (kept, now at 4.5:1 through a required setting); the close button's `aria-label="Dismiss alert"` and `type="button"` (kept, now the Close Button directive's); the fade-out of `data-closable` with focus left on a hidden button (corrected: the recipes move focus).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.callout` | `NfsCallout` (`[nfsCallout]`), static host class | - | - | `callout` | - |
| Palette classes (`.primary`, `.secondary`, `.success`, `.warning`, `.alert` by default) | `color` Variant input of `NfsCallout` | `NfsCalloutColor`, an alias of `NfsFoundationPaletteColor`, over `$foundation-palette` and its registry `NfsFoundationPaletteOverrides` (Open Variant family) | a name | the name itself (`color="alert"` sets `.alert`); no value sets none, so `$callout-background` is the look | `--nfs-foundation-palette` (`primary secondary success warning alert` by default) |
| `.small`, `.large`, and every other key of `$callout-sizes` except `default` | `size` Variant input of `NfsCallout` | `NfsCalloutSize` over `$callout-sizes` and its registry `NfsCalloutSizesOverrides` (Open Variant family), plus the library literal `'default'` | a name | the name itself (`size="small"` sets `.small`); `'default'` and no value set none | `--nfs-callout-sizes` (`small large` by default) |
| `.close-button` (another family's: the Close Button's) | `NfsCloseButton` (`button[nfsCloseButton]`) with its `size` Variant input, inside the callout | The [Spec: Close Button](../issues/83-spec-close-button.md)'s | - | `close-button` | - |
| `.is-hidden` (another family's: the Toggler's State class) | `NfsToggler`'s host binding in Visibility mode, beside `nfsCallout` | The [Spec: Toggler](../issues/17-spec-toggler.md)'s | - | - | - |

State classes: none. Foundation's Callout has no State class. A dismissible callout's `hidden` and `.is-hidden` belong to the Toggler written beside it, and Motion classes to that Toggler's Motion input. No class is left for the consumer to write (ADR 0039). Foundation has no responsive callout colour or size, so neither input takes a Breakpoint query or rules object.

Library styling hook: `data-nfs-close-button`, bound while the callout's content holds an `nfsCloseButton` (D9, D10). Foundation has no class for a callout that holds a close button, so the hook follows [ADR 0033](../adr/0033-nested-menu-library-state-hooks.md): a `data-nfs-*` attribute the directive binds and the Library mixin selects on.

### Hierarchy and DI shape

```
[nfsCallout]      NfsCallout (standalone directive, no template)
  content query: nfsCloseButtonToken (descendants), provided by button[nfsCloseButton]
```

- One directive, with no parent, no Parent token, no providers, and no host directives. Nothing finds a callout through DI.
- Dismissal is composition by placement: `nfsToggler` sits beside `nfsCallout` on the same element, and `nfsCloseButton` with a bare `nfsClose` sits inside; `NfsCallout` hosts neither (D5). Each binds its own things: `NfsCallout` the callout's classes and the hook, `NfsToggler` `hidden`, `.is-hidden`, `id`, and its Motion classes, `NfsCloseButton` the button's classes and `type`, `NfsClose` the `click` listener. Angular merges the class bindings of the directives on one element, and no two of them bind the same class.
- The close-button query: `contentChild(nfsCloseButtonToken, {descendants: true})`, a `protected` signal query read by one host binding. `nfsCloseButtonToken` is a lightweight injection token that `NfsCloseButton` provides with `useExisting`, so the callout entry point imports one token and not the Close Button directive, which a consumer's bundle keeps only when it uses close buttons (the Angular lightweight-injection-token pattern; D10). The query sees a close button anywhere in the callout's content in the same template, inside `@if` and `@for` blocks and wrapper elements included; a close button rendered by a child component's own template is outside it.
- No Defaults token: Callout has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning (D11); the Runtime check hook of `ngx-foundation-sites/media-query`, which every directive with a Variant input uses ([ADR 0040](../adr/0040-variant-input-types.md)). Nothing else.
- Entry point: `ngx-foundation-sites/callout`, so a consumer's `@defer` can split it. `NfsCalloutColor` and `NfsCalloutSize` are exported beside the directive; `NfsFoundationPaletteColor`, `NfsFoundationPaletteOverrides`, and `NfsCalloutSizesOverrides` live in the primary entry point `ngx-foundation-sites` and are used here as types only; `nfsCloseButtonToken` comes from `ngx-foundation-sites/close-button`.

### API: `NfsCallout`

Selector `[nfsCallout]`; no `exportAs`; standalone; no template.

```ts
type NfsCalloutColor = NfsFoundationPaletteColor;
type NfsCalloutSize = NfsOverridableStringUnion<'small' | 'large', NfsCalloutSizesOverrides> | 'default';

class NfsCallout {
  readonly color: InputSignal<NfsCalloutColor | undefined>; // default undefined: no class
  readonly size: InputSignal<NfsCalloutSize | undefined>;   // default undefined: no class
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `color` | `NfsCalloutColor`, declared with explicit type arguments that name the alias; no transform | `undefined`, which sets no class | `.callout.<color>` from `$foundation-palette` | New. The JSDoc names the class template `.callout.<color>` and the setting. The consumer's own names reach the type only through its Variant declaration file |
| `size` | `NfsCalloutSize`, declared the same way | `undefined`, which sets no class | `.callout.small`, `.callout.large` from `$callout-sizes` | New. `'default'` names the map's `default` key and sets no class; it is a library literal outside the registry, because the key never generates a class, so the Variant property never lists it (the Button spec's rule for `$button-sizes`) |

- Models, outputs, and methods: none. A callout has no state; a dismissible callout's state is its Toggler's `isOpen`.
- No `exportAs`: the directive owns no state or method a template could read, only the consumer's `color` and `size` inputs (building-blocks 1.3); adding one later is additive.

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| static `class` | `callout` |
| `[class]` | one `computed` list: the `color` value and the `size` value, each only when it is one class token and not `'default'`; the static class, the consumer's own classes, and the Toggler's classes stay, because Angular combines static classes and the class bindings of every directive on the element |
| `[attr.data-nfs-close-button]` | `''` while the close-button query holds a result, otherwise `null` |

- The class list binds nothing for a value that is not one class token; under the closed types only a cast or `$any()` reaches that guard, and the Variant check reports it.
- Attribute ownership: the directive owns `.callout`, the Variant classes, and `data-nfs-close-button`. It never touches `role`, `id`, `hidden`, or `aria-*`, which stay the consumer's or another directive's.
- Development-mode check, in one `afterNextRender` read callback that exists only when `ngDevMode` is on (never on the server, never in production), warning once per instance: a static class list that holds Foundation's default palette names or `small` or `large` warns, naming each class with its input, for example "class="alert small" is set by nfsCallout: bind color="alert" and size="small" instead". A copied Variant class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `callout` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared names are not known without the Variant properties and are left to the Variant check (the Button spec's D22 rule).
- Runtime check: `NfsCallout` creates the handle `nfsVariantCheck('nfsCallout')` and, from its first render on, calls `include('nfs-callout', ['callout-sizes'])` on every run whether or not an input is bound, then `value()` for a bound `color` (need on `foundation-palette`) and `size` (need on `callout-sizes`) (D12). `strictVariantNames` compares a bound `color` with `--nfs-foundation-palette` and a bound `size` with `--nfs-callout-sizes` (`'default'` is never compared), and reports a value that is not one class token. `strictVariantProperties` reports a missing `@include nfs-callout;` when `--nfs-callout-sizes` reads empty. That property, and not `--nfs-foundation-palette`, decides, because `nfs-progress-bar` also writes the palette property, so its presence says nothing about `nfs-callout`. The report shape, the per-realm read, and the configuration are the Runtime checks' ([ADR 0040](../adr/0040-variant-input-types.md)).

### Comparison with Angular Material (22.2)

Material has no callout component. The nearest shapes are `MatCard`, a styled container, and `MatSnackBar`, a transient message service.

| Concern | Material | `NfsCallout` |
| --- | --- | --- |
| Selector and kind | `mat-card`, a component with content slots; `MatSnackBar`, a service that opens an overlay | `[nfsCallout]`, a directive on the consumer's element, no template |
| Look | `appearance: 'raised' \| 'outlined'` on `mat-card` | `color` and `size` Variant inputs over Foundation's Sass settings |
| Announcement | `MatSnackBar` announces its message through `LiveAnnouncer` with a `politeness` option (`polite` by default) | None of its own; the consumer's `role="status"` or `role="alert"` (D6) |
| Dismissal | `MatSnackBarRef.dismiss()`, an action button, and a `duration` timer | Composition: a Toggler in visibility mode with a Close Button, or `@if`; never a timer |
| Testing | `MatCardHarness`, `MatSnackBarHarness` | DOM-first assertions; no harness |

Borrowed: nothing from the API; the snack bar's politeness vocabulary is how the docs explain the choice between `role="status"` and `role="alert"`. Not borrowed: a component with slots (Foundation generates nothing, ADR 0001), a service that renders messages (a callout is page content the consumer writes), and a dismissal timer (2.2.1).

### Implementation level and primitives

Implementation level: native platform. The callout is the consumer's element and Foundation's CSS; live announcements are native ARIA live regions the consumer writes; hiding and removing are the Toggler's `hidden` and Angular's `@if`. `@angular/aria` has no alert or container pattern in 22.2, and `@angular/cdk` has nothing to add: CDK's `LiveAnnouncer` announces through its own hidden element, which a consumer who wants it can call, but a callout the user can read in place is better announced as itself. The Angular layer is three host bindings over two `input()` signals and one signal content query, one `computed` for the class list, a development-only render callback, and the Runtime check request. No `effect`, no listener, no timer, no observer.

Fallback: none needed. The two risks, the contrast of links and glyphs and the text under the close button, were measured by this spec's ticket in three engines, and so was the rule that fixes the second (D9).

### ARIA and keyboard

APG pattern: none for a callout itself, which is a generic container. A callout that reports a result dynamically follows the APG Alert pattern (`role="alert"`) for urgent messages or a `status` live region for advisory ones. A dismissible callout's close button follows the Button pattern, and the Toggler it composes with the Disclosure pattern's hiding rules.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsCallout]` | The host element's own role (`generic` for a `div`, `complementary` for an `aside`, `region` for a named `section`); the directive adds no role, name, or state | WHATWG HTML; HTML-AAM |
| Colour | Not exposed; the text says what kind of message it is (1.4.1) | WCAG 2.2 |
| Status message | The consumer's `role="status"` on a container that exists before the message is inserted (polite), or `role="alert"` on a callout inserted for an urgent message (assertive) | APG Alert pattern ("Dynamically rendered alerts are automatically announced by most screen readers"; "screen readers do not inform users of alerts that are present on the page before page load completes"); WAI-ARIA `status` |
| Close button | `button[nfsCloseButton]` with the consumer's name; no `aria-expanded` or `aria-controls` from `nfsClose` | [Spec: Close Button](../issues/83-spec-close-button.md); [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) |
| Hidden dismissible callout | `hidden` and `.is-hidden` from the Toggler: gone from rendering, the accessibility tree, and the tab order | [Spec: Toggler](../issues/17-spec-toggler.md) |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Reaches links and controls inside the callout; the callout itself is not focusable | Native |
| Enter, Space on the close button | The Trigger or the consumer's handler hides or removes the callout | Close Button, Triggers, Toggler |

Focus: the directive moves no focus. When a dismissible callout disappears, its focused close button disappears with it: the Toggler has no opener to return focus to, so the consumer moves focus in the Toggler's `closed` output; with `@if`, in the handler that removes it. The target is a logical next element (the following heading made focusable with `tabindex="-1"`, or the main content), as the APG's focus-persistence practice asks; every recipe below does it.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios are the exact WCAG 2.2 relative-luminance ratio of Foundation 6.9.0's default settings, unrounded (axe computes from rendered 8-bit colours, so its figures differ in the second decimal); geometry was measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0. Callout backgrounds on Foundation's defaults: default `#ffffff`, primary `#d7ecfa`, secondary `#eaeaea`, success `#e1faea`, warning `#fff3d9`, alert `#f7e4e1`.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.3 Contrast (Minimum) | Callout text, and links on every callout background at rest and on hover and focus, reach 4.5:1. The pairs: the text colour Foundation's `color-pick-contrast()` picks for each background; `$anchor-color` and `$anchor-color-hover` on each background (Foundation's `a:hover, a:focus` rule uses the hover colour). The backgrounds are `$callout-background` and every `$foundation-palette` colour through `scale-color($color, $lightness: $callout-background-fade)`. `nfs-callout` stops the compile with `@error` naming the setting, the palette name, and the ratio for every failing pair (D7). Required consumer setting on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%);` (`#14679e`), whose hover colour `scale-color($anchor-color, $lightness: -14%)` (`#115888`) follows in the consumer's settings file (D8). With it, links reach at least 4.95:1 on every callout (alert is the lowest), hover at least 6.18:1, and 6.01:1 on the page | Text passes (at least 16.16:1, the dark `$body-font-color`). Links fail on five of six backgrounds: primary 3.85, secondary 3.90, success 4.25, warning 4.26, alert 3.83:1; default 4.69:1 passes; the hover colour passes everywhere (at least 4.87:1). axe `color-contrast` reports the five failing links (3.82 to 4.25) | Node-level Sass compile test; axe `color-contrast` in every story under the Storybook settings overrides, which carry the required setting |
| 1.4.11 Non-text Contrast | The close button's glyph, the only visual that identifies the control, contrasts at least 3:1 with the callout under it at rest (`$closebutton-color`) and on hover and focus (`$closebutton-color-hover`); the Close Button spec leaves each container's background to that container's spec. `nfs-callout` checks both settings against every callout background with the same `@error` (D7). Required consumer setting on Foundation's defaults: `$closebutton-color: #767676;` (D8), which reaches at least 3.71:1 on every callout and 4.50:1 on the page. The callout's own border and background need no ratio: a callout is not a user interface component, and its boundary identifies no state | Fails on three backgrounds: primary 2.84, secondary 2.87, alert 2.82:1 (default 3.45, success 3.13, warning 3.14:1 pass); the hover colour reaches at least 16.16:1. axe marks the glyph incomplete ("Element content is too short to determine if it is actual text content") on exactly the three failing callouts, so the story gate cannot catch it | Node-level Sass compile test; with the required settings axe reports neither a violation nor an incomplete result for the glyphs |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, no callout text runs under its close button. Foundation positions the button absolutely over the content box's top corner (`$closebutton-offset-horizontal` from the edge, the same 1rem as the callout's padding), so a line that reaches that corner is obscured (the failure F104 describes for absolutely positioned content). While the directive's hook `data-nfs-close-button` is on the callout, `nfs-callout` sets the padding on the close button's side to the larger of the callout's own padding and the button's offset plus `max(24px, <its font size>)`, over every close-button size (D9); for Foundation's defaults that is 48 px on the right of every closable callout, small and large included | Fails for Foundation's own markup: at 320 by 800 CSS px with the text spacing applied, the heading of the docs' second closable example ("This a friendly message.") runs 7.83 to 7.88 px under the button in all three engines; at 1024 px, and at 320 px without the text spacing, the docs examples pass. With the rule no text runs under any button in all three engines, for the docs examples, a small callout with a small button, and a large callout | e2e in three engines at 320 by 640 px with the text-spacing stylesheet: no text rectangle in `callout--closable` intersects a close button's box, and the reserved padding computes to 48 px; browser-level test of the hook; node-level Sass compile test of the rule |
| 1.4.10 Reflow | A callout is a block with no fixed width; at 320 CSS px its content wraps inside the reserved padding and nothing scrolls sideways | Passes | e2e at 320 by 640 px: `scrollWidth` is at most 320 in `callout--closable` and `callout--colors` |
| 1.4.1 Use of Color | The palette colour is never the only cue for the kind of message: the text says it ("Error:", a heading that names the problem). The directive cannot check wording; the docs require it, and every story's text names its kind | Foundation's docs name each colour in the text ("This is an alert callout") | Play functions assert each story callout's text names its kind |
| 1.3.1 Info and Relationships | Headings inside a callout are real headings at the level the page outline needs; a callout that is a landmark is an `aside` or a named `section`, written by the consumer; the directive adds no role | Foundation's docs use `h5` for its size | axe `heading-order` (best-practice) in every story; every story heading is an `h5`, the docs' level, the focus targets included, so the order holds |
| 4.1.3 Status Messages | A callout that reports the result of an action without taking focus is inside a `role="status"` container that exists before the message is inserted, or is itself `role="alert"` when urgent; a callout present at page load carries neither, because it is content, not a message (D6). The directive adds no role | Foundation's docs add none | `callout--status-message`: after the click the `status` region holds the callout's text, and focus stays on the button that caused it |
| 2.4.3 Focus Order | When a dismissible callout is hidden or removed while its close button has focus, focus moves to a logical next element, never to `body`; the consumer's `closed` output or handler does it, and every recipe shows it | Foundation's `data-closable` fade leaves focus on a hidden button | Play functions of `callout--closable` and `callout--removable` assert where focus lands |
| 2.2.1 Timing Adjustable | The library never dismisses a callout on a timer | Foundation's `data-closable` dismisses only on a click | Nothing to test in the library |
| 2.5.8 Target Size (Minimum) | Every close button in a callout is at least 24 by 24 CSS px through the `nfs-close-button` floor ([Spec: Close Button](../issues/83-spec-close-button.md)); the Callout adds no target-size rule. Links inside callout text are inline and exempt | Close Button spec | axe `target-size` in every story; the Close Button spec's geometry tests |
| 4.1.2 Name, Role, Value | The directive changes no role, name, or state; the close button's name is the Close Button's check | Passes | axe (`button-name`, `link-name`) in every story; every play function finds controls by `getByRole` and name |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML apart from the `jsaction` attribute, which a Trigger's listener adds and which is gone once the button has hydrated. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfscallout=""`, `color="alert"`), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Basics -->
<div nfsCallout>
  <h5>This is a callout.</h5>
  <p>It has an easy to override visual style, and is appropriately subdued.</p>
  <a href="/guide">It's dangerous to go alone, take this.</a>
</div>
<div class="callout">...</div>

<!-- Colour and size -->
<div nfsCallout color="warning" size="small">...</div>
<div class="callout warning small">...</div>

<!-- Dismissible, hidden in place: a Toggler in visibility mode with a close button inside -->
<div nfsCallout color="alert" nfsToggler (closed)="nextHeading.focus()">
  <h5>This is Important!</h5>
  <p>But when you're done reading it, click the close button in the corner to dismiss this alert.</p>
  <button nfsCloseButton nfsClose aria-label="Dismiss alert">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<h2 #nextHeading tabindex="-1">Invoices</h2>

<div class="callout alert" data-nfs-close-button="" id="nfs-toggler-...">
  <h5>This is Important!</h5>
  <p>...</p>
  <button class="close-button" type="button" aria-label="Dismiss alert" jsaction="click:;">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<!-- ... and once the close button is pressed and the Toggler's leave animation, if any, has ended -->
<div class="callout alert is-hidden" data-nfs-close-button="" id="nfs-toggler-..." hidden="">...</div>

<!-- A status message: the live region exists before the callout is inserted -->
<div role="status">
  @if (sent()) {
    <div nfsCallout color="success"><p>Invoice sent.</p></div>
  }
</div>
<div role="status"><div class="callout success"><p>Invoice sent.</p></div></div>
```

The Toggler's and the Close Button's attributes belong to their specs and are shown only to place them. The Toggler's `animate` animates the closing callout with a leaving Motion name alone: `animate="slide-out-right"` is Foundation's `data-closable="slide-out-right"` ([Spec: Toggler](../issues/17-spec-toggler.md), D18).

### Animation

None of its own. Foundation's callout partial declares no transition. A dismissible callout animates through the Toggler's Motion input (State classes on a persistent element, building-blocks 1.6 rule 1) under the Toggler's reduced-motion rules; a removed one leaves at once, animates through `animate.leave` with the consumer's own keyframe class, or, to play a library Motion, hides through a Toggler and is removed in its `closed` output: the `data-closable` replacements of the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) (D17), because no library class name may appear in consumer code (ADR 0039).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.callout`, the Variant classes, and `data-nfs-close-button` exactly as the hydrated DOM does. Angular refreshes a view's content queries before it runs that view's host bindings in the same change-detection pass, and `@if` and `@for` content inside the callout is created before that refresh, so the hook is in the first render on both platforms.
- Before hydration: the directive touches no DOM outside host bindings, measures nothing, and starts no timer. The development check and the Runtime check request run in a render callback, never on the server.
- Full and incremental hydration: the host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own. A dismissible callout follows the Toggler's rule: the Toggler, its close button, and its Trigger share one Hydration boundary.
- Event replay: `NfsCallout` declares no listener and adds no `jsaction`. A pre-hydration click on a dismissible callout's close button replays through the Trigger once the block hydrates (Triggers and Close Button specs).
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block the callout is its server HTML. Inside `@defer (hydrate never)` it stays styled, and a dismissible callout there never closes, because no Trigger or handler ever runs; dismissible callouts do not go in `hydrate never`. A close button inside a `@defer` block nested in the callout reaches the query only once that block renders, so the room appears then; the docs keep a callout's close button outside nested `@defer` blocks.
- Prerendering: identical to SSR; the directive reads no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, the computed background, padding, and colours, where text and the close button sit, the live region's content, and where focus lands. No test reads the directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Button](../issues/37-spec-button.md)'s and [Spec: Close Button](../issues/83-spec-close-button.md)'s tests, the nearest precedents.

Story ids follow `callout--<story>`: `callout--default`, `callout--colors`, `callout--sizes`, `callout--closable`, `callout--removable`, `callout--status-message`. `meta.component` is `NfsCallout`; `color` and `size` are args. Stories use Foundation's default names only, so the library's Storybook program needs no Variant declaration file (ADR 0040). The Storybook settings overrides carry this spec's two required settings (Sass subsection) and the Progress Bar's `$foundation-palette` alert merge, which turns the alert callout's tint from `#cc4b37`'s to `#bf3f2c`'s in every callout story (links 4.842:1, hover links 6.042:1, the glyph 3.627:1, text 15.809:1, all passing); the preview includes `nfs-callout`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `color-contrast`, `heading-order`, `target-size`, `button-name`, and `link-name`). No story element carries a Foundation class written in the story.

- `callout--default`: Foundation's Basics example (a heading, a paragraph, a link). The element carries `.callout` and no role; its computed padding is 16 px and its background Foundation's default callout background.
- `callout--colors`: Foundation's Coloring example, one callout per default palette name plus one with no `color`, each holding a link. Each carries its name's class; each computed background differs from the uncoloured one; each text names its kind; axe passes the links under the preview's required `$anchor-color`.
- `callout--sizes`: no `size`, `size="default"`, `size="small"`, and `size="large"`. The computed padding is 16, 16, 8, and 48 px; the first two carry no size class.
- `callout--closable`: the Callout docs page's Making Closable pair, an alert callout and a success callout, each a Toggler in visibility mode with an `nfsCloseButton` and a bare `nfsClose`, the second closing with `animate="slide-out-right"`, Foundation's `data-closable="slide-out-right"` as a leaving Motion name on the Toggler's own input. Both carry `data-nfs-close-button`, and their computed right padding is 48 px. A click on the first close button hides the first callout (`hidden`), Enter on the second hides the second, and the story's `closed` handlers move focus to the `h5` heading (`tabindex="-1"`) that follows both callouts, which the play function asserts. Each close button's box is at least 24 by 24 (the Close Button's floor, asserted here because the story renders it).
- `callout--removable`: a callout inside `@if`, with a close button whose `(click)` handler removes it and focuses the main region; the callout leaves the DOM and focus lands on the region. A second callout with no close button carries no `data-nfs-close-button` and keeps 16 px padding.
- `callout--status-message`: a `role="status"` container and a Send button; after the click the container holds a success callout whose text is "Invoice sent", and focus stays on the Send button.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directive over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data: `.callout` is present; every default colour and size sets exactly its class; `size="default"` and no value set none; a value reached through `$any()` that contains a space sets none; changing a value swaps its class and leaves `.callout`, the consumer's own static class and `[class]` binding, and the other input's class alone.
- The hook: present with a close button as a direct child, inside a wrapper element, and inside `@if`, and it appears and disappears as the `@if` condition changes; absent with no close button, and absent when the close button is rendered by a child component's own template (the documented limit); a close button inside a nested callout also marks the outer one (documented). A test double that provides `nfsCloseButtonToken` stands in for the directive, so the suite does not depend on the Close Button's behaviour; one case uses the real `NfsCloseButton`.
- Composition: `nfsCallout` with `nfsToggler` on one element keeps `.callout` and the Variant classes while the Toggler adds and removes `hidden` and `.is-hidden`; a bare `nfsClose` on the close button inside hides it; `nfsCallout` beside a test directive that binds its own class keeps both.
- Development check: `class="alert small"` on the host warns once, naming `color` and `size`; a redundant `class="callout"` and the consumer's own class do not warn; nothing is checked when `ngDevMode` is false.
- Runtime check: with `--nfs-foundation-palette: primary secondary success warning alert` and `--nfs-callout-sizes: small large` on the test document, a listed `color` and `size` are silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$foundation-palette`; in a test file of its own, with `--nfs-callout-sizes` absent, a callout with no input bound reports `strictVariantProperties` once, naming `@include nfs-callout;`, even while `--nfs-foundation-palette` is present.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with a plain callout, a `color="warning" size="small"` one, a Toggler callout with a close button and a bare `nfsClose`, a callout whose close button sits inside `@if (true)`, and a `role="status"` container. `whenStable()` resolves; the server HTML carries `class="callout"`, the Variant classes, `data-nfs-close-button` on exactly the two callouts with a close button, and the consumer's `role`; only the Trigger's button carries `jsaction`; no Runtime check reports on the server.
- Sass compile, over Foundation 6.9.0's settings with `@import 'ngx-foundation-sites';`:
  - Foundation's defaults plus `@include nfs-callout;` stop with one `@error` naming `$anchor-color` on primary, secondary, success, warning, and alert and `$closebutton-color` on primary, secondary, and alert, each with its ratio.
  - With the two required settings the include compiles and emits exactly `:root { --nfs-foundation-palette: primary secondary success warning alert; --nfs-callout-sizes: small large; }` and three room rules, `.callout[data-nfs-close-button]`, `.callout.small[data-nfs-close-button]`, and `.callout.large[data-nfs-close-button]`, each setting only `padding-right` to `max(<that size's padding>, calc(0.66rem + max(24px, 1.5em)), calc(1rem + max(24px, 2em)))`, and no copy of a Foundation rule.
  - A palette merged with `purple` lists `purple` and checks it: with `purple: #4b0082` and the required settings the compile stops naming `$anchor-color` on purple (4.02:1; `#5b2a86` passes at 4.51:1). A `huge` key in `$callout-sizes` lists `huge` and adds its room rule.
  - `$closebutton-position: left top` writes `padding-left`; number offsets compile.
  - `$callout-sizes: (default: 1rem)` writes an empty `--nfs-callout-sizes` and only the default room rule.
  - `$callout-background-fade: 0%` stops the compile naming, among others, the text on alert (4.498:1), which Foundation's `color-contrast()` would round to 4.5.
- Pure logic: none worth isolating; the value-to-class mapping is covered through the DOM in layer 2.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Text spacing (1.4.12) in three engines: at 320 by 640 px with a stylesheet that sets line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em on every element, no text rectangle of either callout in `callout--closable` intersects its close button's bounding box, and each callout's computed right padding is 48 px.
- Reflow (1.4.10) in three engines: at 320 by 640 px, `document.documentElement.scrollWidth` is at most 320 in `callout--closable` and `callout--colors`.

Against the prerendered fixture app, on the Callout route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; the closable callout carries `data-nfs-close-button` and its reserved padding before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

The pre-hydration click on a dismissible callout's close button is the [Spec: Close Button](../issues/83-spec-close-button.md)'s e2e case and is not repeated.

## Out of Scope

- Closing. `nfsClose`, the Nearest Openable, the Toggler's visibility mode and its Motion input, and the `@if` recipe's animation belong to the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md), the [Spec: Toggler](../issues/17-spec-toggler.md), and their re-runs.
- The close button itself, its `type`, name check, and 24 px floor: the [Spec: Close Button](../issues/83-spec-close-button.md).
- A `closable` input or a hosted Toggler (D5); a dismissal timer (2.2.1).
- A default `role`, a `role` or politeness input, and a library announcer (D6).
- Restoring Foundation's removed link tint (D16).
- The Form alert's behaviour: [Spec: Abide](../issues/31-spec-abide.md), whose Form alert takes this look with `nfsCallout` beside `nfsAbideAlert`.
- Checks of typography colours inside callouts: headings take the callout's checked text colour (`$header-color: inherit`), and the greys of a heading `small`, a subheader, a `cite`, or a `blockquote` are the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s, checked on the page only; that spec requires them to reach 4.5:1 on a callout's tint too and sets them to `#666666` on Foundation's defaults, which does (4.686:1 at worst, on the alert tint), while `nfs-callout` checks what Foundation's callout markup puts on its backgrounds (D7). The Card, Media Object, and other containers with their own docs pages belong to their own specs. Category: `scope-boundary`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md).
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `[nfsCallout]`, on any element, binding `.callout` | ADR 0001 and ADR 0039: `.callout` is a Structural class on a consumer-written element ("A callout is just an element with a `.callout` class applied"), and Foundation generates nothing | An `nfs-callout` component with a close-button slot (Foundation generates no structure; the consumer's element choice, `div`, `aside`, or `section`, carries the semantics) |
| D2 | `color` Variant input, alias `NfsCalloutColor` over `NfsFoundationPaletteColor` and its registry `NfsFoundationPaletteOverrides` | ADR 0040 and building-blocks 1.4: the palette is an Open Variant family named `color`; the callout's classes loop over `$foundation-palette` itself, so the alias follows that registry with no chain; the family alias keeps the naming rule and gives the manifest's `uses` entry and the typings check an alias to name | Consumer-written palette classes (ADR 0039); a callout palette registry of its own (Foundation has no `$callout-palette`); the shared alias with no family alias (breaks the `Nfs` + component + dimension rule) |
| D3 | `size` Variant input, alias `NfsCalloutSize` over `NfsCalloutSizesOverrides`, plus the literal `'default'` | The keys of `$callout-sizes` other than `default` generate classes; `'default'` names the base padding and sets no class, as ADR 0040 and the Button's `size` rule have it | `'default'` inside the registry (the generator would write it as removed, because the Variant property never lists it) |
| D4 | No State classes, no role, no outputs, methods, Defaults token, providers, or `exportAs` | Foundation's callout has no state, and a directive with no state or method to read has no `exportAs` (building-blocks 1.3) | A `dismissed` model (the Toggler already owns hiding state) |
| D5 | Dismissal by composition beside the callout: a Toggler in visibility mode with an `nfsCloseButton` and a bare `nfsClose`, or `@if` with a handler | The triage ([Triage the out-of-scope Foundation components and variants](../issues/79-triage-out-of-scope-components-and-variants.md)) and building-blocks 1.8: both mechanisms exist; host directives are static, so a hosted Toggler would make every callout an Openable and a Nearest Openable for every bare `nfsClose` inside it | A `closable` input hosting `NfsToggler` (the scope lens at triage); an `nfsClosable` directive (a third way to hide an element, rejected by the Triggers spec's D10) |
| D6 | No default live role; the consumer writes `role="status"` on a persistent container or `role="alert"` on an inserted urgent callout | A callout is usually page content, and screen readers do not announce alerts present at page load (APG); only the consumer knows whether a callout is a status message and how urgent it is; the native attribute needs no input | `role="alert"` whenever `color="alert"` (colour is a look, not urgency, and a server-rendered alert would be announced as nothing, or would interrupt on every insertion); a `live` input (a second spelling of the native attribute) |
| D7 | `nfs-callout` stops the compile with one `@error` listing every pair under 4.5:1 (the picked text colour, `$anchor-color`, `$anchor-color-hover`) or under 3:1 (`$closebutton-color`, `$closebutton-color-hover`) against `$callout-background` and every palette colour's faded background, unrounded | ADR 0022 and building-blocks 1.10: a container checks what sits on its own backgrounds (the Close Button's D9, the Off-canvas precedent for links); axe marks the glyph incomplete and sees only the rendered state and Foundation's default palette; one message lists every failure so a theme is fixed in one pass | Checks only for the palette names a story uses (a consumer's colours would ship unchecked); `@warn` (a consumer on Foundation's defaults would ship failing links); Foundation's `color-contrast()`, which rounds 4.498 up to 4.5 |
| D8 | Required settings on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%)` and `$closebutton-color: #767676` | No callout-scoped setting colours links, and a lighter `$callout-background-fade` is not enough (at 90 percent links still reach only 4.10:1 on alert); `-15%` is the Accordion spec's required title colour, clears every callout with margin (at least 4.95:1), and raises page links to 6.01:1; `#767676` leaves margin on every callout (at least 3.71:1, where the Close Button ticket's lighter candidates `#858585` and `#808080` reach only 3.01 and 3.22:1) and reaches 4.5:1 on the page. Both are colour changes of existing settings, with no library rule | A library rule re-tinting `.callout a` (re-implements what Foundation removed, and `.callout a` would outrank `.button`'s own colour); changing `$foundation-palette` (recolours buttons, labels, badges, and progress bars) |
| D9 | 1.4.12: while `data-nfs-close-button` is on the callout, `nfs-callout` sets the padding on the button's side to `max(<the callout's padding>, <offset> + max(24px, <font size>))` over every close-button size | Measured: Foundation's own docs example fails under text spacing at 320 px in three engines, and the rule removes every overlap; the side is `nth($closebutton-position, 1)`, a physical property on purpose, because Foundation's position is physical and does not flip with the reading direction; `max(24px, <font size>)` bounds the button's box for the floor and for any glyph no wider than its font size (the multiplication sign is about 0.58em); `max()` with the callout's own padding keeps a large callout's padding | No rule (a WCAG failure left to content); padding on every callout (changes callouts without a close button); a floated reservation (only lines after the float in the DOM would wrap, and Foundation's docs put the button last) |
| D10 | The hook comes from `contentChild(nfsCloseButtonToken, {descendants: true})`, a lightweight token `NfsCloseButton` provides | The Angular lightweight-injection-token pattern for an optional child from another entry point: the callout keeps only a token, not the Close Button directive; the query resolves before host bindings in the same pass, so the hook is in server HTML | A query by the `NfsCloseButton` class (keeps the directive in every bundle that uses callouts); the close button registering with an injected callout token (more code in both directives); a consumer input such as `closable` (a second statement of what the markup already says); `:has()` (out of target) |
| D11 | A development warning for Foundation's palette and size classes copied onto the host | Building-blocks 1.4 and the Button's D22: copied markup would keep styling beside the inputs and never be the contract; every Foundation callout example carries `class="callout <color>"`, so migrating markup meets it first | No check (a silent second spelling); checking consumer-declared names (they need the Variant properties; the Variant check reports values the CSS lacks) |
| D12 | The Runtime check: names for bound values, and a presence request for `callout-sizes` from the first render on, whether or not an input is bound | The include carries the contrast checks and the 1.4.12 rule, so a missing include is an accessibility gap worth reporting even where no input is bound (the Close Button's D10); `--nfs-callout-sizes` is the property only `nfs-callout` writes | Deciding from `--nfs-foundation-palette` (`nfs-progress-bar` writes it too); requesting only when an input is bound |
| D13 | Native implementation level; no Aria, no CDK | The element, Foundation's CSS, and native live regions cover everything; Aria has no alert or container pattern | CDK `LiveAnnouncer` for status messages (announces a copy through its own element; the in-place live region is simpler and survives server rendering) |
| D14 | Listener-free: host bindings and one content query | Hydration-clean, no `jsaction`; dismissal brings its own listener through the Trigger | A host `click` listener for dismissal (belongs to the Trigger) |
| D15 | No mixin parameter that skips a check in the first release | Every other spec's contrast checks are unconditional; on Foundation's defaults both required settings exist; an optional parameter can be added later without breaking anyone | `nfs-callout($closable: false, $links: false)` now: a consumer whose callout backgrounds span dark and light colours (a `$callout-background-fade` near 0) cannot pass the link and glyph checks with one colour each, and would need it; recorded in the ticket's triage as the upgrade path |
| D16 | Foundation's removed link tint is not restored; `$callout-link-tint` stays without effect | Foundation removed the rule in 2015 and ships the setting and the docs sentence stale; restoring it would add a library rule for a look Foundation does not have | Restoring `scale-color($color, $lightness: -30%)` links per palette colour (a re-implemented Foundation style whose `.callout.<color> a` selector outranks `.button`) |

### Usage examples

```html
<!-- Foundation's Coloring example: the text names the kind of message -->
<div nfsCallout color="alert">
  <h5>Payment failed</h5>
  <p>Your card was declined. Update your payment details to keep your plan.</p>
  <a href="/billing">Go to billing</a>
</div>

<!-- Dismissible, hidden in place; focus moves when the callout is gone -->
<div nfsCallout color="success" nfsToggler (closed)="nextHeading.focus()">
  <p>Invoice sent.</p>
  <button nfsCloseButton nfsClose aria-label="Dismiss notice">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
<h2 #nextHeading tabindex="-1">Invoices</h2>

<!-- A Form alert: Abide's directive beside the callout's -->
<div nfsAbideAlert nfsCallout color="alert"><p>There are some errors in your form.</p></div>

<!-- A landmark aside -->
<aside nfsCallout color="secondary" aria-labelledby="tip-title">
  <h5 id="tip-title">Tip</h5>
  <p>You can reorder columns by dragging their headers.</p>
</aside>
```

```ts
@Component({
  selector: 'app-invoice-status',
  imports: [NfsButton, NfsCallout, NfsCloseButton],
  template: `
    <button nfsButton (click)="send()">Send invoice</button>

    <!-- The live region exists before the message is inserted -->
    <div role="status">
      @if (sent()) {
        <div nfsCallout color="success" size="small">
          <p>Invoice sent.</p>
          <button nfsCloseButton size="small" aria-label="Dismiss notice" (click)="dismiss()">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      }
    </div>
    <main #main tabindex="-1">...</main>
  `,
})
export class InvoiceStatus {
  protected readonly sent = signal(false);
  protected readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected send(): void {
    // send the invoice
    this.sent.set(true);
  }

  protected dismiss(): void {
    this.sent.set(false);
    // The focused close button leaves with the callout, so focus moves somewhere logical.
    this.main().nativeElement.focus();
  }
}
```

The consumer's Variant declaration file, as the library's tooling generates it from `$foundation-palette: map-merge($foundation-palette, (purple: #5b2a86));`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsFoundationPaletteOverrides {
    purple: true;
  }
}
```

With it, `color="purple"` compiles on callouts, and on buttons, badges, and labels whose palettes default to `$foundation-palette`; `color="pruple"` fails with the compiler's suggestion (ADR 0040). The `nfs-callout` check then also covers the purple callout's links and glyph.

The container directives beside the callout (`nfsToggler`, `nfsAbideAlert`) and the Close Button are shown only to place them; their names and inputs belong to their own specs.

### Platform features to adopt when the browser target moves

- `:has()` (out of target): `.callout:has(.close-button)` can replace the `data-nfs-close-button` hook and the content query with no visible change (as ADR 0033 notes for its own hooks).
- Nothing else in the platform research applies; live regions, `hidden`, and CSS `max()` are in target.

### Foundation behaviour changed or dropped

- `data-closable`'s jQuery fade becomes a Toggler in visibility mode or `@if`, and focus moves to a logical next element (D5).
- A callout that holds a close button reserves room for it on the button's side: text in closable callouts wraps about 32 px earlier at Foundation's defaults (D9).
- On Foundation's defaults, `nfs-callout` stops the compile until `$anchor-color` and `$closebutton-color` pass on every callout background, so links on the whole site become `#14679e` and close-button glyphs `#767676` (D8).
- `$callout-link-tint` and the docs' link-tint sentence stay without effect (D16).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-callout`, configured through the `$callout-*` settings and `$foundation-palette`, and on `foundation-close-button` for the close buttons inside it. Its documented custom CSS is the `nfs-callout` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-callout`.

1. Rules. (a) For each key of `$callout-sizes`, `.callout[data-nfs-close-button]` for `default` and `.callout.<size>[data-nfs-close-button]` for the others: `padding-<side>: max(<that key's padding>, <room>)`, where `<side>` is `nth($closebutton-position, 1)` and `<room>` lists, for each key of `$closebutton-size`, `calc(<that size's horizontal offset> + max(24px, <that size's font size>))`. Reason: WCAG 2.2 success criterion 1.4.12; Foundation positions the close button absolutely over the content box and has no setting that keeps text clear of it (D9). The side is a physical property, against the logical-property rule of building-blocks 1.5, because Foundation's `$closebutton-position` is physical and does not flip with the reading direction. The selector outranks Foundation's `.callout.<size>` padding (one more attribute), and only the declaration on that side differs. (b) `:root { --nfs-foundation-palette: <keys>; --nfs-callout-sizes: <keys>; }`, the Variant properties in (6). (c) Compile-time checks that emit no CSS, D7: one `@error` listing every failing pair. Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal.
2. Reused, read from the consumer's compile: `$callout-sizes`, `$callout-background`, `$callout-background-fade`, `$callout-font-color`, `$callout-font-color-alt`, `$foundation-palette`, `$anchor-color`, `$anchor-color-hover`, `$closebutton-color`, `$closebutton-color-hover`, `$closebutton-position`, `$closebutton-size`, `$closebutton-offset-horizontal` (read per size with Foundation's own `-zf-get-size-val()`, so a number offset works as it does in Foundation), Sass's `scale-color()` as Foundation's `callout-style` mixin applies it, and Foundation's `color-pick-contrast()`. No Foundation value is copied; 24px is WCAG's number, not a Foundation value. The mixin takes no parameters (D15).
3. Custom properties the directive writes: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing of the callout's animates; a dismissible callout's animation is its Toggler's.
5. Missing include: a closable callout's text can run under its close button again; the contrast checks do not run, so Foundation's failing links and glyphs compile silently; the Variant properties are absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D12), and the Variant declaration file's generator cannot list the callout's sizes.
6. Variant properties: `--nfs-foundation-palette`, the keys of `$foundation-palette` (`primary secondary success warning alert` by default), also written by `nfs-progress-bar` with the same value; `--nfs-callout-sizes`, the keys of `$callout-sizes` other than `default` (`small large` by default), written empty (`#{''}`) when no other key remains, because Sass cannot print an empty list. Both join the keys with `space`, because Sass interpolates a key list with commas.

Required settings on Foundation's defaults, which the Storybook settings overrides mirror with the axe rule and the stories named in their comment:

```scss
$anchor-color: scale-color($primary-color, $lightness: -15%);
$anchor-color-hover: scale-color($anchor-color, $lightness: -14%);
$closebutton-color: #767676;
```

A consumer who edits `$anchor-color` in its own copy of Foundation's settings file gets the hover line for free, because that file computes `$anchor-color-hover` from `$anchor-color`; an overrides file imported after Foundation's settings, as the Storybook preview's is, writes both.

### Notes

- RTL: `$closebutton-position` is physical (`right top`) and Foundation does not flip it; a right-to-left application sets `left top`, and the room follows it (D9).
- Composition: `nfsCallout` sits beside `nfsToggler`, `nfsAbideAlert`, and `nfsEqualizerWatch` on one element, and binds nothing they bind. `.callout` sets no `display`, so the `hidden` attribute alone hides a callout; the Toggler binds `.is-hidden` as well by its own rule.
- A close button rendered by a child component's template is outside the callout's content query, so its callout gets no room; the docs write the close button in the callout's own template, which is also where a bare `nfsClose` finds the Toggler as its Nearest Openable.
- A callout nested in a closable callout also marks the outer one (the query searches descendants), which only widens the outer callout's padding on the button's side.
- With the Callout's required settings, links reach 4.858:1 (exact formula, measured by the [Spec: Card](../issues/90-spec-card.md) ticket) and glyphs 3.64:1 on `$light-gray`, the default background of the Off-canvas panel and the Top Bar.
- With the Progress Bar's required alert `#bf3f2c` (Storybook settings overrides), the alert callout's background is about `#f7e1dd`; links reach about 4.85:1 and close-button glyphs about 3.63:1.
