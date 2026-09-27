# Spec: Orbit

Ticket: [Spec: Orbit](../issues/33-spec-orbit.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Built on the verdict of the [Prototype: Orbit on CSS scroll snap](../issues/46-prototype-orbit-scroll-snap.md), with the composition findings of the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md). Revised on 2026-09-26 by the [Re-run: Orbit spec, the slide's ARIA contract and the focus handoff](../issues/70-rerun-orbit-slide-contract-and-focus-handoff.md) with the findings of the [Prototype: Orbit keyboard scrolling and hydration details](../issues/65-prototype-orbit-keyboard-hydration.md) (the keyboard prototype below). Revised on 2026-09-27 by the [Decide the `@angular/aria` fallback confirmation](../issues/75-evidence-aria-fallback-confirmation.md): the slides host Aria's `TabPanel` again with an `inert` override derived from `TabPanel.visible()` (ADR 0037 supersedes ADR 0034).

## Problem Statement

A developer building an Angular application on Foundation for Sites wants Foundation's Orbit: an image and content carousel with previous and next arrows, bullets that pick a slide, captions, automatic rotation, and swiping on touch screens, styled by Foundation's `.orbit` classes. Foundation's Orbit Plugin gives that look, but its JavaScript leaves the developer with problems an Angular library must not copy:

- Nothing is visible without JavaScript. Foundation's Sass sets `.orbit-container { height: 0 }` "to prevent FOUC" and positions every slide absolutely; the plugin measures the tallest slide after the images load and writes the height inline. A server-rendered page shows an empty box until the scripts run.
- Slide movement depends on the Motion UI library and a two-frame class protocol, plus synthetic `swipeleft`/`swiperight` events from a jQuery touch shim. Motion UI is not a dependency of this library, and its transition classes do not animate under Angular's `animate.enter`.
- The carousel fails the WAI-ARIA Authoring Practices carousel pattern and WCAG 2.2 AA: there is no control to stop the rotation (WCAG 2.2.2), rotation does not stop when keyboard focus enters, the rotating slide is an `aria-live="polite"` region that interrupts the user every five seconds, the slides have no `aria-roledescription`, the bullets have no tab semantics, `.orbit-container` becomes a focusable element with arrow keys and no role, and inactive slides are hidden with inline `display: none` managed by jQuery.
- Foundation's default bullets are 19.2 CSS px circles 3.2 px apart in `$medium-gray` on white: smaller than the 24 px target size minimum (WCAG 2.5.8) and at about 1.6:1 against the page, below the 3:1 non-text contrast minimum (WCAG 1.4.11). The white arrow glyphs sit on the slide image with no background of their own, and the caption's half-transparent black band reaches only 3.7:1 behind white text over a light image (WCAG 1.4.3 asks for 4.5:1).
- Options such as `containerClass`, `slideClass`, `boxOfBullets`, `nextClass`, `prevClass`, `useMUI`, and `accessible` exist only because the plugin finds its elements by class name and optionally skips Motion UI.

A server-rendered Angular application adds a second problem: the server HTML must paint every slide, must not break hydration, must let a click on an arrow or a bullet made before hydration take effect, and must not keep a zone-based application from ever becoming stable because of the rotation timer.

## Solution

Eight attribute directives on Foundation's Orbit markup, which the developer writes: `nfsOrbit` on `.orbit`, `nfsOrbitContainer` on `.orbit-container`, `nfsOrbitSlide` on each `.orbit-slide`, `nfsOrbitBullets` on `nav.orbit-bullets`, `nfsOrbitBullet` on each bullet button, `nfsOrbitPrevious` and `nfsOrbitNext` on the arrows, and `nfsOrbitRotation` on one added button, the APG rotation control. The markup changes from Foundation's docs in three places: the container and the slides are `div` elements instead of `ul` and `li` (a slide is a `tabpanel`, which `li` may not be), the rotation control is added as the first focusable element, and the arrow glyphs are wrapped in `aria-hidden` spans.

The container is a horizontal CSS scroll-snap row. Every slide is in the server HTML and paints at first paint; the container is as tall as the tallest slide with no measurement. The arrows, the bullets, and the rotation scroll only the container, smoothly unless the user prefers reduced motion. Native scrolling (touch swipe, trackpad, wheel, keyboard scrolling) is the swipe, and an IntersectionObserver reports which slide the user scrolled to. The bullets are an `@angular/aria` tablist and the slides its tab panels, so the carousel implements the APG tabbed carousel: arrow keys, Home, and End on the bullets, `aria-selected`, roving focus, and slides hidden with `inert` while they are out of view once the directives run. Each slide hosts Aria's `TabPanel` and overrides only its `inert`, with a binding derived from `TabPanel.visible()` that stays absent until the directives are live and equals Aria's value from then on. When the selected slide changes while focus is inside the slide that loses it, focus moves to the new slide once it is no longer `inert`.

Automatic rotation is a `setTimeout` scheduled from a render effect outside the Angular zone. It pauses while the pointer is over the carousel, stops when keyboard focus enters it, restarts only from the rotation control, starts stopped when the user prefers reduced motion, and turns the live region off only while slides can change on their own. The selected slide is a `selected` model keyed by the slide's `value`, and `selectedChange` replaces Foundation's `slidechange` event.

The library's `nfs-orbit` Library mixin carries the scroll-snap layout that replaces Foundation's measured height, plus the rules and compile-time checks that make the bullets, the arrows, and the caption meet WCAG 2.2 AA over any image.

## User Stories

1. As an application developer, I want to put Orbit directives on Foundation's Orbit markup, so that my carousel keeps Foundation's classes and look.
2. As an application developer, I want every slide to paint in the server HTML with no JavaScript measurement, so that the carousel is never an empty box at first paint.
3. As an application developer, I want the container to be as tall as the tallest slide, so that slides of different heights fit as they did in Foundation.
4. As a user, I want the previous and next arrows to move one slide, so that I can browse the slides.
5. As a user, I want the arrows to move the slides without scrolling the page, so that the page stays where I am reading.
6. As a user, I want a bullet per slide that shows its slide when I press it, so that I can jump to any slide.
7. As a keyboard user, I want the bullets to be one tab stop with Left, Right, Home, and End moving between them and showing their slide, so that the carousel follows the APG tabbed carousel.
8. As a keyboard user, I want Tab to land on the bullet of the slide that is showing, so that I start from where the carousel is.
9. As a keyboard user, I want Tab to reach the bullets even before the page hydrates, so that the carousel is keyboard reachable at first paint.
10. As a touch user, I want to swipe the slides, so that the carousel works like a native gallery.
11. As a trackpad or mouse-wheel user, I want horizontal scrolling to move the slides and snap to one slide, so that the carousel follows the platform.
12. As a user, I want one swipe to move at most one slide, so that I never skip slides by accident.
13. As a user, I want the bullets and the selected slide to follow wherever I scrolled, so that the state I see is the state the carousel reports.
14. As a user, I want the carousel to rotate automatically when the developer asks for it, so that Foundation's `autoPlay` still works.
15. As a user, I want a visible button before the slides that stops and starts the rotation, so that I can stop moving content (WCAG 2.2.2).
16. As a keyboard user, I want the rotation to stop when my keyboard focus enters the carousel and not restart until I ask, so that slides do not move while I read or operate them.
17. As a mouse user, I want the rotation to pause while my pointer is over the carousel and resume when it leaves, so that I can read a slide.
18. As a mouse user, I want the rotation control itself not to pause the rotation when I hover it, so that pressing "Start" visibly starts it.
19. As a user who prefers reduced motion, I want the rotation to start stopped and the slides to move without smooth scrolling, so that the page moves only when I ask.
20. As a user who changes the reduced-motion setting while the page is open, I want the carousel to follow the new setting, so that I do not have to reload.
21. As a screen reader user, I want the carousel announced as a carousel and each slide as a slide with its name, so that I understand the structure.
22. As a screen reader user, I want new slides announced only when the rotation is off, so that automatic changes never interrupt me.
23. As a screen reader user, I want slides that are out of view hidden from me once the page is interactive, so that I hear only the slide that is showing.
24. As a user without JavaScript, or inside a `hydrate never` block, I want to scroll to every slide and use its content, so that the carousel degrades to a usable gallery.
25. As an application developer, I want `infiniteWrap` to decide whether the arrows and the rotation wrap from the last slide to the first, so that Foundation's option keeps its meaning.
26. As an application developer, I want `timerDelay` to set the time between automatic moves, so that Foundation's option keeps its meaning.
27. As an application developer, I want to bind `[(selected)]` to the value of the slide that shows, so that my state follows the carousel and can set it.
28. As an application developer, I want `selectedChange` whenever the selected slide changes, so that I can react to Foundation's `slidechange`.
29. As an application developer, I want `next()`, `previous()`, `play()`, and `stop()` and a read-only `playing` signal, so that I can drive the carousel and label the rotation control.
30. As an application developer, I want application-wide defaults for `autoPlay`, `timerDelay`, and `infiniteWrap`, so that I can replace `Foundation.Orbit.defaults`.
31. As a pointer and touch user, I want every bullet to be at least 24 by 24 CSS px, so that each meets the WCAG 2.2 target size minimum.
32. As a user with low vision, I want the bullets to contrast with the page and the selected bullet with the others, so that I can see the bullets and which one is selected.
33. As a user with low vision, I want the arrow glyphs and the caption text readable over any slide image, so that light images do not hide them.
34. As a keyboard user, I want a visible focus indicator on the rotation control, the arrows, the bullets, and the focused slide, so that I always see where focus is.
35. As a keyboard user, I want focus to stay in the carousel when the slide holding it stops being the selected slide, whether I scrolled it away or a control changed the slide, so that focus never drops to the page.
36. As a user of a right-to-left page, I want the arrow keys on the bullets to follow the reading direction and the slides to run from right to left, so that the carousel matches my language.
37. As an application developer, I want slide content that is expensive to be deferred until its slide scrolls into view, so that a long carousel loads quickly.
38. As a developer of a server-rendered application, I want arrow, bullet, and rotation clicks made before hydration to take effect once the page hydrates, so that early interaction is not lost.
39. As a developer of a zone-based application, I want the rotation timer to run outside the zone, so that my application becomes stable and replays queued clicks.
40. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
41. As a developer using incremental hydration, I want guidance on the hydrate trigger and the boundary, so that the carousel hydrates when it is seen and works as one widget.
42. As an application developer, I want dev-mode warnings for a missing rotation control, missing bullets, a missing carousel name or role description, a rotation control after the slides, and unpaired values, so that I catch accessibility mistakes early.
43. As an application developer, I want my Sass compile to stop with the setting to change when my Orbit colours fail WCAG 2.2 AA, so that a non-compliant carousel never ships.
44. As an application developer, I want to import Orbit from its own entry point, so that a `@defer` block can split it.
45. As a library maintainer, I want every behaviour asserted through roles, attributes, classes, scroll positions, and timings in stories, browser-level tests, a server-render smoke test, and e2e, so that regressions surface at the layer that owns them.

## Implementation Decisions

### Foundation contract

Features (Foundation's Orbit docs page and plugin source): a `.orbit` root holding `.orbit-wrapper` with `.orbit-controls` (the `.orbit-previous` and `.orbit-next` buttons) and a `ul.orbit-container` of `li.orbit-slide` elements; slides may hold any HTML, typically `figure.orbit-figure > img.orbit-image + figcaption.orbit-caption`; a `nav.orbit-bullets` of buttons carrying `data-slide` indexes and a "Current Slide" span that the plugin moves between bullets; automatic rotation through Foundation's Timer utility, pausing on `mouseenter` and on a click on a slide; swipe from the Touch utility; arrow keys on the focusable container and on the bullets; container height measured after the images load and on resize.

Options, from `Orbit.defaults` in the source (not from the ticket's list; audit 0001 H6; there is no `data-orbit-container` or `data-orbit-slide` option and the bullet container option is `boxOfBullets`):

| Option (`data-*`) | Foundation default | Library | Reason |
| --- | --- | --- | --- |
| `bullets` | `true` | Dropped | The bullets are the tablist of the APG tabbed carousel and are required; their presence in the markup is the switch (a missing `[nfsOrbitBullets]` is a dev-mode warning) |
| `navButtons` | `true` | Dropped | The arrows work when the consumer writes them; leaving them out is the switch |
| `animInFromRight`, `animOutToRight`, `animInFromLeft`, `animOutToLeft` | `'slide-in-right'`, `'slide-out-right'`, `'slide-in-left'`, `'slide-out-left'` | Dropped | Motion class options for Motion UI transitions; the browser's scrolling moves the slides, so there is nothing for a Motion class to animate (Animation below) |
| `autoPlay` | `true` | `nfsOrbit` input `autoPlay`, Defaults token | The rotation intent at start; overridden by reduced motion |
| `timerDelay` | `5000` | `nfsOrbit` input `timerDelay`, Defaults token | Milliseconds between automatic moves |
| `infiniteWrap` | `true` | `nfsOrbit` input `infiniteWrap`, Defaults token | Arrows and rotation wrap from the last slide to the first and back; the wrap scrolls back across the slides (delta, Animation) |
| `swipe` | `true` | Dropped | Native scrolling is the swipe; a consumer who wants no swipe writes `overflow-x: hidden` on the container, which keeps programmatic scrolling |
| `pauseOnHover` | `true` | Dropped, always on | The APG carousel requires rotation to stop while the pointer hovers it; an option to turn that off would be an option to fail the pattern |
| `accessible` | `true` | Dropped, always on | Building-blocks 1.4 |
| `containerClass`, `slideClass`, `boxOfBullets`, `nextClass`, `prevClass` | Foundation's class names | Dropped | Class-name options; the classes are the contract (building-blocks 1.4) |
| `useMUI` | `true` | Dropped | Building-blocks 1.4; no Motion UI |

Events:

| Foundation event | Library |
| --- | --- |
| `slidechange.zf.orbit` | `selectedChange`, the change output of the `selected` model (building-blocks 1.4) |
| `beforeslidechange.zf.orbit` | Dropped (building-blocks 1.4: no "start" events, no cancelable events) |
| `timerstart.zf.orbit`, `timerpaused.zf.orbit` (Timer utility) | Dropped; the rotation state is the read-only `playing` signal |
| `init.zf.orbit`, `destroyed.zf.orbit` | None (Angular lifecycle) |

Methods: `changeSlide(isLTR)` becomes `next()` and `previous()`; `changeSlide(isLTR, chosenSlide, idx)` becomes a write to `selected`; `geoSync()` becomes `play()`; `_reset()`, `_updateBullets()`, `_destroy()` have no counterpart (state is derived, and destroying a directive never hides the element).

Dropped options: `bullets`, `navButtons`, the four `animIn*`/`animOut*` options, `swipe`, `pauseOnHover`, `accessible`, `containerClass`, `slideClass`, `boxOfBullets`, `nextClass`, `prevClass`, `useMUI`.

### CSS class to Angular mapping

| Foundation class or element | Angular | Rationale |
| --- | --- | --- |
| `.orbit` | `NfsOrbit`, selector `[nfsOrbit]`, adds `.orbit` as a static host class; hosts Aria `Tabs` | The root Structural class and the common ancestor Aria's tabs need |
| `.orbit-wrapper`, `.orbit-controls` | Plain consumer markup | No behaviour; Foundation styles them |
| `.orbit-previous`, `.orbit-next` | `NfsOrbitPrevious`, `NfsOrbitNext`, selectors `button[nfsOrbitPrevious]`, `button[nfsOrbitNext]`, adding the class | Native buttons with a click action |
| `ul.orbit-container` | `div.orbit-container` with `NfsOrbitContainer`, selector `div[nfsOrbitContainer]`, adding the class | The scroll-snap container, the live region, and the IntersectionObserver root; `div` because its children are `tabpanel`s, not list items |
| `li.orbit-slide` | `div.orbit-slide` with `NfsOrbitSlide`, selector `div[nfsOrbitSlide]`, adding the class; hosts Aria `TabPanel` (inputs `value`, `id`) and overrides its `inert` (mechanic 9) | `tabpanel` is not an allowed role on `li`, and the APG's `li[role=group]` alternative is not allowed either (prototype axe failures `aria-allowed-role`, `list`) |
| `.orbit-figure`, `.orbit-image`, `.orbit-caption` | Plain consumer markup | No behaviour |
| `nav.orbit-bullets` | `NfsOrbitBullets`, selector `[nfsOrbitBullets]`, adding the class; hosts Aria `TabList` | The tablist; ARIA in HTML allows `role="tablist"` on `nav` |
| `.orbit-bullets > button` | `NfsOrbitBullet`, selector `button[nfsOrbitBullet]`; hosts Aria `Tab` | One tab per slide, paired by `value` |
| (none) | `NfsOrbitRotation`, selector `button[nfsOrbitRotation]` | The APG rotation control Foundation lacks; the consumer styles it with Foundation's button classes |
| `.is-active` on a slide and on a bullet | Host class bindings from the selected value | State class |
| `.is-in`, `.no-motionui` | Not bound | Only Foundation's non-Motion UI path used them; `.no-motionui` positioned absolute slides that no longer exist |
| `[data-slide-active-label]` "Current Slide" span | Dropped | `aria-selected` on the bullet carries it; moving the span between bullets was jQuery-only |
| `data-slide` | Dropped | Value-keyed pairing replaces indexes |

### Hierarchy and DI shape

```
div[nfsOrbit]                         NfsOrbit (provides nfsOrbitToken; hosts Aria Tabs)
  button[nfsOrbitRotation]            NfsOrbitRotation (injects nfsOrbitToken, registers)
  div.orbit-wrapper                   plain markup
    div.orbit-controls                plain markup
      button[nfsOrbitPrevious]        NfsOrbitPrevious (injects nfsOrbitToken)
      button[nfsOrbitNext]            NfsOrbitNext (injects nfsOrbitToken)
    div[nfsOrbitContainer]            NfsOrbitContainer (registers)
      div[nfsOrbitSlide] value="a"    NfsOrbitSlide (injects nfsOrbitToken, registers; hosts Aria TabPanel, overrides inert)
      div[nfsOrbitSlide] value="b"
  nav[nfsOrbitBullets]                NfsOrbitBullets (registers; hosts Aria TabList)
    button[nfsOrbitBullet] value="a"  NfsOrbitBullet (registers; hosts Aria Tab)
    button[nfsOrbitBullet] value="b"
```

- Parent handle: `nfsOrbitToken = new InjectionToken<NfsOrbit>('nfsOrbitToken')` in the plugin's token file with an `import type` of the class; `NfsOrbit` provides it with `useExisting`. Every child injects it without `optional`: none can exist outside an Orbit (building-blocks 1.9). A nested Orbit inside a slide provides its own token, so its children bind to it; the token is never re-provided as `undefined`.
- Registration: the container, the slides, the bullets directive, the bullets, and the rotation control register with the Orbit in `ngOnInit` and unregister on destroy. The Orbit keeps each list in a signal. Slides and bullets are sorted by `compareDocumentPosition` when they register (which works on the server), and a `MutationObserver` on the container, started in `afterNextRender`, re-sorts the slides when `@for` moves them (building-blocks 1.9, Aria's `SortedCollection` shape). `contentChildren` is not used.
- Aria composition (building-blocks 1.9; the Aria prototype): the root hosts `Tabs` (Aria's `TabList` requires its `TABS` token); `NfsOrbitBullets` hosts `TabList` and exposes none of its inputs; `NfsOrbitBullet` hosts `Tab` and exposes `value` (required by Aria) and `id`, so a consumer's static `id` reaches Aria instead of being overwritten by Aria's generated one; `NfsOrbitSlide` hosts `TabPanel` and exposes `value` and `id` the same way. Slide content is projected, never placed in `ngTabContent`, so every slide is in the server HTML.
- The slide's `inert` override (mechanic 9; [ADR 0037](../adr/0037-orbit-slide-hosts-tab-panel.md) supersedes ADR 0034 and returns ADR 0025's mechanism in a form that holds). Aria's `TabPanel` renders `role="tabpanel"`, `id`, `tabindex`, `aria-labelledby`, and, once its tab is registered, `inert` on every unselected slide, server HTML included. `NfsOrbitSlide` binds `[attr.inert]` itself, computed from `inject(TabPanel).visible()` and the Orbit's `live` signal: `live ? (visible ? null : true) : (visible ? null : undefined)`. Before live the value is `null` or `undefined`, both rendered as no attribute, and it changes between them in exactly the passes in which Aria's `inert` changes, so the slide's binding writes after Aria's in every such pass (binding precedence, below the host binding table); once live it is Aria's own value. On the client, the pass in which the bullets register writes Aria's `inert` and the override's removal in one host-binding run, which nothing renders (the fallback confirmation's probe, three engines). Aria's `Tab` finds the registered panel of its value and renders `aria-controls` itself. In development builds each slide logs Aria's 'ngTabPanel must have an ngTabContent structural directive to render.' as two `console.warn` lines (accepted as in the Tabs spec, the Aria prototype's triage), silent in production.
- Ids: the slide's generated id is Aria's `ng-tabpanel-`, the bullets keep Aria's `ng-tab-`, and the container's is the library's `nfs-orbit-container-` from CDK `_IdGenerator` with `randomize: true` (building-blocks 1.5). Every reference to them (`aria-controls`, `aria-labelledby`) is a host binding, so the ids that differ between server and client are rewritten together at hydration.
- Selection link: the Orbit's `selected` model is the source of truth. `NfsOrbitBullets` writes the effective value into Aria's `selectedTab` model in `ngAfterContentInit` (after the slides registered, so the server HTML has a selected tab; the Aria prototype's case 6) and subscribes to that model to forward the user's bullet choices to the Orbit; after that the Orbit writes Aria's model synchronously wherever its own selection changes: in the `selected` model's change notification (`selected.subscribe`, synchronous inside `set()`), in `ngOnChanges` for a value arriving through a parent binding, and so at the live flip's reconciliation, which writes through `selected.set()`; never from an effect or a later render callback. Once live, a slide's `inert` and `tabindex` follow Aria's selected tab, so this is what renders `.is-active`, `tabindex`, and `inert` in one pass, keeps a slide adopted at the live flip out of `inert` (mechanic 4), and lifts the handoff target's `inert` before the handoff runs (mechanic 8). Equal values are ignored, so neither side loops. Aria's `wrap` stays at its default (`true`), `orientation` horizontal, `focusMode` roving, `selectionMode` follow.
- Defaults token: `nfsOrbitDefaultsToken`, an `InjectionToken<NfsOrbitDefaults>` with the all-optional keys `autoPlay`, `timerDelay`, `infiniteWrap` (Material shape B; building-blocks 1.4), injected with `{optional: true}` to seed the input defaults; the nearest provider wins.
- Services: `NfsMediaQuery` (the Breakpoint service) for `reducedMotion`; CDK `_IdGenerator` for the container id; `NgZone` only for `runOutsideAngular` around the timer; `DestroyRef`; `DOCUMENT` for the live-focus read of the focus handoff; `HostAttributeToken('id')` on the container. `Directionality` is not injected: the scroll arithmetic uses rectangles, which are direction-agnostic, and Aria injects `Directionality` itself for the arrow keys.
- Entry point: `ngx-foundation-sites/orbit` holds the eight directives, the tokens, and the types, so a consumer's `@defer` can split it.

### API

```ts
interface NfsOrbitDefaults {
  autoPlay?: boolean;
  timerDelay?: number;
  infiniteWrap?: boolean;
}

const nfsOrbitToken: InjectionToken<NfsOrbit>;
const nfsOrbitDefaultsToken: InjectionToken<NfsOrbitDefaults>;

class NfsOrbit {                          // div[nfsOrbit], exportAs 'nfsOrbit'
  readonly autoPlay: InputSignalWithTransform<boolean, unknown>;     // true
  readonly timerDelay: InputSignalWithTransform<number, unknown>;    // 5000
  readonly infiniteWrap: InputSignalWithTransform<boolean, unknown>; // true
  readonly selected: ModelSignal<string | undefined>;                // undefined = the first slide
  readonly playing: Signal<boolean>;                                 // rotation turned on
  next(): void;
  previous(): void;
  play(): void;
  stop(): void;
}

class NfsOrbitContainer {}                // div[nfsOrbitContainer], exportAs 'nfsOrbitContainer'
class NfsOrbitSlide {                     // div[nfsOrbitSlide], exportAs 'nfsOrbitSlide'
  readonly value: InputSignal<string>;    // required, Aria TabPanel's; pairs the slide with the bullet of equal value
  readonly id: InputSignal<string>;       // Aria TabPanel's; generated 'ng-tabpanel-...' when absent
  readonly isActive: Signal<boolean>;
}
class NfsOrbitBullets {}                  // [nfsOrbitBullets], exportAs 'nfsOrbitBullets'
class NfsOrbitBullet {                    // button[nfsOrbitBullet], exportAs 'nfsOrbitBullet'
  readonly value: InputSignal<string>;    // required, Aria Tab's
  readonly id: InputSignal<string>;       // Aria Tab's
  readonly isActive: Signal<boolean>;
}
class NfsOrbitPrevious {}                 // button[nfsOrbitPrevious]
class NfsOrbitNext {}                     // button[nfsOrbitNext]
class NfsOrbitRotation {}                 // button[nfsOrbitRotation]
```

`NfsOrbit` inputs and state:

| Member | Kind | Default | Foundation equivalent | Delta |
| --- | --- | --- | --- | --- |
| `autoPlay` | `input`, `booleanAttribute` | `true`, or the Defaults token | `data-auto-play` | Starts stopped under reduced motion; rotation needs more than one slide, as in Foundation |
| `timerDelay` | `input`, `numberAttribute` | `5000`, or the Defaults token | `data-timer-delay` | After a hover pause the full delay restarts (Foundation resumed the remaining time) |
| `infiniteWrap` | `input`, `booleanAttribute` | `true`, or the Defaults token | `data-infinite-wrap` | Governs the arrows and the rotation; the bullets' arrow keys always wrap (APG Tabs); the wrap scrolls back across the slides instead of continuing forward |
| `selected` | `model<string \| undefined>()` | `undefined`, which shows the first slide | the active slide; `changeSlide(isLTR, slide, idx)` | Keyed by the slide's `value`; `selectedChange` fires on every committed change (user, scroll, rotation), never at initialisation |
| `playing` | `Signal<boolean>` (read-only) | `autoPlay` and not reduced motion | the Timer's state | The rotation intent the rotation control shows; hover pauses rotation without changing `playing` |

- `playing` is a `linkedSignal` of `autoPlay` and `NfsMediaQuery.reducedMotion()`: it recomputes to `autoPlay && !reducedMotion` when either source changes, and `play()`, `stop()`, and the focus rule write it. So the rotation starts stopped under reduced motion, stops if the user turns reduced motion on, and returns to what `autoPlay` asks for if they turn it off, which is the Breakpoint service spec's user story 11.
- The effective rotation is `playing() && !hovered && slides > 1`; it drives the timer and `aria-live`.
- `next()` and `previous()` select the following or preceding slide in DOM order; at the ends they wrap when `infiniteWrap` is on and do nothing otherwise. `play()` and `stop()` set `playing`. A write to `selected`, from code or a two-way binding, scrolls the container to that slide; an unknown value is ignored with a dev-mode warning.
- `NfsOrbitSlide.isActive` and `NfsOrbitBullet.isActive` are the "this value is the selected one" signals behind `.is-active`; the slide's `tabindex` and `inert` follow Aria's `TabPanel.visible()`, which the synchronous selection link keeps equal to it.
- Outputs: only `selectedChange`. Container-level payloads (building-blocks 1.4) add nothing to the value here, so there is no aggregate event.
- `exportAs`: `nfsOrbit`, `nfsOrbitContainer`, `nfsOrbitSlide`, `nfsOrbitBullets`, `nfsOrbitBullet`. The consumer labels the rotation control with `orbit.playing()`.
- Dev-mode checks, in one `afterNextRender` of the Orbit that exists only when `ngDevMode` is on, each warning once per instance: (1) `autoPlay` on and no rotation control (WCAG 2.2.2); (2) the rotation control after the container in DOM order (the APG requires it to precede the rotating content); (3) no `[nfsOrbitBullets]` or no bullets (the tabbed carousel, and the single-pointer alternative to swiping, WCAG 2.5.1 and 2.5.7); (4) the root has no `aria-label`/`aria-labelledby` or no `aria-roledescription`, or a slide has no `aria-roledescription`; (5) the bullets directive has no accessible name; (6) two slides with one `value` (Aria's panel map keeps only the last; Aria itself reports a slide without a bullet, a bullet without a slide, and duplicate bullet values).

Host bindings and listeners, all on signal state:

| Directive | Static host attributes | Bindings | Listeners |
| --- | --- | --- | --- |
| `NfsOrbit` | `class="orbit"` | | `(focusin)`; `pointerover`/`pointerleave` added in code in `afterNextRender` |
| `NfsOrbitRotation` | `type="button"` | `[attr.aria-controls]`: container id | `(click)`: `playing() ? stop() : play()` |
| `NfsOrbitPrevious`, `NfsOrbitNext` | `class`, `type="button"` | `[attr.aria-controls]`: container id | `(click)`: `previous()` / `next()` |
| `NfsOrbitContainer` | `class="orbit-container"`, `tabindex="-1"`, `aria-atomic="false"` | `[attr.id]`: the static `id` or a generated `nfs-orbit-container-` id; `[attr.aria-live]`: `off` while rotating, otherwise `polite` | `wheel`, `touchstart`, `pointerdown`, `keydown` (passive, added in code in `afterNextRender`) |
| `NfsOrbitSlide` | `class="orbit-slide"` | `[class.is-active]`; `[attr.inert]`: the derived value (absent before live, Aria's value once live). `role`, `id`, `tabindex`, `aria-labelledby` are Aria `TabPanel`'s bindings | none |
| `NfsOrbitBullets` | `class="orbit-bullets"` | | `(keydown)`: the replay guard |
| `NfsOrbitBullet` | `type="button"` | `[class.is-active]`; `[attr.tabindex]`: while any bullet is Aria's active item, `0` on the active one and `-1` on the others (Aria's own value); before that, `0` on the selected bullet (overrides Aria's) | none (Aria's tablist listens) |

Binding precedence: two host bindings on one attribute are not merged, and each writes only when its own value changes (Angular's attribute binding instruction compares the new value with the one stored in its own binding slot, `bindingUpdated`), so the wrapper's binding, which Angular applies after its host directive's in each pass, holds only while Aria's value never changes after the wrapper's last write, or equals the wrapper's value whenever it does change. The bullet's `tabindex` holds by both: Aria's value is a constant `-1` until Aria has an active item, which happens only in a render callback in the browser, and equals the wrapper's value from then on. A plain `inert` override of Aria's `TabPanel` met neither: in the first server pass the bullets have not registered yet (inside `@for`, the bullets' embedded views register after the slides bind), so Aria's panel finds no tab and renders no `inert`; in a later pass it renders `inert` on every unselected slide while the wrapper's value is still absent and unchanged, so only Aria's binding writes. That is the keyboard prototype's failing case in all three engines (server HTML `inert` pattern `false, true, true, true` beside a correctly computed wrapper value), explained here from the Angular and Aria sources. A template attribute binding loses the same way, and in the first pass too, because template bindings run before host bindings. A wrapper binding also holds by a third condition: its value changes in every pass in which Aria's changes, which a binding computed from the same public Aria signal guarantees. The slide's `inert` meets it: Aria's value is a function of `TabPanel.visible()`, and so is the override, which alternates between `null` and `undefined` before live (different values under `Object.is`, both rendered as no attribute) and equals Aria's once live (probe G `g5`, `g6`; the keyboard prototype re-run in three engines; ADR 0037). The plain override lost because slides inside `@for` bind in their embedded views before the bullets' `@for` views run `ngOnInit` and register, so Aria's `inert` arrived in a later pass; static markup does not fail this way (`g4`), and bullets before slides hold only until the selection changes in a later pass (`g7`).

Container `tabindex="-1"`: Firefox makes a scroll container a tab stop, and a focusable element with no role is outside every APG pattern; the visible slide (the `tabpanel` with `tabindex="0"`) is the keyboard entry to the slides and satisfies axe `scrollable-region-focusable` (prototype tab-order case).

### Implementation level and primitives

Implementation level: native platform for the slides' layout, the movement, and the swipe; `@angular/aria` Tabs (`Tabs`, `TabList`, `Tab`, `TabPanel`) for the bullets and the slides; custom Angular for the slide's `inert` override (building-blocks Table A). The [Prototype: Orbit on CSS scroll snap](../issues/46-prototype-orbit-scroll-snap.md) reproduced Orbit in Chromium, Firefox, and WebKit from server HTML with axe clean on the WCAG 2.2 AA tags; the keyboard prototype confirmed keyboard scrolling, the focus ring, the hidden scrollbar, and the hydration details, and failed only the `inert` gate with a plain override of Aria's `TabPanel`, which passes in three engines with the derived override (ADR 0037).

Why an override: Aria comes first, and Aria's `TabPanel` renders `inert` on every unselected panel, server HTML included, where ADR 0025 requires none. Of the overrides tried, only one derived from `TabPanel.visible()` holds when the selection changes in a later server pass (binding precedence, above); it is one `computed` with a comment. CDK has no tab panel primitive. The bullets keep Aria: their `tabindex` override holds, and Aria gives them roving focus, the keys, `aria-selected`, `aria-controls`, and right-to-left arrows.

- Platform: CSS scroll snap (`scroll-snap-type: x mandatory`, `scroll-snap-align: start`, `scroll-snap-stop: always`), `scroll-behavior: smooth` under `prefers-reduced-motion: no-preference`, `overscroll-behavior-x: contain`, `Element.scrollBy()`, IntersectionObserver, `inert`, `:focus-visible` in the focus rule, `MutationObserver`; all Baseline widely available on 2026-05-07. `scrollend` and the scroll snap events are out of target and not used.
- `@angular/aria`: `Tabs`, `TabList`, `Tab`, `TabPanel` through `hostDirectives`, with value-keyed pairing, roving focus, `aria-selected`, `aria-controls`, the tab panel attributes, and the arrow, Home, End, Enter, and Space keys.
- `@angular/cdk`: `_IdGenerator` for the container id.
- Custom Angular: the slide's `inert` override.
- Angular: `input()` with `booleanAttribute`/`numberAttribute`, `model()`, `linkedSignal` for `playing`, `computed()` for the effective value, the rotation, the classes, and the slide's `inert` override; host metadata for bindings and replayable listeners; `ngOnChanges` (a lifecycle hook, not a render hook) to record a focus handoff for a `selected` value arriving through a parent binding, before the pass that renders it (mechanic 8).
- Render hooks (building-blocks 1.5, including its rendered-state rule). `afterNextRender`, with `earlyRead` (the container's `scrollLeft` and the slide rectangles) and `write` phases, is the Orbit's first render callback: it reconciles the selection with the container (mechanic 4), turns the live gate on (mechanic 9), and creates the observers and the passive listeners, each once per instance, which is why it is not an effect. `afterRenderEffect` for the movement (rectangles in `earlyRead`, `scrollBy` in `write`), because it re-runs whenever the selection changes; for the timer, because it re-runs on the selection and the effective rotation and its cleanup clears the timeout; and, `write` phase only, for the focus handoff, because it must run after the change-detection pass that lifts the new slide's `inert` and re-runs on the pending-handoff signal. The rendered-state rule holds without a rendered-state signal: the handoff target is written outside render callbacks (an observer callback, a handler, the timer, consumer code, or change detection), so the change-detection pass of that tick renders the new `inert` state before any render hook runs; the one selection write made inside a render callback, Aria's `selectedTab` model forwarding a bullet choice, never carries a handoff, because focus is on the bullet; and the one handoff recorded inside a render callback, at the live flip (mechanic 4 (c)), targets a slide that no pass has made `inert` yet, while the live flip itself is written in the same callback as the reconciled selection, so both render in one pass. No `effect()`: no piece has a non-DOM side effect, and an `effect()` also runs on the server. `injectAsync` not used: the plugin is its own entry point and a consumer `@defer` splits it; `afterEveryRender` not needed: `afterRenderEffect` re-runs on its signals.

Mechanics:

1. Active slide: an IntersectionObserver rooted on the container with `threshold: 0.5` observes every slide. A slide at least half visible becomes the slide in view; when no programmatic move is pending and it differs from the selected slide, it becomes the selection (so a native swipe, wheel, scrollbar drag, or keyboard scroll selects the slide it lands on).
2. Movement: every move (arrow, bullet, key, rotation, a write to `selected`) changes the selection first; the render effect then scrolls the container by the selected slide's offset (`container.scrollBy({left: slideRect.left - containerRect.left})`, correct in right-to-left too) when that slide is not the one in view. `scrollIntoView` is not used: it scrolled the page by 120 px when the carousel was partly out of view (prototype finding), and APG arrows must not move focus or the page.
3. Pending target: while a programmatic scroll heads for a slide, the observer ignores the slides it passes, so a jump from the first slide to the fourth records one selection change, not three. The target clears when that slide reaches half visibility; a user gesture on the container (`wheel`, `touchstart`, `pointerdown`, `keydown`, passive listeners added in code) cancels it and hands control back to the observer.
4. Initial position: the Orbit's first render callback reads the container's `scrollLeft` and the slide rectangles in `earlyRead` and, in `write`, reconciles the selection with the container before it turns the live gate on (mechanic 9). (a) A container still at `scrollLeft` 0 whose selected slide is not the first (a bound `selected`) is aligned to it instantly: the one write sets `scrollLeft` with the container's `scroll-behavior` overridden to `auto` inline for that write (a `Renderer2` write, building-blocks 1.5), so no smooth scroll plays on load. (b) Otherwise, a container the user already scrolled before hydration is left alone, and when the slide at least half visible differs from the selected one, it becomes the selection there, with one `selectedChange` (cause: scroll). That is what the observer's first report would do a frame later, but done before any slide is `inert`, so the slide in view, and a focus inside it, never meets `inert` (a focus that moved into a later slide before hydration scrolled the container to it). The observer, created in the same callback, then reports the slide already selected. (c) If focus is inside a slide other than the selected one after (a) or (b), the focus handoff target is recorded (mechanic 8); no slide is `inert` yet, so the new slide can take focus whichever runs first.
5. Rotation: a `setTimeout(timerDelay)` scheduled from an `afterRenderEffect` that tracks the effective rotation and the selected value, inside `NgZone.runOutsideAngular`, cleared on the effect's cleanup. Every slide change restarts the full delay (Foundation's `Timer.restart()`); the tick calls the internal `next`, which stops at the last slide when `infiniteWrap` is off. Render hooks already run outside the zone in Angular 22.2; `runOutsideAngular` keeps that true if it changes and costs nothing in zoneless apps. A timer inside the zone kept the prototype's zone build from ever becoming stable and so from replaying clicks.
6. Focus stops rotation: the root's `focusin` handler sets `playing` to `false` when the focused element matches `:focus-visible` and is not the rotation control. This is the APG's "keyboard focus" rule: a mouse click on an arrow (which focuses the button in some engines but not in Safari) or a tap does not stop rotation, while the hover pause covers the pointer. A replayed `focusin` checks live focus the same way (building-blocks 1.11 decision 5).
7. Hover pauses rotation: a `pointerover` listener sets "hovered" to whether the target is outside the rotation control, and `pointerleave` on the root clears it; both are added in code in `afterNextRender`, so a stale hover is never replayed after hydration.
8. Focus handoff: whenever the selection changes while the Orbit is live and focus is inside a slide other than the newly selected one, the newly selected slide receives focus with `focus({preventScroll: true})`, because focus on an element that becomes `inert` falls back to the page body. It takes two steps, because until change detection renders the new selection the new slide is still `inert` from the previous one, and `focus()` on an `inert` element does nothing (the keyboard prototype measured a synchronous `focus()` in the observer callback failing silently in all three engines). (a) Record, at the change and before any render: the Orbit reads live focus (`DOCUMENT.activeElement` inside a slide element that is not the newly selected one) and writes the new slide into a pending-handoff signal. The read happens in three places that together see every change: the `selected` model's own change notification (`selected.subscribe`, synchronous inside `set()`), which the observer, the arrows, the bullets, the rotation, `next()`, `previous()`, and a consumer's direct `selected.set()` all reach; `ngOnChanges`, for a value arriving through a parent's `[selected]` or `[(selected)]` binding, which runs before the slides' bindings in that pass; and mechanic 4 (c) at the live flip. Live focus is read at the change, not in the render callback, because by then the old slide is `inert` and an engine may already have moved focus to `body`. (b) Act, after the render: an `afterRenderEffect` `write` phase reads the pending signal, focuses that slide only while it is still the selected one, and clears the signal. So a keyboard or wheel scroll from a focused slide, a control inside a slide that calls `next()` or writes `selected`, and a rotation step after a pointer focused a slide all keep focus in the carousel. Focus moves only when it was inside a slide; the arrows and the bullets hold focus themselves and never trigger it.
9. Live gate: `NfsOrbitSlide` binds `inert` only once the Orbit is live, that is from its first render callback on: a `live` signal the callback sets in its `write` phase after mechanic 4 has reconciled the selection, so the two render in the same pass. The server HTML leaves every slide reachable (ADR 0025, and the `hydrate never` residue). Aria `TabPanel`'s own `inert` binding is on the element and always applied first; the slide's override is applied after it and changes in every pass in which Aria's does, so before live it removes Aria's value and once live it equals it (binding precedence, above; [ADR 0037](../adr/0037-orbit-slide-hosts-tab-panel.md) supersedes ADR 0034 and keeps ADR 0025's decision).
10. Replay guard: `NfsOrbitBullets` calls `stopPropagation()` again in a host `keydown` listener for the keys Aria handles (ArrowLeft, ArrowRight, Home, End, Enter, Space, without modifiers), because a replayed key makes Aria's trailing `preventDefault()` throw and skip Aria's own `stopPropagation()`, so an Orbit inside an accordion panel would hand Home and End to the accordion (the Aria prototype's nested-accordion case 25).

Fallback: none. The `@if`-rendered slides with `animate.enter`/`animate.leave` that building-blocks 1.6 rule 2 named as the fallback is retired: the scroll-snap design failed no case, and the fallback would only have given a forward wrap, at the cost of slides missing from server HTML, a synthesized swipe, height jumps, and no no-JavaScript scrolling.

### Comparison with Angular Material

None. Angular Material, CDK, cdk-experimental, and Aria 22.2 have no carousel or slideshow (the Material reference research, section 10). What is borrowed comes from neighbours:

| Concern | Source | Orbit |
| --- | --- | --- |
| Slide pickers | Aria Tabs (value-keyed pairing, roving focus, automatic activation) | `Tabs`, `TabList`, `Tab`, and `TabPanel` hosted by the root, the bullets, and the slides; the slide overrides `inert` only (mechanic 9) |
| Selection | Material `MatTabGroup.selectedIndex` plus `selectedIndexChange` | `selected` model by value (the Tabs house rule) with `selectedChange` |
| Reduced motion | Material's cached `_animationsDisabled()` | The Breakpoint service's live `reducedMotion` signal, so a setting change applies without a reload |
| Defaults | `MAT_*_DEFAULT_OPTIONS` (shape B) | `nfsOrbitDefaultsToken` |
| Announcements | Material `LiveAnnouncer` | Not used: the APG's toggled `aria-live` region on the container announces slide changes only while rotation is off |

### ARIA and keyboard

APG pattern: Carousel, tabbed style (the APG's tabbed carousel example), with previous and next buttons from the basic style.

| Element | Rendered semantics | Owner | Source |
| --- | --- | --- | --- |
| Root `.orbit` | `role="region"` (or `group`), `aria-roledescription="carousel"`, `aria-label` or `aria-labelledby` without the word "carousel" | Consumer markup (localised strings); dev check 4 | APG carousel; Foundation's docs already write `role="region" aria-label` |
| Rotation control | Native `button`, first focusable element inside the root; label toggles "Stop automatic slide show" / "Start automatic slide show"; no `aria-pressed`; `aria-controls` the container | Directive plus consumer text | APG ("since the label changes, the rotation control does not have any states") |
| Previous, next | Native `button`s named by `.show-for-sr` text; glyph in an `aria-hidden` span; `aria-controls` the container; activation does not move focus | Directive plus consumer markup | APG basic carousel |
| Container | `aria-live="off"` while rotating, `polite` otherwise; `aria-atomic="false"`; `tabindex="-1"` | Directive | APG ("if automatic rotation is turned on, the live region is disabled") |
| Slide | `role="tabpanel"`, `aria-roledescription="slide"`, `aria-labelledby` its bullet, `tabindex="0"` when shown and `-1` otherwise, `inert` when not shown (once live) | Aria `TabPanel`; `inert` through the slide's override (mechanic 9); `aria-roledescription` consumer markup | APG tabbed example, which sets `aria-roledescription="slide"` on its tab-panel slides where the pattern text (Tabbed Carousel Elements) omits it; D22 follows the example; hidden, not off-screen |
| Bullets | `role="tablist"`, `aria-label` (for example "Choose slide to display") | Aria; label consumer markup | APG tabbed example |
| Bullet | `role="tab"`, `aria-selected`, `aria-controls` its slide, roving `tabindex`, named by `.show-for-sr` text such as "Slide 2: Lots of green space." | Aria; the pre-hydration tab stop from `NfsOrbitBullet` | APG Tabs |

| Key | Where | Behaviour | Owner |
| --- | --- | --- | --- |
| Tab, Shift+Tab | Anywhere | Rotation control, previous, next, the visible slide (and its content), the bullet tab stop, in DOM order. Before the Orbit is live no slide is `inert`, so Tab also reaches the content of the other slides, and focusing it scrolls its slide into view (mechanic 4 selects that slide when the Orbit goes live) | Native |
| Enter, Space | Rotation control | Stops or starts rotation; focus stays | Native button plus directive |
| Enter, Space | Previous, next | Moves one slide; focus stays | Native button plus directive |
| ArrowRight, ArrowLeft | Bullet | Next or previous bullet, which selects and shows its slide; wraps at the ends; mirrored in right-to-left | Aria |
| Home, End | Bullet | First or last bullet and slide | Aria |
| ArrowLeft, ArrowRight | Focused slide | Native scrolling of the container, which snaps to the adjacent slide; the observer selects it and focus follows to that slide after the render that lifts its `inert` (mechanic 8) | Native plus directive |
| Page Down, Page Up, Home, End | Focused slide | Native: the container has no vertical overflow, so these keys scroll the page, not the container; focus stays on the slide. Documented platform behaviour, not intercepted (the keyboard prototype measured it in three engines; the APG carousel pattern gives these keys no role) | Native |

Focus rules: keyboard focus entering the carousel stops rotation until the rotation control restarts it; the rotation control itself never stops it; no activation moves focus except the bullets' arrow keys (APG Tabs) and the focus handoff, which moves focus from a slide that stops being selected to the newly selected slide (mechanic 8).

Known deviation (decided at triage in the ticket: accepted and documented, D13; asking angular/components for a public API is not filed, by the user's ruling, [Upstream filings](../issues/76-evidence-upstream-filing-readiness.md)): after the user has operated the bullets once, a selection change from scrolling or rotation leaves Aria's roving tab stop on the last bullet the user operated, so Tab lands on that bullet instead of the selected one; `aria-selected` is always correct. Aria offers no public API to move its active item, and the library does not use Aria's underscore members.

WCAG 2.2 AA criteria the Orbit addresses, each guaranteed by default:

| Criterion | How the Orbit meets it | Enforced by |
| --- | --- | --- |
| 2.2.2 Pause, Stop, Hide | Rotation control before the slides; rotation stops on keyboard focus and pauses on hover; starts stopped under reduced motion | Dev check 1; stories `orbit--autoplay`, e2e timing cases |
| 2.3.3 Animation from Interactions (AAA, honoured) | `scroll-behavior: smooth` only under `no-preference`; rotation starts stopped under `reduce` | e2e with `emulateMedia({reducedMotion: 'reduce'})` |
| 2.1.1 Keyboard | Buttons, Aria tablist keys, native scrolling from the focused slide with ArrowLeft and ArrowRight; bullets reachable by Tab from server HTML; before hydration the visible slide and the content of every slide are reachable by Tab, because no slide is `inert`. Page Down, Page Up, Home, and End on a focused slide scroll the page and keep focus (documented) | Stories and e2e key presses (the keyboard prototype passed these in three engines) |
| 2.4.3 Focus Order | DOM order; focus never drops to `body` when the slide holding it stops being selected: the focus handoff moves it to the newly selected slide after the render that lifts that slide's `inert`, for every source of the change (mechanic 8), and the first render callback selects the slide in view before any slide is `inert` (mechanic 4) | Browser-level focus handoff tests; e2e keyboard scrolling from a focused slide and pre-hydration focus cases |
| 2.4.7 Focus Visible | The UA focus ring on buttons and bullets (Foundation's `disable-mouse-outline` acts only under what-input's `[data-whatinput='mouse']`, which the library does not set); the focused slide's ring is drawn inside the slide because the container clips anything outside it (Library mixin rule 11) | e2e pixel check on the focused slide (the keyboard prototype measured `outline-offset: -4px` with `:focus-visible` in three engines) |
| 1.4.3 Contrast (Minimum) | The caption band `$orbit-caption-background` composited over white, the worst case behind light text, must give its text 4.5:1; Foundation's `rgba($black, 0.5)` gives 3.7:1, `rgba($black, 0.6)` 5.2:1 | Compile-time `@error` in the Library mixin (rule 0b); axe marks text over images incomplete, so the story gate cannot catch it |
| 1.4.11 Non-text Contrast | Bullets at 3:1 against `$body-background`, and the selected bullet at 3:1 against the others (the state is shown by colour alone, so 1.4.1 asks for the same); Foundation's `$medium-gray` (about 1.6:1 on white) fails, `$orbit-bullet-background: $dark-gray` (3.4:1) with `$orbit-bullet-background-active: $black` (about 5.7:1 against `$dark-gray`) passes. The white arrow glyph needs its own background over any image: rule 9 gives the arrows Foundation's `$orbit-control-background-hover` at rest (3.7:1 for `$white` over the band composited on white) | Compile-time `@error` (rule 0a); axe has no 1.4.11 rule |
| 2.5.8 Target Size (Minimum) | Every bullet is at least 24 by 24 CSS px (rule 10, `max(24px, $orbit-bullet-diameter)`); arrows (1rem padding) and the rotation control (Foundation's `.button.small` is about 32 px tall) exceed it | e2e measures each bullet's box; axe only reports `target-size` as incomplete for roving-tabindex bullets (it skips neighbours outside the tab order), so the story gate cannot fail it |
| 2.5.1 Pointer Gestures, 2.5.7 Dragging Movements | Bullets (required) and arrows are single-pointer alternatives to swiping and scrollbar dragging | Dev check 3 |
| 4.1.2 Name, Role, Value | Roles and states from Aria and the directives; names from consumer text; the rotation control's changing label | axe in every story; dev checks 4 and 5 |
| 1.3.1 Info and Relationships | Visible slides are never hidden from assistive technology: `inert` applies only to slides out of view once live, and the server HTML hides none (a visible-but-inert slide would show sighted users content assistive technology cannot reach); the slide's override removes Aria's `inert` in every server pass; the slide in view at the live flip is selected before `inert` applies. The tab/panel relationships are Aria's bindings, present in server HTML: each slide's `aria-labelledby` names its bullet and each bullet's `aria-controls` names its slide | Node-level SSR smoke (no `inert`, paired ids); e2e with JavaScript disabled; the prerendered fixture's server-HTML and pre-hydration scroll cases |

### Rendered HTML

Consumer markup (three slides shown), then the server HTML, then the hydrated changes. Class order is not significant; `jsaction` appears only in server HTML of hydrating apps; generated ids are abbreviated; Aria's `aria-disabled="false"` and `data-active` attributes are omitted for reading.

```html
<div nfsOrbit #orbit="nfsOrbit" role="region" aria-roledescription="carousel" aria-label="Favorite space pictures">
  <button nfsOrbitRotation class="button small">
    {{ orbit.playing() ? 'Stop automatic slide show' : 'Start automatic slide show' }}
  </button>
  <div class="orbit-wrapper">
    <div class="orbit-controls">
      <button nfsOrbitPrevious><span class="show-for-sr">Previous slide</span><span aria-hidden="true">&#9664;&#xFE0E;</span></button>
      <button nfsOrbitNext><span class="show-for-sr">Next slide</span><span aria-hidden="true">&#9654;&#xFE0E;</span></button>
    </div>
    <div nfsOrbitContainer>
      @for (slide of slides; track slide.id; let first = $first) {
        <div nfsOrbitSlide [value]="slide.id" aria-roledescription="slide">
          <figure class="orbit-figure">
            <img class="orbit-image" [src]="slide.src" [alt]="slide.alt" width="1200" height="500" [attr.loading]="first ? null : 'lazy'" />
            <figcaption class="orbit-caption">{{ slide.caption }}</figcaption>
          </figure>
        </div>
      }
    </div>
  </div>
  <nav nfsOrbitBullets aria-label="Choose slide to display">
    @for (slide of slides; track slide.id; let i = $index) {
      <button nfsOrbitBullet [value]="slide.id"><span class="show-for-sr">Slide {{ i + 1 }}: {{ slide.caption }}</span></button>
    }
  </nav>
</div>
```

Server HTML (`autoPlay` on, `selected` unbound):

```html
<div class="orbit" role="region" aria-roledescription="carousel" aria-label="Favorite space pictures" jsaction="focusin:;">
  <button class="button small" type="button" aria-controls="nfs-orbit-container-x-0" jsaction="click:;">Stop automatic slide show</button>
  <div class="orbit-wrapper">
    <div class="orbit-controls">
      <button class="orbit-previous" type="button" aria-controls="nfs-orbit-container-x-0" jsaction="click:;">...</button>
      <button class="orbit-next" type="button" aria-controls="nfs-orbit-container-x-0" jsaction="click:;">...</button>
    </div>
    <div class="orbit-container" id="nfs-orbit-container-x-0" tabindex="-1" aria-atomic="false" aria-live="off">
      <div class="orbit-slide is-active" role="tabpanel" aria-roledescription="slide" id="ng-tabpanel-x-0" tabindex="0" aria-labelledby="ng-tab-x-0">...</div>
      <div class="orbit-slide" role="tabpanel" aria-roledescription="slide" id="ng-tabpanel-x-1" tabindex="-1" aria-labelledby="ng-tab-x-1">...</div>
      <div class="orbit-slide" role="tabpanel" aria-roledescription="slide" id="ng-tabpanel-x-2" tabindex="-1" aria-labelledby="ng-tab-x-2">...</div>
    </div>
  </div>
  <nav class="orbit-bullets" aria-label="Choose slide to display" role="tablist" tabindex="-1" aria-orientation="horizontal" jsaction="keydown:;click:;focusin:;">
    <button class="is-active" type="button" role="tab" id="ng-tab-x-0" tabindex="0" aria-selected="true" aria-controls="ng-tabpanel-x-0">...</button>
    <button type="button" role="tab" id="ng-tab-x-1" tabindex="-1" aria-selected="false" aria-controls="ng-tabpanel-x-1">...</button>
    <button type="button" role="tab" id="ng-tab-x-2" tabindex="-1" aria-selected="false" aria-controls="ng-tabpanel-x-2">...</button>
  </nav>
</div>
```

In the server HTML every slide attribute except `.is-active` comes from Aria's `TabPanel`, and each bullet's `aria-controls` from Aria's `Tab`; no slide carries `inert`, because the slide's override removes Aria's in every pass in which it changes.

Hydrated, after the first render callback: the two unselected slides gain `inert="true"`, in the same pass as any selection the callback adopted (mechanic 4), so a slide in view never gains it; the selected bullet keeps `tabindex="0"` (now as Aria's active item); generated ids are rewritten with the client's values, and every `aria-controls` and `aria-labelledby` with them. Under reduced motion the rotation label becomes "Start automatic slide show" and the container `aria-live="polite"` in the same tick. With `autoPlay` off the server HTML already carries "Start automatic slide show" and `aria-live="polite"`.

After the user presses "next": `.is-active` and `tabindex="0"` move to the second slide, `inert` moves to the first and third, the second bullet has `aria-selected="true"` and `.is-active`, and the container scrolls by one slide width. After the rotation is stopped: the label reads "Start automatic slide show" and `aria-live="polite"`.

After ArrowRight on the focused first slide: the container scrolls natively to the second slide; the observer selects it; one change-detection pass moves `.is-active` and `tabindex="0"` to the second slide, removes its `inert`, and adds `inert` to the first; then the handoff's `write` phase focuses the second slide (mechanic 8). Focus never rests on `body`.

With `[selected]="'b'"` bound, the server HTML marks the second slide and bullet active while the container shows the first slide; the first render callback aligns the container instantly (mechanic 4). With nothing bound and the container scrolled to the third slide before hydration, the first render callback selects the third slide (one `selectedChange`) in the same pass that turns `inert` on for the others.

### Animation

- Movement is the browser's scrolling: the container's `scroll-behavior: smooth` under `@media (prefers-reduced-motion: no-preference)` animates every programmatic move, and `scrollBy()` without a `behavior` option follows it. Under reduced motion the property stays `auto` and every move is instant, with no JavaScript check. No `@keyframes`, no Motion classes, no `animate.enter`/`animate.leave` (the directives insert nothing), no State class transition, and no Completion output: `selectedChange` fires when the selection changes, as Foundation's `slidechange` fired when its animation started.
- Wrap: with `infiniteWrap` on, "next" on the last slide selects the first and the container scrolls back across the slides between (prototype: 54, 30, and 13 distinct frames in Chromium, Firefox, and WebKit). Foundation slid the first slide in from the right instead. A forward loop would need cloned slides, which duplicate content for assistive technology, find-in-page, and crawlers; the APG says nothing about the direction of a wrap. Native swiping stops at the ends.
- Reduced motion also starts the rotation stopped (`playing`); JavaScript reads `NfsMediaQuery.reducedMotion()` only for that.
- View Transitions (out of target) are not needed: there is no non-scrolling slide change to animate.

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: every slide renders with Foundation's classes and the scroll-snap layout, so the first or bound slide is visible at first paint with no measurement; `.is-active`, `aria-selected`, the roles, the slide ids with their `aria-labelledby` and `aria-controls` pairs, the bullet tab stop, the rotation label, and `aria-live` come from host bindings on signal state (rule 1). No slide is `inert` in server HTML (mechanic 9): the slide's override removes Aria's `inert` in every server pass (the keyboard prototype's failing case was a plain override; the derived one passes in three engines). The `width` and `height` attributes on slide images reserve their space before they load; without them the container grows once the images arrive.
- Before hydration: nothing outside host bindings touches the DOM; no observer, timer, `scrollBy`, `focus()`, or `matchMedia` call runs before `afterNextRender`/`afterRenderEffect` (rules 3 to 5). Native scrolling works: swipes, wheel, and keyboard scrolling reach every slide and snap. Tab reaches the rotation control, the arrows, the visible slide, the content of every slide (none is `inert`), and the selected bullet.
- Full hydration: structure is identical, so nothing mismatches; the attribute changes at the first render callback are `inert` on the unselected slides, a selection adopted from a pre-hydration scroll or focus (mechanic 4, rendered in the same pass as `inert`), Aria's roving state, and the reduced-motion switch. The keyboard prototype measured no NG05xx and `componentsSkippedHydration` 0 in three engines. `ngSkipHydration` is never needed (rule 10). The hydration pass in which the bullets register writes Aria's `inert` on each unselected slide and the override's removal in the same host-binding run; nothing renders between them.
- Event replay: replayed listeners are `click` on the rotation control and the arrows, `keydown`, `click`, and `focusin` on the tablist (Aria's), and `focusin` on the root. A replayed arrow or rotation click acts once after hydration (prototype: "next" clicked at 134 to 296 ms, applied after stability at about 2.7 s). A replayed bullet click selects through Aria's click path. A replayed arrow key on a bullet changes the selection and then Aria's trailing `preventDefault()` throws, which Angular logs (accepted under the triage rule, building-blocks Part 4, Decided item 3; asking angular/components to skip that call during replay is not filed, by the user's ruling, [Upstream filings](../issues/76-evidence-upstream-filing-readiness.md)); the replay guard keeps it from reaching an enclosing composite. Library handlers call no `preventDefault()`. Scrolls, swipes, hovers, and the gesture listeners do not replay: a pre-hydration scroll is adopted by the first render callback instead (mechanic 4; the keyboard prototype measured the adoption, then through the observer's first report, in three engines). The focus handoff adds no listener: it reads live focus at a selection change and focuses in a render callback.
- Zone-based consumers: the timer never runs inside the zone, so the application becomes stable and replays queued clicks (the prototype's zone build; the in-zone control never replayed).
- Incremental hydration and the Hydration boundary: the root, the container, the slides, the bullets, the arrows, and the rotation control share one boundary, and every child must be declared inside the `[nfsOrbit]` element in the same template (a child finds the Orbit through its declaration-site injector). A consumer wraps the whole carousel, never part of it. Recommended: `@defer (hydrate on viewport)`, which hydrates the carousel when it scrolls into view, which is also when rotation matters (the keyboard prototype measured no rotation while off-screen and rotation after hydration in view, in three engines). A keyboard user may already be inside the carousel when it hydrates; mechanics 4 and 8 keep that focus. `hydrate on interaction` works too: the first arrow click or bullet key hydrates the block and replays.
- A `@defer` block inside a slide: a consumer puts `@defer (on viewport)` inside a slide (not around it), which loads code, not the glossary's Lazy content (the Orbit offers none); the observer behind `on viewport` sees the container's clipping, so the content loads when its slide scrolls into view, and the slide itself stays in server HTML and registered. `loading="lazy"` on slide images after the first is the platform form of the same. Aria's `ngTabContent` is not offered: its content renders only while its slide is selected, and in a scroll-snap carousel a slide is on screen before the observer selects it, so a lazy slide would be blank while it scrolls in and the container's height would change when it fills; in server HTML and inside `hydrate never` it would be empty. Viewport-keyed `@defer` is the supported form.
- `@defer`: library templates contain no `@defer`; Orbit is its own entry point. Plain `@defer` renders the carousel on the client, where it behaves as client rendering, and the `inert` gate applies from the first render.
- `@defer (hydrate never)` and no JavaScript: the residue is a native scroll-snap gallery. Every slide can be scrolled to, is not `inert`, and its links work; the first slide keeps `.is-active` and the first bullet `aria-selected` whatever slide is in view; the arrows, the bullets, and the rotation control do nothing, and nothing rotates.
- Prerendering: identical to server rendering; no request token is read (rule 11).

### Sass and custom CSS

- Styling is Foundation's Sass: `foundation-orbit` for every Orbit class, `foundation-button` for the rotation control's classes, `foundation-visibility-classes` for `.show-for-sr`, and Foundation's typography base (included by `foundation-everything`), which resets the `ul` padding a consumer might still use elsewhere in the carousel; without it the prototype's scroll positions were off by 40 px.
- The documented custom CSS is the `nfs-orbit` Library mixin, listed with reasons in Further Notes, Sass. No directive declares `styles`.
- WCAG 2.2 AA requirements on the consumer's settings: `$orbit-bullet-background` at 3:1 against `$body-background`, `$orbit-bullet-background-active` at 3:1 against `$body-background` and against `$orbit-bullet-background`, `$orbit-caption-background` giving its text 4.5:1 composited over white, and `$orbit-control-background-hover` giving `$white` 3:1 composited over white. Foundation's bullet and caption defaults fail, so a consumer on Foundation's defaults changes `$orbit-bullet-background`, `$orbit-bullet-background-active`, and `$orbit-caption-background` (for example `$dark-gray`, `$black`, `rgba($black, 0.6)`); the mixin stops the compile with `@error` naming the setting until they pass. Target size needs no consumer action.

## Testing Decisions

A good test asserts what a user or assistive technology observes: roles, names, `aria-selected`, `aria-live`, `inert`, `tabindex`, the State classes, the container's `scrollLeft`, the page's `scrollY`, which element has focus, when the selection changes and why, and the rotation label. No test reads a directive's private fields. Prior art: the prototype's Playwright suite (scroll positions at multiples of the container width, per-frame scroll paths, autoplay intervals, the zone build), the keyboard prototype's suites (keyboard scrolling and focus containment, the focus ring and headed scrollbar checks, and on the prerendered build the server-HTML `inert` pattern, the bullet tab stop handover, instant alignment, pre-hydration scroll adoption, and `hydrate on viewport`), the Aria prototype's replay cases, the building-blocks testing rule, and Angular's `renderApplication`-based SSR tests.

Story ids follow `orbit--<story>`: `orbit--basics`, `orbit--autoplay`, `orbit--no-wrap`, `orbit--without-arrows`, `orbit--selected`, `orbit--mixed-heights`, `orbit--rich-slides`, `orbit--defer-in-slide`, `orbit--rtl`, `orbit--nested-in-accordion`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`)

Every story runs axe with `parameters.a11y.test = 'error'` on the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`). The story Sass sets `$orbit-bullet-background: $dark-gray`, `$orbit-bullet-background-active: $black`, and `$orbit-caption-background: rgba($black, 0.6)`, because the Library mixin refuses to compile with Foundation's defaults; axe cannot check those pairs (no 1.4.11 rule; text over images is incomplete). Stories other than `orbit--autoplay` set `autoPlay` off or `timerDelay` long, so play functions are deterministic.

- `orbit--basics`: the region has roledescription "carousel"; the rotation control is the first button; "Next slide" selects slide 2 (`aria-selected`, `.is-active`, `tabindex` on the tab panel), focus stays on the arrow; "Previous slide" returns; clicking bullet 3 selects slide 3 with one `selectedChange`; ArrowRight, End, Home, ArrowLeft on the bullets select 1, 2 (last), 0, 2 and move focus; unselected slides are `inert` and the selected one is not; every slide has `role="tabpanel"`, its `aria-labelledby` names its bullet's `id`, and every bullet's `aria-controls` names its slide's `id`; with focus on slide 1, ArrowRight moves focus to slide 2 (not `body`) once slide 2 is selected.
- `orbit--autoplay` (`timerDelay` 300): the selection advances and wraps; `aria-live` is `off`; the rotation control reads "Stop automatic slide show"; pressing it stops the rotation (no change in 1 s, label "Start...", `aria-live` `polite`) and pressing again restarts it; hovering the slides pauses, leaving resumes; hovering the rotation control does not pause; Tab onto "Previous slide" stops the rotation.
- `orbit--no-wrap`: "next" on the last slide and the rotation at the end leave the selection there; ArrowRight on the last bullet still wraps to the first (APG Tabs).
- `orbit--without-arrows`: bullets and swipe only; no dev warning.
- `orbit--selected`: `[(selected)]` bound to a signal; changing the signal from a story control selects the slide; a bullet click writes the signal.
- `orbit--mixed-heights`: the container is as tall as the tallest slide and every caption sits on its own image.
- `orbit--rich-slides`: links inside the visible slide are reachable by Tab; links in unselected slides are not; a button inside slide 1 that calls `orbit.next()` leaves focus on slide 2, not on `body`.
- `orbit--defer-in-slide`: `@defer (on viewport)` content in slide 3 appears after selecting slide 3.
- `orbit--rtl`: under CDK `Dir` with `dir="rtl"`, ArrowLeft on a bullet selects the next slide.
- `orbit--nested-in-accordion`: the Orbit inside an accordion panel; Home on a bullet selects the first slide and does not move the accordion's focus.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- `playing` and the effective rotation: `autoPlay`, `play()`, `stop()`, the focus rule (a `focusin` on a `:focus-visible` element stops, on the rotation control or a mouse-focused button does not), hover in and out of the rotation control, a single slide, and reduced motion from a Breakpoint service test double turning on and off.
- Timer: with fake timers, a tick after `timerDelay`, a restart of the full delay on every selection change, no tick while paused or stopped, a stop at the end with `infiniteWrap` off, and the timer cleared on destroy.
- Movement and the pending target: in a real browser layout, a bullet jump from the first to the fourth slide records one `selectedChange`; a `wheel` during a programmatic scroll cancels the target and the observer adopts the landing slide; a write to `selected` scrolls the container; an unknown value warns and changes nothing.
- Initial position: a bound `selected` with the container at 0 is aligned instantly (the `scrollLeft` is final in the same task); a container scrolled to slide 3 before the first render callback selects slide 3 in that callback with one `selectedChange` (cause scroll), and slide 3 has no `inert` at any observation (a `MutationObserver` reads `hasAttribute('inert')` in each callback; it also reports Aria's write and the override's removal in the pass in which the bullets register, which is expected); with focus inside slide 1 and `selected` bound to slide 3, focus ends on slide 3.
- Focus handoff, one case per source, each with focus inside slide 1 and a `focus` listener on slide 2 that records slide 2's `inert` state at the moment it receives focus (asserted absent): setting the container's `scrollLeft` to slide 2 (the observer); `next()` called from a button inside slide 1; `orbit.selected.set()`; a parent `[(selected)]` binding written from inside slide 1; a rotation tick after a pointer focus. In every case focus ends on slide 2 and never rests on `body`, and slide 1 is `inert` afterwards. Negative cases: a bullet or arrow change moves no focus; a change while focus is outside the carousel moves no focus.
- Live gate: before the first render callback no slide is `inert`; after it the unselected ones are. The slide hosts `TabPanel`; once live the slide's `inert` equals Aria's after every selection change, and after a bullet click, `next()`, `selected.set()`, and a parent binding change, `.is-active`, `tabindex="0"`, and the absence of `inert` are on the same slide at the first `whenStable()` (the synchronous selection link).
- Slide contract: `role="tabpanel"`; the consumer's `id` wins, otherwise Aria's `ng-tabpanel-` id; `tabindex` `0` on the selected slide and `-1` on the others, following every selection change; `aria-labelledby` equals the paired bullet's `id`, and the bullet's `aria-controls` equals the slide's `id`, including after `@for` reorders them.
- Bullet tab stop: before Aria has an active item, the selected bullet has `tabindex="0"`; after, the attribute equals Aria's roving value.
- Registration: slides reordered by `@for` re-sort; a slide added later takes its DOM position.
- Replay-safe handlers: a replayed `focusin` (an event whose `eventPhase` reads 101) on an element no longer focused does not stop rotation; the bullets' guard stops propagation of a replayed Home.
- Dev-mode checks: each of the six fires once for its case and not for a correct carousel.
- Defaults token: provided keys seed the inputs; explicit inputs win.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`.

### 3. Node-level Vitest

- SSR smoke: `renderApplication` over a fixture with four slides and `autoPlay` on, a second with `autoPlay` off, and a third with `selected` bound to the third slide. Assert `whenStable()` resolves (the timer never runs on the server); every slide is present, one `.is-active`, none `inert`; every slide has `role="tabpanel"`, an `id`, and an `aria-labelledby` equal to its bullet's `id`, and every bullet's `aria-controls` equals its slide's `id`; the tab panel `tabindex` values are `0` then `-1`; the selected bullet has `tabindex="0"` and `aria-selected="true"`; `aria-live` is `off` with the "Stop" label, or `polite` with the "Start" label; the container `id` equals every `aria-controls` on the arrows and rotation control; `jsaction` is on the arrows, the rotation control, the tablist, and the root. Runs under `npx nx test <lib>` in `orbit.ssr.spec.ts` through the shared `renderServer()` helper from the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md); `npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not. Two more fixtures assert no slide `inert`: Foundation's order with `@for` slides and bullets (the shape in which the plain override failed), and one whose `selected` arrives after the first server pass through a `PendingTasks` task (the shape that defeats document-order and registry-count overrides).
- Pure logic: next and previous indexes with and without wrap, and slide ordering from document positions.
- Sass compile test: compiling Foundation 6.9 plus the library with Foundation's default Orbit colours stops with the `@error` naming `$orbit-bullet-background`; with the bullet settings fixed it stops naming `$orbit-caption-background`; with all fixed it emits the `nfs-orbit` rules, including the 24 px bullet floor and the arrow background from `$orbit-control-background-hover`, and no copy of a Foundation rule.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit (touch in headed Chromium only, a harness limit the prototype showed on plain HTML):

- Scroll positions: next, next, previous, and a bullet jump land at exact multiples of the container width; a wheel of 0.6 slide width selects the next slide; a `scrollLeft` jump selects its slide; RTL positions are negative.
- The page never scrolls: `window.scrollY` is unchanged by arrows, bullets, and five rotation ticks with the carousel partly out of view.
- Rotation timing: intervals within `timerDelay` plus 100 ms; hover pause; keyboard focus stop and restart from the rotation control; the wrap scrolls back through every slide (per-frame path) and lands at 0.
- Reduced motion: `emulateMedia({reducedMotion: 'reduce'})` gives computed `scroll-behavior: auto`, an instant move, and a stopped rotation labelled "Start"; switching back without a reload restores `autoPlay`.
- Tab order in three engines: rotation control, previous, next, visible slide, selected bullet (no stop on the container in Firefox).
- Keyboard scrolling from a focused slide: ArrowRight and ArrowLeft move one slide, the observer selects it, and focus moves to the newly selected slide (never `BODY` or `HTML`); Page Down, Page Up, End, and Home keep focus on the slide (they scroll the page, which the test records and does not fail on; the keyboard prototype measured `window.scrollY` 640 to 1041 px depending on the engine).
- Geometry and pixels: every bullet box is at least 24 by 24 CSS px; the focus ring of the focused slide is visible inside the slide; on a classic-scrollbar platform (headed), the container shows no scrollbar.

Against the prerendered fixture app:

- JavaScript disabled: screenshot plus axe (`@axe-core/playwright` on the six tags); every slide paints, can be scrolled to, is not `inert`.
- Hydration: no NG05xx and `ngDevMode.componentsSkippedHydration === 0`; the server HTML has no `inert` on any slide (read before the bundle runs), and after hydration exactly the unselected slides have it.
- With the main bundle held back: "next" and a bullet clicked before hydration apply once; Tab reaches the selected bullet before hydration; a pre-hydration scroll to slide 3 is adopted at hydration with one `selectedChange`, and slide 3 has no `inert` at any observation (a `MutationObserver` installed before the bundle loads reads `hasAttribute('inert')` in each callback); Tab to a link inside slide 2 before hydration, then hydration: focus is still on that link and slide 2 is selected.
- A zone-based build of the fixture (second configuration adding `zone.js`) becomes stable with rotation on and replays a pre-hydration click.
- `@defer (hydrate on viewport)`: the carousel hydrates when scrolled into view, then rotation starts.
- `@defer (hydrate never)`: the native residue scrolls and no error is logged.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA and JAWS on Chrome and Firefox, VoiceOver on macOS and iOS, and TalkBack on Chrome, on `orbit--autoplay` and `orbit--basics`: while rotating, slide changes produce no speech; Tab, or swipe navigation on iOS and Android, reaches the Rotation control first inside the carousel; after it stops rotation, Next and the bullets announce the new slide's content; the carousel is announced with its label and 'carousel', a focused slide with its name and 'slide'; ArrowRight on a focused slide moves focus to the new slide, announces its name and 'slide', and then its content once; slides out of view are never read.

## Out of Scope

- The APG basic carousel without bullets and the grouped style: the family implements the tabbed style, which building-blocks Table A chose; bullets are required.
- Cloned slides for a forward infinite loop, and any slide transition other than scrolling (fade, Motion UI classes, View Transitions).
- Pausing rotation while the carousel is off-screen or the document is hidden; multiple slides per view; vertical carousels.
- `bullets`, `navButtons`, `swipe`, `pauseOnHover`, `accessible`, `useMUI`, the class-name options, and the Motion class options.
- Runtime theming through custom properties (building-blocks 1.13).
- Automated screen-reader output: the manual release test under Testing Decisions covers it ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | Scroll-snap container; all slides in server HTML; height from a flex row | The prototype passed every case in three engines; first paint without JavaScript | `@if` slides with `animate.enter` (building-blocks 1.6 rule 2 fallback), retired |
| D2 | `div` container and slides | `tabpanel` is not allowed on `li` (axe `aria-allowed-role`, `list`) | Foundation's `ul`/`li`; `li[role=group]` |
| D3 | Tabbed carousel on Aria Tabs for the bullets; bullets required | APG tabbed style, building-blocks Table A; bullets are also the single-pointer alternative to swiping | Supporting the basic style as a second mode (optional bullets, and slides with a second role set) |
| D4 | Scroll only the container (`scrollBy` by the slide offset) | `scrollIntoView` moved the page by 120 px (prototype) | `scrollIntoView({block: 'nearest'})` |
| D5 | IntersectionObserver at 0.5 plus a pending target | Covers every native scroll source; one change per jump | A debounced `scroll` listener; `scrollend` (out of target) |
| D6 | `selected` model by value; `selectedChange` from `slidechange`; `beforeslidechange` dropped | Value-keyed pairing house rule; building-blocks 1.4 | `selectedIndex` (Material) |
| D7 | `playing` as a `linkedSignal` of `autoPlay` and `reducedMotion`, read-only, with `play()`/`stop()` | The rotation control needs the intent; the Breakpoint service spec asks for a live reduced-motion switch | A `playing` model duplicating `autoPlay`; Material's cached animations flag |
| D8 | Rotation stops on `:focus-visible` focus, pauses on hover outside the rotation control; `pauseOnHover` always on | APG rules; engine-independent for mouse clicks | Stopping on any `focusin` (Chromium stops on a mouse click, Safari does not); a `pauseOnHover` option |
| D9 | Timer from `afterRenderEffect`, outside the zone, full delay after every change | Rendering-modes rule 4; the zone build's replay failure | Foundation's remaining-time resume |
| D10 | `inert` only once live; server HTML hides no slide (ADR 0025) | Native scrolling reaches every slide before hydration; a visible `inert` slide fails 1.3.1 | Aria's server `inert` (the prototype's residue); a plain override of the hosted `TabPanel`'s `inert` (measured losing, D20) |
| D11 | Focus handoff recorded at the selection change (model notification, `ngOnChanges`, the live flip) and performed in an `afterRenderEffect` `write` phase, for every source of the change | Focus on a newly `inert` element falls back to `body`; until the render the new slide is still `inert`, so a synchronous `focus()` does nothing (the keyboard prototype, three engines); by the render the old slide is `inert`, so live focus must be read before it; a control inside a slide can change the slide too | A synchronous `focus()` in the observer callback (measured failing); reading focus inside the render callback (an engine may already have moved it to `body`); keeping the old slide out of `inert` while it holds focus (unmeasured, extra listeners, and a third input to `inert`); the observer path only |
| D12 | Selected bullet's pre-hydration tab stop from the directive, equal to Aria's value afterwards | Aria's server HTML has no tab stop | Accepting no keyboard access before hydration |
| D13 | Accept Aria's roving tab-stop drift after interaction | No public Aria API moves the active item; underscore members are off limits | `_pattern.setDefaultState()` |
| D14 | `infiniteWrap` scrolls back to the first slide | One copy of each slide; APG silent on direction | Cloned slides for a forward loop |
| D15 | Bullets' arrow keys always wrap, independent of `infiniteWrap` | APG Tabs; a wrapper cannot set Aria's `wrap` input from code | Binding `wrap` to `infiniteWrap` (needs a consumer binding) |
| D16 | Hide the container's scrollbar (`scrollbar-width: none` plus `::-webkit-scrollbar`) | Together they cover the whole Browser target; Foundation's Orbit had none; bullets are the pointer control | Accepting a scrollbar Foundation never showed |
| D17 | 24 px bullet floor, arrow background at rest, compile-time contrast checks | WCAG 2.2 AA 2.5.8, 1.4.11, 1.4.3 are requirements; axe cannot see them here | Recommending settings in the docs |
| D18 | Localised strings (`aria-roledescription`, labels) stay consumer markup, checked in dev mode | No English strings in the library; Foundation's docs already write `aria-label` | Built-in English defaults |
| D19 | The first render callback reconciles the selection before `inert` turns on: instant alignment for a bound non-first slide, otherwise the slide in view is adopted | No smooth scroll on page load; the slide in view, and a focus inside it, never meets `inert` | Leaving the first slide in view while another is selected; adopting through the observer's first report, a frame after `inert` applied |
| D20 | The slide hosts Aria's `TabPanel` and overrides only `inert`, derived from `TabPanel.visible()`; the bullets keep Aria's `Tabs`, `TabList`, `Tab`; the Orbit writes Aria's `selectedTab` synchronously | A binding computed from the same Aria signal changes in every pass in which Aria's does and is applied last (probe G; the keyboard prototype re-run, three engines; ADR 0037); `TabPanel` renders every other slide attribute and the bullets' `aria-controls`; the synchronous link keeps Aria's selection, and so `inert`, in the pass that renders the Orbit's | The custom tab panel contract of ADR 0034 (a static role, four bindings, an id generator, a pairing lookup, an `aria-controls` override, and a per-bullet warning, for a premise measured false); a plain override (measured failing); bullets before slides (fails on a later-pass selection change, `g7`); a registry-count flip (`g8`); a `Renderer2` correction; a late `value`; Aria's private panel collection |
| D21 | Page Down, Page Up, Home, End on a focused slide stay native and scroll the page | Focus stays in the carousel (measured in three engines); the APG carousel gives these keys no role; a later `keydown` handler would be additive | Intercepting them to scroll the container |
| D22 | Slides carry `aria-roledescription="slide"`, following the APG's tabbed carousel example over the pattern text (Tabbed Carousel Elements), so each slide is announced as a slide; the tab name carries the position ("Slide 2: ..."); dev check 4 keeps its slide half (amended 2026-09-26, audit 0005 M3) | The example is the APG's working implementation of the style this spec implements, and the root's "carousel" role description leads users to expect slides; where the two APG sources disagree, the example is the one tested as a running carousel; and it reads better: without it NVDA names a slide 'property page' ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)) | Following the pattern text: no `aria-roledescription` on a tab-panel slide, and dev check 4 without its slide half |

### Usage examples

```ts
@Component({
  selector: 'app-gallery',
  imports: [NfsOrbit, NfsOrbitRotation, NfsOrbitPrevious, NfsOrbitNext, NfsOrbitContainer, NfsOrbitSlide, NfsOrbitBullets, NfsOrbitBullet],
  template: `
    <div nfsOrbit #orbit="nfsOrbit" [timerDelay]="7000" [(selected)]="current"
         role="region" aria-roledescription="carousel" aria-label="Favorite space pictures">
      <button nfsOrbitRotation class="button small hollow">
        {{ orbit.playing() ? 'Stop automatic slide show' : 'Start automatic slide show' }}
      </button>
      <div class="orbit-wrapper">
        <div class="orbit-controls">
          <button nfsOrbitPrevious><span class="show-for-sr">Previous slide</span><span aria-hidden="true">&#9664;&#xFE0E;</span></button>
          <button nfsOrbitNext><span class="show-for-sr">Next slide</span><span aria-hidden="true">&#9654;&#xFE0E;</span></button>
        </div>
        <div nfsOrbitContainer>
          @for (slide of slides; track slide.id; let first = $first) {
            <div nfsOrbitSlide [value]="slide.id" aria-roledescription="slide">
              <figure class="orbit-figure">
                <img class="orbit-image" [src]="slide.src" [alt]="slide.alt" width="1200" height="500" [attr.loading]="first ? null : 'lazy'" />
                <figcaption class="orbit-caption">{{ slide.caption }}</figcaption>
              </figure>
            </div>
          }
        </div>
      </div>
      <nav nfsOrbitBullets aria-label="Choose slide to display">
        @for (slide of slides; track slide.id; let i = $index) {
          <button nfsOrbitBullet [value]="slide.id"><span class="show-for-sr">Slide {{ i + 1 }}: {{ slide.caption }}</span></button>
        }
      </nav>
    </div>
  `,
})
export class Gallery {
  protected readonly slides = [/* {id, src, alt, caption} */];
  protected readonly current = signal<string | undefined>(undefined);
}
```

```html
<!-- Content slides with deferred heavy content -->
<div nfsOrbitSlide value="stats" aria-roledescription="slide">
  <h3>Launch statistics</h3>
  @defer (on viewport) { <app-launch-chart /> } @placeholder { <div class="chart-placeholder"></div> }
</div>

<!-- Server-rendered page: hydrate the whole carousel when it is seen -->
@defer (hydrate on viewport) {
  <app-gallery />
}

<!-- Right-to-left subtree (Aria reads Directionality) -->
<div dir="rtl"> ... </div>   <!-- with Dir from @angular/cdk/bidi imported, or dir on <html> -->

<!-- Application-wide defaults -->
providers: [{ provide: nfsOrbitDefaultsToken, useValue: { timerDelay: 8000, infiniteWrap: false } }]
```

A carousel that must not rotate at all sets `autoPlay` to `false`; the rotation control may then be left out.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-orbit`, `foundation-button` (the rotation control's classes), `foundation-visibility-classes` (`.show-for-sr`), and Foundation's typography base. Its documented custom CSS is the `nfs-orbit` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-orbit`.

(1) Rules the mixin emits: the prototype's list (rules 1 to 8) plus the additions for WCAG 2.2 AA and the scrollbar (rules 0a, 0b, 9 to 12):

| # | Selector | Declarations | Why Foundation's CSS cannot provide it |
| --- | --- | --- | --- |
| 0a | None (compile-time check) | `@error` naming the setting when the ratio of `$orbit-bullet-background` against `$body-background`, of `$orbit-bullet-background-active` against `$body-background`, or of `$orbit-bullet-background-active` against `$orbit-bullet-background` is below 3, each ratio computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded (rule 0b's ratios likewise) | WCAG 1.4.11 (and 1.4.1 for the selected state); Foundation's `$medium-gray` bullets reach about 1.6:1 on white; axe has no 1.4.11 rule |
| 0b | None (compile-time check) | `@error` when the caption text colour (`color-pick-contrast($orbit-caption-background)`, as Foundation computes it) is below 4.5:1 against `$orbit-caption-background` composited over `$white` and over `$black` with Sass `mix()`, or `$white` is below 3:1 against `$orbit-control-background-hover` composited the same way, naming the setting | WCAG 1.4.3 and 1.4.11 over arbitrary images; Foundation's `rgba($black, 0.5)` caption band gives 3.7:1; axe marks text over images incomplete |
| 1 | `.orbit-container` | `height: auto` | Overrides Foundation's `height: 0` ("Prevent FOUC by not showing until JS sets height"); the flex row is as tall as the tallest slide |
| 2 | `.orbit-container` | `display: flex; align-items: flex-start` | Puts the absolute slides of Foundation in a row; slides keep their own height so each caption stays on its image (stretched slides failed `color-contrast`) |
| 3 | `.orbit-container` | `overflow-x: auto` | Overrides the x half of Foundation's `overflow: hidden` (the y half stays); native scrolling is the swipe |
| 4 | `.orbit-container` | `scroll-snap-type: x mandatory; overscroll-behavior-x: contain` | Snap positions; an edge overscroll must not become a browser back or forward swipe |
| 5 | `.orbit-container` inside `@media (prefers-reduced-motion: no-preference)` | `scroll-behavior: smooth` | Smooth programmatic moves only when motion is welcome |
| 6 | `.orbit-slide` | `position: relative` | Overrides Foundation's `position: absolute`; still positioned, so `.orbit-caption { position: absolute; bottom: 0 }` anchors to its slide |
| 7 | `.orbit-slide` | `flex: 0 0 100%` | One slide per container width (Foundation's `width: 100%` stays) |
| 8 | `.orbit-slide` | `scroll-snap-align: start; scroll-snap-stop: always` | A snap point per slide; one swipe moves at most one slide, as Foundation's swipe did |
| 9 | `.orbit-previous, .orbit-next` | `background-color: $orbit-control-background-hover` | Foundation shades the arrows only on hover and focus; the white glyph needs a background of its own over light images (WCAG 1.4.11) |
| 10 | `.orbit-bullets button` | `width: max(24px, #{$orbit-bullet-diameter}); height: max(24px, #{$orbit-bullet-diameter})` | WCAG 2.5.8; Foundation's 1.2rem (19.2 px) bullets 3.2 px apart fail both the size and the spacing exception |
| 11 | `.orbit-slide:focus-visible` | `outline-offset: -0.25rem` | The container clips the focus ring drawn outside the slide (WCAG 2.4.7); the UA ring is drawn inside instead; Foundation has no focus setting |
| 12 | `.orbit-container`; `.orbit-container::-webkit-scrollbar` | `scrollbar-width: none`; `display: none` | Foundation's Orbit never showed a scrollbar; `scrollbar-width` covers Firefox 64+ and Chromium 121+, the pseudo-element Chromium before 121 and Safari, so the pair covers the Browser target |

`.orbit-slide.no-motionui.is-active { top: 0; left: 0 }` needs no counter-rule, because `.no-motionui` is never set. The one non-CSS markup requirement of the layout is `tabindex="-1"` on the container, which the directive sets.

(2) Settings and functions reused, read from the consumer's compile: `$orbit-bullet-diameter`, `$orbit-bullet-background`, `$orbit-bullet-background-active`, `$orbit-caption-background`, `$orbit-control-background-hover`, `$body-background`, `$white`, `$black`, and Foundation's `color-luminance()` and `color-pick-contrast()` (Foundation's `color-contrast()` is not used for the comparisons, because it rounds to one decimal and would pass 2.95:1). The only literal values are the WCAG minimums (24 px, 3, 4.5) and the focus ring offset (0.25rem), for which Foundation has no setting; the mixin takes no parameters.

(3) Custom properties: none.

(4) Motion classes: none. The only motion is `scroll-behavior: smooth`, which rule 5 already limits to `no-preference`, so no further reduced-motion override is emitted.

(5) When the include is missing: Foundation's `height: 0` leaves nothing visible, slides stack absolutely, native scrolling and snapping are gone while the directives still scroll a container that cannot scroll, bullets fall back to 19.2 px, the arrow glyphs sit on the bare image, the focused slide's ring is clipped, and no contrast check runs.

### Platform features to adopt when the browser target moves

- `scrollend` (Safari 26.2): ends the pending target when the programmatic scroll settles instead of on the target's half visibility.
- `scrollbar-width` alone (Chromium 121, Safari 18.2): drops the `::-webkit-scrollbar` rule.
- `scroll-initial-target` (CSS Scroll Snap 2): replaces the instant initial alignment for a bound non-first slide, so the server HTML shows the right slide at first paint.
- Scroll snap events `snapchanged`/`snapchanging` (Chromium only today): would replace the IntersectionObserver for the slide in view.
- `@container scroll-state(snapped: x)`: could style the snapped slide without JavaScript.
- CSS carousel primitives (`::scroll-marker`, `::scroll-button()`) once Baseline and once their tab semantics match the APG: candidates to replace the bullets and arrows.

### Foundation behaviour changed or dropped

- The jQuery-only mechanics: Motion UI class juggling, `$.spotSwipe` synthetic swipe events, `.hide()`/`.show()` on slides, height measurement after `onImagesLoaded` and on resize, the "Current Slide" span moved between bullets, the focusable container with its own arrow keys, and `_destroy()` hiding the element.
- The forward wrap: now a scroll back to the first slide.
- Pause on click: clicking a slide no longer toggles rotation; keyboard focus stops it and hover pauses it.
- Hover resume: restarts the full delay instead of the remaining time.
- `aria-live="polite"` on the rotating slide: now `off` on the container while rotating.
- The rotation control, `aria-roledescription`, tab semantics on the bullets, and `inert` on out-of-view slides are added.
- Keyboard wrap on the bullets no longer follows `infiniteWrap` (APG Tabs always wraps).
