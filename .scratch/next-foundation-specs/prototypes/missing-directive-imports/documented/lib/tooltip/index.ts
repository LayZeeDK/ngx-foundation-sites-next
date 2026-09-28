import { Directive, input } from '@angular/core';

/** Stand-in for a directive whose input shares its selector's name, so `[nfsTooltip]` and `bind-nfsTooltip` match it. */
@Directive({
  selector: '[nfsTooltip]',
  host: { class: 'has-tip', '[attr.title]': 'nfsTooltip()' },
})
export class NfsTooltip {
  readonly nfsTooltip = input<string>();
}
