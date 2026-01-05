import { Injectable, inject, DestroyRef, Provider } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NfsStyleLoader } from '../lib/core/nfs-style-loader.service';

interface StyleLinkRef {
  element: HTMLLinkElement;
  count: number;
}

/**
 * Storybook-specific style loader that disables precompiled stylesheets
 * when runtime theming is active.
 *
 * **Why this exists**: In Storybook, we use runtime Sass compilation to enable
 * live theme customization. When runtime theming is active, we inject compiled
 * CSS into a `<style id="nfs-runtime-theme">` element. However, components also
 * dynamically load their precompiled CSS via `NfsStyleLoader`, which would
 * override the runtime-compiled CSS due to CSS cascade order (same specificity,
 * later wins).
 *
 * **Solution**: This service checks if runtime theming is active (by looking for
 * the `nfs-runtime-theme` element with content) and creates stylesheet links
 * as `disabled` to prevent them from overriding the runtime theme.
 *
 * @example
 * ```typescript
 * // In Storybook's preview.ts applicationConfig
 * import { provideNfsStorybookStyleLoader } from '../src/storybook/nfs-storybook-style-loader';
 *
 * const preview: Preview = {
 *   decorators: [
 *     applicationConfig({
 *       providers: [provideNfsStorybookStyleLoader()],
 *     }),
 *   ],
 * };
 * ```
 */
@Injectable()
export class NfsStorybookStyleLoader {
  readonly #document = inject(DOCUMENT);
  readonly #linkRefs = new Map<string, StyleLinkRef>();

  constructor() {
    // Register cleanup when injector is destroyed
    inject(DestroyRef).onDestroy(() => this.#removeAllStylesheets());
  }

  /**
   * Checks if runtime theming is active by looking for the runtime theme element.
   * Runtime theming is considered active if the element exists AND has content.
   */
  #isRuntimeThemingActive(): boolean {
    const runtimeThemeEl = this.#document.getElementById('nfs-runtime-theme');
    return !!runtimeThemeEl?.textContent;
  }

  /**
   * Loads a stylesheet via `<link>` tag. Reference-counted for multiple instances.
   *
   * If runtime theming is active (Storybook's live theme preview), the link is
   * created but immediately disabled to avoid overriding the runtime-compiled CSS.
   *
   * @param id Unique identifier for the stylesheet (e.g., 'accordion')
   * @param href URL path to the CSS file (e.g., '/nfs-accordion.css')
   */
  load(id: string, href: string): void {
    const existing = this.#linkRefs.get(id);
    if (existing) {
      existing.count++;
      return;
    }

    const link = this.#document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = `nfs-style-${id}`;

    // Disable immediately if runtime theming is active
    // This prevents precompiled CSS from overriding runtime-compiled CSS
    if (this.#isRuntimeThemingActive()) {
      link.disabled = true;
    }

    this.#document.head.appendChild(link);
    this.#linkRefs.set(id, { element: link, count: 1 });
  }

  /**
   * Decrements reference count and removes `<link>` when no instances remain.
   *
   * Safe to call even if the stylesheet was never loaded (no-op).
   *
   * @param id Unique identifier for the stylesheet
   */
  unload(id: string): void {
    const existing = this.#linkRefs.get(id);
    if (!existing) return;

    existing.count--;
    if (existing.count === 0) {
      existing.element.remove();
      this.#linkRefs.delete(id);
    }
  }

  #removeAllStylesheets(): void {
    for (const [, ref] of this.#linkRefs) {
      ref.element.remove();
    }
    this.#linkRefs.clear();
  }
}

/**
 * Provides `NfsStorybookStyleLoader` in place of `NfsStyleLoader`.
 *
 * Use this in Storybook's preview.ts to ensure runtime theming works correctly.
 * When runtime theming is active, precompiled component stylesheets are disabled
 * to prevent them from overriding the runtime-compiled CSS.
 *
 * @example
 * ```typescript
 * // preview.ts
 * import { applicationConfig } from '@storybook/angular';
 * import { provideNfsStorybookStyleLoader } from '../src/storybook/nfs-storybook-style-loader';
 *
 * const preview: Preview = {
 *   decorators: [
 *     applicationConfig({
 *       providers: [provideNfsStorybookStyleLoader()],
 *     }),
 *   ],
 * };
 * ```
 */
export function provideNfsStorybookStyleLoader(): Provider {
  return {
    provide: NfsStyleLoader,
    useClass: NfsStorybookStyleLoader,
  };
}
