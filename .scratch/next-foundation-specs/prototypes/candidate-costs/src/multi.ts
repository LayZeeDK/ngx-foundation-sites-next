// PROTOTYPE 198, point 3: two Angular applications bootstrapped on one document (`/multi`,
// client-rendered). Each root shows the families the measurement script switches on through
// `window.__multi.A` and `window.__multi.B`; `window.__multi.a.destroy()` unloads application A.
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  provideBrowserGlobalErrorListeners,
  signal,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NfsButton, NfsCallout, NfsMenu } from './lib/directives';
import { multiProviders } from './multi-providers';

const template = `
  @if (callout()) {
    <div nfsCallout class="m-callout">callout</div>
  }
  @if (button()) {
    <button nfsButton type="button" class="m-button">button</button>
  }
  @if (menu()) {
    <ul nfsMenu class="m-menu"><li><a href="#">one</a></li></ul>
  }
`;

abstract class MultiRoot {
  readonly callout = signal(false);
  readonly button = signal(false);
  readonly menu = signal(false);
}

@Component({
  selector: 'nfs-multi-a',
  imports: [NfsButton, NfsCallout, NfsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template,
})
class MultiA extends MultiRoot {}

@Component({
  selector: 'nfs-multi-b',
  imports: [NfsButton, NfsCallout, NfsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template,
})
class MultiB extends MultiRoot {}

declare global {
  interface Window {
    __multi?: { a: ApplicationRef; b: ApplicationRef; A: MultiRoot; B: MultiRoot };
  }
}

export async function bootstrapMulti(): Promise<void> {
  document.querySelector('nfs-root')?.remove();

  for (const tag of ['nfs-multi-a', 'nfs-multi-b']) {
    document.body.appendChild(document.createElement(tag));
  }

  const providers = [provideBrowserGlobalErrorListeners(), ...multiProviders];
  const a = await bootstrapApplication(MultiA, { providers });
  const b = await bootstrapApplication(MultiB, { providers });
  window.__multi = {
    a,
    b,
    A: a.components[0].instance as MultiRoot,
    B: b.components[0].instance as MultiRoot,
  };
}
