import { Component, input, model, output } from '@angular/core';
import { NfsDisclosure } from './disclosure';

/** PROTOTYPE: host component so the directive can be mounted as a component. */
@Component({
  selector: 'nfs-disclosure-host',
  imports: [NfsDisclosure],
  template: `
    <button nfsDisclosure="nfs-disclosure-panel" [(expanded)]="expanded" (toggled)="toggled.emit($event)">
      {{ label() }}
    </button>
    <div id="nfs-disclosure-panel" class="nfs-disclosure-panel" [hidden]="!expanded()">Panel content</div>
  `,
})
export class NfsDisclosureHost {
  readonly label = input('Details');
  readonly expanded = model(false);
  readonly toggled = output<boolean>();
}
