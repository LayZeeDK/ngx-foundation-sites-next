// PROTOTYPE (ticket 190, option S): ticket 192's proposal A. Each family directive module
// statically imports its family's CSS (`nfs-family-css:<family>`, compiled by the library's esbuild
// plugin with the consumer's settings) and registers it here at module evaluation. The library
// inserts its own counted `<style data-nfs-family>` in the same task as the host element, on the
// server too; the client adopts the server element. Unload uses 188's host timing. This is the
// `<link>` loader of options L and LP (link-styles.ts) with the `<link>` swapped for a `<style>`.
import {
  DestroyRef,
  DOCUMENT,
  ElementRef,
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
  PLATFORM_ID,
  Type,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Kept so the carrier map files still type-check; this build uses an empty map. */
export type NfsFamilyCarriers = Readonly<
  Record<string, Type<unknown> | (() => Promise<{ default: Type<unknown> }>)>
>;

/** Host attribute every family directive sets, so the client can find server-rendered instances. */
export const nfsStylesAttribute = 'data-nfs-styles';
/** Marks the `<style>` the library owns for a family. */
const familyAttribute = 'data-nfs-family';

/** CSS strings that directive modules register when they are evaluated (static imports). */
const nfsFamilyCss = new Map<string, string>();

export function registerNfsFamilyCss(family: string, css: string): void {
  nfsFamilyCss.set(family, css);
}

/** No provider is needed; this no-op keeps app.config unchanged across builds. */
export function provideNfsFamilyStyles(
  _carriers: NfsFamilyCarriers,
  _options: { prefetch?: 'idle' } = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

@Injectable({ providedIn: 'root' })
export class NfsFamilyStyles {
  readonly #document = inject(DOCUMENT);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  /** Released hosts still in the DOM (188's host timing), for example inside a leaving ancestor. */
  readonly #leaving = new Map<string, Set<Element>>();
  #observer: MutationObserver | null = null;
  readonly #live = new Map<string, Set<Element>>();
  readonly #serverHeld = new Map<string, Set<Element>>();
  readonly #elements = new Map<string, HTMLElement>();

  constructor() {
    if (this.#browser) {
      // PROTOTYPE instrumentation (ticket 190): this loader has no whenStable hook of its own.
      const times = ((globalThis as any).__nfsTimes ??= {});
      times.serviceStart = performance.now();

      // Adopt what the server rendered, so hydration inserts nothing.
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

  acquire(host: Element, families: readonly string[]): void {
    for (const family of families) {
      this.#serverHeld.get(family)?.delete(host);
      this.#leaving.get(family)?.delete(host);
      this.#set(this.#live, family).add(host);
    }

    for (const family of families) {
      this.#insert(family);
    }
  }

  release(host: Element, families: readonly string[]): void {
    for (const family of families) {
      this.#live.get(family)?.delete(host);

      if (this.#browser) {
        this.#set(this.#leaving, family).add(host);
      }
    }

    if (this.#browser) {
      this.#observe();
      void nextFrame().then(() => this.#checkAll());
    }

    this.#maybeUnload(families);
  }

  #maybeUnload(families: Iterable<string>): void {
    for (const family of new Set(families)) {
      if (this.#count(family) === 0 && this.#elements.has(family)) {
        const element = this.#elements.get(family);
        element?.parentNode?.removeChild(element);
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
    this.#maybeUnload(this.#leaving.keys());

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

  #insert(family: string): void {
    if (this.#elements.has(family)) {
      return;
    }

    const style = this.#document.createElement('style');
    style.setAttribute(familyAttribute, family);
    style.textContent = nfsFamilyCss.get(family) ?? '';
    this.#document.head.appendChild(style); // the server DOM (domino) has no append()
    this.#elements.set(family, style);
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

/** Called from a family directive's constructor. */
export function useNfsFamilyStyles(...families: string[]): void {
  const styles = inject(NfsFamilyStyles);
  const host = inject(ElementRef).nativeElement as Element;
  styles.acquire(host, families);
  inject(DestroyRef).onDestroy(() => styles.release(host, families));
}

/** Not used here (184's measurement 10 only). */
export function useNfsFamilyStylesPerInstance(_family: string): void {}
