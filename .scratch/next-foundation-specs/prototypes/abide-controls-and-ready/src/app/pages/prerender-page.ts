// PROTOTYPE fixture: case 3's prerendered route.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReadyGateForm } from './ready-gate-form';

@Component({
  selector: 'app-prerender-page',
  imports: [ReadyGateForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid-container">
      <h1 class="h4">PROTOTYPE: ready gate, prerendered route</h1>
      <app-ready-gate-form />
    </main>
  `,
})
export class PrerenderPage {}
