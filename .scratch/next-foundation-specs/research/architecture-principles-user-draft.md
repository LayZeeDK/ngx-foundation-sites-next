# User draft: component and directive API design principles

The user gave this draft on 2026-09-28 as "an example to get you started, based on both React and Angular principles", asking for researched guiding principles for directive and component architecture in Angular UI component libraries, a guide authored from them, an audit of the specs against the guide, and the survivors resolved. The user added the same day that Microsoft Copilot generated the draft with little to no research: it is a list of candidate principles and questions to test, with no weight of its own, and a principle enters the guide only on the research's evidence. It is kept here as the user gave it, with two changes: the two down arrows in principle 9 are written as `v` (ASCII only in committed files), and code blocks keep the user's `fnd` prefix, which this effort writes `nfs`. It is a starting point, neither a ruling nor evidence: [Research: directive and component architecture principles for Angular UI libraries](../issues/140-research-directive-component-architecture-principles.md) tests it, and [Decide: the directive and component architecture guide](../issues/141-decide-directive-component-architecture-guide.md) writes the guide.

---

# Angular Foundation for Sites UI Library
## Component & Directive API Design Principles

### Vision

Build a modern Angular UI library that preserves the visual language and CSS architecture of Foundation for Sites while replacing Foundation's JavaScript implementation with Angular, modern browser APIs, signals, and CSS-based animations.

The library should feel like a natural Angular library, not a React library port.

---

# Core Philosophy

> Enhance native HTML with Angular directives wherever possible, introduce components only when coordination between multiple elements is required, and prioritise composability, accessibility, and platform capabilities over abstraction.

---

# Design Principles

## 1. Directive-First, Component-Second

Prefer attribute directives whenever behaviour or styling can be applied to an existing semantic HTML element.

### Preferred

```html
<button fndButton>
Save
</button>

<button
fndButton
fndDropdownTrigger>
Actions
</button>
```

### Avoid

```html
<fnd-button>
Save
</fnd-button>
```

unless a custom element provides significant additional value.

### Rationale

Angular directives are a unique strength of the framework:

- Preserve native HTML semantics
- Preserve browser behaviour
- Improve accessibility
- Reduce DOM wrappers
- Improve composability
- Improve interoperability

---

## 2. Every Foundation Concept May Have an Angular Directive

A directive is valuable even when it only applies Foundation classes.

### Good

```html
<button fndButton>
<div fndCallout>
<ul fndMenu>
```

### Why

The benefits extend beyond styling:

- Discoverability
- IDE autocomplete
- Type safety
- Consistent Angular surface area
- Future extensibility
- Easier migration

Users should rarely need to remember Foundation class names.

---

## 3. Components Exist for Coordination

Use components when multiple elements must cooperate to provide behaviour, accessibility, state management, or content orchestration.

### Appropriate Component Examples

```html
<fnd-accordion>
<fnd-tabs>
<fnd-off-canvas>
<fnd-reveal>
<fnd-dropdown>
```

### Less Appropriate

```html
<fnd-card-header>
<fnd-card-body>
<fnd-card-footer>
```

when these concepts map directly to Foundation CSS classes.

### Prefer

```html
<div fndCard>

<div fndCardHeader>
...
</div>

<div fndCardSection>
...
</div>

</div>
```

---

## 4. Signals-First Public APIs

Use modern Angular APIs exclusively in public-facing examples and implementations.

### Preferred

```ts
readonly disabled = input(false);

readonly expanded = model(false);

readonly collapsed = computed(
() => !this.expanded()
);

readonly opened = output<void>();
```

### Avoid

```ts
@Input()
@Output()
EventEmitter
```

except where compatibility requirements demand them.

### Rationale

The library should fully embrace modern Angular architecture:

- `input()`
- `output()`
- `model()`
- `signal()`
- `computed()`
- `effect()`

---

## 5. Composition Over Configuration

Prefer combining primitives instead of creating large configuration surfaces.

### Avoid

```html
<fnd-dropdown
placement="bottom"
trigger="hover"
animated="true"
close-on-click="true"
show-arrow="true"
...
>
```

### Prefer

```html
<button
fndButton
fndDropdownTrigger>
Actions
</button>

<div fndDropdown>
...
</div>
```

### Guideline

When a component accumulates many options, first explore whether the functionality should be expressed through:

- Additional directives
- Additional primitives
- Composition patterns

rather than more inputs.

---

## 6. Small Primitives Over Large Components

Prefer many focused building blocks over large feature-rich components.

### Preferred

```text
Dropdown
DropdownTrigger
DropdownContent

Accordion
AccordionItem
AccordionTrigger
AccordionPanel

Tabs
TabList
Tab
TabPanel
```

### Avoid

```text
MegaDropdownComponent
MegaMenuComponent
SuperTabsComponent
```

that attempt to solve every use case.

### Rule

Each primitive should have one clearly defined responsibility.

---

## 7. Behaviour Must Be Composable

Multiple directives should work together naturally.

### Example

```html
<button
fndButton
fndTooltipTrigger
fndDropdownTrigger>
Actions
</button>
```

### Goal

Behaviour should stack naturally without requiring specialised variants.

Avoid APIs such as:

```html
<fnd-dropdown-button>
```

which combine unrelated concerns.

---

## 8. Preserve Native HTML

Native elements should remain visible whenever practical.

### Preferred

```html
<button fndButton>
<a fndButton>
<input fndInput>
<textarea fndTextarea>
```

### Avoid

```html
<fnd-input>
<fnd-textarea>
<fnd-link>
```

unless necessary.

### Benefits

- Accessibility
- Familiarity
- Form compatibility
- Browser interoperability
- Lower learning curve

---

## 9. Browser API First

Use platform capabilities before introducing custom abstractions.

### Preferred Technologies

- `<dialog>`
- Popover API
- CSS Anchor Positioning
- View Transitions API
- ResizeObserver
- IntersectionObserver
- CSS `:has()`
- CSS `:focus-visible`
- CSS container queries
- CSS nesting

### Principle

```text
Browser capability
v
Light abstraction
v
Custom implementation
```

---

## 10. Accessibility Is a First-Class Feature

Accessibility should not be optional.

Every component should support:

- Keyboard navigation
- Screen readers
- Focus management
- Reduced motion preferences
- ARIA patterns where required
- High contrast modes

Accessibility should be built into primitives rather than added afterwards.

---

## 11. Prefer CSS State Over Framework State

Whenever the platform already exposes state, use it.

### Preferred

```css
:open
:popover-open
:focus-visible
:checked
:disabled
:has()
```

### Avoid

```ts
isFocused = signal(false);
isHovered = signal(false);
isOpen = signal(...);
```

unless application state genuinely needs representation in Angular.

### Principle

Let the browser manage UI state whenever possible.

---

## 12. Template Readability Is a Primary Goal

Angular templates are the main API surface.

Developers should understand structure by reading markup.

### Good

```html
<ul fndMenu>
<li>
<a fndMenuItem>
Home
</a>
</li>
</ul>
```

### Less Desirable

```html
<fnd-menu
[items]="menuItems()"
/>
```

for fundamentally content-driven structures.

---

## 13. Minimise Public API Surface

Every public API introduces long-term maintenance cost.

### Questions Before Adding an Input

1. Is the feature genuinely common?
2. Can it be expressed through composition?
3. Can it be expressed through CSS?
4. Can it be expressed through another directive?
5. Will removing it later be impossible?

### Guideline

Prefer:

```ts
2-5 inputs
```

over:

```ts
20+ inputs
```

on a single primitive.

---

## 14. Layout Primitives Should Be Extremely Simple

Provide lightweight layout building blocks.

### Examples

```text
Stack
Cluster
Grid
Cell
Sidebar
Switcher
```

### Avoid

Massive application layout components with dozens of configuration options.

### Principle

Layout primitives should solve one layout problem well.

---

## 15. Smart Components Belong Outside the Library

The library should focus on UI primitives.

### Include

- Presentational components
- Styling directives
- Behaviour directives
- Accessibility primitives
- Layout primitives

### Exclude

- Business logic
- API calls
- State management solutions
- Domain-specific workflows
- Application architecture

Applications own behaviour. Libraries own presentation and interaction primitives.

---

# Recommended Architectural Layers

## Layer 1: Styling Directives

```html
<button fndButton>
<div fndCallout>
<ul fndMenu>
```

Responsibilities:

- Apply Foundation styling
- Optionally map variants to classes

---

## Layer 2: Behaviour Directives

```html
<button fndTooltipTrigger>
<button fndAccordionTrigger>
<button fndDropdownTrigger>
```

Responsibilities:

- Interaction
- Event handling
- Focus management
- Accessibility

---

## Layer 3: Coordinating Components

```html
<fnd-tabs>
<fnd-accordion>
<fnd-reveal>
<fnd-off-canvas>
```

Responsibilities:

- Shared state
- Keyboard patterns
- Context propagation
- Content orchestration

---

## Layer 4: Layout Primitives

```html
<fnd-stack>
<fnd-grid>
<fnd-cluster>
```

Responsibilities:

- Structure
- Layout
- Responsive arrangement

No business logic.

---

# Decision Framework

Before creating a new API, ask:

### Is this only styling?

Use a directive.

### Is this behaviour on a native element?

Use a directive.

### Does it coordinate multiple elements?

Use a component.

### Is it business logic?

Do not include it in the library.

### Does the browser already provide it?

Use the browser feature first.

---

# Library Manifesto

> Build a directive-first Angular UI library that embraces modern Angular signals, preserves native HTML semantics, encapsulates Foundation for Sites styling and behaviour through composable primitives, prioritises accessibility and browser platform capabilities, and favours small focused building blocks over highly configurable components.
