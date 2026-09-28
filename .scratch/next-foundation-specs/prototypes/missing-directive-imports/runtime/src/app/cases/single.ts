import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** A forgotten single directive (with a static input, which compiles silently); another
 * library directive on the page is imported. */
@Component({
  selector: 'app-single-case',
  imports: [NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button nfsButton size="small">Single missing</button>
    <a nfsSmoothScroll href="#top">Imported smooth scroll</a>
  `,
})
export class SingleCase {}
