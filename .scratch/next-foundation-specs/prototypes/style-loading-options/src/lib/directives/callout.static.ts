// PROTOTYPE (ticket 190 option S): a family directive module that statically imports its
// family's CSS (192 proposal A), so the CSS travels in whichever chunk carries this directive.
import { Directive } from '@angular/core';
import calloutCss from 'nfs-family-css:callout';
import { registerNfsFamilyCss, useNfsFamilyStyles } from '../static-styles';

registerNfsFamilyCss('callout', calloutCss);

@Directive({ selector: '[nfsCallout]', host: { class: 'callout', 'data-nfs-styles': 'callout' } })
export class NfsCallout {
  constructor() {
    useNfsFamilyStyles('callout');
  }
}
