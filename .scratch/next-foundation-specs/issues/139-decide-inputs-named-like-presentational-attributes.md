# 139. Decide: inputs named like HTML presentational attributes

Type: grilling
Status: resolved
Blocked by: 102, 105, 106
Labels: wayfinder:grilling
Map: ../map.md

## Question

A directive input written as a static attribute stays on the element: Angular sets the input and also renders the attribute. The [Spec: Media Object](91-spec-media-object.md) ticket measured that a static `align="middle"` on a `div` centres the host's text in Chromium, Firefox, and WebKit, and that the published [Spec: Menu](85-spec-menu.md)'s static `align="right"` on its `ul` becomes an inherited `text-align: right` in Chromium and WebKit, while Firefox ignores it. The Menu's `align` input is hosted by every menu Plugin (Accordion Menu, Drilldown Menu, Dropdown Menu, submenus), and a dropdown submenu's items would inherit the right-aligned text. The Media Object named its input `alignment` instead and proposed a building-blocks 1.4 rule: never name an input after an HTML presentational attribute. `alignment` is already the Dropdown Menu's opening-side Option, so the Menu cannot take the same name.

Which rule does the library adopt, and what does the Menu family's `align` input become? Options to weigh include renaming (to which name, given `alignment` on `nfsDropdownMenu`), keeping the name and removing the rendered attribute with a host binding (`[attr.align]` bound to `null`, checked in server HTML, hydration, and all three engines), and keeping it with a documented `[align]` binding form.

## How to work it

1. Measure first, in Chromium, Firefox, and WebKit, with Foundation's CSS loaded and without it: a static `align` attribute on `ul`, `div`, `p`, `td`, and `img`, and what each does to the host and its descendants (`text-align`, float). Measure the host-binding removal under SSR and hydration with Angular 22.2 (server HTML, first paint, and after hydration), and whether a template's static attribute and a host attribute binding for the same name conflict.
2. Audit every published spec for inputs whose name is a presentational or otherwise behaving HTML attribute of its host element: `align`, `valign`, `size`, `color`, `width`, `height`, `border`, `type` (list styles on `ol` and `ul`), `start`, `hidden`, `nowrap`, `clear`, and any other the audit finds. List each input, its host elements, and the measured effect.
3. Run `/grill-with-docs` (self-grilling, both sides) over the rule and the Menu rename, under the map's triage rule. The Menu's name is HIGH impact: if the choice is not HIGH confidence, it goes to the user as OPEN FOR HUMAN.
4. Answer with the rule's quoted text for building-blocks 1.4, the Menu family's decision with every spec edit it needs (quoted replacement text), the audit table, and the map's gist line.

## Answer

Judge's ruling, 2026-09-28, AFK, over the evidence file `research/presentational-attribute-inputs.md` (cited "E", its measurements "M1" to "M4", its audit rows "row n") and the two lenses, `research/presentational-attribute-lens-api.md` (its experiments "API X1" to "API X4") and `research/presentational-attribute-lens-adversarial.md` ("ADV X1" to "ADV X3"). The judge weighed the arguments, not the votes, and ran no experiment of its own. Facts marked "verified" were re-read by the judge in the spec text or in the lenses' raw outputs (`D:/tmp/nfs-139-api/x2-out.txt`, `x3-out.txt`; `D:/tmp/nfs-139-adversarial/x1-out.txt`, `x2-out.txt`; not committed). Step 3 of How to work it (grilling both sides) ran as this panel, under the map's rule that trap-quadrant decisions go to a panel.

### Panel record

| Role | Model | Output |
| --- | --- | --- |
| Evidence (steps 1 and 2: measure and audit) | Opus 5.5 | `research/presentational-attribute-inputs.md` |
| API design lens | Opus 5.5, in the Fable 5.1 seat (Fable credit had run out) | `research/presentational-attribute-lens-api.md` |
| Adversarial lens | Opus 5.5 | `research/presentational-attribute-lens-adversarial.md` |
| Judge | Opus 5.5 | this Answer |

Caveat on the panel's shape: the map's panel rule asks for two adversarial seats, one against the current default and one against the alternative. Here one adversarial lens attacked the likely default first and then every alternative, and the API lens stated the strongest case against each of its own positions (the rename to `itemAlignment` among them). Every seat ran on one model family.

Both lenses re-measured the Tabs `autoFocus` row and found the evidence wrong there (row 64, corrected below), and both measured that a host binding removes `autofocus` too late in client rendering (API X1, X2; ADV X1; verified).

### Decisions

#### 1. The general rule (building-blocks 1.4)

Decision: no naming ban. An input keeps the name building-blocks 1.4's naming order gives it, even when that name, lowercased, is an HTML attribute. The directive that declares it owns what the static attribute renders, and the spec states one of four kinds for it: `output` (the attribute is what the input means there: bound from the input); `removed` (the browser reads it as a presentational hint or through a Foundation attribute selector: `'[attr.<name>]': 'null'`); `insertion` (the browser acts on it when the element is parsed or inserted, which is `autofocus`: every such input binds it to `null`, and where the host can take focus at insertion the spec documents the bound form and the Defaults token and reports a static attribute in development); or `inert` (it does nothing on the hosts the spec allows: no binding). Utility attributes keep ADR 0044's `nfs` prefix. The quoted text is under Changes to apply.

Evidence that carries it:

1. A static input attribute stays on the element and does there what HTML gives it (E Question; M1 to M4). `align` on a `ul` is a hint in Chromium and WebKit because their generic `HTMLElement` code maps it on every element (M1, with the Blink and WebKit source it cites).
2. `'[attr.align]': 'null'` keeps the attribute out of the server HTML and the first paint for every shape the Menu family has, and no rendering update drew the hydration re-add or the client-insertion window (M3 results 1 to 4, M3b). ADV X2 shows why this adds no new risk: the creation pass in which hydration writes the static attribute back also resets `class` to the static classes, and the same first update pass removes the attribute and restores the bound classes (verified: in Chromium `s-null` carries `align="right"` and `class="menu"` at +77 ms, then no `align` and `class="menu align-right"` at +84 ms; 0 of 231 frames showed a probe without its class). A scheduler that drew that window would break every class binding first, and ADR 0039's class rule already depends on it never being drawn.
3. The same binding cannot stop `autofocus`. In client rendering Angular sets static attributes before it inserts the element, and the browser takes it as an autofocus candidate at insertion however soon the attribute goes (ADV X1: removed in the same task, in a microtask, or in the next animation frame, the list is focused in three engines; verified). When the browser parses server HTML, the null binding does work (API X2 P3, X3 R2; ADV X1b). Hence the separate `insertion` kind.
4. A ban fails on the records. Rule 3 of the naming order requires `color` and `size` (17 audited inputs, presentational only on `font`, `hr`, text-like `input`, and `select`, which no spec allows as their hosts). Foundation's own Options include `autoFocus`, `disabled`, and `readonly` (AGENTS.md Design Philosophy 5; Reveal D12 and Dropdown D13 already rejected renaming `autoFocus`), and Angular's forms bind a custom control's `disabled` and `readonly` inputs by those names (`specs/slider.md` line 162). A ban scoped to the hosts also needs the same per-host measurement the binding rule needs, and the evidence got the Tabs host wrong without it (row 64).
5. The rule names what the neighbours and the library already do: Angular Material's `MatHint` keeps its `align` input and binds `'[attr.align]': 'null'` (`MatDrawer` and `MatSidenav` keep the same binding since 2016); Angular Aria's accordion trigger binds `[attr.disabled]` to `null` unless hard-disabled; the library's Button binds `[attr.disabled]` to `null` on `<a>`, and the Accordion binds `[attr.disabled]` from its input (E Citations).

Dissent not followed:

- API lens, "A directive that may sit on any element keeps the `nfs` prefix": not adopted. It contradicts the published specs, where class directives on any element carry un-prefixed `size`, `color`, and `autoFocus` (rows 13, 19 to 22, 27, 28, 41 to 44), and ADR 0044 scopes the prefix to Utility families. The adversarial lens's scope (Utility attributes keep the prefix) is adopted.
- API lens, "An Inert input needs no text": adopted for the specs already published, whose inputs the evidence's audit classes (row 64 corrected); a later spec states the kind of every such input, as the adversarial lens asks, because an auditor cannot tell an unexamined input from an `inert` one.
- Adversarial lens, the naming clause "where [the order] offers two Foundation words for one family and one of them is an attribute that acts on the host, the spec takes the other": not adopted. It has no case in the published specs: the Media Object's `alignment` is rule 3's name from the docs' Section Alignment, and `align` is no Foundation word for its `.middle` and `.bottom` (`specs/media-object.md` D3); in the Menu it changes nothing. Where it could ever apply, the `removed` binding already makes the attribute harmless.
- API lens, "a short ADR would keep the pairing": not adopted. Building-blocks 1.4 is the record of every naming rule; the Menu's reasons are its D15; ADR 0044 stands as written.
- The bans the ticket and the Media Object's proposal offered: rejected for point 4.

Triage: impact HIGH (every later spec inherits it, and it fixes how public names meet HTML). Confidence HIGH: measured in three engines and with Angular 22.2 (M1 to M4, API X1 to X4, ADV X1 to X3), reached by both lenses independently, the shipped practice of Material and Aria and the library's own Button, Accordion, and Dropdown precedents, and in contradiction with no ADR or building-blocks text (the Media Object's "never" rule was a proposal, and P9 marks the question pending). Decided.

#### 2. The Menu family's `align`

Decision: keep `align`, and `NfsMenu` binds `'[attr.align]': 'null'` (new Menu D15). The static form stays the documented form. No example, hosting spec, ADR, `building-blocks.md` 1.9, `map.md`, or `CONTEXT.md` line changes, and since the name stays, ADR 0045's deprecation rule never comes into play.

Evidence:

1. One binding on the directive that every root and submenu hosts covers all six directives (ADR 0041; Menu D5). Measured: direct, hosted by a root, through two roots as one merged instance, on a submenu, in `@defer`, in incremental hydration, and in `hydrate never`; the input still receives the value, and the Base side still reads `align()`; no compile error, no NG05xx, no mismatch (M3 results 1 to 6).
2. The one visible defect of the attribute, a vertical menu's text moved from the start edge to the left edge inside a `dir="rtl"` region of an LTR compile in Chromium and WebKit (M2b), cannot arise with the binding, and the spec's RTL note becomes true for vertical menus (`specs/menu.md` line 531, verified).
3. Every rename measured fails on an element the Menu shares: `alignment` fails to compile on `nfsDropdownMenu` and `nfsResponsiveMenu` for `"auto"` and `"center"` and sets both inputs for `left` and `right`; an alias on the roots fails again when `nfsMenu` is written beside a root, which D5 allows; `alignX` fails beside `nfsFlexAlign` for `"justify"` and sets both inputs for `"right"` (M3d).
4. The name maps Foundation's class stem one to one (`class="menu align-right"` is `align="right"`; the Menu's development check 1 already names `align` for a copied `align-right`, `specs/menu.md` line 181, verified), and Foundation's own markup pairs `align-right` with `data-alignment` on the Dropdown Menu's element, so the `align` and `alignment` pair is Foundation's.

Dissent not followed: the strongest argument the API lens stated against its own position, to rename to `itemAlignment` now, while ADR 0045 makes a rename free: the docs' heading is "Item Alignment", nothing would need removing, and on the Dropdown Menu `align="right"` and `alignment="right"` both compile and do different things. Weighed: the free window lowers the cost of a rename; it does not make the rename better. The library reads rule 3 without the element word (the Media Object's section input is `alignment`, not `sectionAlignment`), so the docs' heading gives `alignment`, which collides; `itemAlignment` would be the only Variant input named with its element word kept, and it would break the mapping from Foundation's `.align-*` classes that the Menu's development check and the parallel with `nfsFlexAlign`'s `alignX` rely on. The near-synonym risk is bounded by the typed unions (`align="auto"` and `alignment="center"` fail to compile) and documented in the Dropdown Menu spec (lines 309 and 509). With the binding, nothing measured shows a defect a consumer could see (ADV: the residue "is nominal"). Also not followed, by both lenses: documenting only the bound form `[align]` (the static form still compiles and renders the hint, and a development warning never reaches production).

Triage: impact HIGH (a public input on six directives, frozen at the first release). Confidence HIGH: the only reason to rename, the rendered attribute, is removed, and measured removed in three engines and two builds; the adversarial lens attacked this option first and it survived every attack (ADV Decision 2); the alternatives are measured to collide or to leave Foundation's words; it keeps D12, ADR 0041, and building-blocks 1.9 as recorded. Decided.

#### 3. The Slider rows (58, 61)

- Row 58, the container's `disabled`: `removed`. `NfsSlider` binds `'[attr.disabled]': 'null'`. Evidence: Foundation's `.slider[disabled]` fades the container to `opacity: 0.25` whenever the attribute is there, `disabled="false"` included (M4), while the spec carries the state as the `.disabled` State class and says the attribute "is not written" (`specs/slider.md` line 139, verified); its Rendered HTML note already admits that a static `disabled=""` matches `.slider[disabled]` (line 352, verified). Not followed: binding `[attr.disabled]` from the input, as the Accordion does; the Slider already has `.slider.disabled` as its one source, and two writers for one state is what P11 rules out (ADV). Triage: impact LOW (one host binding, no API change), confidence HIGH. Decided.
- Row 61, the Handle's `readonly`: `removed`. `NfsSliderHandle` binds `'[attr.readonly]': 'null'`. Evidence: HTML says `readonly` must not be specified on a range input and does not apply (ADV X3, WHATWG Range state), and the value still moves (M4); Foundation's `input[readonly]` paints the static form `#e6e6e6` with `cursor: not-allowed` (M4), a look the bound form and `[formField]` never get, because Signal Forms sets the directive's `readonly` input, not the native attribute (ADV, `control_custom.ts` lines 40 to 60). The state stays `aria-readonly` with the Handle's key and pointer blocking (line 233, D15). Not followed: binding `[attr.readonly]` from the input to give every readonly slider Foundation's form look (unmeasured on the library's slider, E Open question 4; if wanted, it belongs in `nfs-slider` keyed on `[aria-readonly='true']`, so the look and the announcement share one source). Triage: LOW, HIGH. Decided.

#### 4. The `autoFocus` rows (28, 33, 55, 64)

All four are `insertion`, and each directive binds `'[attr.autofocus]': 'null'`. Whether the spec also rules out the static form depends on whether its host can take focus when it is inserted.

- Tabs (row 64). The strip is focusable, because the hosted Aria `TabList` binds `tabindex="-1"` (`specs/tabs.md` lines 316 and 380, verified). A static `autoFocus`, any value, focuses the `tablist` and scrolls to it at page load in three engines, and with `autoFocus="false"` focus stays there for good (ADV X1, X1c; API X2 P1, P2; verified). The null binding fixes the server-rendered page (API X2 P3). In client rendering the list is focused anyway, and in WebKit even after the directive has focused the selected tab (API X2 C1, C2; verified). So: the null binding, the bound form and `nfsTabsDefaultsToken` documented, and a development report through `HostAttributeToken('autoFocus')` (new Tabs D25), the Dropdown's D13 shape. Both lenses agree. Triage: MEDIUM (it changes the documented form of a public input, reversible before the first release), HIGH. Decided.
- Reveal (row 55). The removal before every `showModal()` and `show()` stays and covers every Reveal opened after its first render, with either form (API X4: the browser drops a closed dialog's candidate at its first flush). The null binding keeps `autofocus` out of the server HTML, so the parser no longer focuses a non-modal Reveal parsed open (API X3 R1, R2). One case remains, a Reveal open at its first render in client rendering: WebKit focuses the dialog element after the directive's first render callback has put focus on the target (API X3 R4; verified), against building-blocks 1.10 and the APG. So the spec also documents the bound form for a Reveal open at its first render, with a new development check 9. Not followed: the adversarial lens's "add the null binding, LOW" alone, which did not measure that case, and its reading that D22's host branch "then covers only client-created Reveals": in client rendering the autofocus flush comes after the render callback, so that branch never sees the host focused. D22 stays as written, a harmless guard. Triage: MEDIUM (it narrows a supported static form in one case), HIGH: the parsed cases are measured in three engines; the WebKit client case is measured in a DOM reproduction of Angular's order rather than in an Angular build, and that order is confirmed from Angular's source (`shared.ts` lines 592 to 616, read by the adversarial lens) and by ADV X1's own timings. Decided.
- Dropdown pane (row 28). D13 stands (the bound form and development check 6) and gains the null binding. Its rationale and check 6 are corrected, as the adversarial lens asks: the pane has no `tabindex`, so HTML's `autofocus` does nothing on it at load or inside a modal dialog and leaves a later `autofocus` its turn (M4); it acts only once a consumer makes the pane focusable. Not followed: the API lens's "D13 stands" with its measured claim unchanged. Triage: LOW, HIGH. Decided.
- Off-canvas (row 33). The panel is never focusable (the spec drops Foundation's `tabindex`, `specs/off-canvas.md` line 116, and never focuses the panel, line 237; verified), so a static attribute does nothing there (M4), and the static form stays documented (line 661, verified). The null binding is added anyway, so that every input that renders `autofocus` has one binding an auditor checks by name, and because `autofocus="first-heading"` is not a valid value for a boolean attribute in the server HTML. Not followed: the API lens's `inert` with a note and no binding; the per-host focus judgement is the one the evidence got wrong for the Tabs strip, and a check by name does not depend on it. Triage: LOW, HIGH. Decided.

#### 5. The other audit rows

- Rows 2 to 6 (the hosting specs' `align`): covered by `NfsMenu`'s binding. No hosting-spec edit: their Rendered HTML already leaves static input attributes out, and the server HTML lines that name `align` (`nested-menu.md` line 505, `responsive-menu.md` line 458) list classes only (verified).
- The `inert` rows the audit found unaddressed (23, 35 to 37, 39, 46 to 48, 56, 57): no action (W, M4). Row 47's `label` on a custom element stays `inert` in Chromium's tree; E Open question 5 does not change its kind.
- The `output` and never-rendered rows: no action.

Triage: LOW, HIGH. Decided.

### Triage

| # | Decision | Impact | Confidence | Outcome |
| --- | --- | --- | --- | --- |
| 1 | The rule: the naming order picks the name; the declaring directive owns the rendered attribute by one of four kinds; no ban; Utility attributes keep the `nfs` prefix | HIGH | HIGH | Decided |
| 2 | The Menu keeps `align`; `NfsMenu` binds `'[attr.align]': 'null'` (D15) | HIGH | HIGH | Decided |
| 3a | Slider container `'[attr.disabled]': 'null'` | LOW | HIGH | Decided |
| 3b | Slider Handle `'[attr.readonly]': 'null'` | LOW | HIGH | Decided |
| 4a | Tabs `autoFocus`: null binding, bound form, development report (D25) | MEDIUM | HIGH | Decided |
| 4b | Reveal `autoFocus`: null binding; bound form and check 9 for a Reveal open at its first render | MEDIUM | HIGH | Decided |
| 4c | Dropdown `autoFocus`: null binding; D13's measured claim corrected | LOW | HIGH | Decided |
| 4d | Off-canvas `autoFocus`: null binding; static form kept | LOW | HIGH | Decided |
| 5 | The `inert`, `output`, and never-rendered rows: no action | LOW | HIGH | Decided |

Nothing is OPEN FOR HUMAN. Left unmeasured, because no decision depends on them: zone-based scheduling (E Open question 1; the class bindings share the window, ADV X2), screen readers beyond Chromium's accessibility tree (E Open question 3), and Foundation's `input[readonly]` look on the library's slider (E Open question 4; the attribute is removed either way).

### The audit by kind

| Kind | Audit rows | Action |
| --- | --- | --- |
| `output` | 7 to 12, 15, 16, 24 to 26, 32, 38, 40, 52, 53, 59, 60, 66, 68 to 71 (23) | None: already bound. Row 15 is `removed` on its `<a>` host, where the Button binds `[attr.disabled]` to `null` |
| `removed` | 1 to 6, 58, 61 (8) | Menu D15; the Slider container and Handle |
| `insertion` | 28, 33, 55, 64 (4) | The null binding on all four; the bound form and a development report on 28 (D13), 55 (a Reveal open at its first render), and 64 (D25) |
| `inert` | 13, 14, 17 to 23, 27, 29 to 31, 35 to 37, 39, 41 to 48, 54, 56, 57, 62, 63, 65, 67, 72 (33) | None |
| Never rendered | 34, 49, 50, 51 (4) | None |

Row 9 (`disabled` on the Accordion's `ul`) moves from the evidence's attribute-selector group to `output`: Foundation's `.accordion[disabled]` look is the one the input means, and the directive binds it from the input.

### Changes to apply

Line numbers are those of the files at commit `5770c52`. Paths are relative to the effort root. Links inside quoted spec text are relative to `specs/`; inside `building-blocks.md` and `architecture-guide.md` they are relative to the effort root.

#### `research/presentational-attribute-inputs.md` (the row 64 correction)

1. Append at the end of the file:

   > ## Correction, 2026-09-28 (row 64)
   >
   > From the panel of [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md), measured by both lenses (`research/presentational-attribute-lens-api.md` X2; `research/presentational-attribute-lens-adversarial.md` X1, X1b, X1c). Row 64 is wrong: `ul[nfsTabs]` is focusable, because the hosted Aria `TabList` binds `tabindex="-1"` in its default roving mode (`specs/tabs.md` lines 316 and 380). M4's `ul autofocus` case used a bare `ul` without `tabindex`. With the host as the Tabs spec renders it, a static `autoFocus`, and `autoFocus="false"` too, focuses the `tablist` at page load and scrolls the page to it in Chromium, Firefox, and WebKit; without the attribute focus stays on `body`. In client rendering the list is focused even when the attribute is removed in the same task, in a microtask, or in the next animation frame, and in WebKit even after a script has focused the selected tab before the rendering update. Adding the attribute to a list already in the document focuses nothing. Read row 64's "What the rendered static attribute does there" cell as "The list carries Aria's `tabindex="-1"`, so the browser focuses the `tablist` at page load and scrolls to it, whatever the value; in client rendering it takes the list as an autofocus candidate at insertion, before any binding can remove the attribute", with evidence "M4 as corrected here" and "No" in the last column. The statements that follow from the row change with it: the Headline's "four render `autofocus`, which acts only on the Reveal's `dialog`" and the Totals' "only row 55 acts" read "rows 55 and 64 act", and the last Totals paragraph's "the Off-canvas and Tabs `autoFocus` rows (33, 64) render an `autofocus` that measured to do nothing on their hosts" reads "the Off-canvas row (33) renders an `autofocus` that measured to do nothing on its host, and the Tabs row (64) one that focuses the strip". Rows 28 and 33 stand: neither host gets a `tabindex`.

#### `building-blocks.md`

1. 1.4, a new bullet after the "Utility attributes (2026-09-28, ...)" bullet (line 79):

   > - Inputs named like HTML attributes (2026-09-28, [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md)): a static input attribute stays on the element (Angular sets the input and renders the attribute, which HTML lowercases), so an input whose lowercased name is an HTML attribute (in the WHATWG index or its obsolete features, `role`, or `aria-*`) also renders that attribute. The naming order above still picks the name. The directive that declares the input owns what the static attribute renders, so a static attribute and a binding of the same value give the same page, and the spec's input table states one kind for each such input, from what the attribute does on each host the spec allows, in Chromium, Firefox, and WebKit with Foundation's CSS:
   >   1. `output`: the attribute is what the input means there, a native or ARIA attribute or the Foundation attribute selector of the intended look. It is bound from the input, `null` when off, which also replaces a static value (`type` and `disabled` on the Button's `button`, `disabled` on the Accordion's `ul`).
   >   2. `removed`: the browser reads it from the element's current attributes, as a presentational hint or through a Foundation attribute selector. The declaring directive binds `'[attr.<name>]': 'null'`, as Angular Material's `MatHint` does for its `align` (the Menu's `align`, the Slider container's `disabled`, the Slider Handle's `readonly`). The binding keeps the attribute out of the server HTML and the first paint; hydration and client rendering carry it only until the first update pass, which also restores the bound classes, and no rendering update drew it (1.11).
   >   3. `insertion`: the browser acts on it when the element is parsed or inserted (`autofocus`). Every such input binds `'[attr.autofocus]': 'null'`, which keeps it out of the server HTML, and hydration's rewrite onto a node already in the document does nothing. In client rendering Angular sets static attributes before it inserts the element, and the browser takes the element as an autofocus candidate however soon the binding removes the attribute (measured in three engines). So where the host can take focus when it is inserted (the Tabs strip, which Aria's roving focus gives `tabindex="-1"`; a Reveal's `dialog` open at its first render), the spec documents the bound form and the Defaults token, and the directive reports a static attribute in development through `HostAttributeToken`, as the Dropdown pane's check 6 does.
   >   4. `inert`: the attribute does nothing on those hosts (`size`, `color`, `value`, or `selected` on a `div`): no binding.
   >
   >   A `removed` or `insertion` binding carries a source comment naming the effect it prevents, and the spec's SSR smoke writes the static form and asserts that the attribute is absent. The directive owns the attribute, so a consumer's own `[attr.<name>]` on the host is not supported (the host binding wins the first pass, and a later change of the consumer's value is written; measured). `research/presentational-attribute-inputs.md` classes the inputs of the specs published by 2026-09-28 (72 inputs, row 64 as corrected there); a later spec states the kind in its input table. Utility attributes keep the `nfs` prefix (the bullet above), so none of them raises the question.

2. 1.11, Facts, a new bullet after the bullet "Hydration writes a located element's attributes again: ..." (line 199):

   > - A static attribute that a directive binds to `null` (`'[attr.align]': 'null'`, 1.4) is absent from the server HTML. Hydration's creation pass writes it back onto the server node, in the same batch in which it resets the `class` attribute to the element's static classes, and the first update pass removes it and restores the bound classes; client rendering inserts the element with its static attributes and without its bound classes until that pass. No rendering update drew either window (measured with Angular 22.2, zoneless, in development and production builds, in Chromium, Firefox, and WebKit, for full and incremental hydration and client-rendered `@defer`, by [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md)), so a null binding adds no risk the class bindings do not already carry. An attribute the browser acts on at insertion (`autofocus`) acts in client rendering before that pass, so a null binding cannot stop it there (1.4).

#### `architecture-guide.md`

1. Decision framework, question 9 (line 42): replace "A name that is also an HTML presentational attribute is pending ticket 139 (P9)." with:

   > For a name that is also an HTML attribute, which kind is it on each host the spec allows, and what does the directive bind for it? (P9)

2. P9, Rule (line 150): replace the last sentence, from "Whether an input may be named after an HTML presentational attribute" to "until the ticket resolves.", with:

   > An input named like an HTML attribute keeps the name its naming rule gives it, and its directive owns what the static attribute renders, by the kind its spec states: bound from the input where the attribute is what the input means (`output`); bound to `null` where the browser would apply it as a presentational hint or through a Foundation attribute selector (`removed`); bound to `null`, and on a host that can take focus when inserted also set only by binding or the Defaults token with a development report, where the browser acts on it at insertion (`insertion`, `autofocus`); left alone where it does nothing on the hosts the spec allows (`inert`) (building-blocks 1.4; [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md)).

3. P9, Why (line 152), append:

   > A static input attribute stays on the element, so a name that is also an HTML attribute renders it: Blink and WebKit map `align` on every element to `text-align`, Foundation styles `.slider[disabled]` and `input[readonly]`, and the browser acts on `autofocus` when the element is inserted, before any host binding runs.

4. P9, Preferred (line 154): before the final period, append "; `<ul nfsMenu align="right">`, with `NfsMenu` binding `'[attr.align]': 'null'`; `<ul nfsTabs [autoFocus]="true">`".
5. P9, Avoided (line 155): before the final period, append "; a static input attribute that acts on its host left in the DOM (`<div nfsSlider disabled="false">`, faded by `.slider[disabled]`); a static `autoFocus` on a host that can take focus (`<ul nfsTabs autoFocus>`, which focuses the strip at page load)".
6. P9, Decided by (line 157): replace "the presentational-attribute question: pending ticket 139" with "building-blocks 1.4 (inputs named like HTML attributes) and 1.11 (the null-bound attribute at hydration); Menu spec, D15".
7. P9, Sources (line 158): after "`research/presentational-attribute-inputs.md` (the measurements and the 72-input audit)" insert "; `research/presentational-attribute-lens-api.md` and `research/presentational-attribute-lens-adversarial.md` (the `autofocus` timing); `NC/src/material/form-field/directives/hint.ts:19-25`".
8. What this guide adds beyond the records (line 406): delete the sentence "Pending another ticket: P9's presentational-attribute question (ticket 139)." P9's new sentence restates building-blocks 1.4 and is not a rule new to the guide.

#### `specs/menu.md`

1. API table, the `align` row's Delta (line 164): replace "Named `align`, not `alignment`, because the Dropdown Menu's `alignment` Option sits on the same element (D12)" with:

   > Named `align`, not `alignment`, because the Dropdown Menu's `alignment` Option sits on the same element (D12); kind `removed` (building-blocks 1.4): the host removes the static HTML `align` attribute (D15)

2. Host (line 169): replace "- Host: static `class="menu"`; `[class]` bound to the class record of the binding rule above. No attribute, no listener." with:

   > - Host: static `class="menu"`; `[class]` bound to the class record of the binding rule above; `'[attr.align]': 'null'`, so a static `align="..."` sets the input and leaves no `align` attribute on the `ul`, where Chromium and WebKit would map it to an inherited `text-align` (D15). No other attribute, no listener.

3. Rendered HTML (line 248): replace "The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfsmenu=""`)." with:

   > The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM and in server HTML (serialised in lowercase, `nfsmenu=""`), except `align`, which `NfsMenu` removes on every host that carries the input, the menu Plugin roots and submenus included (D15).

4. Rendering modes, Full hydration (line 334), append:

   > A static `align` is absent from the server HTML; hydration's creation pass writes it back onto the server node, in the same pass that resets `class` to the static classes, and the first update pass removes it and restores the classes, before any rendering update (D15; building-blocks 1.11).

5. Story play, `menu--rtl` (line 363): replace "no class changes with direction." with "no class changes with direction; a vertical menu written `align="left"` in the same region keeps its link text at the start (right) edge, and its list carries no `align` attribute (D15)."
6. Browser-level test, Class table (line 369): before the final period, append "; a static `align="right"` sets `.align-right`, `align()` reads `'right'`, and the host carries no `align` attribute".
7. Browser-level test, Hosting (line 371), append:

   > A static `align="right"` leaves no `align` attribute on `nfsMenu`, on the test root, on the two-root host, and on the submenu-shaped host, while `align()` reads `'right'` and `.align-right` is set.

8. SSR smoke (line 378): replace "no `role` attribute and no inline `style` from the directives;" with "no `role` attribute, no `align` attribute (the Rendered HTML examples write a static `align="right"` on a plain menu and on a Dropdown Menu root), and no inline `style` from the directives;".
9. Playwright e2e against the static Storybook build, a new bullet after Reflow (line 388):

   > - Right-to-left alignment: in `menu--rtl`, the vertical menu written `align="left"` inside `dir="rtl"` keeps its link text at the start (right) edge in Chromium, Firefox, and WebKit, and its list carries no `align` attribute (the attribute would move the text to the left edge in Chromium and WebKit; D15).

10. Playwright e2e against the fixture app, Hydration (line 393): before the final period, append "; the plain menu, written with a static `align="right"`, carries no `align` attribute in the server HTML or after hydration".
11. D12 (line 426): the Rationale cell gains, at its end, "; the rendered HTML attribute is removed (D15)", and the Rejected alternative cell "`alignment`" becomes:

    > `alignment`; `alignX` (the Flexbox Utilities' `nfsFlexAlign` may sit on the same `ul`: `alignX="justify"` fails to compile against the Menu's type and `alignX="right"` reaches both, measured by [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)); a name Foundation does not use (`itemAlignment`, which drops the class stem)

12. Design decisions, a new row after D14 (line 428):

    ```markdown
    | D15 | `NfsMenu` binds `'[attr.align]': 'null'`: a static `align` sets the input and never stays in the DOM, on a plain menu and on every menu Plugin root and submenu that hosts the directive (building-blocks 1.4, kind `removed`) | A static input attribute stays on the element, and Blink and WebKit map `align` on every HTML element to `text-align`: a static `align="right"` on a `ul` gives every item and submenu link an inherited `text-align: right`, and beside `.align-left` in a `dir="rtl"` region of an LTR compile it moves a vertical menu's text from the start edge to the left edge (241 px to 16 px in a 300 px item) in Chromium and WebKit; Firefox ignores it. The binding keeps the attribute out of the server HTML and the first paint; hydration and client rendering carry it only until the first update pass, which also restores the bound classes, and no rendering update drew it; the input still receives the value and the Base side still reads `align()`; one binding covers every root and `NfsSubmenu`, because they host this directive (measured with Angular 22.2 in three engines, [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)). Angular Material's `MatHint`, `MatDrawer`, and `MatSidenav` bind the same | Renaming the input: `alignment` and `alignX` collide on the same `ul` (D12, measured), and a name Foundation does not use (`itemAlignment`, from the docs' heading) leaves the class stem the migration maps from (`other`); documenting only the bound form `[align]`: the static form still compiles and keeps the hint, and a development warning never reaches production (`platform-or-a11y`) |
    ```

13. Notes, RTL (line 531): after "`align="left"` gives `flex-start`, the region's right edge." insert:

    > This holds for a vertical menu as well only because `NfsMenu` removes the static `align` attribute (D15): with the attribute beside `.align-left`, a vertical menu, Accordion Menu, or Drilldown in such a region draws its text at the left edge in Chromium and WebKit.

#### `specs/slider.md`

1. CSS class mapping notes, the `.disabled` bullet (line 139): replace "Foundation's other selector for the state, `.slider[disabled]`, is not written: the class carries it, and a `disabled` attribute on a `div` means nothing to the platform." with:

   > Foundation's other selector for the state, `.slider[disabled]`, is never matched: the class carries the state, and `NfsSlider` binds `'[attr.disabled]': 'null'` (building-blocks 1.4, kind `removed`), because a static `disabled` input attribute would otherwise stay on the container, where `.slider[disabled] { opacity: 0.25; cursor: not-allowed }` fades it even when `disabled="false"` makes the input `false` (measured in three engines by [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)).

2. `NfsSlider` input table, the `disabled` row (line 215): the Delta cell gains, at its end, "; kind `removed` on the container: `[attr.disabled]` is bound to `null`, so a static `disabled` never matches `.slider[disabled]`".
3. `NfsSliderHandle` input table, the `readonly` row (line 233): the last cell gains, at its end:

   > ; kind `removed`: the Handle binds `'[attr.readonly]': 'null'`, because HTML says `readonly` must not be specified on a range input and Foundation's `input[readonly]` would paint a static `readonly` with `$input-background-disabled` and `cursor: not-allowed`, a look the bound form and `[formField]` never get

4. Host binding table, the `[attr.disabled]` row (line 260): replace "| `[attr.disabled]` | | Present while disabled (container or handle) and not `disabledInteractive` |" with:

   ```markdown
   | `[attr.disabled]` | `null`: removes a static `disabled` input attribute, which Foundation's `.slider[disabled]` would match whatever the input's value | Present while disabled (container or handle) and not `disabledInteractive` |
   ```

5. Host binding table, a new row after `[attr.aria-readonly]` (line 262):

   ```markdown
   | `[attr.readonly]` | | `null`: removes a static `readonly` input attribute, which a range input ignores and Foundation's `input[readonly]` would paint grey with `cursor: not-allowed` |
   ```

6. Rendered HTML (line 352): in the parenthesis "(`vertical=""`, `disabled=""`, `positionvaluefunction="log"`)" drop "`disabled=""`, ", and replace the last sentence "A static `disabled=""` on the container also matches Foundation's `.slider[disabled]`, the same rule as `.slider.disabled`." with:

   > A static `disabled` on the container and a static `readonly` on a Handle are not left in the DOM: `NfsSlider` binds `[attr.disabled]` and `NfsSliderHandle` binds `[attr.readonly]` to `null` (building-blocks 1.4, kind `removed`).

7. Browser-level test, Host binding table (line 495): before the final period, append "; a container written `disabled="false"` renders no `disabled` attribute and no `.disabled`, one written `disabled` renders `.disabled` and no `disabled` attribute, and a Handle written `readonly` renders `aria-readonly="true"` and no `readonly` attribute".
8. SSR smoke (line 513): after "the dependent bounds already applied;" insert " a container written with a static `disabled` renders `.disabled` and no `disabled` attribute, and a Handle written with a static `readonly` renders `aria-readonly="true"` and no `readonly` attribute;".
9. D12 (line 579): the Decision cell gains, at its end, "; a static `disabled` input attribute on the container is removed by `'[attr.disabled]': 'null'` (2026-09-28), because `.slider[disabled]` would fade the container whatever the input's value".
10. D15 (line 582): the Decision cell gains, at its end, "; a static `readonly` input attribute is removed by `'[attr.readonly]': 'null'` (2026-09-28), because HTML says it must not be specified on a range input and Foundation's `input[readonly]` would give the static form a look the bound form never gets".

#### `specs/tabs.md`

1. API, `NfsTabs` (line 172): replace "Host: `class="tabs"`, `[class.vertical]` while `orientation()` is `'vertical'`, `[class.simple]`, `[class.primary]`:" with "Host: `class="tabs"`, `[class.vertical]` while `orientation()` is `'vertical'`, `[class.simple]`, `[class.primary]`, and `'[attr.autofocus]': 'null'` (D25):".
2. Input table, the `autoFocus` row (line 212): replace the Delta cell "Runs in the first render callback, not on window load" with:

   > Runs in the first render callback, not on window load. Kind `insertion` (building-blocks 1.4): set by binding (`[autoFocus]="true"`) or `nfsTabsDefaultsToken`, never as a static attribute, which HTML lowercases to the global `autofocus` on a strip that Aria's roving focus makes focusable (`tabindex="-1"`), so the browser would focus and scroll to the `tablist` itself at page load, whatever the value (D25)

3. Dev-mode checks (line 233): replace "a generated panel id while `deepLink` is on." with:

   > a generated panel id while `deepLink` is on; a static `autoFocus` attribute on the strip, read with `inject(new HostAttributeToken('autoFocus'), {optional: true})` in a field initialiser that runs only when `ngDevMode` is on, naming `[autoFocus]="true"` and `nfsTabsDefaultsToken` (D25).

4. Browser-level test, Dev-mode warnings (line 507): replace "and the copied-class cases above)" with "the copied-class cases above, and a static `autoFocus` on the strip, while a bound `[autoFocus]="true"` does not warn)".
5. SSR smoke (line 514): before the final period, append "; a strip written with a static `autoFocus` renders no `autofocus` attribute".
6. Design decisions, a new row after D24 (line 582):

   ```markdown
   | D25 | `autoFocus` keeps Foundation's name, binds `'[attr.autofocus]': 'null'`, and is set by binding or the Defaults token; a static attribute is reported in development (added 2026-09-28) | The strip carries Aria's `tabindex="-1"`, so HTML's `autofocus`, which a static `autoFocus` renders, focuses and scrolls to the `tablist` at page load in three engines, `autoFocus="false"` included, and before hydration and inside `hydrate never` focus stays there; the null binding keeps it out of the server HTML, and in client rendering the browser acts on it at insertion, before any binding runs (measured by [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md); building-blocks 1.4, kind `insertion`) | Renaming the input: breaks the naming rule, as the Dropdown's D13 found (`other`); the null binding without the report: a client-rendered strip is still focused, and in WebKit even after the directive has focused the selected tab (`platform-or-a11y`) |
   ```

#### `specs/reveal.md`

1. Input table, the `autoFocus` row (line 228): replace the Delta cell "New, Material's union without `'dialog'`" with "New, Material's union without `'dialog'`; kind `insertion` (building-blocks 1.4): the host binds `'[attr.autofocus]': 'null'` (Focus, Static `autoFocus`)".
2. Dev-mode checks (line 269): replace "check 6 at open, and check 7 at close." with "check 6 at open, check 7 at close, and check 9 in the first render callback.", and append after check (8)'s closing "(building-blocks 1.4, the initial-state rule; the Button spec's copied-class check)." the text:

   > (9) A static `autoFocus` attribute on a Reveal open at its first render, read with `HostAttributeToken('autoFocus')` in a field initialiser that exists only in development builds: "bind [autoFocus] or set it in nfsRevealDefaultsToken: in client rendering the browser acts on the autofocus attribute when the dialog is inserted, before the directive removes it".

3. Focus, the Static `autoFocus` bullet (line 279): replace the whole bullet with:

   > - Static `autoFocus`: HTML attribute names are case-insensitive, so `autoFocus="first-heading"` on the host is also the HTML `autofocus` attribute, which makes Firefox and WebKit focus the dialog itself when it is shown, and every engine focus a dialog parsed or inserted open. The host binds `'[attr.autofocus]': 'null'` (building-blocks 1.4, kind `insertion`), so the attribute never reaches the server HTML, and the directive still removes an `autofocus` attribute from its host before every `showModal()`/`show()`, which covers a consumer's own `[attr.autofocus]`. A Reveal opened after its first render works with either form: the browser drops the candidate of a closed dialog. A Reveal open at its first render takes `autoFocus` by binding or `nfsRevealDefaultsToken`: in client rendering the browser takes the dialog as an autofocus candidate when it is inserted, before the binding runs, and WebKit then focuses the dialog element after the first render callback has placed focus (measured in three engines by [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)); dev check 9 reports a static `autoFocus` there. A bound `[autoFocus]` renders no attribute.

4. Rendered HTML, the alert dialog's server comment (lines 436 to 438): replace it with:

   > `<!-- server: <dialog id="confirm" class="reveal tiny" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-text" jsaction="...">; the host binding keeps the static autoFocus out of the HTML -->`

5. Browser-level test, Open at first paint (line 524): after "and the attribute is gone" insert ", and dev check 9 warns once (a bound `[autoFocus]` does not warn)".
6. SSR smoke (line 543): before the final period, append "; the alert dialog written with a static `autoFocus` carries no `autofocus` attribute".
7. D12 (line 605): replace the Decision cell "`autoFocus` union without `'dialog'`, a descendant `autofocus` honoured, static attribute stripped" with "`autoFocus` union without `'dialog'`, a descendant `autofocus` honoured, the static attribute kept out of the server HTML by `'[attr.autofocus]': 'null'` and stripped again before every show; on a Reveal open at its first render, set by binding or the Defaults token (dev check 9, 2026-09-28)".

#### `specs/dropdown.md`

1. Input table, the `autoFocus` row (line 253): the Delta cell gains, at its end, "; kind `insertion` (building-blocks 1.4): the host also binds `'[attr.autofocus]': 'null'`, so a static attribute never reaches the server HTML".
2. Dev-mode checks, check 6 (line 281): replace "(6) a static `autoFocus` attribute on the host (read with `HostAttributeToken`): HTML attribute names are case-insensitive, so it renders as HTML's global `autofocus` attribute, which the browser acts on at page load and in a `<dialog>` it opens; bind `[autoFocus]="true"` or set it through the Defaults token instead;" with:

   > (6) a static `autoFocus` attribute on the host (read with `HostAttributeToken`): HTML attribute names are case-insensitive, so it also renders HTML's global `autofocus` attribute, which the host binding keeps out of the server HTML but which, in client rendering, the browser acts on when the pane is inserted, focusing the pane itself once it is focusable (a consumer's `tabindex`); bind `[autoFocus]="true"` or set it through the Defaults token instead;

3. SSR smoke (line 523): before "no Runtime check reports", insert "a pane written with a static `autoFocus` carries no `autofocus` attribute; ".
4. D13 (line 581): in the Rationale cell, replace "which the browser acts on at page load and in dialogs; a bound input renders no attribute" with:

   > which the browser acts on when the element is parsed or inserted, at page load and in a `<dialog>`, once the pane is focusable (a consumer's `tabindex`; measured: a pane without one takes no focus and leaves a later `autofocus` its turn); the host binds `'[attr.autofocus]': 'null'` (2026-09-28), which keeps a static attribute out of the server HTML, but a client-rendered pane is inserted with it, so the static form is still reported; a bound input renders no attribute

#### `specs/off-canvas.md`

1. Input table, the `autoFocus` row (line 237): before the cell's closing "|", append:

   > ; kind `insertion` (building-blocks 1.4): a static `autoFocus` (`autoFocus="first-heading"`, as the Usage example writes it) also renders HTML's `autofocus`, which does nothing on the panel, because the panel is never focusable, so the static form stays supported; the host binds `'[attr.autofocus]': 'null'`, which keeps the attribute, not a valid value for a boolean attribute, out of the server HTML

2. SSR smoke (line 547): before the final period, append "; a panel written with a static `autoFocus="first-heading"` carries no `autofocus` attribute".

#### Reference updates

1. `specs/float-classes.md`, D11 (line 329): replace "[Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md) decides the general rule later" with "the general rule is building-blocks 1.4's (inputs named like HTML attributes, [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)), and Utility attributes keep the `nfs` prefix, so the question does not arise here".
2. `specs/typography-helpers.md`, Out of Scope (line 421): replace "(the Menu's `align`, which [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md) decides)" with "(the Menu's `align`, kept with `'[attr.align]': 'null'` by [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md))".

#### Tickets, README, and map (orchestrator)

1. [Spec: Menu](85-spec-menu.md), a dated amendment:

   > ### Amendment, 2026-09-28 (inputs named like HTML attributes)
   >
   > From [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md), which holds the measurements, the panel record, and the triage; `specs/menu.md` was edited in place. The `align` input keeps its name (D12, whose rejected alternatives gain `alignX` and a name Foundation does not use), and `NfsMenu` binds `'[attr.align]': 'null'` (new D15, kind `removed` under building-blocks 1.4), so a static `align` sets the input and leaves no HTML `align` attribute on any menu, menu Plugin root, or submenu, in the server HTML or in the browser. Changed to match: the `align` row, the host line, the Rendered HTML note, the full-hydration bullet, the RTL note, and the tests (class table, hosting, SSR smoke, the `menu--rtl` story, a right-to-left e2e, the fixture's hydration check). The menu Plugin specs need no edit. Impact HIGH, confidence HIGH; nothing OPEN FOR HUMAN.

2. [Spec: Slider](32-spec-slider.md), a dated amendment:

   > ### Amendment, 2026-09-28 (inputs named like HTML attributes)
   >
   > From [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md); `specs/slider.md` was edited in place. `NfsSlider` binds `'[attr.disabled]': 'null'` and `NfsSliderHandle` binds `'[attr.readonly]': 'null'` (kind `removed` under building-blocks 1.4), because Foundation's `.slider[disabled]` fades a container written `disabled="false"`, and its `input[readonly]` paints a static `readonly` that a range input ignores. D12 and D15 are amended; the `.disabled` note, the two input rows, the host binding table, the Rendered HTML note, the host binding test, and the SSR smoke changed to match. Impact LOW, confidence HIGH.

3. [Spec: Tabs](16-spec-tabs.md), a dated amendment:

   > ### Amendment, 2026-09-28 (inputs named like HTML attributes)
   >
   > From [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md); `specs/tabs.md` was edited in place. `autoFocus` keeps its name and is kind `insertion` under building-blocks 1.4: `NfsTabs` binds `'[attr.autofocus]': 'null'`, the input is set by binding or `nfsTabsDefaultsToken`, and a static attribute is reported in development (new D25), because the strip carries Aria's `tabindex="-1"`, and a static `autoFocus`, `"false"` included, focuses and scrolls to the `tablist` at page load in three engines (the evidence's audit row 64 had judged the list not focusable). The host line, the `autoFocus` row, the dev-mode checks, and the tests changed to match. Impact MEDIUM, confidence HIGH.

4. [Spec: Reveal](18-spec-reveal.md), a dated amendment:

   > ### Amendment, 2026-09-28 (inputs named like HTML attributes)
   >
   > From [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md); `specs/reveal.md` was edited in place. `NfsReveal` binds `'[attr.autofocus]': 'null'` (kind `insertion` under building-blocks 1.4) and still removes the attribute before every show; a Reveal open at its first render takes `autoFocus` by binding or `nfsRevealDefaultsToken`, and a static attribute there is reported by new development check 9, because in client rendering WebKit focuses the dialog element after the first render callback has placed focus. D12 is amended and D22 is unchanged; the `autoFocus` row, the Static `autoFocus` bullet, the alert dialog's server comment, and the tests changed to match. Impact MEDIUM, confidence HIGH.

5. [Spec: Dropdown](26-spec-dropdown.md), a dated amendment:

   > ### Amendment, 2026-09-28 (inputs named like HTML attributes)
   >
   > From [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md); `specs/dropdown.md` was edited in place. D13 stands, and the pane also binds `'[attr.autofocus]': 'null'` (kind `insertion` under building-blocks 1.4). D13's rationale and development check 6 now say what was measured: the pane has no `tabindex`, so a static `autoFocus` acts only once a consumer makes the pane focusable. The `autoFocus` row and the SSR smoke changed to match. Impact LOW, confidence HIGH.

6. [Spec: Off-canvas](25-spec-off-canvas.md), a dated amendment:

   > ### Amendment, 2026-09-28 (inputs named like HTML attributes)
   >
   > From [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md); `specs/off-canvas.md` was edited in place. `NfsOffCanvas` binds `'[attr.autofocus]': 'null'` (kind `insertion` under building-blocks 1.4), which keeps a static `autoFocus="first-heading"` out of the server HTML; the panel is never focusable, so the static form stays supported and no development report is added. The `autoFocus` row and the SSR smoke changed to match. Impact LOW, confidence HIGH.

7. [Spec: Media Object](91-spec-media-object.md), a dated amendment:

   > ### Amendment, 2026-09-28 (inputs named like HTML attributes)
   >
   > [Decide: inputs named like HTML presentational attributes](139-decide-inputs-named-like-presentational-attributes.md) decided the rule that proposal 3 of this Answer offered for building-blocks 1.4: not a ban, but a duty of the declaring directive to own what the static attribute renders, by one of four kinds (building-blocks 1.4, inputs named like HTML attributes). Proposal 3 is superseded and not applied. D3 stands: `alignment` is building-blocks 1.4 rule 3's name from the docs' Section Alignment. The Menu's `align`, the consequence this Answer passed on, keeps its name with a null binding (Menu D15). No spec edit.

8. `README.md`, open list, item 7 of the class-rule wave (line 155): append "Resolved 2026-09-28: the rule is building-blocks 1.4's (inputs named like HTML attributes), and the Menu keeps `align`, which `NfsMenu` removes from the rendered HTML."
9. `map.md`, Decisions so far: add the gist line below.

### For the consistency review and the architecture audit

[Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md):

1. The Dropdown pane and the Off-canvas panel now both null-bind `autofocus` on hosts that cannot take focus, yet D13 rules out the static form (development check 6) while the Off-canvas documents it (its Usage example). The difference is deliberate: D13 is a published decision whose guard costs nothing in production, and the rule sets the report as a floor, not a ceiling. The review confirms the difference or aligns the two specs; LOW impact.
2. Reveal D22's branch "or on the host itself" no longer fires for a static `autoFocus`, which the null binding keeps out of the server HTML; it stays as a harmless guard, no edit.
3. Confirm after the edits that no spec's Rendered HTML or server-HTML comment shows an `align` or `autofocus` attribute that a directive now removes, and that the Slider's list of kept static input attributes no longer names `disabled=""`.
4. README item 7 and the guide's P9 and question 9 no longer say the question is pending.

[Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md):

1. P9 now rates the presentational-attribute clause. For the specs published by 2026-09-28, the kinds are the table "The audit by kind" above (the evidence's audit with row 64 corrected), and after the edits every `removed` and `insertion` row carries its binding and its SSR smoke assertion. The audit rates a spec against the kinds, not against a name ban, and does not rate a published `inert` row for a missing kind statement; a spec changed after 2026-09-28 that adds an input named like an HTML attribute states its kind.
2. For a new input, the Foundation attribute selectors to check are the ones the adversarial lens scanned in the three compiles: `disabled`, `type`, `data-whatinput`, `data-whatintent`, `title`, `href`, `readonly`, `multiple`, `for`, `aria-expanded`, `rows`, `hidden`, `draggable`, `data-responsive-menu`, and `aria-selected`.
3. The evidence's remaining open questions (zone-based scheduling, screen readers beyond Chromium's tree, Firefox's mapping traced only by measurement) change no kind and need no audit finding.

### Gist for Decisions so far

(Paths relative to the effort root.)

- [Decide: inputs named like HTML presentational attributes](issues/139-decide-inputs-named-like-presentational-attributes.md) -- decided by the panel: no naming ban; an input named like an HTML attribute keeps the name building-blocks 1.4's naming order gives it, and its directive owns what the static attribute renders, by one of four kinds its spec states: `output` (bound from the input), `removed` (`'[attr.<name>]': 'null'`: the Menu family's `align` on `NfsMenu`, new Menu D15, the Slider container's `disabled`, the Slider Handle's `readonly`), `insertion` (every `autoFocus` null-binds `autofocus`, and where the host can take focus when inserted, the Tabs strip and a Reveal open at its first render, it is set by binding or the Defaults token with a development report, because in client rendering the browser acts on it at insertion, before any binding runs), or `inert`; the Menu keeps `align`, because `alignment` and `alignX` measured to collide on the menu `ul` and any other name leaves Foundation's class stem; measured in three engines with Angular 22.2, the null-bound attribute never reaches the server HTML and is never drawn at hydration; the evidence's Tabs row is corrected (Aria's `tabindex="-1"` makes the strip focus at page load); impact HIGH, confidence HIGH; nothing OPEN FOR HUMAN; no ADR. Evidence: [research/presentational-attribute-inputs.md](research/presentational-attribute-inputs.md).
