import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsButton } from '../../nfs/button';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** Incremental hydration: imported, inside a block that hydrates on interaction. */
@Component({
  selector: 'app-hydrate-ok',
  imports: [NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (hydrate on interaction) {
      <button nfsButton>Hydrate imported</button>
    }
  `,
})
export class HydrateOk {}

/** Not imported, inside a block that hydrates on interaction. */
@Component({
  selector: 'app-hydrate-missing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (hydrate on interaction) {
      <button nfsButton>Hydrate missing</button>
    }
  `,
})
export class HydrateMissing {}

/** Not imported, inside a block that never hydrates. */
@Component({
  selector: 'app-hydrate-never',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (hydrate never) {
      <button nfsButton>Never hydrated missing</button>
    }
  `,
})
export class HydrateNever {}

@Component({
  selector: 'app-hydrate-case',
  imports: [HydrateOk, HydrateMissing, HydrateNever, NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a nfsSmoothScroll href="#top">Imported smooth scroll</a>
    <app-hydrate-ok />
    <app-hydrate-missing />
    <app-hydrate-never />
  `,
})
export class HydrateCase {}
