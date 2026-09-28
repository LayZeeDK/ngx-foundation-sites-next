import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** NfsButton forgotten while the consumer also copied Foundation's class by hand. */
@Component({
  selector: 'app-copied-case',
  imports: [NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button nfsButton class="button">Copied class missing</button>
    <a nfsSmoothScroll href="#top">Imported smooth scroll</a>
  `,
})
export class CopiedCase {}
