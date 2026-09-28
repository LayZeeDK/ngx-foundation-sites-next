import { Directive } from '@angular/core';
import { nfsDevDirective } from './import-check/index';

/** Stand-in for `ngx-foundation-sites/float-grid`'s NfsColumn (same name as the Flex Grid's). */
@Directive({
  selector: '[nfsColumn]',
  host: { class: 'columns' },
})
export class NfsColumn {
  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      nfsDevDirective('NfsColumn');
    }
  }
}
