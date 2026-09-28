import { Component } from '@angular/core';

/** Compiled alone with `npm run ng8002`: a bound input on the forgotten NfsButton fails the
 * build (NG8002); the static `size` input and the attribute itself do not. */
@Component({
  selector: 'app-bound-input',
  template: `
    <button nfsButton size="small">Static input: compiles</button>
    <button nfsButton [expanded]="true">Bound input: NG8002</button>
  `,
})
export class BoundInput {}
