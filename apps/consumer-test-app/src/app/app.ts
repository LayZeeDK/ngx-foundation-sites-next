import { Component } from '@angular/core';
import {
  NfsAccordion,
  NfsAccordionItemDef,
  NfsAccordionHeaderDef,
  NfsAccordionContentDef,
  NfsButton,
} from 'ngx-foundation-sites';

/**
 * Consumer Test App
 *
 * This app is designed for e2e testing of consumer Sass theming.
 * Each element has data-testid attributes for reliable test selectors.
 *
 * Test scenarios:
 * 1. Theme colors - buttons should show custom palette colors
 * 2. Global radius - buttons should have 8px border-radius
 * 3. RTL support - layout should mirror in RTL configuration
 * 4. Lazy-loaded styles - accordion/button CSS should load on demand
 */
@Component({
  selector: 'app-root',
  imports: [
    NfsAccordion,
    NfsAccordionItemDef,
    NfsAccordionHeaderDef,
    NfsAccordionContentDef,
    NfsButton,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'Consumer Test App';
}
