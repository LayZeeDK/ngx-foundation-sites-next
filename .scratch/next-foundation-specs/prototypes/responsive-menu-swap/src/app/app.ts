import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PassRecorder, nfsLog } from './instrument';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<main><router-outlet /></main>',
})
export class App {
  constructor() {
    // PROTOTYPE instrumentation: the per-pass recorder is created before anything renders.
    inject(PassRecorder);
    afterNextRender(() => nfsLog({ kind: 'app-rendered' }));
  }
}
