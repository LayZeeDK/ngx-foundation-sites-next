// PROTOTYPE (ticket 190 option S): a family directive module that statically imports its
// family's CSS (192 proposal A), so the CSS travels in whichever chunk carries this directive.
import { Directive } from '@angular/core';
import menuCss from 'nfs-family-css:menu';
import { registerNfsFamilyCss, useNfsFamilyStyles } from '../static-styles';

registerNfsFamilyCss('menu', menuCss);

@Directive({ selector: '[nfsMenu]', host: { class: 'menu', 'data-nfs-styles': 'menu' } })
export class NfsMenu {
  constructor() {
    useNfsFamilyStyles('menu');
  }
}
