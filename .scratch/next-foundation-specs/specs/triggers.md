# Spec: Triggers (shared utility)

Ticket: [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass.

## Problem Statement

A developer building an Angular application on Foundation for Sites needs buttons that open, close, or toggle things: a Reveal dialog, an off-canvas panel, a dropdown pane, a Toggler target, a responsive title-bar menu, a tooltip. Foundation solves this with its Triggers utility: `data-open="id"`, `data-close="id"`, and `data-toggle="id"` on any element, a document-level jQuery click listener that sends custom `open.zf.trigger`, `close.zf.trigger`, and `toggle.zf.trigger` events to the elements with those ids, an empty `data-close` that bubbles to the nearest plugin, `data-toggle-focus` that toggles on both focus and blur, and `data-closable` that fades an element out. That design leaves the developer with problems an Angular library must not copy:

- Targets are ids in strings. A typo, a duplicate id, or an element rendered later fails silently, and an Angular app would have to invent stable ids for everything it wants to open, even though generated ids differ between the server and the browser.
- The ARIA on a trigger is written by whichever plugin happens to look for it, at plugin initialisation, by attribute selector, and differs per plugin: Dropdown stamps `aria-haspopup="true"`, which tells assistive technology the pane is a menu; Toggler updates `aria-expanded` only for triggers with a single id; Reveal stamps `tabindex="0"` on whatever the anchor is; `data-close` triggers get `aria-expanded` although they only close.
- Foundation's docs use `<a data-toggle>` without `href`, which is neither focusable nor announced as a control.
- `data-toggle-focus` toggles on focus and again on blur, so a target that starts in the wrong state stays inverted.
- `data-closable` is a jQuery fade with no focus handling, although the focused close button disappears with the element.

A server-rendered Angular application adds a second problem: a trigger must render correct ARIA in the server HTML, must not break hydration, and a click that arrives before hydration must still open the target once the page hydrates, inside dehydrated `@defer (hydrate on ...)` blocks as well.

## Solution

Three attribute directives, `nfsOpen`, `nfsClose`, and `nfsToggle`, on the native `<button>` (or link) the developer writes, and one small contract, `nfsOpenableToken`, that every Openable provides: Reveal, OffCanvas, Dropdown pane, Toggler, ResponsiveToggle, and Tooltip.

A Trigger names its target with a typed template reference (`[nfsToggle]="pane"`) or an array of references for Foundation's multi-target form. `nfsClose` and `nfsToggle` written without a value act on the Nearest Openable, the closest Openable enclosing the Trigger, which is Foundation's empty `data-close` rule expressed through dependency injection. The Openable tells its Triggers which ARIA shape to render through its Trigger role, so a disclosure trigger gets `aria-expanded` and `aria-controls`, a dialog trigger gets `aria-haspopup="dialog"` as well, a modal Reveal's trigger gets `aria-haspopup="dialog"` and `aria-controls` without `aria-expanded`, a Toggler in class mode gets `aria-pressed`, and a tooltip's external trigger gets nothing extra. All of it is host bindings on signals, so the server HTML already carries the right ARIA, and activation is one `click` host listener that never calls `preventDefault()`, so a pre-hydration click replays cleanly.

Everything else Foundation's Triggers did is dropped or replaced by something the platform or Angular already provides: `data-toggle-focus` by template `(focus)`/`(blur)` bindings, `data-closable` by `@if` with `animate.leave` or by a Toggler with an empty `nfsClose`, the custom events by method calls on the contract, `closeme.zf.*` by the Light dismiss registry, and `data-resize`/`data-scroll`/`data-mutate` by native observers inside each consuming spec. Triggers add no Foundation class, no CSS, and no service.

## User Stories

1. As an application developer, I want to put `[nfsOpen]="signup"` on a button and have it open my Reveal, so that I link the two with a typed reference instead of an id string.
2. As an application developer, I want `[nfsToggle]="pane"` on a button to open and close a Dropdown pane, so that one button controls it both ways.
3. As an application developer, I want `[nfsClose]="panel"` on a button outside an off-canvas panel to close it, so that close controls can live anywhere.
4. As an application developer, I want a bare `nfsClose` on the close button inside a Reveal to close that Reveal, so that I do not have to name the dialog I am already inside.
5. As an application developer, I want a bare `nfsClose` inside a Dropdown pane that sits inside a Reveal to close only the pane, so that the nearest thing closes, as Foundation's bubbling rule does.
6. As an application developer, I want a bare `nfsToggle` inside a ResponsiveToggle title bar to toggle that title bar's menu, so that Foundation's title-bar markup needs no reference at all.
7. As an application developer, I want `[nfsToggle]="[thumb1, thumb2, thumb3]"` to toggle several Toggler targets together, so that Foundation's multi-target form keeps working.
8. As a screen reader user, I want a multi-target toggle to announce one truthful expanded state, so that I am not told "expanded" while half the targets are hidden.
9. As an application developer, I want the compiler to reject `[nfsToggle]="pane"` when `pane` is the element rather than the directive, so that I learn about a missing `#pane="nfsDropdownPane"` at build time.
10. As an application developer, I want `[nfsClose]="result"`-style results, so that closing a Reveal from a button can hand the dialog a value, as Material's `[mat-dialog-close]` does.
11. As an application developer, I want to bind `[nfsClose]="null"` to disconnect a close button, so that an explicit binding never silently falls back to some ancestor.
12. As a screen reader user, I want a button that opens a disclosure to expose `aria-expanded` and `aria-controls`, so that I hear whether the content is shown and can jump to it.
13. As a screen reader user, I want a button that opens a dialog to expose `aria-haspopup="dialog"`, so that I know a dialog will appear.
14. As a screen reader user, I want a button that toggles a class-mode Toggler to expose `aria-pressed`, so that I hear it as a toggle button rather than a disclosure.
15. As a screen reader user, I want close buttons to carry no `aria-expanded`, so that a one-way control is not announced as a two-state one.
16. As a screen reader user, I want a Dropdown trigger never to say "menu" unless the pane is a menu, so that I am not promised arrow-key navigation that does not exist.
17. As a keyboard user, I want every Trigger to be a native button or link, so that Enter and Space activate it without custom key handling.
18. As an application developer, I want a dev-mode warning when I put a Trigger on a `div` or on a link without `href`, so that I notice a control keyboard users cannot reach or activate.
19. As an application developer, I want a dev-mode warning when a `<button>` Trigger inside a form has no `type`, so that a toggle never submits the form by accident.
20. As an application developer, I want a Trigger to work on an `nfsButton`, so that a Foundation-styled button can open a Dropdown pane and `nfsButton` still owns `type` and the disabled state.
21. As a keyboard user, I want a focusable disabled Trigger (`nfsButton` with `disabledInteractive`) to do nothing when activated, so that a disabled button never opens anything.
22. As a keyboard user, I want focus to return to the button that opened a Reveal or an off-canvas panel when it closes, so that I continue where I was.
23. As an application developer, I want a Dropdown pane opened from one of several buttons to position against the button I clicked, so that the pane appears where I expect.
24. As an application developer, I want a Dropdown pane opened programmatically to position against its first Trigger, so that `pane.open()` behaves like Foundation's.
25. As a user, I want clicking the Trigger of an open Dropdown pane to close it rather than close-and-reopen, so that toggling works with Light dismiss.
26. As an application developer, I want a link in an off-canvas menu to carry `nfsClose` and still navigate, so that the menu closes when I follow a route.
27. As an application developer, I want a Trigger on a tooltip's host to target the Openable around it, not the tooltip, so that a close button with a tooltip still closes its dialog.
28. As an application developer building a wrapper component around a Reveal, I want to provide `nfsOpenableToken` from my component, so that consumers' `nfsClose` buttons inside it close my dialog.
29. As an application developer, I want to replace `data-toggle-focus` with `(focus)` and `(blur)` bindings to `open()` and `close()`, so that focus-driven content opens on focus and closes on blur without an inverting toggle.
30. As an application developer, I want a documented replacement for `data-closable`, so that dismissible callouts animate out and keep focus sensible.
31. As a developer of a server-rendered application, I want the server HTML of every Trigger to carry its final `aria-expanded`, `aria-controls`, `aria-haspopup`, and `aria-pressed`, so that the first paint is correct and hydration changes nothing.
32. As a developer of a server-rendered application, I want a click on a Trigger before hydration to open its Openable once the page hydrates, so that early clicks are not lost.
33. As a developer using incremental hydration, I want a click on a Trigger inside a dehydrated block to hydrate the block and then open its Openable, so that deferred widgets work on first interaction.
34. As a developer using `@defer`, I want the compiler to stop me from referencing an Openable inside a deferred block from a Trigger outside it, so that I cannot split a Trigger from its Openable across a hydration boundary.
35. As a developer using `@defer (hydrate never)`, I want to know which Triggers inside stay inert, so that I choose that block type knowingly.
36. As a developer of a zoneless application, I want Triggers to need no zone, so that they work with zoneless change detection.
37. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
38. As an application developer, I want to import the Triggers from their own entry point, so that a `@defer` block can split them with the rest of a deferred widget.
39. As a plugin spec author, I want one small interface every Openable implements, so that each plugin spec only states its Trigger role and focus rules.
40. As a library maintainer, I want every behaviour asserted through roles, ARIA, and state in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.
41. As a screen reader user, I want a button that opens a modal Reveal to announce that it opens a dialog without a 'collapsed' state it can never leave while I can reach it, so that every focus on it tells me only what is true.

## Implementation Decisions

### Foundation contract

Foundation's Triggers utility has no Plugin, no `defaults`, and no Options of its own: its contract is attributes on the trigger, custom jQuery events on the target, and ARIA each plugin stamps on its triggers at initialisation.

| Foundation feature | What it does in 6.9 | Library counterpart |
| --- | --- | --- |
| `data-open="id [id...]"` | Document click listener sends non-bubbling `open.zf.trigger` to each `#id`, passing the trigger element | `[nfsOpen]` with a reference or an array; calls `open(trigger)` on each Openable |
| `data-close="id [id...]"` | Sends bubbling `close.zf.trigger` to each `#id` | `[nfsClose]` with a reference or an array; calls `close(result)` on each |
| `data-close` (no value) | Fires `close.zf.trigger` on the trigger itself; it bubbles to the nearest plugin or `[data-closable]` ancestor, and Reveal closes only when that ancestor is the Reveal (a closable callout inside a modal does not close the modal) | Bare `nfsClose`: the Nearest Openable through DI |
| `data-toggle="id [id...]"` | Sends non-bubbling `toggle.zf.trigger` to each `#id`; each target toggles independently | `[nfsToggle]`; one target calls `toggle(trigger)`; several targets move together (see the API) |
| `data-toggle` (no value) | Fires `toggle.zf.trigger` on itself, bubbling | Bare `nfsToggle`: the Nearest Openable |
| `data-toggle-focus="id"` | Toggles the target on both `focus` and `blur` | Dropped option; replaced by `(focus)="t.open()" (blur)="t.close()"` in the template |
| `data-closable[="motion-class"]`, `data-closeable` | On `close.zf.trigger`: stops propagation, animates out with the Motion class or jQuery `fadeOut()`, fires `closed.zf` | Not a directive: `@if` plus `animate.leave`, or a Toggler in visibility mode with a bare `nfsClose` inside (Further Notes) |
| `closed.zf` | Fired by a closable after its animation | The Openable's `closed` Completion output |
| `closeme.zf.dropdown/tooltip/reveal` with `data-yeti-box` | Closes open siblings of the same kind | Light dismiss registry, owned by the Anchored pane spec |
| `data-resize`, `data-scroll`, `data-mutate`, `resizeme`/`scrollme`/`mutateme.zf.trigger` | Debounced window events funnelled through a MutationObserver | Not Triggers: `ResizeObserver`, `IntersectionObserver`, or `MutationObserver` inside each consuming spec (building-blocks Part 3) |
| ARIA stamped by plugins | OffCanvas: `aria-expanded` and `aria-controls` on open, close, and toggle triggers. Toggler: the same, updated only for single-id triggers. Reveal: `aria-controls`, `aria-haspopup="dialog"`, `tabindex="0"` on the first `data-open` (else `data-toggle`) anchor. Dropdown: `aria-controls`, `aria-haspopup="true"`, `aria-expanded`, `data-is-focus`, `data-yeti-box` | The Trigger renders ARIA from the Openable's Trigger role (ARIA table below); `aria-haspopup="true"`, `tabindex` stamping, `data-is-focus`, and `data-yeti-box` are dropped |
| Focus return | Reveal refocuses the anchor that was focused at open (`$activeAnchor`); OffCanvas refocuses the trigger passed with the event (`$lastTrigger`) | The Trigger passes its host to `open(trigger)`; the Openable returns focus to it |

Dropped options and behaviours: `data-toggle-focus`, `data-closable`/`data-closeable` as attributes, the custom `*.zf.trigger` events, bubbling to `window` for an id-less trigger with no plugin ancestor (a bare `nfsClose` with no Nearest Openable is a dev-mode warning and a no-op), `tabindex` stamping, and `aria-haspopup="true"`.

### CSS class to Angular mapping

Triggers add no Foundation class. Foundation has no Structural class or State class for a trigger element; the only trigger-side class in Foundation's JavaScript, Dropdown's `.hover` on its anchors, belongs to the Dropdown pane spec. A Trigger is usually also an `nfsButton` or a `.close-button`, whose classes those contracts own.

| Foundation markup | Angular | Rationale |
| --- | --- | --- |
| `[data-open]` | `NfsOpen` directive, selector `[nfsOpen]` | Attribute directive on the consumer's button (ADR 0001); the plugin has no Structural class, so the name comes from the Foundation attribute (building-blocks 1.3) |
| `[data-close]` | `NfsClose` directive, selector `[nfsClose]` | Same |
| `[data-toggle]` | `NfsToggle` directive, selector `[nfsToggle]` | Same |
| `[data-toggle-focus]`, `[data-closable]` | None | Dropped; see the Foundation contract |

### Hierarchy and DI shape

```
nfsOpenableToken : InjectionToken<NfsOpenable>     provided by every Openable with useExisting
  dialog[nfsReveal] | [nfsOffCanvas] | [nfsDropdownPane] | [nfsToggler] | [nfsResponsiveToggle] | [nfsTooltip]

[nfsOpen]   -> explicit target(s), required
[nfsClose]  -> explicit target(s), or the Nearest Openable when written bare
[nfsToggle] -> explicit target(s), or the Nearest Openable when written bare
```

- The contract is a lightweight token: `nfsOpenableToken = new InjectionToken<NfsOpenable>('nfsOpenableToken')` typed by an exported interface, in a token file that imports only types. Trigger inputs are typed by the interface too, so a Trigger retains no Openable class and an Openable retains no Trigger (the lightweight-injection-token guide; Material's `MatMenuPanel` interface behind `matMenuTriggerFor`; Aria's `import type` token files). An interface rather than the guide's abstract class, because consumers implement it (wrapper components) without extending a library class.
- Every Openable provides it: `providers: [{provide: nfsOpenableToken, useExisting: NfsReveal}]`, next to its own plugin token. One Openable per element: Angular leaves the winner undefined when two directives on one element provide the same token.
- Nearest Openable: a bare `nfsClose` or `nfsToggle` injects `inject(nfsOpenableToken, {optional: true, skipSelf: true})` once at construction. `skipSelf` makes "nearest" mean an enclosing element, never the Trigger's own element: Tooltip provides the token on its host, which is a trigger element, so `<button nfsClose nfsTooltip="Close">` inside a Reveal closes the Reveal, not the tooltip.
- Resolution follows the declaration site (Angular's rule for projected content): content a consumer projects into a component resolves against the consumer's template, not the component's view. A wrapper component that renders its own Reveal and projects consumer content becomes the Nearest Openable for that content by implementing `NfsOpenable` (delegating to its Reveal) and providing `nfsOpenableToken` with `useExisting`.
- Reverse link: each Trigger registers its host element with each target that implements `registerTrigger`, from an `effect` whose cleanup unregisters, the shape Aria's `MenuTrigger` uses to set `menu.parent` (reverse link through the target), and the named reverse-link registration exception of building-blocks 1.5 and 1.9: the reference can change at runtime, which `ngOnInit` registration cannot follow, and the effect writes only the target's registry, never the DOM. The Dropdown pane needs its Triggers before any click: Foundation's Dropdown positions against its first anchor when opened programmatically, attaches `hover` listeners to its anchors, and ignores body clicks on its anchors.
- No service, no registry, no Defaults token (Triggers have no Foundation defaults), no provider function.
- Entry point: `ngx-foundation-sites/triggers`, holding the three directives, the token, and the types. Every Openable's entry point imports the token from it.

### API

The contract:

```ts
type NfsTriggerRole = 'disclosure' | 'dialog' | 'modal-dialog' | 'toggle-button' | 'none';

interface NfsOpenable {
  readonly isOpen: Signal<boolean>;             // the Openable's isOpen model, read-only here
  readonly id: Signal<string>;                  // id of the element aria-controls must name
  readonly triggerRole: Signal<NfsTriggerRole>; // which ARIA its Triggers render
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;
  toggle(trigger?: HTMLElement): void;
  registerTrigger?(trigger: HTMLElement): () => void; // returns the unregister function
}

const nfsOpenableToken: InjectionToken<NfsOpenable>;
```

| Member | Meaning | Who needs it |
| --- | --- | --- |
| `isOpen` | The Openable's `isOpen` model (building-blocks 1.3); `true` from the moment an open is requested until a close is requested, not waiting for animations | `aria-expanded`, `aria-pressed`, toggle decisions |
| `id` | The id of the controlled element: the panel for OffCanvas, the pane, the dialog, the Toggler target, and the menu (not the title bar) for ResponsiveToggle; consumer-supplied or generated | `aria-controls` |
| `triggerRole` | A signal, because Toggler switches between `disclosure` (visibility mode) and `toggle-button` (class mode), and Dropdown pane between `disclosure` and `dialog` from its `role` input, and Reveal between `modal-dialog` and `dialog` from its `overlay` input | The ARIA table |
| `open(trigger?)` | Opens; records `trigger` as the element to position against and to return focus to; without it the Openable falls back to its first registered Trigger for anchoring and to the element focused before opening for focus return (Material's rule) | Reveal, OffCanvas, Dropdown pane |
| `close(result?)` | Requests a close; the Openable may veto (Reveal's `closePredicate`) and may hand `result` to its `closed` output | `nfsClose`, Reveal results |
| `toggle(trigger?)` | `isOpen() ? close() : open(trigger)` | Single-target `nfsToggle`, programmatic use |
| `registerTrigger?(trigger)` | Optional; tells the Openable which elements are its Triggers | Dropdown pane: `hover`, programmatic anchoring, Light dismiss exclusion |

The directives, all standalone, no template:

```ts
type NfsOpenableTarget = NfsOpenable | readonly NfsOpenable[] | null | undefined;

class NfsOpen {   // selector [nfsOpen], exportAs 'nfsOpen'
  readonly target: InputSignal<NfsOpenableTarget>;                 // alias 'nfsOpen', required
  readonly isOpen: Signal<boolean>;                                // true when any target is open
}
class NfsToggle { // selector [nfsToggle], exportAs 'nfsToggle'
  readonly target: InputSignalWithTransform<NfsOpenableTarget | 'nearest', NfsOpenableTarget | ''>; // alias 'nfsToggle'
  readonly isOpen: Signal<boolean>;
}
class NfsClose {  // selector [nfsClose], exportAs 'nfsClose'
  readonly target: InputSignalWithTransform<NfsOpenableTarget | 'nearest', NfsOpenableTarget | ''>; // alias 'nfsClose'
  readonly result: InputSignal<unknown>;                           // alias 'nfsCloseResult', default undefined
  readonly isOpen: Signal<boolean>;
}
```

| Input | Directive | Type | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- | --- |
| `nfsOpen` | `NfsOpen` | an Openable, an array, `null`, `undefined`; required | none | `data-open="id [id...]"` | Typed references instead of ids; no bare form (Foundation's bare `data-open` targets nothing either) |
| `nfsToggle` | `NfsToggle` | the same, or empty (bare attribute) | Nearest Openable when bare | `data-toggle` | Several targets move together; `null` means no target |
| `nfsClose` | `NfsClose` | the same, or empty (bare attribute) | Nearest Openable when bare | `data-close` | `null` means no target |
| `nfsCloseResult` | `NfsClose` | `unknown` | `undefined` | None (Material's `[mat-dialog-close]` value) | New; passed to `close(result)` |

- Target resolution: only the bare attribute (the empty string) selects the Nearest Openable. A bound `null` or `undefined` means no target: no ARIA and a no-op click. An explicit binding never falls back to an ancestor, so a reference that is briefly `undefined` (a signal query before its first render) cannot operate the wrong Openable.
- Typing: under `strictTemplates` (the Angular default) a template reference to the element instead of the directive (`#pane` without `="nfsDropdownPane"`) fails compilation, because an element's `open` is a property, not a method. A bare `nfsOpen` fails the same way. Without strict templates, the dev-mode check below reports both.
- Multiple targets: `nfsOpen` opens each and `nfsClose` closes each. `nfsToggle` with several targets closes all when any is open and opens all otherwise, so `aria-expanded` has one truthful value. Foundation toggles each target independently, which lets targets drift apart; its documented example ("Toggle All These" over three visible thumbnails) behaves identically under both rules. Every target in an array should share one Trigger role; if they differ, the first target's role decides the ARIA and dev mode warns.
- `isOpen`: `true` when any target is open; exported so a template can read the state of a bare Trigger's Nearest Openable.
- Outputs: none. The Openable's `isOpenChange`, `opened`, and `closed` are the events; a Trigger adds nothing a `(click)` binding would not give.
- Methods: none. `open()`, `close()`, and `toggle()` live on the Openable.
- Activation: one `(click)` host listener. The handler returns early when the host has `aria-disabled="true"` (an `nfsButton` with `disabledInteractive`, the check Material's `MatDialogClose` makes); otherwise it calls the target methods, passing the host element as `trigger` to `open` and `toggle` and `result()` to `close`. It never calls `preventDefault()` or `stopPropagation()`: a `<button type="button">` has no default action to cancel, and a link keeps navigating.
- Attribute ownership: a Trigger owns `aria-expanded`, `aria-controls`, `aria-haspopup`, and `aria-pressed` on its host and never binds `type`, `disabled`, `aria-disabled`, `role`, or `tabindex`. `nfsButton` owns `type` and the disabled state, so a Trigger and `nfsButton` on one element never bind the same attribute. One Trigger directive per element: two would bind the same ARIA attributes, resolved by directive order; a button that must both open one thing and close another uses a `(click)` handler.
- Dev-mode checks, in one `afterRenderEffect` that exists only when `ngDevMode` is on (never on the server, removed in production), each warning once per instance:
  1. No target: a bare `nfsClose` or `nfsToggle` with no Nearest Openable, or `nfsOpen` bound to an empty value.
  2. Not an Openable: a target without an `open` method (a template reference to the element).
  3. Host cannot be operated from the keyboard: anything but `<button>`, `<a href>`, or `<input type="button|submit|reset">`; an `<a>` whose `href` is missing, empty, or `#` gets the message "use a button".
  4. Submit risk: a `<button>` host with no `type` attribute whose `form` is not null.
  5. Mixed Trigger roles in an array.

### Implementation level and primitives

Implementation level: custom Angular directives over native `<button>` activation. Native platform first: Invoker Commands (`command`, `commandfor`) and `popovertarget` are the platform versions of this utility, and both are outside the browser target (Invoker Commands Baseline newly available December 2025; `popovertarget` Baseline 2024 but its targets must be popovers, which are out of target too). `@angular/aria` 22.2 has no disclosure or dialog pattern, and its only trigger, `ngMenuTrigger`, targets `ngMenu` only, keeps the open state in the trigger, and renders `aria-haspopup="true"`, which WAI-ARIA treats as `menu`. `@angular/cdk` has no generic trigger: `cdkMenuTriggerFor` and Material's `matMenuTriggerFor` open overlay menus with `aria-haspopup="menu"`, which is wrong for every Openable here, and CDK Dialog is not used (ADR 0007).

Primitives: `input()` and `input.required()` with aliases and a transform for the bare form, `computed()` for the resolved targets, the aggregate `isOpen`, and the ARIA values, one `effect()` for trigger registration (it writes no DOM, so it is safe on the server; the reverse-link exception of building-blocks 1.5), `inject()` with `optional` and `skipSelf`, `ElementRef` for the host element passed to `open()`, host metadata for the listener and the four ARIA bindings, and `afterRenderEffect` for the dev checks. No CDK, no Aria, no timers, no observers, no `NgZone`.

Render hooks and lazy loading (building-blocks 1.5 and 1.9): the dev checks' `afterRenderEffect`, which exists only in development builds, is the only render hook; `afterEveryRender` is not used, because every production behaviour is a host binding or the click handler. `injectAsync` is not used: a Trigger injects only the lightweight `nfsOpenableToken`, its ARIA must be in the server HTML, and its `click` handler must be live at hydration so a replayed pre-hydration click reaches the Openable at once; the entry point is its own, so a consumer's `@defer` splits it with the widget.

Fallback: none needed. No behaviour depends on an unverified mechanism; the replay and hydration facts come from the rendering-modes research and are asserted in e2e.

### Comparison with Angular Material and CDK

| Concern | Material and CDK | Triggers |
| --- | --- | --- |
| Close from inside | `[mat-dialog-close]="result"`: finds its dialog through DI or the closest open dialog; `type` input defaulting to `button`; `aria-label` input; ignores clicks while `aria-disabled="true"` | Bare `nfsClose` finds the Nearest Openable through DI; result through `nfsCloseResult`; no `type` or `aria-label` inputs (native attributes, and `nfsButton` owns `type`); ignores clicks while `aria-disabled="true"` |
| Open from a trigger | `[matMenuTriggerFor]="menu"` with `#menu="matMenu"`, typed by the `MatMenuPanel` interface; `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` while open; click, mousedown, and keydown handlers | `[nfsOpen]`/`[nfsToggle]` with `#x="nfsReveal"` and friends, typed by the `NfsOpenable` interface; ARIA from the Trigger role; click only |
| CDK menu trigger | `[cdkMenuTriggerFor]` takes a `TemplateRef`; creates the menu in an overlay | Targets are consumer-written elements already in the page; nothing is created |
| Sidenav | No trigger directive: `(click)="drawer.toggle()"` through a template reference; `open(openedVia?)`, `toggle(isOpen?, openedVia?)` | Same template-reference idiom, plus ARIA the consumer would otherwise write by hand; `open(trigger?)` passes the element rather than a focus origin |
| Aria link inputs | `AccordionTrigger.panel = input.required<AccordionPanel>()`; `MenuTrigger.menu` plus the reverse `menu.parent` link | Same typed-reference input; same reverse link for `registerTrigger` |
| Result on close | `MatDialogRef.close(result)` | `close(result?)` on the contract |

Borrowed: the typed-reference input with `exportAs`, `[mat-dialog-close]`'s DI lookup, its result, and its `aria-disabled` check, the reverse link from Aria. Not borrowed: `type` and `aria-label` inputs, keydown and mousedown handling, overlay creation, `aria-haspopup="menu"`.

### ARIA and keyboard

APG patterns: Disclosure (disclosure role), Dialog (Modal) opened with `showModal()` (modal-dialog role), non-modal dialog and Off-canvas Modal mode (dialog role), Button toggle button (toggle-button role). The Trigger renders:

| Trigger role | `nfsOpen` | `nfsToggle` | `nfsClose` |
| --- | --- | --- | --- |
| `disclosure` | `aria-expanded`, `aria-controls` | `aria-expanded`, `aria-controls` | nothing |
| `dialog` | `aria-haspopup="dialog"`, `aria-controls`, `aria-expanded` | `aria-haspopup="dialog"`, `aria-controls`, `aria-expanded` | nothing |
| `modal-dialog` | `aria-haspopup="dialog"`, `aria-controls` | `aria-haspopup="dialog"`, `aria-controls` | nothing |
| `toggle-button` | nothing | `aria-pressed` | nothing |
| `none` | nothing | nothing | nothing |

- `aria-expanded` and `aria-pressed` are `"true"`/`"false"` from `isOpen`; `aria-controls` is the space-separated list of target ids.
- `dialog` renders `aria-expanded` as well: a non-modal dialog (a Dropdown pane with `role="dialog"`, trapped or not; a Reveal with `overlay: false`) keeps the Trigger that opened it reachable while open, and so can an Off-canvas panel in Modal mode, whose `inert` covers only `.off-canvas-content` while neither Chromium nor Firefox hides content outside an `aria-modal` dialog; the state is observable and true there.
- `modal-dialog` renders no `aria-expanded`: the Openable is a `<dialog>` opened with `showModal()`, which makes every Trigger outside it inert while it is open, so engines drop the Trigger from their accessibility trees and fire no expanded-state change, and the only value assistive technology could read is `false`. This matches Foundation's Reveal opener, the APG Dialog (Modal) examples, and HTML-AAM's `command="show-modal"` mapping, and it keeps an open-by-default Reveal's server HTML from claiming a dialog that is still closed ([Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md)). `aria-controls` stays for Foundation parity and the closed-state relationship.
- `aria-haspopup="true"` is never rendered: WAI-ARIA treats it as `menu`, and no Openable is a menu.
- `nfsClose` renders nothing: the APG dialog pattern's close button carries no state, and a one-way control has no expanded state to report.
- `none` is Tooltip's role: WAI-ARIA says a tooltip is not a popup, and the tooltip's own host carries `aria-describedby`.
- Names come from content or the consumer's `aria-label`/`aria-labelledby` (Foundation's `.close-button` docs markup, the ResponsiveToggle title text); the Trigger adds no name.

| Key | `<button>` Trigger | `<a href>` Trigger | Owner |
| --- | --- | --- | --- |
| Enter | Activates (native `click`) | Follows the link and activates | Native |
| Space | Activates on key release | Scrolls the page (native link behaviour) | Native |
| Tab, Shift+Tab | Reaches the button | Reaches the link | Native |
| Escape | Closes an open Openable | Same | The Openable |

Focus: the Trigger moves no focus. Focus moves into a dialog or panel and back to the Trigger that opened it on close by the Openable, which received that Trigger through `open(trigger)`. When a bare `nfsClose` closes the Openable that contains it, focus returns to the Trigger that opened it, not to the close button.

### WCAG 2.2 AA

The target is WCAG 2.2 level AA (user rule; ADR 0022). Each criterion below is a requirement with the layer that tests it; none is advice. A Trigger adds no CSS and no Foundation class (D16), so criteria about the host's look are met by the host's own contract (the Button spec, Foundation's Close Button and Title Bar markup), and criteria about what opens are met by the Openable; the table says which.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 4.1.2 Name, Role, Value | Every Trigger exposes the state of what it controls, per Trigger role, in the server HTML and after every change: `disclosure` renders `aria-expanded` and `aria-controls` on `nfsOpen` and `nfsToggle`; `dialog` adds `aria-haspopup="dialog"`; `modal-dialog` renders `aria-haspopup="dialog"` and `aria-controls` and no `aria-expanded`, because its Trigger is inert whenever the dialog is open; `toggle-button` renders `aria-pressed` on `nfsToggle` only, and the consumer keeps the accessible name constant; `none` and every `nfsClose` render nothing. `aria-haspopup="true"` is never rendered, because WAI-ARIA reads it as `menu` and no Openable is a menu. A multi-target `nfsToggle` reports one aggregate `aria-expanded`, which is true because the targets move together (D11). `aria-controls` always names an element that exists, because every Openable has an `id` (consumer-supplied or generated). A `disabledInteractive` host keeps its `aria-disabled="true"` from `nfsButton`, and the Trigger ignores its clicks (D14). The Trigger adds no name; names come from content or the consumer's `aria-label`/`aria-labelledby` | Fails: Dropdown stamps `aria-haspopup="true"`; Toggler stops updating `aria-expanded` on multi-id triggers; `data-close` triggers get `aria-expanded`; Reveal stamps `tabindex="0"` | axe (`aria-allowed-attr`, `aria-valid-attr-value`, `button-name`) in every story; play functions of `triggers--open-close-toggle`, `triggers--dialog-role`, `triggers--modal-dialog-role`, `triggers--toggle-button-role`, and `triggers--multiple-targets`; browser-level ARIA table driven by data; SSR smoke |
| 2.5.8 Target Size (Minimum) | Every Trigger host is at least 24 by 24 CSS px or meets the spacing exception. The Trigger cannot know its host's styling, so the requirement is inherited from the host's contract: an `nfsButton` or `.button` host through the Button spec's `.button { min-width: 24px; min-height: 24px; }` floor in the `nfs-button` mixin; a `.close-button` through the spacing exception of its corner position, with the consumer's `min-width: 24px` where a layout breaks it (the Button and Toggler specs); a `.title-bar .menu-icon` through the 24 by 24 px hit area of the `nfs-responsive-toggle` mixin, which the consumer includes (`@include nfs-responsive-toggle;`, no argument) for a title-bar menu icon with or without ResponsiveToggle; a `.menu-icon` outside `.title-bar` gets no library hit area, so the consumer sizes it to 24 px or keeps the spacing exception. A plain `<button>` under Foundation's global reset (`padding: 0`, `border: 0`, `line-height: 1`) is only as tall as its font size, 16 px by default, so a plain-button Trigger is styled to 24 px by the consumer or is an `nfsButton`; the Rendered HTML examples show bare `<button type="button">` hosts only to place the ARIA | Fails for a bare `<button>` host (16 px tall) unless the spacing exception holds; passes for `.button` hosts at Foundation's default sizes | axe `target-size` in every story; every Triggers story puts its Triggers on `nfsButton`, `.close-button`, or `.menu-icon` hosts, so the gate proves the inherited floor; each Openable spec's stories cover their own Trigger markup |
| 2.4.7 Focus Visible | Every Trigger host shows the browser's focus indicator; the Trigger removes no outline and adds no style. Foundation's global `button` reset, `.button`, and `.close-button` remove the outline only under what-input's `[data-whatinput='mouse']` (`disable-mouse-outline`), which the library never loads | Passes, checked in Foundation's global styles and the button and close button partials | e2e: a screenshot comparison before and after Tab to a Trigger in `triggers--open-close-toggle` shows a focus indicator in three engines |
| 2.1.1 Keyboard | Every Trigger is operable from the keyboard through native activation: Enter and Space on a `<button>`, Enter on an `<a href>`; the Trigger adds no key handling and needs none. Hosts that cannot be operated from the keyboard (a `div`, an `<a>` without `href` or with `#`) get dev-mode check 3 | Fails: Foundation's docs use `<a data-toggle>` without `href`, which is neither focusable nor activatable from the keyboard | Play functions with `userEvent.keyboard` on `triggers--open-close-toggle`; browser-level dev-mode check cases; e2e real key presses in three engines |
| 1.4.13 Content on Hover or Focus | Where a Trigger's Openable shows content on hover or focus (a Dropdown pane with `hover`, a Tooltip), that content is dismissible without moving the pointer or focus (Escape), hoverable, and persistent until dismissed; the Openable owns all three through the Anchored pane utility's hover intent and Light dismiss and its own Escape handling, and its spec tests them. A Trigger opens only on `click`, which is not hover or focus content. The `data-toggle-focus` replacement, `(focus)`/`(blur)` bindings to `open()`/`close()`, must also bind `(keydown.escape)` to `close()`; the documented recipe does | Fails: `data-toggle-focus` closes only on blur, with no Escape | `triggers--focus-replacement`: Escape hides the hint while focus stays on the field; hover content is tested in the Dropdown pane and Tooltip specs |
| 2.4.3 Focus Order | Closing an Openable returns focus to the element that opened it: every Trigger passes its host to `open(trigger)` and `toggle(trigger)`, and every Openable returns focus to that element on close, else to the element focused before opening (a requirement every Openable spec inherits, Consumers table). The argument is needed because a mouse click does not focus a button in WebKit, so the element focused before opening is not always the Trigger that opened it. A bare `nfsClose` inside the Openable never becomes the return target. When a close button disappears with its content (the `data-closable` replacements), the consumer moves focus to a logical next element | Partly: Reveal refocuses the anchor focused at open and OffCanvas its `$lastTrigger` (Foundation contract table); the utility itself passes the trigger but returns no focus | Browser-level contract calls: `open` and `toggle` receive the host element, including on a replay-shaped click; each Openable spec asserts where focus lands, in stories and in e2e across three engines |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`) with `parameters.a11y.test = 'error'` (ADR 0018). Triggers need no Sass setting and no library rule of their own.

### Rendered HTML

Consumer markup and the resulting DOM. Server HTML carries `jsaction="click:;"` on every Trigger (Angular's event-replay annotation for the host listener); the hydrated DOM does not, because Angular removes the attribute after hydration. Everything else is identical on the server and after hydration, except generated ids, which differ between the two and are rewritten at hydration because `aria-controls` is itself a host binding.

```html
<!-- Disclosure: Dropdown pane, closed -->
<button nfsButton [nfsToggle]="account">Account</button>
<div nfsDropdownPane #account="nfsDropdownPane" id="account-pane" class="dropdown-pane">...</div>

<!-- server -->
<button class="button" type="button" aria-expanded="false" aria-controls="account-pane" jsaction="click:;">Account</button>
<!-- hydrated, after a click -->
<button class="button" type="button" aria-expanded="true" aria-controls="account-pane">Account</button>

<!-- Modal dialog: the Trigger that opens a Reveal (modal-dialog role), and a bare close button inside -->
<button type="button" [nfsOpen]="signup">Sign up</button>
<dialog nfsReveal #signup="nfsReveal" id="signup" class="reveal" aria-labelledby="signup-title">
  <h2 id="signup-title">Sign up</h2>
  <button class="close-button" type="button" aria-label="Close" nfsClose>
    <span aria-hidden="true">&times;</span>
  </button>
</dialog>

<!-- server, closed -->
<button type="button" aria-haspopup="dialog" aria-controls="signup" jsaction="click:;">Sign up</button>
<button class="close-button" type="button" aria-label="Close" jsaction="click:;"><span aria-hidden="true">&times;</span></button>
<!-- the same Trigger for a Reveal with [overlay]="false" (dialog role): aria-haspopup="dialog" aria-controls="signup" aria-expanded="false" -->

<!-- Toggle button: Toggler in class mode -->
<button type="button" [nfsToggle]="theme">Dark theme</button>
<button type="button" aria-pressed="false">Dark theme</button>

<!-- Bare toggle inside a ResponsiveToggle title bar; the id is the menu's -->
<div class="title-bar" [nfsResponsiveToggle]="mainMenu" hideFor="medium">
  <button class="menu-icon" type="button" nfsToggle aria-labelledby="bar-title"></button>
  <div class="title-bar-title" id="bar-title">Menu</div>
</div>
<button class="menu-icon" type="button" aria-labelledby="bar-title" aria-expanded="false" aria-controls="main-menu"></button>

<!-- Multiple targets, all visible at first paint -->
<button type="button" [nfsToggle]="[thumb1, thumb2, thumb3]">Toggle all</button>
<button type="button" aria-expanded="true" aria-controls="thumb1 thumb2 thumb3">Toggle all</button>

<!-- Link that navigates and closes the off-canvas panel it sits in -->
<a routerLink="/pricing" nfsClose>Pricing</a>
<a href="/pricing">Pricing</a>
```

The ResponsiveToggle markup in the fourth example follows the [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md) (`[nfsResponsiveToggle]="mainMenu"` with `#mainMenu="nfsResponsiveToggleMenu"` on the menu); the Trigger part is what this spec fixes.

### Animation

None. A Trigger inserts or removes no element and binds no class, so ADR 0003 has nothing to govern here: no State class, no Motion class, no `animate.enter`/`animate.leave`, no Completion output. Every animation belongs to the Openable, and `isOpen` (hence `aria-expanded`) changes when the open or close is requested, not when an animation ends.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: the four ARIA attributes are host bindings on signals the Openable already has on the server (its `isOpen` model, its `id`, its `triggerRole`), so the server HTML is the final ARIA (rule 1). Nothing in a Trigger depends on the platform, a breakpoint, or a measurement.
- Before hydration: a Trigger touches no DOM outside host bindings, reads no `window`, and starts nothing (rules 3 to 5). The registration `effect` runs on the server as well and writes only into the Openable's in-memory set; the dev checks never run on the server.
- Full hydration: host binding values equal the server's (apart from generated ids, rewritten at hydration), so hydration changes nothing and there is no structure to mismatch (rule 10).
- Event replay: the `click` host listener gives the host `jsaction="click:;"`. A click before hydration does the native default (nothing for a `type="button"` button), is queued, and after hydration is replayed: the handler reads the Openable resolved at construction or in the first render, both of which exist before replay, and calls `open`, `close`, or `toggle`. `showModal()` and `focus()`, which Openables call, need no user activation, so a replayed open works. The handler never calls `preventDefault()`, so replay cannot throw in it. Replay handling is decided for the whole library: state first, `preventDefault()` last, the error Angular logs on a replayed `preventDefault()` accepted, decided under the triage rule in the [Angular 22.2 @defer, SSR, prerendering, hydration, and event replay for DOM-touching directives](../issues/38-angular-rendering-modes.md) ticket (building-blocks Part 4, Decided item 3); a Trigger meets it by construction, because it changes state and never calls `preventDefault()` at all.
- Links: a Trigger on `<a href>` inside a still-dehydrated block has a `jsaction` attribute, so Angular's dispatcher cancels the native navigation of a click, hydrates the block, and replays the Trigger. With `routerLink` the replayed RouterLink handler navigates; a plain `href` does not navigate. Links that must navigate natively in deferred regions therefore stay out of dehydrated blocks (Button spec, ADR 0011). In practice this needs a dehydrated block nested inside an open Openable, because an Openable is closed until its own boundary hydrates.
- Hydration boundary: a Trigger and its Openable belong to one hydration boundary. Template-reference scoping enforces half of the rule: a `@defer` block is its own view, so a reference declared inside it is not visible outside, and a Trigger outside cannot name an Openable inside. A Trigger inside a block may name an Openable outside it; its click hydrates the block and every dehydrated ancestor top-down before replay, so it works. The Nearest Openable is always the same or an enclosing boundary.
- `@defer`: library templates contain no `@defer`; the Triggers are their own entry point, so a consumer can defer them with the widget. Inside a dehydrated block a Trigger is its server HTML; a click hydrates the block and replays. Inside `@defer (hydrate never)` nothing is annotated, so a Trigger there is an inert button (a link still navigates); its Openable stays in its server state. Plain `@defer` without hydrate triggers renders the Triggers on the client, where they resolve targets like any other client render.
- Prerendering: identical to server rendering; no request token is read (rule 11).

## Testing Decisions

A good test asserts what a user or assistive technology observes: `aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-pressed`, whether the Openable is shown, where focus lands, and whether a click submits or navigates. No test reads a directive's private fields. Tests that need an Openable before the plugin specs exist use a test Openable: a small directive that provides `nfsOpenableToken`, holds an `isOpen` model, binds `hidden` from it, and records the arguments of `open`, `close`, and `registerTrigger`. It lives with the tests and the stories, not in the public API. There is no prior art in the new repository; the patterns are the building-blocks testing rule, Angular's own `renderApplication`-based SSR tests, and the Angular Components universal-app e2e.

Story ids follow `triggers--<story>`: `triggers--open-close-toggle`, `triggers--nearest-openable`, `triggers--nested-openables`, `triggers--multiple-targets`, `triggers--dialog-role`, `triggers--modal-dialog-role`, `triggers--toggle-button-role`, `triggers--close-result`, `triggers--with-nfs-button`, `triggers--link-trigger`, `triggers--focus-replacement`. Plugin specs add composition stories under their own ids (`reveal--...`, `dropdown-pane--...`).

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Run by `npx nx test-storybook <lib>`. Every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, plus `best-practice`, which include `target-size`, `button-name`, and the ARIA attribute rules). Every story's Triggers sit on `nfsButton`, `.close-button`, or `.title-bar .menu-icon` hosts (2.5.8); the Storybook preview includes `nfs-responsive-toggle`, whose hit area the menu icon needs.

- `triggers--open-close-toggle`: three buttons on one test Openable in the disclosure role; each click shows or hides it; `aria-expanded` follows on the open and toggle buttons, `aria-controls` equals the target id, and the close button carries neither; Enter and Space on the focused toggle button work through `userEvent.keyboard`.
- `triggers--nearest-openable`: a bare `nfsClose` and a bare `nfsToggle` inside the Openable close it; a bare `nfsClose` with no Openable around it does nothing.
- `triggers--nested-openables`: a bare `nfsClose` in an inner Openable closes only the inner one; the outer stays open.
- `triggers--multiple-targets`: three targets, one hidden by a separate control first; the toggle closes all while any is open, then opens all; `aria-controls` lists three ids and `aria-expanded` matches the aggregate.
- `triggers--dialog-role`: the Trigger of a non-modal test Openable carries `aria-haspopup="dialog"`, `aria-controls`, `aria-expanded`; never `aria-haspopup="true"`.
- `triggers--modal-dialog-role`: the Trigger of a test Openable in the `modal-dialog` role carries `aria-haspopup="dialog"` and `aria-controls` and has no `aria-expanded` attribute, closed and open; never `aria-haspopup="true"`.
- `triggers--toggle-button-role`: `nfsToggle` flips `aria-pressed`, has no `aria-expanded` and no `aria-controls`, and its accessible name does not change.
- `triggers--close-result`: `[nfsCloseResult]="'saved'"` reaches the test Openable's `close` and is shown in the story.
- `triggers--with-nfs-button`: `nfsButton` plus `nfsToggle` renders `.button`, `type="button"`, and the Trigger ARIA; with `disabledInteractive` and `disabled`, a click leaves the Openable unchanged.
- `triggers--link-trigger`: a same-page `href="#details"` link with `nfsClose` closes the Openable and the URL hash changes.
- `triggers--focus-replacement`: an input with `(focus)`/`(blur)` bindings shows a hint on focus and hides it on blur, whatever the hint's starting state; Escape hides it while focus stays on the input (1.4.13).

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Resolution: the bare form resolves the Nearest Openable; `skipSelf` ignores a test Openable on the Trigger's own element and resolves the enclosing one; a bound `null` and `undefined` resolve nothing and render no ARIA; switching a bound reference at runtime moves `aria-controls` and the registration.
- ARIA derivation, driven by data: every directive against every Trigger role, open and closed, single target and array, asserting the four attributes against the ARIA table; mixed roles in an array use the first target's role and warn.
- Contract calls: `open` and `toggle` receive the host element; `close` receives `nfsCloseResult`; a single target uses `toggle`, an array uses the aggregate rule; `registerTrigger` is called once per target and its cleanup runs when the reference changes and when the Trigger is destroyed.
- `aria-disabled="true"` on the host blocks the call; removing it restores it.
- Wrapper component: a component implementing `NfsOpenable` and providing the token becomes the Nearest Openable of content projected into it.
- Dev-mode checks: each of the five warnings fires once for its case and not for the correct case (a `<button type="button">`, an `<a href="/x">`, a `<button>` without `type` outside any form).
- Replay-safe handler: dispatch a `click` whose `eventPhase` reads 101 and whose `preventDefault` throws; the test Openable opens and nothing reaches `ErrorHandler`.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`; no test needs `NgZone`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture component with test Openables in each of the five Trigger roles, one open and one closed, a multi-target Trigger, a bare `nfsClose` inside an Openable, and a bound `null`. Assert `whenStable()` resolves; the server HTML carries every attribute from the Rendered HTML section; each Trigger host carries `jsaction="click:;"`; the `nfsClose` hosts carry no ARIA from the Trigger; the `modal-dialog` fixture's Trigger carries `aria-haspopup` and `aria-controls` and no `aria-expanded`. Runs under `npx nx test <lib>` in `<name>.ssr.spec.ts` through the shared `renderServer()` helper; `npx nx test-node <lib>` only if the server path depends on the DOM adapter.
- Pure logic: the ARIA derivation (directive kind, Trigger role, `isOpen`, ids to the four attribute values) is a pure function; a table-driven test covers it.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build:

- Real key presses in Chromium, Firefox, and WebKit on `triggers--open-close-toggle`: Enter and Space activate the toggle button in all three engines; Tab reaches every Trigger.
- Focus visible (2.4.7): a screenshot comparison before and after Tab to a Trigger on `triggers--open-close-toggle` shows a focus indicator in three engines.

Against the prerendered fixture app (the harness from the rendering-mode test seam prototype):

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` with `withTags` on `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, and `best-practice`) on the server HTML; the Triggers carry their ARIA.
- Hydration: no NG05xx in the console and `ngDevMode.componentsSkippedHydration === 0`.
- Pre-hydration click with the main bundle delayed: a Trigger clicked before hydration opens its test Openable exactly once after hydration, and no error is logged.
- Dehydrated block: a Trigger and its Openable inside `@defer (hydrate when hydrateNow())` with the signal held `false`; clicking the Trigger hydrates the block and opens the Openable.
- Nested boundary: a Trigger inside a dehydrated block naming an Openable outside it opens the Openable.
- Link in a dehydrated block: a plain-`href` `nfsClose` link inside a dehydrated block keeps the documented behaviour (navigation cancelled, Openable closed on replay), so a change in Angular's dispatcher surfaces here.
- `@defer (hydrate never)`: a Trigger inside stays inert and no error is logged.

## Out of Scope

- An id-string target form (`nfsOpen="signup"`) and the registry it would need (design decision D2 below; [ADR 0013](../adr/0013-triggers-target-resolution.md)).
- `data-toggle-focus` and `data-closable` as directives (D9, D10).
- The Light dismiss registry and `closeme.zf.*` replacement: the Anchored pane spec.
- `data-resize`, `data-scroll`, `data-mutate`, and the `*me.zf.trigger` events: each consuming spec uses native observers.
- Each Openable's own behaviour: focus management, Escape, `closePredicate`, animations, and what `close(result)` does with the result belong to the Reveal, OffCanvas, Dropdown pane, Toggler, ResponsiveToggle, and Tooltip specs.
- Menu openers: submenu toggles are the Nested menu utility's `nfsSubmenuToggle`, and accordion and tab titles are Aria-hosted; none of them are Triggers.
- Invoker Commands and `popovertarget` (out of target; Further Notes).
- A `type` input, a `preventNavigation` input, keyboard handlers, and outputs.

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Three attribute directives on the consumer's native element | ADR 0001; Foundation's three attributes map one to one; native button activation needs no key handling | One directive with an `action` input (a second spelling of the attribute name); a component |
| D2 | Targets are typed template references, arrays of them, or the Nearest Openable | Building-blocks 1.8, not reopened: compile-time checking, no id uniqueness requirement (generated ids differ between server and client), no registry to order or clean up, and the idiom of Material, CDK, and Aria | Foundation's id strings through a root registry (typos fail silently; consumer ids needed everywhere; a registry filled at construction misses Openables in dehydrated blocks) |
| D3 | Only the bare attribute selects the Nearest Openable; a bound `null` means no target | An explicit binding never silently operates an ancestor | `null` and `undefined` falling back to the ancestor |
| D4 | Nearest Openable through `inject(nfsOpenableToken, {optional: true, skipSelf: true})` | Foundation's bubbling rule, and Reveal's own guard that only its own close bubbles close it; `skipSelf` keeps a Tooltip on the same element from capturing it; the repository's content-projection DI pattern (optional injection with `skipSelf`) | DOM `closest()` lookups (breaks with projection and needs the DOM before hydration) |
| D5 | Contract is an interface behind a lightweight `InjectionToken`, with `isOpen`, `id`, `triggerRole` as signals and `open(trigger?)`, `close(result?)`, `toggle(trigger?)`, optional `registerTrigger` | Lightweight-token guide; consumers can implement it; `trigger` gives focus return and anchoring (Foundation's `$lastTrigger` and `$currentAnchor`); `registerTrigger` gives Dropdown its anchors before any click | An abstract class (consumers would have to extend a library class); custom DOM events (not typed, not replayed) |
| D6 | Trigger role union `disclosure`, `dialog`, `modal-dialog`, `toggle-button`, `none` | Building-blocks 1.8 plus `toggle-button`, because the Toggler rows require `aria-pressed` in class mode and `none` cannot render it; `modal-dialog` because a Trigger that is inert whenever its dialog is open has no state to report ([Decide: `aria-expanded` on a modal dialog's opener](../issues/72-decide-aria-expanded-on-modal-opener.md)) | Consumers binding `[attr.aria-pressed]` themselves |
| D7 | `dialog` renders `aria-expanded`; `modal-dialog` does not | A non-modal dialog's Trigger, and an Off-canvas Modal-mode Trigger outside the inert content, stay reachable, so the state is observable; a `showModal()` dialog makes its Trigger inert while open, so the state could only ever read `false`, its change is never delivered, and an open-by-default Reveal would ship `aria-expanded="true"` next to a closed dialog in server HTML | One `dialog` role for both (the previous default); an optional modality member on `NfsOpenable` (two channels for one ARIA shape, silent fallback in wrappers); `modal-dialog` for Off-canvas Modal mode (a Trigger outside `.off-canvas-content` stays exposed, and Firefox infers 'collapsed' from `aria-haspopup` while the panel is open); `none` for modal Triggers (drops `aria-haspopup="dialog"`) |
| D8 | `nfsClose` renders no ARIA | APG dialog close buttons carry no state; a one-way control has no expanded state | Foundation's `aria-expanded` on `data-close` triggers |
| D9 | `data-toggle-focus` dropped | It toggles on both focus and blur, so it inverts; `(focus)`/`(blur)` bindings to `open()`/`close()` are one line and correct | A `nfsToggleFocus` directive |
| D10 | `data-closable` is not a directive | Building-blocks 1.8; `@if` with `animate.leave` removes, a Toggler in visibility mode hides in place, both already exist | An `nfsClosable` Openable (a third way to hide an element) |
| D11 | Multi-target `nfsToggle` moves all targets together | One truthful `aria-expanded`; Foundation's documented example behaves the same | Independent toggling (Foundation), which lets targets and ARIA drift apart |
| D12 | Activation is one `click` host listener that never calls `preventDefault()` or `stopPropagation()` | Replayable (ADR 0008); nothing to cancel on `type="button"`; links keep navigating; replay cannot throw | Keydown handlers (native activation already clicks); cancelling link navigation (a `preventNavigation` input, not needed: use a button) |
| D13 | No `type` binding; dev warning for a typeless `<button>` in a form | Button spec: `nfsButton` or the consumer owns `type`; two directives binding `[attr.type]` resolve by directive order | Defaulting `type` like `[mat-dialog-close]` |
| D14 | Ignore clicks while the host has `aria-disabled="true"` | `nfsButton` `disabledInteractive` must not open anything; Material's `MatDialogClose` makes the same check | Leaving it to the consumer |
| D15 | No service, no Defaults token, no provider function | Triggers hold no shared state and Foundation has no Triggers defaults | A trigger registry service |
| D16 | No library CSS and no Foundation class | Foundation has no trigger class; everything a Trigger changes is ARIA | A trigger State class |

### Consumers: what each Openable spec provides

| Openable | Trigger role | Uses of the contract |
| --- | --- | --- |
| Reveal | `modal-dialog` while `overlay` is true (the default), `dialog` when it is false | `open(trigger)` for focus return; `close(result)` handed to its `closed` output, vetoed by `closePredicate`; bare `nfsClose` inside is the documented close button |
| OffCanvas | `disclosure`, or `dialog` in its modal mode (`trapFocus` with an overlay present), as the [Spec: Off-canvas](../issues/25-spec-off-canvas.md) decided from the APG's modal-dialog reading (not `modal-dialog`: its `inert` covers only the linked content, so a Trigger outside it keeps an observable expanded state) | `open(trigger)` for focus return; bare `nfsClose` inside; the overlay element closes through its own directive, not a Trigger |
| Dropdown pane | `disclosure`, or `dialog` when its `role` input is `dialog` | `open(trigger)` as the current anchor; `registerTrigger` for `hover`, programmatic anchoring against the first Trigger, and Light dismiss exclusion; a `role="dialog"` pane is named by the consumer |
| Toggler | `disclosure` in visibility mode, `toggle-button` in class mode | `nfsToggle` and the multi-target form; the `data-closable` replacement in place |
| ResponsiveToggle | `disclosure` | Bare `nfsToggle` inside the title bar; `id` is the menu's id |
| Tooltip | `none` | Programmatic `open()`/`close()` and external `[nfsToggle]="tip"`; `skipSelf` keeps Triggers on its host from resolving it |

Requirements every Openable spec inherits: provide `nfsOpenableToken` with `useExisting` and `exportAs` its selector name; keep `isOpen` a model whose server value is its first-paint state; return focus to the `trigger` passed to `open`, else to the element focused before opening; work fully without any Trigger (the methods are the programmatic API); the Light dismiss registry ignores presses on the Openable's registered Triggers so a Trigger click toggles instead of closing and reopening.

### Usage examples

```ts
@Component({
  selector: 'app-header',
  imports: [NfsButton, NfsOpen, NfsClose, NfsToggle, NfsReveal, NfsDropdownPane, NfsToggler],
  template: `
    <!-- Dropdown pane: disclosure -->
    <button nfsButton class="dropdown" [nfsToggle]="account">Account</button>
    <div nfsDropdownPane #account="nfsDropdownPane" id="account-pane" class="dropdown-pane">
      <a routerLink="/profile" nfsClose>Profile</a>
    </div>

    <!-- Reveal: dialog, with a result -->
    <button nfsButton [nfsOpen]="confirm">Delete account</button>
    <dialog nfsReveal #confirm="nfsReveal" id="confirm" class="reveal" role="alertdialog"
            aria-labelledby="confirm-title" (closed)="onConfirm($event)">
      <h2 id="confirm-title">Delete your account?</h2>
      <button nfsButton class="secondary" nfsClose [nfsCloseResult]="false">Cancel</button>
      <button nfsButton class="alert" nfsClose [nfsCloseResult]="true">Delete</button>
    </dialog>

    <!-- Toggler in class mode: toggle button -->
    <button nfsButton class="hollow" [nfsToggle]="layout">Compact layout</button>
    <div nfsToggler #layout="nfsToggler" toggler="compact" id="content">...</div>
  `,
})
export class AppHeader {
  protected onConfirm(result: unknown): void {
    if (result === true) {
      // delete the account
    }
  }
}
```

The Reveal's `(closed)` payload and the Toggler's `toggler` input are defined by the [Spec: Reveal](../issues/18-spec-reveal.md) and the [Spec: Toggler](../issues/17-spec-toggler.md).

```html
<!-- OffCanvas: open from the title bar, close from inside or by following a link.
     The title-bar menu icon takes its 24 px hit area from @include nfs-responsive-toggle; -->
<div class="title-bar">
  <div class="title-bar-left">
    <button class="menu-icon" type="button" aria-label="Open menu" [nfsOpen]="nav"></button>
  </div>
</div>
<div nfsOffCanvas #nav="nfsOffCanvas" id="offcanvas-nav" class="off-canvas position-left">
  <button class="close-button" type="button" aria-label="Close menu" nfsClose>
    <span aria-hidden="true">&times;</span>
  </button>
  <ul class="vertical menu">
    <li><a routerLink="/" nfsClose>Home</a></li>
  </ul>
</div>

<!-- ResponsiveToggle: a bare nfsToggle in the title bar; no reference needed -->
<div class="title-bar" [nfsResponsiveToggle]="mainMenu" hideFor="medium">
  <button class="menu-icon" type="button" nfsToggle aria-labelledby="bar-title"></button>
  <div class="title-bar-title" id="bar-title">Menu</div>
</div>
<nav nfsResponsiveToggleMenu #mainMenu="nfsResponsiveToggleMenu" id="main-menu">...</nav>

<!-- Tooltip: a separate info button toggles it; the tooltip's own host is not a Trigger -->
<button type="button" nfsTooltip #hint="nfsTooltip" title="HyperText Markup Language">HTML</button>
<button type="button" [nfsToggle]="hint" aria-label="Explain HTML">?</button>

<!-- data-toggle-focus replacement -->
<input type="text" (focus)="formHint.open()" (blur)="formHint.close()" (keydown.escape)="formHint.close()" aria-describedby="form-hint">
<div nfsToggler #formHint="nfsToggler" hidden animate="nfs-fade-in nfs-fade-out" id="form-hint" class="secondary callout">
  This is only visible while the field has focus.
</div>

<!-- data-closable replacement 1: removed from the DOM -->
@if (showNotice()) {
  <div class="callout" animate.leave="nfs-fade-out">
    <p>Invoice sent.</p>
    <button class="close-button" type="button" aria-label="Dismiss notice" (click)="dismiss()">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
}

<!-- data-closable replacement 2: hidden in place, like Foundation's fadeOut -->
<div class="callout" nfsToggler animate="nfs-fade-in nfs-fade-out" id="notice">
  <p>Invoice sent.</p>
  <button class="close-button" type="button" aria-label="Dismiss notice" nfsClose>
    <span aria-hidden="true">&times;</span>
  </button>
</div>
```

In both `data-closable` replacements the focused close button disappears with the callout, so the consumer moves focus to a logical next element in `dismiss()` or on the Toggler's `closed` output, as the APG's focus-persistence practice asks. The Tooltip example puts the tooltip on an interactive host, a button: tooltips go on interactive hosts only (a native button, link, or form control, with a development-mode warning otherwise), decided at triage in the [Spec: Tooltip](../issues/27-spec-tooltip.md).

A wrapper component that owns its Reveal and lets consumers close it from projected content:

```ts
@Component({
  selector: 'app-confirm',
  imports: [NfsReveal],
  providers: [{provide: nfsOpenableToken, useExisting: AppConfirm}],
  template: `<dialog nfsReveal #reveal="nfsReveal" class="reveal"><ng-content /></dialog>`,
})
export class AppConfirm implements NfsOpenable {
  protected readonly reveal = viewChild.required<NfsReveal>('reveal');
  readonly isOpen = computed(() => this.reveal().isOpen());
  readonly id = computed(() => this.reveal().id());
  readonly triggerRole = computed(() => this.reveal().triggerRole());

  open(trigger?: HTMLElement): void {
    this.reveal().open(trigger);
  }

  close(result?: unknown): void {
    this.reveal().close(result);
  }

  toggle(trigger?: HTMLElement): void {
    this.reveal().toggle(trigger);
  }
}
```

Delegating `triggerRole` keeps the wrapper's Triggers in step with the Reveal's `overlay`; a constant `'dialog'` would render the non-modal shape on a modal Reveal.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. Triggers rely on no Foundation export mixin: they add no Foundation class, and the classes on their hosts (`.button`, `.close-button`, `.menu-icon`) belong to the Button spec, the Close Button markup, and the Title Bar markup. No library CSS; there is no `nfs-triggers` mixin. (1) Rules: none. (2) Reused settings: none. (3) Custom properties: none. (4) Motion classes: none, and no `prefers-reduced-motion` override, because Triggers animate nothing. (5) A missing include breaks nothing, because there is none.

### Platform features to adopt when the browser target moves

- Invoker Commands (`command`, `commandfor`; Baseline newly available 2025-12-12, widely available about 2028-06): the Triggers can render `commandfor` with the Openable's `id` and a command, `show-modal`/`close`/`request-close` for a Reveal's `<dialog>` and a custom `--nfs-open`/`--nfs-close`/`--nfs-toggle` for the others, which each Openable handles from the `command` event on itself. A Trigger that opens a Reveal would then work before hydration and inside `@defer (hydrate never)` with no JavaScript, and `CommandEvent.source` replaces the `trigger` argument. Custom commands need JavaScript on the target, and `command` is not a replayed event type, so the click listener stays until Angular replays it. An explicit `type="button"` (which `nfsButton` defaults) keeps commands working inside forms. Adoption needs consumer-supplied ids on the Openable, because the attribute must name an id that is identical on the server and the client. The `show-modal` mapping exposes no expanded state (HTML-AAM), which is what the `modal-dialog` role already renders, so the upgrade changes no announced state; the library keeps `aria-haspopup="dialog"` and `aria-controls` as author bindings.
- `popovertarget` and `command="toggle-popover"`: when Dropdown pane and Tooltip move onto `popover` with anchor positioning, their Triggers render `popovertarget` (or `commandfor`), the browser sets `aria-expanded` on the invoker, and the invoker becomes the popover's implicit anchor, which replaces `open(trigger)` anchoring and `registerTrigger`.
- `<form method="dialog">` is already in target and closes a Reveal's `<dialog>` without script. It skips the Reveal's exit animation and its `closePredicate`, and the Reveal re-syncs `isOpen` from the dialog's `close` event, reporting `returnValue` (the [Spec: Reveal](../issues/18-spec-reveal.md), D18); `nfsClose` remains the documented close button.

### Foundation behaviour changed or dropped

- `aria-haspopup="true"` on Dropdown triggers becomes nothing (disclosure) or `"dialog"`.
- A modal Reveal's Trigger keeps Foundation's shape: `aria-haspopup="dialog"` and `aria-controls`, no `aria-expanded`; Off-canvas Triggers keep Foundation's `aria-expanded` in every mode.
- `aria-expanded` on `data-close` triggers is dropped.
- Toggler's single-id-only `aria-expanded` updates become one aggregate value for every Trigger.
- Reveal's `tabindex="0"` stamping on anchors is dropped; Triggers are native buttons or links.
- `data-toggle-focus`'s double toggle and `data-closable`'s jQuery fade are replaced (D9, D10).
- Foundation's docs markup `<a data-toggle>` without `href` becomes `<button type="button">`.
