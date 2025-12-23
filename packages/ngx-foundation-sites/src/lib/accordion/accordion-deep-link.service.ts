import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Service for managing accordion deep linking via URL hash.
 *
 * Provides functionality to:
 * - Read the current URL hash to get a panel ID
 * - Update the URL hash when panels expand/collapse
 * - Scroll to panels after deep link activation
 */
@Injectable({ providedIn: 'root' })
export class AccordionDeepLinkService {
  readonly #document = inject(DOCUMENT);

  /**
   * Gets the panel ID from the current URL hash.
   * @returns The panel ID (without the # prefix) or null if no hash exists
   */
  getHashPanelId(): string | null {
    const hash = this.#document.location?.hash;
    return hash ? hash.slice(1) : null;
  }

  /**
   * Updates the URL hash with the given panel ID.
   * @param panelId - The panel ID to set in the hash
   * @param useHistory - If true, adds to browser history; if false, replaces current entry
   */
  updateHash(panelId: string, useHistory: boolean): void {
    const url = `#${panelId}`;
    if (useHistory) {
      history.pushState(null, '', url);
    } else {
      history.replaceState(null, '', url);
    }
  }

  /**
   * Clears the URL hash without triggering a page scroll.
   * @param useHistory - If true, adds to browser history; if false, replaces current entry
   */
  clearHash(useHistory: boolean): void {
    const url =
      this.#document.location?.pathname + this.#document.location?.search;
    if (useHistory) {
      history.pushState(null, '', url);
    } else {
      history.replaceState(null, '', url);
    }
  }

  /**
   * Scrolls to the panel element after a delay (for deep link smudge).
   * @param panelId - The panel ID to scroll to
   * @param delay - Delay in milliseconds before scrolling (allows animation to complete)
   */
  scrollToPanel(panelId: string, delay = 300): void {
    setTimeout(() => {
      const element = this.#document.getElementById(panelId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, delay);
  }

  /**
   * Listens for hash changes and calls the callback with the new panel ID.
   * @param callback - Function to call when hash changes
   * @returns Cleanup function to remove the listener
   */
  onHashChange(callback: (panelId: string | null) => void): () => void {
    const handler = () => {
      callback(this.getHashPanelId());
    };

    this.#document.defaultView?.addEventListener('hashchange', handler);

    return () => {
      this.#document.defaultView?.removeEventListener('hashchange', handler);
    };
  }
}
