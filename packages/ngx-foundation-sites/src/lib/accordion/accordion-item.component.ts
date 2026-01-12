import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
  inject,
  ViewEncapsulation,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
// import { NfsAccordionTitle } from './accordion-title.component'; // TODO: Create this component
// import { NfsAccordion } from './accordion.component'; // TODO: Uncomment when needed
import { nfsAccordionToken } from './accordion.token';

/**
 * Individual accordion item component that manages its own expanded/collapsed state.
 *
 * @foundation API Parity: Equivalent to Foundation's AccordionItem
 *
 * @example
 * ```html
 * <nfs-accordion-item>
 *   <nfs-accordion-title>Section Title</nfs-accordion-title>
 *   <p>Content goes here</p>
 * </nfs-accordion-item>
 * ```
 */
@Component({
  selector: 'nfs-accordion-item',
  exportAs: 'nfsAccordionItem',
  standalone: true,
  imports: [CommonModule],
  template: `
    <li class="accordion-item" [class.is-active]="expanded()">
      <ng-content select="nfs-accordion-title"></ng-content>
      <div
        class="accordion-content"
        [class.is-active]="expanded()"
        role="region"
        [attr.aria-labelledby]="titleId()"
      >
        <ng-content></ng-content>
      </div>
    </li>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'accordion-item',
  },
})
export class NfsAccordionItem {
  /**
   * Unique identifier for this accordion item.
   * Auto-generated if not provided.
   */
  readonly panelId = input<string>();

  /**
   * Whether this accordion item is expanded.
   * @default false
   */
  readonly expanded = signal(false);

  /**
   * Whether this accordion item is disabled.
   * @default false
   */
  readonly disabled = input(false);

  /**
   * Emitted when the item is toggled.
   */
  readonly toggled = output<boolean>();

  // Internal state
  private readonly _panelId = signal<string>('');
  private readonly _titleId = signal<string>('');

  // Parent accordion reference
  private readonly _parentAccordion = inject(nfsAccordionToken, {
    optional: true,
    skipSelf: true,
  });

  constructor() {
    // Generate unique IDs
    const uniqueId = `accordion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this._panelId.set(uniqueId);
    this._titleId.set(`${uniqueId}-title`);

    // Register with parent accordion if available
    effect(() => {
      if (this._parentAccordion) {
        // TODO: Register with parent
      }
    });
  }

  /**
   * Get the panel ID (computed from input or auto-generated).
   */
  panelIdComputed = computed(() => this.panelId() || this._panelId());

  /**
   * Get the title ID for ARIA relationships.
   */
  titleId = computed(() => this._titleId());

  /**
   * Expand the accordion item.
   * @foundation API Parity: Equivalent to Foundation's down() method
   */
  down(): void {
    if (!this.disabled()) {
      this.expanded.set(true);
      this.toggled.emit(true);
      // TODO: Notify parent accordion
    }
  }

  /**
   * Collapse the accordion item.
   * @foundation API Parity: Equivalent to Foundation's up() method
   */
  up(): void {
    if (!this.disabled()) {
      this.expanded.set(false);
      this.toggled.emit(false);
      // TODO: Notify parent accordion
    }
  }

  /**
   * Toggle the accordion item's expanded state.
   * @foundation API Parity: Equivalent to Foundation's toggle() method
   */
  toggle(): void {
    if (this.expanded()) {
      this.up();
    } else {
      this.down();
    }
  }

  /**
   * Handle title click to toggle expansion.
   * @internal
   */
  onTitleClick(): void {
    this.toggle();
  }
}
