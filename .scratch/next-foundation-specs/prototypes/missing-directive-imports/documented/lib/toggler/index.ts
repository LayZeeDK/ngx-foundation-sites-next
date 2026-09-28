import { Directive, model } from '@angular/core';

/** Stand-in for a directive with a model input, so `[(nfsToggler)]` matches it. */
@Directive({
  selector: '[nfsToggler]',
  host: { '[class.is-open]': 'nfsToggler()' },
})
export class NfsToggler {
  readonly nfsToggler = model(false);
}
