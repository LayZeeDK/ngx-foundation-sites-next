# Checks extraction, group b

Group: b. Files: `specs/callout.md`, `specs/card.md`, `specs/close-button.md`, `specs/drilldown-menu.md`, `specs/dropdown-menu.md`, `specs/dropdown.md`, `specs/equalizer.md`, `specs/flex-grid.md`, `specs/flexbox-utilities.md`. Commit read: `ba07780`. Classification rule source: [158. Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), Decision item 1, and [159. Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md).

Kinds: `forgotten-import` (ADR 0046's four checks -- In-family checks with their parent checks and child probes, `strictDirectiveImports`, `strictParents`, the static `missing-imports` builder -- plus every `nfsDirectiveCheck` call, the host record, the Selector manifest, the development-only token descriptions, and `nfsReportForgottenPeer`), `family` (a family's own development check that reads another part of its family: a parent, a child, or a peer), `misuse` (a directive's own development warning that reads only its host, its inputs, its content, or the page), `runtime` (ADR 0040's Runtime checks: a Variant value with no class in the compiled CSS, a missing Variant property, Breakpoint drift), `build-time` (a Library mixin's `@error`/`@warn` checks).

A check that fits two kinds by its wording is classified by the kind of what it reads, in the order forgotten-import, family, misuse, runtime, build-time. Every such call is recorded in the check's own subsection and repeated in the Boundary calls list at the end.

## specs/callout.md

### misuse: Copied palette or size class

Location: "### API: `NfsCallout`" section, Host bindings subsection, lines 137-139; Further Notes, Design decision D11, line 346; Testing Decisions, Browser-level test, line 288.

Text:

````
Development-mode check, in one `afterNextRender` read callback that exists only when `ngDevMode` is on (never on the server, never in production), warning once per instance: a static class list that holds Foundation's default palette names or `small` or `large` warns, naming each class with its input, for example "class="alert small" is set by nfsCallout: bind color="alert" and size="small" instead". A copied Variant class is not stripped (the `[class]` list sets only its own classes), so it keeps styling until removed; a redundant `callout` merges with the static host class and is not reported; the consumer's own classes are not reported. Consumer-declared names are not known without the Variant properties and are left to the Variant check (the Button spec's D22 rule).
````

````
| D11 | A development warning for Foundation's palette and size classes copied onto the host | Building-blocks 1.4 and the Button's D22: copied markup would keep styling beside the inputs and never be the contract; every Foundation callout example carries `class="callout <color>"`, so migrating markup meets it first | No check (a silent second spelling); checking consumer-declared names (they need the Variant properties; the Variant check reports values the CSS lacks) |
````

Tests and stories: Browser-level test (Vitest browser mode), line 288: "Development check: `class="alert small"` on the host warns once, naming `color` and `size`; a redundant `class="callout"` and the consumer's own class do not warn; nothing is checked when `ngDevMode` is false."

Needs: `HostAttributeToken('class')`, injected optionally in development builds only, line 105: "Injection: in development builds only, `HostAttributeToken('class')` (optional) for the copied-class warning (D11)..."; the palette and size class name templates it matches, which are also the runtime check's material (below).

Rule as documented usage: Bind `color` and `size` instead of writing Foundation's palette class names (`primary`, `secondary`, `success`, `warning`, `alert`) or size names (`small`, `large`) on the host element.

Mentions: user story 28, line 55 ("a copied `class="callout alert small"` to be reported in development, so that I learn to bind `color` and `size`").

### runtime: Callout Variant check

Location: "### API: `NfsCallout`" section, Host bindings subsection, line 140; Further Notes, Design decision D12, line 347; Testing Decisions, Browser-level test, line 289.

Text:

````
Runtime check: `NfsCallout` creates the handle `nfsVariantCheck('nfsCallout')` and, from its first render on, calls `include('nfs-callout', ['callout-sizes'])` on every run whether or not an input is bound, then `value()` for a bound `color` (need on `foundation-palette`) and `size` (need on `callout-sizes`) (D12). `strictVariantNames` compares a bound `color` with `--nfs-foundation-palette` and a bound `size` with `--nfs-callout-sizes` ('default' is never compared), and reports a value that is not one class token. `strictVariantProperties` reports a missing `@include nfs-callout;` when `--nfs-callout-sizes` reads empty. That property, and not `--nfs-foundation-palette`, decides, because `nfs-progress-bar` also writes the palette property, so its presence says nothing about `nfs-callout`. The report shape, the per-realm read, and the configuration are the Runtime checks' (ADR 0040).
````

````
| D12 | The Runtime check: names for bound values, and a presence request for `callout-sizes` from the first render on, whether or not an input is bound | The include carries the contrast checks and the 1.4.12 rule, so a missing include is an accessibility gap worth reporting even where no input is bound (the Close Button's D10); `--nfs-callout-sizes` is the property only `nfs-callout` writes | Deciding from `--nfs-foundation-palette` (`nfs-progress-bar` writes it too); requesting only when an input is bound |
````

Tests and stories: Browser-level test, line 289: "Runtime check: with `--nfs-foundation-palette: primary secondary success warning alert` and `--nfs-callout-sizes: small large` on the test document, a listed `color` and `size` are silent; an unlisted `color` bound through a cast reports `strictVariantNames` once, naming the directive, the input, the value, and `$foundation-palette`; in a test file of its own, with `--nfs-callout-sizes` absent, a callout with no input bound reports `strictVariantProperties` once, naming `@include nfs-callout;`, even while `--nfs-foundation-palette` is present."

Needs: `--nfs-foundation-palette` and `--nfs-callout-sizes` custom properties, written by the `nfs-callout` mixin, line 457 ("Variant properties: `--nfs-foundation-palette`, the keys of `$foundation-palette`... also written by `nfs-progress-bar`... `--nfs-callout-sizes`, the keys of `$callout-sizes` other than `default`..."); the Runtime check hook of `ngx-foundation-sites/media-query`, line 105.

Rule as documented usage: none -- the check only detects drift between the compiled Sass and the bound values; the consumer-facing instruction is to run `@include nfs-callout;`, already stated as build-time usage.

Mentions: Solution paragraph, line 24 ("The mixin also writes the Variant properties that the Runtime checks and the Variant declaration file's generator read"); user story 29, line 56; Rendering modes, "Before hydration", line 258 ("The development check and the Runtime check request run in a render callback, never on the server"); Out of Scope, line 327 ("the Runtime checks' configuration: Spec: Breakpoint service"); Sass subsection, item 5 (missing include), line 456.

### build-time: `nfs-callout` contrast check

Location: WCAG 2.2 AA table, rows 1.4.3 and 1.4.11, lines 187-188; Further Notes, Design decisions D7 and D8, lines 342-343; Sass subsection, item 1(c), line 452; Testing Decisions, Node-level Vitest, lines 296-301.

Text:

````
1.4.3 Contrast (Minimum) | Callout text, and links on every callout background at rest and on hover and focus, reach 4.5:1. The pairs: the text colour Foundation's `color-pick-contrast()` picks for each background; `$anchor-color` and `$anchor-color-hover` on each background (Foundation's `a:hover, a:focus` rule uses the hover colour). The backgrounds are `$callout-background` and every `$foundation-palette` colour through `scale-color($color, $lightness: $callout-background-fade)`. `nfs-callout` stops the compile with `@error` naming the setting, the palette name, and the ratio for every failing pair (D7).
````

````
1.4.11 Non-text Contrast | The close button's glyph, the only visual that identifies the control, contrasts at least 3:1 with the callout under it at rest (`$closebutton-color`) and on hover and focus (`$closebutton-color-hover`); the Close Button spec leaves each container's background to that container's spec. `nfs-callout` checks both settings against every callout background with the same `@error` (D7).
````

````
| D7 | `nfs-callout` stops the compile with one `@error` listing every pair under 4.5:1 (the picked text colour, `$anchor-color`, `$anchor-color-hover`) or under 3:1 (`$closebutton-color`, `$closebutton-color-hover`) against `$callout-background` and every palette colour's faded background, unrounded | ADR 0022 and building-blocks 1.10: a container checks what sits on its own backgrounds (the Close Button's D9, the Off-canvas precedent for links); axe marks the glyph incomplete and sees only the rendered state and Foundation's default palette; one message lists every failure so a theme is fixed in one pass | Checks only for the palette names a story uses (a consumer's colours would ship unchecked); `@warn` (a consumer on Foundation's defaults would ship failing links); Foundation's `color-contrast()`, which rounds 4.498 up to 4.5 |
| D8 | Required settings on Foundation's defaults: `$anchor-color: scale-color($primary-color, $lightness: -15%)` and `$closebutton-color: #767676` | No callout-scoped setting colours links, and a lighter `$callout-background-fade` is not enough (at 90 percent links still reach only 4.10:1 on alert); `-15%` is the Accordion spec's required title colour, clears every callout with margin (at least 4.95:1), and raises page links to 6.01:1; `#767676` leaves margin on every callout (at least 3.71:1, where the Close Button ticket's lighter candidates `#858585` and `#808080` reach only 3.01 and 3.22:1) and reaches 4.5:1 on the page. Both are colour changes of existing settings, with no library rule | A library rule re-tinting `.callout a` (re-implements what Foundation removed, and `.callout a` would outrank `.button`'s own colour); changing `$foundation-palette` (recolours buttons, labels, badges, and progress bars) |
````

````
(c) Compile-time checks that emit no CSS, D7: one `@error` listing every failing pair. Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`), which composites a translucent colour over `$body-background` first (building-blocks 1.10); never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal.
````

Tests and stories: Node-level Vitest, Sass compile, lines 296, 298, 301: "Foundation's defaults plus `@include nfs-callout;` stop with one `@error` naming `$anchor-color` on primary, secondary, success, warning, and alert and `$closebutton-color` on primary, secondary, and alert, each with its ratio."; "A palette merged with `purple` lists `purple` and checks it: with `purple: #4b0082` and the required settings the compile stops naming `$anchor-color` on purple (4.02:1; `#5b2a86` passes at 4.51:1)."; "`$callout-background-fade: 0%` stops the compile naming, among others, the text on alert (4.498:1), which Foundation's `color-contrast()` would round to 4.5." Also axe `color-contrast` in every story, line 199.

Needs: `$anchor-color`, `$anchor-color-hover`, `$closebutton-color`, `$closebutton-color-hover`, `$callout-background`, `$callout-background-fade`, `$foundation-palette`, Foundation's `color-pick-contrast()`, and the library's internal contrast helper (`math.pow`), all read from the consumer's compile, line 453.

Rule as documented usage: On Foundation's defaults, set `$anchor-color: scale-color($primary-color, $lightness: -15%);` and `$closebutton-color: #767676;` so a callout's text, links, and close-button glyph reach 4.5:1 and 3:1 against every callout background (WCAG 2.2 1.4.3 and 1.4.11).

Mentions: Solution paragraph, line 24; user stories 18-21, lines 45-48; Out of Scope, line 326 ("while `nfs-callout` checks what Foundation's callout markup puts on its backgrounds (D7)"); Foundation behaviour changed or dropped, line 445; Notes, line 476 (a cross-reference the Card ticket measured).

### Kept (not a check)

- `color` and `size` typed Variant inputs and their compile errors (closed-type failures for a misspelt or removed name): API table, lines 113-125; user stories 8-10, lines 35-37.
- ARIA and focus behaviour (the host's own role, `role="status"`/`role="alert"` left to the consumer, focus-return recipes): "### ARIA and keyboard" section, lines 162-179.
- The `nfs-callout` mixin's CSS rules (the close-button room padding) and the Variant properties it writes (`--nfs-foundation-palette`, `--nfs-callout-sizes`): Sass subsection, items 1(a), 1(b), and 6, lines 452 and 457.
- The library's own tests (story play functions, browser-level tests, SSR smoke, e2e): "## Testing Decisions" section as a whole, lines 264-317.
- The `data-nfs-close-button` styling hook (an attribute the Library mixin selects on, not a check): line 92, line 135.

## specs/card.md

### forgotten-import: Card family In-family checks

Location: "### Hierarchy and DI shape" section, lines 98 and 100; Further Notes, Design decision D10, line 313.

Text:

````
Injection: none. In development builds each directive's only code is its `nfsDirectiveCheck` call (In-family checks, below). There is no copied-class check, because the Card has no Variant or State class to strip and a redundant Structural class merges with the static host class (building-blocks 1.4), and no Runtime check, because there is no Variant property.
````

````
In-family checks (Spec: forgotten-import checks (shared utility)): `NfsCard` calls `nfsDirectiveCheck('NfsCard', {children: ['NfsCardDivider', 'NfsCardSection', 'NfsCardImage']})` and probes its three parts, a nested card keeping its own; `NfsCardDivider`, `NfsCardSection`, and `NfsCardImage` each call `nfsDirectiveCheck` with their class name and probe nothing. No part has a parent check, because none injects a parent: a part outside a card is legal and not reported (above), so a forgotten `NfsCard` around imported parts is the `strictDirectiveImports` check's report and the static check's. No part has a peer linked by reference or value, and `strictParents` changes nothing. The entry point imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` for this call alone; the call sits behind the inline `ngDevMode` guard, so a production build keeps nothing of it.
````

````
| D10 | No development checks of its own and no injection: no copied-class check, no placement check, no `alt` check; only the In-family checks' `nfsDirectiveCheck` call, which every library directive makes (ADR 0046) | The Card has no Variant or State class to strip, and redundant Structural classes merge (building-blocks 1.4); a misplaced part is harmless; axe `image-alt` reports a missing `alt` on every run | An `alt` check over the card's images (the image carries no library directive, and a walk over the card's content duplicates axe) (`platform-or-a11y`); a parent token with a warning for a part outside a card (nothing depends on the parent, and projection hides the DI context) (`other`) |
````

Tests and stories: none stated in this file beyond the general remark that the call "sits behind the inline `ngDevMode` guard" (line 100); no browser-level test case is given for this call in Card's own Testing Decisions section.

Needs: `nfsDirectiveCheck`, imported from `ngx-foundation-sites/media-query`, line 100.

Rule as documented usage: none -- this is a forgotten-import mechanism with no consumer-facing rule of its own; Card's own placement is documented as harmless ("a part outside a card is not reported: it is harmless").

Mentions: "### Implementation level and primitives", line 131 ("the development-only `nfsDirectiveCheck` call, whose render callback on `NfsCard` probes its parts"); Rendering modes, "Before hydration", line 228 ("`NfsCard`'s development In-family callback runs only after a client render").

### build-time: `nfs-card` divider-link contrast check

Location: WCAG 2.2 AA table, row 1.4.3, line 160; Further Notes, Design decision D8, line 311; Sass subsection, item 1(b), line 383; Testing Decisions, Node-level Vitest, lines 262-266.

Text:

````
1.4.3 Contrast (Minimum) | Card text and links reach 4.5:1 on the card background and on the divider background, at rest and on hover. The pairs: `$card-font-color`, `$anchor-color`, and `$anchor-color-hover` on `$card-background` (composited over `$body-background`) and on `$card-divider-background` (composited over the card background). `nfs-card` stops the compile with one `@error` naming each failing setting, background, and ratio (D8).
````

````
| D8 | `nfs-card` stops the compile with one `@error` listing every pair under 4.5:1: `$card-font-color`, `$anchor-color`, and `$anchor-color-hover` on `$card-background` and on `$card-divider-background`, translucent backgrounds composited first, exact and unrounded | ADR 0022 and building-blocks 1.10: a container checks what sits on its own backgrounds (the Close Button's D9, the Callout's D7); the divider is the one background Foundation's link colour fails on; a card with a tinted `$card-background` is as likely | `@warn` (a consumer on Foundation's defaults would ship failing divider links wherever a page puts one) (`platform-or-a11y`); checking the divider only (a tinted card background would go unchecked) (`other`); a mixin parameter that skips the link check for sites without divider links (additive later, as the Callout's D15) (`other`) |
````

````
(b) Compile-time checks that emit no CSS, D8: one `@error` listing every failing pair, each with the setting, its colour, the background setting, its colour, and the ratio, computed by the library's exact relative-luminance helper (`math.pow`), unrounded, never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal (building-blocks 1.10): `$card-font-color`, `$anchor-color`, and `$anchor-color-hover`, each against `$card-background` composited over `$body-background` and against `$card-divider-background` composited over that card background, under 4.5:1.
````

Tests and stories: Node-level Vitest, Sass compile, lines 262-266: "Foundation's defaults plus `@include nfs-card;` stop with one `@error` naming `$anchor-color` `#1779ba` on `$card-divider-background` `#e6e6e6` at 3.755:1, and no other pair."; "With the required setting the include compiles and emits exactly `.card { overflow-wrap: anywhere; }`, and no other rule; so does the `$anchor-color` line alone..."; "`$card-divider-background: $white;` alone compiles..."; "With the required setting, `$card-background: $dark-gray;` stops naming `$anchor-color` (1.756:1) and `$anchor-color-hover` (2.191:1)..."; "With the required setting, `$card-divider-background: rgba(#1779ba, 0.3);` is composited over the card background and stops naming `$anchor-color` at 4.004:1; `rgba(#0a0a0a, 0.1)` compiles."

Needs: `$card-font-color`, `$anchor-color`, `$anchor-color-hover`, `$card-background`, `$card-divider-background`, `$body-background`, the library's exact relative-luminance helper, line 384.

Rule as documented usage: On Foundation's defaults, set `$anchor-color: scale-color($primary-color, $lightness: -15%);` (the same line the Callout spec requires) so links reach 4.5:1 on the card and its divider.

Mentions: Solution paragraph, line 23; user stories 11-13, lines 37-39; Out of Scope, line 290 (typography colours checked only on the page, "while `nfs-card` checks what Foundation's card markup puts on its backgrounds (D8)"); Foundation behaviour changed or dropped, line 375; Notes, line 407 (a cross-reference to other containers that clip with `overflow: hidden`).

### Kept (not a check)

- The four Structural class directives (`NfsCard`, `NfsCardDivider`, `NfsCardSection`, `NfsCardImage`) and their static host classes: "### API" section, lines 102-116.
- No role, ARIA, or `tabindex` (D4), and no card-as-control (D5): "### ARIA and keyboard" section, lines 135-152; Design decisions D4-D5, lines 307-309.
- The `nfs-card` mixin's `overflow-wrap: anywhere` CSS rule (D7), which is not a check: Sass subsection, item 1(a), line 383.
- The library's own tests: "## Testing Decisions" section, lines 234-280.
- `.card-image` documented as optional (D3), not a check: line 71, line 306.

## specs/close-button.md

### misuse: No accessible name

Location: "### API: `NfsCloseButton`" section, Development-mode checks, item 1, line 134.

Text:

````
1. No accessible name. The name, taken in accessible-name order from the text of the elements `aria-labelledby` references, then a non-blank `aria-label`, then text outside `aria-hidden="true"` subtrees, or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"`, then `title`, is empty: "nfsCloseButton: this close button has no accessible name; add aria-label, for example aria-label="Close alert"".
````

Tests and stories: Browser-level test, line 270: "Development checks: each name source (`aria-labelledby`, `aria-label`, hidden text, `title`) is silent; a close button whose only content is an `img` with alt text ("Close alert") is silent; no name warns once; `aria-label=""` warns once; `aria-labelledby` pointing at a missing id warns once..."

Needs: none beyond the button's own rendered content, read in the `afterNextRender` callback of line 133.

Rule as documented usage: Give every close button an accessible name -- `aria-label`, `aria-labelledby`, or visible text -- that says what it closes.

Mentions: user story 14, line 38; WCAG table row 4.1.2, line 191 ("checks 1 and 2"); line 137 ("a name bound only after the first render warns"); Foundation behaviour changed or dropped, line 395 ("The name is checked in development...").

### misuse: Symbol-only name

Location: "### API: `NfsCloseButton`" section, Development-mode checks, item 2, line 135.

Text:

````
2. Symbol-only name. The name, read as check 1 reads it, contains no letter and no digit (the multiplication sign, a dash): "nfsCloseButton: this close button's name is only a symbol; name what it closes and keep the glyph in aria-hidden="true"".
````

Tests and stories: Browser-level test, line 270: "a glyph-only name (`&times;` without `aria-hidden`) warns once with the symbol message."

Needs: none beyond the button's own rendered content.

Rule as documented usage: Keep the glyph inside `aria-hidden="true"` and name the button with words, never the symbol alone.

Mentions: user story 15, line 39; Foundation contract table row "Docs conventions", line 78 ("the Toggler docs' unnamed `<button class="close-button" data-close>&times;</button>` (corrected: it warns)"); Foundation behaviour changed or dropped, line 395; line 137 ("a name bound only after the first render warns").

### misuse: `nfsButton` collision

Location: "### API: `NfsCloseButton`" section, Development-mode checks, item 3, line 136; Further Notes, Design decision D7, line 318.

Text:

````
3. `nfsButton` on the same element, seen as the host carrying `.button` or the `nfsButton` attribute (the attribute counts too, because the misuse stays once a forgotten `NfsButton` import is added, and `strictDirectiveImports` reports that import on its own; [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), In-family checks): "nfsCloseButton and nfsButton on one element: .close-button and .button are separate class contracts; remove nfsButton".
````

````
| D7 | A development warning for `nfsButton` on the same element | `.button` and `.close-button` are separate class contracts whose padding, background, and position collide | Mutually exclusive selectors (the second directive would silently not apply) |
````

Tests and stories: Browser-level test, line 270: "`nfsButton` on the same element warns once, and so does an `nfsButton` attribute whose import was forgotten (no `.button` on the host)."

Needs: none beyond the host's own class list and attributes; the `strictDirectiveImports` reference is a forgotten-import mechanism named for contrast, not this check's own material.

Rule as documented usage: Never put `nfsButton` and `nfsCloseButton` on one element; `.button` and `.close-button` are separate class contracts.

Mentions: user story 16, line 40.

### runtime: Close Button Variant check

Location: "### API: `NfsCloseButton`" section, Host bindings subsection, line 138; Further Notes, Design decision D10, line 321; Testing Decisions, Browser-level test, line 271.

Text:

````
Runtime check: `NfsCloseButton` creates the handle `nfsVariantCheck('nfsCloseButton')` and, from its first render on, calls `include('nfs-close-button', ['closebutton-size'])` on every run whether or not `size` is bound, then `value('size', ...)` for a bound size (D10). `strictVariantNames` reports a bound size that `--nfs-closebutton-size` does not list, which only a cast or `$any()` can reach. `strictVariantProperties` reports a missing `--nfs-closebutton-size` and names `@include nfs-close-button;`, whose absence also removes the 2.5.8 floor.
````

````
| D10 | The directive requests `closebutton-size` from the Runtime check from its first render on, bound or not | The Variant property is also the only run-time evidence that the include carrying the 2.5.8 floor is present | Requesting only when `size` is bound (a missing include would go unreported wherever the default size is used) |
````

Tests and stories: Browser-level test, line 271: "Runtime check: with `--nfs-closebutton-size: small medium` on the test document, `size="small"` is silent and `'large'` through `$any()` reports once under `strictVariantNames`; in a test file of its own, with the property absent, a close button with no `size` reports once under `strictVariantProperties`, naming `nfs-close-button`."

Needs: `--nfs-closebutton-size`, written by `nfs-close-button`, line 410; the Runtime check hook, injected line 101.

Rule as documented usage: none -- the check detects drift between bound `size` values and the compiled `$closebutton-size` map, and a missing `@include nfs-close-button;`.

Mentions: user story 27, line 51; Rendering modes, "Before hydration", line 243; Sass subsection, item 5, line 409.

### build-time: `nfs-close-button` glyph contrast check

Location: WCAG 2.2 AA table, row 1.4.11, line 190; Further Notes, Design decision D9, line 320; Sass subsection, item 1(c), line 405; Testing Decisions, Node-level Vitest, line 278.

Text:

````
1.4.11 Non-text Contrast | The glyph, the only visual that identifies the control, contrasts at least 3:1 with the surface behind it at rest (`$closebutton-color`) and on hover and focus (`$closebutton-color-hover`)... `nfs-close-button` stops the compile with `@error` naming the setting when either colour is under 3:1 against `$body-background`, the surface wherever no container paints one. A container that paints its own background under the button checks the same two settings against it in its own Library mixin: the Reveal and Off-canvas specs already do, and the [Spec: Callout](../issues/89-spec-callout.md) does, requiring `$closebutton-color: #767676` (at least 3.71:1 on every callout), because its primary, secondary, and alert backgrounds fail with Foundation's defaults.
````

````
| D9 | `@error` when `$closebutton-color` or `$closebutton-color-hover` is under 3:1 against `$body-background`; containers check their own backgrounds | ADR 0022; axe marks the glyph incomplete; the close button does not know its container, and the container does (the Reveal and Off-canvas precedent) | One check in `nfs-close-button` against every container's background (it would need every container's settings and include order); no check (a light `$closebutton-color` would ship silently) |
````

````
(c) Compile-time checks that emit no CSS: `@error` naming the setting when the unrounded ratio of `$closebutton-color`, or of `$closebutton-color-hover`, against `$body-background` is under 3 (1.4.11). Every contrast ratio the mixin checks is computed unrounded with the exact WCAG 2.2 relative-luminance formula by the library's internal contrast helper (`math.pow`)...
````

Tests and stories: Node-level Vitest, line 278: "`$closebutton-color: #aaaaaa` stops the compile naming `$closebutton-color` (2.30:1)."

Needs: `$closebutton-color`, `$closebutton-color-hover`, `$body-background`, the library's internal contrast helper, line 406.

Rule as documented usage: On Foundation's defaults the page-background pair already passes; a container that paints its own background under a close button (Callout, Reveal, Off-canvas) must choose a `$closebutton-color` that reaches 3:1 there, for example the Callout's required `$closebutton-color: #767676`.

Mentions: user story 25, line 49; Solution paragraph, line 21; Story descriptions, line 253 ("the stories use the default and success callouts, whose backgrounds pass 1.4.11 with Foundation's `$closebutton-color`").

### Kept (not a check)

- `size` typed Variant input and its compile errors: API table, lines 109-119; user stories 5-9, lines 29-33.
- `type` input (`button`/`submit`/`reset`), not a check: API table, line 120.
- ARIA and keyboard behaviour: "### ARIA and keyboard" section, lines 163-181.
- The `nfs-close-button` mixin's 24 px target-size floor CSS rule (D8), which meets 2.5.8 without a check: Sass subsection, item 1(a), line 405.
- The library's own tests: "## Testing Decisions" section, lines 249-293.

## specs/drilldown-menu.md

### forgotten-import: Drilldown family In-family checks

Location: "### Hierarchy and DI shape" section, lines 168-171.

Text:

````
In-family checks (Spec: forgotten-import checks (shared utility)), one line per part; a hosted part probes from its host's element, because the shared spec's child probe also counts the host record:
- `NfsDrilldown`: `nfsDirectiveCheck('NfsDrilldown', {children: ['NfsMenuItem', 'NfsDrilldownBack']})`. It probes every `NfsMenuItem` of its tree, as every menu root does (the Nested menu spec), and every `NfsDrilldownBack` in its levels; hosted by a ResponsiveMenu, it probes both from the responsive `ul`; its hosted `NfsMenu` probes `NfsMenuText`. No parent check, because its `NfsDrilldownWrapper` injection stays optional, because a Responsive Menu whose rules do not name drilldown has no wrapper and development check 1 runs only while drilldown is the live mode, which construction cannot know (the shared spec's kept-optional list); its other injections are `self`. No peers: `scrollTopElement` is an element or a selector, not a library directive. `strictParents` changes nothing.
- `NfsDrilldownWrapper`: `nfsDirectiveCheck('NfsDrilldownWrapper', {children: ['NfsDrilldown']})`; no parent check, because it injects none; it probes `NfsDrilldown`; no peers; `strictParents` changes nothing.
- `NfsDrilldownBack`: `nfsDirectiveCheck('NfsDrilldownBack', {parent})`, its `inject(NfsDrilldown, {optional: true})` giving `found`. Parent check over `NfsDrilldown` and `NfsResponsiveMenu`, which hosts it, with the `alone` sentence "It stays hidden and closes no level.", which replaces development check 3's outside-a-drilldown-root case, so a back item outside a drilldown root is reported once. Its `NfsSubmenu` injection has no parent check, because `null` means the root's level, which every root provides on purpose; check 3 still reports a back item outside any submenu. No child probes. No peers. `strictParents`: it throws at construction when no drilldown root is found.
````

Tests and stories: Browser-level test, line 495: "DI and registration: the root registers with its parent wrapper; a wrapper that is not the root's parent, a second root, and a missing wrapper each warn; a nested drilldown with its own wrapper leaves the outer wrapper alone; a back item finds its level and root, and warns outside a submenu or outside a drilldown..." (this row also exercises the family checks below); Node-level Vitest, SSR smoke, line 513 (no development warning is asserted on the server).

Needs: `nfsDirectiveCheck`, `NfsResponsiveMenu` as an alternative parent for the back item's parent check.

Rule as documented usage: none.

Mentions: Testing Decisions intro, line 475 ("the utility's own class maps, key tables, completion, and swap rule are tested in the Nested menu spec... these tests cover what this spec adds").

### family: Root without a registered wrapper

Location: "### API: `NfsDrilldown`" section, Development-mode checks, item 1, line 249.

Text:

````
1. A drilldown root without a registered wrapper, or a wrapper that is not the root's parent element. A root whose parent element carries `nfsDrilldownWrapper` but registered no wrapper is not reported here: that wrapper's import is forgotten, which the runtime check `strictDirectiveImports` reports once on the element ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)).
````

Tests and stories: Browser-level test, line 495: "a wrapper that is not the root's parent, a second root, and a missing wrapper each warn; a nested drilldown with its own wrapper leaves the outer wrapper alone."

Needs: the `NfsDrilldownWrapper` registration made at construction, line 164 ("the root registers itself with the nearest `NfsDrilldownWrapper` at construction (`skipSelf`, optional); the wrapper accepts only a root whose element is its own child element").

Rule as documented usage: Wrap every `ul[nfsDrilldown]` in a `[nfsDrilldownWrapper]` element that is its direct parent.

Mentions: Checks 1-3 timing note, line 257 ("Checks 1 to 3 run from the first render in which drilldown is the live mode..."); Hierarchy and DI shape, line 164 ("the wrapper accepts only a root whose element is its own child element... and warns in development mode otherwise, which also stops a nested root without its own wrapper from taking the outer one").

### family: Submenu without a back item

Location: "### API: `NfsDrilldown`" section, Development-mode checks, item 2, line 250.

Text:

````
2. A submenu in drilldown mode without a back item. Foundation generated one in every submenu; without it a pointer user cannot leave the level, because the parent toggle is hidden. The warning names `li[nfsDrilldownBack]`, since a Foundation `li.js-drilldown-back` copied without the directive neither closes its level nor hides outside drilldown mode. A level that holds an element carrying `nfsDrilldownBack` is not reported here: that back item's import is forgotten, which the root's child probe reports once.
````

Tests and stories: Browser-level test, line 507: "a submenu without a back item (and one holding a bare `li` copied with Foundation's `js-drilldown-back` but no directive), and no check 1 or check 2 warning for a wrapper or a back item written with its directive's attribute but not imported (the runtime check and the root's child probe report each once)"; Story `drilldown-menu--back-bottom` exercises a present back item without triggering it.

Needs: none beyond the submenu's own children, read from the DOM.

Rule as documented usage: Give every submenu of a drilldown a `li[nfsDrilldownBack]` item so a pointer user can leave the level.

Mentions: Further Notes, D17, line 576 ("Every submenu needs a back item (development warning) | Without it a pointer user cannot leave a level | Generating one (DOM creation, rule 4)").

### family: Back item content and placement (boundary call: mixed with misuse)

Location: "### API: `NfsDrilldown`" section, Development-mode checks, item 3, line 251.

Text:

````
3. A back item without a `button` child, with a button that has no accessible name (its text read as accessible-name computation reads it: text outside `aria-hidden="true"` subtrees, the visually hidden suffix included, or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"`), or outside any submenu. A back item outside a drilldown root is reported once, by its In-family parent check (Hierarchy and DI shape).
````

Tests and stories: Browser-level test, line 507: "a nameless back button (and none for one whose only content is an `img` with alt text), a back item without a button..."

Needs: none beyond the back item's own content (button presence, its accessible name) and its ancestor submenu (placement).

Rule as documented usage: Every back item holds a `<button>` with an accessible name, inside a submenu.

Mentions: WCAG table row 2.4.6, line 348 ("a nameless back button warns in development mode").

Boundary call: this single numbered check bundles a placement condition ("outside any submenu", which reads the item's ancestor submenu, a family concern) with content conditions ("without a button child", "button that has no accessible name", which read only the back item's own content, a misuse concern). Classified `family` by the order rule (family precedes misuse), because the spec presents it as one warning and the placement clause is the one the In-family parent check does not already cover.

### misuse: `animateHeight` without `autoHeight`

Location: "### API: `NfsDrilldown`" section, Development-mode checks, item 4, line 252.

Text:

````
4. `animateHeight` without `autoHeight`.
````

Tests and stories: Browser-level test, line 507 ("`animateHeight` without `autoHeight`"); API table row `animateHeight`, line 198 ("it has an effect only with `autoHeight` (development warning otherwise, as in Foundation)").

Needs: none beyond the directive's own two inputs.

Rule as documented usage: `animateHeight` only takes effect together with `autoHeight`; bind both or neither.

Mentions: API table row, line 198.

### misuse: `scrollTopElement` selector matches nothing

Location: "### API: `NfsDrilldown`" section, Development-mode checks, item 5, line 253.

Text:

````
5. A `scrollTopElement` selector that matches nothing (at scroll time).
````

Tests and stories: Browser-level test, line 507 ("a `scrollTopElement` selector that matches nothing (at scroll time)"); API table row `scrollTopElement`, line 201 ("A selector that matches nothing falls back to the root and warns in development mode").

Needs: none beyond the input's own value, resolved against `DOCUMENT` at scroll time.

Rule as documented usage: `scrollTopElement`'s CSS selector must match an element that exists at scroll time; otherwise the root list is scrolled to and the input is treated as pointing nowhere.

Mentions: API table row, line 201.

### family: Item expanded under a closed ancestor

Location: "### API: `NfsDrilldown`" section, Development-mode checks, item 6, line 254.

Text:

````
6. In drilldown mode, an item that is expanded while an ancestor item is not (a level shown under a closed level); the warning names `openPath()` and `[expanded]` on every item of the Open path.
````

Tests and stories: Browser-level test, line 507 ("an item expanded under a closed level (naming `openPath()` and `[expanded]`)").

Needs: the state of ancestor items in the same tree, read through the utility's item registration.

Rule as documented usage: Open every item of a path from the root down (`openPath()`, or bind `[expanded]` on each item of the path), never a deep item alone.

Mentions: none beyond the location above.

### misuse: Copied Foundation classes on root, wrapper, and back item

Location: "### API: `NfsDrilldown`" section, Development-mode checks, item 7, line 255.

Text:

````
7. Copied Foundation classes (building-blocks 1.4): `NfsDrilldown`, `NfsDrilldownWrapper`, and `NfsDrilldownBack` read their host's static `class` through `HostAttributeToken('class')` in a field initialiser that runs only under `ngDevMode`, and report each class they bind from state or an Option: `invisible` on the root (bound while a level is open; a level open at first paint is `[expanded]` on its Open path), `animate-height` on the wrapper (names `animateHeight`), and `is-hidden` on a back item (bound outside drilldown mode). The Structural classes each binds whenever drilldown is live, `drilldown` on the root, `is-drilldown` on the wrapper, and `js-drilldown-back` on a back item, are redundant in drilldown mode, stripped in the other modes, and not reported. The root's Menu classes (`vertical` names `orientation`) are the Menu directive's check, and the item, submenu, and toggle classes the Nested menu's (D28).
````

Tests and stories: Browser-level test, line 498: "a fixture that says so copies `class="vertical menu drilldown invisible"` onto the root, `class="is-drilldown animate-height"` onto the wrapper (without `animateHeight`), and `class="js-drilldown-back is-hidden"` onto a back item, each beside an Application class: after the first render the root carries `menu drilldown` and no `invisible`, the wrapper `is-drilldown` and no `animate-height`, the back item `js-drilldown-back` without `is-hidden` in drilldown mode; one warning each names `invisible`, `animate-height` (with `animateHeight`), and `is-hidden`, the Menu's warning names `orientation`, and none names `drilldown`, `is-drilldown`, or `js-drilldown-back`; each Application class stays."

Needs: `HostAttributeToken('class')`, read once at construction, in development builds only.

Rule as documented usage: Bind `[expanded]`, `animateHeight`, and the Toggler-shaped visibility state instead of writing `invisible`, `animate-height`, or `is-hidden` on the root, wrapper, or back item.

Mentions: Rendered HTML, line 425 ("Foundation's docs markup copied as is... renders the root `menu drilldown`: the hosted Menu strips the copied `vertical` and names `orientation` in development builds, while the root's redundant `menu` and `drilldown`... stay and are not reported (check 7...)"); Render hooks table, line 279 ("check 7 warns about the class it read at construction"); Checks 1-3 timing note, line 257 ("Check 7 reads the static class in any mode and warns in the first client render callback").

### build-time: `nfs-drilldown` arrow contrast check

Location: WCAG 2.2 AA table, row 1.4.11, line 343; Sass subsection, "Checks" paragraph, line 731.

Text:

````
1.4.11 Non-text Contrast | Every drilldown arrow (parent, back, and the `.align-left`/`.align-right` twins) and the Hybrid item's toggle arrow must reach 3:1 against the background it sits on; with defaults `$primary-color` on white is 4.65:1. The `nfs-drilldown` mixin stops the compile with `@error` naming the setting when the exact, unrounded WCAG ratio... of `$drilldown-arrow-color` against `$drilldown-background` or `$drilldown-submenu-background` is below 3, likewise for `$dropdownmenu-arrow-color`, which Foundation uses for the aligned twins, and for `$accordionmenu-arrow-color`, the Hybrid toggle's arrow, against `$accordionmenu-submenu-toggle-background` when that is not `null`, else against `$body-background` and `$drilldown-submenu-background`
````

````
`@error` naming the setting when the ratio of `$drilldown-arrow-color` against `$drilldown-background` or `$drilldown-submenu-background` is below 3, and the same for `$dropdownmenu-arrow-color` (both only while `$drilldown-arrows`; 1.4.11); when the ratio of `$accordionmenu-arrow-color` against `$accordionmenu-submenu-toggle-background` (when not `null`), else against `$body-background` and `$drilldown-submenu-background`, is below 3, whatever `$drilldown-arrows` says, because Foundation draws the Hybrid toggle's arrow unconditionally (1.4.11)
````

Tests and stories: Node-level Vitest, line 515: "a `$drilldown-arrow-color` below 3:1 on white, one at 2.95:1 (which Foundation's rounding `color-contrast()` would pass), `$drilldown-arrow-color: #116666` on `$drilldown-background: #0a0a0a` (2.94:1 exactly, 3.01:1 through Foundation's `color-luminance()`...), a `$dropdownmenu-arrow-color` below 3:1, an `$accordionmenu-arrow-color` below 3:1 with `$drilldown-arrows: false`... each stop the compile naming the setting."

Needs: `$drilldown-arrow-color`, `$dropdownmenu-arrow-color`, `$accordionmenu-arrow-color`, `$drilldown-background`, `$drilldown-submenu-background`, `$accordionmenu-submenu-toggle-background`, `$body-background`, `$drilldown-arrows`, the library's exact-luminance helper, line 733.

Rule as documented usage: Keep `$drilldown-arrow-color`, `$dropdownmenu-arrow-color`, and `$accordionmenu-arrow-color` at least 3:1 against the backgrounds they are drawn on.

Mentions: user story 31, line 59; Testing Decisions intro paragraph, line 475.

### build-time: `nfs-drilldown` toggle and row target-size check

Location: WCAG 2.2 AA table, row 2.5.8, line 352; Sass subsection, "Checks" paragraph, line 731; Further Notes, D20, line 579.

Text:

````
2.5.8 Target Size (Minimum) | Links, parent buttons, and back buttons fill their row: 38 px high with Foundation's `$drilldown-padding` (`$global-menu-padding`); the Hybrid item's toggle is 40 by 40 px. The mixin stops the compile when `$accordionmenu-submenu-toggle-width` or `-height` is below 24 px, or when a row (`1rem` plus twice the vertical padding of `$drilldown-padding` or `$drilldown-submenu-padding`, through Foundation's `rem-calc()`) is below 24 px
````

````
when `$accordionmenu-submenu-toggle-width` or `$accordionmenu-submenu-toggle-height` is below 24 px (2.5.8, the Hybrid item's toggle); when `1rem` plus twice the first value of `$drilldown-padding` or `$drilldown-submenu-padding`, converted with `rem-calc()`, is below `rem-calc(24)` (2.5.8, rows at line height 1)
````

````
| D20 | A row-height compile check beside the arrow and toggle checks | 2.5.8 is guaranteed by the Library mixin where settings can fail it (building-blocks 1.10) | Relying on the story gate (it sees only the library's settings) |
````

Tests and stories: Node-level Vitest, line 515: "a 20 px `$accordionmenu-submenu-toggle-width`, and a `$drilldown-padding` of `0.2rem 1rem` each stop the compile naming the setting."; Story Accessibility gate, `target-size` tag, line 352 (turned on by the `wcag22aa` tag).

Needs: `$accordionmenu-submenu-toggle-width`, `$accordionmenu-submenu-toggle-height`, `$drilldown-padding`, `$drilldown-submenu-padding`, Foundation's `rem-calc()`, line 733.

Rule as documented usage: Keep `$accordionmenu-submenu-toggle-width`/`-height` at least 24 px, and `$drilldown-padding`/`$drilldown-submenu-padding` large enough that a row is at least 24 px tall.

Mentions: user story 31, line 59.

### build-time: `nfs-drilldown` current-link fill contrast check

Location: WCAG 2.2 AA table, row 1.4.1, line 340 (drilldown-menu.md line numbering places the row at the seam between the two reads, around line 338); Further Notes, D30, line 589; Sass subsection, "Checks" paragraph, line 731.

Text:

````
1.4.1 Use of Color | The current link differs from its neighbours by its filled background (`nfs-menu`, Foundation's `menu-state-active`), which must reach 3:1 against the level background: the `nfs-drilldown` mixin stops the compile with `@error` when `$menu-item-background-active` is under 3:1, exact and unrounded, against `$drilldown-background` or `$drilldown-submenu-background` where that is not `null` (`nfs-menu` checks `$body-background`); 4.65:1 with Foundation's defaults | Node-level Sass compile test |
````

````
| D30 | Every ratio `nfs-drilldown` checks uses the exact WCAG formula through the library's exact-luminance helper, unrounded, and the mixin also checks the current link's fill at 3:1 against `$drilldown-background` and `$drilldown-submenu-background` (1.4.1) | Foundation's `color-luminance()` overstates some ratios (the Spec: Top Bar ticket measured 26 false passes in a 16-step colour grid) and `color-contrast()` rounds; the library owns the current look through `nfs-menu`, whose own check compares only `$body-background`... | Foundation's `color-luminance()` (false passes); no fill check (a dark level background silently loses the current look) |
````

````
when `$menu-item-background-active`, the current link's fill, is below 3:1 against `$drilldown-background` or `$drilldown-submenu-background`, each where it is not `null` (1.4.1; `nfs-menu` checks it against `$body-background`, the Nested menu spec's D32).
````

Tests and stories: Node-level Vitest, line 515: "`$menu-item-background-active: #f0f0f0` (1.13:1 against the default drilldown backgrounds) stops it naming the 1.4.1 check."

Needs: `$menu-item-background-active`, `$drilldown-background`, `$drilldown-submenu-background`, the library's exact-luminance helper.

Rule as documented usage: Keep `$menu-item-background-active` at least 3:1 against `$drilldown-background` and `$drilldown-submenu-background` wherever those are set.

Mentions: none beyond the locations above.

### Kept (not a check)

- The Nested menu utility's own item, submenu, toggle-class maps, key tables, completion, collision flip, Light dismiss, hover intent, focus-loss guard, and its own development checks: "## Out of Scope" first bullet, line 543 (belong to the shared Nested menu spec, out of scope for this manifest).
- The Menu directive's own Variant inputs, types, runtime checks, and development checks, hosted here: "## Out of Scope" second bullet, line 544.
- ARIA and keyboard behaviour (disclosure navigation pattern, the key table): "### ARIA and keyboard" section, lines 301-331.
- The `nfs-drilldown` mixin's other CSS rules (button layout, arrow geometry drawing, clip and word-break, reduced-motion duration, the inset focus ring): Sass subsection, rules 1-7, line 723.
- Required parent injection of `NfsDrilldownWrapper` via `NG0201`: not applicable -- the injection is optional (line 164), so it never throws.
- The library's own tests: "## Testing Decisions" section as a whole, lines 473-538, and the manual release test, line 539.

## specs/dropdown-menu.md

### forgotten-import: Dropdown Menu In-family check

Location: "### Hierarchy and DI shape" section, line 178.

Text:

````
In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsDropdownMenu` calls `nfsDirectiveCheck('NfsDropdownMenu', {children: ['NfsMenuItem']})`, the probe the [Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md) requires of every menu root, and its hosted `NfsMenu` probes `NfsMenuText` (the [Spec: Menu](../issues/85-spec-menu.md)); it has no parent check, because its injections are `self` and the root handle's optional `nfsTopBarRightToken` is context, not a parent ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)); no peers; `strictParents` changes nothing.
````

Tests and stories: Node-level Vitest, SSR smoke, line 535 ("no development warning was logged").

Needs: `nfsDirectiveCheck`.

Rule as documented usage: none.

Mentions: none beyond the location above.

### family: Top Bar right-hand-section walk and `alignment="right"` warning

Location: "### Hierarchy and DI shape" section, line 171; "### API" section, Development-mode checks paragraph, line 237; Further Notes, D9, line 585; user story 11, line 42.

Text:

````
The Top Bar's right-hand section (D9): the Nested menu root's factory injects `nfsTopBarRightToken` optionally. It finds an `NfsTopBarRight` on the root or on any element the root is declared inside, through embedded views and child components' templates, on the server as in the browser. It does not find the section when a layout component projects the menu into it from another template, because dependency injection for projected content follows the declaration site; then the root reads the section from the DOM after hydration.
````

````
...its check for a dropdown-mode root whose Base side the DOM walk changed after hydration, that is, a menu in a `.top-bar-right` that dependency injection could not see, naming `alignment="right"` (D9).
````

````
| D9 | `alignment` `'auto'` reads the hosted Menu's `align`, `Directionality`, and a Top Bar right-hand section; the section through `nfsTopBarRightToken` at construction, and through a DOM walk after hydration only when no token was found, with a development warning (revised 2026-09-28 under the class rule; the Nested menu root owns both reads) | Server output is the first paint (building-blocks 1.11 decision 1)... Measured with Angular 22.2.0 in a server render and under hydration in three engines: the token reached roots declared in the section, in a child component's template, in an `@if` block, and on the section element; only the projected root changed at hydration | The DOM walk alone...; the token alone...; reading a static `align-right` or `.top-bar-right` class (building-blocks 1.4) |
````

````
11. As an application developer, I want a Dropdown Menu declared inside `nfsTopBarRight` to carry its left-opening side in the server HTML, and one my layout component projects into the section to get it after hydration with a development warning naming `alignment="right"`, so that the first paint is right wherever I can make it right.
````

Tests and stories: Browser-level test, line 527: "the section is found through the token for a root declared inside `NfsTopBarRight`, through an embedded view, through a child component's template, and on the section element itself; a root that a test layout component projects into its right-hand section has `opens-right` before the first render callback and `opens-left` after it..."; e2e, prerendered fixture app, line 552: "the class attributes of every root, item, and submenu are identical before and after hydration except the projected copy's parents, which move from `opens-right` to `opens-left`, with one development warning naming `alignment="right"`."

Needs: `nfsTopBarRightToken` (optional injection), `NfsTopBarRight`'s host element and its DOM class, resolved by a `closest()`-style walk after hydration.

Rule as documented usage: Declare a Dropdown Menu directly inside `nfsTopBarRight` where possible; where a layout component instead projects the menu into that section, bind `alignment="right"` so the server HTML already opens left.

Mentions: user story 10, line 41; Rendering modes, "Full hydration", line 482; Foundation behaviour changed or dropped, line 762 ("A Top Bar's right-hand section is known at construction through DI... only a menu projected into the section from another template is read from the DOM, after hydration").

Boundary call: D22 (line 598) states "The root has no development check of its own... The projected right-hand section's warning is the Nested menu root's, where the walk runs" -- the mechanism's implementation belongs to the Nested menu shared utility (a different group's file), but its full design (D9), the story text, and the development-checks paragraph are stated in this file, so it is extracted here; classified `family` because it is a DOM-only placement check (whether the menu sits inside a Top Bar's right-hand section).

### build-time: `nfs-dropdown-menu` arrow contrast check

Location: WCAG 2.2 AA table, row 1.4.11, line 344; Sass subsection, rule 1(f), line 725.

Text:

````
1.4.11 Non-text Contrast | Every arrow reaches 3:1 against what it is drawn on | Passes with Foundation's defaults: `$dropdownmenu-arrow-color` (`$anchor-color`) and the Hybrid toggle's `$accordionmenu-arrow-color` (`$primary-color`) are 4.65:1 on white and 3.76:1 on the default Top Bar. `nfs-dropdown-menu` stops the compile with `@error` naming the setting when the exact ratio of `$dropdownmenu-arrow-color` is below 3 against `$dropdownmenu-background` or else `$body-background`, and against `$dropdownmenu-submenu-background` (only while `$dropdownmenu-arrows` is on), and when `$accordionmenu-arrow-color` is below 3 against `$accordionmenu-submenu-toggle-background` where set, or else those same backgrounds (the Hybrid toggle's arrow, which Foundation draws whatever `$dropdownmenu-arrows` says); against the Top Bar's backgrounds both arrows are `@warn`s (D14) | Sass compile test (axe has no 1.4.11 rule) |
````

Tests and stories: Node-level Vitest, line 536: "`$dropdownmenu-arrows: false` drops the button-arrow rules and keeps the toggle checks; a `$dropdownmenu-arrow-color` below 3:1 on `$body-background` or on `$dropdownmenu-submenu-background`, an `$accordionmenu-arrow-color` below 3:1 on a set `$accordionmenu-submenu-toggle-background`... each stop the compile with an `@error` naming the setting"; "`$dropdownmenu-arrow-color: #116666` with `$dropdownmenu-submenu-background: #0a0a0a` stops the compile (2.94:1 exactly, 3.01:1 through Foundation's `color-luminance()`, the Top Bar ticket's measured false pass), which proves the exact-luminance helper."

Needs: `$dropdownmenu-arrow-color`, `$accordionmenu-arrow-color`, `$dropdownmenu-background`, `$dropdownmenu-submenu-background`, `$accordionmenu-submenu-toggle-background`, `$body-background`, `$dropdownmenu-arrows`, the library's exact-luminance helper, line 726.

Rule as documented usage: Keep `$dropdownmenu-arrow-color` and `$accordionmenu-arrow-color` at least 3:1 against the backgrounds they are drawn on outside a Top Bar.

Mentions: user story 36, line 67; Solution paragraph, line 28.

### build-time: `nfs-dropdown-menu` current-link fill contrast check

Location: WCAG 2.2 AA table, row 1.4.1, line 341; Further Notes, D21, line 597; Sass subsection, rule 1(e) and 1(f), line 724.

Text:

````
1.4.1 Use of Color | The current link differs from its neighbours by its fill, at least 3:1 against the background they sit on, on the top level and in submenus | Passes: the fill, `$menu-item-background-active` (`$primary-color`), is 4.65:1 against `$body-background` and `$dropdownmenu-submenu-background`, and 3.76:1 on the default Top Bar. `nfs-menu` stops the compile against `$body-background` (the Menu spec); `nfs-dropdown-menu` against `$dropdownmenu-submenu-background` and, where it is not `null`, `$dropdownmenu-background`, on which its rule (e) keeps the fill (D21)... | Sass compile test; story play (the current top-level link and a current Hybrid link whose section is open keep the fill) |
````

````
| D21 | The current top-level link keeps the Menu's current look: `nfs-dropdown-menu` rule (e) applies Foundation's `menu-state-active` to `.dropdown.menu > li > a[aria-current]` at specificity (0,3,2), and the mixin checks the fill against a set `$dropdownmenu-background` at 3:1 (2026-09-28) | One Current link look in every menu and mode (ADR 0042), apart from the open parent's dropdown look. Measured in three engines: without the rule, a set `$dropdownmenu-background`... leaves the current link white on white, 1:1, which axe reports only as incomplete... | Foundation's dropdown active look for the current link...; no rule (the two failures measured) |
````

Tests and stories: Node-level Vitest, line 536: "stops it naming the 1.4.1 check of `$menu-item-background-active` (1.26:1; the settings leave no arrow on that background, because on Foundation's defaults every arrow colour equals the fill and an arrow check would fire first)"; Story `dropdown-menu--hybrid`, line 506 ("the current top-level Hybrid link, found by `getByRole('link', {current: 'page'})`, keeps the computed background of `$menu-item-background-active`... at least 3:1 against the page background").

Needs: `$menu-item-background-active`, `$dropdownmenu-background`, `$dropdownmenu-submenu-background`, `$body-background`.

Rule as documented usage: Keep `$menu-item-background-active` at least 3:1 against `$dropdownmenu-submenu-background`, and against `$dropdownmenu-background` where that setting is not `null`.

Mentions: none beyond the locations above.

### build-time: `nfs-dropdown-menu` toggle and row target-size check

Location: WCAG 2.2 AA table, row 2.5.8, line 355; Further Notes, D19, line 595; Sass subsection, rule 1(f), line 725.

Text:

````
2.5.8 Target Size (Minimum) | Every parent, link, and toggle is at least 24 by 24 CSS px | Passes with Foundation's defaults: top-level and submenu rows are 38 px high with `$dropdownmenu-padding` and `$dropdownmenu-submenu-padding`; a Hybrid toggle is `$accordionmenu-submenu-toggle-width` by `-height`, 40 px, in every mode. `nfs-dropdown-menu` stops the compile with `@error` when either toggle setting is below 24 px, or when a row... is below 24 px, because row height is a consumer setting and a small padding gives stacked submenu rows under 24 px, where the spacing exception does not apply | Accessibility gate (`target-size`...); Sass compile test |
````

````
| D19 | A row-height compile check beside the arrow and toggle checks (amended 2026-09-26, audit 0005 M1) | 2.5.8 is guaranteed by the Library mixin where settings can fail it (building-blocks 1.10); row height is a consumer setting, and the story gate compiles only the library's own settings (ADR 0022), as the Drilldown Menu spec's D20 found | Relying on the story gate's `target-size` rule (the spec's text before this amendment) |
````

Tests and stories: Node-level Vitest, line 536: "a 20 px `$accordionmenu-submenu-toggle-width`, and a `$dropdownmenu-padding` of `0.2rem 1rem` each stop the compile with an `@error` naming the setting."

Needs: `$accordionmenu-submenu-toggle-width`, `$accordionmenu-submenu-toggle-height`, `$dropdownmenu-padding`, `$dropdownmenu-submenu-padding`, Foundation's `rem-calc()`.

Rule as documented usage: Keep the Hybrid toggle at least 24 px square and every row at least 24 px tall.

Mentions: user story 37, line 68.

### build-time: `nfs-dropdown-menu` submenu min-width warning

Location: WCAG 2.2 AA table, row 1.4.10, line 343; Further Notes, D13, line 589; Sass subsection, rule 1(f), line 725.

Text:

````
1.4.10 Reflow | At 320 CSS px no submenu makes the page scroll sideways, from any item position and at any depth | Fails with Foundation's default `$dropdownmenu-min-width: 200px`: a submenu from a narrow item between about 120 and 200 px from the left fits neither side, and `opens-inner` keeps its left edge. A submenu no wider than half the page always fits: from an item starting in the left half it fits opening rightwards, from one ending in the right half it fits opening leftwards, and a nested submenu that fits neither side fits `opens-inner` under its parent. Required consumer setting: `$dropdownmenu-min-width: min(200px, 45vw);`... `nfs-dropdown-menu` warns at compile time when the setting is a fixed length over 160 px | e2e at 320 px; Sass compile test |
````

````
| D13 | `$dropdownmenu-min-width: min(200px, 45vw)` required for 1.4.10, with a compile-time `@warn` | A submenu at most half the page wide always fits one of Foundation's three sides; settings over library rules (ADR 0022); the Dropdown pane's precedent | A library `max-width` rule; leaving 1.4.10 as advice |
````

Tests and stories: Node-level Vitest, line 536: "the default `$dropdownmenu-min-width: 200px` warns and `min(200px, 45vw)` and `160px` do not."

Needs: `$dropdownmenu-min-width`.

Rule as documented usage: Set `$dropdownmenu-min-width: min(200px, 45vw);` so no submenu overflows a 320 CSS px page.

Mentions: user story 23, line 54; Problem Statement, line 15.

### build-time: `nfs-dropdown-menu` Top Bar pairs warning

Location: WCAG 2.2 AA table, rows 1.4.3 and 1.4.11, lines 342 and 344; Further Notes, D14, line 590; Sass subsection, rule 1(f), line 725.

Text:

````
1.4.3 Contrast (Minimum) | ... Fails inside Foundation's default Top Bar: `$topbar-background` (`$light-gray`) gives 3.76:1 for links, parent buttons, and the open parent. Required when the menu sits in a Top Bar: the Top Bar spec's settings... `nfs-top-bar` stops the compile for `$anchor-color` against the bar; `nfs-dropdown-menu` warns at compile time (`@warn`, since the mixin cannot know whether a Top Bar is used) when `$dropdown-menu-item-color-active` is below 4.5 against the bar backgrounds (D14)
````

````
| D14 | Inside a Top Bar, `nfs-top-bar` stops the compile for `$anchor-color` and the current link's fill (the Top Bar spec); `nfs-dropdown-menu` warns for the pairs only a Dropdown Menu adds to the bar: `$dropdown-menu-item-color-active` at 4.5:1 and both arrow colours at 3:1; the Storybook sets both Top Bar lines (revised 2026-09-28) | Foundation's default Top Bar gives 3.76:1; one pair, one check; the Dropdown Menu's mixin cannot know whether a Top Bar is used, so it warns rather than stops; measured by the Top Bar ticket, the submenu line keeps open Top Bar submenus passing | `@error` in `nfs-dropdown-menu` (breaks consumers without a Top Bar); repeating `nfs-top-bar`'s `$anchor-color` pair as a warning (two reports for one pair) |
````

Tests and stories: Node-level Vitest, line 536: "the default `$topbar-background` warns naming `$dropdown-menu-item-color-active` (3.76:1) and not `$anchor-color` (`nfs-top-bar`'s error), and `$topbar-background: $white` with `$topbar-submenu-background: $topbar-background` warns nothing."

Needs: `$dropdown-menu-item-color-active`, `$dropdownmenu-arrow-color`, `$accordionmenu-arrow-color`, `$topbar-background`, `$topbar-submenu-background`.

Rule as documented usage: Inside a Top Bar, set `$topbar-background: $white;` with `$topbar-submenu-background: $topbar-background;` (the required settings the Storybook overrides carry) so the Dropdown Menu's own colours reach the required ratios there too.

Mentions: user story 36, line 67; Solution paragraph, line 28; Testing Decisions, line 359 (Storybook required settings, commented by criterion).

### Kept (not a check)

- The Nested menu utility's item, submenu, toggle behaviour, key tables, collision flip, Light dismiss, hover intent, focus-loss guard, and the checks that belong there (the copied-class check on items/submenus/toggles, the Hybrid-toggle-name check, the nameless-back-button-in-a-drilldown-level check at WCAG table row 2.4.6, line 350, and the `expandAll()` check): "## Out of Scope" first bullet, line 562 (out of scope for this file).
- The Menu directive's own Variant inputs, types, runtime checks, and development checks: "## Out of Scope" second bullet, line 563.
- The Menu mode swap and breakpoint rules (Responsive Menu): "## Out of Scope" third bullet, line 564.
- ARIA and keyboard behaviour (disclosure navigation, the key table): "### ARIA and keyboard" section, lines 292-330.
- Required parent injection and NG0201: not applicable (no required injection in this file).
- The library's own tests: "## Testing Decisions" section as a whole, lines 494-559, and the manual release test, line 558.

## specs/dropdown.md

### misuse: `role="dialog"` without a name

Location: "### API" section, Behaviour rules, Dev-mode checks item 1, line 287.

Text:

````
(1) `role="dialog"` without `aria-labelledby` or `aria-label` on the pane: "name the dialog pane";
````

Tests and stories: Browser-level test, line 521: "each of the eight warnings fires once for its case and not for correct markup (`role="dialog"` with `aria-label`...)".

Needs: none beyond the pane's own `role` and ARIA-naming attributes.

Rule as documented usage: A `role="dialog"` pane must carry `aria-labelledby` or `aria-label`.

Mentions: user story 28, line 57 (implied by story wording "a dialog pane to have a name").

### misuse: `trapFocus` without `role="dialog"`

Location: "### API" section, Behaviour rules, Dev-mode checks item 2, line 287.

Text:

````
(2) `trapFocus` without `role="dialog"`: "a trapped pane is a non-modal dialog; set `role="dialog"` and name it";
````

Tests and stories: Browser-level test, line 521: "`trapFocus` with `role="dialog"`" listed among the correct-markup cases that stay silent.

Needs: none beyond the pane's own two inputs.

Rule as documented usage: `trapFocus` requires `role="dialog"`.

Mentions: user story 25, line 54; API table row `trapFocus`, line 260.

### family: Pane precedes, or lacks, a registered Trigger

Location: "### API" section, Behaviour rules, Dev-mode checks item 3, line 287.

Text:

````
(3) the pane precedes its first registered Trigger in document order, or no Trigger is registered while `hover` is on (a hover pane must also open by click and keyboard);
````

Tests and stories: Browser-level test, line 521 ("the pane right after its Trigger" listed among the correct-markup cases).

Needs: the pane's `registerTrigger()` registry, populated by the Triggers directives (`nfsToggle`, `nfsOpen`, `nfsClose`) placed beside it.

Rule as documented usage: Write the pane right after its Trigger, and give a `hover` pane a Trigger as well as hover.

Mentions: none beyond the location above.

Boundary call: this check reads the set of Triggers registered with the pane -- other directives that compose with the pane through `registerTrigger()` -- rather than only the pane's own host, input, or content; classified `family` (a registration check, the ruling's explicit example) rather than `misuse`, even though the Triggers belong to a different spec (the shared Triggers utility) than the pane itself.

### misuse: `parentClass` names no ancestor

Location: "### API" section, Behaviour rules, Dev-mode checks item 4, line 287.

Text:

````
(4) `parentClass` names no ancestor;
````

Tests and stories: Browser-level test, line 521 ("an existing `parentClass` ancestor" listed among the correct-markup cases); Story `dropdown-pane--parent-class`, line 499.

Needs: the DOM ancestor chain, walked at Positioner measurement time (`closest('.' + parentClass)`, line 284).

Rule as documented usage: `parentClass` must name a class an ancestor element actually carries.

Mentions: API table row `parentClass`, line 255; Behaviour rules, line 284.

Boundary call: like check 3 and check 8, this check walks the DOM beyond the pane's own host, but it validates the pane's own input value (`parentClass`) against the page rather than a fixed compositional rule; classified `misuse` ("a value it cannot use", the ruling's own example), distinct from check 8's fixed placement rule.

### misuse: `animate` started no animation

Location: "### API" section, Behaviour rules, Dev-mode checks item 5, line 287.

Text:

````
(5) in the `earlyRead` phase that measures a phase's animation, the Reveal's check 3 applied to `animate`: a non-empty half whose classes start no CSS animation when its phase begins (a consumer class without `@keyframes`, a Motion UI transition class given in the dot form, or a Motion name without the `nfs-motion` include): "animate="fade-in fade-out" started no animation: include nfs-motion, or give your own class @keyframes", the phase completing at once as before; a dot-form class that starts with `nfs-`: "write the library's Motion name without its prefix: animate="fade-in""; and a value that does not split into one entering and one leaving value... "animate takes one entering and one leaving value";
````

Tests and stories: Browser-level test, line 521: "Check 5 also fires for `animate="fade-in fade-out"` with the test keyframes absent, and the phase still completes at once."; line 518-519 (animation class mapping cases).

Needs: the host's computed `animation-name` etc., read in the `earlyRead` phase after a Motion class is bound.

Rule as documented usage: Write `animate` as one entering and one leaving Motion name or dot-form class, each backed by an actual CSS animation (`nfs-motion` included, or the consumer's own `@keyframes`).

Mentions: none beyond the location above.

### misuse: Static `autoFocus` attribute

Location: "### API" section, Behaviour rules, Dev-mode checks item 6, line 287; Further Notes, D13, line 587.

Text:

````
(6) a static `autoFocus` attribute on the host (read with `HostAttributeToken`): HTML attribute names are case-insensitive, so it also renders HTML's global `autofocus` attribute, which the host binding keeps out of the server HTML but which, in client rendering, the browser acts on when the pane is inserted, focusing the pane itself once it is focusable (a consumer's `tabindex`); bind `[autoFocus]="true"` or set it through the Defaults token instead;
````

````
| D13 | `autoFocus` keeps Foundation's name but is set by binding or the Defaults token; a static attribute warns in dev mode | The name is Foundation's `data-auto-focus` in camelCase (building-blocks 1.4), but a static `autoFocus` attribute is HTML's global `autofocus`... | Renaming the input (breaks the naming rule); ignoring the collision |
````

Tests and stories: Browser-level test, line 521 ("`[autoFocus]="true"` bound" among correct-markup cases).

Needs: `HostAttributeToken`, read for the static attribute.

Rule as documented usage: Bind `autoFocus` (`[autoFocus]="true"`) or set it through `nfsDropdownPaneDefaultsToken`; never write a static `autoFocus` attribute.

Mentions: API table row `autoFocus`, line 259.

### misuse: Copied Foundation class on the host

Location: "### API" section, Behaviour rules, Dev-mode checks item 7, line 287; Further Notes, D27, line 601.

Text:

````
(7) a Foundation class copied onto the host, read from its static `class` through `HostAttributeToken('class')` in a field initialiser that exists only in development builds, because a stripped class no longer shows after render: `is-open` ("renders closed: bind `[isOpen]="true"`"), Foundation's default size names `tiny`, `small`, `large` ("bind `size="large"`"), the legacy `top`, `bottom`, `left`, `right` ("does not place the pane: bind `position="top"`"), any `has-position-*` or `has-alignment-*` ("set by nfsDropdownPane from its placement"), and `is-opening` (Foundation's measuring class, which lays out a closed pane invisibly and which the pane never binds), whole tokens only; a redundant `dropdown-pane` and the consumer's own classes are not reported, and consumer-declared size names are left to the Variant check;
````

Tests and stories: Browser-level test, line 519: "`class="dropdown-pane is-open"` renders closed with `is-open` stripped and warns once, naming `[isOpen]="true"`; `class="large"` keeps `.large` and warns, naming `size="large"`; `class="top"` leaves the placement at `bottom` and warns, naming `position="top"`; `class="has-position-top"` and `class="is-opening"` warn; a redundant `class="dropdown-pane"` and the consumer's own `class="account-pane"` do not; nothing is read in a production build."

Needs: `HostAttributeToken('class')`.

Rule as documented usage: Bind `[isOpen]`, `size`, `position`, and `alignment`, and read `placement()`, instead of writing `is-open`, a size name, a legacy position class, or a `has-position-*`/`has-alignment-*` class on the pane.

Mentions: user story 46, line 75; Rendered HTML, line 434 ("Foundation markup copied as is: `is-open` is stripped by the binding, `top` and `large` stay; dev check 7 warns once, naming `[isOpen]="true"`, `position="top"`, and `size="large"`").

### family: Pane inside a Button Group

Location: "### API" section, Behaviour rules, Dev-mode checks item 8, line 287; Further Notes, D30, line 604.

Text:

````
(8) the pane's parent element is inside a Button Group (`closest('.button-group, [nfsButtonGroup]')`; the attribute counts too, because the misuse stays once a forgotten `NfsButtonGroup` import is added, and `strictDirectiveImports` reports that import on its own): "place the pane after the Button Group; the group's rules restyle the buttons inside it".
````

````
| D30 | A split button's pane goes after the Button Group, never inside it; a pane inside a group warns in development (dev check 8) | The Button Group spec's decision: Foundation's `$buttongroup-child-selector` rules would restyle every `nfsButton` host in the pane; the pane still follows its Trigger in document order (dev check 3), so check 3 alone would not catch it | A group token the pane reads (the Button Group spec decided no token); documentation only... |
````

Tests and stories: Browser-level test, line 521: "a pane after, not inside, an `nfsButtonGroup`... Check 8 also fires for a pane inside an element that carries `nfsButtonGroup` without its class (a forgotten import)."

Needs: an ancestor walk for `.button-group` or `[nfsButtonGroup]`.

Rule as documented usage: Write a split button's pane after its Button Group, never inside it.

Mentions: user story 49, line 78; Usage examples, line 655 ("A split button: the pane goes after the Button Group, never inside it").

### runtime: Dropdown Pane Variant check

Location: "### API" section, Behaviour rules, "Variant check" paragraph, line 286; Further Notes, D28, line 602; Testing Decisions, Browser-level test, line 520.

Text:

````
Variant check. `nfsVariantCheck('nfsDropdownPane')` is called once at construction. When it returns a handle (development builds, or production with `provideNfsProductionRuntimeChecks`), the directive creates one more `afterRenderEffect` whose `read` phase calls `include('nfs-dropdown-pane', ['dropdown-sizes'])` on every run, whether or not `size` is bound, then `value('size', size(), needs)` when `size` has a value... So `strictVariantNames` reports a size the compiled CSS lacks, naming `$dropdown-sizes` and the listed names, and `strictVariantProperties` reports a missing `@include nfs-dropdown-pane;` when `--nfs-dropdown-sizes` reads empty (D28). A consumer who empties `$dropdown-sizes` gets that report too and switches the check off. No Runtime check runs on the server.
````

````
| D28 | The Variant check requests `nfs-dropdown-pane` whether or not `size` is bound, and reports bound sizes | The include carries the compile-time 1.4.10 warning, so a missing include is an accessibility gap worth reporting even with no `size` (the Callout's D12, the Close Button's D10); `--nfs-dropdown-sizes` is written by `nfs-dropdown-pane` alone and is never empty on Foundation's defaults | Requesting only when `size` is bound (a missing include on the commonest pane would go unreported) |
````

Tests and stories: Browser-level test, line 520: "with `--nfs-dropdown-sizes: tiny small large` on the test document, a listed `size` is silent; an unlisted `size` cast past the type reports `strictVariantNames` once, naming `nfsDropdownPane`, `size`, the value, and `$dropdown-sizes`; in a test file of its own, with the property absent, a pane with no `size` bound reports `strictVariantProperties` once, naming `@include nfs-dropdown-pane;`; `provideNfsRuntimeChecks({strictVariantProperties: false})` silences it; without a checker (the production double) the Variant check's `afterRenderEffect` is never created."

Needs: `--nfs-dropdown-sizes`, written by `nfs-dropdown-pane` alone (D29, line 603).

Rule as documented usage: none -- the check detects drift between bound `size` values and `$dropdown-sizes`, and a missing `@include nfs-dropdown-pane;`.

Mentions: user story 48, line 77; Solution paragraph, line 26.

### build-time: `nfs-dropdown-pane` width warning

Location: WCAG 2.2 AA table, row 1.4.10, line 364; Sass subsection, item 1, line 730; Further Notes, D22, line 596.

Text:

````
1.4.10 Reflow | At 320 CSS px every pane fits beside its Trigger without horizontal scrolling, from any Trigger position | Foundation's default `$dropdown-width: 300px` and the `size="small"` (200 px) and `size="large"` (400 px) sizes overflow from Triggers away from the edges, because the Positioner never shifts or shrinks a pane. A pane no wider than half the page always fits: left-aligned when its Trigger starts in the left half, right-aligned otherwise, and the search tries both. Required consumer settings: `$dropdown-width: min(300px, 45vw);` and `$dropdown-sizes: (tiny: 100px, small: min(200px, 45vw), large: min(400px, 45vw));`... The `nfs-dropdown-pane` mixin warns at compile time when either setting holds a fixed width over 160 px.
````

````
1. Rules: none besides the Variant property of item 6. No library CSS rule styles the pane. The mixin holds one compile-time check that emits nothing: `@warn` when `$dropdown-width` or a value in `$dropdown-sizes` is a fixed `px` or `rem` length wider than 160px (`rem-calc()` above 10rem), naming the setting and the required `min(<width>, 45vw)` form.
````

````
| D22 | 1.4.10 met by required Foundation settings (`min(300px, 45vw)` widths) with a compile-time warning, no CSS rule (the mixin's only output is the Variant property, D29) | ADR 0022 prefers Sass settings over library rules; a pane no wider than half the page fits from any Trigger because the search tries left and right alignment; the Positioner never shifts panes (Anchored pane spec) | A library `max-width` rule (does not fix a pane anchored mid-page); leaving sizing as advice |
````

Tests and stories: Node-level Vitest, line 531: "the mixin warns for the default `$dropdown-width: 300px`, for `small: 200px`, and for a fixed-width custom size, and stays silent for the required `min()` settings and for fixed widths up to 160 px."

Needs: `$dropdown-width`, `$dropdown-sizes`, Foundation's `rem-calc()`.

Rule as documented usage: Set `$dropdown-width: min(300px, 45vw);` and `$dropdown-sizes: (tiny: 100px, small: min(200px, 45vw), large: min(400px, 45vw));` so every pane fits a 320 CSS px page.

Mentions: user story 36, line 65; Solution paragraph, line 26.

### Kept (not a check)

- `size`, `position`, `alignment`, `role`, and the Options (`vOffset`, `hOffset`, `allowOverlap`, `allowBottomOverlap`, `hover`, `hoverDelay`, `closeOnClick`, `autoFocus`, `trapFocus`), and their compile errors for `size`: "### API" table, lines 244-271.
- ARIA and keyboard behaviour (Disclosure/non-modal dialog patterns, the key table): "### ARIA and keyboard" section, lines 334-355.
- The Positioner's own checks (same-axis alignment, negative offsets, a pane that is not `position: absolute`): line 287, last sentence -- these belong to the shared Anchored pane utility, out of scope for this file.
- No library CSS rule for the pane itself (only the Variant property `--nfs-dropdown-sizes`): Sass subsection, items 1, 3, 6, line 730.
- The library's own tests: "## Testing Decisions" section as a whole, lines 477-551.

## specs/equalizer.md

### forgotten-import: Equalizer family In-family checks

Location: "### Hierarchy and DI shape" section, lines 146 and 153.

Text:

````
An `nfsEqualizerWatch` with no equalizer does nothing, and its In-family parent check (below) reports it once in development builds: as out of reach when an `nfsEqualizer` ancestor is declared in another template, and otherwise as standing outside any equalizer, with the family's sentence. DI follows the declaration site: an equalizer inside a child component's own template does not see watched elements projected into it; the equalizer goes on an element of the template that declares them, or on the projecting component's host, or the component renders them inside the equalizer's element through a template outlet with that element's injector (the shared spec's template-outlet pattern).
````

````
In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsEqualizer` calls `nfsDirectiveCheck('NfsEqualizer', {children: ['NfsEqualizerWatch']})` and probes the `nfsEqualizerWatch` elements whose nearest `nfsEqualizer` ancestor is its host, so an inner group keeps its own, and the shared element of Foundation's nesting example, whose own `nfsEqualizer` is not its ancestor, belongs to the outer group, as its `skipSelf` registration does; it has no parent check. `NfsEqualizerWatch` calls `nfsDirectiveCheck('NfsEqualizerWatch', {parent: {directives: ['NfsEqualizer'], found: this.#equalizer !== null, alone: 'It belongs to no group, so no equalizer sets its min-height.'}})` and probes nothing; no library directive hosts `NfsEqualizer`, so it is the one parent directive, and the parent check replaces the spec's earlier "found no nfsEqualizer" warning, so the part reports once. Neither has a peer linked by reference or value (`register` and `unregister` go through the token). `strictParents` makes `NfsEqualizerWatch` throw the shared spec's `strictParents` error at construction, on the server as in the browser, when it found no equalizer, instead of warning and doing nothing; it changes nothing for `NfsEqualizer`. The token carries the development description every parent token has (the shared spec's D17), although this optional injection never throws NG0201.
````

Tests and stories: Browser-level test, line 348: "an `nfsEqualizerWatch` outside any equalizer warns once, with the family's sentence, and one declared in another template inside an equalizer's element warns once as out of reach; with `provideNfsRuntimeChecks({strictParents: true})` the first throws at construction, and watched elements rendered inside the equalizer's element through a template outlet with its injector register."; Node-level Vitest, SSR smoke, line 358 (no development warning is asserted in the SSR fixture).

Needs: `nfsDirectiveCheck`, `nfsEqualizerToken` (the parent handle, with its development-only description, line 143).

Rule as documented usage: Place `nfsEqualizerWatch` only on an element inside an `nfsEqualizer`'s own template (never projected from another template into it, unless routed through the template-outlet pattern).

Mentions: user story 29, line 57; "### API" section, `NfsEqualizerWatch`, line 188 ("It registers its host element with the nearest `NfsEqualizer` and unregisters on destroy").

### Kept (not a check)

- The three Options (`equalizeOn`, `equalizeOnStack`, `equalizeByRow`) and their types; explicitly not Variant inputs, so no compile error of the ADR 0040 kind applies: "### API" section, lines 163-179.
- No copied-class check, explicitly rejected because neither directive binds a class: "## Out of Scope" bullet, line 389; Design decision D16, line 416.
- No library CSS, no `nfs-equalizer` mixin, and no Runtime check, because Equalizer has no Variant class or property: "### Sass and custom CSS", line 313; "### Sass" subsection, line 558.
- The `equalizeOn` breakpoint-query warning ("an unknown name warns in development and answers `false`... instead of throwing", API table, line 175): out of scope for this file -- the text attributes it to "the Breakpoint service's rule", so the check's own mechanism belongs to `specs/breakpoint-service.md`, not to Equalizer.
- ARIA and keyboard: not applicable -- Equalizer adds no role, name, state, or key handling: "### ARIA and keyboard" section, line 233.
- The library's own tests: "## Testing Decisions" section as a whole, lines 315-377.

## specs/flex-grid.md

### forgotten-import: Flex Grid In-family checks

Location: "### Hierarchy and DI shape" section, line 137.

Text:

````
In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in development builds only, the Float Grid's two lines ([Spec: Float Grid](../issues/100-spec-float-grid.md)): `NfsRow` calls `nfsDirectiveCheck('NfsRow', {children: ['NfsColumn']})` and probes its columns, those of a column row included; `NfsColumn` calls `nfsDirectiveCheck('NfsColumn')` and probes nothing, because a column holds the consumer's content and a row nested in it is a row of its own. Neither part has a parent check, because neither injects a parent (a column outside a row is check 3's, read from the DOM), and neither has a peer linked by reference or value; the probe reads the DOM in development only, so production keeps no link (D14); `strictParents` changes nothing. The two grids' pairs make the same calls, as the Selector manifest's rule 2 requires of two directives with one class name (one selector and one host class): the host record keys a row or a column by that name whichever grid the component imports, and a report of a forgotten one names both entry points, `'ngx-foundation-sites/float-grid'` or `'ngx-foundation-sites/flex-grid'`, as NFS9001 does.
````

Tests and stories: Node-level Vitest, SSR smoke, line 412 ("no development warning or Runtime check report is made on the server").

Needs: `nfsDirectiveCheck`; the Selector manifest's rule 2, shared with the Float Grid.

Rule as documented usage: none.

Mentions: Design decision D14, line 459 ("No tokens, providers, or host directives; rows and columns work across Hydration boundaries and projection").

### misuse: Copied classes

Location: "### API" section, Development-mode checks, item 1, line 204.

Text:

````
1. Copied classes, on both directives: a static class list holding a Flex Grid class the directive sets warns once, naming each class with its input, for example "class="columns small-6 large-offset-2" is set by nfsColumn: bind size="6" and [offset]="{large: 2}" instead; .columns is Foundation's alias of the .column that nfsColumn binds". The patterns are built from the Breakpoint map's names: the size, expand, offset, `up`, collapse, uncollapse, and unstack templates, `shrink`, `expanded`, `collapse`, `is-collapse-child`, `column-block`, `columns`, and the other directive's static class (`column` copied onto `nfsRow` names `nfsColumn`, because a column row is both directives). The Flexbox Utilities' classes that Foundation's examples carry (`.align-*` on a row, `.align-self-*` and `.<bp>-order-<n>` on a column) are reported the same way, naming `nfsFlexAlign` or `nfsFlexChild` and the input to bind. A copied class is not stripped (D8).
````

Tests and stories: Browser-level test, line 406: "`class="columns small-6 large-offset-2 align-self-bottom"` on `nfsColumn` warns once, naming `size`, `offset`, `columns` as the alias, and `nfsFlexChild`'s `alignSelf`, and the copied classes remain; a redundant `row` on `nfsRow` does not warn; `column` copied onto `nfsRow` names `nfsColumn`; `class="medium-unstack align-center"` on `nfsRow` names `unstack` and `nfsFlexAlign` with `alignX`."

Needs: `HostAttributeToken('class')` (line 135), the Breakpoint map's names.

Rule as documented usage: Bind `size`, `offset`, `up`, `collapse`, `unstack`, `expanded`, `isCollapseChild`, `columnBlock` (and the Flexbox Utilities' `alignX`/`alignY`/`alignSelf`/`order`) instead of writing Foundation's class names, `.columns` included, on the row or column.

Mentions: user story 26, line 52; Rendered HTML, line 425 (Foundation markup copied as is, name reported).

### misuse: Row without the Flex Grid's CSS

Location: "### API" section, Development-mode checks, item 2, line 205.

Text:

````
2. Row without the Flex Grid's CSS, on `NfsRow`, at the first render: a host that is not a column row and whose computed `display` is neither `flex` nor `none` warns "nfsRow: this row is not a flex row, so the Flex Grid's CSS is not in this page: set $xy-grid: false before foundation-everything, or include foundation-flex-grid, and not foundation-grid". A row hidden with `display: none` is not reported.
````

Tests and stories: Browser-level test, line 406: "without the Flex Grid style block, a row warns that the Flex Grid's CSS is missing, and a column row and a `display: none` row do not."

Needs: none beyond the row's own computed `display`.

Rule as documented usage: Compile `foundation-flex-grid` (through `$xy-grid: false` before `foundation-everything`, or by hand), never `foundation-grid`, wherever `nfsRow` is used.

Mentions: user story 25, line 51.

### family: Column placement

Location: "### API" section, Development-mode checks, item 3, line 206.

Text:

````
3. Placement, on `NfsColumn`, read from the DOM at the first render, where an element is a row when it carries `row` or the `nfsRow` attribute and a column when it carries `column` or the `nfsColumn` attribute: a host that is not also a row, whose parent element is not a row, warns "nfsColumn: this column is not a direct child of nfsRow, so its size, offset, and gutters do not apply"; a parent that is both a row and a column warns "nfsColumn: the parent is a column row, which Foundation lays out as a block, so columns inside it stack: nest an nfsRow inside it"; a bound `size` whose parent carries a `<bp>-unstack` class warns "nfsColumn: unstack="medium" on the row sizes its columns, so this size only caps the column's width: remove it or remove the row's unstack". A parent that carries `nfsRow` without `row` is a row whose import was forgotten, which the `strictDirectiveImports` Runtime check reports once on that element and the static check in CI, so its columns give no placement warning, as the Float Grid's check 2 decides.
````

Tests and stories: Browser-level test, line 406: "a column whose parent has no `row` warns once; a column row outside a row does not; a column whose parent carries `nfsRow` with `NfsRow` left out of the test host's imports does not; ... a sized column in an `unstack` row warns, an unsized one does not."

Needs: the parent element's own class list and attributes, read from the DOM.

Rule as documented usage: Write every `nfsColumn` as a direct child of `nfsRow`, never inside a column row; remove a column's `size` where the row is `unstack`.

Mentions: user story 27-28, lines 53-54; Notes, line 564.

### family: Column content overflow at viewport

Location: "### API" section, Development-mode checks, item 4, line 207; Further Notes, D11, line 456.

Text:

````
4. Overflow at the current viewport, on `NfsRow` (D11): a `ResizeObserver` on the host, created in the read phase at the first render when the host is a flex row and disconnected on destroy, checks the host's column children: a column whose `scrollWidth` exceeds its `clientWidth` by more than 1 px warns once: "nfsRow: a column's content is wider than the column at this viewport (WCAG 1.4.10): stack the columns below a breakpoint with unstack="medium" on the row or [size]="{small: 12, medium: ...}" on the columns".
````

````
| D11 | The overflow check measures in development with one `ResizeObserver` per row, warning when a column's content is wider than the column | Measured: Foundation's own align-self example overflows by 27 px and scrolls the page at 320 CSS px in three engines, and axe does not report it; overflow depends on content and viewport, so only a measurement in the running page sees it, as the XY Grid's frame check does | Library CSS on `.column`, `overflow-wrap: break-word` or `min-width: auto`...; a compile-time rule (the overflow depends on the content) |
````

Tests and stories: Browser-level test, line 406: "a row of four bare columns of long words in a 320 px wide host warns once from the overflow check and stays silent after later resizes; the same row with `size="12"` on its columns does not warn."

Needs: `ResizeObserver` on the row and its column children.

Rule as documented usage: Stack a row's columns below the breakpoint where their content no longer fits (`unstack`, or a Zero-breakpoint `size`).

Mentions: user story 29, line 55; WCAG table, row 1.4.10, line 249.

### family: Nested row sticks out of collapsed parent

Location: "### API" section, Development-mode checks, item 5, line 208; Further Notes, D6, line 451.

Text:

````
5. Nested row that sticks out, on `NfsRow`, in the same observer callback: a host whose parent element carries `column`, whose computed `margin-left` is negative, and whose parent's computed `padding-left` is 0 warns once: "nfsRow: this nested row sticks out of its collapsed parent by half a gutter: bind isCollapseChild on it, or collapse the parent row at every width with the bare collapse attribute".
````

````
| D6 | `isCollapseChild` is an input of the nested row, not bound automatically; development check 5 reports when it is missing | Measured: a nested row in a `small-collapse` row sticks out by half a gutter and scrolls the page 10 px sideways at 320 CSS px; `.is-collapse-child` removes its margins at every width, which under `{small: true, medium: false}` also adds a second gutter inside the uncollapsed parent (measured: 15 px more inset at 1280 px), a trade-off only the consumer can choose; knowing the parent's collapse needs DI or a DOM read that the server HTML cannot carry | Binding it from a parent row token (a production link and a Hydration-boundary tie for a development-grade concern, and wrong under responsive collapse) |
````

Tests and stories: Browser-level test, line 406: "a nested row in a `[collapse]="{small: true}"` row warns once, with `isCollapseChild` or in a bare `collapse` row it does not."; Story `flex-grid--nesting`, line 396 ("a `console.warn` spy records nothing" for the correct-markup cases).

Needs: the parent column's computed `padding-left`, the nested row's own computed `margin-left`, read in the same `ResizeObserver` callback as check 4.

Rule as documented usage: Bind `isCollapseChild` on a row nested in a responsively collapsed row, or collapse the parent row at every width with the bare `collapse` attribute.

Mentions: user story 18, line 44; WCAG table, row 1.4.10, line 249.

### runtime: Flex Grid Variant check

Location: "### API" section, "Runtime check" paragraph, line 209.

Text:

````
Runtime check, in the same read phase: each directive calls `include()` only while a value that reads a property is bound, because `nfs-flex-grid` carries no rule the grid needs (the XY Grid's rule): `NfsColumn` calls `include('nfs-flex-grid', ['grid-column-count'])` while `size` or `offset` holds a count, `NfsRow` calls `include('nfs-flex-grid', ['block-grid-max'])` while `up` is bound, and each calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])` while a bound value names a Class breakpoint above the Zero breakpoint. Then `value(input, value, needs)` for each bound input, with the needs from the same mapping that sets its classes... `expanded`, `isCollapseChild`, `columnBlock`, and the bare `collapse` are closed and make no call. The report shape and configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).
````

Tests and stories: Browser-level test, line 407: "with a style block writing `--nfs-grid-column-count: 12; --nfs-block-grid-max: 8; --nfs-breakpoint-classes: small medium large;`, bound values within range are silent; `size` 13 and `up` 9 through a cast report `strictVariantNames` once each, naming `$grid-column-count` and `$block-grid-max`; an `xlarge` key through a cast reports naming `$breakpoint-classes`; in a test file of its own, with no properties, a column with `size="6"` reports `strictVariantProperties` once naming `@include nfs-flex-grid;`, and a column with `size="shrink"` and a row with only `collapse` ask for nothing."

Needs: `--nfs-grid-column-count`, `--nfs-block-grid-max`, written by `nfs-flex-grid` (line 557, item 6); `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties`.

Rule as documented usage: none -- the check detects drift between bound counts/breakpoints and the compiled `$grid-column-count`, `$block-grid-max`, and `$breakpoint-classes`.

Mentions: user stories 10-11, lines 36-37; user story 31, line 57.

### Kept (not a check)

- `size`, `offset`, `up`, `collapse`, `unstack`, `expanded`, `isCollapseChild`, `columnBlock` typed Variant/Option inputs and their compile errors: "### API" section, lines 164-192; user stories 8, 11, 19, 37.
- ARIA and keyboard: no role, no key handling: "### ARIA and keyboard" section, lines 232-241.
- The `nfs-flex-grid` mixin has no CSS rules, only the two Variant properties `--nfs-grid-column-count` and `--nfs-block-grid-max`: Sass subsection, line 557 (D12: "No library CSS: `nfs-flex-grid` writes only... the same two properties with the same values as the Float Grid's mixin").
- The library's own tests: "## Testing Decisions" section as a whole, lines 380-424.

## specs/flexbox-utilities.md

### forgotten-import: Flexbox Utilities In-family checks

Location: "### Hierarchy and DI shape" section, line 135.

Text:

````
In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsFlexContainer`, `NfsFlexAlign`, and `NfsFlexChild` each call `nfsDirectiveCheck` with their class name (`nfsDirectiveCheck('NfsFlexChild')`), with no parent check, no child probes, and no peers, because no directive of the family needs another: any family's directive, or the consumer's CSS, makes an element a Flex parent, so `NfsFlexChild` has no parent directive to name and `NfsFlexContainer` no child part to probe, and the not-a-Flex-parent warning (check 2) reads the computed `display` instead. `NfsFlexAlign` makes its call in its own constructor also where `NfsFlexContainer` hosts it, so the host record shows it on that element and an `nfsFlexAlign` attribute written there is reported by no check, the static check reading the hosted directive from the Selector manifest's `hosts`. The Flex parents' and Flex children's own directives written beside these (`nfsGridX`, `nfsCell`, `nfsButtonGroup`, `nfsMediaObjectSection`) belong to other families: no part here probes them, and the runtime check and the static check decide each attribute on its own (the shared spec's family rule). `strictParents` changes nothing.
````

Tests and stories: Node-level Vitest, SSR smoke, line 362 ("no development warning or Runtime check report is made on the server").

Needs: `nfsDirectiveCheck`; the Selector manifest's `hosts`.

Rule as documented usage: none.

Mentions: none beyond the location above.

### misuse: Copied classes

Location: "### API" section, Development-mode checks, item 1, line 192; Design decision D12, line 190.

Text:

````
1. Copied classes (D12), once per instance at the first render: a static class list that holds a class of the directive's own families warns, naming each class with its input, for example "class="align-center small-order-2" holds Flexbox Utilities classes: bind alignX="center" on nfsFlexAlign and order="2" on nfsFlexChild instead". `NfsFlexContainer` reports `flex-container`, `<bp>-flex-container`, and the direction classes; `NfsFlexAlign` the parent alignment classes; `NfsFlexChild` the size, self alignment, and order classes, the responsive ones matched by their templates (`<word>-order-<n>`, `<word>-flex-child-<size>`). The consumer's own classes are not reported.
````

Tests and stories: Browser-level test, line 351: "`class="flex-container flex-dir-column"`, `class="align-center align-middle"`, and `class="flex-child-grow align-self-top medium-order-2"` each warn once, naming the inputs; the consumer's own class does not warn."

Needs: `HostAttributeToken('class')` (line 133).

Rule as documented usage: Bind `nfsFlexContainer`, `direction`, `alignX`, `alignY`, `alignCenterMiddle`, `nfsFlexChild`, `alignSelf`, and `order` instead of writing Foundation's class names on the host.

Mentions: user story 31, line 64.

### family: Not in a Flex parent (boundary call: mixed with misuse)

Location: "### API" section, Development-mode checks, item 2, line 193; Design decision D13, line 191.

Text:

````
2. Not in a Flex parent (D13), once per instance at the first render: `NfsFlexAlign` warns when its host's computed `display` is not `flex` or `inline-flex` and the host carries no `flex-container` or `<bp>-flex-container` class; `NfsFlexChild` warns the same for its parent element, with `grid` and `inline-grid` also accepted, where `order` and `align-self` apply. The message names the directive and says which directive makes the element a Flex parent, and that where the element already carries a Flex parent directive's attribute (`nfsGridX`, a Flex Grid `nfsRow`), that directive's import is missing, which the `strictDirectiveImports` Runtime check reports once on that element. The check names no directive it found there, because a Flex parent's directive may be any family's, and the Float Grid's `nfsRow`, which makes no Flex parent, shares its attribute with the Flex Grid's.
````

Tests and stories: Browser-level test, line 352: "`nfsFlexAlign` on a block `div` warns once; on a `display: flex` host, on an `nfsFlexContainer` host, and on a host carrying `medium-flex-container` at a narrow width it does not; `nfsFlexChild` in a block parent warns once, in a flex or grid parent does not."

Needs: the host's (for `NfsFlexAlign`) or the parent element's (for `NfsFlexChild`) computed `display`, and their class lists/attributes for the Flex-parent-directive name check.

Rule as documented usage: Put `nfsFlexAlign` only on an element that is, or will become, a Flex parent; put `nfsFlexChild` only inside one.

Mentions: user story 29, line 62.

Boundary call: `NfsFlexAlign`'s half of this check reads only its own host (misuse-like), while `NfsFlexChild`'s half reads its parent element (family-like). Classified `family` by the order rule, because the two are described as one numbered check ("check 2") under one warning and the parent-reading half is the one the check's own text foregrounds ("which directive makes the element a Flex parent").

### misuse: Central alignment combined

Location: "### API" section, Development-mode checks, item 3, line 194.

Text:

````
3. Central alignment combined (D4), on every run: `alignCenterMiddle` with `alignX` or `alignY` set warns once: ".align-center-middle overrides alignX and alignY; bind one or the other".
````

Tests and stories: Browser-level test, line 353: "`alignCenterMiddle` with `alignY` warns once; alone it does not."

Needs: none beyond the directive's own three inputs.

Rule as documented usage: Bind `alignCenterMiddle` alone, or `alignX`/`alignY` alone, never both.

Mentions: user story 11, line 44.

### misuse: The Menu's names on a menu

Location: "### API" section, Development-mode checks, item 4, line 195; Design decision D7, line 407.

Text:

````
4. The Menu's names on a menu (D7), on every run: `NfsFlexAlign` warns once when `alignX` is `left`, `right`, or `center` and its host carries `.menu` after render: "nfsFlexAlign: on a menu, alignX="right" is the Menu's align="right"; bind it on nfsMenu, which owns .align-left, .align-right, and .align-center there". `justify`, `spaced`, `alignY`, and `alignCenterMiddle` stay available on a menu.
````

Tests and stories: Browser-level test, line 354: "`nfsFlexAlign alignX="right"` on an element carrying `.menu` warns once naming the Menu's `align`; `alignX="spaced"` and `alignY="middle"` there do not."

Needs: the host's own class list (`.menu`), read after render.

Rule as documented usage: On a menu, bind the Menu's own `align` input for `left`, `right`, and `center`, not `nfsFlexAlign`'s `alignX`.

Mentions: user story 30, line 63; Out of Scope, line 385 ("`nfsFlexAlign` warns when asked for them on a menu (D7)").

### family: Visual order versus DOM order

Location: "### API" section, Development-mode checks, item 5, line 196; Design decision D10, line 410; WCAG table, row 2.4.3, line 242.

Text:

````
5. Visual order (D10), on every run and again whenever `NfsMediaQuery.current()` changes: `NfsFlexChild` while `order` is bound checks its parent element, and `NfsFlexContainer` while `direction` holds a reverse value in any form checks its host. The check runs only when the container's computed `display` is `flex` or `inline-flex`. Its flex items are the container's element children whose computed `display` is not `none` and whose `position` is not `absolute` or `fixed`; their visual sequence is the DOM sequence stably sorted by computed `order` and reversed when the computed `flex-direction` ends in `-reverse`, the order-modified document order of CSS Flexbox... Among the items that are or contain an element CDK's `InteractivityChecker` reports focusable and tabbable, a visual sequence that differs from the DOM sequence warns once per container and distinct sequence, naming the breakpoint and both sequences: "nfsFlexChild: at the small breakpoint the items of <div class="grid-x ..."> that hold focusable content appear in the order 2, 1, but keyboard focus follows the DOM order 1, 2 (WCAG 2.4.3). Write the items in the order they are read and shown, or reorder only items without focusable content." One focusable item, or none, never warns.
````

````
2.4.3 Focus Order | Focus order follows the DOM order, and so does the reading order; the visual order matches it wherever items hold focusable content. `NfsFlexChild` and `NfsFlexContainer` report in development every Flex parent whose focusable items are shown in another sequence than the DOM's, at the breakpoint the page is at (D10); the stories keep focusable content out of reordered items
````

Tests and stories: Browser-level test, line 355: "two ordered items holding a button each, shown in reverse, warn once, naming the breakpoint and both sequences; the same after a re-render does not warn again; a breakpoint change to one where the order matches the DOM stays silent, and back again does not repeat the report; one item with a button and one with text only stay silent; three items with equal `order` values keep DOM order and stay silent; a `direction="row-reverse"` container of three buttons warns from `NfsFlexContainer`; `{small: 'column', large: 'column-reverse'}` warns only at `large`; an item with `position: absolute` or `display: none` is left out; a grid parent is not checked."; Story `flexbox-utilities--source-ordering`, line 342 ("no reordered cell holds a focusable element; a `console.warn` spy records nothing").

Needs: CDK's `InteractivityChecker`, `NfsMediaQuery.current()`; the container's element children (for `NfsFlexContainer`) or the parent's children (for `NfsFlexChild`), and their computed `display`, `position`, `order`, and `flex-direction`.

Rule as documented usage: Write content in the order it is read, and use `order` or a reverse `direction` only to rearrange items that hold no focusable content, or whose focusable siblings stay in reading order (WCAG 1.3.2, 2.4.3).

Mentions: user stories 26-28, lines 59-61; WCAG table, row 1.3.2, line 241.

### runtime: Flexbox Utilities Variant check

Location: "### API" section, "Runtime check" paragraph, line 197.

Text:

````
Runtime check: in the same read phase, through the handle of `nfsVariantCheck('nfsFlexContainer')` or `nfsVariantCheck('nfsFlexChild')`. A directive of this family calls `include()` only while a value that reads a Variant property is bound... Then it calls `include('nfs-flexbox-utilities', ['flex-source-ordering-count'])` and `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, and `value()` per bound input with the needs from the same mapping that sets its classes... `strictVariantNames` then reports an order above the compiled count, a breakpoint the compiled Class breakpoints lack, and a responsive helper while `--nfs-flexbox-responsive-breakpoints` is empty, naming `$flexbox-responsive-breakpoints`; `strictVariantProperties` reports a missing `@include nfs-flexbox-utilities;` or `@include nfs-breakpoint-properties;`. `NfsFlexAlign` has only closed families, reads no Variant property, and makes no call.
````

Tests and stories: Browser-level test, line 357: "with `--nfs-flex-source-ordering-count: 6`, `--nfs-flexbox-responsive-breakpoints: medium large`, and `--nfs-breakpoint-classes: small medium large` on the test document, `order="6"` and `{medium: 'row'}` are silent; `order` 7 through a cast reports `strictVariantNames` once, naming `nfsFlexChild`, `order`, and `$flex-source-ordering-count`; `{xlarge: 2}` through a cast reports naming `$breakpoint-classes`; with an empty `--nfs-flexbox-responsive-breakpoints`, `{medium: 'row'}` reports naming `$flexbox-responsive-breakpoints`, while a bare `direction="row"` stays silent; ... `NfsFlexAlign` never reports."

Needs: `--nfs-flex-source-ordering-count`, `--nfs-flexbox-responsive-breakpoints`, written by `nfs-flexbox-utilities` (Sass subsection, item 6, line 517); `--nfs-breakpoint-classes`, written by `nfs-breakpoint-properties`.

Rule as documented usage: none -- the check detects drift between bound order/responsive values and `$flex-source-ordering-count`, `$flexbox-responsive-breakpoints`, and `$breakpoint-classes`.

Mentions: user stories 18-20, lines 51-53; user story 24-25, lines 57-58.

### Kept (not a check)

- `direction`, `alignX`, `alignY`, `alignSelf`, `order`, and `nfsFlexContainer`/`nfsFlexChild`'s selector-named values, and their compile errors: "### API" section, lines 141-190; user stories 21, line 54.
- ARIA and keyboard: the family adds no role, name, or state; keyboard follows the DOM order natively: "### ARIA and keyboard" section, lines 219-233.
- The `nfs-flexbox-utilities` mixin has no CSS rules, only two Variant properties (`--nfs-flex-source-ordering-count`, `--nfs-flexbox-responsive-breakpoints`): Sass subsection, item 1, line 512.
- The library's own tests: "## Testing Decisions" section as a whole, lines 326-343.

## Counts

Per kind:

- `forgotten-import`: 6 (card 1, drilldown-menu 1, dropdown-menu 1, equalizer 1, flex-grid 1, flexbox-utilities 1)
- `family`: 12 (drilldown-menu 4, dropdown-menu 1, dropdown 2, flex-grid 3, flexbox-utilities 2)
- `misuse`: 18 (callout 1, close-button 3, drilldown-menu 3, dropdown 6, flex-grid 2, flexbox-utilities 3)
- `runtime`: 5 (callout 1, close-button 1, dropdown 1, flex-grid 1, flexbox-utilities 1)
- `build-time`: 12 (callout 1, card 1, close-button 1, drilldown-menu 3, dropdown-menu 5, dropdown 1)

Total checks: 53.

Per file:

- `callout.md`: 3 (misuse 1, runtime 1, build-time 1)
- `card.md`: 2 (forgotten-import 1, build-time 1)
- `close-button.md`: 5 (misuse 3, runtime 1, build-time 1)
- `drilldown-menu.md`: 11 (forgotten-import 1, family 4, misuse 3, build-time 3)
- `dropdown-menu.md`: 7 (forgotten-import 1, family 1, build-time 5)
- `dropdown.md`: 10 (misuse 6, family 2, runtime 1, build-time 1)
- `equalizer.md`: 1 (forgotten-import 1)
- `flex-grid.md`: 7 (forgotten-import 1, misuse 2, family 3, runtime 1)
- `flexbox-utilities.md`: 7 (forgotten-import 1, misuse 3, family 2, runtime 1)

## Boundary calls

1. `drilldown-menu.md`, back item content and placement (development-mode check 3): bundles "outside any submenu" (family: reads the item's ancestor submenu) with "without a button child" and "with a button that has no accessible name" (misuse: reads only the back item's own content). Classified `family` by the order rule (family precedes misuse).
2. `flexbox-utilities.md`, "Not in a Flex parent" (development-mode check 2): `NfsFlexAlign`'s half reads only its own host (misuse-like); `NfsFlexChild`'s half reads its parent element (family-like). Classified `family` by the order rule, and because the check's own message foregrounds the parent-reading half.
3. `dropdown.md`, Trigger registration and order (development-mode check 3): reads the pane's registered-Triggers collection, populated by a different spec's directives (the shared Triggers utility) rather than the pane's own host/input/content. Classified `family` (a registration check, the ruling's own example), even though the Triggers are not "the same family" in the sense of one component's own parts.
4. `dropdown.md`, `parentClass` names no ancestor (check 4) versus pane inside a Button Group (check 8): both walk the DOM beyond the pane's own host, yet check 4 validates the pane's own input value against the page (classified `misuse`, "a value it cannot use") while check 8 enforces a fixed compositional placement rule unrelated to any input (classified `family`, a DOM-only placement check). Recorded here because the two could otherwise be read the same way.
5. `dropdown-menu.md`, Top Bar right-hand-section walk (D9): the check's own text (D22) assigns its implementation to the Nested menu shared utility's root ("The root has no development check of its own... The projected right-hand section's warning is the Nested menu root's"), a file outside this group's assignment. It is extracted here because dropdown-menu.md documents the full design (D9, the development-checks paragraph, user story 11, the Rendered HTML example) as this spec's own amendment; classified `family` (a DOM-only placement check).
