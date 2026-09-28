import { Directive, input } from '@angular/core';

/** Stand-in for the library's Button: a single directive with a Variant input. */
@Directive({
  selector: 'button[nfsButton], a[nfsButton]',
  host: {
    class: 'button',
    '[class.primary]': "color() === 'primary'",
    '[class.secondary]': "color() === 'secondary'",
  },
})
export class NfsButton {
  readonly color = input<'primary' | 'secondary' | undefined>(undefined);
}
