# Inputs named like HTML attributes: adversarial lens

Lens of the panel on [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md). Lens: adversarial, Opus 5.5, AFK, 2026-09-28. It attacks every option, the likely default first, and argues for the one that survives. It decides nothing; the judge does.

## Header

- Read: the ticket; the evidence `research/presentational-attribute-inputs.md` (M1 to M4, the 72-row audit, the Menu options); `building-blocks.md` 1.3, 1.4, 1.9, 1.11; ADR 0039, ADR 0041, ADR 0044, ADR 0045 (release policy: a rename decided before the first published release needs no deprecation); `architecture-guide.md` P9, P13; `specs/menu.md`, the hosting specs (accordion-menu, drilldown-menu, dropdown-menu, nested-menu, responsive-menu, top-bar); `specs/slider.md`; the `autoFocus` rows of `specs/off-canvas.md`, `specs/tabs.md`, `specs/reveal.md`, `specs/dropdown.md`; `specs/media-object.md` D3.
- Sources read beyond the evidence: Angular 22.2.x `packages/core/src/render3/dom_node_manipulation.ts` lines 130 to 155 (`setupStaticAttributes`, `writeDirectClass`), `instructions/shared.ts` lines 592 to 616 (static attributes are set before `appendChild`), `application/application_ref.ts` lines 493 to 511 and 738 to 741 (`bootstrap` creates the root and `_loadComponent` calls `tick()` in the same call); `packages/forms/signals/src/directive/control_custom.ts` lines 40 to 60 (a custom control's declared input is set instead of the native property); Angular components 22.2.x `src/aria/tabs/tab-list.ts` lines 47 to 60 and 99, `src/aria/private/behaviors/list-focus/list-focus.ts` lines 78 to 83 (the tab list binds `tabindex` `-1` in the default roving mode); WHATWG HTML `input.html`, Range state (fetched 2026-09-28); Foundation 6.9.0 `dist/css/foundation.css`, `foundation-float.css`, `foundation-rtl.css` (every attribute name its selectors use).
- Experiments: `D:/tmp/nfs-139-adversarial/` (not committed), Playwright 1.63 from `D:/tmp/nfs-ct-prototype` read-only (Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6), and the evidence app's existing build `D:/tmp/nfs-139/app/dist` served read-only on port 5465 and stopped afterwards. Scripts and outputs: `x1-autofocus.mjs`, `x1b-autofocus-readd.mjs`, `x1c-autofocus-scroll.mjs`, `x2-class-window.mjs`, `x3-range-attrs.mjs`, `x*-out.txt`.

### Correction to the evidence

Audit row 64 (Tabs `autoFocus` on `ul`) says "Nothing: the list is not focusable". It is focusable. The Tabs spec renders `ul[nfsTabs]` with `tabindex="-1"` (`specs/tabs.md` lines 316 and 380), bound by the hosted Aria `TabList` (`tab-list.ts` line 51; `getListTabIndex()` returns `-1` for the default `focusMode` `'roving'`). M4 tested a bare `ul`. Measured with the host as the spec renders it (X1, X1c), a static `autoFocus` or `autoFocus="false"` makes all three engines focus the list at page load and scroll to it. Rows 28 and 33 (Dropdown pane, Off-canvas panel) stand: neither host gets a `tabindex`.

### New measurements

X1, the Tabs host, three engines, identical results:

| Case | Focus after load |
| --- | --- |
| Server HTML `<ul role="tablist" tabindex="-1" autofocus>` before the selected tab | the list |
| the same with `autofocus="false"` (what a static `autoFocus="false"` renders) | the list |
| the same without `autofocus` (control) | `body` |
| Client-created list: `autofocus` set, list inserted, then `autofocus` removed in the same task, in a microtask, or in the next animation frame (Angular's order: static attributes, insertion, then the update pass) | the list, every time |
| Client-created list whose `tabindex` is added after insertion in the same task (Aria's binding runs in the update pass), `autofocus` removed in the same task | the list |

X1b: adding `autofocus` to the list while it is already in the document (what hydration's creation pass does to a server node) focuses nothing, kept or removed at once; removing and re-inserting the list with the attribute focuses it. The platform acts on `autofocus` only when an element is inserted, and removing the attribute afterwards does not cancel it.

X1c: the list below 3000 px of content, `autofocus="false"`: the page loads focused on the list and scrolled to it (`scrollY` 2725 in Chromium and WebKit, 2726 in Firefox; 0 without the attribute).

X2, the evidence app's development build, hydration observed with a `MutationObserver` on `class` and `align` and a `ResizeObserver` probe resized every animation frame:

- In the creation pass hydration writes the static `align` back and, in the same mutation batch, resets the `class` attribute to its static classes only: `s-null` goes from `menu align-right` to `menu` (Chromium +77 ms, Firefox +175 ms, WebKit +146 ms), `s-null-vertical` from `menu vertical align-left` to `menu vertical`; the first update pass removes `align` and restores the bound classes in one later batch (+84, +179, +160 ms). The same happens for the `hydrate on timer` block (`ht-null`, Chromium +1582 then +1585 ms) and the `hydrate on interaction` block (`hi-null`). Source: `setupStaticAttributes` calls `writeDirectClass`, which sets `class` to the static list (`dom_node_manipulation.ts` lines 130 to 155).
- No rendering update saw a probe without its `align-*` class: 0 of 231 frames (Chromium), 0 of 240 (Firefox), 0 of 252 (WebKit).

So the window in which `'[attr.align]': 'null'` has not yet run is the window in which every bound class of every library directive is missing from the server node. The class rule (ADR 0039) already depends on that window never being drawn.

X3: WHATWG, Range state: "The following content attributes must not be specified and do not apply to the element: accept, alpha, alt, checked, colorspace, dirname, formaction, ..., readonly, required, size, src, and width."

Foundation's attribute selectors, all three compiles: `disabled`, `type`, `data-whatinput`, `data-whatintent`, `title`, `href`, `readonly`, `multiple`, `for`, `aria-expanded`, `rows`, `hidden`, `draggable`, `data-responsive-menu`, `aria-selected`. Of these, only `disabled`, `readonly`, `type`, and `title` are names of audited inputs, and `title` never renders (row 49). Outside the Button, the `disabled` and `readonly` selectors are `.accordion[disabled] .accordion-title`, `.slider[disabled]`, and `input[readonly]`/`textarea[readonly]`. The audit's Foundation-selector rows are complete, and no Foundation rule selects `[align]`.

## Decision 1. The general rule for building-blocks 1.4

### Position

A rule about binding, not a ban on names: an input keeps the name the naming order gives it, and its directive owns the attribute that name renders. Three kinds, told apart by when the platform acts on the attribute, because X1 shows one remedy does not fit all of them.

### Attacks on the options

1. "Never name an input after an HTML attribute that does something on its hosts" (the Media Object's proposal, widened by the ticket).
   - Read without the host qualifier, the ban covers `color` and `size`, which are presentational on `font` and `hr`. Building-blocks 1.4, step 3 of the naming order, requires those names ("`color` for a palette; `size` for a size map"), and 17 audited inputs carry them.
   - Read with the qualifier, the ban depends on the same measurement a binding rule depends on (per host, per engine, with Foundation's CSS), so it enforces nothing more. It also got a case wrong at the evidence stage: the evidence judged the Tabs list non-focusable.
   - It collides with Foundation's own Option names, which Design Philosophy 5 and 1.4's first bullet keep: `autoFocus` (`data-auto-focus`) acts on the Tabs list and the Reveal's `dialog`. Two published specs already rejected renaming it: Reveal D12 ("breaks ADR 0007's vocabulary") and Dropdown D13 ("breaks the naming rule").
   - It also has no answer for the Menu, whose only Foundation names both collide on the same `ul` (Decision 2).
2. "Allow the name when the directive binds `[attr.<name>]` to `null`", taken alone.
   - It fails for `autofocus`. On a client-created element Angular sets static attributes before it inserts the element (`shared.ts` lines 592 to 616), and the browser acts on `autofocus` at insertion however soon the binding removes it (X1: same task, microtask, and next frame, three engines).
   - A null binding is enough for attributes the platform reads from the current DOM, which are presentational hints and CSS selectors (M1, M3, M4).
3. What survives: the second option, split by timing, plus a development report where the null binding cannot reach.

### The rendered-attribute window, attacked

- Server HTML and first paint: a host binding renders on the server, so a null-bound attribute never reaches the server HTML (M3 result 1). The parser never sees it, which also settles `autofocus` for server-rendered pages (X1b).
- Hydration and incremental hydration: the attribute returns for the length of one creation pass (M3 result 3). X2 shows the same pass also removes every server-rendered bound class, so any scheduler that drew that window would break every Foundation Variant and State class first. The null binding adds nothing to a risk the class rule already carries.
- The evidence's open question 1 (a zone-based application) is therefore not a separate risk for this rule. The initial pass is synchronous in both setups: `bootstrap` creates the root and `_loadComponent` calls `tick()` in the same call (`application_ref.ts` lines 493 to 511 and 738 to 741). Zone-based incremental hydration was not measured.
- `@defer` rendered on the client and `@if`: the element is inserted with its static attributes and without its bound classes until the update pass (M3 result 3: removed 2 ms later). Again the window is shared with the class rule.
- Event replay: nothing added, because the binding declares no listener.
- Host directives merging two instances: one `NfsMenu`, so one binding (M3, `s-responsive`).
- A consumer's own `[attr.<name>]`: it loses the first pass and wins later changes (M3 result 5). The rule states that the directive owns the attribute.
- A consumer's `[align]` CSS selector: it never matches. No Foundation rule selects `[align]` (the scan above), and a selector that matched only the static form was never reliable, because the bound form renders nothing (M3c).
- A future contributor: the binding looks like dead code. The rule requires a source comment and an SSR assertion, which is the Material precedent ("must prevent the browser from aligning text based on value", `drawer.ts` line 176).

### Strongest argument against, and the answer

Argument: a naming ban enforces itself, while a binding rule relies on every spec author remembering one line per input. Angular Material's own `MatCardActions` carries a TODO to rename `align` "as to not conflict with the native `align` attribute".

Answer: the ban does not enforce itself either. Knowing which names act on which hosts takes the same measurement, and the evidence got one wrong without it (the Tabs list). The binding rule gets a mechanical check: each spec's SSR smoke writes the static form and asserts the attribute is absent. The Material TODO dates from before `MatHint`, which keeps its `align` input and binds it to `null`, as `MatDrawer` and `MatSidenav` did. ADR 0045 lowers the cost of a rename made now, but it does not produce a name that collides with nothing (Decision 2).

### Quoted edits

building-blocks.md 1.4: insert after the "Utility attributes" bullet (line 78):

> - Inputs named like HTML attributes (2026-09-28, [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md)): a static input attribute stays on the element, so an input whose name, lowercased, is an HTML attribute also renders that attribute. The naming order above still picks the name. Where it offers two Foundation words for one family and one of them is an attribute that acts on the host, the spec takes the other when no input of that name sits on the same element (the Media Object section's `alignment`, from the docs' Section Alignment). Every other such input keeps its name. The spec's input table says what the rendered attribute does on each host the spec allows, in Chromium, Firefox, and WebKit with Foundation's CSS, and the directive binds it one of three ways:
>   1. The attribute is the directive's output: `[attr.<name>]` from the input, `null` when off, so the static and the bound forms render the same (`disabled` on the Accordion and the Button, `type` on the Button and the Close Button).
>   2. The platform reads it from the element's current attributes, as a presentational hint or through a Foundation attribute selector: `'[attr.<name>]': 'null'`. The binding keeps the attribute out of the server HTML and removes it in the first update pass on the client, the pass that also restores the bound classes hydration resets (measured in three engines, never drawn). Instances: the Menu's `align`, the Slider container's `disabled`, and the Slider handle's `readonly`. The source carries a comment naming the effect it prevents, and the SSR smoke writes the static form and asserts that the attribute is absent.
>   3. The platform acts on it when the element is inserted (`autofocus`): every `autoFocus` input binds `'[attr.autofocus]': 'null'`. The binding keeps the attribute out of the server HTML, where the parser would act on it, and hydration's rewrite onto a node already in the document does nothing. On a client-created element Angular sets static attributes before it inserts the element, and the browser acts on them however soon the binding removes them (measured in three engines). So where the host can be focusable (the Tabs list, which Aria's roving focus gives `tabindex="-1"`), the spec documents the bound form and the Defaults token, and the directive reports a static attribute in development through `HostAttributeToken`, as the Dropdown pane does (its dev check 6).
>
>   An input whose rendered attribute does nothing on the hosts its spec allows needs no binding; `research/presentational-attribute-inputs.md` audits the published ones, and a new input of that kind says so in its spec. Utility attributes keep the `nfs` prefix, which avoids the question.

architecture-guide.md P9 (line 150): replace the sentence "Whether an input may be named after an HTML presentational attribute (the Menu family's `align`) is pending [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md), whose evidence is `research/presentational-attribute-inputs.md`; the audit does not rate a spec on that question until the ticket resolves." with:

> An input named like an HTML attribute keeps the name the naming order gives it, and its directive owns the rendered attribute: it binds the attribute from the input where the attribute is the directive's output, binds it to `null` where it would act on the host (a presentational hint, a Foundation attribute selector, `autofocus`), and reports a static `autofocus` in development where the host can be focusable (building-blocks 1.4; [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md)).

P9 Preferred, append: "`<ul nfsMenu align="right">`, with `NfsMenu` binding `'[attr.align]': 'null'`". P9 Avoided, append: "an input named after an attribute that acts on its host with no binding for it (`<div nfsSlider disabled="false">`, dimmed by `.slider[disabled]`)". P9 Decided by: replace "the presentational-attribute question: pending ticket 139" with "building-blocks 1.4 (inputs named like HTML attributes)". P9 Sources, append: "`NC/src/material/form-field/directives/hint.ts:19-25`". P13 needs no edit: the naming order it restates is unchanged.

No ADR is needed: building-blocks 1.4 is the rule's record, and ADR 0044's `nfs`-prefix clause for Utility attributes stands as written.

## Decision 2. The Menu family's `align`

### Attack on option 1, keep `align` with `'[attr.align]': 'null'` on `NfsMenu` (attacked first)

| Attack | Result |
| --- | --- |
| Server HTML, first paint | No attribute (M3 result 1, results 2 and 4 of M3 with JavaScript off) |
| Hydration, incremental hydration, `@defer`, `hydrate never` | The re-add shares its pass with the class reset (X2); 63 re-add moments across two builds and three engines (M3b) and 723 frames here were never drawn with it; `hydrate never` blocks are never touched |
| Event replay | No listener added; the `hydrate on interaction` block replayed its click (M3 result 6) |
| Host directives merging two instances | One `NfsMenu` on a Responsive-Menu-shaped host; `data-side` computed from the hosted `align()` (M3); `nfsMenu` written beside a root is the same directive (Menu D5) |
| A consumer's `[attr.align]` | First pass lost, later changes kept (M3 result 5); nothing in Foundation or the library selects `[align]` |
| A template writing the attribute on purpose | Nothing does: HTML defines no `align` hint for `ul` (evidence, WHATWG citations) |
| Firefox against Chromium and WebKit | The engines differ only while the attribute is present; the binding makes all three the same |
| Right-to-left regions | M2b's one visible case (a vertical menu, `align="left"`, RTL region of the LTR compile, text 241 px to 16 px) cannot arise, and `menu.md` line 531 becomes true for vertical menus too |
| Accessibility tree | No change with or without the attribute (M4) |
| Auditor, future contributor | `align="right"` reads as obsolete HTML and the binding as dead code: answered by the JSDoc, a source comment, and the SSR and browser assertions below |
| ADR 0045 | After the first release, a later rename would need a deprecation for one major. Accepted: no better name exists (option 3) |

It survives. Its only residue is nominal: the name matches an HTML attribute.

### Attack on option 2, keep `align` and document only the bound form

- `align="right"` still compiles. The type is a string union, and a static string matches it, so nothing stops the natural form, which Foundation's markup (`class="align-right"`) also suggests.
- A development warning (the Dropdown D13 shape) does not reach production, where the attribute keeps M2b's visible case and the computed `text-align` on every item and submenu in Chromium and WebKit (M2).
- It costs more text than option 1: 46 example lines in six specs change to `[align]="'right'"` (evidence, Options), and every story follows. It is the weakest option.

### Attack on option 3, rename

- `alignment`: measured to collide on `nfsDropdownMenu` and `nfsResponsiveMenu` (M3d): `"auto"` and `"center"` fail to compile, and `alignment="right"` would set both the Menu's class and the opening side. The alias form fails again when `nfsMenu` is written beside a root, which Menu D5 allows.
- `alignX`: measured to collide with `nfsFlexAlign`, which the Flexbox Utilities allow beside a menu: `"justify"` fails to compile, and `"right"` reaches both.
- A fresh name (`itemAlignment`, `menuAlignment`): no collision, but Foundation does not use it. Foundation's words are the class template `.align-*`, the Sass mixin `menu-align`, and the docs heading "Alignment", so the name breaks building-blocks 1.4 step 3 and P13 "every public name by a stated rule". It touches about 134 lines in eight specs plus ADR 0041, building-blocks, `CONTEXT.md`, and `map.md`. It also breaks the parallel `nfsMenu align` / `nfsFlexAlign alignX`, two names for the same `.align-*` class names.
- Its one technical advantage, no attribute to re-add at hydration, is worth nothing, because the class rule already depends on the same window (X2). ADR 0045 removes the deprecation cost of renaming now, not the naming cost.

### Position

Option 1. Keep `align`; `NfsMenu` binds `'[attr.align]': 'null'`; the static form stays the documented form, so no example changes.

### Strongest argument against, and the answer

Argument: ADR 0045 makes now the only cheap moment to rename. After the first release a rename costs a deprecated alias for a major, so keeping a name that shadows an HTML attribute freezes the shadow.

Answer: the freeze costs nothing measurable. With the binding, the name renders nothing in any engine or rendering mode (M3, M3c, X2). Every rename that the evidence measured collides on the same `ul`, and every other rename leaves Foundation's vocabulary. The cheap moment would be worth taking only for a name that exists, and none does.

### Quoted edits

`specs/menu.md`:

1. Line 164, the `align` row's Delta cell: replace "Named `align`, not `alignment`, because the Dropdown Menu's `alignment` Option sits on the same element (D12)" with:
   > Named `align`, not `alignment`, because the Dropdown Menu's `alignment` Option sits on the same element (D12); the directive removes the rendered `align` attribute (D15)
2. Line 169: replace "- Host: static `class="menu"`; `[class]` bound to the class record of the binding rule above. No attribute, no listener." with:
   > - Host: static `class="menu"`; `[class]` bound to the class record of the binding rule above; `'[attr.align]': 'null'`, which removes the `align` attribute that a static `align="..."` input attribute would otherwise leave on the `ul`, where Chromium and WebKit map it to an inherited `text-align` on every item and submenu (D15). No other attribute, no listener.
3. Line 248, Rendered HTML: replace "The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfsmenu=""`)." with:
   > The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfsmenu=""`), except `align`, which `NfsMenu` removes on the server and in the browser (D15).
4. Rendering modes, the "Full hydration" bullet (line 334): append:
   > Hydration's creation pass writes a static `align` back onto the server node, in the same pass that resets the `class` attribute to its static classes, and the first update pass removes it and restores the bound classes before any rendering update (measured in three engines, [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)).
5. Testing Decisions, browser-level test, the "Hosting" bullet (line 371): append:
   > A static `align="right"` leaves no `align` attribute on `nfsMenu`, on the test root, on the two-root host, and on the submenu-shaped host, while `align()` reads `'right'` and `.align-right` is set.
6. Testing Decisions, SSR smoke (line 378): after "no `role` attribute and no inline `style` from the directives;" insert:
   > no `align` attribute on any list, the static `align="right"` examples included;
7. Testing Decisions, e2e against the fixture app, the "Hydration" bullet (line 393): append:
   > and no list carries `align` after hydration.
8. D12 row (line 426): Rationale, append "; the rendered attribute is removed (D15)". Rejected alternative: replace "`alignment`" with:
   > `alignment`; `alignX` (the Flexbox Utilities' `nfsFlexAlign` may sit on the same `ul`: `alignX="justify"` fails to compile against the Menu's type and `alignX="right"` reaches both); a name Foundation does not use
9. New row after D14 (line 428):
   > | D15 | `NfsMenu` binds `'[attr.align]': 'null'` | A static input attribute stays on the element, and `align` on a `ul` is a presentational hint in Chromium and WebKit: an inherited `text-align` on every item, submenus included, which moves text in a vertical menu with `align="left"` inside a right-to-left region of an LTR compile (Firefox ignores it). One binding on the directive every root and submenu hosts covers them all. Measured with Angular 22.2 under server rendering, full and incremental hydration, and `@defer`; Angular Material's MatHint, MatDrawer, and MatSidenav bind the same ([Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)) | Renaming (`alignment` and `alignX` collide on the same `ul`; any other name leaves Foundation's vocabulary); documenting only the bound form `[align]` (the static form still compiles and renders the hint) |

Hosting specs (accordion-menu, drilldown-menu, dropdown-menu, nested-menu, responsive-menu): no edit. The binding belongs to the hosted `NfsMenu`, each spec's Rendered HTML already omits static input attributes, and none shows `align` in rendered output (the two server-HTML lines that name it, `responsive-menu.md` line 458 and `nested-menu.md` line 505, list classes only). `top-bar.md`: no edit; it names no `align` input. building-blocks 1.9, ADR 0041, `CONTEXT.md`, `flexbox-utilities.md`, `anchored-pane.md`: no edit, because the name stays. `media-object.md` D3 stands under the rule's first clause.

Map gist line (for the ticket's answer):

> - [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md) -- an input named like an HTML attribute keeps its name and its directive owns the attribute: bound from the input where it is the directive's output, bound to `null` where it acts on the host (the Menu family's `align`, the Slider container's `disabled`, the Slider handle's `readonly`), and every `autoFocus` null-binds `autofocus`, with a development report on the focusable Tabs list; renames were rejected because `alignment` and `alignX` collide on the menu `ul` and every other name leaves Foundation's vocabulary.

## Decision 3. The audit's other rows

### Slider container `disabled` (row 58)

- Position: `NfsSlider` binds `'[attr.disabled]': 'null'` (rule kind 2). The `.disabled` State class it already binds carries the look (`slider.md` line 139, line 254), so the attribute adds a second representation of one state and, in the `disabled="false"` form, the wrong one (M4: `opacity: 0.25` with the input `false`).
- Against: bind `[attr.disabled]` from the input, as the Accordion does (row 9). Answer: the Accordion has only Foundation's attribute selector for the state. The Slider has `.slider.disabled` too and chose the class; two writers for one state is what P11 rules out.
- Edits, `specs/slider.md`:
  - Line 139: append to the `.disabled` bullet:
    > `NfsSlider` binds `'[attr.disabled]': 'null'`, because a static `disabled` input attribute would otherwise stay on the container, where `.slider[disabled]` dims it even when the value is `false` (`disabled="false"`, measured in three engines).
  - Host bindings table (after line 254), new row:
    > | `[attr.disabled]` | `null`: removes a static `disabled` input attribute, whose `.slider[disabled]` would dim the container whatever the input's value | (the handle's own row below) |
  - SSR smoke and browser-level test: a container with static `disabled="false"` renders no `disabled` attribute and no `.disabled`, and its computed `opacity` is 1.

### Slider handle `readonly` (row 61)

- Position: `NfsSliderHandle` binds `'[attr.readonly]': 'null'` (rule kind 2). HTML says `readonly` must not be specified on a range input (X3). Foundation's `input[readonly]` paints the static form `#e6e6e6` with `cursor: not-allowed` (M4). The bound form never gets that look: `[formField]` sets the handle's declared `readonly` input, not the native property (`control_custom.ts` lines 46 to 58). So the look would depend on which binding form the consumer wrote. The state stays `aria-readonly` plus the handle's own key and pointer blocking (`slider.md` line 233).
- Against: the grey look is a readonly look worth keeping. Answer: then it belongs in the Library mixin, keyed on `[aria-readonly='true']`, so the look and the announcement have one source (P11). Whether the Slider wants one is the Slider spec's choice, not this ticket's.
- Edits, `specs/slider.md`:
  - Line 233, the `readonly` row's Notes: append:
    > ; it binds `'[attr.readonly]': 'null'`, because HTML says `readonly` must not be specified on a range input and Foundation's `input[readonly]` would paint a static `readonly` grey with `cursor: not-allowed`, a look the bound form never gets
  - Host bindings table (after line 262), new row:
    > | `[attr.readonly]` | | `null` |
  - Browser-level test: a handle with static `readonly` renders no `readonly` attribute, carries `aria-readonly="true"`, and blocks ArrowRight.

### Tabs `autoFocus` (row 64, corrected)

- Position: `NfsTabs` binds `'[attr.autofocus]': 'null'` and reports a static `autoFocus` in development; the spec documents `[autoFocus]="true"` and the Defaults token (rule kind 3, the Dropdown D13 shape). Evidence:
  - The list is focusable (`tabindex="-1"`, `tabs.md` line 316). A static `autoFocus`, or `autoFocus="false"`, focuses and scrolls to the list at page load in three engines (X1, X1c).
  - Before hydration and inside `hydrate never`, focus rests on the list rather than the selected tab. With `autoFocus="false"` it rests there for good.
  - The null binding fixes every server-rendered and prerendered page (the parser never sees the attribute; hydration's rewrite does nothing, X1b). It cannot fix a client-created tab set (X1), hence the development report.
- Against: rename the Options to spare the static form. Answer: `autoFocus` is Foundation's `data-auto-focus`, kept by Reveal D12 and Dropdown D13; the bound form is safe everywhere, and the report reaches every developer who writes the static form.
- Edits, `specs/tabs.md`:
  - Line 212: replace the last cell "Runs in the first render callback, not on window load" with:
    > Runs in the first render callback, not on window load. Set by binding (`[autoFocus]="true"`) or the Defaults token, never as a static attribute: a static `autoFocus` is also HTML's `autofocus` on a list that Aria's roving focus makes focusable (`tabindex="-1"`), and the browser focuses and scrolls to the list at page load, `autoFocus="false"` included (measured in three engines). The directive binds `'[attr.autofocus]': 'null'`, which keeps the attribute out of the server HTML; on a client-created list the browser acts on it when the list is inserted, before any binding runs, so a static attribute is reported in development
  - The dev-mode checks bullet (line 233): replace "a generated panel id while `deepLink` is on." with:
    > a generated panel id while `deepLink` is on; a static `autoFocus` attribute on the strip, read through `inject(new HostAttributeToken('autoFocus'), {optional: true})` in a field initialiser that runs only when `ngDevMode` is on, naming `[autoFocus]="true"` or the Defaults token.
  - SSR smoke: a strip with static `autoFocus` renders no `autofocus` attribute. Browser-level test: the static attribute warns once; `[autoFocus]="true"` does not.
  - New row after D24:
    > | D25 | `autoFocus` keeps Foundation's name, binds `'[attr.autofocus]': 'null'`, and is set by binding or the Defaults token; a static attribute is reported in development | The strip is focusable, so HTML's `autofocus` would focus and scroll to it at page load (measured); the null binding covers server HTML; the report covers client-created strips, where the browser acts at insertion ([Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)) | Renaming the input (breaks the naming rule, as the Dropdown's D13 found); documenting the bound form without the binding (every server-rendered page with a static `autoFocus` loads scrolled to the strip) |

### Off-canvas `autoFocus` (row 33)

- Position: `NfsOffCanvas` binds `'[attr.autofocus]': 'null'`, with no development report. The static form stays documented (`off-canvas.md` line 661). The panel is never focusable (line 237; building-blocks 1.10), so the attribute measured to do nothing (M4). The binding keeps it out of the server HTML, so a consumer `tabindex` on the panel cannot turn a string-valued `autoFocus="first-heading"` into page-load focus. Impact LOW.
- Edit, line 237: append:
  > The directive binds `'[attr.autofocus]': 'null'`: a static `autoFocus` is also HTML's `autofocus`, which does nothing on the panel, which is never focusable, and the binding keeps it out of the server HTML.

### Reveal `autoFocus` (row 55)

- Position: already addressed; add the null binding and keep the removal before every show. The binding keeps `autofocus` out of the server HTML, so an open-at-first-paint non-modal Reveal is no longer focused by the parser before hydration. D22's host-focus branch then covers only client-created Reveals. The removal before `showModal()`/`show()` stays for a consumer's own `[attr.autofocus]`, which a null binding does not undo after the first pass (M3 result 5). Impact LOW.
- Edits, `specs/reveal.md`:
  - Line 279: replace "The directive removes its host's `autofocus` attribute before every `showModal()`/`show()`. A bound `[autoFocus]` renders no attribute." with:
    > The directive binds `'[attr.autofocus]': 'null'`, so the server HTML carries none, and still removes its host's `autofocus` attribute before every `showModal()`/`show()`, for a consumer's own `[attr.autofocus]`. A bound `[autoFocus]` renders no attribute.
  - Lines 436 to 438: replace the server comment with:
    > `<!-- server: <dialog id="confirm" class="reveal tiny" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-text" jsaction="...">; the null binding keeps autofocus out -->`

### Dropdown `autoFocus` (row 28)

- Position: D13 stands. Add `'[attr.autofocus]': 'null'` so a static attribute the development report missed stays out of the server HTML. Correct the measured claim: the pane is not focusable, so HTML's `autofocus` does nothing on it at load or inside a modal dialog, and acts only when a consumer gives the pane a `tabindex` (M4). Impact LOW.
- Edit, line 581, D13 Rationale: replace "a static `autoFocus` attribute is HTML's global `autofocus`, which the browser acts on at page load and in dialogs" with:
  > a static `autoFocus` attribute is HTML's global `autofocus`, which the browser acts on at page load and in a modal dialog once the pane is focusable (a consumer's `tabindex`); the directive binds `'[attr.autofocus]': 'null'` for the server HTML, and a client-created pane acts on it at insertion, so the static form is reported

### Rows the audit says no spec addresses, with nothing rendered

Rows 23 (Close Button `size`), 35 to 37 and 39 (Orbit `autoPlay`, `selected`, slide `value`, bullet `value`), 46 to 48 (Responsive Accordion Tabs `rules`, `label`, `selected`), and 56 to 57 (Slider `start`, `step`) do nothing on their hosts (W, M4). The rule needs no binding and no spec edit for them: the evidence audit is the record, and each spec's Rendered HTML already says that static input attributes render. The hosting specs' `align` rows (2 to 6) are covered by the Menu's binding.

## Decision 4. Triage under the map's rule

| Decision | Impact | Confidence | Outcome |
| --- | --- | --- | --- |
| 1. The general rule | HIGH: every later spec inherits it, and it fixes vocabulary | HIGH: measured in three engines and both rendering paths (M1 to M4, X1 to X3); follows the records' own precedents (Button `[attr.disabled]` on `<a>`, Accordion, Dropdown D13, Reveal D12) and Material's; contradicts no ADR (the Media Object's ban was a ticket proposal, and P9 marks the question pending) | Decided |
| 2. The Menu's `align` kept with `'[attr.align]': 'null'` | HIGH: a public input name in six specs, frozen by ADR 0045 after the first release | HIGH: the alternatives measured to collide or to leave Foundation's names; the one gap the evidence left (zone-based scheduling) is covered by X2, since the class rule shares the window | Decided |
| 3a. Slider container `disabled` null-bound | LOW: one host binding | HIGH (M4; the spec's line 139 already intends it) | Decided |
| 3b. Slider handle `readonly` null-bound | LOW | HIGH (X3, M4, Signal Forms source) | Decided |
| 3c. Tabs `autoFocus` null-bound with a development report | MEDIUM: a spec contract, reversible | HIGH (X1, X1b, X1c, three engines) | Decided; the evidence's row 64 is corrected |
| 3d. Off-canvas, Reveal, Dropdown `autoFocus` null-bound | LOW | HIGH | Decided |
| 3e. Rows with nothing rendered | LOW | HIGH | Decided, no edit |

No item is OPEN FOR HUMAN. One assistive-technology check stays unmeasured: how a screen reader announces the tab list the static `autoFocus` focuses. The fix removes that state, so the answer changes no decision.

## Summary

1. Rule: keep the name the naming order gives and let the directive own the attribute: bound from the input where it is the output, `'[attr.<name>]': 'null'` where the platform reads it (hints, Foundation selectors), and for `autofocus` the null binding plus a development report where the host can be focusable, because on the client the browser acts at insertion (X1).
2. Menu: keep `align`; `NfsMenu` binds `'[attr.align]': 'null'` (new D15, host line, Rendered HTML note, three test assertions); no example or hosting-spec edit; renames rejected (`alignment` and `alignX` measured to collide, other names leave Foundation's vocabulary).
3. Other rows: Slider container `disabled` and handle `readonly` null-bound; Tabs `autoFocus` null-bound with a development report (the evidence's row 64 is wrong: the list is focusable and a static attribute scrolls the page to it); Off-canvas, Reveal, and Dropdown null-bind `autofocus`; rows with nothing rendered need no edit.
4. Triage: 1 and 2 HIGH impact at HIGH confidence, decided; the rest LOW or MEDIUM at HIGH, decided; nothing OPEN FOR HUMAN.
