import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export class App {
  constructor() {
    // Test hook: marks the document once the app has hydrated and rendered.
    const doc = inject(DOCUMENT);
    afterNextRender(() => doc.documentElement.setAttribute('data-hydrated', ''));
  }
}
