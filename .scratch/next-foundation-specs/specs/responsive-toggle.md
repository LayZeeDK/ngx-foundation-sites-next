# Spec: Responsive Toggle

Ticket: [Spec: Responsive Toggle](../issues/24-spec-responsive-toggle.md). Targets Angular 22.2, Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Revised under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) and the Variant typing rules ([ADR 0040](../adr/0040-variant-input-types.md)) by the [Re-run: Responsive Toggle spec under the class rule](../issues/116-rerun-responsive-toggle-class-rule.md).

## Problem Statement

A site built on Foundation for Sites shows its main navigation as a `.top-bar` (or any menu) on wide screens and, below a breakpoint, hides it behind a `.title-bar` with a hamburger button. Foundation's ResponsiveToggle plugin does the switching in jQuery: it reads `data-responsive-toggle="<menu id>"` and `data-hide-for` (default `medium`), watches a window `resize`-driven breakpoint event, and writes inline `display` on the title bar and on the menu. The button gets no `aria-expanded`, no `aria-controls`, and no name. Before the JavaScript runs, both the title bar and the menu are visible, which Foundation's docs call a flash of unstyled content and leave to the developer to fix with hand-written `.no-js` CSS.

An Angular developer on the next library needs the same title-bar behaviour without jQuery, and it has to be correct in every rendering mode: server-rendered HTML that shows the right element at every viewport width before hydration, prerendered pages, incremental hydration, event replay for a hamburger tapped before the bundle arrives, and zoneless change detection. The button must follow the WAI-ARIA disclosure pattern and be named from the visible title. The optional Motion UI in and out animation must keep working without Motion UI's JavaScript, and must respect reduced motion. The library must reuse Foundation's own CSS for the breakpoint switch rather than add styles of its own. And under the library's class rule the developer writes none of Foundation's classes, not `.title-bar`, `.menu-icon`, or `.top-bar`, and no library class, not even as the value of the animation Option.

## Solution

Two attribute directives, written beside the Top Bar spec's class directives on the markup Foundation already documents:

- `[nfsResponsiveToggle]` on the bar (Foundation's Title Bar, `nfsTitleBar`, or any element), taking a template reference to the menu (the typed counterpart of `data-responsive-toggle="<menu id>"`) and `hideFor` (default `medium`). It is the Openable: it holds the `isOpen` model, implements `open()`, `close()`, and `toggle()`, emits `opened` and `closed` when the change and its animation have finished, and provides `nfsOpenableToken`, so the bare `nfsToggle` on the menu icon (`button[nfsMenuIcon]`) inside the bar toggles the menu with no reference at all.
- `[nfsResponsiveToggleMenu]` on the toggled element (a Top Bar, `nfsTopBar`, a `nav`, any element), taking the optional `animate` Motion names (`"hinge-in-from-top spin-out"`, Foundation's own value), exactly where Foundation's docs put `data-animate`.

The Responsive Toggle binds no Structural class: `.title-bar`, `.title-bar-title`, `.menu-icon`, and `.top-bar` with its sections come from the [Spec: Top Bar](../issues/86-spec-top-bar.md), whose directives sit beside these on the same elements, and a bar or menu of the developer's own works without them. The breakpoint switch is Foundation's CSS, not JavaScript: the `.hide-for-<bp>` and `.show-for-<bp>` rules of Foundation's global styles (`foundation-visibility-classes`), which the consumer loads; the plugin binds those classes itself and needs no other library directive for them. The bar carries Foundation's `.hide-for-<hideFor>` class and the closed menu carries `.show-for-<hideFor>`, both host bindings, so from the very first byte of server HTML the bar shows and the menu hides below `hideFor`, and the bar hides and the menu shows at and above it. Opening removes `.show-for-<hideFor>` and adds the `.is-open` State class. The classes follow the `hideFor` input, never a breakpoint evaluation, so hydration changes nothing at any width and a `hydrate never` block still gives desktop visitors their navigation. The consumer writes no Visibility class and no `is-open`: `hideFor` and `[(isOpen)]` set them, and a copy of one this plugin binds, taken over from Foundation's markup, is stripped. The Breakpoint service is used only after the first render, to skip animations while the menu is shown anyway and to keep focus from being lost when a breakpoint crossing hides the element that holds it. There is no `hidden` attribute.

The Motion names map to the library's `nfs-` keyframe classes (`hinge-in-from-top` binds `nfs-hinge-in-from-top`); the consumer's own keyframe classes take Foundation's dot form. The library CSS of this plugin is only, for a `hideFor` outside `$breakpoint-classes`, the two Visibility classes Foundation does not emit there, on request. The menu icon's 24 by 24 px target is the Top Bar spec's `nfs-menu-icon`, and the title bar's colour settings are the Top Bar spec's too. The pair meets WCAG 2.2 AA: every criterion the title bar touches is a requirement with a test, listed under Implementation Decisions.

## User Stories

1. As an application developer, I want to put `[nfsResponsiveToggle]="menu"` beside `nfsTitleBar` on Foundation's title-bar markup, so that I keep Foundation's documented title-bar structure and write no Foundation class.
2. As an application developer, I want the title bar to reference the menu with a typed template reference, so that a typo is a compile error instead of a silent `console.error` about a missing id.
3. As an application developer, I want the bare `nfsToggle` beside `nfsMenuIcon` on the button inside the bar to toggle the menu, so that the button needs no reference, as Foundation's empty `data-toggle` did.
4. As an application developer, I want `hideFor` to default to `medium` and accept any breakpoint of the Breakpoint map, so that Foundation's `data-hide-for` carries over unchanged.
5. As a mobile visitor, I want only the title bar visible below `hideFor` and the menu hidden until I tap the button, so that the navigation does not fill my screen.
6. As a desktop visitor, I want the menu visible and the title bar hidden at and above `hideFor`, so that I see the full navigation without a toggle.
7. As a visitor on a server-rendered or prerendered page, I want the right element visible at my viewport width before any JavaScript runs, so that I never see both the title bar and the full menu at once.
8. As a visitor with JavaScript disabled or still loading, I want the desktop menu usable at desktop widths, so that navigation works before hydration.
9. As a mobile visitor who taps the hamburger before the page has hydrated, I want the menu to open once hydration finishes, so that my tap is not lost.
10. As a screen-reader user, I want the hamburger button announced with its visible title ("Menu"), which the `nfsTitleBarTitle` element's static `id` supplies, and its expanded or collapsed state, so that I know what it controls and whether the menu is open.
11. As a screen-reader user, I want the button to reference the menu it controls, so that assistive technology can relate the two.
12. As a keyboard user, I want Enter and Space on the hamburger to open and close the menu, and Tab to move into the open menu, so that I can navigate without a pointer.
13. As a keyboard user, I want focus to stay on the button when I open or close the menu, so that the disclosure behaves as the APG pattern describes.
14. As a keyboard user whose focused element is hidden by a breakpoint change or by the menu closing, I want focus moved to the equivalent control, so that focus is never dropped onto the page body.
15. As an application developer, I want `data-animate`'s in and out Motion names as the `animate` input on the menu (`animate="hinge-in-from-top spin-out"`), so that Foundation's animated title-bar example copies unchanged.
16. As an application developer, I want those names to animate the menu in and out with the library's keyframe versions (`nfs-hinge-in-from-top`, `nfs-spin-out`), so that I get Motion UI's look without Motion UI's JavaScript and without writing a library class.
17. As an application developer, I want a misspelt Motion name, a name of the wrong direction, or a library class name such as `nfs-spin-out` in `animate` to fail to compile, so that I learn at build time which values animate.
18. As a visitor who asked for reduced motion, I want the menu to open and close without animation, so that the page respects my setting.
19. As an application developer, I want `opened` and `closed` emitted once the menu has finished animating, so that I can run code after the change, as Foundation's `toggled.zf.responsiveToggle` allowed.
20. As an application developer, I want `[(isOpen)]` two-way binding, so that I can open or close the menu from my own state and read it back.
21. As an application developer, I want a change I make through the binding to animate exactly like a button press, so that the menu behaves the same however it is opened.
22. As an application developer, I want `open()`, `close()`, and `toggle()` on the directive (`#titleBar="nfsResponsiveToggle"`), so that I can control the menu from code.
23. As a single-page-application developer, I want a link inside the menu with `[nfsClose]="titleBar"` to close the menu when the visitor navigates, so that the mobile menu does not stay open over the new route.
24. As an application developer, I want the menu to be any element, a Top Bar or not, so that Foundation's "any element will work" still holds.
25. As an application developer, I want the menu's `id` taken from my markup or generated when I omit it, so that `aria-controls` is always valid.
26. As an application developer using `hideFor="xlarge"`, I want one documented Sass include that emits only the two visibility classes I need, so that I do not have to add `xlarge` to `$breakpoint-classes` and inflate every other Foundation component's CSS.
27. As an application developer using a `hideFor` outside `$breakpoint-classes`, I want the docs to name the include or the setting that emits its two Visibility classes, so that my title bar hides where I expect.
28. As an application developer, I want application-wide defaults for `hideFor` and `animate` through a Defaults token, so that I set them once for every title bar.
29. As an application developer migrating Foundation's markup, I want the docs to tell me to delete the `show-for-<bp>` and `hide-for-<bp>` classes (Foundation's FOUC habit) and `is-open` from the bar and the menu and to set `hideFor` or `[(isOpen)]` instead, and a copy of a class this plugin binds to have no effect, so that copied classes never fight the directives.
30. As an application developer using incremental hydration, I want to wrap the whole title bar and menu in one `@defer (hydrate on ...)` block, so that a tap hydrates and replays correctly.
31. As an application developer rendering `@defer (hydrate never)` content, I want to know that desktop visitors keep a working menu and mobile visitors get no toggle, so that I choose the block deliberately.
32. As a zoneless application developer, I want every state change to be a signal write, so that the directives need no `NgZone` or `markForCheck`.
33. As an application developer, I want `hideFor` changes at runtime to move the classes, so that a configurable layout works.
34. As a tester, I want story ids `responsive-toggle--<story>` shared by play functions and Playwright, so that every layer tests the same artifact.
35. As a library maintainer, I want the directives to declare no styles, so that the consumer's Foundation settings are the only source of CSS.
36. As a printing visitor, I want the printout to show the menu rather than the title bar, as Foundation's visibility classes already do, so that the navigation appears on paper as on a wide screen.
37. As a touch or tremor-affected pointer user, I want the hamburger to accept presses across at least 24 by 24 CSS px, which `nfsMenuIcon` and the `nfs-menu-icon` Library mixin of the Top Bar spec give it, so that I can hit it reliably (WCAG 2.2 success criterion 2.5.8).
38. As a low-vision visitor, I want the hamburger bars and the title text to contrast with the title bar at WCAG AA ratios, with the settings that keep them there documented, so that a custom colour scheme keeps the control visible (1.4.11, 1.4.3).
39. As a visitor zoomed to 400 percent or on a 320 px wide screen, I want the title bar and the open menu to fit without horizontal scrolling, so that I can use the navigation at any zoom (1.4.10).
40. As a keyboard user, I want a visible focus indicator on the hamburger and on every menu item, never hidden behind the title bar, so that I always see where I am (2.4.7, 2.4.11).
41. As an application developer, I want `[nfsResponsiveToggle]` on a header of my own with no Title Bar directive, and `[nfsResponsiveToggleMenu]` on a `nav` with no Top Bar directive, so that a custom bar and menu work too.
42. As an application developer, I want to name my own keyframe classes in Foundation's dot form, `animate=".menu-drop-in .menu-drop-out"`, so that a brand animation works where the library's Motion names do not fit.
43. As an application developer, I want a leaving name alone (`animate="fade-out"`) to animate only the close, and an entering value alone only the open, so that one direction can stay instant.

## Implementation Decisions

### Foundation contract

From Foundation 6.9's plugin source and docs (the Foundation plugin inventory B, section 5):

- Markup: `div.title-bar[data-responsive-toggle="<menu id>"][data-hide-for="medium"] > button.menu-icon[data-toggle="<menu id>" | data-toggle] + div.title-bar-title`, and the target `#<menu id>`, usually a `.top-bar`. "You don't even need to use Menu! Any element will work."
- Options (`ResponsiveToggle.defaults`), merged from the bar's `data-*` and then from the target's `data-*`:

| Option | Type | Default | Library |
| --- | --- | --- | --- |
| `hideFor` (`data-hide-for`) | breakpoint name | `'medium'` | `hideFor` input on `nfsResponsiveToggle` |
| `animate` (`data-animate`) | `false` or `"<in> <out>"` | `false` | `animate` input on `nfsResponsiveToggleMenu`, typed Motion names, default `''` |

- Events: `toggled.zf.responsiveToggle` on the bar after every toggle, after the Motion UI animation when `animate` is set; `mutateme.zf.trigger` on `[data-mutate]` descendants of the target after it shows; `init`/`destroyed` from the base class.
- Methods: `toggleMenu()` (a no-op at or above `hideFor`), `destroy()`.
- Behaviour: `_update()` on every breakpoint change shows the bar and hides the target below `hideFor`, hides the bar and shows the target at and above it (inline `display`); the toggler is every `[data-toggle]` in the bar whose value is the target id or empty; no ARIA at all.
- Dropped options and behaviour: reading options from the target element (each input has one home); `toggleMenu()`'s no-op at and above `hideFor` (the desktop menu is shown by CSS whatever the state, so the guard protects nothing); the reset to hidden on every breakpoint change (see Design decisions; decided at triage, 2026-09-26); `mutateme.zf.trigger` (Equalizer, Sticky, and Drilldown in the next library re-measure through `ResizeObserver`, which fires when a hidden element becomes rendered); `init`/`destroyed` events (Angular lifecycle).

### CSS class to Angular mapping

Every class the pattern's markup carries, per building-blocks 1.14 item 2. The Responsive Toggle binds only its Visibility classes, its State class, and its Motion classes; every Structural and Variant class of the bar, the menu icon, and a Top Bar menu is the [Spec: Top Bar](../issues/86-spec-top-bar.md)'s, written beside these directives and never hosted (that spec's D10). Menu, Dropdown Menu, and Button classes inside the menu are their specs'.

| Foundation class or attribute | Kind | Angular | Type; Sass setting and Variant registry | Value shape and the class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- |
| `.title-bar` | Structural | `NfsTitleBar` (`[nfsTitleBar]`, Top Bar spec), written beside `nfsResponsiveToggle`; the Responsive Toggle binds no Structural class, so any element can be the bar | n/a | Always | n/a |
| `.title-bar-title`, `.title-bar-left`, `.title-bar-right` | Structural | `NfsTitleBarTitle`, `NfsTitleBarLeft`, `NfsTitleBarRight` (Top Bar spec); the title carries the consumer's static `id` that names the menu icon | n/a | Always | n/a |
| `.menu-icon`, `.dark` on it | Structural, Variant | `button[nfsMenuIcon]` and its `dark` input (Top Bar spec), with the bare `nfsToggle` beside it | `dark`: `boolean` through `nfsVariantBoolean` (closed) | The Top Bar spec's | None |
| `.top-bar`, `.top-bar-left`, `.top-bar-right`, `.stacked-for-<bp>` | Structural, Variant | `NfsTopBar` with `stackedFor`, `NfsTopBarLeft`, `NfsTopBarRight` (Top Bar spec), written beside `nfsResponsiveToggleMenu`; any element can be the menu | `stackedFor`: `NfsClassBreakpoint` | The Top Bar spec's | `--nfs-breakpoint-classes` (Top Bar spec) |
| `data-responsive-toggle` | Plugin marker and Option | `[nfsResponsiveToggle]`, its main input `menu` | A required template reference to `NfsResponsiveToggleMenu` | n/a | n/a |
| `data-hide-for` | Option | `hideFor` on `nfsResponsiveToggle` | `NfsBreakpointName` (open, the Breakpoint map): this spec emits the classes for every breakpoint on request, so building-blocks 1.7 keeps the Option on the open type | A breakpoint name; default `'medium'` or the Defaults token | None |
| `.hide-for-<hideFor>` on the bar | Visibility class | Host binding of `nfsResponsiveToggle`, always present | From `hideFor` | `hide-for-<hideFor>` on; every other `hide-for-<bp>` of the Breakpoint map off | n/a |
| `.show-for-<hideFor>` on the menu | Visibility class | Host binding of `nfsResponsiveToggleMenu`, present while the menu is closed and not animating out | From `hideFor` and the phase | `show-for-<hideFor>` on while closed; every other `show-for-<bp>` off, always | n/a |
| `.is-open` | State | Host binding of `nfsResponsiveToggleMenu` while `isOpen` | n/a | On while `isOpen` | n/a |
| `data-animate` | Option | `animate` on `nfsResponsiveToggleMenu` | `NfsMotionPair` (primary entry point; closed Motion name unions plus the dot form), shared with the Toggler and the Dropdown pane | An entering value, a leaving name alone, both in Foundation's order, or `''` | n/a |
| Motion classes | Motion class | Host binding on the menu during the enter or exit phase only | From `animate` through `nfsMotionPairClasses` | A Motion name binds `nfs-<name>`; a dot-form class binds without its dot | n/a |
| `.no-js .top-bar`, `.no-js .title-bar` (Foundation's FOUC recipe) | Consumer CSS | None: replaced by the two Visibility class rows | n/a | n/a | n/a |

Rationale per row: Foundation's Visibility classes do the breakpoint switch (Foundation's "Preventing FOUC" effect, with Foundation's own classes), which is why the bar needs its own directive with host bindings in server HTML; `.is-open` is Foundation's State class vocabulary, and no Foundation rule styles it on a menu (only `.dropdown-pane` and `.off-canvas` use it), so it is a hook for consumer CSS and for tests and changes nothing visually; the Motion classes follow building-blocks 1.6 rule 1 (State class plus keyframes on a persistent element); the menu icon's ARIA comes from the Trigger beside it, and no ResponsiveToggle code runs on the button.

Binding rule (building-blocks 1.4). Each host binds one `computed` class record. The bar's holds `hide-for-<bp>` for every breakpoint of `nfsBreakpointsToken`'s map above the Zero breakpoint, and for `hideFor` itself, `true` only for `hideFor`. The menu's holds `show-for-<bp>` over the same keys, `true` only for `hideFor` while closed and not exiting, plus `is-open` and the phase's Motion classes. So a copied Visibility class of the Responsive Toggle's own family, or a copied `is-open`, is stripped on the server and in the browser. The Top Bar spec's class records sit beside these on the same hosts and bind other keys. The consumer's own classes stay. No class is left for the consumer to write (ADR 0039).

### Hierarchy and DI shape

```
div [nfsTitleBar] [nfsResponsiveToggle]="menu"     provides nfsOpenableToken (useExisting), exportAs nfsResponsiveToggle
  button [nfsMenuIcon] nfsToggle                   bare Trigger -> Nearest Openable = the title bar
  div [nfsTitleBarTitle] #title (static id)
nav [nfsTopBar] [nfsResponsiveToggleMenu]          exportAs nfsResponsiveToggleMenu; linked from the bar by template reference
  div [nfsTopBarLeft] ... [nfsClose]="titleBar" on links (optional)
```

`nfsTitleBar`, `nfsMenuIcon`, `nfsTitleBarTitle`, `nfsTopBar`, and `nfsTopBarLeft` are the Top Bar spec's, optional, and written beside; neither side imports the other's entry point.

- The title bar is the Openable, so the bare `nfsToggle` inside it resolves it through `inject(nfsOpenableToken, {optional: true, skipSelf: true})` (Triggers spec, ADR 0013). Its `id` signal is the menu's id, which `aria-controls` names.
- The bar links to the menu by typed template reference (`[nfsResponsiveToggle]="menu"` with `#menu="nfsResponsiveToggleMenu"`), the counterpart of `data-responsive-toggle="<id>"`; template references are hoisted within a template, so the menu may follow the bar as it does in Foundation's markup. The compiler resolves the reference: a template whose component does not import `NfsResponsiveToggleMenu` fails to compile at `#menu="nfsResponsiveToggleMenu"` (NG8003), and one that does not import `NfsResponsiveToggle` fails at `[nfsResponsiveToggle]="menu"` (NG8002).
- Reverse link: the bar registers itself with the menu from an `effect` whose cleanup unregisters, the Aria reverse-link shape the Triggers spec uses for `registerTrigger` (Aria's `MenuTrigger` sets `menu.parent` the same way), the reverse-link registration exception that building-blocks 1.5 and 1.9 name: the reference can change at runtime, which `ngOnInit` cannot follow. It writes only the menu's registry signal and no DOM, so it runs safely on the server. View effects run in `refreshView` after the template's input bindings and before host bindings of the same view (Angular's change detection source), and embedded and child views refresh after that, so the menu's host bindings see the bar in the first pass whenever the bar sits in the same view as the menu, in an enclosing view, or in an embedded view of it. Only a bar inside a child component with the menu in the parent renders the menu once without the bar; the synchronisation loop re-renders before the tick ends. The registration method is internal (excluded from the documented API).
- No plugin token of its own: nothing injects the title bar by class; `nfsOpenableToken` serves descendants and `exportAs` serves templates.
- No host directives: the Top Bar spec's class directives bind other classes and attributes, and a behaviour that may sit on any element is written beside the class directive (building-blocks 1.9).
- Defaults token, Shape B (building-blocks 1.4): `nfsResponsiveToggleDefaultsToken` with the all-optional `NfsResponsiveToggleDefaults` (`hideFor`, `animate`), read with `inject(token, {optional: true})` to seed the input defaults; provided at bootstrap, route, or element level, nearest wins. Both are Options, not Variant inputs, so the token may hold them.
- Injected: `NfsMediaQuery` (Breakpoint service), `nfsBreakpointsToken` (the keys of the two class records), `nfsAnimationsToken` (building-blocks 1.6 rule 5), CDK `_IdGenerator` (menu id), CDK `InteractivityChecker` (focus target in the menu), `DOCUMENT`, `Renderer2` (the focus rule's `focusin`/`focusout` listeners), `NgZone` (fallback timer outside the zone), and `HostAttributeToken('id')` (static id).
- Entry point: `ngx-foundation-sites/responsive-toggle`, holding both directives, the Defaults token, and the types; it imports `nfsOpenableToken` from the Triggers entry point, `NfsMediaQuery` and `nfsBreakpointsToken` from the media-query entry point, and `NfsMotionPair` (a type) and `nfsMotionPairClasses` from the primary entry point. It imports nothing from the top-bar entry point.

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
  readonly animate: InputSignal<NfsMotionPair>;  // explicit type argument; default: Defaults token, else ''
  readonly id: Signal<string>;                   // static id attribute, else generated 'nfs-responsive-toggle-menu-...'
}

interface NfsResponsiveToggleDefaults {
  hideFor?: NfsBreakpointName;
  animate?: NfsMotionPair;
}
const nfsResponsiveToggleDefaultsToken: InjectionToken<NfsResponsiveToggleDefaults>;
```

`NfsMotionPair` and `nfsMotionPairClasses` are the primary entry point's, as the [Re-run: Toggler spec under the class rule](../issues/109-rerun-toggler-class-rule.md) declares them over the Motion name types of the [Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md) (building-blocks 1.6 rule 4): an entering value alone (an `NfsMotionInName` such as `'hinge-in-from-top'`, or the dot form `` `.${string}` ``) or `''`, a leaving name alone (an `NfsMotionOutName` such as `'spin-out'`), or both halves separated by a space, entering first. `NfsBreakpointName` is the Breakpoint service's open type.

| Member | Foundation | Behaviour and deltas |
| --- | --- | --- |
| `menu` (`[nfsResponsiveToggle]`) | `data-responsive-toggle="<id>"` | Required typed reference; under strict templates a reference to the element instead of the directive fails compilation |
| `hideFor` | `data-hide-for`, default `'medium'` | An Option, not a Variant input: it also selects the Breakpoint service query, and its Foundation default sets a class, which a Variant input's default never does (building-blocks 1.4), so it keeps its Defaults token slot. Selects the Visibility classes and the Breakpoint service query; a runtime change moves the classes. It names a breakpoint of the Breakpoint map above the Zero breakpoint (usage rule 2): at the Zero breakpoint the bar would never show |
| `isOpen` | the target's `:hidden` state | `model(false)`. `true` from the moment an open is requested. It persists across breakpoint crossings (Foundation reset it to hidden on every breakpoint change) and may be `true` at or above `hideFor`, where the menu is shown either way |
| `isOpenChange` | none | Generated by the model; emitted for every write from inside (methods, Triggers), at request time |
| `opened` / `closed` | `toggled.zf.responsiveToggle` | Emitted when the change is committed and its animation has ended (or at once when no animation applies); a change interrupted by the opposite request emits nothing for the interrupted direction |
| `open(trigger?)` | `toggleMenu()` when hidden | Sets `isOpen` to `true`; records `trigger` as the focus-return target. Works at every width |
| `close(result?)` | `toggleMenu()` when shown | Sets `isOpen` to `false`; no veto, `result` is ignored |
| `toggle(trigger?)` | `toggleMenu()` | `isOpen() ? close() : open(trigger)` |
| `registerTrigger` | the `[data-toggle]` filter | Records Triggers so focus can return to the first one when no `trigger` was passed to `open()` |
| `id` | the target id | The menu's `id` signal |
| `triggerRole` | none | Always `disclosure` |
| `animate` (menu) | `data-animate`, on either element | One home, the menu. `NfsMotionPair`: the first half is the entering value and the second the leaving one; a missing half means that direction does not animate, and a leaving name alone animates only the close. A Motion name binds the library's keyframe class of that name (`hinge-in-from-top` binds `nfs-hinge-in-from-top`), so Foundation's docs value copies unchanged; a dot-form token, an Application class that is a keyframe animation, with a leading dot, binds that class without its dot (`".menu-drop-in .menu-drop-out"`); `''` animates nothing and overrides the Defaults token. A misspelt name, a leaving name in the entering place, Motion UI's `fast`/`slow` modifiers, and a library class name (`'nfs-spin-out'`) fail to compile (ADR 0039). A Motion name animates only with the `nfs-motion` include, and a dot-form class only with keyframes of its own (usage rule 4) |
| `id` (menu) | the element id | A static `id` attribute wins; otherwise `_IdGenerator` with the prefix `nfs-responsive-toggle-menu-`. Consumers set `id` statically, because a bound `[id]` would collide with the host binding |

State model, all signals (no `effect` propagates state; the reverse-link registration above writes only the menu's registry):

- `isOpen`: the model.
- `#live`: `false` until the bar's first `afterNextRender`; never set on the server.
- `#phase`: a `linkedSignal` of `isOpen` whose computation returns `'idle'` for the first value and whenever `#live` (read untracked) is still `false`, else `'entering'` when `isOpen` became `true` and `'exiting'` when it became `false`; completion writes `'idle'`. This makes a change through `[(isOpen)]`, a Trigger, or a method animate the same way, and keeps the initial state and every change made before the first render (server included) instant.
- `#motion`: `computed`, `nfsMotionPairClasses(animate())`, the entering and leaving classes.
- `#transition`: `computed`, equal to `#phase` unless the animation is skipped, then `'idle'`. Skipped when: not live; no class for that direction; `NfsMediaQuery.reducedMotion()`; `nfsAnimationsToken.disabled`; or `NfsMediaQuery.atLeast(hideFor)` (the menu is shown throughout, so there is nothing to animate).
- Menu class record: `show-for-<hideFor>` when `!isOpen() && #transition() !== 'exiting'`, every other `show-for-<bp>` `false`; `is-open` when `isOpen()`; the entering classes when `#transition() === 'entering'`; the leaving classes when `#transition() === 'exiting'`. `inert` while `#transition() === 'exiting'`.
- Bar class record: `hide-for-<hideFor>`, always, every other `hide-for-<bp>` `false`.

| State | `isOpen` | Menu classes (beside the Top Bar spec's) | `inert` | Below `hideFor` | At or above |
| --- | --- | --- | --- | --- | --- |
| Closed | `false` | `show-for-<bp>` | no | menu hidden | menu shown |
| Entering | `true` | `is-open` plus the entering class | no | menu animating in | not reached (skipped) |
| Open | `true` | `is-open` | no | menu shown | menu shown |
| Exiting | `false` | the leaving class | yes | menu animating out, not operable | not reached (skipped) |

Usage rules (each directive's JSDoc states the rules for its host, and the usage examples follow them):

1. Write no Visibility class (`show-for-*`, `hide-for-*`, and their `-only` forms) on the bar or the menu, and no `is-open` on the menu: set `hideFor`, and bind `[(isOpen)]` for an open menu (building-blocks 1.4; Foundation's FOUC recipe written as classes is deleted). The class records strip a copy of the classes this plugin binds (`hide-for-*` on the bar, `show-for-*` and `is-open` on the menu); any other Visibility class stays and fights the switch.
2. `hideFor` names a breakpoint of the Breakpoint map above the Zero breakpoint; at the Zero breakpoint the bar would never show.
3. One bar per menu: each `[nfsResponsiveToggle]` references a menu declared in the same template (`#menu="nfsResponsiveToggleMenu"`), and no second bar references a menu that already has one.
4. A non-empty `animate` half starts a CSS animation when its phase begins: a Motion name needs `@include nfs-motion;`, and a dot-form class needs keyframes of its own (a Motion UI transition class is not one); the library's Motion names are written without their prefix (`animate="fade-in"`, never `".nfs-fade-in"`); and a value holds at most one entering and one leaving value, entering first. A half that starts no animation completes its phase at once.
5. The Visibility classes for `hideFor` are in the consumer's CSS: `foundation-visibility-classes` is included, and a `hideFor` outside `$breakpoint-classes` is emitted by `@include nfs-responsive-toggle(<bp>)` or added to `$breakpoint-classes`. Without them the bar shows at every width and the closed menu never hides (Sass subsection, item 5).

The menu icon's `type`, its name, and its 24 px box are `nfsMenuIcon`'s (the [Spec: Top Bar](../issues/86-spec-top-bar.md)); the consumer names it from the visible title through `aria-labelledby`, or with visually hidden text inside the button (ARIA and keyboard). This plugin has no Variant input, and `hideFor` reads no Variant property: its classes come either from Foundation's `$breakpoint-classes` loop or from this plugin's opt-in include.

### Implementation level and primitives

Implementation level: native platform CSS through Foundation's own Visibility classes (`.hide-for-<bp>`, `.show-for-<bp>`) for the breakpoint switch and first paint, CSS keyframes for the animation, `inert` for the exiting menu; custom Angular directives for the state, the Openable contract, and the class bindings. `@angular/aria` 22.2 has no disclosure directive (the Aria inventory: eight patterns, none a disclosure). `@angular/cdk` supplies only small pieces: `_IdGenerator` and `InteractivityChecker`; `BreakpointObserver` is not used (the Breakpoint service wraps `MediaMatcher`). The Breakpoint service decides no first-paint state: `atLeast(hideFor)` is read only by the animation skip and the focus rule, both after the first render.

Not a Toggler variant with a breakpoint input: the title bar must provide the Openable so the bare `nfsToggle` inside it works, the bar itself needs a breakpoint class, and Toggler hides its target with `hidden`, which would hide the desktop menu in server HTML (audit 0002 H4; building-blocks 1.11 decision 8).

Primitives: `input()`, `input.required()`, `model()`, `output()`, `computed()`, `linkedSignal()`, one `effect()` for the reverse link, `afterNextRender` (the live flag, and the `focusin`/`focusout` listeners of the focus rule on the bar and the menu, added with `Renderer2.listen`), `afterRenderEffect` (fallback timer and completion, focus rule), host bindings (`[class]` with one computed class record per host, `[attr.id]`, `[attr.inert]`), `(animationend)`/`(animationcancel)` host listeners on the menu (filtered by `event.target === host`), `setTimeout` outside the zone, and the shared pure function `nfsMotionPairClasses`.

`injectAsync`: not used. Nothing here loads only after a client interaction: the title bar must be live at hydration so a replayed hamburger tap finds its Openable, and `InteractivityChecker` is needed in the focus rule's render callback at the crossing that hides the bar, where an awaited chunk would leave focus on `<body>`; the entry point is its own, so a consumer's `@defer` splits the pair. `afterEveryRender`: not needed, because each `afterRenderEffect` re-runs on its signals (`isOpen`, the phase, `hideFor`, and the Breakpoint service's reads).

Completion: measured, following the Toggler spec's rule, not a fixed design-time value. In an `afterRenderEffect` read phase after the class is bound, the directive reads the menu's computed `animation-name`, `animation-duration`, `animation-delay`, and `animation-iteration-count`, and takes the longest finite animation. If there is none (the class has no keyframes, the stylesheet is missing, or `nfs-motion` was not included), the phase completes at once. Otherwise it completes on the menu's `animationend` or `animationcancel` for that animation name with `event.target` equal to the menu, or on a fallback timer of the measured length plus 100 ms, started outside the Angular zone, whichever comes first. The timer starts in the same `afterRenderEffect` and is cleared by its cleanup when the phase changes. When `#phase` is non-idle but `#transition` is idle (skipped), the same effect completes at once; the signal write re-renders before the tick ends.

Focus rule (building-blocks 1.10 focus persistence; the Breakpoint service spec's consuming-directive rule 1), one `afterRenderEffect` that records its first values and acts only on later changes:

- Where focus is, is recorded continuously, not read in the callback. Foundation's Visibility classes hide the bar or the closed menu when the viewport crosses `hideFor`, before any render callback runs, and the browser then moves focus to `<body>`, so a callback that reads `document.activeElement` is too late (building-blocks 1.5). `focusin`/`focusout` listeners on the bar host and on the menu host, both of which survive every crossing (the Breakpoint service's consuming-directive rule 1, third place), keep the record: `focusin` records the host that holds focus, a `focusout` whose `relatedTarget` lies outside that host clears it, and a `focusout` without a `relatedTarget` (focus dropped to `<body>`) keeps it. The listeners are added with `Renderer2.listen` in `afterNextRender`, which first seeds the record from live focus; being added in code, they put no `jsaction` in server HTML and never replay.
- The moves run in the `write` phase, keyed on rendered state: the computed `display` of the bar and the menu, read in `earlyRead` (the state Foundation's CSS has rendered, not the Breakpoint service's answer), and the menu's exit phase as bound. Each acts only while `document.activeElement` is `<body>` or inside the host that stopped being operable, and clears the record:
  - When the menu stops being operable (it starts exiting, or a crossing below `hideFor` hides a closed menu) while the record names the menu, focus moves to the `trigger` passed to the last `open()`, else to the first registered Trigger.
  - When a crossing to `hideFor` or above hides the bar while the record names the bar, focus moves to the first tabbable element in the menu (DOM order, `InteractivityChecker.isTabbable`), else stays.
- Nothing moves when the record names neither host. The first-render handoff never moves focus: no class changes at hydration, so nothing that holds focus is hidden.

Fallback: none needed. Every mechanism is Baseline widely available on 2026-05-07 (`inert`, `animationend`, `matchMedia` change events, CSS keyframes) or a Foundation class, and the animation path is confirmed by the Motion UI prototype. The typed `animate` value is the Toggler's `NfsMotionPair`, whose name unions and dot form the Reveal re-run measured with `ngc` 22.2.0 strict templates.

### Comparison with Angular Material

Angular Material has no counterpart. The nearest thing is the consumer-side recipe in Material's navigation schematic: `BreakpointObserver.observe(Breakpoints.Handset)` into `toSignal`, then `[mode]` and `[opened]` on a `mat-sidenav`, with a `button[matIconButton]` toggle. That recipe decides visibility in JavaScript, so its server HTML is right at one width only, which is what this spec avoids. Borrowed through the Openable contract: the `isOpen` model (Material's `opened` state, renamed per building-blocks 1.3), `open()`/`close()`/`toggle()`, and Completion outputs after the animation (`MatDrawer`'s `openedChange` timing). Not borrowed: `BreakpointObserver`, Material's `Breakpoints` constants, promise-returning methods. The toggle button's own shape (a `type="button"` default, a required name) is the Top Bar spec's `nfsMenuIcon` comparison.

### ARIA and keyboard

Pattern: WAI-ARIA APG Disclosure, in the shape of the mobile navigation button of the APG disclosure-navigation example.

| Element | Role | Attributes | Who renders them |
| --- | --- | --- | --- |
| Hamburger `button[nfsMenuIcon]` | native `button` | `type="button"`; `aria-expanded` from `isOpen`; `aria-controls` = the menu id | `nfsMenuIcon` (`type`, the Top Bar spec); `nfsToggle` (the disclosure Trigger role) |
| Hamburger name | | `aria-labelledby` pointing at the `nfsTitleBarTitle` element's static `id` (visible text beats `aria-label`); alternative: visually hidden text inside the button (a `span` with Foundation's `show-for-sr` class, which the consumer writes as a normal class with Foundation's global styles loaded); the name is required and is a word, not a symbol | Consumer markup |
| Title `[nfsTitleBarTitle]` | none | a static `id` | Consumer markup; `.title-bar-title` from the Top Bar spec |
| Title bar | none | none | nothing |
| Menu | the consumer's element; a `nav` landmark is recommended, named with `aria-label` or `aria-labelledby` | `inert` only while animating out | `nfsResponsiveToggleMenu` |

- Hidden means `display: none` from Foundation's Visibility class, which removes the menu from the accessibility tree and the tab order; no `hidden`, no `aria-hidden`, and no `inert` on a closed menu, because the same element is the visible desktop menu (building-blocks 1.10 and 1.11 decision 8).
- At and above `hideFor` the bar and its button are `display: none`, so the disclosure state is simply absent; `aria-expanded` may still read `true` on the hidden button (the model persists), which no user agent exposes.
- Generated ids differ between server and client and are rewritten at hydration, since both `id` and `aria-controls` are bindings (building-blocks 1.5); the title's id is the consumer's static one.

| Key | Where | Behaviour |
| --- | --- | --- |
| Tab / Shift+Tab | page | Reaches the hamburger below `hideFor`; moves into the open menu next when the menu follows the bar in the DOM (recommended markup order); at and above `hideFor` the button is not rendered and the menu is in the tab order |
| Enter, Space | hamburger | Toggles the menu (native button activation, `click`) |
| Escape | | Nothing: the title-bar menu is in the page flow, not an overlay (building-blocks 1.10 reserves Escape for overlays; Foundation has none; the APG disclosure pattern requires none). A consumer who styles the menu as an overlay adds `(keydown.escape)="titleBar.close()"` |

Focus stays on the button when it opens or closes the menu; the focus rule above covers the cases where the focused element disappears.

### WCAG 2.2 AA requirements

The target is WCAG 2.2 level AA (user rule). Each criterion below is a requirement with the test that proves it; none is advice. Ratios are computed from Foundation 6.9.0's defaults with the exact WCAG relative-luminance formula and compared unrounded (Foundation's `color-luminance()` was measured passing failing pairs, and `color-contrast()` rounds to one decimal).

| Criterion | Requirement and how it is met | Foundation default | Test |
| --- | --- | --- | --- |
| 4.1.2 Name, Role, Value | The hamburger is a native `button[nfsMenuIcon]` with `aria-expanded` and `aria-controls` from the Trigger. Documented usage: the consumer names it from the visible title through `aria-labelledby` to the `nfsTitleBarTitle` element's static `id` (or with visually hidden text), a word and not a symbol; the name matches the visible label (2.5.3) | Fails: no name, no state, no relationship | axe `button-name` and ARIA rules in every story; SSR smoke asserts the attributes |
| 2.5.8 Target Size (Minimum) | The hamburger's box is at least 24 by 24 CSS px, by size and not by the spacing exception: the Top Bar spec's `nfs-menu-icon` gives every `.menu-icon` a transparent border on a content box around Foundation's unchanged 20 by 16 px drawing (its D6, measured in three engines), so this plugin adds no rule and no pseudo-element hit area. A title-bar menu icon that opens an Off-canvas panel gets the same box from the same include | Fails the size test: `foundation-menu-icon` calls `hamburger()` with its fixed 20 by 16 px and has no size setting | axe `target-size` in every story; `responsive-toggle--below-breakpoint` asserts the icon's box is at least 24 by 24 px; the geometry e2e is the Top Bar spec's (`top-bar--responsive`) |
| 1.4.11 Non-text Contrast | The hamburger bars and their hover colour contrast at least 3:1 with the title bar. Documented settings (the Top Bar spec's): `$titlebar-icon-color` and `$titlebar-icon-color-hover` at 3:1 or better against `$titlebar-background`, and, for the dark icon, `$black` and `$dark-gray` at 3:1 or better against `$body-background` | Passes: `#fefefe` on `#0a0a0a` is 19.63:1, the `#cacaca` hover 12.08:1; the dark icon (`#0a0a0a`, hover `#8a8a8a`) on a `#fefefe` page 19.63:1 and 3.42:1 | The stories compile Foundation's defaults, which pass; the Top Bar spec's `top-bar--menu-icon` play function computes each icon's bar colour against its surface |
| 1.4.3 Contrast (Minimum) | The title text contrasts at least 4.5:1. Documented setting (the Top Bar spec's): `$titlebar-color` at 4.5:1 or better against `$titlebar-background` | Passes (19.63:1) | axe `color-contrast` in every story |
| 1.4.3 Contrast (Minimum), links in the toggled Top Bar | When the toggled menu is a Top Bar holding links, as in Foundation's docs markup, the links contrast at least 4.5:1 with the bar and its submenus: `$anchor-color` at 4.5:1 or better against `$topbar-background` and against a differing `$topbar-submenu-background`. Required settings: a bar background on which `$anchor-color` reaches 4.5:1, for example `$topbar-background: $white;` (4.65:1), and, when that override follows the import of Foundation's settings file, `$topbar-submenu-background: $topbar-background;`, because the settings file copied the old bar colour into the submenu background at import time | Fails: `$anchor-color` (`#1779ba`) on Foundation's default `$topbar-background` (`$light-gray`, `#e6e6e6`) is 3.76:1 (3.755 unrounded); with only the bar line set after the settings file, open submenus keep `#e6e6e6` (measured by the Top Bar spec in three engines) | axe `color-contrast` on `responsive-toggle--default` (Foundation's docs markup) with a submenu open, under the Storybook settings overrides |
| 2.4.7 Focus Visible | The hamburger and menu items show the user agent's focus indicator; the library removes no outline. Foundation's global button reset removes the outline only under `[data-whatinput='mouse']`, which requires the what-input script the next library never loads, and then only for mouse input | Passes | e2e: after Tab to the hamburger, a screenshot comparison shows a focus indicator in three engines |
| 2.4.11 Focus Not Obscured (Minimum) | No focused element is hidden by author content: the title-bar menu is in the page flow, the closed menu is `display: none` and the exiting menu `inert`, so neither can hold focus, and the focus rule moves focus out of anything that gets hidden. A consumer who makes the title bar sticky (`nfsSticky` beside `nfsTitleBar`, or `position: sticky`) must set `scroll-padding-top` to the bar's height so focused menu items scroll clear of it, the [Spec: Sticky](../issues/28-spec-sticky.md)'s requirement; the docs state this as a requirement of that layout | Passes in Foundation's in-flow layout | e2e: tabbing through every item of the open menu on `responsive-toggle--sticky-title-bar`, each focused item's rectangle is not covered by the bar |
| 1.4.10 Reflow | At 320 CSS px (400 percent zoom) the page never scrolls horizontally with the menu open. The title bar is flex (`$global-flexbox`) and fits; a toggled Top Bar stacks its sections below `$topbar-unstack-breakpoint` and its menus wrap; a submenu's width is the menu Plugin's (the Dropdown Menu spec's `$dropdownmenu-min-width: min(200px, 45vw)`) | Passes: Foundation's Top Bar docs example, which is the Responsive Toggle docs markup, measures `scrollWidth` 320 at 320 px in three engines (the Top Bar spec's measurement); a menu that lists one link per row below `hideFor` (`nfsMenu` with `[orientation]="{small: 'vertical', medium: 'horizontal'}"`) is a layout choice shown in the usage examples, not a requirement | e2e at 320 by 640 px with the menu open: `document.documentElement.scrollWidth <= 320` |
| 2.1.1 Keyboard, 2.4.3 Focus Order | Native button activation; the menu follows the bar in the DOM, so Tab from the hamburger enters the open menu | Passes for the button; Foundation's markup already orders bar then menu | Story `responsive-toggle--below-breakpoint`; e2e real keys |
| 2.3.3 (AAA, not required) and reduced motion | Not a WCAG 2.2 AA criterion; honoured anyway (Animation) | Motion UI's JavaScript ignores it | Browser-level and e2e reduced-motion cases |

The axe gate in every story runs the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`) with `parameters.a11y.test = 'error'` (building-blocks 1.10).

### Rendered HTML

Consumer markup: Foundation's docs example with the deltas (the Top Bar spec's directives in place of every class, typed references, `aria-labelledby`, a `nav` target, a Motion name value). The blocks leave out the directives' selector attributes and static input attributes, which Angular keeps in the DOM (serialised in lowercase: `hidefor="medium"`, `animate="hinge-in-from-top spin-out"`); they have no effect in CSS. Class order is not significant.

```html
<div nfsTitleBar [nfsResponsiveToggle]="menu" #titleBar="nfsResponsiveToggle" hideFor="medium">
  <button nfsMenuIcon nfsToggle aria-labelledby="site-menu-title"></button>
  <div nfsTitleBarTitle id="site-menu-title">Menu</div>
</div>

<nav nfsTopBar nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" id="site-menu"
     animate="hinge-in-from-top spin-out" aria-label="Main">
  <div nfsTopBarLeft>...</div>
</nav>
```

Server HTML and first paint, closed (identical at every viewport width; hydration annotations omitted):

```html
<div class="title-bar hide-for-medium">
  <button class="menu-icon" type="button" aria-labelledby="site-menu-title"
          aria-expanded="false" aria-controls="site-menu" jsaction="click:;"></button>
  <div class="title-bar-title" id="site-menu-title">Menu</div>
</div>
<nav class="top-bar show-for-medium" id="site-menu" aria-label="Main">
  <div class="top-bar-left">...</div>
</nav>
```

`title-bar`, `menu-icon`, `type="button"`, `title-bar-title`, `top-bar`, and `top-bar-left` are the Top Bar spec's host bindings; `hide-for-medium`, `show-for-medium`, and `id` are this spec's; `aria-expanded`, `aria-controls`, and `jsaction` are the Trigger's. Below `medium` Foundation's `.show-for-medium` (`display: none !important` up to 0.2 px under 40em) hides the menu and the bar shows; at and above `medium`, `.hide-for-medium` hides the bar and the menu shows. The menu has no `jsaction` (`animationend` is not a replayable event type).

Server HTML, open by the consumer's initial `[(isOpen)]="true"`: the button reads `aria-expanded="true"`; the menu reads `class="top-bar is-open"` (no Motion class: the initial state never animates).

Hydrated, small viewport, after a tap (with `animate="hinge-in-from-top spin-out"`):

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

A bar and menu of the developer's own, with no Top Bar directive, and a copied Foundation class:

```html
<header [nfsResponsiveToggle]="nav" hideFor="large" class="site-header hide-for-medium"> <!-- hide-for-medium is copied from Foundation's markup: stripped; usage rule 1 deletes it -->
  <button nfsButton nfsToggle>Menu</button>
</header>
<nav nfsResponsiveToggleMenu #nav="nfsResponsiveToggleMenu" aria-label="Main">
  <ul nfsMenu [orientation]="{small: 'vertical', large: 'horizontal'}">...</ul>
</nav>

<!-- Server HTML: the copied class is gone -->
<header class="site-header hide-for-large">
  <button class="button" type="button" aria-expanded="false"
          aria-controls="nfs-responsive-toggle-menu-..." jsaction="click:;">Menu</button>
</header>
<nav class="show-for-large" id="nfs-responsive-toggle-menu-..." aria-label="Main">
  <ul class="menu vertical large-horizontal">...</ul>
</nav>
```

The copied `hide-for-medium` on the bar is of the Responsive Toggle's own family there, so the bar's class record strips it on the server and in the browser, and the Application class `site-header` stays; a copied `show-for-medium` or `is-open` on the menu is stripped the same way. A Visibility class this plugin does not bind on that host (`show-for-large` on the bar) is not stripped here, so it would stay and fight the switch, which is why usage rule 1 asks for no Visibility class at all.

### Animation

- Mechanism: building-blocks 1.6 rule 1 and ADR 0003. The menu is persistent (never inserted or removed), so `animate.enter`/`animate.leave` do not apply; the Motion classes are bound as classes on the in-DOM menu only for the duration of the enter or exit phase.
- Enter: removing `.show-for-<bp>` and adding the entering class in one render makes the menu rendered with the keyframe animation, which starts when it becomes rendered. Exit: the leaving class plays while the menu is still rendered (and `inert`); on completion one render removes the leaving class and restores `.show-for-<bp>`, and Foundation's Visibility class hides the menu below `hideFor`. The `nfs-motion` classes use `animation-fill-mode: both`, so the final exit frame holds until that render and nothing flashes.
- Classes: none by default (Foundation's `animate: false`). Foundation's docs value, `animate="hinge-in-from-top spin-out"`, binds `nfs-hinge-in-from-top` and `nfs-spin-out` from the `nfs-motion` mixin; any Motion name of building-blocks 1.6 rule 4 works the same way; the consumer's own keyframe classes take the dot form, one per half (`animate=".menu-drop-in .menu-drop-out"`), and carry their own reduced-motion rule.
- Completion: measured from the longest computed animation on the menu (Implementation level and primitives), then `animationend`/`animationcancel`, else a fallback timer of the measured length plus 100 ms; then `opened` or `closed`.
- Interruption: an opposite request mid-animation swaps the class (the new animation starts from its first frame) and restarts the timer; the interrupted direction emits no Completion output.
- Reduced motion: when `NfsMediaQuery.reducedMotion()` is `true`, no Motion class is bound and the change completes in the same tick; the `nfs-motion` mixin's own 1 ms override stays as the backstop for its classes. Binding nothing (rather than relying on the 1 ms override) also covers the consumer's own classes that carry no reduced-motion rule; the Breakpoint service spec's consuming-directive rule 3 allows this exception to its "CSS motion belongs to the Library mixins" rule.
- Tests: `nfsAnimationsToken` with `{disabled: true}` skips every Motion class; some test environments emit no animation events, which the fallback timer also covers.
- Rendering modes: nothing animates before the first client render (`#live`), so no Motion class is ever in server HTML and hydration plays nothing (the [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md) found that server-rendered elements must animate through signal-gated State classes).

### Rendering modes

Per ADR 0008 and the rendering-modes research, section 7 rules 1 to 11:

- Server-side rendering and first paint: every visible state is a host binding on signals that exist on the server: the bar's `.hide-for-<hideFor>`, the menu's `.show-for-<hideFor>` or `.is-open`, the menu `id`, the Trigger's ARIA, and, beside them, the Top Bar spec's Structural classes and the menu icon's `type` (rule 1). The breakpoint switch is Foundation's CSS media queries, so the server HTML is correct at every width without knowing the viewport (rule 9); the Server breakpoint plays no part. The class records read `nfsBreakpointsToken`, the same on server and client, and strip a copied Visibility class or `is-open` on both.
- Before hydration: the directives read no `window`, no `matchMedia`, no computed style, and start no timer outside render callbacks (rules 3 to 5). The reverse-link `effect` runs on the server and writes only a signal.
- First-render handoff (ADR 0014): when the client breakpoint is at or above `hideFor`, nothing re-renders and no class changes, because no binding reads the breakpoint. The live values reach only the animation skip and the focus rule, and the focus rule's first run records values without acting. [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md) therefore does not affect this spec's first paint.
- Full hydration: host binding values equal the server's apart from generated ids, so hydration changes nothing visible and there is no structure to mismatch (rule 10).
- Event replay: the only replayable listener is the Trigger's `click` host listener on the hamburger (`jsaction="click:;"`); `nfsMenuIcon` declares none. A tap before hydration is queued and replayed after hydration; `afterNextRender` runs before replay, so `#live` is already `true` and the replayed toggle animates. The handler belongs to the Triggers utility and calls no `preventDefault()`. The menu's `(animationend)` does not replay, which is correct: nothing animates before hydration.
- Hydration boundary: the title bar, its Triggers, and the menu belong to one hydration boundary; a consumer `@defer (hydrate on ...)` wraps all of them (rule 7). Template-reference scoping stops a bar outside a block from naming a menu inside it.
- `@defer`: library templates contain no `@defer`; the entry point is its own, so a consumer can defer it. Inside a dehydrated block the pair is its server HTML: correct visibility at every width, and a tap on the hamburger hydrates the block and replays. Inside `@defer (hydrate never)` the desktop menu stays usable at and above `hideFor` (its links are native), while below `hideFor` the menu stays hidden and the hamburger does nothing; the spec documents that residue. Plain `@defer` renders on the client with the live breakpoint and no animation for the initial state.
- Incremental hydration triggers: `hydrate on interaction` annotates the block's root nodes with `click`, so a tap on the bar hydrates and replays; `hydrate on viewport` suits a title bar below the fold.
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Zoneless: every change is a signal write (model, `linkedSignal`, the live flag); the fallback timer runs outside the zone and its expiry is a signal write, which schedules change detection in zoneless and hybrid zone applications alike.
- Print: Foundation's `.show-for-<bp>` query is `screen` only and `.hide-for-<bp>` includes `print` for breakpoints up to `$print-breakpoint`, so a printout shows the menu and hides the bar, as Foundation's own classes do.

### Sass and custom CSS

The breakpoint switch needs no CSS for `hideFor` values in `$breakpoint-classes` (Foundation's default `small medium large`): Foundation's `foundation-visibility-classes` already emits `.hide-for-<bp>` and `.show-for-<bp>`. For a `hideFor` outside `$breakpoint-classes` (`xlarge`, `xxlarge`, or a custom breakpoint), the consumer names the breakpoint and the `nfs-responsive-toggle` Library mixin emits exactly those two Visibility classes through Foundation's `hide-for()` and `show-for()` mixins; that is all the mixin emits. The menu icon's 24 px box is the Top Bar spec's `nfs-menu-icon`, included after `foundation-menu-icon`, and the colour settings of the title bar and the Top Bar are the Top Bar spec's. Details in the Sass subsection of Further Notes. No directive declares `styles` or `styleUrl`.

## Testing Decisions

A good test asserts what a visitor or assistive technology observes: which of bar and menu is displayed at a width, `aria-expanded` and `aria-controls` on the button, the menu's State and Motion classes and `inert`, where focus lands, and when `opened` and `closed` fire. No test reads private fields. There is no prior art in the new repository; the patterns are the building-blocks testing rule, the Triggers and Breakpoint service specs, the Toggler spec's Motion cases, the Top Bar spec's class-record and menu-icon cases, and the harness of the [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).

Story ids follow `responsive-toggle--<story>`: `responsive-toggle--default` (Foundation's docs markup, `hideFor="medium"`), `responsive-toggle--below-breakpoint` (`hideFor="xxlarge"`, so the toggle is active at every test viewport up to 1440 px; the Storybook stylesheet includes `@include nfs-responsive-toggle(xlarge xxlarge);`, which the story also documents), `responsive-toggle--animated` (`hideFor="xxlarge"`, `animate="hinge-in-from-top spin-out"`), `responsive-toggle--two-way-binding`, `responsive-toggle--close-on-navigate`, `responsive-toggle--sticky-title-bar` (`hideFor="xxlarge"`; a scroller, a `div` with Foundation's `overflow-y-scroll` class, written as a normal class because the Prototyping Utilities have no first-milestone spec, and printed by the preview's `foundation-everything($prototype: true)`, and an inline height and `scroll-padding-top: 3rem`, holds the bar, held at its top by an inline `position: sticky; top: 0`, the open menu, and filler content, so tabbed menu items scroll under the bar's edge). Every story writes the bar as `nfsTitleBar` with a `button[nfsMenuIcon]` carrying a bare `nfsToggle` and an `nfsTitleBarTitle` with a static `id`, and the menu as `nfsTopBar` with `nfsTopBarLeft` and `nfsTopBarRight`, as the [Spec: Top Bar](../issues/86-spec-top-bar.md) names them; `responsive-toggle--default` holds Foundation's docs content as that spec writes it (`ul[nfsDropdownMenu]` with `li[nfsMenuText]`, a `li[nfsMenuItem]` with `button[nfsSubmenuToggle]` and `ul[nfsSubmenu]`, and a `role="search"` form with a labelled field and an `nfsButton` submit). These are their specs' directives, imported as scaffolding; no story writes a Foundation or library class other than that scroller's `overflow-y-scroll`, with Foundation's global styles loaded in the preview.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

Every story runs axe with `parameters.a11y.test = 'error'` and the six tags of the preview's rule set (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`, which include `target-size`, `button-name`, and `color-contrast`), under the Storybook preview stylesheet with `nfs-menu-icon` and `nfs-responsive-toggle(xlarge xxlarge)` included and the settings overrides of the Sass subsection. Play functions assert classes and ARIA, which do not depend on the viewport, and assert computed visibility only in the stories whose `hideFor` is `xxlarge`.

- `responsive-toggle--default`: the bar carries `title-bar` and `hide-for-medium`, the menu `top-bar` and `show-for-medium`; the button carries `menu-icon` and `type="button"`, and has `aria-expanded="false"`, `aria-controls` equal to the menu id, and the accessible name "Menu"; a click sets `aria-expanded="true"`, removes `show-for-medium`, adds `is-open`, and leaves the Top Bar spec's classes unchanged; with a submenu opened by its toggle, axe still passes; a second click restores both.
- `responsive-toggle--below-breakpoint`: the bar is displayed and the menu is not; the menu icon's box is at least 24 by 24 px; a click displays the menu and focus stays on the button; Enter and Space through `userEvent.keyboard` toggle it; Tab from the button reaches the first menu link.
- `responsive-toggle--animated`: after a click the menu carries `is-open nfs-hinge-in-from-top`, then only `is-open` once `opened` has fired (the story logs it); after a second click it carries `nfs-spin-out` and `inert`, then `show-for-xxlarge` once `closed` has fired, and is not displayed.
- `responsive-toggle--two-way-binding`: an external checkbox bound to `[(isOpen)]` opens and closes the menu with the same classes and animation as the button, and a button click updates the checkbox.
- `responsive-toggle--close-on-navigate`: a menu link with `[nfsClose]="titleBar"` closes the menu, and focus moves to the hamburger.
- `responsive-toggle--sticky-title-bar`: a click on the menu icon sets `aria-expanded="true"` and displays the menu; the bar's computed `position` is `sticky`. Whether a focused item is obscured is the e2e case, in three engines.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here. The test hosts write plain elements with the two directives and no Top Bar directive, except the composition case.

`MediaMatcher` is replaced with a controllable fake (the Breakpoint service spec's seam) so tests move across `hideFor` and toggle reduced motion.

- Phase model: the initial state never animates; `[(isOpen)]` writes, Trigger clicks, and method calls produce the same class sequence; an opposite request mid-animation swaps the Motion class, restarts the timer, and emits only the final direction's Completion output.
- Motion values: each `NfsMotionPair` shape binds the expected classes for each direction (a pair; an entering name alone closes at once; a leaving name alone opens at once); `''` overrides a Defaults token default; the dot form binds the test stylesheet's own classes without their dots; a value of another shape, reached through `$any()` or through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`), animates nothing and completes at once.
- Completion: `animationend` from the menu completes; an `animationend` bubbling from a descendant does not; `animationcancel` from the menu also completes; a Motion name whose keyframes are absent from the test document completes at once; an animation whose `animationend` is suppressed completes after the measured length plus 100 ms (fake timers).
- Skips: reduced motion on, `nfsAnimationsToken` `{disabled: true}`, an empty or one-direction `animate`, and a viewport at or above `hideFor` each bind no Motion class for the skipped direction and emit `opened`/`closed` in the same tick; with a fake viewport at or above `hideFor`, `open()` sets `isOpen` and `is-open` but binds no `inert`.
- Persistence: open below `hideFor`, cross above and back; the menu is still open and `isOpen` never changed.
- Focus rule: focus inside the menu when it starts exiting moves to the `trigger` given to `open()`, else to the first registered Trigger; focus inside a closed menu when the fake viewport crosses below `hideFor`, with a test style hiding the menu at the same step as the Visibility class would, moves to the hamburger; focus on the hamburger when it crosses above, with the bar hidden the same way, moves to the first tabbable menu element; nothing moves while the host stays displayed; focus elsewhere never moves; the first render never moves focus.
- Reverse link: the menu's classes are present in the first rendered pass with the bar before, after, and around the menu (`@if`); swapping the bound menu moves the registration; destroying the bar unregisters.
- `hideFor` runtime change moves `hide-for-*` and `show-for-*` together.
- Class records: a static `class="hide-for-large app-bar"` on a bar with `hideFor="medium"`, and `class="show-for-medium is-open"` on a closed menu, are stripped and the Application class stays, with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose map adds `xlarge`; a copied `show-for-large` on the bar stays.
- Composition: beside `nfsTitleBar`, `nfsMenuIcon`, and `nfsTopBar`, both hosts carry the Top Bar spec's classes and this spec's, and a toggle changes only this spec's.
- Defaults token: `hideFor` and `animate` seed from it; an element-level provider wins over a root one.
- Zoneless: the suite runs with zoneless change detection and `fixture.whenStable()`.

### 3. Node-level Vitest

- SSR smoke, under `npx nx test <lib>` in `responsive-toggle.ssr.spec.ts` through the shared `renderServer()` helper (`npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not): a fixture whose template writes no `class` attribute except where a case copies one, with one closed pair written with the Top Bar spec's directives (`hideFor="medium"`, `animate="hinge-in-from-top spin-out"`), one pair open through the initial binding, one with `hideFor="large"`, one plain `header` and `nav` pair with no Top Bar directive and no menu `id`, and one pair with a copied `hide-for-large` on the bar and `show-for-medium` on the menu. Assert that `whenStable()` resolves; each bar carries `hide-for-<bp>` (and `title-bar` where `nfsTitleBar` sits beside); the plain bar carries only `hide-for-<bp>`; the closed menu carries `show-for-<bp>` and no `is-open`; the open menu carries `is-open` and no `show-for-<bp>`; the copied classes are absent; no Motion class and no `inert` anywhere; the generated menu id equals the button's `aria-controls`; the menu icon carries `type="button"`; the hamburger carries `jsaction="click:;"` and the menu no `jsaction`; no `MediaMatcher` query was made.
- Pure logic: the class-record function (`hideFor`, the phase, `isOpen`, and a Breakpoint map to the two records), table-driven over every breakpoint of the default map, a renamed Zero breakpoint, and an unknown `hideFor`. `nfsMotionPairClasses` is the primary entry point's, covered by the Toggler spec's table.
- Sass compile (the Sass packaging decision's node-level test): `@include nfs-responsive-toggle(xlarge);` against Foundation's defaults emits `.hide-for-xlarge` and `.show-for-xlarge` identical to Foundation's `hide-for(xlarge)` and `show-for(xlarge)` output and nothing else; a breakpoint already in `$breakpoint-classes` emits no Visibility class; an include without an argument fails the compile (Sass's missing-argument error); a changed `$breakpoints` value changes the output.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Against the static Storybook build, in Chromium, Firefox, and WebKit:

- Viewport thresholds on `responsive-toggle--default`: at 375 px and at 639 px the bar is displayed and the menu is not; at 640 px and at 1300 px the bar is not and the menu is; opening at 375 px then resizing to 1300 px and back keeps the menu open.
- Focus across a real resize, with real CSS: keyboard focus on the hamburger at 375 px, resize to 1300 px, focus lands on the first menu link; keyboard focus on a menu link at 1300 px with the menu closed, resize to 375 px, focus lands on the hamburger; in neither case does focus rest on `<body>`.
- `reducedMotion: 'reduce'` on `responsive-toggle--animated`: no Motion class is ever observed and `opened` fires at once.
- Print emulation (`page.emulateMedia({media: 'print'})`) at 375 px: the menu is displayed and the bar is not.
- WCAG 2.2 AA cases that need real layout: focus visible (2.4.7) by a screenshot comparison before and after Tab to the hamburger; reflow (1.4.10) at 320 by 640 px with the menu open, `scrollWidth <= 320`; focus not obscured (2.4.11) on `responsive-toggle--sticky-title-bar`: with the menu open, after each Tab through its items, the focused item's rectangle does not intersect the bar's. The menu icon's target size (2.5.8) is the Top Bar spec's e2e on `top-bar--responsive`, the same layout.

Against the prerendered fixture app:

- JavaScript disabled at 375 px and at 1300 px: screenshot plus `@axe-core/playwright` with the six tags; the correct element is displayed at each width and the desktop menu links work at 1300 px.
- Hydration at 1300 px and at 375 px: no NG05xx, `ngDevMode.componentsSkippedHydration === 0`, and the class attributes of the bar and the menu are identical before and after hydration.
- Pre-hydration tap at 375 px with the main bundle held back: the menu opens exactly once after hydration and no error is logged.
- `@defer (hydrate on interaction)` around the pair: a tap on the hamburger loads the chunk, hydrates, and opens the menu.
- `@defer (hydrate never)`: at 1300 px the menu is displayed and its links navigate; at 375 px the menu stays hidden and the hamburger does nothing, with no error logged.

## Out of Scope

- The menu's own behaviour (DropdownMenu, Drilldown, AccordionMenu, ResponsiveMenu inside the Top Bar) belongs to those specs. Consumers align Foundation's `$topbar-unstack-breakpoint` and the Top Bar's `stackedFor` with `hideFor` in their own markup and settings; the two are not linked by Foundation either.
- The Title Bar, the Menu icon, the Top Bar, their classes, the menu icon's `type` and 24 px box, and the colour settings of the bars: the [Spec: Top Bar](../issues/86-spec-top-bar.md), whose directives are written beside these.
- The Trigger's ARIA and click handling belong to the [Spec: Triggers (shared utility)](../issues/54-spec-triggers.md); breakpoint state belongs to the [Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md).
- Overlay-style mobile menus (focus trapping, Escape, scroll locking) are OffCanvas's job; this spec keeps Foundation's in-flow title-bar menu.
- A generated title id and an `aria-label` input: the name is consumer markup, the visible title named by its static `id` (RT6 of the out-of-scope triage; the title directive is the Top Bar spec's `nfsTitleBarTitle`).
- Runtime theming of the title bar; `$titlebar-*` settings stay compile-time Foundation settings.
- Keeping the Breakpoint map (`nfsBreakpointsToken`) equal to the consumer's Sass `$breakpoints`: the Breakpoint service spec's documented usage.
- Motion UI transition classes, the `motion-ui` package, and the `fast`/`slow` speed modifiers (ADR 0003); Motion UI names outside the `nfs-motion` set, which a consumer writes as its own keyframe class in the dot form.

## Further Notes

### Design decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Directives | `[nfsResponsiveToggle]` on the bar, `[nfsResponsiveToggleMenu]` on the target | Foundation's markup already has both elements; both need host bindings in server HTML (ADR 0001) |
| Structural classes of the bar, icon, and menu | None of this plugin's; the Top Bar spec's `nfsTitleBar`, `nfsTitleBarTitle`, `button[nfsMenuIcon]`, `nfsTopBar`, and its sections, written beside, never hosted | ADR 0039 gives each Structural class one directive, and the Top Bar spec owns these (its D10); the Responsive Toggle may sit on any element, so hosting would force `.title-bar` and `.top-bar` on custom bars (building-blocks 1.9) |
| Toggler variant or own directive | Own directive | The bar must be the Openable and carry a breakpoint class; Toggler's `hidden` would hide the desktop menu before hydration |
| Breakpoint switch | Foundation's `.hide-for-<bp>` on the bar and `.show-for-<bp>` on the closed menu, host bindings from the static `hideFor` | Correct server HTML at every width, no swap at hydration, a usable desktop menu in `hydrate never` (audit 0002 H4; building-blocks 1.11 decision 8); no library CSS for the switch itself |
| `hideFor` kind and type | An Option typed `NfsBreakpointName`, default `medium`, in the Defaults token | It also selects the Breakpoint service query, and its Foundation default sets a class, which no Variant input's default may (building-blocks 1.4); building-blocks 1.7 keeps the open type because this spec emits the classes for every breakpoint on request |
| Copied Visibility classes and `is-open` | One class record per host over every non-zero breakpoint of the Breakpoint map strips the plugin's own family; usage rule 1 asks for no Visibility class and no `is-open` in the markup | Building-blocks 1.4's binding rule, as the Top Bar and Menu specs apply it; Foundation's FOUC habit written as classes would otherwise fight the bindings, and a Visibility class this plugin does not bind on that host is not stripped here, so only the markup can leave it out |
| `hidden` or `popover` | Neither | `hidden` would hide the desktop menu; `popover` is out of target and moves the menu out of the page flow |
| `.is-open` | Bound while `isOpen`, no CSS | Foundation's State class vocabulary; a hook for consumers and tests; no Foundation rule styles it on a menu |
| Link direction | Bar references the menu (`[nfsResponsiveToggle]="menu"`); the bar registers with the menu through an effect | Mirrors `data-responsive-toggle="<id>"`; view effects run before host bindings, so the menu is right in the first pass |
| `hideFor` home | Bar only | Foundation's docs put it there; one home per input |
| `animate` home | Menu only | Foundation's docs example puts `data-animate` on the menu, the element that animates |
| `animate` type | `NfsMotionPair` over the shared Motion names, mapped by `nfsMotionPairClasses`; the consumer's own classes in the dot form | ADR 0039: a Motion input takes `'fade-in'`, never `'nfs-fade-in'`; one pair type for the Toggler, the Dropdown pane, and this input (the Toggler re-run's decision); Foundation's `data-animate` value copies unchanged, and a typo or a library class name fails to compile |
| State on a breakpoint crossing | `isOpen` persists; nothing is written | Foundation's reset was a side effect of rewriting inline `display` on every breakpoint change; writing the model from a breakpoint change would need an `effect` propagating state, which building-blocks 1.5 forbids; the menu looks the same at and above `hideFor` either way. Decided at triage (2026-09-26): impact not HIGH (behaviour of one directive, no API), confidence HIGH |
| `open()` at and above `hideFor` | Works (no guard) | The desktop menu is shown by CSS whatever the state, so Foundation's guard protects nothing |
| Animation | Motion classes bound only during the phase, through a `linkedSignal` phase | One path for bindings, Triggers, and methods; no Motion class in server HTML; persistent element, so no `animate.enter` |
| Completion | Measured longest animation on the menu, then `animationend`/`animationcancel`, else a timer of the measured length plus 100 ms | Building-blocks 1.6 rule 1, refined by the Toggler spec: a Motion name's length is the consumer's `nfs-motion` settings and a dot-form class is the consumer's, so no design-time constant knows it; a missing animation measures zero and completes at once |
| Reduced motion | No Motion class bound | Covers the consumer's own classes that have no reduced-motion rule |
| `inert` | Only while exiting | The exiting menu is still rendered but on its way out; a closed menu is `display: none`, and an `inert` there would disable the desktop menu |
| Focus | Moves only when the focused element is hidden or made inert | APG disclosure keeps focus on the button; building-blocks 1.10 focus persistence |
| Escape | None | In-flow content, not an overlay |
| `toggled.zf.responsiveToggle` | `opened`/`closed`, plus `isOpenChange` from the model | Foundation fires `toggled` after the animation, the Completion outputs' timing |
| Plugin token | None | Nothing injects the bar by class; `nfsOpenableToken` and `exportAs` cover every use |
| Title-bar name | Consumer `aria-labelledby` to the `nfsTitleBarTitle` element's static `id` | Visible text beats `aria-label` (APG names practice); static ids are hydration-safe; RT6: the title directive returns (the Top Bar spec's), a generated id and an `aria-label` input stay out |
| `hideFor` outside `$breakpoint-classes` | Opt-in `nfs-responsive-toggle(<bp>...)` emitting only the two classes; its argument is required and names breakpoints of `$breakpoints` above the Zero breakpoint | Adding a breakpoint to `$breakpoint-classes` also multiplies the grid, alignment, and visibility classes of every Foundation component; the mixin's only rules are the requested classes, so an include that names none fails the compile (Sass's missing-argument error) instead of emitting nothing |
| Target size (2.5.8) | The Top Bar spec's `nfs-menu-icon` border box on every `.menu-icon`; no rule here | Measured by the Top Bar spec in three engines: axe passes the border box beside another target and fails the pseudo-element hit area this spec used to emit; one include serves the Responsive Toggle's and Off-canvas's title bars |
| Contrast (1.4.11, 1.4.3) | The Top Bar spec's documented settings for the title bar and the Top Bar; this plugin draws no colour pair of its own | The pairs are drawn by the Foundation components the Top Bar spec owns; this spec's figures use the exact WCAG formula, because Foundation's `color-luminance()` was measured passing failing pairs and `color-contrast()` rounds |
| Reflow (1.4.10) | A requirement with an e2e case; no orientation required | The Top Bar spec measured Foundation's docs markup at `scrollWidth` 320 at 320 px in three engines, so the published claim that it overflows did not hold; a stacked mobile menu stays a documented layout choice |

### Usage examples

Foundation's title bar with a top bar:

```html
<div nfsTitleBar [nfsResponsiveToggle]="menu" hideFor="medium">
  <button nfsMenuIcon nfsToggle aria-labelledby="nav-title"></button>
  <div nfsTitleBarTitle id="nav-title">Menu</div>
</div>
<nav nfsTopBar nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" id="main-menu" aria-label="Main">
  <div nfsTopBarLeft>
    <ul nfsMenu [orientation]="{small: 'vertical', medium: 'horizontal'}">
      <li><a routerLink="/docs" routerLinkActive ariaCurrentWhenActive="page">Docs</a></li>
    </ul>
  </div>
</nav>
```

The menu above lists one link per row below `medium` and runs horizontally from `medium` up (Foundation's `vertical medium-horizontal`), a layout choice for the phone menu; Foundation's docs markup with a horizontal Dropdown Menu fits 320 px as well.

Animated, with Foundation's docs values (the consumer includes `nfs-motion`):

```html
<nav nfsTopBar nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" id="main-menu"
     animate="hinge-in-from-top spin-out" aria-label="Main">...</nav>
```

The consumer's own keyframe classes, each with its own reduced-motion rule, in the dot form:

```html
<nav nfsTopBar nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" id="main-menu"
     animate=".menu-drop-in .menu-drop-out" aria-label="Main">...</nav>
```

Two-way binding and completion outputs:

```html
<div nfsTitleBar [nfsResponsiveToggle]="menu" [(isOpen)]="menuOpen" (closed)="onMenuClosed()">...</div>
```

Close the mobile menu after in-app navigation:

```html
<div nfsTitleBar [nfsResponsiveToggle]="menu" #titleBar="nfsResponsiveToggle">...</div>
<nav nfsTopBar nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" id="main-menu" aria-label="Main">
  <ul nfsMenu>
    <li><a routerLink="/products" [nfsClose]="titleBar">Products</a></li>
  </ul>
</nav>
```

A second toggle outside the bar, and a larger `hideFor`:

```html
<div nfsTitleBar [nfsResponsiveToggle]="menu" #titleBar="nfsResponsiveToggle" hideFor="large">...</div>
<button nfsButton [nfsToggle]="titleBar">Browse</button>
```

A bar and a menu of the developer's own, with no Top Bar directive:

```html
<header [nfsResponsiveToggle]="nav" hideFor="large">
  <button nfsButton nfsToggle>Menu</button>
</header>
<nav nfsResponsiveToggleMenu #nav="nfsResponsiveToggleMenu" aria-label="Main">...</nav>
```

Application-wide defaults:

```ts
providers: [
  {
    provide: nfsResponsiveToggleDefaultsToken,
    useValue: { hideFor: 'large', animate: 'fade-in fade-out' } satisfies NfsResponsiveToggleDefaults,
  },
];
```

Incremental hydration: wrap the pair together.

```html
@defer (hydrate on interaction) {
  <div nfsTitleBar [nfsResponsiveToggle]="menu">...</div>
  <nav nfsTopBar nfsResponsiveToggleMenu #menu="nfsResponsiveToggleMenu" id="main-menu">...</nav>
}
```

The consumer's stylesheet for Foundation's title bar and top bar, with a `hideFor` outside `$breakpoint-classes`:

```scss
@import 'settings';
@import 'foundation';
@include foundation-visibility-classes;
@include foundation-menu-icon;
@include foundation-title-bar;
@include foundation-top-bar;
@import 'ngx-foundation-sites';
@include nfs-motion;
@include nfs-menu-icon;
@include nfs-responsive-toggle(xlarge); // only for hideFor="xlarge"
```

Migration from Foundation's markup: `class="title-bar"` becomes `nfsTitleBar`, `class="menu-icon"` becomes `nfsMenuIcon`, `class="title-bar-title"` becomes `nfsTitleBarTitle` with a static `id`, and `class="top-bar"` with its sections becomes `nfsTopBar`, `nfsTopBarLeft`, and `nfsTopBarRight` (the Top Bar spec); `data-responsive-toggle="id"` becomes `[nfsResponsiveToggle]="menu"` plus `#menu="nfsResponsiveToggleMenu"` on the target; `data-hide-for` becomes `hideFor`; `data-toggle` inside the bar becomes a bare `nfsToggle`; `data-animate` becomes `animate` with the same Motion names; the `.no-js` FOUC CSS is deleted; `aria-labelledby` and the title `id` are added.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixin `foundation-visibility-classes` (the `.hide-for-<bp>` and `.show-for-<bp>` classes that do the breakpoint switch), and, for Foundation's title-bar markup, on `foundation-title-bar`, `foundation-menu-icon`, and whichever the menu uses (`foundation-top-bar`, `foundation-menu`), with the Top Bar or Menu spec's Library mixins after them where those specs name one (`nfs-menu-icon` after `foundation-menu-icon`, `nfs-menu` after `foundation-menu`). Its own documented custom CSS is the `nfs-responsive-toggle` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-visibility-classes`, and only when `hideFor` names a breakpoint outside `$breakpoint-classes`:

1. Rules. Only on request: `@include nfs-responsive-toggle($hide-for)`, where `$hide-for` is a required list of breakpoint names (`@include nfs-responsive-toggle(xlarge);`, `@include nfs-responsive-toggle(xlarge xxlarge);`). For each name that is not already in `$breakpoint-classes`, it emits `.hide-for-<bp> { @include hide-for(<bp>); }` and `.show-for-<bp> { @include show-for(<bp>); }`, the same two rules Foundation's `foundation-visibility-classes` loop emits for the breakpoints it covers. Reason: Foundation generates Visibility classes only for `$breakpoint-classes` (default `small medium large`), and adding a breakpoint there also generates that breakpoint's grid, alignment, and other responsive classes for every component. A name already in `$breakpoint-classes` is skipped (Foundation emits it). Each name is a key of `$breakpoints` other than its first key (the Zero breakpoint, for which Foundation emits no `hide-for`/`show-for` pair). An include without an argument stops the compile (Sass's missing-argument error), because the mixin has nothing else to emit. The menu icon's 24 by 24 px box, which this mixin emitted before the class rule as a `.title-bar .menu-icon::before` hit area, is now the Top Bar spec's `nfs-menu-icon`.
2. Reuses the consumer's `$breakpoints` and `$breakpoint-classes` and Foundation's `hide-for()` and `show-for()` mixins (which call `breakpoint()` and `-zf-bp-to-em`), so the queries equal Foundation's to the 0.00125em offset. The `$hide-for` parameter exists because Foundation has no setting for "visibility classes for these breakpoints only". Required consumer settings when the toggled menu is a Top Bar holding links (WCAG 1.4.3; the Top Bar spec's required settings): a `$topbar-background` on which `$anchor-color` reaches 4.5:1, for example `$topbar-background: $white;` (4.65:1), because Foundation's default `$light-gray` gives 3.76:1; and, when that override is written after Foundation's settings file is imported, `$topbar-submenu-background: $topbar-background;`, because the settings file assigned the submenu background from the old bar colour. The Title Bar's own defaults pass (19.63:1 for title text and icon, 12.08:1 for the icon's hover colour). The library's Storybook preview carries both lines in its settings overrides, commented with their criterion, the lines the Top Bar spec requires for its own stories, so the shared preview needs them once.
3. No `--nfs-responsive-toggle-*` property; the directives write no custom property.
4. Motion classes: none by default; with `animate`, the `nfs-motion` classes its Motion names map to (`animate="hinge-in-from-top spin-out"` binds `nfs-hinge-in-from-top` and `nfs-spin-out`), or the consumer's own dot-form classes. The directive binds no Motion class under reduced motion, so `nfs-responsive-toggle` emits no `prefers-reduced-motion` override; `nfs-motion` keeps its own 1 ms override for its classes.
5. Missing include: with a `hideFor` outside `$breakpoint-classes` and neither the include nor the setting change, the bar is shown at every width, the closed menu is never hidden, and the button only flips `.is-open`; usage rule 5 names both fixes. Missing `foundation-visibility-classes` breaks every `hideFor` the same way. A missing `nfs-menu-icon` leaves the hamburger at Foundation's 20 by 16 px, under the 2.5.8 target (the Top Bar spec).
6. Variant properties: none; this plugin has no Variant input.

### Platform features to adopt when the browser target moves

- `popover="manual"` (Baseline widely available from late 2026): not adopted even then. A popover is `display: none` until shown and then leaves the page flow for the top layer, while this menu must stay in the page flow and be visible at and above `hideFor`; binding `popover` only below `hideFor` would make it a breakpoint-gated server attribute again. It fits only a consumer whose mobile menu is an overlay, which is OffCanvas's case.
- `CloseWatcher` (no WebKit release): for a consumer who styles the mobile menu as an overlay, a close watcher opened with the menu would add Escape and the Android back gesture; until then the documented `(keydown.escape)` binding covers Escape.
- Invoker Commands: when they reach the target, the Triggers utility may add `commandfor` with a custom `--nfs-toggle` command so a pre-hydration tap works without replay (needs the static menu id, which this spec already recommends).
- `@starting-style` and `transition-behavior: allow-discrete`: transition-based classes could then animate a menu leaving `display: none`, so a Motion name could also map to a transition class; the keyframe classes stay valid.

### Foundation behaviour changed or dropped

- Inline `display` from jQuery `show()`/`hide()`/`toggle(0)` becomes Foundation's Visibility classes plus `.is-open`; the `.no-js` FOUC recipe is unnecessary.
- The window `changed.zf.mediaquery` listener that re-ran `_update()` on every breakpoint change is gone: CSS media queries do the switch, and the menu state is not reset on a crossing.
- `toggleMenu()`'s no-op at and above `hideFor` is dropped; `open()`, `close()`, and `toggle()` work at every width.
- Options merged from two elements become one home each: `hideFor` on the bar, `animate` on the menu.
- Motion UI's `animateIn`/`animateOut` (two-frame transition classes) becomes keyframe classes bound during the phase; `data-animate` values copy unchanged as typed Motion names, which bind the library's `nfs-` keyframe classes; Motion UI's transition classes are never applied, and names outside the `nfs-motion` set fail to compile (a developer writes such an animation as its own keyframe class in the dot form).
- `toggled.zf.responsiveToggle` becomes `opened`/`closed` plus `isOpenChange`.
- `mutateme.zf.trigger` on `[data-mutate]` descendants is dropped; the next library's measuring directives observe size with `ResizeObserver`.
- The id-string target and its `console.error` on a missing id become a required typed reference.
- Foundation's classes in the markup (`.title-bar`, `.menu-icon`, `.title-bar-title`, `.top-bar` and its sections) become the Top Bar spec's directives; a copied Visibility class or `is-open` is stripped where this plugin binds it, and the docs ask for none.
- New: `aria-expanded` and `aria-controls` on the button (from the Trigger), a documented name through `aria-labelledby`, focus continuity when a breakpoint crossing or a close hides the focused element, `inert` while the menu animates out, and reduced-motion support.
