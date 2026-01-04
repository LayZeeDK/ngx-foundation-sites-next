import { Injectable, inject, DestroyRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface StyleLinkRef {
  element: HTMLLinkElement;
  count: number;
}

/**
 * Service for dynamically loading component stylesheets via `<link>` tags.
 *
 * **Platform-scoped**: Uses `providedIn: 'platform'` to ensure a single instance
 * across all Angular roots. This is important in Storybook where each story
 * runs in its own root injector but should share stylesheet management.
 *
 * **Reference-counted**: First component instance loads the stylesheet,
 * last instance removes it on destroy.
 *
 * @example
 * ```typescript
 * export class MyComponent {
 *   readonly #styleLoader = inject(NfsStyleLoader);
 *   readonly #destroyRef = inject(DestroyRef);
 *
 *   constructor() {
 *     afterNextRender(() => {
 *       this.#styleLoader.load('my-component', '/nfs-my-component.css');
 *     });
 *
 *     this.#destroyRef.onDestroy(() => {
 *       this.#styleLoader.unload('my-component');
 *     });
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'platform' })
export class NfsStyleLoader {
  readonly #document = inject(DOCUMENT);
  readonly #linkRefs = new Map<string, StyleLinkRef>();

  constructor() {
    // Register cleanup when platform injector is destroyed
    inject(DestroyRef).onDestroy(() => this.#removeAllStylesheets());
  }

  /**
   * Loads a stylesheet via `<link>` tag. Reference-counted for multiple instances.
   *
   * If the stylesheet is already loaded, increments the reference count.
   * Otherwise, creates a new `<link>` element and appends it to `<head>`.
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
