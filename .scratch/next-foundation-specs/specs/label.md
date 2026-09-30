# Spec: Label

Ticket: [Spec: Label](../issues/94-spec-label.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites who wants to tag content with a word or a short phrase of metadata ("High priority", "Draft", "Overdue") writes Foundation's Label markup: an element, usually a `span`, with the `.label` class, and a palette class such as `.alert` for its colour. Label is a CSS-only component: it ships Sass and classes and no Plugin. The docs bind a label to the element it describes through `aria-describedby`, show icon labels, and teach custom colours through `$label-palette`. This is Foundation's Label component, a coloured text tag, not the form `label` element, which the [Spec: Forms](../issues/98-spec-forms.md) covers as the Form label. The markup contract leaves the hard parts to the author:

- Foundation's docs say "The default settings meet WCAG 2.0 level AA contrast requirements". They do not: the `alert` label's `$white` text is 4.498:1 on `#cc4b37` (4.364:1 with `$black`), under the 4.5:1 of WCAG 2.2 success criterion 1.4.3; the label's `0.8rem` normal-weight text is not large text. axe reports it (4.49) on Foundation's own Coloring and Icons examples.
- Foundation picks each coloured label's text from `$label-color` and `$label-color-alt` with `color-pick-contrast()`, which compares ratios computed through an approximate luminance, rounds them to one decimal, keeps the first candidate on a tie, and ignores a translucent colour's alpha. For some colours it picks the text colour that fails while the other passes: on `#e10f69` it picks `$black` at 4.22:1 where `$white` reaches 4.65:1.
- The uncoloured label's text is `$label-color` on `$label-background` with no pick at all, so a light `$label-background` keeps white text (1.84:1 on `#ffae00`).
- The docs' Custom Colors examples change nothing in an overrides file imported after Foundation's settings file: their `!default` loses to the settings file's own `$label-palette` line, and `map-remove($foundation-palette, (primary, secondary))` removes no key, because the parenthesised list is one argument (measured).
- The docs describe a paragraph with `aria-describedby` pointing at a label after it. A paragraph takes no focus, and screen readers announce descriptions chiefly when their element takes focus; the label is read after the paragraph anyway, in reading order.
- The icon examples put an icon font glyph in the label without `aria-hidden`, so its Private Use Area character becomes part of the label's text for assistive technology (measured in Chromium), and the colour classes "give labels additional meaning" that only sighted users who perceive colour receive.
- Written on a link, as a tag link often is, the uncoloured label's text takes Foundation's link hover colour on hover and focus: 1.27:1 on the label's background in Chromium, Firefox, and WebKit, in a state axe does not test.
- `white-space: nowrap` keeps a label on one line, so a label wider than its container at 320 CSS px scrolls the page sideways (1.4.10).
- Under the library's class rule the developer writes no class of a Foundation family that has a first-milestone spec, and the Label has one, so `.label` and the palette classes need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the label styled before hydration and inside dehydrated `@defer` blocks.

## Solution

One attribute directive, `nfsLabel`, on the element the developer already writes. It binds Foundation's `.label` class and sets the palette class from a typed `color` Variant input over the names of the developer's `$label-palette`, Foundation's defaults extended by the developer's Variant declaration file, so a misspelt or removed name fails to compile; no value sets no class, so `$label-background` is the look. The directive adds no role and declares no listener, so everything it does is a host binding already present in server HTML. Every label has text for a screen reader, and a label is never written on a link: the directive's JSDoc states both rules.

A label sits inside or right after the text it tags, so it is read with that text and becomes part of a heading's or a cell's content; a focusable control beside it references it with `aria-describedby`, the pairing Foundation's docs teach; a tag link holds its label inside the link. The label's text says what its colour suggests. A label whose text the user's action changes is a `role="status"` label the developer adds.

Every label's text reaches 4.5:1 on its background, which on Foundation's defaults takes one setting, a darker alert in `$label-palette`. The `nfs-label` Library mixin gives a coloured label the better of Foundation's two text colours wherever Foundation's own pick is the worse one, and writes the Variant property that the Variant declaration file's generator reads. The directive and the mixin have the [Spec: Badge](../issues/93-spec-badge.md)'s shape, applied to Foundation's other coloured text tag.

## User Stories

1. As an application developer, I want to put `nfsLabel` on a `span` and get Foundation's `.label` look, so that I write no Foundation class.
2. As an application developer, I want `nfsLabel` to work on any element, as Foundation's docs say, so that I choose the element.
3. As an application developer, I want a `color` input that takes the names of my `$label-palette` (`primary`, `secondary`, `success`, `warning`, `alert` by default), so that I colour labels without writing their classes.
4. As an application developer who adds `purple` to `$label-palette`, or to `$foundation-palette` in my copy of Foundation's settings file, whose Label section then follows it, I want `color="purple"` to compile once my Variant declaration file lists it, so that my own colours are typed like Foundation's.
5. As an application developer who removes `secondary` from `$label-palette`, I want `color="secondary"` to fail to compile, so that a label never asks for a class my CSS lacks.
6. As an application developer, I want a misspelt colour or a Foundation class name such as `color="label"` to fail to compile, so that a typo never ships a plain label.
7. As an application developer, I want no `color` to give me the `$label-background` look, so that my Sass settings stay the default.
8. As an application developer, I want to bind `[color]` from component state, so that one label can switch between `success` and `alert` and the binding is type-checked.
9. As an application developer, I want to put a label inside a heading or a table cell and have its text become part of that element's content, so that the tag is never separated from what it tags.
10. As an application developer, I want a label beside a link or button to describe it through `aria-describedby`, one label or several, so that Foundation's pairing still works where the label cannot sit inside.
11. As an application developer, I want the spec to tell me where `aria-describedby` does not help (a paragraph or heading, which takes no focus), so that I do not rely on a description nobody hears.
12. As an application developer, I want to put a label inside a tag link and keep the label's colours on hover and focus, so that my tag links stay readable.
13. As an application developer, I want the spec to tell me never to write `nfsLabel` on a link, so that I put the label inside the link and its text stays readable on hover.
14. As an application developer, I want an icon label to carry its icon `aria-hidden` beside its text, so that no stray glyph reaches a screen reader.
15. As an application developer, I want the spec to state that every label has text for a screen reader, and how an icon-only label gets it, so that no label says nothing.
16. As an application developer, I want the spec to name the two labels that need no text of their own, one hidden from assistive technology on purpose and one named as an image, so that I write correct markup for both.
17. As an application developer migrating Foundation markup, I want the spec to show `class="label alert"` as `nfsLabel color="alert"`, so that I learn to bind `color`.
18. As an application developer, I want my Variant declaration file generated from my `$label-palette` by the library's tooling, so that my types list exactly the colours my compiled CSS has.
19. As an application developer, I want the spec to state that every label's text reaches 4.5:1 on its background, for every palette entry and for the uncoloured label, so that a theme does not fail in colours no story renders.
20. As an application developer on Foundation's defaults, I want the spec to name the one setting that passes, so that I fix the alert label with one line.
21. As an application developer whose brand colour takes white text at 4.65:1, I want the library to use the white text Foundation's rounding rejected, so that a passing colour is not refused.
22. As an application developer, I want the spec to tell me that a light `$label-background` needs a dark `$label-color`, so that the uncoloured label passes even though Foundation picks nothing for it.
23. As an application developer, I want the spec to give Foundation's Custom Colors forms in a shape that works from my overrides file, so that removing or adding a colour does what the docs promise.
24. As an application developer, I want to show a state that the user's action changes ("Saved") in a `role="status"` label, so that the new state is announced without moving focus.
25. As an application developer, I want `nfsLabel` to leave `role`, `id`, and `aria-*` to me, so that a status label or a label a control references composes with the platform.
26. As a screen reader user, I want a heading with a label to include the label's text in its name, so that heading navigation tells me the report is overdue.
27. As a screen reader user, I want a link described by a label to announce the label when I focus the link, so that I hear "High priority" with the message subject.
28. As a screen reader user, I want an icon label to say what it means and nothing else, so that I get what sighted users see without a stray character.
29. As a screen reader user, I want a state that changes after my action to be announced, so that I know the action worked.
30. As a user with low vision, I want every label's text to contrast at least 4.5:1 with the label, at rest and inside a link on hover and focus, so that I can read its small text.
31. As a user who does not perceive colour, I want a label's text to say what its colour suggests ("Overdue", "Paid"), so that colour is not the only cue.
32. As a user who enlarges text spacing, I want a label's text to stay on its painted background, so that I can read every character.
33. As a user at a 320 CSS px viewport, I want labels to fit without sideways scrolling, so that the page reflows at 400 percent zoom.
34. As a user of a Windows contrast theme, I want label text and icons to stay visible when the label's colours are replaced, so that the tag survives.
35. As a developer of a server-rendered application, I want the server HTML to carry `.label` and its palette class, so that the first paint is final and hydration changes nothing.
36. As a developer using `@defer (hydrate never)`, I want a label there to stay styled, so that static regions look right without JavaScript.
37. As a developer of a zoneless application, I want the directive to need no zone, so that it works with zoneless change detection.
38. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it.
39. As a library maintainer, I want every behaviour asserted through roles, names, descriptions, classes, computed colours, and geometry in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Label has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's label Sass partial, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Label | `.label` | `@mixin foundation-label` (in `foundation-everything`) | Structural class on any element ("any tag will work fine"). `display: inline-block`, `padding: $label-padding` (`0.33333rem 0.5rem`), `border-radius: $label-radius` (`$global-radius`), `font-size: $label-font-size` (`0.8rem`), `line-height: 1`, `white-space: nowrap`, `cursor: default`; `background: $label-background` (`$primary-color`) and `color: $label-color` (`$white`), with no pick between text colours. At a 16 px root font size it is 23.45 px tall (23.47 in Firefox; measured) |
| Colours | `.primary`, `.secondary`, `.success`, `.warning`, `.alert` | The keys of `$label-palette` (`@each $name, $color in $label-palette`, as `.label.<name>`), which defaults to `$foundation-palette`; Foundation's settings file assigns it from `$foundation-palette` in its Label section, without `!default` | Open Variant family. Each class sets `background` to its colour and `color` to `color-pick-contrast(<colour>, ($label-color, $label-color-alt))`: the first candidate unless the second's ratio, rounded to one decimal through Foundation's approximate `color-luminance()`, is higher |
| Icons | an icon element inside the label | Foundation's docs (Foundation Icon Fonts glyphs) | No class of Foundation for Sites; the icon is the consumer's |
| Description | `aria-describedby` on the described element, pointing at one or several labels' `id` | Foundation's docs | Native attributes, the consumer's |
| Custom colours | `$label-palette: map-remove(...)`, `map-merge(...)`, or a map of its own | Foundation's docs | Written with `!default`, which does nothing after Foundation's settings file has assigned `$label-palette`; the `map-remove` form passes its keys as one list and removes none (measured, D17) |

Docs conventions kept or corrected: the `span` (kept); `aria-describedby` from the described element (kept where that element takes focus; for text that takes no focus, the label goes inside it or stays right after it and needs no reference, D4); icon labels (kept, corrected with an `aria-hidden` icon, D5); colour "to give labels additional meaning" (corrected: the text says the meaning, 1.4.1, D6); the AA claim for the default settings (corrected: the alert label is 4.498:1, and a required setting fixes it, D10); the Custom Colors forms (corrected: no `!default` in an overrides file, and `map-remove` with its keys as separate arguments, D17).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.label` | `NfsLabel` (`[nfsLabel]`), static host class | - | - | `label` | - |
| Palette classes (`.primary`, `.secondary`, `.success`, `.warning`, `.alert` by default) | `color` Variant input of `NfsLabel` | `NfsLabelColor`, built on `NfsFoundationPaletteColor`, over `$label-palette`, which defaults to `$foundation-palette`; `NfsLabelPaletteOverrides`, chained on `NfsFoundationPaletteOverrides` (Open Variant family) | a name | the name itself (`color="alert"` sets `.alert`); no value sets none, so `$label-background` is the look | `--nfs-label-palette` (`primary secondary success warning alert` by default) |

Other families' classes in this spec's examples and stories (building-blocks 1.14 item 2): a class of a family with a first-milestone spec is set by its own directive; a class of a family with none is written as a normal class, with Foundation's global styles loaded (ADR 0039's exception):

| Foundation classes | Kind | Element | Set by | Owner |
| --- | --- | --- | --- | --- |
| `.show-for-sr` | Another family's (Foundation's visibility classes, with no first-milestone spec) | The visually hidden text of an icon-only label (Rendered HTML, `label--icons`) | The consumer, as a normal class (`class="show-for-sr"`) | Foundation's global styles |
| `.button` | Another family's (the Button) | The Save button of the status usage example | `NfsButton` (`button[nfsButton]`) | [Spec: Button](../issues/37-spec-button.md) |

Foundation's icon examples write Foundation Icon Fonts classes (`fi-*`), an icon library's classes, which are the consumer's own (Out of Scope).

State classes: none. Foundation's Label has no State class, and the directive binds no library hook. No class of a family with a first-milestone spec is left for the consumer to write (ADR 0039). Foundation has no responsive label colour, so `color` takes no Breakpoint query or rules object. The form `label` element and its `.middle` Variant belong to `label[nfsFormLabel]` ([Spec: Forms](../issues/98-spec-forms.md)); the two directives never meet, because `.label` is a class on any element and `.middle` a class on the `label` element.

### Hierarchy and DI shape

```
[nfsLabel]      NfsLabel (standalone directive, no template)
```

- One directive, with no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a label through DI.
- No Defaults token: Label has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: none.
- Entry point: `ngx-foundation-sites/label` (one per Foundation docs page), so a consumer's `@defer` can split it. `NfsLabelColor` is exported beside the directive; `NfsFoundationPaletteColor`, `NfsFoundationPaletteOverrides`, and `NfsLabelPaletteOverrides` live in the primary entry point `ngx-foundation-sites` and are used here as types only.
- Imports (documented usage): a component imports `NfsLabel` wherever its template writes `nfsLabel`. Without that import the element stays plain, with no `.label` class, no palette class, and no error, unless the template binds `[color]`, which then fails to compile (NG8002).

### API: `NfsLabel`

Selector `[nfsLabel]`; `exportAs: 'nfsLabel'`; standalone; no template.

```ts
type NfsLabelColor = NfsOverridableStringUnion<NfsFoundationPaletteColor, NfsLabelPaletteOverrides>;

/**
 * Foundation's `.label`, on any element but a link: a tag link holds its label inside it (WCAG 1.4.3). Every label has
 * text for screen readers: an icon beside the text is `aria-hidden="true"`, and an icon-only label carries visually
 * hidden text or is `role="img"` with an `aria-label` (WCAG 1.1.1); a bare `aria-label` on a label is prohibited.
 */
class NfsLabel {
  readonly color: InputSignal<NfsLabelColor | undefined>; // default undefined: no class
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `color` | `NfsLabelColor`, declared with explicit type arguments that name the alias; no transform | `undefined`, which sets no class | `.label.<color>` from `$label-palette` | New. The JSDoc names the class template `.label.<color>` and the setting. The consumer's own names reach the type only through its Variant declaration file; a name added to `$foundation-palette` reaches it through the chain while `$label-palette` follows `$foundation-palette` |

- Models, outputs, and methods: none. A label has no state; its text is the consumer's content.

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| static `class` | `label` |
| `[class]` | one `computed` list: the `color` value when it is one class token; the static class and the consumer's own classes stay, because Angular combines static classes and class bindings |

- The class list binds nothing for a value that is not one class token; under the closed type only a cast or `$any()` reaches that guard.
- A Foundation palette class copied onto the host is not stripped, because the `[class]` list sets only its own classes, so it keeps styling until removed (D7); the consumer binds `color` instead. A redundant `label` merges with the static host class.
- Attribute ownership: the directive owns `.label` and the Variant class. It never touches `role`, `id`, `aria-*`, or `hidden`, which stay the consumer's: a `role="status"` for a state the user's action changes (D8), an `id` for `aria-describedby`, `aria-hidden` for a label whose text is already in its control's name.
- Usage rules, stated in the JSDoc above and followed by every recipe and story:
  1. Text (D5): every label has text for screen readers: text outside any element with `aria-hidden="true"` (visually hidden text counts), or the non-blank `alt` of an `img`, or the non-blank `aria-label` of an element with `role="img"` outside such an element (building-blocks 1.10, Names). An icon beside the text is `aria-hidden="true"`; an icon-only label carries visually hidden text that says what it shows, or is itself `role="img"` with a non-blank `aria-label` or `aria-labelledby` (WCAG 1.1.1). A bare `aria-label` on a label without a role is prohibited (axe `aria-prohibited-attr`) and names nothing. A label that is itself `aria-hidden="true"` needs no text.
  2. Not on a link (D12): `nfsLabel` never goes on an `a` element, whatever its `color`: on a link, Foundation's link hover and focus colour replaces an uncoloured label's text colour (1.27:1 on Foundation's defaults, WCAG 1.4.3), which axe does not test, and the cursor stays the default arrow; a coloured label fails the same way as soon as its bound `color` becomes `undefined`. The label goes inside the link: `<a href="..."><span nfsLabel>...</span></a>`.

### Comparison with Angular Material (22.2)

Material has no label component. The nearest shape is the static chip, `mat-chip` inside `mat-chip-set`, which Material documents as not interactive ("Angular Material does not intend `<mat-chip>`, `<mat-basic-chip>`, and `<mat-chip-set>` to be interactive").

| Concern | Material `MatChip` (static) | `NfsLabel` |
| --- | --- | --- |
| Selector and kind | `mat-chip` or `[mat-chip]`, a component with its own template, inside a `mat-chip-set` whose role is `presentation` until the consumer sets one | `[nfsLabel]` on the consumer's element, no template, no container |
| Semantics | None of its own; `role` and `aria-label` inputs; the docs ask for `role="list"` and `role="listitem"` when the chips are a list, and otherwise "Add the appropriate accessibility depending on the context" | None; the host element's own role, and the consumer's native `role`, `id`, and `aria-*`; a list of labels is the consumer's own list |
| Colour | `color` palette string (M2) | `color` Variant input over `$label-palette`, typed through the Variant registry |
| Interaction | Removal, highlight, disabled state, ripples, and a `keydown` handler, for the interactive subclasses `MatChipOption` and `MatChipRow` | None; a label is never a control (D12) |
| Testing | `MatChipHarness` | DOM-first assertions; no harness |

Borrowed: the static chip's stance, a non-interactive tag whose meaning comes from its context. Not borrowed: a component with a template (Foundation's markup carries the element, ADR 0001), an `aria-label` input (prohibited on a generic host, measured), the chip set container, and the interactive subclasses.

### Implementation level and primitives

Implementation level: native platform. The label is the consumer's element with Foundation's CSS; its meaning is text in the DOM; its relationship to a control is the native `aria-describedby`; a changing state is a native `status` live region the consumer writes. `@angular/aria` has no label, tag, or status pattern in 22.2, and `@angular/cdk` has nothing to add: `AriaDescriber` and `LiveAnnouncer` would copy text the page already holds. The Angular layer is two host bindings over one `input()` signal and one `computed` class list. No `effect`, no render callback, no listener, no timer, no observer.

Fallback: none needed. The risks the directive and mixin own, text contrast, Foundation's text colour pick, and a label on a link, were measured by this spec's ticket with the exact formula and axe, and the geometry in three engines.

### ARIA and keyboard

APG pattern: none for a label, which is text. A label that reports the result of the user's action is a `status` live region (WAI-ARIA `status`; WCAG 4.1.3). A label inside a control follows that control's pattern.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsLabel]` | The host element's own role (`generic` for a `span`); its text is content of whatever contains it; the directive adds no role, name, or state | WHATWG HTML; HTML-AAM |
| A label inside a heading or table cell | Its text is part of that element's content and name: measured in Chromium, the heading "Quarterly report Overdue" and the cell "Paid" | accname (name from content) |
| A label inside a link | Its text is the link's name, or part of it: measured, the link "New Release notes" | accname |
| A label beside a focusable control | The control's `aria-describedby` references the label's `id`, one or several: measured, the link "Quarterly report" described by "Overdue" | APG "Providing Accessible Names and Descriptions" (its examples describe a button and a text field); Foundation's docs |
| A label beside text that takes no focus | Not referenced: it goes inside the text or right after it. Chromium exposes the docs paragraph's description "High Priority Unread" (measured), but screen readers announce descriptions chiefly on focus, which a paragraph never takes | Angular Material's badge (inline text on non-interactive hosts); the [Spec: Badge](../issues/93-spec-badge.md), D4 |
| Colour | Not exposed; the text says what the colour suggests (1.4.1) | WCAG 2.2 |
| Icon | `aria-hidden="true"` on the icon beside the label's text, or visually hidden text for an icon-only label; or the label `role="img"` with an `aria-label` (measured: the image "Overdue"). A bare `aria-label` on a `span` label is prohibited (axe `aria-prohibited-attr`, measured). An icon font glyph left unhidden is text: measured in Chromium, U+F1B0 and its siblings appear as text nodes of the docs' icon labels | WAI-ARIA `generic` (naming prohibited); `img` |
| A state the user's action changes | The consumer's `role="status"` on the label, which exists before the text changes and holds the whole message; `status` is atomic by default | WAI-ARIA `status`; WCAG 4.1.3 |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Skips the label, which is not focusable; reaches the control that holds or references it | Native |

Focus: the directive moves no focus. A label is not a control: a link or button carries the tag, with the label inside it or beside it (D12).

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios were computed by this spec's ticket with the exact WCAG relative-luminance formula (`math.pow`) from Foundation 6.9.0's default settings, unrounded, never Foundation's `color-luminance()` or `color-contrast()` (the [Spec: Top Bar](../issues/86-spec-top-bar.md) measured the first's false passes); axe computes from rendered 8-bit colours, so its figures differ in the second decimal. Geometry was measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.3 Contrast (Minimum) | Every label's text reaches 4.5:1 on its background; the label's `0.8rem` normal-weight text is never large text. The pairs: `$label-color` on `$label-background` for the uncoloured label (Foundation picks nothing there); for each `$label-palette` entry, the better of `$label-color` and `$label-color-alt` by the exact ratio, which `nfs-label` applies where Foundation's `color-pick-contrast()` picked the other (D9). Every pair reaches 4.5:1 in the consumer's settings (Sass subsection). Required consumer setting on Foundation's defaults: `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));` (5.255:1 with `$white`), the alert the Button, Abide, Progress Bar, and Badge specs already require (D10). A label is never written on a link, where Foundation's `a:hover, a:focus` rule outranks the uncoloured label's colour (D12, in the directive's JSDoc) | Fails on alert: `$white` 4.498:1 on `#cc4b37`, `$black` 4.364:1; passes on the uncoloured and primary label (4.647:1), secondary (4.504:1), success and warning (`$black` 10.91 and 10.66:1). axe reports the alert label as a `color-contrast` violation (4.49) on Foundation's Coloring and Icons examples. On a link, the uncoloured label's text turns `#1468a0` on hover and focus, 1.27:1 on `#1779ba` in three engines, which axe, testing the resting state, does not see | Node-level Sass compile test of the pick correction; axe `color-contrast` in every story under the Storybook settings overrides; `label--colors` asserts each label's computed text colour; `label--in-controls` asserts the colours of a label inside a link on hover and focus |
| 1.4.1 Use of Color | A coloured label's text says what its colour suggests ("Overdue", "Paid"); the colour is a look. The directive cannot read wording; the docs require it, every recipe shows it, and every story's play function asserts it, as the Callout and the Badge require | Foundation's docs add colour "to give labels additional meaning" and name the colour in the text ("Alert Label") | Play functions of `label--colors` and `label--icons` assert each label's text |
| 1.1.1 Non-text Content | An icon beside a label's text is `aria-hidden="true"`; an icon-only label carries visually hidden text, or is `role="img"` with an `aria-label` (D5, in the directive's JSDoc) | Foundation's icon examples leave the icon font glyph exposed (its Private Use Area character is text in Chromium's tree, measured), and axe reports nothing for it or for a text-less label | Play function of `label--icons` finds each label's text and no Private Use Area character in it |
| 1.4.11 Non-text Contrast | An icon draws in `currentColor`, so it takes the label's text colour, which reaches 4.5:1 and so 3:1. The painted rectangle against the page needs no ratio: a label is not a user interface component, and its text carries its information | Foundation's icon font glyphs are text in the text colour | `label--icons` asserts each icon's computed stroke equals its label's computed colour |
| 1.3.1 Info and Relationships | A label's relationship to what it tags is programmatic: it sits inside that element, right after text that takes no focus, or a focusable control references it with `aria-describedby` (D4) | Foundation's docs reference the label from a paragraph, which takes no focus | `label--in-controls` asserts the heading's name, the link's description, and the tag link's name |
| 2.5.3 Label in Name | A label inside a control adds its visible text to the control's visible label; a tag link's name is its label's text | Passes | `label--in-controls` finds the tag link by its label's text |
| 4.1.3 Status Messages | A label whose text changes as the result of the user's action is announced without moving focus: the consumer writes `role="status"` on the label, which exists before the change and holds the whole message. The directive adds no role (D8) | Foundation's docs add none | `label--status`: after the click the status label's text is "Saved" and focus stays on the button |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, a label's text stays on its painted background: Foundation's label has no fixed size, so its box grows from 23.45 to about 29.8 px tall and widens with its text, and the text stays inside the box in every engine (measured) | Passes | e2e in three engines at 320 by 640 px with the text-spacing stylesheet: every label's text rectangle in `label--default`, `label--colors`, and `label--in-controls` lies inside its border box |
| 1.4.10 Reflow | At 320 CSS px no label scrolls the page sideways. Foundation's `white-space: nowrap` keeps a label on one line, so the docs keep a label to a word or a short phrase (D13); measured, "Awaiting a reply from the customer since last Monday" (52 characters) is 318.8 px wide, wider than a 300 px column at 320 CSS px, and 415.1 px with the text spacing, while Foundation's two-word examples take 86 to 112 px | Foundation's examples fit | e2e at 320 by 640 px in three engines, with and without the text-spacing stylesheet: `scrollWidth` is at most 320 in `label--colors` and `label--in-controls` |
| 2.5.8 Target Size (Minimum) | A label is never a target: it is 23.45 px tall at Foundation's defaults. The link or button that holds it meets 2.5.8 by its own rules (the `nfs-button` floor; an inline link's exemption) | Foundation's labels are not controls | axe `target-size` in every story |
| 4.1.2 Name, Role, Value | The directive changes no role, name, or state | Passes | axe in every story; every play function finds controls by `getByRole` and name |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). Unlike the Badge's one-character examples, which axe marks incomplete (`shortTextContent`, measured by the [Spec: Badge](../issues/93-spec-badge.md) ticket), a label's words are long enough for axe's `color-contrast` rule, and a one-character label would be marked incomplete the same way. The palette entries and the uncoloured pair that no story renders reach 4.5:1 by the consumer's settings (Sass subsection), and the Sass compile test covers the corrected picks.

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directive declares no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfslabel=""`, `color="alert"`), which the resulting DOM below leaves out, as the other specs do. `.show-for-sr` is Foundation's visually hidden class, written as a normal class; it is shown only to place it.

```html
<!-- Basics: the label inside the heading it tags -->
<h2>Quarterly report <span nfsLabel>Draft</span></h2>

<h2>Quarterly report <span class="label">Draft</span></h2>

<!-- Foundation's pairing, from a link that takes focus -->
<a href="/mail/1" aria-describedby="mail-1-priority mail-1-unread">Re: re: re: you won't believe what's in this email!</a>
<span nfsLabel color="alert" id="mail-1-priority">High priority</span>
<span nfsLabel id="mail-1-unread">Unread</span>

<a href="/mail/1" aria-describedby="mail-1-priority mail-1-unread">Re: re: re: you won't believe what's in this email!</a>
<span class="label alert" id="mail-1-priority">High priority</span>
<span class="label" id="mail-1-unread">Unread</span>

<!-- A tag link: the label inside the link -->
<a href="/tags/sass"><span nfsLabel color="secondary">Sass</span></a>

<a href="/tags/sass"><span class="label secondary">Sass</span></a>

<!-- An icon label: the icon is hidden, the text says what it means -->
<span nfsLabel color="alert"><svg aria-hidden="true" ...><path stroke="currentColor" .../></svg> Overdue</span>

<span class="label alert"><svg aria-hidden="true" ...><path stroke="currentColor" .../></svg> Overdue</span>

<!-- An icon-only label: visually hidden text says what it shows -->
<span nfsLabel color="success"><svg aria-hidden="true" ...><path stroke="currentColor" .../></svg><span class="show-for-sr">Verified</span></span>

<span class="label success"><svg aria-hidden="true" ...><path stroke="currentColor" .../></svg><span class="show-for-sr">Verified</span></span>
```

Server and hydrated DOM are identical for every example: the classes are a static host class and a host binding on signal state.

### Animation

None. Foundation's label partial declares no transition, and the library adds none; a label that appears or disappears with `@if` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.label` and the Variant class exactly as the hydrated DOM does, so the first paint is final, and the label's text, the consumer's content, is in the server HTML for assistive technology.
- Before hydration: the directive touches no DOM outside host bindings, measures nothing, and starts no timer.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own. A `role="status"` label whose text a control changes belongs to that control's Hydration boundary, so the update that the announcement follows runs once the block hydrates.
- Event replay: `NfsLabel` declares no listener and adds no `jsaction`; a pre-hydration click on the control that changes a label replays through that control's own listener.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a label is its server HTML. Inside `@defer (hydrate never)` it stays styled at its server text for good, which suits a static tag and not a live one; live labels do not go in `hydrate never`.
- Prerendering: identical to SSR; the directive reads no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes, the computed background and text colour at rest and on hover and focus, the accessible names and descriptions, the status region's text, where focus lands, and where the text sits in the label's box. No test reads the directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Badge](../issues/93-spec-badge.md)'s and [Spec: Callout](../issues/89-spec-callout.md)'s tests, the nearest precedents.

Story ids follow `label--<story>`: `label--default`, `label--colors`, `label--icons`, `label--in-controls`, `label--status`. `meta.component` is `NfsLabel`; `color` is an arg. Stories use Foundation's default names only, so the library's Storybook program needs no Variant declaration file (ADR 0040). The Storybook settings overrides carry this spec's required setting (Sass subsection), and the preview includes `nfs-label`. Every story's labels say their meaning in text, and every label is a word or a short phrase.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `color-contrast`, `aria-prohibited-attr`, `link-name`, and `target-size`). No story element carries a Foundation class written in the story, except `show-for-sr` in `label--icons`, a visibility class whose family has no first-milestone spec.

- `label--default`: Foundation's Basics as a heading with a label inside ("Quarterly report" and "Draft"). The label carries `.label` and no role; its computed background is Foundation's `$label-background` and its text colour `$label-color`; the heading is found by `getByRole('heading', {name: 'Quarterly report Draft'})`.
- `label--colors`: Foundation's Coloring example, one label per default palette name plus one with no `color`, each in a table cell of an invoice list whose label text names its meaning ("Draft", "Sent", "Paid", "Due soon", "Overdue"). Each carries its name's class; each computed background differs from the uncoloured one except `primary`'s, which equals it; the computed text colour is `$white` on the uncoloured, primary, secondary, and alert labels and `$black` on success and warning; axe passes `color-contrast` under the required setting.
- `label--icons`: Foundation's Icons example with inline SVG icons (`aria-hidden="true"`, `stroke` or `fill` in `currentColor`) beside visible text on alert, warning, and uncoloured labels, and one icon-only success label whose hidden text ("Verified") carries Foundation's `show-for-sr` class, written as a normal class. Each label's text is found and holds no Private Use Area character; each icon's computed stroke equals its label's computed colour.
- `label--in-controls`: Foundation's pairing corrected to links: a list of two message links, the first described by two labels beside it, which the play function asserts with `toHaveAccessibleDescription('High priority Unread')`, the second by one; a tag link with a secondary label inside, found by `getByRole('link', {name: 'Sass'})`, whose label keeps its computed text and background colours after `userEvent.hover` and after focus; the Basics heading again.
- `label--status`: a "Save" button and a `role="status"` label beside a document title that reads "Unsaved changes"; after a click the label's text is "Saved", its `color` has changed from `warning` to `success`, and focus stays on the button.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directive over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data: `.label` is present; every default colour sets exactly its class; no value sets none; a value reached through `$any()` that contains a space sets none; changing `color` swaps its class and leaves `.label`, the consumer's own static class and `[class]` binding alone; the directive adds no attribute (`role`, `aria-*`, `id`, `hidden` stay as written); a static `class="label alert"` keeps `.alert` (not stripped, D7).
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with a plain label in a heading, an alert label referenced by a link's `aria-describedby`, a label inside a tag link, and a `role="status"` label. `whenStable()` resolves; the server HTML carries `class="label"`, the Variant class, and the consumer's `id`, `role`, and text; no element carries `jsaction` from the directive.
- Sass compile, over Foundation 6.9.0's settings file and an overrides file after it, with `@import 'ngx-foundation-sites';`:
  - Over Foundation's defaults, and with the required setting, the include emits exactly `:root { --nfs-label-palette: primary secondary success warning alert; }`, and no other rule.
  - `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` alone in the overrides file leaves the compiled `.label.alert` background at `#cc4b37`, because the settings file assigned `$label-palette` before it (D10).
  - Foundation's docs palettes compile in their corrected forms (D17): the required setting merged with `purple: #bb00ff` lists `purple` (4.569:1 with `$white`); `map-remove($foundation-palette, primary, secondary)` merged with the required alert lists `success warning alert`; the custom palette `(black: #000000, red: #ff0000, purple: #bb00ff)` writes `--nfs-label-palette: black red purple` and no rule (Foundation picks `$black` on red, 4.951:1). The docs' `map-remove($foundation-palette, (primary, secondary))` still lists all five names.
  - A palette entry `pink: #e10f69` emits `.label.pink { color: #fefefe; }`: Foundation picks `$black` (4.218:1), and `$white` reaches 4.654:1 (D9).
  - An entry `rgba(#1779ba, 0.5)` is composited over `$body-background` and emits a `$black` text rule, which Foundation's pick, blind to the alpha, does not give it.
  - `$label-palette: ()` writes an empty `--nfs-label-palette` and no rule.
- Pure logic: none worth isolating; the value-to-class mapping is covered through the DOM in layer 2.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Text spacing (1.4.12) in three engines: at 320 by 640 px with a stylesheet that sets line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em on every element, every label's text rectangle in `label--default`, `label--colors`, and `label--in-controls` lies inside its border box.
- Reflow (1.4.10) in three engines: at 320 by 640 px, with and without the text-spacing stylesheet, `document.documentElement.scrollWidth` is at most 320 in `label--colors` and `label--in-controls`.

Against the prerendered fixture app, on the Label route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; the labels carry their classes and text before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

The hover and focus colours of a label inside a link were measured identical in three engines, so the play function of `label--in-controls` covers them in Chromium; there is no e2e case for them.

Manual release test (ADR 0022): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, `label--in-controls` announces the first message link's description "High priority Unread" on focus and the heading's name with its label, and `label--status` announces "Saved" after the click without moving focus.

## Out of Scope

- Material's chip behaviour (removal, selection, input chips, a chip set container with keyboard navigation): Foundation's label is static text the consumer writes, and Foundation has no interactive tag. Category: `scope-boundary`.
- A default live role, a `role` or politeness input, or a library announcer (D8): the consumer's native `role="status"` covers the case, and only the consumer knows which labels report a result. Category: `platform-or-a11y`.
- An input that writes `aria-describedby` on the element a label describes: the native attribute on the consumer's element does it, and a label inside its element needs none (D4). Category: `platform-or-a11y`.
- A forced-colours rule: measured, label text takes CanvasText on Canvas in Chromium and Firefox, so the painted box disappears and the text stays, and the text carries the meaning (D6). Category: `platform-or-a11y`.
- A screen-reader-only directive: the consumer writes Foundation's `.show-for-sr` class, which Foundation's global styles provide. Category: `scope-boundary`.
- Foundation Icon Fonts (`fi-*`), a separate package the docs use for the Icons example: any icon works, and an icon library's classes are the consumer's own. Category: `scope-boundary`.
- The Form label (`label[nfsFormLabel]` and its `middle` Variant): the [Spec: Forms](../issues/98-spec-forms.md). Category: `scope-boundary`.
- Foundation's Badge (`.badge`), the round tag for a count: the [Spec: Badge](../issues/93-spec-badge.md). Category: `scope-boundary`.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md). Category: `scope-boundary`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive, `[nfsLabel]`, on any element, binding `.label`; `exportAs: 'nfsLabel'`; entry point `ngx-foundation-sites/label` | ADR 0001 and ADR 0039: `.label` is a Structural class on a consumer-written element ("any tag will work fine"), and Foundation generates nothing; the name follows the class (building-blocks 1.3), and the form `label` is `NfsFormLabel` | An `nfs-label` component, or Material's static chip with its own template (Foundation's markup carries the element; ADR 0001) (`scope-boundary`); `NfsMediaLabel` or `NfsTag` (neither is Foundation's name) (`other`) |
| D2 | `color` Variant input, alias `NfsLabelColor = NfsOverridableStringUnion<NfsFoundationPaletteColor, NfsLabelPaletteOverrides>` | ADR 0040 and building-blocks 1.3, 1.4: the palette is an Open Variant family named `color`; `$label-palette` is its own setting that defaults to `$foundation-palette`, so its registry chains on the shared one, as `NfsButtonColor` and `NfsBadgeColor` do | The Callout's plain alias of `NfsFoundationPaletteColor` (a consumer's `map-remove` on `$label-palette` alone could not remove a name) (`other`); consumer-written palette classes (ADR 0039) (`variant-as-class`) |
| D3 | No State classes, role, ARIA, outputs, methods, models, Defaults token, or providers | A label is text and has no state; the consumer's element and native attributes carry every relationship | A `hidden` input for an empty tag (a second spelling of `@if`) (`scope-boundary`) |
| D4 | A label sits inside the element it tags (a heading, a cell, a link) or right after text that takes no focus; `aria-describedby` references a label from a focusable control beside it; Foundation's paragraph pairing becomes a link pairing | Inside, the label is part of the heading's or cell's content and the link's name (measured in Chromium); a description is announced chiefly on focus, which a paragraph never takes, and the label after a paragraph is read next in reading order anyway; the Badge's D4 split, which follows Angular Material's badge | Foundation's paragraph `aria-describedby` kept as the recipe (Chromium exposes it, but nobody hears it in reading) (`platform-or-a11y`); an input that writes the reference on another element (the native attribute already does it) (`platform-or-a11y`) |
| D5 | Every label has text for screen readers, text outside `aria-hidden` subtrees with an image's `alt` counting as text, unless the host is `aria-hidden` or `role="img"` with a name; icon recipes hide the icon; the directive's JSDoc states the rule | An icon-only label says nothing to a screen reader, and axe reports nothing for it; an unhidden icon font glyph is a Private Use Area character in the label's text (measured in Chromium); a bare `aria-label` on a `span` is prohibited (axe `aria-prohibited-attr`, measured), so it does not count; the Badge's D5 rule, word for word | An `aria-label` input (prohibited on a generic label, and it would hide the visible text from assistive technology) (`platform-or-a11y`) |
| D6 | The label's text says what its colour suggests; stated as a requirement, shown in every recipe, asserted by every story | 1.4.1 and 1.3.1: "Alert Label" names a colour, not a meaning, and a red tag says "overdue" only in colour; the directive cannot read wording, so the requirement is content, as the Callout's, Progress Bar's, and Badge's are | A rule that the text is never a palette name (a label may be "Warning" on purpose) (`other`) |
| D7 | A Foundation palette class copied onto the host is not stripped; the spec maps each to `color` | Building-blocks 1.4 and the Button's D22; every Foundation label example writes `class="label <color>"`; the `[class]` list sets only its own classes | A class record that strips copies (the palette is open, so the directive cannot list every class to set `false`) (`other`) |
| D8 | No default live role; the consumer writes `role="status"` on a label whose text changes after the user's action | Most labels are static tags; a status message in WCAG's sense reports the result of an action, a waiting state, progress, or an error without moving focus, and only the consumer knows which labels do; the Badge's D8 | `role="status"` on every label (announces every re-render of a list of tags) (`platform-or-a11y`); CDK `LiveAnnouncer` (announces a copy through its own element; the in-place region survives server rendering) (`platform-or-a11y`) |
| D9 | Every pair reaches 4.5:1 by the exact formula (`$label-color` on `$label-background`; each `$label-palette` entry with the better of `$label-color` and `$label-color-alt`), a requirement the Sass subsection states; `nfs-label` emits `.label.<name> { color: <the better one>; }` only where Foundation's `color-pick-contrast()` picked the other | ADR 0022 and building-blocks 1.10: axe sees only the pairs a story renders; Foundation's pick uses the same function and candidates as the Badge's, measured to pick the failing candidate while the other passes (`#e10f69`, `#c30fe1`, `#d20fb4`, `#e10f87`: `$black` picked at 4.21 to 4.36:1 where `$white` reaches 4.51 to 4.66:1; 148 colours of an RGB grid in steps of 5), and to ignore alpha; a passing brand colour should not fail for Foundation's arithmetic; the Badge's D9 and the Progress Bar's D8 pick by the exact ratio; on Foundation's defaults, and with the required setting, it emits no text rule | Foundation's pick as is (a passing brand colour would get the failing text) (`other`); raising `$global-color-pick-contrast-tolerance` (changes every component's pick) (`other`); a text rule on every entry (copies what Foundation already emits correctly) (`other`) |
| D10 | Required setting on Foundation's defaults: `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));` | Alert fails with both candidates (4.498 and 4.364:1), so only its colour can change; `#bf3f2c` is the alert the Button, Abide, Progress Bar, and Badge specs require (5.255:1 with `$white`); measured, Foundation's settings file assigns `$label-palette` from `$foundation-palette` in its Label section, so an overrides file after it that merges `$foundation-palette`, as the Progress Bar's required line does in the Storybook preview, leaves `.label.alert` at `#cc4b37` | Requiring the `$foundation-palette` line alone (it reaches labels only in a consumer's own copy of the settings file) (`other`); `$label-color: #ffffff` (alert reaches only 4.537:1, and a second library spelling of the alert fix) (`other`); a library rule recolouring `.label.alert` (re-implements a Foundation style) (`other`) |
| D11 | `--nfs-label-palette` lists the keys of `$label-palette`, and only `nfs-label` writes it | `$label-palette` is the Label's own setting, so no second mixin writes its property; the Variant declaration file's generator reads it for `NfsLabelPaletteOverrides` | Generating the registry from `--nfs-foundation-palette` (another entry point's property, and not the setting the classes loop over) (`other`) |
| D12 | A label is never a control: a link or button carries the tag, with the label inside it or beside it, never on it; the directive's JSDoc says so | Measured in three engines: on a link, Foundation's `a:hover, a:focus` rule (a type selector and a pseudo-class) outranks `.label` (one class), so the uncoloured label's text turns `$anchor-color-hover` on hover and focus, 1.27:1, in a state axe does not test, and `.label`'s `cursor: default` hides the link; a label inside the link keeps its colours in every state; a label is 23.45 px tall, under 2.5.8's 24 px; Material documents its static chip as not interactive | A library rule restoring `$label-color` on `a.label:hover, a.label:focus` (makes a tag look like a control with no hover cue and keeps the arrow cursor) (`other`); ruling out `button` hosts too (nothing fails there: `.label` outranks Foundation's button reset, measured) (`other`) |
| D13 | A label holds a word or a short phrase; documented | Measured in three engines: `white-space: nowrap` keeps a 52-character label at 318.8 px, wider than a 300 px column at 320 CSS px, and 415.1 px with the text spacing; Foundation's examples take 86 to 112 px | A library rule `white-space: normal` (a label in a narrow table column or flex item would wrap where Foundation keeps it on one line, a look change beyond the failing case) (`other`) |
| D14 | Native implementation level; no Aria, no CDK; listener-free | The element, Foundation's CSS, native `aria-describedby`, and native live regions cover everything; host bindings render on the server | CDK `AriaDescriber` for descriptions (the text is already in the DOM beside the control) (`platform-or-a11y`) |
| D15 | Five stories; e2e only for 1.4.12 geometry and reflow in three engines and the fixture app's first paint and hydration; a manual screen-reader release test | Geometry needs real engines; hover and focus colours measured identical in three engines, so the Chromium play function covers them; announcements need assistive technology | A forced-colours e2e (measured once; the library adds nothing there) (`platform-or-a11y`); an e2e for hover colours (the engines agree) (`other`) |
| D16 | One glossary term, **Label** | Foundation's name for the component, which the Form label and the Badge already refer to; distinct from both | Also a term for the tag link (a recipe, not domain language) (`other`) |
| D17 | The docs give Foundation's Custom Colors in forms that compile from an overrides file: no `!default`, and `map-remove` with its keys as separate arguments | Measured: after Foundation's settings file, a `!default` assignment of `$label-palette` does nothing, and `map-remove($foundation-palette, (primary, secondary))` removes nothing; the Variant declaration file follows the compiled names, so a silent no-op there would leave the removed names typed | Foundation's forms copied as written (they fail silently from an overrides file) (`other`) |

### Usage examples

```html
<!-- A heading with its tag -->
<h2>Invoice 1042 <span nfsLabel color="alert">Overdue</span></h2>

<!-- A message link described by its labels -->
<a href="/mail/7" aria-describedby="mail-7-priority">Quarterly figures</a>
<span nfsLabel color="warning" id="mail-7-priority">High priority</span>

<!-- A tag link: the label inside the link -->
<a href="/tags/angular"><span nfsLabel>Angular</span></a>

<!-- An icon label -->
<span nfsLabel color="success">
  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10"><path d="M1 5l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2" /></svg>
  Verified
</span>
```

```ts
@Component({
  selector: 'app-document-title',
  imports: [NfsButton, NfsLabel],
  template: `
    <h1>
      Proposal
      <!-- The status label exists before its text changes and holds the whole message -->
      <span nfsLabel role="status" [color]="saved() ? 'success' : 'warning'">{{ saved() ? 'Saved' : 'Unsaved changes' }}</span>
    </h1>
    <button nfsButton (click)="save()">Save</button>
  `,
})
export class DocumentTitle {
  protected readonly saved = signal(false);

  protected save(): void {
    // save the document, then:
    this.saved.set(true);
  }
}
```

The consumer's Variant declaration file, as the library's tooling generates it from `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c, purple: #bb00ff));`:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsLabelPaletteOverrides {
    purple: true;
  }
}
```

With it, `color="purple"` compiles on labels; `color="pruple"` fails with the compiler's suggestion (ADR 0040). The purple label's text reaches 4.569:1 with `$white`, as the Sass subsection requires.

`NfsButton` is shown only to place it; its API belongs to its own spec.

### Platform features to adopt when the browser target moves

- Nothing in the platform research applies: the directive binds classes only, and no rule depends on the label's content.

### Foundation behaviour changed or dropped

- The docs' paragraph `aria-describedby` becomes a link pairing; a label tags a heading or a cell from inside it (D4).
- A tag link holds its label inside the link, never on it (D12).
- Icon labels hide their icons (D5), and every coloured label's text says its meaning (D6).
- A coloured label whose Foundation pick is the worse text colour gets the better one (D9); on Foundation's defaults nothing changes.
- On Foundation's defaults the alert label fails 1.4.3, so the spec requires `$label-palette`'s alert to be `#bf3f2c` (D10).
- The Custom Colors forms are given without `!default`, and `map-remove` with separate key arguments (D17).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixin `foundation-label` (part of `foundation-everything`), configured through the `$label-*` settings. Its documented custom CSS is the `nfs-label` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-label`.

1. Rules. (a) For each key of `$label-palette` whose better text colour by the exact ratio, `$label-color` or `$label-color-alt`, is not the colour Foundation's `color-pick-contrast($color, ($label-color, $label-color-alt))` returns: `.label.<name> { color: <the better one>; }`. Reason: WCAG 2.2 success criterion 1.4.3; Foundation picks through its approximate luminance, rounded to one decimal, and without compositing a translucent entry, so it can pick the failing candidate while the other passes (D9). The selector equals Foundation's in specificity and follows it in source order, and only `color` differs. On Foundation's defaults, and with the required setting, the mixin emits no such rule. The ratios come from the library's exact relative-luminance helper (`math.pow`, a translucent colour composited over `$body-background` first), unrounded, never Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal (building-blocks 1.10). (b) `:root { --nfs-label-palette: <keys>; }`, the Variant property in (6).
2. Reused, read from the consumer's compile: `$label-background`, `$label-color`, `$label-color-alt`, `$label-palette`, `$body-background`, and Foundation's `color-pick-contrast()`, called only to learn which colour Foundation emitted. No Foundation value is copied; 4.5 is WCAG's number. The mixin takes no parameters.
3. Custom properties the directive writes: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: a label whose Foundation pick is the worse colour keeps failing text, and the Variant property is absent, so the Variant declaration file's generator cannot list the label's colours.
6. Variant properties: `--nfs-label-palette`, the keys of `$label-palette` (`primary secondary success warning alert` by default), joined with `space`, because Sass interpolates a key list with commas, and written empty (`#{''}`) when the palette is empty, because Sass cannot print an empty list. Only `nfs-label` writes it.

Documented usage for the settings (D9): every label's text reaches 4.5:1 on its background by the exact, unrounded ratio: `$label-color` on `$label-background` for the uncoloured label, and each `$label-palette` entry with the better of `$label-color` and `$label-color-alt`. A light `$label-background` therefore takes a dark `$label-color` (`$label-color: $black; $label-color-alt: $white;`). Nothing in Foundation's CSS stops a failing value from compiling. On Foundation's defaults only the alert entry fails (4.498:1 with `$white`, 4.364:1 with `$black`).

Required setting on Foundation's defaults, which the Storybook settings overrides mirror with the axe rule and the stories named in their comment:

```scss
$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));
```

In a consumer's own copy of Foundation's settings file, this is the Label section's `$label-palette` line; alternatively the alert entry of `$foundation-palette` there changes to `#bf3f2c`, the Progress Bar's required setting, and the Label section's `$label-palette: $foundation-palette;` then follows it. An overrides file imported after Foundation's settings, as the Storybook preview's is, needs this line even when it also merges `$foundation-palette`, because the settings file has already assigned `$label-palette` (measured).

Foundation's Custom Colors, in the forms that work from such an overrides file (D17), each keeping the required alert:

```scss
// Remove colours: the keys are separate arguments; a parenthesised list removes nothing.
$label-palette: map-merge(map-remove($foundation-palette, primary, secondary), (alert: #bf3f2c));
// Add colours: no !default, which would lose to the settings file's own line.
$label-palette: map-merge($foundation-palette, (alert: #bf3f2c, purple: #bb00ff));
// A palette of one's own.
$label-palette: (black: #000000, red: #ff0000, purple: #bb00ff);
```

### Notes

- RTL: a label is an inline block with its text; nothing flips, and no rule or `Directionality` is needed.
- Forced colours: measured in Chromium and Firefox, the label's background takes Canvas and its text CanvasText, so the box disappears and the text stays; the text carries the meaning (D6).
- A label and a badge side by side are two directives on two elements; `nfsLabel` and `nfsBadge` never sit on one element, because Foundation's `.label` and `.badge` rules set the same properties.
- A label beside a paragraph, as in Foundation's docs, reads after the paragraph in the reading order; that is enough, and no reference is needed (D4).
- Composition: `nfsLabel` binds nothing another directive binds; a consumer's `role`, `id`, and `aria-*` on the same element stay theirs. A label never hosts a Tooltip, whose host must be an interactive element ([Spec: Tooltip](../issues/27-spec-tooltip.md)); a label's text is its explanation.
