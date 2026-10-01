// PROTOTYPE of library code: family styles from consumer-compiled, non-injected global style
// bundles (`styles: [{ input, bundleName: 'nfs-<family>', inject: false }]`), loaded through a
// counted `<link>` that the server renders and the client adopts. No provider and no consumer
// TypeScript: the service is `providedIn: 'root'` and starts with the first directive.
import {
  CSP_NONCE,
  REQUEST,
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

/** PROTOTYPE 198: cost counters, read by the candidate-costs measurements. */
const nfsStats: Record<string, number> = ((globalThis as { __nfsStats?: Record<string, number> })
  .__nfsStats ??= {});
const stat = (name: string, ms: number) => {
  nfsStats[name + 'Calls'] = (nfsStats[name + 'Calls'] ?? 0) + 1;
  nfsStats[name + 'Ms'] = (nfsStats[name + 'Ms'] ?? 0) + ms;
  nfsStats[name + 'MaxMs'] = Math.max(nfsStats[name + 'MaxMs'] ?? 0, ms);
};

/** Host attribute every family directive sets, so the client can find server-rendered instances. */
export const nfsStylesAttribute = 'data-nfs-styles';

/**
 * PROBE 192: CSS strings that directive modules register at module evaluation, from a static
 * `import css from 'nfs-family-css:<family>'`. The string is in memory before any constructor of
 * that module runs, so the `<style>` can be inserted in the same task as the host element.
 */
const nfsFamilyCss = new Map<string, string>();

export function registerNfsFamilyCss(family: string, css: string): void {
  nfsFamilyCss.set(family, css);
}
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
  /** PROTOTYPE 198 switch `?nonce=copy` (browser and server): copy CSP_NONCE like 188's own-style. */
  readonly #nonce = inject(CSP_NONCE, { optional: true });
  readonly #copyNonce = (
    this.#browser ? this.#search : new URL(inject(REQUEST, { optional: true })?.url ?? 'http://x/').search
  ).includes('nonce=copy');
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
        const t = performance.now();
        let hosts = 0;

        for (const element of this.#document.querySelectorAll(`[${nfsStylesAttribute}]`)) {
          hosts++;

          for (const family of element.getAttribute(nfsStylesAttribute)!.split(' ')) {
            this.#set(this.#serverHeld, family).add(element);
          }
        }

        stat('hold', performance.now() - t);
        nfsStats['holdHosts'] = hosts;
      }
    } else if (protoPreload && protoSource === 'link') {
      for (const family of nfsFamilies) {
        const link = this.#document.createElement('link');
        link.rel = 'preload';
        link.setAttribute('as', 'style');
        link.setAttribute('href', this.#href(family));
        this.#withNonce(link); // the server DOM (domino) has no append()
      }
    }
  }

  acquire(host: Element, families: readonly string[]): void {
    const t = performance.now();
    this.#acquire(host, families);
    stat('acquire', performance.now() - t);
  }

  #acquire(host: Element, families: readonly string[]): void {
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
    const t = performance.now();
    this.#release(host, families);
    stat('release', performance.now() - t);
  }

  #release(host: Element, families: readonly string[]): void {
    for (const family of families) {
      this.#live.get(family)?.delete(host);

      if (this.#unloadMode === 'host') {
        this.#set(this.#leaving, family).add(host);
      }
    }

    if (this.#unloadMode === 'host') {
      this.#observe();
      // Angular removes the DOM after the destroy hooks; look again once it has.
      void nextFrame().then(() => {
        const t = performance.now();
        this.#checkAll();
        stat('frameCheck', performance.now() - t);
      });
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
      this.#observer = new MutationObserver((records) => {
        const t = performance.now();
        this.#checkAll();
        stat('mo', performance.now() - t);
        nfsStats['moRecords'] = (nfsStats['moRecords'] ?? 0) + records.length;
      });
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
      this.#withNonce(link); // the server DOM (domino) has no append()
      this.#elements.set(key, link);

      return;
    }

    // PROBE 192: the directive module registered its CSS synchronously; insert it now.
    const known = nfsFamilyCss.get(key);

    if (known !== undefined) {
      const style = this.#document.createElement('style');
      style.setAttribute(familyAttribute, key);
      style.textContent = known;
      this.#withNonce(style); // the server DOM (domino) has no append()
      this.#elements.set(key, style);

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
        this.#withNonce(style); // the server DOM (domino) has no append()
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
      nfsStats['unloads'] = (nfsStats['unloads'] ?? 0) + 1;
      element?.parentNode?.removeChild(element);
      this.#elements.delete(key);
    }
  }

  #withNonce<T extends HTMLElement>(element: T): T {
    if (this.#copyNonce && this.#nonce) {
      element.setAttribute('nonce', this.#nonce);
    }

    return this.#document.head.appendChild(element); // the server DOM (domino) has no append()
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
