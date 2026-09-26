// PROTOTYPE (throwaway): the widget at the top of the page.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Widget } from './widget';

@Component({
  selector: 'app-demo',
  imports: [Widget],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid-container">
      <h1>Prototype: ResponsiveAccordionTabs as one component</h1>
      <p><button type="button" class="button" data-testid="before">Focusable before the widget</button></p>
      <app-widget />
    </main>
  `,
})
export class Demo {}
