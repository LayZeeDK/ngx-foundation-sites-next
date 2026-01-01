import { Injectable } from '@angular/core';

/**
 * Testing implementation of NfsStyleLoader for environments where
 * styles are bundled directly (e.g., Storybook, unit tests).
 *
 * In Storybook and test environments, component styles are compiled and
 * bundled via webpack's style configuration, so there's no need to
 * dynamically load CSS files. Using this service prevents 404 errors.
 *
 * @usageNotes
 *
 * Use the `provideNfsTesting()` function instead of manually configuring this service:
 *
 * ```typescript
 * import { applicationConfig } from '@storybook/angular';
 * import { provideNfsTesting } from 'ngx-foundation-sites/testing';
 *
 * const preview: Preview = {
 *   decorators: [
 *     applicationConfig({
 *       providers: [provideNfsTesting()]
 *     })
 *   ]
 * };
 * ```
 *
 * @see {@link provideNfsTesting}
 */
@Injectable()
export class NfsTestingStyleLoader {
  /** Track "loaded" styles for API compatibility */
  readonly #loadedStyles = new Set<string>();

  /**
   * No-op: Does nothing since styles are already bundled.
   * @param componentName - The component identifier (ignored)
   */
  load(componentName: string): void {
    // Simply track that we "loaded" it for isLoaded() compatibility
    this.#loadedStyles.add(componentName);
  }

  /**
   * Check if a component's styles have been "loaded".
   * @param componentName - The component identifier to check
   * @returns `true` if load() was called for this component
   */
  isLoaded(componentName: string): boolean {
    return this.#loadedStyles.has(componentName);
  }
}
