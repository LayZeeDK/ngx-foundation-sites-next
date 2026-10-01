import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'nfs-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<router-outlet />',
})
export class App {
  constructor() {
    // PROTOTYPE instrumentation (ticket 190), every build: when the app is stable (no pending task,
    // such as a carrier chunk the server-rendered page needs). Pages record `hydrated`.
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      void inject(ApplicationRef)
        .whenStable()
        .then(() => (((globalThis as any).__nfsTimes ??= {}).stable = performance.now()));
    }
  }
}
