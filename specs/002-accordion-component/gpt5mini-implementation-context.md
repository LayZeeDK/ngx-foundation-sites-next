# GPT-5 Mini Implementation Context

**Generated**: 2026-01-22  
**Purpose**: Focused context and CTCO templates for GPT-5 Mini task execution  
**Source**: specs/002-accordion-component/

---

## Feature Overview

**Component**: Accessible Accordion Component for ngx-foundation-sites  
**Architecture**: Template-directive composition with @angular/aria primitives  
**Key Files**: packages/ngx-foundation-sites/src/lib/accordion/

**Implemented Components**:

- `<nfs-accordion>` - Container component
- `ng-template[nfsAccordionItem]` - Item directive
- `ng-template[nfsAccordionHeader]` - Header directive
- `ng-template[nfsAccordionContent]` - Lazy content directive

**Known Gaps** (see GAPS_REMEDIATION.md):

- P0: Input naming (`multiExpandable` → should be `multiExpand`)
- P0: Foundation API methods missing (`down()`, `up()`, `toggle()`)
- P0: Foundation API outputs missing (`(down)`, `(up)` events)
- P1: `titleHeadingLevel` input not implemented
- P1: ErrorHandler diagnostics incomplete

---

## CTCO Templates by Pattern

### Pattern: Add Method

**Template Structure**:

```
Context: [Component/service context and purpose]
Task: [Specific method to add with signature]
Code:
  File: [exact file path]
  Method signature: [TypeScript signature]
  Implementation: [explicit logic or algorithm]
Output: [Expected result/verification]
```

**Example 1: Simple Helper Method**

```
Context: Add helper method for extracting text from accordion title components
Task: Implement extractTitleText() method in NfsAccordion
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
  Method signature: extractTitleText(titleComponent: NfsAccordionTitle): string
  Implementation: return titleComponent.elementRef.nativeElement.textContent.trim()
Output: Method added to component class, returns trimmed text content
```

**Example 2: Input Signal Addition**

```
Context: Add input property to NfsAccordion for ARIA live region control
Task: Add announce input signal to component
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
  Input: announce = input(false)
  Type: InputSignal<boolean>
  Location: Add to component class inputs section
Output: Input property accessible via component.announce()
```

**Example 3: Foundation API Method**

```
Context: Implement Foundation JS API equivalent method for expanding accordion items
Task: Add down() method to NfsAccordionItem
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts
  Method signature: down(): void
  Implementation:
    if (!this.disabled()) {
      this.expanded.set(true);
      this.parent?.notifyItemToggle(this.panelId(), true);
    }
Output: Method callable via item.down(), emits (down) event on parent
```

**Example 4: Output Emitter**

```
Context: Add Foundation JS event equivalent for item expansion
Task: Add down output to NfsAccordion
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
  Output: down = output<AccordionItemChangeEvent>()
  Type: OutputEmitterRef<AccordionItemChangeEvent>
  Interface: { panelId: string; expanded: boolean }
Output: Output emitter declared, can emit events via this.down.emit(...)
```

---

### Pattern: Add Test

**Template Structure**:

```
Context: [Test purpose and component being tested]
Task: [Specific test scenario or assertion]
Code:
  File: [test file path]
  Test type: [Storybook play function | Unit test | E2E test]
  Scenario: [Given/When/Then format]
  Assertions: [Specific checks to perform]
Output: [Test passes when...]
```

**Example 1: Storybook Play Function**

```
Context: Test basic accordion expansion behavior
Task: Add play function to verify item expansion on click
Code:
  File: packages/ngx-foundation-sites/.storybook/stories/accordion/Basic.story.ts
  Test type: Storybook play function
  Scenario:
    Given: Accordion with 3 items (all collapsed)
    When: User clicks title of item 2
    Then: Item 2's panel expands, aria-expanded="true"
  Assertions:
    - await userEvent.click(canvas.getByRole('button', { name: /item 2/i }))
    - await expect(canvas.getByRole('region', { name: /item 2/i })).toBeVisible()
    - await expect(canvas.getByRole('button', { name: /item 2/i })).toHaveAttribute('aria-expanded', 'true')
Output: Test passes when all assertions succeed
```

**Example 2: Unit Test for Logic**

```
Context: Test panelId runtime change behavior per FR-017b
Task: Add unit test for FR-017b panelId runtime changes
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.spec.ts
  Test type: Vitest unit test
  Scenario:
    Given: Accordion item with panelId="panel-1"
    When: panelId input changed to "panel-2"
    Then: Item re-registers with parent, ARIA attributes update atomically
  Assertions:
    - Verify parent.unregisterItem() called with old ID
    - Verify parent.registerItem() called with new ID
    - Verify aria-labelledby and aria-controls update
    - Verify expansion state unchanged
Output: Test passes when re-registration and ARIA updates complete
```

---

### Pattern: Conditional Logic

**Template Structure**:

```
Context: [Component logic context]
Task: [Condition to implement or verify]
Code:
  File: [file path]
  Condition: [Boolean logic or state check]
  Implementation: [If/else logic or validation]
  Edge cases: [Boundary conditions to handle]
Output: [Expected behavior for each case]
```

**Example 1: Verification Task**

```
Context: Verify Angular component selector prefix configuration
Task: Check that project.json contains selectorPrefix: "nfs-"
Code:
  File: packages/ngx-foundation-sites/project.json
  Condition: JSON contains "selectorPrefix": "nfs-"
  Implementation: Read file, parse JSON, check property value
Output: Pass if selectorPrefix === "nfs-", fail otherwise with diagnostic
```

**Example 2: Additive Logic**

```
Context: Implement additive disabled logic for accordion items
Task: Item disabled if either accordion.disabled OR item.disabled is true
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts
  Condition: this.disabled() || this.parent?.disabled()
  Implementation:
    protected readonly isDisabled = computed(() =>
      this.disabled() || (this.parent?.disabled() ?? false)
    );
  Edge cases: Parent is undefined (standalone item)
Output: Computed signal returns true if either condition true
```

**Example 3: Guard Method**

```
Context: Prevent invalid operations on disabled items
Task: Implement tryAction() guard method wrapper
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts
  Method signature: protected tryAction(action: () => void, actionName: string): void
  Implementation:
    if (this.isDisabled()) {
      this.errorHandler.handleError(
        new Error(`Cannot ${actionName} on disabled item ${this.panelId()}`)
      );
      return;
    }
    action();
Output: Action executes only if not disabled, else ErrorHandler called
```

**Example 4: Empty State Handling**

```
Context: Implement empty-state handling in NfsAccordionItem
Task: Render invisible placeholder when no content projected
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts
  Template location: Panel content section
  Implementation:
    @if (hasContent()) {
      <ng-content select="[nfsAccordionContent]" />
    } @else {
      <!-- Empty state: consumer's responsibility -->
    }
  Edge cases: ng-content with whitespace only
Output: Stable ARIA structure maintained even when empty
```

---

### Pattern: Update Docs

**Template Structure**:

```
Context: [Documentation context]
Task: [Specific documentation update]
Code:
  File: [markdown file path]
  Section: [Which section to update]
  Content: [What to add/change]
Output: [Documentation state after update]
```

**Example 1: JSDoc Comments**

````
Context: Document Foundation for Sites API equivalents
Task: Add JSDoc to down() method documenting Foundation JS equivalent
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion-item.component.ts
  Method: down()
  JSDoc:
    /**
     * Expands this accordion item.
     *
     * Foundation JS equivalent: `$('#accordion').foundation('down', $target)`
     *
     * @remarks
     * This method is a no-op if the item is disabled.
     * Emits the `(down)` event on the parent accordion when successful.
     *
     * @example
     * ```typescript
     * @ViewChild(NfsAccordionItem) item!: NfsAccordionItem;
     * this.item.down(); // Expands the item
     * ```
     */
Output: JSDoc added above method declaration
````

---

### Pattern: Refactor

**Template Structure**:

```
Context: [Code context and refactoring goal]
Task: [What to extract/reorganize]
Code:
  File: [file path]
  Current: [Existing implementation]
  Refactored: [New structure]
  Benefits: [Why refactor]
Output: [Code state after refactoring]
```

**Example 1: Extract Helper Method**

```
Context: Extract title text extraction logic for reuse
Task: Extract repeated pattern into helper method
Code:
  File: packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
  Current: Inline elementRef.nativeElement.textContent.trim() calls
  Refactored:
    private extractTitleText(title: NfsAccordionTitle): string {
      return title.elementRef.nativeElement.textContent.trim();
    }
  Benefits: DRY principle, testable, consistent behavior
Output: Helper method created, call sites updated
```

---

## File Structure Reference

### Core Component Files

```
packages/ngx-foundation-sites/src/lib/accordion/
├── accordion.component.ts          # Container component
├── accordion.component.html        # Container template
├── accordion.component.scss        # Container styles
├── accordion-item.component.ts     # Item directive (was component)
├── accordion-title.component.ts    # Title component
├── accordion-content.directive.ts  # Lazy content directive
├── accordion.token.ts              # DI token (nfsAccordionToken)
├── accordion-id-generator.service.ts  # ID generation (internal)
├── accordion.types.ts              # Shared types/interfaces
├── index.ts                        # Public API barrel
└── README.md                       # Component documentation
```

### Test Files

```
packages/ngx-foundation-sites/
├── .storybook/stories/accordion/
│   ├── Basic.story.ts
│   ├── KeyboardNavigation.story.ts
│   ├── ScreenReader.story.ts
│   ├── MultiExpand.story.ts
│   ├── AllowAllClosed.story.ts
│   ├── DisabledItems.story.ts
│   ├── DynamicContent.story.ts
│   ├── DeepLinking.story.ts
│   ├── LazyContent.story.ts
│   ├── FoundationApiParity.story.ts
│   ├── EdgeCases.story.ts
│   └── Accordion.mdx
└── src/lib/accordion/
    ├── accordion.component.spec.ts
    └── accordion-item.component.spec.ts
```

### E2E Test Files

```
packages/ngx-foundation-sites-e2e/src/accordion/
└── accordion-deeplink.spec.ts
```

---

## Code Patterns and Examples

### Angular Modern APIs (Required)

**Standalone Component**:

```typescript
@Component({
  selector: 'nfs-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: {
    class: 'accordion',
    '[attr.role]': '"list"',
  },
})
export class NfsAccordionComponent {}
```

**Signal Inputs**:

```typescript
readonly announce = input(false);  // InputSignal<boolean>
readonly multiExpand = input(false);  // InputSignal<boolean>
readonly disabled = input(false);  // InputSignal<boolean>
readonly panelId = input<string>();  // InputSignal<string | undefined>
```

**Model Signals** (two-way binding):

```typescript
readonly expanded = model(false);  // ModelSignal<boolean>
```

**Output Emitters**:

```typescript
readonly down = output<AccordionItemChangeEvent>();
readonly up = output<AccordionItemChangeEvent>();
```

**Computed Signals**:

```typescript
protected readonly isDisabled = computed(() =>
  this.disabled() || (this.parent?.disabled() ?? false)
);
```

### DI Patterns

**Injection Token** (CDK-style):

```typescript
// accordion.token.ts
export const NfsAccordionToken = new InjectionToken<NfsAccordionComponent>('NfsAccordion');

// In container component
@Component({
  providers: [{ provide: NfsAccordionToken, useExisting: NfsAccordionComponent }]
})
export class NfsAccordionComponent { }

// In child directive/component
protected readonly parent = inject(NfsAccordionToken, { optional: true, skipSelf: true });
```

**Service Injection**:

```typescript
// Internal service (not exported)
@Injectable({ providedIn: 'platform' })
export class NfsAccordionIdGeneratorService {
  #counter = 0;
  generateId(): string {
    return `nfs-accordion-${this.#counter++}`;
  }
}

// In component
readonly #idGenerator = inject(NfsAccordionIdGeneratorService);
```

### ARIA Patterns

**Title Button**:

```html
<button class="accordion-title" type="button" [attr.aria-expanded]="expanded()" [attr.aria-controls]="panelId()" [attr.id]="titleId()" [disabled]="softDisabled() ? null : isDisabled()" [attr.aria-disabled]="softDisabled() && isDisabled() ? 'true' : null" (click)="toggle()">
  <ng-content />
</button>
```

**Panel Wrapper**:

```html
<div class="accordion-content" [class.is-active]="expanded()" role="region" [attr.id]="panelId()" [attr.aria-labelledby]="titleId()" [inert]="!expanded()">
  @if (expanded() || hasBeenExpanded()) {
  <ng-content select="[nfsAccordionContent]" />
  }
</div>
```

### SSR Safety

**Browser-Only Code**:

```typescript
readonly #platformId = inject(PLATFORM_ID);

ngOnInit() {
  if (isPlatformBrowser(this.#platformId)) {
    afterNextRender(() => {
      try {
        // Browser-specific code (deep linking, focus)
        this.initializeDeepLinking();
      } catch (error) {
        this.#errorHandler.handleError(error);
      }
    });
  }
}
```

---

## Success Criteria Checklists

### For Input/Output Additions

- [ ] Property declared with correct type (input() or output())
- [ ] Default value matches specification
- [ ] JSDoc comment added with description
- [ ] Type is exported from types file (if custom interface)
- [ ] Storybook story includes control for new input
- [ ] README.md updated with new property

### For Method Additions

- [ ] Method signature matches specification
- [ ] JSDoc comment includes @remarks and @example
- [ ] Foundation JS equivalent documented (if applicable)
- [ ] Precondition checks implemented (disabled, etc.)
- [ ] ErrorHandler called on invalid operations
- [ ] Output events emitted when appropriate
- [ ] Method is public if part of API, protected/private otherwise

### For ARIA Implementation

- [ ] Attribute is on correct element
- [ ] Computed from correct signal/state
- [ ] ID references are stable and unique
- [ ] Screen reader tested (or AXE check passes)
- [ ] Works correctly when item disabled/hidden
- [ ] Panel wrapper persists in DOM (for stable aria-controls)

### For Test Addition

- [ ] Test file exists at correct path
- [ ] Test describes specific scenario (Given/When/Then)
- [ ] All assertions are explicit and measurable
- [ ] Test passes when run in isolation
- [ ] Test passes when run with full suite
- [ ] Storybook tests use @storybook/test utilities
- [ ] Unit tests use Vitest syntax

---

## Common Pitfalls to Avoid

### ❌ Don't: Use decorators for inputs/outputs

```typescript
@Input() multiExpand = false;  // OLD STYLE
@Output() down = new EventEmitter();  // OLD STYLE
```

### ✅ Do: Use input() and output() functions

```typescript
readonly multiExpand = input(false);  // MODERN
readonly down = output<AccordionItemChangeEvent>();  // MODERN
```

### ❌ Don't: Access signals as properties

```typescript
if (this.disabled) {
} // WRONG - signals are functions
```

### ✅ Do: Call signals as functions

```typescript
if (this.disabled()) {
} // CORRECT
```

### ❌ Don't: Use *ngIf / *ngFor

```html
<div *ngIf="expanded">Content</div>
<!-- OLD SYNTAX -->
```

### ✅ Do: Use @if / @for

```html
@if (expanded()) {
<div>Content</div>
}
<!-- MODERN -->
```

### ❌ Don't: Export internal services from public API

```typescript
// index.ts
export { NfsAccordionIdGeneratorService }; // WRONG - internal detail
```

### ✅ Do: Export only consumer-facing components

```typescript
// index.ts
export { NfsAccordionComponent, NfsAccordionItemDirective }; // CORRECT
```

### ❌ Don't: Access DOM directly without SSR check

```typescript
const hash = window.location.hash; // BREAKS SSR
```

### ✅ Do: Guard with isPlatformBrowser()

```typescript
if (isPlatformBrowser(this.#platformId)) {
  const hash = window.location.hash; // SAFE
}
```

---

## Error Handling Patterns

**Structured Error Reporting**:

```typescript
try {
  // Risky operation
  this.performAction();
} catch (error) {
  this.#errorHandler.handleError(new Error(`Action failed: ${error.message}`, { cause: error }));
}
```

**Validation Errors**:

```typescript
if (this.panelId() === '') {
  this.#errorHandler.handleError(new Error(`panelId cannot be empty string on ${this.constructor.name}`));
}
```

**Precondition Failures**:

```typescript
protected tryAction(action: () => void, actionName: string): void {
  if (this.isDisabled()) {
    this.#errorHandler.handleError(
      new Error(`Cannot ${actionName} on disabled item ${this.panelId()}`)
    );
    return;
  }
  action();
}
```

---

## Estimation Guidelines

| Pattern               | Complexity | Time Estimate |
| --------------------- | ---------- | ------------- |
| Add Input Signal      | Simple     | 2-3 min       |
| Add Output Emitter    | Simple     | 3-5 min       |
| Add Simple Method     | Simple     | 5-10 min      |
| Add Logic Method      | Medium     | 10-20 min     |
| Add ARIA Attributes   | Simple     | 5-7 min       |
| Implement Guard Logic | Medium     | 15-25 min     |
| Add Storybook Test    | Simple     | 10-15 min     |
| Add Unit Test         | Medium     | 15-25 min     |
| Refactor Extraction   | Medium     | 20-30 min     |

**Parallelization**: Tasks marked [P] can run concurrently (different files, no dependencies)

---

## Next Actions

This context file is consumed by:

```bash
gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini
```

The implementation agent will:

1. Load gpt5mini-suitable-tasks.md for task list
2. Load this file for CTCO templates and patterns
3. Execute HIGH tasks (4 tasks, ~25 min)
4. Execute MEDIUM tasks grouped by pattern (51 tasks, ~5-6 hours)
5. Skip LOW tasks (153 tasks, manual implementation)
6. Verify each task with success criteria checklists
7. Report completion statistics

**Expected completion**: HIGH tasks in 25-30 minutes, MEDIUM tasks in 5-7 hours

---

**Generated by**: GPT-4.1 (tasks-for-gpt-5-mini-gpt-4-1 agent)  
**Purpose**: Implementation context for GPT-5 Mini zero-cost execution  
**Last Updated**: 2026-01-22
