import { Component } from '@angular/core';
import { DeferredBox } from './deferred-box';

/**
 * PROTOTYPE (throwaway) -- animate.enter at hydration inside @defer (hydrate on ...)
 * blocks. Both blocks render their main content on the server (a hydrate
 * trigger makes @defer render main content, not @placeholder, per
 * research/angular-rendering-modes.md section 3), so the element with
 * animate.enter is present in server HTML in both cases.
 */
@Component({
  selector: 'app-defer',
  imports: [DeferredBox],
  template: `
    <h1>Defer hydration harness</h1>

    <section>
      <h2>hydrate on interaction</h2>
      @defer (hydrate on interaction) {
        <app-deferred-box testId="case2-interaction" />
      } @placeholder {
        <div data-testid="ph-interaction">placeholder (should not be visible: hydrate triggers render main content on the server)</div>
      }
    </section>

    <section>
      <h2>hydrate on viewport</h2>
      <div style="height: 150vh;">scroll down</div>
      @defer (hydrate on viewport) {
        <app-deferred-box testId="case2-viewport" />
      } @placeholder {
        <div data-testid="ph-viewport">placeholder (should not be visible)</div>
      }
    </section>
  `,
})
export class DeferPage {}
