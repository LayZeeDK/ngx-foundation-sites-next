import { Directive, input } from '@angular/core';

/** Stand-in for the library's Callout: the directive whose input a test case binds. */
@Directive({
  selector: '[nfsCallout]',
  host: { class: 'callout', '[class]': 'color() ?? ""' },
})
export class NfsCallout {
  readonly color = input<'primary' | 'secondary' | 'success' | 'warning' | 'alert' | undefined>(undefined);
}
