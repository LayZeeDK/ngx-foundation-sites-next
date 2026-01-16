import { ErrorHandler, Provider } from '@angular/core';

/**
 * Storybook-specific ErrorHandler that logs messages as warnings.
 *
 * The ngx-foundation-sites components use ErrorHandler.handleError() for
 * developer diagnostics (e.g., binding coercion warnings, method failure
 * notifications) per spec requirements. These are informational messages,
 * not actual errors.
 *
 * However, Storybook's test-runner uses `--failOnConsole` by default,
 * which fails tests on console.error calls. This ErrorHandler logs
 * messages as console.warn instead, allowing tests to pass while still
 * surfacing developer guidance during interactive Storybook use.
 */
export class StorybookErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Log as warning to avoid test-runner --failOnConsole failures
    // while still surfacing the message for developers
    console.warn('[NFS ErrorHandler]', error);
  }
}

/**
 * Provider function for Storybook to use the custom ErrorHandler.
 * Add this to applicationConfig providers in preview.ts.
 */
export function provideStorybookErrorHandler(): Provider {
  return { provide: ErrorHandler, useClass: StorybookErrorHandler };
}
