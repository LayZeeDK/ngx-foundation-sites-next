// PROTOTYPE fixture: case 1 (control kinds) and case 2 (pre-hydration value adoption).
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveAbideForm } from '../reactive-abide-form';
import { SignalAbideForm } from '../signal-abide-form';

@Component({
  selector: 'app-home-page',
  imports: [SignalAbideForm, ReactiveAbideForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid-container">
      <h1 class="h3">PROTOTYPE: Abide control kinds, value adoption, and the ready gate</h1>
      <app-signal-abide-form key="change" heading="Default policy (validateOn fieldChange)" />
      <app-signal-abide-form key="live" heading="liveValidate" [live]="true" />
      <app-signal-abide-form key="blur" heading="validateOnBlur" [blur]="true" />
      <app-signal-abide-form
        key="cvfallback"
        heading="Default policy, controlValue.set() adoption fallback"
        [adoption]="'controlValue'"
      />
      <app-reactive-abide-form />
    </main>
  `,
})
export class HomePage {}
