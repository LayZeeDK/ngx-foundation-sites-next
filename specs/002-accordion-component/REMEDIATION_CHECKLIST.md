# Gap Remediation Implementation Checklist

**Purpose**: Step-by-step implementation guide for fixing validated gaps
**Source**: [GAPS_REMEDIATION.md](./GAPS_REMEDIATION.md)
**Last Updated**: 2026-01-11
**Validated By**: GPT-4.1 incremental analysis (100% match rate with known gaps)

This checklist provides exact implementation steps for each gap. Check off items as you complete them.

---

## P0 - BLOCKING (32 min total) 🚨

### ✅ Checklist: GAP-3 - Rename `multiExpandable` → `multiExpand` (2 min)

**BREAKING CHANGE** - Document in changelog

- [ ] **Step 1**: Update `accordion.component.ts` line 51

  ```typescript
  // FROM:
  readonly multiExpandable = input(false);

  // TO:
  readonly multiExpand = input(false);
  ```

- [ ] **Step 2**: Update `accordion.component.html` line 12

  ```html
  <!-- FROM: -->
  [multiExpandable]="multiExpandable()"

  <!-- TO: -->
  [multiExpand]="multiExpand()"
  ```

- [ ] **Step 3**: Update `accordion.component.spec.ts` (all occurrences)
  - Search for `multiExpandable` and replace with `multiExpand`
  - Typical locations: test setup, assertions

- [ ] **Step 4**: Update `accordion.stories.ts` (if present)
  - Search for `multiExpandable` in story args/controls
  - Replace with `multiExpand`

- [ ] **Step 5**: Run tests to verify

  ```bash
  npm run test -- accordion
  ```

- [ ] **Step 6**: Update CHANGELOG.md with breaking change notice

  ```markdown
  ### BREAKING CHANGES

  - **accordion**: Renamed input `multiExpandable` → `multiExpand` for Foundation naming alignment (FR-014)
    - Migration: Replace `[multiExpandable]` with `[multiExpand]` in all accordion usages
  ```

**Verification**: `grep -r "multiExpandable" packages/ngx-foundation-sites/src/lib/accordion/` returns no results

---

### ✅ Checklist: GAP-1 - Add Foundation API Methods (10 min)

**Files**: `packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts`

- [ ] **Step 1**: Add `down()` method

  ```typescript
  /**
   * Expands this accordion panel (Foundation API: .down($target))
   * @public
   */
  down(): void {
    if (!this.disabled()) {
      this.expanded.set(true);
    }
  }
  ```

- [ ] **Step 2**: Add `up()` method

  ```typescript
  /**
   * Collapses this accordion panel (Foundation API: .up($target))
   * @public
   */
  up(): void {
    if (!this.disabled()) {
      this.expanded.set(false);
    }
  }
  ```

- [ ] **Step 3**: Add `toggle()` method

  ```typescript
  /**
   * Toggles this accordion panel's expansion state (Foundation API: .toggle($target))
   * @public
   */
  toggle(): void {
    if (!this.disabled()) {
      this.expanded.update(v => !v);
    }
  }
  ```

- [ ] **Step 4**: Export methods in public API (`index.ts`)
  - Verify `NfsAccordionItemDef` is exported
  - Update JSDoc to document public methods

- [ ] **Step 5**: Add unit tests

  ```typescript
  it('should expand panel when down() is called', () => {
    const item = /* ... */;
    item.down();
    expect(item.expanded()).toBe(true);
  });

  it('should not expand when disabled', () => {
    const item = /* ... */;
    item.disabled.set(true);
    item.down();
    expect(item.expanded()).toBe(false);
  });
  ```

**Verification**:

- Methods are callable on `NfsAccordionItemDef` instance
- Unit tests pass
- Disabled state prevents activation

---

### ✅ Checklist: GAP-2 - Add Foundation API Outputs (20 min)

**Files**: `packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts`

- [ ] **Step 1**: Import `output` function (if not already imported)

  ```typescript
  import { output } from '@angular/core';
  ```

- [ ] **Step 2**: Define output type (or use existing)

  ```typescript
  export interface AccordionItemChangeEvent {
    itemId: string;
    expanded: boolean;
  }
  ```

- [ ] **Step 3**: Add `down` output

  ```typescript
  /**
   * Emitted when any accordion panel opens (Foundation API: down.zf.accordion)
   * @public
   */
  readonly down = output<{ itemId: string; expanded: true }>();
  ```

- [ ] **Step 4**: Add `up` output

  ```typescript
  /**
   * Emitted when any accordion panel closes (Foundation API: up.zf.accordion)
   * @public
   */
  readonly up = output<{ itemId: string; expanded: false }>();
  ```

- [ ] **Step 5**: Find expansion tracking effect (around line 168)
  - Locate the effect that tracks `expandedPanelId` changes

- [ ] **Step 6**: Emit `down` event when panel opens

  ```typescript
  if (expandedPanelId && expandedPanelId !== this.#lastExpandedPanelId) {
    this.down.emit({ itemId: expandedPanelId, expanded: true });
    this.#lastExpandedPanelId = expandedPanelId;
  }
  ```

- [ ] **Step 7**: Emit `up` event when panel closes

  ```typescript
  if (previouslyExpanded && !currentlyExpanded) {
    this.up.emit({ itemId: previousPanelId, expanded: false });
  }
  ```

- [ ] **Step 8**: Add unit tests

  ```typescript
  it('should emit down event when panel opens', () => {
    const accordion = /* ... */;
    const downSpy = jasmine.createSpy('down');
    accordion.down.subscribe(downSpy);

    item.down();

    expect(downSpy).toHaveBeenCalledWith({ itemId: 'panel-1', expanded: true });
  });
  ```

- [ ] **Step 9**: Verify outputs don't emit when action is prevented (FR-022)

  ```typescript
  it('should not emit down event when item is disabled', () => {
    const item = /* ... */;
    item.disabled.set(true);
    const downSpy = jasmine.createSpy('down');
    accordion.down.subscribe(downSpy);

    item.down();

    expect(downSpy).not.toHaveBeenCalled();
  });
  ```

**Verification**:

- `(down)` output emits when panels open
- `(up)` output emits when panels close
- Events include correct payload
- Events don't fire when actions are prevented

---

## P1 - IMPORTANT (135 min total) ⚠️

### ✅ Checklist: GAP-4 - Implement `titleHeadingLevel` Input (30 min)

**Files**: `accordion.component.ts`, `accordion.component.html`

- [ ] **Step 1**: Add input to component

  ```typescript
  /**
   * Heading level for accordion titles (1-6). When set, wraps trigger buttons in
   * <div role="heading" aria-level="N"> for ARIA document outline.
   * @default null (no heading wrapper)
   */
  readonly titleHeadingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | null>(null);
  ```

- [ ] **Step 2**: Update template with conditional wrapper

  ```html
  @if (titleHeadingLevel(); as level) {
  <div role="heading" [attr.aria-level]="level">
    <button class="accordion-title" ...>
      <!-- button content -->
    </button>
  </div>
  } @else {
  <button class="accordion-title" ...>
    <!-- button content -->
  </button>
  }
  ```

- [ ] **Step 3**: Ensure `.accordion-title` stays on button (FR-031)
  - Verify class is on `<button>`, not on wrapper `<div>`

- [ ] **Step 4**: Add input validation (FR-110a)

  ```typescript
  constructor() {
    effect(() => {
      const level = this.titleHeadingLevel();
      if (level !== null && (level < 1 || level > 6)) {
        this.#errorHandler.handleError(
          new Error(`Invalid titleHeadingLevel: ${level}. Must be 1-6 or null.`)
        );
        // Fallback to null
        this.titleHeadingLevel.set(null);
      }
    });
  }
  ```

- [ ] **Step 5**: Handle runtime changes (FR-176a)
  - Preserve focus when heading level changes
  - Update all heading wrappers atomically

- [ ] **Step 6**: Add unit tests

  ```typescript
  it('should wrap button in heading when titleHeadingLevel is set', () => {
    accordion.titleHeadingLevel.set(3);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('[role="heading"]');
    expect(heading).toBeTruthy();
    expect(heading.getAttribute('aria-level')).toBe('3');

    const button = heading.querySelector('button.accordion-title');
    expect(button).toBeTruthy();
  });
  ```

- [ ] **Step 7**: Add Storybook story variant
  - Create story with `titleHeadingLevel: 2`
  - Verify screen reader announces heading

**Verification**:

- Heading wrapper appears when input is set
- `aria-level` matches input value
- `.accordion-title` remains on button element
- Invalid values trigger ErrorHandler
- Focus preserved during runtime changes

---

### ✅ Checklist: GAP-5 - Add ErrorHandler Diagnostics (60 min)

**Files**: `accordion.component.ts`, `accordion-item-def.ts`

#### 5.1: FR-017a - Duplicate panelId Detection

- [ ] **Step 1**: Inject ErrorHandler

  ```typescript
  readonly #errorHandler = inject(ErrorHandler);
  ```

- [ ] **Step 2**: Add panelId registry

  ```typescript
  #panelRegistry = new Map<string, NfsAccordionItemDef[]>();
  ```

- [ ] **Step 3**: Validate on registration

  ```typescript
  registerItem(item: NfsAccordionItemDef): void {
    const panelId = item.panelId();
    const existing = this.#panelRegistry.get(panelId) || [];
    existing.push(item);
    this.#panelRegistry.set(panelId, existing);

    if (existing.length > 1) {
      const indexes = existing.map((_, i) => i);
      this.#errorHandler.handleError(
        new Error(
          `Duplicate panelId "${panelId}" detected in accordion ${this.id() || '<unnamed>'}. ` +
          `Conflicting items at indexes: [${indexes.join(', ')}]. Using first registered item.`
        )
      );
    }
  }
  ```

#### 5.2: FR-026a - Missing Title Detection

- [ ] **Step 4**: Check for title in item initialization
  ```typescript
  ngAfterContentInit(): void {
    if (!this.titleComponent) {
      const index = this.#parent?.getItemIndex(this) ?? -1;
      this.#errorHandler.handleError(
        new Error(
          `Missing required <nfs-accordion-title> in <nfs-accordion-item> at index ${index}. ` +
          `Item will render panel content but will not be keyboard accessible.`
        )
      );
    }
  }
  ```

#### 5.3: FR-067b - Deep Link Error Handling

- [ ] **Step 5**: Wrap deep link initialization

  ```typescript
  #handleInitialHash(): void {
    const hash = this.#location.hash().substring(1); // Remove '#'
    if (!hash) return;

    const item = this.#findItemByPanelId(hash);
    if (!item) {
      this.#errorHandler.handleError(
        new Error(
          `Deep link target not found: Panel ID "${hash}" does not exist. ` +
          `URL: ${this.#location.href()}`
        )
      );
      return;
    }

    item.down();
  }
  ```

#### 5.4: FR-089a - Rapid Toggle Errors (Already Implemented)

- [ ] **Step 6**: Verify rapid toggle queue handles errors
  - Check `accordion-item-def.ts` for queue implementation
  - Ensure malformed toggle requests are reported

#### 5.5: FR-110a - Input Validation (Partial - validators.ts exists)

- [ ] **Step 7**: Add ErrorHandler calls to existing validators

  ```typescript
  // In validators.ts coercion functions
  export function coerceDeepLinkSmudgeDelay(value: number): number {
    if (value < 0) {
      inject(ErrorHandler).handleError(new Error(`deepLinkSmudgeDelay must be non-negative. Converting ${value} to ${Math.abs(value)}.`));
      return Math.abs(value);
    }
    return value;
  }
  ```

- [ ] **Step 8**: Add unit tests for each diagnostic

  ```typescript
  it('should call ErrorHandler on duplicate panelId', () => {
    const errorSpy = spyOn(errorHandler, 'handleError');
    accordion.registerItem(item1); // panelId: 'panel-1'
    accordion.registerItem(item2); // panelId: 'panel-1' (duplicate)

    expect(errorSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: jasmine.stringContaining('Duplicate panelId "panel-1"'),
      }),
    );
  });
  ```

**Verification**:

- All 5 validation points report errors via ErrorHandler
- Error messages match spec format
- Unit tests verify ErrorHandler invocation
- Component remains functional after errors

---

### ✅ Checklist: GAP-6 - Create Storybook Tests for Foundation API (45 min)

**Files**: `packages/ngx-foundation-sites/.storybook/stories/accordion/FoundationApiParity.story.ts`

- [ ] **Step 1**: Create new story file

  ```typescript
  import type { Meta, StoryObj } from '@storybook/angular';
  import { userEvent, within, expect, waitFor } from '@storybook/test';

  const meta: Meta = {
    title: 'Components/Accordion/Foundation API Parity',
    // ...
  };
  export default meta;
  ```

- [ ] **Step 2**: Create story with item refs

  ```typescript
  export const MethodTests: Story = {
    render: (args) => ({
      props: {
        ...args,
        itemRefs: [] as NfsAccordionItemDef[],
      },
      template: `
        <nfs-accordion>
          <ng-template nfsAccordionItem #item1>
            <ng-template nfsAccordionHeader>Panel 1</ng-template>
            <ng-template nfsAccordionContent>Content 1</ng-template>
          </ng-template>
        </nfs-accordion>
      `,
    }),
    play: async ({ canvasElement, component }) => {
      const canvas = within(canvasElement);
      const item = component.itemRefs[0];

      // Test down() method (T135)
      item.down();
      await waitFor(() => {
        const panel = canvas.getByRole('region');
        expect(panel).toBeVisible();
      });

      // Test up() method (T136)
      item.up();
      await waitFor(() => {
        const panel = canvas.getByRole('region');
        expect(panel).not.toBeVisible();
      });

      // Test toggle() method (T137)
      item.toggle();
      await waitFor(() => {
        const panel = canvas.getByRole('region');
        expect(panel).toBeVisible();
      });
    },
  };
  ```

- [ ] **Step 3**: Create story for event testing (T138-T139)

  ```typescript
  export const EventTests: Story = {
    render: (args) => ({
      props: {
        ...args,
        onDown: (event: any) => console.log('down', event),
        onUp: (event: any) => console.log('up', event),
      },
      template: `
        <nfs-accordion (down)="onDown($event)" (up)="onUp($event)">
          <!-- items -->
        </nfs-accordion>
      `,
    }),
    play: async ({ canvasElement, component }) => {
      const downSpy = vi.fn();
      const upSpy = vi.fn();
      component.onDown = downSpy;
      component.onUp = upSpy;

      const item = component.itemRefs[0];

      // Test (down) event payload
      item.down();
      await waitFor(() => {
        expect(downSpy).toHaveBeenCalledWith({
          itemId: jasmine.any(String),
          expanded: true,
        });
      });

      // Test (up) event payload
      item.up();
      await waitFor(() => {
        expect(upSpy).toHaveBeenCalledWith({
          itemId: jasmine.any(String),
          expanded: false,
        });
      });
    },
  };
  ```

- [ ] **Step 4**: Run Storybook tests
  ```bash
  npm run test-storybook
  ```

**Verification**:

- Methods work correctly in Storybook environment
- Events emit with correct payloads
- Play functions pass without errors
- Visual verification shows correct behavior

---

## P2 - POLISH (15 min total) 🔧

### ✅ Checklist: GAP-8 - Add SSR Error Handling (15 min)

**Files**: `accordion.component.ts`

- [ ] **Step 1**: Find all `afterNextRender` blocks (3 locations)
  - Line ~108: Style loader
  - Line ~118: Deep link initialization
  - Line ~124: Third block

- [ ] **Step 2**: Wrap each block in try/catch

  ```typescript
  afterNextRender(() => {
    try {
      this.#styleLoader.load('accordion', '/nfs-accordion.css');
    } catch (error) {
      this.#errorHandler.handleError(error);
    }
  });
  ```

- [ ] **Step 3**: Add contextual error messages

  ```typescript
  catch (error) {
    this.#errorHandler.handleError(
      new Error(`Accordion hydration failed during style loading: ${error}`, {
        cause: error
      })
    );
  }
  ```

- [ ] **Step 4**: Test SSR hydration failure scenario

  ```typescript
  it('should handle hydration errors gracefully', () => {
    const errorSpy = spyOn(errorHandler, 'handleError');
    // Simulate hydration failure
    spyOn(styleLoader, 'load').and.throwError('Network error');

    component.ngAfterNextRender();

    expect(errorSpy).toHaveBeenCalled();
    expect(component.expanded()).toBe(false); // Component still functional
  });
  ```

**Verification**:

- All `afterNextRender` blocks have error handling
- Errors are reported with context
- Component remains usable after hydration failure
- Server-rendered HTML preserved on error

---

## Post-Remediation Validation

After completing all checklists:

- [ ] **Run full test suite**

  ```bash
  npm run test
  ```

- [ ] **Run linting**

  ```bash
  npm run lint
  ```

- [ ] **Build library**

  ```bash
  npm run build
  ```

- [ ] **Run Storybook tests**

  ```bash
  npm run test-storybook
  ```

- [ ] **Manual testing**
  - Start Storybook: `npm run storybook`
  - Test each Foundation API method manually
  - Verify events emit correctly
  - Test keyboard navigation
  - Test screen reader announcements

- [ ] **Update GAPS_REMEDIATION.md**
  - Mark completed gaps as ✅ FIXED
  - Document any deviations from planned fixes
  - Update total fix time with actual time

- [ ] **Update CHANGELOG.md**
  - Document all BREAKING CHANGES (GAP-3)
  - Document new features (Foundation API methods/outputs)
  - Document bug fixes (ErrorHandler diagnostics)

---

**Total Estimated Time**: 182 minutes (~3 hours)
**P0 Actual Time**: ~32 minutes (matched estimate)

---

## Completion Log

### P0 Fixes Completed (2026-01-11)

| Gap   | Description                              | Commit  | Actual Time |
| ----- | ---------------------------------------- | ------- | ----------- |
| GAP-3 | Rename `multiExpandable` → `multiExpand` | 45903e6 | 2 min       |
| GAP-1 | Add Foundation API methods               | 25481a2 | 10 min      |
| GAP-2 | Add Foundation API outputs               | f8b7e07 | 20 min      |

**Total P0 Time**: 32 minutes (estimated: 32 minutes)
**Tests Added**: 11 new tests (6 for GAP-1, 5 for GAP-2)
**All Tests Passing**: Yes (150 total)

### P1 Fixes Completed (2026-01-12)

| Gap   | Description                           | Commit  | Actual Time |
| ----- | ------------------------------------- | ------- | ----------- |
| GAP-4 | Implement `titleHeadingLevel` input   | 642bf71 | 30 min      |
| GAP-5 | Add ErrorHandler diagnostics          | 30c871d | 60 min      |
| GAP-6 | Create Storybook Foundation API tests | 9e61016 | 45 min      |

**Total P1 Time**: 135 minutes (estimated: 135 minutes)

### P2 Fixes Completed (2026-01-12)

| Gap   | Description                               | Commit  | Actual Time |
| ----- | ----------------------------------------- | ------- | ----------- |
| GAP-8 | Add SSR error handling to afterNextRender | 503636b | 15 min      |

**Total P2 Time**: 15 minutes (estimated: 15 minutes)
**All Tests Passing**: Yes (161 total)
**All Gaps Fixed**: 7/7
