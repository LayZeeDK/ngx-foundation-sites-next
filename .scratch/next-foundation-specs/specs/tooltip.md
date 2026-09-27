# Spec: Tooltip

Ticket: [Spec: Tooltip](../issues/27-spec-tooltip.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA.

## Problem Statement

A developer building an Angular application on Foundation for Sites wants a short description to appear next to a control when the user hovers or focuses it: "Fancy word for a beetle" beside a term, "Bottom Left" beside a button. Foundation's Tooltip plugin does this with jQuery: it reads the trigger's `title`, builds a `div.tooltip[role=tooltip]` at initialisation, appends it to `document.body`, positions it with inline offsets from Positionable, fades it in and out with jQuery, and closes the other tooltips through the window-level `closeme.zf.tooltip` broadcast. That design leaves problems an Angular library must not copy:

- The tip is created at initialisation and appended to `body`, which is node creation and node movement before hydration: the server HTML and the client DOM disagree, and every page pays for tips nobody opens.
- A hover-opened tip closes the instant the pointer leaves the trigger, so the pointer cannot reach it; Escape does nothing; a tip opened by a click stays until a click lands elsewhere, with no keyboard way to dismiss it. These fail WCAG 2.2 AA 1.4.13 (Content on Hover or Focus).
- Foundation's docs put the tip on a `span` made focusable with `tabindex="1"`: a positive tab index and a focusable element with no role, which the APG never shows and touch users cannot reach.
- The `title` is emptied at initialisation, so between page load and the first hover the trigger has no description at all for assistive technology, and without JavaScript the text is lost.
- `allowHtml` and `template` inject HTML strings (Foundation's own docs warn about XSS), `touchCloseText` is declared and never read, `disableForTouch` turns the tooltip off for a whole device when it has a touch screen, and the pip offsets (`tooltipHeight`, `tooltipWidth`) must be kept in sync with the Sass by hand.

A server-rendered Angular application adds more: nothing may be created, measured, or listened to before hydration, a focus that happens before hydration must still show the tip afterwards if focus is still there, and a hover before hydration must not open a stale tip.

## Solution

One attribute directive, `nfsTooltip`, on the interactive element the developer writes (a native `<button>`, a link, a form control), with the text as its value or taken from the element's `title`, exactly where Foundation's `data-tooltip` went. The directive adds Foundation's `.has-tip` class and nothing else to the server HTML: the text stays in `title` until the tip is first shown, so the description is present for assistive technology and for no-JavaScript users from the first byte.

The description is an element of its own: in its first client render callback after hydration the directive inserts a hidden internal `nfs-tooltip-description` (`role="tooltip"`, the text) as the trigger's next sibling and adds its id to the trigger's `aria-describedby`, after any static consumer value, so the description exists before any focus and never changes when the tip shows or hides. The visible tip is Foundation's `.tooltip` element, created by the directive the first time it is shown, after the description element, kept afterwards, and `aria-hidden="true"`; at its first show the directive moves the text off the `title` (as Foundation does). The tip is placed by the shared Positioner with Foundation's own formulas and Foundation's own pip classes, fades in and out with the library's `nfs-fade-in` and `nfs-fade-out` keyframe classes, and is hidden with `hidden` once closed.

The tip opens on hover after Foundation's 200 ms delay, at once on keyboard focus, and on a click that keeps it open (Foundation's `clickOpen`). It stays open while the pointer is over the trigger or the tip, closes when the pointer leaves both, when focus leaves the trigger, on a press outside, on Escape from anywhere, or when another tooltip opens. Every Foundation option that still means something is an input with Foundation's default; `showOn` asks the Breakpoint service. No library CSS is added beyond the shared keyframe classes.

## User Stories

1. As an application developer, I want to add a tooltip by writing `nfsTooltip` and a `title` on a button, so that Foundation's `data-tooltip` markup carries over with one attribute changed.
2. As an application developer, I want to give the text as the directive's value (`nfsTooltip="Fancy word for a beetle"` or a binding), so that I can translate it or change it at runtime.
3. As an application developer, I want the directive to add Foundation's `.has-tip` class to the trigger, so that my Foundation Sass settings for the trigger (`$has-tip-*`) apply as before.
4. As an application developer, I want the tip to be Foundation's `.tooltip` element with Foundation's `{position}` and `align-{alignment}` classes, so that the tip colours, padding, radius, maximum width, and pip from my Foundation settings apply unchanged.
5. As an application developer, I want the tip above the trigger and centred by default, as Foundation 6.9 does, so that migrating changes nothing visible.
6. As an application developer, I want Foundation's legacy `top`, `bottom`, `left`, `right` classes on the trigger to set the position, so that Foundation's documented markup keeps working.
7. As an application developer, I want all 12 explicit placements (`position` by `alignment`) with `vOffset` and `hOffset`, so that every Foundation positioning option keeps working.
8. As an application developer, I want a tip that does not fit to move to Foundation's next placement, so that it stays on screen.
9. As an application developer, I want `allowOverlap` and `allowBottomOverlap` with Foundation's tooltip defaults, so that collision handling behaves as before.
10. As an application developer, I want `tooltipHeight` and `tooltipWidth` to keep room for the pip, and to set them once for the application, so that a changed `$tooltip-pip-width` can be matched without touching every tooltip.
11. As an application developer, I want `hoverDelay`, `disableHover`, `clickOpen`, and `showOn` with Foundation's defaults, so that my Foundation configuration carries over.
12. As an application developer, I want to set application-wide defaults for every tooltip option, so that I can replace `Foundation.Tooltip.defaults`.
13. As an application developer, I want extra classes on the tip (`templateClasses`), so that I can style one tooltip differently without writing the tip myself.
14. As an application developer, I want `isOpen` as a two-way bindable model with `opened` and `closed` outputs after the fade, so that I can react to the tip being shown or hidden.
15. As an application developer, I want `open()`, `close()`, and `toggle()` methods and a separate button that toggles the tip through the Triggers, so that I can show a tip from code or from an info button.
16. As an application developer, I want a tooltip on a disabled button to keep working when the button uses `disabledInteractive`, so that I can tell users why the action is unavailable.
17. As an application developer, I want a tooltip on a link that navigates natively, even inside a deferred block, so that adding a tooltip never breaks a link.
18. As an application developer, I want my own `aria-describedby` on the trigger kept alongside the tip's, so that a help text and a tooltip can both describe a field.
19. As an application developer, I want a development-mode warning when I put a tooltip on something that is not an interactive element, so that I do not ship a tooltip keyboard and touch users cannot reach.
20. As an application developer, I want a development-mode warning when the tooltip text would be the trigger's only name, so that I give icon buttons an `aria-label`.
21. As an application developer, I want an empty text to switch the tooltip off, so that I can make a tooltip conditional without an extra input.
22. As a mouse user, I want the tip to appear after a short delay when I hover the trigger, so that tips do not flash while I move across the page.
23. As a mouse user, I want the tip to stay open while I move the pointer from the trigger onto the tip, so that I can read long text (WCAG 1.4.13, hoverable).
24. As a mouse user, I want the tip to stay open until I move away, press Escape, or click elsewhere, never on a timer, so that I can read it at my pace (WCAG 1.4.13, persistent).
25. As a mouse user, I want a click on the trigger to keep the tip open after I move the pointer away, so that Foundation's `clickOpen` behaviour carries over.
26. As a keyboard user, I want the tip to appear as soon as I tab to the trigger, so that I get the same information as mouse users.
27. As a keyboard user, I want the tip to close when I tab away, so that it never covers the control I move to (WCAG 2.4.11).
28. As a keyboard or mouse user, I want Escape to dismiss the tip wherever focus and the pointer are, and not reopen it until I come back, so that it stops covering content (WCAG 1.4.13, dismissible).
29. As a keyboard user inside a dialog, I want the first Escape to close the tip and the second to close the dialog, so that dismissing a tip never closes my dialog.
30. As a touch user, I want a tap on the trigger to show the tip and a tap elsewhere to hide it, so that the description is reachable without hover.
31. As a touch user on a laptop with a touch screen, I want hovering with the mouse to keep working, so that neither input breaks the other.
32. As a user, I want only one tooltip open at a time, so that tips do not pile up.
33. As a screen reader user, I want the trigger's description to be the tooltip text at every moment, before and after the first show, so that I hear it on first focus.
34. As a screen reader user, I want the tip announced as a description of the trigger, never as its name and never as a popup, so that the control's name and role stay what they are.
35. As a user who prefers reduced motion, I want the tip to appear and disappear without a visible fade, so that nothing animates.
36. As a user on a small screen, I want tips limited to the breakpoints the developer allows (`showOn`), so that they do not cover content where there is no room.
37. As a user without JavaScript, I want the browser's own tooltip from the `title`, so that the text is not lost.
38. As a developer of a server-rendered application, I want no tip in the server HTML and nothing measured or listened to before hydration, so that hydration never mismatches.
39. As a developer of a server-rendered application, I want a keyboard focus made before hydration to show the tip after hydration if focus is still there, and a hover before hydration to show nothing stale, so that early interaction behaves sensibly.
40. As a developer using incremental hydration, I want to know which hydrate triggers show a tooltip on the first hover, so that I choose the right trigger.
41. As a developer with many tooltips on a page, I want closed tooltips to hold no observers, no document listeners, and no tip element until first shown, so that the page stays fast.
42. As a library maintainer, I want the rules asserted where they live: interactions in stories, timers and replay in browser-level tests, server HTML in node-level tests, and real engines in e2e, so that a regression shows at the layer that owns it.

## Implementation Decisions

### Foundation contract

Foundation 6.9's Tooltip extends Positionable. The option list is `Tooltip.defaults` in the plugin source (the inventory's table), not the charting ticket's list.

| Foundation option (`data-*`) | Default | Meaning in 6.9 | Library |
| --- | --- | --- | --- |
| `hoverDelay` | `200` | Delay before showing on `mouseenter`; hide on `mouseleave` is immediate | Input, `openDelay` of `nfsHoverIntent`; the close delay is the helper's 100 ms floor |
| `disableHover` | `false` | Bind no `mouseenter`/`mouseleave` | Input, `enabled` of `nfsHoverIntent` |
| `disableForTouch` | `false` | On a touch-capable device bind no events at all | Input, changed meaning: a touch press never opens the tip; mouse and keyboard keep working on the same device |
| `clickOpen` | `true` | A `mousedown` opens the tip and keeps it open until a click elsewhere | Input: a pointer click on the host opens the tip and pins it |
| `showOn` | `'small'` | Minimum breakpoint for `show()`; `'all'` skips the check | Input, a Breakpoint query answered by the Breakpoint service's `is()` at open time |
| `tipText` | `''` | Tip text; falls back to `title` | The directive's own value (`nfsTooltip`, property `tipText`) |
| `position` | `'auto'` | `left`, `right`, `top`, `bottom`; `auto` reads the trigger's legacy class, else `top` | Input, Positioner `position`; `auto` keeps the legacy-class rule (static `class` only) |
| `alignment` | `'auto'` | `auto` is `center` | Input, Positioner `alignment`, `autoAlignment: 'center'` |
| `vOffset`, `hOffset` | `0` | Extra distance in px | Inputs, Positioner |
| `allowOverlap` | `false` | Skip the collision search | Input, Positioner |
| `allowBottomOverlap` | `false` | Ignore the bottom bound (Tooltip differs from Dropdown) | Input, Positioner, default `false` |
| `tooltipHeight`, `tooltipWidth` | `14`, `12` | Added to `vOffset` (top/bottom) or `hOffset` (left/right) for the pip | Inputs, Positioner `pip` |
| `templateClasses` | `''` | Extra classes on the generated tip | Input, bound on the tip beside `.tooltip` |
| `fadeInDuration`, `fadeOutDuration` | `150`, `150` | jQuery `fadeIn`/`fadeOut` durations | Dropped: CSS owns timing (the `nfs-motion` duration) |
| `tooltipClass` | `'tooltip'` | Base class of the tip | Dropped: `.tooltip` is the contract |
| `triggerClass` | `'has-tip'` | Class added to the trigger | Dropped: `.has-tip` is the contract and is always added |
| `template` | `''` | HTML string replacing the generated tip | Dropped: HTML strings; the tip is the library's |
| `allowHtml` | `false` | `.html()` instead of `.text()` | Dropped: text only (interpolation); rich or interactive content belongs in a Dropdown pane |
| `touchCloseText` | `'Tap to close.'` | Declared, never read by any code | Dropped: dead in Foundation |

Events: `show.zf.tooltip` (fired synchronously in `show()`, before the fade) becomes the `opened` Completion output after the fade-in; `hide.zf.tooltip` (fired as the fade-out starts) becomes `closed` after the fade-out; `closeme.zf.tooltip` becomes the Light dismiss sibling group `'nfs-tooltip'`; `init.zf.tooltip` and `destroyed.zf.tooltip` have no counterpart. Methods: `show()`, `hide()`, `toggle()` become the Openable's `open()`, `close()`, `toggle()` (building-blocks 1.3); `destroy()` is Angular's lifecycle.

Foundation's trigger attributes set at initialisation (`title=""`, `aria-describedby` reusing an existing value as the tip id, `data-yeti-box`, `data-toggle`, `data-resize`) and its tip attributes `data-is-active` and `data-is-focus` are not reproduced, while the tip's `aria-hidden` stays `true` instead of switching to `false` while shown; the counterparts are in the ARIA table.

### CSS class to Angular mapping

| Foundation class | Element | Bound by | When |
| --- | --- | --- | --- |
| `.has-tip` (Structural class of the trigger) | The consumer's interactive element | `NfsTooltip` static host class | Always, server included |
| `top`, `bottom`, `left`, `right` (legacy) | The consumer's element | The consumer; read by `NfsTooltip` | Static `class` only, as the `position: 'auto'` default |
| `.tooltip` (Structural class of the tip) | `nfs-tooltip-tip` | `NfsTooltipTip` static host class | From creation |
| `{position}`, `align-{alignment}` (pip classes) | The tip | `NfsTooltipTip`, from the Positioner's `placement` | From the first placement; kept after close |
| `templateClasses` value | The tip | `NfsTooltipTip` | From creation |
| `nfs-fade-in`, `nfs-fade-out` (Motion classes) | The tip | `NfsTooltipTip` | While entering or leaving |

Foundation has no State class for a shown tip (its JavaScript wrote inline `display`); the shown state is the absence of `hidden`, and the Motion classes are bound only during the animation phases, the Toggler's State class mechanism (ADR 0003).

### Hierarchy and DI shape

```
ngx-foundation-sites/tooltip  (secondary entry point)
  [nfsTooltip]  NfsTooltip           the directive on the trigger; the Openable
      provides nfsOpenableToken (useExisting), nfsTooltipToken (internal, useExisting)
      injects  nfsTooltipDefaultsToken (optional), NfsMediaQuery, _IdGenerator,
               ViewContainerRef, HostAttributeToken('title' | 'class' | 'aria-describedby')
      calls    nfsLightDismiss(), nfsHoverIntent()   (Anchored pane utility)
    creates in its first client render callback, via its ViewContainerRef, as the host's next sibling:
    nfs-tooltip-description  NfsTooltipDescription   internal component, not public API (hidden, role tooltip, the text)
    creates on first show, via its ViewContainerRef, after the description element, then keeps:
    nfs-tooltip-tip  NfsTooltipTip   internal component, not public API
      injects  nfsTooltipToken (the directive, through the container's injector)
      calls    nfsPositioner()    (the placed element is the tip)
```

- The Openable contract: `NfsTooltip` provides `nfsOpenableToken` with `useExisting`, so Triggers with an explicit reference (`[nfsToggle]="tip"` with `#tip="nfsTooltip"`) operate it. Its Trigger role is `'none'`. A bare `nfsClose` or `nfsToggle` on the tooltip's own host resolves past it (`skipSelf`, Triggers spec), so a close button with a tooltip inside a Reveal still closes the Reveal.
- `nfsTooltipToken`: an internal lightweight `InjectionToken` typed by an interface in a type-only token file, provided by the directive, injected by the tip. A component created through a `ViewContainerRef` gets the container's element injector, which holds the directive's providers, so no injector is passed. The token breaks the import cycle between directive and tip; it is not exported from the entry point.
- `nfsTooltipDefaultsToken`: `InjectionToken<NfsTooltipDefaults>`, all-optional Shape B, injected with `{optional: true}` to seed every input's default (building-blocks 1.4); provided at bootstrap, route, or element level, nearest wins.
- No parent or child directives, no content projection: the trigger's own content stays the consumer's.
- Entry point `ngx-foundation-sites/tooltip` imports the Triggers token, the Anchored pane utility, and the Breakpoint service; a consumer's `@defer` can split it.

### API

```ts
interface NfsTooltipDefaults {
  hoverDelay?: number;
  disableHover?: boolean;
  disableForTouch?: boolean;
  clickOpen?: boolean;
  showOn?: string;
  position?: NfsPosition | 'auto';
  alignment?: NfsAlignment | 'auto';
  vOffset?: number;
  hOffset?: number;
  allowOverlap?: boolean;
  allowBottomOverlap?: boolean;
  tooltipHeight?: number;
  tooltipWidth?: number;
  templateClasses?: string;
}
const nfsTooltipDefaultsToken: InjectionToken<NfsTooltipDefaults>;

class NfsTooltip implements NfsOpenable {   // selector [nfsTooltip], exportAs 'nfsTooltip'
  readonly tipText: InputSignal<string>;     // alias 'nfsTooltip'; '' falls back to the static title
  readonly isOpen: ModelSignal<boolean>;     // default false
  readonly id: Signal<string>;               // the tip's id, generated
  readonly triggerRole: Signal<'none'>;
  readonly opened: OutputRef<void>;
  readonly closed: OutputRef<void>;
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;             // result ignored
  toggle(trigger?: HTMLElement): void;
  registerTrigger(trigger: HTMLElement): () => void;
  // plus the Option inputs in the table below
}
```

| Member | Kind | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `tipText` (alias `nfsTooltip`) | `input()` | `string` | `''` | `data-tip-text`, else `title` | One input for both: a non-empty value wins, otherwise the static `title`; Material's `matTooltip` shape; empty text disables the tooltip |
| `position` | `input()` | `NfsPosition \| 'auto'` | token, else `'auto'` | `data-position` | `auto` = the first `top`/`bottom`/`left`/`right` token of the host's static `class`, else `top` (Foundation's rule, static class only) |
| `alignment` | `input()` | `NfsAlignment \| 'auto'` | token, else `'auto'` | `data-alignment` | `auto` = `center` |
| `vOffset`, `hOffset` | `input()`, `numberAttribute` | `number` | token, else `0` | `data-v-offset`, `data-h-offset` | Negative values warn in dev mode (Positioner; WCAG 2.4.11) |
| `allowOverlap` | `input()`, `booleanAttribute` | `boolean` | token, else `false` | `data-allow-overlap` | None |
| `allowBottomOverlap` | `input()`, `booleanAttribute` | `boolean` | token, else `false` | `data-allow-bottom-overlap` | None |
| `tooltipHeight`, `tooltipWidth` | `input()`, `numberAttribute` | `number` (px) | token, else `14`, `12` | `data-tooltip-height`, `data-tooltip-width` | None; the Defaults token sets them once |
| `hoverDelay` | `input()`, `numberAttribute` | `number` (ms) | token, else `200` | `data-hover-delay` | Leaving closes after 100 ms, not at once (WCAG 1.4.13) |
| `disableHover` | `input()`, `booleanAttribute` | `boolean` | token, else `false` | `data-disable-hover` | None |
| `disableForTouch` | `input()`, `booleanAttribute` | `boolean` | token, else `false` | `data-disable-for-touch` | Per press, not per device: only a touch press is ignored |
| `clickOpen` | `input()`, `booleanAttribute` | `boolean` | token, else `true` | `data-click-open` | A pointer click opens and pins; a keyboard activation of the host changes nothing |
| `showOn` | `input()` | `string` (Breakpoint query) | token, else `'small'` | `data-show-on` | Grammar of the Breakpoint service (`'medium'`, `'medium up'`, `'large only'`, `'medium down'`, `'all'`) |
| `templateClasses` | `input()` | `string` | token, else `''` | `data-template-classes` | Classes on the tip beside `.tooltip` |
| `isOpen` | `model()` | `boolean` | `false` | `isActive` (internal) | Two-way; `true` from an accepted open request to a close request (Openable contract) |
| `isOpenChange` | output (from the model) | `boolean` | | None | At request time, before the fade |
| `opened` | `output()` | `void` | | `show.zf.tooltip` | Completion output after the fade-in |
| `closed` | `output()` | `void` | | `hide.zf.tooltip` | Completion output after the fade-out, once `hidden` is set |
| `id` | read-only signal | `string` | `_IdGenerator` id, prefix `nfs-tooltip-` | Generated tip id | Openable contract member; not an input (the tip exists only on the client, so no stable id is needed) |
| `triggerRole` | read-only signal | `'none'` | constant | None | Triggers render no ARIA for a tooltip |
| `open(trigger?)` | method | | | `show()` | Subject to the text and `showOn` checks; pins the tip; `trigger` is not the anchor (the host always is) |
| `close(result?)` | method | | | `hide()` | Unpins; `result` ignored |
| `toggle(trigger?)` | method | | | `toggle()` | `isOpen() ? close() : open(trigger)` |
| `registerTrigger(trigger)` | method | | | None | Called by Triggers; presses on a registered Trigger count as inside for Light dismiss, so an info button toggles instead of closing and reopening; registered Triggers are not part of the Hover region |

Behaviour rules:

- Text: `text = tipText() !== '' ? tipText() : staticTitle ?? ''`, where `staticTitle` is read once with `inject(new HostAttributeToken('title'), {optional: true})`. A bound `[title]` or `[attr.title]` on the host is not supported (the directive owns the host's `title`); dynamic text goes through `nfsTooltip`. An empty text is the off switch: open requests are ignored, and the tip is shown only while the text is non-empty, so clearing the text while open hides the tip (and emits `closed`) while `isOpen` keeps the requested value.
- `title` and `aria-describedby`: the host binds `title` to the text until the tip is first shown (server HTML included) and removes it in the pass that shows the tip. In the first client render callback in which the text is non-empty (an `afterRenderEffect` on the text, `write` phase, creating once), the directive creates `nfs-tooltip-description` through its `ViewContainerRef` at index 0; from the next pass the host's `aria-describedby` is the consumer's static value followed by that element's id while the text is non-empty; an empty text drops the id, and the element is destroyed with the directive. From then on the description is that element's text (`aria-describedby` is the first applicable description source, HTML-AAM), in every engine and before any focus; the tip is `aria-hidden="true"` and never a description source, so showing, hiding, and Escape change no description (measured in Chromium and Firefox, [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)). The element sits beside its host, so it is inert, in the top layer, or pruned exactly when the host is: inside a modal `<dialog>`, inside an Off-canvas panel under its Modal inert set, and inside any consumer `inert` subtree. A consumer's static `aria-describedby` (read with `HostAttributeToken`) is kept first; a dynamic consumer binding of the same attribute loses to the directive's (Angular's host-binding rule) and is not supported. Inside a block that never hydrates, the host keeps `title` as its description.
- Open sources, all through one internal open path that checks the text and `is(showOn())` first:
  1. Hover: `nfsHoverIntent` on the host, mouse and pen only, after `hoverDelay`, unless `disableHover`.
  2. Keyboard focus: a `focusin` host listener opens at once when `document.activeElement` is the host and the host matches `:focus-visible`. The live check makes a replayed `focusin` safe; `:focus-visible` keeps a mouse click that focuses the host from opening through focus (the click rule decides that).
  3. Press: a `click` listener added in code opens and pins the tip when `clickOpen` is on, the click came from a pointer (`event.detail > 0`), and not from touch while `disableForTouch` is on (the pointer type of the host's last `pointerdown`, recorded by a second code-added listener, because `click` is not a `PointerEvent` in every target browser). A click on an already open tip pins it; it never toggles it closed, because the host's click is the host's own action.
  4. Programmatic: `open()`, `toggle()`, a Trigger, or a model write. `open()` and `toggle()` pin; a direct model write (`[isOpen]="true"`, `isOpen.set(true)`) bypasses the text and `showOn` checks, because the consumer asked for it explicitly.
- Close sources: Escape (Light dismiss, topmost entry, from anywhere); a pointer press outside the host, the tip, and the registered Triggers (Light dismiss pointer rule, always on for tooltips); focus moving to an element outside (Light dismiss focus rule); a `focusout` host listener when focus leaves the host for anything outside the host and the tip, including the page body and another window (the case the focus rule cannot see, because no `focusin` follows); the pointer leaving the Hover region, after 100 ms, unless the tip is pinned or the host still matches `:focus-visible`; another tooltip opening (sibling group `'nfs-tooltip'`); `close()`, `toggle()`, a Trigger, or a model write.
- Utility calls, in the directive's injection context, as the Anchored pane spec defines them: `nfsHoverIntent` with the host as the one Trigger (registered Triggers are not part of the Hover region), the tip as the pane, `enabled` = `!disableHover()`, `isOpen`, `openDelay` = `hoverDelay()`, a `closeDelay` of 0 (the helper's 100 ms floor applies), an `open` callback into the internal open path, and a `close` callback that skips a pinned or keyboard-focused tip; `nfsLightDismiss` with `isOpen` (the shown state), the tip as the pane, the host plus the registered Triggers as `triggers`, group `'nfs-tooltip'`, `outsidePress` left at its default (on), and the internal close.
- Pinned: set by a press or a programmatic open, cleared by every close. It only stops the hover-leave close; Escape, outside presses, and focus leaving still close a pinned tip, which is Foundation's "until you click somewhere else" plus the WCAG 1.4.13 dismissal.
- `showOn` is checked when an open is requested, as Foundation does; a breakpoint change while open does not close the tip. Below `showOn` the tip is never created, so the host keeps its `title` and a mouse user sees the browser's own tooltip there.
- Anchor: always the host. `open(trigger)` does not move the tip to an external Trigger, because the tip describes its host.
- Focus: the directive never moves focus, and the tip is never focusable (APG: "Tooltip widgets do not receive focus"). Light dismiss's focus return on `'keydown'` does not apply, because focus is never inside the tip.
- Development-mode checks, in one `afterNextRender` that exists only under `ngDevMode`, each warning once per instance:
  1. Host not interactive: not a native `button`, `a[href]`, `input` (other than `hidden`), `select`, `textarea`, or `summary`, and without an interactive ARIA role (`button`, `link`, `checkbox`, `radio`, `switch`, `tab`, `menuitem`, `option`, `combobox`, `textbox`, `searchbox`, `slider`, `spinbutton`, `treeitem`, `gridcell`). The message names the defined-term recipe (Further Notes).
  2. Host not focusable (`InteractivityChecker.isFocusable` false): a natively disabled button gets "use `disabledInteractive` so the tooltip stays reachable"; anything else gets "keyboard users cannot reach this tooltip".
  3. No text: no `nfsTooltip` value and no static `title` at first render.
  4. No name of its own: a form control with no associated `label`, `aria-label`, or `aria-labelledby`, or another host with no text content, no `aria-label`/`aria-labelledby`, and no descendant with a non-empty `alt` or `aria-label`: "the tooltip is a description, not a name".
  5. The host sits inside a `label`: the tip is inserted into the label, so a press on the tip is a press on the label (the tip is `aria-hidden` and the description element `hidden`, so neither joins the label's name).
  The Positioner adds its own three (same-axis alignment, negative offsets, tip not `position: absolute`).

`NfsTooltipTip` (internal): selector `nfs-tooltip-tip`, template `{{ text() }}` (text node only, never HTML), host `class="tooltip"`, `aria-hidden="true"`, `[attr.id]`, `[hidden]`, `[class]` for the pip classes, `templateClasses`, and the Motion classes, and `(animationend)`/`(animationcancel)` host listeners that report to the directive. It reads text, options, and phase from `nfsTooltipToken` and calls `nfsPositioner` with its own host as the placed element.

`NfsTooltipDescription` (internal): selector `nfs-tooltip-description`, template `{{ text() }}` (text node only), host `hidden`, `role="tooltip"`, `[attr.id]` (a second `_IdGenerator` id, prefix `nfs-tooltip-desc-`); it reads the text from `nfsTooltipToken`. Why this single plain element is a component and not consumer markup, a platform feature, or a `Renderer2` node: D1.

### Implementation level and primitives

Implementation level: custom Angular with platform measurement (ADR 0002). Native first: `popover="hint"` with CSS anchor positioning and interest invokers is the platform version of this plugin, and none of it is in the browser target (`popover` is Baseline 2024 with Firefox 125 and iOS 18.3; `hint` has no WebKit release; anchor positioning is Baseline 2026). `@angular/aria` 22.2 has no tooltip pattern. From `@angular/cdk`: `_IdGenerator` for the tip id, `InteractivityChecker` for the development check, and, through the Anchored pane utility, `Directionality` and `hasModifierKey`. CDK Overlay is not used: the anchored pane prototype measured it moving the `.tooltip` 209 to 254 px in 5 placements and replacing its `max-width`.

Primitives: `input()` with `numberAttribute`/`booleanAttribute`, `model()`, `output()`, `computed()`, one `linkedSignal` for the animation phase, `inject()` with `HostAttributeToken`, `ViewContainerRef.createComponent`, host metadata for the class, the `title` and `aria-describedby` bindings, and the `focusin`/`focusout` listeners, `Renderer2.listen` for the code-added `click` and `pointerdown` listeners, `:focus-visible` through `Element.matches`, `document.activeElement`, the Anchored pane utility (`nfsPositioner`, `nfsLightDismiss`, `nfsHoverIntent`), `NfsMediaQuery.is()`, and `NgZone.runOutsideAngular` for the animation fallback timer. All are in the browser target (`:focus-visible` since Safari 15.4).

Fallback: none needed. The placement and dismissal mechanics are the Anchored pane utility's, confirmed by the [Prototype: Anchored pane positioning, measured Positionable port versus CDK Overlay](../issues/44-prototype-anchored-pane.md), which also created the tip through the directive's `ViewContainerRef` as the trigger's next sibling; the keyframe State class path is confirmed by the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md).

Render hooks (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Description element | `afterRenderEffect` on the text, `write` phase; creates once | Client only, after hydration and before any focus; never on the server |
| Tip creation | `afterRenderEffect`, `write` phase, tracking the shown state; creates once and never again | Structure is created only in a render callback, so never on the server or before hydration, whatever set `isOpen` (a handler, a method, a bound model); `effect` is ruled out because it runs on the server and must not write the DOM. A sequence registered by a component with a view is added when that view is refreshed (the after-render manager's `register`), so the tip's own Positioner runs in the same `ApplicationRef.tick()` and the tip is placed before its first painted frame; Aria's `DeferredContent` creates views from `afterRenderEffect` the same way |
| Completion (measure the Motion class, fallback timer, emit `opened`/`closed`) | `afterRenderEffect`, `read` phase after the class is bound | Computed `animation-*` is a layout-free style read that must follow the class write; re-runs only when the phase changes |
| Code-added `click` and `pointerdown` listeners | `afterNextRender` | Attached once on the client after the first render, removed through `DestroyRef`; never replayed, never on the server |
| Development checks | `afterNextRender` under `ngDevMode` | One-shot DOM inspection, removed in production |
| Placement | `afterRenderEffect` inside `nfsPositioner` (tip) | The utility's contract |
| Light dismiss entry and hover listeners | `afterRenderEffect` inside `nfsLightDismiss` and `nfsHoverIntent` (directive) | The utility's contract; the entry is added only once the tip exists |
| `effect` | Not used | No non-DOM side effect exists |
| `afterEveryRender` | Not used | It would run after every change detection in the application for every tooltip on the page |

Loading: eager. `injectAsync` does not apply: it resolves an auto-provided service token from a dynamic import, and the tip is a component, so lazy loading it would be a bare dynamic `import()` on first show. That would delay the first tip by a chunk fetch after `hoverDelay` (or after a keyboard focus, which shows at once), the `title` removal would no longer land in the render pass that shows and places the tip, the tip is a few lines of template, and the whole plugin already sits in its own entry point for a consumer's `@defer`. The Anchored pane utility is eager for the same reasons (its spec, D20).

### Comparison with Angular Material

| Concern | `matTooltip` | `nfsTooltip` |
| --- | --- | --- |
| Shape | Directive on the trigger; `mat-tooltip-component` rendered in a CDK overlay | Directive on the trigger; internal `nfs-tooltip-tip`, placed in place by the Positioner, after the hidden `nfs-tooltip-description` that is the trigger's next sibling |
| Text | `matTooltip` message string | `nfsTooltip` string, else the static `title` (Foundation) |
| Off switch | `matTooltipDisabled` | Empty text |
| Positions | `above`, `below`, `left`, `right`, `before`, `after`; `positionAtOrigin` | Foundation's 12 physical placements plus offsets; no logical `before`/`after` (Foundation's docs keep `right` physical in RTL); no follow-the-pointer |
| Delays | `showDelay`/`hideDelay`, defaults 0/0 from `MAT_TOOLTIP_DEFAULT_OPTIONS` | `hoverDelay` 200; hide after 100 ms (the Hover region floor); keyboard focus shows at once |
| Touch | `touchGestures` `auto`/`on`/`off`, long press shows | A tap shows and pins (`clickOpen`); `disableForTouch` ignores touch presses; hover ignores touch pointers per event |
| Keyboard focus | `FocusMonitor` origin `keyboard` shows | `focusin` plus `:focus-visible` and a live-focus check |
| Click | No click behaviour | `clickOpen` pins on a pointer click |
| Hoverable | Interactive by default; `disableTooltipInteractivity` option | Always hoverable (WCAG 1.4.13) |
| Escape | Closes, no modifiers | Light dismiss: closes the topmost entry, no modifiers, from anywhere |
| Description | `aria-describedby` to a hidden copy kept by `AriaDescriber`; the visible bubble is `aria-hidden` | `title` until the first client render callback, then `aria-describedby` to a hidden `role="tooltip"` element beside the host (Material's hidden copy, kept beside the host instead of in `AriaDescriber`'s `body` container); the visible tip is `aria-hidden` |
| Methods | `show(delay?)`, `hide(delay?)`, `toggle()` | `open()`, `close()`, `toggle()` (Openable vocabulary, building-blocks 1.3) |
| Outputs | None | `isOpenChange`, `opened`, `closed` |
| Extra classes | `matTooltipClass` (string, array, set, map) | `templateClasses` (string, Foundation's option) |
| Defaults | `MAT_TOOLTIP_DEFAULT_OPTIONS` | `nfsTooltipDefaultsToken` (Shape B) |
| Animation | Keyframes 150/75 ms on the bubble, `animationend` | `nfs-fade-in`/`nfs-fade-out` keyframes at the `nfs-motion` duration, `animationend` plus a measured fallback timer |
| Server | Nothing rendered | Host with `.has-tip` and `title`; no tip |

Borrowed: the directive-plus-internal-component shape, the string input under the selector name, keyboard-origin opening, Escape without modifiers, a defaults token, `toggle()`, an always-present description, the hidden copy, `aria-hidden` on the visible tip. Not borrowed: the overlay, logical positions, `positionAtOrigin`, long-press gestures.

### ARIA and keyboard

APG pattern: Tooltip (work in progress, no task force consensus, no example; the spec treats its rules as the minimum). WAI-ARIA: `tooltip` is "a contextual popup that displays a description for an element", referenced through `aria-describedby` "before or at the time the tooltip is displayed", named from content, never focusable, and not a popup for `aria-haspopup`.

| Element | Attribute or state | Value | When |
| --- | --- | --- | --- |
| Host | `title` | The text | Until the tip is first shown (server HTML included); removed in the pass that shows the tip |
| Host | `aria-describedby` | The consumer's static value, then the description element's id | From the pass after the first client render callback, while the text is non-empty; never in server HTML, never pointing at a missing element |
| Host | `aria-expanded`, `aria-haspopup`, `aria-controls` | Never | Trigger role `'none'`: a tooltip is not a popup, and Triggers that toggle it render nothing either |
| Tip | `aria-hidden` | `true` | From creation |
| Tip | `id` | Generated `nfs-tooltip-...` | From creation |
| Tip | `hidden` | Present | While closed and no leave animation runs |
| Tip | `aria-label`, `aria-labelledby`, `tabindex` | Never | The tip is `aria-hidden` and has no role, so a name would reach no assistive technology; never focusable |
| Description element | `role` | `tooltip` | Static |
| Description element | `hidden` | Present | Always |
| Description element | `id` | Generated `nfs-tooltip-desc-...` | From creation |

| Key or input | Where | Behaviour | Owner |
| --- | --- | --- | --- |
| Tab, Shift+Tab onto the host | Keyboard | Shows the tip at once | `focusin` (`:focus-visible`) |
| Tab, Shift+Tab away | Keyboard | Closes | `focusout`, Light dismiss focus rule |
| Escape | Anywhere, while open | Closes the tip (the topmost Light dismiss entry); focus stays; the tip returns only after focus leaves and comes back or the pointer re-enters | Light dismiss |
| Enter, Space on the host | Keyboard | The host's own action; the tooltip is unchanged | Native |
| Pointer enters the host | Mouse, pen | Shows after `hoverDelay`, unless `disableHover` | Hover intent |
| Pointer leaves the host and the tip | Mouse, pen | Closes after 100 ms, unless pinned or keyboard-focused | Hover intent |
| Pointer click on the host | Mouse, pen, touch | Shows and pins when `clickOpen` (touch ignored with `disableForTouch`) | Code-added `click` |
| Press outside host, tip, and registered Triggers | Any pointer | Closes | Light dismiss |
| Another tooltip opens | | Closes this one | Light dismiss sibling group |

Focus rules: focus stays on the host while the tip shows (APG); a tip opened by focus closes when focus leaves (APG "dismissed when it no longer has focus"); a tip opened by hover stays while the pointer is over the host or the tip (APG). Hosts must be interactive elements (development warning otherwise); positive `tabindex` from Foundation's docs is dropped.

### WCAG 2.2 AA requirements

Requirements, not recommendations. The story gate runs axe with the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`; ADR 0018), with the tip open as well as closed, so axe's `color-contrast`, `target-size`, and ARIA rules check the tip and its host; criteria axe cannot judge are asserted in play functions and e2e.

| Criterion | Requirement for Tooltip | Foundation default and what makes it pass |
| --- | --- | --- |
| 1.4.13 Content on Hover or Focus | Dismissible: Escape closes the tip from anywhere without moving pointer or focus, and it does not reopen until the pointer re-enters or focus returns. Hoverable: the tip is part of the Hover region, and leaving closes only after 100 ms, so the pointer can cross the pip gap. Persistent: no auto-hide; the tip stays until the pointer leaves the region, focus leaves, Escape, an outside press, or another tooltip opens | Foundation fails all three (immediate close on `mouseleave`, no Escape, nothing bound to the tip). Met by the Anchored pane utility's guarantees plus this spec's close rules. The browser's own `title` tooltip before the first show is exempt (its presentation is controlled by the user agent) |
| 1.4.3 Contrast (Minimum) | The tip text meets 4.5:1 against the tip background | Foundation's defaults pass: `$tooltip-color` (`$white`, `#fefefe`) on `$tooltip-background-color` (`$black`, `#0a0a0a`) is about 19.6:1. Consumer settings are gated by axe's `color-contrast` rule in the stories, which render the tip open under the consumer-compiled CSS; no compile-time check is needed because axe covers text contrast |
| 1.4.11 Non-text Contrast | Not applicable to the tip: it is not a user interface component and shows no state. The host's boundaries and focus indicator belong to the host's own spec (Button) | For reference, `.has-tip`'s dotted border (`$dark-gray`, `#8a8a8a`) is about 3.4:1 on white |
| 2.4.7 Focus Visible | The host keeps a visible focus indicator | Passes with Foundation's defaults: `.has-tip` sets no outline, and Foundation removes outlines only under what-input's mouse and touch attributes, which the library never loads |
| 2.4.11 Focus Not Obscured (Minimum) | The tip never covers its focused host, and never stays over a control that receives focus | Every placement puts the tip beside the host for non-negative offsets (development warning below 0); focus leaving the host closes the tip, and the Light dismiss focus rule closes a hover-opened tip when focus moves anywhere else. A hover-opened tip that sits over a control focused earlier is dismissed with Escape without moving focus |
| 2.5.8 Target Size (Minimum) | Not applicable to the tip: it is not a target (not operable, not focusable; the pointer over it only keeps it open). The host's size is the host's own | The directive adds no target and does not shrink the host; `.button` hosts pass (Button spec); inline links in a sentence meet the inline exception |
| 4.1.2 Name, Role, Value | The host keeps its own name and role; the tooltip text is its description, never its name; the hidden description element has role `tooltip`, named from content, and the visible tip is `aria-hidden`; no host carries `aria-expanded` or `aria-haspopup` for a tooltip | Foundation blanked `title` at initialisation, which removed the name of icon-only triggers named by `title`; here the development check reports a host with no name of its own. `aria-describedby` is bound from the first client render callback, to the hidden description element |
| 1.3.1 Info and Relationships | The relation is programmatic at every moment: `title` in server HTML and until the first client render callback, `aria-describedby` from then on | By construction |
| 2.1.1 Keyboard, 2.1.2 No Keyboard Trap | Every tip is reachable by keyboard focus on its host; the tip never takes focus | Interactive hosts only (development warnings 1 and 2); `disabledInteractive` keeps a disabled button focusable |
| 1.4.10 Reflow, 1.4.4 Resize Text, 1.4.12 Text Spacing | The tip fits a 320 px viewport and grows with text and spacing | `$tooltip-max-width` 10rem wraps text; the tip has no fixed height; the Positioner picks a placement with no spill-over whenever one exists. The documented clipping limit (below) is the consumer's layout |
| 3.2.1 On Focus | Showing a tip on focus is not a change of context | No navigation, no focus move, no new window |
| 2.2.1 Timing Adjustable | No time limit | No auto-hide timer |

Reduced motion is honoured on top of AA (Animation below).

### Rendered HTML

Directive attributes (`nfstooltip`, `nfsbutton`) and static input attributes stay in the DOM and are omitted below for brevity. Server HTML carries `jsaction="focusin:;focusout:;"` on the host (the event-replay annotation for the two host listeners) and the `ViewContainerRef` anchor comment after it; the code-added `click` and `pointerdown` listeners add no annotation. Generated ids exist only on the client.

```html
<!-- Consumer markup: a defined term (a button host, Foundation's .has-tip look) -->
The <button type="button" nfsTooltip title="Fancy word for a beetle.">scarabaeus</button> hung quite clear of any branches.

<!-- server, and during hydration -->
The <button type="button" title="Fancy word for a beetle." class="has-tip" jsaction="focusin:;focusout:;">scarabaeus</button><!--container--> hung ...

<!-- hydrated, after the first client render callback, before the first show -->
The <button type="button" title="Fancy word for a beetle." class="has-tip" aria-describedby="nfs-tooltip-desc-a1b2-0">scarabaeus</button><nfs-tooltip-description hidden="" role="tooltip" id="nfs-tooltip-desc-a1b2-0">Fancy word for a beetle.</nfs-tooltip-description><!--container--> hung ...

<!-- hydrated, first show by hover (default top-center), while the fade-in runs; inline offsets from the Positioner -->
The <button type="button" class="has-tip" aria-describedby="nfs-tooltip-desc-a1b2-0">scarabaeus</button>
<nfs-tooltip-description hidden="" role="tooltip" id="nfs-tooltip-desc-a1b2-0">Fancy word for a beetle.</nfs-tooltip-description>
<nfs-tooltip-tip aria-hidden="true" id="nfs-tooltip-a1b2-0" class="tooltip nfs-fade-in top align-center"
                 style="top: -57.19px; left: 0.75px;">Fancy word for a beetle.</nfs-tooltip-tip><!--container--> hung ...

<!-- after animationend: opened is emitted -->
<nfs-tooltip-tip aria-hidden="true" id="nfs-tooltip-a1b2-0" class="tooltip top align-center" style="...">Fancy word for a beetle.</nfs-tooltip-tip>

<!-- closing: the fade-out plays in place, then hidden is set and closed is emitted; the tip is kept -->
<nfs-tooltip-tip aria-hidden="true" id="nfs-tooltip-a1b2-0" class="tooltip nfs-fade-out top align-center" style="...">...</nfs-tooltip-tip>
<nfs-tooltip-tip aria-hidden="true" id="nfs-tooltip-a1b2-0" class="tooltip top align-center" style="..." hidden="">...</nfs-tooltip-tip>
```

```html
<!-- A Foundation button with an explicit placement, text from the directive's value -->
<button nfsButton [nfsTooltip]="t('beetle')" position="bottom" alignment="left">Bottom Left</button>

<!-- server: title comes from the value -->
<button class="button has-tip" type="button" title="Fancy word for a beetle." jsaction="focusin:;focusout:;">Bottom Left</button><!--container-->

<!-- hydrated, open -->
<button class="button has-tip" type="button" aria-describedby="nfs-tooltip-desc-a1b2-1">Bottom Left</button>
<nfs-tooltip-description hidden="" role="tooltip" id="nfs-tooltip-desc-a1b2-1">Fancy word for a beetle.</nfs-tooltip-description>
<nfs-tooltip-tip aria-hidden="true" id="nfs-tooltip-a1b2-1" class="tooltip bottom align-left" style="...">Fancy word for a beetle.</nfs-tooltip-tip><!--container-->
```

```html
<!-- A disabled action that explains itself, with the consumer's own description kept first -->
<button nfsButton [disabled]="true" disabledInteractive aria-describedby="plan-note" nfsTooltip="Upgrade to export">Export</button>

<!-- hydrated, after the first show -->
<button class="button has-tip disabled" type="button" aria-disabled="true" aria-describedby="plan-note nfs-tooltip-desc-a1b2-2">Export</button>
<nfs-tooltip-description hidden="" role="tooltip" id="nfs-tooltip-desc-a1b2-2">Upgrade to export</nfs-tooltip-description>
<nfs-tooltip-tip aria-hidden="true" id="nfs-tooltip-a1b2-2" class="tooltip top align-center" style="...">Upgrade to export</nfs-tooltip-tip><!--container-->
```

Where the tip lives: after the description element, which is the host's next sibling from the first client render callback, inside the host's parent. Its containing block is therefore the host's containing block for absolute positioning (the nearest ancestor that is positioned or otherwise establishes one), not `.has-tip`, whose `position: relative` applies to the host alone; with no such ancestor it is the initial containing block. The Positioner measures that origin and writes inline `top`/`left`, the same mechanism Foundation's `$.fn.offset()` used; ADR 0002's in-place rule holds because the tip is created in place on the client and never moved. Documented limits, accepted with that choice (the Anchored pane spec, Triage 2):

- A positioned ancestor with `overflow` other than `visible` clips the tip (Foundation's `body`-appended tip was never clipped), and an ancestor stacking context bounds its `z-index: 1200`.
- Structural pseudo-classes and sibling combinators among the host's siblings see the description element from the first client render callback and the tip once it exists: in Foundation's CSS that touches `.button-group` (`.button:last-child` margin and corner radius, `.no-gaps` `.button + .button` borders, and the float-mode `.expanded` `nth-last-child` widths). With Foundation's defaults (flexbox, radius on each button) the only visible change is a 1 px right margin on a group's last button from hydration on.
- A tip inside a wrapping `label` sits inside it, so a press on the tip is a press on the label; neither the `aria-hidden` tip nor the `hidden` description element joins the label's name; write labels with `for` (development warning 5).
- Inside a modal `<dialog>` the tip is in the dialog's top layer with it, so tooltips inside a Reveal work; a tip appended to `body` would sit behind it; the description element is inside the dialog with its host, so the description survives the dialog's inertness of the page (measured in Chromium and Firefox, [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).

### Animation

Per ADR 0003 and building-blocks 1.6 rule 1: the kept tip stays in the DOM, so it animates through classes bound for the animation phase and CSS keyframes, never `animate.enter`/`animate.leave`. The Motion classes are fixed: `nfs-fade-in` when showing, `nfs-fade-out` when hiding, from the `nfs-motion` mixin, at its duration (`$duration`, 500 ms by default) instead of Foundation's 150 ms jQuery fades.

Phases, a `linkedSignal` derived from the shown state (`isOpen()` and a non-empty text):

| Phase | Entered when | Tip state |
| --- | --- | --- |
| idle | Creation while closed (never, in practice), and after every completion | Shown: no `hidden`, no Motion class. Closed: `hidden` |
| entering | Shown becomes true and animations are enabled | No `hidden`, `nfs-fade-in` |
| leaving | Shown becomes false and animations are enabled | Still shown, `nfs-fade-out` |

- Showing: `hidden` goes and `nfs-fade-in` is bound in the same pass as the placement, so the fade starts from its first frame at the final position (the Positioner places before paint). On first show the tip is created, placed, and faded in within one `ApplicationRef.tick()`.
- Completion: in the `read` phase after the class is bound, the directive reads the tip's computed `animation-name`, `animation-duration`, `animation-delay`, and `animation-iteration-count` and takes the longest finite animation (Angular's own method for `animate.leave`, and the Toggler spec's refinement of building-blocks 1.6 rule 1: the duration is set by the consumer's `nfs-motion($duration)`, which no design-time constant knows). A measured zero (the `nfs-motion` include is missing, or the stylesheet removed the animation) completes at once. Otherwise the phase completes on the tip's `animationend` or `animationcancel` for that animation name with `event.target` equal to the tip, or on a fallback timer of the measured length plus 100 ms started outside the Angular zone, whichever is first.
- Interruption: re-entering the Hover region during the fade-out switches leaving to entering (and back); the interrupted phase emits nothing and its timer is cleared.
- Completion outputs: `opened` once the tip is shown and idle, `closed` once it is hidden and idle; never for the initial state.
- `nfsAnimationsToken` `{disabled: true}` skips the Motion classes: the tip shows or hides in one pass and the outputs fire in the following render callback.
- Reduced motion: `nfs-motion` sets `animation-duration: 1ms` on its classes under `prefers-reduced-motion: reduce`, so `animationend` still fires and the change is effectively instant; no separate code path (the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md)). Hover delays are not motion and do not change.
- Hydration: nothing animates at hydration, because no tip exists in server HTML.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7, rules 1 to 11:

- Server-side rendering and first paint: the host renders `.has-tip`, the text as `title`, and no `aria-describedby`; there is no tip, no `role="tooltip"`, no inline style (rule 1). This is the complete first-paint state: no tooltip is visible at first paint, the description is present, and the browser's own `title` tooltip serves no-JavaScript users. The `ViewContainerRef` anchor comment is serialised and matched at hydration like any empty container. An `isOpen` bound to `true` renders the same server HTML; the tip appears in the first client render callback after hydration.
- Before hydration: construction reads only DI and `HostAttributeToken` values; the tip is created, placed, and listened to only in render callbacks; hover and Light dismiss listeners and every timer start only in render callbacks or handlers, outside the zone (rules 3 to 5). Tip ids are generated on the client only, so no server id can disagree.
- Full hydration: host binding values equal the server's (`class`, `title`, no reference), so hydration changes nothing; the description element and the reference arrive in the first client render callback and the `title` removal with the first show (rule 10). A host that holds focus from before hydration gains the reference while focused, so Firefox reports one description change with the same text.
- Event replay: the `focusin` and `focusout` host listeners replay. A replayed `focusin` opens only if the host is still `document.activeElement` and matches `:focus-visible`, so a keyboard user who tabbed to the host before hydration sees the tip once hydrated, and one who moved on sees nothing. A replayed `focusout` finds nothing open. No tooltip handler calls `preventDefault()`, so replay cannot throw in one. Hover (`pointerenter`/`pointerleave`) and the press listeners are added in code and never replay: a hover or click before hydration opens nothing afterwards, which is correct for supplementary content (a stale tip is worse than none). Because the press listener is not in host metadata, a link host carries no `click` annotation, so Angular's dispatcher never cancels its native navigation inside a dehydrated block (building-blocks 1.11 decision 5).
- Hydration boundary: a tooltip host and any external Trigger that toggles it belong to one boundary (ADR 0008; building-blocks 1.11 decision 6; template-reference scoping enforces half of it, ADR 0013). The tip itself is client-created next to its host and needs no boundary of its own.
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/tooltip` is its own entry point. Inside a dehydrated block the host is its server HTML with `title`, so mouse users get the browser's tooltip. A keyboard focus on the host is a replayable interaction: it hydrates the block and replays, and the live check then shows the tip. `hydrate on hover` hydrates on the first hover without opening (the `pointerenter` has passed), so the tip opens on the next entry; `hydrate on viewport`, `on idle`, or `on interaction` avoid that for hover-heavy regions. Inside `hydrate never` the host keeps its `title` forever and no tip ever appears. Plain `@defer` renders on the client like any client render.
- Breakpoint: `showOn` is read at open time; on the client before the Breakpoint service goes live `is()` answers from the Server breakpoint, but every open request is a client event after the first render callback (replay included), when the service is live.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; pointer, focus, and timer callbacks run outside the Angular zone and reach Angular only by writing signals.

### Sass and custom CSS

No library CSS and no `nfs-tooltip` mixin. The trigger and the tip are styled entirely by Foundation's `foundation-tooltip` export mixin (`.has-tip`, `.tooltip`, the pip classes); positioning is inline `top`/`left`; hiding is the `hidden` attribute alone, which works because `.tooltip` sets no `display` (building-blocks 1.10 adds Foundation's `.is-hidden` only where a Foundation rule sets `display` on the hidden element); the fades are the shared `nfs-fade-in`/`nfs-fade-out` keyframe classes from `nfs-motion`. The Sass subsection under Further Notes gives the required content.

## Testing Decisions

A good test asserts what a user or assistive technology observes: whether the tip is shown (`hidden`, visibility, its box beside the host), its classes, the host's `title` and `aria-describedby`, the description element's role and text, the tip's `aria-hidden` and text, where focus is, and when `opened`/`closed` fire relative to the fade. No test reads the directive's or the tip's private fields or the phase signal. Prior art: the [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md) test layers (its test tip is replaced by the real one here), the [Spec: Toggler](../issues/17-spec-toggler.md) animation-phase cases, and the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md) replay-safe dispatch; no prior art exists in the new repository.

Story ids follow `tooltip--<story>`: `tooltip--defined-term`, `tooltip--button`, `tooltip--placements`, `tooltip--legacy-position-class`, `tooltip--hover-region`, `tooltip--keyboard-focus`, `tooltip--escape`, `tooltip--click-open`, `tooltip--disable-hover`, `tooltip--show-on`, `tooltip--external-trigger`, `tooltip--disabled-interactive`, `tooltip--link-host`, `tooltip--described-by-merge`, `tooltip--dynamic-text`, `tooltip--sibling-group`, `tooltip--in-modal-dialog`, `tooltip--clipping-limit`, `tooltip--two-way-binding`, and `tooltip--fixture` (args-driven for e2e: host kind, text length, position, alignment, offsets, `clickOpen`, `disableHover`, `disableForTouch`, `showOn`, containing block `none | relative | scroll`).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` on the WCAG 2.2 AA rule set (`runOnly` tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`, ADR 0018); stories that open a tip run axe again with it open. Hover steps use `userEvent.hover`/`unhover`, which dispatch pointer events.

- `tooltip--defined-term`: a `button.has-tip` term in a sentence; before any interaction the host has `title`, `aria-describedby` naming a hidden `nfs-tooltip-description` with `role="tooltip"` and the text, and no tip exists; hovering shows the tip after the delay above the term (`top align-center`), `title` is gone, `aria-describedby` is unchanged, and the tip has `aria-hidden="true"`, no `role`, and the text; axe passes with the tip open (`color-contrast`).
- `tooltip--button`: a `.button` host; the same sequence; the tip's box is beside the host, never over it.
- `tooltip--placements`: the 12 explicit placements (args); each tip carries the matching pip classes and sits on the expected side.
- `tooltip--legacy-position-class`: `class="right"` on the host with `position` unset opens `right align-center`.
- `tooltip--hover-region`: hover the host, move onto the tip, the tip stays; leave both, it closes; `closed` fires after the fade.
- `tooltip--keyboard-focus`: Tab to the host shows the tip at once; Tab away closes it; a mouse click that focuses the host (with `clickOpen` off) does not show it.
- `tooltip--escape`: open by hover, press Escape: the tip closes, focus is unchanged, moving the pointer within the host does not reopen it; leaving and re-entering does. Open by focus, Escape closes, focus stays on the host.
- `tooltip--click-open`: a click pins the tip, unhover keeps it, a click elsewhere closes it; with `clickOpen="false"` the click does nothing and unhover closes; Enter on the focused host changes nothing.
- `tooltip--disable-hover`: hovering never opens; focus and click still do.
- `tooltip--show-on`: with `showOn="all"` the tip opens; with `showOn="large"`, above the `small` breakpoint of the 414 px story viewport (Storybook conventions, section 4), nothing opens and the host keeps its `title`.
- `tooltip--external-trigger`: an info button with `[nfsToggle]="tip"` toggles the tip; the info button has no `aria-expanded`; clicking it while open closes the tip once (no close and reopen).
- `tooltip--disabled-interactive`: a `disabledInteractive` disabled `nfsButton` host is focusable, shows its tip on focus, and carries `aria-disabled="true"`.
- `tooltip--link-host`: a link host shows its tip on hover and focus and navigates on click (the story records the navigation attempt); the link has no `jsaction` for `click` in the story's server-render counterpart (covered in layer 3).
- `tooltip--described-by-merge`: a host with a static `aria-describedby="note"` has `note nfs-tooltip-desc-...` from the first render, before any show, and unchanged after.
- `tooltip--dynamic-text`: changing the bound text while open updates the tip; clearing it hides the tip and emits `closed`; restoring it shows the tip again.
- `tooltip--sibling-group`: opening tooltip B closes tooltip A.
- `tooltip--in-modal-dialog`: a tooltip on a button inside a `<dialog>` opened with `showModal()`; the tip is visible above the dialog content; the first Escape closes the tip and the dialog stays open; the second closes the dialog.
- `tooltip--clipping-limit`: a long tip inside a positioned `overflow: auto` box is clipped (documented limit; asserted so a change is noticed).
- `tooltip--two-way-binding`: `[(isOpen)]` bound to a signal shown in the story; opening by hover updates it; setting it from a checkbox shows and hides the tip.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Text resolution, driven by data: value only, static `title` only, both (value wins and replaces `title`), neither (development warning 3), bare attribute with `title`.
- Tip lifecycle: no tip before the first show; the description element created once in the first render as the host's next sibling; the tip created once after it on first show, whatever the source (hover timer, focus, click, `open()`, a bound `[isOpen]`); kept after close with `hidden`; never recreated; destroyed with the host.
- One-pass swap: after the `whenStable()` that follows an open request, the host has no `title`, `aria-describedby` still names the description element, the tip carries the pip classes and inline offsets, and it has no `hidden`, all together.
- `aria-describedby` merge with a static consumer value, present from the first render and unchanged by show, hide, and close; a text change updates the description element's text and not the reference; an empty text drops the id; destroy removes the element; the element never changes its `hidden`.
- Open sources: `focusin` with the host focused and `:focus-visible` opens; a dispatched `focusin` while focus is elsewhere does not; a replay-shaped `focusin` (an event whose `eventPhase` reads 101 and whose `preventDefault` throws) with the host still focused opens and nothing reaches `ErrorHandler`; a pointer `click` (`detail` 1) opens and pins; a keyboard `click` (`detail` 0) does not; a touch `pointerdown` then `click` is ignored with `disableForTouch` and honoured without it.
- Close sources: `focusout` to the body closes; hover leave while pinned, and while the host is keyboard-focused, does not close; Escape and an outside press close (Light dismiss, driven by dispatched events); a sibling tooltip opening closes with `'sibling'`.
- `showOn` through a Breakpoint service with a fake `MediaMatcher`: open requests below the query are ignored; a model write still opens; `'all'` always opens.
- `registerTrigger`: a registered external element counts as inside for the pointer rule and is not in the Hover region; the unregister function removes it.
- Legacy class: static `class="has-foo left"` resolves `auto` to `left`; a bound class does not.
- Animation phases with a test stylesheet: class lists after each step; `opened`/`closed` once each, after `animationend`, in order; interruption during the fade-out emits only the final state's output; `animationend` from another element does not complete; `animationcancel` completes; a missing animation completes at once; a suppressed `animationend` completes after the measured length plus 100 ms (fake timers); `nfsAnimationsToken` `{disabled: true}` binds no Motion class.
- Defaults token: each Option's default comes from the token when the attribute is absent, and the attribute wins.
- Development-mode checks: each of the five warnings fires once for its case (a `span` host, a natively disabled button, no text, an icon button with no name, a host inside a `label`) and none for a `.button` host with text.
- Zoneless: the suite runs with zoneless change detection; a zone-based fixture shows no change detection from pointer moves over the host.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.

- SSR smoke: `renderApplication` over a fixture with a defined-term button host (static `title`), a `.button` host with a bound value, a link host, a host with a static `aria-describedby`, and a host with `[isOpen]="true"`. Assert that `whenStable()` resolves (no pending timers); every host carries `class="... has-tip"`, the text as `title`, `jsaction="focusin:;focusout:;"`, and no `aria-describedby` beyond the consumer's static one; no host carries a `click` annotation; the document contains no `nfs-tooltip-tip`, no `nfs-tooltip-description`, no `role="tooltip"`, and no inline `top`/`left`; no document listener was added (spy on the server document).
- Pure logic, table-driven: the legacy position class parser (tokens, several matches, SVG-like `class` values, none); text resolution; the `aria-describedby` merge; the interactive-host classifier over tag, `href`, `type`, and `role`; the longest-animation reduction over computed-style lists.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `tooltip--fixture` through `mount(storyId, props)` and on the named stories, in Chromium, Firefox, and WebKit:

- Real mouse path from the host across the pip gap onto the tip keeps it open; leaving both closes it after about 100 ms plus the fade.
- Real Tab shows the tip at once and real Shift+Tab closes it; a real mouse click on a focusable host with `clickOpen` off does not show it (`:focus-visible` is false in all three engines).
- Touch emulation (`hasTouch`): a tap shows and pins the tip, a tap elsewhere hides it, and no hover-open fires from the tap; with `disableForTouch` the tap does nothing and the host's own click still fires.
- `page.emulateMedia({reducedMotion: 'reduce'})`: the tip is visible, placed, and at full opacity in the first frame after the open request; `opened` fires within a frame or two.
- The first visible frame (no `hidden`) of a first show already carries inline offsets and pip classes (a `requestAnimationFrame` probe in the page).
- Viewport breakpoints: with `showOn="medium"` at 600 px wide nothing opens and at 800 px the tip opens.
- `tooltip--in-modal-dialog`: real Escape closes the tip and keeps the dialog open, then closes the dialog.
- `tooltip--clipping-limit`: the clip holds in all three engines; the same tip in a static scroller is not clipped.
- Chromium CDP: the host's computed description equals the text before the first show, while the tip is shown, and after Escape.

Against the prerendered fixture app, one route with a defined-term host, a `.button` host, a link host, and hosts inside `@defer` blocks:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; every host has its `title`; no tip exists.
- Hydration: no NG05xx in the console, `ngDevMode.componentsSkippedHydration === 0`, and no tip after hydration until an interaction.
- Pre-hydration focus with the main bundle held back by `page.route`: Tab to a host, release the bundle; after hydration the tip is shown if the host is still focused, and not shown when focus was moved on before release.
- Pre-hydration hover: hover a host, release the bundle; no tip appears until the pointer leaves and re-enters.
- Link host inside `@defer (hydrate on interaction)`: clicking it navigates natively (no cancellation), because the host carries no `click` annotation.
- `@defer (hydrate on hover)`: the first hover hydrates without showing the tip; the next entry shows it.
- `@defer (hydrate never)`: the host keeps its `title`, no tip appears on hover or focus, and no error is logged.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA on Firefox and on Chrome, JAWS on Chrome, and VoiceOver on Safari (macOS and iOS), Tab to the hosts of `tooltip--defined-term`, `tooltip--described-by-merge`, `tooltip--disabled-interactive`, and `tooltip--in-modal-dialog` and confirm the tooltip text is spoken once as the description on the first focus (after the consumer's own description), is not repeated when the tip appears or when Escape dismisses it, and is spoken again on the next focus.

## Out of Scope

- Rich or interactive tooltip content (links, buttons, formatted HTML): a tooltip holds text only; interactive content is a Dropdown pane (non-modal dialog), as the APG says ("A hover that contains focusable elements can be made using a non-modal dialog").
- Tooltips on non-interactive text as a supported use: warned in development mode; the defined-term recipe uses a button host (Further Notes). Decided at triage in the ticket answer.
- Toggletips with a live region (a button whose activation announces its content): not a Foundation plugin.
- The positioning formulas, Light dismiss rules, and hover timers themselves: the [Spec: Anchored pane (shared utility)](../issues/55-spec-anchored-pane.md).
- A top-layer tip (CDK Overlay, native `popover`), which would remove the clipping and sibling limits: weighed in the Anchored pane spec and not taken; the named upgrade is below.
- Logical `before`/`after` positions and follow-the-pointer placement (Material's `positionAtOrigin`).
- Long-press gestures on touch (Material's `touchGestures`).
- A `hideDelay` input: the 100 ms Hover region floor is the close delay.
- Motion UI transition classes and the `motion-ui` package (ADR 0003).
- Library CSS and runtime theming.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | `[nfsTooltip]` directive on the trigger plus the internal `nfs-tooltip-tip` and `nfs-tooltip-description` components | Building-blocks 1.1 case 3 and ADR 0001: the tip is generated structure the consumer never writes; Material's shape. The description element is a single plain element, and it is still a component under the same Tooltip exception, because the two checks ADR 0001 asks for first both fail: no one-element consumer authoring step fits (Foundation's markup has no description element, so the consumer would write a new hidden element and the tooltip text a second time beside every trigger, and keep the two in step), and no platform feature replaces it (the host's `title` must leave at the first show, as in Foundation, and WAI-ARIA references a `tooltip` from `aria-describedby`; `aria-description` is a WAI-ARIA 1.3 draft addition that check 6 of [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md) did not measure). Created through the directive's `ViewContainerRef`, the element belongs to the host's view, so Angular moves and removes it with the host, and its text binding reads `nfsTooltipToken` like the tip's | A consumer-written tip element (Foundation never asked for one); a component wrapping the trigger; a consumer-written description element (a second copy of the text per trigger); `aria-description` on the host (unmeasured draft attribute); an element the directive creates with `Renderer2` (outside Angular's view tree, so Angular neither moves it nor removes it with a host at the root of an embedded view, as an `@for` row or an `@if` branch is) |
| D2 | Tip created on first show, after the description element, and kept | No DOM creation before hydration (ADR 0008); the leave fade plays on the kept element; the description element is created in the first client render callback, the tip on first show | Created at construction (hydration mismatch, cost for unopened tips); removed on hide (`animate.leave` in a child component does not run when the parent removes it) |
| D3 | Tip created in an `afterRenderEffect` `write` phase, not in the open handler | One path for every open source, model writes included, never on the server; view-bound sequences join the same tick, so placement lands before paint | Creation in handlers (misses a bound `[isOpen]`); `effect` (runs on the server) |
| D4 | Text stays in `title` until the first show; a hidden `role="tooltip"` description element beside the host carries the text from the first client render callback, and the visible tip is `aria-hidden` | A description at every moment (server HTML and no JavaScript from `title`, before any focus from the element); showing, hiding, and Escape never change the description, so Firefox reports no description change and NVDA repeats nothing, and a static consumer `aria-describedby` no longer hides the tooltip text on first focus (both measured, [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)); beside the host, the element shares its inertness and modal subtree | The kept tip as the description (Firefox description-change events at every show and hide; no tooltip text on first focus beside a static consumer value); CDK `AriaDescriber` (a `body` container, so the description depends on each engine following a reference across a modal boundary: it holds in Chromium and Firefox, and WebKit is unmeasured; D23); removing `title` in the first render callback (mouse users below `showOn` and before the first show lose the browser's tooltip) |
| D5 | Interactive hosts only, enforced by development warnings, no production behaviour change | APG presumes a natively focusable trigger; touch and keyboard users cannot reach a tooltip on plain text; relaxing later breaks no one (triage) | Refusing to open on non-interactive hosts (surprising, extra code); silently supporting `span[tabindex]` (a focusable element with no role) |
| D6 | `.has-tip` always added; `triggerClass` dropped | Foundation's default trigger class and building-blocks 1.4; the class is the contract | Keeping `triggerClass` (a class-name Option); consumer-written `.has-tip` (differs from Foundation's output) |
| D7 | `templateClasses` kept | The only way to style one tip, because the consumer does not author the tip; Material's `matTooltipClass` | Dropped with the other class-name Options (building-blocks 1.4 now names `templateClasses` as the one kept exception) |
| D8 | One text input under the selector name, falling back to `title` | Material's `matTooltip`; Foundation's `tipText` falls back to `title` the same way | A separate `tipText` attribute beside `nfsTooltip` (two inputs for one value) |
| D9 | Legacy `top`/`bottom`/`left`/`right` host classes as the `auto` position, static class only | Foundation's documented markup; read once with `HostAttributeToken` | Ignoring them (breaks the docs' `class="top"` examples); reading live classes (needs the DOM) |
| D10 | Keyboard focus opens through `focusin` plus `:focus-visible` and a live-focus check | APG focus behaviour; replay-safe; a mouse focus does not double as a click-open | CDK `FocusMonitor` (a service for one boolean `:focus-visible` gives); opening on every focus (mouse clicks with `clickOpen` off would open) |
| D11 | Press opening through code-added `click` and `pointerdown` listeners | No `jsaction` on link hosts (native navigation survives dehydrated blocks); a stale replayed open is not wanted; touch detection per press | A host `click` listener (cancels link navigation in dehydrated blocks); `pointerdown` alone (a touch scroll over the host would open it) |
| D12 | Light dismiss pointer rule always on for tooltips; `clickOpen` controls pinning | Same observable behaviour as switching it only for click-opened tips (hover and focus tips already close when the pointer or focus leaves), with fewer states | `outsidePress` only while click-opened (the Anchored pane spec's first mapping, since amended to match this decision) |
| D13 | `focusout` host listener in addition to the Light dismiss focus rule | Focus leaving for the page body or another window fires no `focusin`; APG "dismissed when it no longer has focus" | Relying on the focus rule alone |
| D14 | Hover close after the helper's 100 ms floor; no `hideDelay` input | WCAG 1.4.13 hoverable across the pip gap; Foundation closed at once, Material defaults to 0 | A `hideDelay` input (YAGNI) |
| D15 | `disableForTouch` kept, per press | The per-event touch filter already removes the iOS first-tap problem Foundation's option addressed; the option still lets a consumer keep taps for the host's action | Device-level check (breaks mouse on touch-screen laptops); dropping the option |
| D16 | `showOn` via `NfsMediaQuery.is()` at open time; model writes bypass it | Foundation checks in `show()` only; a consumer's explicit state wins | Closing on breakpoint change (Foundation does not) |
| D17 | Trigger role `'none'`; `registerTrigger` for external Triggers | WAI-ARIA: a tooltip is not a popup; an info button must toggle, not close and reopen | `aria-expanded` on external Triggers |
| D18 | `nfs-fade-in`/`nfs-fade-out` at the `nfs-motion` duration; no library CSS | ADR 0003 keyframe State classes; the Sass packaging decision owns durations; no `nfs-tooltip` mixin needed | `fadeInDuration`/`fadeOutDuration` inputs as inline `animation-duration` (would override the reduced-motion rule; building-blocks 1.4 drops them); an `nfs-tooltip` rule for 150 ms |
| D19 | Completion from the measured computed animation, fallback timer measured plus 100 ms | The Toggler spec's refinement: the duration is the consumer's `nfs-motion($duration)`; a missing stylesheet measures zero and completes at once | A fixed design-time duration (wrong for any consumer duration) |
| D20 | Empty text disables; shown state is `isOpen` and non-empty text | Material's behaviour without a `disabled` input | A `disabled` input (a second off switch) |
| D21 | Eager loading, not `injectAsync` | `injectAsync` resolves services, not components; first-show latency; the one-pass swap; small code; per-plugin entry point | A dynamic `import()` of the tip on first show |
| D22 | Consumer's static `aria-describedby` kept first | Material's `AriaDescriber` appends rather than replaces; Foundation reused the value as the tip id and lost the consumer's description | Replacing it (Foundation) |
| D23 | Clipping by positioned `overflow` ancestors, stacking bounds, and sibling pseudo-class effects documented as limits | Consequences of the in-place sibling tip (ADR 0002, ADR 0008, building-blocks 1.1); the Anchored pane spec's Triage 2 | A tip, or a description, appended to `body` (behind modal dialogs; node creation outside the component tree); CDK Overlay (breaks `.tooltip` CSS) |

### Usage examples

```html
<!-- Defined term: a button host with Foundation's .has-tip look (Foundation's first docs example) -->
<p>
  The <button type="button" nfsTooltip title="Fancy word for a beetle.">scarabaeus</button>
  hung quite clear of any branches.
</p>

<!-- Foundation button, explicit placement -->
<button nfsButton nfsTooltip="Fancy word for a beetle." position="bottom" alignment="left">Bottom Left</button>

<!-- Legacy position class from Foundation's docs -->
<button type="button" class="right" nfsTooltip title="Aligned on the right">kitchen</button>

<!-- Hover and focus only (no pinning), on a button that also opens a dropdown pane -->
<button nfsButton [nfsToggle]="account" nfsTooltip="Account settings" clickOpen="false">Account</button>
<div nfsDropdownPane #account="nfsDropdownPane" class="dropdown-pane">...</div>

<!-- Icon button: the name is aria-label, the tooltip is the description -->
<button type="button" class="button clear" aria-label="Delete" nfsTooltip="Moves the file to the bin">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- A disabled action that explains itself (Button spec) -->
<button nfsButton [disabled]="!canExport()" disabledInteractive [nfsTooltip]="canExport() ? '' : 'Upgrade to export'">
  Export
</button>

<!-- Only from medium up -->
<a routerLink="/pricing" nfsTooltip="Compare plans" showOn="medium">Pricing</a>

<!-- A separate info button toggles the tooltip of a field -->
<label for="iban">IBAN</label>
<input id="iban" nfsTooltip #ibanTip="nfsTooltip" title="Your account number, starting with the country code" />
<button type="button" class="button tiny hollow" aria-label="About IBAN" [nfsToggle]="ibanTip">?</button>

<!-- Two-way state and completion outputs -->
<button nfsButton nfsTooltip="Saved drafts are kept for 30 days" [(isOpen)]="hintOpen" (opened)="track('hint')">
  Drafts
</button>
```

```ts
// Application-wide defaults, replacing Foundation.Tooltip.defaults
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: nfsTooltipDefaultsToken,
      useValue: {hoverDelay: 400, showOn: 'medium', tooltipHeight: 16} satisfies NfsTooltipDefaults,
    },
  ],
};
```

```ts
// Programmatic use through a view query
readonly tip = viewChild.required(NfsTooltip);
showHelp(): void {
  this.tip().open();
}
```

Migrating Foundation's docs markup: `<span data-tooltip tabindex="1" title="...">` becomes `<button type="button" nfsTooltip title="...">` (a real control, no positive tab index); `data-*` options become inputs of the same camelCase name; `data-template`, `data-allow-html`, `data-tooltip-class`, `data-trigger-class`, `data-touch-close-text`, `data-fade-in-duration`, and `data-fade-out-duration` are removed. Foundation's normalize resets `<button>` (no border, background, or padding), so a `button.has-tip` term renders like the docs' `span.has-tip`.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-tooltip` (`.has-tip` on the trigger, `.tooltip` and its `top`/`bottom`/`left`/`right` and `align-*` pip classes on the tip). No library CSS; there is no `nfs-tooltip` mixin. (1) Rules: none. (2) Reused settings: none read by library Sass; `$has-tip-*` and `$tooltip-*` shape the trigger and the tip through Foundation's own rules, and `$tooltip-max-width` bounds the width the Positioner measures. `$tooltip-pip-width` and `$tooltip-pip-height` correspond to the `tooltipWidth` (12) and `tooltipHeight` (14) inputs, which the consumer keeps in step by hand, as in Foundation, preferably once through `nfsTooltipDefaultsToken`. (3) Custom properties: none; placement is inline `top`/`left`. (4) Motion classes: `nfs-fade-in` and `nfs-fade-out` from `@include nfs-motion;` (required), at its `$duration` (500 ms by default); its reduced-motion block sets `animation-duration: 1ms` on both, and this plugin adds no animation of its own. A consumer who wants Foundation's 150 ms for tooltips only writes their own rule for `.tooltip.nfs-fade-in, .tooltip.nfs-fade-out` with `animation-duration: 150ms`, plus the same selector at `1ms` inside `@media (prefers-reduced-motion: reduce)`, because the higher specificity would otherwise beat the mixin's reduced-motion rule. (5) Without `foundation-tooltip` the tip is unstyled and not `position: absolute` (the Positioner's development warning reports it); without `nfs-motion` the tip shows and hides without a fade and completes at once.

### Platform features to adopt when the browser target moves

- `popover="hint"` (Chromium 151, Gecko 153, no WebKit yet) with CSS anchor positioning (`position-anchor`, `position-area`, `position-try-fallbacks`; Baseline 2026): the tip moves to the top layer, which removes the clipping and stacking limits, and a hint popover does not close an open Dropdown pane, the platform form of the separate sibling groups. Anchor positioning retires the body-box Collision bound (a listed behaviour change, per the Anchored pane spec).
- Interest invokers (`interestfor`): declarative hover and focus opening with platform delays, replacing `nfsHoverIntent` and the `focusin` rule.
- `@starting-style` and `transition-behavior: allow-discrete`: a transition-based fade on `display`, replacing the keyframe phases.
- `CloseWatcher`: the Android back gesture dismisses the tip.

### Foundation behaviour changed or dropped

- The tip is created on first show next to its trigger instead of at initialisation in `body`, and kept; it is positioned with Foundation's formulas from one measurement (Foundation's tip could land 19 px off its own formula), and it follows its trigger inside static scrolling containers.
- The `title` stays on the trigger until the first show (Foundation emptied it at initialisation and restored it on destroy); an existing `aria-describedby` is kept and extended instead of being reused as the tip id; the description is a hidden element beside the trigger from the first client render callback, and the visible tip is `aria-hidden`.
- Leaving the trigger closes after 100 ms and never while the pointer is over the tip; Escape closes from anywhere; focus leaving and outside presses close every tip; a second tap no longer toggles a tip closed: WCAG 2.2 AA fixes and the Light dismiss model (ADR 0024).
- Keyboard focus opens only for keyboard focus (`:focus-visible`); Foundation's `isClick`/`isFocus` bookkeeping, the `tabindex` special case in `mousedown`, and the commented-out toggle branch are gone.
- `show.zf.tooltip` and `hide.zf.tooltip` became Completion outputs that fire after the fade, not before it.
- `disableForTouch` ignores touch presses per event instead of disabling everything on touch-capable devices.
- Dropped as jQuery-only: `fadeIn`/`fadeOut` with `.stop()`, the `visibility: hidden` measure-then-show dance, `appendTo(document.body)` and `$.fn.offset`, the `closeme.zf.tooltip` window query and `data-yeti-box`, `data-toggle` and `data-resize` on the trigger, `data-is-active` and `data-is-focus` on the tip (its `aria-hidden` stays, always `true`, where Foundation switched it to `false` while shown), `ignoreMousedisappear`, the `tap` special event and the `ontouchstart` device check, `$(this.options.template)` and `allowHtml`, and the never-read `touchCloseText`.
