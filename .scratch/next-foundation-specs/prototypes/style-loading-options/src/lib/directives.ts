// PROTOTYPE of library directives. Each sets Foundation's class and loads its families' styles.
import { Directive } from '@angular/core';
import { useNfsFamilyStyles, useNfsFamilyStylesPerInstance } from './family-styles';

@Directive({ selector: '[nfsButton]', host: { class: 'button', 'data-nfs-styles': 'button' } })
export class NfsButton {
  constructor() {
    useNfsFamilyStyles('button');
  }
}

@Directive({ selector: '[nfsCallout]', host: { class: 'callout', 'data-nfs-styles': 'callout' } })
export class NfsCallout {
  constructor() {
    useNfsFamilyStyles('callout');
  }
}

@Directive({ selector: '[nfsMenu]', host: { class: 'menu', 'data-nfs-styles': 'menu' } })
export class NfsMenu {
  constructor() {
    useNfsFamilyStyles('menu');
  }
}

/** Depends on the menu family's rules, which must come first in the cascade. */
@Directive({
  selector: '[nfsDropdownMenu]',
  host: { class: 'dropdown menu', 'data-nfs-styles': 'menu dropdown-menu' },
})
export class NfsDropdownMenu {
  constructor() {
    useNfsFamilyStyles('menu', 'dropdown-menu');
  }
}

/** PROTOTYPE ONLY: inserts the dropdown-menu sheet before the menu sheet (measurement 4). */
@Directive({
  selector: '[nfsDropdownMenuReversed]',
  host: { class: 'dropdown menu', 'data-nfs-styles': 'dropdown-menu menu' },
})
export class NfsDropdownMenuReversed {
  constructor() {
    useNfsFamilyStyles('dropdown-menu', 'menu');
  }
}

/** PROTOTYPE ONLY: research M1, one carrier per instance (measurement 10, eager build). */
@Directive({ selector: '[nfsCalloutPerInstance]', host: { class: 'callout' } })
export class NfsCalloutPerInstance {
  constructor() {
    useNfsFamilyStylesPerInstance('callout');
  }
}

/** Ticket 190: the dropdown pane family, whose first use comes from a click. */
@Directive({
  selector: '[nfsDropdownPane]',
  host: { class: 'dropdown-pane', 'data-nfs-styles': 'dropdown' },
})
export class NfsDropdownPane {
  constructor() {
    useNfsFamilyStyles('dropdown');
  }
}
