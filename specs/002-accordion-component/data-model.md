# Data Model: Accordion Component

**Phase**: 1 - Design & Contracts  
**Date**: 2026-01-07  
**Updated**: 2025-01-06 (Added Foundation API parity)  
**Purpose**: Define entities, relationships, and state management

## Foundation JavaScript API Parity

This component provides **full API parity** with Foundation for Sites accordion JavaScript plugin:

| Foundation API            | Angular Equivalent               | Component        | Notes                      |
| ------------------------- | -------------------------------- | ---------------- | -------------------------- |
| `.toggle($target)`        | `toggle()`                       | NfsAccordionItem | Toggle panel state         |
| `.down($target)`          | `down()`                         | NfsAccordionItem | Open panel                 |
| `.up($target)`            | `up()`                           | NfsAccordionItem | Close panel                |
| `.destroy()`              | Angular lifecycle / `DestroyRef` | NfsAccordion     | Cleanup (no public method) |
| `down.zf.accordion` event | `(down)` output                  | NfsAccordion     | Panel opening event        |
| `up.zf.accordion` event   | `(up)` output                    | NfsAccordion     | Panel closing event        |

**Rationale**: Ensures seamless migration for developers moving from Foundation JS to Angular implementation without learning new API patterns.

## Component Entities

### 1. NfsAccordion (Container Component)

**Purpose**: Root container that manages overall accordion state, coordinates child items, and provides context.

**State**:

- `#openItemIds`: `WritableSignal<string[]>` - IDs of currently open items
- `#instanceId`: `string` - Unique ID for this accordion instance (generated via static counter)
- `#items`: `WritableSignal<NfsAccordionItem[]>` - Registered child items

**Inputs** (via `input()` function):

- `multiExpand`: `InputSignal<boolean>` - Allow multiple panels open (default: `false`)
- `allowAllClosed`: `InputSignal<boolean>` - Allow all panels closed (default: `false`)
- `disabled`: `InputSignal<boolean>` - Disable all items (default: `false`)
- `deepLink`: `InputSignal<boolean>` - Sync with URL hash (default: `false`)
- `deepLinkSmudge`: `InputSignal<boolean>` - Auto-scroll to expanded item (default: `false`)
- `deepLinkSmudgeDelay`: `InputSignal<number>` - Scroll delay in ms (default: `300`)
- `deepLinkSmudgeOffset`: `InputSignal<number>` - Scroll offset in px (default: `0`)
- `updateHistory`: `InputSignal<boolean>` - Use pushState instead of replaceState (default: `false`)
- `wrap`: `InputSignal<boolean>` - Wrap arrow key navigation (default: `false`)
- `titleHeadingLevel`: `InputSignal<1 | 2 | 3 | 4 | 5 | 6 | null>` - Heading level for titles (default: `null`)
- `softDisabled`: `InputSignal<boolean>` - Disabled items remain focusable (default: `true`)
- `id`: `InputSignal<string | undefined>` - Optional custom ID

**Outputs** (via `output()` function):

- `down`: `OutputEmitterRef<{ itemId: string; expanded: boolean }>` - Emitted when a panel opens (Foundation parity: `down.zf.accordion`)
- `up`: `OutputEmitterRef<{ itemId: string; expanded: boolean }>` - Emitted when a panel closes (Foundation parity: `up.zf.accordion`)

**Methods**:

- `registerItem(item: NfsAccordionItem): void` - Called by items during initialization
- `unregisterItem(item: NfsAccordionItem): void` - Called by items during destruction
- `notifyItemToggle(itemId: string, expanded: boolean): void` - Called by items when toggled

**Computed Signals**:

- `allClosed`: `Signal<boolean>` - True if no items are open
- `canCloseItem`: `(itemId: string) => boolean` - True if item can be closed based on allowAllClosed

**Validation Rules**:

- When `multiExpand` is `false`, opening one item must close others
- When `allowAllClosed` is `false` and only one item is open, that item cannot be closed
- When `disabled` is `true`, all items inherit disabled state

**State Transitions**:

```
IDLE → OPENING_ITEM → ITEM_OPEN
     → CLOSING_ITEM → ITEM_CLOSED
     → OPENING_MULTIPLE (if multiExpand=true)
```

---

### 2. NfsAccordionItem (Item Component)

**Purpose**: Individual accordion item that manages its expanded/collapsed state and coordinates title/content.

**State**:

- `expanded`: `ModelSignal<boolean>` - Whether panel is expanded (two-way bindable)
- `#hasBeenExpanded`: `WritableSignal<boolean>` - Track if ever expanded (for lazy content)
- `#triggerId`: `string` - Auto-generated ID for title button
- `#panelId`: `string` - User-provided or auto-generated panel ID

**Inputs**:

- `panelId`: `InputSignal<string | undefined>` - Optional unique identifier for this panel (auto-generated if not provided per FR-017)
- `expanded`: `ModelSignal<boolean>` - Initial/controlled expansion state (default: `false`)
- `disabled`: `InputSignal<boolean>` - Disable this item (default: `false`)

**Outputs**: None (use `(down)` / `(up)` outputs on `<nfs-accordion>` for Foundation parity events)

**Methods**:

- `down(): void` - Expand this panel [Foundation API parity: equivalent to `.down($target)`]
- `up(): void` - Collapse this panel [Foundation API parity: equivalent to `.up($target)`]
- `toggle(): void` - Toggle expansion state [Foundation API parity: equivalent to `.toggle($target)`]

**Computed Signals**:

- `shouldRenderContent`: `Signal<boolean>` - True if content should be in DOM
- `ariaExpanded`: `Signal<'true' | 'false'>` - ARIA expanded state string
- `canClose`: `Signal<boolean>` - True if item can be closed (based on parent accordion rules)

**Validation Rules**:

- `panelId` must be unique within accordion
- Cannot toggle if `disabled` is `true`
- Cannot close if parent `allowAllClosed=false` and this is the only open item

**State Transitions**:

```
COLLAPSED → EXPANDING → EXPANDED
EXPANDED → COLLAPSING → COLLAPSED
```

---

### 3. NfsAccordionTitle (Trigger Component)

**Purpose**: Clickable button element that triggers expansion/collapse and manages focus.

**State**:

- `#focused`: `WritableSignal<boolean>` - Whether button has focus

**Inputs**: None (inherits state from parent item)

**Outputs**: None (delegates to parent item)

**Methods**:

- `focus(): void` - Programmatically focus this title
- `blur(): void` - Programmatically remove focus

**Computed Signals**:

- `ariaControls`: `Signal<string>` - ID of controlled panel
- `ariaExpanded`: `Signal<'true' | 'false'>` - Expansion state from parent item
- `ariaDisabled`: `Signal<'true' | null>` - Disabled state (if softDisabled=true)
- `disabled`: `Signal<boolean | null>` - Disabled attribute (if softDisabled=false)

**Validation Rules**:

- Must be a child of `NfsAccordionItem`
- Cannot be activated if item is disabled

---

### 4. NfsAccordionContent (Content Directive)

**Purpose**: Structural directive for lazy content loading via ng-template.

**State**:

- `templateRef`: `TemplateRef<void>` - Reference to ng-template content

**Inputs**: None (implicit from ng-template)

**Outputs**: None

**Methods**: None

**Validation Rules**:

- Must be a child of `NfsAccordionItem`
- Only one nfsAccordionContent per item

---

## Entity Relationships

```
NfsAccordion (1)
  ├── provides nfsAccordionToken
  └── contains (1..N) NfsAccordionItem
           ├── injects nfsAccordionToken (optional)
           ├── contains (1) NfsAccordionTitle
           └── contains (1) Content (eager or lazy)
                ├── ng-content (eager) OR
                └── ng-template[nfsAccordionContent] (lazy)
```

**DI Relationships**:

- `NfsAccordion` provides `nfsAccordionToken` (via `useExisting`)
- `NfsAccordionItem` injects `nfsAccordionToken` with `{ optional: true, skipSelf: true }`
- `NfsAccordionTitle` injects parent `NfsAccordionItem` (required)
- `NfsAccordionContentDirective` injects parent `NfsAccordionItem` (required)

**Parent-Child Communication**:

- Item registers with accordion during `ngOnInit`
- Item unregisters from accordion during `ngOnDestroy`
- Item notifies accordion when expansion state changes
- Accordion enforces `multiExpand` and `allowAllClosed` rules

---

## State Management Flow

### Scenario: User Clicks Accordion Title

```
1. User clicks <nfs-accordion-title>
2. NfsAccordionTitle emits click event
3. NfsAccordionItem.toggle() called
4. NfsAccordionItem checks if toggle allowed:
   - If disabled → no-op
   - If closing and canClose=false → no-op
5. NfsAccordionItem updates expanded signal
6. NfsAccordionItem notifies parent accordion
7. NfsAccordion enforces rules:
   - If multiExpand=false → close other items
   - If allowAllClosed=false and closing last item → prevent
8. NfsAccordion updates #openItemIds signal
9. Computed signals recompute:
   - shouldRenderContent → triggers @if content rendering
   - ariaExpanded → updates ARIA attribute
   - CSS class bindings → adds/removes .is-active
10. NfsAccordion emits `down`/`up` event
```

### Scenario: Keyboard Navigation (ArrowDown)

```
1. User presses ArrowDown on focused title
2. NfsAccordion.handleKeydown() intercepts event
3. NfsAccordion finds current focused item index
4. NfsAccordion calculates next enabled item:
   - Skip disabled items
   - Wrap to first if wrap=true and at end
5. NfsAccordion calls focus() on next item's title
6. Browser focus moves to next title button
```

### Scenario: Deep Linking (URL Hash Change)

```
1. Page loads with URL hash #panel-2
2. NfsAccordion (in afterRender) reads location.hash
3. NfsAccordion finds item with panelId='panel-2'
4. NfsAccordion calls item.down()
5. NfsAccordionItem expands and notifies parent
6. If deepLinkSmudge=true:
   - Wait deepLinkSmudgeDelay ms
   - Scroll to panel with deepLinkSmudgeOffset
```

---

## ARIA State Mapping

| Component State        | ARIA Attribute                | Value      |
| ---------------------- | ----------------------------- | ---------- |
| Item expanded          | `aria-expanded` on title      | `"true"`   |
| Item collapsed         | `aria-expanded` on title      | `"false"`  |
| Item disabled (soft)   | `aria-disabled` on title      | `"true"`   |
| Item disabled (hard)   | `disabled` attribute on title | present    |
| Title controls panel   | `aria-controls` on title      | panel ID   |
| Panel labeled by title | `aria-labelledby` on panel    | title ID   |
| Panel is region        | `role` on panel wrapper       | `"region"` |
| Panel collapsed        | `inert` on panel wrapper      | present    |

---

## CSS Class Mapping

| Component State     | CSS Class            | Applied To                    |
| ------------------- | -------------------- | ----------------------------- |
| Accordion container | `.accordion`         | `<nfs-accordion>` host        |
| Item container      | `.accordion-item`    | `<nfs-accordion-item>` host   |
| Item expanded       | `.is-active`         | `<nfs-accordion-item>` host   |
| Item disabled       | `.is-disabled`       | `<nfs-accordion-item>` host   |
| Title button        | `.accordion-title`   | `<button>` in title component |
| Panel wrapper       | `.accordion-content` | `<div>` in item component     |

---

## Performance Considerations

**Signal Reactivity**:

- Use `computed()` for derived state to minimize recalculations
- Use `effect()` sparingly (only for side effects like event emission)
- Avoid nested signals that could cause cascading updates

**DOM Updates**:

- `@if` conditional rendering removes collapsed content from DOM
- Panel wrapper remains in DOM for ARIA stability
- OnPush change detection limits unnecessary updates

**Large Item Counts (100 items)**:

- ID generation uses simple counter (O(1))
- Arrow key navigation iterates items linearly (O(n)) but capped at 100
- Signal updates are granular (only affected items recompute)

**Memory Management**:

- Items register/unregister with parent to prevent memory leaks
- Lazy content templates stored as references, not duplicated
- No subscriptions that need manual cleanup (signals handle lifecycle)

---

## Validation Summary

| Validation Rule                      | Enforced By                          | Error Handling              |
| ------------------------------------ | ------------------------------------ | --------------------------- |
| Unique panelId                       | NfsAccordion (registerItem)          | Console warning in dev mode |
| Single expand when multiExpand=false | NfsAccordion (notifyItemToggle)      | Close other items           |
| No close when allowAllClosed=false   | NfsAccordionItem (canClose computed) | Prevent toggle action       |
| No action when disabled              | NfsAccordionItem (toggle method)     | Early return no-op          |
| Required panelId                     | TypeScript (InputSignal<string>)     | Compile-time error          |
| One title per item                   | Component composition                | Runtime error if missing    |
| One content per item                 | Component composition                | Runtime error if missing    |

---

## Implementation Readiness

All entities, relationships, and state flows defined. Ready to generate TypeScript contracts and ARIA documentation.
