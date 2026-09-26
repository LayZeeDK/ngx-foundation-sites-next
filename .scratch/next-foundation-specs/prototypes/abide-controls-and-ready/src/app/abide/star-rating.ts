// PROTOTYPE fixture: a custom FormValueControl (Abide's explicit directives applied via
// hostDirectives on a non-native host, per the "Prototype needed" item's fourth control kind).
import { ChangeDetectionStrategy, Component, ElementRef, inject, model } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { NfsAbideInput } from './abide';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // hostDirectives applies NfsAbideInput to this component's own host element, the same
  // element [formField] binds to, so NfsAbideInput's self-injection of FORM_FIELD sees it.
  hostDirectives: [{ directive: NfsAbideInput, inputs: ['aria-describedby'] }],
  host: { role: 'radiogroup' },
  template: `
    @for (n of stars; track n) {
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="value() === n"
        [class.is-active]="value() === n"
        (click)="select(n)"
      >
        {{ n }}
      </button>
    }
  `,
})
export class StarRating implements FormValueControl<number> {
  protected readonly stars = [1, 2, 3, 4, 5] as const;
  readonly value = model(0);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected select(n: number): void {
    this.value.set(n);
    // No native control fires 'change' for a button click; NfsAbideInput's fieldChange
    // timing (Abide's `changed` trigger) needs one, so the control dispatches it itself.
    this.#host.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
