import { DOCUMENT } from '@angular/common';
import { inject, Injectable, InjectionToken } from '@angular/core';

/**
 * Injection token to customize the base path for component stylesheets.
 *
 * By default, styles are loaded from `/assets/ngx-foundation-sites/`.
 *
 * @example
 * ```typescript
 * // In app.config.ts
 * providers: [
 *   { provide: NFS_STYLE_BASE_PATH, useValue: '/assets/my-custom-path' }
 * ]
 * ```
 */
export const NFS_STYLE_BASE_PATH = new InjectionToken<string>(
  'NFS_STYLE_BASE_PATH',
);

/**
 * Service that dynamically loads component stylesheets at runtime.
 *
 * This service enables consumer-controlled theming by loading CSS files that were
 * compiled in the consumer's build with their Sass variable overrides applied.
 *
 * ## Why This Pattern?
 *
 * Angular library components with `styleUrl` have their styles pre-compiled during
 * the library build. This means consumer's Sass variable overrides (`$primary-color`,
 * `$button-radius`, etc.) cannot affect the component styles.
 *
 * By removing `styleUrl` from components and using this service, we enable:
 * 1. **Consumer theming** - SCSS is compiled in consumer's build with their config
 * 2. **Lazy loading** - Styles only load when component is first used
 * 3. **Foundation compatibility** - Full access to `scale-color()` and other Sass functions
 *
 * ## Consumer Setup
 *
 * Consumers configure their `angular.json` to compile component SCSS with `inject: false`:
 *
 * ```json
 * {
 *   "styles": [
 *     {
 *       "input": "node_modules/ngx-foundation-sites/scss/accordion.scss",
 *       "bundleName": "assets/ngx-foundation-sites/accordion",
 *       "inject": false
 *     }
 *   ]
 * }
 * ```
 *
 * The compiled CSS lands at `/assets/ngx-foundation-sites/accordion.css`, which this
 * service loads when the accordion component is first instantiated.
 *
 * @usageNotes
 *
 * Components call this service in their constructor:
 *
 * ```typescript
 * @Component({
 *   selector: 'nfs-accordion',
 *   templateUrl: './accordion.html',
 *   // NO styleUrl - styles loaded dynamically
 *   encapsulation: ViewEncapsulation.None,
 * })
 * export class NfsAccordion {
 *   constructor() {
 *     inject(NfsStyleLoader).load('accordion');
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NfsStyleLoader {
  readonly #document = inject(DOCUMENT);
  readonly #loadedStyles = new Set<string>();
  readonly #basePath =
    inject(NFS_STYLE_BASE_PATH, { optional: true }) ??
    '/assets/ngx-foundation-sites';

  /**
   * Load a component stylesheet from the conventional path.
   *
   * Styles are loaded by appending a `<link>` element to `<head>`.
   * Subsequent calls for the same component are no-ops.
   *
   * @param componentName - The component identifier (e.g., 'accordion', 'button')
   *
   * @example
   * ```typescript
   * // In component constructor
   * inject(NfsStyleLoader).load('accordion');
   * // Loads: /assets/ngx-foundation-sites/accordion.css
   * ```
   */
  load(componentName: string): void {
    if (this.#loadedStyles.has(componentName)) {
      return;
    }
    this.#loadedStyles.add(componentName);

    const link = this.#document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${this.#basePath}/${componentName}.css`;
    this.#document.head.appendChild(link);
  }

  /**
   * Check if a component's styles have already been loaded.
   *
   * @param componentName - The component identifier to check
   * @returns `true` if styles have been loaded, `false` otherwise
   */
  isLoaded(componentName: string): boolean {
    return this.#loadedStyles.has(componentName);
  }
}
