import {
  AnimationCallbackEvent,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { NfsCallout } from '../lib/directives';

@Component({
  selector: 'nfs-lifecycle-page',
  imports: [NfsCallout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- PROTOTYPE probe: a plain .callout with no directive; 44px means the family CSS applies. -->
    <div class="callout" id="probe" hidden></div>
    <button id="add" (click)="count.set(count() + 1)">add callout</button>
    <button id="remove" (click)="count.set(count() - 1)">remove callout</button>
    <button id="leaving" (click)="leaving.set(!leaving())">toggle callout in a leaving element</button>
    <button id="other" (click)="other.set(!other())">toggle unrelated leaving box</button>
    <button id="listener" (click)="listener.set(!listener())">toggle (animate.leave) box</button>
    @for (i of items(); track i) {
      <div nfsCallout class="c-item">callout {{ i }}</div>
    }
    @if (leaving()) {
      <div animate.leave="proto-fade-out" id="leaving-wrap">
        <div nfsCallout id="leaving-callout">callout inside a leaving element</div>
      </div>
    }
    @if (other()) {
      <div animate.leave="proto-fade-out" id="other-box">unrelated leaving box</div>
    }
    @if (listener()) {
      <div (animate.leave)="done($event)" id="listener-box">box with an (animate.leave) listener</div>
    }
  `,
})
export class LifecyclePage {
  /** `?n=` server-renders that many callouts (ticket 188 SSR checks). */
  readonly n = input<string>();
  protected readonly count = linkedSignal(() => Number(this.n() ?? 0));
  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
  protected readonly leaving = signal(false);
  protected readonly other = signal(false);
  protected readonly listener = signal(false);

  protected done(event: AnimationCallbackEvent): void {
    event.animationComplete();
  }
}
