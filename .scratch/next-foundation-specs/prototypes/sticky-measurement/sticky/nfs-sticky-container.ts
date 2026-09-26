import { Directive } from '@angular/core';

/**
 * Prototype only. Foundation's JavaScript sets the container's inline `height`
 * to hold the page layout while the sticky element is `position: fixed`
 * (js:63-64, 328-331 in foundation.sticky.js). Native `position: sticky` never
 * leaves flow, so the container needs no JS-managed height: this directive is
 * a class marker only, matching `[data-sticky-container]`.
 */
@Directive({
  selector: '[nfsStickyContainer]',
  host: { class: 'sticky-container' },
})
export class NfsStickyContainer {}
