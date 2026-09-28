import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsButton } from '../../nfs/button';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** Projects its content; imports NfsButton, which does not reach projected content. */
@Component({
  selector: 'app-panel-importing',
  imports: [NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section><ng-content /></section>`,
})
export class PanelImporting {}

/** Projects its content; imports nothing of the library. */
@Component({
  selector: 'app-panel-plain',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section><ng-content /></section>`,
})
export class PanelPlain {}

/** Declares the projected button without importing NfsButton. */
@Component({
  selector: 'app-projection-missing',
  imports: [PanelImporting],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-panel-importing><button nfsButton>Projected missing</button></app-panel-importing>`,
})
export class ProjectionMissing {}

/** Declares the projected button and imports NfsButton; the panel does not. */
@Component({
  selector: 'app-projection-ok',
  imports: [PanelPlain, NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-panel-plain><button nfsButton>Projected imported</button></app-panel-plain>`,
})
export class ProjectionOk {}

@Component({
  selector: 'app-projection-case',
  imports: [ProjectionMissing, ProjectionOk, NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a nfsSmoothScroll href="#top">Imported smooth scroll</a>
    <app-projection-missing />
    <app-projection-ok />
  `,
})
export class ProjectionCase {}
