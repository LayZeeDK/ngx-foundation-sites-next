import { Directive } from '@angular/core';
import { nfsDevDirective } from './import-check/index';

/** Stand-in for `ngx-foundation-sites/flex-grid`'s NfsColumn. The real library has two classes
 * of this name (Flex Grid and Float Grid); a bundler renames one when both reach one chunk. */
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
