import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NfsSmoothScroll } from '../../nfs/smooth-scroll';

/** The forgotten directive repeats in @for; rows are added by a click. */
@Component({
  selector: 'app-for-case',
  imports: [NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a nfsSmoothScroll href="#top">Imported smooth scroll</a>
    <button type="button" (click)="add()">Add</button>
    <ul>
      @for (item of items(); track item) {
        <li><button nfsButton>For missing {{ item }}</button></li>
      }
    </ul>
  `,
})
export class ForCase {
  protected readonly items = signal([1]);

  protected add(): void {
    this.items.update((items) => [...items, items.length + 1]);
  }
}
