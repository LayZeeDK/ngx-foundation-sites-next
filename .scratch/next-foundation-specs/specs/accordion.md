# Spec: Accordion

Ticket: [Spec: Accordion](../issues/15-spec-accordion.md). Targets Angular 22.2 (`@angular/core`, `@angular/cdk`, `@angular/aria`), Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Built on the resolved [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md), [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md), and [Prototype: Rendering-mode test seam](../issues/59-prototype-rendering-mode-test-seam.md).

## Problem Statement

A developer building an Angular application on Foundation for Sites wants Foundation's accordion: a list of titles, each showing and hiding a panel of content, styled by Foundation's `.accordion`, `.accordion-item`, `.accordion-title`, and `.accordion-content` classes and its plus and minus glyph. Foundation's Accordion plugin does this with jQuery, and it leaves problems an Angular library must not copy:

- The title is `<a href="#">`, a link that behaves like a button, outside any heading. The WAI-ARIA APG accordion pattern asks for a `button` inside a heading, so screen reader users hear the wrong role and cannot find the sections by heading.
- Collapsed panels are hidden with `aria-hidden` and jQuery's inline `display`; Foundation's CSS has no rule that shows an open panel, so an accordion that is open at page load is only correct after the plugin runs.
- The open state, the single-open rule (`multiExpand`), and the keep-one-open rule (`allowAllClosed`) live in jQuery code and the DOM, and events (`down.zf.accordion`, `up.zf.accordion`) are custom jQuery events that Angular cannot bind.
- In single-open mode the arrow keys open the panel they land on, which the APG does not do.
- The height animation is jQuery `slideDown`/`slideUp` timed in JavaScript.
- Deep links need the title's `href` and a hand-written content id, and closing a panel leaves its hash in the URL.

A server-rendered Angular application adds more: the open panel must be visible and the closed panels hidden in the server HTML, without JavaScript; hydration must not replay the height animation; a click or key press on a title before hydration must still work once the page hydrates, also inside `@defer (hydrate on ...)` blocks; and the default contrast of Foundation's title on its hover and focus background (3.76:1) fails WCAG 2.2 AA.

## Solution

Four attribute directives and one small lazy-content directive on the markup Foundation already documents, built on `@angular/aria`'s accordion through `hostDirectives`:

- `[nfsAccordion]` on `ul.accordion` hosts Aria's `AccordionGroup` and owns Foundation's expansion policy: single-open by default (`multiExpand`), keep one open by default (`allowAllClosed`), deep links, and the container-level Completion outputs.
- `[nfsAccordionItem]` on `li.accordion-item` binds Foundation's `.is-active` State class and is the handle for `open()`, `close()`, `toggle()` and the item-level `opened`/`closed` outputs.
- `button[nfsAccordionTitle]` inside a heading hosts Aria's `AccordionTrigger`: native button, `aria-expanded`, `aria-controls`, roving keys, and the two-way `expanded` model.
- `[nfsAccordionContent]` on `.accordion-content` is the one Wrapper component: it hosts Aria's `AccordionPanel` (`role="region"`, `aria-labelledby`, `inert` while collapsed) and adds a single inner element so CSS can animate the height with `grid-template-rows`.
- `ng-template[nfsAccordionLazyContent]` inside the content, optional, holds Lazy content that renders only while the panel is shown (or, with `preserveContent`, from its first showing on).

The developer writes `<h3><button nfsAccordionTitle [panel]="c.panel">Title</button></h3>` above `<div nfsAccordionContent #c="nfsAccordionContent">` and projects the panel content, so the server HTML carries the open panel's content, the collapsed panels as `inert`, and every State class and ARIA attribute. The height animation is a CSS transition on the content host keyed on the item's `.is-active` class (ADR 0003), never `animate.enter`, so nothing animates at hydration. The library's `nfs-accordion` Library mixin adds the few rules Foundation's Sass cannot express for a button title inside a heading and a CSS-shown panel, each with its reason.

## User Stories

1. As an application developer, I want to put `nfsAccordion`, `nfsAccordionItem`, `nfsAccordionTitle`, and `nfsAccordionContent` on Foundation's accordion markup, so that I keep Foundation's classes and look without Foundation's JavaScript.
2. As an application developer, I want the directives to add Foundation's Structural classes themselves, so that `<ul nfsAccordion>` works with or without `class="accordion"`.
3. As an application developer migrating Foundation markup, I want `class="is-active"` on an item to open it at first paint, so that Foundation's documented initial state carries over.
4. As an application developer, I want only one panel open at a time by default, so that the behaviour matches Foundation's `data-multi-expand="false"` default.
5. As an application developer, I want `[multiExpand]="true"`, so that several panels can be open together.
6. As an application developer, I want the last open panel to stay open by default, so that Foundation's `allowAllClosed: false` default carries over.
7. As an application developer, I want `allowAllClosed`, so that users can close every panel.
8. As an application developer, I want `[(expanded)]` on a title, so that I can bind a panel's open state two ways.
9. As an application developer, I want `opened` and `closed` on an item that fire after the height animation ends, so that I can react when a panel is fully shown or fully hidden.
10. As an application developer, I want `opened` and `closed` on the accordion carrying the item, so that one handler covers every panel, as `down.zf.accordion` and `up.zf.accordion` did.
11. As an application developer, I want `open()`, `close()`, and `toggle()` on an item through `#item="nfsAccordionItem"`, so that I can drive a panel from code.
12. As an application developer, I want `expandAll()` and `collapseAll()` on the accordion, so that "expand all" and "collapse all" buttons are one line each.
13. As an application developer, I want `disabled` on the accordion, so that Foundation's `disabled` attribute blocks every panel and keeps its `not-allowed` cursor.
14. As an application developer, I want `disabled` on one title, so that a single section can be unavailable.
15. As an application developer, I want nested accordions inside a panel, so that I can group sub-sections.
16. As an application developer, I want form fields inside a panel to receive Space, Enter, Home, End, and arrow keys normally, so that typing never closes the panel or moves focus to a title.
17. As an application developer, I want `ng-template nfsAccordionLazyContent` for heavy panel content, so that it renders only while the panel is shown.
18. As an application developer, I want `preserveContent` on the lazy template, so that lazy content stays once shown and keeps its state.
19. As an application developer, I want lazy content that is open at page load to be in the server HTML, so that crawlers and users without JavaScript see it.
20. As an application developer, I want `deepLink`, so that `#faq-returns` in the URL opens the panel with that id after the page loads and when the hash changes.
21. As an application developer, I want the URL hash to follow the panel the user opens, and to be cleared when the user closes that panel, so that a reload shows what the user saw.
22. As an application developer, I want `updateHistory`, so that each opened panel is a history entry and Back returns to the previous one.
23. As an application developer, I want `deepLinkSmudge`, so that a deep-linked panel's title scrolls into view, honouring my `scroll-margin-top` for a sticky header.
24. As an application developer, I want a `deepLinked` output, so that I know which panel a deep link opened.
25. As an application developer, I want app-wide defaults through `nfsAccordionDefaultsToken`, so that every accordion in my app shares `multiExpand`, `allowAllClosed`, and deep-link settings.
26. As an application developer, I want `[region]="false"` on a multi-expand accordion with many panels, so that screen readers are not flooded with landmarks, as the APG advises.
27. As an application developer, I want my own `id` on a title or content to be used, so that my links and styles keep working.
28. As an application developer, I want dev-mode warnings for a title outside a heading, a deep link on a generated id, several open items in single mode, a missing `nfs-accordion` include, and `collapseAll()` that cannot run, so that mistakes surface early.
29. As an application developer, I want a Sass warning when my accordion colours fail WCAG 2.2 AA contrast, so that I fix my settings before release.
30. As a screen reader user, I want each title to be a button inside a heading, so that I can navigate sections by heading and hear "button, expanded" or "collapsed".
31. As a screen reader user, I want each open panel to be a labelled region, so that I can tell which section I am reading.
32. As a screen reader user, I want the title of a panel that cannot close to be announced as unavailable, so that I know pressing it does nothing.
33. As a screen reader user, I want collapsed content to be absent from the accessibility tree, so that I am not read hidden content.
34. As a keyboard user, I want every title in the Tab order and Enter or Space to toggle it, so that I can operate the accordion without a mouse.
35. As a keyboard user, I want ArrowDown, ArrowUp, Home, and End to move between titles without opening panels, so that I can scan titles first.
36. As a keyboard user, I want focus to move to a panel's title when the panel closes while focus is inside it, so that I never lose my place.
37. As a keyboard user, I want a visible focus indicator on every title, so that I know which title Enter will toggle.
38. As a low-vision user, I want title text to meet 4.5:1 contrast in every state, hover and focus included, so that I can read it.
39. As a pointer or touch user, I want titles at least 24 by 24 CSS px, so that I can hit them.
40. As a user who prefers reduced motion, I want panels to open and close without the height animation, so that nothing slides on screen.
41. As a user of text-spacing overrides, I want an open panel to grow with its content, so that nothing is clipped.
42. As a developer of a server-rendered application, I want the server HTML to show the open panel and hide the others with correct ARIA, so that the first paint is right without JavaScript.
43. As a developer of a server-rendered application, I want nothing to animate when the page hydrates, so that panels do not slide at load.
44. As a developer of a server-rendered application, I want a click or key press on a title before hydration to take effect after hydration, so that early input is not lost.
45. As a developer using incremental hydration, I want a click on a title inside a dehydrated block to hydrate the block and toggle the panel, so that deferred content works on first interaction.
46. As a developer using `@defer (hydrate never)`, I want to know what an accordion inside keeps doing, so that I choose that block knowingly.
47. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
48. As a developer of a zoneless application, I want the accordion to need no zone, so that it works with zoneless change detection.
49. As an application developer, I want to import the accordion from its own entry point, so that a `@defer` block can split it with the rest of a deferred widget.
50. As a library maintainer, I want every behaviour asserted through roles, ARIA, attributes, and classes at the four test layers, so that regressions surface where they belong.

## Implementation Decisions

### Foundation contract

Accordion 6.9: eight options, three plugin events plus the lifecycle pair, three public methods, and a keyboard map (`Accordion.defaults` in the plugin source; the Foundation disclosure inventory research, Accordion section).

| Foundation | Behaviour in 6.9 | Library counterpart |
| --- | --- | --- |
| `multiExpand` (`data-multi-expand`, `false`) | Several open panes when true; also makes arrow keys open panes when false | `multiExpand` input on `NfsAccordion`, default `false`, owned by the library ([ADR 0028](../adr/0028-accordion-expansion-policy.md), "The Accordion wrapper owns Foundation's expansion policy on top of Aria"); arrow keys never open panes |
| `allowAllClosed` (`data-allow-all-closed`, `false`) | `up()` refuses to close the only open pane | `allowAllClosed` input, default `false`; the title of that pane renders `aria-disabled="true"` and ignores activation (APG) |
| `deepLink` (`data-deep-link`, `false`) | Reads `location.hash` at init and on `hashchange`; writes the title's `href` on every toggle | `deepLink` input; reads the hash after first render and on `hashchange`; writes `#<content id>` when the user opens a panel and clears it when the user closes the panel it names |
| `updateHistory` (`data-update-history`, `false`) | `pushState` instead of `replaceState` | `updateHistory` input, same meaning; `history.state` is preserved |
| `deepLinkSmudge` (`false`) | Animates `html, body` `scrollTop` to the accordion's top after a deep link | `deepLinkSmudge` input; `scrollIntoView({block: 'start'})` on the deep-linked item after it has opened, smooth unless reduced motion |
| `deepLinkSmudgeDelay` (`300`) | Scroll animation duration | Dropped: the browser owns smooth-scroll timing (building-blocks 1.4) |
| `deepLinkSmudgeOffset` (`0`) | Offset for a sticky header | Dropped: CSS `scroll-margin-top` on `.accordion-item` or `scroll-padding-top` on the scroller, which `scrollIntoView` honours (also for native fragment jumps) |
| `slideSpeed` (`250`) | jQuery slide duration | Dropped as an input: the `nfs-accordion($duration: 250ms)` mixin parameter (CSS owns timing, building-blocks 1.4) |
| `disabled` attribute on the container | Blocks `toggle`, `down`, `up`; Foundation CSS `.accordion[disabled] .accordion-title { cursor: not-allowed }` | `disabled` input (Aria's), rendered back as the `disabled` attribute so Foundation's rule applies; titles render `aria-disabled` |
| `.is-active` on the item (markup) | Initial and current open state | Bound by `NfsAccordionItem` from `expanded`; a static `is-active` seeds the initial state |
| `down.zf.accordion` / `up.zf.accordion` | After `slideDown` / `slideUp`, payload the pane | Item `opened` / `closed` (void) and container `opened` / `closed` (payload `NfsAccordionItem`), after the height transition |
| `deeplink.zf.accordion` | After a hash matched a title | Container `deepLinked` (payload `NfsAccordionItem`) |
| `init.zf.accordion` / `destroyed.zf.accordion` | Lifecycle | None (Angular lifecycle) |
| `toggle($pane)`, `down($pane)`, `up($pane)` | Methods on the plugin taking the pane | `toggle()`, `open()`, `close()` on `NfsAccordionItem`; `expandAll()`, `collapseAll()` on `NfsAccordion` |
| Keys: Enter/Space toggle, ArrowDown/ArrowUp next/previous, Home/End first/last, no wrap | Arrow keys also click in single mode | Aria's key table: the same keys, focus only, no wrap |
| ARIA: `<a>` with `aria-expanded`, `aria-controls`; content `role=region`, `aria-labelledby`, `aria-hidden` | No heading, no button role, no `aria-disabled` | `button` inside a heading, `aria-expanded`, `aria-controls`, `aria-disabled`; content `role="region"` (optional), `aria-labelledby`, `inert` |

Dropped options: `slideSpeed`, `deepLinkSmudgeDelay`, `deepLinkSmudgeOffset` (replacements above). Dropped behaviour: arrow keys opening panes in single mode, `aria-hidden` on panes, the title `href` as the deep-link source, `console.info` on toggling a disabled accordion, `GetYoDigits` ids, and `Foundation.Accordion.defaults` as a mutable global (replaced by `nfsAccordionDefaultsToken`).

### CSS class to Angular mapping

| Foundation class or markup | Angular | Rationale |
| --- | --- | --- |
| `.accordion` (`ul[data-accordion]`) | `NfsAccordion`, selector `[nfsAccordion]`, `exportAs: 'nfsAccordion'`, static host class `accordion` | Attribute directive on the container (ADR 0001); any element, as Foundation allows |
| `.accordion-item` (`li[data-accordion-item]`) | `NfsAccordionItem`, selector `[nfsAccordionItem]`, `exportAs: 'nfsAccordionItem'`, static host class `accordion-item` | Holds the item's State class and methods |
| `.accordion-title` (`a[href="#"]`) | `NfsAccordionTitle`, selector `button[nfsAccordionTitle]`, `exportAs: 'nfsAccordionTitle'`, static host class `accordion-title` | Native button inside a heading (APG); the selector enforces the element |
| `.accordion-content` (`div[data-tab-content]`) | `NfsAccordionContent`, attribute-selector component `[nfsAccordionContent]`, `exportAs: 'nfsAccordionContent'`, static host class `accordion-content` | Wrapper component (building-blocks 1.1 case 2): one inner element for the grid-row animation |
| `.is-active` | Host class binding on `NfsAccordionItem` from `expanded` | State class, bound on server and client |
| `.accordion[disabled]` | `[attr.disabled]` host binding on `NfsAccordion` from the `disabled` input | Keeps Foundation's disabled cursor rule working for a bound `[disabled]` |
| Plus and minus glyph (`::before`, `$accordion-plusminus`) | Foundation CSS on the title, keyed on `.is-active` | No directive; Sass setting stays compile-time |
| (none) | `NfsAccordionLazyContent`, selector `ng-template[nfsAccordionLazyContent]` | Lazy content marker; renders inside the wrapper's inner element |
| (none) | `.nfs-accordion-content-body` and `.nfs-accordion-content-shown` on the wrapper's own inner element | Library-owned element; clipped only while collapsed or animating |

### Hierarchy and DI shape

```
nfsAccordionDefaultsToken (optional, Shape B)   -> read by NfsAccordion for input defaults
nfsAnimationsToken (shared)                     -> read by NfsAccordionContent
NfsMediaQuery (Breakpoint service)              -> reducedMotion() for the smudge scroll

[nfsAccordion]  NfsAccordion        hostDirectives: AccordionGroup (inputs: disabled)
  provides nfsAccordionToken (useExisting); Aria's AccordionGroup provides ACCORDION_GROUP
  |
  [nfsAccordionItem]  NfsAccordionItem   injects nfsAccordionToken (required), registers itself
    provides nfsAccordionItemToken (useExisting)
    |-- h1..h6
    |     button[nfsAccordionTitle]  NfsAccordionTitle   hostDirectives: AccordionTrigger
    |       (inputs: panel, expanded, disabled, id; outputs: expandedChange)
    |       injects nfsAccordionItemToken (required), registers itself with the item
    |-- [nfsAccordionContent]  NfsAccordionContent (component)   hostDirectives: AccordionPanel (inputs: id)
          injects nfsAccordionItemToken (required), registers itself with the item
          contentChild(NfsAccordionLazyContent)
          |-- ng-template[nfsAccordionLazyContent]  NfsAccordionLazyContent (optional)
```

- Tokens: `nfsAccordionToken` and `nfsAccordionItemToken` are lightweight `InjectionToken`s typed with `import type` of the class (building-blocks 1.9, ADR 0009). Children inject them without `optional`: an item, title, or content outside its parent cannot work, because Aria's `AccordionTrigger` requires `ACCORDION_GROUP` and throws NG0201 anyway. No token is re-provided as `undefined`: every nested accordion is its own `nfsAccordion`, which provides its own tokens, so nothing registers upward.
- Registration, not queries (building-blocks 1.9): an item registers with its accordion in `ngOnInit` and unregisters on destroy; a title and a content register with their item at construction. The accordion's registry is a `signal<Set<NfsAccordionItem>>`; order is not needed (exclusivity, counts, and deep-link lookup are order-free; Aria owns key order through its own `SortedCollection`). `@for`, `@if`, and Lazy content inside panels work because registration happens at construction.
- Link between title and content: the consumer binds Aria's required `panel` input with `[panel]="c.panel"` and `#c="nfsAccordionContent"` (decision on the two forms the prototype proved: see Design decisions D4).
- Defaults token: `nfsAccordionDefaultsToken`, `InjectionToken<NfsAccordionDefaults>` with all-optional `multiExpand`, `allowAllClosed`, `deepLink`, `updateHistory`, `deepLinkSmudge`, `region`, injected with `{optional: true}` to seed the input defaults (building-blocks 1.4, Shape B). Provided at bootstrap, route, or element level; the nearest wins.
- Entry point: `ngx-foundation-sites/accordion`, exporting the five directives, the two parent tokens, the defaults token and its interface, and an `NFS_ACCORDION` array of the five directives for `imports`.

### API

```ts
interface NfsAccordionDefaults {
  multiExpand?: boolean;
  allowAllClosed?: boolean;
  deepLink?: boolean;
  updateHistory?: boolean;
  deepLinkSmudge?: boolean;
  region?: boolean;
}
const nfsAccordionDefaultsToken: InjectionToken<NfsAccordionDefaults>;
const nfsAccordionToken: InjectionToken<NfsAccordion>;
const nfsAccordionItemToken: InjectionToken<NfsAccordionItem>;

class NfsAccordion {                        // [nfsAccordion], exportAs 'nfsAccordion'
  readonly multiExpand: InputSignalWithTransform<boolean, unknown>;    // default false
  readonly allowAllClosed: InputSignalWithTransform<boolean, unknown>; // default false
  readonly disabled: InputSignalWithTransform<boolean, unknown>;       // Aria AccordionGroup.disabled, default false
  readonly deepLink: InputSignalWithTransform<boolean, unknown>;       // default false
  readonly updateHistory: InputSignalWithTransform<boolean, unknown>;  // default false
  readonly deepLinkSmudge: InputSignalWithTransform<boolean, unknown>; // default false
  readonly region: InputSignalWithTransform<boolean, unknown>;         // default true
  readonly opened: OutputRef<NfsAccordionItem>;
  readonly closed: OutputRef<NfsAccordionItem>;
  readonly deepLinked: OutputRef<NfsAccordionItem>;
  expandAll(): void;                         // only when multiExpand
  collapseAll(): void;                       // only when allowAllClosed
}

class NfsAccordionItem {                    // [nfsAccordionItem], exportAs 'nfsAccordionItem'
  readonly expanded: Signal<boolean>;        // read-only, from the title's expanded model
  readonly opened: OutputRef<void>;
  readonly closed: OutputRef<void>;
  open(): void;
  close(): void;
  toggle(): void;
}

class NfsAccordionTitle {                   // button[nfsAccordionTitle], exportAs 'nfsAccordionTitle'
  readonly panel: InputSignal<AccordionPanel>;   // Aria, required: bind [panel]="c.panel"
  readonly expanded: ModelSignal<boolean>;       // Aria, default false (or true from a static is-active on the item)
  readonly disabled: InputSignalWithTransform<boolean, unknown>; // Aria, default false
  readonly id: InputSignal<string>;              // Aria, default generated 'ng-accordion-trigger-...'
}

class NfsAccordionContent {                 // [nfsAccordionContent] component, exportAs 'nfsAccordionContent'
  readonly panel: AccordionPanel;            // the hosted Aria panel, for the title's [panel] binding
  readonly id: InputSignal<string>;          // Aria AccordionPanel.id, default generated 'ng-accordion-panel-...'
}

class NfsAccordionLazyContent {             // ng-template[nfsAccordionLazyContent]
  readonly preserveContent: InputSignalWithTransform<boolean, unknown>; // default false
}
```

The inputs of `NfsAccordionTitle` and `NfsAccordionContent` are Aria's, exposed through `hostDirectives` and bound by the consumer as if they were the library's (the prototype's shape). The table lists every public member and its delta.

| Directive | Member | Kind | Default | Foundation equivalent | Delta and notes |
| --- | --- | --- | --- | --- | --- |
| `NfsAccordion` | `multiExpand` | `input()`, `booleanAttribute` | `false` (token) | `data-multi-expand` | Library-owned; Aria's `multiExpandable` is never exposed and stays `true` (ADR 0028) |
| | `allowAllClosed` | `input()`, `booleanAttribute` | `false` (token) | `data-allow-all-closed` | The title of the only open panel renders `aria-disabled="true"` and ignores activation |
| | `disabled` | `input()` (Aria), `booleanAttribute` | `false` | `disabled` attribute | Also rendered as the `disabled` attribute for Foundation's cursor rule; methods do nothing while disabled |
| | `deepLink`, `updateHistory`, `deepLinkSmudge` | `input()`, `booleanAttribute` | `false` (token) | same names | Deep links need consumer ids on the content; applied after hydration |
| | `region` | `input()`, `booleanAttribute` | `true` (token) | none (Foundation always sets `role=region`) | New: `false` removes `role="region"` and `aria-labelledby` from every content (APG landmark caution) |
| | `opened`, `closed` | `output<NfsAccordionItem>()` | | `down/up.zf.accordion` | Completion outputs: emitted when the item's own `opened`/`closed` is |
| | `deepLinked` | `output<NfsAccordionItem>()` | | `deeplink.zf.accordion` | After a hash opened (or matched an already open) item |
| | `expandAll()` | method | | none | Aria's name (building-blocks 1.3); does nothing unless `multiExpand` (Aria and CDK rule) |
| | `collapseAll()` | method | | none | Does nothing unless `allowAllClosed` (Foundation cannot close the last pane); dev warning otherwise |
| `NfsAccordionItem` | `expanded` | read-only `Signal` | from the title | `.is-active` | Bind the title's `[(expanded)]` to write |
| | `opened`, `closed` | `output<void>()` | | per-pane `down/up` | After the content's `grid-template-rows` transition ends (Animation) |
| | `open()`, `close()`, `toggle()` | methods | | `down`, `up`, `toggle` | Go through Aria's pattern, so they respect `disabled` and the expansion policy; `close()` on the only open panel does nothing while `allowAllClosed` is `false` |
| `NfsAccordionTitle` | `panel` | `input.required` (Aria) | | title `href` plus content `id` | Consumer binds `[panel]="c.panel"`; NG8008 at build time when missing |
| | `expanded` | `model()` (Aria) | `false`, or `true` when the item's static `class` contains `is-active` | `.is-active` | `expandedChange` fires at request time, before the animation |
| | `disabled` | `input()` (Aria) | `false` | none (Foundation disables only the whole accordion) | New per item; soft-disabled: focusable, `aria-disabled="true"` |
| | `id` | `input()` (Aria) | `ng-accordion-trigger-<random>-<n>` | `<item id>-label` | The prefix is Aria's; a wrapper cannot change an Aria input default |
| `NfsAccordionContent` | `id` | `input()` (Aria) | `ng-accordion-panel-<random>-<n>` | content `id` | Required from the consumer for deep links |
| | `panel` | readonly field | | | The hosted Aria `AccordionPanel` |
| `NfsAccordionLazyContent` | `preserveContent` | `input()`, `booleanAttribute` | `false` | none | Name from Aria's `DeferredContentAware`; keeps the view after its first showing |

Behaviour rules:

- Expansion policy (ADR 0028): Aria's group stays in multi-expand mode. Each item subscribes to its title's `expanded` model (a `model()` emits synchronously on every internal `set`). When it emits `true` and `multiExpand` is `false`, the accordion calls Aria's `collapse()` on every other expanded item's title. `lockedTitle` for an item is `computed`: `!allowAllClosed() && expanded() && openCount() === 1`. While locked, the title renders `aria-disabled="true"` (its own host binding wins over Aria's) and its host `click` and `keydown` listeners call `stopPropagation()` for a click and for Enter or Space without modifiers, so Aria's group listener never toggles it; the listener calls no `preventDefault()`, so a replayed event logs nothing.
- Initial state from markup: `NfsAccordionItem` reads `inject(new HostAttributeToken('class'), {optional: true})`; when it contains `is-active`, the title's constructor writes `true` into Aria's `expanded` model before any subscriber exists, so a bound `[expanded]` still wins on the first update pass (the Toggler spec's seeding rule, adapted to a model the library does not declare).
- Focus: opening never moves focus (the APG keeps focus on the title). When an item's `expanded` model emits `false` while its content contains `document.activeElement`, the item focuses its title in the same callback, before `inert` is applied (Material's rule, the Angular Material reference research, section 1). A consumer's write to the `[expanded]` binding is not observed this way (bindings do not emit); `close()` is the call that keeps focus safe.
- Content key guard: Aria's group `keydown` listener handles every keydown that bubbles to the group, including keys typed in an input inside an open panel (source reading of `AccordionGroupPattern.onKeydown`, which checks no target): Space would toggle the last focused title and be prevented, Home would move focus to the first title. `NfsAccordionContent` therefore has a host `keydown` listener that calls `stopPropagation()` for exactly the keys Aria matches (ArrowUp, ArrowDown, Home, End, Space, Enter, without modifiers; Home, End, Space, and Enter only when not repeated), so a key from inside a panel never reaches its own or an outer accordion's group.
- Replay guard: `NfsAccordion` has a host `keydown` listener that runs after Aria's (host-directive listeners run first) and calls `stopPropagation()` again for the same keys when they come from one of its titles, because Aria's `preventDefault()` throws on a Replayed event and skips its own `stopPropagation()`, letting an outer accordion handle the key a second time (prototype case 25).
- Deep links (`deepLink`): in `afterNextRender` the accordion reads `location.hash` through `DOCUMENT.defaultView`, decodes it, and looks it up among its items' content ids; a match opens that item (policy applies) and emits `deepLinked`; with `deepLinkSmudge` the item's `li` is scrolled into view when its `opened` fires. A `hashchange` listener, added in the same callback and removed on destroy, repeats the lookup; an empty hash reopens the item that was open at first render (Foundation's back-navigation rule). When the user opens an item (its model emits `true` outside a deep-link application), the accordion writes `#<content id>` with `history.replaceState(history.state, '', ...)`, or `pushState` with `updateHistory`; when the user closes the item the hash names, it writes the URL without the fragment. `history.state` is passed through so a Router's entries keep their state. The URL is not restored on destroy: the hash is the user's state, and a route change owns the next URL (a stated exception to building-blocks 1.9's restore rule).
- Methods: `open()`, `close()`, `toggle()` call Aria's `expand()`, `collapse()`, `toggle()` on the title, so the expansion policy, `disabled`, and focus rules run for code and users alike. `expandAll()` calls Aria's `expandAll()` when `multiExpand` is `true`; `collapseAll()` calls Aria's `collapseAll()` when `allowAllClosed` is `true`.
- Dev-mode checks, in one `afterNextRender` per directive that exists only when `ngDevMode` is on, each warning once per instance: (1) a title whose parent is not `h1`-`h6`, or not the heading's only element child (APG; 1.3.1); (2) `deepLink` with a content id that starts with Aria's generated prefix; (3) `deepLink` while the hash looks like a hash route (`#/`), which this feature does not support; (4) more than one item open at first render while `multiExpand` is `false`; (5) `collapseAll()` called while `allowAllClosed` is `false`; (6) an expanded content whose computed `display` is `none` ("include `nfs-accordion` after `foundation-accordion`"). Aria's own checks stay (trigger inside its panel, panel with two triggers) and so does its warning for panels without `ngAccordionContent` (Rendering modes).

### Implementation level and primitives

Implementation level: `@angular/aria` (building-blocks Table A). Aria's accordion is a direct match for Foundation's markup, and the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md) proved host-directive composition under server rendering, hydration, and replay in Chromium, Firefox, and WebKit. The native level does not fit: `<details name>` (exclusive groups) and `::details-content` are out of the Browser target (Chrome 120, Firefox 130, Safari 17.2; Chromium 131, Firefox 143, Safari 18.4), and even in target `<summary>` must be the first child of `<details>`, so it cannot sit inside a heading as the APG requires, and Foundation's `.accordion-title` rules do not apply to it (the web platform features research, section 4).

Primitives: Aria `AccordionGroup`, `AccordionTrigger`, `AccordionPanel` through `hostDirectives`; not Aria's `AccordionContent`/`DeferredContent` (its view is created in `afterRenderEffect`, so an open lazy panel would be empty in server HTML, the Angular rendering modes research, section 5); `input()`, `model()` (Aria's), `output()`, `computed()`, `linkedSignal` for the transition phase, `afterNextRender` and `afterRenderEffect` for the dev checks, deep links, measurement, and Completion outputs; `HostAttributeToken`; `contentChild` for the lazy template; `@if` plus `NgTemplateOutlet` in the wrapper's template; `NgZone.runOutsideAngular` for the fallback timer; the History API; `scrollIntoView`; `NfsMediaQuery.reducedMotion()` (Breakpoint service); `nfsAnimationsToken`. CDK contributes nothing directly (Aria brings `_IdGenerator` and `Directionality`). `injectAsync` not used: the plugin is its own entry point and a consumer `@defer` splits it; `afterEveryRender` not needed: `afterRenderEffect` re-runs on its signals.

Fallback: none needed; the prototype resolved the risk the map flagged. Had composition failed, the named fallback was CDK accordion state with the library's own ARIA and keys (building-blocks Table B).

### Comparison with Angular Material

| Concern | `MatAccordion` / `MatExpansionPanel` (CDK underneath) | This library |
| --- | --- | --- |
| Shape | Directive container, component panel and header rendering their own markup and indicator | Four directives plus one Wrapper component on consumer-written Foundation markup (Aria's shape) |
| Single or multiple | `multi`, default `false` | `multiExpand`, default `false` |
| Keep one open | None | `allowAllClosed` (Foundation), with `aria-disabled` per the APG |
| Container methods | `openAll()`, `closeAll()` | `expandAll()`, `collapseAll()` (Aria's names, building-blocks 1.3) |
| Open state | `expanded` input plus `expandedChange` on the panel | `expanded` model on the title (Aria owns it); read-only `expanded` on the item |
| Events | `opened`/`closed` at the state change, `afterExpand`/`afterCollapse` after the animation | `expandedChange` at the state change; `opened`/`closed` Completion outputs after the animation (building-blocks 1.4: no start events) |
| Item methods | `open()`, `close()`, `toggle()`; Material ignores `disabled`, CDK respects it | Same names; respect `disabled` (CDK's and Aria's rule) |
| Disabled | Per panel | Per title and for the whole accordion; soft-disabled (focusable) |
| Lazy content | `ng-template[matExpansionPanelContent]`, rendered on first open and kept | `ng-template[nfsAccordionLazyContent]`, rendered while shown, kept with `preserveContent`; server-rendered when open |
| Keyboard | `FocusKeyManager` with wrap, Home, End | Aria: arrows, Home, End, no wrap (Foundation had no wrap) |
| Focus when a panel closes around focus | Moves to the header | Moves to the title |
| Collapsed body | `inert` on the body wrapper; grid-row animation, `@supports` fallback | `inert` on the content (Aria); grid-row animation on the content, no `@supports` guard (Animation) |
| Indicator | SVG chevron; `hideToggle`, `togglePosition` | Foundation's CSS glyph; `$accordion-plusminus` is a Sass setting, no input |
| Defaults | `MAT_EXPANSION_PANEL_DEFAULT_OPTIONS` | `nfsAccordionDefaultsToken` |
| Visual options | `displayMode`, `expandedHeight`, `collapsedHeight` | None: Foundation classes and settings |
| Harness | `MatAccordionHarness`, `MatExpansionPanelHarness` | None; DOM-first assertions (Aria's `AccordionHarness` also finds the titles, because Aria stamps `ngAccordionTrigger` on them) |

Borrowed: `multi` semantics and default, method names, Completion timing of `afterExpand`/`afterCollapse` under the names `opened`/`closed`, focus return on close, `inert`, the grid-row animation, the defaults token. Not borrowed: header and panel components, the indicator inputs, `displayMode`, promises or `UniqueSelectionDispatcher`.

### ARIA and keyboard

APG pattern: Accordion (the ARIA APG patterns research, Accordion), in full.

| Element | Role and attributes | Source |
| --- | --- | --- |
| `ul.accordion` | No role beyond the list; `disabled` attribute while disabled (Foundation's CSS contract) | Aria sets none on the group |
| `li.accordion-item` | `listitem`; `.is-active` while open | Foundation |
| `h1`-`h6` | The consumer's heading, level chosen for the page; the title is its only element child | APG; dev check 1 |
| `button.accordion-title` | Native button with Aria's redundant `role="button"`; `type="button"`; `id`; `aria-expanded`; `aria-controls` = content id; `aria-disabled="true"` when disabled or locked, else `"false"`; `tabindex="0"` (every title is in the Tab order); `data-active` on the focused title | Aria, plus the library's `aria-disabled` override |
| `.accordion-content` | `role="region"` and `aria-labelledby` = title id (both removed with `[region]="false"`); `id`; `inert` while collapsed | Aria, plus the library's override for `region` |

| Key | Where | Effect | Owner |
| --- | --- | --- | --- |
| Enter, Space | On a title | Toggles its panel; in single mode opening closes the others; on a locked or disabled title nothing happens | Native button, Aria, the library's policy |
| ArrowDown, ArrowUp | On a title | Focus to the next or previous title of the same accordion; no wrap; never opens | Aria |
| Home, End | On a title | Focus to the first or last title | Aria |
| Tab, Shift+Tab | Anywhere | Next or previous focusable element; collapsed content is skipped (`inert`) | Native |
| Any key | Inside an open panel | Reaches the focused control normally; never reaches the accordion (content key guard) | Library |

Focus rules: opening keeps focus on the title; a panel that closes around focus hands it to its title; deep links move no focus; disabled titles stay focusable (Aria `softDisabled`, building-blocks 1.10).

WCAG 2.2 AA requirements (requirements, not recommendations; the story gate runs axe with the WCAG 2.2 AA tags plus `best-practice`, and play functions assert what axe cannot judge):

| Criterion | Requirement for Accordion | Foundation default and what makes it pass |
| --- | --- | --- |
| 4.1.2 Name, Role, Value | Every title is a button with a name from its content, `aria-expanded` and `aria-controls` correct in server HTML and after every change, and `aria-disabled="true"` when activation does nothing (disabled or locked) | Aria's host bindings plus the library's `aria-disabled` override pass by construction. Foundation's `<a href="#">` failed the role; its locked pane had no `aria-disabled` |
| 2.5.3 Label in Name, and 4.1.2 name | The accessible name contains the visible title text | Foundation's `::before` glyph (`+` or en dash) is part of the name in every engine (prototype case 19): `"+ Section 2"`. That meets 2.5.3 (the name contains the visible label, and the glyph is itself visible text) and 4.1.2 (the name is determinable; the state is in `aria-expanded`). Kept as is: CSS alternative text (`content: '+' / ''`) is outside the Browser target (Firefox 128, Safari 17.4) and building-blocks 1.2 rules out a second path; named as the upgrade under Further Notes. A consumer who wants a glyph-free name now sets `$accordion-plusminus: false` |
| 1.3.1 Info and Relationships | Each title sits in a heading; each open region is labelled by its title; collapsed content is not exposed | Required consumer markup (`h3 > button`), checked by dev check 1 and the SSR smoke; `aria-labelledby` from Aria; `inert` |
| 2.1.1 Keyboard | Every title operable by keyboard; keys typed inside a panel work normally | Native buttons; content key guard (without it, Space in a panel input would toggle a panel) |
| 2.4.3 Focus Order | DOM order; collapsed content leaves the Tab order; focus never stays inside a panel that closes | `inert`; focus moves to the title (behaviour rules) |
| 2.4.7 Focus Visible | A visible focus indicator on every title | Passes with Foundation's defaults: the browser's focus ring stays, because Foundation removes the outline only under what-input's `[data-whatinput='mouse']` attribute, which the library never sets; Foundation's `:focus` background is an extra cue. The inner element's `overflow: hidden` applies only while collapsed or animating, so focus rings of controls inside an open panel are not clipped |
| 1.4.3 Contrast (Minimum) | Title text (12 px, `$accordion-title-font-size`) at 4.5:1 against the title background in every state | Fails with Foundation's defaults on hover and focus: `$primary-color` #1779ba on `$light-gray` #e6e6e6 is 3.76:1 (4.69:1 on white passes). Fix, a consumer setting: `$accordion-item-color: scale-color($primary-color, $lightness: -15%);` gives #14679e, 4.86:1 on #e6e6e6 and 6.0:1 on white. The `nfs-accordion` mixin raises a Sass `@warn` when the ratio of `$accordion-item-color` against `$accordion-item-background-hover` or against `$accordion-background`, or of `$accordion-content-color` against `$accordion-content-background`, is below 4.5, each ratio computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded (Foundation's `color-contrast()` is not used, because it rounds to one decimal and would pass 4.498:1 as 4.5); the library's Storybook settings carry the fix, so the gate would catch its removal |
| 1.4.11 Non-text Contrast | The state glyph at 3:1 against its background | The glyph takes the title colour: 4.69:1 (default) or 4.86:1 and 6.0:1 (fixed). The 1 px `$light-gray` border (1.25:1) is not needed to identify the control (its text identifies it), so 1.4.11 does not apply to it |
| 2.5.8 Target Size (Minimum) | Titles at least 24 by 24 CSS px | Full width by `width: 100%` (library rule 2) and about 52 px tall (`$accordion-item-padding` 1.25rem top and bottom plus a 12 px line): passes; axe `target-size` runs in the gate |
| 2.4.11 Focus Not Obscured (Minimum) | Nothing the accordion renders covers a focused title | Panels are in-flow and push content down; nothing overlays. A consumer's sticky header is the page's concern: `scroll-padding-top` on the scroller keeps focused titles and deep-link scrolls clear of it |
| 1.4.12 Text Spacing | Content survives spacing overrides | Open panels are a `1fr` row with `overflow: visible`, so they grow with their content |
| 2.2.2 Pause, Stop, Hide | Animation starts only on user action and ends under 5 s | 250 ms by default; nothing autoplays |

Reduced motion is honoured on top of AA (Animation).

### Rendered HTML

Directive attributes (`nfsaccordion`, `nfsaccordionitem`, `nfsaccordiontitle`, `nfsaccordioncontent`, and Aria's stamped `ngaccordiontrigger`) stay in the DOM and are omitted below for brevity. Server HTML carries `jsaction` on each element with a replayable host listener: the accordion (`keydown`, `click`, `focusin`: Aria's listeners plus the Replay guard), each title (`click`, `keydown`: the lock interception), and each content (`keydown`: the content key guard). Angular removes them after hydration. Generated ids differ between server and client and are rewritten at hydration, because every reference to them is a host binding.

Consumer markup (Foundation's docs example with the library's deltas: `<button>` in a heading instead of `<a href="#">`, one `[panel]` binding per item):

```html
<ul nfsAccordion>
  <li nfsAccordionItem class="is-active">
    <h3><button nfsAccordionTitle [panel]="shipping.panel">Shipping</button></h3>
    <div nfsAccordionContent #shipping="nfsAccordionContent" id="faq-shipping">
      <p>Orders ship within two days.</p>
    </div>
  </li>
  <li nfsAccordionItem>
    <h3><button nfsAccordionTitle [panel]="returns.panel">Returns</button></h3>
    <div nfsAccordionContent #returns="nfsAccordionContent" id="faq-returns">
      <p>Returns are free for 30 days.</p>
    </div>
  </li>
</ul>
```

Server HTML, and hydrated before any interaction (single mode, `allowAllClosed` false, so the only open title is locked):

```html
<ul class="accordion" jsaction="keydown:;click:;focusin:;">
  <li class="accordion-item is-active">
    <h3>
      <button class="accordion-title" role="button" type="button" id="ng-accordion-trigger-x1-0"
              data-active="false" aria-expanded="true" aria-controls="faq-shipping"
              aria-disabled="true" tabindex="0" jsaction="click:;keydown:;">Shipping</button>
    </h3>
    <div class="accordion-content" role="region" id="faq-shipping"
         aria-labelledby="ng-accordion-trigger-x1-0" ngh="0" jsaction="keydown:;">
      <div class="nfs-accordion-content-body nfs-accordion-content-shown">
        <p>Orders ship within two days.</p>
      </div>
    </div>
  </li>
  <li class="accordion-item">
    <h3>
      <button class="accordion-title" role="button" type="button" id="ng-accordion-trigger-x1-1"
              data-active="false" aria-expanded="false" aria-controls="faq-returns"
              aria-disabled="false" tabindex="0" jsaction="click:;keydown:;">Returns</button>
    </h3>
    <div class="accordion-content" role="region" id="faq-returns"
         aria-labelledby="ng-accordion-trigger-x1-1" inert="true" ngh="0" jsaction="keydown:;">
      <div class="nfs-accordion-content-body">
        <p>Returns are free for 30 days.</p>
      </div>
    </div>
  </li>
</ul>
```

Hydrated, just after clicking "Returns" (both transitions running; `expandedChange` has fired, `opened`/`closed` have not):

```html
<li class="accordion-item">
  <h3><button class="accordion-title" ... aria-expanded="false" aria-disabled="false">Shipping</button></h3>
  <div class="accordion-content" role="region" id="faq-shipping" ... inert="true">
    <div class="nfs-accordion-content-body">...</div>
  </div>
</li>
<li class="accordion-item is-active">
  <h3><button class="accordion-title" ... aria-expanded="true" aria-disabled="true">Returns</button></h3>
  <div class="accordion-content" role="region" id="faq-returns" ...>
    <div class="nfs-accordion-content-body">...</div>
  </div>
</li>
<!-- after each transitionend on grid-template-rows: closed(Shipping), opened(Returns);
     the Returns body gains nfs-accordion-content-shown -->
```

Lazy content, `[region]="false"`, generated ids, closed on the server:

```html
<ul nfsAccordion multiExpand allowAllClosed [region]="false">
  <li nfsAccordionItem>
    <h2><button nfsAccordionTitle [panel]="report.panel">Annual report</button></h2>
    <div nfsAccordionContent #report="nfsAccordionContent">
      <ng-template nfsAccordionLazyContent><app-report-table /></ng-template>
    </div>
  </li>
</ul>

<!-- server -->
<ul class="accordion" multiexpand="" allowallclosed="" jsaction="keydown:;click:;focusin:;">
  <li class="accordion-item">
    <h2><button class="accordion-title" role="button" type="button" id="ng-accordion-trigger-x1-2"
                aria-expanded="false" aria-controls="ng-accordion-panel-x1-0" aria-disabled="false"
                tabindex="0" data-active="false" jsaction="click:;keydown:;">Annual report</button></h2>
    <div class="accordion-content" id="ng-accordion-panel-x1-0" inert="true" ngh="0" jsaction="keydown:;">
      <div class="nfs-accordion-content-body"><!--container--></div>
    </div>
  </li>
</ul>
<!-- opened: <app-report-table> renders inside the body; closed: removed once closed has fired
     (kept with preserveContent) -->
```

### Animation

Per ADR 0003 and building-blocks 1.6 rule 3: the content stays in the DOM, so the height animates through a CSS transition keyed on the item's `.is-active` State class, never `animate.enter`/`animate.leave` (which play again at hydration on server-rendered elements, [Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)).

- Mechanism (all in `nfs-accordion`, Sass below): `.accordion-content` is a one-row grid, `grid-template-rows: 1fr` when its item is active and `0fr` (with zero block padding and border) when not, with `transition: grid-template-rows $duration ease-in-out, padding-block $duration ease-in-out`; the wrapper's inner element has `min-height: 0` and clips (`overflow: hidden`) until `.nfs-accordion-content-shown`. The prototype measured intermediate `grid-template-rows` values and `transitionend` in Chromium, Firefox, and WebKit (case 12). Easing `ease-in-out` stands in for jQuery's default `swing`.
- Clip only while needed: `nfs-accordion-content-shown` is bound on the inner element when the item is open and its opening transition has completed (on the server and at first render: whenever the item is open). So focus rings and Anchored panes (a Dropdown pane or Tooltip tip positioned in place inside an open panel) are not clipped, and text-spacing overrides are not cut off; jQuery's `slideDown` also set `overflow: hidden` only while sliding.
- Phase: `NfsAccordionContent` holds `#settled`, a `linkedSignal` over the item's `expanded`: `true` at first render (server and client), reset to `false` on every change, and set back to `true` on completion. `shown` is `expanded() && settled()`.
- Completion: in an `afterRenderEffect` whose read phase runs while `#settled` is `false`, the component reads the host's computed `transition-property`, `transition-duration`, and `transition-delay` and takes the entry for `grid-template-rows` (or `all`). If there is none, or its total is 0, or `nfsAnimationsToken.disabled` is set, the phase completes at once. Otherwise it completes on the host's `transitionend` with `propertyName === 'grid-template-rows'` and `event.target` equal to the host (a nested accordion's transition bubbles up and is ignored), or on a fallback timer of the measured total plus 100 ms started outside the Angular zone, whichever comes first. `transitioncancel` is ignored: reversing a running transition cancels the old one and the new one ends with its own `transitionend`, while a transition removed by a stylesheet change is covered by the timer. This measures, as the Toggler spec does, instead of using building-blocks 1.6 rule 1's "declared duration", because `$duration` is the consumer's.
- Completion outputs: once `#settled` is `true` and the committed state differs from the last emitted one, a render callback emits the item's `opened` or `closed` and then the accordion's `opened` or `closed` with the item. No emission for the initial state. Each item emits for itself; in single mode the closing and opening items emit in the order their transitions end.
- Interruption: toggling mid-transition resets the phase; the interrupted phase emits nothing and its timer is cleared.
- Lazy content: rendered while `expanded() || !settled()` (so it stays during the closing transition and is removed after `closed`), or from the first expansion on with `preserveContent` (a `linkedSignal` that stays `true`).
- Reduced motion: `nfs-accordion` sets `transition-duration: 1ms` on `.accordion-content` under `prefers-reduced-motion: reduce`, so `transitionend` still fires and the change is effectively instant (building-blocks 1.6 rule 5).
- Disabled animations: with `nfsAnimationsToken` `{disabled: true}` the content binds `[style.transition]="'none'"` and completes each phase at once.
- `@supports not (grid-template-rows: 0fr)` is not emitted (building-blocks 1.6 rule 3 records the same conclusion): it tests parsing, and every browser that parses grid parses `0fr`, so in the Browser target it never matches; a browser that parses but does not interpolate simply snaps, which is the correct fallback, and the timer still completes the phase (prototype "what the prototype does not prove"; CSS grid `fr` interpolation is in target, building-blocks 1.2).
- Nothing animates at hydration or first render: the class list and the grid row are identical on server and client, and a transition only runs on a change after hydration.

### Rendering modes

Per ADR 0008 and the Angular rendering modes research, section 7, rules 1 to 11:

- Server-side rendering and first paint: `.is-active`, `aria-expanded`, `aria-controls`, `aria-disabled` (locked included, from registration counts), `role`, `aria-labelledby`, `inert`, the `disabled` attribute, the inner element's classes, and open lazy content are all host or template bindings on signal state that exists on the server (rule 1). Open panels are visible through `nfs-accordion` (Foundation's CSS never shows `.accordion-content`, rule 2); collapsed panels are clipped to zero height and `inert`. Panel content is projected, so it is in the server HTML (building-blocks 1.11 decision 2). Titles carry `tabindex="0"`, so the Tab key reaches them before hydration (prototype case 10).
- Before hydration: construction only reads `HostAttributeToken`, injects, registers, and seeds Aria's model; Aria's own constructor adds `type="button"` to a typeless button, which lands identically in server HTML. Hash, history, `hashchange`, computed style, focus, scrolling, and timers run only in render callbacks or handlers (rules 3 to 5).
- Full hydration: host binding values equal the server's (generated ids aside), so nothing changes and no transition runs (rule 10). Clean hydration with no NG05xx and no skipped components was measured in the prototype (case 16).
- Event replay: the title's `click` and `keydown`, the accordion's `keydown`, `click`, `focusin`, and the content's `keydown` replay (rule 6). A replayed click toggles once with no error (case 23). A replayed Enter or Space toggles once, because Aria ignores the synthetic click (case 21). A replayed arrow key, Enter, or Space from a title changes state and then Aria's trailing `preventDefault()` throws, so Angular's `ErrorHandler` logs ``ERROR Error: `preventDefault` called during event replay.`` once per replayed key (cases 20 to 22; the log is accepted, Triage in the ticket); the Replay guard keeps an outer accordion from handling the key again (case 25). A replayed Enter or Space on a locked title is stopped by the library listener before Aria and logs nothing. Replayed keys from inside a panel are stopped by the content key guard.
- Hydration boundary: the accordion, its items, titles, and contents belong to one hydration boundary; items in a dehydrated block would not be registered with the accordion (rule 7). A nested accordion is a complete widget and may sit in its own `@defer` block inside a panel.
- `@defer`: library templates contain no `@defer`; `ngx-foundation-sites/accordion` is its own entry point. Inside a dehydrated block the accordion is its server HTML; a click or key press on a title hydrates the block and replays. Inside `@defer (hydrate never)` open panels stay readable and closed panels stay unreachable, and titles do nothing, so an accordion whose closed content matters must not be placed there. Plain `@defer` renders the accordion on the client in its initial state with no animation. For heavy code inside a panel, a consumer uses Lazy content or `@defer (when item.expanded())`; `on viewport` is not a reliable trigger for content in a collapsed, zero-height panel.
- Deep links apply after hydration because the server never sees the fragment; a consumer who needs a server-correct open panel binds `[expanded]` from route data (building-blocks 1.11 decision 9).
- Prerendering: identical to server rendering; no request token is read (rule 11).
- Aria's dev-mode check logs a `console.warn` pair per panel ("ngAccordionPanel must have an ngAccordionContent to render.") because content is projected; it is silent in production and cannot be silenced by a directive or component (prototype case 17). Accepted and documented (Triage in the ticket).
- Zoneless: signals only; the fallback timer runs outside the zone and writes a signal.

### Sass and custom CSS

One Library mixin, `nfs-accordion`, included after `foundation-accordion`; the Sass subsection under Further Notes lists every rule and its reason. No directive or component declares `styles` (ADR 0012).

## Testing Decisions

A good test asserts what a user or assistive technology observes: `aria-expanded`, `aria-disabled`, `aria-controls`, `role`, `inert`, `.is-active`, the inner element's classes, the rendered height, where focus lands, the URL, and when `opened`/`closed` fire relative to the transition. No test reads private fields or the phase signal. Prior art: the prototype's Playwright suite (server HTML, hydrated behaviour, replay with the bundle held back) and the published [Spec: Toggler](../issues/17-spec-toggler.md) layers; no prior art exists in the new repository.

Story ids follow `accordion--<story>`: `accordion--default`, `accordion--multi-expand`, `accordion--allow-all-closed`, `accordion--disabled`, `accordion--disabled-item`, `accordion--nested`, `accordion--form-in-panel`, `accordion--lazy-content`, `accordion--programmatic`, `accordion--two-way-binding`, `accordion--deep-link`, `accordion--no-region`.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` from the Storybook preview, so `target-size` and `color-contrast` are part of the enforcing gate. The preview's Foundation settings carry `$accordion-item-color: scale-color($primary-color, $lightness: -15%);` with a `color-contrast` comment (the browser testing stack decision's permitted response to a failing Foundation default). Animated steps wait for the Completion output shown in the story, never a timeout.

- `accordion--default`: Foundation's docs example with a static `is-active` first item. First title `aria-expanded="true"`, `aria-disabled="true"`; clicking it changes nothing; clicking the second closes the first and opens the second (`.is-active` moves, first content `inert`); `closed` and `opened` appear; ArrowDown, ArrowUp, Home, End move focus without opening; Enter and Space toggle through `userEvent.keyboard`. Each title's name contains its visible text. The play ends with focus on a title, so axe measures the focus background.
- `accordion--multi-expand`: two panels open together; `expandAll()` and `collapseAll()` buttons (with `allowAllClosed`) open and close all.
- `accordion--allow-all-closed`: the only open title has `aria-disabled="false"` and closes.
- `accordion--disabled`: `disabled` on the accordion renders the `disabled` attribute and `aria-disabled="true"` on every title; clicks and keys change nothing; titles stay focusable.
- `accordion--disabled-item`: one disabled title; others work; ArrowDown still reaches the disabled title.
- `accordion--nested`: an accordion inside a panel; keys on inner titles move only among inner titles; closing the outer panel does not change the inner state.
- `accordion--form-in-panel`: a text input and a textarea inside an open panel; typing Space, Enter, Home, End, ArrowDown there edits text, keeps focus, and leaves every panel as it was.
- `accordion--lazy-content`: lazy content is absent while closed, present while open, removed after `closed`; with `preserveContent`, kept after closing.
- `accordion--programmatic`: `open()`, `close()`, `toggle()` through `#item`; a "Done" button inside a panel calls `close()` and focus lands on that panel's title.
- `accordion--two-way-binding`: `[(expanded)]` bound to signals shown in the story; clicks update them, checkboxes update the panels.
- `accordion--deep-link`: `deepLink` and `updateHistory` controls and consumer ids; clicking a title writes the hash shown in the story (the Storybook half of layer 4 covers reload and Back).
- `accordion--no-region`: `[region]="false"` with five open panels; contents have no `role` and no `aria-labelledby`.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Expansion policy, table-driven over `multiExpand` and `allowAllClosed`: exclusivity through clicks, `open()`, and `toggle()`; the lock appears and moves with the open count; `close()` on a locked item does nothing; a disabled open item stays open when another opens (Aria's `isExpandable` rule); `expandAll()` only with `multiExpand`, `collapseAll()` only with `allowAllClosed`.
- Initial state: static `is-active` seeds `expanded`; a bound `[expanded]="false"` wins over it; two static `is-active` items in single mode keep both open and warn.
- `expandedChange` fires at request time; item and container `opened`/`closed` fire once each, after `transitionend` for `grid-template-rows` on the host, in order, with the item as payload; `transitionend` from a nested content or for `padding-top` does not complete; `transitioncancel` does not complete; interruption emits only for the final state.
- Fallback paths: a stylesheet without the transition completes at once; a suppressed `transitionend` completes after the measured total plus 100 ms (fake timers); `nfsAnimationsToken` `{disabled: true}` binds `transition: none` and completes at once.
- `nfs-accordion-content-shown`: present at first render for open items, removed at once on close, added only after completion on open.
- Focus: closing a panel through `close()`, through exclusivity from `open()` of another item, and through `collapseAll()` while focus is inside moves focus to the title; opening never moves focus.
- Content key guard: keydown events for each guarded key dispatched from an input inside a panel do not reach a listener on the accordion host; modified and repeated keys do.
- Replay-safe handlers: an Enter keydown with `eventPhase` redefined to 101 and a throwing `preventDefault` on a locked title changes nothing and reaches no `ErrorHandler`; the same on an inner title of a nested accordion leaves the outer accordion's active title unchanged (Replay guard); a replayed click toggles and reaches no `ErrorHandler`.
- `region`: `[region]="false"` removes `role` and `aria-labelledby`; `true` restores them; the defaults token sets it.
- Defaults token: each option seeded, overridden by a binding.
- Deep-link logic against the test page's own history: `afterNextRender` reads a preset hash and opens the matching item and emits `deepLinked`; a dispatched `hashchange` opens another; an empty hash reopens the first-render item; user opening writes `#id` with `replaceState` and keeps `history.state`; `updateHistory` uses `pushState`; closing the named item clears the fragment; exclusivity closing does not clear the new hash.
- Dev-mode checks: each of the six warnings fires once for its case and not for correct markup.
- Aria composition: Aria's `AccordionHarness` from `@angular/aria/accordion/testing` finds each title and reports `isExpanded`, `isDisabled` consistent with the DOM.

### 3. Node-level Vitest

- SSR smoke, under `npx nx test <lib>` in `accordion.ssr.spec.ts` through the shared `renderServer()` helper (`npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not): a fixture with the default example (static `is-active` first item), a bound open item, a disabled accordion, a disabled item, a nested accordion, lazy content open and closed, `[region]="false"`, consumer and generated ids, and one accordion inside `@defer (hydrate on interaction)`. Assert `whenStable()` resolves; the HTML matches the Rendered HTML section (`.is-active`, `aria-expanded`, `aria-disabled` including the locked title, `aria-controls`, `role`, `aria-labelledby`, `inert`, the `disabled` attribute, `nfs-accordion-content-shown` on open bodies, open lazy content present and closed absent); `jsaction` on the accordion (`keydown`, `click`, `focusin`), titles (`click`, `keydown`), and contents (`keydown`); `ngb` and `click:;keydown:;` on the deferred block's root.
- Sass compile, node-level (ADR 0012's compile test): `nfs-accordion` compiled after Foundation with default settings emits the seven rule groups and one `@warn` for contrast; with `$accordion-item-color: scale-color($primary-color, $lightness: -15%)` it emits no warning; with `$accordion-plusminus: false` the re-included title rules carry no `::before`.
- Pure logic, table-driven: the transition-list reduction (property, duration, delay lists of unequal length, `all`, `0s`), the heading check over parent tag names, the hash lookup (encoded ids, `#/` routes, empty hash), and the guarded-key matcher.

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Storybook half, on the Story ids above:

- `accordion--deep-link` loaded with `#faq-returns`: the panel opens after load and `deepLinked` fires; with `deepLinkSmudge` and a `scroll-margin-top` the item's top lands below the margin; clicking another title rewrites the hash; with `updateHistory`, Back reopens the previous panel; closing the named panel clears the fragment; reload with the hash restores the panel.
- `accordion--default` in Chromium, Firefox, and WebKit: real key presses, intermediate `grid-template-rows` values during a transition, then `opened`; with `emulateMedia({reducedMotion: 'reduce'})` completion is immediate.
- `accordion--form-in-panel`: real typing in all three engines.
- `@axe-core/playwright` with the six tags on the `accordion--default` state with a title hovered, a state no play function reaches.

Fixture half, one `accordion` route (the harness from the rendering-mode test seam prototype):

- JavaScript disabled: screenshot plus `@axe-core/playwright` with the six tags; the open panel is visible with its content, closed panels are zero height, titles are reachable by Tab.
- Hydration: no NG05xx, `componentsSkippedHydration === 0`, and no `transitionrun` on any content during hydration.
- Pre-hydration input with the main bundle held back: a click on a closed title opens it exactly once after hydration with no console error; an ArrowDown on a title moves focus after hydration and logs exactly the one accepted replay error; an Enter on the locked title changes nothing and logs nothing; an ArrowDown on an inner nested title leaves focus on the inner accordion.
- `@defer (hydrate on interaction)`: a click on a title hydrates the block and toggles the panel.
- `@defer (hydrate never)`: the open panel stays readable, a title click changes nothing and logs nothing.

## Out of Scope

- `<details>`/`<summary>` as the base, and `<details name>` exclusivity (out of target; heading problem; Further Notes).
- AccordionMenu and ResponsiveAccordionTabs, which have their own specs; they reuse the policy, the guards, and the animation rules described here.
- A Material-style header component, indicator inputs (`hideToggle`, `togglePosition`), `displayMode`, and fixed header heights.
- Runtime theming through custom properties (building-blocks 1.13); the animation duration is a Sass mixin parameter.
- Hash routing (`HashLocationStrategy`) with `deepLink`, and deep links through the Angular Router.
- Motion classes (`nfs-motion`) for panels: Foundation animated height, not Motion UI.
- Screen reader verification beyond the axe gate and the name, role, and state assertions (listed human-only in the ticket).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | `@angular/aria` accordion through `hostDirectives` | Direct match; composition proven under SSR, hydration, and replay in three engines (the [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md)) | Native `<details name>` (out of target, no heading); CDK accordion with custom ARIA (the unused fallback) |
| D2 | Four directives plus one Wrapper component and a lazy marker | ADR 0001 case 2: the grid row needs one inner element; everything else is consumer markup | Component items or panels rendering their own markup |
| D3 | `button[nfsAccordionTitle]` inside `h1`-`h6`, dev check 1 | APG; Aria adds `role="button"` to any host, a native button needs no emulation | Foundation's `<a href="#">` |
| D4 | The consumer binds `[panel]="c.panel"` with `#c="nfsAccordionContent"` | Markup names only library exports, as with `#x="nfsReveal"` (ADR 0013); Aria stays an implementation detail of the content; both forms are type-checked under strict templates (prototype case 3) | `#p="ngAccordionPanel"` with `[panel]="p"` (shorter, but writes Aria's export name into every consumer template); a component item that binds `panel` itself (cannot bind inputs on projected elements, case 1) |
| D5 | Library-owned `multiExpand` (default `false`) and `allowAllClosed` (default `false`) over Aria in multi mode | Foundation, CDK, and Material default to single; a wrapper cannot change Aria's input default (cases 4, 5) but can drive its models (ADR 0028) | Expose Aria's `multiExpandable` and record `true` as a delta |
| D6 | Locked title: `aria-disabled="true"` plus `click`/Enter/Space stopped at the title | APG rule for a panel that may not collapse; no double `expandedChange`; no `preventDefault`, so replay logs nothing | Re-opening after Aria closed it |
| D7 | `expanded` model on the title, read-only `expanded` and methods and Completion outputs on the item | Aria owns the model on the trigger; two writable copies would need syncing; the item is Foundation's `.accordion-item` and Material's panel counterpart | A second `expanded` model on the item |
| D8 | Static `is-active` on the item seeds the initial state | Foundation's documented markup; identical on server and client; the Toggler precedent | Ignoring the static class (the binding would strip it) |
| D9 | Completion measured from the computed transition, then `transitionend`, else measured total plus 100 ms; `transitioncancel` ignored | `$duration` is the consumer's; a missing transition completes at once; reversal fires cancel for the old transition | A fixed declared duration; completing on cancel |
| D10 | Inner element clips only while collapsed or animating | Focus rings, Anchored panes, and text-spacing overrides inside open panels; matches `slideDown` | Permanent `overflow: hidden` (the prototype's rule) |
| D11 | No `@supports` guard | Never matches in target; a non-interpolating browser snaps, which is correct (building-blocks 1.6 rule 3 records the same conclusion) | A `@supports not (grid-template-rows: 0fr)` guard |
| D12 | Lazy content rendered by the wrapper's own template (`@if` plus `NgTemplateOutlet`), while shown or with `preserveContent` | Open lazy panels render on the server and hydrate (the Angular rendering modes research, section 5); content stays through the closing transition; no dependency on Aria's private `DeferredContentAware` | Aria's `ngAccordionContent` (empty in server HTML, destroys content before the close animation) |
| D13 | Content key guard on `NfsAccordionContent` | Aria's group handles keys from inside panels (source reading); stopping only Aria's exact key set limits the side effects | Leaving it (Space in a panel input would toggle a panel) |
| D14 | Replay guard on `NfsAccordion` | Prototype case 25: a replayed key otherwise reaches the outer accordion | Accepting wrong focus in nested accordions |
| D15 | Deep links through the History API, `history.state` preserved, fragment cleared on close, URL not restored on destroy | No Router dependency, no navigation cycle or anchor scrolling per toggle; Router entries keep their state; a reload shows what the user saw | Router `fragment` and `navigate` (heavy, scrolls, needs `@angular/router`); Foundation's hash left on close |
| D16 | `deepLinkSmudge` scrolls the opened item after `opened` | Shows the linked title and content once positions settle; `scroll-margin-top` replaces the offset option | Scrolling to the accordion's top over a JavaScript-timed duration |
| D17 | `region` input, default `true` | APG: avoid landmark proliferation in multi-expand accordions with many open panels; collapsed panels are `inert` and not counted | No control over Aria's unconditional `role="region"` |
| D18 | Glyph kept in the accessible name | Meets 2.5.3 and 4.1.2 as written; CSS alternative text is out of target; one code path (building-blocks 1.2) | A second CSS path with `content: ... / ''`; moving the glyph (re-implements Foundation's icon rule) |
| D19 | Contrast fixed by a consumer setting plus a Sass `@warn` from the unrounded ratio (Foundation's `color-luminance()` and the WCAG formula) | Reuses Foundation settings; the library does not override consumer colours; the unrounded ratio is building-blocks 1.10's rule, because `color-contrast()` rounds to one decimal and would pass a failing pair | A library colour rule overriding `$accordion-item-color`; a `@warn` from Foundation's `color-contrast()` |
| D20 | `:where()` for the heading selectors in `nfs-accordion` | Re-included Foundation declarations keep `.accordion-title`'s specificity, so consumer rules written for Foundation still win by order | The prototype's `:is()` (raises specificity of every re-included declaration) |
| D21 | Directives add their Structural classes | Bare directive markup gets Foundation's contract; copied Foundation markup still works | Requiring the consumer to write every class |
| D22 | No token re-provided as `undefined`; required parent injection | Every nested level is its own accordion; Aria requires the group anyway | The CDK nesting pattern (no case needs it here) |
| D23 | Aria's generated id prefixes kept | A wrapper cannot change an Aria input default; ids matter only when addressed from outside, which needs consumer ids | `nfs-accordion-panel-` (building-blocks 1.5) |

### Usage examples

```ts
@Component({
  selector: 'app-faq',
  imports: [NFS_ACCORDION],
  template: `
    <button type="button" class="button" (click)="faq.expandAll()">Expand all</button>
    <button type="button" class="button" (click)="faq.collapseAll()">Collapse all</button>

    <ul nfsAccordion #faq="nfsAccordion" multiExpand allowAllClosed deepLink
        (opened)="track($event)">
      <li nfsAccordionItem class="is-active">
        <h2><button nfsAccordionTitle [panel]="shipping.panel">Shipping</button></h2>
        <div nfsAccordionContent #shipping="nfsAccordionContent" id="faq-shipping">
          <p>Orders ship within two days.</p>
        </div>
      </li>
      <li nfsAccordionItem #returnsItem="nfsAccordionItem">
        <h2><button nfsAccordionTitle [panel]="returns.panel" [(expanded)]="returnsOpen">Returns</button></h2>
        <div nfsAccordionContent #returns="nfsAccordionContent" id="faq-returns">
          <p>Returns are free for 30 days.</p>
          <button type="button" class="button small" (click)="returnsItem.close()">Done</button>
        </div>
      </li>
      <li nfsAccordionItem>
        <h2><button nfsAccordionTitle [panel]="history.panel" [disabled]="!signedIn()">Order history</button></h2>
        <div nfsAccordionContent #history="nfsAccordionContent" id="faq-history">
          <ng-template nfsAccordionLazyContent preserveContent>
            <app-order-history />
          </ng-template>
        </div>
      </li>
    </ul>
  `,
})
export class Faq {
  protected readonly returnsOpen = signal(false);
  protected readonly signedIn = signal(false);

  protected track(item: NfsAccordionItem): void {
    // item.expanded() is true and its panel has finished opening
  }
}
```

```html
<!-- Foundation's default behaviour: one open at a time, last one stays open -->
<ul nfsAccordion>
  <li nfsAccordionItem class="is-active">
    <h3><button nfsAccordionTitle [panel]="a.panel">Accordion 1</button></h3>
    <div nfsAccordionContent #a="nfsAccordionContent"><p>Panel 1.</p></div>
  </li>
  <li nfsAccordionItem>
    <h3><button nfsAccordionTitle [panel]="b.panel">Accordion 2</button></h3>
    <div nfsAccordionContent #b="nfsAccordionContent">
      <!-- nested accordion -->
      <ul nfsAccordion allowAllClosed>
        <li nfsAccordionItem>
          <h4><button nfsAccordionTitle [panel]="b1.panel">Detail</button></h4>
          <div nfsAccordionContent #b1="nfsAccordionContent"><p>More.</p></div>
        </li>
      </ul>
    </div>
  </li>
</ul>
```

```ts
// App-wide defaults
bootstrapApplication(App, {
  providers: [{provide: nfsAccordionDefaultsToken, useValue: {allowAllClosed: true, deepLink: true}}],
});
```

```scss
// Consumer styles: Foundation first, then the library, then the includes
@import 'settings'; // with $accordion-item-color: scale-color($primary-color, $lightness: -15%);
@import 'foundation';
@import 'ngx-foundation-sites';

@include foundation-global-styles;
@include foundation-accordion;
@include nfs-accordion;

// Sticky header: keep deep-linked and focused titles clear of it
html { scroll-padding-top: 4rem; }
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-accordion` (and `foundation-global-styles`, whose button reset and focus-outline rule the titles inherit). Its documented custom CSS is the `nfs-accordion` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-accordion`.

(1) Rules the mixin emits, each with its reason:

1. `.accordion-item > :where(h1, h2, h3, h4, h5, h6) { margin: 0; }`: the APG heading is only a semantic container, and Foundation's base typography gives headings a bottom margin.
2. `button.accordion-title { width: 100%; text-align: start; cursor: pointer; }`: Foundation assumes `<a class="accordion-title">`; a button neither stretches nor aligns to the start, and Foundation's button reset sets `cursor: $global-button-cursor`. Foundation's `.accordion[disabled] .accordion-title` cursor rule still wins by specificity.
3. `:where(h1, h2, h3, h4, h5, h6) > .accordion-title { @include accordion-title; }`: Foundation's `accordion-title` mixin writes two child-combinator rules (the closed last title's bottom border and the `.is-active` minus glyph) that stop matching once a heading sits between the item and the title; re-including Foundation's own mixin under the heading selector re-creates them from the consumer's settings. `:where()` keeps the specificity of the repeated declarations equal to Foundation's.
4. `.accordion-content { display: grid; grid-template-rows: 1fr; transition: grid-template-rows $duration ease-in-out, padding-block $duration ease-in-out; }`: Foundation hides the content with `display: none` and has no rule for the shown state (its JavaScript wrote inline `display`); this shows it as a one-row grid and animates the row.
5. `.accordion-item:not(.is-active) > .accordion-content { grid-template-rows: 0fr; padding-block: 0; border-block-width: 0; }`: a collapsed item looks like Foundation's `display: none` one; an open item keeps Foundation's padding and border untouched.
6. `.nfs-accordion-content-body { min-height: 0; overflow: hidden; }` and `.nfs-accordion-content-shown { overflow: visible; }`: the single inner element the grid row clips while collapsed or animating, and stops clipping once open, for focus rings, Anchored panes, and text spacing.
7. `@media (prefers-reduced-motion: reduce) { .accordion-content { transition-duration: 1ms; } }`: the reduced-motion override for the one transition this mixin adds and the directive awaits.

Plus compile-time checks that emit no CSS: `@warn` when the ratio of `$accordion-item-color` against `$accordion-background` or against `$accordion-item-background-hover`, or of `$accordion-content-color` against `$accordion-content-background`, is below 4.5 (WCAG 2.2 1.4.3 for Foundation's 12 px title and body text), naming the setting to change. Each ratio is computed from Foundation's `color-luminance()` with the WCAG formula and compared unrounded, because Foundation's `color-contrast()` rounds to one decimal (building-blocks 1.10).

(2) Reused settings, mixins, and functions: the `accordion-title` mixin and, through it, `$accordion-item-padding`, `$accordion-title-font-size`, `$accordion-item-color`, `$accordion-content-border`, `$accordion-item-background-hover`, `$accordion-plusminus`, `$accordion-plus-content`, `$accordion-minus-content`, `$global-radius`, `$global-right`; `color-luminance()`; `$accordion-background`, `$accordion-content-color`, `$accordion-content-background` for the checks. One mixin parameter, for a value Foundation has no setting for: `$duration`, default `250ms` (Foundation's `slideSpeed` default).

(3) Custom properties: none.

(4) Motion classes: none; the mixin's own reduced-motion override is rule 7.

(5) What breaks without the include: open panels never show (Foundation's `display: none` stays), which dev check 6 reports; titles are narrow and centred; the minus glyph and the closed last title's border are missing; there is no animation. Without the contrast setting, the `@warn` fires and the story gate fails on focused and hovered titles.

The library's Storybook preview settings set `$accordion-item-color: scale-color($primary-color, $lightness: -15%);` with a comment naming axe's `color-contrast` rule.

### Platform features to adopt when the browser target moves

- CSS generated-content alternative text (`content: $accordion-plus-content / ''`; Chrome 77, Safari 17.4, Firefox 128, so widely available about 2027-01): removes the glyph from the title's accessible name and the heading's name with one rule, re-including nothing.
- `<details name>` and `::details-content` (Chrome 120 and 131, Firefox 130 and 143, Safari 17.2 and 18.4): would remove the Wrapper component's inner element and the exclusivity code, but only once a heading can wrap the control; until the APG accepts a heading inside `<summary>`, they stay a candidate, not a plan.
- `interpolate-size: allow-keywords` (Chromium only): `height: auto` transitions without the grid row or the inner element.
- `hidden="until-found"` with `beforematch` (not widely available on 2026-05-07): find-in-page could open a collapsed panel, with `beforematch` opening the item; it needs `content-visibility: hidden` instead of `inert` on collapsed panels and its own design pass against Foundation's CSS.
- `transition-behavior: allow-discrete`: `overflow` could switch as part of the transition instead of through `nfs-accordion-content-shown`.
- Invoker Commands: not applicable; titles are Aria-driven buttons inside the widget.

### Foundation behaviour changed or dropped

- `<a href="#" class="accordion-title">` becomes `<button>` inside a heading; `href` is no longer the deep-link source, the content `id` is.
- Arrow keys no longer open panels in single mode; they move focus (APG, Aria).
- The title of a pane that may not close announces `aria-disabled="true"`; Foundation gave no signal.
- `aria-hidden` on panes becomes `inert`; the pane is shown by CSS (`nfs-accordion`) instead of inline `display`.
- Closing the pane the hash names clears the fragment; Foundation left it, so a reload reopened a pane the user had closed.
- `deepLinkSmudge` scrolls the opened item after it has opened, by the browser's smooth scroll, instead of animating the accordion's top in JavaScript; `deepLinkSmudgeDelay` and `deepLinkSmudgeOffset` are dropped (`scroll-margin-top`).
- `slideSpeed` becomes the `nfs-accordion($duration)` mixin parameter.
- New: per-item `disabled`, `region`, `expandAll()`, `collapseAll()`, Lazy content, and focus return when a panel closes around focus.
- jQuery-only behaviour dropped: `slideDown`/`slideUp` with `finish()`, `$('html, body').animate` for the smudge, `.data()` option coercion, `find('a:first')` title discovery, `_closeTab` over multi-element sets, `GetYoDigits` ids, `console.info` on disabled toggles, and the mutable `Foundation.Accordion.defaults` object.
