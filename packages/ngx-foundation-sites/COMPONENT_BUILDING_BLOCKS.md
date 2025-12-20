# Foundation for Sites to Angular Building Blocks Mapping

## Overview

This document maps Foundation for Sites JavaScript components to Angular building blocks, prioritizing:

1. **@angular/aria** - Headless, accessible UI primitives (preferred)
2. **@angular/cdk** - Lower-level behavior primitives
3. **Custom implementation** - When no suitable building block exists

All components use Foundation's Sass styles with no JavaScript from `foundation-sites`.

## Available @angular/aria Components (Official)

From [Angular ARIA Overview](https://angular.dev/guide/aria/overview):

| Category                           | Components                                           |
| ---------------------------------- | ---------------------------------------------------- |
| **Search and Selection**           | Autocomplete, Listbox, Select, Multiselect, Combobox |
| **Navigation and Call to Actions** | Menu, Menubar, Toolbar                               |
| **Content Organization**           | Accordion, Tabs, Tree, Grid                          |

---

## Component Mapping Table

| Foundation Component          | Angular Building Block                                                   | Priority | Notes                                                           |
| ----------------------------- | ------------------------------------------------------------------------ | -------- | --------------------------------------------------------------- |
| **Accordion**                 | `@angular/aria/accordion`                                                | 1        | Direct match - AccordionGroup, AccordionTrigger, AccordionPanel |
| **Tabs**                      | `@angular/aria/tabs`                                                     | 1        | Direct match - Tabs, TabList, Tab, TabPanel                     |
| **Accordion Menu**            | `@angular/aria/menu` + `@angular/aria/accordion`                         | 1        | Combine Menu with expandable groups                             |
| **Drilldown Menu**            | `@angular/aria/menu`                                                     | 1        | Menu with nested MenuItems                                      |
| **Dropdown**                  | `@angular/aria/menu` + `@angular/cdk/overlay`                            | 1+2      | MenuTrigger + Menu with overlay positioning                     |
| **Dropdown Menu**             | `@angular/aria/menu`                                                     | 1        | MenuBar with nested submenus                                    |
| **Responsive Accordion Tabs** | `@angular/aria/tabs` + `@angular/aria/accordion` + `@angular/cdk/layout` | 1+2      | Switch based on BreakpointObserver                              |
| **Reveal (Modal)**            | `@angular/cdk/dialog` + `@angular/cdk/a11y`                              | 2        | CDK Dialog with FocusTrap                                       |
| **Off-Canvas**                | `@angular/cdk/dialog` + `@angular/cdk/a11y`                              | 2        | CDK Dialog variant with slide animation                         |
| **Tooltip**                   | `@angular/cdk/overlay` + `@angular/cdk/a11y`                             | 2        | Overlay + AriaDescriber                                         |
| **Orbit (Carousel)**          | Custom                                                                   | 3        | No ARIA/CDK match - custom with keyboard nav                    |
| **Slider**                    | Custom                                                                   | 3        | HTML5 range input + custom styling                              |
| **Magellan (Scroll Spy)**     | `@angular/cdk/scrolling`                                                 | 2        | ScrollDispatcher + custom logic                                 |
| **Smooth Scroll**             | Custom                                                                   | 3        | Native `scrollIntoView` with behavior: 'smooth'                 |
| **Sticky**                    | `@angular/cdk/scrolling`                                                 | 2        | ViewportRuler + IntersectionObserver                            |
| **Toggler**                   | Custom                                                                   | 3        | Simple signal-based toggle                                      |
| **Equalizer**                 | Custom                                                                   | 3        | ResizeObserver-based                                            |
| **Interchange**               | `@angular/cdk/layout`                                                    | 2        | BreakpointObserver for responsive content                       |
| **Responsive Menu**           | `@angular/aria/menu` + `@angular/cdk/layout`                             | 1+2      | Menu + BreakpointObserver                                       |
| **Responsive Toggle**         | `@angular/cdk/layout`                                                    | 2        | BreakpointObserver                                              |
| **Abide (Form Validation)**   | Angular Reactive Forms                                                   | N/A      | Use Angular's built-in validation                               |

---

## Detailed Component Analysis

### Tier 1: Direct @angular/aria Match (Highest Priority)

#### 1. Accordion

- **Foundation**: Collapsible content panels
- **Angular ARIA**: `AccordionGroup`, `AccordionTrigger`, `AccordionPanel`, `AccordionContent`
- **Features matched**: Single/multi-expand, keyboard nav, lazy content rendering
- **Styling**: Apply Foundation's `.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content` classes

#### 2. Tabs

- **Foundation**: Tabbed content interface
- **Angular ARIA**: `Tabs`, `TabList`, `Tab`, `TabPanel`, `TabContent`
- **Features matched**: Keyboard nav, lazy content, orientation, selection modes
- **Styling**: Apply Foundation's `.tabs`, `.tabs-title`, `.tabs-content`, `.tabs-panel` classes

#### 3. Menu / MenuBar (for Dropdown Menu, Accordion Menu, Drilldown)

- **Foundation**: Various menu patterns
- **Angular ARIA**: `Menu`, `MenuBar`, `MenuItem`, `MenuTrigger`, `MenuContent`
- **Features matched**: Nested submenus, keyboard nav, typeahead, expansion delay
- **Styling**: Apply Foundation's `.menu`, `.dropdown`, `.is-dropdown-submenu` classes

#### 4. Combobox (for advanced dropdowns)

- **Foundation**: N/A (but useful addition)
- **Angular ARIA**: `Combobox`, `ComboboxInput`, `ComboboxPopup`
- **Use case**: Searchable dropdowns, autocomplete

#### 5. Listbox

- **Foundation**: N/A (but useful for select-like components)
- **Angular ARIA**: `Listbox`, `Option`
- **Use case**: Custom select components

#### 6. Tree (for hierarchical menus)

- **Foundation**: Drilldown-like patterns
- **Angular ARIA**: `Tree`, `TreeItem`, `TreeItemGroup`
- **Use case**: Nested navigation, file browsers

---

### Tier 2: @angular/cdk Required

#### 7. Reveal (Modal Dialog)

- **CDK modules**: `dialog`, `overlay`, `a11y` (FocusTrap, LiveAnnouncer)
- **Implementation**: Use CDK Dialog with custom template
- **Features**: Focus trapping, backdrop, close on escape, animations
- **Styling**: Foundation's `.reveal`, `.reveal-overlay` classes

#### 8. Off-Canvas

- **CDK modules**: `dialog`, `a11y`, `portal`
- **Implementation**: Slide-in panel using CDK dialog infrastructure
- **Features**: Push/overlap transitions, focus trapping
- **Styling**: Foundation's `.off-canvas`, `.off-canvas-content` classes

#### 9. Tooltip

- **CDK modules**: `overlay`, `a11y` (AriaDescriber), `platform`
- **Implementation**: Overlay with positioning strategy
- **Features**: Position auto-adjustment, aria-describedby
- **Styling**: Foundation's `.tooltip` class

#### 10. Dropdown (Trigger + Popup)

- **Angular ARIA**: `MenuTrigger`, `Menu` for menu dropdowns
- **CDK modules**: `overlay` for positioning
- **Features**: Click/hover triggers, positioning, close on outside click
- **Styling**: Foundation's `.dropdown-pane` class

#### 11. Responsive Components

- **CDK module**: `layout` (BreakpointObserver)
- **Components**: Responsive Menu, Responsive Toggle, Responsive Accordion Tabs
- **Implementation**: Switch between ARIA components based on breakpoint

#### 12. Sticky

- **CDK modules**: `scrolling` (ViewportRuler, ScrollDispatcher)
- **Implementation**: Track scroll position, apply sticky state
- **Styling**: Foundation's `.sticky` class

#### 13. Magellan (Scroll Spy)

- **CDK modules**: `scrolling`
- **Implementation**: IntersectionObserver + ScrollDispatcher
- **Features**: Active section tracking, smooth scroll to sections

#### 14. Interchange

- **CDK module**: `layout` (BreakpointObserver)
- **Implementation**: Responsive content switching directive
- **Use case**: Load different images/content per breakpoint

---

### Tier 3: Custom Implementation (with Angular/CDK/Browser APIs)

#### 15. Orbit (Carousel/Slider)

| Category         | APIs                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Angular Core** | `signal()`, `computed()`, `effect()`, `afterRender()`, `input()`, `output()`          |
| **Angular Core** | `@defer (on viewport)` for lazy-loading slides, auto-pause when out of view           |
| **CDK a11y**     | `@angular/cdk/keycodes` (ARROW_LEFT, ARROW_RIGHT, HOME, END), `LiveAnnouncer`         |
| **CDK a11y**     | `FocusMonitor`, `ListKeyManager` (optional for slide focus)                           |
| **Browser APIs** | `setInterval`/`clearInterval` (auto-play timing)                                      |
| **Touch/Swipe**  | Native Pointer Events (`pointerdown`, `pointermove`, `pointerup`) for swipe detection |
| **Animations**   | CSS `transition`/`@keyframes`, `animate.enter`/`animate.leave` directives             |

**ARIA attributes**: `role="region"`, `aria-roledescription="carousel"`, `aria-label`, `aria-live="polite"`

**Styling**: Foundation's `.orbit`, `.orbit-slide`, `.orbit-bullets` classes

---

#### 16. Slider (Range Input)

| Category         | APIs                                                         |
| ---------------- | ------------------------------------------------------------ |
| **Angular Core** | `signal()`, `computed()`, `input()`, `output()`, `Renderer2` |
| **CDK coercion** | `coerceNumberProperty()` for min/max/step attributes         |
| **CDK keycodes** | ARROW_LEFT, ARROW_RIGHT, PAGE_UP, PAGE_DOWN, HOME, END       |
| **Browser APIs** | Native `<input type="range">` (built-in keyboard + ARIA)     |
| **Styling**      | CSS custom properties for track fill percentage              |

**ARIA**: Native `<input type="range">` provides `aria-valuemin`, `aria-valuemax`, `aria-valuenow`

**Dual-handle**: Requires two overlapping inputs or custom implementation with Pointer Events

**Styling**: Foundation's `.slider`, `.slider-handle`, `.slider-fill` classes

---

#### 17. Smooth Scroll

| Category         | APIs                                                             |
| ---------------- | ---------------------------------------------------------------- |
| **Angular Core** | `@Directive()`, `inject()`, `signal()`, `afterRender()`          |
| **CDK a11y**     | `LiveAnnouncer` (announce scroll completion to screen readers)   |
| **Browser APIs** | `Element.scrollIntoView({ behavior: 'smooth', block: 'start' })` |
| **Browser APIs** | `element.focus()` for keyboard navigation after scroll           |

**Fallback**: CSS `scroll-behavior: smooth` on `html` element

---

#### 18. Toggler

| Category         | APIs                                                              |
| ---------------- | ----------------------------------------------------------------- |
| **Angular Core** | `signal<boolean>()`, `@Directive()`, `Renderer2`, `afterRender()` |
| **Angular Core** | `animate.enter`/`animate.leave` for enter/exit animations         |
| **Browser APIs** | `classList.toggle()`, CSS `transition`/`@keyframes`               |

**ARIA attributes**: `aria-expanded`, `aria-controls`, `aria-hidden`

---

#### 19. Equalizer

| Category         | APIs                                                              |
| ---------------- | ----------------------------------------------------------------- |
| **Angular Core** | `signal()`, `computed()`, `afterRender()`, `Renderer2.setStyle()` |
| **Angular Core** | `@defer (on viewport)` for lazy calculation when visible          |
| **CDK layout**   | `BreakpointObserver` (re-equalize on breakpoint change)           |
| **Browser APIs** | `ResizeObserver` (observe element size changes)                   |

**Implementation**: Directive that observes children, calculates max height per row, applies `min-height`

---

## Cross-Cutting Angular APIs for Custom Components

| Use Case           | API                                                 | Source                   |
| ------------------ | --------------------------------------------------- | ------------------------ |
| **State**          | `signal()`, `computed()`, `effect()`                | `@angular/core`          |
| **Lifecycle**      | `afterRender()`, `afterNextRender()`                | `@angular/core`          |
| **Lazy loading**   | `@defer (on viewport)`, `@defer (on idle)`          | `@angular/core`          |
| **DOM**            | `Renderer2`, `ElementRef`                           | `@angular/core`          |
| **Inputs/Outputs** | `input()`, `output()`, `model()`                    | `@angular/core`          |
| **Keyboard codes** | `ARROW_*`, `ENTER`, `ESCAPE`, `HOME`, `END`         | `@angular/cdk/keycodes`  |
| **Type coercion**  | `coerceBooleanProperty()`, `coerceNumberProperty()` | `@angular/cdk/coercion`  |
| **Accessibility**  | `FocusMonitor`, `LiveAnnouncer`, `ListKeyManager`   | `@angular/cdk/a11y`      |
| **Responsive**     | `BreakpointObserver`                                | `@angular/cdk/layout`    |
| **Scrolling**      | `ScrollDispatcher`, `ViewportRuler`                 | `@angular/cdk/scrolling` |
| **Platform**       | `isPlatformBrowser()`                               | `@angular/common`        |

## Browser APIs Summary

| API                | Purpose                      | Components     |
| ------------------ | ---------------------------- | -------------- |
| `ResizeObserver`   | Observe element size changes | Equalizer      |
| `scrollIntoView()` | Smooth scroll to element     | Smooth Scroll  |
| `Pointer Events`   | Unified mouse/touch handling | Orbit, Slider  |
| `classList`        | Dynamic class toggling       | Toggler        |
| `CSS transitions`  | Smooth animations            | All components |
| `setInterval`      | Auto-play timing             | Orbit          |

**Note**: Use `@defer (on viewport)` instead of raw `IntersectionObserver` for viewport-based lazy loading. Angular's `@defer` uses `IntersectionObserver` internally but provides better integration with Angular's rendering lifecycle.

---

## Utility Services Needed

| Foundation Utility | Angular Service     | Implementation                                                             |
| ------------------ | ------------------- | -------------------------------------------------------------------------- |
| MediaQuery         | `BreakpointService` | Wraps CDK `BreakpointObserver` with Foundation breakpoints                 |
| Keyboard           | `KeyboardService`   | Use CDK `a11y` keyboard utilities                                          |
| Motion/Animate     | N/A                 | Use native CSS `transition`/`@keyframes` + `animate.enter`/`animate.leave` |
| Touch              | N/A                 | Use native Pointer Events API directly                                     |

---

## Component Selection Checklist

Select which components to implement by marking with [x]:

### Tier 1: @angular/aria Based (Recommended First)

- [ ] **Accordion** - Collapsible content panels
- [ ] **Tabs** - Tabbed content interface
- [ ] **Accordion Menu** - Expandable vertical navigation
- [ ] **Drilldown Menu** - Nested navigation with drill-in pattern
- [ ] **Dropdown Menu** - Horizontal menu with dropdowns

### Tier 2: @angular/cdk Based

- [ ] **Reveal (Modal)** - Dialog/modal overlays
- [ ] **Off-Canvas** - Slide-out side panels
- [ ] **Tooltip** - Hover/focus tooltips
- [ ] **Dropdown** - Generic dropdown panes (non-menu)
- [ ] **Sticky** - Elements that stick on scroll
- [ ] **Magellan** - Scroll spy navigation
- [ ] **Interchange** - Responsive content switching

### Tier 3: Custom Implementation

- [ ] **Orbit (Carousel)** - Image/content carousel
- [ ] **Slider** - Range input with custom styling
- [ ] **Toggler** - Simple show/hide toggle
- [ ] **Equalizer** - Equal height elements
- [ ] **Smooth Scroll** - Animated scroll to anchor

### Responsive Variants

- [ ] **Responsive Menu** - Adapts menu pattern to screen size
- [ ] **Responsive Toggle** - Show/hide based on breakpoint
- [ ] **Responsive Accordion Tabs** - Tabs on desktop, accordion on mobile

### Skip (Use Angular Built-ins)

- ~~Abide (Form Validation)~~ - Use Angular Reactive Forms

---

## Sources

### Foundation

- [Foundation for Sites 6 Docs](https://get.foundation/sites/docs/)
- [Foundation JavaScript Docs](https://get.foundation/sites/docs/javascript.html)

### Angular ARIA

- [Angular ARIA Overview](https://angular.dev/guide/aria/overview)
- [Angular ARIA in Angular 21 - DEV Community](https://dev.to/hassantayyab/angular-aria-in-angular-21-the-future-of-accessible-headless-ui-components-26di)
- [Why Angular ARIA in v21 is pretty neat](https://www.angulararchitects.io/blog/angular-aria/)
- [Announcing Angular v21](https://blog.angular.dev/announcing-angular-v21-57946c34f14b)

### Angular CDK

- [Enhancing A11y with Angular CDK](https://www.angulararchitects.io/blog/angular-cdk-accessibility/)
- [Angular CDK Accessibility (a11y)](https://material.angular.dev/cdk/a11y/api)
- [Angular CDK Scrolling](https://material.angular.dev/cdk/scrolling/overview)
- [Angular CDK Coercion](https://angular.love/angular-cdk-coercion-the-missing-api-reference/)

### Angular Core APIs

- [Angular Lifecycle Hooks - afterRender](https://angular.dev/guide/components/lifecycle)
- [Angular @defer block](https://angular.dev/guide/defer)
- [Angular Renderer2](https://angular.dev/api/core/Renderer2)
- [Angular Animations Migration](https://angular.dev/guide/animations/migration) - `@angular/animations` deprecated in v20.2

### Browser APIs

- [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
- [Element.scrollIntoView()](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)
- [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
