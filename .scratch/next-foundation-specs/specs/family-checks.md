# Spec: family checks (later milestone)

Ticket: [Spec: family checks (later milestone)](../issues/160-spec-family-checks-later-milestone.md). Targets Angular 22.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0, as the component specs do. Decided upstream in [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md) (the user's ruling of 2026-09-29) and [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md) (the user's approval of the same day); building-blocks 1.9 and 1.10 and the architecture guide's P4 and P23 stated the pattern. The decision log, with every question this spec asked itself and its triage, is in the ticket answer.

Sources: the seven extraction manifests of [Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md) ([a](../research/checks-extraction-a.md), [b](../research/checks-extraction-b.md), [c](../research/checks-extraction-c.md), [d](../research/checks-extraction-d.md), [e](../research/checks-extraction-e.md), [f](../research/checks-extraction-f.md), [shared](../research/checks-extraction-shared.md)), and the component specs as committed at `53144f3`, from which every check text below is quoted verbatim. Line numbers, where given, are those of that commit.

## Problem Statement

The specs gave the library many development checks. The user ruled on 2026-09-29 that every one of them is specified but planned and implemented in a later milestone of the repository that implements the specs: "The reason I include so many different types of check is that I want to analyze how each works in practice and evaluate trade-offs. However, all checks should be deferred to a later milestone because at the core of it, this is an issue Angular should correct, not 3rd-party Angular component libraries." The user also wanted the first milestone simpler and smaller: "I'm thinking it's up to the consumer to include components/directives as documented, at least in the initial version." WCAG binds the pages the consumer ships, not the library's diagnostics, and ATAG's checking criteria are for authoring tools, which a component library is not ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), What was weighed). So the first milestone ships no family check, and each component spec states the rule its checks enforced as documented usage; a consumer who breaks the rule gets no warning.

This spec is the later milestone's plan for one of the five kinds, the family checks: a family's own development check that reads another part of its family (its parent, a child, or a peer). The user wants the kinds weighed against each other in practice, so this spec holds every family check with its design as the specs gave it (its trigger, its message, its cost, and its tests), so that the later milestone loses nothing and can compare what each kind catches and costs.

The failures these checks report share one shape. A directive family works only when its parts are arranged as Foundation's CSS and the family's behaviour expect: a column is a direct child of a row, a switch paddle directly follows its input, a slider holds at most two handles, a field that can show an error has a visible Form error, a Dropdown pane sits after its Button Group rather than inside it. Markup that breaks the arrangement compiles, renders, and often passes axe, and the part silently does nothing (a size that never applies, a paddle whose press never reaches the input) or fails a WCAG criterion on the consumer's page (focusable columns shown out of reading order, 2.4.3; a column wider than its viewport, 1.4.10). Foundation's JavaScript never reported any of these either. A developer needs each check specified so that it reports the wrong arrangement once, names the fix, stays silent for correct markup, never names the wrong fix when the real cause is a forgotten import, and costs production nothing.

## Solution

Each family check is a development warning of the directive that notices the problem, written in that directive's own code, behind the inline `ngDevMode` guard, in a browser render callback, so the server runs none and a production build keeps none. Each warns once per instance (or once per the key its spec names) through `console.warn`, with the message its spec gives.

The checks read one of four things, and each of those reads is specified once here and pointed to from every check that uses it:

- a registration the family already keeps for its production behaviour (the Abide field's Form errors, the Slider's handles, a Drilldown's wrapper, an Openable's registered Triggers);
- a lookup or query that exists only in development builds (the Button Group's content query of its buttons, the toggle text's lookup of its toggle);
- the DOM, for a part whose parent content projection can hide from dependency injection (a column's parent row, a section's bar);
- computed style and geometry, for an order or a size only the running page shows (focusable items shown out of DOM order, a column wider than the viewport).

Where the element a check looks for carries the peer directive's attribute without its directive, the cause is a Forgotten import, not the arrangement. The check then never gives its own message, which would name the wrong fix: when the forgotten-import checks are in the build, it reports the Forgotten import through their `nfsReportForgottenPeer` (the user's ruling of 2026-09-29); without them it says nothing, as the specs had it.

A part that may stand outside its parent warns when it does (building-blocks 1.9's rule, stated here); the report is the forgotten-import checks' In-family parent check, which this spec points to rather than repeats.

## User Stories

1. As an application developer, I want a development warning when an `nfsColumn` of the Float Grid or the Flex Grid is not a direct child of an `nfsRow`, so that I learn why its size, offset, and gutters do nothing.
2. As an application developer, I want a development warning when an `nfsCell` is not a direct child of an `nfsGridX` or `nfsGridY`, or binds an `offset` inside an `nfsGridY`, so that I fix the markup instead of debugging the missing layout.
3. As an application developer, I want a development warning when an `nfsMediaObjectSection` is not a direct child of an `nfsMediaObject` element, naming `hostDirectives` for a component that renders it, so that the section is laid out.
4. As an application developer, I want a development warning when a Top Bar or Title Bar section sits outside its bar, and none when my layout component projects the section into the bar, so that the warning is never false.
5. As an application developer, I want a development warning when `showFor="sticky"` or `hideFor="sticky"` sits outside an `nfsSticky` element, or on it, so that the condition reacts to a stuck state.
6. As an application developer, I want a development warning when an `nfsSticky` element's parent is not positioned or is no taller than the element, so that I know why it never sticks.
7. As an application developer, I want a development warning when a switch paddle does not directly follow its `nfsSwitchInput` or does not name it with `for`, so that a press on the track reaches the input.
8. As an application developer, I want one development warning for radio switches that no named group holds, so that assistive technology announces the question.
9. As an application developer, I want a development warning when a tab's parent element is not an `li[nfsTabsTitle]`, so that the tab list keeps its required children.
10. As an application developer, I want a development warning when a push Off-canvas panel's content has no wrapper ancestor, or when an overlay sits inside the Modal inert set, so that the page reflows and the overlay stays usable.
11. As an application developer, I want a development warning when a Dropdown pane precedes its first Trigger, has no Trigger while `hover` is on, or sits inside a Button Group, so that the pane opens by keyboard and keeps its look.
12. As an application developer, I want a development warning when a button inside a Button Group sets `size`, or sets `color` or `fill` that the group also sets, so that I set each in one place.
13. As an application developer, I want a development warning when an Abide label or Form error finds no field, or a field enters its error state with no visible Form error, so that no error is invisible.
14. As an application developer, I want a development warning when a native control's Form error sits inside its label, so that screen readers announce the error and do not read it as the field's name.
15. As an application developer, I want a development warning when several accordion items, or several sibling Accordion Menu sections, are bound open while only one may be open, so that I notice contradictory bindings.
16. As an application developer, I want a development warning when `deepLink` meets an accordion content id that Aria generated, so that my links keep working across builds.
17. As an application developer, I want development warnings for a drilldown root without its wrapper, a submenu without a back item, a back item without a named button or outside a submenu, and an item expanded under a closed level, so that a pointer user can always leave a level.
18. As an application developer using a responsive menu, I want no drilldown wrapper or back-item warning while drilldown is not the live mode, so that a menu that never drills down is quiet.
19. As an application developer, I want a development warning for a `span[nfsSubmenuToggleText]` inside a toggle that is not `hybrid`, and for a parent item with a submenu but no toggle, so that every submenu can be opened and every toggle is named.
20. As an application developer, I want a development warning for a third slider handle and for a first handle whose value exceeds the second's, so that a range slider behaves as a range.
21. As an application developer, I want a development warning for two Orbit slides with one `value`, so that no slide is lost from Aria's panel map.
22. As an application developer, I want a development warning when a Responsive Menu's Zero-breakpoint mode is `dropdown` and its Menu is not vertical there, so that the bar does not scroll the page sideways at 320 CSS px.
23. As an application developer, I want a development warning when a Responsive Toggle menu has no title bar after the first render, or gets a second one, so that the toggle works.
24. As an application developer, I want a development warning when a Reveal closes with no usable restore-focus target, naming `restoreFocus`, so that focus is never lost.
25. As an application developer, I want a development warning when `order` or a reverse `direction` shows focusable flex items in another sequence than the DOM's, at the breakpoint I am at, so that keyboard focus follows what users see.
26. As an application developer, I want a development warning when `push` and `pull` show focusable columns out of DOM order, or move a column out of its row or over its neighbour, so that the page neither misleads keyboard users nor scrolls sideways.
27. As an application developer, I want a development warning when a float follows a sibling floated toward the end of the reading direction and either holds focusable content, so that floated controls keep their reading order.
28. As an application developer, I want a development warning when a Flex Grid column's content is wider than the column at the current viewport, and when a nested row sticks out of a collapsed parent, so that I stack or collapse at the right breakpoint.
29. As an application developer, I want a development warning when `nfsFlexAlign` is not on a Flex parent or `nfsFlexChild` is not inside one, so that the alignment I bind takes effect.
30. As an application developer, I want each family warning once per instance, and each order warning once per container and sequence, so that my console stays readable.
31. As an application developer, I want no family warning for correct markup, so that every warning is a real defect.
32. As an application developer, I want no family warning during a server render or before hydration, so that server output and hydration are untouched.
33. As an application developer, I want nothing of any family check in my production bundle, so that the checks cost my users nothing.
34. As an application developer who forgot a peer's import, I want one report that names the import to add, not a placement message that names the wrong fix, so that I fix the real cause.
35. As an application developer on the first milestone, I want every rule these checks enforce stated as documented usage in its component spec, so that I can follow it without a warning.
36. As a library maintainer, I want every family check in one spec with its trigger, message, cost, and tests as the specs gave them, so that the later milestone loses nothing.
37. As a library maintainer, I want each check's shared read (a registration, a development-only lookup, the DOM, computed style) specified once, so that checks that share a mechanism are built the same way.
38. As a library maintainer, I want the family checks to land with or without the forgotten-import checks, so that the later milestone can weigh the two kinds apart.
39. As a library maintainer, I want every library story and Fixture app route to log no family warning, apart from an Anti-pattern story that asserts one, so that false warnings are caught.
40. As a library maintainer, I want a production build of the Fixture app measured to hold none of this spec's messages, so that "costs production nothing" is tested, not assumed.
41. As a spec author re-running a component spec in the later milestone, I want a list per component spec of what comes back (the check, its tests, its sentence in the API text, its mentions), so that the re-run is mechanical.
42. As a library maintainer, I want a lookup or query that only a check needs to come back with that check and to exist in development builds only, so that the first milestone carries none of it.
43. As an application developer, I want the rule for a part that may stand alone (a menu item, a breadcrumb, a pagination item, a slider fill, an Orbit caption) outside its parent stated once here, with its report left to the forgotten-import checks' parent check (F9), so that one report tells a part outside its parent from a forgotten parent import or a part declared in another template.

## Implementation Decisions

### The kind and its boundary

A family check is a library directive's own development warning that reads another part of its family (its parent, a child, or a peer) through a registration, a lookup, a query, or the DOM, and reports a registration, a placement, an order, or a state across parts that the consumer's markup got wrong ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), Decision item 1). It includes a placement or registration check between directives of different families that sit beside or inside each other (the Top Bar's sections, the Visibility Classes' sticky placement, the XY Grid's cells, the Dropdown pane inside a Button Group, the Button Group's buttons, and the Dropdown's and the Reveal's registered Triggers), as the manifests classify them.

Not family checks, and left to their own specs:

- The four forgotten-import checks of ADR 0046, with every part of them: the In-family parent checks, child probes, and out-of-reach report, `strictDirectiveImports`, `strictParents`, the static check, `nfsDirectiveCheck`, the token descriptions (M7), and `nfsReportForgottenPeer` ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), re-run by [Re-run: forgotten-import checks spec for the later milestone](../issues/164-rerun-forgotten-import-checks-later-milestone.md)).
- The mechanism of the outside-the-parent warnings. Building-blocks 1.9's rule for them (a part that may stand alone injects its parent optionally and warns in development when it stands outside it) is this kind's, and this spec states it (F9). The report itself is the forgotten-import checks' In-family parent check, its M5 ("Stands alone") with the family's `alone` sentence, which the specs at `53144f3` had made of every such warning and which that spec keeps; this spec neither restates M5 nor the `alone` sentences.
- Misuse warnings: a directive's own development warning that reads only its host, its inputs, its content, or the page ([Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md)). A check that reads attributes inside its own host's subtree (the Breadcrumbs' and the Pagination's `aria-current` checks) is misuse even when that subtree holds family parts; a check that reads another part's directive state, its registration, or its placement relative to another part is a family check.
- The Runtime checks and the build-time checks ([Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md), [Spec: build-time checks (later milestone)](../issues/163-spec-build-time-checks-later-milestone.md)).
- Angular Aria's own development warnings, which the library cannot change (the Accordion's trigger inside its panel, the Orbit bullets' pairing reports, duplicate tab values).

The 43 checks below come from 24 component specs. A check a manifest classified under another kind is left there even where this spec's author reads it as a family check; each such case is recorded in the ticket answer, so that no check lands in two specs.

### Foundation contract

Foundation 6.9's JavaScript reports none of the arrangements these checks cover. Where its plugin finds a part missing, it builds the part itself; where it finds a part in the wrong place, it ignores it; its CSS-only families (the Button Group, the Float, Flex, and XY Grids, the Flexbox Utilities, the Float Classes, the Media Object, the Switch, the Top Bar, and the Visibility Classes) have no JavaScript, so nothing reports for them. The one report near a family check is the Responsive Toggle's. Read from `js/` at v6.9.0 (`foundation-sites`, `337be7a8d`):

| Arrangement | What Foundation's plugin does | Source | This spec |
| --- | --- | --- | --- |
| A drilldown root without its wrapper | Wraps the root in `options.wrapper` with `is-drilldown` when its parent lacks that class; no report | `foundation.drilldown.js:122-127` | Drilldown check 1: a directive cannot wrap the consumer's markup, so it warns |
| A drilldown submenu without a back item | Prepends or appends `options.backButton` to every submenu that holds no `.js-drilldown-back`; its only report is `console.error` for a `backButtonPosition` other than `top` or `bottom` | `foundation.drilldown.js:100-112` | Drilldown check 2 (the position error is a misuse, not this kind) |
| A sticky element whose parent is not a container | Wraps it in `<div data-sticky-container>` and adds `sticky-container`; nothing reads the parent's height | `foundation.sticky.js:41-51`, `:424` | Sticky warnings 1 and 2 |
| Several accordion items open at init in single mode | `_init` passes every pre-active item's content to `_openSingleTab` at once, which closes only open items outside the set it opens, so all of them stay open; no report | `foundation.accordion.js:63-67`, `:255-264` | Accordion check 4 (F8) |
| Several Accordion Menu sections open at init with `multiOpen` off | `_init` calls `down()` on each pre-active submenu in turn, and `down()` closes the others first, so the last one stays open; no report | `foundation.accordionMenu.js:87-91`, `:230-240` | Accordion Menu check 1 (F8), which keeps every bound section open |
| A third slider handle, or handles out of order | Reads `[data-slider-handle]` and uses the first two only; every position it sets, the initial ones included, is clamped so that the first handle stays at least one step below the second, which moves a first handle set above the second; no report | `foundation.slider.js:69-88`, `:106-113`, `:194-216`, `:312-330` | Slider checks 1 and 4 (the library does not reorder or clamp, so it warns) |
| An Abide field with no label or Form error | `findFormError` looks at siblings, the parent, and `[data-form-error-for]`, and `findLabel` at `label[for]` and the closest `label`; `addErrorClasses` adds a class to what it found and sets `aria-invalid` either way; no report | `foundation.abide.js:177-218`, `:269-284` | Abide checks 1, 2, and 4 |
| A dropdown pane and its Triggers | Takes its anchors from `[data-toggle="<id>"]`, else `[data-open="<id>"]`, wherever they are; reads neither their order nor the pane's ancestors | `foundation.dropdown.js:52-61` | Dropdown checks 3 and 8 |
| A Reveal's focus restore | Remembers at open the focused element when it is one of its anchors, else its anchors, and calls `focus()` on that at close, without checking that it exists or can take focus | `foundation.reveal.js:236`, `:484` | Reveal check 7 |
| An Off-canvas panel and its content | Finds the content by `contentId`, else as a sibling or an ancestor `[data-off-canvas-content]`, and treats a panel with no sibling content as nested; its only report is a `console.warn` for `contentId` without `nested` | `foundation.offcanvas.js:72-88` | Off-canvas checks 3 (part b) and 9 read what the plugin never did; the `contentId` warning is a misuse |
| A tab outside a title | Finds the tabs as `.tabs-title` elements; a link outside one is not a tab | `foundation.tabs.js:49`, `:524` | The Tabs tab's parent check |
| Orbit slides and bullets | Writes each slide's index into its `data-slide` and moves to the slide whose index a clicked bullet's `data-slide` holds, so a slide has no value of its own that could repeat | `foundation.orbit.js:106`, `:145-147`, `:232-235` | Orbit check 6 exists because the library pairs by `value` |
| A Responsive Toggle bar without its menu | `console.error('Your tab bar needs an ID of a Menu as the value of data-tab-bar.')` when `data-responsive-toggle` names no id, then goes on with that empty id | `foundation.responsiveToggle.js:39-44` | Responsive Toggle check 3; the library's required reference makes the missing menu a compile error (NG8002, NG8003), so the check reports only a menu with no title bar or two |

Foundation's core also logs any error a plugin constructor throws, through `console.error`, which is how malformed markup that breaks a plugin shows up (`foundation.core.js:121-122`, `:166-171`); that is not a report of an arrangement. So the checks add reports Foundation never had, and no Foundation option, event, or class is involved.

### Hierarchy and package shape

The family checks have no directive, no component, and no entry point of their own. Each check is code in the directive that owns it, in that directive's source file and entry point, as the Checks per component entries name it:

```
ngx-foundation-sites/<entry point>   (the owning directive's; this spec adds no entry point)
  each directive that owns a family check
    constructor: if (typeof ngDevMode === 'undefined' || ngDevMode) { a browser render callback: the check }   (F1)
    reads of what production already registers                                                             (F2)
    development-only lookups, inside the same guard                                                        (F3)
      Button Group     contentChildren(NfsButton, {descendants: true})
      Nested menu      the toggle text's inject(NfsSubmenuToggle, {optional: true})
      Responsive Menu  inject(NfsMenu, {self: true}), inject(nfsBreakpointsToken)
      Float Grid       ElementRef, InteractivityChecker, NfsMediaQuery on NfsColumn
      Drilldown Menu   NfsDrilldownBack's registration with the root, and the root's #backs
  the visual-order sequence functions (F6)   Flexbox Utilities and Float Grid, each unexported in its own entry point, pure, tested at node level

ngx-foundation-sites/media-query   (Spec: forgotten-import checks (shared utility); not this spec's)
  nfsReportForgottenPeer(element, directive, foundBy)   called in F5's second form only, behind the same guard

@angular/cdk/a11y
  InteractivityChecker   isFocusable, isTabbable; injected in development builds only (F3, F6)
```

- Library-internal helpers: none. The only shared function a check calls is `nfsReportForgottenPeer`, which the forgotten-import checks export from `ngx-foundation-sites/media-query` for library directives, beside `nfsVariantCheck` and `nfsDirectiveCheck`; built without that spec, no check imports it (F5's first form). Out of Scope below rejects a helper of this kind's own.
- An entry point whose directive calls `nfsReportForgottenPeer` imports `ngx-foundation-sites/media-query`; the call sits inside the inline guard, so a production build keeps none of it, as the forgotten-import checks measured for `nfsDirectiveCheck` (PEER 4, RUNTIME 3). The measurement that production keeps no message is this spec's own (Testing Decisions, layer 4).
- No check adds a provider, a token, a public input, or an export: the first milestone's public API is the later milestone's too.

### What every family check shares

F1, development only. Each check's code sits inside an inline `if (typeof ngDevMode === 'undefined' || ngDevMode) { ... }` block at its call site, which a production build removes, and runs in a browser render callback (`afterNextRender`, a read phase of `afterRenderEffect`, an `afterEveryRender` callback, or a `ResizeObserver` that such a callback creates), which Angular makes a no-op on the server. The guard is written inline because a hoisted `const dev = typeof ngDevMode === 'undefined' || !!ngDevMode` kept 4336 B of check code and every message in the production bundle when the forgotten-import checks were measured ([research/missing-directive-import-peer.md](../research/missing-directive-import-peer.md), PEER 4). Each check warns once per instance, or once per the key its text names (per container and sequence, per row and breakpoint, per group), through `console.warn`, and has no switch: every warning is a defect in the consumer's markup and names the fix. A check that needs a render callback its directive does not otherwise have creates one only in development builds. Each check's own timing is quoted with it.

F2, registration reads. The check reads a registration the family keeps for its production behaviour and adds none of its own: the Abide field's Form errors and a label's field, an accordion's items and their `expanded` state, a menu level's items, the Drilldown wrapper's root, a Nested menu item's toggle, the Slider's handle list, the Orbit's slides, the Responsive Toggle menu's title bar, and an Openable's registered Triggers (the optional `registerTrigger` of building-blocks 1.8, read by the Dropdown pane and the Reveal). A check on registration order reads document order when it runs (`compareDocumentPosition`), as its family does.

F3, lookups and queries only a check needs. Where production needs no link between two parts, the check gets one only in development builds, so the first milestone carries none of it and the later milestone adds it back with the check: the Button Group's `contentChildren(NfsButton, {descendants: true})` (building-blocks 1.9 allows `contentChildren` for development validation only), the toggle text's `inject(NfsSubmenuToggle, {optional: true})` (shared with its In-family parent check), the Responsive Menu's `inject(NfsMenu, {self: true})` and `nfsBreakpointsToken` lookup, the Float Grid column's CDK `InteractivityChecker` and `NfsMediaQuery`, and the Drilldown's back-item registry: `NfsDrilldownBack` "registers with the root, which uses the registry only for development checks", kept as "`#backs`: the registered back items with their levels, for development checks only" (Hierarchy and DI shape and API of the Drilldown Menu spec at `53144f3`). A lookup by class is allowed for such a check where the class sits in the same entry point, because the guard removes it from production (the architecture guide's P4).

F4, DOM-only placement reads. A check that only reports placement reads the DOM, not dependency injection, because a part that a layout component projects from another template has no injection path to the parent it renders in (building-blocks 1.9, "A check that only reports placement reads the DOM alone"; the Top Bar's D13). It reads the parent or an ancestor element at the first render, and an element counts as the parent when it carries the parent's Structural class or the parent directive's attribute. Used by the Flex Grid's check 3, the Float Grid's check 2, the XY Grid's check 2, the Media Object's check 3, the Top Bar's check 7, the Visibility Classes' check 3, the Dropdown's check 8, the Off-canvas panel's check 3 (part b), the Tabs tab's parent check, the Switch's check 6, the Drilldown's checks 1 and 3, the Flexbox Utilities' check 2, the Off-canvas' check 9, and the Abide Form error's label check; the Sticky's warnings read the parent's computed style instead.

F5, a forgotten peer. Where the element a check looks for carries the peer directive's attribute without its directive (a parent element with the attribute and no Structural class, or an element with the attribute that registered nothing), the cause is a Forgotten import:

- The specs at `53144f3` have the check say nothing there and leave the report to a child probe or to `strictDirectiveImports`, so the placement message never names the wrong fix.
- [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md) has the check hand each such element to `nfsReportForgottenPeer(element, directive, foundBy)`, which reports it once through the forgotten-import checks' one report function (M2 or M3, "Found by <Part>."), and give its own message only when the helper returns `false`. A warning about a separate misuse that stays wrong once the import is added still reads the element as the parent and still fires (an `offset` under a forgotten `nfsGridY`, a sized column row under a forgotten outer `nfsRow`).
- The rule is the forgotten-import checks spec's ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), In-family checks, the bullets on "A family's own development check"), and this spec applies it to exactly the checks that spec lists, so the two specs agree when they land. For a check that reports placement from the DOM alone, which calls the helper for a parent element that carries a parent directive's attribute without its host class: the Media Object's check 3, the Sticky's warning 1, the XY Grid's check 2, the Float Grid's check 2, the Flex Grid's check 3, and, by the ruling's wording, the Top Bar's check 7 and the Tabs tab's parent check. For a check that finds a peer by registration, which calls the helper for each element it finds that carries the peer's attribute and registered nothing: the Drilldown's checks 1 and 2, the Nested menu's check 4, the Off-canvas panel's check 3 (both parts), and the Abide label's, Form error's, and field's warnings; the same bullet names the Orbit's checks 1 and 3, the Off-canvas panel's check 4 (by the same wording), and the Triggers' check 1, which are misuse warnings here (their spec applies it).
- No helper, as that spec says: the Switch's check 6 reads a previous sibling that carries the `nfsSwitchInput` attribute as the input and finds nothing wrong, and `NfsSwitch`'s probe reports that input. Unchanged, as the ruling says: a check that finds another family's peer by that peer's class and counts its attribute too (the Dropdown's check 8, the Visibility Classes' check 3), and the Flexbox Utilities' check 2, whose Flex parent may be any family's, so it keeps its class read and its message names the forgotten-import case; and a check that looks for no element because its peer is linked by a required reference whose forgotten import fails to compile (the Responsive Toggle's check 3, NG8002 or NG8003).
- `nfsReportForgottenPeer`, the verdict it applies, and the report function are the forgotten-import checks'. When the later milestone builds this spec without them, each check above keeps the first form (it says nothing for such an element); when they are in the build, it calls the helper. So the two kinds can be built, measured, and weighed apart, and neither form ever names the wrong fix.

F6, order from computed style. The Flexbox Utilities' check 5 and the Float Grid's check 4 predict the visual order of a container's items from computed style (the Flexbox Utilities from `order` and `flex-direction`, the Float Grid from the columns' border boxes), keep only the items that are or contain an element CDK's `InteractivityChecker` reports focusable and tabbable, run again whenever `NfsMediaQuery.current()` changes, warn once per container and distinct sequence, name the breakpoint and both sequences, and never warn for one focusable item or none. Their sequence functions are pure and tested at the node level. The Float Classes' check 2 is the simpler pairwise form of the same hazard, with its own focusable-content test.

F7, geometry from a development `ResizeObserver`. The Flex Grid's checks 4 and 5 share one `ResizeObserver` per row, created in the read phase at the first render and disconnected on destroy, each warning once per instance.

F8, bound state at the first render. The Accordion's check 4 and the Accordion Menu's check 1 apply one rule, the Accordion spec's for single mode ([ADR 0028](../adr/0028-accordion-expansion-policy.md)): binding writes do not make the model emit, so sections bound open while only one may be open all stay open, and the root warns once at the first render.

F9, a part outside its parent. Building-blocks 1.9's rule at `53144f3`: a child injects its parent's token "required when the child cannot exist alone (accordion title inside an item), `{optional: true}` with a dev-mode `reportViolations`-style warning when the child may stand alone (menu item outside a menu root)"; the guide's P23 names the case, "a child outside a parent it may stand without (optional injection)", and says a child that cannot stand alone is a required injection, "whose NG0201 is the report". In the later milestone the rule holds as written, and each such warning is reported by the forgotten-import checks' In-family parent check (its M5, "Stands alone", with the family's `alone` sentence; thrown instead under the opt-in `strictParents`), because only that check tells a part outside its parent from a parent whose import was forgotten (M2) and from a part declared in another template (M4). The parts that had such a warning of their own before the specs made it their parent check, as that spec records them: the Breadcrumbs' check 7 (the item), the Menu's check 3 (the menu text), the Nested menu's checks 3 and 5 in part (the toggle text outside any toggle, an item without a root), the Pagination items' warning, the Slider's check 6 (the fill), the Orbit's check 8 (the five class-only parts), the Equalizer watch's warning, and the Drilldown's check 3 in part (a back item outside a root). Their `alone` sentences are quoted in that spec's Family entries. So the outside-the-parent warnings land when the forgotten-import checks do; a later milestone that builds this spec alone has none of them, and the first-milestone specs state each as documented usage.

### Checks per component

Each entry quotes the check as its spec gives it, then its timing and what it reads, the F-rules it follows, the rule the first-milestone spec states as documented usage instead (the manifests' sentence), and its tests. The manifest entry of each check is in the trace table under Further Notes.

#### Abide ([Spec: Abide](../issues/31-spec-abide.md))

The three field-resolution warnings read the Abide registration, which production uses for the form's `invalid` and the field's `aria-describedby`: "inputs register with the form (the form's `invalid` and the `submitted` reset read them) and Form errors register with their field (the field's `aria-describedby` reads them)" (Hierarchy and DI shape). F1, F2, and F5, by the forgotten-import checks' rule for a check that finds a peer by registration ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), In-family checks).

Abide 1, a label whose field does not resolve. From API per directive, `NfsAbideLabel`:

> Dev mode: warns once in `afterNextRender` when no field resolves, unless the label holds an element carrying `nfsAbideInput` with no `NfsAbideInput` on it, which its probe reports instead (In-family checks).

- Documented usage: "The consumer must give every `nfsAbideLabel` a resolvable field, either nested inside it or referenced with `[nfsAbideLabel]='field'`."

Abide 2, a Form error whose field does not resolve. From API per directive, `NfsFormError`, Host:

> Dev mode: warns once when no field resolves (not for a bare Form error inside a label that carries `nfsAbideLabel` with no `NfsAbideLabel` on it, which `strictDirectiveImports` reports; In-family checks)

- Documented usage: "The consumer must give every `nfsFormError` a resolvable field, either nested inside an `nfsAbideLabel` or referenced with `[nfsFormError]='field'`."

Abide 3, a native control's Form error inside its label. The same Host paragraph, F4 (an ancestor read):

> warns once when it is a descendant of a `label` and its field is a native control (a defect, not a style preference: Firefox then reads the error as part of the field's name, and Chromium fires no alert event for it, so NVDA with Chrome never announces it when it appears while focus is elsewhere; place it after the label and link it by reference)

- Reads: the nearest `label` ancestor and whether the registered field is a native control; a custom `FormValueControl` keeps its Form error inside the wrapping label, a known limitation the spec records, and is not reported.
- Documented usage: "For a native control, the consumer must place its `nfsFormError` after the wrapping label and link it by reference, not inside the label." The Groups bullet of Hierarchy and DI shape ("not inside a wrapping label, which the development check flags") names this check too.

Abide 4, a field in error with no visible Form error. The same Host paragraph:

> and the field warns once when it enters its error state with no visible Form error (WCAG 3.3.1 and 1.4.1 need visible text), unless its wrapping label holds an element carrying `nfsFormError` with no `NfsFormError` on it, which the label's probe reports instead.

- Documented usage: "The consumer must give every field that can show an error at least one `nfsFormError` for it (WCAG 3.3.1, 1.4.1)."

Tests, layer 2, the Linking bullet:

> Linking: bare `nfsFormError` inside `nfsAbideLabel` resolves the nested field; references resolve across the template; an unresolved label or error warns once in dev mode; a field in error with no visible Form error warns once; a bare label holding an element that carries `nfsAbideInput` without its directive, a bare Form error inside a label that carries `nfsAbideLabel` without its directive, and a field in error whose label holds an element that carries `nfsFormError` without its directive make none of these three warnings (the probe or `strictDirectiveImports` reports the forgotten import once); the in-label development warning fires once for a native control's Form error inside its label, and not for a custom `FormValueControl` or an after-label error.

Under F5 with the forgotten-import checks in the build, the three forgotten-peer cases of that bullet each assert one M2 report found by the part in place of silence. The layer 1 assertion that "no visible Form error of a native control is a descendant of its `label`" in `abide--default`, `abide--submit`, `abide--checkbox`, and `abide--reactive-forms` is the library's own test of its examples and stays in the first milestone.

#### Accordion ([Spec: Accordion](../issues/15-spec-accordion.md))

Both checks are items of the Behaviour rules list "Dev-mode checks, in one `afterNextRender` per directive that exists only when `ngDevMode` is on, each warning once per instance". F1, F2.

Accordion check 2, a deep link on a generated content id:

> (2) `deepLink` with a content id that starts with Aria's generated prefix;

- Reads: every registered item's content `id` against the accordion's own `deepLink`.
- Documented usage: "The consumer must set an explicit `id` on every `nfsAccordionContent` used with `deepLink`, instead of leaving Aria's generated id."

Accordion check 4, several items open in single mode (F8):

> (4) more than one item open at first render while `multiExpand` is `false`;

and from the Initial state rule: "Binding writes do not make the model emit, so no expansion policy runs for them: two titles bound open in single mode both stay open, which dev check 4 reports."

- Reads: every item's `expanded` state at the first render against `multiExpand`.
- Documented usage: "The consumer should not bind more than one sibling title `[expanded]='true'` while `multiExpand` is off; every bound-open panel still renders open, with no automatic close."

Tests, layer 2: "two titles bound open in single mode keep both open and fire dev check 4" (the Initial state bullet); "Dev-mode checks: each of the seven warnings fires once for its case and not for correct markup." Only checks 2 and 4 of the seven are this spec's; the others are misuse warnings.

#### Accordion Menu ([Spec: Accordion Menu](../issues/20-spec-accordion-menu.md))

Accordion Menu check 1, sections bound open with `multiOpen` off (F1, F2, F8). From Behaviour rules the root adds:

> Bound open sections and `multiOpen` off: Foundation's `_init` ran `down()` on every pre-open submenu in turn, so with `multiOpen` off only the last one stayed open. The library keeps every section bound open at first render open, because the server HTML must show the state the consumer bound and a close after hydration would move content under the reader; in development the root warns once when, at first render, `multiOpen` is off and a level holds more than one expanded item (the Accordion spec's rule for single mode, ADR 0028 consequences).

and "Development-mode checks, in one `afterNextRender` that exists only under `ngDevMode`, each warning once per instance: (1) `multiOpen` off with several expanded siblings, as above."

- Reads: every item's `expanded` state per level at the first render.
- Documented usage: "The consumer should not bind more than one sibling item `expanded` at a level while `multiOpen` is off; every bound-open section still renders open, with no automatic close."
- Tests, layer 2: "Development check: with `multiOpen` off and two siblings bound `[expanded]="true"`, one warning at first render and both stay open; none with `multiOpen` on, none for one open section per level, none under a driving test root while another mode is live." Layer 3: "Pure logic, table-driven: the development check's rule (a description of levels and expanded flags, with `multiOpen`, gives warn or not)."

The same paragraph also lists the Nested menu's checks as applying to this root: its checks 3 and 4 are this spec's (Nested menu, below); "a span outside a Hybrid toggle" and "an item without a root" are In-family parent checks of the forgotten-import checks; the copied-class, toggle-name, and `expandAll()` checks and the hosted Menu's check 1 are misuse warnings.

#### Button Group ([Spec: Button Group](../issues/82-spec-button-group.md))

The three checks read the group's buttons through "a `contentChildren(NfsButton, {descendants: true})` query, read only by the development checks (building-blocks 1.9: `contentChildren` is used only for development validation). Buttons rendered by another component's template inside the group are outside the query and are not checked; Foundation's CSS still styles them." They run "in the one `afterRenderEffect` read phase below, only when `ngDevMode` is on (never on the server, never in production), each warning once per instance"; that read phase is created only in development builds or when the consumer opts the Variant check into production, and it re-runs only when the signals it reads change. F1, F3.

Button Group checks 1 to 3:

> 1. A button inside the group (from the content query) with `size` set to a value other than `'default'` warns "size on an nfsButton inside nfsButtonGroup has no effect: Foundation's group rule resets its buttons to the default size; set size on nfsButtonGroup".
> 2. A button with `color` set while the group's `color` is set warns "color is set on nfsButtonGroup and on an nfsButton inside it: the group's colour wins on solid groups, and on hollow and clear groups the name later in $button-palette wins; set it in one place".
> 3. A button with `fill` set while the group's `fill` is set warns "fill is set on nfsButtonGroup and on an nfsButton inside it: a group fill other than your $button-fill replaces the button's; set it in one place".

- Documented usage: "The consumer must set `size` on `nfsButtonGroup`, not on a button inside it; Foundation's group rule resets every button to the default size." "The consumer must set `color` on either the group or its buttons, never both; the group's colour wins on solid groups, and the name later in `$button-palette` wins on hollow/clear groups." "The consumer must set `fill` on either the group or its buttons, never both; a non-default group fill replaces a button's own."
- Tests, layer 2: "a button with `size="small"` in a group warns once and `size="default"` does not; `color` on both the group and a button warns once, and on only one of them does not; the same for `fill`" and "a button rendered by a child component inside the group is not checked".
- Why (D5 of the Button Group spec): measured in three engines, Foundation's group rule resets every button to the default size, a group colour wins on solid groups and palette order decides on filled ones, and a non-default group fill wins; the typed inputs make these look supported.

#### Drilldown Menu ([Spec: Drilldown Menu](../issues/22-spec-drilldown-menu.md))

"Development-mode checks (all directives, once per instance, in `afterNextRender` or a `read`-phase `afterRenderEffect` that exists only when `ngDevMode` is on and never on the server)", and: "Checks 1 to 3 run from the first render in which drilldown is the live mode, so a responsive root that has not reached a drilldown width, or whose rules do not name drilldown, does not warn about a wrapper or back items it does not use." F1, F2, F4.

Drilldown check 1, a root without its wrapper (F5, by the forgotten-import checks' rule for a check that finds a peer by registration):

> 1. A drilldown root without a registered wrapper, or a wrapper that is not the root's parent element. A root whose parent element carries `nfsDrilldownWrapper` but registered no wrapper is not reported here: that wrapper's import is forgotten, which the runtime check `strictDirectiveImports` reports once on the element ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)).

- Reads: the wrapper registration: "the root registers itself with the nearest `NfsDrilldownWrapper` at construction (`skipSelf`, optional); the wrapper accepts only a root whose element is its own child element (Foundation's rule: the wrapper is the root's parent), and warns in development mode otherwise, which also stops a nested root without its own wrapper from taking the outer one."
- Documented usage: Wrap every `ul[nfsDrilldown]` in a `[nfsDrilldownWrapper]` element that is its direct parent.

Drilldown check 2, a submenu without a back item (F5, by the forgotten-import checks' rule for a check that finds a peer by registration):

> 2. A submenu in drilldown mode without a back item. Foundation generated one in every submenu; without it a pointer user cannot leave the level, because the parent toggle is hidden. The warning names `li[nfsDrilldownBack]`, since a Foundation `li.js-drilldown-back` copied without the directive neither closes its level nor hides outside drilldown mode. A level that holds an element carrying `nfsDrilldownBack` is not reported here: that back item's import is forgotten, which the root's child probe reports once.

- Documented usage: Give every submenu of a drilldown a `li[nfsDrilldownBack]` item so a pointer user can leave the level (the spec's D17).

Drilldown check 3, a back item's button, name, and placement (F4, its placement clause):

> 3. A back item without a `button` child, with a button that has no accessible name (its text read as accessible-name computation reads it: text outside `aria-hidden="true"` subtrees, the visually hidden suffix included, or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"`), or outside any submenu. A back item outside a drilldown root is reported once, by its In-family parent check (Hierarchy and DI shape).

- The manifest classified the whole numbered check here, because its placement clause reads the ancestor submenu; its content clauses read only the back item, and the later milestone keeps the check as one warning.
- Documented usage: Every back item holds a `<button>` with an accessible name, inside a submenu.

Drilldown check 6, an item expanded under a closed level:

> 6. In drilldown mode, an item that is expanded while an ancestor item is not (a level shown under a closed level); the warning names `openPath()` and `[expanded]` on every item of the Open path.

- Reads: the ancestor items' state through the Nested menu's item registration.
- Documented usage: Open every item of a path from the root down (`openPath()`, or bind `[expanded]` on each item of the path), never a deep item alone.

Tests, layer 2: "DI and registration: the root registers with its parent wrapper; a wrapper that is not the root's parent, a second root, and a missing wrapper each warn; a nested drilldown with its own wrapper leaves the outer wrapper alone; a back item finds its level and root, and warns outside a submenu or outside a drilldown"; and from the Development warnings bullet, "a submenu without a back item (and one holding a bare `li` copied with Foundation's `js-drilldown-back` but no directive), and no check 1 or check 2 warning for a wrapper or a back item written with its directive's attribute but not imported (the runtime check and the root's child probe report each once), a nameless back button (and none for one whose only content is an `img` with alt text), a back item without a button, ... an item expanded under a closed level (naming `openPath()` and `[expanded]`), ...; none for correct markup; none during a server render." The "outside a drilldown" case is the parent check's. Under F5, the two forgotten-import cases each assert one M2 found by the root, one of them under `strictDirectiveImports: false` (the wrapper, which no probe covers).

#### Dropdown ([Spec: Dropdown](../issues/26-spec-dropdown.md))

Both are items of "Dev-mode checks, in one `afterNextRender` that exists only when `ngDevMode` is on, each warning once per instance". F1.

Dropdown check 3, a pane before its Trigger, or a hover pane with no Trigger (F2, the pane's registered Triggers):

> (3) the pane precedes its first registered Trigger in document order, or no Trigger is registered while `hover` is on (a hover pane must also open by click and keyboard);

- Reads: the pane's `registerTrigger()` list, which `nfsToggle`, `nfsOpen`, and `nfsClose` fill.
- Documented usage: Write the pane right after its Trigger, and give a `hover` pane a Trigger as well as hover.

Dropdown check 8, a pane inside a Button Group (F4; F5 unchanged, another family's peer by class):

> (8) the pane's parent element is inside a Button Group (`closest('.button-group, [nfsButtonGroup]')`; the attribute counts too, because the misuse stays once a forgotten `NfsButtonGroup` import is added, and `strictDirectiveImports` reports that import on its own): "place the pane after the Button Group; the group's rules restyle the buttons inside it".

- Documented usage: Write a split button's pane after its Button Group, never inside it (the spec's D30 and its split-button usage example).

Tests, layer 2: "Dev-mode checks: each of the eight warnings fires once for its case and not for correct markup (... the pane right after its Trigger; ... a pane after, not inside, an `nfsButtonGroup`). Check 8 also fires for a pane inside an element that carries `nfsButtonGroup` without its class (a forgotten import)."

#### Flex Grid ([Spec: Flex Grid](../issues/101-spec-flex-grid.md))

"Development-mode checks, in each directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or its Variant check handle is not `null` (never on the server, and in production only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on, each once per instance". F1.

Flex Grid check 3, placement (F4; F5, by the forgotten-import checks' rule for a check that reports placement from the DOM alone):

> 3. Placement, on `NfsColumn`, read from the DOM at the first render, where an element is a row when it carries `row` or the `nfsRow` attribute and a column when it carries `column` or the `nfsColumn` attribute: a host that is not also a row, whose parent element is not a row, warns "nfsColumn: this column is not a direct child of nfsRow, so its size, offset, and gutters do not apply"; a parent that is both a row and a column warns "nfsColumn: the parent is a column row, which Foundation lays out as a block, so columns inside it stack: nest an nfsRow inside it"; a bound `size` whose parent carries a `<bp>-unstack` class warns "nfsColumn: unstack="medium" on the row sizes its columns, so this size only caps the column's width: remove it or remove the row's unstack". A parent that carries `nfsRow` without `row` is a row whose import was forgotten, which the `strictDirectiveImports` Runtime check reports once on that element and the static check in CI, so its columns give no placement warning, as the Float Grid's check 2 decides.

- Documented usage: Write every `nfsColumn` as a direct child of `nfsRow`, never inside a column row; remove a column's `size` where the row is `unstack`.

Flex Grid check 4, a column wider than its content box at the viewport (F7):

> 4. Overflow at the current viewport, on `NfsRow` (D11): a `ResizeObserver` on the host, created in the read phase at the first render when the host is a flex row and disconnected on destroy, checks the host's column children: a column whose `scrollWidth` exceeds its `clientWidth` by more than 1 px warns once: "nfsRow: a column's content is wider than the column at this viewport (WCAG 1.4.10): stack the columns below a breakpoint with unstack="medium" on the row or [size]="{small: 12, medium: ...}" on the columns".

- Why (D11): "Measured: Foundation's own align-self example overflows by 27 px and scrolls the page at 320 CSS px in three engines, and axe does not report it; overflow depends on content and viewport, so only a measurement in the running page sees it, as the XY Grid's frame check does."
- Documented usage: Stack a row's columns below the breakpoint where their content no longer fits (`unstack`, or a Zero-breakpoint `size`).

Flex Grid check 5, a nested row that sticks out (F7):

> 5. Nested row that sticks out, on `NfsRow`, in the same observer callback: a host whose parent element carries `column`, whose computed `margin-left` is negative, and whose parent's computed `padding-left` is 0 warns once: "nfsRow: this nested row sticks out of its collapsed parent by half a gutter: bind isCollapseChild on it, or collapse the parent row at every width with the bare collapse attribute".

- Documented usage: Bind `isCollapseChild` on a row nested in a responsively collapsed row, or collapse the parent row at every width with the bare `collapse` attribute (the spec's D6).

Tests, layer 2, from the Development checks bullet: "a column whose parent has no `row` warns once; a column row outside a row does not; a column whose parent carries `nfsRow` with `NfsRow` left out of the test host's imports does not; a column inside a column row warns; a sized column in an `unstack` row warns, an unsized one does not; a row of four bare columns of long words in a 320 px wide host warns once from the overflow check and stays silent after later resizes; the same row with `size="12"` on its columns does not warn; a nested row in a `[collapse]="{small: true}"` row warns once, with `isCollapseChild` or in a bare `collapse` row it does not; nothing warns when `ngDevMode` is false." Layer 1: `flex-grid--nesting` records nothing on its `console.warn` spy, the negative control of checks 3 and 5; its assertions on the rows' edges and the column row's computed `display` are the library's own and stay.

#### Flexbox Utilities ([Spec: Flexbox Utilities](../issues/103-spec-flexbox-utilities.md))

"Development-mode checks, in each directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or the Variant check handle is not `null` (never on the server, and in a production build only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on". F1.

Flexbox Utilities check 2, not in a Flex parent (F4; F5 unchanged, the Flex parent may be any family's):

> 2. Not in a Flex parent (D13), once per instance at the first render: `NfsFlexAlign` warns when its host's computed `display` is not `flex` or `inline-flex` and the host carries no `flex-container` or `<bp>-flex-container` class; `NfsFlexChild` warns the same for its parent element, with `grid` and `inline-grid` also accepted, where `order` and `align-self` apply. The message names the directive and says which directive makes the element a Flex parent, and that where the element already carries a Flex parent directive's attribute (`nfsGridX`, a Flex Grid `nfsRow`), that directive's import is missing, which the `strictDirectiveImports` Runtime check reports once on that element. The check names no directive it found there, because a Flex parent's directive may be any family's, and the Float Grid's `nfsRow`, which makes no Flex parent, shares its attribute with the Flex Grid's.

- The manifest classified the whole check here by its parent-reading half; `NfsFlexAlign`'s half reads only its own host, and the later milestone keeps it as one check.
- Why (D13): "An alignment on a block element or a flex child in a block parent does nothing, silently; a host with a responsive container class is not reported, because it is a Flex parent from its breakpoint up".
- Documented usage: Put `nfsFlexAlign` only on an element that is, or will become, a Flex parent; put `nfsFlexChild` only inside one.
- Tests, layer 2: "Not in a Flex parent: `nfsFlexAlign` on a block `div` warns once; on a `display: flex` host, on an `nfsFlexContainer` host, and on a host carrying `medium-flex-container` at a narrow width it does not; `nfsFlexChild` in a block parent warns once, in a flex or grid parent does not."

Flexbox Utilities check 5, visual order (F6):

> 5. Visual order (D10), on every run and again whenever `NfsMediaQuery.current()` changes: `NfsFlexChild` while `order` is bound checks its parent element, and `NfsFlexContainer` while `direction` holds a reverse value in any form checks its host. The check runs only when the container's computed `display` is `flex` or `inline-flex`. Its flex items are the container's element children whose computed `display` is not `none` and whose `position` is not `absolute` or `fixed`; their visual sequence is the DOM sequence stably sorted by computed `order` and reversed when the computed `flex-direction` ends in `-reverse`, the order-modified document order of CSS Flexbox (measured to match the rendered order in Chromium, Firefox, and WebKit at three widths). Among the items that are or contain an element CDK's `InteractivityChecker` reports focusable and tabbable, a visual sequence that differs from the DOM sequence warns once per container and distinct sequence, naming the breakpoint and both sequences: "nfsFlexChild: at the small breakpoint the items of <div class="grid-x ..."> that hold focusable content appear in the order 2, 1, but keyboard focus follows the DOM order 1, 2 (WCAG 2.4.3). Write the items in the order they are read and shown, or reorder only items without focusable content." One focusable item, or none, never warns.

- Why (D10): measured, the prediction equals the rendered order in three engines at 400, 800, and 1100 px; Tab follows the DOM; axe has no rule. Rejected there: comparing bounding boxes, checking every Flex parent, and an opt-out input.
- Documented usage: Write content in the order it is read, and use `order` or a reverse `direction` only to rearrange items that hold no focusable content, or whose focusable siblings stay in reading order (WCAG 1.3.2, 2.4.3).
- Tests, layer 2: "Visual order, with Foundation's flex and grid CSS loaded in the test document and a `MediaMatcher` test double driving `NfsMediaQuery`: two ordered items holding a button each, shown in reverse, warn once, naming the breakpoint and both sequences; the same after a re-render does not warn again; a breakpoint change to one where the order matches the DOM stays silent, and back again does not repeat the report; one item with a button and one with text only stay silent; three items with equal `order` values keep DOM order and stay silent; a `direction="row-reverse"` container of three buttons warns from `NfsFlexContainer`; `{small: 'column', large: 'column-reverse'}` warns only at `large`; an item with `position: absolute` or `display: none` is left out; a grid parent is not checked." Layer 3: the visual-order sequence "over items given as `{order, focusable}` with a reverse flag (stable ties, reversal, fewer than two focusable items)". Layer 1: `flexbox-utilities--source-ordering` records nothing on its `console.warn` spy; its assertion that no reordered cell holds a focusable element is the library's own and stays.

Both checks: "Nothing is checked or warned when `ngDevMode` is false."

#### Float Classes ([Spec: Float Classes](../issues/105-spec-float-classes.md))

Float Classes check 2, reversed order (F1, F6). It runs "in the directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on (never on the server and never in a production build); each warns once per instance":

> 2. Reversed order (D8), on every run while `nfsFloat` is `left` or `right`: when the parent element's computed `display` is not a flex or grid value, the host's computed `float` is `left` or `right`, its previous element sibling's computed `display` is not `none` and its computed `float` is the end side of the parent's computed `direction` (`right` for `ltr`, `left` for `rtl`), and the host or that sibling is or contains focusable content (`a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` other than `-1`, `[contenteditable]`, none disabled): "nfsFloat="right": this element follows a sibling floated right, so on a shared line it is drawn before that sibling in the reading direction while Tab and assistive technology reach it after (WCAG 1.3.2, 2.4.3). Float one element that holds both in reading order, or lay them out with the Flexbox Utilities." The side and direction in the message are the ones read.

- Why (D8): measured in three engines, two right-floated buttons are drawn in reverse and reached by Tab right to left; the computed `direction`, not `Directionality`, decides where a float goes.
- Documented usage: "A float must not follow a sibling floated toward the end of the reading direction when either holds focusable content; float one element that holds a whole group in reading order instead."
- Tests, layer 2: "Reversed order (check 2): with two buttons in a block parent: right then right warns once, naming the side and direction; right then left warns; left then right, and left then left, are silent; right then right with two images and no focusable content is silent; in a `dir="rtl"` parent, left then left warns and right then left is silent; a right float whose previous sibling is not floated is silent." The `float-classes--reading-order` play function and its e2e twin, which walk Tab and assert each focused box's position, are the library's own tests and stay.

#### Float Grid ([Spec: Float Grid](../issues/100-spec-float-grid.md))

"Development-mode checks, in each directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or its Variant check handle is not `null` (never on the server, and in production only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on". `NfsColumn` injects, in development builds only, `ElementRef`, CDK's `InteractivityChecker`, and `NfsMediaQuery` for check 4 (F3). F1.

Float Grid check 2, placement (F4; F5, by the forgotten-import checks' rule for a check that reports placement from the DOM alone):

> 2. Placement, on `NfsColumn`, read from the DOM at the first render, where an element is a row when it carries `row` or the `nfsRow` attribute: a host that is not also a row, whose parent element is not a row, warns once "nfsColumn: this column is not a direct child of nfsRow, so its row's block grid, collapse, and gutter do not apply"; a column row (a host that is a row) inside another row with `size` bound warns once "nfsColumn: a column row takes sizes only at the top level, not inside another row (Foundation's Combined Column/Row note)". An element that carries `nfsRow` without `row` is a row whose import was forgotten, which the `strictDirectiveImports` Runtime check reports once on that element and the static check in CI, so its columns, and a column row whose own `NfsRow` is forgotten, give no placement warning.

- Why (D11): "Silent failures in Foundation's markup that neither the types nor axe report; they read the DOM only in development (building-blocks 1.9)"; rejected, "A row token through DI (nothing in production needs it)".
- Documented usage: "A column must be a direct child of a row (or a row itself); a column row (`nfsRow nfsColumn` on one element) takes a `size` only at the top level, never nested inside another row."

Float Grid check 4, visual order of pushed and pulled columns (F6):

> 4. Visual order (D9), on `NfsColumn`, on every run and again whenever `NfsMediaQuery.current()` changes, while `push` or `pull` holds a value above 0 in any form: it reads its parent row's element children that carry `column` and whose computed `display` is not `none`, groups them into lines by the top edge of their border box (within 1 px), and orders each line by its left edge, or by its right edge from the right when the row's computed `direction` is `rtl`. Among the columns that are or contain an element CDK's `InteractivityChecker` reports focusable and tabbable, a visual sequence that differs from the DOM sequence warns once per row and distinct sequence, naming the breakpoint and both sequences: "nfsColumn: at the large breakpoint the columns of <div class="row"> that hold focusable content appear in the order 2, 1, but keyboard focus follows the DOM order 1, 2 (WCAG 2.4.3). Write the columns in the order they are read and shown, or push and pull only columns without focusable content." One focusable column, or none, never warns. In the same pass, a column whose border box leaves its row's content box, or intersects another column's box in its line, by more than 1 px warns once per row and breakpoint: "nfsColumn: at the small breakpoint push and pull move a column of <div class="row"> out of its row or over its neighbour, which scrolls the page sideways (WCAG 1.4.10) or covers content; pair each push with the pull of the column it trades places with". Several pushed columns of one row share one report of each kind.

- Why (D9): measured in three engines, the columns show B, A while Tab reaches A, B; an unpaired push scrolls the page 160 px sideways at 320 CSS px and an unpaired pull covers its neighbour by 80 px; axe has no rule for either. Rejected there: documenting only, and checking every row rather than those with push or pull.
- Documented usage: "The DOM order of columns is the reading and focus order; use `push`/`pull` only to rearrange the look, and pair every push with the pull of the column it trades places with, at the same breakpoints."

Tests, layer 2, from the Development checks bullet: "a column whose parent has no `row` class warns once, a column row outside a row does not, a column whose parent carries `nfsRow` with `NfsRow` left out of the test host's imports does not, and a column row with `size` inside another row warns once; ... two columns holding a button each, reversed by `size="10" push="2"` and `size="2" pull="10"`, warn once, naming the breakpoint and both sequences; the same after a re-render does not warn again; the same columns with text only, or with a button in one of them only, stay silent; a resize of the test frame to a width where a `large` push no longer applies stays silent and back again does not repeat the report; a `dir="rtl"` row whose pulled column holds the first button is read from the right; `size="6"` beside `size="6" push="6"` warns once that a column leaves its row, and `size="6"` beside `size="6" pull="3"` once that a column covers its neighbour, while Foundation's paired examples stay silent; nothing is checked or warned when `ngDevMode` is false." Layer 3, the pure visual-order sequence "over columns given as `{top, left, right, focusable}` with a direction (line grouping within 1 px, right-to-left ordering, fewer than two focusable columns), with the out-of-row and overlap tests over the same boxes". Layer 1: `float-grid--source-ordering` asserts that nothing is warned; its assertion that no two columns' boxes overlap is the library's own and stays.

#### Media Object ([Spec: Media Object](../issues/91-spec-media-object.md))

Media Object check 3, a section outside a media object (F1, F4; F5, by the forgotten-import checks' rule for a check that reports placement from the DOM alone). "Development checks run in the directives' render callbacks, only when `ngDevMode` is on (never on the server, never in production), each warning once per instance and distinct subject through `console.warn`":

> 3. `NfsMediaObjectSection` whose parent element carries neither `.media-object` nor the `nfsMediaObject` attribute, read from the DOM at the first render: "nfsMediaObjectSection: this section is not a direct child of an nfsMediaObject element, so Foundation's CSS does not lay it out as a section; when a component renders it, put NfsMediaObjectSection in that component's hostDirectives" (D10). A parent that carries the attribute without the class is a forgotten `NfsMediaObject` import, not a misplaced section, and this message would name the wrong fix, so check 3 says nothing there: the `strictDirectiveImports` Runtime check reports the parent once with the import to add, and the static check reports it in CI.

- Why (D10): "A section is laid out only as a flex item or table cell of `.media-object`; a component that renders the section inside its own host makes the host the item, and projection hides DI, so the DOM is the only source; the fix is `hostDirectives`".
- Documented usage: "An `nfsMediaObjectSection` must be a direct child of an `nfsMediaObject` element (or, for a component rendering it inside its own host, that component must put `NfsMediaObjectSection` in `hostDirectives`)."
- Tests, layer 2: "a section inside a wrapper `div` warns, and neither a direct child nor a direct child of an element that carries `nfsMediaObject` without the directive does." Also: "Nothing is checked when `ngDevMode` is false or during a server render."

#### Nested menu ([Spec: Nested menu (shared utility)](../issues/56-spec-nested-menu.md))

"Each warns once per instance through `console.warn`, in the first client render callback, never on the server or in production" (the Render hooks table: "`afterNextRender`, only under `ngDevMode`"). F1.

Nested menu check 3, toggle text in a toggle that is not `hybrid` (F3):

> 3. A `span[nfsSubmenuToggleText]` inside an `NfsSubmenuToggle` that is not `hybrid`: it hides the only visible label of a parent button. A span outside any toggle is reported once, by its In-family parent check (Hierarchy and DI shape).

- Reads: the toggle's `hybrid` input through the span's development-only `inject(NfsSubmenuToggle, {optional: true})`, the lookup whose result its In-family parent check also passes.
- Documented usage: Put `span[nfsSubmenuToggleText]` only inside a toggle that carries `hybrid`; a non-hybrid toggle is named by its own visible text.

Nested menu check 4, a parent item without a toggle (F2; F5, by the forgotten-import checks' rule for a check that finds a peer by registration):

> 4. A parent item with a submenu but no toggle (Foundation's `<a href="#">` parent left unmigrated). An item holding an element that carries `nfsSubmenuToggle` is not reported here: that toggle's import is forgotten, which the item's child probe reports once.

- Reads: the item's registered `submenu` and `toggleButton` signals.
- Documented usage: Every parent item (one that holds a submenu) must also hold a `button[nfsSubmenuToggle]`.

Tests, layer 2, from the Dev-mode warnings bullet: "a `span[nfsSubmenuToggleText]` in a non-hybrid toggle and outside any toggle; a parent without a toggle, and no check 4 warning for a parent whose `button[nfsSubmenuToggle]` directive is not imported (the item's child probe reports it once); ... none for correct markup; none during a server render." The "outside any toggle" case is the parent check's. These checks run under every plugin root: the Accordion Menu, the Drilldown, the Dropdown Menu, and the Responsive Menu.

#### Off-canvas ([Spec: Off-canvas](../issues/25-spec-off-canvas.md))

"Development-mode checks, each once per instance, in render callbacks that exist only when `ngDevMode` is on and never on the server". F1.

Off-canvas check 3, part b, a push panel without a wrapper (F4; F5, by the forgotten-import checks' rule for a check that finds a peer by registration, which names the panel's check 3 as a whole):

> A push panel whose content has no ancestor in the DOM that carries `nfsOffCanvasWrapper` or `.off-canvas-wrapper` (1.4.10), naming `nfsOffCanvasWrapper`. An ancestor that carries the attribute without the class is a wrapper whose `NfsOffCanvasWrapper` import was forgotten: `strictDirectiveImports` reports it on the wrapper with the import and the component (M1 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), so check 3 does not report it again and never asks for an attribute the developer already wrote (2026-09-29).

- The check's first sentence, a panel with no content linked when its configuration needs one, is part a, which its manifest classified as a misuse warning; the two parts land in their two specs, and the later milestone keeps the number 3 for both.
- Documented usage: A push panel's content must sit inside an element that carries `nfsOffCanvasWrapper` (1.4.10, Reflow).
- Tests, layer 2: "check 3 stays silent for a push panel inside a `div nfsOffCanvasWrapper` whose `NfsOffCanvasWrapper` import is missing from the test host, where the `strictDirectiveImports` report on the wrapper is the one warning". Under F5 with the forgotten-import checks in the build, it asserts one M2 found by the panel in place of silence.

Off-canvas check 9, an overlay inside the Modal inert set (F4):

> 9. An overlay placed inside an element the Modal inert set covers (the linked content, for example).

- Reads: whether the overlay's element sits inside an element the panel's Modal inert set covers; the Modal mode paragraph spares every panel's own overlay from `inert`, which an overlay inside covered content would lose.
- Documented usage: Do not place a panel's overlay element inside content the Modal inert set would otherwise cover (typically the linked content); write it as a sibling.

Tests, layer 2, both checks: "Development checks: each of the ten warnings fires once for its case and not for Foundation's docs markup written with the directives". Only checks 3 (part b) and 9 of the ten are this spec's.

#### Orbit ([Spec: Orbit](../issues/33-spec-orbit.md))

Orbit check 6, two slides with one `value` (F1, F2). An item of "Dev-mode checks, in one `afterNextRender` of the Orbit that exists only when `ngDevMode` is on, each warning once per instance":

> (6) two slides with one `value` (Aria's panel map keeps only the last; Aria itself reports a slide without a bullet, a bullet without a slide, and duplicate bullet values).

- Reads: the root's registered slides, compared by `value`. [ADR 0037](../adr/0037-orbit-slide-hosts-tab-panel.md) records that the Orbit's own pairing check "keeps only duplicate slide values" since Aria reports the rest.
- Documented usage: Give every slide a unique `value` (paired against the bullet of the same `value`).
- Tests, layer 2: "Dev-mode checks: each of the first seven fires once for its case and not for a correct carousel". Only check 6 of the seven is this spec's.

#### Responsive Menu ([Spec: Responsive Menu](../issues/23-spec-responsive-menu.md))

Responsive Menu check 3, a Zero-breakpoint dropdown that is not vertical (F1, F3). From "Development-mode checks (one `afterNextRender` that exists only under `ngDevMode`, each warning once per instance)":

> 3. The Zero-breakpoint mode is `dropdown` and the Menu's `orientation` is not vertical at the Zero breakpoint (it is neither `'vertical'` nor a rules object whose Zero-breakpoint key is `'vertical'`): a horizontal dropdown bar at 320 CSS px can scroll the page sideways (WCAG 1.4.10). The check reads the hosted Menu's `orientation()` through `inject(NfsMenu, {self: true})` and the Zero breakpoint as `nfsBreakpointForWidth(inject(nfsBreakpointsToken).map, 0)`, both in development builds only, never a class (D20).

- Documented usage: When the Zero-breakpoint mode is `dropdown`, bind the Menu's `orientation` to `'vertical'` at the Zero breakpoint (WCAG 1.4.10).
- Tests, layer 2: "check 3 fires for `dropdown medium-drilldown` with no `orientation`, with `orientation="horizontal"`, and with `[orientation]="{medium: 'vertical'}"`, and not with `orientation="vertical"` or `[orientation]="{small: 'vertical', medium: 'horizontal'}"`, also under a test `nfsBreakpointsToken` whose Zero breakpoint is `xs` (`{xs: 'vertical'}` silences it)"; "no warning is emitted during a server render."

#### Responsive Toggle ([Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md))

Responsive Toggle check 3, no title bar or two (F1, F2; F5 unchanged). From "Development-mode checks (each warns once per instance, in render callbacks that exist only when `ngDevMode` is on, never on the server)":

> 3. The menu has no registered title bar after the first render, or a second title bar registers with a menu that already has one.

- Reads: the menu's registry signal, which the bar's reverse-link registration effect fills. It keeps its message for every case, because the bar reaches the menu only through the required reference `[nfsResponsiveToggle]="menu"`, whose forgotten import on either side fails to compile (NG8002, NG8003), so there is no element for it to look for (Hierarchy and DI shape).
- Documented usage: none beyond the reference itself, which already makes an unregistered pairing a compile error; the first-milestone spec states "reference a menu declared in the same template".
- Tests, layer 2: "Development checks: each of the five warnings fires once for its case and not for the correct markup; nothing is checked when `ngDevMode` is false or during a server render." The Reverse link bullet exercises the registration the check reads.

#### Reveal ([Spec: Reveal](../issues/18-spec-reveal.md))

Reveal check 7, no usable restore-focus target (F1, F2, the Reveal's registered Triggers). From "Dev-mode checks, only when `ngDevMode` is on, each warning once per instance: ... check 7 at close":

> (7) at close, with `restoreFocus` not `false`, no usable restore target (the `restoreFocus` target, the `trigger`, the element focused at open, and the first registered Trigger outside the dialog, each missing or unfocusable): the warning names the `restoreFocus` input;

- Reads: the restore chain of the Focus rules, whose last link is "the first registered Trigger outside the dialog (the Off-canvas spec's fallback; a bare `nfsClose` inside the dialog registers too and is never the target), which covers a Reveal open at its first render ... in development mode, closing such a Reveal with no usable target logs a warning naming the `restoreFocus` input."
- Documented usage: When `restoreFocus` is not `false`, ensure at least one of the `restoreFocus` target, the `trigger` passed to `open()`, the element focused when the Reveal opened, or a registered Trigger outside the dialog stays focusable.
- Tests, layer 2, from the Focus bullet: "to the first registered Trigger outside the dialog (not a bare `nfsClose` registered before it inside) when the Reveal was open at its first render and focus sat on `body`, and the development warning when no target is usable"; and "Dev-mode checks: each of the nine warnings fires once for its case and not for correct markup". The restore behaviour itself is the library's own and stays.

#### Slider ([Spec: Slider](../issues/32-spec-slider.md))

Both are items of "Dev-mode checks, in one `afterRenderEffect` per directive that exists only when `ngDevMode` is on (never on the server, removed in production), each warning once per instance". F1, F2 (the container's handle list).

Slider check 1, a third handle:

> (1) a third handle;

- Documented usage: A slider holds at most two handles (one for a single value, two for a range).
- Tests, layer 2, Registration: "a first handle inserted later with `@if` takes DOM order after the next render; a third handle reports a dev error."

Slider check 4, handles out of order:

> (4) the first handle's value exceeds the second's;

and from Value semantics: "A pair whose first value exceeds the second is not reordered; dev mode warns."

- Documented usage: Keep the first handle's value at or below the second handle's value; the directive does not reorder them.

Tests, layer 2, both: "Dev-mode checks: each of the first five fires once for its case and not for a correct slider; ... no warning fires during a server render." Only checks 1 and 4 of the five are this spec's.

#### Sticky ([Spec: Sticky](../issues/28-spec-sticky.md))

"Development-mode warnings (under `ngDevMode`, each at most once per instance, from the first render callback; stripped from production builds)". F1; both read the parent's computed style or geometry instead of a class (F4's exception).

Sticky warning 1, the parent is not positioned (F5, by the forgotten-import checks' rule for a check that reports placement from the DOM alone):

> 1. The parent element's computed `position` is `static`: "ngx-foundation-sites: the parent of an nfsSticky element is not positioned. Add nfsStickyContainer to the parent so the Sticky state is measured correctly." Not given when the parent carries the `nfsStickyContainer` attribute without `.sticky-container`: that is a forgotten `NfsStickyContainer` import, which the `strictDirectiveImports` Runtime check reports once on the parent with the import to add, and the static check in CI, so the warning never asks for a directive already written.

- Documented usage: Put `nfsStickyContainer` on the sticky element's parent.

Sticky warning 2, the parent is no taller than the element:

> 2. The parent's content height is not larger than the element's height: "... this nfsSticky element's Sticky range is its parent, which is no taller than the element, so it never sticks. Make the parent span the range you want (Foundation's topAnchor/btmAnchor recipe)."

- [ADR 0019](../adr/0019-sticky-native-range.md) records the case: "Foundation's docs markup for a sticky title bar (a container exactly as tall as the bar) does not stick until the container spans the page; a development warning names the case."
- Documented usage: Size the parent (the Sticky range) taller than the sticky element itself.

Tests, layer 2: "Development warnings: each of the five fires once for its case and not for the correct case; warning 1 is also silent for a parent that carries `nfsStickyContainer` without the directive". Only warnings 1 and 2 of the five are this spec's; under F5, the forgotten-container case asserts one M2 found by `NfsSticky`.

#### Switch ([Spec: Switch](../issues/84-spec-switch.md))

"Development checks, in one `afterNextRender` read callback per directive that exists only when `ngDevMode` is on (never on the server, never in production builds), each warning once per instance. They run at the first render, because the name and the structure must already be in server HTML, where assistive technology reads the dehydrated switch. They read attributes, `labels`, `control`, `form`, `previousElementSibling`, ancestors, and text content, an image's `alt` included; they write nothing." F1.

Switch check 5, radio switches in no named group (reads the other radios of its group, its peers):

> 5. Radio group: the input's `type` is `radio`, and no ancestor that holds every radio of its group is a named group. The group is HTML's radio button group: the radios in the same tree with the same form owner (`form`) and the same non-empty `name`; a radio without a `name` is a group of one. A named group is a `fieldset` without a `role` attribute, or an element whose `role` is `group` or `radiogroup`, with a name taken in accessible-name order from the text of the elements its `aria-labelledby` references, a non-blank `aria-label`, for a `fieldset` the text of its first `legend` child outside `aria-hidden="true"` subtrees, then `title`, where text also counts the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"`. Only the group's first `nfsSwitchInput` host in tree order reports, so a group warns once: "nfsSwitchInput: the radio switches with name="<name>" have no named group around them, so assistive technology announces no question for them; put them in a <fieldset> whose first child is a <legend> stating the question, as every example does (WCAG 1.3.1)", with `id="<id>"` in place of the name for a radio without one. Each radio switch reads its group once, as rendered at its own first render.

- Documented usage: Put radio switches that share a `name` inside a `fieldset` whose first child is a `legend` stating the question (or another named group/radiogroup ancestor).
- Tests, layer 2: "`NfsSwitchInput` radio-group check (check 5): three radio switches sharing a `name` in a `fieldset` whose first child is a `legend` with text are silent, and so are the same radios in a `fieldset` named by `aria-label`, in a `role="radiogroup"` element named by `aria-labelledby`, and in a `role="group"` element named by `aria-label`, and a fieldset whose legend holds only an `img` with alt text is silent; with no container they warn once, naming the group's `name`, from the first radio switch; an empty legend, a legend inside a `div` in the fieldset, a `role="none"` fieldset, and `aria-labelledby` at a missing id each warn once; one member outside the named fieldset warns; the same `name` in two forms is two groups, and only the ungrouped one warns; a radio switch without a `name` outside a group warns alone, naming its `id`; checkbox switches never run the check."

Switch check 6, the paddle link (F4; no helper, by the forgotten-import checks' rule: it reads a forgotten input as present, and the probe reports it):

> 6. Paddle link (on `NfsSwitchPaddle`): the paddle's previous element sibling is not an `nfsSwitchInput` host (seen as the class it binds, or as the `nfsSwitchInput` attribute, which an input whose import was forgotten still carries and `NfsSwitch`'s In-family probe reports), or the paddle's `control` is not that input: "nfsSwitchPaddle: the paddle label must directly follow its nfsSwitchInput and name it with for="<id>"; Foundation selects the switch's states with input:checked ~ .switch-paddle and input:checked + label, and without the link a press on the track does not reach the input (WCAG 2.5.8)".

- Documented usage: Write the paddle `<label>` directly after its `nfsSwitchInput` in the DOM, naming it with `for="<id>"`.
- Tests, layer 2: "`NfsSwitchPaddle` check (check 6): a paddle directly after its input with a matching `for` is silent; a missing `for`, a `for` naming another input, and an element between input and paddle each warn once; a paddle after an input that carries `nfsSwitchInput` while the test host does not import `NfsSwitchInput` is silent, and `NfsSwitch` reports that input once (M2)."

Layer 3 for the Switch: "Pure logic: none worth isolating; the checks are covered through the DOM in layer 2."

#### Tabs ([Spec: Tabs](../issues/16-spec-tabs.md))

The Tabs tab's parent check (F1, F4; F5, by the forgotten-import checks' rule for a check that reports placement from the DOM alone). From API, `NfsTab`:

> Dev mode warns on an `href`, and on a tab whose parent element is not an `li[nfsTabsTitle]` (an `li` without `role="presentation"` inside a `tablist` breaks the required-children rule), tested with the selector on the element and its attribute, not with `.tabs-title`, so a title whose import was forgotten is left to the strip's In-family probe (Hierarchy and DI shape).

- Only the parent clause is this spec's; the `href` clause is a misuse warning. The spec states no timing for the tab's warnings; the later milestone runs this one in the tab's own development-only `afterNextRender`, once per instance, under F1.
- Documented usage: Write every `a[nfsTab]` as the direct child of an `li[nfsTabsTitle]`.
- Tests, layer 2: "Dev-mode warnings: each fires once for its case (`href` on a tab, a tab outside `li[nfsTabsTitle]`, ...) and not for correct markup; a tab inside an `li[nfsTabsTitle]` whose `NfsTabsTitle` import is missing from the test host does not warn as a tab outside a title, and the strip's probe reports the title once."

#### Top Bar ([Spec: Top Bar](../issues/86-spec-top-bar.md))

Top Bar check 7, a section outside its bar (F1, F4; F5, by the forgotten-import checks' rule for a check that reports placement from the DOM alone). "Development checks run in the first client render callback, only when `ngDevMode` is on (never on the server, never in production), each warning once per instance through `console.warn`":

> 7. `NfsTopBarLeft` or `NfsTopBarRight` with no `.top-bar` ancestor, and `NfsTitleBarLeft` or `NfsTitleBarRight` with no `.title-bar` ancestor, read by DOM ancestry (D13): the warning says the section is laid out only inside its bar. The title directives are not checked, because Foundation styles their classes anywhere. An ancestor that carries the bar's attribute (`nfsTopBar`, `nfsTitleBar`) without its class counts as the bar, and the check stays silent: that bar's import is forgotten, which the runtime check `strictDirectiveImports` reports once on the bar element, so the check never says that a section is outside the bar it sits in.

- Why (D13): "Foundation's CSS styles by DOM ancestry, and a section projected through a layout component has no DI path to its bar, so a DI check would warn falsely"; the spec gives the bars no parent token.
- Documented usage: a `nfsTopBarLeft`/`nfsTopBarRight` section must sit inside an `nfsTopBar` element, and a `nfsTitleBarLeft`/`nfsTitleBarRight` section inside an `nfsTitleBar` element, because Foundation's CSS lays them out only there.
- Tests, layer 2, from the Development checks bullet: "sections inside and outside their bars, a section projected into a bar through a test layout component not reported, a section inside a bar whose `NfsTopBar` is not imported not reported by check 7"; "nothing is checked when `ngDevMode` is false or during a server render." Under F5, the last case asserts one M2 found by the section.

#### Visibility Classes ([Spec: Visibility Classes](../issues/104-spec-visibility-classes.md))

Visibility Classes check 3, a sticky condition out of place (F1, F4; F5 unchanged, another family's peer by class):

> 3. A sticky condition out of place (D4): `showFor` or `hideFor` is `'sticky'` and no ancestor of the host carries `.sticky` (the class `nfsSticky` binds) or the `nfsSticky` attribute, or the host carries either itself: "nfsVisibility: showFor="sticky" reacts to an enclosing nfsSticky element's stuck state; put it on an element inside nfsSticky". A placement check reads the DOM alone (building-blocks 1.9). An ancestor that carries the `nfsSticky` attribute without `.sticky` is a Sticky element whose import was forgotten, which `strictDirectiveImports` reports once on that element, so this check stays silent there rather than naming the wrong fix (the one-report rule of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)).

- Why (D4): measured in four engines, `.show-for-sticky` on the Sticky element itself never shows.
- Documented usage: `showFor="sticky"`/`hideFor="sticky"` must sit on an element inside an `nfsSticky` element (not on the Sticky element itself).
- Tests, layer 2: "`showFor="sticky"` outside an element carrying `.sticky`, and on that element itself, warn once, and inside it is silent, as it is inside an element carrying `nfsSticky` whose `NfsSticky` is left out of the test host's imports".

#### XY Grid ([Spec: XY Grid](../issues/99-spec-xy-grid.md))

XY Grid check 2, placement (F1, F4; F5, by the forgotten-import checks' rule for a check that reports placement from the DOM alone). "Development-mode checks, in each directive's one `afterRenderEffect` read phase, which it creates only when `ngDevMode` is on or its Variant check handle is not `null` (never on the server, and in production only under the Runtime checks' opt-in); the warnings run only while `ngDevMode` is on, each once per instance":

> 2. Placement, on `NfsCell`, read from the DOM at the first render, where an element is a grid when it carries `grid-x` or `grid-y` or the attribute `nfsGridX` or `nfsGridY`: a parent element that is no grid warns "nfsCell: this cell is not a direct child of nfsGridX or nfsGridY, so its size, offset, and gutters do not apply"; an `offset` whose parent carries `grid-y` or `nfsGridY` warns "nfsCell: offsets move cells sideways and work only in nfsGridX (Foundation: "X Grid only")". A parent that carries a grid's attribute without its class is a grid whose import was forgotten: the `strictDirectiveImports` Runtime check reports it once on that element, as do the container's probe when a container holds it and the static check in CI, so its cells stay silent instead of each warning, falsely, that it is outside a grid.

- Why (D9): "Each is a silent failure in Foundation's markup that neither the types nor axe report"; rejected, "a grid token through DI for the placement checks (nothing in production needs it; building-blocks 1.9 lets a reporting check read the DOM)".
- Documented usage: an `nfsCell` must be a direct child of an `nfsGridX` or `nfsGridY` element for its `size`, `offset`, and gutter inputs to apply, and `offset` works only in `nfsGridX` ("X Grid only" in Foundation's docs).
- Tests, layer 2: "a cell whose parent has neither grid class warns once; a cell whose parent carries `nfsGridX` with `NfsGridX` left out of the test host's imports gives no placement warning; an `offset` in `nfsGridY` warns, and so does one under an `nfsGridY` whose directive is left out"; "nothing warns when `ngDevMode` is false."

### Checks quoted by one spec and owned by another

Each lands once, from its owner, and the quoting spec's re-run removes the quote:

- The Accordion Menu's development-checks paragraph (line 199) and the Dropdown Menu's (line 237) list the Nested menu's checks as applying to their roots: its checks 3 and 4 are the Nested menu entries above; "a span outside a Hybrid toggle" and "an item without a root" are F9, reported by the parent check; the rest are misuse warnings.
- The Float Grid spec (line 167) names the Flexbox Utilities' not-a-Flex-parent check beside `nfsRow`, and the Media Object spec names `nfsFlexChild`'s placement check (D4, line 386, and the Notes, line 469) and the Flexbox Utilities' order check (line 208): the Flexbox Utilities' checks 2 and 5 above.
- The Flexbox Utilities spec (line 527) names "the Sticky spec's development warning" for a Sticky container cell whose `alignSelf` is not `stretch`, which is then only as tall as its sticky element: the Sticky's warning 2 above.
- The Dropdown Menu spec (Hierarchy and DI shape, the development-checks paragraph, D9, user story 11, and its tests) and the Top Bar spec (Solution, Hierarchy and DI shape, Rendering modes, Out of Scope, D9) describe the warning for a dropdown-mode root whose Base side the DOM walk changed after hydration. Its owner is the Nested menu root, its check 6, which its manifest classified as a misuse warning, so it lands in the misuse warnings spec; the two quoting manifests classified their quotes as family checks, and the ticket answer records the case.

### Shared-document statements

The shared manifest's seven family entries state the pattern, not checks of their own, and land as follows:

- building-blocks 1.9, "Parent handle" (`{optional: true}` with a development warning when the child may stand alone), the architecture guide's P23 ("a child outside a parent it may stand without"), and its Conflicts item 3: the outside-the-parent rule, F9, reported by the forgotten-import checks' parent check.
- building-blocks 1.9, "Ancestry that projection can hide", and the guide's P4: the walk-once-when-the-token-is-absent rule stays a first-milestone mechanism; its development report is the Nested menu root's check 6 (above); its last sentence, "A check that only reports placement reads the DOM alone", is F4 here; P4's development-only lookup by class for a placement warning serves the Breadcrumbs and Pagination items' parent checks and F3 here.
- building-blocks 1.9, "Ordered children" (`contentChildren` for development validation only): F3, the Button Group's query.
- The glossary's "In-family check": the forgotten-import checks' term, not this kind's.

### Comparison with Angular Material, the CDK, Angular Aria, and prior art

Read from the angular/components clone (`src/aria` and `src/cdk` at `708d4c6e2`; Material's removed checks at the parent of commit `54875a3`):

| Concern | Prior art | This library | Why |
| --- | --- | --- | --- |
| A family's own development report | Angular Aria: each part runs a development `afterRenderEffect` read phase behind the inline guard and passes its violations to `reportViolations`, which logs the element and then each violation through `console.warn`, on every run that finds one (`src/aria/private/utils/violations.ts:10-16`; `src/aria/accordion/accordion-trigger.ts:100-119`) | The same guard and timing (F1); one `console.warn` per check naming the fix, once per instance or per the key its entry names | A re-run of the read phase would repeat Aria's form in the console; the specs chose once per instance |
| What Aria reports | A trigger inside its own panel and a panel with a second trigger (`accordion-trigger.ts:105-114`); a panel without its content or its trigger (`accordion-panel.ts:92-105`); a tab without a panel, a panel without its content or its tab, and a repeated tab value (`tabs/tab.ts:100-110`, `tabs/tab-panel.ts:103-117`, `tabs/tab-list.ts:152-163`); a repeated menu value (`private/menu/menu.ts:198-209`) | Left to Aria and never repeated (The kind and its boundary); the library's checks cover what Aria's patterns do not see: Foundation's placements, orders, and sizes | Aria's checks read only what registered with its own pattern |
| Several items open in single mode | Aria's accordion pattern reports several items initially expanded while `multiExpandable` is `false` (`private/accordion/accordion.ts:131-143`) | Accordion check 4 and Accordion Menu check 1 (F8) | The library keeps Aria's `multiExpandable` at `true` and owns `multiExpand` itself ([Spec: Accordion](../issues/15-spec-accordion.md), the `multiExpand` row; ADR 0028), so Aria's report never fires |
| A part the markup put somewhere else | Aria finds its parts through dependency injection and registration only; nothing in Aria or the CDK reads a part's DOM parent | DOM-only placement reads (F4) | A part a layout component projects has no injection path to the parent it renders in (building-blocks 1.9) |
| A forgotten peer | Aria's "ngAccordionPanel must have an ngAccordionTrigger to control it." cannot tell a forgotten import from missing markup | F5: silent, or one report through `nfsReportForgottenPeer` | The DOM still carries the attribute of a directive that was never imported (PEER 1) |
| A missing stylesheet or environment | Angular Material's `MatCommonModule` sanity checks until commit `54875a3` (#29688): in development builds, once per application, a doctype check, a theme check that appended a `.mat-theme-loaded-marker` element to `body` and warned when its computed `display` was not `none`, and a Material-against-CDK version check, configured through `MATERIAL_SANITY_CHECKS` (`true`, `false`, or `GranularSanityChecks`) and off in test environments (`src/material/core/common-behaviors/common-module.ts:18-39`, `:63-97`, `:100-151` at `54875a3^`); removed "since they won't execute with standalone by default, they mostly aren't necessary now that we're loading structural styles automatically and they produce some concrete styles that are problematic for the new theming APIs" | None of this kind. A family check that reads computed style (the Sticky's warnings, the Flexbox Utilities' check 2, F6, F7) reads the consumer's arrangement, not whether a stylesheet loaded; it writes no DOM and has no switch (D6) | Each check runs in its own directive, so a standalone application runs it; a missing include is the misuse warnings' S7 and the Runtime checks' concern |
| Focusable and tabbable | The CDK's `InteractivityChecker` (`isTabbable`, `isFocusable`; `src/cdk/a11y/interactivity-checker/interactivity-checker.ts:65`, `:144`), which the CDK's focus trap uses | Reused as the one CDK primitive: F6's visual-order checks keep only the items that are or hold an element it reports focusable and tabbable, injected in development builds only (F3) | Its judgement of what Tab reaches is the one the CDK already maintains; the Float Classes' check 2 keeps its own selector list, as its spec gave it |
| A check that breaks the page | Aria's accordion trigger and ng-primitives' children require their parent: NG0201, in production too | Warnings only; no family check throws | The forgotten-import checks' `strictParents` is the opt-in throw, in development only |

### Implementation level and primitives

Custom Angular in development builds only, because no Aria or CDK piece reports a family's arrangement: Aria's own checks read what registered and report its own pairing rules only. Primitives: `afterNextRender`, `afterRenderEffect` read phases, `afterEveryRender` where a spec uses it, `inject` with `optional` and `self`, `contentChildren` (the Button Group only), `ElementRef`, `Element.closest()`, `Element.matches()`, `previousElementSibling`, `compareDocumentPosition`, `getComputedStyle`, `getBoundingClientRect`, `ResizeObserver`, CDK's `InteractivityChecker`, `NfsMediaQuery` and `nfsBreakpointsToken` of the Breakpoint service, and the Triggers' `registerTrigger` list. No private Angular field is read. The one shared helper, `nfsReportForgottenPeer`, is the forgotten-import checks' (F5).

### ARIA and keyboard

None: no check renders anything or takes input.

### WCAG 2.2 AA

The checks render nothing and change no markup, so no criterion applies to them; conformance is the consumer's page's, which the first-milestone specs' documented usage and the library's own tests address. The checks exist partly for accessibility: they report in development the arrangements that fail on the consumer's page without an axe finding, among them 1.3.1 (radio switches with no named group), 1.3.2 and 2.4.3 (visual order: Flexbox Utilities, Float Grid, Float Classes), 1.4.10 (a column wider than the viewport, a nested row that sticks out, a push panel without its wrapper, a Zero-breakpoint dropdown bar, a pushed column out of its row), 2.4.11 (a pushed column over its neighbour covering content), 2.4.6 (a nameless drilldown back button), 2.5.8 (a paddle that does not reach its input), and 3.3.1 and 1.4.1 (a field in error with no visible Form error). The Abide's in-label check reports a failure measured with assistive technology rather than one criterion: Firefox reads such a Form error as part of the field's name, and NVDA with Chrome never announces it when it appears while focus is elsewhere.

### Rendered output

None. No check writes DOM, an attribute, or a class, or adds a listener; its only output is a console message.

### Rendering modes

- Server rendering and prerendering: nothing runs, because every check sits in a browser render callback, a no-op on the server, and every spec's tests assert no warning during a server render.
- Before hydration: nothing runs; a check reads the hydrated page after its first client render.
- Hydration and incremental hydration: the checks write nothing, so hydration is unaffected; a block that hydrates later is checked at its first render.
- `@defer`: a deferred block's parts are checked when the block renders; a registration check whose peers arrive later (the Drilldown's checks 1 to 3 in a responsive menu) runs from the render in which its condition first holds, as its spec says.
- Event replay: the checks declare no listener and replay nothing.

## Testing Decisions

A good test asserts what a developer observes: the console message (its text, how many times, and when), or its absence for correct markup, never a registry's or an observer's internal state. The tests the checks had are kept, with each check above. A test that asserts a warning, that it fires or stays silent, belongs to its check and moves with it; an assertion about the rendered page (DOM order, focus order, geometry, the markup of the library's own examples) is the library's own test of its components and stays in the first milestone. Prior art: each component spec's browser-level development-check bullets, which the entries quote, and the forgotten-import checks' negative controls.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

No stories of their own: the checks render nothing. The stories that assert a silent `console.warn` spy (`flex-grid--nesting`, `flexbox-utilities--source-ordering`, `float-grid--source-ordering`) keep that assertion as the negative control of their family's checks. Layer 1 runs in Angular development mode, so every library story is a negative control: a story whose render logs a family-check warning fails, except an Anti-pattern story that demonstrates the arrangement and asserts the warning in its play function (added by this spec, as the forgotten-import checks do for their reports).

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Each component's development-check cases, quoted with its check above, in that component's `*.spec.ts`. Under F5, where the forgotten-import checks are in the build, each forgotten-peer case asserts one M2 report found by the part in place of silence, and a peer that no probe covers (the Drilldown wrapper) is also tested under `provideNfsRuntimeChecks({strictDirectiveImports: false})`; where they are not, the case asserts silence, as the specs had it. Every component also keeps its "nothing is checked when `ngDevMode` is false" case.

### 3. Node-level Vitest

- Pure logic: the Accordion Menu's table-driven rule; the Flexbox Utilities' and the Float Grid's visual-order sequence functions, with the Float Grid's out-of-row and overlap tests.
- SSR smoke: every component's fixture renders on the server with no family warning logged, which each spec's server-render case already asserts.

### 4. Playwright e2e (`npx nx e2e <fixture-app>-e2e` against the prerendered Fixture app)

The Fixture app is built in the development configuration, so the checks run in it: every route logs no family-check warning, in Chromium, Firefox, and WebKit. A production build of the Fixture app contains none of this spec's message texts (for example "is not a direct child of nfsRow", "keyboard focus follows the DOM order", "the paddle label must directly follow its nfsSwitchInput"), measured by searching the built bundles, as the forgotten-import checks' production assertion does (added by this spec). The Storybook half: none, because the static Storybook build runs in production mode (P23).

## Out of Scope

- The outside-the-parent report (M5, the parent check, and its `alone` sentences) and every other part of the forgotten-import checks, including `nfsReportForgottenPeer` itself: [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md). Category: `scope-boundary`.
- Misuse warnings, including the checks the ticket answer records as boundary cases: [Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md). Category: `scope-boundary`.
- The Runtime checks and the build-time checks: their own later-milestone specs. Category: `scope-boundary`.
- Angular Aria's own development warnings: Aria's code, which the library neither changes nor silences. Category: `other`.
- A switch or opt-out for family checks: every warning is a defect in the consumer's markup and names the fix (the Flexbox Utilities' D10 rejected an opt-out input for this reason). Category: `other`.
- A family check in production or on the server: they read the rendered page and would ship their messages. Category: `other`.
- New family checks that no spec gave: this spec carries the specs' checks for the later milestone to weigh; a new one is added by its component spec. Category: `other`.
- A shared development-warning helper for the family checks: each check is a few lines in its own directive, and the one shared need, the forgotten-peer report, is the forgotten-import checks' helper. Category: `other`.

## Further Notes

### Design decisions

| # | Decision | Chosen | Alternatives not taken, and why |
| --- | --- | --- | --- |
| D1 | The kind's boundary | A directive's own development check that reads another part of its family, or a part of another family it sits beside or inside, through a registration, a lookup, a query, or the DOM | Every check that reads beyond its own host (would take the misuse checks that read the page; `other`); only parts of one spec (would split the cross-family placement checks the manifests classify here; `other`) |
| D2 | Outside-the-parent warnings | Building-blocks 1.9's rule stated here (F9); its report is the forgotten-import checks' parent check (M5 with the family's `alone` sentence), which that spec keeps | A family warning of this spec's own for a part outside its parent (only the parent check tells a forgotten parent and an out-of-reach part from a part outside its parent; `other`); copying M5 and the `alone` sentences here (two specs for one report; `other`) |
| D3 | Shape | One spec, entries per component, shared reads and rules stated once (F1 to F9) | One section per mechanism with components beneath (the later re-run works per component spec; `other`) |
| D4 | Designs | Quoted verbatim from the specs at `53144f3` | Rewriting the messages to one form (changes designs the specs measured; `other`) |
| D5 | A forgotten peer | The user's rule of [Decide: family checks report a forgotten peer themselves](../issues/157-decide-family-checks-report-forgotten-peers.md) for every check with the branch, by its wording; the specs' silent form while the forgotten-import checks are not in the build | Requiring the forgotten-import checks first (ties together two kinds the user wants weighed apart; `other`); the silent form only (drops the ruling; `superseded`) |
| D6 | Switch | None; development builds only; nothing on the server | An opt-out (`other`, the Flexbox Utilities' D10) |
| D7 | Message prefixes | As each spec gives them (`nfsColumn:`, `ngx-foundation-sites:`, and so on) | One prefix for every check (a change to the specs' texts this spec does not need; development messages are not public API, so it can be made in any release; `other`) |
| D8 | Tests | A test asserting a warning moves with its check; an assertion about the rendered page stays in the first milestone | Moving every test near a check (would drop the library's own tests of its components, which the ruling keeps; `other`) |
| D9 | Negative controls | Every story and Fixture route logs no family-check warning, apart from an Anti-pattern story that asserts one | Only the three stories that assert a silent spy today (a false warning elsewhere would pass; `other`) |
| D10 | Production cost | Measured: no message text in a production bundle | Assumed from the guard (the forgotten-import measurement found a hoisted guard kept 4336 B; `other`) |
| D11 | Quoted checks | Land once, from the owner's manifest entry and kind | Landing with the quoting spec's kind (the Nested menu root's check 6 would sit in two specs; `other`) |
| D12 | Misclassified checks | Left with the kind their manifest gave, recorded as boundary cases in the ticket answer | Copying them here too (two specs for one check; `other`) |
| D13 | Lookups only a check needs | Come back with their check, in development builds only (F3) | Keeping them in the first milestone (a production query for a development warning; `other`) |
| D14 | The Tabs tab's timing | The tab's own development-only `afterNextRender`, once per instance | The strip's read phase (the tab is its own directive, and the strip holds no reference to it; `other`) |

### Usage examples

A consumer writes nothing for these checks. The one example is a check's call site, the shape the component specs follow: the Media Object's check 3, a placement check that reads the DOM alone (F1, F4, F5), with the section's other members left out.

```ts
// ngx-foundation-sites/media-object (names as the Media Object spec gives them)
import {afterNextRender, Directive, ElementRef, inject} from '@angular/core';
// Only with the forgotten-import checks in the build (F5, second form).
import {nfsReportForgottenPeer} from 'ngx-foundation-sites/media-query';

@Directive({selector: '[nfsMediaObjectSection]', exportAs: 'nfsMediaObjectSection'})
export class NfsMediaObjectSection {
  readonly #host: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    // F1: the guard is written inline at the call site, never hoisted into a module constant.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      afterNextRender({
        read: () => {
          const parent = this.#host.parentElement;

          if (parent?.classList.contains('media-object')) {
            return;
          }

          // F5: a parent that carries nfsMediaObject without its class is a forgotten import,
          // not a misplaced section. The helper reports it once (M2, found by the section) and
          // returns true; the placement message is given only when it returns false.
          // Built without the forgotten-import checks, the branch reads
          // `if (parent?.hasAttribute('nfsMediaObject')) { return; }` and says nothing.
          if (parent && nfsReportForgottenPeer(parent, 'NfsMediaObject', 'NfsMediaObjectSection')) {
            return;
          }

          console.warn(
            'nfsMediaObjectSection: this section is not a direct child of an nfsMediaObject element, so ' +
              "Foundation's CSS does not lay it out as a section; when a component renders it, put " +
              "NfsMediaObjectSection in that component's hostDirectives",
          );
        },
      });
    }
  }
}
```

The callback runs once, at the first client render, so the warning fires at most once per instance, and never on the server. A production build removes the whole block, and with it every use of the helper; layer 4's bundle search is the test that no message survives.

### Adding the checks back, per component spec

When the later milestone implements this spec, each component spec's re-run adds back what its first-milestone re-run removed: the check, in the section the entry above names, with its message; its tests; its lookups (F3); the sentence in its API text that names it; and its mentions (user stories, WCAG rows, design decisions). The documented-usage sentence the first milestone added stays, as the rule the check enforces. The texts are the specs' at `53144f3`, quoted above.

| Component spec | Checks | Where they go back | Tests | Mentions to restore |
| --- | --- | --- | --- | --- |
| [specs/abide.md](abide.md) | Abide 1 to 4 | API per directive: the "Dev mode" sentences of `NfsAbideLabel` and `NfsFormError`; the Groups bullet's "which the development check flags" | Layer 2, the Linking bullet | User story 40; WCAG table row 3.3.1; D3; Foundation behaviour dropped or changed; lines 158 and 161 ("the development check") |
| [specs/accordion.md](accordion.md) | Checks 2 and 4 | Behaviour rules: the dev-mode checks list, items (2) and (4), and the Initial state rule's "which dev check 4 reports" | Layer 2, the Initial state bullet and "Dev-mode checks" | User stories 27 and 28 |
| [specs/accordion-menu.md](accordion-menu.md) | Check 1 | Behaviour rules the root adds, the bound-open bullet; the Development-mode checks paragraph, item (1) | Layer 2, "Development check"; layer 3, the pure rule | User story 17; D8; the Primitives' "one `afterNextRender` for the development check" (line 205), the render-hook row (line 214), and D17 (line 508) |
| [specs/button-group.md](button-group.md) | Checks 1 to 3 | Hierarchy and DI shape, the Children bullet (the development-only content query); API, the development checks list; Render hooks | Layer 2, "Development checks" (the button cases) | User stories 12 and 13; D5; Rendering modes' "The content query is read, and the checks run, only in the browser's `afterRenderEffect`" |
| [specs/drilldown-menu.md](drilldown-menu.md) | Checks 1, 2, 3, 6 | API: `NfsDrilldown`, Development-mode checks, items 1, 2, 3, 6, and the "Checks 1 to 3 run" paragraph; Hierarchy and DI shape, the wrapper's "warns in development mode otherwise" and the back item's registration with the root (line 165); API, `#backs` (line 217), the back registry used only for the checks (F3) | Layer 2, "DI and registration" and "Development warnings" | WCAG row 2.4.6; D17 |
| [specs/dropdown.md](dropdown.md) | Checks 3 and 8 | API, Behaviour rules, Dev-mode checks items (3) and (8) | Layer 2, "Dev-mode checks" | User story 49; D30; the split-button usage example |
| [specs/flex-grid.md](flex-grid.md) | Checks 3, 4, 5 | API, Development-mode checks items 3 to 5 | Layer 2, "Development checks"; layer 1, `flex-grid--nesting`'s spy | User stories 18 and 27 to 29; WCAG row 1.4.10; D6; D11; Notes on block grids and unstacking rows |
| [specs/flexbox-utilities.md](flexbox-utilities.md) | Checks 2 and 5 | API, Development-mode checks items 2 and 5 | Layer 2, "Not in a Flex parent" and "Visual order"; layer 3, the sequence; layer 1, `flexbox-utilities--source-ordering`'s spy | User stories 26 to 29; WCAG rows 1.3.2 and 2.4.3; D10; D13 |
| [specs/float-classes.md](float-classes.md) | Check 2 | API, Development-mode checks item 2 | Layer 2, "Reversed order (check 2)" | User stories 13, 14, 19; Solution; WCAG row 1.3.2/2.4.3; D8; the usage example comment; Foundation behaviour changed or dropped |
| [specs/float-grid.md](float-grid.md) | Checks 2 and 4 | API, Development-mode checks items 2 and 4; the Injection bullet's development-only `InteractivityChecker` and `NfsMediaQuery` | Layer 2, "Development checks"; layer 3, the sequence; layer 1, `float-grid--source-ordering` | User stories 10 to 12 and 24; WCAG rows 2.4.3, 1.4.10, 2.4.11; D9; D11; the In-family paragraph's "check 2's" |
| [specs/media-object.md](media-object.md) | Check 3 | Development checks and runtime checks, item 3; the In-family paragraph's "development check 3's DOM read" | Layer 2, "Development checks" (the section cases) | User story 17; D10; the usage example |
| [specs/nested-menu.md](nested-menu.md) | Checks 3 and 4 | API, Development checks items 3 and 4 | Layer 2, "Dev-mode warnings" (the toggle-text and toggle cases) | The toggle text's In-family line (its lookup's second use) |
| [specs/off-canvas.md](off-canvas.md) | Check 3 part b, check 9 | API: `NfsOffCanvas`, Development-mode checks items 3 (second and third sentences) and 9 | Layer 2, "Development checks" | D26; the Modal mode paragraph's overlay exception |
| [specs/orbit.md](orbit.md) | Check 6 | API, Dev-mode checks, clause (6) | Layer 2, "Dev-mode checks" | The In-family line's "dev check 6 a repeated slide value" |
| [specs/responsive-menu.md](responsive-menu.md) | Check 3 | API, Development-mode checks item 3, with its development-only lookups | Layer 2, "Development warnings" (the check 3 cases) | WCAG row 1.4.10; D20; the `orientation` row |
| [specs/responsive-toggle.md](responsive-toggle.md) | Check 3 | API, Development-mode checks item 3; Hierarchy and DI shape, the menu's In-family line on check 3 | Layer 2, "Development checks" | None beyond those |
| [specs/reveal.md](reveal.md) | Check 7 | API, Dev-mode checks item (7); Focus, the restore rule's last sentence | Layer 2, the Focus bullet's warning case and "Dev-mode checks" | None beyond those |
| [specs/slider.md](slider.md) | Checks 1 and 4 | API, Dev-mode checks items (1) and (4); Value semantics' "dev mode warns" | Layer 2, Registration's "a third handle reports a dev error" and "Dev-mode checks"; layer 3, the SSR smoke's "no development warning" | "More than two handles is a dev-mode error" |
| [specs/sticky.md](sticky.md) | Warnings 1 and 2 | API, Development-mode warnings items 1 and 2 | Layer 2, "Development warnings" | User story 21; the In-family line's exception for warning 1 |
| [specs/switch.md](switch.md) | Checks 5 and 6 | API, Development checks items 5 and 6; the `NfsSwitchPaddle` row's "Check 6 below" | Layer 2, the radio-group and paddle bullets | User stories 4, 12, 18, 21; WCAG row 1.3.1; D16 |
| [specs/tabs.md](tabs.md) | The tab's parent check | API, the `NfsTab` No `href` bullet's parent clause | Layer 2, "Dev-mode warnings" (the tab-outside-a-title cases) | User story 24 |
| [specs/top-bar.md](top-bar.md) | Check 7 | Development checks and runtime checks, item 7; Hierarchy and DI shape, "the sections' placement check reads the DOM" | Layer 2, "Development checks" (the section cases) | D13 |
| [specs/visibility-classes.md](visibility-classes.md) | Check 3 | API: `NfsVisibility`, Development-mode checks item 3 | Layer 2, the sticky cases | D4 |
| [specs/xy-grid.md](xy-grid.md) | Check 2 | API, Development-mode checks item 2 | Layer 2, "Development checks" (the placement cases) | The Problem Statement's "on a `.grid-y` they do nothing, silently"; D9 |

The Dropdown Menu and Top Bar specs' descriptions of the Nested menu root's check 6 come back with that check, from the spec that holds it. Each first-milestone re-run's ticket answer ([Re-run: specs without checks, group a](../issues/165-rerun-specs-without-checks-group-a.md) to [Re-run: specs without checks, group f](../issues/170-rerun-specs-without-checks-group-f.md)) lists, by line at `53144f3`, the further sentences that named or relied on these checks (a Solution clause, a Primitives or Rendering modes line, a rejected alternative); the later re-run restores each one that names a check of this spec.

### Trace to the extraction manifests

Every `family` entry of the seven manifests, by group and file, with where it lands. Group f's Toggler heading records that the Toggler has no family check. In the component manifests: 47 `family` headings: 43 checks, three quotes of the Nested menu's checks (the rows marked Quoted), and that one note; in the shared manifest: 7 entries.

| Manifest | File | Entry | Lands |
| --- | --- | --- | --- |
| a | abide.md | NfsAbideLabel field-resolution warning | Abide 1 |
| a | abide.md | NfsFormError field-resolution warning | Abide 2 |
| a | abide.md | NfsFormError descendant-of-label placement warning | Abide 3 |
| a | abide.md | NfsAbideInput no-visible-error warning | Abide 4 |
| a | accordion.md | deepLink content id generated (dev check 2) | Accordion check 2 |
| a | accordion.md | several items bound open with multiExpand false (dev check 4) | Accordion check 4 |
| a | accordion-menu.md | multiOpen-off siblings-bound-open warning (D8) | Accordion Menu check 1 |
| a | accordion-menu.md | Nested menu's structural placement/registration checks (referenced) | Quoted: Nested menu checks 3 and 4; the rest to the forgotten-import and misuse specs |
| a | button-group.md | button size-inside-group warning (dev check 1) | Button Group check 1 |
| a | button-group.md | group/button color conflict warning (dev check 2) | Button Group check 2 |
| a | button-group.md | group/button fill conflict warning (dev check 3) | Button Group check 3 |
| b | drilldown-menu.md | Root without a registered wrapper | Drilldown check 1 |
| b | drilldown-menu.md | Submenu without a back item | Drilldown check 2 |
| b | drilldown-menu.md | Back item content and placement (boundary call: mixed with misuse) | Drilldown check 3 |
| b | drilldown-menu.md | Item expanded under a closed ancestor | Drilldown check 6 |
| b | dropdown-menu.md | Top Bar right-hand-section walk and `alignment="right"` warning | Quoted: the Nested menu root's check 6, a misuse warning by its owner's manifest |
| b | dropdown.md | Pane precedes, or lacks, a registered Trigger | Dropdown check 3 |
| b | dropdown.md | Pane inside a Button Group | Dropdown check 8 |
| b | flex-grid.md | Column placement | Flex Grid check 3 |
| b | flex-grid.md | Column content overflow at viewport | Flex Grid check 4 |
| b | flex-grid.md | Nested row sticks out of collapsed parent | Flex Grid check 5 |
| b | flexbox-utilities.md | Not in a Flex parent (boundary call: mixed with misuse) | Flexbox Utilities check 2 |
| b | flexbox-utilities.md | Visual order versus DOM order | Flexbox Utilities check 5 |
| c | float-classes.md | reversed reading-order (D8) | Float Classes check 2 |
| c | float-grid.md | column placement (D11) | Float Grid check 2 |
| c | float-grid.md | visual order of pushed and pulled columns (D9) | Float Grid check 4 |
| c | media-object.md | section not a direct child of a media object (check 3, D10) | Media Object check 3 |
| d | nested-menu.md | `span[nfsSubmenuToggleText]` inside a non-hybrid toggle (Development check 3) | Nested menu check 3 |
| d | nested-menu.md | Parent item with a submenu but no toggle (Development check 4) | Nested menu check 4 |
| d | off-canvas.md | Push panel with no wrapper ancestor (Development check 3, part b) | Off-canvas check 3, part b |
| d | off-canvas.md | Overlay placed inside an element the Modal inert set covers (Development check 9) | Off-canvas check 9 |
| d | orbit.md | Two slides with one `value` (Development check 6) | Orbit check 6 |
| d | responsive-menu.md | Zero-breakpoint dropdown with a non-vertical Menu `orientation` (Development check 3) | Responsive Menu check 3 |
| e | responsive-toggle.md | Development check 3 (no registered title bar) | Responsive Toggle check 3 |
| e | reveal.md | Dev-mode check 7 (no usable restore-focus target) | Reveal check 7 |
| e | slider.md | Dev check 1 (a third handle) | Slider check 1 |
| e | slider.md | Dev check 4 (first handle's value exceeds the second's) | Slider check 4 |
| e | sticky.md | Development warning 1 (parent not positioned) | Sticky warning 1 |
| e | sticky.md | Development warning 2 (parent no taller than the element) | Sticky warning 2 |
| e | switch.md | Dev check 5 (radio switches in no named group) | Switch check 5 |
| e | switch.md | Dev check 6 (paddle link) | Switch check 6 |
| e | tabs.md | NfsTab Dev warning (tab's parent element is not li[nfsTabsTitle]) | The Tabs tab's parent check |
| f | toggler.md | `NfsTopBarRight` reading - not present for Toggler | No check: the manifest's note that the Toggler has none |
| f | top-bar.md | Dev-mode check 7 (section outside its bar) | Top Bar check 7 |
| f | top-bar.md | Nested menu root's DOM-fallback placement check for the Top Bar's right-hand section (cross-spec) | Quoted: the Nested menu root's check 6, a misuse warning by its owner's manifest |
| f | visibility-classes.md | Dev-mode check 3 (a sticky condition out of place) | Visibility Classes check 3 |
| f | xy-grid.md | Dev-mode check 2 (placement: cell outside a grid, offset in a vertical grid) | XY Grid check 2 |
| shared | building-blocks.md | Optional parent injection warns when the part may stand alone | F9; reported by the forgotten-import checks' parent check |
| shared | building-blocks.md | DOM-walk ancestry/placement check after hydration, reported once in development | Shared-document statements: F4; the report is the Nested menu root's check 6 |
| shared | building-blocks.md | `contentChildren` used only for dev-mode order validation | Shared-document statements: F3, the Button Group's checks |
| shared | architecture-guide.md | Coordination DI, optional injection, and DOM-walk placement check (P4) | Shared-document statements |
| shared | architecture-guide.md | Optional-injection-outside-parent warning (P23) | F9; reported by the forgotten-import checks' parent check |
| shared | architecture-guide.md | The DI example restated (Conflicts section item 3) | F9; reported by the forgotten-import checks' parent check |
| shared | CONTEXT.md | "In-family check" glossary term | Shared-document statements: the forgotten-import checks' term |
