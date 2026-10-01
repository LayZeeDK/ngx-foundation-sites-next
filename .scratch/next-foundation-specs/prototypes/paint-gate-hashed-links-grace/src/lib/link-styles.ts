// PROTOTYPE of library code: family styles from consumer-compiled, non-injected global style
// bundles (`styles: [{ input, bundleName: 'nfs-<family>', inject: false }]`), loaded through a
// counted `<link>` that the server renders and the client adopts. No provider and no consumer
// TypeScript: the service is `providedIn: 'root'` and starts with the first directive.
//
// TICKET 197 additions, all browser-only query switches so one build serves baseline and variant:
// - `?gate=1` (proposal D): a host whose family element has not loaded yet gets `data-nfs-pending`,
//   which the library's global stylesheet hides (`visibility: hidden`); cleared on the link's `load`.
//   `whenStyled(host)` lets the `nfsEnter` directive start an enter animation after the load.
// - `?grace=<ms>` (proposal G): at count 0, remove the element only after <ms> with no instance.
// - `?keep=disabled` (proposal G): at count 0, set `element.disabled = true` instead of removing it.
// - `?keep=sheet` (proposal G): at count 0, set `element.sheet.disabled = true` instead.
// - `protoSource === 'file'` (proposal E): the href is the hashed asset URL that the directive
//   module's `nfs-family-css:<family>` import resolved to.
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
import { protoBeastiesSkip, protoFilePrefix, protoPreload, protoSource } from './switches';

/** Host attribute every family directive sets, so the client can find server-rendered instances. */
export const nfsStylesAttribute = 'data-nfs-styles';
/** PROTOTYPE 197, proposal D: hidden by `[data-nfs-pending] { visibility: hidden }` in global.scss. */
export const nfsPendingAttribute = 'data-nfs-pending';

/**
 * PROBE 192: values that directive modules register at module evaluation, from a static
 * `import css from 'nfs-family-css:<family>'`: the CSS text (A) or the asset URL (E).
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
 * - `host` (default): ticket 188's host timing.
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
  readonly #gate = this.#search.includes('gate=1');
  readonly #grace = Number(this.#search.match(/grace=(\d+)/)?.[1] ?? 0);
  readonly #keep = (this.#search.match(/keep=(disabled|sheet)/)?.[1] ?? null) as 'disabled' | 'sheet' | null;
  readonly #graceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  /** Keys whose element has applied (browser only). */
  readonly #loaded = new Set<string>();
  readonly #waiters = new Map<string, Array<() => void>>();
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
        const key = el.getAttribute(familyAttribute)!;
        this.#elements.set(key, el);
        this.#trackLoad(key, el);
      }

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
        this.#document.head.appendChild(link);
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

    if (this.#gate && !this.#styled(families)) {
      host.setAttribute(nfsPendingAttribute, '');
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
      void nextFrame().then(() => this.#checkAll());
    }

    this.#maybeUnload(families);
  }

  /** PROTOTYPE 197, proposal D: resolves once every family of this host has applied. */
  whenStyled(host: Element): Promise<void> {
    const families = (host.getAttribute(nfsStylesAttribute) ?? '').split(' ').filter(Boolean);

    return Promise.all(
      families.map((f) => {
        const key = this.#key(f);

        return this.#loaded.has(key)
          ? undefined
          : new Promise<void>((resolve) => this.#set2(this.#waiters, key).push(resolve));
      }),
    ).then(() => undefined);
  }

  #styled(families: readonly string[]): boolean {
    return families.every((f) => this.#loaded.has(this.#key(f)));
  }

  #trackLoad(key: string, el: HTMLElement): void {
    if (el instanceof HTMLLinkElement && !el.sheet) {
      const done = () => this.#markLoaded(key, el);
      el.addEventListener('load', done, { once: true });
      el.addEventListener('error', done, { once: true });
    } else {
      this.#markLoaded(key, el);
    }
  }

  #markLoaded(key: string, el: HTMLElement): void {
    if (this.#elements.get(key) !== el) {
      return;
    }

    this.#loaded.add(key);

    for (const resolve of this.#waiters.get(key) ?? []) {
      resolve();
    }

    this.#waiters.delete(key);

    for (const hosts of this.#live.values()) {
      for (const host of hosts) {
        if (
          host.hasAttribute(nfsPendingAttribute) &&
          this.#styled(host.getAttribute(nfsStylesAttribute)!.split(' '))
        ) {
          host.removeAttribute(nfsPendingAttribute);
        }
      }
    }
  }

  #maybeUnload(families: Iterable<string>): void {
    for (const key of new Set([...families].map((f) => this.#key(f)))) {
      if (this.#keyCount(key) === 0 && this.#elements.has(key)) {
        if (this.#grace > 0) {
          if (!this.#graceTimers.has(key)) {
            this.#graceTimers.set(
              key,
              setTimeout(() => {
                this.#graceTimers.delete(key);

                if (this.#keyCount(key) === 0) {
                  void this.#unload(key);
                }
              }, this.#grace),
            );
          }
        } else {
          void this.#unload(key);
        }
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

  #key(family: string): string {
    return protoSource === 'single' ? 'all' : family;
  }

  #href(key: string): string {
    if (protoSource === 'file') {
      // esbuild writes `./media/<name>-<hash>.css`, relative to the output root and blind to
      // `deployUrl`. Attempt 2: resolve it against the global stylesheet's directory, as 189 does.
      const url = nfsFamilyCss.get(key)!;

      return protoFilePrefix && url.startsWith('./') ? this.#prefix + url.slice(2) : url;
    }

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
    const timer = this.#graceTimers.get(key);

    if (timer !== undefined) {
      clearTimeout(timer);
      this.#graceTimers.delete(key);
    }

    const kept = this.#elements.get(key);

    if (kept) {
      // Proposal G, `keep=`: the element stayed parsed; switch it back on.
      if (this.#keep === 'disabled' && (kept as HTMLLinkElement).disabled) {
        (kept as HTMLLinkElement).disabled = false;
      } else if (this.#keep === 'sheet') {
        const sheet = (kept as HTMLLinkElement).sheet;

        if (sheet?.disabled) {
          sheet.disabled = false;
        }
      }

      return;
    }

    if (this.#loading.has(key)) {
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
      this.#document.head.appendChild(link);
      this.#elements.set(key, link);

      if (this.#browser) {
        this.#trackLoad(key, link);
      }

      return;
    }

    const known = nfsFamilyCss.get(key);

    if (known !== undefined && known !== '') {
      const style = this.#document.createElement('style');
      style.setAttribute(familyAttribute, key);
      style.textContent = known;
      this.#document.head.appendChild(style);
      this.#elements.set(key, style);

      if (this.#browser) {
        this.#markLoaded(key, style);
      }

      return;
    }

    this.#loading.add(key);
    this.#pendingTasks.run(async () => {
      const css = (await pluginLoaders[key]()).default;
      this.#loading.delete(key);

      if (this.#keyCount(key) > 0 && !this.#elements.has(key)) {
        const style = this.#document.createElement('style');
        style.setAttribute(familyAttribute, key);
        style.textContent = css;
        this.#document.head.appendChild(style);
        this.#elements.set(key, style);

        if (this.#browser) {
          this.#markLoaded(key, style);
        }
      }
    });
  }

  async #unload(key: string): Promise<void> {
    if (this.#browser && this.#unloadMode === 'animations') {
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

    if (this.#keyCount(key) !== 0) {
      return;
    }

    const element = this.#elements.get(key);

    if (this.#keep === 'disabled' && element) {
      (element as HTMLLinkElement).disabled = true;

      return;
    }

    if (this.#keep === 'sheet' && element) {
      const sheet = (element as HTMLLinkElement).sheet;

      if (sheet) {
        sheet.disabled = true;
      }

      return;
    }

    element?.parentNode?.removeChild(element);
    this.#elements.delete(key);
    this.#loaded.delete(key);
  }

  #bundlePrefix(): string {
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

  #set2<T>(map: Map<string, T[]>, key: string): T[] {
    let list = map.get(key);

    if (!list) {
      list = [];
      map.set(key, list);
    }

    return list;
  }
}

/** Called from a family directive's constructor. */
export function useNfsFamilyStyles(...families: string[]): void {
  const styles = inject(NfsFamilyStyles);
  const host = inject(ElementRef).nativeElement as Element;
  styles.acquire(host, families);
  inject(DestroyRef).onDestroy(() => styles.release(host, families));
}
