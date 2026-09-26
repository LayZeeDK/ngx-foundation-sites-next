// PROTOTYPE (throwaway): the widget in a `@defer (hydrate on viewport)` block below the fold.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NfsMediaQuery } from './nfs/media-query';
import { Widget } from './widget';

@Component({
  selector: 'app-deferred-demo',
  imports: [Widget],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid-container">
      <h1>Prototype: ResponsiveAccordionTabs in a hydrate-on-viewport block</h1>
      <p data-testid="page-breakpoint">page breakpoint={{ mq.current() }}</p>
      <p><button type="button" class="button" data-testid="before">Focusable before the widget</button></p>
      <div data-testid="spacer" style="height: 2000px">Scroll down</div>
      @defer (hydrate on viewport) {
        <app-widget />
      } @placeholder {
        <p>placeholder</p>
      }
    </main>
  `,
})
export class DeferredDemo {
  // The service goes live with the page, before the block below hydrates (as when
  // another breakpoint-gated widget sits above the fold).
  protected readonly mq = inject(NfsMediaQuery);
}
