// PROTOTYPE -- server render and open-by-default: `isOpen` starts true, the server writes a closed
// `<dialog class="reveal">` with its content, and the directive calls `showModal()` after hydration.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NfsReveal } from './reveal';

@Component({
  selector: 'app-open-by-default',
  imports: [NfsReveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="button" id="open-obd" (click)="obd.open()">Open again</button>
    <dialog class="reveal" id="obd" nfsReveal #obd="nfsReveal" [isOpen]="true" aria-labelledby="obd-title">
      <h2 id="obd-title">Open by default</h2>
      <p id="obd-content">Server-rendered dialog content, present for crawlers and no-JS readers.</p>
      <button type="button" class="close-button" aria-label="Close modal" id="obd-close" (click)="obd.close()">
        <span aria-hidden="true">&times;</span>
      </button>
    </dialog>
  `,
})
export class OpenByDefault {}
