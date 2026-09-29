# Inputs named like HTML attributes: API design lens

Lens file for [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md). One of two lenses; an Opus judge decides after reading both. This file argues a position; it edits nothing else.

## Header

- Lens: API design, judged from the consumer's side: the clearest and most consistent public API across the library's families, read in templates and in IDE completion; how Angular Material, Angular Aria, and the CDK name the same kinds of inputs; what a rename costs a consumer against what keeping a name costs; and what an auditor can test. Written by Opus 5.5 in the Fable 5.1 seat. Date: 2026-09-28.
- Read: the ticket; the evidence `research/presentational-attribute-inputs.md` (M1 to M4, the 72-row audit, the three Menu options); `building-blocks.md` 1.3, 1.4, 1.9, 1.11; ADR 0039, ADR 0041, ADR 0044 (its un-prefixed-input clause), ADR 0045 (release policy: a rename decided before the first published release needs no deprecation); `architecture-guide.md` P9 and P13; `specs/menu.md` and the specs that host `NfsMenu` (accordion-menu, drilldown-menu, dropdown-menu, nested-menu, responsive-menu; top-bar has no `align` line); `specs/slider.md`; the `autoFocus` rows of `specs/off-canvas.md`, `specs/tabs.md`, `specs/reveal.md`, `specs/dropdown.md`; Foundation 6.9.0 `scss/components/_menu.scss` and `docs/pages/menu.md`; Angular components 22.2 sources for Material, Aria, and the CDK.
- The evidence's measurements are taken as facts, with one exception found by re-measuring (Decision 3, the Tabs row): audit row 64 says a static `autoFocus` on `ul[nfsTabs]` does nothing because "the list is not focusable", but the Tabs spec's own rendered HTML gives the list Aria's `tabindex="-1"` (`specs/tabs.md` lines 316 and 380), and with it the list is focused at page load in all three engines. The evidence's M4 probe used a bare `ul` without `tabindex`.
- New measurements (not committed): scripts in the session scratchpad folder `panel139/` (`x1-autofocus-removed.mjs`, `x2-tabs-autofocus.mjs`, `x3-reveal-autofocus.mjs`, `x4-reveal-later-open.mjs`), outputs in `D:/tmp/nfs-139-api/` (`x1-out.txt` to `x4-out.txt`). Playwright 1.63 from `D:/tmp/nfs-ct-prototype`, read-only: Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6. Plain DOM pages that reproduce Angular's order of work: client rendering sets an element's static attributes, inserts it, and only then runs the first update pass (host bindings) and the render callbacks; hydration never inserts, it sets the static attributes again on the server node. No server was started; no port was used.
- Also read to settle a point the evidence left implicit: the frame observer of M3b watched the client-rendered `@defer (on timer)` elements as well (`d-null` and `d-dropdown` are in its id list, `D:/tmp/nfs-139/m3b-frames.mjs` line 12, and every rendering update is checked against that list, line 58); none showed `align`. So the host-binding removal is measured for client insertion, not only for hydration.

What X1 to X4 measured, identical in the three engines unless noted:

| Case | Result |
| --- | --- |
| X1: a client-inserted `div tabindex="-1" autofocus`, the attribute removed in the same task or in a later task before the next frame | The `div` is focused: the browser takes an element as an autofocus candidate when it is inserted, and removing the attribute before the flush does not withdraw it |
| X1: a parsed `div tabindex="-1"` without the attribute, then `autofocus` set (and removed, or kept) with `setAttribute`, the shape of hydration | Focus stays on `body`: setting the attribute on a connected element registers nothing |
| X2: parsed `ul role="tablist" tabindex="-1" autofocus` (the Tabs strip's server HTML with a static `autoFocus`), also with `autofocus="false"` | The `ul` is focused at page load in both cases |
| X2: the same strip parsed without `autofocus` (the server HTML with `'[attr.autofocus]': 'null'`) | Focus stays on `body` |
| X2: the strip client-inserted with `autofocus`, the attribute removed in the update pass, no focus move (`autoFocus` false) | The `ul` is focused |
| X2: as above, then the directive focuses the selected tab before the flush (`autoFocus` true) | Chromium and Firefox: the tab keeps focus. WebKit: the `ul` is focused afterwards, over the directive's focus move |
| X3: parsed `dialog open autofocus` (a non-modal Reveal open at first paint, static `autoFocus`) | The dialog element is focused (as the Reveal's D22 records) |
| X3: parsed `dialog open` without the attribute | Focus stays on `body` |
| X3: the dialog client-inserted with `autofocus`, `open` set and the attribute removed in the update pass, then the directive focuses its `autoFocus` target | Chromium and Firefox: the target keeps focus. WebKit: the dialog element is focused afterwards |
| X4: a dialog client-inserted closed with `autofocus`, the attribute removed, opened later after a user click (`showModal()` and `show()`), the directive focusing its target | The target is focused: the candidate of a closed dialog is dropped at the first flush |

The rule that follows for the library: a host binding removes in time an attribute the browser reads when it computes style, layout, or the accessibility tree (a presentational hint, a Foundation attribute selector); it cannot remove in time, in client rendering, an attribute the browser acts on when the element is inserted (`autofocus` on a host that can take focus).

## Decision 1: the general rule for building-blocks 1.4

### Position

The name comes from 1.4's naming order, as for every other input; being an HTML attribute is not a reason to leave the order. What an HTML attribute name changes is the directive's duty: the directive that declares the input owns what its static attribute renders, so that `align="right"` and `[align]="'right'"` give the same page. Every input whose lowercased name is an HTML attribute is classed, on every host its spec allows, as Intended, Removed, Bound only, or Inert, and every class but Inert shows in the spec's host bindings and its SSR smoke test. A directive that may sit on any element keeps ADR 0044's `nfs` prefix, which is the same rule applied where no spec can list the hosts.

Neither of the ticket's two framings is enough on its own. "Never name an input after an HTML attribute that does something on its hosts" fights 1.4's first naming rule wherever Foundation's own Option is such an attribute: `data-auto-focus` is `autoFocus`, which acts on a dialog and on a focusable list, and `data-disabled` is `disabled`; the Dropdown's D13 and the Reveal's D12 already rejected renaming `autoFocus` for that reason. "Allow the name when the directive binds `[attr.<name>]` to `null`" is right for `align`, a presentational hint, but is not enough for `autofocus` (X1, X2, X3).

### Evidence

- The rendering facts: a static input attribute stays on the element (evidence, Question and M3 result 1); `'[attr.align]': 'null'` keeps it out of the server HTML and the first paint for every shape the Menu family uses, and no rendering update ever drew the hydration re-add or the client-insertion window (M3 results 1 to 4; M3b; `m3b-frames.mjs` lines 12 and 58); the bound form renders no attribute (M3c). The insertion-time limit is X1 to X3 above.
- How the neighbours name the same kinds of inputs:
  - Angular Material keeps HTML attribute names for inputs and makes the directive own the attribute where it acts: `MatHint` keeps `align: 'start' | 'end'` and binds `'[attr.align]': 'null'` (`src/material/form-field/directives/hint.ts` lines 19 to 25), as `MatDrawer` and `MatSidenav` still do (`drawer.ts` line 176, `sidenav.ts` line 56); `color`, `disabled`, and `value` are used freely on hosts where they do nothing. The one counter-example is `MatCardActions`, which keeps `align` without the binding and carries a TODO to rename it (`card.ts` lines 128 to 132), unresolved.
  - Angular Aria does the same with native state attributes: `ngAccordionTrigger` binds `'[attr.disabled]': '_pattern.hardDisabled() ? true : null'` (`src/aria/accordion/accordion-trigger.ts` line 53), and `ngCombobox` binds `'[attr.readonly]': '_pattern.nativeReadonly()'` (`combobox.ts` line 74), which is `''` only on an editable host and `null` otherwise (`private/combobox/combobox.ts` lines 111 to 113): the directive keeps `readonly` where it means something and removes it where it does not. Aria's `wrap`, `value`, and `disabled` on `ul` and `div` hosts are left as they render: Inert.
  - The CDK prefixes the inputs of directives that may sit on any element (`cdkDragDisabled`, `cdkListboxDisabled`, `cdkOptionDisabled`, `cdkMenuItemDisabled`: `drag-drop/directives/drag.ts` line 123, `listbox/listbox.ts` lines 124 and 313, `menu/menu-item.ts` line 73), and keeps bare names on its element-like directives (`CdkAccordionItem` `disabled`, `expanded`). That is ADR 0044's split between Utility attributes and class directives.
- The library's own precedents already follow the four classes: Intended with removal of a static value (the Accordion's `[attr.disabled]` on `ul`, audit row 9; the Button's `[attr.disabled]` `null` on `<a>`, `specs/button.md` line 182); Bound only (the Dropdown's D13 for `autoFocus`); Inert (33 audit rows); and the `nfs` prefix (ADR 0044, the Float Classes' D11, the Typography Helpers' D4).
- The audit gives each published input its class, so the rule is checkable today: 22 rows Intended, 6 rows the Menu family's `align`, 3 attribute-selector rows, 4 `autofocus` rows, 33 Inert, 4 never rendered (evidence, Audit totals).

### What an auditor can test

For every input of a spec whose lowercased name is in the WHATWG attribute index or its obsolete features (the evidence's 208 names, or `role`, or `aria-*`): read what the attribute does on each host the selector allows (WHATWG Rendering, Foundation's attribute selectors, and, for `autofocus`, whether the host can take focus); if it does anything, the spec's host bindings must show `[attr.<name>]` bound from the input or bound to `null`, a Bound-only input must also have its development check, and the SSR smoke test must assert the attribute's presence or absence for a fixture that writes it statically. An Inert input needs no text. Each check is a lookup in the spec, not a judgement.

### Strongest argument against, and the answer

Against: a rule that lets a name collide with an HTML attribute and then patches the rendering is more to learn than a rule that forbids the collision; the Media Object and the Typography Helpers already chose names that are no attribute, and a flat ban is the easiest rule to audit.

Answer: a flat ban cannot be applied without breaking 1.4's first naming rule, because Foundation's own Options include `autoFocus`, `disabled`, and `readonly`, and without breaking Angular's forms contract, which binds a custom control's `disabled` and `readonly` inputs by those names (`specs/slider.md` line 162). A ban scoped to presentational attributes would still leave `autofocus`, `disabled` under `.slider[disabled]`, and `readonly` under `input[readonly]` unanswered, so the library needs the ownership rule anyway; with it in place, a ban on top adds a second rule for one of its cases. The Media Object's `alignment` and the Typography Helpers' `nfsTextAlign` stay as they are: 1.4's order gave them those names (the docs' Section Alignment; the Utility attribute rule), so the new rule changes neither.

### Quoted edits

`building-blocks.md` 1.4, a new bullet after "Utility attributes (2026-09-28, ...)":

> - Inputs named like HTML attributes (2026-09-28, [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md)): an input takes its name from the order above even when that name, lowercased, is an HTML attribute (the WHATWG index or its obsolete features). A static input attribute stays on the element, so the directive that declares the input owns what it renders, and a static attribute and a binding of the same value give the same page. On every host its selector allows, the spec classes each such input as one of: Intended, the platform or ARIA attribute the input means, bound from the input, which also replaces a static value (`type` and `disabled` on the Button, `disabled` on the Accordion's `ul`); Removed, an attribute the browser applies through a presentational hint or a Foundation attribute selector, bound to `null` on the declaring directive's host (`'[attr.align]': 'null'` on `NfsMenu`, as Angular Material's `MatHint` and `MatDrawer` bind it), which keeps it out of the server HTML and the first paint, and, measured with Angular 22.2 in three engines, out of every rendering update, although hydration and client rendering carry it until the first update pass; Bound only, an attribute the browser acts on when the element is inserted, which a host binding removes too late in client rendering (`autofocus` on a host that can take focus; measured), so the input is set by binding or its Defaults token, the host also binds the attribute to `null`, and a static attribute is reported in development (the Dropdown pane's D13); or Inert, an attribute that does nothing on those hosts (`size`, `color`, `value`, `selected` on a `div`), left as it renders. Each input that is not Inert is named in the spec's host bindings, and the SSR smoke test asserts what a static attribute renders. A directive that may sit on any element keeps the `nfs` prefix of the Utility attributes instead, because no spec can class every host (ADR 0044).

`building-blocks.md` 1.11, the facts bullet "Hydration writes a located element's attributes again: ...", appended at its end:

> A static attribute that a directive removes with `'[attr.<name>]': 'null'` is absent from the server HTML; hydration writes it back onto the server node in the creation pass and the first update pass removes it again, as client rendering does between insertion and that pass, and no rendering update drew it in three engines (measured with Angular 22.2, zoneless, by [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md)). An attribute the browser acts on at insertion (`autofocus`) acts in client rendering before that pass.

`architecture-guide.md` P9, the Rule's last sentence ("Whether an input may be named after an HTML presentational attribute ... until the ticket resolves.") replaced by:

> An input named like an HTML attribute keeps the name its naming rule gives it, and its directive owns what the static attribute renders: bound from the input where the attribute is the one the input means, bound to `null` where the browser would apply it through a presentational hint or a Foundation attribute selector, set only by binding or its Defaults token (reported in development when static) where the browser acts on it at insertion, and left alone where it does nothing on the hosts the spec allows (building-blocks 1.4).

P9's Preferred gains `'[attr.align]': 'null'` on `NfsMenu`; its Avoided gains "a static input attribute that changes the host, such as `align` on a `ul` or `disabled` under `.slider[disabled]`, left in the DOM"; its Decided-by "the presentational-attribute question: pending ticket 139" becomes "building-blocks 1.4 (inputs named like HTML attributes)". The Decision framework's question 9 loses "A name that is also an HTML presentational attribute is pending ticket 139 (P9)." and gains "For a name that is also an HTML attribute, what does the static attribute render? (P9)". The last section's "Pending another ticket: P9's presentational-attribute question (ticket 139)." is deleted.

ADR 0044 needs no edit: its clause "the `nfs` prefix keeps a utility from capturing ... a native attribute (`width`, `height`)" is the any-element case of the new bullet. An ADR of its own is the judge's call; the rule is a building-blocks bullet of the same weight as the Utility attributes bullet, which got ADR 0044, so a short ADR ("A directive owns the attributes its inputs render") would keep the pairing.

## Decision 2: the Menu family's `align`

### Position

Keep `align`, and bind `'[attr.align]': 'null'` on `NfsMenu`. The ticket's reason to rename, that the static attribute realigns text, is answered completely by one host binding on the directive every root and submenu hosts; what remains is a naming question, and on naming `align` is the better public name.

### Evidence

- It works for every shape the family has: direct, hosted by a root, hosted through the Responsive Menu's two roots as one merged instance, `NfsSubmenu`, `@defer`, incremental hydration, `hydrate never`; the input still receives the value and the Base side still reads `align()`; no compile error, NG05xx, or hydration mismatch (M3 results 1 to 6). No rendering update drew the attribute, hydrated or client-inserted (M3b). One line covers six directives, because they all host the same `NfsMenu` (ADR 0041; `specs/menu.md` D5).
- The name follows Foundation's class template, which is the consumer's migration map: `class="menu align-right"` becomes `align="right"`, and the Menu's development check 1 already names `align` for a copied `align-right` (`specs/menu.md` line 181). Foundation's Sass mixin is `menu-align($alignment)` (`scss/components/_menu.scss` line 112).
- The candidate names each fail on the elements the Menu shares: `alignment` fails to compile on `nfsDropdownMenu` and `nfsResponsiveMenu` for `"auto"` and `"center"` and reaches both inputs for `left` and `right`; an alias on the roots fails again when `nfsMenu` is written beside a root, which D5 allows; `alignX` fails beside `nfsFlexAlign` for `"justify"` and reaches both for `"right"` (M3d).
- Precedent: Angular Material's `MatHint` (MDC era) kept `align` and bound `'[attr.align]': 'null'`; the older `MatCardActions` TODO to rename has stood unresolved (evidence, Citations). The library's recorded vocabulary is `align` in eight specs, ADR 0041, building-blocks 1.9, the map, and `CONTEXT.md` (evidence, Options: 134 lines in eight specs plus the records).

What each choice costs the consumer:

| | Keep `align` with the binding | Rename (the best candidate, `itemAlignment`) |
| --- | --- | --- |
| Migration from Foundation's markup | `align-right` is `align="right"`, guessable | `align-right` is `itemAlignment="right"`, learnt from the docs or the development warning |
| In templates | `<ul nfsMenu orientation="vertical" align="right">`; on a Dropdown Menu root `align="right" alignment="left"`, the pair Foundation's own markup has (`align-right` beside `data-alignment`) | `itemAlignment="right" alignment="left"`: the two names say which is which |
| Completion on `nfsDropdownMenu` | `align` and `alignment` side by side; a mix-up of `left` or `right` compiles, `center` and `auto` do not | `alignment` and `itemAlignment` |
| The static attribute | removed by `NfsMenu`; a consumer's own `[attr.align]` loses the first pass, which no menu needs | never an attribute to remove |
| After the first release (ADR 0045) | nothing to change | nothing to change |

### Strongest argument against, and the answer

Against: Foundation's docs name the dimension "Item Alignment" (`docs/pages/menu.md` line 47), so `itemAlignment` is not an invented name but 1.4 rule 3's "dimension Foundation's docs use"; it is no HTML attribute, collides with nothing the evidence's inventory lists (evidence, Option 3), and would end the `align` and `alignment` near-synonym pair on the Dropdown Menu, where `alignment="right"` and `align="right"` both compile and do different things. ADR 0045 makes this the one moment a rename is free: after the first release it costs a deprecation over a major, the cost that has kept `MatCardActions.align` in place for years. A name that needs a host binding to be harmless is a name the library would not pick from scratch.

Answer:

1. Rule 3 as the library applies it drops the element word from the docs' dimension: the Media Object's section input is `alignment` from the docs' "Section Alignment", not `sectionAlignment` (`specs/media-object.md` D3). Read the same way, "Item Alignment" gives `alignment`, which collides, and D12's fallback to the class stem is the recorded answer to that collision. `itemAlignment` would be the only Variant input in the library named by a docs heading with its element word kept.
2. The near-synonym pair is Foundation's, on the same element of Foundation's own markup (`class="dropdown menu align-right" data-alignment="left"`); keeping it keeps the one-to-one mapping from Foundation's class and Option to the library's inputs that AGENTS.md's naming philosophy asks for. Of the mix-ups, the typed unions reject `align="auto"` and `alignment="center"`; the left and right overlap remains, and the Dropdown Menu spec documents what each does (`specs/dropdown-menu.md` lines 309 and 509).
3. ADR 0045 lowers the cost of a rename to zero for consumers, but it does not make `align` wrong: the decision still rests on which name is better, and nothing measured shows a consumer-visible defect of `align` with the binding. The `MatCardActions` TODO shows a name Material could not fix after release because it had no binding; `MatHint` shows the fix Material chose when it could choose.
4. The binding is not a patch that only `align` needs: the Slider (Decision 3) and the Button's `<a>` host need the same kind of binding under names that cannot change, so the Menu's binding is one case of the rule, not an exception.

If the judge weighs item 2 of the argument against more heavily than the answer, the rename to take is `itemAlignment` (alias `NfsMenuItemAlignment`), made before the first release with no deprecation (ADR 0045), and swept through the lines the evidence counted: `menu.md` 24, `dropdown-menu.md` 33, `nested-menu.md` 30, `responsive-menu.md` 17, `drilldown-menu.md` 11, `accordion-menu.md` 10, `flexbox-utilities.md` 8 (dev check 4's message "is the Menu's align" and D7), `anchored-pane.md` 1, `building-blocks.md` 1.9 (the `align()` read, 7 lines), ADR 0041 (2), `map.md` (8), `CONTEXT.md` (1), with D12 rewritten to reject `align` for the attribute and `alignment` for the collision. It was not compile-probed; the evidence's inventory lists no input of that name on these elements.

### Quoted edits (keep `align`)

`specs/menu.md`:

- Line 169, "- Host: static `class="menu"`; `[class]` bound to the class record of the binding rule above. No attribute, no listener." becomes:

  > - Host: static `class="menu"`; `[class]` bound to the class record of the binding rule above; `'[attr.align]': 'null'`, so a static `align` input attribute sets the input and never stays on the list (D15). No other attribute, no listener.

- Line 164, the `align` row's Delta, "Named `align`, not `alignment`, because the Dropdown Menu's `alignment` Option sits on the same element (D12)" becomes:

  > Named `align`, not `alignment`, because the Dropdown Menu's `alignment` Option sits on the same element (D12); the host removes the static HTML `align` attribute (D15)

- Line 248, "The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfsmenu=""`)." becomes:

  > The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfsmenu=""`), except `align`, which `NfsMenu` removes on every host that has it, the menu Plugin roots and submenus included (D15).

- Line 334, "- Full hydration: class values equal the server's, so hydration changes no class; there is no structure to mismatch and no `ngSkipHydration` (rule 10)." becomes:

  > - Full hydration: class values equal the server's, so hydration changes no class; there is no structure to mismatch and no `ngSkipHydration` (rule 10). A static `align` is absent from the server HTML; hydration writes it back in the creation pass and the host binding removes it in the first update pass, before any rendering update (D15; building-blocks 1.11).

- Line 531, the RTL note, gains a sentence after "... `align="left"` gives `flex-start`, the region's right edge.":

  > This holds for vertical menus only because `NfsMenu` removes the static `align` attribute (D15): measured, a vertical menu, Accordion Menu, or Drilldown with the attribute beside `.align-left` in such a region draws its text at the left edge in Chromium and WebKit (from 241 px to 16 px in a 300 px item).

- Testing Decisions: the browser-level Class table bullet (line 369) gains "a static `align="right"` sets `.align-right` and leaves no `align` attribute on the host"; the Hosting bullet (line 371) gains "a static `align` on the test root, on the Responsive-Menu-shaped host, and on the submenu-shaped directive leaves no `align` attribute"; the SSR smoke (line 378) "no `role` attribute and no inline `style` from the directives" becomes "no `role` attribute, no `align` attribute (the fixture writes a static `align` on a plain menu and on a hosting root), and no inline `style` from the directives"; the e2e list against the Storybook build (after line 388) gains:

  > - Right-to-left alignment: in `menu--rtl`, a vertical menu written `align="left"` inside `dir="rtl"` keeps its link text at the start (right) edge in Chromium, Firefox, and WebKit, and its list carries no `align` attribute (the attribute would move the text to the left edge in Chromium and WebKit).

  and the `menu--rtl` story (line 363) gains that vertical menu.

- Design decisions table, a new row after D14:

  > | D15 | `NfsMenu` binds `'[attr.align]': 'null'`: a static `align` sets the input and never stays in the DOM, on every root and submenu that hosts it | `align` is HTML's obsolete presentational attribute, which Blink and WebKit map on every element: a static `align="right"` on a `ul` gives every item and submenu link an inherited `text-align`, and beside `.align-left` in a `dir="rtl"` region of an LTR compile moves a vertical menu's text to the left edge in Chromium and WebKit. The binding keeps the attribute out of the server HTML and the first paint; hydration and client rendering carry it only until the first update pass, and no rendering update drew it (measured with Angular 22.2 in three engines, [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)); one binding covers every hosting root and `NfsSubmenu`; Angular Material's `MatHint` and `MatDrawer` bind the same for their `align` (building-blocks 1.4, inputs named like HTML attributes) | Renaming the input: `alignment` collides on `nfsDropdownMenu`, `alignX` beside `nfsFlexAlign`, and `itemAlignment`, the docs' heading, leaves Foundation's class stem for a name no Foundation class uses (`other`); documenting the bound form `[align]` only (every static example keeps rendering the attribute, and a development warning never reaches production) (`platform-or-a11y`) |

- Optional, User Stories: "41. As an application developer, I want `align="right"` to leave no HTML `align` attribute on my list, so that Chromium and WebKit never realign my menu's text on their own."

Hosting specs (`accordion-menu.md`, `drilldown-menu.md`, `dropdown-menu.md`, `nested-menu.md`, `responsive-menu.md`): no edit required. Their examples keep `align="..."`; their rendered HTML already leaves static input attributes out; they inherit `NfsMenu`'s host bindings, and the Menu spec's hosting tests cover their shapes. `top-bar.md` has no `align` input. `flexbox-utilities.md`, ADR 0041, `building-blocks.md` 1.9, `map.md`, and `CONTEXT.md` keep `align` unchanged.

References that name [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md) as pending, to update when the answer lands (no change in substance): `specs/float-classes.md` D11 ("decides the general rule later"), `specs/typography-helpers.md` lines 14 and 385, and `architecture-guide.md` as quoted in Decision 1. `specs/media-object.md` D3 needs no edit: its name comes from the docs' Section Alignment by rule 3, and its reason for rejecting `align` still holds for a directive without the binding.

## Decision 3: the audit's other rows

### Slider container `disabled` (row 58): Removed

Foundation's `.slider[disabled]` fades the container whenever the attribute is there, `disabled="false"` included (M4), while the spec binds the state through `.disabled` and says `.slider[disabled]` "is not written" (`specs/slider.md` line 139); the rendered HTML note even says a static `disabled=""` matches that rule (line 352). A static input attribute writes it. `NfsSlider` binds `'[attr.disabled]': 'null'`, the Aria accordion trigger's and the Button's `<a>` form: one source (`.disabled`), and a static attribute and a binding give the same slider. Edits:

- Line 139, the sentence "Foundation's other selector for the state, `.slider[disabled]`, is not written: the class carries it, and a `disabled` attribute on a `div` means nothing to the platform." becomes:

  > Foundation's other selector for the state, `.slider[disabled]`, is never matched: the class carries the state, and `NfsSlider` binds `'[attr.disabled]': 'null'`, because a static `disabled` input attribute would otherwise stay on the container and `.slider[disabled] { opacity: 0.25; cursor: not-allowed }` would fade it even when `disabled="false"` makes the input `false` (measured in three engines, [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)).

- Host binding table (line 260), the `[attr.disabled]` row's `NfsSlider` cell, empty today, becomes "`null`: removes a static `disabled` input attribute, which Foundation's `.slider[disabled]` would match whatever the input's value".
- Line 352, the last sentence "A static `disabled=""` on the container also matches Foundation's `.slider[disabled]`, the same rule as `.slider.disabled`." becomes "The container's static `disabled` and a Handle's static `readonly` are not left in the DOM: the directives bind both to `null` (building-blocks 1.4)." and the parenthesised list of kept attributes drops `disabled=""`.
- SSR smoke (line 513) gains "a container written `disabled="false"` renders no `disabled` attribute and no `.disabled`, and a container written `disabled` renders `.disabled` and no `disabled` attribute".

### Slider handle `readonly` (row 61): Removed

A range input ignores HTML's `readonly` (M4: the value still moves, no read-only state in the accessibility tree), and the spec already carries the state as `aria-readonly` with blocked keys and pointer (line 233, D15), which is what `[formField]` produces, since Angular's forms write no native `readonly` on a custom control (line 162). A static `readonly` adds only Foundation's `input[readonly]` background and `not-allowed` cursor, a look the bound form and Signal Forms never get. Aria's combobox makes the same call (`nativeReadonly` is `null` on a host where `readonly` has no meaning). `NfsSliderHandle` binds `'[attr.readonly]': 'null'`. The alternative, binding `[attr.readonly]` from the input to give every readonly slider Foundation's form look, is a styling decision whose look on the library's slider was never measured (evidence, Open question 4), so it is not taken here. Edits:

- Line 233, the `readonly` row, appended: "; a static `readonly` input attribute is removed (`'[attr.readonly]': 'null'`), so Foundation's `input[readonly]` look never appears and a static attribute, a binding, and `[formField]` render alike".
- Host binding table, a new row after `[attr.aria-readonly]` (line 262): "| `[attr.readonly]` | | `null`: removes a static `readonly` input attribute, which a range input ignores and Foundation's `input[readonly]` would paint with `$input-background-disabled` and `cursor: not-allowed` |".
- SSR smoke (line 513) gains "a Handle written `readonly` renders `aria-readonly="true"` and no `readonly` attribute".

### `autoFocus` (rows 28, 33, 55, 64)

One name, four hosts, and the class depends on whether the host can take focus, because `autofocus` acts at insertion (X1):

- Tabs (row 64): Bound only. This corrects the evidence: the strip carries Aria's `tabindex="-1"` (`specs/tabs.md` lines 316 and 380), so a static `autoFocus`, any value, focuses the `tablist` itself at page load from the server HTML in three engines (X2), before hydration and for good inside `hydrate never`; `'[attr.autofocus]': 'null'` fixes the server-rendered page (X2), but in client rendering the list is still focused when `autoFocus` is false, and in WebKit even after the directive has focused the selected tab (X2). Edits:
  - Line 172, `NfsTabs` Host, gains "`'[attr.autofocus]': 'null'`".
  - Line 212, the `autoFocus` row's Delta, "Runs in the first render callback, not on window load" becomes:

    > Runs in the first render callback, not on window load. Set by binding (`[autoFocus]="true"`) or `nfsTabsDefaultsToken`, never as a static attribute: HTML lowercases it to the global `autofocus`, and the strip carries Aria's `tabindex="-1"`, so the browser would focus the `tablist` itself at page load, whatever the value; the host binds `[attr.autofocus]` to `null`, and a static attribute is reported in development (the Dropdown spec's D13)

  - Line 233, Dev-mode checks, gains: "a static `autoFocus` attribute on the strip, read with `HostAttributeToken('autoFocus')` in a field initialiser that exists only in development builds: bind `[autoFocus]="true"` or set it in `nfsTabsDefaultsToken`, because in client rendering the browser takes the list as an autofocus candidate when it is inserted, before the host binding removes the attribute".
  - Testing: the SSR smoke gains a strip written with a static `autoFocus`, asserting no `autofocus` in the server HTML; the development checks test gains its warning.
- Dropdown pane (row 28): Bound only already (D13, dev check 6). The rule adds one host binding, `'[attr.autofocus]': 'null'`, so a static attribute that reached production stays out of server HTML; line 253's "never as a static attribute, which would render HTML's global `autofocus` (dev check 6)" gains "; the host also binds `[attr.autofocus]` to `null`". D13 stands.
- Reveal (row 55): the removal before every show (lines 258, 279) covers a Reveal opened after load in every engine, with either form (X4). Two gaps remain, both for a Reveal open at its first render: the server HTML carries `autofocus`, so a non-modal one parsed open focuses the dialog element before hydration (X3; D22 moves focus off it only after hydration), and in client rendering WebKit focuses the dialog element after the first render callback has placed focus (X3). Edits:
  - `NfsReveal`'s host bindings gain `'[attr.autofocus]': 'null'`; the removal before every show stays, for a consumer's own `[attr.autofocus]`.
  - Line 279 becomes:

    > - Static `autoFocus`: HTML attribute names are case-insensitive, so `autoFocus="first-heading"` on the host is also the HTML `autofocus` attribute, which makes Firefox and WebKit focus the dialog itself when it is shown, and every engine focus a dialog parsed or inserted open. The host binds `'[attr.autofocus]': 'null'`, so the attribute never reaches the server HTML, and the directive still removes its host's `autofocus` before every `showModal()`/`show()`. A Reveal open at its first render takes `autoFocus` by binding or `nfsRevealDefaultsToken`: in client rendering the browser takes the dialog as an autofocus candidate when it is inserted, and WebKit focuses the dialog element after the first render callback has placed focus (measured in three engines, [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)); a static `autoFocus` on such a Reveal is reported in development (check 9). A Reveal opened after load works with either form. A bound `[autoFocus]` renders no attribute.

  - The alert-dialog server HTML comment (lines 436 to 438) drops `autofocus="#confirm-cancel"` and its "the directive removes the autofocus attribute before showModal()" clause.
  - Dev-mode checks (line 269) gain "(9) a static `autoFocus` attribute on a Reveal open at its first render, read with `HostAttributeToken('autoFocus')` in development builds only: bind `[autoFocus]` or set it in `nfsRevealDefaultsToken`"; the open-at-first-paint test (line 524) writes `autoFocus` bound and adds the warning case; the SSR smoke (line 543) asserts no `autofocus` on the alert dialog written with a static `autoFocus`.
  - D22 and D12 keep their substance; D12's "static attribute stripped" gains "and kept out of the server HTML".
- Off-canvas (row 33): Inert. The panel carries no `tabindex` (the spec drops Foundation's, line 116) and is never focused (line 237), and a non-focusable host with `autofocus` takes no focus and leaves a later `autofocus` its turn (M4). No binding. Line 237's cell gains: "; written as a static attribute (`autoFocus="first-heading"`, as the example at line 661 does), it also renders HTML's `autofocus`, which does nothing on the panel". If a later spec change gives the panel a `tabindex`, the row becomes Bound only.

### The rows no spec addresses

- Rows 2 to 6 (the hosting specs' `align`): covered by `NfsMenu`'s binding (Decision 2); no hosting-spec edit.
- Row 58 (Slider `disabled`) and row 64 (Tabs `autoFocus`): above.
- Row 33 (Off-canvas `autoFocus`): above, a one-clause note.
- Rows 23 (Close Button `size` on `button`), 35 (Orbit `autoPlay`), 36 (Orbit `selected`), 37 and 39 (Orbit slide and bullet `value`; the bullet is `type="button"`, which submits nothing), 46 to 48 (Responsive Accordion Tabs `rules`, `label`, `selected` on its element), 56 and 57 (Slider `start` and `step` on the container `div`): Inert. The rule asks nothing of them; their specs need no text. Row 47's `label` on a custom element is Inert in Chromium's accessibility tree; the evidence's Open question 5 (other assistive technology) stays open and does not change the class.

## Decision 4: triage under the map's rule

| # | Decision | Impact | Confidence | Why |
| --- | --- | --- | --- | --- |
| 1 | The ownership rule for building-blocks 1.4 (Intended, Removed, Bound only, Inert; `nfs` prefix for any-element directives) | HIGH: every later spec inherits it and it fixes how public names meet HTML | HIGH: measured in three engines and Angular 22.2 (M3, M3b, M3c, X1 to X4), matches Material's and Aria's shipped practice and the CDK's prefix split, and fits 1.4's naming order, ADR 0044, and the specs' own precedents (Button, Accordion, Dropdown D13); it contradicts no record (the Media Object's "never" rule was a proposal) | Decided |
| 2 | Menu family: keep `align`, `'[attr.align]': 'null'` on `NfsMenu` | HIGH: a public input on six directives, frozen at the first release (ADR 0045) | HIGH: the only new reason to rename (the attribute) is removed and measured removed; the name keeps D12, ADR 0041, and Foundation's class stem; the strongest alternative, `itemAlignment`, is answered above, and the rule 3 reading that would favour it contradicts the Media Object's recorded reading | Decided; `itemAlignment` named as the fallback if the judge disagrees |
| 3a | Slider container `'[attr.disabled]': 'null'` | LOW: one host binding, reversible, no API change | HIGH: measured (M4), matches the spec's stated intent (line 139) | Decided |
| 3b | Slider handle `'[attr.readonly]': 'null'` | LOW | HIGH: matches the spec's Signal Forms path and Aria's combobox; the Foundation-look alternative is unmeasured and not taken | Decided |
| 3c | Tabs `autoFocus` Bound only, with the null binding and a development check | MEDIUM: changes the documented form of a public input, reversible before release | HIGH: measured (X2), and it corrects the evidence's row 64 | Decided |
| 3d | Dropdown pane `'[attr.autofocus]': 'null'` beside D13 | LOW | HIGH | Decided |
| 3e | Reveal: null binding, and the bound form for a Reveal open at its first render with development check 9 | MEDIUM: narrows a supported static form in one case | HIGH for the binding (X3, parsed cases); the WebKit client-rendering case is measured in a DOM reproduction of Angular's order (X3), not in an Angular build | Decided |
| 3f | Off-canvas `autoFocus` Inert, one-clause note | LOW | HIGH (M4; the panel has no `tabindex`) | Decided |
| 3g | The Inert rows: no action | LOW | HIGH (W and M4 in the evidence) | Decided |

Nothing is OPEN FOR HUMAN from this lens.

## Summary

1. Rule: an input keeps the name 1.4's order gives it, and the directive owns what its static attribute renders: Intended, Removed (`[attr.x]` bound to `null`), Bound only (for `autofocus` on a focusable host, which acts at insertion), or Inert; any-element directives keep the `nfs` prefix. HIGH impact, HIGH confidence.
2. Menu: keep `align` and bind `'[attr.align]': 'null'` on `NfsMenu`; edits confined to `specs/menu.md` (host line, API row, rendered-HTML note, hydration bullet, RTL note, tests, D15); `itemAlignment` is the fallback if renamed. HIGH impact, HIGH confidence.
3. Rows: Slider container `'[attr.disabled]': 'null'`; Slider handle `'[attr.readonly]': 'null'`; Tabs `autoFocus` becomes Bound only (re-measured: the strip's Aria `tabindex="-1"` makes it focus at page load, correcting audit row 64); Dropdown adds the null binding to D13; Reveal adds the null binding and requires the bound form only when open at first render; Off-canvas gets a note; the Inert rows need nothing.
4. Triage: two HIGH-impact decisions, both at HIGH confidence; the rest LOW or MEDIUM; nothing left for the human.
