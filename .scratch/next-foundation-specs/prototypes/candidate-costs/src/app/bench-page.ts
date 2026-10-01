// PROTOTYPE 198, point 4: what the unload machinery costs with many directive hosts.
// `?n=` hosts. `?ssr=off|plain|loader` is what the server renders (and the client hydrates).
// `?keep=1` keeps one loader instance (`#keeper`) so the family CSS is present without the bench
// hosts; `?keep=0` drops it, so the bench hosts load and unload the family themselves.
// `plain-leave` and `loader-leave` put the hosts inside an element with a 600 ms `animate.leave`.
// `plain` hosts are `<div class="callout">` with no directive: the no-loader baseline.
// The measurement script drives `window.__bench.mode` and `window.__bench.keeper`.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  numberAttribute,
} from '@angular/core';
import { NfsCallout } from '../lib/directives';

@Component({
  selector: 'nfs-bench-page',
  imports: [NfsCallout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (keeper()) {
      <div nfsCallout id="keeper">keeper</div>
    }
    <div id="bench">
      @switch (mode()) {
        @case ('plain') {
          @for (i of items(); track i) {
            <div class="callout">{{ i }}</div>
          }
        }
        @case ('loader') {
          @for (i of items(); track i) {
            <div nfsCallout>{{ i }}</div>
          }
        }
        @case ('plain-leave') {
          <div animate.leave="proto-fade-out" id="leave-wrap">
            @for (i of items(); track i) {
              <div class="callout">{{ i }}</div>
            }
          </div>
        }
        @case ('loader-leave') {
          <div animate.leave="proto-fade-out" id="leave-wrap">
            @for (i of items(); track i) {
              <div nfsCallout>{{ i }}</div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class BenchPage {
  readonly n = input(1000, { transform: numberAttribute });
  readonly ssr = input('off');
  readonly keep = input('1');
  protected readonly mode = linkedSignal(() => this.ssr());
  protected readonly keeper = linkedSignal(() => this.keep() !== '0');
  protected readonly items = computed(() => Array.from({ length: this.n() }, (_, i) => i));

  constructor() {
    if (typeof window !== 'undefined') {
      (window as unknown as { __bench: BenchPage }).__bench = this;
    }
  }
}
