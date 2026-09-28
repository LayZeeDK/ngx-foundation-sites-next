import { ChangeDetectionStrategy, Component } from '@angular/core';

/** No library directive is instantiated anywhere on the page. */
@Component({
  selector: 'app-none-case',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button nfsButton>None instantiated</button>
    <a nfsSmoothScroll href="#top">Behaviour missing</a>
  `,
})
export class NoneCase {}
