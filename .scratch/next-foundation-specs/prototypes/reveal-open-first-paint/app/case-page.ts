// THROWAWAY fixture page. Query parameters (component input binding):
//   variant=spec|candidate  diverge=1 (server open, client closed)  adopt=0  modal=1
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, input, signal } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ProbeReveal, ProbeToggle } from './probe-reveal';

@Component({
  selector: 'app-case-page',
  imports: [ProbeReveal, ProbeToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p><button type="button" class="button" id="bump" (click)="bump()">Bump {{ n() }}</button></p>
    <p><label>Search <input type="search" id="search" /></label></p>
    <button type="button" class="button" id="trigger" [probeToggle]="note" aria-haspopup="dialog" aria-controls="note">
      Note
    </button>
    <dialog
      probeReveal
      #note="probeReveal"
      id="note"
      aria-label="Note"
      [overlay]="modal() === '1'"
      [isOpen]="initialOpen()"
      [variant]="variant() ?? 'candidate'"
      [adopt]="adopt() !== '0'"
    >
      <p>Server-rendered note.</p>
      <button type="button" class="close-button" id="note-close" aria-label="Close note" (click)="note.close()">
        <span aria-hidden="true">&times;</span>
      </button>
      <form method="dialog"><button type="submit" class="button" id="note-form-close" value="form">Close (form)</button></form>
    </dialog>
    <p id="after">Page content after the dialog.</p>
  `,
})
export class CasePage {
  readonly variant = input<string | undefined>();
  readonly diverge = input<string | undefined>();
  readonly adopt = input<string | undefined>();
  readonly modal = input<string | undefined>();

  readonly #server = isPlatformServer(inject(PLATFORM_ID));
  protected readonly initialOpen = computed(() => (this.diverge() === '1' ? this.#server : true));
  protected readonly n = signal(0);

  protected bump(): void {
    this.n.update((v) => v + 1);
  }
}
