import { afterNextRender, ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { ReactiveAbideForm } from './reactive-abide-form';
import { SignalAbideForm } from './signal-abide-form';

@Component({
  selector: 'app-root',
  imports: [SignalAbideForm, ReactiveAbideForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid-container">
      <h1 class="h3">PROTOTYPE: Signal Forms on Abide markup</h1>
      <app-signal-abide-form key="change" heading="Default policy (validateOn fieldChange)" />
      <app-signal-abide-form key="live" heading="liveValidate" [live]="true" />
      <app-signal-abide-form key="blur" heading="validateOnBlur" [blur]="true" />
      <app-signal-abide-form key="off" heading="Default policy with the prototype fixes off" [fixes]="false" />
      <app-reactive-abide-form />
    </main>
  `,
})
export class App {
  constructor() {
    // Test hook: marks the document once the app has hydrated and rendered.
    const doc = inject(DOCUMENT);
    afterNextRender(() => doc.documentElement.setAttribute('data-hydrated', ''));
  }
}
