// PROTOTYPE of library code: family styles from consumer-compiled, non-injected global style
// bundles (`styles: [{ input, bundleName: 'nfs-<family>', inject: false }]`), loaded through a
// counted `<link>` that the server renders and the client adopts. No provider and no consumer
// TypeScript: the service is `providedIn: 'root'` and starts with the first directive.
import {
  DestroyRef,
  DOCUMENT,
  ElementRef,
  inject,
  Injectable,
  PendingTasks,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { pluginLoaders } from './plugin-loaders';
import { protoBeastiesSkip, protoPreload, protoSource } from './switches';

/** Host attribute every family directive sets, so the client can find server-rendered instances. */
export const nfsStylesAttribute = 'data-nfs-styles';
/** Marks the `<link>` (or `<style>`, plugin variant) the library owns for a family. */
const familyAttribute = 'data-nfs-family';
/** Every family the library ships. */
const nfsFamilies = ['button', 'callout', 'menu', 'dropdown-menu'];

/**
 * PROTOTYPE switch, browser only (`?unload=`):
 * - `host` (default): ticket 188's host timing. A released host counts until it is disconnected
 *   (one MutationObserver on the document, plus a check one frame after release), so a host inside a
 *   leaving ancestor keeps its styles until it leaves the DOM; then the link goes in that frame.
 * - `animations`: 184's public wait on `document.getAnimations()`.
 * - `immediate`: remove at count 0.
 */
type UnloadMode = 'immediate' | 'animations' | 'host';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve));

@Injectable({ providedIn: 'root' })
export class NfsFamilyStyles {
  readonly #document = inject(DOCUMENT);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #pendingTasks = inject(PendingTasks);
  readonly #search = this.#browser ? this.#document.location.search : '';
  readonly #unloadMode: UnloadMode = !this.#browser
    ? 'immediate'
    : this.#search.includes('unload=immediate')
      ? 'immediate'
      : this.#search.includes('unload=animations')
        ? 'animations'
        : 'host';
  /** Released hosts still in the DOM (host mode), for example inside a leaving ancestor. */
  readonly #leaving = new Map<string, Set<Element>>();
  #observer: MutationObserver | null = null;

  /** Live directive hosts per family. */
  readonly #live = new Map<string, Set<Element>>();
  /** Server-rendered hosts per family that no directive has claimed yet (dehydrated). */
  readonly #serverHeld = new Map<string, Set<Element>>();
  /** The `<link>` or `<style>` per family (a `single` build keys everything under `all`). */
  readonly #elements = new Map<string, HTMLElement>();
  readonly #loading = new Set<string>();
  /** Where the bundles live: the directory of the global `styles-*.css` link, else `<base href>`. */
  readonly #prefix = this.#bundlePrefix();

  constructor() {
    if (this.#browser) {
      // Adopt what the server rendered, so hydration inserts nothing.
      for (const el of this.#document.head.querySelectorAll<HTMLElement>(`[${familyAttribute}]`)) {
        this.#elements.set(el.getAttribute(familyAttribute)!, el);
      }

      // The service starts with the first directive, which on a server-rendered page runs during
      // hydration, so every server-rendered instance is still in the DOM here.
      if (!this.#search.includes('hold=off')) {
        for (const element of this.#document.querySelectorAll(`[${nfsStylesAttribute}]`)) {
          for (const family of element.getAttribute(nfsStylesAttribute)!.split(' ')) {
            this.#set(this.#serverHeld, family).add(element);
          }
        }
      }
    } else if (protoPreload && protoSource === 'link') {
      for (const family of nfsFamilies) {
        const link = this.#document.createElement('link');
        link.rel = 'preload';
        link.setAttribute('as', 'style');
        link.setAttribute('href', this.#href(family));
        this.#document.head.appendChild(link); // the server DOM (domino) has no append()
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

      if (this.#unloadMode === 'host') {
        this.#set(this.#leaving, family).add(host);
      }
    }

    if (this.#unloadMode === 'host') {
      this.#observe();
      // Angular removes the DOM after the destroy hooks; look again once it has.
      void nextFrame().then(() => this.#checkAll());
    }

    this.#maybeUnload(families);
  }

  #maybeUnload(families: Iterable<string>): void {
    for (const key of new Set([...families].map((f) => this.#key(f)))) {
      if (this.#keyCount(key) === 0 && this.#elements.has(key)) {
        void this.#unload(key);
      }
    }
  }

  /** Host mode (from ticket 188): one MutationObserver while any released host is connected. */
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

  #key(family: string): string {
    return protoSource === 'single' ? 'all' : family;
  }

  #href(key: string): string {
    return `${this.#prefix}nfs-${key === 'all' ? 'families' : key}.css`;
  }

  #count(family: string): number {
    return (
      (this.#live.get(family)?.size ?? 0) +
      this.#pruned(this.#serverHeld.get(family)) +
      this.#pruned(this.#leaving.get(family))
    );
  }

  #keyCount(key: string): number {
    const families = key === 'all' ? nfsFamilies : [key];

    return families.reduce((sum, f) => sum + this.#count(f), 0);
  }

  #insert(family: string): void {
    const key = this.#key(family);

    if (this.#elements.has(key) || this.#loading.has(key)) {
      return;
    }

    if (protoSource !== 'plugin') {
      const link = this.#document.createElement('link');
      link.rel = 'stylesheet';
      link.setAttribute('href', this.#href(key));
      link.setAttribute(familyAttribute, key);

      if (protoBeastiesSkip) {
        link.setAttribute('data-beasties-skip', '');
      }
      this.#document.head.appendChild(link); // the server DOM (domino) has no append()
      this.#elements.set(key, link);

      return;
    }

    // esbuild-plugin variant: the CSS arrives as a lazy chunk's string; the server waits for it.
    this.#loading.add(key);
    this.#pendingTasks.run(async () => {
      const css = (await pluginLoaders[key]()).default;
      this.#loading.delete(key);

      if (this.#keyCount(key) > 0 && !this.#elements.has(key)) {
        const style = this.#document.createElement('style');
        style.setAttribute(familyAttribute, key);
        style.textContent = css;
        this.#document.head.appendChild(style); // the server DOM (domino) has no append()
        this.#elements.set(key, style);
      }
    });
  }

  async #unload(key: string): Promise<void> {
    if (this.#browser && this.#unloadMode === 'animations') {
      // The simplest public candidate (ticket 188 owns the full answer): give a leave animation
      // two frames to start, then wait until no finite animation runs in the document.
      await nextFrame();
      await nextFrame();

      for (;;) {
        const running = this.#document
          .getAnimations()
          .filter(
            (a) => a.playState === 'running' && a.effect?.getComputedTiming().endTime !== Infinity,
          );

        if (running.length === 0) {
          break;
        }

        await Promise.allSettled(running.map((a) => a.finished));
        await nextTask();
      }
    }

    if (this.#keyCount(key) === 0) {
      const element = this.#elements.get(key);
      element?.parentNode?.removeChild(element);
      this.#elements.delete(key);
    }
  }

  #bundlePrefix(): string {
    // On the server this is index.server.html's link; Beasties later adds `media` but keeps href.
    const href =
      this.#document.head
        .querySelector('link[rel="stylesheet"][href*="styles"]')
        ?.getAttribute('href') ?? '';

    return href.slice(0, href.lastIndexOf('/') + 1);
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
