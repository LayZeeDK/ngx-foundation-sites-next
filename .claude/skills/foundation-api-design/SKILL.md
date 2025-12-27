---
name: foundation-api-design
description: Creates Angular component API designs for Foundation for Sites components. Use when designing APIs for tabs, reveal, dropdown, menu, off-canvas, or other Foundation components. Generates comprehensive API design documents with inputs, outputs, ARIA requirements, and usage examples.
---

# Foundation Component API Design

Generate Angular component API designs for Foundation for Sites UI components.

## Workflow

### Step 1: Research the Foundation Component

1. **Fetch Foundation docs** for the component:

   ```
   https://get.foundation/sites/docs/{component}.html
   ```

2. **Extract CSS classes FIRST** (these determine Angular components/directives):
   - List ALL CSS classes (`.{component}`, `.{component}-item`, `.{component}-title`, etc.)
   - Note which classes represent **containers** vs **items** vs **content areas**
   - Identify state classes (`.is-active`, `.is-open`, `.disabled`)
   - **Each structural CSS class = potential Angular component/directive**

3. **Extract behavioral configuration:**
   - Data attributes (`data-*`) that control behavior → become **inputs**
   - Sass variables (`$component-*`) for styling → become **CSS custom properties**
   - JavaScript options and callbacks → become **inputs and outputs**
   - Events emitted → become **outputs**

### Step 2: Research Angular Equivalents

1. **Check COMPONENT_BUILDING_BLOCKS.md** for the recommended Angular building blocks:
   - `@angular/aria` components (preferred)
   - `@angular/cdk` modules
   - Custom implementation patterns

2. **Research Angular Material** equivalent (if exists):
   - Fetch `https://material.angular.dev/components/{equivalent}/api`
   - Extract API patterns: inputs, outputs, methods, directives

3. **Research WAI-ARIA pattern**:
   - Fetch `https://www.w3.org/WAI/ARIA/apg/patterns/{pattern}/`
   - Extract required ARIA attributes and keyboard navigation

### Step 3: Generate API Design Document

Create `{COMPONENT}_API_DESIGN.md` in `packages/ngx-foundation-sites/` with these sections:

```markdown
# Nfs{Component} API Design

## Goal

[One paragraph describing the component purpose and design constraints]

## Research Summary

### Foundation {Component} Features

| Feature | CSS/HTML | Notes |
| ------- | -------- | ----- |

[Table of Foundation CSS classes and their purpose]

### CSS Class → Angular Mapping

| Foundation CSS Class | Angular Component/Directive | Rationale |
| -------------------- | --------------------------- | --------- |

[One row per CSS class, showing the Angular equivalent]

### WAI-ARIA Requirements

| Element | ARIA Attributes |
| ------- | --------------- |

[Table of required ARIA attributes per element]

### Angular CDK/Material Pattern

[Comparison with Material equivalent if exists]

## Proposed Component API

### Component Hierarchy

[ASCII diagram of component structure]

### 1. Nfs{Component} (Container)

[Component definition with inputs, outputs, methods]

### 2. Nfs{Component}Item (if applicable)

[Child component definition]

[Additional components as needed]

## Usage Examples

[Code examples for common use cases]

## Rendered HTML Structure

[Expected DOM output]

## CSS Custom Properties

[Theming variables]

## Keyboard Navigation

[Keyboard interaction table]

## Comparison with Angular Material

[API comparison table]

## Implementation Notes

[DI token strategy, animation approach, etc.]

## Files to Create

[List of files to implement]

## Design Decisions

[Table of decisions and rationale]
```

## Naming Conventions

### CRITICAL: CSS Class-Driven Component Design

**Foundation CSS class names are the PRIMARY driver for determining:**

1. **How many** Angular components/directives to create
2. **What to name** each component/directive

**Design Rule**: Every significant Foundation CSS class that represents a distinct UI element should map to its own Angular component or directive.

### CSS Class → Component/Directive Mapping

**Create ONE Angular component/directive for EACH Foundation CSS class:**

| Foundation CSS Class | Angular Component/Directive | Type                           |
| -------------------- | --------------------------- | ------------------------------ |
| `.accordion`         | `NfsAccordion`              | Component (container)          |
| `.accordion-item`    | `NfsAccordionItem`          | Component                      |
| `.accordion-title`   | `NfsAccordionTitle`         | Directive (for custom content) |
| `.accordion-content` | `NfsAccordionContent`       | Directive (for lazy content)   |
| `.tabs`              | `NfsTabs`                   | Component (container)          |
| `.tabs-title`        | `NfsTabsTitle`              | Directive (for custom title)   |
| `.tabs-panel`        | `NfsTabsPanel`              | Component                      |
| `.tabs-content`      | Internal (wrapper element)  | N/A                            |
| `.reveal`            | `NfsReveal`                 | Component                      |
| `.menu`              | `NfsMenu`                   | Component                      |
| `.dropdown`          | `NfsDropdown`               | Component                      |
| `.off-canvas`        | `NfsOffCanvas`              | Component                      |

**Naming Pattern**: `Nfs` + PascalCase(CSS class name without dot)

- `.tabs-panel` → `NfsTabsPanel`
- `.accordion-title` → `NfsAccordionTitle`

### When to Create a Component vs Directive

| Scenario                                                   | Create                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| CSS class represents a **container** with structure        | **Component**                                           |
| CSS class represents an **item** rendered by the container | **Component** (if complex) or **Directive** (if simple) |
| CSS class is for **custom user content** within an item    | **Directive** on `ng-template`                          |
| CSS class is for **lazy-loaded content**                   | **Directive** on `ng-template`                          |
| CSS class is purely for **styling** (no behavior)          | Apply class directly, no directive needed               |

### Input Names

Match Foundation's naming:

- `data-multi-expand` → `multiExpand`
- `data-allow-all-closed` → `allowAllClosed`
- `data-deep-link` → `deepLink`
- Sass variables: `$accordion-plusminus` → `plusminus`

### Token Names

Use camelCase with `Token` suffix:

- `nfsAccordionToken`
- `nfsRevealToken`

## API Design Principles

### From Angular Material

- Two-way binding with `[(expanded)]` pattern
- Separate events for state change vs. animation completion
- Container-level configuration inherited by items
- Lazy content via `ng-template[nfs{Component}Content]`
- Methods: `open()`, `close()`, `toggle()` on items
- Methods: `openAll()`, `closeAll()` on containers

### From WAI-ARIA

- Required attributes: `aria-expanded`, `aria-controls`, `aria-labelledby`
- Hidden content: prefer `inert` over `aria-hidden`
- Disabled: use `aria-disabled` (keep focusable) for `softDisabled` pattern
- Keyboard: Enter/Space to activate, Arrow keys for navigation

### From Foundation

- Apply Foundation CSS classes directly (no custom styling unless necessary)
- Use Foundation state classes (`.is-active`, `.is-open`)
- Support Foundation data attributes as inputs
- Support Foundation Sass variables via CSS custom properties

## Modern Angular APIs

Use these patterns in all designs:

- `input()` / `output()` / `model()` functions (not decorators)
- `signal()` / `computed()` for state
- `@if` / `@for` / `@switch` control flow
- `@defer` for lazy content
- `inject()` for dependency injection
- `ChangeDetectionStrategy.OnPush`

## Content Projection Strategy

For components with projected content, use this DI pattern:

```typescript
// Token file
export const nfs{Component}Token = new InjectionToken<Nfs{Component}>('nfs{Component}Token');

// Parent component
@Component({
  providers: [{ provide: nfs{Component}Token, useExisting: Nfs{Component} }],
})
export class Nfs{Component} { }

// Child component (content-projected)
export class Nfs{Component}Item {
  readonly parent = inject(nfs{Component}Token, { optional: true, skipSelf: true });
}
```

## Reference Documents

When generating designs, reference:

- `COMPONENT_BUILDING_BLOCKS.md` - Angular building block recommendations
- `ACCORDION_API_DESIGN.md` - Example API design document
- `AGENTS.md` - Project coding standards and conventions
