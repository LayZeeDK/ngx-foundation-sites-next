// PROTOTYPE (ticket 190 option S): a family directive module that statically imports its
// family's CSS (192 proposal A), so the CSS travels in whichever chunk carries this directive.
import { Directive } from '@angular/core';
import dropdownCss from 'nfs-family-css:dropdown';
import { registerNfsFamilyCss, useNfsFamilyStyles } from '../static-styles';

registerNfsFamilyCss('dropdown', dropdownCss);

@Directive({ selector: '[nfsDropdownPane]', host: { class: 'dropdown-pane', 'data-nfs-styles': 'dropdown' } })
export class NfsDropdownPane {
  constructor() {
    useNfsFamilyStyles('dropdown');
  }
}
