# Phase 4: Keyboard Navigation ✅

**Goal:** Ensure full keyboard accessibility (handled by @angular/aria).

Angular ARIA's `AccordionGroup` provides:

- Arrow Up/Down navigation between triggers
- Home/End to jump to first/last
- Enter/Space to toggle
- Tab navigation respects `disabled` and `wrap` settings

## 4.1 Verify Keyboard Navigation in Stories ✅

Keyboard navigation is tested in the `KeyboardNavigation` story (implemented in Phase 2).

## Key Behaviors

| Key        | Behavior                       |
| ---------- | ------------------------------ |
| Arrow Down | Move focus to next trigger     |
| Arrow Up   | Move focus to previous trigger |
| Home       | Move focus to first trigger    |
| End        | Move focus to last trigger     |
| Enter      | Toggle current panel           |
| Space      | Toggle current panel           |
| Tab        | Move to next focusable element |

## Wrap Behavior

When `wrap` is enabled (default):

- Arrow Down from last item wraps to first
- Arrow Up from first item wraps to last

When `wrap` is disabled:

- Navigation stops at boundaries

## Disabled Item Handling

When `softDisabled` is true (default):

- Disabled items receive focus for screen reader announcement
- Disabled items cannot be activated

When `softDisabled` is false:

- Disabled items are skipped during keyboard navigation
