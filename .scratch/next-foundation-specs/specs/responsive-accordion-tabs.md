# Spec: Responsive Accordion Tabs

Ticket: [Spec: Responsive Accordion Tabs](../issues/19-spec-responsive-accordion-tabs.md). Targets Angular 22.2 (`@angular/core`, `@angular/cdk`, `@angular/aria`), Nx 23.2, Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, TypeScript 6.0.x, and Foundation for Sites 6.9.0 Sass. Accessibility target: WCAG 2.2 AA, every criterion a requirement. Built on the resolved [Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md), [Prototype: `@angular/aria` Accordion and Tabs under Foundation markup](../issues/43-prototype-aria-accordion-tabs.md), and [Prototype: Breakpoint handoff under hydration](../issues/60-prototype-breakpoint-handoff-hydration.md), and composing the published [Spec: Accordion](accordion.md), [Spec: Tabs](tabs.md), and [Spec: Breakpoint service (shared utility)](breakpoint-service.md). Revised on 2026-09-27 under the class rule ([ADR 0039](../adr/0039-directives-manage-every-foundation-class.md)) by [Re-run: Responsive Accordion Tabs spec under the class rule](../issues/111-rerun-responsive-accordion-tabs-class-rule.md): neither the consumer nor the component's own template writes a Foundation or library class, and the Tabs looks the component renders are typed inputs ([ADR 0040](../adr/0040-variant-input-types.md)).

## Problem Statement

A developer building an Angular application on Foundation for Sites wants Foundation's Responsive Accordion Tabs: one set of sections that shows as an accordion on narrow screens and as tabs on wide ones (or the reverse), switched by a Breakpoint rule such as `accordion medium-tabs`. Foundation's plugin does this with jQuery, and the way it does it cannot be carried into Angular:

- It rewrites the DOM on every switch: it moves each panel out of its `li` into a generated `.tabs-content` sibling (or back), leaves a placeholder `div` behind, rewrites every title `href`, generates ids, and destroys one plugin to construct the other on the same element. Angular owns its DOM, so none of this can happen behind its back, and none of it can happen before hydration.
- The markup it switches is Foundation's accordion or tabs markup, which already fails the APG: `<a href="#">` titles outside headings in accordion mode, a `tablist` that keeps accordion attributes in tabs mode. Worse, its attribute cleanup selects `$panels.children('a')` instead of the title anchors, so after a switch to accordion the titles keep `role="tab"`, `aria-selected`, and `aria-controls` under `aria-expanded` (source reading).
- The two modes need different elements, not different attributes: a heading holding a button in accordion mode, a bare `tab` in tabs mode (a `tab`'s children are presentational, so a heading inside it disappears), and panels inside each `li` for the accordion but in a sibling box for tabs, because a `tablist` may own only `tab`s.
- Focus is dropped to `body` whenever the element holding it is rewritten, and Foundation keeps no state across the switch except the `is-active` class it copies between `li` and panel. A multi-expand accordion with several open items becomes a tab strip with several selected tabs and several visible panels.
- Every Accordion and Tabs option passes through to whichever plugin is live, so an option such as `deepLinkSmudge` fires again, with its page scroll, each time the viewport crosses a breakpoint.
- Foundation's breakpoints come from a `<meta class="foundation-mq">` read through computed style, which a server does not have.
- Every class is written by hand: `.accordion` or `.tabs` on the element and each item's, title's, and panel's class, `.is-active` for the section open at load, and the Tabs looks (`.simple`, `.primary`) on the element, which the plugin keeps there across switches while it swaps only `.accordion` and `.tabs`.

A server-rendered Angular application adds more: the server cannot know the viewport, so it must render one mode deterministically; a wide client must switch to tabs before the first paint without a hydration error; a title focused before hydration must keep focus through that switch; a click before hydration must either replay or be lost in a documented way; and Foundation's default palette fails WCAG 2.2 AA contrast in both modes.

## Solution

One element-selector component, `nfs-responsive-accordion-tabs`, the first of the three component exceptions ADR 0001 names, plus one panel directive:

- `<nfs-responsive-accordion-tabs [rules]="...">` takes Foundation's Breakpoint rule string (or its object form) and owns both markup trees in its own template. In accordion mode it renders the library's Accordion directive set (`ul[nfsAccordion]`, `li[nfsAccordionItem]`, a heading holding `button[nfsAccordionTitle]`, `[nfsAccordionContent]`); in tabs mode it renders the library's Tabs directive set (`[nfsTabsGroup]`, `ul[nfsTabs]`, `li[nfsTabsTitle]`, `a[nfsTab]`, `[nfsTabsContent]`, `[nfsTabsPanel]`). Because it owns the template, it writes the Accordion's `[panel]` links and the Tabs' `value`s itself. Its template writes no `class` attribute: each composed directive binds its own Structural and State classes (ADR 0039), so the server HTML carries every Foundation class of the displayed mode, and the host binds none.
- `simple` and `primary`, two boolean Variant inputs, pass Foundation's simple and primary tab-strip looks to `NfsTabs` in tabs mode; Foundation's accordion has no Variant class, so they do nothing in accordion mode.
- `<ng-template nfsResponsiveAccordionTabsPanel title="Specs" value="specs">` holds one section's content. The component instantiates the same templates in whichever mode is displayed.
- One `selected` model names the open item in both modes: the expanded accordion item (or `undefined` when none is open) and the selected tab. It survives every mode swap, and focus moves to the equivalent control in the new mode. It is also the initial state: `selected="specs"` opens Specs at first paint where Foundation wrote `class="is-active"`.
- A mode swap is the one structural re-render ADR 0008 accepts. The component starts every instance from the Server breakpoint's mode and follows the viewport in its own first render callback, so server HTML hydrates exactly as sent, a client-rendered instance never paints the wrong mode, and a control focused before hydration keeps focus.
- Deep links (`deepLink`, `updateHistory`, `deepLinkSmudge`) are owned by the component, once for both modes, so crossing a breakpoint never re-applies the hash or scrolls the page.

The component has no styles and adds no library CSS: accordion mode uses Foundation's accordion Sass plus the `nfs-accordion` Library mixin, tabs mode uses Foundation's tabs Sass plus the `nfs-tabs` Library mixin, and three Foundation settings (the Accordion and Tabs specs' required settings) make both modes pass WCAG 2.2 AA contrast.

## User Stories

1. As an application developer, I want to write `rules="accordion medium-tabs"`, so that Foundation's documented Breakpoint rule string carries over unchanged.
2. As an application developer, I want to pass the rules as an object such as `{small: 'accordion', medium: 'tabs'}`, so that I can build them in TypeScript with type checking.
3. As an application developer, I want the rules to resolve in breakpoint order whatever order I write them in, so that `medium-tabs accordion` means the same as `accordion medium-tabs`, as Foundation's docs promise.
4. As an application developer, I want to change `rules` at runtime, so that a setting in my app can force one mode.
5. As an application developer, I want each section written once as an `ng-template` with a `title` and a `value`, so that I never write the accordion and the tabs markup twice.
6. As an application developer, I want sections rendered by `@for` from data, so that a section list from my API works.
7. As an application developer, I want `[(selected)]` bound to a signal holding a section value, so that I read and set the open section in both modes with one binding.
8. As an application developer, I want `selected` to name the visible tab in tabs mode even when I bound nothing, so that my code always knows what is on screen, as with the Tabs directives.
9. As an application developer, I want `(selectionChange)` to fire only when the open section changes, never for a breakpoint crossing or a default, so that analytics and data loading react to real changes.
10. As an application developer, I want the open section to stay open when the viewport crosses a breakpoint, so that resizing or rotating does not lose the user's place.
11. As an application developer, I want `allowAllClosed`, so that users can close every section in accordion mode, as Foundation's Accordion option allows.
12. As an application developer, I want the last open accordion section to stay open by default, so that Foundation's `allowAllClosed: false` default carries over.
13. As an application developer, I want `selectionMode="explicit"`, so that tabs with slow panels change only on Enter, Space, or click.
14. As an application developer, I want `wrapOnKeys="false"`, so that arrow keys stop at the first and last tab.
15. As an application developer, I want `headingLevel`, so that the accordion titles sit in headings of the right level for my page.
16. As an application developer, I want `label` or `labelledBy`, so that the tab list (and the accordion list) has an accessible name.
17. As an application developer, I want `deepLink`, so that a URL hash naming a section id opens it after load and on `hashchange`, in either mode.
18. As an application developer, I want the hash to follow the section the user opens, with `updateHistory` choosing a new history entry, so that links and Back behave as in Foundation.
19. As an application developer, I want `deepLinkSmudge` and `deepLinkSmudgeOffset`, so that a deep link scrolls the widget into view below my sticky header, once, and never again when the viewport changes.
20. As an application developer, I want a `deepLinked` output, so that I know which section a link opened.
21. As an application developer, I want to read the displayed mode through `#rat="nfsResponsiveAccordionTabs"`, so that surrounding layout can react to it.
22. As an application developer, I want app-wide defaults through a Defaults token, so that every instance in my app shares `allowAllClosed`, the deep-link options, and the heading level.
23. As an application developer, I want to be told plainly that content inside a section is created again when the mode swaps, so that I keep form values and loaded data in my own state rather than inside the panel.
24. As an application developer, I want the documented usage and the component's JSDoc to state the name, unique section values, a mode at the Zero breakpoint, the heading level's range, and an id on every deep-linked section, so that I get them right the first time.
25. As an application developer, I want to import the component from its own entry point, so that a `@defer` block splits it with the rest of a deferred widget.
26. As a keyboard user, I want focus to stay on the same section's control when the layout switches between accordion and tabs, so that a resize or rotation never drops me to the top of the page.
27. As a keyboard user, I want focus inside a panel's content to land on that section's title or tab after a switch, so that I stay in the section I was reading.
28. As a keyboard user, I want the accordion's keys (Enter, Space, ArrowDown, ArrowUp, Home, End) in accordion mode and the tabs' keys (Left, Right, Home, End, with the right-to-left flip) in tabs mode, so that each mode follows its APG pattern in full.
29. As a keyboard user, I want the Tab key to reach the widget before the page hydrates, in either mode, so that server HTML is never a keyboard dead end.
30. As a keyboard user, I want a visible focus indicator in both modes, so that I always know where I am.
31. As a screen reader user, I want accordion mode to be headings holding buttons with expanded state and tabs mode to be a named tab list with tab panels, never a mixture, so that each mode is announced correctly.
32. As a screen reader user, I want collapsed or unselected content removed from the accessibility tree, so that I never land in hidden content.
33. As a low-vision user, I want title and tab text at 4.5:1 and the selected tab's look at 3:1 against its neighbours, so that I can read and find them in both modes.
34. As a pointer or touch user, I want titles and tabs at least 24 by 24 CSS px, so that I can hit them.
35. As a user who prefers reduced motion, I want accordion sections to open without the height animation, so that nothing slides.
36. As a user who rotates a phone, I want the same content and functions in both orientations, so that the switch between modes never hides anything.
37. As a developer of a server-rendered application, I want the server to render the Server breakpoint's mode with correct classes, ARIA, and open-section content, so that the first paint is right without JavaScript.
38. As a developer of a server-rendered application, I want a wide client to switch to tabs before its first paint after hydration, with no hydration error, so that the switch is the only visible change.
39. As a developer of a server-rendered application, I want a title focused before hydration to hand focus to the equivalent tab, so that early keyboard users keep their place.
40. As a developer of a server-rendered application, I want to know what happens to a click made before hydration on a title that the switch removes, so that I can choose client hints or accept it.
41. As a developer using client hints, I want a server that renders tabs for a wide visitor to hydrate unchanged, so that Chromium visitors see no switch at all.
42. As a developer using incremental hydration, I want the component inside `@defer (hydrate on viewport)` to hydrate as sent and then switch, keeping focus, so that deferred widgets behave like eager ones.
43. As a developer of a client-rendered application, I want no frame of the wrong mode painted, so that client rendering looks as if the component knew the viewport from the start.
44. As a developer of a prerendered site, I want the same output as server rendering, so that prerendering needs no special handling.
45. As a developer of a zoneless application, I want the component to need no zone, so that it works with zoneless change detection.
46. As a library maintainer, I want every behaviour asserted through roles, ARIA, State classes, focus, and the URL at the four test layers, including real resizes in three engines, so that regressions surface where they belong.
47. As an application developer, I want the library to set every Foundation class of both modes (`.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`, `.tabs`, `.tabs-title`, `.tabs-content`, `.tabs-panel`, `.is-active`), so that my template carries no Foundation or library class and cannot drift from Foundation's class contract.
48. As an application developer, I want `selected="specs"` to open a section at first paint, in the server HTML too, so that Foundation's `class="is-active"` initial state carries over without a class.
49. As an application developer, I want `simple` and `primary` inputs for Foundation's simple and primary tab-strip looks in tabs mode, so that I choose a look with a typed value instead of a class name, and a typo such as `simple="flase"` fails to compile.
50. As an application developer migrating Foundation markup, I want the documented usage to say that no Foundation class goes on the component's element (`class="tabs"`, `class="accordion"`, `class="simple"`) and what replaces each, so that I do not ship a second border and background around the widget.
51. As an application developer, I want a documented equal-heights recipe for tabs mode that names no Foundation class, so that the widget keeps one height across tabs without JavaScript measurement.

## Implementation Decisions

### Foundation contract

ResponsiveAccordionTabs 6.9 has no options of its own (`ResponsiveAccordionTabs.defaults = {}`), one rule attribute, the base lifecycle events, three methods, and it passes every Accordion and Tabs option to whichever child plugin is live (the Foundation disclosure inventory research, ResponsiveAccordionTabs section; the plugin source; "All data-options from Accordion or Tabs can be passed through", Foundation's docs page).

| Foundation | Behaviour in 6.9 | Library counterpart |
| --- | --- | --- |
| `data-responsive-accordion-tabs="accordion medium-tabs large-accordion"` | Tokens `[<bp>-]<tabs\|accordion>`, split at `-`, bare token means `small`; the last rule in written order whose breakpoint `atLeast` matches wins; no match leaves the markup without a plugin | `rules` input: the rule string or `NfsBreakpointRules<'accordion' \| 'tabs'>`, parsed by the shared `parseNfsBreakpointRules`, resolved by Breakpoint map order through `NfsMediaQuery.resolve()`; no match renders accordion |
| Accordion or Tabs markup on the element | Either form is accepted and rewritten | Neither: the consumer writes `ng-template[nfsResponsiveAccordionTabsPanel]` sections and no Foundation class; the component renders both forms, whose directives bind every class |
| `.accordion` or `.tabs` on the element (the plugin's per-mode class) | Swapped at every switch; every other class on the element is kept | Bound by `NfsAccordion` or `NfsTabs` on the list the component renders; the host binds no class, and the documented usage copies none onto it (Documented usage, 7) |
| `.simple`, `.primary` on the element (Foundation's tabs Sass; not shown on the docs page) | Kept across switches: they style the strip in tabs mode and match no rule in accordion mode | `simple` and `primary` Variant inputs, passed to `NfsTabs` in tabs mode; no effect in accordion mode |
| `.vertical` on the element | Kept across switches: the strip stacks, but the generated `.tabs-content` gets no `.vertical` and no grid places strip and content side by side | Not supported (Out of Scope) |
| Mode swap | Removes `.accordion`/`.tabs`, destroys the child plugin, moves panels between `li`s and a generated `.tabs-content` (placeholder `div` left behind), rewrites title `href`s, constructs the other plugin | The Mode swap: an `@if` branch in the component's own template, in a render callback, with state and focus carried (Rendering modes, Behaviour rules) |
| `.is-active` on an item or title in the markup (the initial section), then carried from `li` to panel | The initial section; afterwards the only state kept | `selected` model, shared by both modes: `selected="specs"` or a binding sets the initial section; sections are templates and carry no class |
| Generated element `id` and pane ids from the title `href` hash or `GetYoDigits` | Needed to link strip and content | No link id needed (the component owns both halves); a section's optional `id` names its content or panel for deep links |
| `multiExpand` (Accordion, `false`) | Several open items; after a switch several selected tabs and visible panels (source reading) | Dropped: the accordion mode is single-expand (Design decisions D5) |
| `allowAllClosed` (Accordion, `false`) | Last open pane cannot close | `allowAllClosed` input, default `false`, passed to `NfsAccordion` |
| `deepLink`, `updateHistory` (both, `false`) | Hash read at each child plugin's init and on `hashchange`; written on toggle | Owned by the component for both modes; children always get `deepLink` false |
| `deepLinkSmudge` (both, `false`) | Scroll to the element after a deep link, again at every switch because the child re-inits | Owned by the component; runs once per deep link |
| `deepLinkSmudgeDelay` (`300`) | Scroll animation duration | Dropped: the browser owns smooth-scroll timing |
| `deepLinkSmudgeOffset` (`0`) | Offset for a sticky header | `deepLinkSmudgeOffset` input, bound as `scroll-margin-top` on the displayed list |
| `slideSpeed` (Accordion, `250`) | jQuery slide duration | Dropped as an input: the `nfs-accordion($duration)` mixin parameter |
| `wrapOnKeys` (Tabs, `true`) | Arrow keys wrap | `wrapOnKeys` input, passed to `NfsTabs` |
| (none; Aria) | Always automatic activation | `selectionMode` input (`'follow'` default, `'explicit'`), passed to `NfsTabs` |
| `autoFocus` (Tabs, `false`) | Focus the selected tab on load | Dropped (D13) |
| `matchHeight` (Tabs, `false`) | Equal panel heights by measurement | Dropped: the Tabs spec's CSS grid recipe, restated on an Application class on the host because the consumer cannot put a class on the component's content box (Usage examples; D25) |
| `activeCollapse` (Tabs, `false`) | Collapsing the selected tab | Dropped (Tabs spec D15) |
| `linkClass`, `linkActiveClass`, `panelClass`, `panelActiveClass` | Class names | Dropped: the classes are the contract |
| `reflow` | Returns the stored plugin on Foundation's re-init | Dropped (Angular lifecycle) |
| `init.zf.responsive-accordion-tabs`, `destroyed.zf.*`, and the child's `init`/`destroyed` at every switch | Lifecycle | None |
| `change.zf.tabs`, `down.zf.accordion`, `up.zf.accordion` (from the live child) | Selection or expansion changed | `selectedChange` (the model) and `selectionChange` (`{value, panel}`) |
| `collapse.zf.tabs` | `activeCollapse` closed the tab | Dropped with `activeCollapse` |
| `deeplink.zf.accordion`, `deeplink.zf.tabs` | A hash matched | `deepLinked` (`{value, panel}`) |
| `open(target)` | `selectTab` or `down` | A `selected` write |
| `close(target)`, `toggle(target)` | Accordion only | A `selected` write (`undefined` closes in accordion mode) |
| `destroy()` | Destroys the child, unbinds the media query | Angular destroy |
| Keyboard and ARIA | Delegated to the child; stale tab attributes after a switch (source bug) | Each mode's directive set in full; nothing carries over between modes |

Dropped options: `multiExpand`, `deepLinkSmudgeDelay`, `slideSpeed`, `autoFocus`, `matchHeight`, `activeCollapse`, `linkClass`, `linkActiveClass`, `panelClass`, `panelActiveClass`, `reflow`, `data-options`. Accordion features the component does not expose: `disabled` (container and per title), `region` (always on: at most one region is open), Lazy content (`nfsAccordionLazyContent`, `nfsTabsLazyContent`). Tabs features it does not expose: `orientation` (vertical tabs need Foundation's grid layout around strip and content, which the component does not own). Tabs features it passes through: the Variant inputs `simple` and `primary`.

### CSS class to Angular mapping

Every Foundation and library class on the widget is set by a directive the component composes or by the Accordion wrapper's template; neither the consumer's markup nor the component's own template writes a class (ADR 0039, building-blocks 1.14). The host binds no class, as no Foundation element corresponds to it. A consumer's own class on the host (the equal-heights recipe's) is kept.

| Foundation class or markup | Kind | Angular | Rationale |
| --- | --- | --- | --- |
| The element carrying `data-responsive-accordion-tabs` | Component host | `NfsResponsiveAccordionTabs`, selector `nfs-responsive-accordion-tabs`, `exportAs: 'nfsResponsiveAccordionTabs'`, no host class | Element-selector component (building-blocks 1.1 case 1, ADR 0001): it renders one of two markup trees; the Structural classes sit on the lists it renders, where Foundation's per-mode `.accordion` or `.tabs` sat on its element; the documented usage copies no Foundation class onto the host (Documented usage, 7) |
| Each Foundation section (accordion item or tab plus panel) | Library marker | `NfsResponsiveAccordionTabsPanel`, selector `ng-template[nfsResponsiveAccordionTabsPanel]`, `exportAs: 'nfsResponsiveAccordionTabsPanel'` | The consumer writes each section once; the template is instantiated in either mode and carries no class |
| `.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content` (accordion mode) | Structural | The Accordion spec's `NfsAccordion`, `NfsAccordionItem`, `NfsAccordionTitle`, `NfsAccordionContent`, rendered by the component, each binding its class as a static `host` class | Composed exactly as the Accordion spec defines them; the component's template puts no `class` on their hosts |
| `.tabs`, `.tabs-title`, `.tabs-content`, `.tabs-panel` (tabs mode) | Structural | The Tabs spec's `NfsTabs`, `NfsTabsTitle`, `NfsTabsContent`, `NfsTabsPanel`, rendered by the component, each binding its class as a static `host` class; `NfsTabsGroup` on a plain `div` and `NfsTab` on each anchor bind none | Composed exactly as the Tabs spec defines them; `div[nfsTabsContent]` replaces the plain `div.tabs-content` of the first version of this spec; no `class` on their hosts |
| `.is-active` on `.accordion-item`, `.tabs-title`, `.tabs-panel` | State | Host bindings of `NfsAccordionItem` (from its title's `expanded`), `NfsTabsTitle`, and `NfsTabsPanel` (from the selected tab) | Bound from `selected` through the composed directives on server and client; the consumer sets the initial section with `selected`, never the class |
| `.simple`, `.primary` on `.tabs` | Variant | The component's `simple` and `primary` inputs, bound to `NfsTabs`' inputs of the same names (the Variant table below) | Foundation's two strip looks, reachable only through the component because the consumer cannot write on the internal strip |
| `.vertical` on `.tabs` and `.tabs-content` | Variant | None: vertical tabs are out of scope | The side-by-side layout needs the XY Grid around strip and content, which the component does not own (Out of Scope) |
| Accordion Variant classes | Variant | None: Foundation's accordion Sass defines no Variant class ([Spec: Accordion](accordion.md), D24) | |
| (none) | Library | `.nfs-accordion-content-body` and `.nfs-accordion-content-shown` on the Accordion wrapper's own inner element | Library-owned element the consumer never writes |
| The heading around each title (none in Foundation) | Element | Native `h1`-`h6` chosen by `headingLevel` | APG accordion; the `nfs-accordion` rules key on native headings |
| Placeholder `div#tabs-placeholder-<id>` | None | None | The component's template needs no placeholder |

Variant class families (building-blocks 1.4 and 1.14; [ADR 0040](../adr/0040-variant-input-types.md)). Both are closed and mirror the Tabs spec's inputs; there is no Variant registry and no Variant property.

| Variant class | Variant input | Type | Sass setting and registry | Value shape | Class each value sets | Variant property |
| --- | --- | --- | --- | --- | --- | --- |
| `.simple` on `.tabs` | `simple` on `NfsResponsiveAccordionTabs` (naming rule 4), bound to `NfsTabs.simple` | `boolean`, written through `nfsVariantBoolean` (`NfsVariantBoolean`) | Closed (`.tabs.simple`) | Boolean | `true`, the bare attribute, or `"true"` sets `.simple` on the tab strip in tabs mode; the default `false` sets none; nothing in accordion mode | None |
| `.primary` on `.tabs` | `primary` on `NfsResponsiveAccordionTabs` (naming rule 4), bound to `NfsTabs.primary` | `boolean`, written through `nfsVariantBoolean` (`NfsVariantBoolean`) | Closed (`.tabs.primary`; its colours come from `$primary-color`) | Boolean | `true`, the bare attribute, or `"true"` sets `.primary` on the tab strip in tabs mode; the default `false` sets none; nothing in accordion mode | None |

`simple` and `primary` are two booleans, not one enum, because Foundation's Sass lets them combine (`.tabs.simple.primary`), as the Tabs spec decided. Foundation generates no responsive Tabs class, so neither takes a Breakpoint query; the Breakpoint rule already chooses when the strip exists.

### Hierarchy and DI shape

```
NfsMediaQuery (Breakpoint service)           -> rules resolution, Server breakpoint, reducedMotion
nfsResponsiveAccordionTabsDefaultsToken      -> optional, Shape B, seeds input defaults

nfs-responsive-accordion-tabs  NfsResponsiveAccordionTabs (component, OnPush, no styles, no host class)
  contentChildren(NfsResponsiveAccordionTabsPanel)   <- the consumer's ng-template sections
  template (no class attribute anywhere; each directive binds its own classes):
  @if (mode() === 'tabs')
    div[nfsTabsGroup]                                binds no class
      ul[nfsTabs]                 binds .tabs (.simple, .primary)
                                  [selected] [selectionMode] [wrapOnKeys] [simple] [primary] deepLink=false autoFocus=false
        li[nfsTabsTitle]          binds .tabs-title, .is-active
          a[nfsTab] [value]       binds no class
      div[nfsTabsContent]         binds .tabs-content
        div[nfsTabsPanel] [value] [id]   binds .tabs-panel, .is-active -> NgTemplateOutlet(section template)
  @else
    ul[nfsAccordion]              binds .accordion; multiExpand=false [allowAllClosed] deepLink=false
      li[nfsAccordionItem]        binds .accordion-item, .is-active
        h<headingLevel>
          button[nfsAccordionTitle] [panel]=content.panel [expanded] (expandedChange)   binds .accordion-title
        div[nfsAccordionContent] #content [id]   binds .accordion-content -> NgTemplateOutlet(section template)
```

- The component imports the Accordion and Tabs directive sets from their entry points and uses their tokens as they define them; it provides no token to them and re-provides none. `[nfsTabsContent]` sits inside `[nfsTabsGroup]`, whose token it requires, and binds `.vertical` only while the tab list is vertical, which it never is here. Its own entry point is `ngx-foundation-sites/responsive-accordion-tabs`, exporting the component, the panel directive, the Defaults token and its interface, the change type, and the mode type, and no import array ([ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md)). It depends on `ngx-foundation-sites/accordion`, `ngx-foundation-sites/tabs`, `ngx-foundation-sites/media-query`, and the primary entry point `ngx-foundation-sites` for `nfsVariantBoolean` and its type `NfsVariantBoolean` (ADR 0040).
- Class ownership: the component's template writes no `class` attribute, because every Foundation class of both modes is bound by the directive that owns it (ADR 0039). A class written there would either merge with a static host class to no effect (a Structural class) or be stripped by a dynamic binding (`is-active`, `simple`, `primary`), so it is never written.
- Sections: `contentChildren(NfsResponsiveAccordionTabsPanel)` with the default `descendants: false`. This is a rendering query: the component renders its own template from the sections during the server render, where no registration from render callbacks runs, and template order is the order the consumer wrote. Sections inside `@for` or `@if` directly under the host match, because Angular's direct-child rule treats nodes in an embedded view created from a template directly in the content as direct children (Angular's query matching, `isApplyingToNode`); sections of a nested instance inside a panel belong to that instance.
- DI inside sections: a section template is declared in the consumer's template, so its content injects from the consumer's injector (declaration site), whichever mode renders it.
- The accordion title's button is written inside each item, in each branch of the heading-level `@switch`, never in a template declared outside the item, because a template's DI follows its declaration site and `NfsAccordionTitle` must find its `NfsAccordionItem`.
- Defaults token: `nfsResponsiveAccordionTabsDefaultsToken`, `InjectionToken<NfsResponsiveAccordionTabsDefaults>` with all-optional fields, injected with `{optional: true}`, provided at bootstrap, route, or element level; the nearest wins. Because the component binds every Accordion and Tabs option it owns, the Accordion and Tabs Defaults tokens do not reach those options inside this component (an app-wide `deepLink: true` for accordions must not make the inner accordion deep link at every swap). The Variant inputs `simple` and `primary` are not in it: a Defaults token never holds a Variant default (building-blocks 1.4, ADR 0040).
- The Breakpoint service is used through `resolve(rules)` for the viewport's mode and through its read-only `serverBreakpoint` with `resolve(rules, breakpoint)` for the first render (ADR 0032; Rendering modes).
- Imports (documented usage): `NfsResponsiveAccordionTabs` has an element selector, so a template that uses it without importing it fails to compile (NG8001, Angular's report). `NfsResponsiveAccordionTabsPanel` sits on `ng-template`; a template whose panel directive is not imported is a plain `ng-template` that no query finds, so the component renders no section for it (Documented usage, 3). The component imports every Accordion and Tabs directive its own template renders.

### API

```ts
type NfsResponsiveAccordionTabsMode = 'accordion' | 'tabs';

interface NfsResponsiveAccordionTabsChange {
  readonly value: string | undefined;                          // undefined: no section open (accordion)
  readonly panel: NfsResponsiveAccordionTabsPanel | undefined;
}

interface NfsResponsiveAccordionTabsDefaults {
  allowAllClosed?: boolean;
  selectionMode?: 'follow' | 'explicit';
  wrapOnKeys?: boolean;
  headingLevel?: number;
  deepLink?: boolean;
  updateHistory?: boolean;
  deepLinkSmudge?: boolean;
  deepLinkSmudgeOffset?: number;
}
const nfsResponsiveAccordionTabsDefaultsToken: InjectionToken<NfsResponsiveAccordionTabsDefaults>;

class NfsResponsiveAccordionTabs {   // nfs-responsive-accordion-tabs, exportAs 'nfsResponsiveAccordionTabs'
  readonly rules: InputSignal<string | NfsBreakpointRules<NfsResponsiveAccordionTabsMode>>; // required
  readonly selected: ModelSignal<string | undefined>;
  readonly allowAllClosed: InputSignalWithTransform<boolean, unknown>;       // false
  readonly selectionMode: InputSignal<'follow' | 'explicit'>;                // 'follow'
  readonly wrapOnKeys: InputSignalWithTransform<boolean, unknown>;           // true
  readonly headingLevel: InputSignalWithTransform<number, unknown>;          // 3
  readonly label: InputSignal<string | undefined>;
  readonly labelledBy: InputSignal<string | undefined>;
  readonly deepLink: InputSignalWithTransform<boolean, unknown>;             // false
  readonly updateHistory: InputSignalWithTransform<boolean, unknown>;        // false
  readonly deepLinkSmudge: InputSignalWithTransform<boolean, unknown>;       // false
  readonly deepLinkSmudgeOffset: InputSignalWithTransform<number, unknown>;  // 0 (px)
  // Variant inputs (ADR 0040), passed to NfsTabs in tabs mode
  readonly simple: InputSignalWithTransform<boolean, NfsVariantBoolean>;     // .tabs.simple; false
  readonly primary: InputSignalWithTransform<boolean, NfsVariantBoolean>;    // .tabs.primary; false
  readonly selectionChange: OutputRef<NfsResponsiveAccordionTabsChange>;
  readonly deepLinked: OutputRef<NfsResponsiveAccordionTabsChange>;
  readonly mode: Signal<NfsResponsiveAccordionTabsMode>;                     // the displayed mode
}

class NfsResponsiveAccordionTabsPanel {  // ng-template[nfsResponsiveAccordionTabsPanel], exportAs 'nfsResponsiveAccordionTabsPanel'
  readonly title: InputSignal<string>;   // required
  readonly value: InputSignal<string>;   // required, unique within the instance
  readonly id: InputSignal<string | undefined>;  // optional; the rendered content or panel id
  readonly template: TemplateRef<unknown>;
}
```

| Member | Kind | Default | Foundation equivalent | Delta and notes |
| --- | --- | --- | --- | --- |
| `rules` | `input.required` | | `data-responsive-accordion-tabs` | String or object form; resolved by map order; a runtime change swaps like a resize; no rule at the Zero breakpoint renders accordion below the first rule (Documented usage, 6) |
| `selected` | `model()` | `undefined` | `is-active` on `li` or panel; `open(target)` | One value for both modes (Behaviour rules); writes bypass the `allowAllClosed` lock, as a title's `[expanded]` binding does in the Accordion spec |
| `allowAllClosed` | `input()`, `booleanAttribute` | `false` (token) | `data-allow-all-closed` | Passed to `NfsAccordion`; the only open title renders `aria-disabled="true"` |
| `selectionMode` | `input()` | `'follow'` (token) | None (always automatic) | Passed to `NfsTabs`; APG manual activation |
| `wrapOnKeys` | `input()`, `booleanAttribute` | `true` (token) | `data-wrap-on-keys` | Passed to `NfsTabs` |
| `headingLevel` | `input()`, `numberAttribute` | `3` (token) | None (Foundation has no heading) | 1 to 6; other values clamp to the nearest (Documented usage, 4); 3 is the APG example's level |
| `label` | `input()` | none | None | `aria-label` on the rendered list in both modes (a tab list must be named; the accordion list may be) |
| `labelledBy` | `input()` | none | None | `aria-labelledby` on the rendered list, id references outside the component; preferred over `label` when visible text exists (building-blocks 1.10) |
| `deepLink` | `input()`, `booleanAttribute` | `false` (token) | `data-deep-link` | Hash names a section `id`; applied after the first render, once per page for both modes |
| `updateHistory` | `input()`, `booleanAttribute` | `false` (token) | `data-update-history` | `pushState` instead of `replaceState`; `history.state` passed through |
| `deepLinkSmudge` | `input()`, `booleanAttribute` | `false` (token) | `data-deep-link-smudge` | `scrollIntoView({block: 'start'})` on the displayed list after a deep link; instant under reduced motion; never on a swap |
| `deepLinkSmudgeOffset` | `input()`, `numberAttribute` | `0` (token) | `data-deep-link-smudge-offset` | `[style.scroll-margin-top.px]` on the displayed list (null when 0), the Tabs spec's rule |
| `simple` | Variant `input<boolean, NfsVariantBoolean>()` through `nfsVariantBoolean` | `false` (never from the token) | `.simple` on the element (`.tabs.simple`) | Bound to `NfsTabs.simple` in tabs mode; nothing in accordion mode; its titles get the `nfs-tabs` 24 px floor (Tabs D22) |
| `primary` | Variant `input<boolean, NfsVariantBoolean>()` through `nfsVariantBoolean` | `false` (never from the token) | `.primary` on the element (`.tabs.primary`) | Bound to `NfsTabs.primary` in tabs mode; nothing in accordion mode; its selected tab gets the `nfs-tabs` colours (Tabs D23) |
| `selectedChange` | output of the model | | `change.zf.tabs`, `down/up.zf.accordion` (value half) | Every model change, including the tabs first-tab default |
| `selectionChange` | `output<NfsResponsiveAccordionTabsChange>()` | | the same events | Only a change on the client after the first render that is not the first-tab default; never for a Mode swap; `value` `undefined` when the accordion closes the last section |
| `deepLinked` | `output<NfsResponsiveAccordionTabsChange>()` | | `deeplink.zf.*` | After a hash (first render or `hashchange`) selected a section, also when it was already open |
| `mode` | read-only `Signal` | the Server breakpoint's mode | none | The displayed mode; follows the viewport's mode in a render callback |
| Panel `title` | `input.required` | | the title text | Plain text (interpolation allowed); rich titles are a first-release limit, with a title template as the upgrade (Out of Scope) |
| Panel `value` | `input.required` | | title `href` hash as pairing | Pairs the section across modes; unique within the instance (Documented usage, 2) |
| Panel `id` | `input()` | Aria's generated id | content or panel `id` | Required for `deepLink`: a section without one is never deep linked and writes no hash (Documented usage, 5); bound to Aria's `id` input on `[nfsAccordionContent]` or `[nfsTabsPanel]`, and only one of the two exists at a time, so the id is never duplicated |

Methods: none. `selected` is the programmatic API, as in the Tabs spec; Foundation's `open`, `close`, `toggle` become model writes.

The Variant inputs follow building-blocks 1.4: they never use `booleanAttribute`, so `simple="flase"` fails to compile; each is declared with explicit type arguments naming the exported `NfsVariantBoolean`, which the library's typings assertion checks; and each JSDoc names its Foundation class.

Behaviour rules:

- Displayed mode and viewport mode: `#viewportMode` is `computed(() => mq.resolve(parsed()) ?? 'accordion')`, where `parsed` is `computed` over `rules` through `parseNfsBreakpointRules(rules, ['accordion', 'tabs'], mq.breakpoints)`. The displayed `mode` is a separate signal that starts from the Server breakpoint's mode (`mq.resolve(parsed(), mq.serverBreakpoint) ?? 'accordion'`, read on first use) and follows `#viewportMode` only inside the swap callback. This split is the one the prototype found necessary: only a callback that runs before the old nodes go can see which of them holds focus.
- Mode swap, one `afterRenderEffect`:
  1. `earlyRead` (tracks `#viewportMode`; reads `mode` untracked): when the viewport's mode differs from the displayed one, read `document.activeElement`; if the host contains it, record the `value` of the section whose rendered element contains it (the accordion `li`, or the tabs `li` or panel), found through the component's view queries of those elements; then set `mode`. Focus outside the widget records nothing.
  2. `write` (tracks `mode` and the view query of the controls, accordion titles or tabs): while a recorded value is pending and the controls of the displayed mode exist, call `focus()` on the control with that value (a title or a tab) and clear the record. On the pass where the new branch has not rendered yet, the query still holds the old mode's controls, so nothing is focused; the query changes once the new branch renders in the same tick, the phase runs again, and focus lands. `focus()` without `preventScroll`, so the browser scrolls the control into view. If no control has the value (the section was removed meanwhile), the record is cleared.
  The same effect handles a resize, a `rules` change, and the first-render swap.
- The open item, one meaning in both modes: `selected` names the expanded item in accordion mode, or `undefined` when none is open, and the selected tab in tabs mode.
  - Accordion mode: each title binds `[expanded]="selected() === section.value()"` and `(expandedChange)`: `true` sets `selected` to that value; `false` clears `selected` only when it still names that value. `NfsAccordion` runs with `multiExpand` false and the component's `allowAllClosed`, so the Accordion's expansion policy (ADR 0028) closes the previous item and locks the last open title; the order in which the two `expandedChange` handlers run does not change the result.
  - Tabs mode: `ul[nfsTabs]` binds `[selected]="selected()"` and `(selectedChange)` back into the model. When `selected` is `undefined` or names no section, the Tabs spec's first-tab default writes the first section's value into the tab list's model and emits `selectedChange`, which sets the component's `selected` (a signal write during its own refresh, which Angular's `detectChangesInViewWhileDirty` loop re-runs in the same pass; the same write the Tabs spec makes into any consumer's `[(selected)]`).
  - Across a swap nothing needs mapping: tabs to accordion expands the selected tab's item (Foundation's `is-active` carry); accordion to tabs selects the expanded item's tab, or the first tab when none was open. A focused, unselected tab (accordion title of a collapsed item, or an `explicit`-mode tab) stays unselected: focus follows the equivalent control, selection follows `selected`.
- Change classification: a change of `selected` is the first-tab default when it moves from `undefined` (or a value naming no section) to the first section's value while tabs mode is displayed; it emits `selectedChange` (the model's output) but no `selectionChange`, and writes no history. Every other client change emits `selectionChange` with the section's panel directive, and, under `deepLink`, writes history (below). `selectionChange` is emitted from an `afterRenderEffect` over `selected` whose first run records without emitting (the Tabs spec's rule), so the server render and the first render emit nothing.
- Deep links (only when `deepLink` is true; never on the server; the inner Accordion and Tabs always get `deepLink` false):
  1. In `afterNextRender`, and on every `hashchange` (a `window` listener added in an `afterRenderEffect` keyed on `deepLink`, removed in its cleanup and on destroy), the decoded hash is looked up among the sections' `id`s. A match sets `selected` to that section's value, emits `deepLinked`, and, with `deepLinkSmudge`, schedules one `afterNextRender` that calls `scrollIntoView({block: 'start', behavior})` on the displayed list (`'instant'` while `mq.reducedMotion()` is true, else `'smooth'`). No match changes nothing (Foundation's "not own anchor" rule). A Mode swap never re-reads the hash, never emits `deepLinked`, and never scrolls, because the swap only changes `mode`.
  2. A `hashchange` to an empty hash restores the value `selected` held when the first render finished (Tabs' `_initialAnchor`; Accordion's back-navigation rule).
  3. A client change of `selected` that is neither hash-driven nor the first-tab default writes `location.pathname + location.search + '#' + id` for the new section's `id` with `history.replaceState(history.state, '', url)`, or `pushState` with `updateHistory`; a change to `undefined` (the accordion's last section closed) while the hash names one of the sections writes the URL without the fragment (Accordion rule). A section without an `id` writes nothing. `history.state` is passed through so a Router's entries keep their state. The URL is not restored on destroy (the Accordion spec's exception).
- Initial state: bound, never read from a class (ADR 0039; building-blocks 1.4). The section open at first paint is `selected` (a static `selected="specs"` or a binding), which accordion mode applies through each title's `[expanded]` binding, the only initial-state path the Accordion spec keeps, and tabs mode through `ul[nfsTabs]`'s `[selected]`; with nothing bound, tabs mode shows the first section and accordion mode none. The looks are `simple` and `primary`. Sections are `ng-template`s, which render no element and so carry no class, and the component reads no static class to seed anything.
- Consumer content and swaps: a swap destroys the displayed branch and instantiates every section template again in the other branch. Everything inside a section that is not held outside it is created again: an `<input>` value not bound to the consumer's state, scroll positions inside panels, component instances and their `ngOnInit` work, and the state of a nested widget that is not bound. The consumer keeps such state in signals outside the section and binds it in; `selected`, focus, and the URL survive.

### Documented usage

The JSDoc of `NfsResponsiveAccordionTabs` states rules 1, 4, 6, and 7, and the JSDoc of `NfsResponsiveAccordionTabsPanel` rules 2, 3, and 5; the recipes (Usage examples) follow all seven. The component reads none of it: usage that departs from a rule renders as written, with the result the rule names.

1. Name: `label` or `labelledBy` is set, because a tab list must be named (4.1.2) and one name on the rendered list serves both modes.
2. Unique values: every section's `value` is unique within the instance, because `value` pairs a section's title with its tab across modes and is what `selected` names.
3. At least one section: the component holds at least one `ng-template[nfsResponsiveAccordionTabsPanel]`, with `NfsResponsiveAccordionTabsPanel` imported; with none it renders an empty list.
4. Heading level: `headingLevel` is 1 to 6; other values clamp to the nearest.
5. Deep links: with `deepLink`, every section has an `id`; a section without one is never deep linked and writes no hash.
6. A mode at the Zero breakpoint: `rules` names a mode for the Zero breakpoint (a bare mode, as in `accordion medium-tabs`); rules that name none render `accordion` below their first breakpoint.
7. No Foundation class on the host: `accordion`, `tabs`, `vertical`, `simple`, and `primary` (the classes Foundation's markup puts on the plugin's element) are not written on `nfs-responsive-accordion-tabs`. The host binds no class, so a copied one is not stripped: it styles the host itself, and a copied `tabs` draws a second border and background around the whole widget (measured in Chromium, Firefox, and WebKit against Foundation 6.9's CSS). `accordion` and `tabs` are dropped, because the component renders the accordion and the tab list itself; `simple` and `primary` are the component's inputs; vertical tabs are not supported. The consumer's own classes stay.

### Implementation level and primitives

Implementation level: `@angular/aria`, through the library's own Accordion and Tabs directive sets, which host Aria's `AccordionGroup`, `AccordionTrigger`, `AccordionPanel`, `Tabs`, `TabList`, `Tab`, and `TabPanel` (building-blocks Table A). The native level does not cover it: HTML has no element that is an accordion on one viewport and tabs on another, `<details name>` is outside the Browser target and gives disclosure semantics only, and switching between two ARIA patterns is script (the web platform features research, ResponsiveAccordionTabs row). Container size queries are in target but cannot change roles, headings, or where panels sit, and Foundation documents the rule as viewport breakpoints (ADR 0005), so container queries are not used.

Primitives: `@if`/`@else` for the two branches, `@for` over the sections, `@switch` for the heading level, `NgTemplateOutlet` for the section templates, `contentChildren` and `viewChildren`, `input()` with `booleanAttribute` and `numberAttribute` for Options and `nfsVariantBoolean` for the Variant inputs, `model()`, `output()`, `computed()`, `signal()`, `afterRenderEffect` and `afterNextRender`, `DOCUMENT`, `DestroyRef`, the History API, `scrollIntoView`, `NfsMediaQuery` (`resolve`, the Server breakpoint, `reducedMotion`), and `parseNfsBreakpointRules`. No CDK piece directly (Aria brings `_IdGenerator` and `Directionality`), no `NgZone`, no timers, no observers of its own.

Render hooks and effects (building-blocks 1.5):

| Piece | Hook | Why |
| --- | --- | --- |
| Mode swap and focus capture | `afterRenderEffect`, `earlyRead` | Reads `document.activeElement` while the old nodes still exist, before any write; re-runs only when the viewport's mode changes. Not `effect` (runs on the server and before the render, and must not touch the DOM), not `afterEveryRender` (would run after every change detection in the app), not `afterNextRender` (the swap repeats) |
| Refocus | same `afterRenderEffect`, `write` | Runs again once the new branch's controls exist in the same tick; a DOM write (`focus()`) belongs in `write` |
| `selectionChange` and history writes | `afterRenderEffect` over `selected` | Never runs on the server; first run records without emitting (the Tabs spec's rule). Not `effect`: history and location exist only in the browser and the library's only platform check is render callbacks (building-blocks 1.11 decision 3) |
| Initial hash read | `afterNextRender` | One-shot after the first render |
| `hashchange` listener | `afterRenderEffect` keyed on `deepLink`, with cleanup | Added and removed as `deepLink` changes (the Tabs spec's pattern) |
| Deep-link scroll | `afterNextRender` scheduled after the deep-link selection | Scrolls once the new state has rendered |

`injectAsync` does not apply. Nothing here is loaded only after a client interaction: the mode the viewport asks for is known in the first render callback, and both directive sets are needed by then (a wide client needs Tabs in the same tick as hydration, a narrow one needs Accordion for the server HTML). Loading the other mode's directives on demand would delay the first-render swap past the first paint (a painted accordion on a wide client-rendered page) and would add a network fetch to a resize. Each mode's code is the Accordion or Tabs entry point, already small, and a consumer's `@defer` splits the whole component.

Fallback: none needed. The [Prototype: ResponsiveAccordionTabs as one component](../issues/51-prototype-responsive-accordion-tabs.md) proved the component, the swap, focus continuity, and clean hydration in Chromium, Firefox, and WebKit. If a later Aria release broke the Accordion or Tabs composition, their specs' fallbacks (CDK accordion state with library ARIA; custom tabs ARIA and keys) apply here unchanged.

### Comparison with Angular Material

Material has no counterpart: no responsive component that switches between an accordion and tab group (the Angular Material reference research, section 11, "Material has no 'responsive component'"). The nearest pieces are `mat-tab-group`, `mat-accordion`, and the navigation schematic, which switches a sidenav's `mode` from `BreakpointObserver` through `toSignal`.

| Concern | Material (nearest) | This library |
| --- | --- | --- |
| Responsive switch | Consumer code: `BreakpointObserver.observe(Breakpoints.Handset)` with `toSignal`, then `@if` between two components (schematic recipe) | One component with Foundation's `rules`, resolved through `NfsMediaQuery` from the Breakpoint map |
| Content once, two forms | Not offered; the consumer writes `mat-tab` and `mat-expansion-panel` content twice or shares templates by hand | `ng-template[nfsResponsiveAccordionTabsPanel]` written once |
| Selection | `selectedIndex` (tabs), `expanded` per panel (accordion) | One `selected` model by value across both modes |
| Change events | `selectedIndexChange` plus `selectedTabChange {index, tab}`; `opened`/`closed`, `afterExpand`/`afterCollapse` | `selectedChange` plus `selectionChange {value, panel}`; no Completion outputs |
| Focus across a layout switch | Nothing (the consumer's `@if` drops focus) | Refocus of the equivalent control in a render callback |
| Server rendering | `BreakpointObserver` answers `false` on the server; the consumer's `@if` rebuilds at hydration | Server breakpoint's mode, handed off in the component's first render callback with focus carried |
| Lazy content | `matTabContent`, `matExpansionPanelContent` | Not offered (out of scope) |
| Label templates | `mat-tab-label` | Plain `title` input (rich titles a first-release limit; a title template is the upgrade) |
| Visual options | `mat-tab-group` colours, `stretchTabs`, `alignTabs`, `headerPosition`; `mat-accordion` `displayMode` | Foundation's Sass settings, plus the tabs-mode Variant inputs `simple` and `primary` |

Borrowed: the two-tier change outputs with the item in the aggregate (building-blocks 1.4), `MediaMatcher` underneath through the Breakpoint service, and the idea that a responsive switch is a signal plus a template branch. Not borrowed: index selection, `BreakpointObserver` and `Breakpoints`, component-rendered headers and indicators.

### ARIA and keyboard

APG patterns: Accordion in accordion mode and Tabs in tabs mode, each in full (the ARIA APG patterns research, ResponsiveAccordionTabs: no combined pattern exists; each mode satisfies its own; heading semantics flip, so the elements must differ per mode; focus must persist across the switch). Nothing from one mode is left on the other's nodes, because the other mode's nodes do not exist.

Accordion mode (the Accordion spec's tables, with the component's choices):

| Element | Role and attributes | Source |
| --- | --- | --- |
| `ul[nfsAccordion]` (`.accordion`) | List; `aria-label` or `aria-labelledby` from `label`/`labelledBy` | Component |
| `li[nfsAccordionItem]` (`.accordion-item`) | `listitem`; `.is-active` while open | Accordion spec |
| `h1`-`h6` | Native heading at `headingLevel`; the title is its only element child | Component; APG |
| `button[nfsAccordionTitle]` (`.accordion-title`) | `type="button"`, `id`, `aria-expanded`, `aria-controls` (content id), `aria-disabled` (`true` on the locked title, else `false`), `tabindex="0"`, `data-active` | Aria plus the Accordion spec's override |
| `div[nfsAccordionContent]` (`.accordion-content`) | `role="region"`, `aria-labelledby` (title id), `id` (the section's `id` or generated), `inert` while collapsed | Aria |

| Key | Where | Effect | Owner |
| --- | --- | --- | --- |
| Enter, Space | Title | Toggles its section; opening closes the open one; nothing on the locked title | Native button, Aria, the Accordion policy |
| ArrowDown, ArrowUp | Title | Next or previous title, no wrap, never opens | Aria |
| Home, End | Title | First or last title | Aria |
| Tab, Shift+Tab | Anywhere | Native order; collapsed content skipped (`inert`) | Browser |
| Any key | Inside an open section | Reaches the focused control, never the accordion (content key guard) | Accordion spec |

Tabs mode (the Tabs spec's tables, horizontal only):

| Element | Role and attributes | Source |
| --- | --- | --- |
| `ul[nfsTabs]` (`.tabs`, plus `.simple` and `.primary` when set) | `role="tablist"`, `aria-orientation="horizontal"`, `tabindex="-1"`, `aria-disabled="false"`, name from `label`/`labelledBy` | Aria; component |
| `li[nfsTabsTitle]` (`.tabs-title`) | `role="presentation"`; `.is-active` on the selected one | Tabs spec |
| `a[nfsTab]` (no `href`, no class) | `role="tab"`, `id`, `tabindex` `0`/`-1` (the selected tab is `0` in server HTML), `aria-selected`, `aria-controls` (panel id), `aria-disabled="false"`, `data-active` | Aria plus the Tabs spec's tab stop |
| `div[nfsTabsPanel]` (`.tabs-panel`) | `role="tabpanel"`, `id` (the section's `id` or generated), `aria-labelledby`, `tabindex` `0` shown and `-1` hidden, `inert` hidden, `.is-active` shown | Aria; Tabs spec |

| Key | Effect | Owner |
| --- | --- | --- |
| Tab | Into the strip at the selected (or last active) tab; out to the shown panel | Browser, roving `tabindex` |
| Right Arrow, Left Arrow | Next or previous tab (flipped in right-to-left pages), wrapping unless `wrapOnKeys` is false; selects in `follow` mode | Aria |
| Home, End | First or last tab; selects in `follow` mode | Aria |
| Enter, Space | Selects the focused tab (`explicit` mode) | Aria |
| Up, Down | Not handled (page scrolls) | Browser |

Known deviation in tabs mode, as the [Spec: Tabs](../issues/16-spec-tabs.md) documents it: once the user has operated the strip, a bound `selected` write or a deep link leaves Aria's roving tab stop on the last tab the user operated (no public Aria API moves it; decided, accept and document). A Mode swap creates the tab list again, which resets it to the selected tab.

Focus rules:

- A Mode swap moves focus only when focus was inside the widget, to the equivalent control of the new mode: title to tab and tab to title for the same `value`; focus anywhere inside a section's content or on a tab panel goes to that section's control. Focus outside the widget is never moved. The first-render swap follows the same rule (a server-rendered title can hold focus before hydration).
- Nothing else in the component moves focus: selection by click, model write, or deep link never focuses; the Accordion's own rule (a section closing around focus hands it to its title) and Aria's arrow-key navigation still apply.
- Swaps are not announced through a live region (Breakpoint service consuming-directive rule 4: layout changes, not content). The moved focus is the announcement: each swap fires one focus event on the equivalent control, whose new container a screen reader speaks as a newly entered ancestor (measured in Chromium and Firefox, NVDA's source; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).

### WCAG 2.2 AA criteria

Requirements, not recommendations. The story gate runs axe with the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice` and `parameters.a11y.test = 'error'`; play functions assert what axe cannot judge (state-indicator contrast, focus location).

| Criterion | Requirement for ResponsiveAccordionTabs | Foundation default and what makes it pass |
| --- | --- | --- |
| 1.3.1 Info and Relationships | Accordion mode: every title a button inside a native heading at `headingLevel`, each open region labelled by its title. Tabs mode: `tablist`/`tab`/`tabpanel` with `role="presentation"` on titles. No element carries both patterns | The component renders each mode's own elements; the SSR smoke asserts the heading. Foundation's switch left `role="tab"` on accordion titles (source bug) |
| 1.3.4 Orientation | Content and functions do not depend on orientation | Both modes carry the same sections and the same `selected`; a rotation that swaps modes restricts nothing |
| 1.4.3 Contrast (Minimum) | Title text 4.5:1 in every accordion state; selected, focused, and unselected tab text 4.5:1 | Fails with Foundation's defaults in both modes: `#1779ba` on `#e6e6e6` is 3.76:1 on the hovered or focused accordion title and on the selected tab. Required settings: `$accordion-item-color: scale-color($primary-color, $lightness: -15%);` (4.86:1 on `$light-gray`, 6.01:1 on `$white`; the Accordion spec) and `$tab-background-active: $primary-color; $tab-active-color: $white;` (4.65:1; the Tabs spec). The library's Storybook compiles all three settings. With `primary`, Foundation's cascade paints the selected tab `$tab-background-active` behind the bar's text colour (1.24:1 under Foundation's defaults); the `nfs-tabs` rule gives it the panel's colours, 4.65:1 (Tabs D23) |
| 1.4.11 Non-text Contrast | The selected tab's look at 3:1 against unselected tabs; the accordion glyph at 3:1 | The Tabs settings above give 4.65:1 (Foundation's default is 1.24:1, which the prototype's text-only fix `$tab-active-color` darkened by 15 % did not change; the Tabs spec's settings replace it). The glyph takes the title colour (4.86:1). On a `primary` bar the required settings make the selected tab the bar's own colour (1.00:1); the `nfs-tabs` rule gives 4.65:1 against the bar, while `$tab-content-background` keeps 3:1 against `$primary-color` (Tabs D23). Play functions assert the tab background ratios, since axe has no rule for them |
| 1.4.10 Reflow | No horizontal scrolling at 320 CSS px | Foundation's tab titles float and wrap; the recommended rules put accordion at the Zero breakpoint |
| 1.4.12 Text Spacing | Content survives spacing overrides | Open accordion sections grow with content (`nfs-accordion` rule 6); tab panels are in flow |
| 1.4.13 Content on Hover or Focus | No content appears on hover or focus | Nothing appears on hover. A panel shown by automatic activation is the tab's selected state, which persists until another tab is selected (APG), not additional content; `selectionMode="explicit"` shows panels only on Enter, Space, or click |
| 2.1.1 Keyboard | Every control operable by keyboard in both modes, before hydration included | Native buttons (accordion); Aria keys plus the selected tab as a server-side tab stop (tabs); keys typed inside sections are guarded (Accordion content key guard) |
| 2.4.3 Focus Order | DOM order in both modes; a swap never drops focus to `body` | `inert` on hidden content; the swap's refocus rule |
| 2.4.6 Headings and Labels | Accordion headings describe their sections | The heading text is the section's `title`; the level is the consumer's `headingLevel` |
| 2.4.7 Focus Visible | A visible focus indicator on every title and tab | Foundation keeps the browser outline (it removes it only under what-input's mouse attribute, which the library never sets) and adds a `:focus` background in both modes |
| 2.4.11 Focus Not Obscured (Minimum) | Nothing the component renders covers the focused control; after a swap the refocused control is scrolled into view | The component overlays nothing; refocus uses `focus()` without `preventScroll`; `deepLinkSmudgeOffset` or the consumer's `scroll-padding-top` keeps controls clear of a sticky header |
| 2.5.3 Label in Name | Names contain the visible text | Titles and tabs are named from `title`; the accordion glyph is part of the name, as the Accordion spec accepts |
| 2.5.8 Target Size (Minimum) | Titles and tabs at least 24 by 24 CSS px | Accordion titles full width and about 52 px tall; tabs about 52 px tall with `1.25rem 1.5rem` padding; `simple` removes that padding and leaves 12 px tall tabs, which the `nfs-tabs` rule lifts to a 24 by 24 px minimum (Tabs D22); axe `target-size` in the gate |
| 2.2.2 Pause, Stop, Hide | Motion starts only on user action and ends within 5 s | The 250 ms accordion transition; a swap animates nothing |
| 3.2.1 On Focus | Focus alone causes no change of context | Automatic tab activation is not a change of context (APG); a swap follows the viewport, not focus |
| 4.1.2 Name, Role, Value | Roles, names, and states correct in server HTML and after every change and swap | Aria's bindings plus the Accordion and Tabs overrides; the tab list named by `label`/`labelledBy` (Documented usage, 1) |

Reduced motion is honoured on top of AA (Animation).

### Rendered HTML

Directive attributes (`nfsaccordion`, `nfsaccordiontitle`, `nfstabs`, `nfstabscontent`, Aria's stamped `ngaccordiontrigger`, and so on) and hydration annotations other than `jsaction` are omitted. Generated ids differ between server and client and are rewritten at hydration, because every reference is a binding. Static attributes on the host (`rules`, `label`) are rendered on it as written; they carry no ARIA. Every class below comes from a composed directive or the Accordion wrapper's template: neither the consumer's markup nor the component's template writes one, and the host carries none.

Consumer markup, with no class:

```html
<nfs-responsive-accordion-tabs rules="accordion medium-tabs" label="Product details" [(selected)]="section">
  <ng-template nfsResponsiveAccordionTabsPanel title="Overview" value="overview" id="overview">
    <p>Overview content.</p>
  </ng-template>
  <ng-template nfsResponsiveAccordionTabsPanel title="Specs" value="specs" id="specs">
    <p>Specs content.</p>
  </ng-template>
  <ng-template nfsResponsiveAccordionTabsPanel title="Reviews" value="reviews" id="reviews">
    <p>Reviews content.</p>
  </ng-template>
</nfs-responsive-accordion-tabs>
```

Server HTML at the default Server breakpoint (`small`, accordion), `section` unset, so nothing is open; hydrated at 500 px it is identical except that `jsaction` is gone and ids are the client's:

```html
<nfs-responsive-accordion-tabs rules="accordion medium-tabs" label="Product details">
  <ul class="accordion" aria-label="Product details" jsaction="keydown:;click:;focusin:;">
    <li class="accordion-item">
      <h3>
        <button class="accordion-title" role="button" type="button" id="ng-accordion-trigger-x1-0"
                data-active="false" aria-expanded="false" aria-controls="overview"
                aria-disabled="false" tabindex="0" jsaction="click:;keydown:;">Overview</button>
      </h3>
      <div class="accordion-content" role="region" id="overview"
           aria-labelledby="ng-accordion-trigger-x1-0" inert="true" jsaction="keydown:;">
        <div class="nfs-accordion-content-body"><p>Overview content.</p></div>
      </div>
    </li>
    <li class="accordion-item"><!-- Specs, the same shape --></li>
    <li class="accordion-item"><!-- Reviews, the same shape --></li>
  </ul>
  <!--container-->
</nfs-responsive-accordion-tabs>
```

Accordion mode after the user opens Specs (single-expand, `allowAllClosed` false, so the open title is locked):

```html
<li class="accordion-item is-active">
  <h3><button class="accordion-title" ... aria-expanded="true" aria-controls="specs"
              aria-disabled="true" tabindex="0">Specs</button></h3>
  <div class="accordion-content" role="region" id="specs" aria-labelledby="...">
    <div class="nfs-accordion-content-body nfs-accordion-content-shown"><p>Specs content.</p></div>
  </div>
</li>
```

The same page hydrated at 1300 px: hydration claims the accordion as sent, the component's first `earlyRead` sets `mode` to tabs, and the tabs branch replaces the accordion in the same tick, before the next paint. The first-tab default writes `overview` into `selected`:

```html
<nfs-responsive-accordion-tabs rules="accordion medium-tabs" label="Product details">
  <div>
    <ul class="tabs" aria-label="Product details" role="tablist" tabindex="-1"
        aria-disabled="false" aria-orientation="horizontal">
      <li class="tabs-title is-active" role="presentation">
        <a role="tab" id="ng-tab-y2-0" tabindex="0" aria-selected="true" aria-controls="overview"
           aria-disabled="false" data-active="true">Overview</a>
      </li>
      <li class="tabs-title" role="presentation">
        <a role="tab" id="ng-tab-y2-1" tabindex="-1" aria-selected="false" aria-controls="specs"
           aria-disabled="false" data-active="false">Specs</a>
      </li>
      <li class="tabs-title" role="presentation"><!-- Reviews --></li>
    </ul>
    <div class="tabs-content">
      <div class="tabs-panel is-active" role="tabpanel" id="overview" tabindex="0"
           aria-labelledby="ng-tab-y2-0"><p>Overview content.</p></div>
      <div class="tabs-panel" role="tabpanel" id="specs" tabindex="-1" inert="true"
           aria-labelledby="ng-tab-y2-1"><p>Specs content.</p></div>
      <div class="tabs-panel" role="tabpanel" id="reviews" tabindex="-1" inert="true"
           aria-labelledby="..."><p>Reviews content.</p></div>
    </div>
  </div>
</nfs-responsive-accordion-tabs>
```

Server HTML when the server chose a wide Server breakpoint (client hints, `serverBreakpoint: 'large'`): the tabs branch as above, with the first-tab default written during the server render, `tabindex="0"` on the selected tab from `NfsTab`'s server-side tab stop, `data-active="false"` on every tab, and `jsaction="keydown:;click:;focusin:;"` on the `ul`. A narrow client hydrates it as sent and swaps to the accordion branch in the component's first `earlyRead`, with the Overview item expanded (it is `selected`).

Rules that end in tabs from the Zero breakpoint (`rules="tabs large-accordion"`): server HTML is the tabs branch at `small`; the accordion renders from `large`.

The tabs looks (`rules="tabs large-accordion" simple primary`): the strip renders `<ul class="tabs simple primary" ... role="tablist">`, set by `NfsTabs` from the component's bindings, and every other element as above; from `large`, the accordion branch renders `<ul class="accordion" ...>` with neither class, and the host carries no class in either mode.

### Animation

Per ADR 0003: the component adds no animation and awaits none.

- Accordion mode keeps the Accordion spec's mechanism unchanged: the `grid-template-rows` transition on `.accordion-content` keyed on the item's `.is-active` State class, from the `nfs-accordion` mixin, with its reduced-motion override (`transition-duration: 1ms`) and `nfsAnimationsToken`.
- Tabs mode keeps Foundation's instant panel switch (`.tabs-panel.is-active`), as the Tabs spec does.
- A Mode swap is instant. A branch created by a swap renders its items in their final state: an expanded item is created with `.is-active` and the `1fr` row, and a CSS transition runs only for a style change on an element that already had a computed style, so nothing slides at a swap; the Accordion's phase signal starts settled, so `nfs-accordion-content-shown` is present at once and no Completion output fires. The same holds at hydration, where class values equal the server's.
- No `animate.enter`/`animate.leave` on either branch: they would play on server-rendered nodes at hydration ([Prototype: `animate.enter` at hydration](../issues/52-prototype-animate-enter-hydration.md)) and at every swap.
- No Completion outputs: the component's state is `selected`, whose change is not tied to an animation in tabs mode; a consumer who needs `opened`/`closed` after the height transition uses the Accordion directly.

### Rendering modes

Per ADR 0008, ADR 0014, and the rendering-modes research, section 7 rules 1 to 11 and its ResponsiveAccordionTabs checklist row ("switching form changes structure, so it is an `@if` branch, rebuilt ... if the client breakpoint differs; spec must accept or avoid"). This spec accepts it: the Mode swap is the one accepted structural re-render (ADR 0008 Consequences).

- Why a structural re-render and not a class-and-role change on the same nodes (prototype verdict): each mode hosts a different set of Aria directives, and Angular matches directives to elements when the template compiles, so the Accordion set cannot become the Tabs set on the same element; the panels sit in different places (inside each `li` for the accordion, in the sibling `.tabs-content` for tabs, where Foundation's CSS expects them); and a `tablist` may own only `tab`s (WAI-ARIA 1.3, tablist, allowed child roles), so accordion panels cannot stay inside `ul.tabs`.
- Server-side rendering and first paint: `mode` is the Server breakpoint's mode; the branch, every Structural class (static `host` classes of the composed directives), the `simple` and `primary` classes, every State class, every ARIA attribute, `inert`, the open section's content (projected into the Accordion's wrapper or the Tabs panel, never Aria's lazy content), and in tabs mode the first-tab default and the selected tab's tab stop are bindings on signal state that exists on the server (rules 1 and 2). No template branches on the platform: the branch depends on `mode`, which is the same on both platforms until the first render callback.
- The Server breakpoint and the `instance` strategy: every instance starts from the Server breakpoint's mode, not from the service's `current`, and swaps in its own first `earlyRead`. For a full-hydration page both are the same value at the first render. They differ for an instance first rendered after the service went live: a `@defer (hydrate on ...)` block, a plain `@defer` block, a route change, or a client-rendered app's later instance. Starting from the service's live value there would make the block's hydration render a branch the server never sent: the prototype measured the block's accordion rebuilt during hydration (4 components hydrated instead of 7) and focus on a dehydrated title lost to `body`; starting from the Server breakpoint hydrates the block as sent (7 components, 0 skipped) and the swap keeps focus (prototype cases 19 to 21). Its only cost is a second render in the first tick for client-created instances, which is never painted (case 4). The service exposes the breakpoint it started from for this: the read-only `serverBreakpoint` and the optional breakpoint argument to `resolve` ([ADR 0032](../adr/0032-responsive-accordion-tabs-instance-first-render.md)).
- Before hydration: construction only injects and reads inputs; nothing reads the viewport, focus, the hash, or history; no listener is added outside host and template metadata (rules 3 to 5). Server-rendered titles are focusable native buttons (`tabindex="0"`), and a server-rendered tab strip has its selected tab at `tabindex="0"`, so the Tab key reaches the widget before hydration.
- Full hydration: the component hydrates the branch the server sent with the same bindings (generated ids aside). When the live viewport resolves to the same mode, nothing else happens. When it resolves to the other mode, the service goes live in its first `earlyRead`, the component's `earlyRead` reads focus and sets `mode`, and `ApplicationRef`'s loop renders the new branch before the tick ends: the swap happened 0 to 2 ms after the service went live, no frame after that showed the old mode, hydration reported `0 component(s) were skipped` and no NG05xx in three engines, for server rendering and prerendering (prototype cases 2 and 3). The old mode's server HTML is painted until JavaScript runs, which is the accepted shift; the client-hint recipe removes it for Chromium visitors.
- Client rendering (`RenderMode.Client`, plain `@defer`, route changes): the first render uses the Server breakpoint's mode and swaps in the same tick, so the wrong mode is never painted (case 4).
- Event replay: the displayed branch's elements carry the Accordion's or Tabs' `jsaction` (accordion: `keydown`, `click`, `focusin` on the `ul`, `click` and `keydown` on titles, `keydown` on contents; tabs: `keydown`, `click`, `focusin` on the strip). When no swap follows hydration, replay is the composed directive's: a click toggles or selects once with no error, and a replayed key changes state and logs the one accepted ``preventDefault` called during event replay`` error from Aria (case 17; the Accordion and Tabs specs). When the first-render swap follows, replay runs after the render callbacks, so its target has been removed: a pre-hydration click or key on a title or tab is lost, with no error, while focus is carried to the equivalent control (cases 16 and 18). Documented; the client-hint recipe avoids it for Chromium visitors.
- Incremental hydration: the component and all its sections are one Hydration boundary; a consumer `@defer` wraps the whole component, never one section (sections cannot be split from their component anyway). Inside `@defer (hydrate on viewport)`, `on idle`, `on timer`, or `on immediate`, the block hydrates as sent and swaps in its first `earlyRead`, keeping focus (case 21). `hydrate on interaction` works the same, but on a wide viewport the click that triggers hydration lands on a title the swap then removes, so the click is lost (the rule above); the docs therefore recommend `on viewport` or `on idle` for this component. `hydrate on hover` behaves like `on interaction` for a following click.
- `@defer (hydrate never)`: the component stays in the Server breakpoint's mode forever: the server-rendered open section is readable, titles and tabs do nothing, and closed sections stay unreachable, so an instance whose closed sections matter must not be placed there; binding `selected` from route data opens the section the page needs on the server.
- `@defer` inside sections: allowed; a consumer `@defer (on viewport)` inside a section loads code; its view is created again at a swap like any section content.
- Deep links apply after hydration (the server never sees the fragment). A server-correct open section comes from binding `selected` from a query parameter or route data (the Tabs spec's Router recipe works unchanged).
- Prerendering: identical to server rendering at the default Server breakpoint; nothing reads a request token (rule 11).
- Aria's dev-mode warnings (`ngAccordionPanel must have an ngAccordionContent to render.`, `ngTabPanel must have an ngTabContent structural directive to render.`) appear once per panel on every render of a mode, including the discarded first render of a client-created instance; silent in production (case 24).
- Zoneless: signals only; no timers; nothing needs `NgZone`.

### Sass and custom CSS

No library CSS: there is no `nfs-responsive-accordion-tabs` mixin and the component declares no `styles`. Accordion mode relies on `foundation-accordion` plus the `nfs-accordion` Library mixin (required: without it open sections never show); tabs mode relies on `foundation-tabs`, plus the `nfs-tabs` Library mixin, which styles the `simple` and `primary` looks and is included whenever the rules have a tabs mode, so that turning on `simple` or `primary` later needs no stylesheet change (without it a `simple` strip fails 2.5.8, and the selected tab on a `primary` bar fails 1.4.11 under the required settings and 1.4.3 under Foundation's defaults). Three Foundation settings are required for WCAG 2.2 AA. The Sass subsection under Further Notes gives the content ADR 0012 prescribes.

## Testing Decisions

A good test asserts what a user or assistive technology observes: which mode's roles and elements exist, `aria-expanded`, `aria-selected`, `aria-controls`, `aria-disabled`, `tabindex`, `inert`, `.is-active`, which section is visible, where focus lands after a swap, the value `selected` reports, which outputs fired, and the URL. No test reads the component's private signals or the Accordion and Tabs internals. No story, test host, or fixture writes a Foundation or library class on any element (ADR 0039): every class a test asserts comes from a composed directive or the Accordion wrapper's template. Prior art: the prototype's Playwright suite (server output, hydration with a per-frame mode recorder, resizes, focus before hydration with the main bundle held by `page.route`, pre-hydration click and key, incremental hydration, axe with the WCAG 2.2 AA tags) and the Accordion and Tabs specs' four layers; nothing exists in the new repository.

Story ids follow `responsive-accordion-tabs--<story>`: `responsive-accordion-tabs--default`, `responsive-accordion-tabs--tabs-mode`, `responsive-accordion-tabs--mode-swap`, `responsive-accordion-tabs--bound-selection`, `responsive-accordion-tabs--allow-all-closed`, `responsive-accordion-tabs--explicit-selection`, `responsive-accordion-tabs--heading-level`, `responsive-accordion-tabs--rules-object`, `responsive-accordion-tabs--dynamic-panels`, `responsive-accordion-tabs--panel-state`, `responsive-accordion-tabs--deep-link`, `responsive-accordion-tabs--tabs-looks`. Layer 1 runs at a 414 px viewport (below `medium`), so play functions choose the mode through `rules` (`accordion`, `tabs`, or a story control that flips them) rather than the viewport; viewport sweeps are layer 4's. The library's Storybook compiles Foundation with `$accordion-item-color: scale-color($primary-color, $lightness: -15%);` and `$tab-background-active: $primary-color; $tab-active-color: $white;`, and includes `nfs-accordion` and `nfs-tabs`. Story templates write the component, its sections, and no Foundation or NFS class ([storybook-conventions.md](../storybook-conventions.md), section 3 and the checklist); the story controls that flip `rules` or set `selected` are `button[nfsButton]` from the Button entry point at its default size, with no Variant input.

### 1. Story play function (`@storybook/angular-vite` with `@storybook/addon-vitest`, `npx nx test-storybook <lib>`)

Stack: `@storybook/angular-vite` 10.6 with `@storybook/addon-vitest` on Vitest 4.1 browser mode, Playwright Chromium headless; inferred `test-storybook`: `npx nx test-storybook <lib>`. Every story runs axe through `@storybook/addon-a11y` with `parameters.a11y.test = 'error'` and `parameters.a11y.options.runOnly = {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']}` from the Storybook preview, the enforcing gate; CSR only; the single home of interaction tests. No story is an Anti-pattern story.

- `responsive-accordion-tabs--default`: `rules="accordion medium-tabs"`, three sections, `label`. At 414 px: the accordion is rendered (`h3 > button.accordion-title` x3, no `tablist`, no `tab`), the list, items, titles, and contents carry `.accordion`, `.accordion-item`, `.accordion-title`, and `.accordion-content` though no template writes a class, and the host carries none; clicking Specs expands it (`aria-expanded="true"`, `li.is-active`, a `region` named Specs), its title is `aria-disabled="true"`; clicking Reviews moves it; ArrowDown, ArrowUp, Home, End move focus without opening; the printed `selected` follows. The play ends with focus on a title, so axe measures the focus background.
- `responsive-accordion-tabs--tabs-mode`: `rules="tabs"`: a named `tablist`, three `tab`s, `li.tabs-title[role=presentation]`, the strip, content box, and panels carrying `.tabs`, `.tabs-content`, and `.tabs-panel`, the first tab selected with its panel `.is-active` and the others `inert`, no heading and no `button.accordion-title`; the printed `selected` is `overview` with no `selectionChange` logged; ArrowRight selects Specs and logs one `selectionChange`; the computed backgrounds of the selected and an unselected tab differ by at least 3:1 (1.4.11); Tab from before the widget lands on the selected tab.
- `responsive-accordion-tabs--mode-swap`: a `button[nfsButton]` control flips `rules` between `accordion` and `tabs`. With Reviews open in accordion mode, flipping selects the Reviews tab; flipping back expands Reviews; with nothing open, flipping to tabs selects Overview and `selected` becomes `overview` with no `selectionChange`; focus on the control (outside the widget) is not moved by any flip; after each flip axe runs on the new mode.
- `responsive-accordion-tabs--bound-selection`: `[(selected)]` bound to a signal shown in the story; `button[nfsButton]` controls set it to each value and to `undefined`; accordion mode opens and closes accordingly, tabs mode selects, and `undefined` in tabs mode falls back to Overview; the story lists `selectedChange` and `selectionChange` events.
- `responsive-accordion-tabs--allow-all-closed`: accordion mode; the open title has `aria-disabled="false"` and closes; `selected` becomes `undefined` and `selectionChange` carries `value: undefined`.
- `responsive-accordion-tabs--explicit-selection`: tabs mode with `selectionMode="explicit"`: ArrowRight moves focus without changing `aria-selected`; Enter selects.
- `responsive-accordion-tabs--heading-level`: `headingLevel` 2 renders `h2` around every title; the accessibility tree lists the titles as level-2 headings.
- `responsive-accordion-tabs--rules-object`: `{small: 'accordion', medium: 'tabs'}` and the strings `accordion medium-tabs` and `medium-tabs accordion` render the same mode at the story's width, computed from `window.matchMedia` on the Breakpoint service's `get('medium')`.
- `responsive-accordion-tabs--dynamic-panels`: sections from `@for` over a signal that fills after a delay; once filled, both modes render them in order; removing the selected section in tabs mode selects the first remaining one.
- `responsive-accordion-tabs--panel-state`: a section holding an `<input>` bound to nothing and one bound to a story signal; after a flip the unbound value is empty and the bound one is kept (the documented reset).
- `responsive-accordion-tabs--deep-link`: `deepLink` with section ids: clicking a title or tab sets the iframe's `location.hash` to its id; closing the last open section with `allowAllClosed` clears it; flipping the mode writes no hash.
- `responsive-accordion-tabs--tabs-looks`: `simple` and `primary` as args (both on by default), with the `rules` flip control. In tabs mode the strip carries `.tabs.simple.primary`; the computed backgrounds of the selected tab and the bar differ by at least 3:1 (1.4.11, as the Tabs spec's `tabs--primary` story asserts); every tab's box is at least 24 by 24 px; flipping to accordion renders a list with neither class, and the host carries no class in either mode; axe runs after each flip. The 24 px geometry in three engines stays the Tabs spec's `tabs--simple` e2e case, since the same directive and rule draw it.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

Vitest browser mode under the Angular unit-test builder (`npx nx test <lib>`, Chromium headless): TestBed specs in `<name>.spec.ts` next to the directive, over a bare test host component, zoneless with `await fixture.whenStable()`, asserting DOM and ARIA state; no story is mounted here and no axe runs here.

- Mode resolution with a fake `MediaMatcher` (the Breakpoint service's seam): each breakpoint against `accordion medium-tabs large-accordion`, rules written in other orders, the object form, and rules with no Zero-breakpoint mode (accordion below the first rule); a `setInput('rules', ...)` change swaps.
- `instance` strategy: with `TransferState` seeded with `nfsServerBreakpoint: 'small'` and a wide fake viewport, the first render is the accordion branch and, after `whenStable()`, the tabs branch, with no intermediate state left; with a seeded `large`, the first render is tabs; an instance created after the service went live (added through `@if` in the host) also renders the Server breakpoint's mode first and swaps in the same stable.
- Focus continuity, driven by a `rules` change or a fake `change` event: focus on the Specs title -> the Specs tab, and back; focus on a link inside the Overview section -> the Overview control; focus on a tab panel -> its tab; focus on an element outside the host -> not moved; focus on a collapsed title's section -> its tab, with the selection unchanged; the refocused control is the document's `activeElement` after one `whenStable()`, and already in the first `requestAnimationFrame` callback after the change that triggers the swap (never `body`: a paint between the removal and the focus is what hands a screen reader a focus event on the document; a `focusout` with a `null` `relatedTarget` is not the signal, because Chromium fires one on the removed control even in a correct swap, measured by [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).
- State mapping table: every combination of mode, `selected` (unset, each value, unknown value), and swap direction, asserting `selected`, `selectedChange` count, and `selectionChange` count (none for swaps and first-tab defaults; one per user or programmatic change).
- `allowAllClosed` and single-expand through the component: opening one closes the other; the locked title ignores click and Enter; with `allowAllClosed` closing the last section sets `selected` to `undefined`.
- Pass-through: `selectionMode`, `wrapOnKeys`, `headingLevel` (1 and 6 kept, 0 and 7 clamped to 1 and 6), `label` and `labelledBy` on the rendered list in both modes; the inner Accordion and Tabs get `deepLink` false even when their app-wide Defaults tokens set `deepLink: true`; `simple` and `primary` set their class on the tab strip for `true`, the bare attribute, and `"true"`, and none for `false` and `"false"`, follow a runtime change, and never reach the accordion list.
- Class rule: a test host with no `class` attribute renders `.accordion`, `.accordion-item`, `.accordion-title`, and `.accordion-content` in accordion mode and `.tabs`, `.tabs-title`, `.tabs-content`, and `.tabs-panel` in tabs mode, and the host carries no class; `selected="specs"` renders Specs open at first render in both modes with no `selectionChange`; an Application class on the host is kept.
- Defaults token: each option seeded, overridden by a binding.
- Deep links against the test page's own history: a preset hash naming a section id selects it after the first render and emits `deepLinked`; `hashchange` selects another; an empty hash restores the first-render value; a user change writes `replaceState` (or `pushState` with `updateHistory`) with the existing `history.state`; the first-tab default and hash-driven changes write nothing; closing the named section clears the fragment; a swap after a deep link neither re-emits `deepLinked` nor calls `scrollIntoView`; `deepLinkSmudge` calls `scrollIntoView` on the displayed list with `'smooth'`, and `'instant'` under a reduced-motion fake; `deepLinkSmudgeOffset` renders `scroll-margin-top` on the list in both modes.
- Replay-safe composition: an Enter keydown with `eventPhase` reading 101 and a throwing `preventDefault` on a locked title changes nothing and reaches no `ErrorHandler`; a replay-shaped ArrowRight on a tab of an instance nested inside an Accordion panel leaves the outer accordion untouched (the Tabs replay guard).
- Aria composition: Aria's `AccordionHarness` and tabs harness find the controls of the displayed mode and report states consistent with the DOM.

### 3. Node-level Vitest

- SSR smoke, under `npx nx test <lib>` in `responsive-accordion-tabs.ssr.spec.ts` through the shared `renderServer()` helper (`npx nx test-node <lib>` only if the server path depends on the DOM adapter, which it does not): fixtures with the default Server breakpoint and `rules="accordion medium-tabs"` (unset and bound `selected`, and a static `selected="specs"`), `rules="tabs large-accordion"` (plain, and with `simple primary`), a server provider `{map, serverBreakpoint: 'large'}`, `headingLevel` 2, section ids, `@for` sections, and one instance inside `@defer (hydrate on viewport)`. The fixture templates write no `class` attribute. Assert `whenStable()` resolves; the HTML matches the Rendered HTML section: the Structural classes of the displayed mode on their elements (`.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`; or `.tabs`, `.tabs-title`, `.tabs-content`, `.tabs-panel`), `.simple` and `.primary` on that fixture's strip and nowhere else, and no `class` on the host; the accordion branch with `h3 > button.accordion-title`, `aria-expanded`, `aria-disabled` (locked when bound), `aria-controls`, `role="region"`, `inert` on collapsed contents, open content present, `nfs-accordion-content-shown` on the open body, and no `role="tab"`; or the tabs branch with `role="tablist"` named, `role="presentation"`, `tabindex="0"` on exactly the selected tab, the first-tab default selected, `.is-active` on title and panel, `inert` on hidden panels, and no `h3`; `jsaction` on the elements each branch replays; the `ng-state` script carries `nfsServerBreakpoint`; the deferred block's root carries `ngb`.
- Pure logic, table-driven: the mode for a set of rules at each breakpoint through the shared parser and `resolve` with the fallback, the change classifier (first-tab default or not, from previous value, new value, displayed mode, first section), the heading-level clamp, and the hash-to-section lookup (encoded ids, empty hash, unknown id).

### 4. Playwright e2e (`npx nx e2e <lib>-e2e` against the static Storybook build; `npx nx e2e <fixture-app>-e2e` against the prerendered fixture app)

Storybook half, `@playwright/test` 1.63 in Chromium, Firefox, and WebKit, `mount(storyId, props?)` over `iframe.html?embed=true` of the static build; axe from the addon report through `storyFinished`, and `@axe-core/playwright` with `withTags` on the same six tags for states no play function reaches:

- Resizes on `responsive-accordion-tabs--default` with `page.setViewportSize`: 500 -> 1300 -> 500 px with Specs selected and focused: tabs with Specs selected and the Specs tab focused, then the accordion with Specs expanded and its title focused; ArrowDown and Enter work on the new titles at once, and ArrowLeft selects and focuses the previous tab, with roving `tabindex` `-1, 0, -1`.
- Resize with nothing expanded and the Reviews title focused: tabs with Overview shown and focus on the Reviews tab; back to accordion with Overview expanded.
- Resize with focus on a link inside a section: focus on that section's control; with focus outside the widget: not moved.
- Crossing each breakpoint of `accordion medium-tabs large-accordion` in both directions renders the resolved mode; axe with the six tags after every swap in both directions.
- `emulateMedia({reducedMotion: 'reduce'})` in accordion mode: sections open without an intermediate `grid-template-rows` value.
- `responsive-accordion-tabs--deep-link` through the public `iframe.html?id=responsive-accordion-tabs--deep-link` URL with `#reviews`: Reviews opens after load in both widths; with `updateHistory`, Back restores the previous section; resizing after a deep link does not scroll the page (the scroll position is unchanged) and does not re-select the hashed section after the user picked another.

Fixture half, one `responsive-accordion-tabs` route (the harness from the rendering-mode test seam prototype), plus a `@defer (hydrate on viewport)` route below a spacer and a client-hint route whose server provider renders `large`:

- JavaScript disabled at 1300 px: the Server breakpoint's accordion is painted, styled by Foundation's CSS from the bound classes (the route's markup carries no Foundation class), titles are reachable by Tab; screenshot plus `@axe-core/playwright` with the six tags.
- Hydration at 1300 px: no NG05xx, `componentsSkippedHydration === 0`, a per-frame recorder shows no frame of the accordion after the service goes live, and exactly one swap.
- Hydration at 500 px: no swap and no visible change between the screenshots before and after hydration.
- Focus before hydration with the main bundle held back: focus the Specs title at 1300 px, release the bundle: focus is on the Specs tab.
- Pre-hydration click at 500 px: Specs expands once after hydration with no error. At 1300 px: the click is lost (tabs show Overview), no error is logged (the documented consequence).
- Client-hint route at 1300 px: the server HTML is the tabs branch, hydration swaps nothing; at 500 px it swaps to the accordion with Overview expanded.
- `@defer (hydrate on viewport)`: the block hydrates as sent when scrolled into view (development statistics: every component hydrated, 0 skipped), then swaps; focus placed on a dehydrated title is carried to the equivalent tab.
- `@defer (hydrate never)`: the accordion stays as sent; a title click changes nothing and logs nothing.

Release test (manual, before each release; [Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)): Before each release, with NVDA on Firefox, JAWS on Chrome, and VoiceOver on iOS, put focus on the open title of `responsive-accordion-tabs--mode-swap`, cross the medium breakpoint (resize, or rotate the phone), and confirm the tab list's name and the equivalent selected tab are announced and, with JAWS, that the next Down Arrow reads from that tab and not from the removed accordion; then cross back and confirm the section's heading and title are announced with 'expanded'. Then, with one section open, put focus on another section's collapsed title and cross into tabs: its tab is announced without 'selected', and Enter selects it and it is announced as selected.

## Out of Scope

- `multiExpand` and several open sections (Design decisions D5); the accordion mode is single-expand.
- Vertical tabs (`orientation`, `.vertical`): the component does not own the grid layout around strip and content. `orientation` alone would now set both `.vertical` classes (Tabs D2), but Foundation's vertical tabs need the XY Grid to place strip and content side by side, and those cells would be the component's own elements, out of the consumer's reach; Foundation's own switch inserted `.tabs-content` straight after the strip, so it never supported that layout either.
- Lazy content in sections (`nfsAccordionLazyContent`, `nfsTabsLazyContent`); a consumer `@defer` inside a section loads code.
- Rich titles (markup or icons in a title): a first-release limit. Foundation's titles are markup the consumer writes (the anchor's content), so plain-text `title` narrows them; the upgrade is a title template on the section, rendered inside the accordion button or the tab, which adds API without changing `title`.
- Disabled sections and a disabled widget; the Accordion's `region` control.
- `autoFocus` (D13): passed through, the Tabs directive's once-per-instance focus would fire at every Mode swap into tabs, because each swap creates the tab list again; a component-owned option that focuses once per page is additive later.
- Reading a static Foundation class as initial state or a look: sections are templates and the host binds no class (ADR 0039); `selected`, `simple`, and `primary` replace them, and the documented usage copies no class onto the host (Documented usage, 7).
- Keeping consumer state inside sections across a swap by moving views between the branches (D10).
- Completion outputs (`opened`/`closed` after the height transition): the component's state is `selected`, which no animation drives in tabs mode; a consumer who needs them uses the Accordion directly.
- Container queries as the switch (ADR 0005: Foundation's rules are viewport breakpoints).
- A live-region announcement of a swap (Breakpoint service consuming-directive rule 4).
- Automated screen-reader output: the manual release test under Testing Decisions covers it ([Resolve the assistive-technology checks](../issues/77-evidence-assistive-technology-checks.md)).

## Further Notes

### Design decisions

| # | Decision | Rationale | Rejected alternative |
| --- | --- | --- | --- |
| D1 | One element-selector component plus `ng-template` sections | ADR 0001 case 1: the plugin renders one of two markup trees and must swap heading-plus-button for tab semantics; sections written once | Directives on consumer-written accordion or tabs markup (the consumer would write both forms or the library would move nodes); Foundation's DOM rewrite |
| D2 | Compose the library's Accordion and Tabs directive sets exactly as defined | One implementation of each pattern, their guards (content key guard, replay guards), the expansion policy (ADR 0028), the server-side tab stop, and their Sass settings | Re-implementing either pattern inside the component |
| D3 | The Mode swap is an `@if` structural re-render | Static directive matching, Foundation's panel placement, and ARIA's `tablist` child rule forbid a same-node swap (prototype verdict) | A class-and-role change on the same nodes |
| D4 | One `selected` model naming the open item in both modes, with the Tabs first-tab default in tabs mode | One value survives every swap; consumers read what is on screen, as with the Tabs directives; the carry rule becomes automatic | The prototype's `selected` left unset while tabs show the first panel (inconsistent with the Tabs spec's contract); two models (`expanded` and `selected`) needing sync |
| D5 | Single-expand accordion; `multiExpand` dropped | Tabs show one panel (APG), so several open items have no tabs equivalent; Foundation's own switch turns them into several selected tabs (source reading); `multiExpand` plus an array model can be added later without changing current behaviour | Passing `multiExpand` through with an undefined mapping |
| D6 | `allowAllClosed`, `selectionMode`, `wrapOnKeys` passed through, library-owned defaults | Foundation passes every child option through; these three have a meaning in one mode and do no harm in the other | Exposing every Accordion and Tabs input |
| D7 | Displayed mode separate from the viewport's mode, swapped in an `afterRenderEffect` `earlyRead`, refocused in `write` | The only point where the old nodes, and so the focused element, still exist; one code path for resizes, `rules` changes, and the first-render swap (prototype) | Swapping from `computed(resolve(rules))` directly in the template (focus is gone before any callback runs) |
| D8 | `instance` strategy: every instance starts from the Server breakpoint's mode | Deferred blocks hydrate as sent and keep focus; client-created instances never paint the wrong mode (prototype cases 4, 19 to 21); the service exposes its Server breakpoint for it (ADR 0032) | Starting from the service's `current` (rebuilds deferred blocks at hydration, loses focus) |
| D9 | Focus moves to the equivalent control only when it was inside the widget; selection unchanged | APG persistence of focus; selection is the consumer's state, not a side effect of a resize | Focusing the selected control; selecting the focused section |
| D10 | Section content re-instantiated on a swap, documented | Each branch hosts different elements; moving embedded views between two branches is untested and changes no API if added later | Moving the views between branches in the first release |
| D11 | Deep links owned by the component, children get `deepLink` false | A per-mode instance would re-read the hash, re-emit, and smudge-scroll at every swap | Passing `deepLink` through as Foundation does |
| D12 | `headingLevel` input, native `h1`-`h6` through `@switch` | APG heading at the page's level; the `nfs-accordion` rules need native headings | A fixed `h3` (the prototype); `role="heading"` with `aria-level` (misses Foundation-facing rules) |
| D13 | `autoFocus` dropped (reason restated 2026-09-27, class-rule re-run) | Passed through, the Tabs directive's once-per-instance focus would fire again at every Mode swap into tabs, because each swap creates the tab list again, and a focus move at a swap belongs to the refocus rule (D9), which moves focus only when it was inside the widget. A component-owned option that focuses once per page, like the deep links (D11), is additive later. The APG's caution about moving focus on load argues against a default, not against an opt-in such as the Tabs spec keeps, so it is not the reason | Passing it through |
| D14 | `label` and `labelledBy` inputs on the rendered list in both modes | A tab list must be named; the consumer cannot reach the internal `ul`; one stable name across modes; `aria-label` on the host would sit on an element with no role | Native `aria-label` on the host |
| D15 | Rules with no mode at the Zero breakpoint render accordion | Mobile-first, the form readable without JavaScript, and a defined state where Foundation initialised nothing | Rendering nothing, or throwing |
| D16 | `selectionChange` only for client changes that are neither swaps nor first-tab defaults | building-blocks 1.4 aggregate output with the item; resizes are not selections | Emitting on every model change (`selectedChange` already does) |
| D17 | Required Sass settings are the Accordion's and the Tabs spec's | Both specs' settings together pass 1.4.3 and 1.4.11 in both modes; the prototype's `$tab-active-color` darkening fixed text but left the selected look at 1.24:1 | The prototype's two settings |
| D18 | Pre-hydration input on a swapped control is lost; `hydrate on viewport` or `on idle` recommended over `on interaction` | Replay runs after the swap removes its target; focus is carried; client hints avoid it for Chromium | Intercepting clicks before hydration (no library listener exists then) |
| D19 | No `injectAsync` | Both modes are needed at the first render callback; on-demand loading would paint the wrong mode | Loading the Tabs set only on a wide viewport |
| D20 | No component styles, no library mixin | ADR 0012; Foundation's accordion and tabs Sass plus `nfs-accordion` cover both modes, and `nfs-tabs` covers the `simple` and `primary` looks (D22) | A component stylesheet |
| D21 | The component's template writes no class; each composed directive binds its own Structural and State classes, `div[nfsTabsContent]` included (added 2026-09-27, class rule) | ADR 0039: one owner per class. The Accordion and Tabs directives bind their classes as static `host` classes, so the server HTML is unchanged; a class written in the template would be a second spelling, and one a directive binds dynamically (`is-active`) would be stripped | The first version's plain `div.tabs-content` (a Structural class with no directive); writing the Structural classes redundantly in the template |
| D22 | `simple` and `primary` Variant inputs on the component, bound to `NfsTabs` in tabs mode; no effect in accordion mode (added 2026-09-27, class rule) | ADR 0039 and ADR 0040: every Variant class is a typed input, and the consumer cannot reach the internal strip. Foundation's plugin keeps these classes on its element across switches (it swaps only `.accordion` and `.tabs`), so a Foundation consumer had both looks in tabs mode; Foundation's accordion has no Variant class, so accordion mode has nothing to map them to. Booleans through `nfsVariantBoolean`, as the Tabs spec types them, because the two classes combine | Leaving them out (a Foundation look made unreachable only because it is a class, which the user's ruling of 2026-09-27 rules out); one `look` enum (the classes combine); `booleanAttribute` (accepts any string, ADR 0040); `orientation` (Out of Scope) |
| D23 | The documented usage copies no Foundation class onto the host (`accordion`, `tabs`, `vertical`, `simple`, `primary`) and names what replaces each; the component's JSDoc states it (added 2026-09-27, class rule) | The host binds no class, so a copied class is not stripped but styles the host: a copied `tabs` draws a border and background around the whole widget (measured in three engines against Foundation 6.9's CSS); migrating Foundation markup puts these classes exactly there | Binding each class to `false` on the host to strip it (five bindings for a migration concern, and a copied `vertical` would still promise a layout the component does not offer) |
| D24 | The initial section is `selected`; no class seeds it (added 2026-09-27, class rule) | ADR 0039 and building-blocks 1.4; `selected` already drives both modes, and accordion mode applies it through the title's `[expanded]` binding, the only initial-state path the Accordion spec keeps | A class on the section (templates render no element); an `expanded` input per section (a second writable copy of `selected`) |
| D25 | The equal-heights recipe (Foundation's `matchHeight`) goes on an Application class on the host and selects the content box by structure and roles: `.equal-heights > * > [role='tablist'] + *` (added 2026-09-27, class rule) | The Tabs recipe puts the consumer's class on `[nfsTabsContent]`, which is inside this component; the recipe may name no Foundation class (building-blocks 1.1), and the child combinators keep nested tab sets out of it; measured in Chromium, Firefox, and WebKit against Foundation 6.9's CSS: every panel takes the tallest panel's height, hidden panels stay hidden, and a nested tab set is untouched | A `contentClass` input for the internal box (new API for one recipe); `nfs-responsive-accordion-tabs .tabs-content` (names a Foundation class); `:has()` (out of the Browser target) |

### Usage examples

```ts
@Component({
  selector: 'app-product',
  imports: [NfsResponsiveAccordionTabs, NfsResponsiveAccordionTabsPanel, ReviewList], // ReviewList: the application's app-review-list
  template: `
    <h2 id="details-heading">Product details</h2>
    <nfs-responsive-accordion-tabs
      rules="accordion medium-tabs"
      labelledBy="details-heading"
      [headingLevel]="3"
      [(selected)]="section"
      deepLink
      (selectionChange)="track($event)"
      #details="nfsResponsiveAccordionTabs"
    >
      <ng-template nfsResponsiveAccordionTabsPanel title="Overview" value="overview" id="overview">
        <p>{{ product().summary }}</p>
      </ng-template>
      <ng-template nfsResponsiveAccordionTabsPanel title="Reviews ({{ reviews().length }})" value="reviews" id="reviews">
        @defer (on viewport) {
          <app-review-list [reviews]="reviews()" />
        } @placeholder {
          <p>Loading reviews.</p>
        }
      </ng-template>
      <ng-template nfsResponsiveAccordionTabsPanel title="Notes" value="notes" id="notes">
        <!-- keep form state outside the section so it survives a mode swap -->
        <label>Note <input [value]="note()" (input)="note.set($any($event.target).value)" /></label>
      </ng-template>
    </nfs-responsive-accordion-tabs>
    <p>Shown as {{ details.mode() }}.</p>
  `,
})
export class AppProduct {
  readonly product = input.required<Product>();
  readonly reviews = input.required<Review[]>();
  protected readonly section = signal<string | undefined>(undefined);
  protected readonly note = signal('');

  protected track(change: NfsResponsiveAccordionTabsChange): void {
    // change.value is the section the user opened, or undefined when the accordion closed the last one
  }
}
```

```html
<!-- Foundation's tabs-first example: tabs on small and large, accordion on medium -->
<nfs-responsive-accordion-tabs rules="tabs medium-accordion large-tabs" label="Examples" allowAllClosed>
  @for (s of sections(); track s.id) {
    <ng-template nfsResponsiveAccordionTabsPanel [title]="s.title" [value]="s.id" [id]="s.id">
      <p>{{ s.body }}</p>
    </ng-template>
  }
</nfs-responsive-accordion-tabs>
```

```ts
// Object form of the rules, and app-wide defaults
readonly rules: NfsBreakpointRules<NfsResponsiveAccordionTabsMode> = {small: 'accordion', large: 'tabs'};

bootstrapApplication(App, {
  providers: [
    {provide: nfsResponsiveAccordionTabsDefaultsToken, useValue: {headingLevel: 2, allowAllClosed: true}},
  ],
});
```

```html
<!-- Foundation's simple look on a primary bar in tabs mode; no class anywhere.
     The accordion below medium ignores both inputs. -->
<nfs-responsive-accordion-tabs rules="accordion medium-tabs" label="Plans" selected="team" simple primary>
  <ng-template nfsResponsiveAccordionTabsPanel title="Personal" value="personal"><p>...</p></ng-template>
  <ng-template nfsResponsiveAccordionTabsPanel title="Team" value="team"><p>...</p></ng-template>
</nfs-responsive-accordion-tabs>
```

```scss
// Consumer styles: settings, Foundation, the library, then the includes
// settings: $accordion-item-color: scale-color($primary-color, $lightness: -15%);
//           $tab-background-active: $primary-color;
//           $tab-active-color: $white;
@import 'settings';
@import 'foundation';
@import 'ngx-foundation-sites';

@include foundation-global-styles;
@include foundation-accordion;
@include foundation-tabs;
@include nfs-accordion;
@include nfs-tabs; // included for tabs mode: the simple and primary looks

// Sticky header: keep refocused and deep-linked controls clear of it
html { scroll-padding-top: 4rem; }
```

Equal panel heights in tabs mode (Foundation's `matchHeight` replacement), consumer CSS on the consumer's own class on the host, written `<nfs-responsive-accordion-tabs class="equal-heights" ...>`. It selects the content box as the element after the tab list inside the host's child, panels by role, and hidden panels by `inert`, all of which the server HTML carries, so it names no Foundation class; the child combinators keep a tab set nested in a panel out of it, and in accordion mode nothing matches:

```css
/* Stack every tab panel in one grid cell so the box takes the tallest panel's height.
   Hidden panels stay inert (Aria) and invisible. */
.equal-heights > * > [role='tablist'] + * {
  display: grid;
}

.equal-heights > * > [role='tablist'] + * > [role='tabpanel'] {
  display: block;
  grid-area: 1 / 1;
}

.equal-heights > * > [role='tablist'] + * > [role='tabpanel'][inert] {
  visibility: hidden;
}
```

The selectors rely on the tabs-mode structure the Rendered HTML section documents (the host's one child holds the tab list followed by the content box, whose children are the panels); a change to that structure is a breaking change to this recipe.

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This plugin relies on Foundation's export mixins `foundation-accordion` and `foundation-tabs` (and `foundation-global-styles`, whose button reset and focus outline the accordion titles inherit). No library CSS; there is no `nfs-responsive-accordion-tabs` mixin. The accordion mode's documented custom CSS is the Accordion's `nfs-accordion` mixin of the library's Sass (`@import 'ngx-foundation-sites';` after Foundation), included after `foundation-accordion`, unchanged; the tabs mode's is the Tabs spec's `nfs-tabs` mixin, included after `foundation-tabs`, which styles the `simple` and `primary` looks; it is included whenever the rules have a tabs mode.

(1) Rules the component adds: none. The rules it depends on are `nfs-accordion`'s seven, listed with their reasons in the Accordion spec (heading margin, button title width and alignment, the re-included `accordion-title` rules under the heading, the shown grid row, the collapsed row, the clipping inner element, and the reduced-motion override), and, when `simple` or `primary` is set, `nfs-tabs`' two, listed with their reasons in the Tabs spec (the `simple` titles' 24 by 24 px minimum, and the selected tab's colours on a `primary` bar).

(2) Reused settings, mixins, and functions: through `foundation-accordion`, `foundation-tabs`, and `nfs-accordion`, the consumer's `$accordion-*` and `$tab-*` settings and `$global-radius`. Required settings for WCAG 2.2 AA, set by the consumer before Foundation's import and by the library's Storybook: `$accordion-item-color: scale-color($primary-color, $lightness: -15%);` (title text 4.86:1 on the hover and focus background, where Foundation's default is 3.76:1) and `$tab-background-active: $primary-color; $tab-active-color: $white;` (selected and focused tab text 4.65:1, and the selected look 4.65:1 against unselected tabs, where Foundation's defaults give 3.76:1 and 1.24:1), each ratio computed unrounded with the exact WCAG formula, as the Accordion and Tabs specs state. The story gate and a play function assert them in the stories. No mixin parameter of its own; the accordion transition duration stays `nfs-accordion($duration)`.

(3) Custom properties: none.

(4) Motion classes: none. The only animation is the accordion mode's `grid-template-rows` transition, whose `prefers-reduced-motion` override is `nfs-accordion`'s rule 7.

(5) What visibly breaks when an include is missing: without `nfs-accordion`, accordion-mode sections never open visibly (Foundation's `display: none` stays), titles are narrow and centred, and there is no animation; without `foundation-tabs`, tabs mode is an unstyled list; without `nfs-tabs`, a `simple` strip's tabs stay 12 px tall and the selected tab on a `primary` bar falls back to Foundation's cascade (1.00:1 against the bar under the required settings); without the three settings, the focused accordion title and the selected tab fail 1.4.3, and the story gate fails on them.

(6) Variant properties: none. The component's two Variant families are closed (the Tabs spec's `.simple` and `.primary`), and Foundation's accordion has none, so no mixin writes a `--nfs-<setting>` property for it.

### Platform features to adopt when the browser target moves

- View Transitions (same-document): an animated Mode swap and tab switch without JavaScript timing, keyed on the `mode` change.
- `<details name>` and `::details-content`: could replace the accordion branch only once a heading can wrap the control (the Accordion spec's note); they never replace the tabs branch.
- `hidden="until-found"` with `beforematch`: find-in-page could open a collapsed section or select a tab, setting `selected`; needs a design pass against Foundation's display rules.
- CSS generated-content alternative text: removes the accordion glyph from the title's accessible name (the Accordion spec's note).
- Container queries: stay out as the switch (viewport semantics); usable inside consumer CSS for section content.
- `:has()`: the equal-heights recipe could select the content box as `.equal-heights :has(> [role='tabpanel'])` instead of by its place after the tab list.

### Foundation behaviour changed or dropped

- The consumer writes no Foundation class and no `data-responsive-accordion-tabs` markup: the component's element and its `ng-template` sections carry none, and the composed directives bind every class of both modes (ADR 0039). Foundation's per-mode `.accordion` or `.tabs` on the element moves to the list the component renders; the initial `class="is-active"` becomes `selected`; `.simple` and `.primary` on the element become the `simple` and `primary` inputs; a copied class styles the host, so the documented usage copies none (Documented usage, 7).
- The DOM rewrite (moving panels, the placeholder `div`, rewriting `href`s, generated element and pane ids) becomes a template branch over `ng-template` sections; the consumer writes each section once.
- The stale tab attributes Foundation leaves on accordion titles after a switch (its `$panels.children('a')` selector bug) cannot occur: the other mode's nodes do not exist.
- Rules resolve by breakpoint order, not written order; a bare mode applies from the Zero breakpoint; no match renders accordion instead of nothing.
- `multiExpand`, `autoFocus`, `slideSpeed`, `deepLinkSmudgeDelay`, `matchHeight`, `activeCollapse`, the class-name options, and `reflow` are dropped; deep links run once per page instead of at every child re-init.
- Focus is kept across a switch; `selected` is kept instead of copying `is-active` between elements; the tabs mode always shows a panel (the Tabs spec's first-tab default).
- Accordion mode gets headings and buttons (the Accordion spec's deltas); tabs mode gets the Tabs spec's `value` pairing, Home and End, and the right-to-left flip.
- The component's own events disappear; the live child's events become `selectedChange`, `selectionChange`, and `deepLinked`.
- jQuery-only behaviour dropped: `_getAllOptions`' throwaway plugin instances to learn option names, `changed.zf.mediaquery` on `window`, `.data('zfPlugin')` bookkeeping for nested elements, and destroying and constructing plugins on the same element.
