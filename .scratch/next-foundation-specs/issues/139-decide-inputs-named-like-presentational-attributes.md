# 139. Decide: inputs named like HTML presentational attributes

Type: grilling
Status: claimed
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
