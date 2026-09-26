# Spec: Responsive Toggle

Ticket: [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md)

## Problem Statement

A site built on Foundation for Sites shows its main navigation as a `.top-bar` (or any menu) on wide screens and, below a breakpoint, hides it behind a `.title-bar` with a hamburger button. Foundation's ResponsiveToggle plugin does the switching in jQuery: it reads `data-responsive-toggle="<menu id>"` and `data-hide-for` (default `medium`), watches a window `resize`-driven breakpoint event, and writes inline `display` on the title bar and on the menu. The button gets no `aria-expanded`, no `aria-controls`, and no name. Before the JavaScript runs, both the title bar and the menu are visible, which Foundation's docs call a flash of unstyled content and leave to the developer to fix with hand-written `.no-js` CSS.

An Angular developer on the next library needs the same title-bar behaviour without jQuery, and it has to be correct in every rendering mode: server-rendered HTML that shows the right element at every viewport width before hydration, prerendered pages, incremental hydration, event replay for a hamburger tapped before the bundle arrives, and zoneless change detection. The button must follow the WAI-ARIA disclosure pattern and be named from the visible title. The optional Motion UI in and out animation must keep working without Motion UI's JavaScript, and must respect reduced motion. And the library must reuse Foundation's own CSS for the breakpoint switch rather than add styles of its own.

## Solution

Two attribute directives on the markup Foundation already documents:

- `[nfsResponsiveToggle]` on the `.title-bar`, taking a template reference to the menu (the typed counterpart of `data-responsive-toggle="<menu id>"`) and `hideFor` (default `medium`). It is the Openable: it holds the `isOpen` model, implements `open()`, `close()`, and `toggle()`, emits `opened` and `closed` when the change and its animation have finished, and provides `nfsOpenableToken`, so the bare `nfsToggle` on the hamburger button inside the bar toggles the menu with no reference at all.
- `[nfsResponsiveToggleMenu]` on the toggled element (`.top-bar`, a `nav`, any element), taking the optional `animate` Motion classes (`"nfs-hinge-in-from-top nfs-spin-out"`), exactly where Foundation's docs put `data-animate`.

The breakpoint switch is Foundation's CSS, not JavaScript. The title bar carries Foundation's `.hide-for-<hideFor>` class and the closed menu carries `.show-for-<hideFor>`, so from the very first byte of server HTML the bar shows and the menu hides below `hideFor`, and the bar hides and the menu shows at and above it. Opening removes `.show-for-<hideFor>` and adds the `.is-open` State class. The classes follow the `hideFor` input, never a breakpoint evaluation, so hydration changes nothing at any width and a `hydrate never` block still gives desktop visitors their navigation. The Breakpoint service is used only after the first render, to skip animations while the menu is shown anyway and to keep focus from being lost when a breakpoint crossing hides the element that holds it. There is no `hidden` attribute. The library CSS is one hit-area rule that brings Foundation's 20 by 16 px hamburger up to the WCAG 2.2 minimum target size of 24 by 24 px without changing how it looks, plus, only for a `hideFor` outside `$breakpoint-classes`, the two Visibility classes Foundation does not emit there. The pair meets WCAG 2.2 AA: every criterion the title bar touches is a requirement with a test, listed under Implementation Decisions.

## User Stories

1. As an application developer, I want to put `[nfsResponsiveToggle]="menu"` on Foundation's `.title-bar` markup, so that I keep Foundation's documented title-bar markup and classes.
2. As an application developer, I want the title bar to reference the menu with a typed template reference, so that a typo is a compile error instead of a silent `console.error` about a missing id.
3. As an application developer, I want the bare `nfsToggle` on the hamburger button inside the bar to toggle the menu, so that the button needs no reference, as Foundation's empty `data-toggle` did.
4. As an application developer, I want `hideFor` to default to `medium` and accept any breakpoint of the Breakpoint map, so that Foundation's `data-hide-for` carries over unchanged.
5. As a mobile visitor, I want only the title bar visible below `hideFor` and the menu hidden until I tap the button, so that the navigation does not fill my screen.
6. As a desktop visitor, I want the menu visible and the title bar hidden at and above `hideFor`, so that I see the full navigation without a toggle.
7. As a visitor on a server-rendered or prerendered page, I want the right element visible at my viewport width before any JavaScript runs, so that I never see both the title bar and the full menu at once.
8. As a visitor with JavaScript disabled or still loading, I want the desktop menu usable at desktop widths, so that navigation works before hydration.
9. As a mobile visitor who taps the hamburger before the page has hydrated, I want the menu to open once hydration finishes, so that my tap is not lost.
10. As a screen-reader user, I want the hamburger button announced with its visible title ("Menu") and its expanded or collapsed state, so that I know what it controls and whether the menu is open.
11. As a screen-reader user, I want the button to reference the menu it controls, so that assistive technology can relate the two.
12. As a keyboard user, I want Enter and Space on the hamburger to open and close the menu, and Tab to move into the open menu, so that I can navigate without a pointer.
13. As a keyboard user, I want focus to stay on the button when I open or close the menu, so that the disclosure behaves as the APG pattern describes.
14. As a keyboard user whose focused element is hidden by a breakpoint change or by the menu closing, I want focus moved to the equivalent control, so that focus is never dropped onto the page body.
15. As an application developer, I want `data-animate`'s in and out Motion classes as the `animate` input on the menu, so that Foundation's animated title-bar example carries over.
16. As an application developer, I want the library's `nfs-*` keyframe classes (`nfs-hinge-in-from-top`, `nfs-spin-out`) to animate the menu in and out, so that I get Motion UI's look without Motion UI's JavaScript.
17. As an application developer who copies Foundation's `hinge-in-from-top spin-out` names, I want a development-mode warning naming the `nfs-` replacement, so that I learn why Motion UI's transition classes do not animate.
18. As a visitor who asked for reduced motion, I want the menu to open and close without animation, so that the page respects my setting.
19. As an application developer, I want `opened` and `closed` emitted once the menu has finished animating, so that I can run code after the change, as Foundation's `toggled.zf.responsiveToggle` allowed.
20. As an application developer, I want `[(isOpen)]` two-way binding, so that I can open or close the menu from my own state and read it back.
21. As an application developer, I want a change I make through the binding to animate exactly like a button press, so that the menu behaves the same however it is opened.
22. As an application developer, I want `open()`, `close()`, and `toggle()` on the directive (`#titleBar="nfsResponsiveToggle"`), so that I can control the menu from code.
23. As a single-page-application developer, I want a link inside the menu with `[nfsClose]="titleBar"` to close the menu when the visitor navigates, so that the mobile menu does not stay open over the new route.
24. As an application developer, I want the menu to be any element, so that Foundation's "any element will work" still holds.
25. As an application developer, I want the menu's `id` taken from my markup or generated when I omit it, so that `aria-controls` is always valid.
26. As an application developer using `hideFor="xlarge"`, I want one documented Sass include that emits only the two visibility classes I need, so that I do not have to add `xlarge` to `$breakpoint-classes` and inflate every other Foundation component's CSS.
27. As an application developer who forgot a needed visibility class, I want a development-mode warning naming the fix, so that a title bar that never hides is caught early.
28. As an application developer, I want application-wide defaults for `hideFor` and `animate` through a Defaults token, so that I set them once for every title bar.
29. As an application developer, I want a development-mode warning when I write `.show-for-<bp>` or `.hide-for-<bp>` by hand on the bar or the menu, so that Foundation's FOUC recipe does not fight the directives.
30. As an application developer using incremental hydration, I want to wrap the whole title bar and menu in one `@defer (hydrate on ...)` block, so that a tap hydrates and replays correctly.
31. As an application developer rendering `@defer (hydrate never)` content, I want to know that desktop visitors keep a working menu and mobile visitors get no toggle, so that I choose the block deliberately.
32. As a zoneless application developer, I want every state change to be a signal write, so that the directives need no `NgZone` or `markForCheck`.
33. As an application developer, I want `hideFor` changes at runtime to move the classes, so that a configurable layout works.
34. As a tester, I want story ids `responsive-toggle--<story>` shared by play functions and Playwright, so that every layer tests the same artifact.
35. As a library maintainer, I want the directives to declare no styles, so that the consumer's Foundation settings are the only source of CSS.
36. As a printing visitor, I want the printout to show the menu rather than the title bar, as Foundation's visibility classes already do, so that the navigation appears on paper as on a wide screen.
37. As a touch or tremor-affected pointer user, I want the hamburger to accept presses across at least 24 by 24 CSS px, so that I can hit it reliably (WCAG 2.2 success criterion 2.5.8).
38. As a low-vision visitor, I want the hamburger bars and the title text to contrast with the title bar at WCAG AA ratios, and a compile-time warning when a theme breaks that, so that a custom colour scheme cannot silently make the control invisible (1.4.11, 1.4.3).
39. As a visitor zoomed to 400 percent or on a 320 px wide screen, I want the title bar and the open menu to fit without horizontal scrolling, so that I can use the navigation at any zoom (1.4.10).
40. As a keyboard user, I want a visible focus indicator on the hamburger and on every menu item, never hidden behind the title bar, so that I always see where I am (2.4.7, 2.4.11).

## Implementation Decisions

### Foundation contract

From Foundation 6.9's plugin source and docs (the Foundation plugin inventory B, section 5):

- Markup: `div.title-bar[data-responsive-toggle="<menu id>"][data-hide-for="medium"] > button.menu-icon[data-toggle="<menu id>" | data-toggle] + div.title-bar-title`, and the target `#<menu id>`, usually a `.top-bar`. "You don't even need to use Menu! Any element will work."
- Options (`ResponsiveToggle.defaults`), merged from the bar's `data-*` and then from the target's `data-*`:

| Option | Type | Default | Library |
| --- | --- | --- | --- |
| `hideFor` (`data-hide-for`) | breakpoint name | `'medium'` | `hideFor` input on `nfsResponsiveToggle` |
| `animate` (`data-animate`) | `false` or `"<in> <out>"` | `false` | `animate` input on `nfsResponsiveToggleMenu`, default `''` |

- Events: `toggled.zf.responsiveToggle` on the bar after every toggle, after the Motion UI animation when `animate` is set; `mutateme.zf.trigger` on `[data-mutate]` descendants of the target after it shows; `init`/`destroyed` from the base class.
- Methods: `toggleMenu()` (a no-op at or above `hideFor`), `destroy()`.
- Behaviour: `_update()` on every breakpoint change shows the bar and hides the target below `hideFor`, hides the bar and shows the target at and above it (inline `display`); the toggler is every `[data-toggle]` in the bar whose value is the target id or empty; no ARIA at all.
- Dropped options and behaviour: reading options from the target element (each input has one home); `toggleMenu()`'s no-op at and above `hideFor` (the desktop menu is shown by CSS whatever the state, so the guard protects nothing); the reset to hidden on every breakpoint change (see Design decisions, OPEN FOR HUMAN in the ticket); `mutateme.zf.trigger` (Equalizer, Sticky, and Drilldown in the next library re-measure through `ResizeObserver`, which fires when a hidden element becomes rendered); `init`/`destroyed` events (Angular lifecycle).

### CSS class to Angular mapping

| Foundation class or attribute | Angular | Rationale |
| --- | --- | --- |
| `.title-bar[data-responsive-toggle]` | `[nfsResponsiveToggle]` directive on the consumer's element | ResponsiveToggle has no structural class of its own, so the plugin name names the directive (building-blocks 1.3); the consumer writes `.title-bar`, the directive does not add it, so a custom bar works too |
| `data-hide-for` | `hideFor` input | Option name in camelCase |
| `.hide-for-<hideFor>` on the bar | Host class binding on `nfsResponsiveToggle`, always present | Foundation's Visibility class does the breakpoint switch (Foundation's "Preventing FOUC" effect, with Foundation's own classes) |
| `#<menu id>` target | `[nfsResponsiveToggleMenu]` directive on the consumer's element | Needs its own host bindings (classes, `id`, `inert`) so server HTML is right |
| `data-animate` | `animate` input on the menu directive | Where Foundation's docs put it |
| `.show-for-<hideFor>` on the menu | Host class binding, present while the menu is closed and not animating out | Foundation's Visibility class hides the closed menu below `hideFor` and leaves it shown above |
| `.is-open` | State class host binding on the menu while `isOpen` | Foundation's State class vocabulary; no Foundation rule styles `.is-open` on a menu (only `.dropdown-pane` and `.off-canvas` use it), so it is a hook for consumer CSS and for tests and changes nothing visually |
| Motion classes | Host class binding on the menu during the enter or exit animation only | Building-blocks 1.6 rule 1 (State class plus keyframes on a persistent element) |
| `button.menu-icon[data-toggle]` | `nfsToggle` from the Triggers utility | The Trigger renders `aria-expanded` and `aria-controls`; no ResponsiveToggle code on the button |
| `.title-bar-title` | No directive; the consumer gives it an `id` and the button `aria-labelledby` | Static markup names the button; a directive would only copy an id |
| `.title-bar-left`, `.title-bar-right`, `.menu-icon` | None | Styling only |

### Hierarchy and DI shape

```
div.title-bar [nfsResponsiveToggle]="menu"     provides nfsOpenableToken (useExisting), exportAs nfsResponsiveToggle
  button.menu-icon nfsToggle                   bare Trigger -> Nearest Openable = the title bar
  div.title-bar-title#title
nav.top-bar [nfsResponsiveToggleMenu]          exportAs nfsResponsiveToggleMenu; linked from the bar by template reference
  ... [nfsClose]="titleBar" on links (optional)
```

- The title bar is the Openable, so the bare `nfsToggle` inside it resolves it through `inject(nfsOpenableToken, {optional: true, skipSelf: true})` (Triggers spec, ADR 0013). Its `id` signal is the menu's id, which `aria-controls` names.
- The bar links to the menu by typed template reference (`[nfsResponsiveToggle]="menu"` with `#menu="nfsResponsiveToggleMenu"`), the counterpart of `data-responsive-toggle="<id>"`; template references are hoisted within a template, so the menu may follow the bar as it does in Foundation's markup.
- Reverse link: the bar registers itself with the menu from an `effect` whose cleanup unregisters, the Aria reverse-link shape the Triggers spec uses for `registerTrigger`. It writes no DOM, so it runs safely on the server. View effects run in `refreshView` after the template's input bindings and before host bindings of the same view (Angular's change detection source), and embedded and child views refresh after that, so the menu's host bindings see the bar in the first pass whenever the bar sits in the same view as the menu, in an enclosing view, or in an embedded view of it. Only a bar inside a child component with the menu in the parent renders the menu once without the bar; the synchronisation loop re-renders before the tick ends. The registration method is internal (excluded from the documented API).
- No plugin token of its own: nothing injects the title bar by class; `nfsOpenableToken` serves descendants and `exportAs` serves templates.
- Defaults token, Shape B (building-blocks 1.4): `nfsResponsiveToggleDefaultsToken` with the all-optional `NfsResponsiveToggleDefaults` (`hideFor`, `animate`), read with `inject(token, {optional: true})` to seed the input defaults; provided at bootstrap, route, or element level, nearest wins.
- Injected: `NfsMediaQuery` (Breakpoint service), `nfsAnimationsToken` (building-blocks 1.6 rule 5), CDK `_IdGenerator` (menu id), CDK `InteractivityChecker` (focus target in the menu), `DOCUMENT`, `NgZone` (fallback timer outside the zone), `HostAttributeToken('id')` and `HostAttributeToken('class')` (static id, and the dev check for hand-written visibility classes).
- Entry point: `ngx-foundation-sites/responsive-toggle`, holding both directives, the Defaults token, and the types; it imports `nfsOpenableToken` from the Triggers entry point and `NfsMediaQuery` from the media-query entry point.

### API

```ts
class NfsResponsiveToggle implements NfsOpenable {  // selector [nfsResponsiveToggle], exportAs 'nfsResponsiveToggle'
  readonly menu: InputSignal<NfsResponsiveToggleMenu>;   // alias 'nfsResponsiveToggle', required
  readonly hideFor: InputSignal<NfsBreakpointName>;      // default: Defaults token, else 'medium'
  readonly isOpen: ModelSignal<boolean>;                 // default false; isOpenChange generated
  readonly opened: OutputEmitterRef<void>;               // Completion output
  readonly closed: OutputEmitterRef<void>;               // Completion output
  readonly id: Signal<string>;                           // the menu's id (for aria-controls)
  readonly triggerRole: Signal<'disclosure'>;
  open(trigger?: HTMLElement): void;
  close(result?: unknown): void;                         // result ignored
  toggle(trigger?: HTMLElement): void;
  registerTrigger(trigger: HTMLElement): () => void;
}

class NfsResponsiveToggleMenu {  // selector [nfsResponsiveToggleMenu], exportAs 'nfsResponsiveToggleMenu'
  readonly animate: InputSignal<string>;  // "<in> [<out>]"; default: Defaults token, else ''
  readonly id: Signal<string>;            // static id attribute, else generated 'nfs-responsive-toggle-menu-...'
}

interface NfsResponsiveToggleDefaults {
  hideFor?: NfsBreakpointName;
  animate?: string;
}
const nfsResponsiveToggleDefaultsToken: InjectionToken<NfsResponsiveToggleDefaults>;
```

| Member | Foundation | Behaviour and deltas |
| --- | --- | --- |
| `menu` (`[nfsResponsiveToggle]`) | `data-responsive-toggle="<id>"` | Required typed reference; under strict templates a reference to the element instead of the directive fails compilation |
| `hideFor` | `data-hide-for`, default `'medium'` | Selects the Visibility classes and the Breakpoint service query; a runtime change moves the classes. The Zero breakpoint is meaningless (the bar would never show) and warns in development mode; an unknown name gets the Breakpoint service's unknown-name warning |
| `isOpen` | the target's `:hidden` state | `model(false)`. `true` from the moment an open is requested. It persists across breakpoint crossings (Foundation reset it to hidden on every breakpoint change) and may be `true` at or above `hideFor`, where the menu is shown either way |
| `isOpenChange` | none | Generated by the model; emitted for every write from inside (methods, Triggers), at request time |
| `opened` / `closed` | `toggled.zf.responsiveToggle` | Emitted when the change is committed and its animation has ended (or at once when no animation applies); a change interrupted by the opposite request emits nothing for the interrupted direction |
| `open(trigger?)` | `toggleMenu()` when hidden | Sets `isOpen` to `true`; records `trigger` as the focus-return target. Works at every width |
| `close(result?)` | `toggleMenu()` when shown | Sets `isOpen` to `false`; no veto, `result` is ignored |
| `toggle(trigger?)` | `toggleMenu()` | `isOpen() ? close() : open(trigger)` |
| `registerTrigger` | the `[data-toggle]` filter | Records Triggers so focus can return to the first one when no `trigger` was passed to `open()` |
| `id` | the target id | The menu's `id` signal |
| `triggerRole` | none | Always `disclosure` |
| `animate` (menu) | `data-animate`, on either element | One home, the menu. First whitespace-separated token is the enter class, second the exit class; a missing token means that direction does not animate. Only keyframe-animation class names animate (the [Prototype: `animate.enter` and `animate.leave` with Motion UI transition classes](../issues/47-prototype-motion-ui-animate-enter.md)); a recognised Motion UI transition class name (`hinge-in-from-top`, `spin-out`, `slide-in-down`, and the rest of Motion UI's transition set) warns once in development mode, names the `nfs-` class when `nfs-motion` has one, and is applied unchanged |
| `id` (menu) | the element id | A static `id` attribute wins; otherwise `_IdGenerator` with the prefix `nfs-responsive-toggle-menu-`. Consumers set `id` statically, because a bound `[id]` would collide with the host binding |

State model, all signals (no `effect` propagates state):

- `isOpen`: the model.
- `#live`: `false` until the bar's first `afterNextRender`; never set on the server.
- `#phase`: a `linkedSignal` of `isOpen` whose computation returns `'idle'` for the first value and whenever `#live` (read untracked) is still `false`, else `'entering'` when `isOpen` became `true` and `'exiting'` when it became `false`; completion writes `'idle'`. This makes a change through `[(isOpen)]`, a Trigger, or a method animate the same way, and keeps the initial state and every change made before the first render (server included) instant.
- `#transition`: `computed`, equal to `#phase` unless the animation is skipped, then `'idle'`. Skipped when: not live; no class for that direction; `NfsMediaQuery.reducedMotion()`; `nfsAnimationsToken.disabled`; or `NfsMediaQuery.atLeast(hideFor)` (the menu is shown throughout, so there is nothing to animate).
- Menu host classes: `show-for-<hideFor>` when `!isOpen() && #transition() !== 'exiting'`; `is-open` when `isOpen()`; the enter class when `#transition() === 'entering'`; the exit class when `#transition() === 'exiting'`. `inert` while `#transition() === 'exiting'`.
- Bar host class: `hide-for-<hideFor>`, always.

| State | `isOpen` | Menu classes | `inert` | Below `hideFor` | At or above |
| --- | --- | --- | --- | --- | --- |
| Closed | `false` | `show-for-<bp>` | no | menu hidden | menu shown |
| Entering | `true` | `is-open` plus enter class | no | menu animating in | not reached (skipped) |
| Open | `true` | `is-open` | no | menu shown | menu shown |
| Exiting | `false` | exit class | yes | menu animating out, not operable | not reached (skipped) |

Development-mode checks (each warns once per instance, in render callbacks that exist only when `ngDevMode` is on, never on the server):

1. A static `class` attribute on the bar or the menu contains a `show-for-*` or `hide-for-*` class for the `hideFor` breakpoint (Foundation's FOUC recipe written by hand fights the bindings).
2. `hideFor` is the Zero breakpoint.
3. The menu has no registered title bar after the first render, or a second title bar registers with a menu that already has one.
4. `animate` contains a recognised Motion UI transition class name.
5. Missing Visibility class: after the first render, below `hideFor` with the menu closed, the menu's computed `display` is not `none`; or at and above `hideFor`, the bar's is not `none`. The message names both fixes: include `foundation-visibility-classes`, and for a `hideFor` outside `$breakpoint-classes`, `@include nfs-responsive-toggle(<bp>)` or add the breakpoint to `$breakpoint-classes`.

### Implementation level and primitives

Implementation level: native platform CSS through Foundation's own Visibility classes (`.hide-for-<bp>`, `.show-for-<bp>`) for the breakpoint switch and first paint, CSS keyframes for the animation, `inert` for the exiting menu; custom Angular directives for the state, the Openable contract, and the class bindings. `@angular/aria` 22.2 has no disclosure directive (the Aria inventory: eight patterns, none a disclosure). `@angular/cdk` supplies only small pieces: `_IdGenerator` and `InteractivityChecker`; `BreakpointObserver` is not used (the Breakpoint service wraps `MediaMatcher`). The Breakpoint service decides no first-paint state: `atLeast(hideFor)` is read only by the animation skip and the focus rule, both after the first render.

Not a Toggler variant with a breakpoint input: the title bar must provide the Openable so the bare `nfsToggle` inside it works, the bar itself needs a breakpoint class, and Toggler hides its target with `hidden`, which would hide the desktop menu in server HTML (audit 0002 H4; building-blocks 1.11 decision 8).

Primitives: `input()`, `input.required()`, `model()`, `output()`, `computed()`, `linkedSignal()`, one `effect()` for the reverse link, `afterNextRender` (the live flag), `afterRenderEffect` (fallback timer and completion, focus rule, development checks), host bindings (`[class]` with an object map, `[attr.id]`, `[attr.inert]`), one `(animationend)` host listener on the menu (filtered by `event.target === host`), `setTimeout` outside the zone.

Completion: on `animationend` of the menu itself, or when the fallback timer fires. The timer is 1100 ms, the building-blocks ceiling for library animations (1.6 rule 6: none exceeds 1 s) plus 100 ms. It is a design-time value, not a measured one, because it must complete precisely when the stylesheet that would supply the duration is missing (the Motion UI prototype); a consumer keyframe class longer than 1 s is cut at 1.1 s, which is documented. The timer starts in the `afterRenderEffect` that sees a non-idle phase, outside the Angular zone, and is cleared by that effect's cleanup when the phase changes. When `#phase` is non-idle but `#transition` is idle (skipped), the same effect completes at once; the signal write re-renders before the tick ends.

Focus rule (building-blocks 1.10 focus persistence; the Breakpoint service spec's consumer rule), one `afterRenderEffect` that records its first values and acts only on later changes:

- When the menu stops being operable (it starts exiting, or a crossing below `hideFor` hides a closed menu) while it contains `document.activeElement`, focus moves to the `trigger` passed to the last `open()`, else to the first registered Trigger.
- When a crossing to `hideFor` or above hides the bar while it contains `document.activeElement`, focus moves to the first tabbable element in the menu (DOM order, `InteractivityChecker.isTabbable`), else stays.
- Nothing moves when focus is elsewhere. The first-render handoff never moves focus.

Fallback: none needed. Every mechanism is Baseline widely available on 2026-05-07 (`inert`, `animationend`, `matchMedia` change events, CSS keyframes) or a Foundation class, and the animation path is confirmed by the Motion UI prototype.

### Comparison with Angular Material

Angular Material has no counterpart. The nearest thing is the consumer-side recipe in Material's navigation schematic: `BreakpointObserver.observe(Breakpoints.Handset)` into `toSignal`, then `[mode]` and `[opened]` on a `mat-sidenav`. That recipe decides visibility in JavaScript, so its server HTML is right at one width only, which is what this spec avoids. Borrowed through the Openable contract: the `isOpen` model (Material's `opened` state, renamed per building-blocks 1.3), `open()`/`close()`/`toggle()`, and Completion outputs after the animation (`MatDrawer`'s `openedChange` timing). Not borrowed: `BreakpointObserver`, Material's `Breakpoints` constants, promise-returning methods.

### ARIA and keyboard

Pattern: WAI-ARIA APG Disclosure, in the shape of the mobile navigation button of the APG disclosure-navigation example.

| Element | Role | Attributes | Who renders them |
| --- | --- | --- | --- |
| Hamburger `button.menu-icon` | native `button` | `type="button"`; `aria-expanded` from `isOpen`; `aria-controls` = the menu id | Consumer (`type`, or `nfsButton`); `nfsToggle` (the disclosure Trigger role) |
| Hamburger name | | `aria-labelledby` pointing at the `.title-bar-title` element's `id` (visible text beats `aria-label`); alternative: a `.show-for-sr` span inside the button | Consumer markup |
| `.title-bar-title` | none | a static `id` | Consumer markup |
| Title bar | none | none | nothing |
| Menu | the consumer's element; a `nav` landmark is recommended, named with `aria-label` or `aria-labelledby` | `inert` only while animating out | `nfsResponsiveToggleMenu` |

- Hidden means `display: none` from Foundation's Visibility class, which removes the menu from the accessibility tree and the tab order; no `hidden`, no `aria-hidden`, and no `inert` on a closed menu, because the same element is the visible desktop menu (building-blocks 1.10 and 1.11 decision 8).
- At and above `hideFor` the bar and its button are `display: none`, so the disclosure state is simply absent; `aria-expanded` may still read `true` on the hidden button (the model persists), which no user agent exposes.
- Generated ids differ between server and client and are rewritten at hydration, since both `id` and `aria-controls` are bindings (building-blocks 1.5); the `.title-bar-title` id is the consumer's static one.

| Key | Where | Behaviour |
| --- | --- | --- |
| Tab / Shift+Tab | page | Reaches the hamburger below `hideFor`; moves into the open menu next when the menu follows the bar in the DOM (recommended markup order); at and above `hideFor` the button is not rendered and the menu is in the tab order |
| Enter, Space | hamburger | Toggles the menu (native button activation, `click`) |
| Escape | | Nothing: the title-bar menu is in the page flow, not an overlay (building-blocks 1.10 reserves Escape for overlays; Foundation has none; the APG disclosure pattern requires none). A consumer who styles the menu as an overlay adds `(keydown.escape)="titleBar.close()"` |

Focus stays on the button when it opens or closes the menu; the focus rule above covers the cases where the focused element disappears.

### WCAG 2.2 AA requirements

The target is WCAG 2.2 level AA (user rule). Each criterion below is a requirement with the test that proves it; none is advice.

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 4.1.2 Name, Role, Value | The hamburger is a native `button` named from the visible title through `aria-labelledby` (or a `.show-for-sr` span), with `aria-expanded` and `aria-controls` from the Trigger; the name matches the visible label (2.5.3) | Fails: no name, no state, no relationship | axe `button-name` and ARIA rules in every story; SSR smoke asserts the attributes |
| 2.5.8 Target Size (Minimum) | The hamburger accepts presses across at least 24 by 24 CSS px. The `nfs-responsive-toggle` mixin adds a transparent, centred 24 by 24 px `::before` hit area to `.title-bar .menu-icon` (Foundation's hamburger draws its bars with `::after` only and is `position: relative`), so the look is unchanged | Fails the size test: `foundation-menu-icon` calls `hamburger()` with its fixed 20 by 16 px and has no size setting; it passes only through the spacing exception, and only while no other target sits within 24 px, which a `.title-bar-right` button breaks | e2e: `elementFromPoint` 2 px outside the icon's left and right edges and 4 px outside its top and bottom edges returns the button, in three engines; axe `target-size` (in the WCAG 2.2 AA set) in every story |
| 1.4.11 Non-text Contrast | The hamburger bars and their hover colour contrast at least 3:1 with the title bar: `$titlebar-icon-color` and `$titlebar-icon-color-hover` against `$titlebar-background` | Passes: `#fefefe` on `#0a0a0a` is about 19.6:1, the `#cacaca` hover about 12:1; `.menu-icon.dark` (`#0a0a0a`, hover `#8a8a8a`) on a white page about 19.6:1 and 3.4:1 | The `nfs-responsive-toggle` mixin emits `@warn` through Foundation's `color-contrast()` when either ratio is under 3; node-level Sass test with a failing theme |
| 1.4.3 Contrast (Minimum) | The title text contrasts at least 4.5:1: `$titlebar-color` against `$titlebar-background` | Passes (about 19.6:1) | Same `@warn` and Sass test (threshold 4.5); axe `color-contrast` in every story |
| 2.4.7 Focus Visible | The hamburger and menu items show the user agent's focus indicator; the library removes no outline. Foundation's global button reset removes the outline only under `[data-whatinput='mouse']`, which requires the what-input script the next library never loads, and then only for mouse input | Passes | e2e: after Tab to the hamburger, a screenshot comparison shows a focus indicator in three engines |
| 2.4.11 Focus Not Obscured (Minimum) | No focused element is hidden by author content: the title-bar menu is in the page flow, the closed menu is `display: none` and the exiting menu `inert`, so neither can hold focus, and the focus rule moves focus out of anything that gets hidden. A consumer who makes the title bar sticky (Foundation's Sticky or `position: sticky`) must set `scroll-padding-top` to the bar's height so focused menu items scroll clear of it; the docs state this as a requirement of that layout | Passes in Foundation's in-flow layout | e2e: tabbing through every item of the open menu in a story with a sticky title bar and `scroll-padding-top`, each focused item's rectangle is not covered by the bar |
| 1.4.10 Reflow | At 320 CSS px (400 percent zoom) the page never scrolls horizontally. The title bar is flex (`$global-flexbox`) and fits; the menu below `hideFor` must stack, so the menus inside it use Foundation's `vertical <hideFor>-horizontal` classes or a ResponsiveMenu, and Foundation's `.top-bar` stacks below `$topbar-unstack-breakpoint`, which the consumer keeps at or above `hideFor` | Passes with stacked menus; Foundation's docs example puts a horizontal `.dropdown.menu` in the top bar, which overflows at 320 px, so the spec's markup uses `vertical medium-horizontal` | e2e at 320 by 640 px with the menu open: `document.documentElement.scrollWidth <= 320` |
| 2.1.1 Keyboard, 2.4.3 Focus Order | Native button activation; the menu follows the bar in the DOM, so Tab from the hamburger enters the open menu | Passes for the button; Foundation's markup already orders bar then menu | Story `responsive-toggle--below-breakpoint`; e2e real keys |
| 2.3.3 (AAA, not required) and reduced motion | Not a WCAG 2.2 AA criterion; honoured anyway (Animation) | Motion UI's JavaScript ignores it | Browser-level and e2e reduced-motion cases |

The axe gate in every story runs the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) with `parameters.a11y.test = 'error'` (building-blocks 1.10).

### Rendered HTML

Consumer markup (Foundation's docs example with the deltas: typed references, `aria-labelledby`, a `nav` target):

```html
<div class="title-bar" [nfsResponsiveToggle]="menu" #titleBar="nfsResponsiveToggle" hideFor="medium">
  <button class="menu-icon" type="button" nfsToggle aria-labelledby="site-menu-title"></button>
  <div class="title-bar-title" id="site-menu-title">Menu</div>
</div>

<nav class="top-bar" id="site-menu" nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu"
     animate="nfs-hinge-in-from-top nfs-spin-out" aria-label="Main">
  <div class="top-bar-left">...</div>
</nav>
```

Server HTML and first paint, closed (identical at every viewport width; hydration annotations omitted):

```html
<div class="title-bar hide-for-medium" hidefor="medium">
  <button class="menu-icon" type="button" aria-labelledby="site-menu-title"
          aria-expanded="false" aria-controls="site-menu" jsaction="click:;"></button>
  <div class="title-bar-title" id="site-menu-title">Menu</div>
</div>
<nav class="top-bar show-for-medium" id="site-menu" nfsresponsivetogglemenu
     animate="nfs-hinge-in-from-top nfs-spin-out" aria-label="Main">...</nav>
```

Below `medium` Foundation's `.show-for-medium` (`display: none !important` up to 0.2 px under 40em) hides the menu and the bar shows; at and above `medium`, `.hide-for-medium` hides the bar and the menu shows. The static `hidefor` and `animate` attributes are rendered because static attributes always are; they have no effect in CSS. The menu has no `jsaction` (`animationend` is not a replayable event type).

Server HTML, open by the consumer's initial `[(isOpen)]="true"`: the button reads `aria-expanded="true"`; the menu reads `class="top-bar is-open"` (no Motion class: the initial state never animates).

Hydrated, small viewport, after a tap (with `animate`):

```html
<!-- entering -->
<nav class="top-bar is-open nfs-hinge-in-from-top" id="site-menu" ...>
<!-- open -->
<nav class="top-bar is-open" id="site-menu" ...>
<!-- exiting -->
<nav class="top-bar nfs-spin-out" id="site-menu" inert ...>
<!-- closed again -->
<nav class="top-bar show-for-medium" id="site-menu" ...>
```

The button's `aria-expanded` flips at request time (`true` from entering on, `false` from exiting on). Hydrated, large viewport: the same classes as the server's; a programmatic `open()` there goes straight to the open state (animation skipped) and the page looks unchanged.

### Animation

- Mechanism: building-blocks 1.6 rule 1 and ADR 0003. The menu is persistent (never inserted or removed), so `animate.enter`/`animate.leave` do not apply; the Motion classes are bound as classes on the in-DOM menu only for the duration of the enter or exit phase.
- Enter: removing `.show-for-<bp>` and adding the enter class in one render makes the menu rendered with the keyframe animation, which starts when it becomes rendered. Exit: the exit class plays while the menu is still rendered (and `inert`); on completion one render removes the exit class and restores `.show-for-<bp>`, and Foundation's Visibility class hides the menu below `hideFor`. The `nfs-motion` classes use `animation-fill-mode: both`, so the final exit frame holds until that render and nothing flashes.
- Classes: none by default (Foundation's `animate: false`). With Foundation's docs example, `nfs-hinge-in-from-top` and `nfs-spin-out` from the `nfs-motion` mixin; any consumer keyframe class works.
- Completion: `animationend` on the menu itself, else the 1100 ms fallback timer; then `opened` or `closed`.
- Interruption: an opposite request mid-animation swaps the class (the new animation starts from its first frame) and restarts the timer; the interrupted direction emits no Completion output.
- Reduced motion: when `NfsMediaQuery.reducedMotion()` is `true`, no Motion class is bound and the change completes in the same tick; the `nfs-motion` mixin's own 1 ms override stays as the backstop for its classes. Binding nothing (rather than relying on the 1 ms override) also covers consumer classes that carry no reduced-motion rule.
- Tests: `nfsAnimationsToken` with `{disabled: true}` skips every Motion class; some test environments emit no animation events, which the fallback timer also covers.
- Rendering modes: nothing animates before the first client render (`#live`), so no Motion class is ever in server HTML and hydration plays nothing (the [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md) found that server-rendered elements must animate through signal-gated State classes).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: every visible state is a host binding on signals that exist on the server: the bar's `.hide-for-<hideFor>`, the menu's `.show-for-<hideFor>` or `.is-open`, the menu `id`, and the Trigger's ARIA (rule 1). The breakpoint switch is Foundation's CSS media queries, so the server HTML is correct at every width without knowing the viewport (rule 9); the Server breakpoint plays no part.
- Before hydration: the directives read no `window`, no `matchMedia`, no computed style, and start no timer outside render callbacks (rules 3 to 5). The reverse-link `effect` runs on the server and writes only a signal.
- First-render handoff (ADR 0014): when the client breakpoint is at or above `hideFor`, nothing re-renders and no class changes, because no binding reads the breakpoint. The live values reach only the animation skip and the focus rule, and the focus rule's first run records values without acting. [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md) therefore does not affect this spec's first paint.
- Full hydration: host binding values equal the server's apart from generated ids, so hydration changes nothing visible and there is no structure to mismatch (rule 10).
- Event replay: the only replayable listener is the Trigger's `click` host listener on the hamburger (`jsaction="click:;"`). A tap before hydration is queued and replayed after hydration; `afterNextRender` runs before replay, so `#live` is already `true` and the replayed toggle animates. The handler belongs to the Triggers utility and calls no `preventDefault()`. The menu's `(animationend)` does not replay, which is correct: nothing animates before hydration.
- Hydration boundary: the title bar, its Triggers, and the menu belong to one hydration boundary; a consumer `@defer (hydrate on ...)` wraps all of them (rule 7). Template-reference scoping stops a bar outside a block from naming a menu inside it.
- `@defer`: library templates contain no `@defer`; the entry point is its own, so a consumer can defer it. Inside a dehydrated block the pair is its server HTML: correct visibility at every width, and a tap on the hamburger hydrates the block and replays. Inside `@defer (hydrate never)` the desktop menu stays usable at and above `hideFor` (its links are native), while below `hideFor` the menu stays hidden and the hamburger does nothing; the spec documents that residue. Plain `@defer` renders on the client with the live breakpoint and no animation for the initial state.
- Incremental hydration triggers: `hydrate on interaction` annotates the block's root nodes with `click`, so a tap on the bar hydrates and replays; `hydrate on viewport` suits a title bar below the fold.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: every change is a signal write (model, `linkedSignal`, the live flag); the fallback timer runs outside the zone and its expiry is a signal write, which schedules change detection in zoneless and hybrid zone applications alike.
- Print: Foundation's `.show-for-<bp>` query is `screen` only and `.hide-for-<bp>` includes `print` for breakpoints up to `$print-breakpoint`, so a printout shows the menu and hides the bar, as Foundation's own classes do.

### Sass and custom CSS

The breakpoint switch needs no CSS for `hideFor` values in `$breakpoint-classes` (Foundation's default `small medium large`): Foundation's `foundation-visibility-classes` already emits `.hide-for-<bp>` and `.show-for-<bp>`. The `nfs-responsive-toggle` Library mixin emits, by default, one rule: the 24 by 24 px hit area on `.title-bar .menu-icon` (WCAG 2.2 success criterion 2.5.8, because Foundation's hamburger is a fixed 20 by 16 px with no size setting), plus compile-time contrast warnings that emit no CSS. For a `hideFor` outside `$breakpoint-classes` (`xlarge`, `xxlarge`, or a custom breakpoint), the consumer names the breakpoint and the mixin also emits exactly those two Visibility classes through Foundation's `hide-for()` and `show-for()` mixins. Details in the Sass subsection of Further Notes. No directive declares `styles` or `styleUrl`.

## Testing Decisions

A good test asserts what a visitor or assistive technology observes: which of bar and menu is displayed at a width, `aria-expanded` and `aria-controls` on the button, the menu's State and Motion classes and `inert`, where focus lands, and when `opened` and `closed` fire. No test reads private fields. There is no prior art in the new repository; the patterns are the building-blocks testing rule, the Triggers and Breakpoint service specs, and the harness of the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).

Story ids follow `responsive-toggle--<story>`: `responsive-toggle--default` (Foundation's docs markup, `hideFor="medium"`), `responsive-toggle--below-breakpoint` (`hideFor="xxlarge"`, so the toggle is active at every test viewport up to 1440 px; the Storybook stylesheet includes `@include nfs-responsive-toggle(xlarge xxlarge);`, which the story also documents), `responsive-toggle--animated` (`hideFor="xxlarge"`, `animate="nfs-hinge-in-from-top nfs-spin-out"`), `responsive-toggle--two-way-binding`, `responsive-toggle--close-on-navigate`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe with `parameters.a11y.test = 'error'` and the WCAG 2.2 AA rule set (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, which include `target-size`, `button-name`, and `color-contrast`). Every story's menu markup stacks below `hideFor` (1.4.10). Play functions assert classes and ARIA, which do not depend on the viewport, and assert computed visibility only in the stories whose `hideFor` is `xxlarge`.

- `responsive-toggle--default`: the bar carries `hide-for-medium`, the menu `show-for-medium`; the button has `aria-expanded="false"`, `aria-controls` equal to the menu id, and the accessible name "Menu"; a click sets `aria-expanded="true"`, removes `show-for-medium`, adds `is-open`; a second click restores both.
- `responsive-toggle--below-breakpoint`: the bar is displayed and the menu is not; a click displays the menu and focus stays on the button; Enter and Space through `userEvent.keyboard` toggle it; Tab from the button reaches the first menu link.
- `responsive-toggle--animated`: after a click the menu carries `is-open nfs-hinge-in-from-top`, then only `is-open` once `opened` has fired (the story logs it); after a second click it carries `nfs-spin-out` and `inert`, then `show-for-xxlarge` once `closed` has fired, and is not displayed.
- `responsive-toggle--two-way-binding`: an external checkbox bound to `[(isOpen)]` opens and closes the menu with the same classes and animation as the button, and a button click updates the checkbox.
- `responsive-toggle--close-on-navigate`: a menu link with `[nfsClose]="titleBar"` closes the menu, and focus moves to the hamburger.

### 2. Browser-level test (stack per the [browser testing stack decision](../issues/41-browser-testing-stack-decision.md); stack-neutral)

`MediaMatcher` is replaced with a controllable fake (the Breakpoint service spec's seam) so tests move across `hideFor` and toggle reduced motion.

- Phase model: the initial state never animates; `[(isOpen)]` writes, Trigger clicks, and method calls produce the same class sequence; an opposite request mid-animation swaps the Motion class, restarts the timer, and emits only the final direction's Completion output.
- Completion: `animationend` from the menu completes; an `animationend` bubbling from a descendant does not; with `animation: none` forced on the Motion class, the fallback timer completes at about 1100 ms.
- Skips: reduced motion on, `nfsAnimationsToken` `{disabled: true}`, an empty or one-token `animate`, and a viewport at or above `hideFor` each bind no Motion class and emit `opened`/`closed` in the same tick; with a fake viewport at or above `hideFor`, `open()` sets `isOpen` and `is-open` but binds no `inert`.
- Persistence: open below `hideFor`, cross above and back; the menu is still open and `isOpen` never changed.
- Focus rule: focus inside the menu when it starts exiting moves to the `trigger` given to `open()`, else to the first registered Trigger; focus inside a closed menu when the fake viewport crosses below `hideFor` moves to the hamburger; focus on the hamburger when it crosses above moves to the first tabbable menu element; focus elsewhere never moves; the first render never moves focus.
- Reverse link: the menu's classes are present in the first rendered pass with the bar before, after, and around the menu (`@if`); swapping the bound menu moves the registration; destroying the bar unregisters.
- `hideFor` runtime change moves `hide-for-*` and `show-for-*` together.
- Defaults token: `hideFor` and `animate` seed from it; an element-level provider wins over a root one.
- Development checks: each of the five warnings fires once for its case and not for the correct markup.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`.

### 3. Node-level Vitest

- SSR smoke (`renderApplication`, the Rendering-mode test seam helper): a fixture with one closed pair (`hideFor="medium"`), one pair open through the initial binding, one with `hideFor="large"`, and one menu without an `id`. Assert that `whenStable()` resolves; each bar carries `hide-for-<bp>`; the closed menu carries `show-for-<bp>` and no `is-open`; the open menu carries `is-open` and no `show-for-<bp>`; no Motion class and no `inert` anywhere; the generated menu id equals the button's `aria-controls`; the hamburger carries `jsaction="click:;"` and the menu no `jsaction`; no `MediaMatcher` query was made.
- Pure logic: the `animate` string parser (enter and exit tokens, extra whitespace, one token, empty) and the Motion UI transition-name recognition are pure functions with table-driven tests.
- Sass compile, WCAG rules: the default include emits only the `.title-bar .menu-icon::before` hit-area rule; a theme with `$titlebar-icon-color` at under 3:1 against `$titlebar-background`, or `$titlebar-color` at under 4.5:1, produces the matching `@warn`, and Foundation's default theme produces none.
- Sass compile (the Sass packaging decision's node-level check): `@include nfs-responsive-toggle(xlarge);` against Foundation's defaults emits `.hide-for-xlarge` and `.show-for-xlarge` identical to Foundation's `hide-for(xlarge)` and `show-for(xlarge)` output; a breakpoint already in `$breakpoint-classes` emits no Visibility class; the Zero breakpoint and an unknown name fail the compile with `@error`; the default include emits no Visibility class; a changed `$breakpoints` value changes the output.

### 4. Playwright e2e

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Viewport thresholds on `responsive-toggle--default`: at 375 px and at 639 px the bar is displayed and the menu is not; at 640 px and at 1300 px the bar is not and the menu is; opening at 375 px then resizing to 1300 px and back keeps the menu open.
- Focus across a real resize: focus on the hamburger at 375 px, resize to 1300 px, focus lands on the first menu link; focus on a menu link at 1300 px with the menu closed, resize to 375 px, focus lands on the hamburger.
- `reducedMotion: 'reduce'` on `responsive-toggle--animated`: no Motion class is ever observed and `opened` fires at once.
- Print emulation (`page.emulateMedia({media: 'print'})`) at 375 px: the menu is displayed and the bar is not.
- WCAG 2.2 AA checks that need real layout: target size (2.5.8) by `elementFromPoint` 2 px outside the hamburger's left and right edges and 4 px outside its top and bottom edges; focus visible (2.4.7) by a screenshot comparison before and after Tab to the hamburger; reflow (1.4.10) at 320 by 640 px with the menu open, `scrollWidth <= 320`; focus not obscured (2.4.11) in a story variant with a sticky title bar and `scroll-padding-top`, each tabbed menu item's rectangle clear of the bar.

Against the prerendered fixture app:

- JavaScript disabled at 375 px and at 1300 px: screenshot plus axe; the correct element is displayed at each width and the desktop menu links work at 1300 px.
- Hydration at 1300 px and at 375 px: no NG05xx, `ngDevMode.componentsSkippedHydration === 0`, and the class attributes of the bar and the menu are identical before and after hydration.
- Pre-hydration tap at 375 px with `main.js` held back: the menu opens exactly once after hydration and no error is logged.
- `@defer (hydrate on interaction)` around the pair: a tap on the hamburger loads the chunk, hydrates, and opens the menu.
- `@defer (hydrate never)`: at 1300 px the menu is displayed and its links navigate; at 375 px the menu stays hidden and the hamburger does nothing, with no error logged.

## Out of Scope

- The menu's own behaviour (DropdownMenu, Drilldown, AccordionMenu, ResponsiveMenu inside the `.top-bar`) belongs to those specs. Consumers align Foundation's `$topbar-unstack-breakpoint` and `.stacked-for-<bp>` with `hideFor` in their own markup and settings; the two are not linked by Foundation either.
- The Trigger's ARIA and click handling belong to the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md); breakpoint state belongs to the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md).
- Overlay-style mobile menus (focus trapping, Escape, scroll locking) are OffCanvas's job; this spec keeps Foundation's in-flow title-bar menu.
- A `.title-bar-title` directive, a generated title id, and an `aria-label` input: the name is consumer markup.
- Runtime theming of the title bar; `$titlebar-*` settings stay compile-time Foundation settings.
- A dev-mode check that the Breakpoint map and the Sass breakpoints agree: the Breakpoint service's drift check owns it.

## Further Notes

### Design decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Directives | `[nfsResponsiveToggle]` on the bar, `[nfsResponsiveToggleMenu]` on the target | Foundation's markup already has both elements; both need host bindings in server HTML (ADR 0001) |
| Toggler variant or own directive | Own directive | The bar must be the Openable and carry a breakpoint class; Toggler's `hidden` would hide the desktop menu before hydration |
| Breakpoint switch | Foundation's `.hide-for-<bp>` on the bar and `.show-for-<bp>` on the closed menu, bound from the static `hideFor` | Correct server HTML at every width, no swap at hydration, a usable desktop menu in `hydrate never` (audit 0002 H4; building-blocks 1.11 decision 8); no library CSS for the switch itself |
| `hidden` or `popover` | Neither | `hidden` would hide the desktop menu; `popover` is out of target and moves the menu out of the page flow |
| `.is-open` | Bound while `isOpen`, no CSS | Foundation's State class vocabulary; a hook for consumers and tests; no Foundation rule styles it on a menu |
| Link direction | Bar references the menu (`[nfsResponsiveToggle]="menu"`); the bar registers with the menu through an effect | Mirrors `data-responsive-toggle="<id>"`; view effects run before host bindings, so the menu is right in the first pass |
| `hideFor` home | Bar only | Foundation's docs put it there; one home per input |
| `animate` home | Menu only | Foundation's docs example puts `data-animate` on the menu, the element that animates |
| State on a breakpoint crossing | `isOpen` persists; nothing is written | Foundation's reset was a side effect of rewriting inline `display` on every breakpoint change; writing the model from a breakpoint change would need an `effect` propagating state, which building-blocks 1.5 forbids; the menu looks the same at and above `hideFor` either way. OPEN FOR HUMAN in the ticket |
| `open()` at and above `hideFor` | Works (no guard) | The desktop menu is shown by CSS whatever the state, so Foundation's guard protects nothing |
| Animation | Motion classes bound only during the phase, through a `linkedSignal` phase | One path for bindings, Triggers, and methods; no Motion class in server HTML; persistent element, so no `animate.enter` |
| Completion | `animationend` on the menu, fallback 1100 ms | Building-blocks 1.6 rule 1; a design-time value (Motion UI prototype) |
| Reduced motion | No Motion class bound | Covers consumer classes that have no reduced-motion rule |
| `inert` | Only while exiting | The exiting menu is still rendered but on its way out; a closed menu is `display: none`, and an `inert` there would disable the desktop menu |
| Focus | Moves only when the focused element is hidden or made inert | APG disclosure keeps focus on the button; building-blocks 1.10 focus persistence |
| Escape | None | In-flow content, not an overlay |
| `toggled.zf.responsiveToggle` | `opened`/`closed`, plus `isOpenChange` from the model | Foundation fires `toggled` after the animation, the Completion outputs' timing |
| Plugin token | None | Nothing injects the bar by class; `nfsOpenableToken` and `exportAs` cover every use |
| Title-bar name | Consumer `aria-labelledby` to `.title-bar-title` | Visible text beats `aria-label` (APG names practice); static ids are hydration-safe |
| `hideFor` outside `$breakpoint-classes` | Opt-in `nfs-responsive-toggle(<bp>...)` emitting only the two classes | Adding a breakpoint to `$breakpoint-classes` also multiplies the grid, alignment, and visibility classes of every Foundation component |
| Target size (2.5.8) | A transparent 24 by 24 px `::before` hit area on `.title-bar .menu-icon`, emitted by `nfs-responsive-toggle` | Foundation's hamburger is a fixed 20 by 16 px with no setting; enlarging the box would stretch the `::after` bars; the spacing exception is layout-dependent |
| Contrast (1.4.11, 1.4.3) | Compile-time `@warn` through Foundation's `color-contrast()` | Foundation's defaults pass; a consumer theme can fail silently otherwise; no CSS is needed |
| Reflow (1.4.10) | Menus inside the toggled element stack below `hideFor` (`vertical <bp>-horizontal`) | Foundation's docs example uses a horizontal `.dropdown.menu`, which overflows at 320 px |

### Usage examples

Foundation's title bar with a top bar:

```html
<div class="title-bar" [nfsResponsiveToggle]="menu" hideFor="medium">
  <button class="menu-icon" type="button" nfsToggle aria-labelledby="nav-title"></button>
  <div class="title-bar-title" id="nav-title">Menu</div>
</div>
<nav class="top-bar" id="main-menu" nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" aria-label="Main">
  <div class="top-bar-left">
    <ul class="vertical medium-horizontal dropdown menu" nfsDropdownMenu>...</ul>
  </div>
</nav>
```

Animated, with the library's keyframe classes (the consumer includes `nfs-motion`):

```html
<nav class="top-bar" id="main-menu" nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu"
     animate="nfs-hinge-in-from-top nfs-spin-out" aria-label="Main">...</nav>
```

Two-way binding and completion outputs:

```html
<div class="title-bar" [nfsResponsiveToggle]="menu" [(isOpen)]="menuOpen" (closed)="onMenuClosed()">...</div>
```

Close the mobile menu after in-app navigation:

```html
<div class="title-bar" [nfsResponsiveToggle]="menu" #titleBar="nfsResponsiveToggle">...</div>
<nav class="top-bar" id="main-menu" nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" aria-label="Main">
  <ul class="menu">
    <li><a routerLink="/products" [nfsClose]="titleBar">Products</a></li>
  </ul>
</nav>
```

A second toggle outside the bar, and a larger `hideFor`:

```html
<div class="title-bar" [nfsResponsiveToggle]="menu" #titleBar="nfsResponsiveToggle" hideFor="large">...</div>
<button type="button" class="button" [nfsToggle]="titleBar">Browse</button>
```

Application-wide defaults:

```ts
providers: [
  { provide: nfsResponsiveToggleDefaultsToken, useValue: { hideFor: 'large', animate: 'nfs-fade-in nfs-fade-out' } },
];
```

Incremental hydration: wrap the pair together.

```html
@defer (hydrate on interaction) {
  <div class="title-bar" [nfsResponsiveToggle]="menu">...</div>
  <nav class="top-bar" id="main-menu" nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu">...</nav>
}
```

Migration from Foundation's markup: `data-responsive-toggle="id"` becomes `[nfsResponsiveToggle]="menu"` plus `#menu="nfsResponsiveToggleMenu"` on the target; `data-hide-for` becomes `hideFor`; `data-toggle` inside the bar becomes a bare `nfsToggle`; `data-animate` becomes `animate` with `nfs-` class names; the `.no-js` FOUC CSS is deleted; `aria-labelledby` and the title `id` are added.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-visibility-classes` (the `.hide-for-<bp>` and `.show-for-<bp>` classes that do the breakpoint switch), `foundation-title-bar` and `foundation-menu-icon` (the bar's look), and whichever the menu uses (`foundation-top-bar`, `foundation-menu`). Its documented custom CSS is the `nfs-responsive-toggle` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-menu-icon` and `foundation-visibility-classes`:

1. Rules. (a) Always: `.title-bar .menu-icon::before { content: ''; position: absolute; top: 50%; left: 50%; width: 24px; height: 24px; transform: translate(-50%, -50%); }`, a transparent hit area centred on the hamburger. Reason: WCAG 2.2 success criterion 2.5.8 asks for a 24 by 24 CSS px target, Foundation's `foundation-menu-icon` draws a fixed 20 by 16 px hamburger with no size setting, and its spacing exception holds only while no other target is near. The rule sizes nothing Foundation draws (the bars are `::after`, the icon keeps its box and its `position: relative` from `hamburger()`), and 24 px is WCAG's number, not a Foundation value. It is scoped to `.title-bar` because that is the markup this plugin owns; a hamburger in a custom bar needs its own. (b) Compile-time checks that emit no CSS: `@warn` when Foundation's `color-contrast()` gives under 3 for `$titlebar-icon-color` or `$titlebar-icon-color-hover` against `$titlebar-background` (1.4.11), or under 4.5 for `$titlebar-color` against it (1.4.3). (c) Only on request: `@include nfs-responsive-toggle($hide-for: ())`; for each breakpoint name in `$hide-for` that is not already in `$breakpoint-classes`, it emits `.hide-for-<bp> { @include hide-for(<bp>); }` and `.show-for-<bp> { @include show-for(<bp>); }`, the same two rules Foundation's `foundation-visibility-classes` loop emits for the breakpoints it covers. Reason: Foundation generates Visibility classes only for `$breakpoint-classes` (default `small medium large`), and adding a breakpoint there also generates that breakpoint's grid, alignment, and other responsive classes for every component. A name already in `$breakpoint-classes` is skipped (Foundation emits it); the first key of `$breakpoints` (the Zero breakpoint, for which Foundation emits no `hide-for`/`show-for` pair) and a name missing from `$breakpoints` stop the compile with `@error`. Example: `@include nfs-responsive-toggle(xlarge);`.
2. Reuses the consumer's `$breakpoints` and `$breakpoint-classes` and Foundation's `hide-for()` and `show-for()` mixins (which call `breakpoint()` and `-zf-bp-to-em`), so the queries equal Foundation's to the 0.00125em offset; the contrast checks read `$titlebar-background`, `$titlebar-color`, `$titlebar-icon-color`, and `$titlebar-icon-color-hover` and call Foundation's `color-contrast()`. The `$hide-for` parameter exists because Foundation has no setting for "visibility classes for these breakpoints only".
3. No `--nfs-responsive-toggle-*` property; the directives write no custom property.
4. Motion classes: none by default; with `animate`, the classes the consumer names, for example `nfs-hinge-in-from-top` and `nfs-spin-out` from `nfs-motion`. The directive binds no Motion class under reduced motion, so `nfs-responsive-toggle` emits no `prefers-reduced-motion` override; `nfs-motion` keeps its own 1 ms override for its classes.
5. Missing include: the hamburger's pointer target shrinks to Foundation's 20 by 16 px and passes 2.5.8 only through the spacing exception, which axe's `target-size` rule reports once another target comes near; theme contrast is no longer checked at compile time. With a `hideFor` outside `$breakpoint-classes` and neither the include nor the setting change, the bar is shown at every width, the closed menu is never hidden, and the button only flips `.is-open`; the development-mode check (Missing Visibility class) names both fixes. Missing `foundation-visibility-classes` breaks every `hideFor` the same way, and the same check catches it.

### Platform features to adopt when the browser target moves

- `popover="manual"` (Baseline widely available from late 2026): not adopted even then. A popover is `display: none` until shown and then leaves the page flow for the top layer, while this menu must stay in the page flow and be visible at and above `hideFor`; binding `popover` only below `hideFor` would make it a breakpoint-gated server attribute again. It fits only a consumer whose mobile menu is an overlay, which is OffCanvas's case.
- `CloseWatcher` (no WebKit release): for a consumer who styles the mobile menu as an overlay, a close watcher opened with the menu would add Escape and the Android back gesture; until then the documented `(keydown.escape)` binding covers Escape.
- Invoker Commands: when they reach the target, the Triggers utility may add `commandfor` with a custom `--nfs-toggle` command so a pre-hydration tap works without replay (needs the static menu id, which this spec already recommends).

### Foundation behaviour changed or dropped

- Inline `display` from jQuery `show()`/`hide()`/`toggle(0)` becomes Foundation's Visibility classes plus `.is-open`; the `.no-js` FOUC recipe is unnecessary.
- The window `changed.zf.mediaquery` listener that re-ran `_update()` on every breakpoint change is gone: CSS media queries do the switch, and the menu state is not reset on a crossing.
- `toggleMenu()`'s no-op at and above `hideFor` is dropped; `open()`, `close()`, and `toggle()` work at every width.
- Options merged from two elements become one home each: `hideFor` on the bar, `animate` on the menu.
- Motion UI's `animateIn`/`animateOut` (two-frame transition classes) becomes keyframe classes bound during the phase; Motion UI transition class names are not supported and warn.
- `toggled.zf.responsiveToggle` becomes `opened`/`closed` plus `isOpenChange`.
- `mutateme.zf.trigger` on `[data-mutate]` descendants is dropped; the next library's measuring directives observe size with `ResizeObserver`.
- The id-string target and its `console.error` on a missing id become a required typed reference.
- New: `aria-expanded` and `aria-controls` on the button (from the Trigger), a documented name through `aria-labelledby`, focus continuity when a breakpoint crossing or a close hides the focused element, `inert` while the menu animates out, and reduced-motion support.
