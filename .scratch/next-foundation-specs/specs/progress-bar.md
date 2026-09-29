# Spec: Progress Bar

Ticket: [Spec: Progress Bar](../issues/95-spec-progress-bar.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer on Foundation for Sites who wants to show how far a task has come writes Foundation's Progress Bar markup: a `.progress` container carrying `role="progressbar"` and the `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` attributes by hand, a `.progress-meter` inside it whose inline `width` shows the value, optionally a `.progress-meter-text` inside the meter, and a palette class such as `.success` on the container. The same docs page styles two native elements by tag: `<progress>`, which takes the same palette classes, and `<meter>`. Progress Bar is a CSS-only component: it ships Sass and classes and no Plugin. The markup contract leaves the hard parts to the author:

- The value lives in two places, `aria-valuenow` and the meter's `width`, which the author keeps in step by hand.
- No example has an accessible name. axe reports `aria-progressbar-name` on all four of Foundation's examples that carry `role="progressbar"`; the three colour examples without a role expose no progress bar at all, so their value is not programmatically determinable. axe checks no name on a native `<progress>` or `<meter>`, and Foundation's native examples have no label.
- The bar's graphic alone cannot carry the value for a user with low vision. Against Foundation's `$medium-gray` track the fills reach 1.11:1 (success) to 2.86:1 (primary), and the track reaches 1.63:1 against the page, under the 3:1 of WCAG 2.2 success criterion 1.4.11. Because the palette mixes light and dark colours, no single track colour passes every fill except a near-black one.
- The meter text is Foundation's `$white` on every fill, with no setting to change it: 1.80:1 on success, 1.84:1 on warning, and 4.498:1 on alert, under the 4.5:1 of 1.4.3 (axe reports all three).
- The meter text is centred on the meter. While the meter is narrower than its text, the text spills onto the track and past the bar's start edge (measured in Chromium, Firefox, and WebKit: at 320 CSS px, "100%" fits only from a value of 10, "3 of 12 files" only from 25), where white text is 1.63:1 on the track and 1:1 on the page; axe marks it incomplete.
- A native `<meter>` colours itself by its `low`, `high`, and `optimum` ranges, so its colour alone says whether a value is good or bad (1.4.1).
- Under forced colours the `.progress` track and meter both take the page's Canvas colour in Chromium and Firefox, and the bar disappears.
- Under the library's class rule the developer writes no Foundation class at all, so `.progress`, `.progress-meter`, `.progress-meter-text`, and the palette classes need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the bar styled and its value exposed before hydration and inside dehydrated `@defer` blocks.

## Solution

Four attribute directives, one per Structural class plus one for the native element that takes Variant classes. `nfsProgress` on the container binds `.progress` and `role="progressbar"`, and sets `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` from four inputs, `value`, `min`, `max`, and `valueText`, with the value clamped into the range. `nfsProgressMeter` on the meter binds `.progress-meter` and sets its width from its progress bar, found through dependency injection, so the value is written once. `nfsProgressMeterText` binds `.progress-meter-text`. `progress[nfsProgressElement]` binds nothing but the colour on a native `<progress>`, whose own `value`, `max`, and label stay native. A `color` Variant input on `nfsProgress` and `nfsProgressElement` takes the names of the developer's `$foundation-palette`, Foundation's defaults extended by the developer's Variant declaration file, so a misspelt or removed name fails to compile, and no value sets no class. `<meter>` has no class and gets no directive; this spec documents it.

Every progress bar, native progress element, and meter shows its value as text a sighted user can read: in its meter text or beside it. WCAG's own guidance exempts a graphic whose information is also in visible text from 1.4.11, and Foundation's graphic cannot pass on Foundation's defaults, so the Visible value is the library's contract. In development builds the directives warn when a progress bar has no accessible name and when a meter text is wider than its meter.

The `nfs-progress-bar` Library mixin makes the meter text readable on every fill: it gives the text Foundation's `$black` wherever that contrasts more than `$white` (success and warning by default), and stops the compile when a fill leaves the text under 4.5:1 with both, naming the colour. On Foundation's defaults that asks the developer for one setting, a darker alert in `$foundation-palette`. The mixin also writes the Variant property that the Runtime checks and the Variant declaration file's generator read.

A native `<progress>` is the better element where it covers the need: a range that starts at 0 and a value shown beside the bar. `nfsProgress` is for a meter text, a minimum other than 0, or migrated Foundation markup. `<meter>` is for a measurement in a known range, never for task progress.

## User Stories

1. As an application developer, I want to put `nfsProgress` on a `div` and get Foundation's `.progress` track with `role="progressbar"`, so that I write no Foundation class and no role.
2. As an application developer, I want to bind the value once with `[value]`, so that `aria-valuenow` and the meter's width can never disagree.
3. As an application developer, I want `min` and `max` inputs that set `aria-valuemin` and `aria-valuemax` and scale the meter, so that a bar can count 3 of 12 files.
4. As an application developer, I want `value`, `min`, and `max` written as static attributes (`value="50"`) to work, so that a static bar needs no binding.
5. As an application developer, I want a value outside the range to be clamped, so that `aria-valuenow` stays valid and the meter never overflows its track.
6. As an application developer, I want a `valueText` input that sets `aria-valuetext`, so that a screen reader says "6 of 12 files" instead of "50 percent".
7. As an application developer, I want `nfsProgressMeter` to take its width from its progress bar, so that I never write an inline `width`.
8. As an application developer, I want the bar's percentage as a signal through `#bar="nfsProgress"`, so that I can print the Visible value beside it.
9. As an application developer, I want a `color` input that takes the names of my `$foundation-palette` (`primary`, `secondary`, `success`, `warning`, `alert` by default), so that I colour the meter without writing its classes.
10. As an application developer who adds `purple` to `$foundation-palette`, I want `color="purple"` to compile once my Variant declaration file lists it, so that my own colours are typed like Foundation's.
11. As an application developer, I want a misspelt or removed colour, or a Foundation class name such as `color="progress"`, to fail to compile, so that a typo never ships a plain bar.
12. As an application developer, I want no `color` to give me `$progress-meter-background`, so that my Sass settings stay the default look.
13. As an application developer, I want `nfsProgressMeterText` for Foundation's text inside the meter, so that the With Text form works without classes.
14. As an application developer, I want a development warning when a meter text is wider than its meter, so that I move the value beside the bar before a low value makes it unreadable.
15. As an application developer, I want a development warning when a progress bar has no accessible name, so that I notice what axe's `aria-progressbar-name` would report before a screen reader user does.
16. As an application developer, I want the same name warning on a native progress element, which axe does not check, so that native bars are not left unnamed.
17. As an application developer, I want `progress[nfsProgressElement]` to set Foundation's palette class on a native `<progress>`, so that native bars take colours under the class rule.
18. As an application developer, I want a native progress element's `value`, `max`, and `<label for>` to stay native, so that the platform element keeps its own semantics.
19. As an application developer, I want the spec to say when native `<progress>`, `nfsProgress`, or `<meter>` is the right element, so that I pick the one that fits.
20. As an application developer migrating Foundation markup, I want a copied `class="secondary progress"` to be reported in development, so that I learn to bind `color`.
21. As an application developer, I want a development report when I bind a colour my compiled CSS has no class for, or forget the `nfs-progress-bar` include, so that drift between my Sass and my types surfaces early.
22. As an application developer, I want the library's Sass to stop my build when the meter text falls under 4.5:1 on any fill, naming the colour and the ratio, so that a theme cannot fail silently.
23. As an application developer on Foundation's defaults, I want the spec to name the one setting that passes, so that I fix the compile error with one line.
24. As a user with low vision, I want every progress bar's value as text I can read, so that I do not have to judge a faint fill against a faint track.
25. As a user with low vision, I want meter text to contrast at least 4.5:1 with the fill under it, so that I can read "60%" on a green bar.
26. As a user who enlarges text spacing, I want meter text never to spill over the track or off the bar, so that I can read every character.
27. As a user of a Windows contrast theme, I want the value text to stay visible when the bar's colours are replaced, so that I still learn the progress.
28. As a screen reader user, I want each progress bar announced with its name, its role, and its value, so that I know what is progressing and how far.
29. As a screen reader user, I want the meter text not read a second time beside the value, so that the bar is announced once.
30. As a screen reader user, I want a task's completion reported as a status message without my focus moving, so that I hear "Upload complete" (the developer's `role="status"` region, which the recipe shows).
31. As a user who does not perceive colour, I want a meter's good or bad range said in text, so that its colour is not the only cue.
32. As a user of a right-to-left page, I want the bar to fill from the right, so that progress reads in my direction.
33. As a developer of a server-rendered application, I want the server HTML to carry `.progress`, the role, the value attributes, and the meter's width, so that the first paint is final and hydration changes nothing.
34. As a developer using `@defer (hydrate never)`, I want a progress bar there to stay styled and exposed at its server value, so that static regions look right without JavaScript.
35. As a developer of a zoneless application, I want the directives to need no zone, so that they work with zoneless change detection.
36. As an application developer, I want to import the directives from their own entry point, so that a `@defer` block can split them.
37. As a library maintainer, I want every behaviour asserted through roles, names, values, classes, widths, geometry, and computed colour in stories, browser-level tests, a server-render smoke test, a Sass compile test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Progress Bar has no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. Its whole contract is Foundation's progress-bar, progress, and meter Sass partials, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Feature | Class or markup | Source of the names | Notes |
| --- | --- | --- | --- |
| Progress bar | `.progress` | `@mixin foundation-progress-bar` (in `foundation-everything`) | Structural class. `$progress-height`, `$progress-margin-bottom`, `$progress-radius`, and the track colour `$progress-background` (`$medium-gray`). The docs write `role="progressbar"` and the four `aria-value*` attributes on it by hand |
| Meter | `.progress-meter` | the same mixin | Structural class inside `.progress`. `position: relative`, `display: block`, `width: 0%`, `height: 100%`, the fill `$progress-meter-background` (`$primary-color`). The docs set the value as an inline `width` |
| Meter text | `.progress-meter-text` | the same mixin | Structural class inside the meter. Centred on the meter (`position: absolute`, `top` and `left` 50%, `translate(-50%, -50%)`), `0.75rem` bold, `white-space: nowrap`, `color: $white` with no setting of its own. The docs ask for the same text in `aria-valuetext` |
| Colours | `.primary`, `.secondary`, `.success`, `.warning`, `.alert` on `.progress` | The keys of `$foundation-palette` (`@each $name, $color in $foundation-palette`, as `.progress.<name> .progress-meter`) | Open Variant family. The docs name four; the loop also makes `.primary`, which looks like the default while `$progress-meter-background` is `$primary-color` |
| Native progress | `progress` | `@mixin foundation-progress-element` (not in `foundation-everything`) | Styled by tag with `appearance: none`, the same `$progress-*` settings, and its fill in `::-webkit-progress-value` and `::-moz-progress-bar` |
| Native progress colours | `progress.<name>` | The keys of `$foundation-palette` | The same Open Variant family on the native element ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md), dated note) |
| Native meter | `meter` | `@mixin foundation-meter-element` (not in `foundation-everything`) | Styled by tag: `$meter-background`, and `$meter-fill-good`, `$meter-fill-medium`, `$meter-fill-bad` by the element's range state. No class, so no directive |

Docs conventions kept or corrected: the value attributes (kept, now the directive's host bindings); the inline meter `width` (kept as Foundation's mechanism, now the meter directive's binding); the colour examples without a role (corrected: every `nfsProgress` host is a progress bar); unnamed bars (corrected: a name is required and checked in development); the value shown only by the graphic (corrected: the Visible value); the screen-reader formula section ("aria-valuenow / (aria-valuemax - aria-valuemin)") (kept as documentation, corrected: the directive binds all three, assistive technology computes the share, and the library's docs state it as `(value - min) / (max - min)`, because Foundation's formula leaves the minimum out of the numerator).

### CSS class to directive mapping

| Foundation class | Angular | Type, Sass setting, and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.progress` | `NfsProgress` (`[nfsProgress]`), static host class | - | - | `progress` | - |
| `.progress-meter` | `NfsProgressMeter` (`[nfsProgressMeter]`), static host class | - | - | `progress-meter` | - |
| `.progress-meter-text` | `NfsProgressMeterText` (`[nfsProgressMeterText]`), static host class | - | - | `progress-meter-text` | - |
| Palette classes on `.progress` (`.primary`, `.secondary`, `.success`, `.warning`, `.alert` by default) | `color` Variant input of `NfsProgress` | `NfsProgressColor`, an alias of `NfsFoundationPaletteColor`, over `$foundation-palette` and its registry `NfsFoundationPaletteOverrides` (Open Variant family) | a name | the name itself (`color="alert"` sets `.alert`); no value sets none, so `$progress-meter-background` is the look | `--nfs-foundation-palette` (`primary secondary success warning alert` by default) |
| Palette classes on `progress` | `color` Variant input of `NfsProgressElement` (`progress[nfsProgressElement]`) | `NfsProgressColor`, the same alias and registry | a name | the name itself; no value sets none | `--nfs-foundation-palette` |

State classes: none. Foundation's Progress Bar has no State class, and the directives bind no library hook. `<meter>` has no class, so nothing maps to it. No class is left for the consumer to write (ADR 0039). Foundation has no responsive progress colour, so `color` takes no Breakpoint query or rules object.

### Hierarchy and DI shape

```
[nfsProgress]                 NfsProgress (standalone directive, no template)
  provides nfsProgressToken (useExisting)
  [nfsProgressMeter]          NfsProgressMeter: inject(nfsProgressToken), required
    [nfsProgressMeterText]    NfsProgressMeterText: inject(NfsProgressMeter), required

progress[nfsProgressElement]  NfsProgressElement (standalone directive, no parent, no children)
meter                         no directive
```

- Parent handle (building-blocks 1.9): `nfsProgressToken`, an `InjectionToken<NfsProgress>` in the entry point's tokens file with `import type`, provided by `NfsProgress` with `useExisting` and exported, so a consumer can provide an alternative (AGENTS.md). `NfsProgressMeter` injects it required, because a meter outside a progress bar has no value to show; outside one it fails with Angular's missing-provider error (NG0201), which prints the token's description, in development builds only "nfsProgressToken (provided by NfsProgress from 'ngx-foundation-sites/progress-bar' on an ancestor element declared in the same template)" (`typeof ngDevMode === 'undefined' || ngDevMode ? "..." : ''`, M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)). Element injectors follow the template where the meter is declared, so a meter in a child component's template inside the bar finds it too.
- `NfsProgressMeterText` injects `NfsProgressMeter` required and by class: the link stays inside the entry point, nothing outside it needs the meter, and a text outside a meter would be centred on whatever box contains it. The meter gives the text its host element for the development overflow check (D6) and its progress bar's `percentage` so the check runs again when the value changes.
- `NfsProgressElement` has no parent and no children; nothing finds it through DI.
- No host directives, and no Defaults token: Progress Bar has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection besides the above: `ElementRef` for the development checks; in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning (D13); the Runtime checks' handle of `ngx-foundation-sites/media-query`, `nfsVariantCheck('nfsProgress')` in `NfsProgress` and `nfsVariantCheck('nfsProgressElement')` in `NfsProgressElement` ([ADR 0040](../adr/0040-variant-input-types.md)). Nothing else.
- Entry point: `ngx-foundation-sites/progress-bar` (one per Foundation docs page), so a consumer's `@defer` can split it. `NfsProgressColor` and `nfsProgressToken` are exported beside the four directives; `NfsFoundationPaletteColor` and `NfsFoundationPaletteOverrides` live in the primary entry point `ngx-foundation-sites` and are used here as types only.
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsProgress` calls `nfsDirectiveCheck('NfsProgress', {children: ['NfsProgressMeter']})`: no parent check; it probes the meter; no peers; `strictParents` changes nothing.
  - `NfsProgressMeter` calls `nfsDirectiveCheck('NfsProgressMeter', {children: ['NfsProgressMeterText']})`: parent check none, because its `nfsProgressToken` injection is required and NG0201 is the report, with the token's description; it probes the meter text; no peers; `strictParents` changes nothing.
  - `NfsProgressMeterText` calls `nfsDirectiveCheck('NfsProgressMeterText')`: parent check none, because its injection of `NfsProgressMeter` is required; being by class, its NG0201 prints the class name (`_NfsProgressMeter` in a development build), the one form no token description reaches, which stays, because the name already says which directive to import and a token would add a public name for one message; no child probes; no peers; `strictParents` changes nothing.
  - `NfsProgressElement` calls `nfsDirectiveCheck('NfsProgressElement')`, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
  - `<meter>` has no directive, and no part sits on `ng-template` or `ng-container`. The development checks read their own host, and the meter text reads its meter's host through DI, so no check infers a part from its class, and a forgotten part changes none of their messages.

### API: `NfsProgress`

Selector `[nfsProgress]`; `exportAs: 'nfsProgress'`; standalone; no template.

```ts
type NfsProgressColor = NfsFoundationPaletteColor;

class NfsProgress {
  readonly value: InputSignal<number>;      // numberAttribute; default 0
  readonly min: InputSignal<number>;        // numberAttribute; default 0
  readonly max: InputSignal<number>;        // numberAttribute; default 100
  readonly valueText: InputSignal<string | undefined>; // default undefined: no aria-valuetext
  readonly color: InputSignal<NfsProgressColor | undefined>; // default undefined: no class
  readonly percentage: Signal<number>;      // 0 to 100, the clamped value's share of the range
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `value` | `number`, `numberAttribute` transform; a value that is not a number falls back to 0 | `0` | `aria-valuenow`, and the meter's inline `width` | New as an input. Clamped into `[min, max]` for `aria-valuenow` and the width, as Material clamps; ARIA requires the value inside the range. Not a `model()`: a progress bar is read-only (WAI-ARIA), so the application owns the value |
| `min` | `number`, `numberAttribute`; falls back to 0 | `0` | `aria-valuemin` | New. ARIA's default for `progressbar` is 0 |
| `max` | `number`, `numberAttribute`; falls back to 100 | `100` | `aria-valuemax` | New. ARIA's default for `progressbar` is 100 |
| `valueText` | `string \| undefined`; no transform | `undefined`, which sets no `aria-valuetext` | `aria-valuetext` ("If the value of the progress bar is not numeric, also add the attribute `aria-valuetext`") | New. An empty string sets none. The JSDoc says to give it the same text as a meter text that is not a share of the range (Foundation's With Text rule) |
| `color` | `NfsProgressColor`, declared with explicit type arguments that name the alias; no transform | `undefined`, which sets no class | `.progress.<color>` from `$foundation-palette` | New. The JSDoc names the class template `.progress.<color>` and the setting. The consumer's own names reach the type only through its Variant declaration file |

- `percentage`: a read-only `computed`, `(clamped value - min) / (max - min) * 100`, or 0 while `max` is not above `min`. The meter binds it, and a template reference can print it as the Visible value (`{{ bar.percentage() | number: '1.0-0' }}%`).
- Models, outputs, and methods: none. Nothing about a progress bar is set by the user.
- No indeterminate mode in the first release (D15): `value` is always a number, so `aria-valuenow` is always present.

Host bindings, all on signal state:

| Binding | Value |
| --- | --- |
| static `class` | `progress` |
| static `role` | `progressbar` |
| `[attr.aria-valuenow]` | the clamped value |
| `[attr.aria-valuemin]` | `min()` |
| `[attr.aria-valuemax]` | `max()` |
| `[attr.aria-valuetext]` | `valueText()`, or `null` when it is `undefined` or empty |
| `[class]` | one `computed` list: the `color` value when it is one class token; the static class and the consumer's own classes stay, because Angular combines static classes and class bindings |

- `aria-valuemin` and `aria-valuemax` are bound even at 0 and 100: Foundation's markup writes them, and they cost nothing.
- Attribute ownership: the directive owns `.progress`, the Variant class, `role`, and the four `aria-value*` attributes. A copied static `aria-valuenow` or `aria-valuetext` loses to the binding. The name (`aria-labelledby`, `aria-label`, `title`) and `aria-describedby` stay the consumer's; the directive adds no `tabindex`, no live region, and no `aria-busy`.
- Development-mode checks, in the directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or the Variant check handle is not `null` (never on the server, and in a production build only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on, each once per instance:
  1. No accessible name (D12). A `progressbar` takes its name from the author only (WAI-ARIA: "Name From: author"), so its content never names it. The name, in accessible-name order from the text of the elements `aria-labelledby` references, or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` in them (building-blocks 1.10, Names), then a non-blank `aria-label`, then a non-blank `title`, is empty: "nfsProgress: this progress bar has no accessible name; point aria-labelledby at its visible label or add aria-label (WCAG 1.1.1, 4.1.2). Its text content does not name it." The check runs at the first render, because the name must be in server HTML.
  2. Copied classes (D13): a static class list that holds Foundation's default palette names warns, naming each class with its input, for example "class="secondary" is set by nfsProgress: bind color="secondary" instead". A copied Variant class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `progress` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared names are left to the Variant check (the Button spec's D22 rule).
  3. Range (D18): `max` not above `min` warns "nfsProgress: max (<max>) is not above min (<min>), so the bar shows no progress; set max above min".
- Runtime check: in the same read phase, on every run, `NfsProgress` calls `include('nfs-progress-bar', ['foundation-palette'])` whether or not `color` is bound, then `value('color', color, needs)` with the need `{setting: 'foundation-palette', name: color}` for a one-token value and `null` otherwise (D14). `strictVariantNames` compares a bound `color` with `--nfs-foundation-palette`; `strictVariantProperties` reports a missing `@include nfs-progress-bar;` when that property reads empty. `nfs-callout` writes the same property, so in an application that includes `nfs-callout`, a missing `nfs-progress-bar` is not reported (D14). The report shape, the per-realm read, and the configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).

### API: `NfsProgressMeter`

Selector `[nfsProgressMeter]`; `exportAs: 'nfsProgressMeter'`; standalone; no template; no inputs, outputs, or methods.

| Binding | Value |
| --- | --- |
| static `class` | `progress-meter` |
| `[style.width.%]` | the progress bar's `percentage()` |

- The width is an inline style, Foundation's own mechanism ("Add a `width` CSS property to the inner meter"). A copied static `style="width: 50%"` loses to the binding, so the value has one source.
- In a right-to-left context the meter is a block narrower than its container and sits at the start edge, so the bar fills from the right with no rule and no `Directionality` (measured in three engines).

### API: `NfsProgressMeterText`

Selector `[nfsProgressMeterText]`; `exportAs: 'nfsProgressMeterText'`; standalone; no template; no inputs, outputs, or methods. It binds the static class `progress-meter-text`; the text is the consumer's content.

- Development-mode check (D6), in one `afterRenderEffect` read phase that exists only when `ngDevMode` is on (never on the server, never in production): at the first render and after each render in which its progress bar's `percentage()` changed, it compares its host's horizontal extent with its meter's, and warns once, then stops checking: "nfsProgressMeterText: the meter text "<text>" is wider than its meter at <percentage> percent, so part of it sits on the track or the page, where it can fall under 4.5:1 (WCAG 1.4.3); show the value beside the bar while the meter can be narrower than its text". Only the horizontal extent counts: the text's line box is 18 px against Foundation's 16 px bar at the default size, and its glyphs fit.
- A progress bar is a `progressbar`, whose children are presentational (WAI-ARIA: "Children Presentational: True"), so the meter text is not exposed as text of its own (measured in Chromium: the meter's node in the accessibility tree has the role `none`, and the Windows UI Automation ProgressBar has no children). A screen reader announces `aria-valuetext` when it is set, otherwise the value's share of the range, so a meter text that is not a share of the range goes into `valueText` as well.

### API: `NfsProgressElement`

Selector `progress[nfsProgressElement]`; `exportAs: 'nfsProgressElement'`; standalone; no template. Named after Foundation's `foundation-progress-element` mixin, as building-blocks 1.3 names a directive on an element Foundation styles by tag.

```ts
class NfsProgressElement {
  readonly color: InputSignal<NfsProgressColor | undefined>; // default undefined: no class
}
```

| Input | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `color` | `NfsProgressColor`, declared with explicit type arguments that name the alias; no transform | `undefined`, which sets no class | `progress.<color>` from `$foundation-palette` | New |

- It declares no `value` or `max` input, so a template's `[value]` and `max` reach the native element's own properties and attributes, and the native element keeps its implicit `progressbar` role, its value, and its labels. `aria-valuetext` is written natively where needed.
- Host binding: `[class]`, the same one-token `computed` list as `NfsProgress`. No static class of its own: Foundation styles `progress` by tag.
- Development-mode checks, in the same kind of read phase as `NfsProgress`, warning once per instance: no accessible name, from `aria-labelledby` text, a non-blank `aria-label`, the text of the element's `labels` (a `<label for>` or a wrapping label), or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` in the referenced elements or the labels, or a non-blank `title`: "nfsProgressElement: this progress element has no accessible name; give it a <label for>, aria-labelledby, or aria-label (WCAG 1.1.1, 4.1.2)". axe has no rule for this: its `aria-progressbar-name` selects only an explicit `role="progressbar"`. Copied palette classes warn as on `NfsProgress`.
- Runtime check: `include('nfs-progress-bar', ['foundation-palette'])` and `value('color', ...)`, as `NfsProgress` does.
- The directive exists for the colour; on a native progress element with no colour it is optional, and it adds the name check, so the docs put it on every native progress element.

### Which element

| Need | Element | Why |
| --- | --- | --- |
| Task progress on a range from 0, with the Visible value beside the bar | Native `<progress>` with `nfsProgressElement` | The platform's element: implicit `progressbar` role, `<label for>` names it, `value` and `max` are native, and Foundation's element styles give it the Progress Bar look. In Firefox's forced colours it stays visible, where `.progress` disappears (measured) |
| Meter text inside the bar, a minimum other than 0, or migrated `.progress` markup | `nfsProgress` with `nfsProgressMeter` (and `nfsProgressMeterText`) | A native `<progress>` has no minimum and renders no children, so it cannot hold a meter text |
| A measurement in a known range (storage used, battery level) | Native `<meter>`, no directive | The APG Meter pattern: "The meter should not be used to indicate progress"; `<meter>` is a measurement, a progress bar a task |
| A task whose share is unknown | Native `<progress>` without `value`, with text such as "Loading" | Out of `nfsProgress`'s first release (D15). Under Foundation's element styles an indeterminate native progress shows an empty track in Chromium and WebKit and a full bar in Firefox (measured), so its Visible value is the text |

This follows the scope lens's position at triage (native `<progress>` first), as guidance, not as a restriction: `nfsProgress` stays for what the native element lacks.

### Comparison with Angular Material (22.2)

| Concern | Material `MatProgressBar` | This library |
| --- | --- | --- |
| Selector and kind | `mat-progress-bar`, a component with its own template | `[nfsProgress]` and its meter directives on the consumer's markup; `progress[nfsProgressElement]` on the native element |
| Role and value | Host `role="progressbar"`, static `aria-valuemin="0"` and `aria-valuemax="100"`, `aria-valuenow` from `value`, clamped to 0 to 100 | The same role; `min` and `max` inputs for any range; the value clamped into it |
| Value text | None | `valueText` for `aria-valuetext`, Foundation's attribute |
| Modes | `determinate`, `indeterminate`, `buffer`, `query`; `bufferValue` | Determinate only (D15); Foundation has no other look |
| Colour | `color` palette string (M2) | `color` Variant input over `$foundation-palette`, typed through the Variant registry |
| Focus | Host `tabindex="-1"`, commented as a workaround for JAWS reading the label in Firefox | No `tabindex`: a pointer press on a non-interactive bar would move focus to it; the name is checked in development and the announcement is a manual release test |
| Outputs | `animationEnd` | None; nothing animates |
| Testing | `MatProgressBarHarness` | DOM-first assertions; no harness |

Borrowed: the host role and value bindings and the clamping. Not borrowed: a component template (Foundation's markup carries every element, ADR 0001), the modes, the focus workaround, and the animation output.

### Implementation level and primitives

Implementation level: native platform. The progress bar is an ARIA `progressbar` on the consumer's element with Foundation's CSS; the native `<progress>` and `<meter>` elements carry their own semantics. `@angular/aria` has no progress-bar or meter pattern in 22.2, and `@angular/cdk` has nothing to add. The Angular layer is host bindings over five `input()` signals, one `computed` percentage, one `computed` class list per colour-bearing directive, one parent token, development-only render callbacks, and the Runtime check requests. No `effect`, no listener, no timer, no observer.

Fallback: none needed. The two risks the directives own, the meter text's contrast and its overflow, were measured in three engines by this spec's ticket, with axe.

### ARIA and keyboard

APG pattern: none for a progress bar (the APG has no progressbar pattern; its range-related-properties practice covers `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`); the APG Meter pattern for `<meter>`.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| `[nfsProgress]` | `role="progressbar"`; name from the consumer's `aria-labelledby`, `aria-label`, or `title` (required, "Name From: author"); `aria-valuenow` the clamped value; `aria-valuemin`, `aria-valuemax`; `aria-valuetext` from `valueText` | WAI-ARIA `progressbar`; APG range-related properties ("omit `aria-valuenow`" only when indeterminate) |
| `[nfsProgressMeter]`, `[nfsProgressMeterText]` | Presentational: children of a `progressbar` are not exposed separately | WAI-ARIA "Children Presentational: True"; measured in Chromium (CDP and Windows UI Automation) |
| `progress[nfsProgressElement]` | Implicit `progressbar`; name from `<label for>`, `aria-labelledby`, or `aria-label`; value and maximum native | HTML-AAM |
| `<meter>` | Implicit `meter` role; name from `<label for>` | HTML-AAM; APG Meter pattern ("If the meter has a visible label, it is referenced by `aria-labelledby`") |
| Completion or failure of a task | The consumer's `role="status"` region with a message such as "Upload complete"; the directive adds no live region, which would speak every update | WCAG 4.1.3; APG Alert pattern for urgent failures |

Measured in Chromium through Windows UI Automation: the progress bar is a ProgressBar control named from `aria-labelledby`, with RangeValue minimum 0, maximum 12, and value 3, the Value pattern reads "3 of 12 files" from `aria-valuetext`, and it has no children; the native `<progress>` is named from its `<label>`; the native `<meter>` is a ProgressBar control with the localized meter type. In Firefox the same probe reads the names and range values, and its UI Automation view shows no Value for `aria-valuetext`, which Firefox's screen readers read through IAccessible2 instead; the announcement is the manual release test below.

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Skips every progress bar, native progress element, and meter: none is focusable | Native |

Focus: none of the directives moves focus or makes anything focusable. A recipe that starts a task keeps focus on the control that started it; the completion message goes to a `status` region.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. Ratios were computed by this spec's ticket with the exact WCAG relative-luminance formula (`math.pow`) from Foundation 6.9.0's default settings, unrounded, never Foundation's `color-luminance()`, which raises to the power 2.4 through an approximate `pow()` (the [Spec: Top Bar](../issues/86-spec-top-bar.md) measured its false passes); axe computes from rendered 8-bit colours, so its figures differ in the second decimal. Geometry was measured in Chromium, Firefox, and WebKit through Playwright 1.63, with axe-core 4.13.0.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.4.11 Non-text Contrast | Every progress bar, native progress element, and meter shows its Visible value: text a sighted user reads, in its meter text or beside it (D7). The Understanding document for 1.4.11 then does not require the graphic: "that is not a requirement when: A graphic with text embedded or overlaid conveys the same information, such as labels and values on a chart", and its testing principles exclude "graphics which have visible text for the same information". The directives cannot read where text sits on a page; the docs require the Visible value, every recipe and story shows it, and every play function asserts it, as the Callout requires the text of a coloured callout to say its kind. `nfs-progress-bar` checks no graphic pair | The graphic fails on its own: fills against the `$medium-gray` track are default and primary 2.86, secondary 2.77, success 1.11, warning 1.13, alert 2.77:1; the track against the page is 1.63:1; the meter element's good, medium, and bad fills reach 1.11, 1.13, and 2.77:1 against `$meter-background`. The only track that passes every default fill and the page is near-black (`$progress-background: $black`: fills 4.22 to 10.91:1, the page 19.63:1), a different look, which the ticket records as the upgrade path (D7) | Play functions assert each story bar's Visible value; e2e under forced colours asserts it stays visible |
| 1.4.3 Contrast (Minimum) | Meter text, `0.75rem` bold and so not large text, reaches 4.5:1 on its fill: `nfs-progress-bar` gives it `$black` wherever that contrasts more than Foundation's `$white` (D8), and stops the compile with `@error` naming the setting, the colour, and the ratio for every fill under 4.5:1 with its text (D9). Required consumer setting on Foundation's defaults: `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` (the alert colour the Button and Abide specs already require for their own settings), which reaches 5.25:1 with `$white`. Meter text stays inside its meter (D6), because beyond it white text is 1.63:1 on the track and 1:1 on the page. A Visible value beside the bar is page text in `$body-font-color` | Meter text fails on three fills: success 1.80, warning 1.84, alert 4.498:1 with `$white` (alert is 4.36:1 with `$black`); primary 4.65 and secondary 4.504:1 pass. axe `color-contrast` reports all three (1.79, 1.84, 4.49). Below the value at which it fits, the text spills over the track and past the bar's start edge in all three engines, and axe marks its contrast incomplete | Node-level Sass compile test; axe `color-contrast` in `progress-bar--with-text` and `progress-bar--colors` under the Storybook settings overrides; the browser-level test of the overflow check; e2e geometry in three engines |
| 1.4.12 Text Spacing | With line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em, meter text stays inside its meter or is not used as the Visible value: letter spacing widens it (at 320 CSS px "100%" grows from 30.7 to 36.5 px and needs a value of 15 instead of 10; "3 of 12 files" grows from 65.4 to 89.8 px and does not fit at 25), which the overflow check reports and the docs' rule (a meter text only where the meter is always wider than its text) prevents | Foundation's With Text example at 25 fits at 320 CSS px with and without the spacing | e2e in three engines at 320 by 640 px with the text-spacing stylesheet: every meter text in `progress-bar--with-text` lies inside its meter |
| 1.4.1 Use of Color | A meter whose `low`, `high`, or `optimum` is set says its range in text beside it ("30 percent, low"), because its fill colour is otherwise the only cue; a coloured progress bar's colour is a look, and its text says any meaning the colour suggests (a failed upload says "Failed") | Foundation's meter examples colour three meters by range and say nothing | `progress-bar--native-meter`'s play function asserts each meter's text names its range |
| 1.3.1 Info and Relationships | Every `nfsProgress` host is a `progressbar` with its value attributes, so the value shown by the meter is programmatically determinable | Foundation's three colour examples have no role or value attributes | Browser-level host-binding tests; axe in every story |
| 1.1.1 Non-text Content, 4.1.2 Name, Role, Value | Every progress bar, native progress element, and native `<meter>` has an accessible name from its label: `aria-labelledby` at visible text, `aria-label`, or a `<label for>` for a native element; the directives check it in development (D12); the role and value come from the directive or the native element | axe `aria-progressbar-name` (`wcag2a`, `wcag111`) on all four of Foundation's role-bearing examples; axe checks no native `<progress>` or `<meter>` name | axe in every story; browser-level tests of both name checks; play functions find every bar by `getByRole('progressbar', {name})` and every meter by `getByRole('meter', {name})` |
| 4.1.3 Status Messages | A progress bar that reports a task the user started is announced by its role and value; the task's end (success or failure) is a message in the consumer's `role="status"` region, or `role="alert"` for an urgent failure, and focus stays where it was. The directives add no live region: one on a changing bar would speak every update | The Understanding document lists "An application displays a dynamic progress bar to indicate the status of an upgrade" among status messages; Foundation's docs add no region | `progress-bar--live`: after the last step the `status` region holds "Upload complete" and focus stays on the button |
| 2.2.2 Pause, Stop, Hide | The library starts no timer and animates nothing; a bar that reports a task the user started updates with the task, not on a preset interval, so it is not auto-updating content in the Understanding's sense. A bar the consumer advances on its own timer beside other content is the consumer's content under 2.2.2 | Foundation's meter has no transition | Nothing to test in the library |
| 1.4.10 Reflow | A progress bar is a block with no fixed width; at 320 CSS px nothing scrolls sideways | Passes | e2e at 320 by 640 px: `scrollWidth` is at most 320 in `progress-bar--with-text` |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directives declare no listener, so nothing adds `jsaction`. Class and attribute order is not significant; Angular also renders the directive attributes and the static attributes that feed inputs (`nfsprogress=""`, `max="12"`, `color="success"`), which the resulting DOM below leaves out, as the other specs do.

```html
<!-- Basics: the name and the Visible value beside the bar -->
<p><span id="upload-name">Uploading report.pdf</span> <span>{{ bar.percentage() | number: '1.0-0' }}%</span></p>
<div nfsProgress #bar="nfsProgress" aria-labelledby="upload-name" [value]="progress()">
  <div nfsProgressMeter></div>
</div>

<div class="progress" role="progressbar" aria-labelledby="upload-name" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-meter" style="width: 50%;"></div>
</div>

<!-- With Text, a count: the meter text is the Visible value, and valueText speaks the same -->
<div nfsProgress color="success" aria-label="Files uploaded" [value]="6" max="12" valueText="6 of 12 files">
  <span nfsProgressMeter><span nfsProgressMeterText>6 of 12 files</span></span>
</div>

<div class="progress success" role="progressbar" aria-label="Files uploaded" aria-valuenow="6" aria-valuemin="0" aria-valuemax="12" aria-valuetext="6 of 12 files">
  <span class="progress-meter" style="width: 50%;"><span class="progress-meter-text">6 of 12 files</span></span>
</div>

<!-- Native progress with a colour -->
<label for="storage">Storage used</label> <span>75%</span>
<progress id="storage" nfsProgressElement color="warning" max="100" value="75"></progress>

<progress id="storage" class="warning" max="100" value="75"></progress>

<!-- Native meter: no directive; the text says the value and its range -->
<label for="battery">Battery</label>
<meter id="battery" min="0" low="33" high="66" optimum="100" max="100" value="30"></meter>
<span>30 percent, low</span>
```

Server and hydrated DOM are identical for every example: the width is an inline style from the host binding, and the value attributes are host bindings on signal state. `<meter>` renders as written.

### Animation

None. Foundation's progress partial declares no transition, so a changed value moves the meter at once, and the library adds none: a transition on `width` would show a value the ARIA attributes no longer carry. No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries `.progress`, the Variant class, `role`, the four `aria-value*` attributes, and the meter's `style="width: <n>%;"` exactly as the hydrated DOM does, so the first paint is final and assistive technology reads the dehydrated bar's name and value.
- Before hydration: the directives touch no DOM outside host bindings, measure nothing, and start no timer. The development checks and the Runtime check requests run in render callbacks, which are no-ops on the server.
- Full and incremental hydration: host binding values equal the server's, so hydration changes nothing; there is no structure to mismatch. A progress bar and its meter belong to one Hydration boundary: a meter inside a nested `@defer (hydrate on ...)` block keeps its server width until that block hydrates, even after the bar's value has changed, so the docs keep the meter in its bar's block.
- Event replay: no directive declares a listener or adds `jsaction`; there is nothing to replay.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a progress bar is its server HTML, styled and exposed at its server value. Inside `@defer (hydrate never)` it keeps that value for good, which suits a static bar and not a live one; live bars do not go in `hydrate never`.
- Prerendering: identical to SSR; the directives read no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the role, name, and value attributes, the classes, the meter's computed width against its track, where the meter text sits, the computed text colour, the Visible value, and the live region's content. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Callout](../issues/89-spec-callout.md)'s and [Spec: Close Button](../issues/83-spec-close-button.md)'s tests, the nearest precedents.

Story ids follow `progress-bar--<story>`: `progress-bar--default`, `progress-bar--colors`, `progress-bar--with-text`, `progress-bar--live`, `progress-bar--native-progress`, `progress-bar--native-meter`, `progress-bar--right-to-left`. `meta.component` is `NfsProgress`; `value`, `min`, `max`, `valueText`, and `color` are args. Stories use Foundation's default names only, so the library's Storybook program needs no Variant declaration file (ADR 0040). The Storybook settings overrides carry this spec's required setting (Sass subsection), and the preview includes `foundation-progress-element`, `foundation-meter-element`, and `nfs-progress-bar`. Every story shows each bar's name and Visible value.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags (which include `aria-progressbar-name` and `color-contrast`). No story element carries a Foundation class written in the story.

- `progress-bar--default`: Foundation's Basics pair (0 and 50), each named by `aria-labelledby` at a visible label with its Visible value beside it. Each is found by `getByRole('progressbar', {name})`, carries `.progress`, `aria-valuenow` 0 and 50, `aria-valuemin` 0, `aria-valuemax` 100, and no `aria-valuetext`; the meters' computed widths are 0 and half of their tracks' content widths; the Visible value texts read "0%" and "50%".
- `progress-bar--colors`: Foundation's Colors example, one bar per default palette name plus one with no `color`, each at 50 with its Visible value. Each carries its name's class; each meter's computed background differs from the uncoloured one except `primary`'s, which equals it.
- `progress-bar--with-text`: Foundation's With Text example ("25%" at 25), a count ("6 of 12 files" at 6 of 12 with the same `valueText`), and "60%" at 60 on the default, success, warning, and alert bars. `aria-valuetext` equals the count's meter text; every meter text lies inside its meter's box; the computed text colour is `$white` on the default and alert bars and `$black` on success and warning; axe passes `color-contrast` under the required setting.
- `progress-bar--live`: an "Upload next file" button advances a bar named "Uploading 4 files" by one file per click, with its Visible value ("2 of 4 files") beside it and in `valueText`. After each click `aria-valuenow` and the meter's width follow; after the fourth the width is the whole track, the `role="status"` region holds "Upload complete", and focus stays on the button.
- `progress-bar--native-progress`: Foundation's Native Progress examples as labelled `<progress nfsProgressElement>` elements, one with no `color` and one per docs colour, each at 75 with its Visible value. Each is found by `getByRole('progressbar', {name})` through its `<label for>` and carries its colour class.
- `progress-bar--native-meter`: Foundation's Native Meter examples (30, 50, and 100 with `low` 33, `high` 66, `optimum` 100), each labelled and followed by its value and range in text ("30 percent, low", "50 percent, medium", "100 percent, high"). Each is found by `getByRole('meter', {name})`, and each text names its range.
- `progress-bar--right-to-left`: a `dir="rtl"` wrapper with an `nfsProgress` bar at 25 and a native progress element at 25, each named and with its Visible value ("25%") beside it. The meter's right edge equals its track's right edge, and each Visible value is present.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directives over a bare test host component, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data: `.progress` and `role="progressbar"` are present; `value`, `min`, and `max` as static strings (`value="50"`) and as bound numbers set the three attributes; `-10` and `120` clamp to `0` and `100` in both `aria-valuenow` and the width; a string that is not a number falls back to the default; `valueText=""` sets no `aria-valuetext`; every default colour sets exactly its class, and a value reached through `$any()` that contains a space sets none; changing `value` updates the attribute and the width together; a copied static `style="width: 10%"` on the meter is replaced; `percentage()` through the template reference reads 25 for 3 of 12.
- DI: `nfsProgressMeter` outside a progress bar fails with the missing-provider error naming `nfsProgressToken`; `nfsProgressMeterText` outside a meter fails the same way; a meter in a child component's template inside the bar takes the bar's width; a test double that provides `nfsProgressToken` drives a meter on its own.
- Development checks: each name source (`aria-labelledby` at text, `aria-label`, `title`) is silent, and so is `aria-labelledby` at an element that holds only an `img` with a non-blank `alt`, and a native progress element whose `<label for>` holds only such an image; no name warns once, and so do `aria-label=""` and `aria-labelledby` at a missing id; a meter text alone does not name the bar and warns; `class="secondary progress"` warns once naming `color`, and a redundant `class="progress"` does not; `max` equal to `min` warns once; a meter text wider than its meter (at 0) warns once and never again, and one inside its meter (at 50) is silent; the native element's `<label for>` and wrapping label are silent and no name warns; nothing is checked when `ngDevMode` is false.
- Native element: `color` sets its class; `[value]` and `max` reach the element's own `value` and `max` properties, which no directive input captures.
- Runtime check: with `--nfs-foundation-palette: primary secondary success warning alert` on the test document, a listed `color` is silent and an unlisted one bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$foundation-palette`; in a test file of its own, with the property absent, a bar with no `color` reports `strictVariantProperties` once, naming `@include nfs-progress-bar;`.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with a bar at 50, a success bar at 6 of 12 with meter text and `valueText`, a bar bound to 120, and a native progress element with `color="warning"`. `whenStable()` resolves; the server HTML carries `class="progress"`, `role="progressbar"`, the value attributes (`aria-valuenow="100"` for the clamped bar), `aria-valuetext="6 of 12 files"`, the meters' `style="width: 50%;"` and `style="width: 100%;"`, and `class="warning"` on the native element; no element carries `jsaction`; no development warning or Runtime check report is made on the server.
- Sass compile, over Foundation 6.9.0's settings with `@import 'ngx-foundation-sites';`:
  - Foundation's defaults plus `@include nfs-progress-bar;` stop with one `@error` naming `$foundation-palette` alert `#cc4b37` with its meter text at 4.498:1.
  - With the required setting the include compiles and emits exactly `:root { --nfs-foundation-palette: primary secondary success warning alert; }`, `.progress.success .progress-meter-text { color: #0a0a0a; }`, and the same for `warning`, and no copy of a Foundation rule.
  - A palette merged with `purple: #5b2a86` and `teal: #7fdbda` lists both, and gives `teal` the `$black` rule.
  - A light `$progress-meter-background` (`#ffae00`) emits `.progress-meter-text { color: #0a0a0a; }` and `$white` rules for `primary`, `secondary`, and `alert`.
  - A palette colour that leaves the text under 4.5:1 with both candidates stops the compile: `#777777` (4.44:1 with `$white`), and `#1177dd` (4.437:1 with `$black` by the exact formula, which Foundation's `color-luminance()` reports as 4.505:1), so the test pins the exact helper.
  - A palette with `primary` only writes `--nfs-foundation-palette: primary` and no text rule.
- Pure logic: none worth isolating; the percentage and clamping are covered through the DOM in layer 2.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Meter text geometry (1.4.3, 1.4.12) in three engines: at 320 by 640 px, with and without a stylesheet that sets line height 1.5, paragraph spacing 2em, letter spacing 0.12em, and word spacing 0.16em on every element, every meter text in `progress-bar--with-text` lies horizontally inside its meter.
- Forced colours (Chromium and Firefox; not run in WebKit, which matches the query under emulation but forces no colour, and Safari has no forced-colours mode): in `progress-bar--default` and `progress-bar--with-text` a pixel inside each Visible value text differs from the Canvas colour around it, so the value survives when the bar itself takes Canvas.
- Right to left in three engines: in `progress-bar--right-to-left` the pixel near the right end of each bar at 25 shows the fill and the pixel near the left end the track, for `nfsProgress` and for the native element, whose fill the engine draws.
- Reflow (1.4.10) in three engines: at 320 by 640 px, `document.documentElement.scrollWidth` is at most 320 in `progress-bar--with-text`.

Against the prerendered fixture app, on the Progress Bar route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; each meter's computed width equals its server `aria-valuenow`'s share of the range before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

Manual release test (ADR 0022, as the Slider's): with NVDA on Firefox and Chrome, JAWS on Chrome, and VoiceOver on Safari, `progress-bar--with-text` and `progress-bar--live` announce each bar's name, role, and `aria-valuetext` (or the share of the range), do not read the meter text a second time, and announce the `status` message at the end of the live task.

## Out of Scope

- An indeterminate mode, a buffer value, and Material's other modes (D15); Foundation has no look for them.
- Text-less progress bars: every bar shows its Visible value (D7). The checked alternative, a near-black track that makes the graphic pass on its own, is the recorded upgrade path.
- A forced-colours rule for the bar (D16).
- A directive, a name check, or a Library rule for `<meter>`: it has no class (ADR 0039), and a check-only directive would run only where the consumer already wrote it, so it would reach no one the recipe does not; the meter's name is a stated requirement instead (the 4.1.2 row), because axe's `aria-meter-name` selects only `[role="meter"]` and passes an unnamed native meter.
- A live region, `aria-busy`, or announcements of value changes; the consumer's `status` region carries completion (4.1.3).
- A transition on the meter's width, and any Motion class: Foundation's progress partials declare none, and a transition would show a value the ARIA attributes no longer carry (Animation).
- Stacked or multi-segment bars, which Foundation does not have.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration: [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md).
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Four attribute directives in `ngx-foundation-sites/progress-bar`: `[nfsProgress]` binds `.progress`, `[nfsProgressMeter]` `.progress-meter`, `[nfsProgressMeterText]` `.progress-meter-text`, and `progress[nfsProgressElement]` the colour of a native progress element | ADR 0001 and ADR 0039: one directive per Structural class on consumer-written elements, and Foundation generates nothing; native `<progress>` takes Variant classes, so it gets a directive for them (ADR 0039, dated note), named after `foundation-progress-element` (building-blocks 1.3) | A `nfs-progress-bar` component rendering the meter (Foundation's markup already carries it); `nfsProgress` on `<progress>` too (it would bind `.progress`'s track styles and a redundant role on the native element); no directive for native progress (its palette classes would stay consumer-written) |
| D2 | `color` Variant input on `NfsProgress` and `NfsProgressElement`, one alias `NfsProgressColor` over `NfsFoundationPaletteColor` and its registry `NfsFoundationPaletteOverrides` | ADR 0040 and building-blocks 1.4: the palette is an Open Variant family named `color`; both class sets loop over `$foundation-palette` itself, so the alias follows that registry with no chain; the family alias keeps the naming rule and gives the manifest's two `uses` entries and the typings check an alias to name | Consumer-written palette classes (ADR 0039); a progress palette registry of its own (Foundation has no `$progress-palette`); two aliases for one family on one page |
| D3 | `value`, `min`, and `max` inputs with `numberAttribute` (defaults 0, 0, 100) and `valueText` for `aria-valuetext`; the value clamped; a read-only `percentage` signal | Foundation's attributes, named as the native element and Material name the value; one binding feeds the ARIA and the width, so they cannot disagree; clamping keeps `aria-valuenow` inside the range, as ARIA requires and Material does; `percentage` feeds the meter and the Visible value | A `model()` (a progress bar is read-only); Material's fixed 0 to 100 (Foundation's docs show other ranges through `aria-valuemax`); a `displayWith` formatter (a string is Foundation's attribute and a smaller API); a derived default `aria-valuetext` (assistive technology already speaks the share) |
| D4 | Static `role="progressbar"`; `aria-valuemin` and `aria-valuemax` always bound; no `tabindex`, live region, or `aria-busy` | WAI-ARIA `progressbar`; Foundation's markup writes both bounds; a live region would speak every update; `aria-busy` belongs on the region a load fills, which is the consumer's | Material's `tabindex="-1"` (a pointer press would focus a non-interactive bar; the name is checked and announced without it in the release test); `aria-live` on the bar |
| D5 | The meter's width is `[style.width.%]` from the progress bar's `percentage()`, found through the exported `nfsProgressToken`, required | Foundation's own mechanism, an inline width; the parent-token pattern of building-blocks 1.9 and AGENTS.md; a meter outside a bar has nothing to show | A custom property and a library rule (re-implements Foundation's width); a `width` input on the meter (a second statement of the value); an optional token with standalone meters (a meter without a bar is meaningless) |
| D6 | `NfsProgressMeterText` binds its class and, in development only, warns once when its text is wider than its meter | Measured in three engines: the centred text spills over the track and past the bar's start while the meter is narrower than it, where `$white` text is 1.63:1 and 1:1, and axe marks it incomplete, so no story gate sees it; the directive knows both boxes after render; letter spacing widens the text (1.4.12) | A library rule that clips the text (a cut value is not readable); moving the text beside a narrow meter in CSS (CSS cannot compare a container's width with its content's); a minimum meter width (misstates the value); no check (a silent 1.4.3 failure at every low value) |
| D7 | The Visible value: every progress bar, native progress element, and meter shows its value in text; `nfs-progress-bar` checks no graphic pair | The Understanding document for 1.4.11 exempts a graphic whose information is in visible text; Foundation's graphic fails on its own (fills 1.11 to 2.86:1 against the track, the track 1.63:1 against the page), and with its mixed light and dark palette only a near-black track passes, a different look; text also carries the value through forced colours, where the bar disappears, and a meter's range needs text for 1.4.1 anyway; the Slider keeps its fill check because its value has no text | Graphic checks with a required `$progress-background: $black` (every default fill 4.22 to 10.91:1, the page 19.63:1; the Callout-style unconditional check, rejected for its look and because text-bearing bars do not need it); an optional `nfs-progress-bar` parameter that turns those checks on for text-less bars (additive later, the upgrade path); fill-against-track checks only, as the Slider has (fails the track against the page, and forces a global palette change or a near-black track for a bar that text already exempts) |
| D8 | `nfs-progress-bar` gives the meter text `$black` on every fill where `$black` contrasts more than `$white` by the exact ratio, and restores `$white` on coloured bars when the default fill's pick is `$black` | Foundation fixes the meter text at `$white` with no setting; picking between Foundation's own `$white` and `$black` is what Foundation's Badge, Label, and Button text does; on Foundation's defaults it emits two rules (success and warning, 10.91 and 10.66:1) and changes no palette colour | Requiring darker success and warning in `$foundation-palette` (recolours callouts, badges, labels, and buttons site-wide, as the Callout's D8 rejected); Foundation's `color-pick-contrast()` (it compares ratios rounded to one decimal through the approximate luminance) |
| D9 | `nfs-progress-bar` stops the compile with one `@error` listing every fill whose meter text is under 4.5:1, by the exact formula; required on Foundation's defaults: `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` | ADR 0022 and building-blocks 1.10: axe sees only the fills a story renders; alert fails with both candidates (4.498 and 4.36:1), so only the colour can change, and `#bf3f2c` is the alert the Button and Abide specs already require (5.25:1 with `$white`); with it, the Callout's alert background keeps its links at about 4.85:1 and its glyph at about 3.63:1 | `@warn` (a consumer on Foundation's defaults would ship a failing alert text); checking only the default fill (a consumer's colours would ship unchecked); pure `#ffffff` or `#000000` text on alert (not Foundation colours; a literal the library would own) |
| D10 | `progress[nfsProgressElement]` owns the colour only; the native element keeps `value`, `max`, its role, and its labels | The platform element's semantics need nothing; an input named `value` would capture `[value]` from the native property | `value` and `max` inputs mirroring the native attributes (a second, weaker spelling of the platform's own) |
| D11 | `<meter>` gets no directive; the docs require a label and the value with its range in text | ADR 0039: no class, no directive; APG Meter pattern; 1.4.1 for the range colour | A `meter[nfsMeter]` directive for a name check (binds nothing Foundation defines, against ADR 0039's tag rule) |
| D12 | Development name checks on `NfsProgress` (author sources only) and `NfsProgressElement` (author sources and labels), once, at the first render | A `progressbar` requires a name and takes it from the author only; every Foundation example fails; axe checks no native element; the Close Button's D6 shape; the name must be in server HTML | A required `aria-label` input (rules out `aria-labelledby` and `<label for>`); a default English name |
| D13 | A development warning for Foundation's palette classes copied onto either host | Building-blocks 1.4 and the Button's D22; every Foundation colour example writes `class="<color> progress"` or `class="<color>"` | No check (a silent second spelling) |
| D14 | The Runtime check: `include('nfs-progress-bar', ['foundation-palette'])` at every run and `value()` for a bound colour; `nfs-progress-bar` and `nfs-callout` both write `--nfs-foundation-palette` | The include carries the meter text rule and check, so a missing one is worth reporting; the palette property is the Progress Bar's only Variant property; `$foundation-palette` belongs to no entry point, so each mixin whose classes loop over it writes it, and a progress-bar-only application still gets it. Limit: with `nfs-callout` included, a missing `nfs-progress-bar` is not reported; its visible consequence, success and warning meter text at 1.80 and 1.84:1, is still an axe `color-contrast` violation wherever such a bar with meter text is rendered | A property only `nfs-progress-bar` writes (none exists without a presence marker that is not a Variant property, a new Runtime-check concept, recorded as the upgrade path); one shared writer mixin for the palette property (one more include, and the Progress Bar's own include still undetected) |
| D15 | No indeterminate mode in the first release; `value` is always a number | Foundation has no indeterminate look; an empty track would read as 0; native `<progress>` without `value` is the platform's indeterminate bar | `value: number \| null` with `null` omitting `aria-valuenow` (additive later) |
| D16 | No forced-colours rule | Measured: the `.progress` track and meter take Canvas in Chromium and Firefox, and native `<progress>` stays visible only in Firefox; the Visible value stays visible (the meter text's glyphs are black on Canvas in Chromium), so no information is lost and 1.4.11 does not require the graphic (D7) | A `forced-colors: active` rule painting the meter in `Highlight` with a `CanvasText` track outline, as the Slider's rule 13 does for its thumb (additive later) |
| D17 | Native implementation level; no Aria, no CDK; listener-free | ARIA roles and native elements cover everything; Aria has no progress pattern; host bindings render on the server | CDK `LiveAnnouncer` for updates (a status region the consumer writes survives server rendering and speaks once) |
| D18 | `max` not above `min` warns in development and shows no progress | A configuration error with no meaning; the bar cannot divide by an empty range | Swapping the bounds (hides the error) |
| D19 | Seven stories; e2e for meter text geometry, forced colours, right to left in three engines, reflow, and the fixture app's first paint and hydration; a manual screen-reader release test | Geometry and forced colours need real engines; Storybook's layer runs in Chromium; announcements need assistive technology | An e2e for every story (play functions cover the rest) |
| D20 | Three glossary terms: **Progress Bar**, **Progress meter**, **Visible value** | Foundation's "meter" collides with the native `<meter>`; the Visible value is a library rule that `valueText` (spoken text) must not be confused with | Keeping Foundation's bare "meter" |

### Usage examples

```html
<!-- A task with its name and Visible value beside the bar, and a status message at the end -->
<p><span id="sync-name">Syncing photos</span> <span>{{ done() }} of {{ total }} photos</span></p>
<div nfsProgress aria-labelledby="sync-name" [value]="done()" [max]="total" [valueText]="done() + ' of ' + total + ' photos'">
  <div nfsProgressMeter></div>
</div>
<div role="status">
  @if (done() === total) {
    <p>Sync complete</p>
  }
</div>

<!-- Foundation's With Text form, for a bar whose meter is always wider than its text -->
<div nfsProgress color="secondary" aria-label="Profile complete" value="80">
  <span nfsProgressMeter><span nfsProgressMeterText>80%</span></span>
</div>

<!-- Native progress: the label names it, the text beside it is its Visible value -->
<label for="quota">Mailbox quota</label> <span>{{ used() }}%</span>
<progress id="quota" nfsProgressElement color="alert" max="100" [value]="used()"></progress>
```

```ts
@Component({
  selector: 'app-upload',
  imports: [DecimalPipe, NfsButton, NfsProgress, NfsProgressMeter],
  template: `
    <button nfsButton (click)="next()" [disabled]="done() === files.length">Upload next file</button>
    <p><span id="upload-name">Uploading {{ files.length }} files</span> <span>{{ bar.percentage() | number: '1.0-0' }}%</span></p>
    <div nfsProgress #bar="nfsProgress" aria-labelledby="upload-name" [value]="done()" [max]="files.length">
      <div nfsProgressMeter></div>
    </div>
    <div role="status">
      @if (done() === files.length) {
        <p>Upload complete</p>
      }
    </div>
  `,
})
export class Upload {
  protected readonly files = ['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf'];
  protected readonly done = signal(0);

  protected next(): void {
    // upload the next file, then:
    this.done.update((n) => n + 1);
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

With it, `color="purple"` compiles on progress bars, native progress elements, and callouts; `color="pruple"` fails with the compiler's suggestion (ADR 0040). The `nfs-progress-bar` check then also covers the purple bar's meter text.

`NfsButton` is shown only to place it; its API belongs to its own spec.

### Platform features to adopt when the browser target moves

- Nothing in the platform research applies: no rule depends on the bar's content, so `:has()` is not needed either.

### Foundation behaviour changed or dropped

- The meter's width and the value attributes come from one `value` binding; a copied inline width or `aria-valuenow` is replaced (D3, D5).
- Every `nfsProgress` host is a named `progressbar`, including Foundation's colour examples that had no role (D4, D12).
- Every bar shows its Visible value; Foundation's Basics example gains a label and a value text (D7).
- On success and warning bars, meter text is `$black` instead of `$white` (D8).
- On Foundation's defaults, `nfs-progress-bar` stops the compile until the alert colour passes, so `$foundation-palette`'s alert becomes `#bf3f2c` wherever the consumer sets it (D9).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This component relies on Foundation's export mixins `foundation-progress-bar` (part of `foundation-everything`), and, for the native elements, `foundation-progress-element` and `foundation-meter-element`, which the consumer includes by name as Foundation's docs say. Its documented custom CSS is the `nfs-progress-bar` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-progress-bar`.

1. Rules. (a) `:root { --nfs-foundation-palette: <keys>; }`, the Variant property in (6). (b) Meter text colour, only where it differs from Foundation's: `.progress-meter-text { color: $black; }` when `$black` contrasts more than `$white` with `$progress-meter-background`; then, for each key of `$foundation-palette` whose fill picks a different colour from the default fill's, `.progress.<name> .progress-meter-text { color: <$black or $white>; }`. Reason: WCAG 2.2 success criterion 1.4.3; Foundation's `progress-meter-text` mixin sets `color: $white` on every fill and has no setting for it (D8). The palette selectors outrank Foundation's `.progress-meter-text` by two classes; the default rule matches it and follows it in source order. With the required setting on Foundation's defaults the mixin emits `.progress.success .progress-meter-text` and `.progress.warning .progress-meter-text`, each `color: $black`. (c) Compile-time checks that emit no CSS, D9: one `@error` listing every fill (`$progress-meter-background` and each palette colour) whose picked meter text is under 4.5:1, each with the setting, the name, the colour, and the ratio. Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal.
2. Reused, read from the consumer's compile: `$foundation-palette`, `$progress-meter-background`, `$white`, and `$black`. No Foundation value is copied; 4.5 is WCAG's number. The mixin takes no parameters. It checks no `$progress-*` or `$meter-*` graphic pair (D7).
3. Custom properties the directives write: none. The meter's width is an inline `width`, Foundation's mechanism, not a custom property.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: meter text on success and warning bars stays `$white` at 1.80 and 1.84:1, and the alert check does not run, so Foundation's 4.498:1 alert text compiles silently; the Variant property is absent unless `nfs-callout` writes it, which the `strictVariantProperties` Runtime check reports in development, naming the include (D14), and the Variant declaration file's generator cannot list the palette.
6. Variant properties: `--nfs-foundation-palette`, the keys of `$foundation-palette` (`primary secondary success warning alert` by default), joined with `space`, because Sass interpolates a key list with commas. `nfs-callout` writes the same property with the same value: `$foundation-palette` belongs to no entry point, so each Library mixin whose classes loop over it writes it (D14).

Required setting on Foundation's defaults, which the Storybook settings overrides mirror with the axe rule and the stories named in their comment:

```scss
$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));
```

In a consumer's own copy of Foundation's settings file, the alert entry of the `$foundation-palette` map changes to `#bf3f2c` instead, and Foundation's `add-foundation-colors()` on the next line then also sets `$alert-color`, which Foundation's form error colours and `$meter-fill-bad` follow; an overrides file imported after Foundation's settings, as the Storybook preview's is, merges the map and leaves `$alert-color` alone. The merge reaches every class Foundation's mixins loop over `$foundation-palette` at their include: the progress bars, the native progress element's palette classes, and the callouts (an alert callout's background becomes about `#f7e1dd`, still passing, the [Spec: Callout](../issues/89-spec-callout.md)'s Notes); it does not reach `$button-palette`, `$badge-palette`, or `$label-palette`, which Foundation's settings file assigned from the old map, so the Button, Badge, and Label specs require lines of their own.

### Notes

- RTL: the meter is a block, so it sits at the start edge and the bar fills from the right in a right-to-left context; the native element does the same (measured in three engines). No rule and no `Directionality`.
- Forced colours: the `.progress` track and meter take Canvas in Chromium and Firefox; the Visible value stays visible (D16).
- A meter text is for bars whose meter is always wider than its text: at 320 CSS px "0%" fits from a value of 8, "100%" from 10 (15 with WCAG text spacing), "3 of 12 files" from 25; at 1024 CSS px from 2, 3 (5), and 8 (10). A bar that starts at 0 shows its value beside it.
- Composition: `nfsProgress` binds nothing another directive binds; a consumer's own directive beside it can add `aria-describedby` or classes of its own.
