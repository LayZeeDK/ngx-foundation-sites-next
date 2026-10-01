// PROBE 192: a family directive module that statically imports its family's CSS. The CSS string
// therefore travels in whichever chunk carries this directive, and is in memory when the
// constructor runs.
import { Directive } from '@angular/core';
import calloutCss from '../css/callout';
import { registerNfsFamilyCss, useNfsFamilyStyles } from '../link-styles';

registerNfsFamilyCss('callout', calloutCss);

@Directive({ selector: '[nfsCallout]', host: { class: 'callout', 'data-nfs-styles': 'callout' } })
export class NfsCallout {
  constructor() {
    useNfsFamilyStyles('callout');
  }
}
