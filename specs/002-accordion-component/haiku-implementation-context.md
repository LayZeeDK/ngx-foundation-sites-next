# Haiku Implementation Context: Accordion Component (Phases 5-6)

**Purpose**: Provide minimal, focused context for Claude Haiku 4.5 task execution

---

## Project Structure (Focused on Phases 5-6)

**Relevant files only:**

```
packages/ngx-foundation-sites/src/lib/accordion/
├── accordion.ts                         # Main container component
├── accordion.html                       # Template with ARIA structure
├── accordion-item-def.ts                # Item directive
├── accordion-header-def.ts              # Header directive
├── accordion-content.ts                 # Content directive (lazy)
├── accordion-id-generator.service.ts    # ID generation service (exists!)
├── accordion.stories.ts                 # Storybook tests
├── accordion-item.component.spec.ts     # Unit tests (for new tests)
└── index.ts                             # Public API exports
```

---

## Code Patterns (Concise)

### Pattern: Add Storybook Play Function Test

**Template**:

```typescript
export const StoryName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /pattern/i });

    // Perform interaction
    await userEvent.click(button);

    // Assert expected outcome
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  },
};
```

**Example from existing code**: accordion.stories.ts:150-180 (Default story play function)

### Pattern: Add Service (ID Generator)

**Template**:

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'platform' })
export class ServiceName {
  #counter = 0;

  generateId(prefix: string): string {
    return `${prefix}-${this.#counter++}`;
  }
}
```

**Example from existing code**: accordion-id-generator.service.ts (ALREADY EXISTS - modify, don't recreate!)

### Pattern: Add Attribute Binding

**Template**:

```html
<div [attr.attribute-name]="condition() ? 'value' : null">
  <!-- content -->
</div>
```

**Example from existing code**: accordion.html:18 `[class.is-active]="item.expanded()"`

### Pattern: Add @if Control Flow

**Template**:

```html
@if (condition()) {
  <!-- rendered when true -->
}
```

**Example from existing code**: accordion.html uses @for loops

### Pattern: Add Unit Test

**Template**:

```typescript
import { TestBed } from '@angular/core/testing';
import { ComponentUnderTest } from './component';

describe('ComponentUnderTest', () => {
  it('should do something', () => {
    // Arrange
    const fixture = TestBed.createComponent(ComponentUnderTest);

    // Act
    fixture.componentInstance.method();

    // Assert
    expect(fixture.componentInstance.property).toBe(expectedValue);
  });
});
```

**Example from existing code**: accordion-id-generator.service.spec.ts

### Pattern: Add Helper Method

**Template**:

```typescript
/**
 * Brief description of what method does.
 * @param paramName - Description
 * @returns Description
 */
protected methodName(paramName: Type): ReturnType {
  return computation;
}
```

**Example from existing code**: accordion.ts has many helper methods

### Pattern: Add Guard Clause

**Template**:

```typescript
method(): void {
  if (shouldSkip()) {
    return; // Early exit
  }

  // Main logic
}
```

**Example from existing code**: accordion-item-def.ts:70-75 (toggle method checks disabled)

---

## File Path Reference (Exact)

**All file paths from Haiku-suitable tasks:**

- packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts
- packages/ngx-foundation-sites/src/lib/accordion/accordion-id-generator.service.ts
- packages/ngx-foundation-sites/src/lib/accordion/accordion.ts
- packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts
- packages/ngx-foundation-sites/src/lib/accordion/accordion.html
- packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.spec.ts

---

## Key Implementation Details

### Existing Architecture

**Template-Directive Composition**: This accordion uses `ng-template[nfsAccordionItem]` directives, NOT component wrappers. The `@angular/aria` primitives (AccordionGroup, AccordionTrigger, AccordionPanel) handle ARIA automatically.

**Signal-Based State**: All state uses Angular signals (input(), output(), signal(), computed()). No RxJS observables in primary implementation.

**ID Generation Service**: `NfsAccordionIdGeneratorService` **already exists** at accordion-id-generator.service.ts. Check it first before implementing T057b!

### ARIA Structure (From accordion.html)

```html
<div class="accordion" cdkAccordionGroup [multiExpand]="multiExpand()">
  @for (item of items(); track item.panelId()) {
    <div class="accordion-item" [class.is-active]="item.expanded()">
      <button cdkAccordionTrigger [disabled]="disabled() || item.disabled()">
        <!-- Title content -->
      </button>
      <div class="accordion-content" cdkAccordionPanel>
        <!-- Panel content -->
      </div>
    </div>
  }
</div>
```

### Live Region (T196-T199)

**Current Status**: `announce` input signal EXISTS (accordion.ts:133), live region element EXISTS (accordion.html).

**What's Missing**: Message publishing logic (T198, T188)

### Error Handling Pattern

```typescript
this.#errorHandler.handleError(
  new Error('[NfsAccordion] Diagnostic message with context', {
    cause: originalError // optional
  })
);
```

**Example**: See FR-017a requirements for duplicate panelId error format

---

## Success Criteria (Per Task Type)

**Add Storybook Test**:

- [ ] Test added to accordion.stories.ts
- [ ] Uses `play` function with `async ({ canvasElement })`
- [ ] Includes `await userEvent.*` interactions
- [ ] Includes `await expect()` assertions
- [ ] Test passes when run via `nx test-storybook`

**Add Service**:

- [ ] Service file created/modified
- [ ] `@Injectable({ providedIn: 'platform' })` decorator
- [ ] JSDoc comments for public methods
- [ ] TypeScript compilation succeeds
- [ ] Service NOT exported from index.ts (internal only)

**Add Attribute Binding**:

- [ ] Binding added to template
- [ ] Uses computed signal or input signal
- [ ] Matches Foundation CSS conventions
- [ ] Visual inspection in Storybook confirms behavior

**Add @if Control Flow**:

- [ ] @if block added to template
- [ ] Condition uses signal
- [ ] Content renders/hides correctly
- [ ] ARIA attributes remain stable

**Add Unit Test**:

- [ ] Test added to .spec.ts file
- [ ] Uses TestBed for component/service setup
- [ ] Mocks ErrorHandler if needed
- [ ] Test passes when run via `npm run test`

**Add Helper Method**:

- [ ] Method added to class
- [ ] JSDoc comment with @param and @returns
- [ ] Visibility appropriate (protected for template, # for private)
- [ ] TypeScript compilation succeeds

**Update Logic**:

- [ ] Logic added/modified in existing method
- [ ] Maintains existing behavior when input is false
- [ ] TypeScript compilation succeeds
- [ ] All existing tests still pass

---

## Constraints (Explicit)

- **NO** architectural changes beyond task scope
- **NO** multi-file refactoring beyond explicit task description
- **FOLLOW** existing patterns exactly (signal-based, template-directive, @angular/aria)
- **PRESERVE** code style (# for private, protected for template-accessible, ESLint rules)
- **VERIFY** TypeScript compilation after each change (`npm run build`)
- **CHECK** accordion-id-generator.service.ts EXISTS before implementing T057b
- **DO NOT** export NfsAccordionIdGeneratorService from index.ts (internal implementation detail)

---

## Relevant Signals and Inputs (Quick Reference)

**NfsAccordion (accordion.ts)**:

- `multiExpand = input(false)` - line 95
- `disabled = input(false)` - line 98
- `softDisabled = input(true)` - line 105
- `wrap = input(false)` - line 108
- `deepLink = input(false)` - line 111
- `allowAllClosed = input(false)` - line 126
- `announce = input(false)` - line 133 ✅ EXISTS
- `titleHeadingLevel = input<1|2|3|4|5|6|null>(null)` - line 141
- `down = output<NfsAccordionPanelEvent>()` - line 147 ✅ EXISTS
- `up = output<NfsAccordionPanelEvent>()` - line 150 (probably exists)

**NfsAccordionItemDef (accordion-item-def.ts)**:

- `panelId = input.required<string>()` - line ~40
- `expanded = model(false)` - line ~43
- `disabled = input(false)` - line ~46

---

## Testing Commands

**Build (TypeScript compilation)**:

```bash
npm run build
```

**Run Storybook tests**:

```bash
nx test-storybook ngx-foundation-sites
```

**Run unit tests**:

```bash
npm run test
```

**Lint check**:

```bash
npm run lint
```

**Start Storybook (for manual verification)**:

```bash
npx nx storybook ngx-foundation-sites
```

---

## Critical Notes for Haiku

1. **Check Before Creating**: accordion-id-generator.service.ts **ALREADY EXISTS** - modify it, don't recreate!

2. **Use Existing ARIA**: @angular/aria directives (cdkAccordionTrigger, cdkAccordionPanel) handle ARIA automatically. Don't duplicate aria-controls, aria-expanded unless explicitly needed for custom cases.

3. **Signal Reactivity**: Use `effect()` for side effects (event emission, DOM updates), `computed()` for derived state. No manual subscriptions.

4. **Template Directives**: This uses `ng-template[nfsAccordionItem]`, not `<nfs-accordion-item>` components. Check existing templates before assuming structure.

5. **Error Format**: Follow FR-017a format: `[NfsAccordion] Duplicate panelId 'foo' detected...` - see spec.md for exact wording.

6. **Live Region**: Elements exist (accordion.html has live region wrapper), only message publishing logic is missing.

7. **TypeScript Strict Mode**: This project uses strict TypeScript. All types must be explicit, no implicit any.
