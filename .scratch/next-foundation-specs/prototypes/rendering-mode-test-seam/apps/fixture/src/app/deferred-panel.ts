import { Component } from '@angular/core';
import { NfsToggle } from '@nfs/ui';

/** PROTOTYPE: referenced only inside the @defer block, so it lands in a lazy chunk. */
@Component({
  selector: 'nfs-deferred-panel',
  imports: [NfsToggle],
  template: `<button type="button" nfsToggle id="deferred">Inside hydrate on interaction</button>`,
})
export class DeferredPanel {}
