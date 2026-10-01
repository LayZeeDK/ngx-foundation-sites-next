import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { NfsCallout, NfsCalloutPerInstance } from '../lib/directives';

@Component({
  selector: 'nfs-bench-page',
  imports: [NfsCallout, NfsCalloutPerInstance],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="none" (click)="mode.set('none')">none</button>
    <button id="family" (click)="mode.set('family')">one carrier per family</button>
    <button id="instance" (click)="mode.set('instance')">one carrier per instance</button>
    @switch (mode()) {
      @case ('family') {
        @for (i of items(); track i) {
          <span nfsCallout>{{ i }}</span>
        }
      }
      @case ('instance') {
        @for (i of items(); track i) {
          <span nfsCalloutPerInstance>{{ i }}</span>
        }
      }
    }
  `,
})
export class BenchPage {
  readonly n = input(1000, { transform: numberAttribute });
  protected readonly mode = signal<'none' | 'family' | 'instance'>('none');
  protected readonly items = computed(() => Array.from({ length: this.n() }, (_, i) => i));
}
