import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsButton } from '../../nfs/button';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** NfsButton imported and used only inside @defer, so it is a lazily loaded dependency. */
@Component({
  selector: 'app-defer-ok',
  imports: [NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (on timer(300ms)) {
      <button nfsButton>Deferred imported</button>
    } @placeholder {
      <p>ok placeholder</p>
    }
  `,
})
export class DeferOk {}

/** NfsButton not imported; the markup appears only when the block loads. */
@Component({
  selector: 'app-defer-missing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (on timer(300ms)) {
      <button nfsButton>Deferred missing</button>
    } @placeholder {
      <p>missing placeholder</p>
    }
  `,
})
export class DeferMissing {}

@Component({
  selector: 'app-defer-case',
  imports: [DeferOk, DeferMissing, NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a nfsSmoothScroll href="#top">Imported smooth scroll</a>
    <app-defer-ok />
    <app-defer-missing />
  `,
})
export class DeferCase {}
