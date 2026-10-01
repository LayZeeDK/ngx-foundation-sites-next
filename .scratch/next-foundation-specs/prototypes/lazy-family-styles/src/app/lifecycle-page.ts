import {
  AnimationCallbackEvent,
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { NfsCallout } from '../lib/directives';

@Component({
  selector: 'nfs-lifecycle-page',
  imports: [NfsCallout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
  protected readonly count = signal(0);
  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
  protected readonly leaving = signal(false);
  protected readonly other = signal(false);
  protected readonly listener = signal(false);

  protected done(event: AnimationCallbackEvent): void {
    event.animationComplete();
  }
}
