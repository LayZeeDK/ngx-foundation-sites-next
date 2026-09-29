# Checks extraction: group shared

Ticket: 159 (Task: extract the checks from the specs), serving the ruling at
issues/158-decide-checks-move-to-a-later-milestone.md.

Group: shared documents. Files read as committed at commit `ba07780`, branch
`wayfinder`:

- `building-blocks.md`
- `architecture-guide.md`
- `CONTEXT.md`
- `storybook-conventions.md`
- `adr/0012-sass-packaging.md`
- `adr/0039-directives-manage-every-foundation-class.md`
- `adr/0040-variant-input-types.md`
- `adr/0044-utility-directive-rule.md`
- `adr/0046-forgotten-imports-caught-by-checks.md`

Classification rule (source: issues/158, "Decision" item 1, and
issues/159 "How to work it"):

- `forgotten-import`: ADR 0046's four checks (In-family checks with their
  parent checks, child probes, and out-of-reach report M4; `strictDirectiveImports`;
  `strictParents`; the static `missing-imports` builder), plus `nfsDirectiveCheck`
  calls, the host record, the Selector manifest, the development-only token
  descriptions (M7), and `nfsReportForgottenPeer`.
- `family`: a family's own development check that reads another part of its
  family (its parent, a child, or a peer): registration checks, DOM-only
  placement checks, order checks, and the outside-the-parent warnings of
  building-blocks 1.9.
- `misuse`: a directive's own development warning that reads only its host,
  its inputs, its content, or the page.
- `runtime`: ADR 0040's Runtime checks (a Variant value with no class in the
  compiled CSS, missing Variant properties, Breakpoint drift),
  `provideNfsRuntimeChecks`, `provideNfsProductionRuntimeChecks`, and the
  `NfsRuntimeChecks` keys.
- `build-time`: the Library mixins' `@error` and `@warn` checks (contrast,
  registry, and name checks, and presence markers read only by a check), and
  the Variant declaration tooling's check mode (the CI sync check and its
  messages).

A check that fits two kinds by its wording goes to the kind of what it reads,
by the order above (forgotten-import first); each boundary call made below is
recorded in place and repeated in the counts section at the end.

Method note on scale: `building-blocks.md`'s Tables A, B, and D (22 plugin
rows plus 17 CSS-only/layout/utility rows) each carry a "development checks"
or "Runtime checks" parenthetical per row. Where a row's parenthetical names
a check already cataloged from Part 1 (sections 1.4, 1.9, 1.10, 1.13) or from
another row's own check entry, it is listed as a Mention under that check
rather than repeated as a new subsection. Where a row's parenthetical names a
check not covered elsewhere, it gets its own subsection. This keeps the
manifest traceable without duplicating near-identical text 39 times.

---

## building-blocks.md

### runtime: Variant-property presence report (`nfsVariantCheck`)

- Location: 1.4 Inputs and outputs, line 77.
- Text:
```
A directive whose Variant inputs read a Variant property reports them through `nfsVariantCheck(directive)` of `ngx-foundation-sites/media-query`: in its own render callback, created only when the handle is not `null`, it calls `include(mixin, settings)` on every run, bound value or not (or, where the property is read only for a value that may stay unbound and its own mixin holds nothing it needs, only while such a value is bound: the Off-canvas `revealOn`, the Top Bar `stackedFor`, the grids' counts), naming only properties its mixin never leaves empty on Foundation's defaults and never a flag-gated one, then `value(input, value, needs)` for each rendered value, with `needs` from the same mapping that sets its classes; the spec names the call as `nfsVariantCheck('<directive>')`, and its missing-property browser-level case sits in a test file of its own, because reads and reports are once per realm ([Spec: Breakpoint service (shared utility)](issues/53-spec-breakpoint-service.md), Runtime checks).
```
- Tests and stories: none in this file; the text names a browser-level test file "of its own" for the missing-property case, to live in the (out-of-scope) Breakpoint service spec.
- Needs: `nfsVariantCheck(directive)` function and its `include`/`value` calls, from `ngx-foundation-sites/media-query`; the Variant properties (`--nfs-<setting>`) each Library mixin writes (1.13, see build-time entries below), which this check alone reads for verification.
- Rule as documented usage: none. This is the mechanism behind `strictVariantProperties`; without it a Variant value with no compiled class renders with no warning.
- Mentions: 1.7 line 126 (`nfsVariantCheck` named as one of the Breakpoint service entry point's Runtime-check exports); 1.13 line 250 (the three runtime checks read "the same properties" this call reports); Table A/B/D rows that name "the Variant check" or "the Runtime checks" per plugin (Dropdown pane 294, Off-canvas 299/328, Menu 351, Top Bar 352, Media Object 357, Table 358, Badge 359, Label 360, Progress Bar 361, Responsive Embed 362, Forms 364, XY Grid 365, Float Grid 366, Flex Grid 367, Prototyping Utilities 368, Flexbox Utilities 369, Visibility Classes 370, Typography Helpers 372) each rely on this same call.

### misuse: Insertion-timing static attribute reported via `HostAttributeToken` (check 6)

- Location: 1.4 Inputs and outputs, line 83.
- Text:
```
3. `insertion`: the browser acts on it when the element is parsed or inserted (`autofocus`). Every such input binds `'[attr.autofocus]': 'null'`, which keeps it out of the server HTML, and hydration's rewrite onto a node already in the document does nothing. ... So where the host can take focus when it is inserted (the Tabs strip, which Aria's roving focus gives `tabindex="-1"`; a Reveal's `dialog` open at its first render), the spec documents the bound form and the Defaults token, and the directive reports a static attribute in development through `HostAttributeToken`, as the Dropdown pane's check 6 does.
```
- Tests and stories: none in this file.
- Needs: `HostAttributeToken` read of the static attribute the input also renders; the Defaults-token alternative the spec must offer beside the bound form.
- Rule as documented usage: a consumer must bind the `insertion`-kind input (never write it as a static attribute) on a host that can take focus when inserted.
- Mentions: line 86 ("A `removed` or `insertion` binding carries a source comment... and the spec's SSR smoke writes the static form and asserts that the attribute is absent" -- ties the check to an SSR test, not itself a dev check).

### misuse: Copied/redundant Foundation or State class reported via `HostAttributeToken` or `Renderer2`-owned equivalent

- Location: 1.4 Inputs and outputs, line 88.
- Text:
```
A Foundation class copied from Foundation's markup that a directive binds dynamically is stripped on server and client, because Angular's styling resolution consults static classes only when every binding for the class is `undefined`; each such directive reads its host's static `class` through `HostAttributeToken` in development builds only and warns once, naming the input to bind ([Spec: Accordion](issues/15-spec-accordion.md), dev check 7). A State class written with `Renderer2` on elements no library directive hosts (1.1) follows the same rule by its own means: Magellan's marker write removes a copied `is-active` from every tracked link and list item outside the Current section, and its development check reads the class before that write ([Spec: Magellan](issues/30-spec-magellan.md), D18). Structural classes written redundantly merge with the directive's static `host` class and are not reported. ... A Foundation class that no directive binds but that Foundation's CSS or JavaScript reads on that element is reported the same way, naming what replaces it (the Tooltip's legacy position classes; the Slider Handle's `slider-handle` ... development check 5). A directive whose State classes come only from a measurement, with no input or model that could set them (Sticky), strips a copied State class the same way and does not report it ... ([Spec: Sticky](issues/28-spec-sticky.md), D16). A component whose host binds no class reads the host's static `class` the same way and reports the Foundation classes Foundation's markup put on the plugin's element ... ([Spec: Responsive Accordion Tabs](issues/19-spec-responsive-accordion-tabs.md), dev check 7: a copied `tabs` draws a border around the whole widget). A directive may still read the consumer's own classes (the Toggler's Class mode).
```
- Tests and stories: none in this file; the quoted text names dev-check numbers that live in per-plugin specs (Accordion dev check 7, Magellan D18, Slider development check 5, Sticky D16, Responsive Accordion Tabs dev check 7), out of this sweep's scope.
- Needs: `HostAttributeToken('class')` read in a development-only guard; for the `Renderer2` variant, a pre-write read of the current class list.
- Rule as documented usage: a consumer must not write a Foundation or library class in markup; the directive binds every class itself, and a copy in markup is simply overridden/removed with no report.
- Mentions: list of specs affected, same line 88 ("The specs that read a static Foundation class today apply this in their re-runs: ... Nested menu's `is-active` seed ... Toggler's `is-hidden` ... Slider's `vertical` and `disabled` ... Tooltip's legacy position classes ... Off-canvas position classes ... Button's `.submit` marker"); Table A rows for Orbit (300, `HostAttributeToken('class')` for a copied `is-active`), Button (311, "HostAttributeToken('class') in development builds only, for the copied-class warning"), Slider (305, "HostAttributeToken('class') in development builds only (copied classes)"); Table D rows for Button Group (348), Close Button (349), Switch (350), Menu (351), Top Bar (352), Pagination (353), Breadcrumbs (354), Callout (355), Card (356, "nothing injected" -- no copy check), Media Object (357), Table (358), Badge (359), Label (360), Progress Bar (361), Responsive Embed (362), Thumbnail (363), Forms (364), XY Grid (365, "copied classes reported, not stripped"), Float Grid (366), Flex Grid (367), Prototyping Utilities (368), Flexbox Utilities (369), Visibility Classes (370), Float Classes (371), Typography Helpers (372) -- every one of these rows' "development checks" parenthetical includes a copied-classes item that is this same check.
- Boundary call: the `Renderer2`-owned variant (Magellan, the Off-canvas `body` class, the Reveal `html` Scroll lock class) reads only the directive's own state and the element it itself will write to, so it stays `misuse`, not `family`, even though the element is sometimes outside the directive's own host.

### family: Optional parent injection warns when the part may stand alone

- Location: 1.9 DI patterns, line 139.
- Text:
```
Parent handle: `InjectionToken<Parent>` in `<plugin>-tokens.ts` with `import type`, parent `providers: [{provide: nfsXToken, useExisting: NfsX}]`, child `inject(nfsXToken)` required when the child cannot exist alone (accordion title inside an item), `{optional: true}` with a dev-mode `reportViolations`-style warning when the child may stand alone (menu item outside a menu root). Nested containers re-provide the token as `undefined` (`CdkAccordionItem` pattern) so grandchildren do not register upward (Equalizer needs no `undefined` provider: a nested container providing its own token already shadows the outer one).
```
- Tests and stories: none in this file.
- Needs: the parent `InjectionToken`, the optional injection with a `reportViolations`-style warning helper.
- Rule as documented usage: a part that may stand alone without its parent works undecorated outside it; a part that cannot stand alone requires the parent (NG0201 is the report, kept, see ADR 0046 Consequences).
- Mentions: architecture-guide.md P4 (restates this rule) and P23 (cites "a child outside a parent it may stand without (optional injection)"); ADR 0046 line 12 (`strictParents` makes this same optional injection throw in development, forgotten-import kind, see below); Table D Button Group row 348 ("a development-only `contentChildren(NfsButton)`... for five warnings").

### family: DOM-walk ancestry/placement check after hydration, reported once in development

- Location: 1.9 DI patterns, line 142.
- Text:
```
Ancestry that projection can hide (2026-09-28, [Re-run: Dropdown Menu spec under the class rule](issues/113-rerun-dropdown-menu-class-rule.md)): a directive that must know at first paint that it sits inside another library element injects that element's lightweight token optionally at construction, which is right on the server for everything declared inside it. Where content projection from another template can hide the provider (DI follows the declaration site), it may walk the DOM once in its first render callback, only when the token is absent, and reports that case in development builds, because the state it fixes changes at hydration: the Nested menu root and `nfsTopBarRightToken`. A check that only reports placement reads the DOM alone (the Top Bar's section check, its D13).
```
- Tests and stories: none in this file (D13 lives in the Top Bar spec, out of scope).
- Needs: the lightweight token, a first-render-callback `MutationObserver`/DOM walk guarded by "only when the token is absent" and a development-only report.
- Rule as documented usage: a consumer must declare the projected part where the parent's token can reach it (for example, inside the Top Bar's right-hand section) for the correct side/placement to hold from first paint; declaring it elsewhere is read at hydration instead.
- Mentions: Table B DropdownMenu row 324 ("a menu projected into the right-hand section, which DI cannot see, is read from the DOM after hydration with a development warning"); Table D Top Bar row 352 ("sections outside their bars"); architecture-guide.md P4 line 90 (restates the walk-once-when-absent rule and adds "A lookup that exists only in development builds, for a placement warning, may inject the parent's class instead of a token where both sit in one entry point... (Menu D9; the Breadcrumbs and Pagination items)").

### forgotten-import: `nfsDirectiveCheck`, host record, `strictDirectiveImports`, In-family checks, `strictParents`, template-outlet for projected parts

- Location: 1.9 DI patterns, line 143.
- Text:
```
Forgotten imports (2026-09-28, [ADR 0046](adr/0046-forgotten-imports-caught-by-checks.md), [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md)): entry points export their directive classes and no import arrays. Every library directive and component with an attribute selector calls `nfsDirectiveCheck('<Class>', family?)` from `ngx-foundation-sites/media-query` once, from its constructor, inside an inline `if (typeof ngDevMode === 'undefined' || ngDevMode)` block (a hoisted guard kept the checks in production bundles); the call records its host for the `strictDirectiveImports` Runtime check and runs its In-family checks. A part whose parent injection is optional passes the directives that provide or host its parent and whether the injection found one, and a part with children passes the child directives it probes; each family spec lists these per part by that spec's rule. A required parent injection needs no parent check, because NG0201 is the report, and every parent token's description names, in development builds only, the directive that provides it, its entry point, and the same-template rule (`typeof ngDevMode === 'undefined' || ngDevMode ? "nfsAccordionToken (provided by NfsAccordion from 'ngx-foundation-sites/accordion' on an ancestor element declared in the same template)" : ''`). Under the opt-in `strictParents` flag, a part in that spec's table throws at construction in development builds when its optional parent injection found nothing; a part that a component projects into its parent from another template renders there through a template outlet with the parent element's injector (`viewChild(Parent, {read: Injector})` and `ngTemplateOutletInjector`, measured with Angular 22.2.0), which the required injections need already.
```
- Tests and stories: none in this file.
- Needs: `nfsDirectiveCheck` from `ngx-foundation-sites/media-query`; the `ngDevMode` inline guard; the token's development-only description string (the "M7" token description); the template-outlet pattern for projected parts under `strictParents`.
- Rule as documented usage: none for a consumer (a forgotten import silently renders without the directive's classes, ARIA, and behaviour; the spec states the library accepts this in the first milestone, per issues/158 Decision item 2).
- Mentions: 1.3 line 56 (nothing); Table A rows for Abide (290, "no DOM lookup"), Orbit (300, "the five class-only directives inject nothing in production"), Reveal/Slider similar phrasing; Table D Close Button (349, "development-mode name and nfsButton checks"), Switch (350), Pagination (353, "a development-only lookup of NfsPagination by class"), Breadcrumbs (354, similarly); Part 3 line 383 bullet 6 and Table C row 398 (the shared-utility definition, see below, which is the fuller mechanism this bullet summarizes).

### family: `contentChildren` used only for dev-mode order validation

- Location: 1.9 DI patterns, line 146.
- Text:
```
Ordered children: parent-owned registration (`register()` in `ngOnInit`, `unregister()` on destroy) with DOM-order sorting from a `MutationObserver` started in `afterNextRender`, Aria's `SortedCollection` shape, rather than `contentChildren` queries, because it survives `@for`, `@defer`, Lazy content and projection (`R:di` 3c). `contentChildren` is used only for dev-mode validation. A family whose readers need order only at event time or in a render callback (the Nested menu) sorts there with `compareDocumentPosition` and keeps no `MutationObserver`.
```
- Tests and stories: none in this file.
- Needs: a `contentChildren` query used only under a development guard, compared against the `MutationObserver`-derived registration order.
- Rule as documented usage: none (order comes from registration; a consumer's markup order is what the family renders in either way).
- Mentions: none beyond the Location above in this file.

### runtime: `strictBreakpointSync` Breakpoint drift check

- Location: 1.7 Breakpoints, line 125.
- Text:
```
A consumer with a customised Sass `$breakpoints` provides the same values here; the consumer's `@include nfs-breakpoint-properties;` emits the `--nfs-breakpoint-<name>` px custom properties on `:root` from their own `$breakpoints`, and the `strictBreakpointSync` Runtime check reports, in the browser after the first render, when the token and the CSS disagree or when a Class breakpoint in `--nfs-breakpoint-classes` is missing from the token.
```
- Tests and stories: none in this file.
- Needs: `nfsBreakpointsToken` (the JS side of truth) compared against `--nfs-breakpoint-<name>` and `--nfs-breakpoint-classes` custom properties (the Sass side, written by `nfs-breakpoint-properties`, kept, see ADR 0012).
- Rule as documented usage: a consumer who customizes `$breakpoints` must also provide the same values to `nfsBreakpointsToken`, so the two stay equal; without the check, a mismatch is simply silent.
- Mentions: 1.7 line 126 (`provideNfsRuntimeChecks`/`provideNfsProductionRuntimeChecks` hold this check; also `nfsVariantCheck`); CONTEXT.md "Breakpoint properties" glossary entry (line 584, see below).

### build-time: Exact WCAG contrast formula in a compile-time `@error`, never Foundation's approximations

- Location: 1.10 Accessibility baseline, line 158.
- Text:
```
Every axe run names the WCAG 2.2 AA tags, and the story gate is the enforcing check; where axe has no rule, the mixin checks at compile time with the exact WCAG relative-luminance formula, computed by one library-internal Sass helper with `math.pow` that composites a translucent colour over `$body-background` first; a translucent colour painted over an image rather than the page (the Orbit's caption and arrow bands) is composited over `#fff` and over `#000`, the lightest and darkest colours an image can hold, before the helper compares it ([Spec: Orbit](issues/33-spec-orbit.md), D17); never with Foundation's `color-luminance()`, which raises to the power 2.4 through Foundation's approximate `pow()` and `nth-root()` and overstates some ratios ...; and never with Foundation's `color-contrast()`, which rounds to one decimal and would pass a failing pair ... A text colour Foundation picks with `color-pick-contrast()` is checked as Foundation emits it: that function compares ratios from the approximate `color-luminance()`, rounded to one decimal, keeps the first candidate on a tie, and ignores a translucent colour's alpha, so it can pick the failing candidate while the other passes ...; each spec that relies on the pick decides whether its mixin corrects it, as `nfs-badge` and `nfs-label` do, or only checks it, as `nfs-button` does ... A spec quotes a ratio as that exact formula gives it on the colours as painted (8 bits per channel) or as the helper computes it (unrounded channels), writes a failing ratio with enough decimals to stay below its threshold (4.498:1, never 4.50:1), and quotes axe's figures as axe's.
```
- Tests and stories: none in this file; "the story gate is the enforcing check" names the Accessibility gate (kept, story-level axe run, not itself one of the five deferred kinds).
- Needs: one library-internal Sass helper computing the exact relative-luminance/contrast formula with `math.pow`, used by every per-component `@error` below.
- Rule as documented usage: a consumer's colour settings must reach the stated ratio; where axe cannot see it, the spec states the required Sass setting so the consumer's compile does not fail (the compile-time check is what enforced this and is deferred; the underlying settings the spec must still state as documented usage).
- Mentions: this is the umbrella rule every per-component build-time entry below (nfs-button, nfs-forms, nfs-abide, nfs-close-button, nfs-top-bar family, nfs-button-group, nfs-callout, nfs-progress-bar, nfs-pagination, nfs-breadcrumbs, nfs-switch, nfs-badge, nfs-card, nfs-label, nfs-table, nfs-typography-helpers/base) relies on.

### misuse: Accessible-name development check reading content per accessible-name computation

- Location: 1.10 Accessibility baseline, line 162.
- Text:
```
A development check that reads a name or text from content (the host's, a referenced element's, a `label`'s, a `legend`'s, a `caption`'s) reads it as accessible-name computation does: text outside `aria-hidden="true"` subtrees, visually hidden text included, and an embedded image's text alternative, the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"`, so it never reports a name or text that assistive technology has (the [Spec: Thumbnail](issues/97-spec-thumbnail.md)'s check 2; Chromium and Firefox name a group from an image-only `legend`'s `alt`, measured by the [Re-run: Switch spec, out-of-scope survivors](issues/147-rerun-switch-out-of-scope-survivors.md); 2026-09-29, [Consistency review: the class-rule wave](issues/133-consistency-review-class-rule-wave.md)).
```
- Tests and stories: none in this file.
- Needs: an accessible-name-computation-compatible text reader (walks content outside `aria-hidden` subtrees, includes visually hidden text and image alt text).
- Rule as documented usage: a name input exists only where the consumer cannot reach the named element; otherwise the consumer's own content (`aria-labelledby`/`aria-label`/`alt`) is the name, per line 162's opening sentence (kept, restated elsewhere as documented usage, not itself the check).
- Mentions: Table D rows whose "development checks" list a name check (Close Button 349, Switch 350, Top Bar 352, Pagination 353, Breadcrumbs 354, Badge 359, Label 360, Progress Bar 361, Thumbnail 363, Forms 364); 1.10 line 172 (Close Button "development-mode name" check, same mechanism).

### build-time: Target-size floor and non-text-contrast `@error`, general rule

- Location: 1.10 Accessibility baseline, line 168.
- Text:
```
Target size and non-text contrast (WCAG 2.2 AA 2.5.8, 1.4.11) are guaranteed by the Library mixin where Foundation's settings can fail them: a `max(24px, <setting>)` floor or a compile-time `@error` on sizes (the menu mixins stop the compile on toggle sizes and row heights; wording amended 2026-09-26 from audit 0005, unrecorded departure 7), and a compile-time `@error` computed with the exact unrounded ratio (the WCAG contrast rule above) for colour pairs that carry state; axe-core 4.13.0, the version the Storybook conventions pin, has no 1.4.11 rule, so the story gate does not cover it. A plugin whose only custom Sass is such a check still gets a Library mixin that emits no CSS (Abide's `nfs-abide`, added by the [Consistency review and bundle index](issues/36-consistency-review.md)).
```
- Tests and stories: none in this file.
- Needs: nothing beyond the per-component mixins below; this is the general rule they follow.
- Rule as documented usage: a Foundation control smaller than 24 by 24 CSS px is not guaranteed by Foundation alone; the spec states the Sass floor as CSS the consumer's compile applies (kept: the CSS floor itself, e.g. `min-width: 24px`, is not a check and stays; only the `@error` that stops a bad compile is deferred).
- Mentions: every per-component build-time entry below.

### build-time: `nfs-button` contrast and size `@error`

- Location: 1.10 Accessibility baseline, line 169.
- Text:
```
Button ([Spec: Button](issues/37-spec-button.md), WCAG 2.2 AA revision): the `nfs-button` Library mixin emits `.button { min-width: 24px; min-height: 24px; }` for 2.5.8 ...; the consumer must set `$button-palette: map-merge($foundation-palette, ('alert': #bf3f2c, 'success': #177a3d, 'warning': #8a5a00));` for 1.4.3 and 1.4.11 ...; `nfs-button`'s compile-time checks compare the exact unrounded ratio, because `color-contrast()` rounds to one decimal and passes 4.498:1 as 4.5. Under `$button-fill: hollow` the mixin also emits `.button.dropdown.solid::after { border-top-color: $white; }` for 1.4.11 ...
```
- Needs: `$button-palette` settings named above; the exact-ratio helper (line 158).
- Rule as documented usage: the consumer must set `$button-palette` as quoted, for 1.4.3 and 1.4.11 compliance; the floor and arrow-colour CSS rules stay (kept), only the compile-time verification is deferred.
- Mentions: Table A Button row 311 (`HostAttributeToken` copy check, separately cataloged as misuse above).

### build-time: `nfs-forms`, Switch, and Slider focus-ring contrast `@error`

- Location: 1.10 Accessibility baseline, line 170.
- Text:
```
Forms ([Spec: Forms](issues/98-spec-forms.md)): a select menu and a colour input have no text caret, so their focus indicator is `$input-border-focus`, which must reach 3:1 against the page and the focus background and 3:1 from the resting `$input-border`; the consumer must set `$input-placeholder-color: #737373;` (1.4.3), `$input-border: 1px solid $dark-gray;` (1.4.11), and `$input-border-focus: 1px solid $black;` (1.4.11, 1.4.1, 2.4.7) ...; the checks-only `nfs-forms` mixin stops the compile on each with the exact unrounded ratio. ... The Switch's and the Slider's focus rings, which their Library mixins draw because Foundation hides or removes the native one, take the same setting (`outline: $input-border-focus`), and each mixin stops the compile when its colour is under 3:1 against `$body-background`.
```
- Needs: the three `$input-*` settings named above.
- Rule as documented usage: the consumer must set `$input-placeholder-color`, `$input-border`, and `$input-border-focus` as quoted.
- Mentions: none beyond the Location above in this file.

### build-time: `nfs-abide` invalid-state contrast `@error`

- Location: 1.10 Accessibility baseline, line 171.
- Text:
```
Abide ([Spec: Abide](issues/31-spec-abide.md)): `nfs-abide` checks only the invalid state, each with `@error`: `$input-error-color` and `$form-label-color-invalid` at 4.5:1 on the page, `$input-background-invalid` at 4.5:1 on its 10% tint and 3:1 on the page, and the `$input-border-focus` colour at 3:1 from `$input-background-invalid`, because Foundation's `form-input-error` applies only while the field is not focused, so a focused invalid select shows the focus border in place of the invalid one (3.74:1 with the required `$input-border-focus: 1px solid $black`, 1.31:1 on Foundation's defaults). The resting field's checks are `nfs-forms`'s, and an Abide form includes both mixins.
```
- Needs: `$input-error-color`, `$form-label-color-invalid`, `$input-background-invalid`, `$input-border-focus`.
- Rule as documented usage: the consumer's invalid-state settings must reach the stated ratios; an Abide form includes both `nfs-forms` and `nfs-abide`.
- Mentions: none beyond the Location above in this file.

### build-time: `nfs-close-button` size floor and contrast `@error`

- Location: 1.10 Accessibility baseline, line 172.
- Text:
```
Close Button ([Spec: Close Button](issues/83-spec-close-button.md)): the `nfs-close-button` Library mixin emits `.close-button { min-width: 24px; min-height: 24px; }` for 2.5.8 on every close button ...; It stops the compile with `@error` when `$closebutton-color` or `$closebutton-color-hover` is under 3:1 against `$body-background`, and every spec whose container paints its own background under a close button checks the same two settings against that background (Reveal, Off-canvas, Callout), because axe marks the glyph's contrast incomplete.
```
- Needs: `$closebutton-color`, `$closebutton-color-hover`; per-container backgrounds (Reveal, Off-canvas, Callout) checked against the same two settings.
- Rule as documented usage: the consumer must set `$closebutton-color`/`$closebutton-color-hover` at 3:1 against every background a close button sits on.
- Mentions: Table D Close Button row 349 ("nfs-close-button (a 24 px box floor on every .close-button, --nfs-closebutton-size, and a 3:1 @error against $body-background)").

### build-time: `nfs-menu-icon` / `nfs-title-bar` / `nfs-top-bar` checks

- Location: 1.10 Accessibility baseline, line 173.
- Text:
```
Top Bar, Title Bar, and Menu icon ([Spec: Top Bar](issues/86-spec-top-bar.md)): the `nfs-menu-icon` Library mixin emits the menu icon's border box (2.5.8, the Target size bullet), draws the bars again under forced colours ..., and warns when the dark icon's `$black` or `$dark-gray` is under 3:1 against `$body-background`; the checks-only `nfs-title-bar` stops the compile when `$titlebar-color` is under 4.5:1, or `$titlebar-icon-color` or `$titlebar-icon-color-hover` under 3:1, against `$titlebar-background`; the checks-only `nfs-top-bar` stops the compile when `$anchor-color` is under 4.5:1 or `$menu-item-background-active` under 3:1 against `$topbar-background` and, where it differs, `$topbar-submenu-background`. The consumer must set a `$topbar-background` on which `$anchor-color` reaches 4.5:1 ..., and, when that override follows the import of Foundation's settings file, `$topbar-submenu-background: $topbar-background;`.
```
- Needs: `$black`/`$dark-gray` (menu icon warn), `$titlebar-color`, `$titlebar-icon-color`, `$titlebar-icon-color-hover`, `$topbar-background`, `$anchor-color`, `$menu-item-background-active`, `$topbar-submenu-background`.
- Rule as documented usage: the consumer must set `$topbar-background` (for example `$white`) and repeat `$topbar-submenu-background` after it.
- Mentions: Table D Top Bar row 352 ("three Library mixins: nfs-menu-icon..., checks-only nfs-title-bar and nfs-top-bar").
- Boundary call: the menu-icon `@warn` on `$black`/`$dark-gray` and the forced-colours redraw are the same mixin's build-time entries; the forced-colours redraw itself (line 181, see below) is a CSS technique, kept, not a check.

### build-time: `nfs-button-group` arrow-contrast and floor `@error`

- Location: 1.10 Accessibility baseline, line 174.
- Text:
```
Button Group ([Spec: Button Group](issues/82-spec-button-group.md)): the `nfs-button-group` Library mixin colours the dropdown arrows of hollow and clear groups with `currentColor` and, under `$button-fill: hollow`, those of solid groups with `$white` (1.4.11 ...), and raises the floor of every button but the last in a `.no-gaps` group to `calc(24px + rem-calc($button-hollow-border-width))` (2.5.8 ...). Every label and arrow pair in a group is a Button pair, so `nfs-button`'s compile-time checks cover the group.
```
- Needs: `$button-fill`, `$button-hollow-border-width`; reuses `nfs-button`'s checks.
- Rule as documented usage: none beyond `nfs-button`'s (this bullet is CSS colouring plus a floor, not a separate `@error`; the compile-time coverage is `nfs-button`'s).
- Mentions: Table D Button Group row 348.
- Boundary call: this bullet names no `@error`/`@warn` of its own (only CSS colour rules and a floor), so it is closer to "kept CSS" than a distinct build-time check; listed here because 1.10's umbrella sentence (line 168) counts it among the guaranteed-by-mixin set, but the deferred check content is `nfs-button`'s, already cataloged above.

### build-time: `nfs-callout` contrast `@error`

- Location: 1.10 Accessibility baseline, line 175.
- Text:
```
Callout ([Spec: Callout](issues/89-spec-callout.md)): `nfs-callout` stops the compile when the callout's text or a link (`$anchor-color`, `$anchor-color-hover`) is under 4.5:1, or a close-button glyph under 3:1, on any callout background (`$callout-background` and each `$foundation-palette` colour through `scale-color` by `$callout-background-fade`). The consumer must set `$anchor-color: scale-color($primary-color, $lightness: -15%);` ... and `$closebutton-color: #767676;` ...
```
- Needs: `$anchor-color`, `$anchor-color-hover`, `$closebutton-color`, `$callout-background`, `$callout-background-fade`, `$foundation-palette`.
- Rule as documented usage: the consumer must set `$anchor-color` and `$closebutton-color` as quoted.
- Mentions: Table D Callout row 355.

### build-time: `nfs-progress-bar` meter-text contrast `@error`

- Location: 1.10 Accessibility baseline, line 176.
- Text:
```
Progress Bar ([Spec: Progress Bar](issues/95-spec-progress-bar.md)): ... `nfs-progress-bar` gives the meter text `$black` wherever it contrasts more than Foundation's fixed `$white` (success and warning), stops the compile when a fill leaves the meter text under 4.5:1, and needs `$foundation-palette: map-merge($foundation-palette, (alert: #bf3f2c));` on Foundation's defaults ...
```
- Needs: `$foundation-palette`.
- Rule as documented usage: the consumer must set `$foundation-palette`'s `alert` entry as quoted; every progress bar, native progress element, and meter must show its value as visible text (kept, a WCAG requirement stated regardless of the check).
- Mentions: Table D Progress Bar row 361.

### misuse: `NfsProgressMeterText` overflow development warning

- Location: 1.10 Accessibility baseline, line 176.
- Text:
```
`NfsProgressMeterText` warns in development when its text is wider than its meter, which axe marks incomplete.
```
- Needs: a measurement of the meter text's rendered width against the meter's.
- Rule as documented usage: none (the failure axe cannot see; deferred with no substitute rule).
- Mentions: none beyond the Location above in this file.

### misuse: `NfsFlexChild`/`NfsFlexContainer` visual-order development report

- Location: 1.10 Accessibility baseline, line 177.
- Text:
```
Flexbox Utilities ([Spec: Flexbox Utilities](issues/103-spec-flexbox-utilities.md)): the DOM order is the reading and focus order. `order` and the reverse `direction` values change only the visual order, so the consumer writes content in its meaningful order and rearranges only its look (1.3.2), a requirement shown in every recipe and asserted by every story; in development builds `NfsFlexChild` and `NfsFlexContainer` report a Flex parent whose items holding focusable content are shown in another sequence than the DOM's at the current breakpoint (2.4.3), predicted from computed `order` and `flex-direction` (measured to match the rendered order in three engines), because axe has no rule for it.
```
- Tests and stories: "asserted by every story" -- a story-level assertion of DOM order matching visual order, kept as a testing requirement, distinct from the dev-mode report itself.
- Needs: computed `order`/`flex-direction` read at the current breakpoint via the Breakpoint service.
- Rule as documented usage: the consumer writes content in its meaningful order and uses `order`/`direction` only to change the look, per 1.3.2 (kept as a stated requirement; only the report that catches a violation is deferred).
- Mentions: Table D Flexbox Utilities row 369 ("the visual-order check for 2.4.3 through CDK InteractivityChecker and NfsMediaQuery.current").

### build-time: `nfs-pagination` size floor and contrast `@error`

- Location: 1.10 Accessibility baseline, line 178.
- Text:
```
Pagination ([Spec: Pagination](issues/87-spec-pagination.md)): ... `nfs-pagination` gives those items Foundation's disabled look through `pagination-item-disabled`, sets `min-width: 24px; min-height: 24px` on every pagination link and button (2.5.8 ...), and stops the compile when item text on the page or on the hover background, the current page's text on its fill, or the ellipsis is under 4.5:1, or the current fill against the page or the disabled against the enabled text colour is under 3:1. No setting is required on Foundation's defaults.
```
- Needs: no consumer settings required on defaults; checks Foundation's own palette values.
- Rule as documented usage: none (passes on Foundation's defaults; the check exists to catch a consumer's own customization).
- Mentions: Table D Pagination row 353.

### build-time: `nfs-breadcrumbs` contrast `@error`

- Location: 1.10 Accessibility baseline, line 179.
- Text:
```
Breadcrumbs ([Spec: Breadcrumbs](issues/88-spec-breadcrumbs.md)): a disabled step is a level without a page, written as text, not a control, so 1.4.3 applies to it: the consumer must set `$breadcrumbs-item-color-disabled: #737373;` ..., and `nfs-breadcrumbs` stops the compile when link, current, or disabled text is under 4.5:1 on the page.
```
- Needs: `$breadcrumbs-item-color-disabled`.
- Rule as documented usage: the consumer must set `$breadcrumbs-item-color-disabled` as quoted.
- Mentions: Table D Breadcrumbs row 354.

### build-time: `nfs-switch` contrast/height `@error` and inner-label `@warn`

- Location: 1.10 Accessibility baseline, line 180.
- Text:
```
Switch ([Spec: Switch](issues/84-spec-switch.md)): ... It stops the compile when a track colour is under 3:1 against `$body-background`, the knob under 3:1 against a track colour, the ring colour under 3:1 against `$body-background`, or a height setting under 24 px, and warns when `$white` inner-label text is under 4.5:1. The consumer must set `$switch-background: #767676;` ... and repeat `$switch-background-focus: scale-color($switch-background, $lightness: -10%);` after it ...
```
- Needs: `$switch-background`, `$switch-background-focus`.
- Rule as documented usage: the consumer must set `$switch-background` and repeat `$switch-background-focus` after it.
- Mentions: Table D Switch row 350.

### build-time: `nfs-badge` text-contrast `@error`

- Location: 1.10 Accessibility baseline, line 182.
- Text:
```
Badge ([Spec: Badge](issues/93-spec-badge.md)): `nfs-badge` stops the compile when a badge's text is under 4.5:1 (`$badge-color` on `$badge-background`, for which Foundation picks nothing, and each `$badge-palette` entry with the better of `$badge-color` and `$badge-color-alt`), and gives an entry the better candidate where Foundation's `color-pick-contrast()` picked the other. The consumer must set `$badge-palette: map-merge($foundation-palette, (alert: #bf3f2c));` ...
```
- Needs: `$badge-palette`.
- Rule as documented usage: the consumer must set `$badge-palette`'s `alert` entry as quoted.
- Mentions: Table D Badge row 359.

### misuse: `NfsBadge` badge-on-a-link development warning

- Location: 1.10 Accessibility baseline, line 182.
- Text:
```
axe marks every one of Foundation's badge examples incomplete or passing, because they are single characters, so the compile-time check is the only one that sees the alert example; a badge is never written on a link, and `NfsBadge` warns in development, as `NfsLabel` does.
```
- Needs: a check that the badge's host (or its ancestor) is not a link.
- Rule as documented usage: a badge must not be written on a link.
- Mentions: none beyond the Location above in this file.

### build-time: `nfs-card` text/link contrast `@error`

- Location: 1.10 Accessibility baseline, line 183.
- Text:
```
Card ([Spec: Card](issues/90-spec-card.md)): `.card` clips with `overflow: hidden`, so a word wider than the card is cut off ...; `nfs-card` sets `overflow-wrap: anywhere` on `.card` ... It stops the compile when `$card-font-color`, `$anchor-color`, or `$anchor-color-hover` is under 4.5:1 on `$card-background` or `$card-divider-background`; on Foundation's defaults a divider link is 3.755:1, and the Callout's required `$anchor-color: scale-color($primary-color, $lightness: -15%);` gives 4.858:1.
```
- Needs: `$card-font-color`, `$anchor-color`, `$anchor-color-hover`, `$card-background`, `$card-divider-background`.
- Rule as documented usage: the `overflow-wrap: anywhere` CSS rule stays (kept); the `@error` over contrast is deferred, so the spec states the consumer must reuse the Callout's `$anchor-color` setting.
- Mentions: Table D Card row 356.

### misuse: `NfsResponsiveEmbed` extra-content-under-embed development report

- Location: 1.10 Accessibility baseline, line 185.
- Text:
```
The only text the box holds is an `<object>`'s fallback, which must be one short sentence with a link (two paragraphs lose 40 px at 320 px under the 1.4.12 spacing); anything else written in the box lies under the embedded element and stays focusable (2.4.11), which the directive reports in development.
```
- Needs: a check for extra content inside `.responsive-embed` beyond the fallback.
- Rule as documented usage: the box's only content beyond the embedded element is an `<object>`'s one-sentence fallback; anything else is a documented misuse with no assistive warning once deferred.
- Mentions: Table D Responsive Embed row 362 ("development name, placement, and copied-class checks in one afterNextRender"); `nfs-responsive-embed`'s `display: flow-root`/`:focus-within` CSS rule (same paragraph) is kept, not a check.

### build-time: `nfs-label` text-contrast `@error`

- Location: 1.10 Accessibility baseline, line 186.
- Text:
```
Label ([Spec: Label](issues/94-spec-label.md)): `nfs-label` has the Badge's checks and pick correction over `$label-color`, `$label-color-alt`, `$label-background`, and `$label-palette`, and needs `$label-palette: map-merge($foundation-palette, (alert: #bf3f2c));` on Foundation's defaults ...
```
- Needs: `$label-color`, `$label-color-alt`, `$label-background`, `$label-palette`.
- Rule as documented usage: the consumer must set `$label-palette`'s `alert` entry as quoted.
- Mentions: Table D Label row 360.

### misuse: `NfsLabel` label-on-a-link development warning

- Location: 1.10 Accessibility baseline, line 186.
- Text:
```
A label is never written on a link: Foundation's `a:hover, a:focus` rule outranks a one-class component colour, so the uncoloured label's text turns `$anchor-color-hover` on hover and focus (1.27:1, measured in three engines, a state axe does not test); `NfsLabel` warns in development and the recipe puts the label inside the link.
```
- Needs: same host-is-a-link check as `NfsBadge`'s.
- Rule as documented usage: a label must not be written directly on a link; the recipe puts the label inside the link instead.
- Mentions: none beyond the Location above in this file.

### misuse: `NfsThumbnail` linked-thumbnail development warning

- Location: 1.10 Accessibility baseline, line 187.
- Text:
```
Thumbnail ([Spec: Thumbnail](issues/97-spec-thumbnail.md)): a linked thumbnail is the link, `a[nfsThumbnail]` around its image ... Written on an image or wrapper inside a plain link, a thumbnail loses that shadow, and Firefox draws the link's focus ring as a 17 px band across the picture ...; `NfsThumbnail` warns in development. A clipping ancestor cuts the ring off where a linked thumbnail touches its edge ...; the recipes keep it inside padding.
```
- Needs: a check of which element (image, link, or wrapper) carries `nfsThumbnail`.
- Rule as documented usage: `.thumbnail` should be written on the link itself for the hover/focus shadow and correct focus ring; the recipe keeps a linked thumbnail inside padding, away from a clipping ancestor's edge.
- Mentions: Table D Thumbnail row 363.

### misuse: Prototyping Utilities development warnings (scroll region, `nfsTextHide`, border utilities)

- Location: 1.10 Accessibility baseline, line 188.
- Text:
```
Prototyping Utilities ([Spec: Prototyping Utilities](issues/102-spec-prototyping-utilities.md)): a region that scrolls holds focusable content or carries `tabindex="0"`, `role="region"`, and a name (2.1.1, 4.1.2; measured ...), and `NfsPrototypeOverflow` warns in development; a `fixed-top` or `fixed-bottom` bar needs `scroll-padding` of its height on the scrolling element (2.4.11), checked as Sticky's is; `nfsTextHide` warns when nothing visible replaces its text (2.4.7, 2.5.8); `nfsBordered` and `nfsBorderNone` warn on form fields, whose 3:1 boundary they undo (1.4.11); ... text that `nfsTextTruncate` or `nfsOverflow="hidden"` clips is available in full where it leads (1.4.10, 1.4.12).
```
- Needs: overflow-region detection (`NfsPrototypeOverflow`); text-replacement detection (`nfsTextHide`); form-field-host detection (`nfsBordered`/`nfsBorderNone`).
- Rule as documented usage: an overflow region must be a named, focusable `region`; `nfsTextHide` must have a visible replacement; `nfsBordered`/`nfsBorderNone` should not be used on form fields; truncated text must be available in full where it leads.
- Mentions: Table D Prototyping Utilities row 368.

### build-time: `nfs-prototyping-utilities` arrow-contrast `@warn`

- Location: 1.10 Accessibility baseline, line 188.
- Text:
```
`nfs-prototyping-utilities` warns when `$prototype-arrow-color` is under 3:1 against `$body-background`;
```
- Needs: `$prototype-arrow-color`.
- Rule as documented usage: the consumer must set `$prototype-arrow-color` at 3:1 against `$body-background`.
- Mentions: Table D Prototyping Utilities row 368 ("a @warn on arrow contrast").

### build-time: `nfs-typography-helpers`/`nfs-typography-base` contrast `@error`

- Location: 1.10 Accessibility baseline, line 189.
- Text:
```
Typography Helpers ([Spec: Typography Helpers](issues/106-spec-typography-helpers.md)): Foundation's `$dark-gray` subheaders, citations, and blockquote text are 3.423:1 and its `$medium-gray` heading `small` text 1.625:1 on the page, which axe fails in three engines, so `nfs-typography-helpers` stops the compile when `$subheader-color` or `$cite-color` is under 4.5:1 against `$body-background` or `$code-color` under 4.5:1 against `$code-background`, and checks-only `nfs-typography-base` does when `$header-small-font-color` or `$blockquote-color` is under 4.5:1 against `$body-background`; the consumer must set all four greys to `#666666` (5.693:1) on Foundation's defaults ...
```
- Needs: `$subheader-color`, `$cite-color`, `$code-color`, `$header-small-font-color`, `$blockquote-color`.
- Rule as documented usage: the consumer must set all four greys to `#666666` on Foundation's defaults, and, inside a container, must reach 4.5:1 on that container's background too (stated in the same line, a requirement the spec keeps regardless of the check).
- Mentions: Table D Typography Helpers row 372.

### misuse: `.code-block` scroll-region development check

- Location: 1.10 Accessibility baseline, line 189.
- Text:
```
A `.code-block` that scrolls carries the Scroll region recipe (`tabindex="0"`, `role="region"`, a name), checked in development (2.1.1, 4.1.2); a list without markers whose item count matters outside a `nav` carries `role="list"`, because WebKit exposes such a list as a group (1.3.1);
```
- Needs: same Scroll region check mechanism as line 191's (Table/XY Grid) entry.
- Rule as documented usage: a scrolling `.code-block` must carry `tabindex="0"`, `role="region"`, and a name; a list without markers whose count matters outside a `nav` carries `role="list"` (kept, a markup rule with no check dependency).
- Mentions: same as the Scroll regions entry below.

### misuse: `NfsFloatClasses` reading-order development warning

- Location: 1.10 Accessibility baseline, line 190.
- Text:
```
Float Classes ([Spec: Float Classes](issues/105-spec-float-classes.md)): a float toward the end of the reading direction reverses the order of the floats it shares a line with (measured in three engines: ...), so floated content is written in reading order and a group of controls at the end of a line is one floated element holding them in that order (1.3.2, 2.4.3); `NfsFloatClasses` warns in development when a float follows a sibling floated toward the end side of the parent's computed `direction` and either holds focusable content.
```
- Needs: the parent's computed `direction`, sibling float-side comparison.
- Rule as documented usage: floated content is written in reading order; a group of controls at a line's end is one floated element holding them in order.
- Mentions: Table D Float Classes row 371 ("a float after a sibling floated toward the end side of the parent's computed direction... a clearfix on a flex or grid container").

### misuse: Scroll-region tab-stop/name development check (XY Grid cell blocks, Table's wrapper/scroll table)

- Location: 1.10 Accessibility baseline, line 191.
- Text:
```
Scroll regions (2026-09-28, [Spec: XY Grid](issues/99-spec-xy-grid.md), [Spec: Table](issues/92-spec-table.md)): a component's scroll container (the XY Grid's cell blocks, the Table's `.table-scroll` wrapper and `scroll` table) is a Scroll region, a tab stop with a role and the consumer's name in the server HTML ... The consumer names a `region` with `aria-labelledby`, at the table's caption or a heading, or with `aria-label`, and a development check reports an unnamed Scroll region.
```
- Needs: presence of `aria-labelledby`/`aria-label` on the scroll container.
- Rule as documented usage: the consumer must name every Scroll region with `aria-labelledby` or `aria-label`; the `tabindex="0"`/`role="region"` bindings themselves stay (kept, they are not checks, they are the directive's own static output).
- Mentions: Table D XY Grid row 365, Table row 358; the `.code-block` entry above (line 189) uses the same recipe.

### build-time: `nfs-table` stacked-header and contrast `@error`

- Location: 1.10 Accessibility baseline, line 192.
- Text:
```
Table ([Spec: Table](issues/92-spec-table.md)): Foundation's stacked table hides its `thead` and `tfoot` below `$table-stack-breakpoint` ..., so `nfs-table` stops the compile unless `$show-header-for-stacked: true` and keeps the footer with one rule ... It also stops the compile when text or a link is under 4.5:1 on any table background: Foundation's links reach only 3.97:1 to 4.45:1 on seven of the eight, so the consumer sets the Callout's `$anchor-color`.
```
- Needs: `$show-header-for-stacked`, `$anchor-color` (shared with Callout).
- Rule as documented usage: the consumer must set `$show-header-for-stacked: true` and reuse the Callout's `$anchor-color` setting.
- Mentions: Table D Table row 358.

### misuse: Visibility Classes development warnings (`nfsShowForSr` tab-stop, `nfsShowOnFocus` paint check)

- Location: 1.10 Accessibility baseline, line 193.
- Text:
```
Visually hidden text (`nfsShowForSr`) never holds a tab stop, which it reports in development (measured in three engines: a focused `.show-for-sr` element is a 1 by 1 px box, 2.4.7, and axe reports nothing), follows a control's visible text (2.5.3), and never replaces a form field's visible label (3.3.2). `nfsShowOnFocus` sits on the focused element itself, which it reports in development (measured: on a wrapper it paints nothing while its link has focus).
```
- Needs: a tab-stop check for `nfsShowForSr`'s host; a "is this the focused element itself" check for `nfsShowOnFocus`.
- Rule as documented usage: `nfsShowForSr` must not sit on a focusable element; `nfsShowOnFocus` must sit on the element that is itself focused, not a wrapper around it.
- Mentions: Table D Visibility Classes row 370.

### misuse: Sticky `scroll-padding` development warning

- Location: 1.10 Accessibility baseline, line 194.
- Text:
```
Elements that can cover content (Sticky): WCAG 2.4.11 is met by required consumer `scroll-padding`, checked by a development warning and an e2e case; 1.4.3 needs an opaque background on a stuck element that overlaps content ...
```
- Tests and stories: "an e2e case" is named for this check, living in the (out-of-scope) Sticky spec.
- Needs: a check that the scrolling ancestor's `scroll-padding` (or `scroll-margin`) covers the sticky element's height.
- Rule as documented usage: the consumer must set `scroll-padding` (of the sticky element's height) on the scrolling element, and give a stuck element that overlaps content an opaque background.
- Mentions: none beyond the Location above in this file.

### build-time: Variant-property one-writer rule and flag-gated presence markers

- Location: 1.13 Sass and theming, line 248.
- Text:
```
Variant properties: each Library mixin of an entry point with an Open Variant family writes on `:root` one `--nfs-<setting>` property per Sass setting its classes loop over, listing the names that generate a class, space-separated, or the count (`--nfs-button-palette: primary secondary success warning alert;`, `--nfs-grid-columns: 12;`). Each property has one writer: an entry point whose Open Variant families loop over another entry point's settings reads that entry point's properties and writes none ..., because an empty property reads like a missing one, so a second writer would keep a property present while the first include is missing and hide it from `strictVariantProperties` ([Spec: Button Group](issues/82-spec-button-group.md), D11). ... A family that a Sass flag gates gets a Variant property of its own, written as the empty list (whitespace only) while the flag is off and read only by the runtime checks; two families that one flag gates in opposite directions share one property listing whichever of their names the compile generates, which is never empty while its mixin is included ...; a flag that only chooses which of two opposite classes exists, where the absent class's look is already the default, needs none ...
```
- Needs: the `--nfs-<setting>` custom properties themselves (the presence markers), written by each Library mixin, read only by `strictVariantProperties`/`nfsVariantCheck`.
- Rule as documented usage: none (this is entirely the deferred check's own plumbing: the properties exist "read only by the runtime checks," per the ticket's build-time definition of "presence markers read only by a check").
- Mentions: 1.4 line 77 (`nfsVariantCheck` reads these); 1.13 line 250 (the runtime checks read "the same properties"); ADR 0012 dated notes (2026-09-27, 2026-09-28) restate this rule in their own words.

### build-time: Variant declaration file sync generator / Architect builder check mode

- Location: 1.13 Sass and theming, line 249.
- Text:
```
The Variant declaration file: the library's tooling reads the Variant properties from a compile of the project's global stylesheet, writes the consumer's `src/nfs-variants.d.ts`, the file that augments the Variant registries, and compares it with the Sass by meaning. It is kept in step by an Nx task sync generator registered on each covered project's own targets, with `nx sync:check` as a required CI step, or on the Angular CLI by the Architect builder behind each project's `nfs-variants` target, whose `check` configuration runs in CI. A shared library whose own programs use names Foundation's defaults lack gets a file of its own. The [Spec: Variant declaration tooling](issues/136-spec-variant-declaration-tooling.md) fixes the commands, options, file format, Variant property format, and messages.
```
- Needs: the Nx task sync generator, its `nx sync:check` CI step, the Angular CLI Architect builder's `check` configuration.
- Rule as documented usage: none for the check mode itself (deferred); the generate mode (writing the file from Sass) is kept, per issues/158 Decision item 3, so a consumer must still run the generator, by hand if the sync/check automation is absent.
- Mentions: ADR 0040 lines 12, 47 (the same rule in ADR 0040's own words, cataloged separately below); Part 3 line 382 (Variant declaration tooling summary, restates "the Nx task sync generator, and the Architect builder... which write the consumer's Variant declaration file from its compiled Sass and check it in CI"); Table C Variant declaration tooling row 397 (names the generator/builder/target names, `ngx-foundation-sites:variant-types-sync`, `ngx-foundation-sites:variant-types`).

### runtime: `strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync` browser checks

- Location: 1.13 Sass and theming, line 250.
- Text:
```
The runtime checks: `strictVariantNames`, `strictVariantProperties`, and `strictBreakpointSync` read the same properties in the browser after the first render. They are on by default in development builds, where a consumer can opt one out, and off in production unless the consumer opts one in. Each property is read and each report made once per realm; library directives report through `nfsVariantCheck`, and a production bundle without `provideNfsProductionRuntimeChecks` carries none of the checker's code (measured under the application builder, [Re-run: Breakpoint service (shared utility) spec under the class rule](issues/129-rerun-breakpoint-service-class-rule.md)).
```
- Needs: the three named checks, `nfsVariantCheck`, `provideNfsProductionRuntimeChecks`.
- Rule as documented usage: none (a Variant value with no compiled class, a missing Variant property, or Breakpoint drift is simply unreported once deferred).
- Mentions: 1.7 line 126; 1.4 line 77; ADR 0040 line 49 (the same three names, plus `strictDirectiveImports`, cataloged there); CONTEXT.md "Runtime check" glossary entry.

### build-time: `nfs-tabs` Variant and contrast compile-time checks

- Location: 1.13 Sass and theming, line 258.
- Text:
```
Tabs has an `nfs-tabs` Library mixin with two Variant rules, a 24 by 24 px minimum for `simple` titles and the selected tab's colours on a `primary` bar, and compile-time contrast checks of every strip's text and selected look and of the `primary` bar's pairs, so every application with a tab strip includes it; ...
```
- Needs: `$tab-background-active`, `$tab-active-color` (named in storybook-conventions.md's settings overrides, see below).
- Rule as documented usage: the consumer must set `$tab-background-active`/`$tab-active-color` for the selected tab's contrast.
- Mentions: 1.10 line 196 (the play-function contrast assertion between selected and unselected tabs, a kept test, not itself the check).

### build-time: `nfs-menu` compile-time checks (1.4.3, 1.4.1, 2.5.8)

- Location: Table D, Menu row, line 351.
- Text:
```
the `nfs-menu` Library mixin: the current link's look from `aria-current` through Foundation's `menu-state-active`, block padding to 24 px rows on simple menus, and compile-time checks for 1.4.3, 1.4.1, and 2.5.8
```
- Needs: Foundation's `menu-state-active` mixin output; row-height/padding settings.
- Rule as documented usage: the current link's look comes from `aria-current`, so no class marks it (kept, restated in the Current page bullet, 1.10 line 163); the row-height and contrast requirements stay stated even once the compile-time enforcement is deferred.
- Mentions: 1.10 line 163 (the "Current page" bullet, which states the `aria-current` rule this mixin implements, largely kept content, not itself a check).

### misuse: Float Grid / Flex Grid geometry development checks

- Location: Table D, Float Grid row 366 and Flex Grid row 367.
- Text:
```
[Float Grid] development checks in render callbacks (copied classes, placement, a stylesheet without the Float Grid's clearfix, and push and pull geometry: focusable columns out of DOM order, a column out of its row or over its neighbour, with `InteractivityChecker` and the Breakpoint service);
```
```
[Flex Grid] development checks in render callbacks (copied classes, a row without the Flex Grid's CSS, placement, a size in an unstacking row) and a development `ResizeObserver` per row (a column that overflows at the current viewport, a nested row that sticks out of a collapsed parent);
```
- Needs: `InteractivityChecker`, the Breakpoint service (Float Grid); a `ResizeObserver` per row (Flex Grid).
- Rule as documented usage: push/pull and column sizing must keep focusable columns in DOM order and inside their row.
- Mentions: none beyond the Location above in this file.

### misuse: Dropdown pane `trapFocus`/`role="dialog"` validation warning

- Location: Table A, Dropdown (pane) row, line 294.
- Text:
```
CDK `FocusTrap` whenever `trapFocus` is on (only valid with `role="dialog"`, else a development warning)
```
- Needs: a check of the pane's `role` input whenever `trapFocus` is bound.
- Rule as documented usage: `trapFocus` is valid only together with `role="dialog"`.
- Mentions: none beyond the Location above in this file.

### misuse: Trigger non-focusable-host and typeless-button-in-form development warnings

- Location: 1.8 Triggers, line 133.
- Text:
```
Triggers must be native `<button type="button">` (or a link when it also navigates); the directive warns in dev mode on a non-focusable host (`R:apg` Toggler delta). Triggers do not bind `type`; a `<button>` Trigger gets `type="button"` from the consumer, from `nfsButton`, from `nfsCloseButton` ..., or from `nfsMenuIcon` ... (confirmed by the Triggers spec, which warns in dev mode on a typeless `<button>` Trigger inside a form).
```
- Needs: a focusability check on the Trigger's host; a `type` attribute check on a `<button>` Trigger inside a `<form>`.
- Rule as documented usage: a Trigger's host must be focusable; a `<button>` Trigger needs an explicit `type` (from the consumer or from `nfsButton`/`nfsCloseButton`/`nfsMenuIcon`) when it sits inside a `<form>`, to avoid the native default submit type.
- Mentions: none beyond the Location above in this file.

### misuse: Deep-link input warns on a generated id

- Location: 1.5 State, reactivity, DOM access, line 106.
- Text:
```
Anything addressed from outside the app (hash deep links, Magellan targets, Reveal `deepLink`) requires a consumer-supplied id; the deep-linking inputs warn in dev mode when the id was generated.
```
- Needs: a check of whether the target element's id came from `_IdGenerator` or from the consumer.
- Rule as documented usage: a consumer who uses a deep-linking input must supply the id itself.
- Mentions: none beyond the Location above in this file.

### misuse: Tooltip interactive-hosts-only development warning

- Location: Part 4, Decided item 2, line 445; also Table B Tooltip row, line 339.
- Text:
```
2. Whether Tooltip may attach to non-interactive text at all (Foundation's focusable `span` with `tabindex`): decided at triage in the [Spec: Tooltip](issues/27-spec-tooltip.md): interactive hosts only, enforced by a development warning. Source: `R:apg` Tooltip delta.
```
```
Interactive hosts only, decided at triage in the [Spec: Tooltip](issues/27-spec-tooltip.md) (development warning).
```
- Needs: a check of whether the Tooltip's host is an interactive element.
- Rule as documented usage: a Tooltip's host must be an interactive element.
- Mentions: none beyond the two Locations above in this file.

### forgotten-import: Shared-utility definition (Selector manifest, `nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, static builder)

- Location: Part 3, lines 383 and 398.
- Text:
```
6. **Forgotten-import checks** (the Selector manifest; `nfsDirectiveCheck` and the In-family checks; the `strictDirectiveImports` Runtime check and the `strictParents` flag in `ngx-foundation-sites/media-query`; the static check, the `ngx-foundation-sites:missing-imports` builder and setup generator behind each project's `nfs-imports` target). Consumers: every library directive and component with an attribute selector (one `nfsDirectiveCheck` call each) and every family spec (its In-family check lines). Decided in ADR 0046; the [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md) fixes the API and the tooling.
```
```
| Forgotten-import checks | `nfsDirectiveCheck(directive, family?)` and `NfsFamilyPeers`; `strictDirectiveImports` and `strictParents` in `NfsRuntimeChecks`; the Selector manifest; the Architect builder and setup generator `ngx-foundation-sites:missing-imports` behind each project's `nfs-imports` target | A development-only function, two Runtime-check keys, and Node workspace tooling; no directive, service, or public token: the checks run from the library's own directives and from CI (ADR 0046) | Custom Angular in development builds only (no Aria or CDK piece reports a forgotten import); Node tooling over TypeScript's public compiler API and `angular-html-parser` | `afterEveryRender`, `MutationObserver` with `takeRecords()`, `Element.closest()` and `matches()`, `ng.getOwningComponent`, `provideEnvironmentInitializer`; TypeScript `createProgram` and the type checker, `angular-html-parser` `parse()`, `createBuilder`, `getTargetOptions`, `convertNxGenerator` | None |
```
- Tests and stories: none in this file.
- Needs: `NfsFamilyPeers`, `NfsRuntimeChecks.strictDirectiveImports`/`strictParents`, `afterEveryRender`, `MutationObserver`, `Element.closest()`/`matches()`, `ng.getOwningComponent`, `provideEnvironmentInitializer`, TypeScript `createProgram`/type checker, `angular-html-parser`, `createBuilder`, `getTargetOptions`, `convertNxGenerator`.
- Rule as documented usage: none (the whole shared utility is deferred, per issues/158 Decision item 1's "keep specs/forgotten-import-checks.md").
- Mentions: 1.9 line 143 (the directive-level mechanism, cataloged above); Table A/B/D rows that name "no DOM lookup," "inject nothing in production," or "a development-only lookup" (Abide 290, Orbit 300, Close Button 349, Switch 350, Pagination 353, Breadcrumbs 354).

---

## architecture-guide.md

### family: Coordination DI, optional injection, and DOM-walk placement check (P4)

- Location: P4 "Coordination is a parent directive with a lightweight token; DI follows the declaration site," lines 88-98.
- Text:
```
Rule: A parent provides an `InjectionToken` typed with `import type` of its class through `useExisting`; a child injects it, required when it cannot exist alone and optional with a development warning when it can; ordered children register with the parent in `ngOnInit` and unregister on destroy, an unordered child may register at construction, and a child linked by a reference input registers from an `effect` with cleanup; order comes from registration, not `contentChildren`; non-nested parts link by template reference or value key. Where projection can hide a provider, a directive walks the DOM once after hydration, only when the token is absent, and reports it in development. A lookup that exists only in development builds, for a placement warning, may inject the parent's class instead of a token where both sit in one entry point, because the guard removes it from production (Menu D9; the Breadcrumbs and Pagination items).
```
- Tests and stories: none in this file.
- Needs: the `InjectionToken`, the optional-injection development warning, the post-hydration DOM walk, the development-only class injection for a placement warning.
- Rule as documented usage: a part that may stand alone works undecorated outside its parent; a part that cannot stand alone requires it; a consumer must declare a projected part where the parent's token can reach it for correct first-paint placement.
- Mentions: `Avoided:` line 95 ("a DOM walk that also runs when the token is present; a parent found through a DOM query"); building-blocks.md 1.9 lines 139 and 142 (the same rules, cataloged there).

### misuse: Directive's own development check for markup its documentation lacks (P17)

- Location: P17 "Accessibility is a requirement with a gate," line 250.
- Text:
```
Each directive owns the ARIA, `type` default, and development check its documented markup lacks; hidden in-DOM content gets `inert`, not `aria-hidden`, except the cases building-blocks 1.10 lists ...
```
- Tests and stories: none in this file.
- Needs: whatever content/host read the specific development check performs (per-plugin, cataloged individually in building-blocks.md's 1.10 entries above).
- Rule as documented usage: none beyond what each per-plugin misuse check above already states; this is the umbrella principle they satisfy.
- Mentions: building-blocks.md 1.10 (every misuse entry cataloged above).

### build-time: Compile-time check with the exact WCAG formula where axe has no rule (P17)

- Location: P17 "Accessibility is a requirement with a gate," line 250.
- Text:
```
Where a Foundation default fails a criterion, the spec states the Sass settings or the smallest Library mixin rule that makes it pass, with a compile-time check where axe has no rule, computed with the exact WCAG formula of ADR 0022's dated note, never Foundation's `color-luminance()` or `color-contrast()`; never a recommendation and never a silenced rule.
```
- Tests and stories: "Preferred: `nfs-button` emitting a 24 px floor for 2.5.8; `nfs-switch` stopping the compile on a 1.6:1 track with the exact formula" (line 254) -- restates the per-component checks, not new tests.
- Needs: same exact-formula Sass helper as building-blocks.md line 158.
- Rule as documented usage: the spec states the Sass settings that make a failing Foundation default pass; kept regardless of whether the compile-time enforcement ships.
- Mentions: building-blocks.md's build-time entries above (this principle restates the umbrella rule at line 158).

### misuse: "each misuse the compiler cannot see" -- copied class, missing name, "for" that names nothing (P23)

- Location: P23 "Every misuse a type cannot catch is reported once in development and costs production nothing," line 324.
- Text:
```
Rule: A directive reports, as a development warning and once, each misuse the compiler cannot see: a copied Foundation class, ... a missing name, a missing Library mixin include, a `for` that names nothing; a child that cannot stand alone is a required injection, whose NG0201 is the report.
```
- Tests and stories: none in this file.
- Needs: same as building-blocks.md's copied-class (line 88) and accessible-name (line 162) checks; a `for`-attribute reference check (Abide's `nfsEqualTo`/label `for`, out of scope, not detailed further in this file).
- Rule as documented usage: none beyond the per-check rules already stated above.
- Mentions: `Preferred:` line 328 ("`HostAttributeToken('class')` read in development only to warn on a copied `is-active`; `nfsSliderFill` warning outside a slider").
- Boundary call: this Rule sentence enumerates several distinct checks in one clause. "A copied Foundation class" and "a missing name" are misuse (own host/content); "a for that names nothing" reads only the directive's own input (misuse); "a missing Library mixin include" is detected by reading a compiled CSS custom property in the browser, so it is runtime, cataloged separately next; "a child outside a parent it may stand without (optional injection)" is family, cataloged separately below. Split by the order forgotten-import, family, misuse, runtime, build-time; each clause is classified by what it reads, per issues/159's rule.

### family: Optional-injection-outside-parent warning (P23)

- Location: P23, line 324.
- Text:
```
a child outside a parent it may stand without (optional injection),
```
- Rule as documented usage: same as building-blocks.md line 139's.
- Mentions: building-blocks.md 1.9 line 139, cataloged above.

### runtime: Missing Library mixin include, detected via an absent Variant property (P23)

- Location: P23, line 324.
- Text:
```
a missing Library mixin include;
```
- Rule as documented usage: none (an absent Library mixin include, once deferred, simply leaves classes unstyled with no report).
- Mentions: building-blocks.md 1.13 line 248 (the Variant-property presence-marker mechanism this reads), and line 250 (the runtime check itself).
- Boundary call: this reads the compiled Variant property in the browser (what strictVariantProperties reads), so it is runtime, not build-time or misuse, even though P23 lists it beside misuse checks.

### runtime: Three Runtime checks named together (`strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`) (P23)

- Location: P23, line 324.
- Text:
```
The Runtime checks (`strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`, `strictDirectiveImports`) run by default in development with a per-check opt-out; the first three also run in production through the opt-in provider, and `strictDirectiveImports` never does, because it reads Angular's development debugging API;
```
- Rule as documented usage: none.
- Mentions: building-blocks.md 1.13 line 250, ADR 0040 line 49.
- Boundary call: `strictDirectiveImports` is grammatically inside the same clause but is explicitly forgotten-import kind per the ruling's classification list; split into the next entry.

### forgotten-import: `strictDirectiveImports` named beside the Runtime checks (P23)

- Location: P23, line 324.
- Text:
```
and `strictDirectiveImports` never does, because it reads Angular's development debugging API;
```
- Rule as documented usage: none.
- Mentions: building-blocks.md 1.9 line 143, ADR 0046 line 11.

### forgotten-import: Opt-in `strictParents` flag throws on a missing optional parent (P23)

- Location: P23, line 324.
- Text:
```
the opt-in `strictParents` flag makes an optional parent injection that found nothing throw, in development builds only; the Storybook half of the e2e layer sees none of them, because the static Storybook build runs in production mode.
```
- Rule as documented usage: none.
- Mentions: building-blocks.md 1.9 line 143, ADR 0046 line 12.

### forgotten-import: A forgotten import of an attribute directive fails silently; checks catch it (P24)

- Location: P24, lines 334-344 (whole principle).
- Text:
```
Rule: Entry points export their directive classes and no import arrays (ADR 0046). A spec's TypeScript usage examples import every directive they use, and its class and ARIA assertions run in the story gate. Every library directive and component with an attribute selector calls `nfsDirectiveCheck` from its constructor behind an inline `ngDevMode` guard, and each family spec lists its In-family checks per part by the rule of [Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md): the parent check of an optional parent injection, the child probes, the peers linked by reference or value, and what `strictParents` changes. The library also ships the `strictDirectiveImports` Runtime check, the opt-in `strictParents` flag, and the opt-in static check (`ngx-foundation-sites:missing-imports`).

Why: Angular reports no error for a static attribute that matches no imported directive; a bound input on the missing directive fails (NG8002, binding to a property that does not exist), a static one does not, and a family's own checks run only inside a directive that exists, so a forgotten whole family or single directive needs the runtime check or the static check. An exported array prevents only a forgotten member and hides its members from the unused-imports diagnostic and `ng generate @angular/core:cleanup-unused-imports`; the three specs that exported one (`NFS_ACCORDION`, `NFS_RESPONSIVE_ACCORDION_TABS`, `nfsPrototypeClasses`) dropped it. Material's per-component NgModules are compatibility leftovers, and Angular Aria exports classes and tokens only.

Preferred: `imports: [NfsAccordion, NfsAccordionItem, NfsAccordionTitle, NfsAccordionContent]`, which the unused-imports diagnostic can check member by member; `nfsDirectiveCheck('NfsAccordionItem', {children: ['NfsAccordionTitle', 'NfsAccordionContent']})` inside `if (typeof ngDevMode === 'undefined' || ngDevMode)`; `[expanded]="true"` on a title, which fails to compile when `NfsAccordionTitle` is not imported; `nfsSliderFill` warning outside a slider.
Avoided: an exported import array such as `NFS_ACCORDION`; a TypeScript example that shows `<button nfsButton>` without its import; a check call behind a hoisted `const dev`; a static attribute as the only way to reach a directive whose absence nothing reports.
```
- Tests and stories: "its class and ARIA assertions run in the story gate" (kept, the story gate test mechanism, not itself a deferred check).
- Needs: `nfsDirectiveCheck`, the `ngDevMode` inline guard, `strictDirectiveImports`, `strictParents`, `ngx-foundation-sites:missing-imports`.
- Rule as documented usage: a spec's TypeScript usage examples import every directive they use (kept: this stays true regardless of the check, since it is good practice, not enforcement); no consumer-facing rule beyond that, since a forgotten import otherwise renders silently unstyled.
- Mentions: `## What this guide adds beyond the records` (line 406, "P24's import array, decided by the user on 2026-09-28 against arrays (ADR 0046)"); Conflicts section is silent on P24.

### family: The DI example restated (Conflicts section item 3)

- Location: `## Conflicts between the research and recorded decisions`, item 3, line 400.
- Text:
```
3. The DI example. `AGENTS.md`'s Content Projection and DI pattern injects a parent token with `{optional: true, skipSelf: true}` in every child; building-blocks 1.9 injects it required when the child cannot exist alone and optional with a development warning when it can, and uses `skipSelf` for the Nearest Openable (1.8). P4 and P23 follow building-blocks; the same precedence line covers it.
```
- Rule as documented usage: none beyond P4's, already stated.
- Mentions: building-blocks.md 1.9 line 139; P4 above.

Kept (not a check): P1 (directive vs. component), P2 (one directive per Structural class), P3 (no consumer-written classes), P5 (native element selectors), P6 (hosting a class directive), P7 (composition over inheritance), P8 (hostDirectives limits), P9 (input-name collisions -- see boundary call below), P10 (signals-first API), P11 (one source per state), P12 (rendering modes), P13 (naming), P14 (input count/tracing), P15 (Foundation behaviour in, application behaviour out), P16 (native platform first), P18 (Sass theming), P19 (animation mechanics), P20 (native control carries the value), P21 (no library strings, RTL), P22 (entry points), P25 (DOM-first tests, no harness classes), P26 (shared baselines pointer), the Decision framework, the Release policy section, the Idioms table, "Not conflicts" paragraph, "What this guide adds beyond the records" (except the P24 line already cataloged).

Boundary call: P9's Rule (building-blocks 1.9's collision rule, ADR 0044) ends "or its spec reports the case." No `@error`/`@warn`/`console.warn` mechanism is named for this report anywhere in this file or in ADR 0044 (checked directly, see that file's section below); it reads as a documentation practice (the spec's prose states the case), not one of the five check kinds. Kept, not classified as a check.

---

## CONTEXT.md

### runtime: "Runtime check" glossary term

- Location: `### Angular side`, lines 591-593.
- Text:
```
**Runtime check**:
A check the library runs in development builds after the first render, on by default with a per-check opt-out, that reports what the compiler cannot see: a Variant value with no class in the compiled CSS, missing Variant properties, Breakpoint drift, or a Forgotten import on a rendered element; the Variant and Breakpoint checks can also be opted into production. The `strictParents` flag beside them is not one: it is off unless the consumer opts in, and makes a missing parent throw at construction.
_Avoid_: dev check, drift warning, sanity check
```
- Tests and stories: none in this file.
- Needs: none beyond building-blocks.md's runtime entries above.
- Rule as documented usage: none (definitional).
- Mentions: "Breakpoint properties" (line 584, "the `strictBreakpointSync` Runtime check compares with the Breakpoint map"); "Variant properties" (line 588, "read by the library's generator and by the Runtime checks").
- Boundary call: the term's own text names "a Forgotten import on a rendered element" as one of the things a Runtime check reports (referring to `strictDirectiveImports`); that clause belongs with the forgotten-import "Forgotten import" and "strictDirectiveImports" entries, not restated as a separate runtime check here, since ADR 0046 and the ruling's forgotten-import bullet claim `strictDirectiveImports` by name.

### forgotten-import: "Forgotten import" glossary term

- Location: `### Angular side`, lines 595-597.
- Text:
```
**Forgotten import**:
A library attribute written in a template whose component's imports do not bring in the directive it names, so the element renders without that directive's classes, ARIA, and behaviour, with no compiler error.
_Avoid_: missing import, unimported directive, dead attribute
```
- Rule as documented usage: none (defines the failure mode the checks catch; without the checks, the failure mode itself still exists and the spec must accept it, per issues/158 Decision item 2's "a forgotten import renders without its directive").
- Mentions: none beyond definitional use throughout the other files.

### forgotten-import: "Selector manifest" glossary term

- Location: `### Angular side`, lines 599-601.
- Text:
```
**Selector manifest**:
The library's list of its exported directives and components that have an attribute selector, each with its class name, entry point, selector, the Structural class it always binds, and the library directives it hosts; the list the forgotten-import checks match templates and rendered elements against.
_Avoid_: directive manifest, import manifest, selector list
```
- Needs: the manifest data itself (class name, entry point, selector, Structural class, hosted directives per directive).
- Rule as documented usage: none.
- Mentions: building-blocks.md Part 3 line 383, ADR 0046 line 27.

### family: "In-family check" glossary term

- Location: `### Angular side`, lines 603-605.
- Text:
```
**In-family check**:
A development warning from one part of a directive family about a peer: an element that carries the peer's attribute with no instance of it, or a parent that dependency injection cannot reach from the part's template.
_Avoid_: peer check, family validation, sibling check
```
- Rule as documented usage: none.
- Mentions: building-blocks.md 1.9 line 143, ADR 0046 line 9.
- Boundary call: this term's own definition ("an element that carries the peer's attribute with no instance of it") is exactly ADR 0046's In-family checks, which the ruling's classification list explicitly assigns to `forgotten-import`, not `family`, despite the glossary term's name. Classified here as `family` only because the glossary term's own header word is "family," but per the task's classification rule the concept it defines is forgotten-import kind; recorded as the boundary call: this glossary term's content belongs to forgotten-import (see building-blocks.md's and ADR 0046's In-family check entries), and only the term's name suggests otherwise. The rewritten spec should fold this term into the forgotten-import spec, not a family spec, or drop it if the deferred family spec needs no glossary at all.

### build-time: "Declaration drift" glossary term

- Location: `### Angular side`, lines 495-497.
- Text:
```
**Declaration drift**:
A difference between a Variant declaration file and the Variant properties of the Sass it mirrors: a name one has and the other lacks, a differing count, or a registry the library does not have.
_Avoid_: stale types, out of sync (Nx's word for any sync generator), mismatch
```
- Rule as documented usage: none. The generate mode (kept, per issues/158 Decision item 3) still exists to keep the file and the Sass in step by regenerating; only the explicit drift report (`nx sync:check`, the Architect builder's `check` configuration) is deferred.
- Mentions: building-blocks.md 1.13 line 249, ADR 0040 line 12.

Kept (not a check): every other glossary term, listed for completeness: Plugin, CSS-only component, Menu, Close Button, Top Bar, Title Bar, Menu icon, Pagination, Breadcrumbs, Disabled step, Split button, Callout, Progress Bar, Progress meter, Table, Stacked table, Switch, Switch paddle, Inner label, Badge, Card, Card divider, Responsive Embed, Embedded element, Label, Thumbnail, Linked thumbnail, Media Object, Main section, Structural class, Handle, Bar position, Fill, Watched element, State class, Variant class, Open Variant family, Closed Variant family, Class breakpoint, Visibility class, Visually hidden, Skip link, Utility class, Utility family, Clearfix, Prototyping Utilities, Typography Helpers, Subheader, Heading size, Cell, Block grid, Row, Column, Column row, Grid frame, Cell block, Flex parent, Flex child, Source ordering, Application class, Form label, Revealed panel, In-canvas panel, Option, Dropped option, Sticky range, Motion class, Motion name, Breakpoint map, Breakpoint rule, Zero breakpoint, Breakpoint query, Named query, Interchange rule, Export mixin, Float build, Flexbox mode, Directive-first, Wrapper component, Implementation level, Browser target, Trigger, Openable, Nearest Openable, Trigger role, Rotation control, Visibility mode, Dismissible callout, Class mode, Modal mode, Modal inert set, Light dismiss, Scroll lock, Backdrop press, Anchored pane, Tip, Positioner, Placement, Collision bound, Hover region, Nested menu, Menu mode, Mode swap, Disclosure navigation, Hybrid item, Open path, Current link, Placeholder link, Drilldown level, Drilldown wrapper, Base side, Tab group, Current section, Activation line, Lazy content, Defaults token, Variant input, Utility attribute, Variant registry, Variant declaration file, Variant manifest, Error-state policy, Form error, Form alert, Help text, Completion output, Breakpoint service, Server breakpoint, Rendering modes, Dehydrated state, Hydration boundary, Replay guard, Pre-hydration input, Replayed event, Browser-level test, Story id, Anti-pattern story, Accessibility gate, Visible value, Scroll region, Fixture app, Library mixin, Breakpoint properties, Variant properties.

---

## storybook-conventions.md

### forgotten-import: Story-level `console.warn` spy fails a story with a forgotten-import or wrong-element report

- Location: Section 8 "Args, controls, and demo markup," line 320.
- Text:
```
Layer 1 runs in Angular development mode, so the forgotten-import checks run in every story ([Spec: forgotten-import checks (shared utility)](issues/150-spec-forgotten-import-checks.md)): `preview.ts` spies on `console.warn` in a `beforeEach` and fails the story when the library logs a forgotten-import or wrong-element report, because a story's `render()` template is outside the static check, so a directive missing from `moduleMetadata.imports` fails its story. An Anti-pattern story that demonstrates a forgotten import asserts that report in its play function instead (section 6).
```
- Tests and stories: this whole entry is a test-harness description; it defines how the story gate would surface a forgotten-import report, which is itself deferred. Once the checks are deferred, no story fails on a forgotten import (per issues/158 Decision item 2, a spec accepts a version with no such checks).
- Needs: a `console.warn` spy in `preview.ts`'s `beforeEach`.
- Rule as documented usage: none.
- Mentions: Section 11 checklist, line 368 ("The story logs no forgotten-import or wrong-element report").

### runtime: Sass comment naming the Runtime checks' dependency on Flexbox Utilities' Variant properties

- Location: Section 5 "Sass," line 123.
- Text:
```
@include nfs-flexbox-utilities; // Flexbox Utilities: --nfs-flex-source-ordering-count and --nfs-flexbox-responsive-breakpoints for the Runtime checks; every flexbox-utilities--* story that binds order or a responsive helper
```
- Needs: same Variant properties as building-blocks.md's build-time presence-marker entry (line 248), read by the runtime checks.
- Rule as documented usage: none (a Storybook setup comment, not a consumer-facing rule).
- Mentions: none beyond this line in this file.

Kept (not a check): Sections 1-4 (Purpose, File layout, Ids and naming, Preview configuration), Section 5's remaining Sass includes and their WCAG-contrast comments (these state required consumer Sass settings, restating the same settings the building-blocks.md build-time entries above already catalog, not a new check), Section 6 "Accessibility gate and the anti-pattern exception" in full (the story-level axe run stays in the first milestone, per issues/158 Decision item 3, as one of "the library's own tests"), Section 7 "Play functions," the rest of Section 8 (args/controls conventions), Section 9 "What stories do not cover," Section 10 "How the e2e layer uses stories," Section 11's checklist items other than the one already cataloged as a Mention.

---

## adr/0012-sass-packaging.md

### build-time: Library mixin gets "custom CSS or compile-time checks"

- Location: Consequences, 2026-09-27 dated note, line 24.
- Text:
```
A CSS-only component, layout system, or utility family that needs custom CSS or compile-time checks gets an `nfs-<entry point>` Library mixin ([ADR 0012](0012-sass-packaging.md), dated note). One that needs neither has none.
```
- Rule as documented usage: none (this states which components get a Library mixin at all; the mixin's CSS rules stay kept, only its "compile-time checks" clause is the deferred part).
- Mentions: building-blocks.md 1.10's per-component build-time entries above (each such mixin).

### runtime: Variant properties are "a verification channel... read by the runtime checks"

- Location: Consequences, 2026-09-27 dated note, line 27.
- Text:
```
They are a verification channel like the Breakpoint properties. The library's generator reads them from a compile of the application's stylesheet to write the consumer's Variant declaration file, and the runtime checks read them in the browser. They count among the rules Foundation cannot provide.
```
- Rule as documented usage: none. The generator's read of these properties (to write the declaration file) is kept, per issues/158 Decision item 3's "generate mode"; only "the runtime checks read them in the browser" is deferred.
- Mentions: building-blocks.md 1.13 line 248 and line 250.

Kept (not a check): the whole `_index.scss` packaging design (the guard that fails the compile when Foundation was not imported first is a build-order guard, not one of the five check kinds -- see boundary call below), the peer-dependency decision, the Considered options, and every other Consequences bullet (the mixin-per-export-mixin rule of 2026-09-28, the Variant-properties-writer rule beyond the runtime-read clause above, the flag clause refined by the 2026-09-29 note).

Boundary call: this ADR's main text states "a guard fails the compile when Foundation was not imported first." This is a Sass `@error` that stops the compile, textually similar to a build-time check, but it is not one of the checks the ruling's build-time bullet names (which is "contrast, registry, and name checks, and presence markers read only by a check" -- an import-order guard is none of those; it is a structural precondition of the whole library, not a check on a consumer's use of one component). Left as kept, not classified as a deferred check, because the guard is not itself in issues/158's Decision item 1 list and the library cannot function at all without it (it is not something "the spec describes and accepts a library with none of").

---

## adr/0039-directives-manage-every-foundation-class.md

### misuse: "development-mode... check that its documented markup lacks"

- Location: main text, line 10.
- Text:
```
Each directive also owns the ARIA, `type` default, or development-mode and compile-time check that its documented markup lacks for WCAG 2.2 AA ([ADR 0022](0022-wcag-2-2-aa-enforcement.md)), because Foundation's own examples fail it ...
```
- Rule as documented usage: none beyond what each per-plugin misuse check in building-blocks.md 1.10 already states.
- Mentions: building-blocks.md 1.10 (every misuse entry above); architecture-guide.md P17 (restates the same clause).

### build-time: "...or compile-time check that its documented markup lacks"

- Location: main text, line 10 (same sentence as above).
- Text:
```
Each directive also owns the ARIA, `type` default, or development-mode and compile-time check that its documented markup lacks for WCAG 2.2 AA ...
```
- Rule as documented usage: none beyond what each per-plugin build-time check in building-blocks.md 1.10 already states.
- Mentions: building-blocks.md 1.10 (every build-time entry above); architecture-guide.md P17.
- Boundary call: one sentence states both a misuse check (development-mode) and a build-time check (compile-time) for the same missing-markup gap; split by kind since the ruling separates the two.

Kept (not a check): the whole class rule (Structural/Variant/State class ownership), the Considered options, and every Consequences bullet other than line 10 (the class-name-passed-as-input-value rule, the dated notes on `<progress>`/`<table>`/`label.middle`, the Magellan `Renderer2` State-class note -- this last one restates a misuse check already cataloged from building-blocks.md, listed here as Kept because ADR 0039 itself states only the mechanism (`Renderer2`, render callback, destroy), not a report/warning, so it is the kept CSS/DOM-write mechanism the misuse check in building-blocks.md line 88 builds on, not a duplicate check entry).

---

## adr/0040-variant-input-types.md

### build-time: "Keeping it in step" -- Nx sync generator, `nx sync:check`, Architect builder check configuration

- Location: main text, "Keeping it in step" bullet, line 12.
- Text:
```
**Keeping it in step.** An Nx task sync generator keeps the file in step before builds, serves, and tests, with `nx sync:check` as its own CI step. An Angular CLI Architect builder rewrites the file, or fails CI in its `check` configuration.
```
- Rule as documented usage: none for the check half (`nx sync:check`, the `check` configuration); the generator's rewrite is kept (issues/158 Decision item 3).
- Mentions: building-blocks.md 1.13 line 249; line 47 of this file (below).

### runtime: "Runtime checks" configured NgRx-`runtimeChecks`-style

- Location: main text, "Runtime checks" bullet, line 13.
- Text:
```
**Runtime checks.** A runtime check configured in the style of NgRx's `runtimeChecks` runs every check in development builds unless the consumer opts one out, and runs none in production unless the consumer opts one in.
```
- Rule as documented usage: none.
- Mentions: building-blocks.md 1.13 line 250; Consequences line 49 (below).

### runtime: `strictVariantNames`, `strictVariantProperties`, `strictBreakpointSync`; `provideNfsRuntimeChecks`/`provideNfsProductionRuntimeChecks`

- Location: Consequences, line 49.
- Text:
```
The runtime check has three checks, `strictVariantNames`, `strictVariantProperties`, and `strictBreakpointSync` (ADR 0005's drift check). `provideNfsRuntimeChecks(...)` opts checks out in development and provides nothing in production. `provideNfsProductionRuntimeChecks(...)`, with an optional `report` callback, is the only production code path that references the checker. The checks run only in the browser, after the first render, because the server has no computed style. Under declaration merging they report drift between the declaration file and the compiled CSS, a missing Library mixin include, and values that bypass the type.
```
- Needs: an optional `report` callback on `provideNfsProductionRuntimeChecks`.
- Rule as documented usage: none.
- Mentions: building-blocks.md 1.13 line 250, 1.7 line 126, 1.4 line 77; architecture-guide.md P23 (the runtime clause).

### build-time: "the exact WCAG contrast formula" reused for Library mixins, dated note

- Location: Considered options, superseded first draft, line 27; and Consequences generally -- see boundary call.
- Text:
```
Foundation's default names plus `(string & {})`, with a development check (this decision's first draft): superseded. A typo compiles, and a Foundation class name such as `hide` passes as a value, against ADR 0039's follow-up decision on class names in input values.
```
- Rule as documented usage: not applicable.
- Mentions: none.
- Boundary call: this "development check" is a rejected first-draft design (superseded by the closed-union-plus-registry approach), never shipped. It is not part of the currently specified checks the ruling defers, so it is not counted as a check in this manifest; listed here only because it matched the Verify step's search terms. Recorded as excluded, not as Kept and not as a deferred check.

### forgotten-import: ADR 0046 adds `strictDirectiveImports` and `strictParents` to `NfsRuntimeChecks`

- Location: Consequences, 2026-09-28 dated note, line 61.
- Text:
```
2026-09-28 ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): ADR 0046 adds a fourth check, `strictDirectiveImports`, and one flag, `strictParents`, to `NfsRuntimeChecks`, both development only: `provideNfsProductionRuntimeChecks` accepts neither, because the import check reads Angular's development debugging API and a thrown parent error in production is what ADR 0046 rejected. `strictDirectiveImports` is on by default like the other three and runs in the browser after every render; `strictParents` is off unless `provideNfsRuntimeChecks({strictParents: true})` turns it on, and acts at construction, on the server too, so it is a flag beside the Runtime checks rather than one of them. `provideNfsRuntimeChecks`'s argument becomes optional, because `provideNfsRuntimeChecks()` is how an application whose templates instantiate no library directive starts the import check.
```
- Rule as documented usage: none.
- Mentions: building-blocks.md 1.9 line 143, Part 3 line 383/398; ADR 0046 lines 11-12; architecture-guide.md P23.

Kept (not a check): the whole closed-type/registry/declaration-merging design (this is typed-input compile error behaviour, kept per issues/158 Decision item 3's "typed inputs and their compile errors"), the Considered options other than line 27 above, the Consequences bullets on input naming order, declaration emit, entry-point placement, the Nx/Angular CLI integration prose beyond lines 12/47, the one-writer-per-Variant-property rule (restates building-blocks.md 1.13 line 248, itself cataloged there), the `NfsBreakpointName`/`NfsClassBreakpoint` split, the reopening condition, and the later dated notes (Button spec D-notes, Button Group D11, Progress Bar D14, Off-canvas D6, the Variant declaration tooling prototype note, Flex Grid D12, the 2026-09-29 `booleanAttribute` dissent).

Also see line 47 (a second restatement of the sync:check CI-step rule, folded into the "Keeping it in step" entry above as a Mention, not a separate check):
```
Nx: no task runs a sync generator when `CI` is set, so `nx sync:check` must be its own CI step. A local non-interactive run (a git hook, an agent shell) stops when the workspace is out of sync.
```

---

## adr/0044-utility-directive-rule.md

### runtime: Runtime-check handle naming for a multi-attribute directive

- Location: Consequences, line 19.
- Text:
```
A Runtime-check handle of a directive that several attributes create is named after the directive class.
```
- Rule as documented usage: none (a naming convention for the runtime check's own reporting, not a consumer-facing rule).
- Mentions: building-blocks.md 1.4 line 77 (`nfsVariantCheck('<directive>')` naming, the same convention).

Kept (not a check): the whole one-directive-per-export-mixin design, the Considered options, the Consequences bullets on value/attribute alias suffixes, and the 2026-09-28 dated note on `foundation-print-styles`' split by shape.

Boundary call: this ADR's line 17 ("in every shape an un-prefixed input shares no name with another directive's input on the same element, or its spec reports the case") is the same clause architecture-guide.md P9 restates; as recorded there, no `@error`/`@warn`/`console.warn` mechanism is named for this "reports the case," so it is not classified as a check in this manifest (kept as a documentation practice).

---

## adr/0046-forgotten-imports-caught-by-checks.md

This whole ADR is the primary record for the forgotten-import kind; every numbered item below is `forgotten-import`.

### forgotten-import: In-family checks

- Location: main text, first bullet, line 9.
- Text:
```
- In-family checks: each part of a family reports, in development builds only, a peer attribute with no instance, once per element, naming the directive, its entry point, and the component to fix (the Angular Aria style, building-blocks 1.9, the guide's P23).
```
- Rule as documented usage: none.
- Mentions: CONTEXT.md "In-family check" glossary term (see boundary call there); building-blocks.md 1.9 line 143.

### forgotten-import: Static check on documented APIs only (`ngx-foundation-sites:missing-imports`)

- Location: main text, second bullet, line 10.
- Text:
```
- A static check on documented APIs only: an opt-in builder and Nx target run in CI, resolving each standalone component's `imports` with TypeScript's compiler API, reading templates with a documented parser, and matching the library's selector manifest; it is the only check that sees templates never rendered in development. Its scope, by the user's ruling: class identifiers written directly in `imports`, not function-built imports, arrays of any form (plain `const` arrays included, a component that imports one is skipped with a notice), NgModule-declared components, or third-party packaged directives that host a library directive.
```
- Needs: TypeScript's compiler API, a documented HTML parser, the Selector manifest.
- Rule as documented usage: none.
- Mentions: building-blocks.md Part 3 lines 383/398 (the `ngx-foundation-sites:missing-imports` builder and `nfs-imports` target).

### forgotten-import: Runtime manifest check (`strictDirectiveImports`)

- Location: main text, third bullet, line 11.
- Text:
```
- A runtime manifest check: a development-only `strictDirectiveImports` runtime check (ADR 0040) that reports an element carrying a library directive's attribute with no library directive on it, in markup that renders during development.
```
- Rule as documented usage: none.
- Mentions: ADR 0040 line 61, building-blocks.md 1.9 line 143, 1.13 line 250, architecture-guide.md P23; CONTEXT.md "Runtime check" glossary term.

### forgotten-import: Opt-in `strictParents` flag

- Location: main text, fourth bullet, line 12.
- Text:
```
- An opt-in `strictParents` flag: in development builds, parent injections that are optional by default become required, so a forgotten parent throws; production stays optional. Parts projected across templates then render through a template outlet with the parent's injector, since `inject()` has no option that follows projection.
```
- Rule as documented usage: none.
- Mentions: ADR 0040 line 61, building-blocks.md 1.9 line 143, architecture-guide.md P23.

### forgotten-import: `nfsDirectiveCheck`, the host record, and the Selector manifest (mechanism detail)

- Location: Consequences, line 27.
- Text:
```
2026-09-28 ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): specified. One development call per directive, `nfsDirectiveCheck`, behind an inline `ngDevMode` guard, records its host, starts the runtime check, and runs the In-family checks. The runtime check decides from the Structural class, then Angular's public debugging `getOwningComponent` for server HTML not yet claimed, then that development record keyed by the Selector manifest's class names, so no private Angular field is read. All three development checks share one report per element and directive, and also report a library attribute on an element no selector of its directive admits. `strictParents` is an `NfsRuntimeChecks` field, off by default and development only, that throws the library's own error at construction for fifteen parts of eight families; the template-outlet pattern with the parent element's injector was measured with Angular 22.2.0. The Selector manifest also lists the library directives each library directive hosts, which the static check applies; the static check has no ignore option.
```
- Needs: `getOwningComponent` (Angular's public debugging API), the development host record keyed by Selector-manifest class names.
- Rule as documented usage: none.
- Mentions: building-blocks.md 1.9 line 143, Part 3 lines 383/398; CONTEXT.md "Selector manifest" glossary term.

### forgotten-import: Consequence -- scope of what each check catches

- Location: Consequences, line 26.
- Text:
```
A forgotten whole family or single directive is caught by the static check and the runtime manifest check only; in-family checks and `strictParents` catch forgotten members.
```
- Rule as documented usage: none.
- Mentions: none beyond the four checks already cataloged above in this file.

Kept (not a check): the Considered options (the rejected import array, the rejected NgCompiler-based static check, the rejected ESLint rule, the rejected required-parent-injection-by-default design -- none of these are part of the shipped design, so none is a check to defer), and the Consequences bullets on the Accordion/Responsive Accordion Tabs/Prototyping Utilities import-array removal, NgModule-consumer support, and the pointer to [Spec: forgotten-import checks (shared utility)].

---

## Counts

Counted directly from the `### <kind>:` subsection headers with
`rg -c "^### <kind>:"` over each file's line range, not by hand (a hand
recount of this same manifest during review caught two hand-arithmetic
errors, which this recount replaces).

By kind (across all nine files):

- forgotten-import: 15
- family: 7
- misuse: 23
- runtime: 11
- build-time: 29
- Grand total: 85

Per-file counts (the authoritative tally):

### building-blocks.md
- forgotten-import: 2
- family: 3
- misuse: 20
- runtime: 3
- build-time: 23
- Total checks: 51

### architecture-guide.md
- forgotten-import: 3 (P23 strictDirectiveImports clause; P23 strictParents clause; P24)
- family: 3 (P4; P23 optional-injection clause; the DI-example restatement in Conflicts item 3)
- misuse: 2 (P17 development-check clause; P23's copied-class/missing-name/for-that-names-nothing clause)
- runtime: 2 (P23 missing-Library-mixin-include clause; P23 three-named-checks clause)
- build-time: 1 (P17 compile-time-check clause)
- Total checks: 11

### CONTEXT.md
- forgotten-import: 2 (Forgotten import; Selector manifest)
- family: 1 (In-family check, with its boundary call redirecting its content to forgotten-import)
- runtime: 1 (Runtime check)
- build-time: 1 (Declaration drift)
- Total checks: 5

### storybook-conventions.md
- forgotten-import: 1
- runtime: 1
- Total checks: 2

### adr/0012-sass-packaging.md
- build-time: 1
- runtime: 1
- Total checks: 2

### adr/0039-directives-manage-every-foundation-class.md
- misuse: 1
- build-time: 1
- Total checks: 2 (both halves of one sentence, line 10)

### adr/0040-variant-input-types.md
- build-time: 1 (Keeping it in step)
- runtime: 2 (Runtime checks bullet; Consequences line 49)
- forgotten-import: 1 (Consequences line 61)
- Total checks: 4 (the superseded first-draft "development check" at line 27 is excluded, not counted, per its boundary call)

### adr/0044-utility-directive-rule.md
- runtime: 1
- Total checks: 1

### adr/0046-forgotten-imports-caught-by-checks.md
- forgotten-import: 6 (In-family checks; static check; runtime manifest check; strictParents flag; nfsDirectiveCheck mechanism detail; scope-of-catch consequence)
- Total checks: 6

### Grand total: 85 check subsections across the nine files (51 + 11 + 5 + 2 + 2 + 2 + 4 + 1 + 6 = 85).

## Boundary calls (all, repeated from their locations above)

1. architecture-guide.md P23: one Rule paragraph mixes forgotten-import (`strictDirectiveImports`, `strictParents`), family (optional-injection-outside-parent), misuse (copied class, missing name, `for` that names nothing), and runtime (missing Library mixin include, `strictVariantNames`/`strictVariantProperties`/`strictBreakpointSync`) in one sentence; split by what each clause reads, per issues/159's classification rule, forgotten-import first.
2. ADR 0039 line 10: one sentence states both a misuse check ("development-mode... check") and a build-time check ("compile-time check") for the same missing-markup gap; split by kind.
3. CONTEXT.md's "In-family check" glossary term: its header word is "family," but its content (an element carrying a peer's attribute with no instance) is exactly ADR 0046's In-family checks, which the ruling's classification list assigns to forgotten-import; classified as family here only by the term's placement, with a note redirecting its content to forgotten-import.
4. architecture-guide.md P9 and ADR 0044 line 17 ("or its spec reports the case"): no `@error`/`@warn`/`console.warn` mechanism is named for the input-name-collision report in either file; treated as a documentation practice, not one of the five check kinds, and kept rather than classified as a check.
5. ADR 0012's Sass-import-order compile guard: textually a compile-time `@error`, but not one of the contrast/registry/name/presence-marker checks the ruling's build-time bullet names, and not something the library can function without; kept, not classified as a deferred check.
6. ADR 0040 line 27 (the superseded first-draft "development check" for `(string & {})`): a rejected alternative, never shipped; excluded from the count entirely, neither kept nor deferred.
7. building-blocks.md line 88 (the copied/redundant-class check): the `Renderer2`-owned variant (Magellan, Off-canvas `body`, Reveal `html`) writes to an element the directive does not host, but reads only the directive's own tracked state, so it stays misuse rather than family.
8. building-blocks.md's Button Group build-time entry (line 174): names no `@error`/`@warn` of its own (only CSS colouring and a floor); its deferred check content is `nfs-button`'s (already cataloged), not a separate check.

## Verify

Search of all nine files for the terms `nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `In-family`, `Forgotten import`, `forgotten import`, `Selector manifest`, `nfsReportForgottenPeer`, `Runtime check`, `provideNfsRuntimeChecks`, `@error`, `@warn`, `dev check`, `development check`, `Dev-mode check`, `development warning`, `warns`, `console.warn`, `sync:check`, `check mode`, `missing-imports`, run with the Grep tool (positive control: the same search against `adr/0046-forgotten-imports-caught-by-checks.md` alone returned 6 hits at the lines this manifest cites, confirming the pattern matches real text and is not silently failing).

Every hit returned by the combined search across `building-blocks.md`, `architecture-guide.md`, `CONTEXT.md`, `storybook-conventions.md`, and the five ADRs is accounted for above, as either a check subsection's Location/Text, a Mention line, a Kept line, or a boundary call, with these explicit exceptions and their reasons:

- `nfsReportForgottenPeer`: no hit found in any of the nine files (a zero-hit search, confirmed by the positive control above finding other terms in the same files, so this is a real absence, not a search failure). It is named only in issues/157 and issues/158 (out of scope, not one of my nine files); not in the shared documents.
- ADR 0040 line 27's "development check": excluded per boundary call 6 above (a superseded, never-shipped design).
- ADR 0028, 0034, 0038, 0037, 0043, 0005, 0004, 0011, 0019, 0042 hits from an earlier unfiltered directory-wide grep: these ADRs are not among my nine files (they belong to other spec groups' ADRs) and are excluded from this manifest entirely; not reported as misses.

No other hit was left out.

## Report back

Manifest: `D:/projects/github/LayZeeDK/ngx-foundation-sites-next/.scratch/next-foundation-specs/research/checks-extraction-shared.md`.

Counts: 85 check subsections total -- forgotten-import 15, family 7, misuse 23, runtime 11, build-time 29 (per-file breakdown in the Counts section of the manifest, machine-counted with `rg -c` rather than by hand).

Boundary calls: 8, listed in the Boundary calls section, the most consequential being architecture-guide.md P23 (one paragraph spanning four of the five kinds) and CONTEXT.md's "In-family check" term (named "family" but classified as forgotten-import by content).

Unsure how to classify: whether ADR 0012's and ADR 0044's "reports the case" / import-order-guard passages count as checks at all (I treated them as kept documentation/structural guards, not deferred checks, per boundary calls 4 and 5); whether the rejected ADR 0040 first-draft check (line 27) belongs in the manifest at all (I excluded it, boundary call 6).
