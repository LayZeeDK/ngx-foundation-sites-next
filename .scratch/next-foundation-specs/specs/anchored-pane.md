# Spec: Anchored pane (shared utility)

Ticket: [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA.

## Problem Statement

A developer building an Angular application on Foundation for Sites needs panes and tips that sit against the control that opened them: a Dropdown pane under its button, a Tooltip tip above a term, a DropdownMenu submenu that flips to the other side near the screen edge. Foundation does this with three pieces of jQuery: Positionable and Box (12 placements, offsets, a collision search against the body box, `$.fn.offset()` to write the result), the Triggers utility's `closeme.zf.*` broadcast (opening one dropdown closes the others through a window-level DOM query), and per-plugin body click handlers, `mouseenter` timers, and `what-input` checks for hover opening. That design leaves the developer with problems an Angular library must not copy:

- The tip is appended to `document.body` and the pane is measured up to about 16 times per open with synchronous layout. Moving nodes breaks hydration, and the repeated measuring is slow.
- Foundation's search keeps its tried-positions set across opens, so after one open where nothing fitted, later opens stop searching and leave the pane overflowing; its tip is placed with a height measured at the previous candidate, leaving a 19 px gap.
- Outside clicks close a Dropdown only when `closeOnClick` is set, Escape works only while focus is on the trigger or the pane, a Tooltip has no Escape at all, and focus leaving a pane never closes it. A hover-opened tooltip closes the moment the pointer leaves the trigger, so the pointer cannot reach the tip. These fail WCAG 2.2 AA 1.4.13 (content on hover or focus) and leave panes covering the element that receives focus next (2.4.11).
- Reveal's body click handler shares Dropdown's jQuery event namespace, so closing a Reveal silently removes an open Dropdown's outside-click handler.
- Hover opening depends on `body[data-whatinput]`, and DropdownMenu's `disableHoverOnTouch` turns hover off for the whole device when it has a touch screen, even when a mouse is used.

A server-rendered Angular application adds more: the pane must exist in the server HTML so a trigger's `aria-controls` is valid before hydration, nothing may be measured on the server, and document-level listeners must not exist before hydration or while nothing is open.

## Solution

One shared utility with three parts, used by the Dropdown pane directive, the Tooltip directive and its tip, and the DropdownMenu through the Nested menu utility. Application developers never touch it through markup: it has no directive, no component, and no CSS. Developers who build their own Anchored panes can use it directly.

- The Positioner places an Anchored pane against its Trigger with Foundation's own formulas: 4 positions by 3 alignments, `vOffset` and `hOffset`, the 12-candidate search with least-overlap fallback, and the body-box Collision bound. It measures once per run in the `earlyRead` phase of an `afterRenderEffect`, writes inline `top` and `left` in the `write` phase on Foundation's own `position: absolute` element, and re-runs from a `ResizeObserver` on the pane, the anchor, and the bound, and from scroll while open. It keeps the pane where the consumer wrote it, so server HTML, DOM order, focus order, and Foundation's CSS all stay intact. It reproduces Foundation 6.9 to within 0.02 px in three engines, and deliberately fixes Foundation's two measured bugs.
- The Light dismiss registry replaces `closeme.zf.*` and every body click handler with one set of document listeners that exist only while something is open: an outside pointer press (down and up both outside, as the HTML popover algorithm does), Escape (topmost entry only), focus moving outside, and one-open-at-a-time groups. Presses on an Openable's registered Triggers count as inside, so a Trigger click toggles instead of closing and reopening; nested panes stay open while the user works in a child.
- The hover-intent helper opens and closes after delays on `pointerenter` and `pointerleave` over a Hover region made of the Triggers and the pane, ignores touch pointers per event instead of per device, and never closes while the pointer is over the pane.

CDK Overlay is not used, not even as a fallback: the prototype measured it bounding by the viewport instead of Foundation's body box, missing `allowBottomOverlap`, breaking Foundation's `.tooltip` CSS in 5 of 12 placements, and taking the pane out of the server HTML.

## User Stories

1. As an application developer, I want a Dropdown pane to open under its button, left-aligned, exactly where Foundation 6.9 puts it, so that migrating from Foundation changes nothing visible.
2. As an application developer, I want all 12 Foundation placements (`top`, `bottom`, `left`, `right` by `left`, `right`, `top`, `bottom`, `center`) with `vOffset` and `hOffset`, so that every Foundation positioning option keeps working.
3. As an application developer, I want a pane that does not fit to try Foundation's other placements in Foundation's order and pick the first that fits, so that it stays on screen.
4. As an application developer, I want the least-overflowing placement when nothing fits, so that a pane in a tiny viewport is still as visible as possible.
5. As an application developer, I want the search to run on every open, so that a pane that once had no room is placed correctly the next time.
6. As an application developer, I want `allowOverlap` to switch the search off and `allowBottomOverlap` to ignore the bottom edge, so that Foundation's two collision options keep their meaning.
7. As an application developer, I want the collision bound to be the body box by default, as in Foundation, so that pages behave as they did.
8. As an application developer, I want to bound a pane by an ancestor element instead, so that Foundation's `parentClass` has a counterpart.
9. As an application developer in a right-to-left page, I want `auto` alignment to start from the right, and explicit `left` and `right` to stay physical, so that RTL behaves as Foundation documents it.
10. As an application developer, I want the pane to follow its trigger when the window or a scrolling container scrolls, so that it never detaches from the button that opened it.
11. As an application developer, I want the pane to re-place itself when its content, its trigger, or the page changes size, so that a pane that loads content stays in place.
12. As an application developer, I want to trigger a re-placement myself, so that I can correct the one case no observer sees: a trigger that moves without changing size.
13. As an application developer, I want the resolved placement as a signal, so that the Dropdown pane can bind Foundation's `has-position-*` classes and the Tooltip tip its pip classes.
14. As an application developer, I want the pane to keep Foundation's `.dropdown-pane` and `.tooltip` CSS untouched, so that my Foundation settings (`$dropdown-width`, `$tooltip-max-width`, the pip size) still apply.
15. As an application developer, I want the pane to stay in the DOM where I wrote it, so that it inherits my fonts and colours and is read in document order.
16. As a user, I want clicking or tapping outside an open pane to close it when the pane allows it, so that I can dismiss it without hunting for a close button.
17. As a user on a touch device, I want scrolling the page with a finger not to close an open pane, so that I can scroll to read it.
18. As a user, I want a press that starts inside the pane and ends outside it (a text selection) not to close it, so that selecting text is safe.
19. As a user, I want clicking the button of an open pane to close it rather than close and reopen it, so that the button toggles.
20. As a keyboard user, I want Escape to close the pane I am in and return focus to its button, so that I can back out.
21. As a keyboard user, I want Escape to close only the innermost open pane, so that closing a nested pane does not close its parent.
22. As a keyboard user, I want Escape inside a combobox or select in a pane to be handled by that control first, so that Escape does not close the pane when the control consumed it.
23. As a keyboard user, I want a pane to close when I tab out of it, so that it does not cover the control I move to.
24. As a user, I want opening one Dropdown pane to close another open Dropdown pane, and opening a tooltip to close the other tooltip, so that only one of each is open, as Foundation does.
25. As a user, I want opening a pane inside another pane to keep the outer one open, so that nested panes work.
26. As a user, I want a click inside a parent pane to close its open child pane but not the parent, so that nested panes behave like native popovers.
27. As a mouse user, I want a hover-opened pane or tooltip to stay open while I move the pointer from the trigger onto it, so that I can read or use it (WCAG 1.4.13, hoverable).
28. As a mouse user, I want Escape to dismiss a hover-opened tooltip without moving the pointer or focus, so that it stops covering content (WCAG 1.4.13, dismissible).
29. As a mouse user, I want hover content to stay open until I move away or dismiss it, never on a timer, so that I can read it at my pace (WCAG 1.4.13, persistent).
30. As a user on a laptop with a touch screen, I want hover opening to work with the mouse and not with the finger, so that neither input breaks the other.
31. As a user at 320 CSS px width, I want a pane that fits somewhere to land where it fits, so that I do not have to scroll sideways (WCAG 1.4.10).
32. As a keyboard user, I want an open pane never to cover the trigger I am focused on, so that I can see where I am (WCAG 2.4.11).
33. As a screen reader user, I want the pane to follow its trigger in the DOM, so that reading order and focus order match what I see (WCAG 1.3.2, 2.4.3).
34. As a developer of a server-rendered application, I want the pane in the server HTML, hidden by Foundation's CSS, so that `aria-controls` is valid before hydration.
35. As a developer of a server-rendered application, I want nothing measured or listened to before hydration, so that hydration never mismatches and the app stays stable.
36. As a developer of a server-rendered application, I want a click on a trigger before hydration to open and place its pane after hydration, so that early clicks are not lost.
37. As a developer using incremental hydration, I want to know how hover and click behave inside a dehydrated block, so that I choose the right hydrate trigger.
38. As a developer of a zoneless application, I want the utility to need no zone and to keep pointer moves from running change detection, so that it is cheap.
39. As a developer with many tooltips on a page, I want closed panes to hold no observers and no listeners, so that the page stays fast.
40. As a plugin spec author, I want one Positioner, one registry, and one hover helper, so that the Dropdown, Tooltip, and Nested menu specs only map their Options onto them.
41. As a DropdownMenu spec author, I want the collision measurement and overlap test as plain functions, so that the `opens-left`, `opens-right`, and `opens-inner` check reuses Foundation's formulas.
42. As a library maintainer, I want the placement formulas as pure functions tested in node, and the geometry asserted in three engines, so that a regression shows at the layer that owns it.

## Implementation Decisions

### Foundation contract

The utility replaces Foundation's Positionable and Box, the `closeme.zf.*` part of Triggers, the `resizeme.zf.trigger` part of Triggers for positioned plugins, and the hover and body-click code in Dropdown, Tooltip, and DropdownMenu. Foundation has no public API for Positionable ("No public methods" in its type declarations); its contract is six Options that Dropdown and Tooltip inherit, two placement class sets, and events on the plugins.

| Foundation feature | What it does in 6.9 | Library counterpart |
| --- | --- | --- |
| `position` (`'auto'`) | Side of the anchor: `left`, `right`, `top`, `bottom`; `auto` becomes `bottom` (Dropdown) or `top` (Tooltip), after reading legacy `.top/.left/.right/.bottom` classes | Positioner `position`; `auto` resolves through `autoPosition`; legacy classes are not read by the utility (the Tooltip spec reads its trigger's legacy class for `auto`; the Dropdown spec drops them) |
| `alignment` (`'auto'`) | Edge that lines up; `auto` becomes `left` (`right` in RTL) for top/bottom and `bottom` for left/right (Dropdown), `center` (Tooltip); Dropdown reads `.float-*` on the anchor | Positioner `alignment`; `auto` resolves through `autoAlignment` or the RTL-aware base rule; `.float-*` not read |
| `vOffset`, `hOffset` (`0`) | Pixel distance, with Foundation's sign asymmetry on the alignment axis | Same, same formulas |
| `allowOverlap` (`false`) | Skip the search | Same |
| `allowBottomOverlap` (`true`, Tooltip `false`) | Ignore overflow past the bottom bound | Same; the consumer passes its default |
| `parentClass` (Dropdown, `null`) | Bound by the nearest ancestor with that class instead of the body box | Positioner `boundary` element; the Dropdown spec keeps `parentClass` and resolves it to the nearest matching ancestor |
| `tooltipHeight` 14, `tooltipWidth` 12 (Tooltip) | Added to `vOffset` for top/bottom and to `hOffset` for left/right, room for the pip | Positioner `pip` |
| `Box.GetExplicitOffsets`, `Box.OverlapArea`, `Box.GetDimensions` | Formulas in document coordinates; the bound is `document.body`'s box at the current scroll offset, with the right edge ignoring `scrollX` | Pure functions `nfsExplicitOffsets`, `nfsOverlap`, `nfsBodyBounds`, `nfsRectBounds`, `nfsPlace`; the asymmetric right edge is kept for parity |
| `_setPosition` search | Try alignments of the current position cyclically, then positions in the order `left, right, top, bottom`, re-measuring per candidate; least overlap if nothing fits; tried set kept across opens | Same order and least-overlap rule from one measurement; tried set fresh on every run |
| `$element.offset({top, left})` | Converts document coordinates to offset-parent `top`/`left` | Containing-block origin measured once (pane rect minus its computed `top`/`left`), inline `top`/`left` written |
| `.is-opening` | Displays the pane invisibly for measuring | Not needed: measuring happens after `.is-open` and before paint |
| `has-position-*`, `has-alignment-*` (pane); `{position}`, `align-{alignment}` (tip) | Placement classes; only the tip's are read by Foundation's Sass (pip) | The `placement` signal; the consumer binds its classes |
| `resizeme.zf.trigger` (debounced 250 ms window resize, MutationObserver bridge) | Re-runs `_setPosition` | `ResizeObserver` on pane, anchor, and bound while open |
| `closeme.zf.dropdown`, `closeme.zf.tooltip` with `data-yeti-box` | Opening one closes every other instance of the same plugin by window-level DOM query, parents included | Light dismiss sibling groups; ancestors are kept open |
| Dropdown `closeOnClick` body `click`/`tap` handler | Closes when a click lands outside the anchors and the pane | Light dismiss pointer rule, per-entry switch |
| Tooltip `clickOpen` | A click keeps the tip open "until you click somewhere else" | The Tooltip spec leaves the pointer rule on; `clickOpen` decides whether a press pins the tip |
| Dropdown Escape (`keydown` on anchors and pane) | Closes and focuses the anchors | Light dismiss Escape rule (document-level, topmost entry) |
| Dropdown `hover`, `hoverPane`, `hoverDelay` 250; Tooltip `hoverDelay` 200, `disableHover`; DropdownMenu `hoverDelay` 50, `closingTime` 500, `autoclose`, `disableHover` | `mouseenter`/`mouseleave` timers, gated by `what-input` (Dropdown), wrapped in `ignoreMousedisappear` | `nfsHoverIntent` with `openDelay`, `closeDelay`, `enabled`; the consumer maps its Options |
| Tooltip `disableForTouch`, DropdownMenu `disableHoverOnTouch` (`true`) | Drop hover handling on touch-capable devices | The helper ignores `pointerType: 'touch'` on every event; the Tooltip spec keeps `disableForTouch` with a per-press meaning, and the Dropdown Menu spec drops `disableHoverOnTouch` |
| DropdownMenu `Box.ImNotTouchingYou($sub, null, true)` | Left-and-right overflow test against the body box, used to flip `opens-*` | `nfsDocumentRect`, `nfsBodyBounds`, `nfsOverlap` with `axis: 'horizontal'` |

Not ported, deliberately: the tried-positions set kept across opens, the stale per-candidate measurement, the `closeme` DOM queries, the shared `click.zf.dropdown` namespace that let Reveal remove Dropdown's handler, `what-input`, `ignoreMousedisappear`, the `tap` special event, and the `.is-opening` measure dance.

### CSS class to Angular mapping

The utility adds no Foundation class and has no Structural class of its own. It depends on Foundation's `position: absolute` on the elements it places (`.dropdown-pane`, `.tooltip`, `.is-dropdown-submenu`), which the consumer's Foundation export mixins provide. Placement classes are bound by the consumers from the `placement` signal:

| Foundation class | Bound by | From |
| --- | --- | --- |
| `has-position-{position}`, `has-alignment-{alignment}` on `.dropdown-pane` | Dropdown pane directive | `placement()` |
| `{position}`, `align-{alignment}` on `.tooltip` | Tooltip tip component | `placement()` |
| `opens-left`, `opens-right`, `opens-inner` on `.is-dropdown-submenu-parent` | Nested menu utility in `dropdown` Menu mode | `nfsOverlap` result |
| `.is-open` on `.dropdown-pane`, `.js-dropdown-active` on submenus | Their consumers | The Openable's `isOpen` |

### Hierarchy and DI shape

```
ngx-foundation-sites/anchored-pane  (secondary entry point)
  nfsPositioner(options)      injection-context function, one per Anchored pane
    uses: Directionality (cdk/bidi), DOCUMENT, ElementRef, Renderer2, DestroyRef, afterRenderEffect
  NfsLightDismiss             @Service() registry, one per application
  nfsLightDismiss(options)    injection-context function, registers one entry while open
  nfsHoverIntent(options)     injection-context function, one per Hover region
    uses: NgZone.runOutsideAngular for timers and listeners
  pure: nfsExplicitOffsets, nfsOverlap, nfsPlace, nfsResolvePlacement,
        nfsBodyBounds, nfsRectBounds, nfsDocumentRect

consumers:
  [nfsDropdownPane]           nfsPositioner + nfsLightDismiss + nfsHoverIntent
  NfsTooltipTip / [nfsTooltip] nfsPositioner (tip) + nfsLightDismiss + nfsHoverIntent
  Nested menu, dropdown mode  nfsDocumentRect + nfsBodyBounds + nfsOverlap + nfsLightDismiss + nfsHoverIntent
  dialog[nfsReveal], non-modal  nfsLightDismiss only (group null, outsidePress from closeOnClick); no Positioner, no hover intent
```

- Only the registry is a service, because only it holds state shared across instances: the stack of open entries and one set of document listeners (building-blocks 1.5). It is `@Service()`: a tree-shakable root singleton that exists only if something injects it.
- The Positioner and the hover helper are injection-context functions, the shape of CDK's `createFlexibleConnectedPositionStrategy(injector, origin)` and Material's `_animationsDisabled()`: each Anchored pane owns its measurement, observers, placement, and timers, and a root service would need per-pane registration to hold them. The formulas they apply are pure functions, which is what "shared placement rules" amounts to.
- No injection token, no Defaults token, no provider function. The utility has no Foundation Options of its own; each consumer keeps its Options and its Defaults token (`nfsDropdownPaneDefaultsToken`, `nfsTooltipDefaultsToken`) and passes values in. RTL comes from CDK `Directionality`, so a `[dir]` ancestor or the document decides.
- Link to the Triggers utility: the consumer's `registerTrigger` set supplies the Triggers to Light dismiss (inside test) and to hover intent (Hover region), and the anchor is the element passed to `open(trigger)`, else the first registered Trigger.
- Entry point `ngx-foundation-sites/anchored-pane`; the Dropdown, Tooltip, and Nested menu entry points import it. It is public API for developers who build their own Anchored panes.

### API

Types:

```ts
type NfsPosition = 'top' | 'bottom' | 'left' | 'right';
type NfsAlignment = 'top' | 'bottom' | 'left' | 'right' | 'center';
interface NfsPlacement { readonly position: NfsPosition; readonly alignment: NfsAlignment; }
interface NfsRect { top: number; left: number; width: number; height: number; } // document px
interface NfsBounds { top: number; left: number; right: number; bottom: number; } // document px edges
type NfsDismissReason = 'click' | 'keydown' | 'tab' | 'sibling';
```

#### Positioner

```ts
interface NfsPositionerOptions {
  open: () => boolean;
  anchor: () => HTMLElement | null;
  position?: () => NfsPosition | 'auto';        // default 'auto'
  alignment?: () => NfsAlignment | 'auto';      // default 'auto'
  autoPosition?: NfsPosition;                   // default 'bottom' (Positionable); Tooltip 'top'
  autoAlignment?: NfsAlignment;                 // default: RTL-aware base rule; Tooltip 'center'
  vOffset?: () => number;                       // default 0
  hOffset?: () => number;                       // default 0
  pip?: () => { height: number; width: number }; // default 0 x 0; Tooltip 14 x 12
  allowOverlap?: () => boolean;                 // default false
  allowBottomOverlap?: () => boolean;           // default true (Positionable); Tooltip false
  boundary?: () => Element | null;              // default null: the body box
  followScroll?: () => boolean;                 // default true
}
interface NfsPositionerRef {
  readonly placement: Signal<NfsPlacement | null>; // last resolved placement, null until the first
  reposition(): void;                              // full search now, if open
}
function nfsPositioner(options: NfsPositionerOptions): NfsPositionerRef; // injection context; the placed element is the host
```

- The placed element is the injecting directive's or component's host (`ElementRef`): the `.dropdown-pane`, or the Tooltip tip component.
- Resolving `auto`: `position` `auto` is `autoPosition`. `alignment` `auto` is `autoAlignment` when given; otherwise Positionable's rule: for `top`/`bottom`, `left`, or `right` when `Directionality.valueSignal()` is `'rtl'`; for `left`/`right`, `bottom`. Explicit positions and alignments are physical in both directions, as Foundation's docs state.
- A run: while `open()` is true, the `earlyRead` phase reads the anchor rect, the pane size, the containing-block origin (the pane's rect minus its computed `top`/`left`, with `offsetTop`/`offsetLeft` when a browser answers `auto`), the page scroll, and the bound (body box via `nfsBodyBounds`, or the `boundary` element's document rect). The `write` phase resolves the start placement, runs `nfsPlace` over the 12 candidates computed from that one measurement, writes inline `top`/`left` with `Renderer2.setStyle`, and sets `placement`. Nothing runs while closed and nothing runs on the server.
- Search: with `allowOverlap` the start placement is used as is. Otherwise candidates are tried in Foundation's order (alignments of the current position cyclically, then positions `left, right, top, bottom` wrapping); the first with zero overflow wins; if none, the smallest overflow (Euclidean magnitude of the four spill-over distances, bottom ignored when `allowBottomOverlap`). The tried set is fresh on every run.
- Re-run triggers: opening, `open()` turning true, and `reposition()` run the full search. A `ResizeObserver` created lazily in the first open run observes the pane, the anchor, and the bound element (`body`, or the `boundary`); it observes only while open and disconnects on close and on destroy. An anchor or bound resize runs the full search. A pane resize runs the full search too, with a loop guard: when two consecutive pane-resize runs alternate between the same two placements, the Positioner keeps the current placement until the next open, anchor or bound resize, or `reposition()`; the e2e suite includes a shrink-to-fit tip at an edge to show the guard holds (the prototype did not test resize loops). With `followScroll` on, a captured, passive `scroll` listener on the document, added while open, re-measures and re-offsets in the current placement without a new search, so the pane stays attached inside static scrolling containers and never flips while scrolling.
- The resolved placement lands before paint: the `placement` write marks the consumer's view dirty inside the render phase, and Angular's tick re-runs change detection before the frame is painted, so the placement classes and the inline offsets appear together. `.is-opening` is not used.
- Inline `top`/`left` stay after close, so a leave animation plays in place; `placement` keeps its last value for the same reason.
- Dev-mode warnings (only when `ngDevMode`): a position and alignment on the same axis (`top` with `top`), treated as `center` as Foundation's formula does; negative offsets, which can make the pane cover its trigger (2.4.11); a placed element whose computed `position` is not `absolute`, which means the consumer's Foundation export mixin is missing.

#### Light dismiss registry

```ts
interface NfsLightDismissEntry {
  readonly pane: Element;                        // the Anchored pane or submenu element
  readonly triggers: () => readonly Element[];   // registered Triggers; presses on them are inside
  readonly group: string | null;                 // sibling group: 'nfs-dropdown-pane', 'nfs-tooltip', ...
  readonly outsidePress: () => boolean;          // the pointer rule on or off
  close(reason: NfsDismissReason): void;
}
@Service()
class NfsLightDismiss {
  add(entry: NfsLightDismissEntry): () => void;  // call when opened; the returned function removes it
}
function nfsLightDismiss(options: {
  isOpen: () => boolean;
  pane: () => Element | null;
  triggers: () => readonly Element[];
  group: string | null;
  outsidePress?: () => boolean;                  // default true
  close: (reason: NfsDismissReason) => void;
}): void; // injection context; adds the entry in a render callback while isOpen(), removes it on close and destroy
```

Rules, applied to the open entries in the order they were added (the stack):

1. Inside and ancestry. A node is inside an entry when the entry's pane or one of its Triggers contains it. An entry is an ancestor of another when it contains that entry's pane or one of its Triggers. Evaluated at event time, so Triggers registered after opening count.
2. Pointer rule (the HTML popover light-dismiss algorithm). A capture-phase `pointerdown` on the document records its target; the following `pointerup` decides. When both targets are outside an entry and outside every open descendant of it, and the entry's `outsidePress()` is true, the entry closes with `'click'`. The walk goes from the top of the stack down and keeps an entry that contains the target or contains a kept entry, so a press inside a child keeps the parent, and a press inside the parent closes the child. A touch scroll ends in `pointercancel`, not `pointerup`, so it never dismisses; a press that starts inside and ends outside never dismisses; a press on a registered Trigger is inside, so the Trigger's own `click` toggles.
3. Escape. A bubble-phase `keydown` on the document with `key === 'Escape'`, no modifier (`hasModifierKey`), not `isComposing`, and not `defaultPrevented` closes the topmost entry only, with `'keydown'`, then calls `preventDefault()` as its last statement, so an enclosing modal `<dialog>` does not also receive the close request (checked for this spec in Chromium 153, Firefox 155, and WebKit 26.6: a prevented `keydown` leaves the dialog open and fires no `cancel`; the next Escape closes it; a non-modal `<dialog>` has no Escape behaviour of its own). Bubble phase lets a control inside the pane (a combobox, a select) consume Escape first.
4. Focus rule. A `focusin` on the document whose target is outside an entry (and not inside any open descendant of it) closes that entry, with `'click'` while a pointer press is in progress and `'tab'` otherwise. Always on, for every entry. Clicking a non-focusable area inside a pane fires no `focusin`, so it never closes; focus leaving the window fires none either. A `focusin` whose target is no longer `document.activeElement` when it reaches the document is ignored: a focus trap's anchor that redirected focus into the pane produced it (CDK `FocusTrap` inserts its anchors beside the pane).
5. Sibling rule. Adding an entry with a non-null `group` closes every open entry of the same group that is not its ancestor, with `'sibling'`.
6. The registry attaches its five document listeners (`pointerdown`, `pointerup`, `pointercancel`, `keydown`, `focusin`) outside the Angular zone when the first entry is added and removes them when the last one leaves. `close()` runs the consumer's close path, which writes signals.

#### Hover intent

```ts
function nfsHoverIntent(options: {
  triggers: () => readonly Element[];   // where hovering opens
  pane: () => Element | null;           // part of the Hover region once open
  enabled: () => boolean;               // e.g. Dropdown hover, !Tooltip disableHover
  isOpen: () => boolean;
  openDelay: () => number;              // ms
  closeDelay: () => number;             // ms; the helper uses at least 100
  open: (trigger: Element) => void;     // the trigger the pointer entered, for anchoring
  close: () => void;
}): void; // injection context
```

- Listeners: `pointerenter` and `pointerleave` added in code on each Trigger and on the pane, from an `afterRenderEffect` that follows the element lists and removes them on change and destroy; outside the Angular zone.
- A `pointerenter` with `pointerType === 'touch'` is ignored; mouse and pen open. Hover opening therefore works with a mouse on a touch-screen laptop and never fires from a tap.
- Entering a Trigger starts the open timer (`openDelay`) and cancels a pending close; leaving the whole Hover region (Triggers plus pane) starts the close timer (`max(closeDelay, 100)`); re-entering any part cancels it. The 100 ms floor is what lets the pointer cross the gap between a trigger and its tip (Foundation closed a tooltip immediately).
- No auto-hide timer exists. Pending timers are cleared whenever `isOpen()` changes by any other path (a click, Escape, Light dismiss), so a dismissed pane does not reopen until the pointer leaves and re-enters.
- Timers are `setTimeout` started in handlers, never on the server.

#### Pure functions

```ts
function nfsExplicitOffsets(anchor: NfsRect, size: {width: number; height: number},
  placement: NfsPlacement, vOffset: number, hOffset: number): {top: number; left: number};
function nfsOverlap(rect: NfsRect, bounds: NfsBounds,
  options?: {axis?: 'both' | 'horizontal' | 'vertical'; ignoreBottom?: boolean}): number;
function nfsPlace(options: {start: NfsPlacement; allowOverlap: boolean; allowBottomOverlap: boolean;
  offsets: (position: NfsPosition) => {v: number; h: number}},
  bounds: NfsBounds, measure: (p: NfsPlacement) => NfsRect): NfsPlacement;
function nfsResolvePlacement(position: NfsPosition | 'auto', alignment: NfsAlignment | 'auto',
  auto: {position: NfsPosition; alignment?: NfsAlignment}, rtl: boolean): NfsPlacement;
function nfsBodyBounds(document: Document): NfsBounds;   // DOM read: call only in a render callback
function nfsRectBounds(rect: NfsRect): NfsBounds;
function nfsDocumentRect(element: Element): NfsRect;     // DOM read: call only in a render callback
```

`nfsOverlap` with `axis: 'horizontal'` is Box's `lrOnly` (left plus right spill-over), which DropdownMenu's `opens-*` check needs; `'both'` is the Euclidean magnitude. The formulas are the prototype's port of `Box.GetExplicitOffsets`, `Box.OverlapArea`, and `Positionable._setPosition`, trimmed here to signatures.

#### What each consumer maps

| Consumer Option | Dropdown pane | Tooltip | DropdownMenu (Nested menu, dropdown mode) |
| --- | --- | --- | --- |
| `position` / `alignment` | Positioner, `autoPosition` `bottom`, base `auto` alignment | Positioner, `autoPosition` `top`, `autoAlignment` `center` | Not the Positioner: `alignment` picks the initial `opens-*`, then `nfsOverlap` horizontal flips it |
| `vOffset`, `hOffset`, `allowOverlap` | Positioner | Positioner | none |
| `allowBottomOverlap` | Positioner, default `true` | Positioner, default `false` | none |
| `tooltipHeight`, `tooltipWidth` | none | Positioner `pip` (14 x 12) | none |
| `parentClass` | Positioner `boundary` | none | none |
| anchor | `open(trigger)`, else the first registered Trigger | the host (trigger) | the parent item |
| `closeOnClick` | Light dismiss `outsidePress` | none | Light dismiss `outsidePress` |
| `clickOpen` | none | `outsidePress` left at its default (on); `clickOpen` decides whether a press pins the tip | none |
| `hover`, `hoverDelay`, `hoverPane` | `nfsHoverIntent`, `enabled` = `hover`, both delays = `hoverDelay` (250); the pane must be in the Hover region (see ARIA requirements) | `enabled` = `!disableHover`, `openDelay` = `hoverDelay` (200), `closeDelay` from the Tooltip spec (floor 100) | `openDelay` = `hoverDelay` (50), `closeDelay` = `closingTime` (500), `enabled` = `!disableHover`; `autoclose` false keeps every hover-opened submenu open when the pointer leaves (Foundation closes on leave only while `autoclose` is on) |
| `disableForTouch`, `disableHoverOnTouch` | none | Per-event touch filter replaces the device check; `disableForTouch` kept, ignoring touch presses only (the Tooltip spec) | Per-event touch filter; `disableHoverOnTouch` dropped (the Dropdown Menu spec) |
| group | `'nfs-dropdown-pane'` | `'nfs-tooltip'` | the menu decides (submenu siblings are its own rule) |
| `autoFocus`, `trapFocus` | Dropdown pane spec (see ARIA requirements) | none | none |

An Openable that is also a Light dismiss entry (the Dropdown pane, a non-modal Reveal) keeps its two entry points apart: Light dismiss calls a private dismissal path that writes `isOpen` and emits `closed` with the dismiss reason, and `close(result?)` stays the Openable contract's own entry point, unaffected by that reason.

### Implementation level and primitives

Implementation level: custom Angular with platform measurement (ADR 0002). Native first: `popover` (light dismiss, top layer, nesting by invoker) and CSS anchor positioning (`position-area`, `position-try-fallbacks`) are the platform versions of this utility and both are outside the browser target (popover Baseline 2024 but Firefox 125 and iOS 18.3; anchor positioning Baseline 2026). `@angular/aria` 22.2 has no anchored-pane or dismissal pattern. `@angular/cdk` has Overlay, which the prototype measured and rejected (next section); from CDK the utility uses only `Directionality` and, in the consumers, `InteractivityChecker` and `FocusTrap`.

Primitives: `getBoundingClientRect` and `getComputedStyle` in `afterRenderEffect` `earlyRead`; `Renderer2.setStyle` in `write`; `ResizeObserver`; Pointer Events (`pointerdown`, `pointerup`, `pointercancel`, `pointerenter`, `pointerleave`, `pointerType`); `focusin`; `keydown` with `event.key`; `Node.contains`; `Directionality.valueSignal`; `hasModifierKey` from `@angular/cdk/keycodes`; `NgZone.runOutsideAngular` for listeners and timers; `DestroyRef`. All are in the browser target.

Fallback: none. The prototype showed the in-place port matching Foundation everywhere Foundation follows its own formulas, including scrolling ancestors, so CDK Overlay is not the fallback ADR 0002 first named; ADR 0002 now records it as measured and rejected, as the fallback too.

Hooks: `afterRenderEffect` for all three parts, because its phases re-run only when a tracked signal changes, so a closed pane costs nothing; `afterEveryRender` is not used (it would re-measure every pane after every change detection in the application), and `afterNextRender` is not needed.

Loading: eager. The utility is not offered through `injectAsync`: the Positioner is a per-pane function, not a DI token; placement and the Light dismiss registration must happen in the same render pass that shows the pane, which an awaited chunk on first open would delay (a frame at best, a network fetch on the first hover at worst, which `prefetch: onIdle` shortens but does not remove); the code is small and inert on the server; and each plugin's own entry point already lets a consumer's `@defer` load the utility with the Dropdown or Tooltip that needs it.

### Comparison with Angular Material and CDK

| Concern | CDK and Material | Anchored pane utility |
| --- | --- | --- |
| Placement | `FlexibleConnectedPositionStrategy` with a `ConnectedPosition[]` list, `withPush`, `withFlexibleDimensions`, `withViewportMargin` | Foundation's 12 placements, search order, and least-overlap rule; no push, no resizing, no margin |
| Collision bound | Viewport | Body box (Foundation), or a `boundary` element; the viewport was weighed and not taken (ticket answer, Triage) |
| Bottom allowance | None | `allowBottomOverlap` |
| Where the pane lives | Overlay pane in the overlay container, or after the trigger with `withPopoverLocation('inline')`, as a top-layer `popover="manual"`; not in server HTML | The consumer's own element, in place, in server HTML |
| Scrolling | `RepositionScrollStrategy`; static scrollers need `cdkScrollable` | `followScroll` on any scroller, no marker needed |
| RTL | `start`/`end` flip with `Directionality`; physical needs `direction: 'ltr'` forced | `Directionality` for the `auto` rule only; positions stay physical |
| Resolved position | `positionChange` output | `placement` signal |
| Manual update | `OverlayRef.updatePosition()`, `MatMenuTrigger.updatePosition()` | `reposition()` |
| Outside click | `OverlayOutsideClickDispatcher`: capture `pointerdown` records origin, `click` decides, innermost overlay first | Capture `pointerdown` records, `pointerup` decides (HTML popover algorithm), with Triggers inside and ancestry by containment |
| Escape | `OverlayKeyboardDispatcher` to the top overlay; Material menu and tooltip close on Escape without modifiers | Topmost entry, no modifiers, skips `defaultPrevented` |
| Close reason | `MenuCloseReason = void \| 'click' \| 'keydown' \| 'tab'` | Same words plus `'sibling'` |
| Hover | `matTooltipShowDelay`/`HideDelay` (0/0), `touchGestures`, `MediaMatcher` hover detection | `openDelay`/`closeDelay` with a 100 ms close floor; per-event touch filter |

Measured in the prototype on identical fixtures: CDK reproduces the pane geometry, but flips a dropdown at the bottom edge that Foundation keeps (no `allowBottomOverlap`), makes the opposite choice to Foundation in both body-box cases, follows a static scroller only with `cdkScrollable`, moves the tip 209 to 254 px in the 5 placements whose `overlayY` is `bottom` (Foundation's `.tooltip { top: calc(100% + pip) }` beats CDK's inline `bottom`), replaces the tip's 10rem `max-width` with its own `max-width: 100%; display: flex`, and leaves no pane in server HTML. Borrowed: Material's close-reason words, the modifier rule on Escape, the capture-phase pointer origin, `updatePosition()` as `reposition()`. Not borrowed: overlay containers, portals, scroll strategies, `cdkScrollable`, viewport bounds, push.

### ARIA requirements it imposes on consumers

The utility renders no ARIA and no role. Each consumer's pattern applies (Disclosure or non-modal Dialog for the Dropdown pane, Tooltip for the tip, Disclosure navigation for DropdownMenu), with these requirements that follow from the utility:

- Never `aria-hidden` on a pane: Foundation's `display: none` on a closed `.dropdown-pane` and `hidden` or a State class on a closed tip already remove it from the accessibility tree (building-blocks 1.10). Never `aria-modal` on a pane, trapped or not (APG dialog: modal only with an obscuring overlay).
- Focus return: on `'keydown'` with focus inside the pane, move focus to the Trigger that opened it; on `'click'`, `'tab'`, and `'sibling'`, move no focus (the user already put it somewhere).
- Hover region: a hover-opened pane passes itself as `pane` to `nfsHoverIntent` (WCAG 1.4.13 hoverable). Foundation's Dropdown `hoverPane: false` leaves the pane out and fails 1.4.13, so the [Spec: Dropdown](../issues/26-spec-dropdown.md) drops the Option: a hover-opened pane is always in the Hover region.
- Focus opening: a `focusin` host listener that opens (Tooltip) re-checks `document.activeElement` against its host before opening, because a replayed `focusin` can arrive after focus has moved on.
- `autoFocus` (Dropdown pane): the first element in DOM order for which `InteractivityChecker.isFocusable` (which includes `isVisible`) and `isTabbable` hold, CDK's first-tabbable rule, focused in a render callback after the pane is placed; Foundation's tabindex sort is not kept. `trapFocus`: CDK `FocusTrap` on the pane while open, never with `aria-modal`, and Escape still closes (2.1.2 No Keyboard Trap); while a trap holds focus the focus rule never fires.
- Trigger ARIA stays with the Triggers utility (`aria-expanded`, `aria-controls`, `aria-haspopup="dialog"`); a tooltip host carries `aria-describedby` to the tip once it exists.

Keyboard behaviour the utility supplies:

| Key or input | Behaviour | Owner |
| --- | --- | --- |
| Escape | Closes the topmost open entry, wherever focus is; skipped when a control already handled it | Light dismiss |
| Tab, Shift+Tab out of the pane | Closes it (focus rule) | Light dismiss |
| Enter, Space on a Trigger | Toggles (native `click`) | Triggers |
| Pointer press outside | Closes entries whose pointer rule is on | Light dismiss |
| Pointer over Trigger, then pane | Opens after `openDelay`, stays open while over either | Hover intent |

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). The utility renders no content of its own, so each criterion below is met as a requirement through what the utility guarantees and what each consumer spec must do; the consumer specs test them on their own stories and fixture routes. WCAG 2.2 AA criteria the consumers inherit, and what the utility guarantees:

| Criterion | Utility guarantee | Consumer's part |
| --- | --- | --- |
| 1.4.13 Content on Hover or Focus | Dismissible: Escape closes the topmost entry from anywhere, without moving pointer or focus, and hover does not reopen it until the pointer re-enters. Hoverable: the pane is in the Hover region and the close delay is at least 100 ms. Persistent: no auto-hide; closes only on leaving the region, Escape, outside press, focus leaving, or a sibling opening | Pass the pane to `nfsHoverIntent`; register every hover or focus-opened pane with Light dismiss |
| 2.4.11 Focus Not Obscured (Minimum) | Every placement formula puts the pane beside its anchor, never over it, for offsets of 0 or more (dev warning below 0); focus moving outside a pane closes it, so a pane never stays over the next focused control; sibling groups keep one pane of a kind open | Keep offsets non-negative |
| 1.4.10 Reflow | At 320 CSS px the search tries all 12 placements against the body box and picks one with no spill-over whenever one exists (least spill-over otherwise); the pane is never moved or resized beyond Foundation's formulas | Size panes to fit (Foundation's `.tiny`/`.small` classes or `$dropdown-width`); a 300 px default pane fits a 320 px page only from some anchors |
| 2.5.8 Target Size (Minimum) | Adds no targets; never places a pane over its Trigger | Triggers are the consumers' buttons |
| 1.3.2 Meaningful Sequence, 2.4.3 Focus Order | The pane stays where the consumer wrote it, so reading and focus order follow the DOM | Write the pane right after its Trigger |
| 2.1.2 No Keyboard Trap | Escape and the focus rule always apply | `trapFocus` stays non-modal |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). The utility draws nothing, so it needs no Sass setting, no library rule, and no compile-time contrast check of its own; the colours of `.dropdown-pane` and `.tooltip` are the consumer specs' criteria.

### Rendered output

The utility's only DOM output is inline `top` and `left` on the placed element, written after open, plus the classes consumers bind from `placement`. Server HTML carries neither.

```html
<!-- Dropdown pane: consumer markup -->
<button nfsButton [nfsToggle]="account">Account</button>
<div nfsDropdownPane #account="nfsDropdownPane" id="account-pane" class="dropdown-pane" vOffset="7">...</div>

<!-- server and closed: no inline offsets, no placement classes -->
<div id="account-pane" class="dropdown-pane">...</div>

<!-- hydrated, after opening (anchor 75.86 x 40.88 px at the pane's containing-block origin) -->
<div id="account-pane" class="dropdown-pane is-open has-position-bottom has-alignment-left"
     style="top: 47.88px; left: 0px;">...</div>

<!-- Tooltip tip: created on first show as the trigger's next sibling, kept after close -->
<button type="button" class="has-tip" nfsTooltip="Fancy word for a beetle" aria-describedby="nfs-tooltip-1">scarabaeus</button>
<nfs-tooltip-tip id="nfs-tooltip-1" class="tooltip top align-center" role="tooltip"
                 style="top: -57.19px; left: 0.75px;">Fancy word for a beetle</nfs-tooltip-tip>
```

The Dropdown and Tooltip specs own their inputs, their `id`s, and how the closed tip is hidden; the offsets and classes here are the utility's part. The pane's containing block is its nearest positioned ancestor: for a Dropdown pane that is wherever the consumer wrote it; for the tip, because it is the trigger's next sibling, the trigger's nearest positioned ancestor, not `.has-tip`.

### Animation

None. The utility inserts or removes nothing and binds no State class or Motion class; ADR 0003 applies to its consumers. Two facts consumers rely on: the pane is placed in the same tick that shows it and before paint, so an enter keyframe on `.is-open` starts at the final position; and inline offsets and `placement` are kept after close, so a leave animation plays where the pane was. Hover delays are not motion and do not change under `prefers-reduced-motion`; the utility does not read the Breakpoint service's `reducedMotion`.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: nothing runs. `afterRenderEffect` never runs on the server, so no measurement, no inline offsets, no observers, no listeners, no timers; `placement` is `null`. The consumer's pane is in the server HTML hidden by Foundation's CSS, so `aria-controls` is valid (rule 1). The tip is never server-rendered.
- Open at first paint (a Dropdown pane whose `isOpen` is initially true): the server renders `.is-open` with no offsets, so the pane shows at its static position, which for Foundation's docs markup (pane right after its trigger) is below the trigger; the first client render callback after hydration places it and registers it with Light dismiss. One visible settle, accepted and stated; content stays visible to crawlers, no-JS users, and `hydrate never` blocks.
- Before hydration: document listeners are attached only by the registry, only when an entry is added, and entries are added only in render callbacks, so none exist before hydration (rules 3 and 5). Hover listeners and timers likewise start only in render callbacks and handlers, outside the zone (rule 4).
- Full hydration: the utility writes no host binding and no structure, so hydration has nothing to compare (rule 10); inline offsets are written after hydration only.
- Event replay: the Light dismiss listeners are document-level and added in code, so they never replay, which is correct because nothing is open before hydration. A trigger `click` before hydration replays through the Trigger's host listener, opens the pane, and the Positioner places it in the following render callback, when layout exists. `pointerenter` and `pointerleave` are not replayed types and the hover listeners are added in code, so a hover before hydration does nothing; the next pointer entry after hydration opens. A replayed `focusin` that opens a tooltip re-checks live focus (ARIA requirements). The registry's Escape handler calls `preventDefault()` last and is never replayed, so the replay error cannot occur in it.
- Hydration boundary: a Trigger, its pane, and (for nested panes) the parent pane belong in one boundary (ADR 0008; building-blocks 1.11 decision 6).
- `@defer`: library code contains no `@defer`. Inside a dehydrated block a pane is its server HTML, closed; a trigger click hydrates the block, replays, opens, and places. With `hydrate on hover` the first hover only hydrates the block (its `mouseover` trigger fires, but the `pointerenter` that would open has already passed), so hover-opened panes open on the second entry; `hydrate on viewport` or `on idle`, which usually hydrate before the pointer arrives, avoid that. Inside `hydrate never` panes stay closed (an open-at-first-paint pane stays at its static position) and nothing dismisses. Plain `@defer` renders on the client like any client render.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; pointer, focus, key, scroll, and timer callbacks run outside the Angular zone and reach Angular only by writing signals or calling the consumer's close path, so pointer movement never runs change detection.

### Sass and custom CSS

No library CSS. The utility writes inline `top`/`left`, which is Foundation's own mechanism (`$.fn.offset()` wrote the same inline styles), and depends on the `position: absolute` that Foundation's export mixins give `.dropdown-pane`, `.tooltip`, and `.is-dropdown-submenu`. No `--nfs-*` custom property is used: a `top: var(--nfs-...)` rule would be custom CSS for something Foundation already expresses inline. The Sass subsection is under Further Notes.

## Testing Decisions

A good test asserts what a user or assistive technology observes: where the pane box is relative to its anchor, which placement classes it carries, whether it is open, where focus is, and which close reason reached the consumer. No test reads the utility's private state. Tests that need a consumer before the Dropdown and Tooltip specs exist use test consumers: a test pane directive on a `.dropdown-pane` that provides `nfsOpenableToken`, calls all three parts, binds `has-position-*`, and records close reasons; and a test tip. They live with the tests and stories, not in the public API. Geometry is compared with the pure formulas and with the Foundation 6.9 values recorded by the [Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay](../issues/44-prototype-anchored-pane.md) (trigger 75.86 x 40.88 px; for example dropdown `bottom-left` at `(11, 47.88)` with `vOffset` 7 and `hOffset` 11); Foundation's JavaScript is not a test dependency. There is no prior art in the new repository; the patterns are the building-blocks testing rule, the prototype's suite, and the Triggers spec's test Openable.

Story ids follow `anchored-pane--<story>`: `anchored-pane--placements`, `anchored-pane--auto-position`, `anchored-pane--rtl`, `anchored-pane--light-dismiss`, `anchored-pane--nested-panes`, `anchored-pane--sibling-group`, `anchored-pane--hover-intent`, `anchored-pane--escape-in-dialog`, `anchored-pane--scrolling-ancestor`, and `anchored-pane--fixture` (args-driven geometry for e2e: position, alignment, offsets, pane kind, trigger coordinates, containing block `none | relative | scroll | scroll-static`, direction, body height, text length).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` on the library's WCAG 2.2 AA rule set (`runOnly` tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`, ADR 0018), which includes axe's `target-size` rule for the stories' Triggers; axe runs with each pane open as well as closed.

- `anchored-pane--placements`: for each of the 12 placements (args), open the pane and assert the placement classes and that the pane box sits on the expected side of the anchor within 0.5 px of the formula.
- `anchored-pane--auto-position`: triggers near each viewport edge; the resolved placement equals the prototype's (`bottom-right` near the right edge, `right-top` for `position: left` near the left edge, `bottom-left` for `position: top` near the top edge).
- `anchored-pane--rtl`: under `dir="rtl"`, `auto` alignment resolves to `right`; an explicit `left-top` stays physical.
- `anchored-pane--light-dismiss`: outside click closes with `'click'`; clicking the Trigger of the open pane closes it once (no reopen); Escape closes with `'keydown'` and focus returns to the Trigger; tabbing out closes with `'tab'`; clicking a non-focusable area inside the pane keeps it open; with the pointer rule off, an outside click on plain text keeps it open.
- `anchored-pane--nested-panes`: a child pane opened from inside a parent; a click in the parent closes only the child; Escape closes the child, then the parent.
- `anchored-pane--sibling-group`: opening pane B closes pane A of the same group with `'sibling'`; a pane of another group stays open.
- `anchored-pane--hover-intent`: hovering the Trigger opens after the delay; moving onto the pane keeps it open; leaving both closes after the delay; Escape while hovering closes and it does not reopen until the pointer re-enters.
- `anchored-pane--escape-in-dialog`: a pane inside a modal `<dialog>` opened with `showModal()`; Escape closes the pane, the dialog stays open, and no `cancel` fires; a second Escape closes the dialog.
- `anchored-pane--scrolling-ancestor`: scrolling a static scroller with `followScroll` keeps the pane attached; with it off the pane detaches, as in Foundation.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the utility, over bare test host components (the test consumers above), zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here (ADR 0018).

- Positioner phases: a run measures once and writes once per open; nothing runs while closed; the observer observes only while open and disconnects on close and destroy; an anchor, bound, or pane resize re-runs; the loop guard stops an alternating pane-resize pair; `reposition()` searches while open and does nothing while closed; `followScroll` re-offsets without changing `placement`.
- `placement` and the consumer's classes change in the same tick as the inline offsets (one `whenStable()`), and `placement` keeps its value after close.
- RTL through a local `Directionality` test double backed by a signal, or CDK's `[dir]` wrapper; switching direction while open re-places.
- Dev-mode warnings: same-axis alignment, negative offsets, a placed element that is not `position: absolute`; none for correct input.
- Registry, driven by dispatched events: the pointer rule with `pointerdown` and `pointerup` outside, inside, split (down inside, up outside), and `pointercancel`; Trigger presses inside; ancestry through a child whose Trigger sits in the parent and through a child written elsewhere; Escape topmost-only, skipped when `defaultPrevented`, with a modifier, or while composing, and `preventDefault()` called; focus rule reasons (`'tab'` versus `'click'` during a press); a `focusin` dispatched on an element outside the pane while focus sits inside does not close it (the stale focus-trap-anchor guard); sibling rule keeping ancestors; listeners attached on the first entry and removed after the last (asserted by spying on `addEventListener`/`removeEventListener`).
- Hover intent with fake timers: `openDelay` and `closeDelay`; the 100 ms floor; touch `pointerenter` ignored; timers cleared when `isOpen` changes elsewhere; listeners follow a changing Trigger list.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`; a zone-based fixture shows no change detection from `pointermove`.

### 3. Node-level Vitest

- Pure logic, table-driven: `nfsExplicitOffsets` for the 12 placements with and without offsets and pip; `nfsPlace` visiting candidates in Foundation's order (a bound that always collides yields the 12 in sequence), returning the first zero-overflow candidate, the least-overlap candidate when nothing fits, and starting fresh on every call; `nfsOverlap` in all three axes with `ignoreBottom`; `nfsBodyBounds` asymmetry reproduced from a stub document; `nfsResolvePlacement` for both `auto` sets in LTR and RTL.
- SSR smoke: `renderApplication` over a fixture with the test pane (closed and open at first paint), a test tip host, and hover intent enabled. `whenStable()` resolves (no pending timers); the server HTML carries no inline `top`/`left` and no placement classes; the open pane carries `.is-open`; no tip element exists; no document listener was added (spy on the server document). Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `anchored-pane--fixture` through `mount(storyId, props)`, in Chromium, Firefox, and WebKit:

- The 12 placements for pane and tip, compared with the formula and the prototype's recorded values within 0.1 px.
- Fallback at every edge, nothing-fits in a 300 x 300 viewport, and reopen after a nothing-fits open then widening (searches again: `top-right`, not Foundation's stale `right-bottom`).
- Body box: a short body flips a tip near its bottom; a tall body keeps a tip below the fold (the default; flips if the bound switches to the viewport).
- `position: relative` ancestor, positioned scroller with the trigger partly scrolled out, static scroller with and without `followScroll`.
- Resize from 1280 to 900 px re-places within 0.02 px.
- RTL `auto` alignment and physical explicit positions.
- Reflow: at 320 x 640 a `.small` (200 px) pane from a trigger at the left edge and at the right edge lands with `document.documentElement.scrollWidth` equal to the viewport width.
- Loop guard: a long tooltip at the right edge whose width depends on where it sits settles in one placement within two frames and stays there.
- Clipping limit: a long tooltip inside a positioned `overflow: auto` scroller is clipped (asserted, so a change is noticed); the same tooltip in a static scroller is not.
- Real input: a real mouse path from trigger across the gap onto the tip keeps it open; touch emulation (`hasTouch`) tap does not hover-open; Escape in a pane inside a modal `<dialog>` closes only the pane, in all three engines; Tab wrap through CDK trap anchors keeps a trapped pane open in all three engines.

Against the prerendered fixture app, one route with a Dropdown-shaped test pane, a tooltip-shaped test tip, and a pane open at first paint:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with `withTags` on `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice`); closed panes hidden, the open pane visible at its static position.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; after hydration the open pane carries inline offsets and its placement classes.
- Pre-hydration click with the main bundle delayed: the pane opens exactly once after hydration and is placed; an outside click before hydration does nothing.
- `@defer (hydrate on interaction)` block holding a Trigger and pane: the click hydrates, opens, and places.
- `@defer (hydrate never)`: the pane stays closed and no error is logged.

## Out of Scope

- Each consumer's Options, defaults, outputs, and ARIA: the Dropdown, Tooltip, and Nested menu specs. This spec fixes only what they pass to the utility and what it guarantees back.
- `autoFocus` and `trapFocus` implementations (the Dropdown pane spec), and DropdownMenu's `opens-*` classes and `alignment: auto` rules (the Nested menu spec).
- Legacy position classes (`.top`, `.float-right`) as defaults: decided by the consumer specs (the Tooltip spec reads its trigger's legacy class for `auto`; the Dropdown spec drops them).
- CDK Overlay, portals, and top-layer hosting of the tip (weighed and not taken; ticket answer, Triage).
- OffCanvas dismissal (its own overlay) and modal Reveal dismissal (`<dialog>`); a non-modal Reveal uses Light dismiss only.
- Native `popover`, CSS anchor positioning, `interestfor`, and `CloseWatcher` (out of target; Further Notes).
- Library CSS and runtime theming.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Three parts: Positioner, Light dismiss registry, hover-intent helper, in one entry point; no directive, component, token, Defaults token, or provider function | Consumers already own the element, Options, and defaults; the utility only computes and dismisses | A directive on the pane (a second directive on every consumer host); a `provideNfsAnchoredPane()` (nothing to configure) |
| D2 | Positioner is an injection-context function over pure formulas, not a service | Per-pane state (measurement, observer, placement); the shared part is pure; CDK's `create*Strategy(injector)` shape | A root `@Service()` holding per-pane registrations (building-blocks Table C's first sketch, since replaced) |
| D3 | Light dismiss is the one `@Service()` | The stack and one set of document listeners are shared state (building-blocks 1.5) | Per-pane document listeners (N listeners, no nesting or sibling rule) |
| D4 | Foundation's formulas, search order, and least overlap, from one measurement, fresh every run | Prototype: matches Foundation to 0.02 px; fixes the stale-height and kept-tried-set bugs | Re-measuring per candidate (16 layouts, and the stale-height bug) |
| D5 | Body-box Collision bound by default | ADR 0002 "match Foundation 6.9"; one-line switch | Viewport (CDK and the platform; a tip would flip instead of sitting below the fold on tall pages) |
| D6 | Inline `top`/`left` via `Renderer2` in the `write` phase | Foundation's own mechanism; before paint; no library CSS | `--nfs-*` properties plus a CSS rule (custom CSS Foundation does not need); host style bindings (a frame late) |
| D7 | `ResizeObserver` on pane, anchor, and bound, only while open | Replaces debounced `resizeme`; closed panes cost nothing | Always observing (the prototype's shape); window `resize` |
| D8 | `followScroll` on by default, re-offsetting in the current placement | Fixes the static-scroller detachment Foundation also has; no flipping while scrolling | Off by default (Foundation parity, detaches); re-searching on scroll |
| D9 | `placement` signal, classes bound by consumers | Each consumer has different Foundation classes; lands before paint through the tick loop | The utility writing classes (conflicts with host `[class]` bindings) |
| D10 | Pointer rule = HTML popover light dismiss (down and up outside, capture) | Touch scroll and inside-out drags never dismiss; no iOS non-clickable-target issue; the same model native `popover` will bring | `pointerdown` alone (dismisses on scroll swipes); `click` with pointerdown origin (CDK; relies on click reaching the document); Foundation body `click`/`tap` |
| D11 | Triggers and open descendants are inside; ancestry by containment of pane or Trigger | A Trigger click toggles; nested panes work whether or not the child is a DOM descendant; the popover invoker rule | DOM containment only |
| D12 | Escape: document bubble phase, topmost only, skip handled or modified keys, `preventDefault()` last | WCAG 1.4.13 dismissible from anywhere; inner controls first; the enclosing dialog stays open | Host `keydown.escape` on trigger and pane (Foundation; fails 1.4.13 for hover content) |
| D13 | Focus moving outside closes, always | APG disclosure navigation and building-blocks 1.10; WCAG 2.4.11 | Foundation's no focus rule; an opt-out switch |
| D14 | Sibling groups replace `closeme.zf.*`, ancestors kept | One of a kind open, as Foundation; Foundation also closed parents, which breaks nesting | One global group (native `auto`: a tooltip would close a dropdown) |
| D15 | Close reasons `'click' \| 'keydown' \| 'tab' \| 'sibling'` | Material `MenuCloseReason` words plus the sibling case | New words |
| D16 | Hover: code-added `pointerenter`/`pointerleave`, per-event touch filter, 100 ms close floor, no auto-hide | Not replayed anyway; 1.4.13 hoverable and persistent; hybrid devices keep mouse hover | `what-input` and device-level `disableHoverOnTouch`; host listeners (the region is not one element) |
| D17 | No CDK Overlay, not even as fallback | Prototype: viewport bound, no `allowBottomOverlap`, broken `.tooltip` CSS, no server pane | ADR 0002's original fallback |
| D18 | No library CSS | Foundation's `position: absolute` plus inline offsets is enough | A `nfs-anchored-pane` mixin |
| D19 | Open-at-first-paint panes render `.is-open` at their static position and settle once | Content visible without JavaScript; ADR 0008 first paint | `.is-opening` on the server (invisible forever in `hydrate never`) |
| D20 | Loaded eagerly with its consumer, not through `injectAsync` | Placement and registration in the same pass that shows the pane; the Positioner is a function, not a token; small and inert on the server; per-plugin entry points already split under `@defer` | `injectAsync(..., {prefetch: onIdle})` on first open (first-show latency, a missed early Escape) |
| D21 | `afterRenderEffect` for every DOM step | Re-runs only on tracked signal changes; closed panes cost nothing | `afterEveryRender` (re-measures every pane after every change detection); `afterNextRender` (state-driven work is not one-shot) |

### Usage examples

A sketch of the Dropdown pane directive's use of the utility (the [Spec: Dropdown](../issues/26-spec-dropdown.md) owns its inputs and the rest of the directive):

```ts
@Directive({
  selector: '[nfsDropdownPane]',
  exportAs: 'nfsDropdownPane',
  providers: [{provide: nfsOpenableToken, useExisting: NfsDropdownPane}],
  host: {
    class: 'dropdown-pane',
    '[class.is-open]': 'isOpen()',
    '[class]': 'placementClasses()',
    '[attr.id]': 'id()',
  },
})
export class NfsDropdownPane implements NfsOpenable {
  readonly isOpen = model(false);
  readonly position = input<NfsPosition | 'auto'>('auto');
  readonly alignment = input<NfsAlignment | 'auto'>('auto');
  readonly vOffset = input(0, {transform: numberAttribute});
  readonly hOffset = input(0, {transform: numberAttribute});
  readonly hover = input(false, {transform: booleanAttribute});
  readonly hoverDelay = input(250, {transform: numberAttribute});
  readonly closeOnClick = input(false, {transform: booleanAttribute});
  // ... id, triggerRole, allowOverlap, allowBottomOverlap, closed output, and the rest

  readonly #element: HTMLElement = inject(ElementRef).nativeElement;
  readonly #triggers = signal<readonly HTMLElement[]>([]);
  readonly #anchor = signal<HTMLElement | null>(null);

  readonly #positioner = nfsPositioner({
    open: this.isOpen,
    anchor: () => this.#anchor() ?? this.#triggers()[0] ?? null,
    position: this.position,
    alignment: this.alignment,
    vOffset: this.vOffset,
    hOffset: this.hOffset,
  });

  protected readonly placementClasses = computed(() => {
    const p = this.#positioner.placement();

    return p ? `has-position-${p.position} has-alignment-${p.alignment}` : '';
  });

  constructor() {
    nfsLightDismiss({
      isOpen: this.isOpen,
      pane: () => this.#element,
      triggers: this.#triggers,
      group: 'nfs-dropdown-pane',
      outsidePress: this.closeOnClick,
      close: (reason) => this.#dismiss(reason),
    });
    nfsHoverIntent({
      triggers: this.#triggers,
      pane: () => this.#element,
      enabled: this.hover,
      isOpen: this.isOpen,
      openDelay: this.hoverDelay,
      closeDelay: this.hoverDelay,
      open: (trigger) => this.open(trigger as HTMLElement),
      close: () => this.close(),
    });
  }

  open(trigger?: HTMLElement): void {
    this.#anchor.set(trigger ?? null);
    this.isOpen.set(true);
  }

  close(result?: unknown): void {
    this.#dismiss(undefined); // the Openable contract's entry point; result is not a dismiss reason
  }

  #dismiss(reason: NfsDismissReason | undefined): void {
    this.isOpen.set(false);
    // returns focus on 'keydown' when focus is inside, emits closed with reason
  }
  // toggle, registerTrigger ...
}
```

The Tooltip tip, created by the Tooltip directive on first show as the trigger's next sibling:

```ts
@Component({
  selector: 'nfs-tooltip-tip',
  template: '{{ text() }}',
  host: {class: 'tooltip', role: 'tooltip', '[attr.id]': 'id()', '[class]': 'placementClasses()'},
})
export class NfsTooltipTip {
  readonly text = signal('');
  readonly isOpen = signal(false);
  readonly anchor = signal<HTMLElement | null>(null);
  readonly options = signal<{position: NfsPosition | 'auto'; alignment: NfsAlignment | 'auto'}>({
    position: 'auto',
    alignment: 'auto',
  });

  readonly #positioner = nfsPositioner({
    open: this.isOpen,
    anchor: this.anchor,
    position: () => this.options().position,
    alignment: () => this.options().alignment,
    autoPosition: 'top',
    autoAlignment: 'center',
    pip: () => ({height: 14, width: 12}),
    allowBottomOverlap: () => false,
  });

  protected readonly placementClasses = computed(() => {
    const p = this.#positioner.placement();

    return p ? `${p.position} align-${p.alignment}` : '';
  });
}
```

The Tooltip directive then calls `nfsHoverIntent` with its host as the one Trigger and the tip as the pane, and `nfsLightDismiss` with group `'nfs-tooltip'` and `outsidePress` left at its default (on); `clickOpen` decides whether a press pins the tip. A consumer building its own anchored element (a date hint, a colour picker) uses the same three calls on a Foundation-styled `position: absolute` element.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This utility relies on the `position: absolute` that the consumers' Foundation export mixins give the elements it places: `foundation-dropdown` (`.dropdown-pane`), `foundation-tooltip` (`.tooltip`), and `foundation-dropdown-menu` (`.is-dropdown-submenu`); it includes none of them itself. No library CSS; there is no `nfs-anchored-pane` mixin. (1) Rules: none. (2) Reused settings: none directly; `$dropdown-width`, `$dropdown-sizes`, `$tooltip-max-width`, and `$dropdownmenu-min-width` reach it only as the measured size of the element. (3) Custom properties: none; placement is inline `top`/`left`. (4) Motion classes: none, and no `prefers-reduced-motion` override, because the utility animates nothing. (5) Nothing breaks from a missing include, because there is none; a missing Foundation export mixin leaves the element unpositioned, which the dev-mode `position` check reports.

### Platform features to adopt when the browser target moves

- `popover="auto"` (Baseline widely available about 2026-10 to 2027-07): replaces the Light dismiss registry for panes: outside press with the same down-and-up rule, Escape as a close request, nesting by invoker, one-open-at-a-time. The registry's model is the platform's on purpose, so the switch changes no behaviour. The pane moves to the top layer, which also removes the tip-clipping and stacking limits.
- `popover="hint"` (no WebKit release yet): tooltips that do not close an open dropdown, the platform's form of this spec's separate sibling groups.
- CSS anchor positioning (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks: flip-block, flip-inline`, `@position-try` for Foundation's order; Baseline 2026): replaces the Positioner. Foundation's 12 placements map onto `position-area` keywords plus offsets as margins; the body-box bound has no CSS counterpart (anchor positioning checks overflow against the pane's containing block), so adopting it retires the body-box bound, a behaviour change the upgrade must list. `placement` would then come from `@container anchored(fallback: ...)` or stay unread.
- Interest invokers (`interestfor`): declarative hover and focus opening with platform delays, replacing `nfsHoverIntent`.
- `CloseWatcher` and `dialog.requestClose()`: the Android back gesture closes the topmost pane.

### Foundation behaviour changed or dropped

- The search runs on every open (Foundation stops searching after one nothing-fits open) and uses one measurement (Foundation's tip lands 19.19 px off its own formula).
- The tip lives next to its trigger instead of in `body`, so a positioned `overflow` ancestor clips it and an ancestor stacking context bounds its `z-index` (accepted and documented; the Tooltip spec states it); panes were already in place in Foundation.
- Panes follow their trigger through static scrolling containers (`followScroll`).
- Escape closes Tooltips and hover-opened panes from anywhere, focus leaving closes every pane, and hover content stays open while the pointer is over it: WCAG 2.2 AA fixes over Foundation.
- Opening a pane no longer closes an open parent pane of the same kind (`closeme` did).
- `what-input`, `ignoreMousedisappear`, the `tap` event, `data-yeti-box`, `data-resize`, `aria-hidden` on panes, and the `.is-opening` dance are gone.
