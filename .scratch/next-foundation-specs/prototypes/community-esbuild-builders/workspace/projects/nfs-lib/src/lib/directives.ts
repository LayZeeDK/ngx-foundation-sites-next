/// <reference path="../virtual.d.ts" />
// PROTOTYPE library directives (proposal A). Each directive statically imports its family's CSS
// and passes it in its constructor; there is no module-level registration, so the CSS string is
// only reachable through the class and esbuild places it in whichever chunk carries the class,
// even though the whole entry point ships as one FESM file.
import { Directive } from '@angular/core';
import buttonCss from 'nfs-family-css:button';
import calloutCss from 'nfs-family-css:callout';
import menuCss from 'nfs-family-css:menu';
import dropdownMenuCss from 'nfs-family-css:dropdown-menu';
import { useNfsFamilyStyles } from './family-styles';

@Directive({ selector: '[nfsButton]', host: { class: 'button', 'data-nfs-styles': 'button' } })
export class NfsButton {
  constructor() {
    useNfsFamilyStyles({ button: buttonCss });
  }
}

@Directive({ selector: '[nfsCallout]', host: { class: 'callout', 'data-nfs-styles': 'callout' } })
export class NfsCallout {
  constructor() {
    useNfsFamilyStyles({ callout: calloutCss });
  }
}

@Directive({ selector: '[nfsMenu]', host: { class: 'menu', 'data-nfs-styles': 'menu' } })
export class NfsMenu {
  constructor() {
    useNfsFamilyStyles({ menu: menuCss });
  }
}

/** Depends on the menu family's rules, so it carries both strings. */
@Directive({
  selector: '[nfsDropdownMenu]',
  host: { class: 'dropdown menu', 'data-nfs-styles': 'menu dropdown-menu' },
})
export class NfsDropdownMenu {
  constructor() {
    useNfsFamilyStyles({ menu: menuCss, 'dropdown-menu': dropdownMenuCss });
  }
}
