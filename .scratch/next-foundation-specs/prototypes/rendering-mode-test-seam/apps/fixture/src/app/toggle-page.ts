import { Component } from '@angular/core';
import { NfsToggle } from '@nfs/ui';
import { DeferredPanel } from './deferred-panel';

/** PROTOTYPE: the one prerendered route of the rendering-mode fixture app. */
@Component({
  selector: 'nfs-toggle-page',
  imports: [NfsToggle, DeferredPanel],
  template: `
    <h1>Rendering-mode fixture</h1>
    <button type="button" nfsToggle id="closed">Closed at first paint</button>
    <button type="button" nfsToggle id="open" [active]="true">Open at first paint</button>

    @defer (hydrate on interaction) {
      <nfs-deferred-panel />
    } @placeholder {
      <span>placeholder</span>
    }
  `,
})
export class TogglePage {}
