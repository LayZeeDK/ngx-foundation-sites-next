# Grok Implementation Context: Accessible Accordion Component

**Purpose**: Provide minimal, focused context for Grok Code Fast 1 task execution

**Key Grok Optimizations**:

- Use native tool-calling (not XML)
- Short prompts, rapid iteration
- Explicit file paths and scope
- Let model run iterative cycles

---

## Project Structure (Focused)

**Only files relevant to Grok-suitable tasks:**

```
packages/ngx-foundation-sites/
├── src/
│   ├── lib/
│   │   └── accordion/
│   │       ├── accordion.component.ts      # Main container
│   │       ├── accordion-item.component.ts # Individual items
│   │       ├── accordion-title.component.ts # Title/trigger
│   │       ├── accordion-content.directive.ts # Lazy content
│   │       ├── accordion.token.ts          # DI token
│   │       ├── accordion-id-generator.service.ts
│   │       ├── accordion.stories.ts        # Storybook stories (colocated)
│   │       ├── validators.ts               # Input validation
│   │       ├── _accordion-imports.scss     # Foundation SCSS
│   │       ├── index.ts                    # Public API exports
│   │       └── README.md                   # Component docs
│   └── index.ts                            # Library barrel
└── ng-package.json                         # ng-packagr config

packages/ngx-foundation-sites-e2e/
└── src/
    └── accordion/
        └── accordion-deeplink.spec.ts      # E2E tests

specs/002-accordion-component/
├── spec.md                                 # Feature specification
├── plan.md                                 # Implementation plan
├── tasks.md                                # Task list
├── quickstart.md                           # Usage examples
└── contracts/
    ├── accordion-api.ts                    # TypeScript interfaces
    └── accordion-aria.md                   # ARIA requirements
```

---

## Existing Implementation Reference

The accordion is **partially implemented** using a template-directive architecture with `@angular/aria` primitives.

### Current File: accordion.ts (Key Patterns)

```typescript
// Imports pattern
import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { AccordionGroup } from '@angular/aria';

// Component decorator pattern
@Component({
  selector: 'nfs-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'accordion',
  },
  template: `...`,
})
export class NfsAccordion {
  // Signal inputs (use this pattern)
  readonly multiExpandable = input(false); // TODO: Rename to multiExpand
  readonly allowAllClosed = input(false);
  readonly disabled = input(false);
  readonly wrap = input(false); // Already implemented
  readonly deepLink = input(false);
  readonly announce = input(false); // TODO: Add if missing

  // Model signals
  readonly #openItemIds = signal<string[]>([]);

  // Computed signals
  readonly openItems = computed(() => this.#openItemIds());
}
```

### Current File: accordion-item-def.ts (Key Patterns)

```typescript
// Item definition directive
@Directive({
  selector: 'ng-template[nfsAccordionItem]',
})
export class NfsAccordionItemDef {
  readonly panelId = input<string>();
  readonly expanded = model(false);
  readonly disabled = input(false);

  // TODO: Add these methods (P0 gap)
  down(): void {
    if (!this.#isDisabled()) {
      this.expanded.set(true);
    }
  }

  up(): void {
    if (!this.#isDisabled() && this.#canClose()) {
      this.expanded.set(false);
    }
  }

  toggle(): void {
    if (this.expanded()) {
      this.up();
    } else {
      this.down();
    }
  }
}
```

---

## Agentic Patterns (Concise)

### Pattern: Verification Task

```
1. Read target file/directory
2. Check for expected content/structure
3. Report findings
4. No changes needed
```

### Pattern: Add Input Signal

```typescript
// Step 1: Add to component class
readonly inputName = input(defaultValue);

// Step 2: Add JSDoc
/**
 * Description of input
 * @default defaultValue
 * Foundation equivalent: data-input-name
 */
readonly inputName = input(defaultValue);
```

### Pattern: Add Method

```typescript
/**
 * Brief description
 * Foundation equivalent: .methodName($target)
 * @public
 */
methodName(): ReturnType {
  // Check preconditions
  if (this.disabled()) return;

  // Implementation
  this.signal.set(newValue);
}
```

### Pattern: Add Output

```typescript
// Use output() function, not @Output decorator
readonly eventName = output<EventType>();

// Emit in handler
this.eventName.emit({ itemId, expanded });
```

### Pattern: Add Storybook Story

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { within, userEvent, expect } from '@storybook/test';

const meta: Meta<NfsAccordion> = {
  title: 'Components/Accordion/StoryName',
  component: NfsAccordion,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<NfsAccordion>;

export const Default: Story = {
  render: () => ({
    template: `
      <nfs-accordion>
        <ng-template nfsAccordionItem>...</ng-template>
      </nfs-accordion>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Get element
    const button = canvas.getByRole('button', { name: /Item 1/ });

    // Interact
    await userEvent.click(button);

    // Assert
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  },
};
```

### Pattern: Add Play Function Test

```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Find elements by role (preferred)
  const trigger = canvas.getByRole('button', { name: /Section 1/ });
  const panel = canvas.getByRole('region', { name: /Section 1/ });

  // Keyboard events
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');

  // Click events
  await userEvent.click(trigger);

  // Assertions
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
},
```

### Pattern: ARIA Binding

```typescript
// In component host object
host: {
  '[attr.aria-expanded]': 'expanded()',
  '[attr.aria-controls]': 'panelId()',
  '[attr.aria-labelledby]': 'titleId()',
  '[attr.aria-disabled]': 'disabled() || null',  // null removes attribute
}
```

### Pattern: CSS Class Binding

```typescript
host: {
  'class': 'accordion-item',           // Static class
  '[class.is-active]': 'expanded()',   // Conditional class
  '[class.is-disabled]': 'disabled()', // Conditional class
}
```

---

## File Path Reference (Exact)

**All file paths from Grok-suitable tasks:**

### Component Implementation

- `packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-title.component.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-content.directive.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion.token.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/accordion-id-generator.service.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/validators.ts`
- `packages/ngx-foundation-sites/src/lib/accordion/index.ts`

### Styles

- `packages/ngx-foundation-sites/src/lib/accordion/_accordion-imports.scss`

### Stories (Colocated with Component)

- `packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts`

### E2E Tests

- `packages/ngx-foundation-sites-e2e/src/accordion/accordion-deeplink.spec.ts`

### Documentation

- `packages/ngx-foundation-sites/src/lib/accordion/README.md`
- `specs/002-accordion-component/quickstart.md`

### Config

- `packages/ngx-foundation-sites/ng-package.json`
- `packages/ngx-foundation-sites/project.json`

---

## Success Criteria (Per Task Type)

### Verification Task

- [ ] Target file/directory exists
- [ ] Expected content/structure present
- [ ] No changes made (verification only)

### Add Input Signal

- [ ] Signal added with correct type and default
- [ ] JSDoc comment with Foundation equivalent
- [ ] TypeScript compilation succeeds
- [ ] Exported from public API if needed

### Add Method

- [ ] Method added with correct signature
- [ ] JSDoc comment with Foundation equivalent
- [ ] Precondition checks (disabled, canClose)
- [ ] TypeScript compilation succeeds

### Add Output

- [ ] Output added with OutputEmitterRef
- [ ] Event type interface defined
- [ ] Emit call in appropriate handler
- [ ] TypeScript compilation succeeds

### Add Storybook Story

- [ ] Story file created with correct path
- [ ] Meta and default export defined
- [ ] At least one story exported
- [ ] Play function with assertions
- [ ] Story renders without errors

### Add Play Function

- [ ] Uses canvas.getByRole() for element selection
- [ ] Uses userEvent for interactions
- [ ] Uses expect() for assertions
- [ ] Tests pass in Storybook

### Rename/Update

- [ ] All occurrences found via grep
- [ ] All occurrences updated
- [ ] TypeScript compilation succeeds
- [ ] Tests still pass

---

## Constraints (Explicit)

- **NO** architectural changes beyond task scope
- **NO** multi-file refactoring unless explicitly in task
- **FOLLOW** existing patterns exactly (see patterns above)
- **PRESERVE** code style and formatting
- **VERIFY** TypeScript compilation after each change
- **ITERATE** quickly - use Grok's speed advantage
- **USE** `input()` function, not `@Input()` decorator
- **USE** `output()` function, not `@Output()` decorator
- **USE** signals for state, not class properties
- **USE** `ChangeDetectionStrategy.OnPush` always
- **DO NOT** use NgModules - standalone only

---

## Foundation CSS Classes Reference

**Required classes per FR-029 to FR-035:**

| Element        | CSS Class            | Applied To             |
| -------------- | -------------------- | ---------------------- |
| Container      | `.accordion`         | `<nfs-accordion>` host |
| Item wrapper   | `.accordion-item`    | Item container         |
| Title button   | `.accordion-title`   | `<button>` in title    |
| Content panel  | `.accordion-content` | Panel wrapper          |
| Expanded state | `.is-active`         | Item when expanded     |
| Disabled state | `.is-disabled`       | Item when disabled     |

---

## ARIA Attributes Reference

**Required per accordion-aria.md:**

| Element       | Attribute         | Value                             |
| ------------- | ----------------- | --------------------------------- |
| Title button  | `role`            | `button` (implicit on `<button>`) |
| Title button  | `aria-expanded`   | `true` / `false`                  |
| Title button  | `aria-controls`   | Panel ID                          |
| Title button  | `aria-disabled`   | `true` (when disabled)            |
| Content panel | `role`            | `region`                          |
| Content panel | `aria-labelledby` | Title button ID                   |
| Content panel | `inert`           | Present when collapsed            |

---

## Commands Reference

**Build and verify:**

```bash
npx nx build ngx-foundation-sites
npx nx lint ngx-foundation-sites
npx nx test ngx-foundation-sites
```

**Run Storybook:**

```bash
npx nx storybook ngx-foundation-sites
# Access at http://localhost:4400
```

**Run E2E tests:**

```bash
npx nx e2e ngx-foundation-sites-e2e
```

**Format code:**

```bash
npm run format
```

---

## Quick Prompts for Grok

**Add method:**

> Add `down()` method to NfsAccordionItemDef in `packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts` that sets `expanded` to `true` if not disabled. Add JSDoc documenting it as Foundation equivalent of `.down($target)`.

**Add input:**

> Add `announce = input(false)` to NfsAccordion in `packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts`. Add JSDoc documenting it controls live region announcements.

**Add story:**

> Add a `MultiExpand` story export to `packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts`. Add play function that expands two items and verifies both remain open.

**Rename:**

> Rename `multiExpandable` to `multiExpand` in all files under `packages/ngx-foundation-sites/`. This is a breaking change per FR-014.
