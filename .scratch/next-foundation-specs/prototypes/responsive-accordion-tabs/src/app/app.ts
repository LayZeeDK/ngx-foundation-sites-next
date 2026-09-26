// PROTOTYPE (throwaway). See ../../README.md.
import { ChangeDetectionStrategy, Component, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<router-outlet />',
})
export class App {
  constructor() {
    // PROTOTYPE instrumentation: the app's first render (hydration) has finished.
    afterNextRender(() => ((globalThis as { __appRendered?: number }).__appRendered = performance.now()));
  }
}
