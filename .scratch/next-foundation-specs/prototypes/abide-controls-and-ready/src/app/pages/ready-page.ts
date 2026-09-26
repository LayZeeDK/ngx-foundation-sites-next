// PROTOTYPE fixture: case 3's plain server-rendered (RenderMode.Server) route, isolated from
// the control-kind fixtures on '/' so the ready-gate form is the only "Ready gate" on the page.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReadyGateForm } from './ready-gate-form';

@Component({
  selector: 'app-ready-page',
  imports: [ReadyGateForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid-container">
      <h1 class="h4">PROTOTYPE: ready gate, server-rendered route</h1>
      <app-ready-gate-form />
    </main>
  `,
})
export class ReadyPage {}
