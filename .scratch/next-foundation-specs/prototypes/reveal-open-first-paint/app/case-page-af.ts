// THROWAWAY fixture: a static `autoFocus`-style attribute on the host is HTML's `autofocus`.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProbeReveal, ProbeToggle } from './probe-reveal';

@Component({
  selector: 'app-case-page-af',
  imports: [ProbeReveal, ProbeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="button" id="trigger" [probeToggle]="note" aria-haspopup="dialog" aria-controls="note">
      Note
    </button>
    <dialog probeReveal #note="probeReveal" id="note" aria-label="Note" autofocus="first-heading" [overlay]="false" [isOpen]="true">
      <h2 id="note-title">Note</h2>
      <button type="button" class="close-button" id="note-close" aria-label="Close note" (click)="note.close()">
        <span aria-hidden="true">&times;</span>
      </button>
    </dialog>
  `,
})
export class CasePageAf {}
