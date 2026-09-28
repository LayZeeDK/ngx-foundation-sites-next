# Spec: Dropdown

Ticket: [Spec: Dropdown](../issues/26-spec-dropdown.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA.

## Problem Statement

A developer building an Angular application on Foundation for Sites wants Foundation's Dropdown: a `.dropdown-pane` of arbitrary content (a short text, a login form, a list of links) that opens under a button on click or hover and sits against it. Foundation does this with a jQuery plugin on the pane, the Triggers utility's `data-toggle="id"`, and the Positionable and Box utilities. That design leaves the developer with problems an Angular library must not copy:

- The trigger is announced as a menu button: every anchor gets `aria-haspopup="true"`, which WAI-ARIA defines as `menu`, although the pane is a form or a block of text with no menu keyboard. The pane gets `aria-hidden` toggled by hand and an `aria-labelledby` that points at a generated anchor id.
- Keyboard support is partly dead code: Enter and Space are registered as `toggle`, a command the handler never defines, so they only work because a `<button>` synthesises a `click`. Escape works only while focus is on the trigger or in the pane.
- A hover-opened pane closes when the pointer leaves the trigger unless `hoverPane` is set, and `hoverPane` defaults to `false`, so the pointer cannot reach the pane's content by default. That fails WCAG 2.2 AA 1.4.13 (content on hover or focus). Hover opening is gated by the `what-input` package's `body[data-whatinput]` attribute.
- Outside clicks close the pane only with `closeOnClick`, through a body handler whose jQuery namespace Reveal shares, so closing a Reveal silently removes an open Dropdown's outside-click handler. Opening one Dropdown closes every other one through a window-level DOM query, parents included, so a pane inside a pane cannot stay open.
- `autoFocus` and `trapFocus` fire on every open, hover included, so a pointer passing over a hover trigger moves keyboard focus.
- The position search remembers the placements it tried across opens, so after one open where nothing fitted, later opens skip the search and leave the pane overflowing. At 320 CSS px Foundation's 300 px pane overflows from many trigger positions, which forces two-dimensional scrolling (WCAG 1.4.10).
- The legacy `.top`, `.left`, `.right`, `.bottom` classes on the pane and `.float-*` on the anchor silently change the placement, through a regular expression that also matches parts of unrelated class names.
- The markup is its classes: the developer writes `.dropdown-pane`, a size class (`.tiny`, `.small`, `.large`, or one their `$dropdown-sizes` adds), and the legacy position classes by hand, so a misspelt size silently falls back to the default width. Under the library's class rule the developer writes no Foundation or library class, not even as an input value, so each of those classes needs an Angular home.

A server-rendered Angular application adds more: the pane must be in the server HTML so the trigger's `aria-controls` is valid before hydration; nothing may be measured on the server; a click before hydration must still open the pane once the page hydrates; and nothing may move the pane or listen on the document before hydration.

## Solution

One attribute directive, `nfsDropdownPane`, on the element the developer writes where Foundation's docs write `.dropdown-pane`, with no Foundation or library class in the markup ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)). The directive binds the Structural class `.dropdown-pane`, sets the size class from a typed `size` Variant input over `$dropdown-sizes` (`size="small"`), and binds every State class. It is an Openable: the Triggers (`[nfsToggle]="pane"`, `[nfsOpen]`, `[nfsClose]`, or a bare `nfsClose` inside the pane) open and close it and render its ARIA, and its `isOpen` model, `open(trigger?)`, `close()`, and `toggle()` are the programmatic API. Opening binds Foundation's `.is-open`, which is all Foundation's CSS needs to show the pane.

Everything positional and dismissive comes from the shared Anchored pane utility. The Positioner places the pane against the Trigger that opened it with Foundation's own 12 placements, offsets, and search, writes inline `top` and `left` before the pane is painted, and exposes the resolved Placement, from which the directive binds Foundation's `has-position-*` and `has-alignment-*` classes. Light dismiss closes the pane on Escape from anywhere, when focus moves outside it, when another Dropdown pane opens, and, with `closeOnClick`, on an outside press. Hover intent opens a `hover` pane after `hoverDelay` and keeps it open while the pointer is over the Trigger or the pane, which is Foundation's `hoverPane` always on.

By default the pane is a disclosure: its Triggers carry `aria-expanded` and `aria-controls`, and the pane has no role. With `role="dialog"` it is a non-modal dialog: the Triggers add `aria-haspopup="dialog"`, and `trapFocus` becomes available. `autoFocus` focuses the first tabbable element with CDK's `InteractivityChecker`; `trapFocus` uses CDK's `FocusTrap`. An optional `animate` input takes typed Motion names (`animate="fade-in fade-out"`) and plays the library's keyframe Motion classes of those names on open and close. The directive adds no library CSS rule. Its `nfs-dropdown-pane` mixin writes the Variant property that lists the size names the developer's Sass generates, and holds a compile-time warning that names the Foundation settings a pane needs to fit a 320 CSS px page. A copied Foundation class is reported in development, naming the input to bind.

## User Stories

1. As an application developer, I want to write `nfsDropdownPane` on the `div` that Foundation's docs mark `.dropdown-pane`, and `[nfsToggle]="pane"` on my button, with no Foundation class in my template, so that my Foundation Dropdown works without jQuery and the directive owns its classes.
2. As an application developer, I want the pane to open under its button, left-aligned, exactly where Foundation 6.9 puts it, so that migrating changes nothing visible.
3. As an application developer, I want `position`, `alignment`, `vOffset`, `hOffset`, `allowOverlap`, and `allowBottomOverlap` with Foundation's names and defaults, so that my existing `data-*` values carry over as attributes.
4. As an application developer, I want a pane that does not fit to move to another of Foundation's placements, so that it stays on screen.
5. As an application developer, I want `parentClass` to keep bounding the pane by an ancestor that carries one of my own classes, so that a pane inside a sidebar box flips within the box as it did in Foundation.
6. As an application developer, I want Foundation's `has-position-*` and `has-alignment-*` classes on the pane, as Foundation sets them, so that styles I migrate that key on them keep working, while new code reads `placement()`.
7. As an application developer, I want `size="small"` (and `tiny`, `large`, and every size my `$dropdown-sizes` adds) to set Foundation's size class, so that I size panes without writing Foundation's classes.
8. As an application developer, I want several buttons to open the same pane and the pane to sit against the one I used, so that Foundation's multi-anchor dropdowns keep working.
9. As an application developer, I want `pane.open()` without a button to place the pane against its first button, so that programmatic opening behaves like Foundation's.
10. As an application developer, I want `[(isOpen)]`, so that I can drive the pane from my own state and read it back.
11. As an application developer, I want an `opened` output and a `closed` output that tells me why the pane closed (Escape, outside press, focus leaving, another pane opening), so that I can react to each case.
12. As an application developer, I want a `reposition()` method, so that I can re-place the pane when its button moves without changing size.
13. As an application developer, I want application-wide defaults for the Options through a Defaults token, so that I set `closeOnClick` or `hoverDelay` once.
14. As a user, I want clicking the button of an open pane to close it, so that the button toggles.
15. As a user, I want clicking or tapping outside a pane to close it when the developer turned `closeOnClick` on, so that I can dismiss it without hunting for a close button.
16. As a user on a touch device, I want scrolling the page with a finger not to close an open pane, so that I can scroll while it is open.
17. As a user, I want opening one Dropdown pane to close the other open one, so that only one pane covers the page, as in Foundation.
18. As a user, I want a pane opened from inside another pane to keep the outer one open, so that nested panes work.
19. As a keyboard user, I want Enter and Space on the button to open and close the pane, so that I can use it without a mouse.
20. As a keyboard user, I want Escape to close the pane and return focus to its button when focus was in the pane, so that I can back out without losing my place.
21. As a keyboard user, I want Escape inside a pane that sits in a modal dialog to close only the pane, so that I do not lose the dialog.
22. As a keyboard user, I want the pane to close when I tab out of it, so that it never covers the control I move to.
23. As a keyboard user, I want the pane's content to follow its button in the tab order, so that Tab from the button reaches the pane.
24. As a keyboard user, I want `autoFocus` to put focus on the first control in the pane, so that I can type into a form right away.
25. As a keyboard user, I want a form pane that traps focus to announce itself as a dialog and to let Escape out, so that the trap is predictable and never a keyboard trap.
26. As a screen reader user, I want the button to announce expanded or collapsed and to point at the pane, so that I know what it controls.
27. As a screen reader user, I want the button never to announce a menu unless there is one, so that I am not promised arrow-key navigation that does not exist.
28. As a screen reader user, I want a dialog pane to have a name, so that I know what I entered.
29. As a mouse user, I want a hover pane to stay open while I move the pointer from the button onto the pane, so that I can use its content (WCAG 1.4.13, hoverable).
30. As a mouse user, I want Escape to close a hover pane without moving the pointer or focus, so that it stops covering content (WCAG 1.4.13, dismissible).
31. As a mouse user, I want a hover pane to stay open until I move away or dismiss it, never on a timer, so that I can read it at my pace (WCAG 1.4.13, persistent).
32. As a mouse user, I want clicking the button of a pane that hover already opened to keep it open, so that my click does not close what I just saw open.
33. As a keyboard user who also uses a mouse, I want a hover pane that holds my focus to stay open when the pointer wanders off, so that my place is not lost.
34. As a user on a laptop with a touch screen, I want hover opening with the mouse and tap-to-toggle with the finger, so that neither input breaks the other.
35. As a mouse user, I want hover opening never to move my keyboard focus, so that passing over a button does not pull focus away from where I was typing.
36. As a user at 320 CSS px width, I want every pane to fit beside its button, so that I never scroll sideways (WCAG 1.4.10).
37. As a user who prefers reduced motion, I want panes to open and close without animation, so that the page does not move more than I asked for.
38. As an application developer, I want `animate="fade-in fade-out"` to fade the pane in and out with the library's keyframe classes of those Motion names, so that I can animate it without Motion UI's JavaScript and without writing a library class name.
39. As a developer of a server-rendered application, I want the pane in the server HTML, hidden by Foundation's CSS, with the button's ARIA already correct, so that the first paint is right and `aria-controls` is valid.
40. As a developer of a server-rendered application, I want a click on the button before hydration to open and place the pane after hydration, so that early clicks are not lost.
41. As a developer of a server-rendered application, I want a pane that is open at first paint to be readable without JavaScript, so that crawlers and no-JavaScript users see it.
42. As a developer using incremental hydration, I want to know how click and hover behave inside a dehydrated `@defer` block, so that I choose the right hydrate trigger.
43. As a developer of a zoneless application, I want the pane to need no zone and to keep pointer movement from running change detection, so that it is cheap.
44. As a developer of a page with many panes, I want closed panes to hold no listeners, observers, or focus traps, so that the page stays fast.
45. As a library maintainer, I want every behaviour asserted through roles, ARIA, State classes, focus, and geometry in stories, browser-level tests, a server-render smoke test, and e2e, so that a regression shows at the layer that owns it.
46. As an application developer migrating Foundation markup, I want a copied `class="dropdown-pane large is-open"` or a legacy `.top` class reported in development, naming the input to bind, so that I learn `size`, `[isOpen]`, and `position` instead of wondering why the pane renders closed or opens below.
47. As an application developer, I want a misspelt `size` to fail to compile, and a size I add to `$dropdown-sizes` to compile once my Variant declaration file lists it, so that the pane's sizes follow my Sass.
48. As an application developer, I want a missing `@include nfs-dropdown-pane;` reported in development, so that I learn that neither the size names nor the 320 px width warning reach my build.
49. As an application developer, I want to build Foundation's split button from a Button Group, an arrow-only Trigger, and a pane placed after the group, with a development warning when I put the pane inside the group, so that the group's rules never restyle the pane's buttons.
50. As an application developer, I want to give `animate` my own keyframe classes with a leading dot (`animate=".app-pop-in .app-pop-out"`), and a misspelt Motion name or a library class name to fail to compile, so that I can animate a pane my own way and a typo never ships a pane without its animation.

## Implementation Decisions

### Foundation contract

Taken from `Dropdown.defaults` in Foundation 6.9's plugin source (14 Options: its own eight plus the six Positionable Options it re-declares) and the positioned-plugins inventory. There is no `allowGroupedOpen` Option in 6.9.

| Foundation feature | What it does in 6.9 | Library counterpart |
| --- | --- | --- |
| `position` (`'auto'`) | Side of the anchor; `auto` reads the legacy `.top/.left/.right/.bottom` classes on the pane, else `bottom` | `position` input, same values; `auto` resolves to `bottom`; legacy classes not read, and a copied one is reported (dev check 7), so the docs' `class="dropdown-pane top"` becomes `position="top"` |
| `alignment` (`'auto'`) | Edge that lines up; `auto` reads `.float-*` on the anchor, else `left` (`right` in RTL) for top/bottom and `bottom` for left/right | `alignment` input, same values; `auto` through the Positioner's RTL-aware rule; `.float-*` not read |
| `vOffset`, `hOffset` (`0`) | Pixel distance from the anchor | Same inputs, same formulas (Positioner) |
| `allowOverlap` (`false`) | Skip the collision search | Same (Positioner) |
| `allowBottomOverlap` (`true`) | Ignore overflow past the bottom bound | Same (Positioner) |
| `parentClass` (`null`) | Bound collisions by the nearest ancestor with that class instead of the body box | Same input, resolved to the Positioner's `boundary` element |
| `hover` (`false`) | Open on `mouseenter` of an anchor after `hoverDelay`, gated by `what-input` | Same input, through hover intent; touch pointers filtered per event |
| `hoverDelay` (`250`) | Delay before opening on enter and before closing on leave | Same input, both delays (the close delay has hover intent's 100 ms floor) |
| `hoverPane` (`false`) | Keep the pane open while the pointer is over it | Dropped option: the pane is always part of the Hover region (WCAG 1.4.13) |
| `closeOnClick` (`false`) | Body `click`/`tap` outside anchors and pane closes it | Same input, mapped to Light dismiss's pointer rule (down and up both outside) |
| `autoFocus` (`false`) | Focus the first focusable element on every open, sorted by `tabindex` | Same input: first tabbable element in DOM order through `InteractivityChecker`; not on hover opens |
| `trapFocus` (`false`) | Wrap Tab inside the pane on every open | Same input, CDK `FocusTrap`; requires `role="dialog"`; moves focus in; not on hover opens |
| `forceFollow` (`true`) | Let an anchor link's default action run; with `hover` on a touch device prevent the first click | Dropped option: Triggers never call `preventDefault()`, and hover never opens from touch |
| `open()`, `close()`, `toggle()` | Methods; `toggle()` does nothing while the pane is hover-opened | Same methods, same `toggle()` rule; plus `reposition()` and `registerTrigger()` |
| `destroy()` | Unbinds and hides with inline `display: none` | Angular lifecycle; nothing to hide |
| `show.zf.dropdown` | Fired at the end of `open()` | `opened` Completion output, after the enter animation if any |
| `hide.zf.dropdown` | Fired in `close()` | `closed` Completion output with the close reason, after the leave animation if any |
| `closeme.zf.dropdown` | Window-level broadcast that closes every other Dropdown, parents included | Light dismiss sibling group `'nfs-dropdown-pane'`; ancestors stay open |
| `resizeme.zf.trigger` | Debounced window resize re-runs positioning | Positioner's `ResizeObserver` on pane, anchor, and bound while open |
| `init.zf.dropdown`, `destroyed.zf.dropdown` | Lifecycle events | None (Angular lifecycle) |
| Keyboard: Enter and Space registered as `toggle` | Dead: the handler defines no `toggle`, so only the button's native `click` works | Native button activation through the Triggers |
| Keyboard: Escape on anchors and pane | Closes and focuses the anchors | Light dismiss Escape, document-level, topmost pane; focus returns to the opening Trigger when focus was inside |
| ARIA on anchors | `aria-haspopup="true"`, `aria-expanded`, `aria-controls`, `data-is-focus`, `data-yeti-box` | Triggers render `aria-expanded` and `aria-controls`, plus `aria-haspopup="dialog"` only for `role="dialog"` |
| ARIA on the pane | `aria-hidden` toggled; `aria-labelledby` set to the anchor id (generated if missing) | No `aria-hidden` (Foundation's `display: none` hides it); a `role="dialog"` pane is named by the consumer |
| `.is-opening` | Displays the pane invisibly for measuring | Not used: the Positioner measures after `.is-open` and before paint |
| `.is-open` | Shows the pane | Same State class, bound from state; a copied static one is stripped and reported (dev check 7) |
| `has-position-*`, `has-alignment-*` | Swapped on every positioning; no Foundation Sass reads them | Bound from the Positioner's Placement |
| `.dropdown-pane` | The Structural class the consumer writes with `data-dropdown` | Bound by the directive as a static host class; the consumer writes none |
| `.tiny`, `.small`, `.large` (the keys of `$dropdown-sizes`) | Variant classes the consumer writes; each sets the pane's `width` | `size` Variant input, typed over `$dropdown-sizes` and its Variant registry (D26) |
| `.hover` on anchors | Added while open; no Foundation Sass reads it | Dropped: no Openable writes a class on its Triggers, whose element always carries a library directive, so a `Renderer2` State class there is never the answer ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md), D18) |

Dropped options: `hoverPane` (always on), `forceFollow`, `data-options`. Dropped behaviours: consumer-written classes (`.dropdown-pane`, the size classes, the legacy position classes, ADR 0039), reading legacy position and float classes, `aria-haspopup="true"`, `aria-hidden` on the pane, the generated anchor id and automatic `aria-labelledby`, `.is-opening`, `.hover` on anchors, `data-yeti-box`, `data-resize`, `data-is-focus`, `what-input`, `ignoreMousedisappear`, the `tap` event, the shared `click.zf.dropdown` namespace, and the kept tried-positions set.

### CSS class to Angular mapping

Structural and State classes, and the markup Foundation keys on:

| Foundation class or markup | Angular | Rationale |
| --- | --- | --- |
| `.dropdown-pane[data-dropdown]` | `NfsDropdownPane`, selector `[nfsDropdownPane]`, `exportAs: 'nfsDropdownPane'`; the Structural class `.dropdown-pane` is a static host class, and the consumer writes `<div nfsDropdownPane>` with no class | Attribute directive on the consumer's element (ADR 0001, ADR 0039); named after the Structural class, because `.dropdown` alone is Button's Variant class and `.dropdown.menu` is DropdownMenu (building-blocks 1.3); a redundant `class="dropdown-pane"` merges with the static host class and is not reported |
| `.is-open` | State class: `[class.is-open]`, true while open and while the leave animation plays; a copied static one is stripped (the binding wins) and reported in development (dev check 7) | Initial state is bound, never read from a class (building-blocks 1.4): open at first paint is `[isOpen]="true"` |
| `has-position-{position}`, `has-alignment-{alignment}` | State classes in the host's `[class]` list, from the Placement, kept after close; a copied static one is reported (dev check 7) | Foundation's placement classes; no Foundation Sass reads them; `placement()` is the class-free read |
| Legacy `.top`, `.left`, `.right`, `.bottom` on the pane | Neither read nor bound; a copied one is reported, naming `position` (dev check 7) | Foundation 6.9 read them for `position: auto` and styles none; the `position` input replaces them (D5) |
| `.float-left`, `.float-right` on the Trigger | Not read | They are the Float Classes' utility classes on the Trigger's host, not the pane's; `alignment` replaces them (D5) |
| `[data-toggle="id"]`, `[data-open="id"]`, `[data-close]` on buttons | The Triggers `[nfsToggle]`, `[nfsOpen]`, `[nfsClose]` with a template reference, or bare inside the pane | Triggers spec (ADR 0013) |
| Motion class from `animate` | A class in the host's `[class]` list during the enter or leave phase only: the library's keyframe class of each typed Motion name (`fade-in` binds `nfs-fade-in`), or the consumer's own class written with a leading dot | ADR 0003 rule 1; the consumer writes Motion names, never a library class name (ADR 0039, class names passed as input values) |

Variant classes, one row per family (building-blocks 1.14 item 2):

| Variant classes | Input | Type alias | Sass setting and Variant registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- | --- |
| `.tiny`, `.small`, `.large`, and every other key of `$dropdown-sizes` | `size` | `NfsDropdownPaneSize` | `$dropdown-sizes`; `NfsDropdownSizesOverrides` (Open Variant family) | Name | The name's class (`size="large"` sets `.large`); no value sets none, so `$dropdown-width` is the look | `--nfs-dropdown-sizes` (`tiny small large` by default), written by `nfs-dropdown-pane` alone |

`$dropdown-sizes` has no `default` key, so the type has no `'default'` value. Foundation generates no responsive pane size, so `size` takes no Breakpoint query or rules object. No class is left for the consumer to write (ADR 0039).

### Hierarchy and DI shape

```
nfsOpenableToken (Triggers entry point)       <- provided by NfsDropdownPane with useExisting
nfsDropdownPaneDefaultsToken (optional)        -> seeds the Option defaults

[nfsDropdownPane] (binds .dropdown-pane)      triggerRole 'disclosure' or 'dialog' from the role input
  calls nfsPositioner(), nfsLightDismiss(), nfsHoverIntent()     (Anchored pane utility)
  calls nfsVariantCheck('nfsDropdownPane')                        (Runtime checks, ngx-foundation-sites/media-query)
  injects ElementRef, DOCUMENT, Injector, NgZone, _IdGenerator, NfsMediaQuery,
          nfsAnimationsToken (optional), nfsDropdownPaneDefaultsToken (optional),
          HostAttributeToken('autoFocus') and HostAttributeToken('class') (optional, development builds only)
  uses nfsMotionClasses and the Motion name types (primary entry point ngx-foundation-sites)
  resolves InteractivityChecker and FocusTrapFactory from the Injector on first need (client only)

Triggers: [nfsToggle]="pane" | [nfsOpen]="pane" | [nfsClose]="pane" | bare nfsClose / nfsToggle inside the pane
  register themselves through registerTrigger(); pass themselves to open(trigger) and toggle(trigger)
```

- One directive, no component: the pane is consumer markup that Foundation's CSS styles and hides once the directive binds `.dropdown-pane`, and Foundation generates nothing inside it. The size class belongs to the same directive, because it is a Variant of the one Structural class (ADR 0039).
- It provides only `nfsOpenableToken`, so a bare `nfsClose` inside the pane closes it, and a bare `nfsClose` inside a pane inside a Reveal closes the pane, not the Reveal (the Nearest Openable). No `nfsDropdownPaneToken`: no child directive needs the pane (the building-blocks sketch named one, and Table B now records none; nothing injects it, as the Toggler spec found for its own).
- `nfsDropdownPaneDefaultsToken`: `InjectionToken<NfsDropdownPaneDefaults>` (Shape B, all-optional), injected with `{optional: true}` to seed input defaults (building-blocks 1.4). The Positioner, Light dismiss, and hover intent have no tokens of their own; the pane passes its inputs in.
- `NfsMediaQuery` (Breakpoint service) supplies `reducedMotion`; `nfsAnimationsToken` disables animation for tests (building-blocks 1.6 rule 5).
- `InteractivityChecker` and `FocusTrapFactory` are resolved with `Injector.get` inside the render callback of the first open that needs them, so a pane without `autoFocus` or `trapFocus` never constructs them, and the server never does. This matters for `FocusTrapFactory`, whose constructor loads CDK's visually-hidden style into the document.
- Entry point `ngx-foundation-sites/dropdown-pane`: the directive, the defaults token and its interface, and the types, `NfsDropdownPaneSize` among them. It imports the Triggers token, the Anchored pane utility, and the Runtime-check API of `ngx-foundation-sites/media-query`, which it already imports for `NfsMediaQuery`; a consumer imports the Triggers directives from their own entry point. The Variant registry `NfsDropdownSizesOverrides`, the Variant helper types, and the Motion name types and `nfsMotionClasses` come from the primary entry point `ngx-foundation-sites`, as types or one small function, so per-plugin `@defer` splitting is untouched ([ADR 0040](../adr/0040-variant-input-types.md)). The name follows the class name for the same reason as the class.
- Composition with a Button Group (a split button): the arrow-only `nfsButton` inside `nfsButtonGroup` is the Trigger, and the pane is written after the group, never inside it, because Foundation's `$buttongroup-child-selector` rules would give every `nfsButton` host inside the pane the group's size, colour, and margins ([Spec: Button Group](../issues/82-spec-button-group.md)). A pane inside a group warns in development (dev check 8). The pane injects nothing from the group.

### API

```ts
// ngx-foundation-sites (primary entry point): the Variant registry, augmented by the consumer's Variant declaration file
interface NfsDropdownSizesOverrides {}

// ngx-foundation-sites (primary entry point): the shared Motion types of building-blocks 1.6 rule 4, as the Reveal spec
// defines them (NfsMotionInName, NfsMotionOutName, NfsMotionClassList = `.${string}`, NfsMotionIn, NfsMotionOut,
// nfsMotionClasses), and the one-string pair over them, shared with the Toggler's animate:
type NfsMotionPair =
  | NfsMotionIn                                                                   // one entering value, or ''
  | NfsMotionOutName                                                              // one leaving name alone
  | `${NfsMotionInName | NfsMotionClassList} ${NfsMotionOutName | NfsMotionClassList}`; // '<in> <out>'

// ngx-foundation-sites/dropdown-pane
type NfsDropdownPaneSize = NfsOverridableStringUnion<'tiny' | 'small' | 'large', NfsDropdownSizesOverrides>;
type NfsDropdownPaneRole = 'dialog' | null;
type NfsDropdownPaneCloseReason = NfsDismissReason | undefined; // 'click' | 'keydown' | 'tab' | 'sibling', or undefined

interface NfsDropdownPaneDefaults {
  position?: NfsPosition | 'auto';
  alignment?: NfsAlignment | 'auto';
  vOffset?: number;
  hOffset?: number;
  allowOverlap?: boolean;
  allowBottomOverlap?: boolean;
  hover?: boolean;
  hoverDelay?: number;
  closeOnClick?: boolean;
  autoFocus?: boolean;
  trapFocus?: boolean;
  animate?: NfsMotionPair;
}
const nfsDropdownPaneDefaultsToken: InjectionToken<NfsDropdownPaneDefaults>;

class NfsDropdownPane implements NfsOpenable { // [nfsDropdownPane], exportAs 'nfsDropdownPane'
  readonly isOpen: ModelSignal<boolean>;                   // false
  readonly id: InputSignal<string>;                        // generated 'nfs-dropdown-pane-...'
  readonly role: InputSignal<NfsDropdownPaneRole>;         // null
  readonly size: InputSignal<NfsDropdownPaneSize | undefined>; // undefined: no size class
  readonly position: InputSignal<NfsPosition | 'auto'>;    // 'auto'
  readonly alignment: InputSignal<NfsAlignment | 'auto'>;  // 'auto'
  readonly vOffset: InputSignalWithTransform<number, unknown>;      // 0
  readonly hOffset: InputSignalWithTransform<number, unknown>;      // 0
  readonly allowOverlap: InputSignalWithTransform<boolean, unknown>;       // false
  readonly allowBottomOverlap: InputSignalWithTransform<boolean, unknown>; // true
  readonly parentClass: InputSignal<string | null>;        // null
  readonly hover: InputSignalWithTransform<boolean, unknown>;       // false
  readonly hoverDelay: InputSignalWithTransform<number, unknown>;   // 250
  readonly closeOnClick: InputSignalWithTransform<boolean, unknown>; // false
  readonly autoFocus: InputSignalWithTransform<boolean, unknown>;   // false
  readonly trapFocus: InputSignalWithTransform<boolean, unknown>;   // false
  readonly animate: InputSignal<NfsMotionPair>;            // Defaults token, else '' (no animation)
  readonly triggerRole: Signal<'disclosure' | 'dialog'>;
  readonly placement: Signal<NfsPlacement | null>;         // from the Positioner
  readonly opened: OutputRef<void>;
  readonly closed: OutputRef<NfsDropdownPaneCloseReason>;
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;                           // result ignored
  toggle(trigger?: HTMLElement): void;
  registerTrigger(trigger: HTMLElement): () => void;
  reposition(): void;
}
```

`NfsPosition`, `NfsAlignment`, `NfsPlacement`, and `NfsDismissReason` are the Anchored pane utility's types. `NfsOverridableStringUnion` is the Variant helper type of the primary entry point ([ADR 0040](../adr/0040-variant-input-types.md)); `size` is declared `input<NfsDropdownPaneSize | undefined>(undefined)`, with an explicit type argument that names the exported alias, as building-blocks 1.4 requires of every Variant input. The Motion types and `nfsMotionClasses` are the primary entry point's, shared by every Motion input, with the names the [Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md) gave them (building-blocks 1.6 rule 4). A Motion name binds the library's `nfs-<name>` keyframe class, and the consumer's own keyframe class is written with a leading dot, as Foundation writes a class in an attribute. `NfsMotionPair` types Foundation's one-string `"<in> <out>"` pair over the same aliases, as 1.6 rule 4 asks of such an input: whitespace separates the two halves, so each half is one token, the first entering and the second leaving; a leaving name alone animates only the close. It lives beside the other Motion types because the Toggler's `animate` takes the same pair; the [Re-run: Toggler spec under the class rule](../issues/109-rerun-toggler-class-rule.md) confirms or renames it. Every Option default below is Foundation's unless the Delta column says otherwise, and each one (except `id`, `role`, and `parentClass`) can be changed application-wide through the Defaults token. The Variant input `size` is not an Option and has no application-wide default (building-blocks 1.4).

| Member | Kind | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `isOpen` | `model()` | `boolean` | `false` | `.is-open` state, `open()`/`close()` | `true` from the open request until the close request, not waiting for animations (Openable contract); `model()` has no transform, so write `[isOpen]="true"`, not `isOpen="true"` |
| `id` | `input()` | `string` | `_IdGenerator` id, prefix `nfs-dropdown-pane-` | The required pane `id` | Optional; bound as `[attr.id]`; the id the Triggers' `aria-controls` names |
| `role` | `input()` | `'dialog' \| null` | `null` | None | New. `null`: disclosure, no role on the pane. `'dialog'`: `role="dialog"` on the pane and `triggerRole` `'dialog'` |
| `size` | `input()`, explicit type argument, no transform | `NfsDropdownPaneSize`: `'tiny' \| 'small' \| 'large'` plus the names the consumer's Variant declaration file adds, minus the ones it removes | `undefined`: no class, so `$dropdown-width` is the look | The `.tiny`, `.small`, `.large` classes (no `data-*` Option) | New as an input: a Variant input (D26). A misspelt or removed name fails to compile, as does a class name that is not a size (`'dropdown-pane'`, `'is-open'`); its JSDoc names the class template `.dropdown-pane.<name>` and `$dropdown-sizes`. Not in the Defaults token |
| `position` | `input()` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'auto'` | `'auto'` (resolves to `bottom`) | `data-position` | Legacy `.top/.left/.right/.bottom` classes on the pane are not read |
| `alignment` | `input()` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'center' \| 'auto'` | `'auto'` | `data-alignment` | `.float-left`/`.float-right` on the Trigger are not read; RTL from CDK `Directionality` |
| `vOffset`, `hOffset` | `input()`, `numberAttribute` | `number` (px) | `0` | `data-v-offset`, `data-h-offset` | None; a negative value warns in dev mode (Positioner) |
| `allowOverlap` | `input()`, `booleanAttribute` | `boolean` | `false` | `data-allow-overlap` | None |
| `allowBottomOverlap` | `input()`, `booleanAttribute` | `boolean` | `true` | `data-allow-bottom-overlap` | None |
| `parentClass` | `input()` | `string \| null` | `null` | `data-parent-class` | The nearest ancestor (not the pane itself) with that class is the Collision bound. It names one of the consumer's own classes, never a Foundation or library class (ADR 0039, class names passed as input values; D6) |
| `hover` | `input()`, `booleanAttribute` | `boolean` | `false` | `data-hover` | Mouse and pen only, decided per event; the pane is always in the Hover region |
| `hoverDelay` | `input()`, `numberAttribute` | `number` (ms) | `250` | `data-hover-delay` | Close delay floored at 100 ms by hover intent |
| `closeOnClick` | `input()`, `booleanAttribute` | `boolean` | `false` | `data-close-on-click` | Pointer rule of Light dismiss (both `pointerdown` and `pointerup` outside); Escape, focus leaving, and siblings close regardless |
| `autoFocus` | `input()`, `booleanAttribute` | `boolean` | `false` | `data-auto-focus` | First tabbable element in DOM order (`InteractivityChecker.isFocusable` and `isTabbable`), not Foundation's `tabindex` sort; not on hover opens or the first-paint state; set by binding (`[autoFocus]="true"`) or the Defaults token, never as a static attribute, which would render HTML's global `autofocus` (dev check 6); kind `insertion` (building-blocks 1.4): the host also binds `'[attr.autofocus]': 'null'`, so a static attribute never reaches the server HTML |
| `trapFocus` | `input()`, `booleanAttribute` | `boolean` | `false` | `data-trap-focus` | CDK `FocusTrap` while open; valid only with `role="dialog"` (dev warning otherwise); moves focus in as `autoFocus` does; not on hover opens or the first-paint state |
| `animate` | `input()`, explicit type argument `NfsMotionPair` | An entering Motion name (`NfsMotionInName`) or the consumer's own keyframe class with a leading dot, optionally followed by a leaving name (`NfsMotionOutName`) or dot-form class; a leaving name alone; or `''` | Defaults token, else `''` | None (Foundation has no Dropdown animation) | New, in the form of Foundation's Toggler `data-animate="<in> <out>"`, the Toggler's `animate` sharing it. A Motion name binds the library's keyframe class of that name (`fade-in` binds `nfs-fade-in`); a dot-form token binds the consumer's class without its dot (`".app-pop-in .app-pop-out"`); a missing half means no animation for that direction; `''` animates nothing and overrides the Defaults token. A misspelt name, a leaving name in the entering place, Motion UI's `fast`/`slow` modifiers, and a library class name (`'nfs-fade-in'`) fail to compile (ADR 0039); dev check 5 |
| `triggerRole` | read-only signal | `'disclosure' \| 'dialog'` | `computed` from `role` | None | Openable contract |
| `placement` | read-only signal | `NfsPlacement \| null` | `null` until the first placement | `has-position-*` classes | The Positioner's resolved Placement, kept after close |
| `isOpenChange` | output (from the model) | `boolean` | | None | Emitted at request time |
| `opened` | `output()` | `void` | | `show.zf.dropdown` | Completion output: after the pane is shown and its enter animation, if any, has ended |
| `closed` | `output()` | `'click' \| 'keydown' \| 'tab' \| 'sibling' \| undefined` | | `hide.zf.dropdown` | Completion output with the close reason (Material's `closed` shape plus `'sibling'`); `undefined` for Triggers, methods, the model, and hover leave |
| `open(trigger?)` | method | | | `open()` | Records `trigger` as the anchor and the focus-return target; without it the anchor is the first registered Trigger and the focus-return target is the element focused when `open()` ran |
| `close(result?)` | method | | | `close()` | `result` is ignored (the pane has nothing to hand it to, like the Toggler) |
| `toggle(trigger?)` | method | | | `toggle()` | `isOpen() ? close() : open(trigger)`, except that a pane hover intent opened stays open (Foundation's rule) |
| `registerTrigger(trigger)` | method | | | Anchors found by `data-toggle`/`data-open` query | Called by the Triggers; returns the unregister function |
| `reposition()` | method | | | `_setPosition()` (private in Foundation) | The Positioner's `reposition()`: full search now, if open |

Behaviour rules:

- Classes. `.dropdown-pane` is a static host class. `.is-open` is `[class.is-open]`. One `computed` class list, bound with `[class]`, holds the size class, the two Placement classes, and the Motion classes of the current phase, at most one class per `size` value and nothing for a value that is not one class token, so the server and the client render the same list. A `[class]` list sets only its own classes, so a copied static size or Placement class stays until the consumer removes it (dev check 7 reports it).
- Open state. `open(trigger)` sets the anchor signal to `trigger` (or `null`), records the focus-return target (`trigger`, else `document.activeElement` at call time), and sets `isOpen` to `true`. The Positioner's anchor is the recorded Trigger, else the first registered Trigger. Every path that sets `isOpen` (method, Trigger, model binding, `isOpen.set`) drives the same `.is-open`, placement, Light dismiss registration, animation, and Completion outputs.
- Close paths and reasons. Light dismiss calls a private close with its reason (`'click'`, `'keydown'`, `'tab'`, `'sibling'`); `close()`, `toggle()`, Triggers, hover leave, and the model close with `undefined`. The reason is emitted by `closed` once the close completes.
- Hover. `nfsHoverIntent` receives the registered Triggers, the pane, `enabled` from `hover`, `isOpen` (its timers clear when the pane opens or closes by another path, as the Anchored pane spec requires), `openDelay` and `closeDelay` both equal to `hoverDelay`, an `open` callback that marks the open as hover-opened and calls `open(trigger)`, and a `close` callback that closes unless focus is inside the pane. So a pane that holds keyboard focus is not closed by the pointer leaving (WCAG 1.4.13 persistent); focus leaving or Escape still close it. The hover-opened mark clears on every close.
- Toggle while hover-opened. `toggle()` on a hover-opened pane leaves it open, which is Foundation's `data('hover')` rule: the user who hovers, sees the pane open, and clicks does not close it. `close()` and `nfsClose` still close it. Touch never hover-opens, so taps always toggle.
- Focus on open. After the pass that shows the pane, when the open was not hover-opened and is not the first-paint state: with `trapFocus`, the directive creates a `FocusTrap` on the pane (deferred anchors), attaches its anchors, and focuses the first tabbable element; with only `autoFocus`, it focuses the first tabbable element (`InteractivityChecker.isFocusable` and `isTabbable`, in DOM order, the rule CDK's own `focusFirstTabbableElement()` uses). No tabbable element: focus is not moved. Focus moves in after the Positioner's write, so the pane is placed before it scrolls into view.
- Focus trap lifetime. The trap exists only while open and is destroyed, anchors removed, in the pass that closes the pane. Its two anchors are elements CDK inserts beside the pane; a `focusin` on an anchor is immediately redirected into the pane, and the Light dismiss focus rule does not treat that redirected `focusin` as focus leaving (the Anchored pane spec's focus rule ignores a `focusin` whose target is no longer `document.activeElement`).
- Focus on close. When a close is requested while focus is inside the pane, with reason `'keydown'` or `undefined` from a method, a Trigger, or hover leave, the directive records that before changing state and, in the render callback of that close, focuses the recorded focus-return target if it is still connected and `InteractivityChecker.isFocusable` holds. It does so without waiting for a leave animation, because focus must not stay in content that is going away (WCAG 2.4.3); the Trigger is visible throughout. `'click'`, `'tab'`, and `'sibling'` move no focus: the user already put it somewhere (Anchored pane spec, focus return rule). A close through the model (`[isOpen]="false"` or `isOpen.set(false)`) moves no focus, as in the Toggler spec; a consumer closing from a submit handler inside the pane calls `close()` to get focus return.
- Light dismiss. `nfsLightDismiss` receives `isOpen`, the host, the registered Triggers, group `'nfs-dropdown-pane'`, `outsidePress` from `closeOnClick`, and the private close. Presses on registered Triggers count as inside, so a Trigger click toggles once.
- Positioner. `nfsPositioner` receives `open: isOpen`, the anchor, `position`, `alignment`, `vOffset`, `hOffset`, `allowOverlap`, `allowBottomOverlap`, and `boundary` from `parentClass` (the host's parent element's `closest('.' + parentClass)`, read inside the Positioner's measuring phase), with `autoPosition` `bottom`, no `autoAlignment` (the RTL-aware base rule), no `pip`, and `followScroll` at its default, on. The directive binds `has-position-{position} has-alignment-{alignment}` from `placement()`. `parentClass` names one of the consumer's own classes: to bound a pane by an element whose classes a library directive binds (a Card), the consumer adds an application class to that element and names it.
- Motion names. `animate` is split at whitespace into its entering and leaving halves (a leaving name alone is the leaving half), and each half goes through the shared `nfsMotionClasses`, which maps a Motion name to the library's keyframe class of that name (`fade-in` to `nfs-fade-in`), a dot-form token to the consumer's class without its dot, and anything else to no class. The phases below bind the result.
- Variant check. `nfsVariantCheck('nfsDropdownPane')` is called once at construction. When it returns a handle (development builds, or production with `provideNfsProductionRuntimeChecks`), the directive creates one more `afterRenderEffect` whose `read` phase calls `include('nfs-dropdown-pane', ['dropdown-sizes'])` on every run, whether or not `size` is bound, then `value('size', size(), needs)` when `size` has a value, with `needs` `[{setting: 'dropdown-sizes', name: size()}]` from the same mapping that sets the class, or `null` for a value that is not one class token. So `strictVariantNames` reports a size the compiled CSS lacks, naming `$dropdown-sizes` and the listed names, and `strictVariantProperties` reports a missing `@include nfs-dropdown-pane;` when `--nfs-dropdown-sizes` reads empty (D28). A consumer who empties `$dropdown-sizes` gets that report too and switches the check off. No Runtime check runs on the server.
- Dev-mode checks, in one `afterNextRender` that exists only when `ngDevMode` is on, each warning once per instance, except check 5, which runs where the phase's animation is measured: (1) `role="dialog"` without `aria-labelledby` or `aria-label` on the pane: "name the dialog pane"; (2) `trapFocus` without `role="dialog"`: "a trapped pane is a non-modal dialog; set `role="dialog"` and name it"; (3) the pane precedes its first registered Trigger in document order, or no Trigger is registered while `hover` is on (a hover pane must also open by click and keyboard); (4) `parentClass` names no ancestor; (5) in the `earlyRead` phase that measures a phase's animation, the Reveal's check 3 applied to `animate`: a non-empty half whose classes start no CSS animation when its phase begins (a consumer class without `@keyframes`, a Motion UI transition class given in the dot form, or a Motion name without the `nfs-motion` include): "animate="fade-in fade-out" started no animation: include nfs-motion, or give your own class @keyframes", the phase completing at once as before; a dot-form class that starts with `nfs-`: "write the library's Motion name without its prefix: animate="fade-in""; and more than two tokens, which only dot-form classes can reach past the type: "animate takes one entering and one leaving value"; (6) a static `autoFocus` attribute on the host (read with `HostAttributeToken`): HTML attribute names are case-insensitive, so it also renders HTML's global `autofocus` attribute, which the host binding keeps out of the server HTML but which, in client rendering, the browser acts on when the pane is inserted, focusing the pane itself once it is focusable (a consumer's `tabindex`); bind `[autoFocus]="true"` or set it through the Defaults token instead; (7) a Foundation class copied onto the host, read from its static `class` through `HostAttributeToken('class')` in a field initialiser that exists only in development builds, because a stripped class no longer shows after render: `is-open` ("renders closed: bind `[isOpen]="true"`"), Foundation's default size names `tiny`, `small`, `large` ("bind `size="large"`"), the legacy `top`, `bottom`, `left`, `right` ("does not place the pane: bind `position="top"`"), any `has-position-*` or `has-alignment-*` ("set by nfsDropdownPane from its placement"), and `is-opening` (Foundation's measuring class, which lays out a closed pane invisibly and which the pane never binds), whole tokens only; a redundant `dropdown-pane` and the consumer's own classes are not reported, and consumer-declared size names are left to the Variant check; (8) the pane's parent element is inside a Button Group (`closest('.button-group')`): "place the pane after the Button Group; the group's rules restyle the buttons inside it". The Positioner's own checks (same-axis alignment, negative offsets, a pane that is not `position: absolute`) also apply.

### Implementation level and primitives

Implementation level: custom Angular on the Anchored pane utility, with platform measurement (ADR 0002). Native first: `popover="auto"` would give light dismiss, the top layer, and nesting, and CSS anchor positioning would place the pane, but `popover` is Baseline 2024 with Firefox 125 and full iOS support at 18.3, and anchor positioning is Baseline 2026, both outside the browser target (Baseline widely available on 2026-05-07). `<details>` cannot be the base: the Trigger may sit anywhere, several Triggers may open one pane, and the pane floats over the page. A non-modal `<dialog>` with `show()` was weighed for `role="dialog"` panes and not taken: its user-agent styles (`inset-inline: 0; margin: auto; width: fit-content`) fight `.dropdown-pane`'s placement and width, and `show()` adds nothing Light dismiss lacks. `@angular/aria` 22.2 has no disclosure or dialog pattern, and its menu pattern is the wrong role for a pane of arbitrary content. `@angular/cdk` supplies `InteractivityChecker`, `FocusTrapFactory`, `_IdGenerator`, and, through the utility, `Directionality`; CDK Overlay is not used (ADR 0002 and the anchored pane prototype: viewport bound, no `allowBottomOverlap`, pane not in server HTML).

Primitives: `model()`, `input()` with `booleanAttribute`/`numberAttribute`, `output()`, `computed()`, one `linkedSignal` for the animation phase, `afterRenderEffect` and `afterNextRender` (below), host metadata for the static `.dropdown-pane` class, the `[class]` list, `[class.is-open]`, `[attr.id]`, `[attr.role]`, and the `animationend`/`animationcancel` listeners, `HostAttributeToken` for the development checks, `nfsVariantCheck` and `nfsMotionClasses`, `Injector.get` for the lazily resolved CDK services, `NgZone.runOutsideAngular` for the fallback timer, `Node.contains` and `document.activeElement` for the focus-inside checks, and the utility's `nfsPositioner`, `nfsLightDismiss`, `nfsHoverIntent`.

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Placement | `afterRenderEffect`, `earlyRead` then `write` (inside `nfsPositioner`) | Measures once per run and writes before paint; re-runs only when tracked signals change, so a closed pane costs nothing |
| Light dismiss registration | `afterRenderEffect` (inside `nfsLightDismiss`) | Adds the entry in the render pass that shows the pane, removes it on close; never on the server |
| Hover listeners | `afterRenderEffect` (inside `nfsHoverIntent`) | Follows the Trigger list; listeners added in code, outside the zone |
| Animation completion | the pane's `afterRenderEffect`, `earlyRead` | Reads the host's computed `animation-*` once the Motion class is bound, to size the fallback timer |
| Focus on open and close | the same `afterRenderEffect`, `mixedReadWrite` | Finding the first tabbable element reads layout and `focus()` writes, in one step, after the Positioner's `write` has placed the pane |
| Completion outputs | the same `afterRenderEffect`, `read` | Emitted once the phase is idle, so handlers see the final DOM |
| Variant check | a second `afterRenderEffect`, `read`, created only when `nfsVariantCheck` returns a handle | Reads `size` and the Variant property after the class is rendered; re-runs only when `size` changes, and never exists in a production build without the opt-in |
| Dev-mode checks | `afterNextRender`, only under `ngDevMode`; check 7's static-class read in a field initialiser under the same guard; check 5 in the animation completion's `earlyRead` | One-shot validation of markup and inputs; the static class must be read at construction, before a binding strips it |

`effect` is not used: the pane has no non-DOM side effect (the Triggers' registration `effect` is theirs). `afterEveryRender` is not used: it would re-run focus and animation checks after every change detection in the application. `injectAsync` is not used. The Anchored pane spec decided eager loading for the utility; this spec adds nothing lazy. The only code needed only after an interaction is `FocusTrapFactory` and `InteractivityChecker`: both live in `@angular/cdk/a11y`, which the pane already imports for `_IdGenerator`, so a separate chunk saves little, while the trap must attach in the same render pass that shows the pane (an awaited load would let a Tab escape the pane in the first frames and close it through the focus rule). Resolving them synchronously from the `Injector` on first need keeps them unconstructed on the server and for panes that never use them.

Fallback: none needed. Every mechanism is a platform feature in target, a CDK service, or the Anchored pane utility, which its prototype confirmed against Foundation 6.9.

### Comparison with Angular Material

Material's counterpart is `MatMenu` with `MatMenuTrigger`; a menu is the wrong pattern for Foundation's pane, so only the non-menu parts are compared.

| Concern | Material menu | Dropdown pane |
| --- | --- | --- |
| Panel element | `mat-menu` renders an `<ng-template>`; the panel is portalled into an overlay | The consumer's pane element, `.dropdown-pane` bound by the directive, in place, in server HTML |
| Panel look | The `class` input (property `panelClass`; `classList` is deprecated) copied onto the overlay panel | Foundation's classes from the directive (`size` for the width); the consumer's own classes go on the pane element as usual |
| Link from trigger | `[matMenuTriggerFor]="menu"` with `#menu="matMenu"` | `[nfsToggle]="pane"` with `#pane="nfsDropdownPane"` (Triggers) |
| Placement | `xPosition` (`before`/`after`), `yPosition` (`above`/`below`), `overlapTrigger` | Foundation's `position`/`alignment` (physical) with offsets; no overlap Option (a pane over its Trigger would fail 2.4.11) |
| Outside click | `hasBackdrop` (transparent backdrop, `null` = default) | `closeOnClick`, the Light dismiss pointer rule, no backdrop element |
| Close reason | `closed: MenuCloseReason` (`void \| 'click' \| 'keydown' \| 'tab'`) | `closed` with the same words plus `'sibling'` |
| Open and close events | `menuOpened`/`menuClosed` on the trigger, `closed` on the panel | `opened`/`closed` on the pane only; the model's `isOpenChange` |
| Focus on open | First item focused (`focusFirstItem`) | `autoFocus`, first tabbable element |
| Focus return | `matMenuTriggerRestoreFocus` (true) on the trigger | Fixed rule by reason and focus position; no input |
| Manual re-placement | `updatePosition()` on the trigger | `reposition()` on the pane |
| ARIA | `aria-haspopup="menu"`, `aria-controls` only while open, `role="menu"` | `aria-expanded` and `aria-controls` always (the pane exists), `aria-haspopup="dialog"` only for dialogs, no role by default |
| Lazy content | `ng-template[matMenuContent]` | None; content is projected in place (Out of Scope gives the `@defer` recipe) |
| Defaults | `MAT_MENU_DEFAULT_OPTIONS` | `nfsDropdownPaneDefaultsToken` |

Borrowed: the reason-carrying `closed`, the template-reference link through an interface, `updatePosition()` as `reposition()`, a defaults token. Not borrowed: the overlay, the backdrop, `overlapTrigger`, `restoreFocus` as an input, `aria-controls` only while open, the menu role and keys.

### ARIA and keyboard

APG patterns: Disclosure by default; a non-modal dialog when `role="dialog"` (the dialog pattern's non-modal reading and the tooltip pattern's note that hover content with focusable elements is a non-modal dialog). Never the Menu Button pattern, and never `aria-haspopup="true"`, which WAI-ARIA treats as `menu`.

| Element | Disclosure (`role` null, default) | Non-modal dialog (`role="dialog"`) |
| --- | --- | --- |
| Trigger (`nfsToggle`, `nfsOpen`) | `aria-expanded`, `aria-controls` = pane id (Triggers) | `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (Triggers) |
| Trigger (`nfsClose`) | Nothing | Nothing |
| Pane | `id`; no role; no `aria-hidden` (Foundation's `display: none` removes a closed pane from the accessibility tree); no `aria-modal` | `id`, `role="dialog"`, a name through the consumer's `aria-labelledby` (a visible heading or the Trigger's id) or `aria-label`; no `aria-modal`, trapped or not |

| Key or input | Where | Behaviour | Owner |
| --- | --- | --- | --- |
| Enter, Space | Trigger button | Toggles (native `click`); a hover-opened pane stays open | Native button, Triggers, pane |
| Tab, Shift+Tab | In the pane | Moves through the pane's controls; leaving the pane (and its Triggers) closes it with `'tab'` | Native, Light dismiss |
| Tab, Shift+Tab | In a `trapFocus` pane | Wraps from last to first and first to last | CDK `FocusTrap` |
| Tab | Trigger, pane closed | Skips the pane (`display: none`) | Native |
| Escape | Anywhere, pane open | Closes the topmost open pane with `'keydown'`; focus returns to the opening Trigger when it was inside the pane; skipped when a control in the pane already handled the key | Light dismiss, pane |
| Arrow keys | Anywhere | Nothing: the pane is not a menu | |
| Pointer press outside | Page | Closes with `'click'` when `closeOnClick` is on; a touch scroll never closes | Light dismiss |
| Pointer over Trigger, then pane | `hover` panes | Opens after `hoverDelay`; stays open while over either; closes `hoverDelay` (at least 100 ms) after leaving both, unless focus is inside | Hover intent, pane |

Focus rules: opening from a Trigger leaves focus on the Trigger unless `autoFocus` or `trapFocus` move it in; the pane is written right after its Trigger, so Tab from the Trigger enters it (dev check 3); closing with focus inside returns it as the behaviour rules state.

### WCAG 2.2 AA requirements

Requirements, not recommendations. The story gate runs axe with the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`; ADR 0018), with every pane open as well as closed; criteria axe cannot judge are asserted in play functions and e2e.

| Criterion | Requirement for the Dropdown pane | Foundation default and what makes it pass |
| --- | --- | --- |
| 1.4.13 Content on Hover or Focus | A hover-opened pane is dismissible without moving pointer or focus, hoverable, and persistent | Escape closes the topmost pane from anywhere (Light dismiss) and hover does not reopen it until the pointer re-enters; the pane is always in the Hover region (`hoverPane` dropped, because Foundation's `false` default fails) with a close delay of at least 100 ms; no timer hides it, and hover leave never closes a pane that holds focus |
| 1.4.10 Reflow | At 320 CSS px every pane fits beside its Trigger without horizontal scrolling, from any Trigger position | Foundation's default `$dropdown-width: 300px` and the `size="small"` (200 px) and `size="large"` (400 px) sizes overflow from Triggers away from the edges, because the Positioner never shifts or shrinks a pane. A pane no wider than half the page always fits: left-aligned when its Trigger starts in the left half, right-aligned otherwise, and the search tries both. Required consumer settings: `$dropdown-width: min(300px, 45vw);` and `$dropdown-sizes: (tiny: 100px, small: min(200px, 45vw), large: min(400px, 45vw));` (45vw leaves room for a desktop scrollbar; `min()` is in target). The `nfs-dropdown-pane` mixin warns at compile time when either setting holds a fixed width over 160 px. `hOffset` other than 0 reduces the margin by its size |
| 2.4.11 Focus Not Obscured (Minimum) | An open pane never covers the focused Trigger, and never stays over a control that receives focus | Every Placement puts the pane beside its anchor for offsets of 0 or more (the Positioner warns on negative ones); focus moving outside closes the pane; one Dropdown pane open at a time; a pane opened by hover over an already focused control is dismissed with Escape without moving focus |
| 2.1.1 Keyboard | Everything a pane does is available from the keyboard | Triggers are native buttons (Triggers spec); a `hover` pane also has a Trigger (dev check 3); the pane follows its Trigger in DOM order so Tab reaches it |
| 2.1.2 No Keyboard Trap | Focus can always leave a pane | `trapFocus` only with `role="dialog"` (dev check 2), where Escape is the standard way out; Escape always closes; an untrapped pane closes when Tab leaves it |
| 2.4.3 Focus Order, 1.3.2 Meaningful Sequence | Reading and focus order follow what is shown; focus never stays in a closing pane | The pane stays where the consumer wrote it, right after its Trigger (dev check 3); focus returns to the Trigger on Escape and on Trigger, method, and hover-leave closes with focus inside |
| 4.1.2 Name, Role, Value | The Trigger exposes expanded state and the controlled pane; a dialog pane exposes its role and a name; nothing claims `menu` | Triggers render `aria-expanded`, `aria-controls`, and `aria-haspopup="dialog"` only for dialogs from host bindings, correct in server HTML; `role="dialog"` panes are named by the consumer (dev check 1 and axe's `aria-dialog-name`); Foundation's `aria-haspopup="true"` is gone |
| 1.3.1 Info and Relationships | The Trigger names the pane it controls | `aria-controls` from the pane's `id`, consumer-supplied or generated |
| 1.4.3 Contrast (Minimum) | Text in the pane meets 4.5:1 against the pane background | Passes with Foundation's defaults: pane text inherits `$body-font-color` (#0a0a0a) on `$dropdown-background` (`$body-background`, Foundation's `$white`, #fefefe), 19.63:1 by the exact WCAG relative-luminance formula. A consumer who changes `$dropdown-background` keeps 4.5:1 against the pane's text colour; axe's `color-contrast` checks the stories with the pane open |
| 1.4.11 Non-text Contrast | No state or control is conveyed only by a low-contrast graphic | The pane's `$dropdown-border` (1px `$medium-gray`, 1.63:1 on `$white` by the exact formula) is a container edge, not needed to identify a control or state, so the criterion does not apply to it; the Trigger's state is conveyed by `aria-expanded` and by the pane appearing. Controls inside the pane are the consumer's |
| 2.4.7 Focus Visible | Triggers and the pane's controls show a visible focus indicator | Passes with Foundation's defaults: Foundation removes outlines only under `what-input`'s mouse and touch attributes, which the library never loads; the pane itself never takes focus |
| 2.5.8 Target Size (Minimum) | Every Trigger is at least 24 by 24 CSS px or meets the spacing exception | The library adds no target; `.button` Triggers pass at every Foundation size (Button spec); the Positioner never places a pane over its Trigger; axe's `target-size` rule runs in every story |
| 3.2.1 On Focus | Focus alone opens nothing | The pane opens on click, keyboard activation, method, model, or hover, never on focus |
| 2.2.2 Pause, Stop, Hide | Motion starts only from a user action and ends quickly | `animate` plays only on open and close; the `nfs-motion` classes run 500 ms by default; no Motion class is bound under reduced motion |

### Rendered HTML

Directive attributes (`nfsdropdownpane`, `nfsbutton`) stay in the DOM and are omitted below. The consumer markup carries no Foundation or library class (ADR 0039); every class in the rendered DOM comes from a directive, and the server HTML carries all of them because they are host bindings. Server HTML carries `jsaction="click:;"` on each Trigger (the replay annotation for the Triggers' host listener). The pane has no replayable listener (`animationend` and `animationcancel` are not replay types), so it carries none. Generated ids differ between server and client and are rewritten at hydration, because `id` and `aria-controls` are both host bindings. A static `size` attribute stays in the DOM, where HTML gives it no meaning on a `div`.

```html
<!-- Consumer markup: disclosure pane with a form -->
<button nfsButton [nfsToggle]="account">Account</button>
<div nfsDropdownPane #account="nfsDropdownPane" id="account-pane" vOffset="7" [autoFocus]="true">
  <form>...</form>
</div>

<!-- server, and hydrated before any click (a bound input renders no attribute) -->
<button class="button" type="button" aria-expanded="false" aria-controls="account-pane" jsaction="click:;">Account</button>
<div id="account-pane" class="dropdown-pane" vOffset="7">...</div>

<!-- hydrated, after a click (Trigger 75.86 x 40.88 px at the pane's containing-block origin); focus is on the first form control -->
<button class="button" type="button" aria-expanded="true" aria-controls="account-pane">Account</button>
<div id="account-pane" class="dropdown-pane is-open has-position-bottom has-alignment-left"
     style="top: 47.88px; left: 0px;" vOffset="7">...</div>

<!-- after Escape: aria-expanded="false", .is-open gone, offsets and placement classes kept -->
<div id="account-pane" class="dropdown-pane has-position-bottom has-alignment-left" style="top: 47.88px; left: 0px;" ...>...</div>

<!-- Non-modal dialog pane with a trapped form -->
<button nfsButton [nfsToggle]="filters">Filters</button>
<div nfsDropdownPane #filters="nfsDropdownPane" size="large" role="dialog"
     aria-labelledby="filters-title" trapFocus>
  <h2 id="filters-title">Filters</h2>
  ...
  <button nfsButton nfsClose>Apply</button>
</div>

<!-- server: the size class from the size input -->
<button class="button" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="nfs-dropdown-pane-a1b2-0" jsaction="click:;">Filters</button>
<div class="dropdown-pane large" size="large" role="dialog" aria-labelledby="filters-title" trapFocus id="nfs-dropdown-pane-a1b2-0">...</div>

<!-- hydrated, open: CDK's focus trap anchors sit beside the pane only while it is open -->
<div tabindex="0" class="cdk-visually-hidden cdk-focus-trap-anchor" aria-hidden="true"></div>
<div class="dropdown-pane large is-open has-position-bottom has-alignment-left" role="dialog" ...
     id="nfs-dropdown-pane-c3d4-0" style="top: 40.88px; left: 0px;">...</div>
<div tabindex="0" class="cdk-visually-hidden cdk-focus-trap-anchor" aria-hidden="true"></div>

<!-- Hover pane, animated with typed Motion names -->
<button nfsButton [nfsToggle]="hint">Hint</button>
<div nfsDropdownPane #hint="nfsDropdownPane" hover animate="fade-in fade-out">...</div>
<!-- while the leave animation runs (aria-expanded is already "false"): the library's keyframe class of fade-out -->
<div class="dropdown-pane is-open nfs-fade-out has-position-bottom has-alignment-left" hover animate="fade-in fade-out" ...>...</div>
<!-- after animationend: closed is emitted -->
<div class="dropdown-pane has-position-bottom has-alignment-left" ...>...</div>

<!-- Open at first paint: bound, never a class; server renders .is-open with no offsets (static position below the Trigger) -->
<div nfsDropdownPane [isOpen]="true" id="notice-pane">...</div>
<div id="notice-pane" class="dropdown-pane is-open">...</div>
<!-- first client render callback after hydration: placed, placement classes bound, Light dismiss registered -->
<div id="notice-pane" class="dropdown-pane is-open has-position-bottom has-alignment-left" style="top: 40.88px; left: 0px;">...</div>

<!-- Foundation markup copied as is: is-open is stripped by the binding, top and large stay; dev check 7 warns once, naming [isOpen]="true", position="top", and size="large" -->
<div nfsDropdownPane class="dropdown-pane top large is-open">...</div>
<div class="dropdown-pane top large" id="nfs-dropdown-pane-a1b2-1">...</div>
```

### Animation

Per ADR 0003 and building-blocks 1.6 rule 1: the pane stays in the DOM, so it animates through bound classes and CSS keyframes, never `animate.enter`/`animate.leave`, which play again at hydration on server-rendered elements ([Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)). Foundation's Dropdown has no animation, so none is the default.

Phases, held in a `linkedSignal` derived from `isOpen` (the Toggler's mechanism, reused):

| Phase | Entered when | Host state |
| --- | --- | --- |
| idle | first render (server and client), and after every completion | open: `.is-open`; closed: no `.is-open`; no Motion class |
| entering | `isOpen` becomes `true`, an in-class exists, animations are enabled | `.is-open` and the in-class, bound in the same pass |
| leaving | `isOpen` becomes `false`, an out-class exists, animations are enabled | `.is-open` kept (Foundation's `display: none; visibility: hidden` would cut the animation) and the out-class bound |

- Animations are enabled unless `NfsMediaQuery.reducedMotion()` is `true` or `nfsAnimationsToken` is `{disabled: true}`. Under reduced motion no Motion class is bound and the change completes in the same tick, which also covers consumer classes without a reduced-motion rule; `nfs-motion`'s own 1 ms override stays as the backstop for its classes (the Responsive Toggle spec's rule, and the exception the Breakpoint service spec's consumer rule 3 names for directives that bind consumer Motion classes).
- Placement lands in the same tick that binds `.is-open` and before paint (Anchored pane spec), so the enter keyframes start at the final position; offsets and placement classes are kept after close, so the leave keyframes play where the pane was.
- Completion: in the `earlyRead` phase after a Motion class is bound, the directive reads the host's computed `animation-name`, `animation-duration`, `animation-delay`, and `animation-iteration-count` and takes the longest finite animation (Angular's method for `animate.leave`). None (no keyframes, stylesheet missing, `nfs-motion` not included): the phase completes at once. Otherwise it completes on the host's `animationend` or `animationcancel` for that name with `event.target` equal to the host, or on a fallback timer of the measured length plus 100 ms started outside the Angular zone, whichever comes first. This is the Toggler spec's measured refinement of building-blocks 1.6 rule 1: the Motion classes are consumer-chosen, and the case the fixed timer protects (a missing animation) measures zero and completes at once, which the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md) dropped-stylesheet case confirms.
- Interruption: an opposite request mid-phase recomputes the phase (entering to leaving and back); the interrupted phase emits nothing and its timer is cleared.
- Completion outputs: once the phase is idle and the committed state differs from the last emitted one, `opened` or `closed` (with the reason of the close that completed) is emitted in the `read` phase. None for the initial state. Without an animation they fire in the render callback after the pass that showed or hid the pane.
- Motion names and classes: the consumer writes typed Motion names (`animate="fade-in fade-out"`, `animate="slide-in-down slide-out-up"`), and the directive binds the library's keyframe classes of those names (`nfs-fade-in`, `nfs-fade-out`, `nfs-slide-in-down`, `nfs-slide-out-up`) from the `nfs-motion` mixin, so no library class name appears in consumer code (ADR 0039). The consumer's own keyframe classes are written with a leading dot (`animate=".app-pop-in .app-pop-out"`) and bound without it. Keyframe classes only: Motion UI's own transition classes never animate here (two-frame protocol; the prototype above), and a Motion name is never bound as Motion UI's transition class of the same name. A name whose class starts no animation (the `nfs-motion` include missing, a consumer class without `@keyframes`) completes at once and triggers dev check 5.
- Nothing animates at hydration or on the first client render: the phase starts idle, and the class list on the server equals the class list after hydration.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7, rules 1 to 11:

- Server-side rendering and first paint: `.dropdown-pane`, the size class, `.is-open`, `id`, and `role` are host bindings on signal state that exists on the server, so the server HTML is the first-paint state (rule 1), and Foundation's CSS styles it although the consumer wrote no class (ADR 0039). A closed pane is in the server HTML hidden by Foundation's `display: none; visibility: hidden`, so the Trigger's server-rendered `aria-controls` names an element that exists (rule 2, ADR 0002). No inline offsets, no placement classes, no Motion class, no focus trap anchors, and no CDK style are in server HTML: everything positional, focus-related, and animated runs in render callbacks, which never run on the server, and the CDK services are resolved only there. The Runtime checks and the development checks run only in client render callbacks too.
- Open at first paint (`[isOpen]="true"`): the server renders `.is-open` with no offsets, so the pane shows at its static position, below its Trigger for Foundation's docs markup. The first client render callback after hydration places it, binds the placement classes, and registers it with Light dismiss: one visible settle, accepted in the Anchored pane spec. `autoFocus` and `trapFocus` do not act on the first-paint state (focus moves only on user action; the rendering-modes checklist), and `opened` is not emitted for it. Plain client rendering places it before the first paint, with no settle.
- Before hydration: construction reads DI only (the development builds' static `class` read is DI, through `HostAttributeToken`); no DOM access outside host bindings, no `window`, no listeners, observers, or timers (rules 3 to 5). The Positioner, Light dismiss, hover intent, focus handling, and animation all start in render callbacks; the fallback timer and hover timers run outside the Angular zone.
- Full hydration: host binding values equal the server's (generated ids aside, rewritten at hydration), so hydration changes nothing and there is no structure to mismatch. CDK's focus trap anchors are inserted beside the pane only after hydration, on a later open, and removed on close (rule 10).
- Event replay: a Trigger `click` before hydration replays through the Trigger's host listener after hydration and calls `toggle(trigger)` on the pane, whose state was created at construction; the Positioner places the pane in the next render callback, when layout exists. `pointerenter` and `pointerleave` are not replayed and hover listeners are added in code, so a hover before hydration does nothing and the next pointer entry after hydration opens. Light dismiss listeners are document-level and added in code, so an Escape or outside press before hydration does nothing, which is correct because nothing is open then; the one exception, a pane open at first paint, cannot be dismissed until hydration. The pane's own handlers (`animationend`, `animationcancel`) are not replayed types and call no `preventDefault()`.
- Hydration boundary: a Trigger and its pane, and a nested pane and its parent pane, belong in one hydration boundary (ADR 0008; building-blocks 1.11 decision 6). Template-reference scoping stops a Trigger outside a `@defer` block from naming a pane inside it (ADR 0013).
- `@defer`: library code contains no `@defer`; `ngx-foundation-sites/dropdown-pane` is its own entry point, so a consumer's `@defer` loads the pane, the Triggers, and the Anchored pane utility together. Inside a dehydrated block the pane is its server HTML, closed; a Trigger click hydrates the block, replays, opens, and places. With `hydrate on hover` the first hover only hydrates the block (its `mouseover` trigger fires, but the `pointerenter` that would open has passed), so a `hover` pane opens on the second entry; `hydrate on viewport` or `on idle` avoid that. Inside `hydrate never` the pane keeps its server state: a closed pane never opens, and an open-at-first-paint pane stays at its static position and cannot be dismissed, so such panes do not belong in `hydrate never`. Plain `@defer` renders the pane on the client like any client render.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; pointer, focus, key, scroll, and timer callbacks run outside the Angular zone (inside the utility and the fallback timer) and reach Angular only by writing signals, so pointer movement never runs change detection.

### Sass and custom CSS

No library CSS rule. Foundation's `foundation-dropdown` export mixin already provides everything the pane needs: `position: absolute` for the Positioner, `display: none; visibility: hidden` for the closed state, `.is-open` to show it, and the `$dropdown-sizes` classes the `size` input sets. Placement is inline `top`/`left`, Foundation's own mechanism. The library's `nfs-dropdown-pane` mixin writes one thing, the Variant property `--nfs-dropdown-sizes` on `:root`, and holds the compile-time 1.4.10 warning. The Sass subsection under Further Notes gives the required content.

## Testing Decisions

A good test asserts what a user or assistive technology observes: whether the pane is shown (`.is-open`, visibility, box), where it sits relative to its Trigger and which placement and size classes it carries, the Trigger's `aria-expanded`, `aria-controls`, and `aria-haspopup`, the pane's `role` and name, where focus lands, which reason `closed` carries, and when `opened`/`closed` fire relative to the animation. No test reads private fields or the phase signal. Geometry is compared with the Anchored pane formulas and the Foundation 6.9 values recorded by the [Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay](../issues/44-prototype-anchored-pane.md); Foundation's JavaScript is not a test dependency. Prior art: the Anchored pane spec's layers (its test pane is what this directive replaces in composition stories), the Triggers and Toggler specs' layers, and the harness of the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md); nothing exists in the new repository yet.

The library's Storybook compiles Foundation with the required settings `$dropdown-width: min(300px, 45vw);` and `$dropdown-sizes: (tiny: 100px, small: min(200px, 45vw), large: min(400px, 45vw));` (WCAG 1.4.10 named in the comment, building-blocks 1.12).

Story ids follow `dropdown-pane--<story>`: `dropdown-pane--default`, `dropdown-pane--positions`, `dropdown-pane--multiple-triggers`, `dropdown-pane--hover`, `dropdown-pane--close-on-click`, `dropdown-pane--auto-focus`, `dropdown-pane--dialog`, `dropdown-pane--animated`, `dropdown-pane--sibling-panes`, `dropdown-pane--nested`, `dropdown-pane--parent-class`, `dropdown-pane--two-way-binding`, and `dropdown-pane--reflow` (args: Trigger position `left | quarter | center | three-quarters | right`, `size`, `hOffset`). Stories write Foundation's elements and the library's directives and no Foundation or library class (storybook-conventions, ADR 0039): `size` and `animate` are args like every other input, stories use Foundation's default size names only (so the library's Storybook program needs no Variant declaration file), and demo scaffolding whose Foundation classes have no directive yet is left out or given an inline style for a value Foundation has no class for (a Trigger offset, a box width).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Stack: `@storybook/angular-vite` 10.6 with `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless; inferred `test-storybook`: `npx nx test-storybook <lib>`. Axe: `@storybook/addon-a11y`, `parameters.a11y.test = 'error'`, `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` in the Storybook preview configuration, the enforcing gate; every story runs it with its pane open as well as closed. CSR only; the single home of interaction tests. Animated stories wait for the Completion output, never a timeout.

- `dropdown-pane--default`: Foundation's docs example, with the library's directives in place of its classes and without its XY Grid scaffolding (whose directives the [Spec: XY Grid](../issues/99-spec-xy-grid.md) names); the pane carries `.dropdown-pane` although the story writes no class; the Trigger has `aria-expanded="false"`, `aria-controls` equal to the pane id, and no `aria-haspopup`; a click adds `.is-open`, `has-position-bottom has-alignment-left`, and `aria-expanded="true"`; clicking the Trigger again closes it once (no reopen); reopening then Escape with focus inside closes with `'keydown'` and focus returns to the Trigger; Tab out of the pane closes with `'tab'`; Enter and Space on the Trigger toggle through `userEvent.keyboard`.
- `dropdown-pane--positions`: for each of the 12 position and alignment pairs (args) with `vOffset` and `hOffset`, the placement classes match and the pane box sits on the expected side of the Trigger. Foundation's docs Positioning examples, written there with the legacy `.top`, `.left`, `.right`, and `.bottom` pane classes, are the `position` arg values; the Trigger sits in the middle of a scaffold whose padding is an inline style.
- `dropdown-pane--multiple-triggers`: two Triggers; the pane sits against the one clicked; `pane.open()` from a third button places it against the first Trigger; after Escape with focus inside, focus returns to the Trigger that opened it.
- `dropdown-pane--hover`: `hover`; hovering the Trigger opens after the delay without moving focus; moving onto the pane keeps it open; leaving both closes it; clicking the Trigger of the hover-opened pane keeps it open; Escape while hovering closes and it does not reopen until the pointer re-enters; with focus moved into the pane, leaving with the pointer keeps it open.
- `dropdown-pane--close-on-click`: with `closeOnClick`, a press on plain text outside closes with `'click'` and moves no focus; without it the pane stays open; a press that starts in the pane and ends outside keeps it open.
- `dropdown-pane--auto-focus`: `autoFocus`; a click open focuses the first tabbable control, skipping a disabled input and a `tabindex="-1"` element; with `hover` also on, a hover open moves no focus.
- `dropdown-pane--dialog`: `size="large"`, `role="dialog"`, `aria-labelledby` to a heading, `trapFocus`; the pane carries `.large`, and its box is as wide as the Storybook setting's `min(400px, 45vw)` resolves at the story's width; the Trigger has `aria-haspopup="dialog"`; opening focuses the first control; Tab from the last control goes to the first and Shift+Tab from the first to the last, with the pane still open; Escape closes and focuses the Trigger; a bare `nfsClose` Apply button closes it and focuses the Trigger.
- `dropdown-pane--animated`: `animate="fade-in fade-out"`, the typed Motion names; opening binds `.is-open` and `nfs-fade-in`, then `opened` fires and the class is gone; Escape binds `nfs-fade-out` with `.is-open` kept, then `closed` fires with `'keydown'` and `.is-open` is gone.
- `dropdown-pane--sibling-panes`: opening pane B closes pane A with `'sibling'` and moves no focus.
- `dropdown-pane--nested`: a pane opened from a Trigger inside another pane; a click inside the outer pane closes only the inner one; a bare `nfsClose` inside the inner pane closes only it; Escape closes the inner, then the outer.
- `dropdown-pane--parent-class`: a Trigger near the right edge of a box that carries the story's own class `story-bound` (a plain `div` whose width and border are inline styles), with `parentClass="story-bound"`; the pane flips to `bottom-right` inside the box although the page has room.
- `dropdown-pane--two-way-binding`: `[(isOpen)]` shown in the story; Trigger clicks update it; a checkbox bound to it opens and closes the pane; the `closed` reasons are listed.
- `dropdown-pane--reflow`: with the Storybook settings, the pane opens without horizontal overflow of the story root at the story's width, for no `size`, `size="small"`, and `size="large"`; the Trigger positions are inline `margin-inline-start` values; the full 320 px matrix is e2e.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Openable contract: `nfsOpenableToken` resolves to the pane from an inner element; `#p="nfsDropdownPane"` resolves; `triggerRole` follows `role`; `id` defaults to a generated `nfs-dropdown-pane-` id and a static `id` wins; `registerTrigger` adds and its returned function removes a Trigger.
- Anchor and focus-return target: `open(trigger)` anchors to `trigger`; `open()` anchors to the first registered Trigger and records the element focused at call time; a disconnected or unfocusable target receives no focus.
- Toggle rule: `toggle()` on a hover-opened pane keeps it open; on a click-opened pane it closes; the hover-opened mark clears on every close.
- Close reasons and focus return, driven by data: each reason (`'click'`, `'keydown'`, `'tab'`, `'sibling'`, `undefined` from method, Trigger, hover leave, and model) with focus inside and outside the pane; focus moves exactly for `'keydown'` and the non-model `undefined` closes with focus inside; `closed` emits the reason once.
- Hover mapping with fake timers: `hover` false passes `enabled` false; both delays follow `hoverDelay`; a hover close is skipped while focus is inside the pane.
- Focus on open: `autoFocus` picks the first element for which `isFocusable` and `isTabbable` hold; nothing happens for hover opens and for an initial `[isOpen]="true"`; `InteractivityChecker` and `FocusTrapFactory` are never resolved for a pane without `autoFocus` and `trapFocus` (spy on the `Injector`).
- Focus trap lifetime: anchors appear beside the pane on open and are removed on close and on destroy; a `focusin` on an anchor that CDK redirects into the pane does not close it (with the registry's stale-`focusin` guard).
- Phases with a test stylesheet: entering and leaving class lists after each step; `.is-open` kept while leaving; `opened` and `closed` once each, after `animationend`, in order; interruption mid-leave emits only `opened`; `animationend` from a child does not complete the phase; `animationcancel` does.
- Fallback paths: a Motion class with no keyframes completes at once; a suppressed `animationend` completes after the measured length plus 100 ms (fake timers); `nfsAnimationsToken` `{disabled: true}` and a `NfsMediaQuery` test double reporting `reducedMotion` bind no Motion class.
- Positioner mapping: each positional input reaches the placement (compared with the pure formulas); `parentClass` resolves the nearest ancestor and ignores a class on the pane itself; legacy `.top` and `.float-right` classes change nothing; `reposition()` re-places while open and does nothing while closed.
- Defaults token: every Option default applies when the attribute is absent and is overridden by it.
- Classes: a host with no `class` attribute renders `.dropdown-pane`; each of Foundation's default size names sets its class and nothing else, no `size` sets none, and a value cast past the type that is not one class token (`'small large'`) sets none; the size, Placement, and Motion classes share the `[class]` list without removing one another; `animate="fade-in fade-out"` binds `nfs-fade-in` while entering and `nfs-fade-out` while leaving; `animate=".app-pop-in .app-pop-out"` binds `app-pop-in` and `app-pop-out` with a test stylesheet's keyframes; `animate="fade-out"` opens at once and animates only the close; `animate="fade-in"` closes at once.
- Copied classes (dev check 7), with the static class read spied: `class="dropdown-pane is-open"` renders closed with `is-open` stripped and warns once, naming `[isOpen]="true"`; `class="large"` keeps `.large` and warns, naming `size="large"`; `class="top"` leaves the placement at `bottom` and warns, naming `position="top"`; `class="has-position-top"` and `class="is-opening"` warn; a redundant `class="dropdown-pane"` and the consumer's own `class="account-pane"` do not; nothing is read in a production build.
- Variant check: with `--nfs-dropdown-sizes: tiny small large` on the test document, a listed `size` is silent; an unlisted `size` cast past the type reports `strictVariantNames` once, naming `nfsDropdownPane`, `size`, the value, and `$dropdown-sizes`; with the property absent, a pane with no `size` bound reports `strictVariantProperties` once, naming `@include nfs-dropdown-pane;`; `provideNfsRuntimeChecks({strictVariantProperties: false})` silences it; without a checker (the production double) the Variant check's `afterRenderEffect` is never created.
- Dev-mode checks: each of the eight warnings fires once for its case and not for correct markup (`role="dialog"` with `aria-label`; `trapFocus` with `role="dialog"`; the pane right after its Trigger; an existing `parentClass` ancestor; `animate="fade-in fade-out"` with `nfs-motion`'s test keyframes present; `[autoFocus]="true"` bound; a class-free host; a pane after, not inside, an `nfsButtonGroup`). Check 5 also fires for `animate="fade-in fade-out"` with the test keyframes absent, and the phase still completes at once.
- RTL: under CDK's `[dir]` wrapper set to `rtl`, `alignment` `auto` binds `has-alignment-right`.
- Zoneless: the suite runs with zoneless change detection; no test needs `NgZone`.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which none here does.

- SSR smoke: `renderApplication` over a fixture that writes no `class` attribute, with a closed disclosure pane and its `nfsButton` Trigger, a closed `role="dialog"` pane with `size="large"`, `trapFocus`, and a generated id, an open-at-first-paint pane (`[isOpen]="true"`), a `hover` pane with `animate="fade-in fade-out"`, and a nested pane with a bare `nfsClose`. Assert `whenStable()` resolves (no pending timers); the server HTML matches the Rendered HTML section: `.dropdown-pane` on every pane, `.large` only on the dialog pane, `.is-open` only on the open one, no `style` offsets, no `has-position-*` classes, no Motion class, `role="dialog"` where set, Trigger `aria-expanded`, `aria-controls` naming an existing id, and `aria-haspopup="dialog"` only for the dialog pane; `jsaction="click:;"` on Triggers and on no pane; no `cdk-focus-trap-anchor` element and no `.cdk-visually-hidden` style in the document; no document listener was added (spy on the server document); a pane written with a static `autoFocus` carries no `autofocus` attribute; no Runtime check reports and no development check runs on the server.
- Pure logic, table-driven: the `animate` split into halves with `nfsMotionClasses` per half (the mapping shared with every Motion input) and the longest-animation reduction (shared with the Toggler), the size-to-class mapping with its Variant needs, the copied-class matcher of dev check 7 (whole tokens: `top` matches, `topbar` and `has-position-topx` do not), the focus-return decision (reason, focus inside, close path) and the toggle rule (open, hover-opened).
- Sass compile test: compiling Foundation with `foundation-dropdown` and the library's `nfs-dropdown-pane` emits exactly one rule from the library mixin, `:root { --nfs-dropdown-sizes: tiny small large; }` on Foundation's defaults, space-separated (Sass would join `map-keys()` with commas); a consumer's `xlarge: min(600px, 45vw)` is listed after `large`, and the required settings list the same three names; the mixin warns for the default `$dropdown-width: 300px`, for `small: 200px`, and for a fixed-width custom size, and stays silent for the required `min()` settings and for fixed widths up to 160 px.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, through `mount(storyId, props)`, in Chromium, Firefox, and WebKit:

- Reflow on `dropdown-pane--reflow` at a 320 x 640 viewport: for every Trigger position and no `size`, `size="small"`, and `size="large"`, the pane opens with `document.documentElement.scrollWidth` equal to the viewport width.
- Placements on `dropdown-pane--positions`: the 12 placements match the prototype's recorded values within 0.1 px.
- Real input: a real mouse path from the Trigger across the `vOffset` gap onto a `hover` pane keeps it open; touch emulation (`hasTouch`) tap toggles and never hover-opens; real Tab and Shift+Tab in `dropdown-pane--dialog` wrap and keep the pane open in all three engines (CDK anchors and the registry guard); real Escape in `dropdown-pane--default` returns focus to the Trigger.
- Outside presses: with `closeOnClick` on, a click on another button outside the pane closes it with `'click'` in all three engines. With it off, whether that click closes the pane depends on whether the engine focuses a button on click (Safari does not, so no `focusin` fires), so that case is documented under D11 and not asserted.
- Reduced motion: `dropdown-pane--animated` with `reducedMotion: 'reduce'` binds no Motion class and fires `opened` and `closed` at once.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype), one route with a closed pane, a `hover` pane, a `role="dialog"` pane, and a pane open at first paint:

- JavaScript disabled: screenshot plus `@axe-core/playwright` on the six tags; closed panes hidden, the open pane visible at its static position.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`; after hydration the open pane carries inline offsets and its placement classes, and no `animationstart` fires on any pane.
- Pre-hydration click with the main bundle held back: a Trigger clicked before hydration opens its pane exactly once after hydration, placed; an outside click and an Escape before hydration do nothing; a hover before hydration does nothing and the next pointer entry after hydration opens the `hover` pane.
- `@defer (hydrate on interaction)` block holding a Trigger and its pane: the click hydrates, opens, and places.
- `@defer (hydrate on hover)` block holding a `hover` pane: the first hover hydrates without opening; the second entry opens.
- `@defer (hydrate never)`: the pane stays closed, clicking its Trigger does nothing, and no error is logged.

## Out of Scope

- The Positioner, the Light dismiss registry, and hover intent themselves: the Anchored pane spec. This spec maps the Dropdown Options onto them and relies on the registry's stale-`focusin` guard, which the Anchored pane spec's focus rule states.
- The Triggers' ARIA, activation, and replay: the Triggers spec.
- DropdownMenu, submenus, and the Menu Button pattern: a pane of actions that needs `role="menu"` and arrow keys is not a Dropdown pane (the map rules opt-in menu roles out of scope; building-blocks ADR 0004 for menus).
- Lazy content: no `ng-template` content directive. Content that should load only when first opened goes in a consumer `@defer (when pane.isOpen())` block inside the pane, which loads once and stays, so the leave animation never shows an empty pane.
- A `restoreFocus` input, an `overlapTrigger` Option, a backdrop element, `followScroll` as an input (panes always follow their Trigger through static scrolling containers), and a top-layer or CDK Overlay host.
- Automatic `aria-labelledby` from the Trigger: the server-HTML rule forbids writing a generated id onto the Trigger element, and only dialog panes need a name.
- Legacy `.top/.left/.right/.bottom` and `.float-*` classes as position sources.
- The Variant registries, the helper types, the manifest rows, and the declaration-file generator: the [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md); the Runtime checks' configuration: the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md).
- The shared Motion name types and `nfsMotionClasses`: building-blocks 1.6 rule 4 and the [Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md); the Toggler's use of `NfsMotionPair` for its own `animate`: the [Re-run: Toggler spec under the class rule](../issues/109-rerun-toggler-class-rule.md).
- The Button Group and the split button's other parts: the [Spec: Button Group](../issues/82-spec-button-group.md) and the [Spec: Button](../issues/37-spec-button.md).
- A `boundary` input that takes an element instead of a class name (D6).
- Motion UI transition classes and the `motion-ui` package (ADR 0003).
- Native `popover`, CSS anchor positioning, `@starting-style`, interest invokers, and `CloseWatcher` (out of target; Further Notes).
- Runtime theming through custom properties (building-blocks 1.13).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One attribute directive `[nfsDropdownPane]` on the consumer's pane element, binding the Structural class `.dropdown-pane` as a static host class, `exportAs: 'nfsDropdownPane'`; the consumer writes no Foundation or library class (revised 2026-09-28, class rule) | ADR 0001, ADR 0039; the pane is consumer markup Foundation's CSS already styles once the class is bound; named after the Structural class (building-blocks 1.3) | A component with a template (nothing to render); `nfsDropdown` (collides with Button's `.dropdown` and DropdownMenu) |
| D2 | Openable through `nfsOpenableToken` only; no plugin token | Triggers and the Nearest Openable need only the contract; nothing injects the pane | `nfsDropdownPaneToken` from the building-blocks sketch (unused) |
| D3 | Disclosure by default; `role="dialog"` makes a non-modal dialog and the Triggers add `aria-haspopup="dialog"` | APG disclosure for text and forms; non-modal dialog for dialog-like tasks; WAI-ARIA maps `aria-haspopup="true"` to `menu` | Foundation's `aria-haspopup="true"`; Menu Button pattern (a role is a promise of its keys) |
| D4 | `role` input typed `'dialog' \| null` | The only role the pane may take; a static `role="dialog"` attribute sets it | A free `string` (invites `menu`); a `dialog` boolean (loses the attribute idiom) |
| D5 | Every positional Option passes to the Positioner unchanged; `auto` resolves as Positionable does; legacy classes not read | Anchored pane spec; the classes have no CSS side (audit H5) and Foundation's regular expression matches unrelated class names | Reading `.top`/`.float-right` for parity |
| D6 | `parentClass` kept as a class-name string, resolved to the nearest ancestor; it names one of the consumer's own classes, never a Foundation or library class, and a pane bounded by a library-classed element (a Card) names an application class the consumer adds to it (revised 2026-09-28, class rule) | Foundation's Option and docs; a lookup, not a styling class, so building-blocks 1.4's class-option rule does not drop it; ADR 0039 bars Foundation and library class names from input values but keeps the consumer's own classes. No check: telling a consumer class from a Foundation one would need Foundation's whole class list in the development bundle | A `boundary` element input (a second spelling; still additive later, and the route if an application class on the bounding element proves awkward); dropping `parentClass` as a class-name Option (breaks Foundation's naming rule for a lookup that works); a development check against a list of Foundation class names |
| D7 | `hoverPane` dropped; the pane is always in the Hover region | Foundation's `false` default fails WCAG 1.4.13; no compliant use for `false` remains | Flipping the default to `true` (keeps an Option whose only other value fails AA) |
| D8 | `hoverDelay` for both delays, close floored at 100 ms | Foundation uses one delay both ways; the floor is hover intent's | Separate open and close delay inputs (not Foundation's) |
| D9 | Hover leave never closes a pane that holds focus | WCAG 1.4.13 persistent covers focus as well as hover; focus leaving or Escape still close it | Foundation's unconditional close on leave |
| D10 | `toggle()` keeps a hover-opened pane open | Foundation's `data('hover')` rule; a click after a hover open would otherwise close what just appeared | Closing (surprising); pinning the pane open (new state Foundation lacks) |
| D11 | `closeOnClick` keeps Foundation's `false` default | building-blocks 1.4 keeps Foundation defaults unless the APG or Aria forces a change, and neither does; the Defaults token flips it app-wide; Escape and the focus rule close regardless. Consequence, documented: with it off, a click on a focusable control outside closes the pane through the focus rule in engines that focus on click, and a click on a button in Safari (which does not focus buttons on click) or on plain text leaves it open | Defaulting to `true` like Material's backdrop |
| D12 | `autoFocus` uses CDK's first-tabbable rule and skips hover opens and the first-paint state | Positive `tabindex` ordering is an anti-pattern; hover must not move focus; focus on load is not a user action | Foundation's `tabindex`-sorted `findFocusable` on every open |
| D13 | `autoFocus` keeps Foundation's name but is set by binding or the Defaults token; a static attribute warns in dev mode | The name is Foundation's `data-auto-focus` in camelCase (building-blocks 1.4), but a static `autoFocus` attribute is HTML's global `autofocus`, which the browser acts on when the element is parsed or inserted, at page load and in a `<dialog>`, once the pane is focusable (a consumer's `tabindex`; measured: a pane without one takes no focus and leaves a later `autofocus` its turn); the host binds `'[attr.autofocus]': 'null'` (2026-09-28), which keeps a static attribute out of the server HTML, but a client-rendered pane is inserted with it, so the static form is still reported; a bound input renders no attribute | Renaming the input (breaks the naming rule); ignoring the collision |
| D14 | `trapFocus` uses CDK `FocusTrap`, requires `role="dialog"`, moves focus in, skips hover opens | building-blocks 1.2 (FocusTrap only where native containment is missing); a trapped disclosure breaks the APG's Tab-out rule; CDK's start anchor would send Tab from the Trigger to the last control unless focus moves in | Foundation's Tab-wrap keydown handler; a trap on a disclosure |
| D15 | `InteractivityChecker` and `FocusTrapFactory` resolved from the `Injector` on first need | Never constructed on the server or for panes that do not use them; `FocusTrapFactory` injects a style on construction | Field injection (every pane, server included); `injectAsync` (a trapped open must attach in the same pass) |
| D16 | Focus returns on Escape and on method, Trigger, and hover-leave closes with focus inside, at request time; never on `'click'`, `'tab'`, `'sibling'`, or model closes | APG: Escape returns focus to the trigger; focus must not stay in a closing pane (2.4.3); the user already moved it for the others; the Toggler spec's model rule | Foundation's focus-all-anchors on Escape; waiting for the leave animation; a `restoreFocus` input |
| D17 | `closed` carries `'click' \| 'keydown' \| 'tab' \| 'sibling' \| undefined` | Material's `MenuCloseReason` words plus Light dismiss's sibling case (ADR 0024) | A void `closed` (Foundation's `hide`); a separate `'hover'` reason (no consumer need) |
| D18 | `close(result)` ignores its result | The pane has nothing to hand a result to (the Toggler's rule) | Emitting the result through `closed` (mixes values with reasons) |
| D19 | `forceFollow` dropped | Triggers never call `preventDefault()`; hover never opens from touch, so the first-tap guard has nothing to guard | A `forceFollow` input on the pane that would have to reach into the Trigger's click |
| D20 | `animate` input typed `NfsMotionPair`: Foundation's one-string `"<in> <out>"` pair over the shared Motion types of building-blocks 1.6 rule 4 (a Motion name binds `nfs-<name>`, the consumer's own keyframe class takes a leading dot), mapped per half by `nfsMotionClasses` and bound through the `.is-open` State class and phases; measured completion; the Reveal's "started no animation" warning (revised 2026-09-28, class rule) | ADR 0003 rule 1; ADR 0039 (a Motion input takes `'fade-in'`, never `'nfs-fade-in'`; State classes on a persistent element, `animate.enter`/`animate.leave` only where the element enters or leaves the DOM); the Reveal re-run's names and dot form, measured under strict templates, so every Motion input takes one form; 1.6 rule 4 asks a one-string pair input to type its pair over the same aliases; the Toggler's mechanism and pair reused; Foundation has no Dropdown animation, so `''` by default. The warning is new because the typed name hides the `nfs-` prefix that told the consumer to include `nfs-motion` | `animate.enter`/`animate.leave` (replays at hydration on a server-rendered pane); a fixed timer; class names as values (ADR 0039); `animationIn`/`animationOut` as the Reveal has them (Foundation's Dropdown has no animation Option to name them after, and the pane reuses the Toggler's one-input mechanism); a Dropdown-only Motion type (two spellings for one mechanism) |
| D21 | No Motion class under `reducedMotion()` | Covers consumer classes without a reduced-motion rule; the Responsive Toggle spec's rule, named as an exception in the Breakpoint service spec's consumer rule 3 | Relying only on `nfs-motion`'s 1 ms override |
| D22 | 1.4.10 met by required Foundation settings (`min(300px, 45vw)` widths) with a compile-time warning, no CSS rule (the mixin's only output is the Variant property, D29) | ADR 0022 prefers Sass settings over library rules; a pane no wider than half the page fits from any Trigger because the search tries left and right alignment; the Positioner never shifts panes (Anchored pane spec) | A library `max-width` rule (does not fix a pane anchored mid-page); leaving sizing as advice |
| D23 | Automatic `aria-labelledby` dropped; consumers name dialog panes | Writing an id onto the Trigger before hydration is forbidden; a disclosure pane needs no name; axe's `aria-dialog-name` and a dev check catch a missing one | Foundation's generated anchor id |
| D24 | Entry point, story ids, and mixin named `dropdown-pane` | Same reason as the class name; the Triggers spec already uses `dropdown-pane--` story ids | `dropdown` (ambiguous with Button's Variant class and DropdownMenu) |
| D25 | No `injectAsync`, no `effect`, no `afterEveryRender` | Anchored pane decided eager loading; open-time work must be synchronous; nothing non-DOM to sync; per-render work would cost every change detection | Lazy CDK a11y chunk |
| D26 | `size` Variant input: `NfsDropdownPaneSize = NfsOverridableStringUnion<'tiny' \| 'small' \| 'large', NfsDropdownSizesOverrides>`, an Open Variant family over `$dropdown-sizes`; no `'default'`, no Breakpoint form, not in the Defaults token; unset sets no class | ADR 0039 (every Variant class a typed input), ADR 0040 and building-blocks 1.4 (name rule 3, `size` for a size map; closed type over a registry; defaults set no class; a Defaults token never holds a Variant default); `$dropdown-sizes` has no `default` key, and Foundation's dropdown Sass loops over it once, with no breakpoint, so it generates no responsive pane size | Consumer-written size classes (the first version's row, against ADR 0039); a `size` with `(string & {})` (a typo compiles); a size in the Defaults token |
| D27 | Copied Foundation classes reported once in development (dev check 7): `is-open`, the default size names, the legacy position classes, the Placement classes, `is-opening`; read through `HostAttributeToken('class')` in development builds only | Building-blocks 1.4's initial-state rule: a copied `is-open` is stripped by its binding and would render closed silently; a copied size or Placement class survives the `[class]` list and would be a second spelling; Foundation's docs write the legacy position classes, which no longer place the pane | No check (silent changes for migrating markup); honouring the classes as seeds (a class-based second spelling of state, against ADR 0039); reporting a redundant `dropdown-pane` (harmless, it merges) |
| D28 | The Variant check requests `nfs-dropdown-pane` whether or not `size` is bound, and reports bound sizes | The include carries the compile-time 1.4.10 warning, so a missing include is an accessibility gap worth reporting even with no `size` (the Callout's D12, the Close Button's D10); `--nfs-dropdown-sizes` is written by `nfs-dropdown-pane` alone and is never empty on Foundation's defaults | Requesting only when `size` is bound (a missing include on the commonest pane would go unreported) |
| D29 | `nfs-dropdown-pane` writes `--nfs-dropdown-sizes` on `:root`, space-separated, its one emitted rule | Building-blocks 1.13 and ADR 0012's dated note: a Library mixin of an entry point with an Open Variant family writes its Variant property; one writer per property | No property (the declaration-file generator and the Runtime check would have nothing to read, so a size the consumer adds could not reach the type from the Sass) |
| D30 | A split button's pane goes after the Button Group, never inside it; a pane inside a group warns in development (dev check 8) | The Button Group spec's decision: Foundation's `$buttongroup-child-selector` rules would restyle every `nfsButton` host in the pane; the pane still follows its Trigger in document order (dev check 3), so check 3 alone would not catch it | A group token the pane reads (the Button Group spec decided no token); documentation only (the Button Group spec's examples show the right order, but a copied pane inside the group looks almost right) |

### Usage examples

`nfsShowForSr` is the [Spec: Visibility Classes](../issues/104-spec-visibility-classes.md)'s directive for `.show-for-sr`, imported as `NfsShowForSr` from `ngx-foundation-sites/visibility`. `account-box` is the application's own class.

```ts
@Component({
  selector: 'app-header',
  imports: [NfsButton, NfsButtonGroup, NfsToggle, NfsClose, NfsDropdownPane, NfsShowForSr],
  template: `
    <!-- Click to toggle, Foundation's docs example: no class on the pane -->
    <button nfsButton [nfsToggle]="example">Toggle Dropdown</button>
    <div nfsDropdownPane #example="nfsDropdownPane" [autoFocus]="true">
      <form>
        <label>Name <input type="text" /></label>
      </form>
    </div>

    <!-- Hover; the pane is always part of the Hover region -->
    <button nfsButton [nfsToggle]="hoverable">Hoverable Dropdown</button>
    <div nfsDropdownPane #hoverable="nfsDropdownPane" hover>
      Just some junk that needs to be said. Or not. Your choice.
    </div>

    <!-- Explicit placement, offsets, and a size; Foundation's class="dropdown-pane top small" becomes inputs -->
    <button nfsButton [nfsToggle]="topRight">Top right</button>
    <div nfsDropdownPane #topRight="nfsDropdownPane" size="small"
         position="top" alignment="right" vOffset="8">...</div>

    <!-- Non-modal dialog with a trapped form; Apply closes it and focus returns to the button -->
    <button nfsButton [nfsToggle]="filters">Filters</button>
    <div nfsDropdownPane #filters="nfsDropdownPane" size="large"
         role="dialog" aria-labelledby="filters-title" trapFocus
         (closed)="onFiltersClosed($event)">
      <h2 id="filters-title">Filters</h2>
      <label><input type="checkbox" /> In stock</label>
      <button nfsButton nfsClose>Apply</button>
    </div>

    <!-- Animated with typed Motion names, closes on an outside press -->
    <button nfsButton [nfsToggle]="help">Help</button>
    <div nfsDropdownPane #help="nfsDropdownPane"
         animate="fade-in fade-out" closeOnClick>...</div>

    <!-- Bounded by an ancestor that carries the application's own class -->
    <section class="account-box">
      <button nfsButton [nfsToggle]="boxMenu">More</button>
      <div nfsDropdownPane #boxMenu="nfsDropdownPane" size="tiny" parentClass="account-box">...</div>
    </section>

    <!-- A split button: the pane goes after the Button Group, never inside it -->
    <div nfsButtonGroup role="group" aria-label="Save">
      <button nfsButton (click)="save()">Save</button>
      <button nfsButton dropdown arrowOnly [nfsToggle]="saveMenu">
        <span nfsShowForSr>More save options</span>
      </button>
    </div>
    <div nfsDropdownPane #saveMenu="nfsDropdownPane">
      <button nfsButton size="small" (click)="saveAs()">Save as...</button>
    </div>

    <!-- Two-way binding, programmatic control, and lazy content -->
    <button nfsButton [nfsToggle]="details">Details</button>
    <div nfsDropdownPane #details="nfsDropdownPane" [(isOpen)]="detailsOpen">
      @defer (when details.isOpen()) {
        <app-heavy-details />
      }
    </div>
    <button type="button" (click)="details.open()">Show details</button>
  `,
})
export class AppHeader {
  protected readonly detailsOpen = signal(false);

  protected onFiltersClosed(reason: NfsDropdownPaneCloseReason): void {
    if (reason === 'sibling') {
      // another pane opened; keep the unsaved filter state
    }
  }
}
```

Application-wide defaults:

```ts
bootstrapApplication(App, {
  providers: [
    {provide: nfsDropdownPaneDefaultsToken, useValue: {closeOnClick: true, hoverDelay: 150}},
  ],
});
```

A size the consumer's Sass adds, with the 1.4.10 cap, `$dropdown-sizes: map-merge($dropdown-sizes, (xlarge: min(600px, 45vw)));`, reaches the type through the consumer's Variant declaration file, as the library's tooling generates it:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsDropdownSizesOverrides {
    xlarge: true;
  }
}
```

With it, `size="xlarge"` compiles and the editor offers it; `size="xlareg"` fails with the compiler's suggestion, and so does `size="xlarge"` in a program that leaves the file out (ADR 0040).

A pane inside a Reveal: Escape closes the pane first and leaves the dialog open; a bare `nfsClose` inside the pane closes the pane, not the Reveal.

```html
<dialog nfsReveal #signup="nfsReveal" aria-labelledby="signup-title">
  <h2 id="signup-title">Sign up</h2>
  <button nfsButton [nfsToggle]="terms">Terms</button>
  <div nfsDropdownPane #terms="nfsDropdownPane">
    ...
    <button nfsButton size="small" nfsClose>Close terms</button>
  </div>
</dialog>
```

The Reveal markup is defined by the [Spec: Reveal](../issues/18-spec-reveal.md).

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-dropdown` (`.dropdown-pane`'s `position: absolute`, closed and `.is-open` states, and the `$dropdown-sizes` classes), plus `foundation-button` for the usual `.button` Triggers. Its documented Sass is the `nfs-dropdown-pane` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-dropdown`.

1. Rules: none besides the Variant property of item 6. No library CSS rule styles the pane. The mixin holds one compile-time check that emits nothing: `@warn` when `$dropdown-width` or a value in `$dropdown-sizes` is a fixed `px` or `rem` length wider than 160px (`rem-calc()` above 10rem), naming the setting and the required `min(<width>, 45vw)` form. Reason: WCAG 2.2 success criterion 1.4.10; a fixed width over half of 320 CSS px can leave a pane with no fitting Placement at 320 px, and the Positioner does not shift or shrink panes. Calculations (`min()`, `calc()`) are skipped as deliberate.
2. Reuses the consumer's `$dropdown-width` and `$dropdown-sizes` and Foundation's `rem-calc()` (which reads `$global-font-size`). No parameter: the 160 px limit is half of WCAG's 320 CSS px, not a Foundation value, and the 45vw in the message is the library's recommendation.
3. Custom properties: none; placement is inline `top`/`left`.
4. Motion classes: none by default (Foundation has no Dropdown animation). With `animate`, the library's keyframe classes of the Motion names the consumer writes, for example `nfs-fade-in` and `nfs-fade-out` from `nfs-motion` for `animate="fade-in fade-out"`, or the consumer's own. The directive binds no Motion class under reduced motion, so `nfs-dropdown-pane` emits no `prefers-reduced-motion` override; `nfs-motion` keeps its own 1 ms override for its classes.
5. Missing include: nothing visible changes; the 1.4.10 warning is lost, so a consumer on Foundation's 300 px default is no longer told that panes can overflow at 320 px; `--nfs-dropdown-sizes` is absent, which the `strictVariantProperties` Runtime check reports in development, naming the include (D28), and the Variant declaration file's generator cannot list the consumer's sizes. A missing `foundation-dropdown` leaves the pane unpositioned and always visible, which the Positioner's development-mode `position` check reports.
6. Variant properties: `:root { --nfs-dropdown-sizes: tiny small large; }` on Foundation's defaults, the keys of `$dropdown-sizes` that generate a class, in Foundation's order, joined with spaces (Sass would print `map-keys()` with commas). `nfs-dropdown-pane` is its only writer. The required 1.4.10 settings change widths, not names, so they need no declaration.

Required settings for WCAG 2.2 AA (consumer's settings file, and the library's Storybook):

```scss
$dropdown-width: min(300px, 45vw);
$dropdown-sizes: (
  tiny: 100px,
  small: min(200px, 45vw),
  large: min(400px, 45vw),
);
```

### Platform features to adopt when the browser target moves

- `popover="auto"` with `popovertarget` or `commandfor` on the Triggers (Baseline widely available about 2026-10 to 2027-07): replaces Light dismiss for the pane with the same down-and-up outside rule, Escape as a close request, nesting by invoker, and one open at a time; the browser sets `aria-expanded` on the invoker. The pane moves to the top layer, which removes clipping by `overflow` ancestors and `z-index` stacking limits.
- CSS anchor positioning (`anchor-name`, `position-anchor`, `position-area`, `position-try-fallbacks`, `@position-try` in Foundation's order; Baseline 2026): replaces the Positioner. The body-box Collision bound has no CSS counterpart, and `position-try` can shift a pane into view, which would also retire the 1.4.10 width settings.
- `@starting-style` and `transition-behavior: allow-discrete`: CSS transitions on `display` for enter and leave, so the phases and the kept `.is-open` during leaving could go.
- Interest invokers (`interestfor`): declarative hover and focus opening with platform delays, replacing hover intent.
- `CloseWatcher`: the Android back gesture closes the topmost pane.

### Foundation behaviour changed or dropped

- `aria-haspopup="true"` becomes nothing (disclosure) or `"dialog"`; `aria-hidden` on the pane and the generated anchor id with automatic `aria-labelledby` are gone.
- Enter and Space work through native button activation; the dead `toggle` key command is not ported.
- Escape closes the topmost pane from anywhere and returns focus only when focus was inside; Foundation focused every anchor, and only while focus was on an anchor or the pane.
- Focus leaving a pane closes it; Foundation had no focus rule.
- Opening a pane closes other Dropdown panes but never an ancestor pane; Foundation's `closeme` closed parents too.
- A hover pane always keeps itself open while the pointer is over it (`hoverPane` dropped), never closes while it holds focus, ignores touch per event instead of `what-input`, and never moves focus on a hover open.
- `trapFocus` requires `role="dialog"` and moves focus into the pane; `autoFocus` ignores positive `tabindex` ordering.
- The position search runs on every open (Foundation stopped searching after one nothing-fits open); panes follow their Trigger through static scrolling containers.
- Legacy `.top/.left/.right/.bottom` and `.float-*` classes no longer change placement.
- `forceFollow`, `.is-opening`, `.hover` on anchors, `data-yeti-box`, `data-resize`, `data-is-focus`, the `tap` event, `ignoreMousedisappear`, the `click.zf.dropdown` namespace shared with Reveal, and `destroy()`'s inline `display: none` are gone.
- Foundation's 300 px default width, and its `small` and `large` sizes, must be capped by the consumer's settings for WCAG 1.4.10.
- The consumer writes no Foundation class: `.dropdown-pane` comes from the directive, the size class from `size`, the legacy position classes become `position`, and an open-at-first-paint pane is `[isOpen]="true"` instead of a copied `.is-open`; copied classes are reported in development. Motion names are written without the library's `nfs-` prefix, and `parentClass` names the consumer's own class (ADR 0039).
