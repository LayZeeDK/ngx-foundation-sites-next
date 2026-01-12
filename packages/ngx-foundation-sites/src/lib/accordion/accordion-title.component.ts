import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NfsAccordionItem } from './accordion-item.component';

/**
 * Clickable title component for accordion items.
 * Renders as a button with proper ARIA attributes and keyboard handling.
 *
 * @foundation API Parity: Equivalent to Foundation's accordion-title
 *
 * @example
 * ```html
 * <nfs-accordion-title>Click to expand</nfs-accordion-title>
 * ```
 */
@Component({
  selector: 'nfs-accordion-title',
  exportAs: 'nfsAccordionTitle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="accordion-title"
      type="button"
      [attr.aria-expanded]="parentItem?.expanded() ? 'true' : 'false'"
      [attr.aria-controls]="parentItem?.panelIdComputed()"
      [attr.aria-disabled]="parentItem?.disabled() ? 'true' : null"
      [disabled]="parentItem?.disabled()"
    >
      <ng-content></ng-content>
    </button>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'accordion-title',
  },
})
export class NfsAccordionTitle {
  // Parent accordion item reference
  protected readonly parentItem = inject(NfsAccordionItem, {
    optional: true,
    skipSelf: true,
  });

  /**
   * Handle click events to toggle the accordion item.
   */
  @HostListener('click')
  onClick(): void {
    this.parentItem?.onTitleClick();
  }

  /**
   * Handle keyboard events for accessibility.
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.parentItem?.onTitleClick();
    }
  }
}
