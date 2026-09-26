import { Component, DOCUMENT, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: '<router-outlet />',
})
export class App {
  constructor() {
    // Fixture only: lets the tests wait for hydration before interacting.
    const doc = inject(DOCUMENT);
    afterNextRender(() => doc.body.setAttribute('data-hydrated', ''));
  }
}
