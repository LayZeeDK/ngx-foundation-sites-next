// PROTOTYPE (ticket 190 option S): a family directive module that statically imports its
// family's CSS (192 proposal A), so the CSS travels in whichever chunk carries this directive.
import { Directive } from '@angular/core';
import menuCss from 'nfs-family-css:menu';
import dropdownMenuCss from 'nfs-family-css:dropdown-menu';
import { registerNfsFamilyCss, useNfsFamilyStyles } from '../static-styles';

registerNfsFamilyCss('menu', menuCss);
registerNfsFamilyCss('dropdown-menu', dropdownMenuCss);

@Directive({ selector: '[nfsDropdownMenu]', host: { class: 'dropdown menu', 'data-nfs-styles': 'menu dropdown-menu' } })
export class NfsDropdownMenu {
  constructor() {
    useNfsFamilyStyles('menu', 'dropdown-menu');
  }
}
