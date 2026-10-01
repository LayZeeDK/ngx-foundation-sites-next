// PROTOTYPE library runtime, trimmed from ticket 192's probe (`link-styles.ts`, plugin path only):
// a library-owned `<style data-nfs-family>` per family, inserted in the same task as the first host,
// on the server too; the client adopts the server element, holds server-rendered hosts until a
// directive claims them, and removes the element with ticket 188's host timing.
import { DestroyRef, DOCUMENT, ElementRef, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Host attribute every family directive sets, so the client can find server-rendered instances. */
const nfsStylesAttribute = 'data-nfs-styles';
/** Marks the `<style>` the library owns for a family. */
const familyAttribute = 'data-nfs-family';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

@Injectable({ providedIn: 'root' })
export class NfsFamilyStyles {
  readonly #document = inject(DOCUMENT);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  /** Live directive hosts per family. */
  readonly #live = new Map<string, Set<Element>>();
  /** Server-rendered hosts per family that no directive has claimed yet (dehydrated). */
  readonly #serverHeld = new Map<string, Set<Element>>();
  /** Released hosts still in the DOM, for example inside a leaving ancestor. */
  readonly #leaving = new Map<string, Set<Element>>();
  readonly #elements = new Map<string, HTMLElement>();
  #observer: MutationObserver | null = null;

  constructor() {
    if (this.#browser) {
      for (const el of this.#document.head.querySelectorAll<HTMLElement>(`[${familyAttribute}]`)) {
        this.#elements.set(el.getAttribute(familyAttribute)!, el);
      }

      for (const element of this.#document.querySelectorAll(`[${nfsStylesAttribute}]`)) {
        for (const family of element.getAttribute(nfsStylesAttribute)!.split(' ')) {
          this.#set(this.#serverHeld, family).add(element);
        }
      }
    }
  }

  acquire(host: Element, css: Readonly<Record<string, string>>): void {
    for (const [family, text] of Object.entries(css)) {
      this.#serverHeld.get(family)?.delete(host);
      this.#leaving.get(family)?.delete(host);
      this.#set(this.#live, family).add(host);

      if (!this.#elements.has(family)) {
        const style = this.#document.createElement('style');
        style.setAttribute(familyAttribute, family);
        style.textContent = text;
        this.#document.head.appendChild(style); // the server DOM (domino) has no append()
        this.#elements.set(family, style);
      }
    }
  }

  release(host: Element, families: readonly string[]): void {
    for (const family of families) {
      this.#live.get(family)?.delete(host);
      this.#set(this.#leaving, family).add(host);
    }

    if (this.#browser) {
      this.#observe();
      // Angular removes the DOM after the destroy hooks; look again once it has.
      void nextFrame().then(() => this.#checkAll());
    }

    this.#maybeUnload(families);
  }

  #maybeUnload(families: Iterable<string>): void {
    for (const family of families) {
      if (this.#count(family) === 0 && this.#elements.has(family)) {
        const element = this.#elements.get(family)!;
        element.parentNode?.removeChild(element);
        this.#elements.delete(family);
      }
    }
  }

  #observe(): void {
    if (!this.#observer) {
      this.#observer = new MutationObserver(() => this.#checkAll());
      this.#observer.observe(this.#document, { childList: true, subtree: true });
    }
  }

  #checkAll(): void {
    this.#maybeUnload([...this.#leaving.keys()]);

    if ([...this.#leaving.values()].every((set) => this.#pruned(set) === 0)) {
      this.#observer?.disconnect();
      this.#observer = null;
    }
  }

  #pruned(set: Set<Element> | undefined): number {
    for (const element of set ?? []) {
      if (!element.isConnected) {
        set!.delete(element);
      }
    }

    return set?.size ?? 0;
  }

  #count(family: string): number {
    return (
      (this.#live.get(family)?.size ?? 0) +
      this.#pruned(this.#serverHeld.get(family)) +
      this.#pruned(this.#leaving.get(family))
    );
  }

  #set(map: Map<string, Set<Element>>, family: string): Set<Element> {
    let set = map.get(family);

    if (!set) {
      set = new Set();
      map.set(family, set);
    }

    return set;
  }
}

/** Called from a family directive's constructor with the CSS its module imported. */
export function useNfsFamilyStyles(css: Readonly<Record<string, string>>): void {
  const styles = inject(NfsFamilyStyles);
  const host = inject(ElementRef).nativeElement as Element;
  styles.acquire(host, css);
  inject(DestroyRef).onDestroy(() => styles.release(host, Object.keys(css)));
}
