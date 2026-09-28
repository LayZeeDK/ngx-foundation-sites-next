import { Directive, booleanAttribute, input } from '@angular/core';
import { nfsDevDirective } from './import-check/index';

/** Stand-in for `ngx-foundation-sites/button`: a single directive with a static and a bound input. */
@Directive({
  selector: 'button[nfsButton], a[nfsButton]',
  host: {
    class: 'button',
    '[class.small]': "size() === 'small'",
    '[class.large]': "size() === 'large'",
    '[class.expanded]': 'expanded()',
  },
})
export class NfsButton {
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly expanded = input(false, { transform: booleanAttribute });

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevDirective('NfsButton');
    }
  }
}
