// PROTOTYPE (ticket 190 option S): a family directive module that statically imports its
// family's CSS (192 proposal A), so the CSS travels in whichever chunk carries this directive.
import { Directive } from '@angular/core';
import buttonCss from 'nfs-family-css:button';
import { registerNfsFamilyCss, useNfsFamilyStyles } from '../static-styles';

registerNfsFamilyCss('button', buttonCss);

@Directive({ selector: '[nfsButton]', host: { class: 'button', 'data-nfs-styles': 'button' } })
export class NfsButton {
  constructor() {
    useNfsFamilyStyles('button');
  }
}
