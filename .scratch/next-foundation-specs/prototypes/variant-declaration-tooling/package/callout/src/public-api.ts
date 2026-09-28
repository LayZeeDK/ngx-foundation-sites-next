import { Directive, input } from '@angular/core';
import type { NfsFoundationPaletteColor } from 'ngx-foundation-sites';

/** `$foundation-palette`. Shape: name. */
export type NfsCalloutColor = NfsFoundationPaletteColor;

/** PROTOTYPE stand-in for Foundation's Callout (the base palette). */
@Directive({
  selector: '[nfsCallout]',
  host: { class: 'callout', '[class]': 'color() ?? ""' },
})
export class NfsCallout {
  readonly color = input<NfsCalloutColor | undefined>(undefined);
}
