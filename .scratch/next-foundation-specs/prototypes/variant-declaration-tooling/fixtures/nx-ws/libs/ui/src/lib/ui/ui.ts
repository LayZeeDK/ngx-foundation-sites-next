import { Component, input } from '@angular/core';
import { NfsButton, type NfsButtonColor } from 'ngx-foundation-sites/button';

/** A shared component with a Variant input of its own. */
@Component({
  selector: 'lib-ui',
  imports: [NfsButton],
  template: `
    <button nfsButton color="purple">Shared purple</button>
    <button nfsButton [color]="color()">From the input</button>
  `,
})
export class Ui {
  /** A `$button-palette` name. */
  readonly color = input<NfsButtonColor>('primary');
}
