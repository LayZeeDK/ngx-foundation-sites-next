# Spec: Reveal

Ticket: [Spec: Reveal](../issues/18-spec-reveal.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA. Revised on 2026-09-28 by the [Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md) under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer building an Angular application on Foundation for Sites needs modal dialogs: a sign-up form, a confirmation, a full-screen gallery, a dialog that opens another dialog. Foundation's Reveal plugin provides them with jQuery, and that design leaves the developer with problems an Angular library must not copy:

- The plugin generates a `.reveal-overlay` element, appends it to `body`, and moves the consumer's modal into it. Moving server-rendered nodes breaks hydration, and the modal's styles and template context depend on where it was written.
- It focuses the dialog element itself, which the WAI-ARIA Authoring Practices name as the anti-pattern ("Please DO NOT make the element with role dialog focusable"). It traps focus on a list of focusable elements computed once at open, so content that changes while the modal is open escapes the trap.
- It hides the page behind the modal from nobody: no `inert`, no `aria-modal`, only an `aria-hidden` flag on the modal itself. A screen reader user can wander out of the modal into the page.
- One window-level Escape handler per open modal, sharing one jQuery event namespace, means Escape closes every open nested modal at once, and closing one modal removes the others' handlers. Closing a Reveal without an overlay also removes an open Dropdown's outside-click handler, because both use the `click.zf.dropdown` namespace.
- `open.zf.reveal` fires synchronously while the enter animation still runs, `closed.zf.reveal` after the exit animation, and `closeme.zf.reveal` fires before this modal opens rather than before it closes. Nothing can veto a close, so a half-filled form is lost on a stray Escape or overlay click.
- Its animations need Motion UI's two-frame transition protocol and its positioning needs a measurement with `visibility: hidden; display: block` before every open.
- It locks page scroll with classes on `html` and a `top` offset, correctly, but decides when to unlock by counting `$('.reveal:visible')`.
- Its markup is its classes: the developer writes `.reveal`, a size class, `.collapse`, and `.close-button` by hand, and Motion UI names such as `spin-in` as attribute values. Under the library's class rule the developer writes no Foundation or library class, not even as an input value, so each class needs an Angular home and each animation name a typed form.

A server-rendered Angular application adds more: the dialog must be in the server HTML with its content, closed unless it is a non-modal dialog that is open by default, and hydrate without a mismatch; an open-by-default modal dialog must become modal after hydration; a click on its Trigger before hydration must still open it afterwards; and nothing may touch `window`, `history`, or focus before hydration.

## Solution

One attribute directive, `NfsReveal`, on the native `<dialog>` the developer writes where it belongs in the template. It binds Foundation's `.reveal` class and sets the size classes (`.tiny`, `.small`, `.large`, `.full`) and `.collapse` from the typed `size` and `collapse` inputs, so the developer writes no Foundation or library class. The browser supplies what Foundation's JavaScript emulated: `showModal()` puts the dialog in the top layer without moving it, makes the rest of the page inert, contains focus, and paints `::backdrop`, which the library styles with Foundation's own overlay colour. Foundation's `.reveal` Sass, its size classes, full screen below medium, `.collapse`, `.without-overlay`, and its `html.is-reveal-open` scroll lock are all reused unchanged; the library adds seven small documented rules in the `nfs-reveal` Library mixin for what a `<dialog>` in the top layer needs, and an eighth that keeps dialog text clear of the close button under text spacing (WCAG 1.4.12), and CDK Dialog is not used.

The Reveal is an Openable: `nfsOpen`, `nfsClose`, and `nfsToggle` operate it, a bare `nfsClose` inside it closes it (on Foundation's close button it sits beside the Close Button directive, `nfsCloseButton`), and `close(result)` hands a value to its `closed` output, as Material's `[mat-dialog-close]` does. Focus moves to the first tabbable element inside (or a heading, or a selector), wraps with Tab and Shift+Tab, and returns to the Trigger on close, even in WebKit, which does not focus a button on mouse click. A `closePredicate` can veto any close, and because the directive intercepts Escape before the browser turns it into a close request, a veto holds however often Escape is pressed. `overlay: false` gives a non-modal dialog that dismisses itself like the library's Anchored panes. Animations take Foundation's Motion UI names (`animationIn="spin-in"`), which the directive maps to the library's `nfs-` keyframe classes, or the consumer's own keyframe classes written with a leading dot; they run through State classes, with the dialog closed only after its exit animation ends. The server HTML is the dialog with its content, closed, or shown when a non-modal Reveal is open at its first render, so that its Trigger's `aria-expanded="true"` is true from the first paint; everything else happens in render callbacks after hydration.

## User Stories

1. As an application developer, I want to write `<dialog nfsReveal>` where the dialog belongs in my template and get Foundation's `.reveal` class from the directive, so that its content keeps my component's bindings and styles, nothing is moved in the DOM, and I write no Foundation class.
2. As an application developer, I want `[nfsOpen]="signup"` on a button to open the Reveal, so that I link the two with a typed reference instead of an id.
3. As an application developer, I want `nfsCloseButton` with a bare `nfsClose` on the close button inside the Reveal to close it, so that Foundation's docs close button needs only directive attributes in place of its class and `data-close`.
4. As an application developer, I want `[nfsCloseResult]="true"` on a close button and the value on `(closed)`, so that a confirmation dialog reports the choice.
5. As an application developer, I want `[(isOpen)]` two-way binding, so that my component state and the dialog agree.
6. As an application developer, I want `open()`, `close(result)`, and `toggle()` through the template reference, so that I can drive the dialog from code.
7. As an application developer, I want `size="tiny"`, `size="small"`, `size="large"`, `size="full"`, `collapse`, and full screen below medium to look exactly as Foundation 6.9's size classes, `.full`, and `.collapse` do, so that migrating changes nothing visible.
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
28. As an application developer, I want `animationIn` and `animationOut` to take Foundation's Motion UI names (`animationIn="spin-in" animationOut="spin-out"`), bind the library's keyframe classes of those names, and fade the backdrop with them, so that Foundation's animated modal example works without Motion UI and with its attribute values unchanged.
29. As an application developer, I want `(opened)` after the enter animation and `(closed)` after the dialog has closed, so that my handlers see the final state.
30. As a user who asked for reduced motion, I want the dialog to open and close without motion, so that animation does not bother me.
31. As an application developer, I want `deepLink` to open the Reveal when the URL hash names it, and to write and clear the hash, so that dialogs can be linked and the Back button closes them.
32. As an application developer, I want `updateHistory` to push history entries instead of replacing them, so that Foundation's option keeps its meaning.
33. As an application developer, I want a `<form method="dialog">` inside the Reveal to close it and report the submitter's value, so that the platform's own close mechanism stays usable.
34. As an application developer, I want the directive's docs to state its usage rules (a name on every dialog, a description on an alert dialog, an animation value that starts an animation, my own `id` with `deepLink`, no `tabindex` on the dialog, something tabbable inside), so that I avoid those mistakes before users meet them.
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
47. As an application developer, I want a misspelt size or Motion name (`size="huge"`, `animationIn="fade-inn"`), an exit name on `animationIn`, or a library class name as a value (`animationIn="nfs-fade-in"`) to fail to compile, so that a typo never ships a dialog without its look or its animation.
48. As an application developer, I want to give `animationIn` and `animationOut` my own keyframe classes with a leading dot (`animationIn=".my-zoom-in"`), so that I can animate a Reveal at another speed or with another effect than the library's.
49. As an application developer migrating Foundation markup, I want the docs to name, for each Foundation class I would copy onto the dialog (`class="tiny reveal"`), the input to bind instead, so that my markup moves to the directive's inputs.
50. As an application developer, I want to put a class of my own on the dialog and style its `::backdrop`, so that one Reveal can dim the page differently, as Foundation's `additionalOverlayClasses` allowed.
51. As a developer of a server-rendered application, I want the server HTML to carry `.reveal`, the size class, and `.collapse` although I wrote none of them, so that Foundation's CSS styles the first paint.

## Implementation Decisions

### Foundation contract

Foundation 6.9's Reveal, from its `Reveal.defaults`, its events, and its methods:

| Foundation Option | Default | What it does in 6.9 | Library counterpart |
| --- | --- | --- | --- |
| `animationIn` | `''` | Motion UI class for opening (the overlay gets `fade-in`); empty means jQuery `show()` | `animationIn` input: a Motion name, which binds the library's keyframe class of that name (`spin-in` binds `nfs-spin-in`), or the consumer's own keyframe classes written with a leading dot; the backdrop fades with it |
| `animationOut` | `''` | Motion UI class for closing (the overlay gets `fade-out`) | `animationOut` input, same rules with the leaving names |
| `showDelay`, `hideDelay` | `0` | Duration of jQuery `show()`/`hide()` when no animation is set | Dropped option: timing belongs to CSS (building-blocks 1.4) |
| `closeOnClick` | `true` | A click on the overlay closes; without an overlay, a body click closes unless `fullScreen` | `closeOnClick` input: a Backdrop press on a modal Reveal; the Light dismiss pointer rule on a non-modal one |
| `closeOnEsc` | `true` | A window `keydown` handler closes on Escape while open | `closeOnEsc` input: the directive handles unhandled Escape before the browser's close request, so `false` holds |
| `multipleOpened` | `false` | When false, fires `closeme.zf.reveal` before opening so other Reveals close | `multipleOpened` input: `false` closes the other open Reveals first; `true` stacks modals with nested `showModal()` |
| `vOffset` | `'auto'` | Inline `top`: `(viewport height - modal height) / 4`, or `min(100, vh / 10)` when taller than the viewport; a number is px | `vOffset` input; `'auto'` reproduced in CSS by rule 7; a number applies at medium and up |
| `hOffset` | `'auto'` | Inline `left`; `auto` centres; a number also zeroes the margins | `hOffset` input; `'auto'` is Foundation's CSS centring; a number applies at medium and up |
| `fullScreen` | `false` | Forced true by `.full`; forces `overlay: false` and disables the body click | Dropped option: `size="full"` sets the `.full` Variant class; a full-screen Reveal stays modal |
| `overlay` | `true` | Generate `.reveal-overlay`; `false` adds `.without-overlay` | `overlay` input: `true` opens with `showModal()` and `::backdrop`, `false` opens with `show()` and binds `.without-overlay` |
| `resetOnClose` | `false` | Re-assigns `innerHTML` on close to stop media | Dropped option (building-blocks 1.4): re-parsing destroys Angular bindings; content that must reset is Lazy content under `@if (reveal.isOpen())` |
| `deepLink` | `false` | Opens on load when `location.hash` is `#id`, writes and clears the hash, follows `hashchange` | `deepLink` input, after hydration, consumer id required |
| `updateHistory` | `false` | `pushState` instead of `replaceState` | `updateHistory` input |
| `appendTo` | `'body'` | Where the overlay (or the modal) is moved | Dropped option: the top layer needs no move |
| `additionalOverlayClasses` | `''` | Extra classes on the generated overlay | Dropped option: there is no overlay element; the consumer puts a class of its own on the dialog and styles `dialog.<class>::backdrop`, which outranks rule 6 (specificity 0,1,2 against 0,1,1) |

| Foundation event | When | Library counterpart |
| --- | --- | --- |
| `open.zf.reveal` | End of `open()`, synchronously, while the animation still runs | `opened` Completion output, after the enter animation |
| `closed.zf.reveal` | After the hide or animation | `closed` Completion output, after `dialog.close()`, carrying the result |
| `closeme.zf.reveal` | Before this Reveal opens, when `multipleOpened` is false, so others close | No output: the directive's own stack closes the others |
| `init.zf.reveal`, `destroyed.zf.reveal` | Plugin lifecycle | None (Angular lifecycle) |

Methods: `open()`, `close()`, `toggle()` keep their names (`open(trigger?)`, `close(result?)`, `toggle(trigger?)`); `destroy()` has no counterpart.

Dropped options and behaviours: `showDelay`, `hideDelay`, `fullScreen`, `resetOnClose`, `appendTo`, `additionalOverlayClasses`, `data-options`; the generated overlay and the move into it; `role="dialog"`, `aria-hidden`, `tabindex="-1"`, `data-yeti-box`, and `data-resize` stamped on the modal; focusing the modal; the static focus-trap list; `tabindex="0"` stamped on anchors; `.fast`/`.slow` copied to the overlay; the `resizeme` re-centring; Motion UI transition classes; the `$('.reveal:visible')` count.

### CSS class to Angular mapping

No Foundation or library class is left for the consumer to write ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)); the consumer writes the `<dialog>` element and the directive's attributes.

| Foundation class or element | Kind | Angular | Type, Sass setting, and Variant registry | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.reveal` | Structural class | `NfsReveal` (`dialog[nfsReveal]`), static host class | - | `reveal` | - |
| `.tiny`, `.small`, `.large`, `.full` | Variant classes, a Closed Variant family | `size` Variant input of `NfsReveal` | `NfsRevealSize`, closed: `'tiny' \| 'small' \| 'large' \| 'full'`; `foundation-reveal` writes the four classes itself and no Sass setting lists them, so there is no registry | the name itself (`size="tiny"` sets `.tiny`); unset sets none, so the dialog has Foundation's default width (`$reveal-width`) and full screen below medium as always; `'full'` replaces the `fullScreen` Option | none (closed) |
| `.collapse` | Variant class, a single modifier | `collapse` Variant input of `NfsReveal` | boolean through `nfsVariantBoolean`, closed | `collapse` while true | none (closed) |
| `.without-overlay` | Foundation's JavaScript class for its `overlay` Option | Host binding `[class.without-overlay]` from the `overlay` Option being false | the Option's `booleanAttribute` (an Option, not a Variant input) | - | - |
| `.is-opening`, `.is-closing` | State classes | Host bindings while an enter or exit Motion class runs | - | - | - |
| Motion classes: the `nfs-` keyframe classes of `nfs-motion`, or the consumer's own | Motion classes | Host class binding during the matching phase, from the value of `animationIn` or `animationOut` | `NfsMotionIn` and `NfsMotionOut` (closed Motion names, or the consumer's classes written with a leading dot; API below) | a Motion name sets `nfs-<name>` (`fade-in` sets `nfs-fade-in`); the dot form sets the consumer's classes without their dots; `''` sets none | - |
| `html.is-reveal-open`, `html.zf-has-scroll` | State classes on an element that carries no library directive | Written on the document element with `Renderer2` by the Scroll lock, from a render callback | - | - | - |
| `.reveal-overlay` | generated by Foundation's JavaScript | None: `::backdrop`, coloured by rule 6 of the `nfs-reveal` mixin | - | - | - |
| `.close-button` | Structural class of the Close Button | `button[nfsCloseButton]` ([Spec: Close Button](../issues/83-spec-close-button.md)) with a bare `nfsClose` beside it | - | `close-button` | - |

Reasons, row by row:

- `.reveal`: an attribute directive on the consumer's element (ADR 0001, ADR 0007); the element is `<dialog>`, the one markup delta from Foundation's `div`. A `class="reveal"` copied from Foundation's markup merges with the static host class (building-blocks 1.4).
- Sizes: building-blocks 1.4 rule 3 names the input `size`, and Foundation's own `.full` rule makes the four mutually exclusive in effect (it comes last in `foundation-reveal` and overrides the width of the others), so one enum input holds them. `fullScreen` does not name the family (rule 1): it names one member, and Foundation's JavaScript set the Option from the class, never the class from the Option. Foundation has no responsive size class, so `size` takes no Breakpoint query or rules object.
- `.collapse`: building-blocks 1.4 rule 4, a single on or off class is a boolean named after it.
- `.without-overlay`: the consumer never wrote it in Foundation's markup; Foundation's JavaScript added it from `data-overlay="false"`, and the class follows the `overlay` Option, which also decides modal or non-modal behaviour. So `overlay` stays an Option with `booleanAttribute` and a Defaults token slot (building-blocks 1.4), which a Variant input could not have.
- `.is-opening`, `.is-closing`: Foundation's own State class names (Dropdown's `.is-opening`, Drilldown's `.is-closing`); Foundation's Reveal Sass styles neither, so they only key the backdrop keyframes and the completion wait.
- Motion classes: ADR 0003 and building-blocks 1.6 rules 1 and 4; the value is a typed name, never a class name (ADR 0039, the follow-up on class names passed as input values).
- `html` classes: Foundation's Sass does the locking; the Scroll lock writes the classes and the `top` offset on the document element, which no library directive hosts, for a state that has no first-paint value (no Reveal is modal before hydration, and only modal Reveals lock). A `Renderer2` write there satisfies the class rule: the consumer writes no class and the directive that owns the state manages it (the user's decision recorded by the [Re-run: Magellan spec under the class rule](../issues/122-rerun-magellan-class-rule.md)).
- `.close-button`: the Close Button spec owns the class, the `type` default, and the 24 px floor; the closing comes from the Triggers spec's `nfsClose`, placed beside it and never hosted (Close Button D2).
- Triggers: the Reveal writes no class on its Triggers, neither by host binding nor with `Renderer2` ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md), D18); a Trigger's classes come from the directive beside it, `nfsButton` or `nfsCloseButton`.

### Hierarchy and DI shape

```
ngx-foundation-sites/reveal  (secondary entry point)
  dialog[nfsReveal]   NfsReveal, exportAs 'nfsReveal'
    provides nfsOpenableToken (useExisting)     -> Triggers: bare nfsClose / nfsToggle inside
    provides nfsRevealToken   (useExisting)     -> content components that need their Reveal
    injects  nfsRevealDefaultsToken (optional)  -> Defaults token
    injects  nfsAnimationsToken (optional)      -> animations off in tests
    injects  InteractivityChecker, _IdGenerator (CDK), DOCUMENT, NgZone, Injector, DestroyRef
    queries  contentChild(nfsCloseButtonToken, {descendants: true}) -> data-nfs-close-button (rule 8)
    uses     nfsLightDismiss(...) while open and non-modal (Anchored pane utility)
    uses     nfsVariantBoolean, nfsMotionClasses (primary entry point)
  NfsRevealStack      internal @Service(): the open Reveals in order, the Scroll lock, one window keydown listener
```

- `nfsOpenableToken` makes the Reveal the Nearest Openable of everything inside it, so a bare `nfsClose` closes it and a bare `nfsClose` inside a Dropdown pane inside it closes only the pane (Triggers spec, D4).
- `nfsRevealToken = new InjectionToken<NfsReveal>('nfsRevealToken')`, in a token file that imports only types (building-blocks 1.9, ADR 0009): a component projected into the dialog injects it with `{optional: true}` to call `close(result)`, the declarative counterpart of injecting Material's `MatDialogRef`. A nested Reveal provides its own, so the nearest wins.
- `nfsRevealDefaultsToken: InjectionToken<NfsRevealDefaults>`, all-optional Material shape B (building-blocks 1.4): `overlay`, `closeOnClick`, `closeOnEsc`, `multipleOpened`, `vOffset`, `hOffset`, `animationIn` (`NfsMotionIn`), `animationOut` (`NfsMotionOut`), `deepLink`, `updateHistory`, `autoFocus`, `restoreFocus` (boolean only). Provided at bootstrap, route, or element level; the nearest wins. It holds no Variant input: `size` and `collapse` have no application-wide default ([ADR 0040](../adr/0040-variant-input-types.md)).
- `NfsRevealStack` holds state shared across instances, which is the only reason a service is allowed (building-blocks 1.5): the ordered list of open Reveals (for `multipleOpened`, the topmost modal, and the focus fallback), the Scroll lock count, and the single `window` `keydown` listener that exists only while a modal Reveal is open. It is internal to the entry point, not public API.
- Non-modal Reveals use the Light dismiss registry through `nfsLightDismiss` from the Anchored pane utility (group `null`, `outsidePress` from `closeOnClick`, Triggers from `registerTrigger`); modal Reveals never register, because the page behind them is inert.
- Entry point `ngx-foundation-sites/reveal`; it imports the Triggers token and the Anchored pane utility. It exports `NfsRevealSize`; the Motion name types and `nfsMotionClasses` come from the primary entry point `ngx-foundation-sites`, beside the Variant types, because the four directives with Motion inputs share them. The close button's directive comes from `ngx-foundation-sites/close-button`, which the consumer imports; the Reveal imports from that entry point only `nfsCloseButtonToken`, the lightweight token its close-button query looks for, so a Reveal's bundle does not keep the Close Button directive (the Callout's pattern, [Spec: Callout](../issues/89-spec-callout.md) D10).

### API

```ts
// ngx-foundation-sites (primary entry point), shared by every Motion input
type NfsMotionInName = 'fade-in' | 'slide-in-down' | 'slide-in-left' | 'slide-in-right' | 'hinge-in-from-top' | 'spin-in';
type NfsMotionOutName = 'fade-out' | 'slide-out-up' | 'slide-out-left' | 'slide-out-right' | 'spin-out';
type NfsMotionClassList = `.${string}`; // the consumer's own keyframe classes, each written with a leading dot
type NfsMotionIn = NfsMotionInName | NfsMotionClassList | '';
type NfsMotionOut = NfsMotionOutName | NfsMotionClassList | '';

// ngx-foundation-sites/reveal
type NfsRevealSize = 'tiny' | 'small' | 'large' | 'full';
type NfsRevealRole = 'dialog' | 'alertdialog';
type NfsRevealAutoFocus = 'first-tabbable' | 'first-heading' | (string & {}) | false;
type NfsRevealRestoreFocus = boolean | string | HTMLElement;
type NfsRevealOffset = number | 'auto';

class NfsReveal implements NfsOpenable { // selector dialog[nfsReveal], exportAs 'nfsReveal'
  readonly isOpen: ModelSignal<boolean>;
  readonly id: InputSignal<string>;
  readonly triggerRole: Signal<'dialog' | 'modal-dialog'>;
  readonly size: InputSignal<NfsRevealSize | undefined>; // default undefined: no class
  readonly collapse: InputSignalWithTransform<boolean, NfsVariantBoolean>; // default false
  readonly overlay: InputSignalWithTransform<boolean, unknown>;
  readonly closeOnClick: InputSignalWithTransform<boolean, unknown>;
  readonly closeOnEsc: InputSignalWithTransform<boolean, unknown>;
  readonly multipleOpened: InputSignalWithTransform<boolean, unknown>;
  readonly vOffset: InputSignalWithTransform<NfsRevealOffset, unknown>;
  readonly hOffset: InputSignalWithTransform<NfsRevealOffset, unknown>;
  readonly animationIn: InputSignal<NfsMotionIn>;
  readonly animationOut: InputSignal<NfsMotionOut>;
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
| `animationIn` | `input()`, explicit type argument `NfsMotionIn` | an entering Motion name (`NfsMotionInName`), Application classes that are keyframe animations, each with a leading dot (`'.my-zoom-in'`), or `''` | Defaults token, else `''` | `data-animation-in` | A Motion name binds the library's `nfs-<name>` keyframe class, so Foundation's `data-animation-in="spin-in"` keeps its value; a misspelt name, a leaving name, Motion UI's `fast`/`slow` modifiers, and a library class name (`'nfs-fade-in'`) fail to compile (ADR 0039, class names passed as input values); keyframe classes only (ADR 0003); the value must start a CSS animation (usage rule 3) |
| `animationOut` | `input()`, explicit type argument `NfsMotionOut` | a leaving Motion name (`NfsMotionOutName`), the dot form, or `''` | Defaults token, else `''` | `data-animation-out` | Same, with the leaving names |
| `deepLink` | `input()`, `booleanAttribute` | boolean | `false` | `data-deep-link` | Applies after hydration; requires a consumer-supplied `id` |
| `updateHistory` | `input()`, `booleanAttribute` | boolean | `false` | `data-update-history` | `history.state` passed through |
| `id` | `input()` | string | generated, prefix `nfs-reveal-` | The consumer's required `id` | Optional except with `deepLink`; bound as `[attr.id]`; the Openable's `id` |
| `role` | `input()` | `'dialog' \| 'alertdialog'` | `'dialog'` | None (Foundation stamps `role="dialog"`) | New, Material's `role`; `'alertdialog'` renders `role="alertdialog"`, `'dialog'` renders nothing (the element's implicit role) |
| `autoFocus` | `input()`, transform (`''` becomes `'first-tabbable'`, `'false'` becomes `false`) | `'first-tabbable' \| 'first-heading' \|` selector `\| false` | `'first-tabbable'` | None (Foundation focuses the modal) | New, Material's union without `'dialog'`; kind `insertion` (building-blocks 1.4): the host binds `'[attr.autofocus]': 'null'` (Focus, Static `autoFocus`) |
| `restoreFocus` | `input()`, transform (`''` becomes `true`, `'false'` becomes `false`) | boolean, selector, or element | `true` | None (Foundation always refocuses its anchor) | New, CDK's `RestoreFocusValue` |
| `closePredicate` | `input()` | `(result) => boolean`, or `null` | `null` | None | New, Material's `closePredicate` with the result only |

Variant inputs (building-blocks 1.4; [ADR 0040](../adr/0040-variant-input-types.md)), each declared with explicit type arguments that name its exported alias, never with `booleanAttribute`, and never held by the Defaults token:

| Input | Kind | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `size` | `input()`, no transform | `NfsRevealSize`: `'tiny' \| 'small' \| 'large' \| 'full'` (Closed Variant family) | `undefined`, which sets no class | `.reveal.tiny`, `.small`, `.large`, `.full`; the `fullScreen` Option | New. The JSDoc names the class template `.reveal.<size>`; `'full'` is the full-screen dialog, which stays modal |
| `collapse` | `input()`, transform `nfsVariantBoolean` | boolean from `NfsVariantBoolean` (`boolean \| '' \| 'true' \| 'false' \| null \| undefined`) | `false` | `.reveal.collapse` | New. The bare attribute sets it; `collapse="flase"` fails to compile |

Neither family is open: no Sass setting lists Reveal's size names or `.collapse`, so the Reveal has no Variant registry and writes no Variant property. Class bindings on the host: the static `reveal` class; one `[class]` binding from a `computed` list holding the `size` class, `collapse`, and the Motion classes of the current phase, each only when it is one class token, so the consumer's own classes and a copied Variant class stay (usage rule 8 says to write none); and `[class.without-overlay]`, `[class.is-opening]`, `[class.is-closing]` from signal state, which strip a copied one. The library styling hook for the close-button room (rule 8): `[attr.data-nfs-close-button]`: `''` while `contentChild(nfsCloseButtonToken, {descendants: true})` finds a close button, else `null` (the Callout's hook, [Spec: Callout](../issues/89-spec-callout.md) D10); `nfsCloseButtonToken` comes from `ngx-foundation-sites/close-button`.

Model, outputs, methods:

| Member | Meaning |
| --- | --- |
| `isOpen` (model, change output `isOpenChange`) | `true` from an open request until a close request is accepted, not waiting for animations (the Openable contract); `[isOpen]="true"` opens a modal Reveal after hydration and renders a non-modal one shown from the first paint. A parent writing `false` closes without asking `closePredicate`: the parent owns its own state |
| `opened` | Completion output: after `showModal()`/`show()` and the enter animation (or in the render callback after the dialog was shown, when there is none); not emitted for a non-modal Reveal open at first paint, which the directive never shows (the initial-state rule of the Toggler and Dropdown pane specs) |
| `closed` | Completion output with the result: the value passed to `close(result)` (`nfsCloseResult` through `nfsClose`), `undefined` for Escape, Backdrop press, Light dismiss, a sibling close, or a parent model write, and the dialog's `returnValue` for a native close (`<form method="dialog">`, a forced close request) |
| `open(trigger?)` | Records `trigger` as the element focus returns to and requests the open; a no-op when already open. When a close is still animating, it cancels the exit and the dialog stays open with no events |
| `close(result?)` | A no-op when closed; otherwise asks `closePredicate(result)`, and when it does not veto, requests the close, keeping `result` for `closed` |
| `toggle(trigger?)` | `isOpen() ? close() : open(trigger)` |
| `registerTrigger(trigger)` | Remembers the element so the Light dismiss pointer rule treats presses on it as inside (non-modal Reveals); returns the unregister function; the first registered Trigger outside the dialog is also the last focus-restore fallback |
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
- Usage rules (the directive's JSDoc states them, and the usage examples follow them):
  1. Name the dialog: `aria-labelledby` pointing at its visible title, or `aria-label` (WCAG 4.1.2).
  2. An alert dialog (`role="alertdialog"`) has a description: `aria-describedby` pointing at its message (WCAG 1.3.1).
  3. A non-empty `animationIn` or `animationOut` starts a CSS animation when its phase begins: a Motion name needs the `nfs-motion` include, a dot-form class needs its own `@keyframes`, and a Motion UI transition class is not a keyframe animation; the library's Motion names are written without their `nfs-` prefix (`animationIn="fade-in"`, never `animationIn=".nfs-fade-in"`). A value that starts no animation completes its phase at once.
  4. A Reveal with `deepLink` has a consumer-supplied `id`.
  5. No `tabindex` attribute on the `<dialog>`: HTML forbids it there.
  6. The dialog holds at least one tabbable element, a visible close button being the APG's strong recommendation: with nothing tabbable inside, every engine focuses the dialog box.
  7. With `restoreFocus` not `false`, a usable restore target exists at close: the `restoreFocus` target, the `trigger` passed to `open()`, the element focused when the Reveal opened, or a registered Trigger outside the dialog. A Reveal open at its first render has no `trigger`, so it needs a Trigger outside the dialog or a `restoreFocus` target; with no usable target, focus is not moved.
  8. No Foundation or library class the directive sets on the `<dialog>`: bind `size="tiny"` (and the other sizes) for a size class, `collapse` for `.collapse`, `[overlay]="false"` for `without-overlay`, and the Motion inputs for an `nfs-` class; `is-opening` and `is-closing` are the directive's State classes. A redundant `reveal` merges with the static host class (building-blocks 1.4, the initial-state rule).
  9. On a Reveal that can be open at its first render, `autoFocus` is bound (`[autoFocus]="..."`) or set in `nfsRevealDefaultsToken`, never written as a static attribute: in client rendering the browser acts on the `autofocus` attribute when the dialog is inserted, before the directive removes it (Focus, Static `autoFocus`).

### Focus

- Initial focus, placed right after `showModal()`/`show()` in the same render callback, from `autoFocus`:
  - `'first-tabbable'` (default): a descendant carrying the `autofocus` attribute when it is focusable (the platform's own choice, which the dialog focusing steps already honoured); otherwise the first element in sequential focus order for which CDK `InteractivityChecker` reports focusable, visible, and tabbable. When nothing qualifies, focus is left where the browser put it (usage rule 6).
  - `'first-heading'`: the first `h1` to `h6` or `[role="heading"]` inside; the APG's choice for dialogs that open on long text.
  - any other string: the first descendant matching it as a selector; the APG's choice for "the least destructive action" in an alert dialog.
  - `false`: the directive moves no focus; the browser's dialog focusing steps decide.
  - A heading or selector target that is not focusable gets a temporary `tabindex="-1"`, removed on its `blur`, as CDK Dialog does. The dialog element itself is never the target (APG).
- Static `autoFocus`: HTML attribute names are case-insensitive, so `autoFocus="first-heading"` on the host is also the HTML `autofocus` attribute, which makes Firefox and WebKit focus the dialog itself when it is shown, and every engine focus a dialog parsed or inserted open. The host binds `'[attr.autofocus]': 'null'` (building-blocks 1.4, kind `insertion`), so the attribute never reaches the server HTML, and the directive still removes an `autofocus` attribute from its host before every `showModal()`/`show()`, which covers a consumer's own `[attr.autofocus]`. A Reveal opened after its first render works with either form: the browser drops the candidate of a closed dialog. A Reveal open at its first render takes `autoFocus` by binding or `nfsRevealDefaultsToken`: in client rendering the browser takes the dialog as an autofocus candidate when it is inserted, before the binding runs, and WebKit then focuses the dialog element after the first render callback has placed focus (measured in three engines by [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md)), so usage rule 9 asks for the bound form there. A bound `[autoFocus]` renders no attribute.
- Tab wrap (modal only): a host `keydown` handler takes every Tab and Shift+Tab, computes the tabbable elements inside the dialog in sequential focus order (positive `tabindex` values first in ascending order, then document order; in a radio group only the checked radio, or the first when none is checked; each element focusable, visible, and tabbable by `InteractivityChecker`), moves focus to the next or previous one with wrap-around, then calls `preventDefault()`. Focus on the dialog element itself or on `body` goes to the first element (Tab) or the last (Shift+Tab). The directive handles every Tab, not only the ends, because WebKit puts the dialog element into its own Tab order and leaves links out of it, so an end-only check misfires there. No engine wraps natively.
- Restore focus, when `restoreFocus` is not `false`, after `dialog.close()` and after the Scroll lock has restored the page position: the target is the element given by `restoreFocus` (a selector resolved in the document, or an element), or for `true` the `trigger` passed to `open()`, else the element focused when the Reveal opened when that was not `body`, else the first registered Trigger outside the dialog (the Off-canvas spec's fallback; a bare `nfsClose` inside the dialog registers too and is never the target), which covers a Reveal open at its first render: nothing opened it, so no `trigger` exists (usage rule 7). Focus moves only when it is inside the dialog, on the dialog, on `body`, or nowhere (CDK Dialog's rule), so a non-modal Reveal closed by focus moving elsewhere does not pull focus back. When the target is disconnected or no longer focusable, and it sat inside a Reveal that this Reveal's opening closed (`multipleOpened` false), the target becomes that Reveal's own restore target, repeated up the chain; with no usable target, focus is not moved.
- WebKit does not focus a button on mouse click, so `document.activeElement` at open time is not the Trigger there; the Trigger passes itself through `open(trigger)` (Triggers spec), which is why the argument exists.

### Scroll lock

Ported from Foundation's `_disableScroll`/`_addGlobalClasses` and `_enableScroll`/`_removeGlobalClasses`, because the page scrolls behind an open modal in all three engines, with and without `overscroll-behavior: contain` (the Reveal dialog prototype):

- When the first modal Reveal opens, `NfsRevealStack` reads the page position and whether the document is taller than the viewport (`scrollHeight > clientHeight` on the document element) in the `earlyRead` phase, then in the `write` phase writes `top: -<scrollTop>px` on the document element (only when taller), toggles `zf-has-scroll`, and adds `is-reveal-open`. Foundation's `html.is-reveal-open` rule (`position: fixed; width: 100%; overflow-y: hidden`, `overflow-y: scroll` with `.zf-has-scroll`, `body { overflow-y: hidden }`) does the locking.
- When the last modal Reveal has closed (after its `dialog.close()`), it removes both classes and the inline `top`, and scrolls back to the saved position, before focus is restored.
- Non-modal Reveals do not lock (Foundation locked for every visible Reveal; the page behind a non-modal dialog stays usable, so it stays scrollable).
- Destroying the last open modal releases the lock (building-blocks 1.9, restore every global touched).

### Implementation level and primitives

Implementation level: native platform. `<dialog>`, `showModal()`, `show()`, the top layer, `::backdrop`, `:modal`, the `cancel` and `close` events, and implicit inertness of the rest of the page are Baseline widely available and inside the Browser target (ADR 0007). `@angular/aria` 22.2 has no dialog pattern. CDK Dialog, ADR 0007's named fallback, is not needed for any case: the Reveal dialog prototype matched Foundation's own `.reveal` inside `.reveal-overlay` to the pixel for every size at 320, 640, and 1024 px in Chromium, Firefox, and WebKit once the Library mixin's rules were added, and CDK Dialog would not use `<dialog>`, defaults `aria-modal` off, and hides siblings with `aria-hidden`. `dialog.closedby`, `requestClose()`, `CloseWatcher`, `@starting-style`, and Invoker Commands are out of target and not used (Further Notes).

Primitives: `HTMLDialogElement.showModal()`, `show()`, `close()`, `returnValue`; `cancel` and `close` events; Pointer Events on the host; `keydown` with `event.key` and `isComposing`; `animationend`/`animationcancel` with `pseudoElement` and `animationName`; `getComputedStyle` for the animation lengths; CDK `InteractivityChecker` (focusable, visible, tabbable) and `_IdGenerator`; the History API and `hashchange`; `model()`, `input()` with transforms, `output()`, `computed()` (one of them reading `isOpen` and `overlay` untracked, so the first-render `open` binding never re-evaluates), one `linkedSignal` for the animation phase, `afterRenderEffect`, `afterNextRender`, `inject()` with `optional`, host metadata for classes, attributes, custom-property style bindings, and listeners; `NgZone.runOutsideAngular` for the fallback timer and the `window` listeners; `nfsLightDismiss` from the Anchored pane utility; `nfsVariantBoolean` and `nfsMotionClasses` from the primary entry point.

Render hooks and effects (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Open and close sync (showModal, close, Scroll lock, focus, history) | `afterRenderEffect` with phases: `earlyRead` reads `document.activeElement` and the page scroll position before anything moves; `write` applies the Scroll lock, removes `autofocus`, calls `showModal()`/`show()` or `close()`, places or restores focus, and writes history; `read` measures the host's computed animations after the phase classes are bound and starts the completion wait | It re-runs only when `isOpen`, the phase, or `overlay` change, so a closed Reveal costs nothing; the phases keep the scroll read ahead of the lock's writes; it covers open-by-default because its first run follows the first render, and never runs on the server |
| Deep-link listener and first hash read | `afterRenderEffect` keyed on `deepLink` (cleanup removes the `hashchange` listener) | Follows a changing input; `location` and `history` only after first render (building-blocks 1.11 decision 3) |
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
| Close button | `[mat-dialog-close]="result"`, `type="button"` default, `aria-label` input | Bare `nfsClose` with `[nfsCloseResult]`, beside `nfsCloseButton` on Foundation's close button, which owns the look and the `type="button"` default ([Spec: Close Button](../issues/83-spec-close-button.md)); names are native attributes |
| Title and name | `mat-dialog-title` queues its id into `aria-labelledby`; `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy` config | The consumer's `aria-labelledby`, `aria-label`, `aria-describedby` on the `<dialog>`, which the docs require (usage rules 1 and 2) |
| Role | `role: 'dialog' \| 'alertdialog'` | Same values, `role` input |
| Modality | CDK overlay, `aria-modal` configurable (default false), `aria-hidden` on siblings | Native `showModal()`: top layer and inert page; no `aria-modal`, no `aria-hidden` |
| Backdrop | `hasBackdrop`, `backdropClass`, `backdropClick()` | `overlay`; `::backdrop` styled by Foundation's setting; the consumer puts a class of its own on the dialog and styles `dialog.<class>::backdrop` |
| Escape | Closes without modifier keys unless `disableClose` | Unhandled Escape closes the topmost modal unless `closeOnEsc` is false or the predicate vetoes; the close request is cancelled so vetoes hold |
| Initial focus | `autoFocus`: `'first-tabbable'`, `'first-heading'`, `'dialog'`, selector, boolean | Same without `'dialog'` (the APG forbids focusing the dialog element); `false` leaves the browser's choice |
| Focus trap | CDK `FocusTrap` with sentinels | Native containment plus the directive's Tab wrap (CDK's sentinels would sit outside the dialog, in the inert page) |
| Restore focus | `restoreFocus: boolean \| string \| HTMLElement`, only when focus is still inside | Same type and guard, plus the `trigger` from `open(trigger)` and the fallback up closed Reveals |
| Sizing and position | `width`, `height`, `min*`, `max*`, `position` config | The `size` and `collapse` Variant inputs over Foundation's classes, and `vOffset`/`hOffset` |
| Scroll | `scrollStrategy` (block by default) | Foundation's `html.is-reveal-open` Scroll lock |
| Several dialogs | `openDialogs`, `closeAll()` | `multipleOpened` |
| Navigation | `closeOnNavigation` (true) | Not borrowed: a Reveal lives in a template and is destroyed with its route; a Reveal in a persistent layout stays open, as in Foundation |
| Animation | MDC classes plus a timer, or keyframes with `animationend` and a fallback of total time plus 100 ms | Typed Motion names mapped to the library's keyframe classes, or the consumer's own, through State classes, `animationend` filtered by name, measured length plus 100 ms fallback |

Borrowed: `close(result)`, `closePredicate`, the `autoFocus` union, `restoreFocus`, `role`, the `[mat-dialog-close]` result through `nfsClose`, the restore-only-when-focus-is-inside guard, the fallback timer. Not borrowed: the service and overlay container, `aria-modal` and sibling `aria-hidden`, sizing config, `closeOnNavigation`, `beforeClosed()`, `backdropClick()`, `keydownEvents()`.

### ARIA and keyboard

APG pattern: Dialog (Modal) for `overlay: true`; Alert Dialog when `role` is `'alertdialog'`; a non-modal dialog for `overlay: false`, which the APG treats as not modal.

| Element | Attribute | Value and source |
| --- | --- | --- |
| `<dialog>` | role | Implicit `dialog`; `role="alertdialog"` from the `role` input |
| `<dialog>` | modal state | From `showModal()` (the top layer and the inert page); `aria-modal` is never set |
| `<dialog>` | accessible name | The consumer's `aria-labelledby` pointing at the visible title, else `aria-label` (required; usage rule 1) |
| `<dialog>` | description | The consumer's `aria-describedby`; required for `alertdialog` (usage rule 2), omitted when the content is structured (APG) |
| `<dialog>` | `id` | The `id` input; what the Triggers' `aria-controls` names |
| `<dialog>` | `open` | Set by `showModal()`/`show()`; bound only for a non-modal Reveal open at its first render, from a value fixed then, so no later change detection writes it (Rendering modes) |
| `<dialog>` | `tabindex`, `aria-hidden` | Never (HTML forbids `tabindex` on `<dialog>`; closed dialogs are `display: none`) |
| Trigger | `aria-haspopup="dialog"`, `aria-controls`; plus `aria-expanded` only when `overlay` is false | Triggers spec, `modal-dialog` or `dialog` Trigger role |
| `button[nfsCloseButton]` | name | The consumer's `aria-label`; the `&times;` glyph is `aria-hidden="true"` (Foundation's docs markup; [Spec: Close Button](../issues/83-spec-close-button.md)) |

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
| 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value | The dialog exposes role `dialog` (or `alertdialog`), modal state, and a name. Role and modal state come from `<dialog>` and `showModal()`; the name is required from the consumer's `aria-labelledby` or `aria-label`; an alert dialog requires `aria-describedby` (usage rules 1 and 2) | axe in every story with the dialog open; the screen-reader announcement is the release test under Testing Decisions |
| 1.4.3 Contrast (Minimum) | Text inside the dialog meets 4.5:1. Rule 5 makes the dialog inherit Foundation's body colour instead of the user-agent `CanvasText`; Foundation's defaults (`$body-font-color` on `$reveal-background`) pass | axe `color-contrast` in every story |
| 1.4.11 Non-text Contrast | The close glyph, the visual that identifies the close button (`nfsCloseButton`), contrasts at least 3:1 with the dialog in both states, the surface under it, and the glyph is measured against the background of each container it sits in: required settings `$closebutton-color` and `$closebutton-color-hover` at 3:1 or better against `$reveal-background` (defaults 3.42:1 and 19.63:1 against Foundation's `$white`, `#fefefe`; the 32 px glyph also counts as large text for 1.4.3). The dialog's edge contrasts at least 3:1 with the page dimmed by the backdrop: required setting `$reveal-background` at 3:1 or better against `$reveal-overlay-background` composited over `$body-background` (defaults 3.17:1). Ratios are the exact WCAG relative-luminance formula, compared unrounded (Foundation's `color-contrast()` rounds to one decimal and would pass 2.95:1) | Documented usage (the required settings of the Sass subsection); the stories compile with Foundation's defaults, whose ratios are given here; axe has no 1.4.11 rule |
| 1.4.10 Reflow | At 320 CSS px (and 400% zoom of 1280 px) the dialog is full screen through Foundation's small-only rule; tall content scrolls inside the dialog, whose box ends inside the viewport (rule 4), so the end of the content is reachable without two-dimensional scrolling | e2e at 320 x 640 and with tall content |
| 1.4.12 Text Spacing | No dialog text runs under its close button: while `data-nfs-close-button` is on the dialog, `nfs-reveal` sets the padding on the button's side to `max($reveal-padding, <offset> + max(24px, <font size>))` over every close-button size (48 px on Foundation's defaults) (rule 8, D29). Fails for Foundation's own example: at 320 by 800 CSS px with the text spacing, its heading runs 16.6 by 27 px under the button in Chromium, Firefox, and WebKit (measured by the [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md)) | e2e at 320 by 800 px with the text-spacing stylesheet: no text rectangle of `reveal--basic` intersects the close button's box; the dialog's right padding is 48 px |
| 1.4.13 Content on Hover or Focus | Not applicable: a Reveal opens on activation, never on hover or focus | None |
| 2.1.1 Keyboard, 2.1.2 No Keyboard Trap | Every Trigger is a native button; the modal contains focus by design and is left with Escape or a close button; with `closeOnEsc` false or a vetoing `closePredicate`, the dialog must contain a control that closes it (usage rule 6) | Story `reveal--alert-dialog` |
| 2.4.3 Focus Order | Focus moves into the dialog on open, wraps inside a modal, and returns to the Trigger on close; a non-modal Reveal sits in the tab order where it is written, so the consumer writes it right after its Trigger | Stories `reveal--basic`, `reveal--nested`; browser-level focus tests |
| 2.4.7 Focus Visible | The browser's `:focus-visible` ring shows on every control inside (Foundation removes outlines only under what-input's `[data-whatinput='mouse']`, which the library never loads) | e2e computed outline in three engines |
| 2.4.11 Focus Not Obscured (Minimum) | Modal: the page behind is inert, so focus never reaches content under the dialog; a focused control in a tall dialog is scrolled into view by the browser; the Trigger is focused after the Scroll lock has restored the page position. Non-modal: the dialog closes when focus moves outside it, one of the ways of passing the Understanding document names for non-modal content. A non-modal Reveal shown at first paint cannot be dismissed before hydration (Light dismiss starts in its first render callback, Rendering modes), so until the page hydrates it can cover a control the user focuses, the obstruction the dissent of [Decide: the server state of an open-by-default non-modal Reveal's Trigger](../issues/78-decide-open-by-default-non-modal-reveal-server-state.md) names; from its first render callback it takes focus only when nothing else has focus (D22), and Light dismiss closes it when focus then moves outside | e2e hit tests on focus stops and on the restored Trigger |
| 2.5.8 Target Size (Minimum) | Every close button is at least 24 by 24 CSS px through the `nfs-close-button` floor ([Spec: Close Button](../issues/83-spec-close-button.md)); the Reveal adds no rule | axe `target-size` (enabled by the `wcag22aa` tag) in every story; `reveal--basic` asserts the close button's box |

The `nfs-reveal` mixin adds one WCAG rule, the close-button room for 1.4.12 (rule 8): Foundation's defaults pass every other criterion above (the Reveal dialog prototype, axe with the WCAG 2.2 AA tags at 320 and 1024 px in every size, three engines), and the close button's target size is the `nfs-close-button` floor's.

### Rendered HTML

Consumer markup (Foundation's docs example with its deltas: `<dialog>` for `div`, and directive attributes for its classes and data attributes: `nfsReveal` for `.reveal` and `data-reveal`, `nfsCloseButton` with a bare `nfsClose` for `.close-button` and `data-close`, `nfsButton` for `.button`). The docs' `p.lead` stays Foundation's `.lead`, a normal class the consumer writes (`<p class="lead">`) with Foundation's global styles loaded; the examples here leave it out because it changes nothing the dialog owns:

```html
<button nfsButton [nfsOpen]="signup">Click me for a modal</button>

<dialog nfsReveal #signup="nfsReveal" id="signup" aria-labelledby="signup-title">
  <h1 id="signup-title">Awesome. I Have It.</h1>
  <p>Your couch. It is mine.</p>
  <button nfsCloseButton nfsClose aria-label="Close modal">
    <span aria-hidden="true">&times;</span>
  </button>
</dialog>
```

Server HTML (closed; identical for `[isOpen]="true"` on this modal Reveal, because only a non-modal Reveal binds `open`); every class comes from a host binding, and `data-nfs-close-button` from the close-button query, because the dialog holds a close button; `jsaction` lists the host's replayable listeners and is removed at hydration. Angular also renders the directive attributes and every static attribute that feeds an input (`nfsreveal`, `nfsclosebutton`, `size="tiny"`, `collapse`, `animationin="spin-in"`), none of which means anything to HTML on these elements; the HTML below leaves them out:

```html
<button class="button" type="button" aria-haspopup="dialog" aria-controls="signup" jsaction="click:;">Click me for a modal</button>
<dialog id="signup" aria-labelledby="signup-title" class="reveal" data-nfs-close-button="" jsaction="pointerdown:;pointerup:;keydown:;">
  <h1 id="signup-title">Awesome. I Have It.</h1>
  <p>Your couch. It is mine.</p>
  <button class="close-button" type="button" aria-label="Close modal" jsaction="click:;"><span aria-hidden="true">&times;</span></button>
</dialog>
```

Hydrated, open, with `animationIn="fade-in"` while the enter animation runs (the page's `html` carries the Scroll lock):

```html
<html class="is-reveal-open zf-has-scroll" style="top: -1000px;">
...
<button class="button" type="button" aria-haspopup="dialog" aria-controls="signup">Click me for a modal</button>
<dialog id="signup" aria-labelledby="signup-title" class="reveal is-opening nfs-fade-in" data-nfs-close-button="" open>
  ...
</dialog>
```

After the enter animation `is-opening nfs-fade-in` are gone; during the exit (`animationOut="fade-out"`) `is-closing nfs-fade-out` are bound while `open` stays; after `dialog.close()` the markup equals the server HTML without `jsaction`. With the dot form, `animationIn=".my-zoom-in"` binds `my-zoom-in` in place of `nfs-fade-in`.

Non-modal, alert dialog, sizes, and offsets:

```html
<dialog nfsReveal #note="nfsReveal" id="note" aria-label="Note" [overlay]="false">...</dialog>
<!-- open: class="reveal without-overlay" open; not :modal; no html classes -->
<!-- its Trigger: aria-haspopup="dialog" aria-controls="note" aria-expanded="false", then "true" while open -->
<!-- with [isOpen]="true", server and hydrated: class="reveal without-overlay" open, and its Trigger aria-expanded="true" -->
<!-- a modal Reveal with [isOpen]="true" stays without open on the server and is shown by showModal() after hydration -->

<dialog nfsReveal #confirm="nfsReveal" id="confirm" size="tiny" role="alertdialog"
        aria-labelledby="confirm-title" aria-describedby="confirm-text"
        autoFocus="#confirm-cancel" [closeOnClick]="false" [closeOnEsc]="false">...</dialog>
<!-- server: <dialog id="confirm" class="reveal tiny" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-text" jsaction="...">; the host binding keeps the static autoFocus out of the HTML -->

<dialog nfsReveal id="gallery" size="full" collapse aria-label="Gallery">...</dialog>
<!-- server and client: class="reveal full collapse" -->

<dialog nfsReveal id="placed" aria-label="Placed" vOffset="50" hOffset="20">...</dialog>
<!-- server and client: style="--nfs-reveal-top: 50px; --nfs-reveal-shift: 0px; --nfs-reveal-left: 20px;" -->
```

Generated ids differ between server and client and are rewritten at hydration, because the host `id` and every Trigger's `aria-controls` are host bindings (building-blocks 1.5).

### Animation

Per ADR 0003 and building-blocks 1.6 rule 1: the dialog stays in the DOM, so it animates through State classes and keyframes, never `animate.enter`/`animate.leave`, which play again at hydration on server-rendered elements ([Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)).

| Phase | Entered when | Host classes | Backdrop |
| --- | --- | --- | --- |
| idle | first render on server and client, and after every completion | none of the below | none |
| opening | `isOpen` becomes true after the first render, `animationIn` is non-empty, and animations are enabled | `is-opening` plus the classes of `animationIn` (`nfs-<name>` for a Motion name, the consumer's classes for the dot form) | `nfs-reveal-backdrop-in` keyframes (modal only) |
| closing | `isOpen` becomes false, `animationOut` is non-empty, and animations are enabled | `is-closing` plus the classes of `animationOut` | `nfs-reveal-backdrop-out` keyframes (modal only) |

- The phase is a `linkedSignal` derived from `isOpen`, so it is computed during change detection, starts idle on both platforms, and is set back to idle by completion. The classes are bound in the change detection pass before the render callback that calls `showModal()`, so the keyframes start from their first frame when the dialog becomes rendered.
- Default: no animation, Foundation's default (`animationIn` and `animationOut` are empty): the dialog and backdrop appear and disappear in one pass. `animationIn="fade-in" animationOut="fade-out"` (or the Defaults token) gives the fade; the backdrop fades whenever the dialog's class runs, as Foundation faded its overlay only with `animationIn`/`animationOut`.
- Completion: in the `read` phase after the classes are bound, the directive reads the host's computed `animation-name`, `animation-duration`, `animation-delay`, and `animation-iteration-count` and takes the longest finite animation (the Toggler spec's D8, Angular's own method for `animate.leave`). None measured (the class has no keyframes, or `nfs-motion` is missing) completes at once (usage rule 3). Otherwise the phase completes on a host `animationend` or `animationcancel` whose `target` is the host, whose `pseudoElement` is empty, and whose `animationName` is one of the host's measured names, or on a fallback timer of the measured length plus 100 ms started outside the Angular zone, whichever comes first. The name check exists because the backdrop's animation events are dispatched on the dialog, and WebKit reports them with `pseudoElement: ''`; the backdrop's keyframes carry their own names for that reason.
- Interruption: a close request while opening switches to closing (or straight to closing without a class) and emits no `opened`; an open request while closing cancels the exit, removes `is-closing` and the class, keeps the dialog open, and emits nothing.
- Motion names and Motion classes: the value is a Motion name or the consumer's own classes, never a library class name (ADR 0039). A Motion name is one of the `nfs-motion` set of building-blocks 1.6 rule 4 written without its prefix, entering names on `animationIn` (`fade-in`, `slide-in-down`, `slide-in-left`, `slide-in-right`, `hinge-in-from-top`, `spin-in`) and leaving names on `animationOut` (`fade-out`, `slide-out-up`, `slide-out-left`, `slide-out-right`, `spin-out`); the directive binds `nfs-<name>`, the library's keyframe class with `both` fill mode. This spec adds `nfs-spin-in` to that set, the keyframe counterpart of Motion UI's `spin-in` as `nfs-spin-out` is of `spin-out`, so Foundation's docs example keeps its attribute values: `animationIn="spin-in" animationOut="spin-out"`. The consumer's own keyframe classes take the dot form, each class written with a leading dot as Foundation's `data-toggler=".class"` writes one (`animationIn=".my-zoom-in"`); the directive binds them without the dots. `nfsMotionClasses`, a pure function of the primary entry point, maps a value to its classes: `''` to none, a Motion name to `nfs-<name>`, the dot form to its classes, and anything else (reachable only through a cast or `$any()`) to none. Motion UI's own transition classes never animate under this mechanism ([Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md)); with the typed names they can no longer be passed by mistake, and one given in the dot form starts no animation, so its phase completes at once (usage rule 3). Motion UI's `fast`/`slow` speed modifiers are not supported and fail to compile (`"spin-in fast"`); a consumer who needs another speed writes a keyframe class in the dot form. Keyframes may animate `transform` freely but must not animate the `translate` property, which rule 7 owns; the two translations add, so the rest position does not move (the [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md), case 5).
- Reduced motion: `nfs-motion` shortens its classes and the two backdrop animations to 1 ms under `prefers-reduced-motion: reduce`, so `animationend` still fires and nothing moves; no separate code path, and the Breakpoint service's `reducedMotion` is not read. A consumer's own keyframe class carries its own reduced-motion rule (the default path of the Breakpoint service spec's consuming-directive rule 3, which also names the directives that instead bind no Motion class under reduced motion).
- `nfsAnimationsToken` with `{disabled: true}` keeps the phase idle, so tests open and close in one pass.
- Open-by-default and plain client rendering: the phase starts idle, so a Reveal that is open at its first render appears without its enter animation, as the Toggler does; opens after that (a Trigger, a deep link) animate.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the server renders the consumer's `<dialog>` with its content and with `.reveal`, the size class, and `.collapse` from host bindings. A modal Reveal renders without `open`, whatever `isOpen` is, and the user-agent stylesheet hides it: a dialog cannot be made modal without script, and the `open` attribute alone is a non-modal dialog that `showModal()` cannot later promote (it throws `InvalidStateError` on it, measured in three engines). A non-modal Reveal that is open at its first render renders with `open`, the shown non-modal dialog that `show()` would make: the host binds `[attr.open]` to a value fixed at the first render, `''` when `isOpen` is true and `overlay` is false then and absent otherwise (a `computed` that reads both untracked, so it never re-evaluates), so the first paint matches `isOpen` and the `dialog`-role Trigger's `aria-expanded="true"` is true from the first paint (rule 1; building-blocks 1.11 decisions 1 and 2; the Triggers spec's rule that an Openable's server `isOpen` is its first-paint state). A modal Reveal open by default is the one case whose server `isOpen` differs from its first paint; its `modal-dialog` Triggers render nothing from `isOpen`, so no Trigger state is false. Host bindings on the server: `.reveal`, the `size` class, `.collapse`, `id`, `role` for alert dialogs, `.without-overlay`, `open` as above, the offset custom properties; a close button inside carries `.close-button` and `type` from its own directive. No phase class, no Motion class, no `html` class, no focus, no history (rule 1). A copied Foundation class is in the server HTML as the consumer wrote it (a copied size class stays, a copied `without-overlay` is stripped by its binding); usage rule 8 says to write none. Crawlers get the content in the DOM either way. Without JavaScript a modal Reveal open by default stays closed, and a non-modal one stays shown and can be closed only by a `<form method="dialog">` button inside it (measured in three engines), because its `nfsClose` buttons need script.
- Before hydration: construction reads only inputs and DI; `showModal()`, `focus()`, the Scroll lock, `location`, `history`, and listeners outside `host` metadata run only in render callbacks (rules 3 to 5). The fallback timer and the `window` listeners start in render callbacks and handlers, outside the zone (rule 4).
- Full hydration: host binding values equal the server's (generated ids aside, rewritten at hydration), so hydration changes nothing and there is no structure to mismatch. Hydration writes the fixed `open` value once more, which the HTML standard's attribute change steps ignore for a dialog that already has it: no `toggle` or `close` event, no focus move, and the dialog stays shown (measured in three engines). No animation plays at hydration, because the phase is idle on both platforms (rule 10). An open-by-default modal Reveal calls `showModal()` in the first `afterRenderEffect` run after hydration, with focus placed then; a non-modal Reveal open at first paint takes the first-paint path (Behaviour). When the client's first state is closed where the server's was open, hydration removes `open`, which hides the dialog without a `close` event (the HTML standard's note on removing the attribute; measured), so no `closed` fires for a dialog the client never opened. After a later `dialog.close()` the fixed value is never written again, so the dialog stays closed until `show()` reopens it (measured).
- Event replay: the Trigger's `click` host listener replays after hydration and calls `open(trigger)`, or `toggle(trigger)` for `nfsToggle`; the open runs in the following render callback. `showModal()` and `focus()` need no user activation, so a replayed open works, with focus inside the dialog. A Trigger click before hydration on a non-modal Reveal open at first paint replays as a close of the dialog the user saw open; with a closed server dialog the same click met a hidden dialog, which then appeared at hydration and was closed by the replayed toggle (both measured in three engines). For a modal Reveal open by default, an `nfsToggle` click before hydration replays after the first render callback has shown the dialog and closes it; its Triggers use `nfsOpen`. The Reveal's own host listeners (`pointerdown`, `pointerup`, `keydown`) are annotated; on a modal Reveal they cannot fire before hydration, because the dialog is closed and not rendered, and on a non-modal Reveal open at first paint they replay into handlers that act only on modal Reveals. Escape pressed before hydration is lost, which is harmless for a closed dialog; the Light dismiss listeners are added in code and never replay, so a non-modal Reveal open at first paint cannot be dismissed by an outside press or Escape until hydration (the Dropdown pane spec's first-paint exception), while its `nfsClose` click replays and closes it. A `<form method="dialog">` button pressed before hydration closes the dialog natively, and hydration then writes `open` again and shows it, because Angular sets up an element's bound and static attributes when it claims the element (measured in three engines), so `nfsClose` is the close control of a Reveal that can be open at first paint. The Tab-wrap handler changes focus first and calls `preventDefault()` last (rule 5). The `window` and document listeners are added in code and never replay, which is correct.
- Hydration boundary: a Trigger and its Reveal belong to one hydration boundary (ADR 0008; building-blocks 1.11 decision 6); template-reference scoping stops a Trigger outside a `@defer` block from naming a Reveal inside it (ADR 0013).
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/reveal` is its own entry point. Inside a dehydrated block the Reveal is its server HTML, closed, or shown for a non-modal Reveal open at first paint; a Trigger click in the block hydrates it, replays, and opens or closes it. Inside `@defer (hydrate never)` the dialog stays in its server state and its Triggers do nothing: closed, or shown and closable only by a `<form method="dialog">` button, so content that must be reachable is not put in a Reveal inside `hydrate never`. Plain `@defer` renders the Reveal on the client like any client render. Heavy dialog content can itself be deferred inside the dialog (`@defer (when signup.isOpen())`); initial focus is placed when the dialog opens, so a control inside a still-loading block is not the initial focus target.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: all state is signals; the fallback timer and the `window` listeners run outside the Angular zone and write signals or call `close()`.

### Sass and custom CSS

The `nfs-reveal` Library mixin, included after `foundation-reveal`, prints eight rules; every other piece of the Reveal's look is Foundation's. Rules 1 to 5 share one selector, `.reveal[open]` (specificity 0,2,0, printed after Foundation, so they also beat `.reveal.tiny` and the other size classes):

1. `display: block`: Foundation's `reveal-modal-base` sets `display: none`, and its JavaScript showed the modal inline; a native dialog is shown by its `open` attribute.
2. `position: fixed`: the top layer computes Foundation's `position: relative` to `absolute`, whose containing block is the initial containing block, so on a scrolled page the dialog sat at the document top and focusing into it scrolled the page there.
3. `inset-inline: 0`: Foundation's medium-and-up centring (`left: auto; right: auto; margin: 0 auto`) centres only in-flow boxes; for a positioned box `auto` insets mean the static position.
4. `max-height: calc(100% - 2 * var(--nfs-reveal-top, min(100px, 10%)))`: a tall dialog scrolls itself (Foundation's `overflow-y: auto`), so its box must end inside the viewport; the cap leaves twice Foundation's tall-modal offset, `min(100px, 10vh)` (or twice a numeric `vOffset`). With `'auto'`, rule 7 places a capped dialog by the same quarter rule, `min(50px, 5vh)` from the top and three times that below it. Foundation used `min(100px, 10vh)` and let its overlay scroll, and placed a dialog between the cap and the viewport height at `(vh - h) / 4` without capping it. Full screen keeps its height, because Foundation's `min-height: 100%` wins over a smaller `max-height`.
5. `color: inherit`: the user-agent stylesheet gives `dialog` `color: CanvasText`; Foundation's `.reveal` inherited the body colour.
6. `.reveal::backdrop { background-color: $reveal-overlay-background }`: Foundation's `reveal-overlay` mixin cannot be included, because it also prints `display: none`.
7. At medium and up (Foundation's `breakpoint(medium)`), `.reveal[open]:not(.full) { top: var(--nfs-reveal-top, 25%); translate: 0 var(--nfs-reveal-shift, -25%); margin-left: var(--nfs-reveal-left, auto); }`: Foundation's JavaScript placed every modal with `vOffset: 'auto'` at `(viewport height - modal height) / 4`; `top: 25%` with a translate of `-25%` of the dialog's own height is exactly that while the dialog's natural height is at most `vh - 2 * min(100px, 10vh)` (rule 4's cap; a taller dialog is capped by rule 4 and then placed by the same quarter rule), in CSS, recomputed by the browser on every resize and content change. The [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md) confirmed it in Chromium, Firefox, and WebKit for every size, `.without-overlay`, RTL, a scrolled page, nested modals, numeric offsets, and full screen, within Foundation's own rounding, with text as crisp as at an integer `top`. `:not(.full)` leaves Foundation's full-screen `top: 0`. A numeric `vOffset` sets `--nfs-reveal-top` and a zero `--nfs-reveal-shift`; a numeric `hOffset` sets `--nfs-reveal-left`, so the box sits at that distance from the left edge while `inset-inline: 0` and the automatic right margin absorb the rest, in either text direction. Below medium the dialog is full screen and the numbers do not apply.
8. `.reveal[data-nfs-close-button]:not(.collapse) { padding-<side>: max($reveal-padding, <room>) }`, the side from `$closebutton-position` and the room covering every close-button size (48 px on Foundation's defaults): Foundation positions the close button absolutely over the dialog's content box, so under the 1.4.12 text spacing the heading of its own example runs under the button (measured in three engines, D29); the directive binds the hook only while the dialog holds a close button, so other dialogs keep Foundation's padding.

The custom properties `--nfs-reveal-top`, `--nfs-reveal-shift`, and `--nfs-reveal-left` are an implementation channel written by the directive's host style bindings, not theming (building-blocks 1.13). The contrast of the close glyph and of the dialog's edge is documented usage: the required settings of the WCAG subsection, which the consumer's theme meets. The `nfs-motion` mixin gains the two backdrop keyframes and their rules, and `nfs-spin-in` (Further Notes, Sass). The full Sass subsection is under Further Notes.

## Testing Decisions

A good test asserts what a user or assistive technology observes: whether the dialog is open and `:modal`, its role, name, and classes, where focus lands and where it returns, the page's scroll position, the dialog's geometry, the URL, and when `opened` and `closed` fire relative to the animation. No test reads private fields, the phase signal, or the stack. Prior art: the [Prototype: Reveal on native `<dialog>` under Foundation Sass](../issues/42-prototype-reveal-dialog.md) Playwright suite (29 tests in three engines, with the geometry values recorded there), the Triggers spec's four layers, and the Toggler spec's completion tests; nothing exists in the new repository yet.

Story ids follow `reveal--<story>`: `reveal--basic`, `reveal--sizes` (args: `size`, one of `tiny`, `small`, `large`, `full`, or unset, and `collapse`), `reveal--tall-content`, `reveal--offsets`, `reveal--without-overlay`, `reveal--nested`, `reveal--replace`, `reveal--animated`, `reveal--alert-dialog`, `reveal--close-predicate`, `reveal--focus`, `reveal--programmatic`, `reveal--form-method-dialog`, `reveal--deep-link`, `reveal--scroll-lock`, and `reveal--fixture` (args-driven for e2e: `size`, offsets, overlay, content length, direction, page length, `animationIn` and `animationOut`). No story writes a Foundation or library class on any element (ADR 0039; the Storybook conventions' checklist): the dialogs carry `nfsReveal` and its inputs, Triggers and the dialogs' own buttons are `button[nfsButton]` with Button Variant inputs, and close buttons are `button[nfsCloseButton]` with a bare `nfsClose`. The Variant values are Foundation's own names, so the Storybook program needs no Variant declaration file for this spec, and the Motion names are the `nfs-motion` set, which the preview stylesheet includes.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Stack: `@storybook/angular-vite` 10.6 with `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless; inferred `test-storybook`: `npx nx test-storybook <lib>`. Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` in the Storybook preview configuration, the enforcing gate, so `color-contrast` and `target-size` are part of it; play functions run axe again with the dialog open. CSR only; the single home of interaction tests.

- `reveal--basic`: clicking the Trigger opens a `:modal` dialog; focus is on its first tabbable element, never the dialog; the Trigger carries `aria-haspopup="dialog"` and `aria-controls` and no `aria-expanded` before, while, and after the dialog is open; the page behind is inert (a page button cannot be focused); Escape closes it and focus returns to the Trigger; the close button, found by `getByRole('button', {name: 'Close modal'})`, carries `.close-button` and `type="button"`, measures at least 24 by 24 px (the `nfs-close-button` floor), and its bare `nfsClose` closes the dialog the same way; the dialog carries `data-nfs-close-button` and its computed right padding is 48 px (rule 8).
- `reveal--sizes`: each `size` value renders its class with Foundation's width at the story viewport and no size renders none, at Foundation's default width; `collapse` renders `.collapse` and no padding.
- `reveal--tall-content`: the last control inside is reachable by Tab and scrolled into view; the dialog box ends inside the viewport.
- `reveal--without-overlay`: the dialog is open but not `:modal`, carries `.without-overlay`, and the page stays interactive; an outside press closes it; clicking its Trigger while open closes it once (no reopen); tabbing out of it closes it; Escape with focus on the page closes it; its Trigger shows `aria-expanded="true"` while open and `"false"` after it closes; a second one with `[isOpen]="true"` is open from the first render with its Trigger at `aria-expanded="true"`, takes focus only when nothing else has it, and does not fire `opened`.
- `reveal--nested`: with `multipleOpened`, the inner dialog opens above the outer; Escape closes only the inner and focus returns to the inner's Trigger in the outer; the next Escape closes the outer and focus returns to the page Trigger.
- `reveal--replace`: with the default `multipleOpened: false`, opening the inner closes the outer; closing the inner returns focus to the outer's page Trigger (the fallback chain), not to `body`.
- `reveal--animated`: `animationIn="fade-in" animationOut="fade-out"`; after opening, `is-opening` and `nfs-fade-in` are present and `opened` has not fired, then `opened` fires and the classes are gone; after closing, `is-closing` and `nfs-fade-out` show while `open` is still set, then the dialog closes and `closed` fires. A second Reveal with Foundation's docs values, `animationIn="spin-in" animationOut="spin-out"`, binds `nfs-spin-in` and `nfs-spin-out` the same way.
- `reveal--alert-dialog`: `role="alertdialog"` with `aria-describedby`; focus starts on the least destructive button through an `autoFocus` selector; Escape and a backdrop press leave it open; the "Delete" button closes it with the result `true`, shown in the story.
- `reveal--close-predicate`: a form marked dirty vetoes Escape, a backdrop press, and the close button; after saving, the same actions close it.
- `reveal--focus`: `autoFocus` variants: first tabbable, a descendant with `autofocus`, `'first-heading'` (the heading gets `tabindex="-1"` while focused and loses it on blur), a selector, and `false`; a static `autoFocus="first-heading"` attribute still focuses the heading, not the dialog; Tab and Shift+Tab wrap, a radio group is one stop, and the dialog element is never focused.
- `reveal--programmatic`: `open()`, `close()`, `toggle()` through the template reference; `[(isOpen)]` bound to a checkbox; `[isOpen]="true"` opens after the first render without an enter animation.
- `reveal--form-method-dialog`: a `<form method="dialog">` with two submit buttons (`button[nfsButton]` with `type="submit"` and a `value`) closes the dialog; `closed` carries the pressed button's value and `isOpen` is false; its close button is `nfsCloseButton` with `type="submit"`, because the Close Button directive defaults to `button`.
- `reveal--scroll-lock`: on a long page scrolled down, opening adds `is-reveal-open` and `zf-has-scroll` to `html` with the page visually unmoved; closing removes them and restores the scroll position.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Open and close sync: `open()`, `close(result)`, `toggle()`, and model writes call `showModal()`/`show()`/`close()` in the render callback after the change; `open()` while open and `close()` while closed do nothing; `opened` and `closed` fire once each, in order, with the result; a parent writing `isOpen` false skips `closePredicate`.
- Open at first paint: a non-modal Reveal with `[isOpen]="true"` has `open` after its first pass; its first render callback does not call `show()`, emits no `opened`, and registers with Light dismiss; with focus on `body` it places focus by `autoFocus`, with focus on an element outside it moves nothing, and with a static `autoFocus` attribute and focus on the host it moves focus to the `autoFocus` target and the attribute is gone; `close()` removes `open`, and further change detection never writes it back; `open()` afterwards calls `show()`; a modal Reveal with `[isOpen]="true"` has no `open` before its `showModal()`.
- Variant and Motion bindings: a class-free host renders `.reveal`; each `size` value sets its class and clearing it removes only that class; `collapse` (bare attribute, `true`, `'true'`) sets `.collapse` and `false` removes it; a consumer's own static class and `[class]` binding stay; a size or Motion value reached through `$any()` that holds a space, or a Motion value that is neither a name nor the dot form, sets no class; `animationIn="fade-in"` binds `nfs-fade-in` while opening and `animationIn=".a .b"` binds `a` and `b`.
- The close-button hook: `data-nfs-close-button` is present with an `nfsCloseButton` as a direct child and inside `@if`, follows the `@if` condition, and is absent on a dialog without a close button.
- Phases with a test stylesheet: class lists after each step; completion on `animationend`; an `animationend` from a child, from `::backdrop` (dispatched with an empty `pseudoElement` and the backdrop keyframe name, WebKit's shape), or with another name does not complete; `animationcancel` completes; interruption in both directions emits nothing for the interrupted phase; a class without keyframes completes at once; a suppressed `animationend` completes after the measured length plus 100 ms (fake timers); `nfsAnimationsToken` `{disabled: true}` binds no class.
- Escape through a dispatched `keydown` on `window`: the topmost modal closes; a `defaultPrevented` or `isComposing` event is ignored; `closeOnEsc` false and a vetoing predicate keep it open; `preventDefault()` is called in every case the topmost modal sees; a dispatched `cancel` routes to `close()` and is cancelled.
- Native close: calling the element's `close()` directly re-syncs `isOpen`, releases the Scroll lock, restores focus, and emits `closed` with `returnValue`.
- Backdrop press with dispatched pointer events and coordinates: down and up outside the border box close; down outside then up inside, down inside then up outside, a press on the padding, and `pointercancel` do not; `closeOnClick` false keeps it open; nothing happens on a non-modal Reveal.
- Non-modal integration with the Light dismiss registry: close reasons `'click'`, `'keydown'`, `'tab'` reach `close()`; `closeOnEsc` false ignores `'keydown'`; registered Triggers count as inside.
- `multipleOpened`: false closes the other open Reveals before the new one opens, a vetoing predicate leaves the other open; true stacks them and Escape reaches only the topmost.
- Focus: each `autoFocus` variant and the temporary `tabindex`; the host's `autofocus` attribute is gone after opening; Tab wrap order with positive `tabindex`, a radio group, a hidden element, and a disabled button, driven by dispatched Tab `keydown` events (the directive moves focus itself); restore to the `trigger`, to the element focused before open, to a `restoreFocus` selector and element, not when focus has moved elsewhere, and up the fallback chain when the target was inside a closed Reveal; to the first registered Trigger outside the dialog (not a bare `nfsClose` registered before it inside) when the Reveal was open at its first render and focus sat on `body`, and no focus move when no target is usable; `restoreFocus` false moves nothing.
- Scroll lock counting: the first modal locks, a second does not re-lock, the last close unlocks; a non-modal Reveal never locks; destroying an open modal unlocks.
- Deep linking with a stubbed `location` and `history`: the first render opens on a matching hash; `hashchange` opens and closes; open and close write with `replaceState` or `pushState` and pass `history.state` through; a hash-driven change writes nothing.
- Defaults token: each Foundation Option and `autoFocus`/`restoreFocus` default applies and is overridden by an attribute.
- Replay-safe handler: a Tab `keydown` whose `eventPhase` reads 101 and whose `preventDefault` throws still moves focus, and nothing reaches `ErrorHandler`.

### 3. Node-level Vitest

Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which none here does.

- SSR smoke: `renderApplication` over a fixture with a basic Reveal and its Trigger, a modal open-by-default Reveal, a non-modal one, a non-modal one open by default with its Trigger, an alert dialog with a static `autoFocus` and `size="tiny"`, a `size="full" collapse` one with `animationIn="fade-in"`, and one with numeric offsets; no element of the fixture carries a `class` attribute, and every close button is `nfsCloseButton` with a bare `nfsClose`. Assert `whenStable()` resolves; every `<dialog>` is present with its content and without `open`, except the non-modal one open by default, which carries `open` while its Trigger carries `aria-expanded="true"`; classes are `reveal`, `tiny` and `full collapse` where set, `without-overlay` on the non-modal ones, no `is-opening`, `is-closing`, or Motion class; every close button carries `close-button` and `type="button"`, and the basic Reveal's dialog, which holds one, carries `data-nfs-close-button`; `role="alertdialog"` where set; the offset custom properties where set; `jsaction` on the dialog hosts and the Triggers; no class or style on `html`; the modal Reveals' Triggers carry no `aria-expanded`, the non-modal ones' carry it; the alert dialog written with a static `autoFocus` carries no `autofocus` attribute.
- Pure logic, table-driven: the phase transition function (idle, opening, closing, interruption, animations off), the longest-animation reduction over computed-style lists, the Motion value mapping of `nfsMotionClasses` (`''`, each Motion name, the dot form with one and several classes, a dot-form `nfs-` class, and a value that is neither), the `vOffset`/`hOffset` and `autoFocus`/`restoreFocus` transforms, and the restore-target resolution over a chain of closed Reveals.
- Sass compile: Foundation 6.9 plus the library with Foundation's defaults emits the eight `nfs-reveal` rules (rule 8 setting only `padding-right` to `max(1rem, calc(0.66rem + max(24px, 1.5em)), calc(1rem + max(24px, 2em)))`), the `nfs-motion` backdrop keyframes and rules, and `nfs-spin-in` with its reduced-motion override, no copy of a Foundation rule, and no Variant property.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, on `reveal--fixture` and the stories named, in Chromium, Firefox, and WebKit:

- Geometry: no `size`, then `size` set to `tiny`, `small`, `large`, and `full`, at 320, 640, and 1024 px wide against the prototype's recorded Foundation values (for example 1024 `.tiny` left 358, width 307) for width and horizontal position, and against Foundation's `'auto'` formula `(viewport height - dialog height) / 4` for vertical position, within 1 px; a tall-content row, a dialog whose natural height exceeds `vh - 2 * min(100px, 10vh)`, expecting `y = min(50px, 5vh)` and height `vh - 2 * min(100px, 10vh)`, beside the `(vh - h) / 4` rows; numeric offsets at 1024 px; full screen at 320 px; under `dir="rtl"`; on a page scrolled to 1000 px.
- Tall content: the box ends inside the viewport and the last control is reachable in all three engines.
- Real Escape: repeated presses (five, with no other input between) on `reveal--alert-dialog` and on a dirty `reveal--close-predicate` leave the dialog open in all three engines, the case the browser's close-request anti-abuse rule would otherwise close.
- Real Tab and Shift+Tab wrap in all three engines, including WebKit with a link inside (skipped by WebKit's own Tab order).
- Mouse click on the Trigger, then Escape: focus returns to the Trigger in WebKit.
- Scroll lock: wheel over the backdrop and over the dialog, and arrow keys with focus inside, leave the page position unchanged; after closing, the position is restored.
- Backdrop press with a real mouse closes; a touch swipe starting on the backdrop (`hasTouch`) does not.
- `emulateMedia({reducedMotion: 'reduce'})` on `reveal--animated`: completion within a few frames and `closed` still fires.
- `reveal--deep-link`: navigating to the story URL with `#<id>` opens the dialog after load; closing removes the hash; with `updateHistory`, Back after opening closes it through `hashchange`.
- Focus indicator: the focused close button (`nfsCloseButton`) shows a non-`none` computed outline in all three engines.
- 2.4.11: every focus stop in the tall dialog and the restored Trigger hit-test to themselves.
- 1.4.12: at 320 by 800 px with the text-spacing stylesheet (line height 1.5, paragraph spacing 2em, letter spacing 0.12em, word spacing 0.16em on every element), no text rectangle of `reveal--basic` intersects the close button's box, and the dialog's right padding is 48 px.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype), one route whose markup writes no Foundation or library class, with a basic Reveal, a modal open-by-default Reveal, a non-modal Reveal open by default with its `nfsToggle` Trigger and a `<form method="dialog">` button, a deep-linked one, and a `@defer (hydrate on interaction)` block holding a Trigger and its Reveal:

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; every dialog but the non-modal open-by-default one hidden and its content in the DOM; the modal open-by-default one closed; the non-modal open-by-default one shown, not `:modal`, its Trigger at `aria-expanded="true"`, and closed by its `<form method="dialog">` button.
- Hydration: no NG05xx in the console, `ngDevMode.componentsSkippedHydration === 0`, and no `animationstart` on any dialog during hydration; the modal open-by-default Reveal is `:modal` after hydration with focus inside; the non-modal open-by-default Reveal stays shown with no `toggle` or `close` event, focus moves into it from `body`, and focus placed in a page field before hydration stays in the field.
- Pre-hydration click with the main bundle delayed: the Trigger clicked before hydration opens its Reveal exactly once after hydration, `:modal`, focus inside, no error logged; the non-modal open-by-default Reveal's Trigger clicked before hydration closes it once after hydration, and its Trigger reads `aria-expanded="false"`.
- The `hydrate on interaction` block: the first Trigger click hydrates the block and opens the Reveal.
- Deep link on the prerendered route: loading with the hash opens the Reveal after hydration.
- `@defer (hydrate never)`: the Reveal stays closed, its Trigger does nothing, no error is logged.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA on Firefox and on Chrome and VoiceOver on Safari (macOS and iOS), Tab to the Trigger of `reveal--basic` and confirm it is announced as a button that opens a dialog (NVDA: 'opens dialog'; VoiceOver on macOS: 'dialog popup, button'; VoiceOver on iOS: 'popup button, dialog popup'; a11ysupport.io's `aria-haspopup` results), with no expanded or collapsed state; open `reveal--basic` and `reveal--alert-dialog` from their Triggers and confirm the dialog's role and name (and for the alert dialog its description) are spoken with focus on the first control, that browse or virtual cursor navigation stays inside the dialog, and that closing returns focus to the Trigger, announced again without an expanded state; open `reveal--without-overlay` and confirm its Trigger is announced as expanded while it is open and collapsed after, that the dialog is not announced as modal, and that the page stays reachable.

## Out of Scope

- A Material-style service that opens components or templates in an overlay (ADR 0007).
- CDK Dialog, as implementation or fallback (the Reveal dialog prototype).
- `showDelay`, `hideDelay`, `fullScreen`, `resetOnClose`, `appendTo`, `additionalOverlayClasses` (Foundation contract, dropped options).
- Motion UI transition classes, the `motion-ui` package, and the `fast`/`slow` speed modifiers (ADR 0003); Motion UI names outside the `nfs-motion` set, which a consumer writes as its own keyframe class in the dot form.
- The close button's look, `type` default, and target size: the [Spec: Close Button](../issues/83-spec-close-button.md).
- A Variant registry or Variant property for the Reveal's sizes: the family is closed ([ADR 0040](../adr/0040-variant-input-types.md)).
- Closing on Router navigation (`closeOnNavigation`): a Reveal lives in a template and is destroyed with its route, and one in a persistent layout stays open, as in Foundation (Material comparison).
- An exit animation and `closePredicate` for `<form method="dialog">` closes; `nfsClose` covers both.
- OffCanvas: its overlap mode is not built on `<dialog>` (Further Notes, what OffCanvas inherits).
- `dialog.closedby`, `requestClose()`, `CloseWatcher`, `@starting-style`, and Invoker Commands (out of target; Further Notes).
- Automated screen-reader output: the manual release test under Testing Decisions covers it ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Directive on a consumer-written `<dialog>`, binding `.reveal` as a static host class | ADR 0007, ADR 0001, ADR 0039; the top layer needs no move; server-renderable in place; the consumer writes no Foundation class | A service opening components (not in the document, not server-renderable); CDK Dialog (no `<dialog>`, `aria-modal` off); a consumer-written `class="reveal"` (ADR 0039) |
| D2 | Seven documented rules in `nfs-reveal`, Foundation's Sass otherwise unchanged (an eighth, the close-button room, is D29) | The prototype matched Foundation to the pixel with rules 1 to 6; rule 7 restores Foundation's `'auto'` placement | Re-implementing `.reveal` for `<dialog>` (copies Foundation) |
| D3 | `isOpen` model, `open(trigger?)`, `close(result?)`, `toggle(trigger?)`, `registerTrigger` | The Openable contract (Triggers spec, ADR 0013); `isX` naming (building-blocks 1.3) | An `open` model (collides with the method and the dialog's `open` attribute) |
| D4 | `opened` after the enter animation, `closed(result)` after `dialog.close()`, no `beforeClosed` | Completion output rule, no start events (building-blocks 1.4); `isOpenChange(false)` marks the start of a close | Foundation's synchronous `open.zf.reveal`; Material's `beforeClosed()` |
| D5 | `closePredicate(result)` guards every close except a parent model write and a native close | Material's veto; the parent owns its model; native closes cannot be stopped | Vetoing model writes (fights the parent); a cancelable event (building-blocks 1.4) |
| D6 | Modal Escape handled at `window` `keydown`, topmost modal, `preventDefault()` last; `cancel` as fallback | Cancelling the `keydown` stops the close request (HTML), so `closeOnEsc: false` and vetoes hold under repeated Escape; `window` runs after Light dismiss and inner controls | `cancel` only (the prototype: a veto fails on the second or third Escape without user activation); a host `keydown` (runs before an open pane's Light dismiss handler) |
| D7 | Backdrop press needs `pointerdown` and `pointerup` both on the backdrop | HTML dialog light dismiss and ADR 0024; touch scrolls and drags never close | `pointerdown` alone (ADR 0007's wording; a swipe on the backdrop closes) |
| D8 | Non-modal Reveals dismiss through the Light dismiss registry, focus leaving included | One model for non-modal floating content; topmost-first Escape with nested panes; Triggers inside; WCAG 2.4.11 met by closing on focus loss | Own document listeners (the prototype: an outside `pointerdown` closed the dialog before its Trigger's click reopened it); a Tab trap (the APG does not trap non-modal dialogs) |
| D9 | `multipleOpened: false` closes the other open Reveals through `close()`; `true` stacks nested `showModal()` | Foundation's default and ADR 0007; each layer returns focus to its own Trigger | Foundation's Escape closing every open layer |
| D10 | `'auto'` offsets reproduced in CSS (`top: 25%` plus `translate: 0 -25%`); numbers through custom properties at medium and up | Foundation's default placement (building-blocks 1.4 keeps Foundation defaults) without measurement, recomputed by the browser; exact while the dialog's natural height is at most `vh - 2 * min(100px, 10vh)`, confirmed in three engines by the [Prototype: Reveal `'auto'` offsets in CSS](../issues/69-prototype-reveal-auto-offsets.md); full screen below medium keeps its box | Foundation's CSS `top: 100px` (not where Foundation's JavaScript put a modal); a measured port (layout reads and observers for what CSS computes); dropping both Options |
| D11 | `fullScreen` dropped; `size="full"` sets the `.full` Variant class; full-screen Reveals stay modal | Its only behaviour was forcing `overlay: false`, which a full-screen top-layer dialog does not need; `.full` is one of the size classes, so the size family's one input is its one spelling | A `fullScreen` input binding `.full` (a second spelling of one size; building-blocks 1.4 rule 1 keeps an Option's name only when the Option names the whole family) |
| D12 | `autoFocus` union without `'dialog'`, a descendant `autofocus` honoured, the static attribute kept out of the server HTML by `'[attr.autofocus]': 'null'` and stripped again before every show; on a Reveal open at its first render, set by binding or the Defaults token (usage rule 9, 2026-09-28) | APG; the platform's own initial-focus rule; the prototype's case-insensitive `autofocus` collision | Material's `'dialog'` value; renaming the input (breaks ADR 0007's vocabulary) |
| D13 | Tab wrap on every Tab in sequential focus order, modal only | No engine wraps; WebKit puts the dialog element in its Tab order and skips links; radio groups stay one stop | End-only wrapping (misfires in WebKit); CDK `FocusTrap` (its sentinels would sit in the inert page) |
| D14 | Restore focus to the Trigger from `open(trigger)`, CDK's guard, and a fallback up closed Reveals; the first registered Trigger outside the dialog as the last fallback (a Reveal open at its first render has no `trigger`) | WebKit click-does-not-focus; the prototype's `BODY` result under `multipleOpened: false` | `document.activeElement` only |
| D15 | Scroll lock ported from Foundation for modal Reveals only | The page scrolls behind a modal in all three engines; a non-modal page stays usable | `overscroll-behavior: contain` (the page still moved); locking for non-modal dialogs (Foundation) |
| D16 | No animation by default; Motion classes through `.is-opening`/`.is-closing` with measured completion and a keyframe-name filter | Foundation's default; Foundation's own State class names; WebKit's empty `pseudoElement` on backdrop events | `animate.enter` (plays at hydration); a fixed fallback duration (consumer classes vary) |
| D17 | Server HTML closed for a modal Reveal, which becomes modal after hydration without an enter animation when open by default; a non-modal Reveal open at its first render carries `open`, bound from a value fixed at that render | `showModal()` throws on a dialog opened by attribute (measured) and no animation plays at hydration; `<dialog open>` is exactly the shown non-modal dialog `show()` makes, so the non-modal first paint matches `isOpen` and its Trigger's `aria-expanded` (building-blocks 1.11 decisions 1 and 2), and a fixed value is never written after a later `close()` ([Decide: the server state of an open-by-default non-modal Reveal's Trigger](../issues/78-decide-open-by-default-non-modal-reveal-server-state.md)) | Rendering `open` for a modal Reveal (non-modal until hydration, and it would have to close and reopen); a closed server dialog for a non-modal Reveal too (its Trigger's `aria-expanded="true"` is false until hydration and for good without JavaScript, the dialog pops in at hydration, and a Trigger click before hydration ends as a close); a separate shown state for Triggers (a second state member on the Openable contract, and the pop-in stays); documenting the mismatch (ships a false state the Triggers spec forbids); binding `open` to `isOpen` (removes `open` before the exit animation, and without a `close` event) |
| D18 | `<form method="dialog">` re-syncs through `close`, reporting `returnValue` | Keeps the platform mechanism working with honest state | Intercepting `submit` (collides with form libraries' own submit handling) |
| D19 | The 1.4.11 pairs are documented usage, required settings the consumer's theme meets: `$closebutton-color` and `$closebutton-color-hover` at 3:1 or better against `$reveal-background`, and `$reveal-background` at 3:1 or better against `$reveal-overlay-background` composited over `$body-background`; the spec's figures are the exact WCAG relative-luminance formula, unrounded | ADR 0022 for 1.4.11, which axe does not test; the close glyph marks the close control at rest and on hover, and the dialog's edge marks its extent; Foundation's defaults pass (3.42:1, 19.63:1, 3.17:1); `color-contrast()` rounds to one decimal and would pass 2.95:1 | Leaving the pairs unstated (a theme could hide the close control); Foundation's `color-contrast()` for the figures (rounds) |
| D20 | Internal `NfsRevealStack` service | Shared state across instances (building-blocks 1.5): order, the Scroll lock count, one `window` listener | A module-level set (shared between applications on one page); per-instance `window` listeners |
| D21 | Trigger role from `overlay`: `modal-dialog` with the overlay, `dialog` without | `showModal()` makes the Trigger inert while open, so no expanded state is ever exposed; `overlay` is an input, so the server value is final ([Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md)) | A constant `'dialog'` (renders `aria-expanded` on an inert opener and a false `"true"` in open-by-default server HTML) |
| D22 | A non-modal Reveal open at first paint is not re-shown and emits no `opened`; its first render callback places focus only when nothing else has focus (`body`, or the host after HTML `autofocus`) | The dialog has been shown since the first paint, and outputs skip the initial state (the Toggler and Dropdown pane rules); Light dismiss closes on any focus move outside, so without focus inside a keyboard user's first Tab elsewhere closes the dialog before it can be reached; focus the user placed before hydration is theirs (measured in three engines); HTML `autofocus` focuses a dialog parsed open at page load in all three engines, and the APG forbids focus on the dialog element | Running the ordinary opening steps at hydration (steals focus from where the user put it before hydration); never moving focus, the Dropdown pane's first-paint rule (the first Tab closes the dialog); leaving focus on the dialog element |
| D23 | `size` (`NfsRevealSize`, closed `'tiny' \| 'small' \| 'large' \| 'full'`) and `collapse` (boolean through `nfsVariantBoolean`) Variant inputs; unset sets no class; no registry, Variant property, or Defaults token entry | ADR 0039 (every Variant class a typed input) and ADR 0040 (closed types; Reveal's sizes a Closed Variant family); building-blocks 1.4 rules 3 and 4 name the inputs; `foundation-reveal` writes the four size classes and `.collapse` itself, so no Sass setting could extend them; `.full` overrides the other sizes, so one enum holds all four | Consumer-written classes (ADR 0010, superseded); a registry-backed size (no Sass setting lists the names); four booleans (`tiny`, `full`, ...) that could contradict each other; `booleanAttribute` for `collapse` (`collapse="flase"` would compile and set the class) |
| D24 | `animationIn`/`animationOut` take Motion names (`'spin-in'`, typed `NfsMotionIn`/`NfsMotionOut`) that bind `nfs-<name>`, or the consumer's own keyframe classes each with a leading dot; `nfs-spin-in` joins `nfs-motion` | ADR 0039's follow-up: no library class name in consumer code, even as an input value, while inputs that apply the consumer's own classes stay; a closed name union fails typos, leaving names on `animationIn`, `fast`/`slow`, and `'nfs-fade-in'` at compile time (measured with `ngc` 22.2.0 strict templates), and Foundation's docs values (`spin-in`, `spin-out`) keep working; the leading dot is Foundation's own way of writing a class name in an attribute (`data-toggler=".class"`) | `NfsMotionName \| (string & {})` (a typo and `'nfs-fade-in'` compile, the reason ADR 0040 dropped the same escape); a Variant registry of Motion names (registries follow Sass settings, and the consumer's keyframes have none); library names only (drops the consumer's own keyframe classes, which ADR 0003 and the Motion class term allow); a second pair of inputs for the consumer's classes (two inputs per direction and a precedence rule) |
| D25 | `overlay` stays an Option with `booleanAttribute` and a Defaults token slot; `.without-overlay` is its host binding | Foundation's docs never write `.without-overlay`: its JavaScript added it from `data-overlay`; the Option decides modal or non-modal behaviour, so it is not a static look, and a Variant input could have no application-wide default, which would drop a decided Defaults token field | Retyping `overlay` as a Variant input through `nfsVariantBoolean` (loses the Defaults token default; `overlay="flase"` is the same trade every boolean Option makes) |
| D26 | The docs say to write no Foundation or library class on the `<dialog>` and name the input to bind for each (usage rule 8); a copied size class stays, a copied State or `without-overlay` class is stripped by its binding | building-blocks 1.4's initial-state rule; Foundation's docs markup is `class="tiny reveal"`, so the migration needs each class's input stated | Reading a copied class as a seed (building-blocks 1.4 forbids it) |
| D27 | The Scroll lock's `html.is-reveal-open` and `html.zf-has-scroll` stay `Renderer2` writes on the document element | The document element carries no library directive and the lock has no first-paint value; the user ruled that a `Renderer2` write on such an element satisfies the class rule ([Re-run: Magellan spec under the class rule](../issues/122-rerun-magellan-class-rule.md), User decision) | A directive the consumer writes on `html` (the root is outside every component template) |
| D28 | The close button is `button[nfsCloseButton]` with a bare `nfsClose` beside it; 2.5.8 is the `nfs-close-button` floor; the 1.4.11 pair against `$reveal-background` is a required setting (D19) | The [Spec: Close Button](../issues/83-spec-close-button.md): it owns `.close-button`, the `type` default, and the 24 px floor, and closes nothing itself (its D2); the glyph's contrast is measured against the background of the container it sits in | The spacing exception (the first version's 2.5.8 reasoning, which axe cannot verify); `nfsClose` alone on a consumer-written `class="close-button"` (ADR 0039) |
| D29 | 1.4.12: the Callout's close-button hook and room rule on the Reveal (rule 8): `NfsReveal` binds `data-nfs-close-button` from `contentChild(nfsCloseButtonToken, {descendants: true})`, and `nfs-reveal` reserves the room on the button's side (2026-09-29, [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md)) | Measured: Foundation's own example fails under text spacing at 320 px in three engines, and the rule removes every overlap; the hook keeps dialogs without a close button unchanged; the Callout's mechanism ([Spec: Callout](../issues/89-spec-callout.md), D9, D10), whose geometry the Reveal shares (1rem padding, the medium close button 1rem from the edge) | No rule (a WCAG failure left to content); padding on every dialog (changes dialogs without a close button) |

### Usage examples

```ts
@Component({
  selector: 'app-account',
  imports: [NfsButton, NfsCloseButton, NfsOpen, NfsClose, NfsReveal, ReactiveFormsModule],
  template: `
    <button nfsButton [nfsOpen]="edit">Edit profile</button>

    <dialog nfsReveal #edit="nfsReveal" id="edit-profile" size="small"
            aria-labelledby="edit-title" animationIn="fade-in" animationOut="fade-out"
            [closePredicate]="canClose" (closed)="onClosed($event)">
      <h2 id="edit-title">Edit profile</h2>
      <form [formGroup]="form">
        <label>Name <input formControlName="name" /></label>
      </form>
      <button nfsButton color="secondary" nfsClose>Cancel</button>
      <button nfsButton nfsClose [nfsCloseResult]="form.value">Save</button>
      <button nfsCloseButton nfsClose aria-label="Close profile editor">
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
<button nfsButton color="alert" [nfsOpen]="confirm">Delete account</button>
<dialog nfsReveal #confirm="nfsReveal" id="confirm-delete" size="tiny" role="alertdialog"
        aria-labelledby="confirm-title" aria-describedby="confirm-text"
        autoFocus="#confirm-cancel" [closeOnClick]="false" [closeOnEsc]="false"
        (closed)="$event === true && deleteAccount()">
  <h2 id="confirm-title">Delete your account?</h2>
  <p id="confirm-text">This cannot be undone.</p>
  <button nfsButton color="secondary" id="confirm-cancel" nfsClose [nfsCloseResult]="false">Cancel</button>
  <button nfsButton color="alert" nfsClose [nfsCloseResult]="true">Delete</button>
</dialog>

<!-- Nested modals (Foundation's docs example) -->
<button nfsButton [nfsOpen]="first">Click me for a modal</button>
<dialog nfsReveal #first="nfsReveal" id="first-modal" aria-labelledby="first-title" multipleOpened>
  <h1 id="first-title">Awesome!</h1>
  <button nfsButton [nfsOpen]="second">Click me for another modal!</button>
  <button nfsCloseButton nfsClose aria-label="Close first modal"><span aria-hidden="true">&times;</span></button>
</dialog>
<dialog nfsReveal #second="nfsReveal" id="second-modal" aria-labelledby="second-title" multipleOpened>
  <h2 id="second-title">ANOTHER MODAL!!!</h2>
  <button nfsCloseButton nfsClose aria-label="Close second modal"><span aria-hidden="true">&times;</span></button>
</dialog>

<!-- Animated (Foundation's docs example, with its Motion UI names unchanged) -->
<button nfsButton [nfsOpen]="dizzy">Click me for a modal</button>
<dialog nfsReveal #dizzy="nfsReveal" id="animated-modal" aria-labelledby="dizzy-title"
        animationIn="spin-in" animationOut="spin-out">
  <h1 id="dizzy-title">Whoa, I'm dizzy!</h1>
  <button nfsCloseButton nfsClose aria-label="Close animated modal"><span aria-hidden="true">&times;</span></button>
</dialog>

<!-- The consumer's own keyframe classes and backdrop, in the dot form and with a class of its own -->
<dialog nfsReveal id="slow-modal" class="dim-backdrop" aria-label="Slow modal"
        animationIn=".slow-zoom-in" animationOut=".slow-zoom-out">...</dialog>
<!-- the consumer's stylesheet: dialog.dim-backdrop::backdrop { background-color: rgb(0 0 0 / 0.7); }
     plus @keyframes for .slow-zoom-in and .slow-zoom-out, each with its own reduced-motion rule -->

<!-- No overlay: a non-modal dialog written right after its Trigger -->
<button nfsButton [nfsToggle]="free">Click me for an overlay-lacking modal</button>
<dialog nfsReveal #free="nfsReveal" id="free-modal" aria-label="Note" [overlay]="false">
  <p>I feel so free!</p>
  <button nfsCloseButton nfsClose aria-label="Close note"><span aria-hidden="true">&times;</span></button>
</dialog>

<!-- Full screen, deep-linkable, with content that must reset on close (Lazy content) -->
<dialog nfsReveal #video="nfsReveal" id="intro-video" size="full" aria-label="Introduction video" deepLink>
  @if (video.isOpen()) {
    <iframe src="https://player.example/intro" title="Introduction video"></iframe>
  }
  <button nfsCloseButton nfsClose aria-label="Close video"><span aria-hidden="true">&times;</span></button>
</dialog>

<!-- Closing natively through <form method="dialog">: the close button submits, so it says so -->
<dialog nfsReveal id="notice" aria-label="Notice">
  <form method="dialog">
    <button nfsCloseButton type="submit" value="dismissed" aria-label="Close notice"><span aria-hidden="true">&times;</span></button>
  </form>
</dialog>
```

The consumer's own class on the dialog (`dim-backdrop`) and its `dialog.<class>::backdrop` rule replace Foundation's `additionalOverlayClasses`; they select no Foundation or library class (building-blocks 1.1). With a backdrop colour of the consumer's own, the consumer keeps the dialog's edge at 3:1 or more against the page it dims (1.4.11), as the required settings do for Foundation's backdrop; a darker backdrop than Foundation's only raises that ratio.

A component inside a Reveal that closes it with a result:

```ts
@Component({
  selector: 'app-color-picker',
  imports: [NfsButton],
  template: `@for (c of colors; track c) { <button nfsButton (click)="pick(c)">{{ c }}</button> }`,
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
providers: [
  { provide: nfsRevealDefaultsToken, useValue: { animationIn: 'fade-in', animationOut: 'fade-out' } satisfies NfsRevealDefaults },
]
```

`satisfies` keeps the Motion names checked, because a provider's `useValue` is untyped.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-reveal`; its close button relies on `foundation-close-button` and the `nfs-close-button` Library mixin of the [Spec: Close Button](../issues/83-spec-close-button.md). Its documented custom CSS is the `nfs-reveal` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-reveal`.

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
| 8 | `.reveal[data-nfs-close-button]:not(.collapse)` | `padding-<side>: max($reveal-padding, <room>)`, where `<side>` is `nth($closebutton-position, 1)` and `<room>` lists, for each key of `$closebutton-size`, `calc(<that size's horizontal offset> + max(24px, <that size's font size>))` | 1.4.12: Foundation positions the close button absolutely over the dialog's content box and has no setting that keeps text clear of it (the Callout's rule 1(a) and D9; a physical side because `$closebutton-position` is physical; `.collapse` keeps its zero padding) |

Required settings (WCAG 2.2 AA 1.4.11; axe has no rule for it): `$closebutton-color` and `$closebutton-color-hover` at 3:1 or better against `$reveal-background`, and `$reveal-background` at 3:1 or better against `$reveal-overlay-background` composited over `$body-background`. Foundation's defaults pass (3.42:1, 19.63:1, and 3.17:1), computed unrounded with the exact WCAG 2.2 relative-luminance formula, a translucent colour composited over `$body-background` first; Foundation's `color-luminance()` overstates some ratios with its approximate power, and its `color-contrast()` rounds to one decimal.

(2) Settings, mixins, and functions reused, read from the consumer's compile: `$reveal-overlay-background`, `$reveal-padding`, `$closebutton-position`, `$closebutton-size`, `$closebutton-offset-horizontal`, and Foundation's `breakpoint()`. The literal values are Foundation's own JavaScript constants for which no setting exists (`25%` for the quarter of the free space, `100px` and `10%` for the tall-modal offset), and rule 8's 24 px, the close button's target-size floor from the [Spec: Close Button](../issues/83-spec-close-button.md); the mixin takes no parameters.

(3) Custom properties the directive writes and the mixin reads: `--nfs-reveal-top` (a numeric `vOffset` in px), `--nfs-reveal-shift` (`0px` with a numeric `vOffset`), `--nfs-reveal-left` (a numeric `hOffset` in px). An implementation channel, not theming (building-blocks 1.13).

(4) Motion classes: none by default (Foundation's `animationIn` and `animationOut` are empty); the `nfs-motion` class of any Motion name set on them. The `nfs-motion` mixin gains, for this spec, `nfs-spin-in` (the keyframe counterpart of Motion UI's `spin-in` with its default settings: a clockwise rotation from minus three quarters of a turn to none while fading in, under the same reduced-motion override as the rest of the set), so Foundation's animated docs example needs no class of the consumer's own, and `@keyframes nfs-reveal-backdrop-in` and `nfs-reveal-backdrop-out` (opacity 0 to 1 and back, named apart from the dialog's keyframes so the directive can tell their `animationend` events apart in WebKit) and the rules `.reveal.is-opening::backdrop { animation: nfs-reveal-backdrop-in $duration $timing-function both; }` and `.reveal.is-closing::backdrop { animation: nfs-reveal-backdrop-out $duration $timing-function both; }`, with both backdrop rules added to its `prefers-reduced-motion: reduce` block (`animation-duration: 1ms`). The mixin's `$duration` and `$timing-function` parameters (Motion UI's defaults) apply.

(5) What breaks without the include: an opened dialog stays invisible (Foundation's `display: none`), and with only rule 1 it sits at the top-left of the document, scrolls the page to the top when focused, grows past the viewport with tall content, shows black text, and has the user agent's backdrop instead of Foundation's overlay colour; dialog text can run under its close button (1.4.12); without `nfs-motion`, Motion names measure no animation and open and close at once (usage rule 3); without `nfs-close-button`, the close button falls back to Foundation's glyph box, under 24 px wide (the Close Button spec).

(6) Variant properties: none. The Reveal's Variant families (`size`, `collapse`) are closed, so the mixin writes no `--nfs-*` Variant property.

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
- `fullScreen` becomes `size="full"`, which sets the `.full` class; full-screen Reveals stay modal.
- The consumer writes no Foundation class: `.reveal`, the size classes, `.collapse`, and `.close-button` come from directives and their inputs, and the server HTML still carries them.
- Numeric offsets apply at medium and up; below medium the dialog stays full screen.
- Under `dir="rtl"` a numeric `hOffset` is measured from the left edge; Foundation's overlay case placed the box at `viewport width - width + hOffset`, because it wrote `left` on a `position: relative` box, while its `.without-overlay` case measured from the left as the library does.
- A dialog taller than rule 4's cap, `vh - 2 * min(100px, 10vh)`, is capped and sits at half Foundation's tall-modal offset, `min(50px, 5vh)` from the top (Foundation placed it at `min(100px, 10vh)` and let its overlay scroll, and did not cap a dialog between the cap and the viewport height).
- An `'auto'` dialog is re-placed when its content changes (Foundation re-placed only on resize).
- `resetOnClose`'s `innerHTML` re-parse becomes Lazy content under `@if`.
- A dialog that holds a close button reserves room for it on the button's side, so no text runs under the button with the 1.4.12 text spacing, where Foundation's own example fails (D29).
- Motion UI transition classes and `fast`/`slow` modifiers are replaced by keyframe Motion classes; Motion UI's names stay the values (`spin-in` binds the library's `nfs-spin-in`), and a name outside the `nfs-motion` set fails to compile rather than silently not animating; the overlay's `fade-in`/`fade-out` becomes the backdrop keyframes.
- The `resizeme` re-centring, `data-yeti-box`, `data-resize`, `aria-hidden` toggling, and `tabindex` stamping on anchors are gone.
