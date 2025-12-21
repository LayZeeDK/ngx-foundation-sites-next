import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  model,
} from '@angular/core';
import { NfsAccordionTitleDef } from './accordion-title';
import { NfsAccordionContentDef } from './accordion-content';

/**
 * Accordion item component that collects title and content templates.
 * The actual rendering is handled by the parent NfsAccordion component
 * which uses Angular ARIA directives.
 */
@Component({
  selector: 'nfs-accordion-item',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordionItem {
  /** Unique identifier for the panel, used for ARIA relationships */
  readonly panelId = input.required<string>();

  /** Whether this item is disabled */
  readonly disabled = input(false);

  /** Expanded state (two-way bindable) */
  readonly expanded = model(false);

  /** Reference to the title template */
  readonly titleDef = contentChild(NfsAccordionTitleDef);

  /** Reference to the content template */
  readonly contentDef = contentChild(NfsAccordionContentDef);
}
