import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, input } from '@angular/core';
import { NfsButton } from '../../nfs/button';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** Renders a template it is given; imports NfsButton, which does not reach the given template. */
@Component({
  selector: 'app-outlet-host-importing',
  imports: [NgTemplateOutlet, NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container [ngTemplateOutlet]="tpl()" />`,
})
export class OutletHostImporting {
  readonly tpl = input.required<TemplateRef<unknown>>();
}

/** Renders a template it is given; imports nothing of the library. */
@Component({
  selector: 'app-outlet-host-plain',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-container [ngTemplateOutlet]="tpl()" />`,
})
export class OutletHostPlain {
  readonly tpl = input.required<TemplateRef<unknown>>();
}

/** Declares the template without importing NfsButton; the host that renders it imports it. */
@Component({
  selector: 'app-outlet-declarer-missing',
  imports: [OutletHostImporting],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #tpl><button nfsButton>Outlet missing</button></ng-template>
    <app-outlet-host-importing [tpl]="tpl" />
  `,
})
export class OutletDeclarerMissing {}

/** Declares the template and imports NfsButton; the host that renders it does not. */
@Component({
  selector: 'app-outlet-declarer-ok',
  imports: [OutletHostPlain, NfsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #tpl><button nfsButton>Outlet imported</button></ng-template>
    <app-outlet-host-plain [tpl]="tpl" />
  `,
})
export class OutletDeclarerOk {}

@Component({
  selector: 'app-outlet-case',
  imports: [OutletDeclarerMissing, OutletDeclarerOk, NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a nfsSmoothScroll href="#top">Imported smooth scroll</a>
    <app-outlet-declarer-missing />
    <app-outlet-declarer-ok />
  `,
})
export class OutletCase {}
