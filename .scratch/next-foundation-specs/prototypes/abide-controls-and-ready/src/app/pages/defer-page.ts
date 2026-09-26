// PROTOTYPE fixture: case 3's `@defer (hydrate on interaction)` route. The form is server-
// rendered inside the deferred block (hydrate triggers still SSR their content) but does not
// hydrate until the first click or keydown inside it.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReadyGateForm } from './ready-gate-form';

@Component({
  selector: 'app-defer-page',
  imports: [ReadyGateForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid-container">
      <h1 class="h4">PROTOTYPE: ready gate, &#64;defer (hydrate on interaction)</h1>
      @defer (hydrate on interaction) {
        <app-ready-gate-form />
      } @placeholder {
        <p>Loading form...</p>
      }
    </main>
  `,
})
export class DeferPage {}
