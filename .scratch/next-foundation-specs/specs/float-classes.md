# Spec: Float Classes

Ticket: [Spec: Float Classes](../issues/105-spec-float-classes.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Written under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)), in the stand-alone shape of the Utility directive rule of the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md).

## Problem Statement

A developer on Foundation for Sites who wants an element pushed to one side, or a fixed-width block centred, writes Foundation's Float Classes: `.float-left` and `.float-right` float the element (both `!important`, which Foundation's docs call out as one of its few uses of it), `.float-center` centres a block with automatic side margins ("it's not *really* a float", the docs say), and `.clearfix` on the parent makes it contain its floated children. Foundation's `foundation-float-classes` export mixin prints these four classes in every build, and `foundation-everything` always includes it. There is no Plugin, no Option, no responsive form, and no Sass setting. The markup contract leaves the hard parts to the author:

- A float toward the end of the reading direction reverses the order it shares a line with. Measured in Chromium, Firefox, and WebKit: two buttons written Save, Cancel, each with `.float-right`, are drawn Cancel, Save, while Tab reaches Save first, so keyboard focus moves right to left across a row that reads left to right; `.float-right` on Next followed by `.float-left` on Previous draws Previous first. In a `dir="rtl"` region two `.float-left` elements reverse the same way. WCAG 2.2 success criteria 1.3.2 and 2.4.3 depend on that order, and axe has no rule for it.
- A float on a flex or grid item does nothing: in a `.flex-container`, a `.float-right` child stays at the start (measured in three engines), and the computed `float` still reads `right` in Chromium and Firefox and `none` in WebKit. Foundation's own flex parents (the XY Grid, the Menu, the Button Group, the Media Object) make this easy to write and silent.
- `.clearfix` on a flex container contains nothing (its children cannot float), and its two `display: table` pseudo-elements become flex items. Foundation's clearfix gives them `order: 1` and `flex-basis: 0` for this case, which still leaves two items at the end of the row: measured in three engines, with `.align-justify` (`justify-content: space-between`) the second of two 100 px children ends 267 px short of a 600 px container's edge.
- `.float-center` centres only a box narrower than its container. A block with an `auto` width fills the line and does not move (measured). The docs say it "will only work on elements with an absolute width, which means not a percentage", but a percentage width centres too (measured: a 50% box in a 600 px container has 150 px on each side in three engines).
- `.float-center` sets `display: block`, and Foundation prints the float classes after normalize's `[hidden] { display: none; }` at the same specificity, so an element with both stays visible (measured in three engines).
- The classes are physical: `.float-left` stays on the left in a right-to-left page (the docs' warning; measured).
- The docs' example floats `<a class="button">` elements without `href`, which are neither links nor buttons and are not in the tab order, and its Float Center image has no `alt` (1.1.1).
- Under the library's class rule the developer writes no Foundation class at all, so the four classes need an Angular home.

A server-rendered application adds the usual second problem: whatever the Angular layer does must already be right in the server HTML, must not break hydration, and must leave the page laid out before hydration and inside dehydrated `@defer` blocks.

## Solution

One attribute directive, `NfsFloatClasses`, named after Foundation's `foundation-float-classes` export mixin, sets the four classes through two Utility attributes written where Foundation's docs write the classes: `nfsFloat="left"`, `nfsFloat="right"`, and `nfsFloat="center"` for `.float-left`, `.float-right`, and `.float-center`, and the boolean `nfsClearfix` for `.clearfix`. `nfsFloat` takes exactly Foundation's three names, so a misspelt name or a class name such as `nfsFloat="float-left"` fails to compile, and one element cannot ask to float and to centre at once. No value sets no class. The directive binds only its own classes, declares no listener, and adds no role, so it sits beside any library directive: `<button nfsButton nfsFloat="right">`, `<div nfsCallout nfsClearfix>`.

The DOM order is the reading and focus order. A developer who wants a group of controls at the far edge floats one element that holds them in reading order; in development builds the directive reports a float that follows a sibling floated toward the end of the reading direction when either holds focusable content, a float on a flex or grid item, a clearfix on a flex or grid container, and a copied Foundation class. Everything else is Foundation's CSS: there is no Library mixin and no Variant property, and the server HTML is the final DOM.

## User Stories

1. As an application developer, I want to write `nfsFloat="left"` and `nfsFloat="right"` where Foundation's docs write `.float-left` and `.float-right`, so that I float elements with the classes I know and write no Foundation class.
2. As an application developer, I want `nfsFloat="center"` for `.float-center`, so that I centre a fixed-width block or an image with the same attribute.
3. As an application developer, I want `nfsClearfix` on a container, so that it contains its floated children as Foundation's `.clearfix` does.
4. As an application developer, I want `nfsClearfix` to accept the bare attribute, `"true"`, `"false"`, and a bound boolean, and a misspelt value to fail to compile, so that it follows the library's typed Variant rules.
5. As an application developer, I want a misspelt `nfsFloat` value, an empty `nfsFloat`, or `nfsFloat="float-left"` to fail to compile, so that a typo or a copied class name never ships.
6. As an application developer, I want one attribute for the three placements, so that I cannot ask one element to float and to centre at once.
7. As an application developer, I want `nfsFloat` and `nfsClearfix` on one element, so that a floated box can also contain its own floated children.
8. As an application developer, I want the attributes beside component directives (`nfsButton`, `nfsCallout`, `nfsFormLabel`) and beside the Prototyping Utilities' attributes, so that composition works like Foundation's class list.
9. As an application developer, I want the attributes never to capture another directive's input or a native attribute, so that composition has no surprises.
10. As an application developer, I want a bound `nfsFloat` that changes to swap only its own class, so that my own classes and other directives' classes stay.
11. As an application developer, I want an unbound attribute to set no class, so that `[nfsFloat]="undefined"` changes nothing.
12. As an application developer migrating Foundation markup, I want a copied `class="float-right"` on an element that carries the directive to be reported in development, naming the attribute to write.
13. As an application developer, I want a development warning when a float follows a sibling floated toward the end of the reading direction and either holds focusable content, so that I do not ship a row whose focus order runs against its visual order.
14. As an application developer, I want the spec to show how to put a group of controls at the far edge in reading order, so that the recipe is one floated container, not one float per control.
15. As an application developer, I want a development warning when I float a flex or grid item, so that an alignment that does nothing is caught and I reach for the Flexbox Utilities instead.
16. As an application developer, I want a development warning when I put `nfsClearfix` on a flex or grid container, so that its pseudo-elements do not silently shift my `justify-content` spacing.
17. As an application developer, I want the spec to tell me that `nfsFloat="center"` needs a width narrower than the container, and that a percentage width works, so that I am not misled by Foundation's docs.
18. As an application developer, I want the spec to tell me that the `hidden` attribute does not hide an `nfsFloat="center"` element, and what does, so that hidden content stays hidden.
19. As an application developer building a right-to-left page, I want the spec to tell me that `left` and `right` are physical, and that the order check follows the reading direction, so that I choose the side on purpose.
20. As an application developer, I want the spec to name which utilities of other families override a float or a centring (`nfsDisplay`, horizontal margins, `nfsPosition`), so that I know what Foundation's cascade decides.
21. As a keyboard user, I want focus to move through floated controls in the order I see them, so that I can predict where it goes next.
22. As a screen reader user, I want floated content to be read in the order it makes sense, so that the page's meaning does not change with its layout.
23. As a user who zooms to 320 CSS px or enlarges text spacing, I want floated content and clearfix containers to wrap and grow, so that nothing overlaps or scrolls sideways.
24. As a developer of a server-rendered application, I want the server HTML to carry every float class the attributes set, so that the first paint is final and hydration changes nothing.
25. As a developer using `@defer (hydrate never)`, I want floats there to stay applied, so that static regions keep their layout without JavaScript.
26. As a developer of a zoneless application, I want the directive to need no zone.
27. As an application developer, I want to import the directive from its own entry point, so that a `@defer` block can split it.
28. As a Storybook author, I want to lay out story scaffolding with these attributes wherever Foundation has a float class, so that stories follow the class rule.
29. As a library maintainer, I want every behaviour asserted through classes, computed styles, geometry, focus order, and accessible names in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

The Float Classes have no Plugin, no `defaults` object, no `data-*` Options, no events, and no methods. The contract is Foundation's `foundation-float-classes` export mixin, the `clearfix` mixin it calls, its docs page, and the markup the docs show. Dropped options: none, because there are none.

| Class | Declarations | Notes |
| --- | --- | --- |
| `.float-left` | `float: left !important` | Physical: does not flip in a right-to-left page (the docs' warning). Does nothing on a flex or grid item, and computes to `none` on an absolutely or fixed-positioned element (CSS 2.1, 9.7) |
| `.float-right` | `float: right !important` | As `.float-left` |
| `.float-center` | `display: block; margin-right: auto; margin-left: auto` | Not a float and not `!important`: centres a block narrower than its container (an image, a fixed or percentage width); an `auto`-width block fills the line; does not reset a `float` another rule sets. Its `display: block` beats normalize's `[hidden]` by source order |
| `.clearfix` | `::before` and `::after`: `display: table; content: ' '`; `::after` also `clear: both`; under `$global-flexbox` (Foundation's default) both also get `flex-basis: 0; order: 1` | Nicolas Gallagher's micro clearfix, printed from Foundation's `clearfix` mixin. The host neither floats nor clears; it contains its floated children. On a flex or grid container the pseudo-elements are items |
| Sass-only helper | none | Foundation's `clearfix` mixin, which Breadcrumbs, Pagination, Tabs, the Top Bar, the Title Bar, and the Prototyping separator include in their own rules; no class, so no directive (Out of Scope) |

Every class is printed in every build: `foundation-everything` always includes `foundation-float-classes`, after every component and before the Flexbox, Visibility, and Prototype classes.

Docs conventions kept or corrected: the class-for-class attributes (kept, as Utility attributes); the Float Left/Right example's callout with a clearfix and two floated buttons (kept, as `nfsCallout nfsClearfix` with `nfsButton nfsFloat`; the `<a class="button">` elements without `href` become `<button>` elements, building-blocks 1.10); the Float Center image (kept, as an `NgOptimizedImage` image with `nfsFloat="center"` and an `alt`, 1.1.1); "only work on elements with an absolute width, which means not a percentage" (corrected: a percentage width centres too, and an `auto` width does not, measured); the right-to-left warning (kept, with the order check reading the direction, D8).

### CSS class to directive mapping

Every class is a Utility class. There are no Structural classes and no State classes, and no class is left for the consumer to write (ADR 0039).

| Foundation classes | Directive and Utility attribute | Type alias; Sass setting and Variant registry | Value shape | Class each value sets | Variant properties the Runtime check reads |
| --- | --- | --- | --- | --- | --- |
| `.float-left`, `.float-right`, `.float-center` | `NfsFloatClasses`: `nfsFloat` | `NfsFloatName`: `'left' \| 'right' \| 'center'`, closed (the export mixin writes the three classes itself; no setting) | a name | `'left'` sets `.float-left`, `'right'` `.float-right`, `'center'` `.float-center`; no value sets none | none (closed) |
| `.clearfix` | `NfsFloatClasses`: `nfsClearfix` | `NfsVariantBoolean` through `nfsVariantBoolean`, closed | a boolean | `true` sets `.clearfix`; `false` (default) sets none | none (closed) |

- Foundation generates no responsive form of any of the four classes, so neither attribute takes a Breakpoint query or rules object (building-blocks 1.4: a responsive form exists only where Foundation's classes do).
- Each value maps to exactly the class the table gives, and to nothing for a value that is not one of the three names (reachable only through a cast or `$any()`).

Other families' classes in this spec's examples and stories and in the examples of Foundation's Float Classes page, each set by its own directive written beside or around the utilities (building-blocks 1.14 item 2):

| Foundation classes | Kind | Element | Set by | Owner |
| --- | --- | --- | --- | --- |
| `.callout` | Another family's (the Callout) | The clearfix container of the Float Left/Right example; the centred call to action | `NfsCallout` (`[nfsCallout]`) | [Spec: Callout](../issues/89-spec-callout.md) |
| `.button` and its palette classes (`.primary`) | Another family's (the Button) | The floated buttons and the reading-order group's buttons | `NfsButton` (`button[nfsButton]`) with its `color` Variant input | [Spec: Button](../issues/37-spec-button.md) |
| `.grid-x`, `.cell`, the cell sizes (`.small-3`, `.small-9`) | Another family's (the XY Grid) | The Forms label-positioning example | `NfsGridX` (`[nfsGridX]`) and `NfsCell` (`[nfsCell]`) with its `size` Variant input | [Spec: XY Grid](../issues/99-spec-xy-grid.md) |
| `.middle` on a `label` | Another family's (the Forms) | The label of the Forms label-positioning example | `NfsFormLabel` (`label[nfsFormLabel]`) with its `middle` Variant input | [Spec: Forms](../issues/98-spec-forms.md) |
| `.width-50`, `.margin-left-1` | Another family's (the Prototyping Utilities) | The percentage-width box of `float-classes--float-center` and the Rendered HTML; the composition story's button and the floated figure of the usage examples | `NfsPrototypeSizing` (`nfsWidth="50"`) and `NfsPrototypeSpacing` (`nfsMarginLeft="1"`) | [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md) |

### The Utility directive rule, applied

The Float Classes take the stand-alone shape of the rule (clause 0). Each class styles whatever element carries it: a float needs no clearfix parent, a clearfix contains floats of any origin (the docs' buttons, an image, a component's own floated items), and `.float-center` needs neither. No class of the family modifies an element another class of it gives a role, so the roles shape (building-blocks 1.4's Structural class shape, the Flexbox Utilities' case) does not apply, and the templates do not together express one effect under `<words>-for-<bp>` names, so the one-effect shape (the Visibility Classes' case) does not either. Clause by clause:

1. Unit: one directive class for the one export mixin, `NfsFloatClasses`, which the rule's own example names. No class is qualified by element.
2. Utility attributes: two class templates, `.float-<v>` and `.clearfix`, give two inputs whose public names are also the directive's attribute selectors, `[nfsFloat], [nfsClearfix]`. Either creates the directive, and an element that carries both gets one instance.
3. Names: `.float-<v>` is `nfsFloat` (the stem is the utility's own word and the CSS property); `.float-center` fits that template, so it is `nfsFloat="center"`, although it sets no `float`; `.clearfix` has no value, so it is the boolean `nfsClearfix`. Both start with `nfs`, and neither is an HTML attribute: Angular renders them as `nfsfloat` and `nfsclearfix`, which no engine styles (D11).
4. Values: a closed union and a typed boolean (ADR 0040); no responsive form, because Foundation has none; no value sets no class.
5. Composition: one computed class list, no un-prefixed input, no listener, no role, name, or state.
6. Overlap: none within the family. The three placements are one attribute, so at most one of their classes is bound, and `.clearfix` styles only the host's pseudo-elements, so it never sets a property a placement sets. Across families Foundation's cascade decides, and the Notes name each pair (D12).
7. Ownership: the directive owns its development checks (1.3.2, 2.4.3, and the two no-effect cases). The entry point has no Library mixin, because it has no Open Variant family, no flag, no order to fix, and no compile-time check (ADR 0012, dated note: one that needs neither custom CSS nor checks has none).

### Hierarchy and DI shape

```
[nfsFloat], [nfsClearfix]      NfsFloatClasses
```

- One standalone directive with no template, no parent, no children, no Parent token, no providers, and no host directives. Nothing finds it through DI, and it finds nothing.
- No Defaults token: the family has no Options, and a Defaults token never holds a Variant input's default (building-blocks 1.4).
- Injection: `ElementRef` for the development checks; in development builds only, `HostAttributeToken('class')` (optional) for the copied-class check. No `nfsBreakpointsToken` (there is no responsive form) and no `nfsVariantCheck()` handle (there is no Variant property).
- Entry point: `ngx-foundation-sites/float-classes` (one per Foundation docs page). It exports `NfsFloatClasses` and `NfsFloatName`. `NfsVariantBoolean` and `nfsVariantBoolean` come from the primary entry point `ngx-foundation-sites`, as a type and one pure function.

### API

Standalone, no template, `exportAs: 'nfsFloatClasses'`, no model, no output, no method. Each attribute is an `input()` whose public name is the attribute (the class member drops the `nfs` prefix), declared with explicit type arguments that name the exported alias (building-blocks 1.4), with the JSDoc naming Foundation's class template and saying no Sass setting applies.

```ts
/** The placements of Foundation's `.float-<v>` classes, printed by `foundation-float-classes`; closed, no Sass setting. */
type NfsFloatName = 'left' | 'right' | 'center';

class NfsFloatClasses {
  /** Foundation `.float-left`, `.float-right` (`float: <v> !important`), `.float-center` (`display: block` and automatic side margins). */
  readonly float: InputSignal<NfsFloatName | undefined>; // 'nfsFloat'; default undefined: no class
  /** Foundation `.clearfix` (the `clearfix` mixin): the host contains its floated children. */
  readonly clearfix: InputSignalWithTransform<boolean, NfsVariantBoolean>; // 'nfsClearfix'; default false: no class
}
```

| Attribute | Transform | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `nfsFloat` | none | `undefined`: no class | `.float-left`, `.float-right`, `.float-center` | One attribute for three classes; a bare `nfsFloat` fails to compile |
| `nfsClearfix` | `nfsVariantBoolean` (never `booleanAttribute`, so `nfsClearfix="flase"` fails to compile) | `false`: no class | `.clearfix` | None |

- Host: one `[class]` binding to a `computed` list of the classes the two inputs set. The consumer's static classes, its own class bindings, and every other directive's classes stay, because Angular combines static classes and class bindings. No attribute, no style, no listener.
- A copied Foundation class is not stripped, because the list binds only the classes the inputs set (clause 5), so it keeps styling until removed; the development check reports it (D7).
- Development-mode checks, in the directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on (never on the server and never in a production build); each warns once per instance:
  1. Copied classes (D7), at the first render: a static class list that holds `float-left`, `float-right`, `float-center`, or `clearfix` warns, naming the attribute to write: "class="float-right" is set by nfsFloat: write nfsFloat="right" instead"; "class="clearfix" is set by nfsClearfix: write nfsClearfix instead". The consumer's own classes are not reported.
  2. Reversed order (D8), on every run while `nfsFloat` is `left` or `right`: when the parent element's computed `display` is not a flex or grid value, the host's computed `float` is `left` or `right`, its previous element sibling's computed `display` is not `none` and its computed `float` is the end side of the parent's computed `direction` (`right` for `ltr`, `left` for `rtl`), and the host or that sibling is or contains focusable content (`a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` other than `-1`, `[contenteditable]`, none disabled): "nfsFloat="right": this element follows a sibling floated right, so on a shared line it is drawn before that sibling in the reading direction while Tab and assistive technology reach it after (WCAG 1.3.2, 2.4.3). Float one element that holds both in reading order, or lay them out with the Flexbox Utilities." The side and direction in the message are the ones read.
  3. No effect (D9), on every run: `nfsFloat` `left` or `right` whose parent element's computed `display` is `flex`, `inline-flex`, `grid`, or `inline-grid`: "nfsFloat="right" does nothing on a flex or grid item; align it with the Flexbox Utilities (alignX on the parent, alignSelf on the item) instead". `nfsClearfix` on a host whose own computed `display` is one of those: "nfsClearfix on a flex or grid container contains no floats, because its children cannot float, and its two pseudo-elements become items that shift justify-content spacing; remove it". `nfsFloat="center"` is not reported there: automatic margins centre a flex item on the main axis (CSS Flexbox, section 8.1).
- Runtime checks: none. The family is closed and writes no Variant property, so the directive makes no `include()` or `value()` call, and a missing `foundation-float-classes` include is not reported (as for every Foundation export mixin, Out of Scope).

### Comparison with Angular Material (22.2)

Material and the CDK ship no float utilities: Material's components lay themselves out with flexbox and their own Sass, and `Directionality` covers reading direction for code. Angular's own tools for classes, `[class]` bindings and `NgClass`, put class names in the consumer's template, which the class rule forbids.

| Concern | Angular Material and CDK (22.2) | Float Classes |
| --- | --- | --- |
| Float or centring utilities | None | One directive over Foundation's four classes |
| Reading direction | `Directionality` for code; logical CSS in its components | Physical classes, as Foundation's; the order check reads the computed `direction` |
| Testing | Component harnesses | DOM-first assertions; no harness |

Borrowed: nothing; there is no counterpart. Not borrowed: `NgClass`-style class strings (ADR 0039).

### Implementation level and primitives

Implementation level: native platform. Floats, automatic margins, and the clearfix's table pseudo-elements are CSS; the order is the DOM's. `@angular/aria` has no pattern for layout helpers, and `@angular/cdk` adds nothing: `Directionality` reports the `dir` attribute, while float placement follows the computed `direction`, so the development check reads the computed style. The Angular layer is two `input()` signals, one `computed` class list, one host `[class]` binding, and a development-only render callback. No `effect`, no listener, no timer, no observer, no `Renderer2` write.

Fallback: none needed. The facts the design rests on (the reversed order and the real Tab order, the float on a flex item, the clearfix in a flex container, the percentage-width centring, the `hidden` attribute, the physical sides, and the HTML attributes the names avoid) were measured by this spec's ticket with Dart Sass 1.104.1 over Foundation 6.9.0 in Chromium 153, Firefox 155, and WebKit 26.6 through Playwright 1.63, with axe-core 4.13.0.

### ARIA and keyboard

APG pattern: none; the utilities are presentation.

| Element or state | Rendered semantics | Source |
| --- | --- | --- |
| Any `nfsFloat` host | The host's own role, name, and state; a float moves the box, never its place in the accessibility tree or the tab order | WHATWG HTML; HTML-AAM |
| `nfsClearfix` host | The host's own role and state. The pseudo-elements' `content: ' '` is generated content that accname includes: measured in Chromium 153 through the CDP accessibility tree, a `<button>` with the class is named " Save " and a link holding two floated spans " Read more ", so the visible label is still contained in the name (2.5.3). A clearfix belongs on a container, not on a control named from its content | CSS Generated Content; accname |
| `nfsFloat="center"` | The host's own semantics; `display: block` changes no role (an `img` stays an image and keeps its `alt`) | HTML-AAM |

| Key | Result | Owner |
| --- | --- | --- |
| Tab, Shift+Tab | Follows the DOM order whatever the floats draw; measured in three engines: two right-floated buttons are reached right to left, and one right-floated group holding them in reading order left to right | Native |

Focus: the directive moves no focus and never changes DOM order. Floated content keeps a DOM order that matches the order it is seen in the reading direction (1.3.2, 2.4.3); development check 2 reports the reversed pair.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. The cascade, geometry, and keyboard facts were measured by this spec's ticket in Chromium 153, Firefox 155, and WebKit 26.6 through Playwright 1.63.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 1.3.2 Meaningful Sequence; 2.4.3 Focus Order | Floated content is written in reading order, and a group of controls at the end of the line is one floated element holding them in that order; two floats never meet where the earlier one floats toward the end of the reading direction and either holds focusable content. `NfsFloatClasses` warns in development (check 2) | The docs' example (a left float, then a right float) passes; two right floats, or a right float before a left one, reverse the visual order against the Tab order (measured in three engines) | Play function of `float-classes--reading-order` walks Tab through the group and asserts each focused box starts to the right of the previous one; e2e does the same with real key presses in three engines; browser-level tests of check 2, right-to-left included |
| 1.4.10 Reflow | At 320 CSS px no float scrolls the page sideways: floated boxes shrink to fit and wrap to the next line; a floated box never has a fixed width wider than its container (documented); images keep Foundation's `max-width: 100%` | Foundation's examples fit | e2e at 320 by 640 px in three engines: `document.documentElement.scrollWidth` is at most 320 in `float-classes--float-left-right`, `--float-center`, and `--reading-order` |
| 1.4.12 Text Spacing | A clearfix container has no fixed height, so it grows with its floated content under the text spacing (documented) | Passes | e2e with the text-spacing stylesheet at 320 by 640 px: in `float-classes--float-left-right` the callout's bottom edge is at or below both buttons' |
| 1.1.1 Non-text Content | An image centred with `nfsFloat="center"` keeps its `alt` | The docs' Float Center image has none | axe `image-alt` in `float-classes--float-center` |
| 4.1.2 Name, Role, Value; 2.1.1 Keyboard | Floated controls are native buttons or links with `href` | The docs float `<a class="button">` elements without `href`, which are not in the tab order | The play function of `float-classes--float-left-right` finds both by `getByRole('button', {name})` |
| 1.4.3 Contrast (Minimum); 1.4.11 Non-text Contrast | The utilities draw nothing and change no colour | Passes | axe `color-contrast` in every story |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018).

### Rendered HTML

Consumer markup, then the server HTML. The hydrated DOM equals the server HTML: the directive declares no listener, so nothing adds `jsaction`. Class order is not significant; Angular also renders the attributes that feed inputs (`nfsfloat="left"`, `nfsclearfix=""`), and `NgOptimizedImage` its own image attributes, which the resulting DOM below leaves out, as the other specs do. `nfsCallout`, `nfsButton`, `nfsFormLabel`, `nfsGridX`, `nfsCell`, and the Prototyping Utilities' `nfsWidth` are their specs' directives, shown only to place the utilities beside them.

```html
<!-- Float Left/Right: Foundation's docs example, with buttons in place of anchors without href -->
<div nfsCallout nfsClearfix>
  <button nfsButton nfsFloat="left">Left</button>
  <button nfsButton nfsFloat="right">Right</button>
</div>

<div class="callout clearfix">
  <button class="button float-left" type="button">Left</button>
  <button class="button float-right" type="button">Right</button>
</div>

<!-- Float Center: an image, and a box with a percentage width -->
<img ngSrc="/voyager.jpg" width="400" height="300" alt="The Voyager spacecraft" nfsFloat="center" />
<div nfsFloat="center" nfsWidth="50">...</div>

<img width="400" height="300" alt="The Voyager spacecraft" class="float-center" />
<div class="float-center width-50">...</div>

<!-- Controls at the end of the line, in reading order: one floated group -->
<div nfsClearfix>
  <h2 nfsFloat="left">Order 1024</h2>
  <div nfsFloat="right">
    <button nfsButton>Cancel</button>
    <button nfsButton color="primary">Save</button>
  </div>
</div>

<div class="clearfix">
  <h2 class="float-left">Order 1024</h2>
  <div class="float-right">
    <button class="button" type="button">Cancel</button>
    <button class="button primary" type="button">Save</button>
  </div>
</div>

<!-- Label positioning (Foundation's Forms page) in a right-to-left page: the physical side is chosen for the direction -->
<div dir="rtl" nfsGridX>
  <div nfsCell size="3"><label for="amount" nfsFormLabel middle nfsFloat="left">Amount</label></div>
  <div nfsCell size="9"><input type="text" id="amount" /></div>
</div>

<div dir="rtl" class="grid-x">
  <div class="cell small-3"><label for="amount" class="middle float-left">Amount</label></div>
  <div class="cell small-9"><input type="text" id="amount" /></div>
</div>
```

Server and hydrated DOM are identical for every example: the classes are host bindings on signal state, computed the same way on both.

### Animation

None. Foundation's float partial declares no transition, and the library adds none. An element that appears or disappears with `@if` takes only the consumer's own keyframe class in `animate.enter` and `animate.leave` (building-blocks 1.6 rule 2). No Motion classes and no `prefers-reduced-motion` override.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server HTML carries every class the attributes set, exactly as the hydrated DOM does; nothing depends on the viewport, the platform, or a token.
- Before hydration: the directive touches no DOM outside its host binding, measures nothing, and starts no timer. The development checks run in a render callback, a no-op on the server.
- Full and incremental hydration: the host binding's value equals the server's, so hydration changes nothing; there is no structure to mismatch and no Hydration boundary of its own.
- Event replay: the directive declares no listener and adds no `jsaction`; floated links and buttons keep their own behaviour and replay as any other.
- `@defer`: library templates contain no `@defer`. Inside a dehydrated block a float is its server HTML. Inside `@defer (hydrate never)` every float and clearfix stays applied for good, which suits layout; a bound value that should change later does not go in `hydrate never`.
- Prerendering: identical to SSR; the directive reads no request token.

## Testing Decisions

A good test asserts what a user or assistive technology observes: the classes on each element, the computed `float`, `display`, and margins, the boxes' geometry (a float at its container's edge, a centred box's equal side gaps, a container that contains its floats), the order Tab reaches controls in against the order they are drawn, and the accessible names. No test reads a directive's fields. The patterns are the four layers of building-blocks 1.12 and the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md)'s and [Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md)'s tests, the nearest precedents; the cascade and order cases are this spec's ticket's measurements, kept as tests.

Story ids follow `float-classes--<story>`: `float-classes--float-left-right`, `--float-center`, `--clearfix`, `--reading-order`, `--rtl`, `--composition`. The stories file sets `id: 'float-classes'`, `title: 'Utilities/Float Classes'`, and `component: NfsFloatClasses`; `nfsFloat` gets an enum control and `nfsClearfix` a boolean control from docgen. The family has no Variant registry, so the library's Storybook program needs no declaration file for it, and the preview needs no settings override and no Library mixin include. Scaffolding imports `NfsButton`, `NfsCallout`, the XY Grid and Forms directives, and the Prototyping Utilities' `NfsPrototypeSizing` and `NfsPrototypeSpacing` from their entry points; every story image uses `NgOptimizedImage` with an `alt`, and no story element carries a Foundation or library class written in the story.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the six tags.

- `float-classes--float-left-right`: Foundation's docs example: an `nfsCallout nfsClearfix` holding two `nfsButton` buttons with `nfsFloat="left"` and `nfsFloat="right"`, found by `getByRole('button', {name: 'Left'})` and `{name: 'Right'}`. Their computed `float` is `left` and `right`; the left button's left edge and the right button's right edge lie on the callout's content box edges (within 1 px); the callout's bottom edge is at or below both buttons'.
- `float-classes--float-center`: an `NgOptimizedImage` image and a box whose 50% width comes from the Prototyping Utilities' `nfsWidth="50"` (`NfsPrototypeSizing`, listed in the story's `moduleMetadata.imports`; Foundation's `.width-50`, because storybook-conventions section 8 keeps inline styles for values Foundation has no class for), each with `nfsFloat="center"`, in a container of known width: each has equal gaps to both container edges (within 1 px), and the image keeps its name (`getByRole('img', {name})`). A third box with an `auto` width shows that it fills the line (gaps of 0).
- `float-classes--clearfix`: the same two floated boxes in two containers, one with `nfsClearfix` and one without: the first container's height reaches its floats, the second's does not; setting the story's `nfsClearfix` arg, which the second container binds, to `true` makes it reach them too.
- `float-classes--reading-order`: the recipe of the Rendered HTML (a heading floated left and one right-floated group holding Cancel and Save). The play function focuses a button before the example and presses Tab three times with `userEvent.tab()`; the focus reaches Cancel, then Save, and each focused box's left edge is greater than the previous one's. A spy on `console.warn` records no warning.
- `float-classes--rtl`: a `dir="rtl"` region with `nfsFloat="left"` and `nfsFloat="right"` boxes: the left one's left edge is the region's left edge, the right one's right edge its right edge (the classes are physical); the Forms label-positioning example of the Rendered HTML, whose label is found by `getByLabelText('Amount')`.
- `float-classes--composition`: `nfsButton color="primary" nfsFloat="right"` with the Prototyping Utilities' `nfsMarginLeft="1"` and a consumer class on one element, and `nfsCallout nfsClearfix` around it: each host carries its component's classes, the utilities' classes, and the consumer's class; changing a bound `nfsFloat` from `right` to `left` swaps `.float-right` for `.float-left` and leaves every other class.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

TestBed specs next to the directive over bare test host components, zoneless with `await fixture.whenStable()`; no story is mounted and no axe runs here.

- Host bindings, driven by data: `nfsFloat` `left`, `right`, and `center` each set exactly their class; no value and a bound `undefined` set none; a value reached through `$any()` that is not one of the names (`'left right'`, `'float-left'`) sets none; `nfsClearfix` bare, `"true"`, and `[nfsClearfix]="true"` set `.clearfix`, and `"false"`, `[nfsClearfix]="false"`, and no attribute set none; both attributes on one element create one instance and set both classes; changing one value swaps only its own class and leaves the consumer's static class, its `[class.x]` binding, and `nfsButton`'s classes alone.
- Copied classes (check 1): each of the four classes written statically beside the directive warns once, naming the attribute, and keeps styling (not stripped); a consumer class is silent.
- Reversed order (check 2): with two buttons in a block parent: right then right warns once, naming the side and direction; right then left warns; left then right, and left then left, are silent; right then right with two images and no focusable content is silent; in a `dir="rtl"` parent, left then left warns and right then left is silent; a right float whose previous sibling is not floated is silent.
- No effect (check 3): `nfsFloat="right"` in a `display: flex` parent and in a `display: grid` parent warns once; `nfsFloat="center"` there is silent; `nfsClearfix` on a `display: flex` host warns once, and on a block host is silent.
- Nothing is checked or warned when `ngDevMode` is false.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke through the shared `renderServer()` helper, under `npx nx test <lib>`: a fixture with each `nfsFloat` value, a bound `nfsClearfix`, an element with both, and a copied static `float-right`. `whenStable()` resolves; the server HTML carries every expected class, the copied class included, and the consumer's own attributes; no element carries `jsaction` from the directive; no development warning is made on the server.
- No pure-logic test: the class list is a lookup of two inputs that layer 2 covers value by value. No Sass compile test: the entry point has no library Sass.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Focus order: in `float-classes--reading-order`, real Tab presses reach Cancel then Save, and each focused box starts to the right of the previous one (the stories use buttons, which WebKit's default settings put in the tab order; links are not).
- Reflow and text spacing: at 320 by 640 px, with and without the text-spacing stylesheet, `document.documentElement.scrollWidth` is at most 320 in `--float-left-right`, `--float-center`, and `--reading-order`, and in `--float-left-right` the callout's bottom edge is at or below both buttons'.

Against the prerendered fixture app, on the Float Classes route:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with the six tags) on the server HTML; every element carries its classes and the layout is final before any script runs.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.

## Out of Scope

- Responsive float classes (`.medium-float-left`): Foundation 6.9 generates none, and the library copies no Foundation rule and adds CSS only where Foundation cannot meet a requirement; a placement that changes by breakpoint is the Flexbox Utilities' (`alignX`, `order`) or the XY Grid's. Category: `scope-boundary`.
- Logical floats (`float: inline-start`, `inline-end`) for mixed-direction pages: Foundation's classes are physical by design, as its docs say; a float that follows the reading direction is the consumer's own CSS, as `nfs-breadcrumbs` does for its own items ([Spec: Breadcrumbs](../issues/88-spec-breadcrumbs.md)). Category: `scope-boundary`.
- Foundation's `clearfix` Sass mixin: it prints no class, so there is nothing for a directive to set; it stays consumer Sass for its own CSS, and the components that include it (Breadcrumbs, Pagination, Tabs, the Top Bar, the Title Bar) are their specs'. Category: `scope-boundary`.
- Hiding an `nfsFloat="center"` element with the `hidden` attribute. The `hidden` attribute alone does not hide an `nfsFloat="center"` element: Foundation's `.float-center` sets `display: block` after normalize's `[hidden] { display: none }` at equal specificity (measured in Chromium, Firefox, and WebKit), as building-blocks 1.10 records. Remove it with `@if`, or hide it with a Toggler in Visibility mode, which binds Foundation's `.is-hidden` ([Spec: Toggler](../issues/17-spec-toggler.md), D3), or with `nfsVisibility` and a bare `hideFor` ([Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)); the Thumbnail, Flexbox Utilities, XY Grid, and Flex Grid specs state the same rule for their classes. `.float-left`, `.float-right`, and `.clearfix` set no `display` on their host, so `hidden` hides such an element. Category: `scope-boundary`.
- A development check that `nfsFloat="center"` has a width narrower than its container: the answer depends on the viewport and the content at first render, as the Prototyping Utilities' D18 found for width checks; the requirement is documented and the story shows it. Category: `other`.
- Detecting a missing `foundation-float-classes` include: the Runtime checks read the Variant properties a Library mixin writes, not Foundation's rules, and this family writes none, as the [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md) decides for its export mixins. Category: `platform-or-a11y`.
- Runtime theming through custom properties (building-blocks 1.13). Category: `scope-boundary`.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | An attribute directive on the consumer's elements; entry point `ngx-foundation-sites/float-classes` | ADR 0001 and ADR 0039: the utility families get directives, and Foundation generates nothing; one entry point per docs page, so a `@defer` block can split it | A wrapper component (Foundation's markup carries the element; ADR 0001) (`scope-boundary`); no directive, the classes written by the consumer (overruled by the user, ADR 0039) (`superseded`) |
| D2 | The stand-alone shape of the Utility directive rule (clause 0) | Each class styles whatever element carries it: a float needs no clearfix parent, a clearfix contains floats of any origin, and `.float-center` needs neither; no class modifies an element another gives a role, and the templates do not express one effect | The roles shape, a clearfix container directive with float children (a float is valid without the container, and the container contains floats the directive did not set) (`other`); the one-effect shape (float, centring, and containment are three effects, and Foundation has no `<words>-for-<bp>` names here) (`other`) |
| D3 | One directive class, `NfsFloatClasses`, for the one export mixin, selected by `[nfsFloat], [nfsClearfix]` (clauses 1 and 2) | The rule's unit, which its own example names; a floated box that is also a clearfix container gets one instance | Two directive classes, `NfsFloat` and `NfsClearfix` (splits one export mixin, against clause 1, and puts two instances on a floated container) (`other`) |
| D4 | `nfsFloat` takes the closed union `'left' \| 'right' \| 'center'`; `.float-center` is a value (clause 3) | `.float-center` fits the `.float-<v>` template; one attribute makes floating and centring one element impossible to ask for at once, which Foundation's CSS would resolve by dropping the centring (a float ignores automatic margins); the export mixin writes the three classes itself, so no registry | A boolean `nfsFloatCenter` or `nfsCenter` beside `nfsFloat` (a second attribute for a class that fits the template, and a combination with no meaning) (`other`); an Open family over a registry (no Sass setting lists the names) (`other`) |
| D5 | `nfsClearfix` is a boolean through `nfsVariantBoolean` (clause 3) | A class with no value is a boolean named with the camelCase of the class; the typed transform fails `nfsClearfix="flase"` | `booleanAttribute` (accepts any value, ADR 0040) (`other`); the name `nfsClear` (reads as the CSS `clear` property, which the class does not set on its host) (`other`) |
| D6 | No responsive form, no `nfsBreakpointsToken` | Foundation generates no responsive float class; building-blocks 1.4 gives a responsive form only where the classes exist | Library CSS for `.<bp>-float-<v>` (a rule Foundation does not have, for no requirement) (`scope-boundary`) |
| D7 | One computed class list; copied Foundation classes reported in development, not stripped (clause 5) | Clause 5 as written, and one behaviour across the utility families (the Prototyping Utilities, Flexbox Utilities, and Visibility Classes all report copies); the list sets no class to `false`, so it never outranks another binding of the same class | A class record of the four classes that strips copies (building-blocks 1.4's shape for a component's own classes, the Menu's; cheap here, but it departs from clause 5 and from the other utility families, and its `false` entries would outrank a future owner's binding, as the Visibility Classes' D8 found) (`other`); no copy check (a silent second spelling) (`other`) |
| D8 | A development check for a float that follows a sibling floated toward the end of the reading direction when either holds focusable content | Measured in three engines: two right-floated buttons are drawn in reverse and reached by Tab right to left, and a right float before a left one reverses the pair; ADR 0039 passes the ordering hazard (1.3.2, 2.4.3) to the utility specs; computed `float` and `direction` answer it the same at every width, and the focusable-content condition keeps it to what 2.4.3 measures, as the Flexbox Utilities' order check does; the computed `direction`, not `Directionality`, decides where a float goes | No check, only documentation (the one ordering hazard of this family would ship silently) (`other`); a geometric check comparing the boxes at the first render (floats that wrap at a narrow width would pass and fail at a wide one) (`other`); warning on every reversed pair, focusable or not (a row of decorative images would warn for no criterion) (`other`) |
| D9 | A development check for a float on a flex or grid item and a clearfix on a flex or grid container | Measured in three engines: the float does nothing (and WebKit even reports `float: none`, so the check reads the parent's `display`), and the clearfix's pseudo-elements take part in `justify-content` (267 px lost in a 600 px row); Foundation's flex parents make both easy to write; the Flexbox Utilities and Media Object report their own no-effect cases the same way | No check (a silent no-op, and a silent layout shift) (`other`); stripping the clearfix's pseudo-elements with library CSS on flex containers (a rule over a consumer mistake, and `:has()` is not used in library CSS) (`other`) |
| D10 | No Library mixin, Variant property, or Runtime check call | The family is closed, has no flag, no order to fix, and no compile-time check (ADR 0012, dated note) | A properties-only `nfs-float-classes` (lists nothing a check reads) (`other`) |
| D11 | Utility attribute names that are no HTML attribute: `nfsFloat` and `nfsClearfix`, rendered `nfsfloat` and `nfsclearfix` | Angular renders every static attribute on the element, input or not ([Spec: Media Object](../issues/91-spec-media-object.md), D3); the general rule is building-blocks 1.4's (inputs named like HTML attributes, [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)), and Utility attributes keep the `nfs` prefix, so the question does not arise here | `align` for the placements (HTML maps `align="left"` and `"right"` on `img`, `iframe`, `embed`, `object`, `input type="image"`, and `table` to `float`, and `align="center"` on `table` to automatic margins; measured: `img align="right"` computes `float: right`, and a `table align="center"` 200 px wide is centred, in three engines) (`platform-or-a11y`); `clear` for the clearfix (HTML maps `br clear` to the `clear` property; measured: `br clear="all"` computes `clear: both` in three engines) (`platform-or-a11y`) |
| D12 | Across families, Foundation's cascade decides, and the Notes name each pair | Each pair is two different Foundation utilities asked of one element; the Utility directive rule's clause 6 | Resolving across directives (would couple independent families through DI for combinations with no meaning) (`other`) |
| D13 | Six stories; e2e for real Tab order, reflow, and text spacing in three engines, and the fixture app's first paint and hydration | Real keys and geometry at 320 px need real engines; everything else is DOM state a play function reads | A story per class (four stories that show less than the docs example does) (`other`) |
| D14 | Glossary term **Clearfix** | The class, the mixin, and "a clearfix" in the Breadcrumbs, Pagination, and Prototyping Utilities specs name one technique whose host neither floats nor clears | No term (the specs already use the word, and "clear" alone reads as the CSS property) (`other`) |

### Usage examples

```html
<!-- A figure pushed to the right of the text that follows it -->
<figure nfsFloat="right" nfsMarginLeft="1">
  <img ngSrc="/harbour.jpg" width="240" height="160" alt="Harbour at dawn" />
  <figcaption>The harbour at dawn</figcaption>
</figure>
<p>Text wraps around the figure...</p>

<!-- A container that holds a floated figure and its text -->
<article nfsClearfix>...</article>

<!-- A centred call to action of fixed width -->
<div nfsCallout nfsFloat="center" style="width: 20rem">...</div>
```

```ts
@Component({
  selector: 'app-order-header',
  imports: [NfsFloatClasses, NfsButton],
  template: `
    <div nfsClearfix>
      <h2 [nfsFloat]="rtl() ? 'right' : 'left'">Order {{ id() }}</h2>
      <div [nfsFloat]="rtl() ? 'left' : 'right'">
        <button nfsButton (click)="cancel.emit()">Cancel</button>
        <button nfsButton color="primary" (click)="save.emit()">Save</button>
      </div>
    </div>
  `,
})
export class OrderHeader {
  readonly id = input.required<string>();
  readonly rtl = input(false);
  readonly cancel = output();
  readonly save = output();
}
```

`NfsButton` comes from `ngx-foundation-sites/button` and is shown only to place it. A component whose direction can change floats the heading toward the start side and the group toward the end side in both directions, so the pair never reverses and development check 2 stays silent.

### Platform features to adopt when the browser target moves

None. The logical `float` values `inline-start` and `inline-end` are already in the Browser target; Foundation has no class for them (Out of Scope). `:has()` would let library CSS disable a clearfix on a flex container, but the check reports the mistake instead (D9).

### Foundation behaviour changed or dropped

- The three placements are one attribute, so an element cannot carry two of them (D4).
- The docs' example floats buttons, not anchors without `href`, and the Float Center image has an `alt`.
- The docs' claim that `.float-center` does not work with a percentage width is corrected: it does, and it does not work with an `auto` width.
- Floats that reverse the reading order, floats on flex or grid items, and a clearfix on a flex or grid container are reported in development (D8, D9).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This directive relies on Foundation's export mixin `foundation-float-classes`, which `foundation-everything` always includes. No library CSS; there is no `nfs-float-classes` mixin.

1. Rules: none.
2. Reused: Foundation's classes as the consumer compiles them; `$global-flexbox` decides whether the clearfix's pseudo-elements get `flex-basis: 0` and `order: 1`.
3. Custom properties the directive writes: none.
4. Motion classes: none, and no `prefers-reduced-motion` override, because nothing animates.
5. Missing include: without `foundation-float-classes` nothing floats, centres, or clears, and nothing reports it (Out of Scope).
6. Variant properties: none; both families are closed.

Required settings on Foundation's defaults: none.

### Notes

- Across families, Foundation's cascade decides (D12), measured in three engines where marked:
  - `nfsFloat="center"` loses its centring to the Prototyping Utilities' `nfsDisplay` (`!important`: with `nfsDisplay="inline-block"` the box sits at the start, measured) and to any horizontal spacing attribute (`nfsMargin`, `nfsMarginHorizontal`, `nfsMarginLeft`, `nfsMarginRight`, `!important`: with `nfsMarginHorizontal="1"` the margins are 16 px and the box sits at the start, measured).
  - `nfsFloat="left"` or `"right"` computes to no float beside `nfsPosition="absolute"`, `"fixed"`, `"fixed-top"`, or `"fixed-bottom"` (measured for `absolute`).
  - `nfsFloat`'s `!important` overrides a component's own float on the same element: Breadcrumbs items and the Top Bar's sections in Foundation's float build float by their own rules, and a Float attribute on them replaces that; it belongs on the consumer's own elements.
  - The Typography Helpers' text alignment (`nfsTextAlign`, [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)) is independent: Foundation's Forms page offers `.text-right` or `.float-right` to right-align a label, and either works.
- A Responsive Embed beside a float keeps the ratio of its container's width, not its own, because its `padding-bottom` percentage resolves against the containing block (measured by the [Spec: Responsive Embed](../issues/96-spec-responsive-embed.md) ticket: 400 by 337.5 px beside a 200 px float in a 600 px container); `nfs-responsive-embed`'s `display: flow-root` keeps it beside the float when its video takes focus.
- Floats on a Trigger: the [Spec: Dropdown](../issues/26-spec-dropdown.md) and [Spec: Tooltip](../issues/27-spec-tooltip.md) read no float class for placement ([Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md), D22), so `nfsFloat` beside a Trigger moves only the Trigger; the pane's side is the Dropdown's `alignment` and `position`.
- RTL: `left` and `right` are physical, as Foundation's classes are, and a right-to-left page chooses the side for its direction (Foundation's Forms page: "In a right-to-left environment, use `.float-left` instead"); check 2 reads the parent's computed `direction`, so it reports a reversed pair in either direction.
- Forced colours: the utilities draw nothing.
- Story scaffolding: stories may lay out their scaffolding with these attributes wherever Foundation has a float class, and keep inline styles for values it has none for (a fixed pixel width).
