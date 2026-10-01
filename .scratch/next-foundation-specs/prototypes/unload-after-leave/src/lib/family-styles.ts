// PROTOTYPE of library code (ticket 188): per-family style carriers, counted by the library,
// with one unload mode per candidate way to remove a family's styles after leave animations.
import {
  afterNextRender,
  ComponentRef,
  createComponent,
  createEnvironmentInjector,
  CSP_NONCE,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  PendingTasks,
  PLATFORM_ID,
  provideEnvironmentInitializer,
  reflectComponentType,
  Renderer2,
  RendererFactory2,
  RendererType2,
  REQUEST,
  Type,
  ɵallLeavingAnimations as allLeavingAnimations,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Carrier = Type<unknown>;
export type NfsFamilyCarriers = Readonly<
  Record<string, Carrier | (() => Promise<{ default: Carrier }>)>
>;

export const nfsFamilyCarriersToken = new InjectionToken<NfsFamilyCarriers>(
  'nfsFamilyCarriersToken',
);

/** Host attribute every family directive sets, so the client can find server-rendered instances. */
export const nfsStylesAttribute = 'data-nfs-styles';
/** Attribute on the <style> or <link> the library itself owns (candidate 1). */
const ownAttribute = 'data-nfs-family';

export function provideNfsFamilyStyles(carriers: NfsFamilyCarriers): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: nfsFamilyCarriersToken, useValue: carriers },
    provideEnvironmentInitializer(() => inject(NfsFamilyStyles).holdServerInstances()),
  ]);
}

/**
 * PROTOTYPE switch, read from `?unload=` (browser and server).
 * 184 baselines: `immediate`, `animations`, `private`, `repair`.
 * Candidate 2 (host timing, Angular's carrier removes): `host`, `host-animations`.
 * Candidate 3 (Angular's carrier removes, public hooks): `after-render`, `retry`.
 * Candidate 1 (styles Angular does not own; removed once the hosts are disconnected):
 * `own-style`, `adopted`, `own-link`.
 */
type UnloadMode =
  | 'immediate'
  | 'animations'
  | 'private'
  | 'repair'
  | 'host'
  | 'host-animations'
  | 'after-render'
  | 'retry'
  | 'own-style'
  | 'adopted'
  | 'own-link';

const hostTimed: readonly UnloadMode[] = ['host', 'host-animations', 'own-style', 'adopted', 'own-link'];
const ownModes: readonly UnloadMode[] = ['own-style', 'adopted', 'own-link'];

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve));
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Public API only: a RendererFactory2 for the carriers' own injector. It sees the carrier's
 * `RendererType2.styles` (public interface) and either keeps them away from Angular
 * (`capture`, candidate 1) or remembers the renderer Angular made (`retry`, candidate 3).
 */
class CarrierRendererFactory implements RendererFactory2 {
  captured: string[] | null = null;
  lastRenderer: Renderer2 | null = null;

  constructor(
    private readonly inner: RendererFactory2,
    private readonly capture: boolean,
  ) {}

  createRenderer(element: unknown, type: RendererType2 | null): Renderer2 {
    if (element && type && type.styles.length > 0) {
      if (this.capture) {
        this.captured = type.styles as string[];

        return this.inner.createRenderer(element, null); // default renderer: no styles applied
      }

      this.lastRenderer = this.inner.createRenderer(element, type);

      return this.lastRenderer;
    }

    return this.inner.createRenderer(element, type);
  }

  begin(): void {
    this.inner.begin?.();
  }

  end(): void {
    this.inner.end?.();
  }

  whenRenderingDone(): Promise<unknown> {
    return this.inner.whenRenderingDone?.() ?? Promise.resolve();
  }
}

interface Owned {
  element?: HTMLStyleElement | HTMLLinkElement;
  sheet?: CSSStyleSheet;
}

@Injectable({ providedIn: 'root' })
export class NfsFamilyStyles {
  readonly #carriers = inject(nfsFamilyCarriersToken);
  readonly #injector = inject(EnvironmentInjector);
  readonly #pendingTasks = inject(PendingTasks);
  readonly #document = inject(DOCUMENT);
  readonly #nonce = inject(CSP_NONCE, { optional: true });
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #unloadMode: UnloadMode = (new URLSearchParams(
    this.#browser
      ? this.#document.location.search
      : new URL(inject(REQUEST, { optional: true })?.url ?? 'http://x/').search,
  ).get('unload') ?? 'animations') as UnloadMode;
  readonly #own = ownModes.includes(this.#unloadMode);
  readonly #hostTimed = this.#browser && hostTimed.includes(this.#unloadMode);

  readonly #factory = new CarrierRendererFactory(inject(RendererFactory2), this.#own);
  readonly #carrierInjector =
    this.#own || this.#unloadMode === 'retry'
      ? createEnvironmentInjector(
          [{ provide: RendererFactory2, useValue: this.#factory }],
          this.#injector,
        )
      : this.#injector;

  /** Live directive hosts per family. */
  readonly #live = new Map<string, Set<Element>>();
  /** Server-rendered hosts per family that no directive has claimed yet (dehydrated). */
  readonly #serverHeld = new Map<string, Set<Element>>();
  /** Candidate 2: released hosts still in the DOM (for example inside a leaving ancestor). */
  readonly #leaving = new Map<string, Set<Element>>();
  readonly #refs = new Map<string, ComponentRef<unknown>>();
  readonly #renderers = new Map<string, Renderer2>();
  readonly #owned = new Map<string, Owned>();
  readonly #css = new Map<string, string>();
  readonly #loading = new Set<string>();
  readonly #unloading = new Set<string>();
  readonly #detached = new Map<string, HTMLStyleElement>();
  #observer: MutationObserver | null = null;

  /** Client only, at bootstrap: count every server-rendered instance until a directive claims it. */
  holdServerInstances(): void {
    if (!this.#browser || this.#document.location.search.includes('hold=off')) {
      return;
    }

    const families = new Set<string>();

    for (const element of this.#document.querySelectorAll(`[${nfsStylesAttribute}]`)) {
      for (const family of element.getAttribute(nfsStylesAttribute)!.split(' ')) {
        this.#set(this.#serverHeld, family).add(element);
        families.add(family);
      }
    }

    this.#load([...families]);
  }

  acquire(host: Element, families: readonly string[]): void {
    for (const family of families) {
      this.#serverHeld.get(family)?.delete(host);
      this.#leaving.get(family)?.delete(host);
      this.#set(this.#live, family).add(host);
    }

    this.#load(families);
  }

  release(host: Element, families: readonly string[]): void {
    for (const family of families) {
      this.#live.get(family)?.delete(host);

      if (this.#hostTimed) {
        this.#set(this.#leaving, family).add(host);
        this.#observe();
      }

      this.#maybeUnload(family);
    }

    if (this.#hostTimed) {
      // Angular removes the DOM after the destroy hooks; look again once it has.
      void nextFrame().then(() => this.#checkAll());
    }
  }

  #maybeUnload(family: string): void {
    if (this.#count(family) === 0 && this.#isLoaded(family) && !this.#unloading.has(family)) {
      void this.#unload(family);
    }
  }

  #isLoaded(family: string): boolean {
    return this.#refs.has(family) || this.#owned.has(family);
  }

  /** Candidate 2: one MutationObserver on the document while any released host is connected. */
  #observe(): void {
    if (this.#observer) {
      return;
    }

    this.#observer = new MutationObserver(() => this.#checkAll());
    this.#observer.observe(this.#document, { childList: true, subtree: true });
  }

  #checkAll(): void {
    for (const family of this.#leaving.keys()) {
      this.#maybeUnload(family);
    }

    if ([...this.#leaving.values()].every((s) => s.size === 0)) {
      this.#observer?.disconnect();
      this.#observer = null;
    }
  }

  #count(family: string): number {
    return (
      (this.#live.get(family)?.size ?? 0) +
      this.#pruned(this.#serverHeld.get(family)) +
      this.#pruned(this.#leaving.get(family))
    );
  }

  #pruned(set: Set<Element> | undefined): number {
    for (const element of set ?? []) {
      if (!element.isConnected) {
        set!.delete(element);
      }
    }

    return set?.size ?? 0;
  }

  /** Creates the missing carriers or owned styles, in the order given, once all have loaded. */
  #load(families: readonly string[]): void {
    const missing = families.filter((f) => !this.#isLoaded(f) && !this.#loading.has(f));

    if (missing.length === 0) {
      return;
    }

    missing.forEach((f) => this.#loading.add(f));

    // Candidate 1: adopt what the server rendered, or reuse CSS captured earlier, with no chunk.
    if (
      this.#own &&
      (this.#unloadMode === "own-link" || missing.every((f) => this.#css.has(f) || this.#serverOwned(f)))
    ) {
      missing.forEach((f) => this.#createOwned(f));

      return;
    }

    const carriers = missing.map((f) => this.#carriers[f]);
    const create = (types: Carrier[]) => {
      missing.forEach((family, i) => {
        if (this.#own) {
          this.#createOwned(family, types[i]);
        } else {
          this.#createCarrier(family, types[i]);
        }
      });
    };

    if (carriers.every((c) => reflectComponentType(c as Carrier))) {
      create(carriers as Carrier[]);

      return;
    }

    this.#pendingTasks.run(async () => {
      const types = await Promise.all(
        carriers.map(async (c) =>
          reflectComponentType(c as Carrier)
            ? (c as Carrier)
            : (await (c as () => Promise<{ default: Carrier }>)()).default,
        ),
      );
      create(types);
    });
  }

  #createCarrier(family: string, type: Carrier): void {
    this.#loading.delete(family);

    if (this.#count(family) === 0 || this.#refs.has(family)) {
      return;
    }

    this.#refs.set(family, createComponent(type, { environmentInjector: this.#carrierInjector }));

    if (this.#unloadMode === 'retry' && this.#factory.lastRenderer) {
      this.#renderers.set(family, this.#factory.lastRenderer);
    }

    // `repair`: Angular's record still holds the element we removed, so it did not re-add it.
    const detached = this.#detached.get(family);

    if (detached && !detached.isConnected) {
      this.#document.head.appendChild(detached);
    }

    this.#detached.delete(family);
  }

  #serverOwned(family: string): HTMLStyleElement | HTMLLinkElement | null {
    return this.#browser
      ? this.#document.head.querySelector(`[${ownAttribute}="${family}"]`)
      : null;
  }

  /** Candidate 1: the library's own <style>, constructed sheet, or <link>. */
  #createOwned(family: string, type?: Carrier): void {
    this.#loading.delete(family);

    if (this.#count(family) === 0 || this.#owned.has(family)) {
      return;
    }

    const server = this.#serverOwned(family);

    if (!this.#css.has(family) && type && this.#unloadMode !== "own-link") {
      // Render the carrier once in the capturing injector: its styles never reach SharedStylesHost.
      this.#factory.captured = null;
      createComponent(type, { environmentInjector: this.#carrierInjector }).destroy();
      this.#css.set(family, this.#factory.captured!.join('\n'));
    }

    if (this.#unloadMode === 'own-link') {
      const link = (server as HTMLLinkElement | null) ?? this.#document.createElement('link');

      if (!server) {
        link.rel = 'stylesheet';
        link.href = `nfs-${family}.css`;
        link.setAttribute(ownAttribute, family);
        this.#withNonce(link);
        this.#document.head.appendChild(link);
      }

      this.#owned.set(family, { element: link });

      return;
    }

    if (this.#unloadMode === 'adopted' && this.#browser) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(server?.textContent ?? this.#css.get(family)!);
      this.#document.adoptedStyleSheets = [...this.#document.adoptedStyleSheets, sheet];
      // The server <style> is replaced by the adopted sheet in the same task.
      server?.remove();
      this.#owned.set(family, { sheet });

      return;
    }

    // `own-style`, and `adopted` on the server (constructed sheets are not serialised).
    if (server) {
      this.#owned.set(family, { element: server });

      return;
    }

    const style = this.#document.createElement('style');
    style.setAttribute(ownAttribute, family);
    this.#withNonce(style);
    style.textContent = this.#css.get(family)!;
    this.#document.head.appendChild(style);
    this.#owned.set(family, { element: style });
  }

  #withNonce(element: Element): void {
    if (this.#nonce) {
      element.setAttribute('nonce', this.#nonce);
    }
  }

  async #unload(family: string): Promise<void> {
    this.#unloading.add(family);

    try {
      await this.#waitBeforeUnload();
    } finally {
      this.#unloading.delete(family);
    }

    if (this.#count(family) !== 0) {
      return;
    }

    const owned = this.#owned.get(family);

    if (owned) {
      owned.element?.remove();

      if (owned.sheet) {
        this.#document.adoptedStyleSheets = this.#document.adoptedStyleSheets.filter(
          (s) => s !== owned.sheet,
        );
      }

      this.#owned.delete(family);

      return;
    }

    if (this.#unloadMode === 'after-render') {
      // Candidate 3: destroy the carrier in the next afterRender phase.
      afterNextRender(() => this.#destroyCarrier(family), { injector: this.#injector });

      return;
    }

    this.#destroyCarrier(family);
  }

  async #waitBeforeUnload(): Promise<void> {
    if (!this.#browser) {
      return;
    }

    const mode = this.#unloadMode;

    if (mode === 'animations' || mode === 'repair' || mode === 'host-animations') {
      // The leave animation is queued after the destroy; give it two frames to start.
      await nextFrame();
      await nextFrame();

      for (;;) {
        const running = this.#document
          .getAnimations()
          .filter(
            (a) =>
              a.playState === 'running' && a.effect?.getComputedTiming().endTime !== Infinity,
          );

        if (running.length === 0) {
          break;
        }

        await Promise.allSettled(running.map((a) => a.finished));
        await nextTask();
      }

      await nextTask();
    } else if (mode === 'private') {
      while (allLeavingAnimations.size > 0) {
        await sleep(16);
      }
    }
  }

  #destroyCarrier(family: string): void {
    if (this.#count(family) !== 0 || !this.#refs.has(family)) {
      return;
    }

    this.#refs.get(family)!.destroy();
    this.#refs.delete(family);

    const style = this.#styleOf(family);

    // `repair`: if Angular skipped removeStyles, take the element out of the DOM ourselves.
    if (this.#unloadMode === 'repair' && style) {
      style.remove();
      this.#detached.set(family, style);
    }

    // Candidate 3 `retry`: call the carrier renderer's public destroy() again until Angular's
    // own removeStyles runs, that is until its guard sees no leaving view.
    if (this.#unloadMode === 'retry' && style) {
      void this.#retry(family);
    }
  }

  async #retry(family: string): Promise<void> {
    const renderer = this.#renderers.get(family);

    while (renderer && this.#styleOf(family) && !this.#refs.has(family)) {
      // ponytail: fixed 50 ms poll; a backoff would cut the cost of long waits
      await sleep(50);

      if (this.#refs.has(family)) {
        break;
      }

      window.__nfsRetries = (window.__nfsRetries ?? 0) + 1;
      renderer.destroy();
    }
  }

  /** The family's Angular-owned <style>, found by the `@layer nfs.<family>` wrapper. */
  #styleOf(family: string): HTMLStyleElement | undefined {
    return Array.from(this.#document.head.querySelectorAll("style")).find(
      (s) => !s.hasAttribute(ownAttribute) && s.textContent!.startsWith(`@layer nfs.${family}{`),
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

declare global {
  interface Window {
    __nfsRetries?: number;
  }
}

/** Called from a family directive's constructor. */
export function useNfsFamilyStyles(...families: string[]): void {
  const styles = inject(NfsFamilyStyles);
  const host = inject(ElementRef).nativeElement as Element;
  styles.acquire(host, families);
  inject(DestroyRef).onDestroy(() => styles.release(host, families));
}

/** Research M1, for measurement 10 in 184: one carrier per directive instance, Angular counts. */
export function useNfsFamilyStylesPerInstance(family: string): void {
  const carrier = inject(nfsFamilyCarriersToken)[family] as Carrier;
  const ref = createComponent(carrier, { environmentInjector: inject(EnvironmentInjector) });
  inject(DestroyRef).onDestroy(() => ref.destroy());
}
