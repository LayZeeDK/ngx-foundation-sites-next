// PROTOTYPE -- root shell: a router-outlet so the RTL fixture (rule 12) can be
// a separate component with its own Foundation compile (rtl.scss), never
// sharing a page with the default LTR compile.
import { afterNextRender, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  constructor() {
    // Test hook: set once the client has hydrated and rendered.
    afterNextRender(() => document.body.setAttribute('data-hydrated', ''));
  }
}
