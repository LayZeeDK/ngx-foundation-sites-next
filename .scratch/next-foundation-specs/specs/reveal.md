# Spec: Reveal

Ticket: [Spec: Reveal](../issues/18-spec-reveal.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA.

## Problem Statement

A developer building an Angular application on Foundation for Sites needs modal dialogs: a sign-up form, a confirmation, a full-screen gallery, a dialog that opens another dialog. Foundation's Reveal plugin provides them with jQuery, and that design leaves the developer with problems an Angular library must not copy:

- The plugin generates a `.reveal-overlay` element, appends it to `body`, and moves the consumer's modal into it. Moving server-rendered nodes breaks hydration, and the modal's styles and template context depend on where it was written.
- It focuses the dialog element itself, which the WAI-ARIA Authoring Practices name as the anti-pattern ("Please DO NOT make the element with role dialog focusable"). It traps focus on a list of focusable elements computed once at open, so content that changes while the modal is open escapes the trap.
- It hides the page behind the modal from nobody: no `inert`, no `aria-modal`, only an `aria-hidden` flag on the modal itself. A screen reader user can wander out of the modal into the page.
- One window-level Escape handler per open modal, sharing one jQuery event namespace, means Escape closes every open nested modal at once, and closing one modal removes the others' handlers. Closing a Reveal without an overlay also removes an open Dropdown's outside-click handler, because both use the `click.zf.dropdown` namespace.
- `open.zf.reveal` fires synchronously while the enter animation still runs, `closed.zf.reveal` after the exit animation, and `closeme.zf.reveal` fires before this modal opens rather than before it closes. Nothing can veto a close, so a half-filled form is lost on a stray Escape or overlay click.
- Its animations need Motion UI's two-frame transition protocol and its positioning needs a measurement with `visibility: hidden; display: block` before every open.
- It locks page scroll with classes on `html` and a `top` offset, correctly, but decides when to unlock by counting `$('.reveal:visible')`.

A server-rendered Angular application adds more: the dialog must be in the server HTML with its content, closed unless it is a non-modal dialog that is open by default, and hydrate without a mismatch; an open-by-default modal dialog must become modal after hydration; a click on its Trigger before hydration must still open it afterwards; and nothing may touch `window`, `history`, or focus before hydration.

## Solution

One attribute directive, `NfsReveal`, on the native `<dialog class="reveal">` the developer writes where it belongs in the template. The browser supplies what Foundation's JavaScript emulated: `showModal()` puts the dialog in the top layer without moving it, makes the rest of the page inert, contains focus, and paints `::backdrop`, which the library styles with Foundation's own overlay colour. Foundation's `.reveal` Sass, its size classes (`.tiny`, `.small`, `.large`, `.full`), full screen below medium, `.collapse`, `.without-overlay`, and its `html.is-reveal-open` scroll lock are all reused unchanged; the library adds seven small documented rules in the `nfs-reveal` Library mixin for what a `<dialog>` in the top layer needs, and CDK Dialog is not used.

The Reveal is an Openable: `nfsOpen`, `nfsClose`, and `nfsToggle` operate it, a bare `nfsClose` inside it closes it, and `close(result)` hands a value to its `closed` output, as Material's `[mat-dialog-close]` does. Focus moves to the first tabbable element inside (or a heading, or a selector), wraps with Tab and Shift+Tab, and returns to the Trigger on close, even in WebKit, which does not focus a button on mouse click. A `closePredicate` can veto any close, and because the directive intercepts Escape before the browser turns it into a close request, a veto holds however often Escape is pressed. `overlay: false` gives a non-modal dialog that dismisses itself like the library's Anchored panes. Animations are keyframe Motion classes applied through State classes, with the dialog closed only after its exit animation ends. The server HTML is the dialog with its content, closed, or shown when a non-modal Reveal is open at its first render, so that its Trigger's `aria-expanded="true"` is true from the first paint; everything else happens in render callbacks after hydration.

## User Stories

1. As an application developer, I want to write `<dialog nfsReveal class="reveal">` where the dialog belongs in my template, so that its content keeps my component's bindings and styles and nothing is moved in the DOM.
2. As an application developer, I want `[nfsOpen]="signup"` on a button to open the Reveal, so that I link the two with a typed reference instead of an id.
3. As an application developer, I want a bare `nfsClose` on the `.close-button` inside the Reveal to close it, so that Foundation's docs markup works with one attribute changed.
4. As an application developer, I want `[nfsCloseResult]="true"` on a close button and the value on `(closed)`, so that a confirmation dialog reports the choice.
5. As an application developer, I want `[(isOpen)]` two-way binding, so that my component state and the dialog agree.
6. As an application developer, I want `open()`, `close(result)`, and `toggle()` through the template reference, so that I can drive the dialog from code.
7. As an application developer, I want Foundation's size classes, `.full`, `.collapse`, and full screen below medium to look exactly as in Foundation 6.9, so that migrating changes nothing visible.
8. As an application developer, I want a short modal placed where Foundation's JavaScript placed it, a quarter of the free space from the top and centred, so that the default look is Foundation's.
9. As an application developer, I want numeric `vOffset` and `hOffset`, so that Foundation's fixed placement keeps working at medium and up.
10. As an application developer, I want tall content to scroll inside the dialog with its end reachable, so that long forms work on short screens.
11. As an application developer, I want `overlay: false` to give a dialog without a backdrop that leaves the page usable, so that Foundation's no-overlay example keeps working.
12. As a user, I want a press on the backdrop to close the modal when `closeOnClick` is on, so that I can dismiss it without hunting for the close button.
13. As a user on a tablet, I want a finger swipe that starts on the backdrop not to close the modal, so that scrolling attempts are not destructive.
14. As a user, I want a press that starts inside the dialog and ends on the backdrop (a text selection) not to close it, so that selecting text is safe.
15. As a keyboard user, I want Escape to close the topmost modal and return focus to the button that opened it, so that I can back out one layer at a time.
16. As an application developer, I want `closeOnEsc: false` to keep the modal open however often Escape is pressed, so that a forced choice stays forced.
17. As an application developer, I want a `closePredicate` that can veto closing while a form is dirty, so that a stray Escape, backdrop press, or close button does not lose the user's input.
18. As a keyboard user, I want focus to move into the dialog when it opens, onto its first control, never onto the dialog box itself, so that I can act at once and screen readers do not read the whole dialog as one blob.
19. As an application developer, I want `autoFocus` to pick the first tabbable element, the first heading, or a selector, so that long text or destructive dialogs can start focus where the APG advises.
20. As an application developer, I want an `autofocus` attribute on a control inside the dialog to be honoured, so that the platform's own way of choosing initial focus still works.
21. As a keyboard user, I want Tab and Shift+Tab to wrap inside a modal in every browser, so that focus never escapes to the browser chrome or lands on the dialog box.
22. As a keyboard user, I want focus to return to the Trigger when the dialog closes, including in Safari where clicking a button does not focus it, so that I continue where I was.
23. As a keyboard user, I want focus to return somewhere sensible when the dialog that contained my Trigger was closed to open this one, so that focus does not fall to the page body.
24. As a user, I want the page behind a modal not to scroll, and to be at the same position after it closes, so that I do not lose my place.
25. As an application developer, I want nested modals with `multipleOpened`, each layer returning focus to the button in the layer below, so that Foundation's nested example works.
26. As an application developer, I want opening a Reveal to close other open Reveals by default, so that Foundation's `multipleOpened: false` default is kept.
27. As an application developer, I want `role="alertdialog"` for confirmations, so that assistive technology announces them as alerts.
28. As an application developer, I want `animationIn` and `animationOut` to take `nfs-*` keyframe classes and fade the backdrop with them, so that Foundation's animated modal example works without Motion UI.
29. As an application developer, I want `(opened)` after the enter animation and `(closed)` after the dialog has closed, so that my handlers see the final state.
30. As a user who asked for reduced motion, I want the dialog to open and close without motion, so that animation does not bother me.
31. As an application developer, I want `deepLink` to open the Reveal when the URL hash names it, and to write and clear the hash, so that dialogs can be linked and the Back button closes them.
32. As an application developer, I want `updateHistory` to push history entries instead of replacing them, so that Foundation's option keeps its meaning.
33. As an application developer, I want a `<form method="dialog">` inside the Reveal to close it and report the submitter's value, so that the platform's own close mechanism stays usable.
34. As an application developer, I want dev-mode warnings for a dialog without an accessible name, an alert dialog without a description, a Motion UI transition class, a deep-linked dialog without my own id, a `tabindex` on the dialog, and a dialog with nothing focusable, so that I catch mistakes before users do.
35. As an application developer, I want application-wide defaults through a Defaults token, so that I set `animationIn` once for every Reveal.
36. As a component author, I want to inject the enclosing Reveal from a component inside it, so that my content can close its dialog with a result.
37. As a screen reader user, I want the dialog announced as a dialog with its title as the name, and the rest of the page unreachable while it is modal, so that I know where I am.
38. As a user with low vision, I want the close glyph and the dialog's edge to contrast with their surroundings, so that I can find the close control and the dialog's extent.
39. As a user at 320 CSS px or 400% zoom, I want the dialog full screen and scrollable, so that nothing is cut off.
40. As a developer of a server-rendered application, I want the closed dialog and its content in the server HTML, so that crawlers see the content and hydration changes nothing.
41. As a developer of a server-rendered application, I want an open-by-default modal Reveal to become modal after hydration without errors, so that first-visit dialogs work.
42. As a developer of a server-rendered application, I want a click on the Trigger before hydration to open the dialog once the page hydrates, so that early clicks are not lost.
43. As a developer using incremental hydration, I want a Trigger and its Reveal in one `@defer (hydrate on interaction)` block to open on the first click, so that deferred dialogs work.
44. As a developer of a zoneless application, I want the Reveal to need no zone, so that it works with zoneless change detection.
45. As a library maintainer, I want every behaviour asserted through roles, attributes, focus, and geometry at the test layer that owns it, so that regressions surface where they belong.
46. As a developer of a server-rendered application, I want a non-modal Reveal that is open by default to be shown in the server HTML, so that its Trigger's expanded state is true from the first paint, the dialog does not pop in at hydration, and a click on its Trigger before hydration does what the user saw.

## Implementation Decisions

### Foundation contract

Foundation 6.9's Reveal, from its `Reveal.defaults`, its events, and its methods:

| Foundation Option | Default | What it does in 6.9 | Library counterpart |
| --- | --- | --- | --- |
| `animationIn` | `''` | Motion UI class for opening (the overlay gets `fade-in`); empty means jQuery `show()` | `animationIn` input, keyframe Motion classes only; the backdrop fades with it |
| `animationOut` | `''` | Motion UI class for closing (the overlay gets `fade-out`) | `animationOut` input, same rules |
| `showDelay`, `hideDelay` | `0` | Duration of jQuery `show()`/`hide()` when no animation is set | Dropped option: timing belongs to CSS (building-blocks 1.4) |
| `closeOnClick` | `true` | A click on the overlay closes; without an overlay, a body click closes unless `fullScreen` | `closeOnClick` input: a Backdrop press on a modal Reveal; the Light dismiss pointer rule on a non-modal one |
| `closeOnEsc` | `true` | A window `keydown` handler closes on Escape while open | `closeOnEsc` input: the directive handles unhandled Escape before the browser's close request, so `false` holds |
| `multipleOpened` | `false` | When false, fires `closeme.zf.reveal` before opening so other Reveals close | `multipleOpened` input: `false` closes the other open Reveals first; `true` stacks modals with nested `showModal()` |
| `vOffset` | `'auto'` | Inline `top`: `(viewport height - modal height) / 4`, or `min(100, vh / 10)` when taller than the viewport; a number is px | `vOffset` input; `'auto'` reproduced in CSS by rule 7; a number applies at medium and up |
| `hOffset` | `'auto'` | Inline `left`; `auto` centres; a number also zeroes the margins | `hOffset` input; `'auto'` is Foundation's CSS centring; a number applies at medium and up |
| `fullScreen` | `false` | Forced true by `.full`; forces `overlay: false` and disables the body click | Dropped option: write the `.full` Variant class; a full-screen Reveal stays modal |
| `overlay` | `true` | Generate `.reveal-overlay`; `false` adds `.without-overlay` | `overlay` input: `true` opens with `showModal()` and `::backdrop`, `false` opens with `show()` and binds `.without-overlay` |
| `resetOnClose` | `false` | Re-assigns `innerHTML` on close to stop media | Dropped option (building-blocks 1.4): re-parsing destroys Angular bindings; content that must reset is Lazy content under `@if (reveal.isOpen())` |
| `deepLink` | `false` | Opens on load when `location.hash` is `#id`, writes and clears the hash, follows `hashchange` | `deepLink` input, after hydration, consumer id required |
| `updateHistory` | `false` | `pushState` instead of `replaceState` | `updateHistory` input |
| `appendTo` | `'body'` | Where the overlay (or the modal) is moved | Dropped option: the top layer needs no move |
| `additionalOverlayClasses` | `''` | Extra classes on the generated overlay | Dropped option: there is no overlay element; the consumer puts classes on the dialog and styles `.reveal.<class>::backdrop` |

| Foundation event | When | Library counterpart |
| --- | --- | --- |
| `open.zf.reveal` | End of `open()`, synchronously, while the animation still runs | `opened` Completion output, after the enter animation |
| `closed.zf.reveal` | After the hide or animation | `closed` Completion output, after `dialog.close()`, carrying the result |
| `closeme.zf.reveal` | Before this Reveal opens, when `multipleOpened` is false, so others close | No output: the directive's own stack closes the others |
| `init.zf.reveal`, `destroyed.zf.reveal` | Plugin lifecycle | None (Angular lifecycle) |

Methods: `open()`, `close()`, `toggle()` keep their names (`open(trigger?)`, `close(result?)`, `toggle(trigger?)`); `destroy()` has no counterpart.

Dropped options and behaviours: `showDelay`, `hideDelay`, `fullScreen`, `resetOnClose`, `appendTo`, `additionalOverlayClasses`, `data-options`; the generated overlay and the move into it; `role="dialog"`, `aria-hidden`, `tabindex="-1"`, `data-yeti-box`, and `data-resize` stamped on the modal; focusing the modal; the static focus-trap list; `tabindex="0"` stamped on anchors; `.fast`/`.slow` copied to the overlay; the `resizeme` re-centring; Motion UI transition classes; the `$('.reveal:visible')` count.

### CSS class to Angular mapping

| Foundation class or element | Angular | Rationale |
| --- | --- | --- |
| `.reveal` (Structural class) | `NfsReveal`, selector `dialog[nfsReveal]`; the host also binds `.reveal` | Attribute directive on the consumer's element (ADR 0001, ADR 0007); the element is `<dialog>`, the one markup delta from Foundation's `div` |
| `.reveal-overlay` (generated) | None: `::backdrop`, coloured by rule 6 of the `nfs-reveal` mixin | Replaced by a platform feature (building-blocks 1.1) |
| `.tiny`, `.small`, `.large`, `.full`, `.collapse` (Variant classes) | Written by the consumer | Classes stay classes (ADR 0010's rule, applied here); `.full` replaces the `fullScreen` Option |
| `.without-overlay` (Foundation's non-modal class) | Host binding `[class.without-overlay]` from `overlay` being false | Foundation's own `position: fixed` rule for it |
| `.is-opening`, `.is-closing` (State classes) | Host bindings while an enter or exit Motion class runs | Foundation's own State class names (Dropdown's `.is-opening`, Drilldown's `.is-closing`); Foundation's Reveal Sass styles neither, so they only key the backdrop keyframes and the completion wait |
| Motion classes from `animationIn`/`animationOut` | Host class binding during the matching phase | ADR 0003, building-blocks 1.6 rules 1 and 4 |
| `html.is-reveal-open`, `html.zf-has-scroll` (State classes on `html`) | Written on the document element by the Scroll lock | Foundation's Sass does the locking; the directive writes the classes and the `top` offset |
| `.close-button` (CSS-only component) | Consumer markup with a bare `nfsClose` | The Close Button's classes belong to Foundation; the Trigger comes from the Triggers spec |

### Hierarchy and DI shape

```
ngx-foundation-sites/reveal  (secondary entry point)
  dialog[nfsReveal]   NfsReveal, exportAs 'nfsReveal'
    provides nfsOpenableToken (useExisting)     -> Triggers: bare nfsClose / nfsToggle inside
    provides nfsRevealToken   (useExisting)     -> content components that need their Reveal
    injects  nfsRevealDefaultsToken (optional)  -> Defaults token
    injects  nfsAnimationsToken (optional)      -> animations off in tests
    injects  InteractivityChecker, _IdGenerator (CDK), DOCUMENT, NgZone, Injector, DestroyRef
    uses     nfsLightDismiss(...) while open and non-modal (Anchored pane utility)
  NfsRevealStack      internal @Service(): the open Reveals in order, the Scroll lock, one window keydown listener
```

- `nfsOpenableToken` makes the Reveal the Nearest Openable of everything inside it, so a bare `nfsClose` closes it and a bare `nfsClose` inside a Dropdown pane inside it closes only the pane (Triggers spec, D4).
- `nfsRevealToken = new InjectionToken<NfsReveal>('nfsRevealToken')`, in a token file that imports only types (building-blocks 1.9, ADR 0009): a component projected into the dialog injects it with `{optional: true}` to call `close(result)`, the declarative counterpart of injecting Material's `MatDialogRef`. A nested Reveal provides its own, so the nearest wins.
- `nfsRevealDefaultsToken: InjectionToken<NfsRevealDefaults>`, all-optional Material shape B (building-blocks 1.4): `overlay`, `closeOnClick`, `closeOnEsc`, `multipleOpened`, `vOffset`, `hOffset`, `animationIn`, `animationOut`, `deepLink`, `updateHistory`, `autoFocus`, `restoreFocus` (boolean only). Provided at bootstrap, route, or element level; the nearest wins.
- `NfsRevealStack` holds state shared across instances, which is the only reason a service is allowed (building-blocks 1.5): the ordered list of open Reveals (for `multipleOpened`, the topmost modal, and the focus fallback), the Scroll lock count, and the single `window` `keydown` listener that exists only while a modal Reveal is open. It is internal to the entry point, not public API.
- Non-modal Reveals use the Light dismiss registry through `nfsLightDismiss` from the Anchored pane utility (group `null`, `outsidePress` from `closeOnClick`, Triggers from `registerTrigger`); modal Reveals never register, because the page behind them is inert.
- Entry point `ngx-foundation-sites/reveal`; it imports the Triggers token and the Anchored pane utility.

### API

```ts
type NfsRevealRole = 'dialog' | 'alertdialog';
type NfsRevealAutoFocus = 'first-tabbable' | 'first-heading' | (string & {}) | false;
type NfsRevealRestoreFocus = boolean | string | HTMLElement;
type NfsRevealOffset = number | 'auto';

class NfsReveal implements NfsOpenable { // selector dialog[nfsReveal], exportAs 'nfsReveal'
  readonly isOpen: ModelSignal<boolean>;
  readonly id: InputSignal<string>;
  readonly triggerRole: Signal<'dialog' | 'modal-dialog'>;
  readonly overlay: InputSignalWithTransform<boolean, unknown>;
  readonly closeOnClick: InputSignalWithTransform<boolean, unknown>;
  readonly closeOnEsc: InputSignalWithTransform<boolean, unknown>;
  readonly multipleOpened: InputSignalWithTransform<boolean, unknown>;
  readonly vOffset: InputSignalWithTransform<NfsRevealOffset, unknown>;
  readonly hOffset: InputSignalWithTransform<NfsRevealOffset, unknown>;
  readonly animationIn: InputSignal<string>;
  readonly animationOut: InputSignal<string>;
  readonly deepLink: InputSignalWithTransform<boolean, unknown>;
  readonly updateHistory: InputSignalWithTransform<boolean, unknown>;
  readonly role: InputSignal<NfsRevealRole>;
  readonly autoFocus: InputSignalWithTransform<NfsRevealAutoFocus, NfsRevealAutoFocus | ''>;
  readonly restoreFocus: InputSignalWithTransform<NfsRevealRestoreFocus, NfsRevealRestoreFocus | ''>;
  readonly closePredicate: InputSignal<((result: unknown) => boolean) | null>;
  readonly opened: OutputEmitterRef<void>;
  readonly closed: OutputEmitterRef<unknown>;
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;
  toggle(trigger?: HTMLElement): void;
  registerTrigger(trigger: HTMLElement): () => void;
}
```

Inputs (Foundation Options first, then the Material-derived ones):

| Input | Kind | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `overlay` | `input()`, `booleanAttribute` | boolean | `true` | `data-overlay` | `false` is a non-modal dialog (`show()`), dismissed by Light dismiss; its Triggers render `aria-expanded` only then |
| `closeOnClick` | `input()`, `booleanAttribute` | boolean | `true` | `data-close-on-click` | Modal: a Backdrop press (down and up on the backdrop), not a click that ends there; non-modal: the Light dismiss pointer rule |
| `closeOnEsc` | `input()`, `booleanAttribute` | boolean | `true` | `data-close-on-esc` | Also covers the platform's other close requests (the Android back gesture) on a modal; always reliable for the Escape key |
| `multipleOpened` | `input()`, `booleanAttribute` | boolean | `false` | `data-multiple-opened` | Escape closes only the topmost modal (Foundation closed every open one) |
| `vOffset` | `input()`, transform `'auto'` or `numberAttribute` | number (px) or `'auto'` | `'auto'` | `data-v-offset` | `'auto'` is CSS; a number applies at medium and up only (below medium the dialog is full screen) |
| `hOffset` | `input()`, same transform | number (px) or `'auto'` | `'auto'` | `data-h-offset` | Same |
| `animationIn` | `input()` | string (space-separated classes) | `''` | `data-animation-in` | Keyframe Motion classes only (ADR 0003); dev warning for a Motion UI transition class |
| `animationOut` | `input()` | string | `''` | `data-animation-out` | Same |
| `deepLink` | `input()`, `booleanAttribute` | boolean | `false` | `data-deep-link` | Applies after hydration; requires a consumer-supplied `id` |
| `updateHistory` | `input()`, `booleanAttribute` | boolean | `false` | `data-update-history` | `history.state` passed through |
| `id` | `input()` | string | generated, prefix `nfs-reveal-` | The consumer's required `id` | Optional except with `deepLink`; bound as `[attr.id]`; the Openable's `id` |
| `role` | `input()` | `'dialog' \| 'alertdialog'` | `'dialog'` | None (Foundation stamps `role="dialog"`) | New, Material's `role`; `'alertdialog'` renders `role="alertdialog"`, `'dialog'` renders nothing (the element's implicit role) |
| `autoFocus` | `input()`, transform (`''` becomes `'first-tabbable'`, `'false'` becomes `false`) | `'first-tabbable' \| 'first-heading' \|` selector `\| false` | `'first-tabbable'` | None (Foundation focuses the modal) | New, Material's union without `'dialog'` |
| `restoreFocus` | `input()`, transform (`''` becomes `true`, `'false'` becomes `false`) | boolean, selector, or element | `true` | None (Foundation always refocuses its anchor) | New, CDK's `RestoreFocusValue` |
| `closePredicate` | `input()` | `(result) => boolean`, or `null` | `null` | None | New, Material's `closePredicate` with the result only |

Model, outputs, methods:

| Member | Meaning |
| --- | --- |
| `isOpen` (model, change output `isOpenChange`) | `true` from an open request until a close request is accepted, not waiting for animations (the Openable contract); `[isOpen]="true"` opens by default after hydration. A parent writing `false` closes without asking `closePredicate`: the parent owns its own state |
| `opened` | Completion output: after `showModal()`/`show()` and the enter animation (or in the render callback after the dialog was shown, when there is none); not emitted for a non-modal Reveal open at first paint, which the directive never shows (the initial-state rule of the Toggler and Dropdown pane specs) |
| `closed` | Completion output with the result: the value passed to `close(result)` (`nfsCloseResult` through `nfsClose`), `undefined` for Escape, Backdrop press, Light dismiss, a sibling close, or a parent model write, and the dialog's `returnValue` for a native close (`<form method="dialog">`, a forced close request) |
| `open(trigger?)` | Records `trigger` as the element focus returns to and requests the open; a no-op when already open. When a close is still animating, it cancels the exit and the dialog stays open with no events |
| `close(result?)` | A no-op when closed; otherwise asks `closePredicate(result)`, and when it does not veto, requests the close, keeping `result` for `closed` |
| `toggle(trigger?)` | `isOpen() ? close() : open(trigger)` |
| `registerTrigger(trigger)` | Remembers the element so the Light dismiss pointer rule treats presses on it as inside (non-modal Reveals); returns the unregister function |
| `triggerRole` | `computed` from `overlay`: `'modal-dialog'` while `overlay` is true (Triggers render `aria-haspopup="dialog"` and `aria-controls`; the Trigger is inert while the dialog is open), `'dialog'` when it is false (Triggers add `aria-expanded`) (Triggers spec) |

No `beforeClosed` output: building-blocks 1.4 allows no start events, and the start of a close is already observable as `isOpenChange(false)`, emitted the moment the close is accepted, before the exit animation. Material's `backdropClick()` and `keydownEvents()` are template `(pointerdown)` and `(keydown)` bindings on the consumer's own `<dialog>`.

Behaviour:

- Opening (render callback after the open request, see Render hooks): capture the element to return focus to (the `trigger`, else the element focused now); when `multipleOpened` is false, call `close()` on every other open Reveal (each asks its own `closePredicate`; a veto leaves it open underneath); remove a static `autofocus` attribute from the host; reset `returnValue`; apply the Scroll lock if this is the first modal; call `showModal()` (or `show()` when `overlay` is false); place focus (Focus below); write the hash for `deepLink`; start the enter completion wait.
- Open at first paint (non-modal only): a Reveal with `overlay` false that is open at its first render, on the server or on the client, already carries `open` from its first-render binding (Rendering modes). Its first render callback records the restore target and the stack entry, closes the other open Reveals when `multipleOpened` is false, and registers with Light dismiss; it does not call `show()` or emit `opened`, because the dialog has been shown since the first paint. It places focus as an open does only when nothing else has focus: focus on `body`, or on the host itself, because a static `autoFocus` attribute is HTML's `autofocus`, which focuses a dialog parsed open at page load in all three engines (the callback removes the attribute first, so the dialog element never keeps focus). Focus the user put anywhere else before hydration stays there (measured in three engines), and the Light dismiss focus rule then closes the dialog on the next focus move outside it. Without the focus placement, a keyboard user's first Tab to anything outside the dialog would close it before it could be reached. Every later open follows the opening steps above.
- Closing: when `closePredicate` does not veto, `isOpen` becomes false; the hash is cleared for `deepLink`; when an exit Motion class runs, `.is-closing` and the class are bound and the directive waits for it; then it calls `dialog.close()` itself, removes the Scroll lock if this was the last modal, restores focus, and emits `closed`. `dialog.close()` is a direct DOM call inside the completion callback, so the dialog is gone in the same frame the keyframes end and never flashes back.
- Escape on a modal Reveal: `NfsRevealStack` listens for `keydown` on `window` in the bubble phase while a modal is open. For an unmodified-by-IME (`isComposing` false) Escape that no inner handler has cancelled (`defaultPrevented` false), the topmost modal Reveal calls `close()` when `closeOnEsc` is true, then calls `preventDefault()` as its last statement whether it closed or not. Cancelling the `keydown` stops the browser from treating Escape as a close request at all (WHATWG HTML close request steps: "If the web developer cancels the event by calling `preventDefault()`, then nothing further happens"), so no `cancel` and no native close follow, however often Escape is pressed, and the exit animation always runs. Listening on `window`, after `document`, lets a combobox, a select, or an open Dropdown pane inside the dialog (whose Light dismiss handler cancels the key after closing the pane) consume Escape first.
- Other close requests on a modal (the Android back gesture, an assistive-technology dismiss gesture): the `cancel` event on the host is cancelled when it is cancelable, then routed to `close()` when `closeOnEsc` is true. A non-cancelable `cancel` (the browser's anti-abuse rule for close requests without user activation) cannot be vetoed; the native close follows and the directive re-syncs.
- Native close (`close` event not caused by the directive: `<form method="dialog">`, a forced close request, a consumer calling `dialog.close()`): `isOpen` becomes false, the phase is set idle, the stack entry and the Scroll lock are released, focus is restored, the hash is cleared, and `closed` carries `returnValue`. There is no exit animation and no `closePredicate` on this path; `nfsClose` is the close button that animates and can be vetoed.
- Backdrop press (modal only): a `pointerdown` on the host whose target is the host and whose point lies outside the dialog's border box records a press; the following `pointerup`, with the same test, closes when `closeOnClick` is true; `pointercancel` clears it. The target test excludes presses on content; the border-box test excludes presses on the dialog's own padding, which also report the host as target. Both ends must be on the backdrop, the model the HTML standard gives dialog light dismiss and the one the library's Light dismiss uses (ADR 0024), so a touch scroll (which ends in `pointercancel`) and a drag in either direction between content and backdrop never close. The resulting `click` lands on the dialog, never on the page underneath.
- Non-modal (`overlay` false): `nfsLightDismiss` registers the Reveal while it is open: an outside press (down and up outside, Triggers inside) closes it when `closeOnClick` is true (reason `'click'`); Escape from anywhere closes the topmost Light dismiss entry (reason `'keydown'`), which the directive honours only when `closeOnEsc` is true; focus moving outside closes it (reason `'tab'`). Every reason goes through `close()` and so through `closePredicate`. There is no Tab wrap and no Scroll lock: the page stays usable, as a non-modal dialog should. Known limit: a modal Reveal written inside a non-modal Reveal's element and opened with `multipleOpened` receives Escape only after the non-modal one has closed, because the registry's document handler runs before the `window` handler; a modal written outside it is unaffected, since focus moving into it closes the non-modal one.
- `multipleOpened: true`: each Reveal calls `showModal()` on top of the others; the top layer orders them. Escape, Backdrop press, and Tab wrap act on the topmost only.
- Deep linking (only when `deepLink` is true, all after the first render): in the first render callback, and on every `hashchange` (a `window` listener added in an `afterRenderEffect` keyed on `deepLink`, removed in its cleanup and on destroy), a hash equal to `#` plus `id()` opens the Reveal when closed; any other hash closes it when open (Foundation's `_handleState`), so a non-modal Reveal open at first paint closes at hydration when the hash does not name it, and `deepLink` is not combined with `[isOpen]="true"`. Opening writes `location.pathname + location.search + '#' + id()` with `history.replaceState(history.state, '', url)`, or `pushState` with `updateHistory`, unless the hash is already there; closing while the hash names this Reveal writes `pathname + search` the same way. Passing `history.state` through keeps the Router's own entry data, as the Tabs spec does. A hash-driven change writes nothing.
- Destroy while open: the stack entry is removed, the Scroll lock is released if this was the last modal, timers are cleared, and the hash is left alone; removing an open `<dialog>` from the document closes it natively. No `closed` is emitted.
- Dev-mode checks, in one `afterNextRender` that exists only when `ngDevMode` is on, plus one check at open, each warning once per instance: (1) no `aria-labelledby` and no `aria-label` on the host; (2) `role` is `'alertdialog'` and there is no `aria-describedby`; (3) `animationIn` or `animationOut` names a Motion UI transition class (`/^(fade|slide|hinge|scale|spin)-(in|out)/` without the `nfs-` prefix): "Motion UI transition classes do not animate; use a keyframe class such as `nfs-fade-in`", the class applied unchanged; (4) `deepLink` with a generated id; (5) a `tabindex` attribute on the dialog (HTML forbids it on `<dialog>`); (6) at open, nothing tabbable inside the dialog (the APG strongly recommends a visible close button, and without one every engine focuses the dialog box).

### Focus

- Initial focus, placed right after `showModal()`/`show()` in the same render callback, from `autoFocus`:
  - `'first-tabbable'` (default): a descendant carrying the `autofocus` attribute when it is focusable (the platform's own choice, which the dialog focusing steps already honoured); otherwise the first element in sequential focus order for which CDK `InteractivityChecker` reports focusable, visible, and tabbable. When nothing qualifies, focus is left where the browser put it and dev check 6 fires.
  - `'first-heading'`: the first `h1` to `h6` or `[role="heading"]` inside; the APG's choice for dialogs that open on long text.
  - any other string: the first descendant matching it as a selector; the APG's choice for "the least destructive action" in an alert dialog.
  - `false`: the directive moves no focus; the browser's dialog focusing steps decide.
  - A heading or selector target that is not focusable gets a temporary `tabindex="-1"`, removed on its `blur`, as CDK Dialog does. The dialog element itself is never the target (APG).
- Static `autoFocus`: HTML attribute names are case-insensitive, so `autoFocus="first-heading"` on the host is also the HTML `autofocus` attribute, which makes Firefox and WebKit focus the dialog itself. The directive removes its host's `autofocus` attribute before every `showModal()`/`show()`. A bound `[autoFocus]` renders no attribute.
- Tab wrap (modal only): a host `keydown` handler takes every Tab and Shift+Tab, computes the tabbable elements inside the dialog in sequential focus order (positive `tabindex` values first in ascending order, then document order; in a radio group only the checked radio, or the first when none is checked; each element focusable, visible, and tabbable by `InteractivityChecker`), moves focus to the next or previous one with wrap-around, then calls `preventDefault()`. Focus on the dialog element itself or on `body` goes to the first element (Tab) or the last (Shift+Tab). The directive handles every Tab, not only the ends, because WebKit puts the dialog element into its own Tab order and leaves links out of it, so an end-only check misfires there. No engine wraps natively.
- Restore focus, when `restoreFocus` is not `false`, after `dialog.close()` and after the Scroll lock has restored the page position: the target is the element given by `restoreFocus` (a selector resolved in the document, or an element), or for `true` the `trigger` passed to `open()`, else the element focused when the Reveal opened when that was not `body`, else the first registered Trigger (the Off-canvas spec's fallback), which covers a Reveal open at its first render: nothing opened it, so no `trigger` exists; in development mode, closing such a Reveal with no usable target logs a warning naming the `restoreFocus` input. Focus moves only when it is inside the dialog, on the dialog, on `body`, or nowhere (CDK Dialog's rule), so a non-modal Reveal closed by focus moving elsewhere does not pull focus back. When the target is disconnected or no longer focusable, and it sat inside a Reveal that this Reveal's opening closed (`multipleOpened` false), the target becomes that Reveal's own restore target, repeated up the chain; with no usable target, focus is not moved.
- WebKit does not focus a button on mouse click, so `document.activeElement` at open time is not the Trigger there; the Trigger passes itself through `open(trigger)` (Triggers spec), which is why the argument exists.

### Scroll lock

Ported from Foundation's `_disableScroll`/`_addGlobalClasses` and `_enableScroll`/`_removeGlobalClasses`, because the page scrolls behind an open modal in all three engines, with and without `overscroll-behavior: contain` (the Reveal dialog prototype):

- When the first modal Reveal opens, `NfsRevealStack` reads the page position and whether the document is taller than the viewport (`scrollHeight > clientHeight` on the document element) in the `earlyRead` phase, then in the `write` phase writes `top: -<scrollTop>px` on the document element (only when taller), toggles `zf-has-scroll`, and adds `is-reveal-open`. Foundation's `html.is-reveal-open` rule (`position: fixed; width: 100%; overflow-y: hidden`, `overflow-y: scroll` with `.zf-has-scroll`, `body { overflow-y: hidden }`) does the locking.
- When the last modal Reveal has closed (after its `dialog.close()`), it removes both classes and the inline `top`, and scrolls back to the saved position, before focus is restored.
- Non-modal Reveals do not lock (Foundation locked for every visible Reveal; the page behind a non-modal dialog stays usable, so it stays scrollable).
- Destroying the last open modal releases the lock (building-blocks 1.9, restore every global touched).

### Implementation level and primitives

Implementation level: native platform. `<dialog>`, `showModal()`, `show()`, the top layer, `::backdrop`, `:modal`, the `cancel` and `close` events, and implicit inertness of the rest of the page are Baseline widely available and inside the Browser target (ADR 0007). `@angular/aria` 22.2 has no dialog pattern. CDK Dialog, ADR 0007's named fallback, is not needed for any case: the Reveal dialog prototype matched Foundation's own `.reveal` inside `.reveal-overlay` to the pixel for every size at 320, 640, and 1024 px in Chromium, Firefox, and WebKit once the Library mixin's rules were added, and CDK Dialog would not use `<dialog>`, defaults `aria-modal` off, and hides siblings with `aria-hidden`. `dialog.closedby`, `requestClose()`, `CloseWatcher`, `@starting-style`, and Invoker Commands are out of target and not used (Further Notes).

Primitives: `HTMLDialogElement.showModal()`, `show()`, `close()`, `returnValue`; `cancel` and `close` events; Pointer Events on the host; `keydown` with `event.key` and `isComposing`; `animationend`/`animationcancel` with `pseudoElement` and `animationName`; `getComputedStyle` for the animation lengths; CDK `InteractivityChecker` (focusable, visible, tabbable) and `_IdGenerator`; the History API and `hashchange`; `model()`, `input()` with transforms, `output()`, `computed()` (one of them reading `isOpen` and `overlay` untracked, so the first-render `open` binding never re-evaluates), one `linkedSignal` for the animation phase, `afterRenderEffect`, `afterNextRender`, `inject()` with `optional`, host metadata for classes, attributes, custom-property style bindings, and listeners; `NgZone.runOutsideAngular` for the fallback timer and the `window` listeners; `nfsLightDismiss` from the Anchored pane utility.

Render hooks and effects (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Open and close sync (showModal, close, Scroll lock, focus, history) | `afterRenderEffect` with phases: `earlyRead` reads `document.activeElement` and the page scroll position before anything moves; `write` applies the Scroll lock, removes `autofocus`, calls `showModal()`/`show()` or `close()`, places or restores focus, and writes history; `read` measures the host's computed animations after the phase classes are bound and starts the completion wait | It re-runs only when `isOpen`, the phase, or `overlay` change, so a closed Reveal costs nothing; the phases keep the scroll read ahead of the lock's writes; it covers open-by-default because its first run follows the first render, and never runs on the server |
| Deep-link listener and first hash read | `afterRenderEffect` keyed on `deepLink` (cleanup removes the `hashchange` listener) | Follows a changing input; `location` and `history` only after first render (building-blocks 1.11 decision 3) |
| Dev-mode checks | `afterNextRender`, only when `ngDevMode` | One-shot, browser-only, removed in production |
| Light dismiss registration (non-modal) | `nfsLightDismiss`, which registers in its own render callback while open | Owned by the Anchored pane utility |
| `effect` | Not used | Every side effect here touches the DOM, focus, `window`, or `history`, and an `effect` also runs on the server |
| `afterEveryRender` | Not used | It would run after every change detection in the application for a dialog that is almost always closed |

`injectAsync`: not used. Nothing is loaded only after a client interaction: the directive must be live at hydration to receive a replayed Trigger click, and `InteractivityChecker` is needed in the same render callback that opens the dialog, where an awaited chunk would delay focus placement (building-blocks 1.11; the Anchored pane spec's D20 reasoning). The entry point lets a consumer's `@defer` load the Reveal with the widget that needs it.

Fallback: for rule 7 (the `'auto'` offsets in CSS), which the [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md) confirmed, so the fallback is not triggered, it is the measured port of Foundation's `_updatePosition`, kept on record in case exact placement of dialogs taller than rule 4's cap is ever required: after `showModal()`, read the dialog's natural height (`scrollHeight` plus the block borders, not `offsetHeight`) and the viewport height in the same `write`-phase callback, write `--nfs-reveal-top` and `--nfs-reveal-shift: 0px` rather than inline `top`, so that rule 4 mirrors it, and re-run from a `ResizeObserver` that observes the content, not only the host, and a `window` `resize` listener while open. Reading `offsetHeight` measures the capped box and reproduces rule 7's capped placement exactly (measured), and a `ResizeObserver` on a capped host does not fire when content grows inside it. No other behaviour depends on an unverified mechanism.

### Comparison with Angular Material

| Concern | Material `MatDialog` (on CDK Dialog) | `NfsReveal` |
| --- | --- | --- |
| Shape | `@Service()` that opens a component or template into an overlay container and returns a `MatDialogRef` | Directive on the consumer's `<dialog>` in place; the reference is the template variable (`#x="nfsReveal"`) or `nfsRevealToken` inside |
| Open and close | `open(component, config)`, `ref.close(result)` | `open(trigger?)`, `close(result?)`, `toggle()`, `[(isOpen)]`, and the Triggers |
| Result | `afterClosed()` emits the result | `closed` output carries the result |
| Lifecycle | `afterOpened()`, `beforeClosed()`, `afterClosed()`, `getState()` | `opened`, `isOpenChange`, `closed`; `.is-closing` shows the closing state in CSS |
| Veto | `closePredicate(result, config, instance)`, `disableClose` | `closePredicate(result)`; `closeOnEsc` and `closeOnClick` for the per-gesture switches |
| Close button | `[mat-dialog-close]="result"`, `type="button"` default, `aria-label` input | Bare `nfsClose` with `[nfsCloseResult]`; `type` and names are native attributes |
| Title and name | `mat-dialog-title` queues its id into `aria-labelledby`; `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy` config | The consumer's `aria-labelledby`, `aria-label`, `aria-describedby` on the `<dialog>`; dev warnings when missing |
| Role | `role: 'dialog' \| 'alertdialog'` | Same values, `role` input |
| Modality | CDK overlay, `aria-modal` configurable (default false), `aria-hidden` on siblings | Native `showModal()`: top layer and inert page; no `aria-modal`, no `aria-hidden` |
| Backdrop | `hasBackdrop`, `backdropClass`, `backdropClick()` | `overlay`; `::backdrop` styled by Foundation's setting; the consumer styles `.reveal.<class>::backdrop` |
| Escape | Closes without modifier keys unless `disableClose` | Unhandled Escape closes the topmost modal unless `closeOnEsc` is false or the predicate vetoes; the close request is cancelled so vetoes hold |
| Initial focus | `autoFocus`: `'first-tabbable'`, `'first-heading'`, `'dialog'`, selector, boolean | Same without `'dialog'` (the APG forbids focusing the dialog element); `false` leaves the browser's choice |
| Focus trap | CDK `FocusTrap` with sentinels | Native containment plus the directive's Tab wrap (CDK's sentinels would sit outside the dialog, in the inert page) |
| Restore focus | `restoreFocus: boolean \| string \| HTMLElement`, only when focus is still inside | Same type and guard, plus the `trigger` from `open(trigger)` and the fallback up closed Reveals |
| Sizing and position | `width`, `height`, `min*`, `max*`, `position` config | Foundation's Variant classes and `vOffset`/`hOffset` |
| Scroll | `scrollStrategy` (block by default) | Foundation's `html.is-reveal-open` Scroll lock |
| Several dialogs | `openDialogs`, `closeAll()` | `multipleOpened` |
| Navigation | `closeOnNavigation` (true) | Not borrowed: a Reveal lives in a template and is destroyed with its route; a Reveal in a persistent layout stays open, as in Foundation |
| Animation | MDC classes plus a timer, or keyframes with `animationend` and a fallback of total time plus 100 ms | Keyframe Motion classes through State classes, `animationend` filtered by name, measured length plus 100 ms fallback |

Borrowed: `close(result)`, `closePredicate`, the `autoFocus` union, `restoreFocus`, `role`, the `[mat-dialog-close]` result through `nfsClose`, the restore-only-when-focus-is-inside guard, the fallback timer. Not borrowed: the service and overlay container, `aria-modal` and sibling `aria-hidden`, sizing config, `closeOnNavigation`, `beforeClosed()`, `backdropClick()`, `keydownEvents()`.

### ARIA and keyboard

APG pattern: Dialog (Modal) for `overlay: true`; Alert Dialog when `role` is `'alertdialog'`; a non-modal dialog for `overlay: false`, which the APG treats as not modal.

| Element | Attribute | Value and source |
| --- | --- | --- |
| `<dialog>` | role | Implicit `dialog`; `role="alertdialog"` from the `role` input |
| `<dialog>` | modal state | From `showModal()` (the top layer and the inert page); `aria-modal` is never set |
| `<dialog>` | accessible name | The consumer's `aria-labelledby` pointing at the visible title, else `aria-label` (required; dev check 1) |
| `<dialog>` | description | The consumer's `aria-describedby`; required for `alertdialog` (dev check 2), omitted when the content is structured (APG) |
| `<dialog>` | `id` | The `id` input; what the Triggers' `aria-controls` names |
| `<dialog>` | `open` | Set by `showModal()`/`show()`; bound only for a non-modal Reveal open at its first render, from a value fixed then, so no later change detection writes it (Rendering modes) |
| `<dialog>` | `tabindex`, `aria-hidden` | Never (HTML forbids `tabindex` on `<dialog>`; closed dialogs are `display: none`) |
| Trigger | `aria-haspopup="dialog"`, `aria-controls`; plus `aria-expanded` only when `overlay` is false | Triggers spec, `modal-dialog` or `dialog` Trigger role |
| `.close-button` | name | The consumer's `aria-label`; the `&times;` glyph is `aria-hidden="true"` (Foundation's docs markup) |

| Key | Modal Reveal | Non-modal Reveal | Owner |
| --- | --- | --- | --- |
| Tab | Next tabbable element inside, wrapping from the last to the first | Native order; leaving the dialog closes it | Directive (modal); Light dismiss (non-modal) |
| Shift+Tab | Previous, wrapping from the first to the last | Native order; leaving closes it | Same |
| Escape | Closes the topmost modal, unless `closeOnEsc` is false or `closePredicate` vetoes; an inner control or open pane handles it first | Closes it from anywhere on the page, same conditions, topmost Light dismiss entry first | `NfsRevealStack` (modal); Light dismiss (non-modal) |
| Enter, Space on a Trigger or `nfsClose` | Activates (native button) | Same | Native |

Focus rules: focus moves into the dialog on open and never onto the dialog element; returns to the Trigger on close; nested layers return focus to the button in the layer below (APG nested dialog example).

### WCAG 2.2 AA criteria

Requirements, each checked where stated.

| Criterion | Requirement and how it is met | Check |
| --- | --- | --- |
| 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value | The dialog exposes role `dialog` (or `alertdialog`), modal state, and a name. Role and modal state come from `<dialog>` and `showModal()`; the name is required from the consumer's `aria-labelledby` or `aria-label`; an alert dialog requires `aria-describedby` | Dev checks 1 and 2; axe in every story with the dialog open; the screen-reader announcement is the release test under Testing Decisions |
| 1.4.3 Contrast (Minimum) | Text inside the dialog meets 4.5:1. Rule 5 makes the dialog inherit Foundation's body colour instead of the user-agent `CanvasText`; Foundation's defaults (`$body-font-color` on `$reveal-background`) pass | axe `color-contrast` in every story |
| 1.4.11 Non-text Contrast | The close glyph, the visual that identifies the `.close-button` control, contrasts at least 3:1 with the dialog in both states: `$closebutton-color` and `$closebutton-color-hover` against `$reveal-background` (defaults 3.42:1 and 19.63:1 against Foundation's `$white`, `#fefefe`; the 32 px glyph also counts as large text for 1.4.3). The dialog's edge contrasts at least 3:1 with the page dimmed by the backdrop: `$reveal-background` against `$reveal-overlay-background` composited over `$body-background` (defaults 3.17:1) | The `nfs-reveal` mixin computes the three ratios from the consumer's settings, each from Foundation's `color-luminance()` with the WCAG formula and compared unrounded (Foundation's `color-contrast()` is not used, because it rounds to one decimal and would pass 2.95:1). It stops the compile with `@error` naming the setting when a close-glyph ratio is under 3, as the `nfs-off-canvas` mixin does for the same glyph, and emits `@warn` naming the setting when the dialog-edge ratio is under 3 (axe has no 1.4.11 rule); node-level Sass test |
| 1.4.10 Reflow | At 320 CSS px (and 400% zoom of 1280 px) the dialog is full screen through Foundation's small-only rule; tall content scrolls inside the dialog, whose box ends inside the viewport (rule 4), so the end of the content is reachable without two-dimensional scrolling | e2e at 320 x 640 and with tall content |
| 1.4.13 Content on Hover or Focus | Not applicable: a Reveal opens on activation, never on hover or focus | None |
| 2.1.1 Keyboard, 2.1.2 No Keyboard Trap | Every Trigger is a native button; the modal contains focus by design and is left with Escape or a close button; with `closeOnEsc` false or a vetoing `closePredicate`, the dialog must contain a control that closes it | Dev check 6; story `reveal--alert-dialog` |
| 2.4.3 Focus Order | Focus moves into the dialog on open, wraps inside a modal, and returns to the Trigger on close; a non-modal Reveal sits in the tab order where it is written, so the consumer writes it right after its Trigger | Stories `reveal--basic`, `reveal--nested`; browser-level focus tests |
| 2.4.7 Focus Visible | The browser's `:focus-visible` ring shows on every control inside (Foundation removes outlines only under what-input's `[data-whatinput='mouse']`, which the library never loads) | e2e computed outline in three engines |
| 2.4.11 Focus Not Obscured (Minimum) | Modal: the page behind is inert, so focus never reaches content under the dialog; a focused control in a tall dialog is scrolled into view by the browser; the Trigger is focused after the Scroll lock has restored the page position. Non-modal: the dialog closes when focus moves outside it, one of the ways of passing the Understanding document names for non-modal content | e2e hit tests on focus stops and on the restored Trigger |
| 2.5.8 Target Size (Minimum) | Foundation's `.close-button` (18.7 x 32 px) passes by the spacing exception: no other target may come within the 24 px circle centred on it, so consumers keep other targets at least 12 px clear of its centre; Foundation's docs placement leaves 134 to 156 px | axe `target-size` (enabled by the `wcag22aa` tag) in every story |

No WCAG rule is added to the library CSS: Foundation's defaults pass every check above (the Reveal dialog prototype, axe with the WCAG 2.2 AA tags at 320 and 1024 px in every size, three engines).

### Rendered HTML

Consumer markup (Foundation's docs example with the two deltas: `<dialog>` for `div`, `nfsReveal` and `nfsClose` for the data attributes):

```html
<button nfsButton [nfsOpen]="signup">Click me for a modal</button>

<dialog nfsReveal #signup="nfsReveal" id="signup" aria-labelledby="signup-title" class="reveal">
  <h1 id="signup-title">Awesome. I Have It.</h1>
  <p class="lead">Your couch. It is mine.</p>
  <button class="close-button" type="button" aria-label="Close modal" nfsClose>
    <span aria-hidden="true">&times;</span>
  </button>
</dialog>
```

Server HTML (closed; identical for `[isOpen]="true"` on this modal Reveal, because only a non-modal Reveal binds `open`); `jsaction` lists the host's replayable listeners and is removed at hydration:

```html
<button class="button" type="button" aria-haspopup="dialog" aria-controls="signup" jsaction="click:;">Click me for a modal</button>
<dialog id="signup" aria-labelledby="signup-title" class="reveal" jsaction="pointerdown:;pointerup:;keydown:;">
  <h1 id="signup-title">Awesome. I Have It.</h1>
  <p class="lead">Your couch. It is mine.</p>
  <button class="close-button" type="button" aria-label="Close modal" jsaction="click:;"><span aria-hidden="true">&times;</span></button>
</dialog>
```

Hydrated, open, with `animationIn="nfs-fade-in"` while the enter animation runs (the page's `html` carries the Scroll lock):

```html
<html class="is-reveal-open zf-has-scroll" style="top: -1000px;">
...
<button class="button" type="button" aria-haspopup="dialog" aria-controls="signup">Click me for a modal</button>
<dialog id="signup" aria-labelledby="signup-title" class="reveal is-opening nfs-fade-in" open>
  ...
</dialog>
```

After the enter animation `is-opening nfs-fade-in` are gone; during the exit `is-closing nfs-fade-out` are bound while `open` stays; after `dialog.close()` the markup equals the server HTML without `jsaction`.

Non-modal, alert dialog, and offsets:

```html
<dialog nfsReveal #note="nfsReveal" id="note" class="reveal" aria-label="Note" [overlay]="false">...</dialog>
<!-- open: class="reveal without-overlay" open; not :modal; no html classes -->
<!-- its Trigger: aria-haspopup="dialog" aria-controls="note" aria-expanded="false", then "true" while open -->
<!-- with [isOpen]="true", server and hydrated: class="reveal without-overlay" open, and its Trigger aria-expanded="true" -->
<!-- a modal Reveal with [isOpen]="true" stays without open on the server and is shown by showModal() after hydration -->

<dialog nfsReveal #confirm="nfsReveal" id="confirm" class="tiny reveal" role="alertdialog"
        aria-labelledby="confirm-title" aria-describedby="confirm-text"
        autoFocus="#confirm-cancel" [closeOnClick]="false" [closeOnEsc]="false">...</dialog>
<!-- server: <dialog id="confirm" class="tiny reveal" role="alertdialog" aria-labelledby="confirm-title"
     aria-describedby="confirm-text" autofocus="#confirm-cancel" jsaction="...">; the directive removes
     the autofocus attribute before showModal() -->

<dialog nfsReveal id="placed" class="reveal" aria-label="Placed" vOffset="50" hOffset="20">...</dialog>
<!-- server and client: style="--nfs-reveal-top: 50px; --nfs-reveal-shift: 0px; --nfs-reveal-left: 20px;" -->
```

Generated ids differ between server and client and are rewritten at hydration, because the host `id` and every Trigger's `aria-controls` are host bindings (building-blocks 1.5).

### Animation

Per ADR 0003 and building-blocks 1.6 rule 1: the dialog stays in the DOM, so it animates through State classes and keyframes, never `animate.enter`/`animate.leave`, which play again at hydration on server-rendered elements ([Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)).

| Phase | Entered when | Host classes | Backdrop |
| --- | --- | --- | --- |
| idle | first render on server and client, and after every completion | none of the below | none |
| opening | `isOpen` becomes true after the first render, `animationIn` is non-empty, and animations are enabled | `is-opening` plus the `animationIn` classes | `nfs-reveal-backdrop-in` keyframes (modal only) |
| closing | `isOpen` becomes false, `animationOut` is non-empty, and animations are enabled | `is-closing` plus the `animationOut` classes | `nfs-reveal-backdrop-out` keyframes (modal only) |

- The phase is a `linkedSignal` derived from `isOpen`, so it is computed during change detection, starts idle on both platforms, and is set back to idle by completion. The classes are bound in the change detection pass before the render callback that calls `showModal()`, so the keyframes start from their first frame when the dialog becomes rendered.
- Default: no animation, Foundation's default (`animationIn` and `animationOut` are empty): the dialog and backdrop appear and disappear in one pass. `animationIn="nfs-fade-in" animationOut="nfs-fade-out"` (or the Defaults token) gives the fade; the backdrop fades whenever the dialog's class runs, as Foundation faded its overlay only with `animationIn`/`animationOut`.
- Completion: in the `read` phase after the classes are bound, the directive reads the host's computed `animation-name`, `animation-duration`, `animation-delay`, and `animation-iteration-count` and takes the longest finite animation (the Toggler spec's D8, Angular's own method for `animate.leave`). None measured (the class has no keyframes, or `nfs-motion` is missing) completes at once. Otherwise the phase completes on a host `animationend` or `animationcancel` whose `target` is the host, whose `pseudoElement` is empty, and whose `animationName` is one of the host's measured names, or on a fallback timer of the measured length plus 100 ms started outside the Angular zone, whichever comes first. The name check exists because the backdrop's animation events are dispatched on the dialog, and WebKit reports them with `pseudoElement: ''`; the backdrop's keyframes carry their own names for that reason.
- Interruption: a close request while opening switches to closing (or straight to closing without a class) and emits no `opened`; an open request while closing cancels the exit, removes `is-closing` and the class, keeps the dialog open, and emits nothing.
- Motion classes: keyframe classes only; `nfs-motion` provides the `nfs-*` set of building-blocks 1.6 rule 4, with `both` fill mode. Motion UI's own transition classes never animate under this mechanism ([Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md)) and trigger dev check 3. Foundation's docs example becomes `animationIn="nfs-spin-in" animationOut="nfs-spin-out"` when `nfs-motion` provides those names, or the consumer's own keyframe classes. Motion UI's `fast`/`slow` speed modifiers are not supported; a consumer who needs another speed writes a keyframe class. Keyframes may animate `transform` freely but must not animate the `translate` property, which rule 7 owns; the two translations add, so the rest position does not move (the [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md), case 5).
- Reduced motion: `nfs-motion` shortens its classes and the two backdrop animations to 1 ms under `prefers-reduced-motion: reduce`, so `animationend` still fires and nothing moves; no separate code path, and the Breakpoint service's `reducedMotion` is not read. A consumer's own keyframe class carries its own reduced-motion rule (the default path of the Breakpoint service spec's consumer rule 3, which also names the directives that instead bind no Motion class under reduced motion).
- `nfsAnimationsToken` with `{disabled: true}` keeps the phase idle, so tests open and close in one pass.
- Open-by-default and plain client rendering: the phase starts idle, so a Reveal that is open at its first render appears without its enter animation, as the Toggler does; opens after that (a Trigger, a deep link) animate.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server renders the consumer's `<dialog class="reveal">` with its content. A modal Reveal renders without `open`, whatever `isOpen` is, and the user-agent stylesheet hides it: a dialog cannot be made modal without script, and the `open` attribute alone is a non-modal dialog that `showModal()` cannot later promote (it throws `InvalidStateError` on it, measured in three engines). A non-modal Reveal that is open at its first render renders with `open`, the shown non-modal dialog that `show()` would make: the host binds `[attr.open]` to a value fixed at the first render, `''` when `isOpen` is true and `overlay` is false then and absent otherwise (a `computed` that reads both untracked, so it never re-evaluates), so the first paint matches `isOpen` and the `dialog`-role Trigger's `aria-expanded="true"` is true from the first paint (rule 1; building-blocks 1.11 decisions 1 and 2; the Triggers spec's rule that an Openable's server `isOpen` is its first-paint state). A modal Reveal open by default is the one case whose server `isOpen` differs from its first paint; its `modal-dialog` Triggers render nothing from `isOpen`, so no Trigger state is false. Host bindings on the server: `.reveal`, `id`, `role` for alert dialogs, `.without-overlay`, `open` as above, the offset custom properties. No phase class, no `html` class, no focus, no history (rule 1). Crawlers get the content in the DOM either way. Without JavaScript a modal Reveal open by default stays closed, and a non-modal one stays shown and can be closed only by a `<form method="dialog">` button inside it (measured in three engines), because its `nfsClose` buttons need script.
- Before hydration: construction reads only inputs, DI, and static attributes; `showModal()`, `focus()`, the Scroll lock, `location`, `history`, and listeners outside `host` metadata run only in render callbacks (rules 3 to 5). The fallback timer and the `window` listeners start in render callbacks and handlers, outside the zone (rule 4).
- Full hydration: host binding values equal the server's (generated ids aside, rewritten at hydration), so hydration changes nothing and there is no structure to mismatch. Hydration writes the fixed `open` value once more, which the HTML standard's attribute change steps ignore for a dialog that already has it: no `toggle` or `close` event, no focus move, and the dialog stays shown (measured in three engines). No animation plays at hydration, because the phase is idle on both platforms (rule 10). An open-by-default modal Reveal calls `showModal()` in the first `afterRenderEffect` run after hydration, with focus placed then; a non-modal Reveal open at first paint takes the first-paint path (Behaviour). When the client's first state is closed where the server's was open, hydration removes `open`, which hides the dialog without a `close` event (the HTML standard's note on removing the attribute; measured), so no `closed` fires for a dialog the client never opened. After a later `dialog.close()` the fixed value is never written again, so the dialog stays closed until `show()` reopens it (measured).
- Event replay: the Trigger's `click` host listener replays after hydration and calls `open(trigger)`, or `toggle(trigger)` for `nfsToggle`; the open runs in the following render callback. `showModal()` and `focus()` need no user activation, so a replayed open works, with focus inside the dialog. A Trigger click before hydration on a non-modal Reveal open at first paint replays as a close of the dialog the user saw open; with a closed server dialog the same click met a hidden dialog, which then appeared at hydration and was closed by the replayed toggle (both measured in three engines). The Reveal's own host listeners (`pointerdown`, `pointerup`, `keydown`) are annotated; on a modal Reveal they cannot fire before hydration, because the dialog is closed and not rendered, and on a non-modal Reveal open at first paint they replay into handlers that act only on modal Reveals. Escape pressed before hydration is lost, which is harmless for a closed dialog; the Light dismiss listeners are added in code and never replay, so a non-modal Reveal open at first paint cannot be dismissed by an outside press or Escape until hydration (the Dropdown pane spec's first-paint exception), while its `nfsClose` click replays and closes it. A `<form method="dialog">` button pressed before hydration closes the dialog natively, and hydration then writes `open` again and shows it, because Angular sets up an element's bound and static attributes when it claims the element (measured in three engines), so `nfsClose` is the close control of a Reveal that can be open at first paint. The Tab-wrap handler changes focus first and calls `preventDefault()` last (rule 5). The `window` and document listeners are added in code and never replay, which is correct.
- Hydration boundary: a Trigger and its Reveal belong to one hydration boundary (ADR 0008; building-blocks 1.11 decision 6); template-reference scoping stops a Trigger outside a `@defer` block from naming a Reveal inside it (ADR 0013).
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/reveal` is its own entry point. Inside a dehydrated block the Reveal is its server HTML, closed, or shown for a non-modal Reveal open at first paint; a Trigger click in the block hydrates it, replays, and opens or closes it. Inside `@defer (hydrate never)` the dialog stays in its server state and its Triggers do nothing: closed, or shown and closable only by a `<form method="dialog">` button, so content that must be reachable is not put in a Reveal inside `hydrate never`. Plain `@defer` renders the Reveal on the client like any client render. Heavy dialog content can itself be deferred inside the dialog (`@defer (when signup.isOpen())`); initial focus is placed when the dialog opens, so a control inside a still-loading block is not the initial focus target.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; the fallback timer and the `window` listeners run outside the Angular zone and write signals or call `close()`.

### Sass and custom CSS

The `nfs-reveal` Library mixin, included after `foundation-reveal`, prints seven rules; every other piece of the Reveal's look is Foundation's. Rules 1 to 5 share one selector, `.reveal[open]` (specificity 0,2,0, printed after Foundation, so they also beat `.reveal.tiny` and the other size classes):

1. `display: block`: Foundation's `reveal-modal-base` sets `display: none`, and its JavaScript showed the modal inline; a native dialog is shown by its `open` attribute.
2. `position: fixed`: the top layer computes Foundation's `position: relative` to `absolute`, whose containing block is the initial containing block, so on a scrolled page the dialog sat at the document top and focusing into it scrolled the page there.
3. `inset-inline: 0`: Foundation's medium-and-up centring (`left: auto; right: auto; margin: 0 auto`) centres only in-flow boxes; for a positioned box `auto` insets mean the static position.
4. `max-height: calc(100% - 2 * var(--nfs-reveal-top, min(100px, 10%)))`: a tall dialog scrolls itself (Foundation's `overflow-y: auto`), so its box must end inside the viewport; the cap leaves twice Foundation's tall-modal offset, `min(100px, 10vh)` (or twice a numeric `vOffset`). With `'auto'`, rule 7 places a capped dialog by the same quarter rule, `min(50px, 5vh)` from the top and three times that below it. Foundation used `min(100px, 10vh)` and let its overlay scroll, and placed a dialog between the cap and the viewport height at `(vh - h) / 4` without capping it. Full screen keeps its height, because Foundation's `min-height: 100%` wins over a smaller `max-height`.
5. `color: inherit`: the user-agent stylesheet gives `dialog` `color: CanvasText`; Foundation's `.reveal` inherited the body colour.
6. `.reveal::backdrop { background-color: $reveal-overlay-background }`: Foundation's `reveal-overlay` mixin cannot be included, because it also prints `display: none`.
7. At medium and up (Foundation's `breakpoint(medium)`), `.reveal[open]:not(.full) { top: var(--nfs-reveal-top, 25%); translate: 0 var(--nfs-reveal-shift, -25%); margin-left: var(--nfs-reveal-left, auto); }`: Foundation's JavaScript placed every modal with `vOffset: 'auto'` at `(viewport height - modal height) / 4`; `top: 25%` with a translate of `-25%` of the dialog's own height is exactly that while the dialog's natural height is at most `vh - 2 * min(100px, 10vh)` (rule 4's cap; a taller dialog is capped by rule 4 and then placed by the same quarter rule), in CSS, recomputed by the browser on every resize and content change. The [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md) confirmed it in Chromium, Firefox, and WebKit for every size, `.without-overlay`, RTL, a scrolled page, nested modals, numeric offsets, and full screen, within Foundation's own rounding, with text as crisp as at an integer `top`. `:not(.full)` leaves Foundation's full-screen `top: 0`. A numeric `vOffset` sets `--nfs-reveal-top` and a zero `--nfs-reveal-shift`; a numeric `hOffset` sets `--nfs-reveal-left`, so the box sits at that distance from the left edge while `inset-inline: 0` and the automatic right margin absorb the rest, in either text direction. Below medium the dialog is full screen and the numbers do not apply.

The custom properties `--nfs-reveal-top`, `--nfs-reveal-shift`, and `--nfs-reveal-left` are an implementation channel written by the directive's host style bindings, not theming (building-blocks 1.13). The mixin also runs the three compile-time contrast checks of the WCAG subsection. The `nfs-motion` mixin gains the two backdrop keyframes and their rules (Further Notes, Sass). The full Sass subsection is under Further Notes.

## Testing Decisions

A good test asserts what a user or assistive technology observes: whether the dialog is open and `:modal`, its role, name, and classes, where focus lands and where it returns, the page's scroll position, the dialog's geometry, the URL, and when `opened` and `closed` fire relative to the animation. No test reads private fields, the phase signal, or the stack. Prior art: the [Prototype: Reveal on native `<dialog>` under Foundation Sass](../issues/42-prototype-reveal-dialog.md) Playwright suite (29 tests in three engines, with the geometry values recorded there), the Triggers spec's four layers, and the Toggler spec's completion tests; nothing exists in the new repository yet.

Story ids follow `reveal--<story>`: `reveal--basic`, `reveal--sizes` (args: `tiny`, `small`, `large`, `full`, `collapse`), `reveal--tall-content`, `reveal--offsets`, `reveal--without-overlay`, `reveal--nested`, `reveal--replace`, `reveal--animated`, `reveal--alert-dialog`, `reveal--close-predicate`, `reveal--focus`, `reveal--programmatic`, `reveal--form-method-dialog`, `reveal--deep-link`, `reveal--scroll-lock`, and `reveal--fixture` (args-driven for e2e: size, offsets, overlay, content length, direction, page length, animation classes).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Stack: `@storybook/angular-vite` 10.6 with `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless; inferred `test-storybook`: `npx nx test-storybook <lib>`. Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` in the Storybook preview configuration, the enforcing gate, so `color-contrast` and `target-size` are part of it; play functions run axe again with the dialog open. CSR only; the single home of interaction tests.

- `reveal--basic`: clicking the Trigger opens a `:modal` dialog; focus is on its first tabbable element, never the dialog; the Trigger carries `aria-haspopup="dialog"` and `aria-controls` and no `aria-expanded` before, while, and after the dialog is open; the page behind is inert (a page button cannot be focused); Escape closes it and focus returns to the Trigger; the bare `nfsClose` closes it the same way.
- `reveal--sizes`: each Variant class renders with Foundation's width at the story viewport; `.collapse` has no padding.
- `reveal--tall-content`: the last control inside is reachable by Tab and scrolled into view; the dialog box ends inside the viewport.
- `reveal--without-overlay`: the dialog is open but not `:modal`, carries `.without-overlay`, and the page stays interactive; an outside press closes it; clicking its Trigger while open closes it once (no reopen); tabbing out of it closes it; Escape with focus on the page closes it; its Trigger shows `aria-expanded="true"` while open and `"false"` after it closes; a second one with `[isOpen]="true"` is open from the first render with its Trigger at `aria-expanded="true"`, takes focus only when nothing else has it, and does not fire `opened`.
- `reveal--nested`: with `multipleOpened`, the inner dialog opens above the outer; Escape closes only the inner and focus returns to the inner's Trigger in the outer; the next Escape closes the outer and focus returns to the page Trigger.
- `reveal--replace`: with the default `multipleOpened: false`, opening the inner closes the outer; closing the inner returns focus to the outer's page Trigger (the fallback chain), not to `body`.
- `reveal--animated`: `animationIn="nfs-fade-in" animationOut="nfs-fade-out"`; after opening, `is-opening` is present and `opened` has not fired, then `opened` fires and the classes are gone; after closing, `is-closing` shows while `open` is still set, then the dialog closes and `closed` fires.
- `reveal--alert-dialog`: `role="alertdialog"` with `aria-describedby`; focus starts on the least destructive button through an `autoFocus` selector; Escape and a backdrop press leave it open; the "Delete" button closes it with the result `true`, shown in the story.
- `reveal--close-predicate`: a form marked dirty vetoes Escape, a backdrop press, and the close button; after saving, the same actions close it.
- `reveal--focus`: `autoFocus` variants: first tabbable, a descendant with `autofocus`, `'first-heading'` (the heading gets `tabindex="-1"` while focused and loses it on blur), a selector, and `false`; a static `autoFocus="first-heading"` attribute still focuses the heading, not the dialog; Tab and Shift+Tab wrap, a radio group is one stop, and the dialog element is never focused.
- `reveal--programmatic`: `open()`, `close()`, `toggle()` through the template reference; `[(isOpen)]` bound to a checkbox; `[isOpen]="true"` opens after the first render without an enter animation.
- `reveal--form-method-dialog`: a `<form method="dialog">` with two submit buttons closes the dialog; `closed` carries the pressed button's value and `isOpen` is false.
- `reveal--scroll-lock`: on a long page scrolled down, opening adds `is-reveal-open` and `zf-has-scroll` to `html` with the page visually unmoved; closing removes them and restores the scroll position.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Open and close sync: `open()`, `close(result)`, `toggle()`, and model writes call `showModal()`/`show()`/`close()` in the render callback after the change; `open()` while open and `close()` while closed do nothing; `opened` and `closed` fire once each, in order, with the result; a parent writing `isOpen` false skips `closePredicate`.
- Open at first paint: a non-modal Reveal with `[isOpen]="true"` has `open` after its first pass; its first render callback does not call `show()`, emits no `opened`, and registers with Light dismiss; with focus on `body` it places focus by `autoFocus`, with focus on an element outside it moves nothing, and with a static `autoFocus` attribute and focus on the host it moves focus to the `autoFocus` target and the attribute is gone; `close()` removes `open`, and further change detection never writes it back; `open()` afterwards calls `show()`; a modal Reveal with `[isOpen]="true"` has no `open` before its `showModal()`.
- Phases with a test stylesheet: class lists after each step; completion on `animationend`; an `animationend` from a child, from `::backdrop` (dispatched with an empty `pseudoElement` and the backdrop keyframe name, WebKit's shape), or with another name does not complete; `animationcancel` completes; interruption in both directions emits nothing for the interrupted phase; a class without keyframes completes at once; a suppressed `animationend` completes after the measured length plus 100 ms (fake timers); `nfsAnimationsToken` `{disabled: true}` binds no class.
- Escape through a dispatched `keydown` on `window`: the topmost modal closes; a `defaultPrevented` or `isComposing` event is ignored; `closeOnEsc` false and a vetoing predicate keep it open; `preventDefault()` is called in every case the topmost modal sees; a dispatched `cancel` routes to `close()` and is cancelled.
- Native close: calling the element's `close()` directly re-syncs `isOpen`, releases the Scroll lock, restores focus, and emits `closed` with `returnValue`.
- Backdrop press with dispatched pointer events and coordinates: down and up outside the border box close; down outside then up inside, down inside then up outside, a press on the padding, and `pointercancel` do not; `closeOnClick` false keeps it open; nothing happens on a non-modal Reveal.
- Non-modal integration with the Light dismiss registry: close reasons `'click'`, `'keydown'`, `'tab'` reach `close()`; `closeOnEsc` false ignores `'keydown'`; registered Triggers count as inside.
- `multipleOpened`: false closes the other open Reveals before the new one opens, a vetoing predicate leaves the other open; true stacks them and Escape reaches only the topmost.
- Focus: each `autoFocus` variant and the temporary `tabindex`; the host's `autofocus` attribute is gone after opening; Tab wrap order with positive `tabindex`, a radio group, a hidden element, and a disabled button, driven by dispatched Tab `keydown` events (the directive moves focus itself); restore to the `trigger`, to the element focused before open, to a `restoreFocus` selector and element, not when focus has moved elsewhere, and up the fallback chain when the target was inside a closed Reveal; `restoreFocus` false moves nothing.
- Scroll lock counting: the first modal locks, a second does not re-lock, the last close unlocks; a non-modal Reveal never locks; destroying an open modal unlocks.
- Deep linking with a stubbed `location` and `history`: the first render opens on a matching hash; `hashchange` opens and closes; open and close write with `replaceState` or `pushState` and pass `history.state` through; a hash-driven change writes nothing.
- Defaults token: each Foundation Option and `autoFocus`/`restoreFocus` default applies and is overridden by an attribute.
- Dev-mode checks: each of the six warnings fires once for its case and not for correct markup (`nfs-fade-in` does not warn).
- Replay-safe handler: a Tab `keydown` whose `eventPhase` reads 101 and whose `preventDefault` throws still moves focus, and nothing reaches `ErrorHandler`.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which none here does.

- SSR smoke: `renderApplication` over a fixture with a basic Reveal and its Trigger, a modal open-by-default Reveal, a non-modal one, a non-modal one open by default with its Trigger, an alert dialog with a static `autoFocus`, and one with numeric offsets. Assert `whenStable()` resolves; every `<dialog>` is present with its content and without `open`, except the non-modal one open by default, which carries `open` while its Trigger carries `aria-expanded="true"`; classes are `reveal` plus the consumer's, `without-overlay` on the non-modal ones, no `is-opening`, `is-closing`, or Motion class; `role="alertdialog"` where set; the offset custom properties where set; `jsaction` on the dialog hosts and the Triggers; no class or style on `html`; the modal Reveals' Triggers carry no `aria-expanded`, the non-modal ones' carry it.
- Pure logic, table-driven: the phase transition function (idle, opening, closing, interruption, animations off), the longest-animation reduction over computed-style lists, the Motion UI name check, the `vOffset`/`hOffset` and `autoFocus`/`restoreFocus` transforms, and the restore-target resolution over a chain of closed Reveals.
- Sass compile: Foundation 6.9 plus the library with Foundation's defaults emits the seven `nfs-reveal` rules and the `nfs-motion` backdrop keyframes and rules, no copy of a Foundation rule, and no warning; a theme with `$closebutton-color` or `$closebutton-color-hover` under 3:1 against `$reveal-background` stops the compile with the `@error` naming the setting, and a backdrop that leaves the dialog under 3:1 against the dimmed page produces the matching `@warn`.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `reveal--fixture` and the stories named, in Chromium, Firefox, and WebKit:

- Geometry: default, `.tiny`, `.small`, `.large`, `.full` at 320, 640, and 1024 px wide against the prototype's recorded Foundation values (for example 1024 `.tiny` left 358, width 307) for width and horizontal position, and against Foundation's `'auto'` formula `(viewport height - dialog height) / 4` for vertical position, within 1 px; a tall-content row, a dialog whose natural height exceeds `vh - 2 * min(100px, 10vh)`, expecting `y = min(50px, 5vh)` and height `vh - 2 * min(100px, 10vh)`, beside the `(vh - h) / 4` rows; numeric offsets at 1024 px; full screen at 320 px; under `dir="rtl"`; on a page scrolled to 1000 px.
- Tall content: the box ends inside the viewport and the last control is reachable in all three engines.
- Real Escape: repeated presses (five, with no other input between) on `reveal--alert-dialog` and on a dirty `reveal--close-predicate` leave the dialog open in all three engines, the case the browser's close-request anti-abuse rule would otherwise close.
- Real Tab and Shift+Tab wrap in all three engines, including WebKit with a link inside (skipped by WebKit's own Tab order).
- Mouse click on the Trigger, then Escape: focus returns to the Trigger in WebKit.
- Scroll lock: wheel over the backdrop and over the dialog, and arrow keys with focus inside, leave the page position unchanged; after closing, the position is restored.
- Backdrop press with a real mouse closes; a touch swipe starting on the backdrop (`hasTouch`) does not.
- `emulateMedia({reducedMotion: 'reduce'})` on `reveal--animated`: completion within a few frames and `closed` still fires.
- `reveal--deep-link`: navigating to the story URL with `#<id>` opens the dialog after load; closing removes the hash; with `updateHistory`, Back after opening closes it through `hashchange`.
- Focus indicator: the focused close button shows a non-`none` computed outline in all three engines.
- 2.4.11: every focus stop in the tall dialog and the restored Trigger hit-test to themselves.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype), one route with a basic Reveal, a modal open-by-default Reveal, a non-modal Reveal open by default with its `nfsToggle` Trigger and a `<form method="dialog">` button, a deep-linked one, and a `@defer (hydrate on interaction)` block holding a Trigger and its Reveal:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; every dialog but the non-modal open-by-default one hidden and its content in the DOM; the modal open-by-default one closed; the non-modal open-by-default one shown, not `:modal`, its Trigger at `aria-expanded="true"`, and closed by its `<form method="dialog">` button.
- Hydration: no NG05xx in the console, `ngDevMode.componentsSkippedHydration === 0`, and no `animationstart` on any dialog during hydration; the modal open-by-default Reveal is `:modal` after hydration with focus inside; the non-modal open-by-default Reveal stays shown with no `toggle` or `close` event, focus moves into it from `body`, and focus placed in a page field before hydration stays in the field.
- Pre-hydration click with the main bundle delayed: the Trigger clicked before hydration opens its Reveal exactly once after hydration, `:modal`, focus inside, no error logged; the non-modal open-by-default Reveal's Trigger clicked before hydration closes it once after hydration, and its Trigger reads `aria-expanded="false"`.
- The `hydrate on interaction` block: the first Trigger click hydrates the block and opens the Reveal.
- Deep link on the prerendered route: loading with the hash opens the Reveal after hydration.
- `@defer (hydrate never)`: the Reveal stays closed, its Trigger does nothing, no error is logged.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA on Firefox and on Chrome and VoiceOver on Safari (macOS and iOS), Tab to the Trigger of `reveal--basic` and confirm it is announced as a button that opens a dialog, with no expanded or collapsed state; open `reveal--basic` and `reveal--alert-dialog` from their Triggers and confirm the dialog's role and name (and for the alert dialog its description) are spoken with focus on the first control, that browse or virtual cursor navigation stays inside the dialog, and that closing returns focus to the Trigger, announced again without an expanded state; open `reveal--without-overlay` and confirm its Trigger is announced as expanded while it is open and collapsed after, that the dialog is not announced as modal, and that the page stays reachable.

## Out of Scope

- A Material-style service that opens components or templates in an overlay (ADR 0007).
- CDK Dialog, as implementation or fallback (the Reveal dialog prototype).
- `showDelay`, `hideDelay`, `fullScreen`, `resetOnClose`, `appendTo`, `additionalOverlayClasses` (Foundation contract, dropped options).
- Motion UI transition classes, the `motion-ui` package, and the `fast`/`slow` speed modifiers (ADR 0003).
- Closing on Router navigation (`closeOnNavigation`).
- An exit animation and `closePredicate` for `<form method="dialog">` closes; `nfsClose` covers both.
- OffCanvas: its overlap mode is not built on `<dialog>` (Further Notes, what OffCanvas inherits).
- `dialog.closedby`, `requestClose()`, `CloseWatcher`, `@starting-style`, and Invoker Commands (out of target; Further Notes).
- Automated screen-reader output: the manual release test under Testing Decisions covers it ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Directive on a consumer-written `<dialog class="reveal">` | ADR 0007, ADR 0001; the top layer needs no move; server-renderable in place | A service opening components (not in the document, not server-renderable); CDK Dialog (no `<dialog>`, `aria-modal` off) |
| D2 | Seven documented rules in `nfs-reveal`, Foundation's Sass otherwise unchanged | The prototype matched Foundation to the pixel with rules 1 to 6; rule 7 restores Foundation's `'auto'` placement | Re-implementing `.reveal` for `<dialog>` (copies Foundation) |
| D3 | `isOpen` model, `open(trigger?)`, `close(result?)`, `toggle(trigger?)`, `registerTrigger` | The Openable contract (Triggers spec, ADR 0013); `isX` naming (building-blocks 1.3) | An `open` model (collides with the method and the dialog's `open` attribute) |
| D4 | `opened` after the enter animation, `closed(result)` after `dialog.close()`, no `beforeClosed` | Completion output rule, no start events (building-blocks 1.4); `isOpenChange(false)` marks the start of a close | Foundation's synchronous `open.zf.reveal`; Material's `beforeClosed()` |
| D5 | `closePredicate(result)` guards every close except a parent model write and a native close | Material's veto; the parent owns its model; native closes cannot be stopped | Vetoing model writes (fights the parent); a cancelable event (building-blocks 1.4) |
| D6 | Modal Escape handled at `window` `keydown`, topmost modal, `preventDefault()` last; `cancel` as fallback | Cancelling the `keydown` stops the close request (HTML), so `closeOnEsc: false` and vetoes hold under repeated Escape; `window` runs after Light dismiss and inner controls | `cancel` only (the prototype: a veto fails on the second or third Escape without user activation); a host `keydown` (runs before an open pane's Light dismiss handler) |
| D7 | Backdrop press needs `pointerdown` and `pointerup` both on the backdrop | HTML dialog light dismiss and ADR 0024; touch scrolls and drags never close | `pointerdown` alone (ADR 0007's wording; a swipe on the backdrop closes) |
| D8 | Non-modal Reveals dismiss through the Light dismiss registry, focus leaving included | One model for non-modal floating content; topmost-first Escape with nested panes; Triggers inside; WCAG 2.4.11 met by closing on focus loss | Own document listeners (the prototype: an outside `pointerdown` closed the dialog before its Trigger's click reopened it); a Tab trap (the APG does not trap non-modal dialogs) |
| D9 | `multipleOpened: false` closes the other open Reveals through `close()`; `true` stacks nested `showModal()` | Foundation's default and ADR 0007; each layer returns focus to its own Trigger | Foundation's Escape closing every open layer |
| D10 | `'auto'` offsets reproduced in CSS (`top: 25%` plus `translate: 0 -25%`); numbers through custom properties at medium and up | Foundation's default placement (building-blocks 1.4 keeps Foundation defaults) without measurement, recomputed by the browser; exact while the dialog's natural height is at most `vh - 2 * min(100px, 10vh)`, confirmed in three engines by the [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md); full screen below medium keeps its box | Foundation's CSS `top: 100px` (not where Foundation's JavaScript put a modal); a measured port (layout reads and observers for what CSS computes); dropping both Options |
| D11 | `fullScreen` dropped in favour of the `.full` Variant class; full-screen Reveals stay modal | Its only behaviour was forcing `overlay: false`, which a full-screen top-layer dialog does not need | A `fullScreen` input binding `.full` (a second spelling of a class) |
| D12 | `autoFocus` union without `'dialog'`, a descendant `autofocus` honoured, static attribute stripped | APG; the platform's own initial-focus rule; the prototype's case-insensitive `autofocus` collision | Material's `'dialog'` value; renaming the input (breaks ADR 0007's vocabulary) |
| D13 | Tab wrap on every Tab in sequential focus order, modal only | No engine wraps; WebKit puts the dialog element in its Tab order and skips links; radio groups stay one stop | End-only wrapping (misfires in WebKit); CDK `FocusTrap` (its sentinels would sit in the inert page) |
| D14 | Restore focus to the Trigger from `open(trigger)`, CDK's guard, and a fallback up closed Reveals | WebKit click-does-not-focus; the prototype's `BODY` result under `multipleOpened: false` | `document.activeElement` only |
| D15 | Scroll lock ported from Foundation for modal Reveals only | The page scrolls behind a modal in all three engines; a non-modal page stays usable | `overscroll-behavior: contain` (the page still moved); locking for non-modal dialogs (Foundation) |
| D16 | No animation by default; Motion classes through `.is-opening`/`.is-closing` with measured completion and a keyframe-name filter | Foundation's default; Foundation's own State class names; WebKit's empty `pseudoElement` on backdrop events | `animate.enter` (plays at hydration); a fixed fallback duration (consumer classes vary) |
| D17 | Server HTML closed for a modal Reveal, which becomes modal after hydration without an enter animation when open by default; a non-modal Reveal open at its first render carries `open`, bound from a value fixed at that render | `showModal()` throws on a dialog opened by attribute (measured) and no animation plays at hydration; `<dialog open>` is exactly the shown non-modal dialog `show()` makes, so the non-modal first paint matches `isOpen` and its Trigger's `aria-expanded` (building-blocks 1.11 decisions 1 and 2), and a fixed value is never written after a later `close()` ([Decide: the server state of an open-by-default non-modal Reveal's Trigger](../issues/78-decide-open-by-default-non-modal-reveal-server-state.md)) | Rendering `open` for a modal Reveal (non-modal until hydration, and it would have to close and reopen); a closed server dialog for a non-modal Reveal too (its Trigger's `aria-expanded="true"` is false until hydration and for good without JavaScript, the dialog pops in at hydration, and a Trigger click before hydration ends as a close); a separate shown state for Triggers (a second state member on the Openable contract, and the pop-in stays); documenting the mismatch (ships a false state the Triggers spec forbids); binding `open` to `isOpen` (removes `open` before the exit animation, and without a `close` event) |
| D18 | `<form method="dialog">` re-syncs through `close`, reporting `returnValue` | Keeps the platform mechanism working with honest state | Intercepting `submit` (collides with form libraries' own submit handling) |
| D19 | Contrast pairs checked at compile time from the unrounded ratio (Foundation's `color-luminance()` and the WCAG formula): `@error` for the two close-glyph pairs, `@warn` for the dialog-edge pair | ADR 0022 for 1.4.11, which axe does not test; building-blocks 1.10 asks for an `@error` on colour pairs that carry state, and the close glyph marks the close control at rest and on hover, the same pair the `nfs-off-canvas` mixin stops on; the dialog edge carries no state, so a warning; `color-contrast()` rounds to one decimal and would pass 2.95:1 | A runtime check; no check; a `@warn` for the close glyph (a failing theme would compile inside a Reveal and not inside an Off-canvas panel); Foundation's `color-contrast()` |
| D20 | Internal `NfsRevealStack` service | Shared state across instances (building-blocks 1.5): order, the Scroll lock count, one `window` listener | A module-level set (shared between applications on one page); per-instance `window` listeners |
| D21 | Trigger role from `overlay`: `modal-dialog` with the overlay, `dialog` without | `showModal()` makes the Trigger inert while open, so no expanded state is ever exposed; `overlay` is an input, so the server value is final ([Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md)) | A constant `'dialog'` (renders `aria-expanded` on an inert opener and a false `"true"` in open-by-default server HTML) |
| D22 | A non-modal Reveal open at first paint is not re-shown and emits no `opened`; its first render callback places focus only when nothing else has focus (`body`, or the host after HTML `autofocus`) | The dialog has been shown since the first paint, and outputs skip the initial state (the Toggler and Dropdown pane rules); Light dismiss closes on any focus move outside, so without focus inside a keyboard user's first Tab elsewhere closes the dialog before it can be reached; focus the user placed before hydration is theirs (measured in three engines); HTML `autofocus` focuses a dialog parsed open at page load in all three engines, and the APG forbids focus on the dialog element | Running the ordinary opening steps at hydration (steals focus from where the user put it before hydration); never moving focus, the Dropdown pane's first-paint rule (the first Tab closes the dialog); leaving focus on the dialog element |

### Usage examples

```ts
@Component({
  selector: 'app-account',
  imports: [NfsButton, NfsOpen, NfsClose, NfsReveal, ReactiveFormsModule],
  template: `
    <button nfsButton [nfsOpen]="edit">Edit profile</button>

    <dialog nfsReveal #edit="nfsReveal" id="edit-profile" class="small reveal"
            aria-labelledby="edit-title" animationIn="nfs-fade-in" animationOut="nfs-fade-out"
            [closePredicate]="canClose" (closed)="onClosed($event)">
      <h2 id="edit-title">Edit profile</h2>
      <form [formGroup]="form">
        <label>Name <input formControlName="name" /></label>
      </form>
      <button nfsButton class="secondary" nfsClose>Cancel</button>
      <button nfsButton nfsClose [nfsCloseResult]="form.value">Save</button>
      <button class="close-button" type="button" aria-label="Close" nfsClose>
        <span aria-hidden="true">&times;</span>
      </button>
    </dialog>
  `,
})
export class AppAccount {
  protected readonly form = inject(FormBuilder).nonNullable.group({ name: '' });

  protected readonly canClose = (result: unknown): boolean => result !== undefined || !this.form.dirty;

  protected onClosed(result: unknown): void {
    if (result !== undefined) {
      // save result
    }

    this.form.reset();
  }
}
```

```html
<!-- Alert dialog: forced choice, least destructive button focused first -->
<button nfsButton class="alert" [nfsOpen]="confirm">Delete account</button>
<dialog nfsReveal #confirm="nfsReveal" id="confirm-delete" class="tiny reveal" role="alertdialog"
        aria-labelledby="confirm-title" aria-describedby="confirm-text"
        autoFocus="#confirm-cancel" [closeOnClick]="false" [closeOnEsc]="false"
        (closed)="$event === true && deleteAccount()">
  <h2 id="confirm-title">Delete your account?</h2>
  <p id="confirm-text">This cannot be undone.</p>
  <button nfsButton class="secondary" id="confirm-cancel" nfsClose [nfsCloseResult]="false">Cancel</button>
  <button nfsButton class="alert" nfsClose [nfsCloseResult]="true">Delete</button>
</dialog>

<!-- Nested modals (Foundation's docs example) -->
<button nfsButton [nfsOpen]="first">Click me for a modal</button>
<dialog nfsReveal #first="nfsReveal" id="first-modal" class="reveal" aria-labelledby="first-title" multipleOpened>
  <h1 id="first-title">Awesome!</h1>
  <button nfsButton [nfsOpen]="second">Click me for another modal!</button>
  <button class="close-button" type="button" aria-label="Close reveal" nfsClose><span aria-hidden="true">&times;</span></button>
</dialog>
<dialog nfsReveal #second="nfsReveal" id="second-modal" class="reveal" aria-labelledby="second-title" multipleOpened>
  <h2 id="second-title">ANOTHER MODAL!!!</h2>
  <button class="close-button" type="button" aria-label="Close reveal" nfsClose><span aria-hidden="true">&times;</span></button>
</dialog>

<!-- No overlay: a non-modal dialog written right after its Trigger -->
<button nfsButton [nfsToggle]="free">Click me for an overlay-lacking modal</button>
<dialog nfsReveal #free="nfsReveal" id="free-modal" class="reveal" aria-label="Note" [overlay]="false">
  <p>I feel so free!</p>
  <button class="close-button" type="button" aria-label="Close reveal" nfsClose><span aria-hidden="true">&times;</span></button>
</dialog>

<!-- Full screen, deep-linkable, with content that must reset on close (Lazy content) -->
<dialog nfsReveal #video="nfsReveal" id="intro-video" class="full reveal" aria-label="Introduction video" deepLink>
  @if (video.isOpen()) {
    <iframe src="https://player.example/intro" title="Introduction video"></iframe>
  }
  <button class="close-button" type="button" aria-label="Close video" nfsClose><span aria-hidden="true">&times;</span></button>
</dialog>
```

A component inside a Reveal that closes it with a result:

```ts
@Component({
  selector: 'app-color-picker',
  template: `@for (c of colors; track c) { <button type="button" (click)="pick(c)">{{ c }}</button> }`,
})
export class AppColorPicker {
  protected readonly colors = ['red', 'green', 'blue'];
  readonly #reveal = inject(nfsRevealToken, { optional: true });

  protected pick(color: string): void {
    this.#reveal?.close(color);
  }
}
```

Application-wide defaults:

```ts
providers: [{ provide: nfsRevealDefaultsToken, useValue: { animationIn: 'nfs-fade-in', animationOut: 'nfs-fade-out' } }]
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-reveal` (and `foundation-close-button` for the close control). Its documented custom CSS is the `nfs-reveal` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-reveal`.

(1) Rules the mixin emits, with the reason Foundation's CSS cannot provide each (only the declarations that differ from Foundation's):

| # | Selector | Declarations | Reason |
| --- | --- | --- | --- |
| 1 | `.reveal[open]` | `display: block` | Foundation's `display: none` was lifted by its JavaScript; a dialog is shown by `open` |
| 2 | `.reveal[open]` | `position: fixed` | The top layer computes `relative` to `absolute` against the initial containing block |
| 3 | `.reveal[open]` | `inset-inline: 0` | Foundation's `auto` insets centre in-flow boxes only |
| 4 | `.reveal[open]` | `max-height: calc(100% - 2 * var(--nfs-reveal-top, min(100px, 10%)))` | A tall dialog scrolls itself and must end inside the viewport; the cap leaves twice Foundation's tall-modal offset (or twice a numeric `vOffset`). With `'auto'`, rule 7 places a capped dialog by the same quarter rule, `min(50px, 5vh)` from the top and three times that below it; Foundation used `min(100px, 10vh)` and let its overlay scroll, and placed a dialog between the cap and the viewport height at `(vh - h) / 4` without capping it |
| 5 | `.reveal[open]` | `color: inherit` | The user-agent `CanvasText` on `dialog` |
| 6 | `.reveal::backdrop` | `background-color: $reveal-overlay-background` | `reveal-overlay` also prints `display: none` |
| 7 | `.reveal[open]:not(.full)` inside `breakpoint(medium)` | `top: var(--nfs-reveal-top, 25%); translate: 0 var(--nfs-reveal-shift, -25%); margin-left: var(--nfs-reveal-left, auto)` | Foundation's `'auto'` placement and numeric offsets were inline styles from its JavaScript |
| - | none (compile-time checks) | `@error` naming the setting when the ratio of `$closebutton-color` against `$reveal-background`, or of `$closebutton-color-hover` against `$reveal-background`, is under 3; `@warn` when the ratio of `$reveal-background` against `$reveal-overlay-background` composited over `$body-background` is under 3; each ratio computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded | WCAG 2.2 AA 1.4.11; axe has no rule for it |

(2) Settings, mixins, and functions reused, read from the consumer's compile: `$reveal-overlay-background`, `$reveal-background`, `$body-background`, `$closebutton-color`, `$closebutton-color-hover`, Foundation's `breakpoint()` and `color-luminance()`, and Sass's colour functions for the compositing (Foundation's `color-contrast()` is not used for the checks, because it rounds to one decimal). The literal values are Foundation's own JavaScript constants for which no setting exists (`25%` for the quarter of the free space, `100px` and `10%` for the tall-modal offset) and the WCAG ratio (3); the mixin takes no parameters.

(3) Custom properties the directive writes and the mixin reads: `--nfs-reveal-top` (a numeric `vOffset` in px), `--nfs-reveal-shift` (`0px` with a numeric `vOffset`), `--nfs-reveal-left` (a numeric `hOffset` in px). An implementation channel, not theming (building-blocks 1.13).

(4) Motion classes: none by default (Foundation's `animationIn` and `animationOut` are empty); any `nfs-*` class from `nfs-motion` when set. The `nfs-motion` mixin gains, for this spec, `@keyframes nfs-reveal-backdrop-in` and `nfs-reveal-backdrop-out` (opacity 0 to 1 and back, named apart from the dialog's keyframes so the directive can tell their `animationend` events apart in WebKit) and the rules `.reveal.is-opening::backdrop { animation: nfs-reveal-backdrop-in $duration $timing-function both; }` and `.reveal.is-closing::backdrop { animation: nfs-reveal-backdrop-out $duration $timing-function both; }`, with both backdrop rules added to its `prefers-reduced-motion: reduce` block (`animation-duration: 1ms`). The mixin's `$duration` and `$timing-function` parameters (Motion UI's defaults) apply.

(5) What breaks without the include: an opened dialog stays invisible (Foundation's `display: none`), and with only rule 1 it sits at the top-left of the document, scrolls the page to the top when focused, grows past the viewport with tall content, shows black text, and has the user agent's backdrop instead of Foundation's overlay colour; without `nfs-motion`, Motion classes measure no animation and open and close at once.

### Platform features to adopt when the browser target moves

- `dialog.closedby="any"` (no WebKit release yet): replaces the Backdrop press handler for modal Reveals with `closeOnClick`, with the same down-and-up rule, and gives non-modal Reveals platform light dismiss; `closedby="closerequest"` and `"none"` express `closeOnEsc`. The `window` Escape handler stays while `closePredicate` needs to veto repeated Escape.
- `dialog.requestClose(result)` (Baseline 2025): Triggers could route `nfsClose` through `cancel`, so every close request shares one veto path.
- `@starting-style`, `transition-behavior: allow-discrete`, and the `overlay` property: an exit transition that keeps the dialog in the top layer without the directive delaying `close()`, and CSS transitions for Motion classes.
- `CloseWatcher`: the same close-request handling for non-modal Reveals, including the Android back gesture.
- Invoker Commands (`command="show-modal"`, `commandfor`): a Trigger that opens a Reveal before hydration and inside `hydrate never`, with consumer-supplied ids (Triggers spec).
- CSS anchor positioning is not relevant: a Reveal is centred on the viewport, not anchored.

### What OffCanvas inherits

The Reveal dialog prototype listed what carries over to OffCanvas: the scroll-lock measurement (the page scrolls behind an overlay unless locked, which answers `contentScroll: false`), the overlay colour from `$offcanvas-exit-background` (the prototype named it `$offcanvas-overlay-background`, a setting Foundation 6.9 does not have), and rules 1, 2, 5, and 6 if the panel were a `<dialog>`. This spec's reading of the folded overlap-mode question is that OffCanvas should not use `<dialog>` in any mode: the same `.off-canvas` element must stay an in-flow sidebar at `revealOn` and a page element at `inCanvasOn` from server HTML, a closed `<dialog>` is `display: none` by the user-agent stylesheet and always carries the implicit `dialog` role, Foundation's transform transition cannot start from `display: none` without `@starting-style`, and Foundation's default panel is not modal. That agrees with ADR 0030, written by the [Spec: Off-canvas](../issues/25-spec-off-canvas.md) ticket. What OffCanvas can reuse from this spec in its modal mode: the `autoFocus` union and its `InteractivityChecker` rules, the restore-focus rules with `open(trigger)`, and the Scroll lock mechanics (its own classes, not Reveal's).

### Foundation behaviour changed or dropped

- The modal is a `<dialog>` written in place; nothing is generated or moved, and `appendTo` and `additionalOverlayClasses` go.
- Focus moves to a control inside, never to the dialog; Tab wraps in every engine; Foundation's static focus-trap list goes.
- The page behind a modal is inert (Foundation left it reachable to assistive technology).
- Escape closes only the topmost modal (Foundation closed every open one and removed the others' handlers).
- `closeOnEsc: false` and a `closePredicate` hold under repeated Escape.
- A backdrop press needs both ends on the backdrop (Foundation closed on `click`/`tap` on the overlay).
- A non-modal Reveal closes when focus leaves it, closes on Escape from anywhere, and does not lock page scroll.
- `opened` fires after the enter animation (Foundation's `open.zf.reveal` fired synchronously); `closed` carries a result.
- `fullScreen` becomes the `.full` class; full-screen Reveals stay modal.
- Numeric offsets apply at medium and up; below medium the dialog stays full screen.
- Under `dir="rtl"` a numeric `hOffset` is measured from the left edge; Foundation's overlay case placed the box at `viewport width - width + hOffset`, because it wrote `left` on a `position: relative` box, while its `.without-overlay` case measured from the left as the library does.
- A dialog taller than rule 4's cap, `vh - 2 * min(100px, 10vh)`, is capped and sits at half Foundation's tall-modal offset, `min(50px, 5vh)` from the top (Foundation placed it at `min(100px, 10vh)` and let its overlay scroll, and did not cap a dialog between the cap and the viewport height).
- An `'auto'` dialog is re-placed when its content changes (Foundation re-placed only on resize).
- `resetOnClose`'s `innerHTML` re-parse becomes Lazy content under `@if`.
- Motion UI transition classes and `fast`/`slow` modifiers are replaced by keyframe Motion classes; the overlay's `fade-in`/`fade-out` becomes the backdrop keyframes.
- The `resizeme` re-centring, `data-yeti-box`, `data-resize`, `aria-hidden` toggling, and `tabindex` stamping on anchors are gone.
