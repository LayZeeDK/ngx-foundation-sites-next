# NfsAccordion

Accessible accordion component built on Foundation for Sites CSS framework.

## Features

- **WCAG AA compliant** with proper ARIA attributes
- **Keyboard navigation** (Tab, Arrow keys, Home/End)
- **Foundation CSS integration** without JavaScript dependencies
- **Multi-expand support** for multiple open panels
- **Deep linking** with URL hash navigation
- **SSR compatible** with platform detection
- **Lazy content loading** for performance

## Basic Usage

```typescript
import { NfsAccordion } from 'ngx-foundation-sites/accordion';

@Component({
  imports: [NfsAccordion],
  template: `
    <nfs-accordion>
      <nfs-accordion-item>
        <nfs-accordion-title>Section 1</nfs-accordion-title>
        <nfs-accordion-content>
          <p>Content for section 1</p>
        </nfs-accordion-content>
      </nfs-accordion-item>
    </nfs-accordion>
  `
})
export class MyComponent {}
```

## API Reference

### NfsAccordion

**Selector**: `nfs-accordion`

**Inputs**:
- `multiExpand: boolean` - Allow multiple panels to be open simultaneously (default: false)
- `allowAllClosed: boolean` - Allow all panels to be closed (default: false)
- `deepLink: boolean` - Enable URL hash-based navigation (default: false)
- `announce: boolean` - Enable screen reader announcements (default: false)

**Outputs**:
- `down: EventEmitter<NfsAccordionPanelEvent>` - Emitted when a panel opens
- `up: EventEmitter<NfsAccordionPanelEvent>` - Emitted when a panel closes

### NfsAccordionItem

**Selector**: `nfs-accordion-item`

**Inputs**:
- `expanded: boolean | undefined` - Control panel expansion state
- `disabled: boolean` - Disable the accordion item (default: false)
- `panelId: string` - Unique identifier for the panel (auto-generated if not provided)

### NfsAccordionTitle

**Selector**: `nfs-accordion-title`

Renders as a `<button>` element with proper ARIA attributes.

### NfsAccordionContent

**Selector**: `nfs-accordion-content`

Lazy-loaded content directive. Content is only rendered when the panel is first expanded.

## Accessibility

- Full keyboard navigation support
- Proper ARIA attributes (`aria-expanded`, `aria-controls`, `aria-labelledby`)
- Screen reader announcements (when `announce` is enabled)
- Focus management and restoration
- Passes WCAG AA requirements

## Foundation Integration

This component uses Foundation's accordion CSS classes:
- `.accordion` - Container element
- `.accordion-item` - Individual item wrapper
- `.accordion-title` - Clickable title button
- `.accordion-content` - Content panel
- `.is-active` - Active/expanded state

## Examples

See the Storybook stories for comprehensive examples:
- Basic accordion
- Multi-expand behavior
- Keyboard navigation
- Screen reader support
- Deep linking
- Dynamic content