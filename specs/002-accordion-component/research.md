# Research: Accordion Component Implementation

**Phase**: 0 - Outline & Research  
**Date**: 2025-06-10  
**Purpose**: Resolve all technical unknowns before design phase

## Research Questions

### 1. Angular ARIA vs CDK for Accordion Patterns

**Question**: Which library provides the best building blocks for WCAG-compliant accordion implementation?

**Decision**: Use **@angular/aria** as primary source, with **@angular/cdk** as fallback

**Rationale**:
- @angular/aria is specifically designed for WCAG compliance and ARIA patterns
- Provides FocusMonitor, A11yModule, and ARIA utilities out of the box
- CDK provides additional keyboard handling (ListKeyManager) if ARIA doesn't have what's needed
- Constitution principle II mandates ARIA-first hierarchy

**Alternatives Considered**:
- Custom Angular only: Would require reimplementing tested accessibility patterns
- CDK only: Less specialized for ARIA compliance compared to @angular/aria

**Implementation Notes**:
- Import `FocusMonitor` from `@angular/cdk/a11y` for focus management
- Use `ListKeyManager` from `@angular/cdk/a11y` for arrow key navigation if needed
- Reference Angular ARIA examples for accordion pattern structure

---

### 2. DI Token Pattern for Parent-Child Communication

**Question**: How should accordion items locate their parent accordion component?

**Decision**: Use **exported injection token with optional, skipSelf injection** (CDK pattern)

**Rationale**:
- Angular ARIA's accordion token is NOT exported and uses required injection
- This breaks with content projection because content children use declaration-site injector
- CDK pattern (exported token + optional injection) gracefully handles content projection
- Aligns with spec clarification: "CDK-style pattern with exported `nfsAccordionToken`"

**Pattern**:
```typescript
// accordion.token.ts
export const nfsAccordionToken = new InjectionToken<NfsAccordion>('nfsAccordionToken');

// accordion.component.ts
@Component({
  providers: [{ provide: nfsAccordionToken, useExisting: NfsAccordion }],
})
export class NfsAccordion { }

// accordion-item.component.ts
export class NfsAccordionItem {
  readonly accordion = inject(nfsAccordionToken, { optional: true, skipSelf: true });
}
```

**Alternatives Considered**:
- Angular ARIA pattern: Doesn't work with content projection (items can't find parent)
- Direct property binding: Would require explicit parent binding, losing composition benefits
- ViewChild queries: Only work for direct children, not content-projected children

**Implementation Notes**:
- Token must be exported from public API
- Injection must be optional to allow standalone item usage
- skipSelf prevents item from finding itself if it also provides the token

---

### 3. Conditional Rendering Strategy (@if with ARIA Stability)

**Question**: How to remove collapsed content from DOM while maintaining stable ARIA relationships?

**Decision**: Keep **panel wrapper in DOM always**, conditionally render **content inside** with @if

**Rationale**:
- ARIA requires `aria-controls` to reference a valid element ID at all times
- Performance requires removing collapsed content from DOM
- Solution: Stable wrapper element + conditional content rendering

**Implementation**:
```typescript
// In accordion-item.component.html
<div 
  class="accordion-content" 
  [id]="panelId()" 
  role="region" 
  [attr.aria-labelledby]="triggerId()"
  [attr.inert]="expanded() ? null : ''">
  
  @if (lazyContent(); as lazy) {
    @if (expanded() || hasBeenExpanded()) {
      <ng-container [ngTemplateOutlet]="lazy.templateRef" />
    }
  } @else {
    @if (expanded()) {
      <ng-content />
    }
  }
</div>
```

**Alternatives Considered**:
- CSS display:none: Keeps content in DOM, worse performance
- Remove wrapper when collapsed: Breaks ARIA relationships, requires ID updates
- Always render content: Poor performance with 100 items

**Implementation Notes**:
- Use `inert` attribute to prevent keyboard access to collapsed panel wrapper
- Track `hasBeenExpanded()` signal for lazy content persistence
- Foundation CSS `.accordion-content` class always present for styling

---

### 4. ID Generation Strategy for Multiple Instances

**Question**: How to ensure unique IDs across multiple accordion instances on the same page?

**Decision**: Use **static counter + instance ID** pattern

**Rationale**:
- ARIA relationships require unique IDs for aria-controls/aria-labelledby
- Multiple accordions on same page must not have ID collisions
- Counter ensures uniqueness without external dependencies

**Implementation**:
```typescript
export class NfsAccordion {
  static #counter = 0;
  readonly #instanceId = `nfs-accordion-${NfsAccordion.#counter++}`;
  
  protected generateItemId(index: number): string {
    return `${this.#instanceId}-item-${index}`;
  }
}
```

**Alternatives Considered**:
- UUID library: Unnecessary external dependency, overkill for this use case
- timestamp-based: Risk of collision if multiple instances created simultaneously
- User-provided IDs only: Requires boilerplate, prone to errors

**Implementation Notes**:
- Counter increments during class initialization
- Instance ID used as prefix for all child IDs
- Falls back to user-provided `id` input if specified

---

### 5. Keyboard Navigation Architecture

**Question**: Should keyboard handling be at accordion level or item level?

**Decision**: **Accordion level** handles arrow keys, **item level** handles Enter/Space

**Rationale**:
- Arrow key navigation requires awareness of all items and their order
- Accordion component maintains focus management context
- Individual items handle their own activation (Enter/Space) for encapsulation

**Implementation**:
```typescript
// accordion.component.ts
@HostListener('keydown', ['$event'])
handleKeydown(event: KeyboardEvent) {
  if (!(event.target as Element)?.closest('.accordion-title')) return;
  
  switch (event.key) {
    case 'ArrowDown': this.focusNextItem(); break;
    case 'ArrowUp': this.focusPreviousItem(); break;
    case 'Home': this.focusFirstItem(); break;
    case 'End': this.focusLastItem(); break;
  }
}

// accordion-item.component.ts
@HostListener('click')
onClick() {
  if (!this.disabled()) this.toggle();
}
```

**Alternatives Considered**:
- All keyboard handling in items: Requires items to query siblings, tight coupling
- All keyboard handling in accordion: Loses encapsulation for item-level actions

**Implementation Notes**:
- Use CDK's ListKeyManager if arrow key logic becomes complex
- Skip disabled items during navigation
- Support wraparound navigation with `wrap` input

---

### 6. SSR Compatibility for Deep Linking

**Question**: How to handle browser-only APIs (window.location.hash) in SSR context?

**Decision**: Use **isPlatformBrowser + afterRender** pattern

**Rationale**:
- Deep linking requires History API and location.hash (browser-only)
- Angular Universal renders server-side without browser globals
- Constitution requires SSR compatibility

**Implementation**:
```typescript
import { afterRender, isPlatformBrowser, PLATFORM_ID } from '@angular/core';

export class NfsAccordion {
  readonly #platformId = inject(PLATFORM_ID);
  
  constructor() {
    if (isPlatformBrowser(this.#platformId)) {
      afterRender(() => {
        // Browser-specific code for deep linking
        this.initializeDeepLinking();
      });
    }
  }
}
```

**Alternatives Considered**:
- Always use browser APIs: Breaks SSR with runtime errors
- Conditional imports: More complex, unnecessary for this use case

**Implementation Notes**:
- Check platform before accessing `window`, `document`, `history`
- Use `afterRender` to ensure DOM is ready before URL hash operations
- Server-rendered HTML includes correct semantic structure and ARIA attributes

---

### 7. State Management with Signals

**Question**: How to manage accordion expansion state reactively?

**Decision**: Use **signal for item state**, **computed for derived values**

**Rationale**:
- Signals provide fine-grained reactivity
- Computed signals automatically update when dependencies change
- OnPush change detection works seamlessly with signals

**Implementation**:
```typescript
export class NfsAccordionItem {
  expanded = model<boolean>(false);  // Two-way bindable
  
  readonly accordion = inject(nfsAccordionToken, { optional: true, skipSelf: true });
  
  // Computed: Should this item render content?
  readonly shouldRenderContent = computed(() => {
    return this.expanded() && !this.disabled();
  });
}

export class NfsAccordion {
  #openItemIds = signal<string[]>([]);
  
  // Computed: Check if all items are closed
  readonly allClosed = computed(() => {
    return this.#openItemIds().length === 0;
  });
}
```

**Alternatives Considered**:
- BehaviorSubject/Observable: More boilerplate, less integrated with Angular
- Traditional properties: Requires manual change detection triggering

**Implementation Notes**:
- Use `model()` for two-way binding on `expanded` input
- Use `computed()` for derived state (e.g., ARIA attributes)
- Use `effect()` sparingly for side effects (e.g., emitting events)

---

### 8. Foundation CSS Class Application

**Question**: How to apply Foundation state classes reactively?

**Decision**: Use **host bindings** for state classes

**Rationale**:
- Host bindings automatically update with signal changes
- No manual class manipulation needed
- Declarative and type-safe

**Implementation**:
```typescript
export class NfsAccordionItem {
  expanded = model<boolean>(false);
  disabled = input<boolean>(false);
  
  // Host bindings in component metadata
  host = {
    'class': 'accordion-item',
    '[class.is-active]': 'expanded()',
    '[class.is-disabled]': 'disabled()',
    '[attr.aria-disabled]': 'disabled() || null',
  }
}
```

**Alternatives Considered**:
- @HostBinding decorator: Deprecated in favor of host object
- Template class bindings: Less efficient for host element
- Manual class manipulation: Error-prone, not reactive

**Implementation Notes**:
- Use host object in @Component decorator (not @HostBinding)
- Foundation classes: `.accordion`, `.accordion-item`, `.accordion-title`, `.accordion-content`, `.is-active`
- Custom classes only when necessary (e.g., `.is-disabled` for visual feedback)

---

### 9. Testing Strategy Selection

**Question**: Which testing tools for which scenarios?

**Decision**: **Storybook for interactions**, **Vitest for logic**, **Playwright for deep linking**

**Rationale**:
- Storybook play functions test real user interactions in browser
- Vitest unit tests for pure functions (ID generation, state logic)
- Playwright E2E only for History API (URL hash manipulation)

**Test Distribution**:
```text
Storybook (Primary):
- Basic.story.ts: Single-expand mode, clicking, state changes
- KeyboardNavigation.story.ts: Arrow keys, Home/End, Enter/Space
- MultiExpand.story.ts: Multiple open panels
- DisabledItems.story.ts: Disabled state, keyboard skip
- DynamicContent.story.ts: Adding/removing items via *ngFor
- LazyContent.story.ts: ng-template[nfsAccordionContent]
- ScreenReader.story.ts: ARIA attributes, @storybook/addon-a11y checks

Vitest (Secondary):
- accordion.component.spec.ts: State management logic
- accordion-item.component.spec.ts: Expansion/collapse logic
- id-generator.spec.ts: Unique ID generation

Playwright E2E (Tertiary):
- accordion-deeplink.spec.ts: URL hash navigation, history.pushState/replaceState
```

**Alternatives Considered**:
- Jest instead of Vitest: Vitest is faster and better integrated with Vite/Nx
- No E2E tests: Deep linking requires real browser navigation testing

**Implementation Notes**:
- Use semantic locators in E2E: `getByRole('button')`, `getByText()`
- Storybook tests run in CI via `test-storybook` target
- All stories must include accessibility checks

---

## Summary of Decisions

| Topic | Decision | Key Benefit |
|-------|----------|-------------|
| ARIA Library | @angular/aria (primary) + @angular/cdk (fallback) | WCAG compliance + proven patterns |
| DI Pattern | Exported token + optional injection | Content projection support |
| Content Rendering | Stable wrapper + @if content | ARIA compliance + performance |
| ID Generation | Static counter + instance ID | Collision-free across instances |
| Keyboard Handling | Accordion (arrows) + Item (Enter/Space) | Proper encapsulation |
| SSR Support | isPlatformBrowser + afterRender | Universal compatibility |
| State Management | Signals + computed | Reactive, OnPush compatible |
| CSS Classes | Host bindings | Declarative, reactive |
| Testing Strategy | Storybook (primary) + Vitest + Playwright | Best tool for each scenario |

---

## Implementation Readiness

All technical unknowns resolved. Ready to proceed to Phase 1: Design & Contracts.

**Next Steps**:
1. Generate data-model.md with component entities and relationships
2. Generate contracts/accordion-api.ts with TypeScript interfaces
3. Generate contracts/accordion-aria.md with ARIA requirements
4. Generate quickstart.md with usage examples
5. Update agent context files with new dependencies
