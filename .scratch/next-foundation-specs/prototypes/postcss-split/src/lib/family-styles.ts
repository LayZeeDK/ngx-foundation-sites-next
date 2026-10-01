// PROTOTYPE of library code: per-family style carriers, counted by the library.
import {
  ComponentRef,
  createComponent,
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
  Type,
  ɵallLeavingAnimations as allLeavingAnimations,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { nfsStructureCarriers } from './structure-source';

type Carrier = Type<unknown>;
export type NfsFamilyCarriers = Readonly<
  Record<string, Carrier | (() => Promise<{ default: Carrier }>)>
>;

export const nfsFamilyCarriersToken = new InjectionToken<NfsFamilyCarriers>(
  'nfsFamilyCarriersToken',
);

/** Host attribute every family directive sets, so the client can find server-rendered instances. */
export const nfsStylesAttribute = 'data-nfs-styles';

export function provideNfsFamilyStyles(carriers: NfsFamilyCarriers): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: nfsFamilyCarriersToken, useValue: carriers },
    provideEnvironmentInitializer(() => inject(NfsFamilyStyles).holdServerInstances()),
  ]);
}

/**
 * PROTOTYPE switch for measurement 6, read from `?unload=` in the browser:
 * - `immediate`: destroy the carrier as soon as the count reaches 0 (Angular's own behaviour).
 * - `animations` (default): public API; wait until no finite animation runs in the document.
 * - `private`: wait until Angular's private `ɵallLeavingAnimations` set is empty.
 * - `repair`: as `animations`, then remove a <style> Angular left behind with DOM APIs, and put
 *   it back when the family is needed again.
 */
type UnloadMode = 'immediate' | 'animations' | 'private' | 'repair';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve));

@Injectable({ providedIn: 'root' })
export class NfsFamilyStyles {
  readonly #carriers = inject(nfsFamilyCarriersToken);
  readonly #injector = inject(EnvironmentInjector);
  readonly #pendingTasks = inject(PendingTasks);
  readonly #document = inject(DOCUMENT);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #unloadMode: UnloadMode = this.#browser
    ? ((new URLSearchParams(this.#document.location.search).get('unload') as UnloadMode) ??
      'animations')
    : 'immediate';

  readonly #structureFirst = this.#document.location.search.includes('order=structure-first');

  /** Live directive hosts per family. */
  readonly #live = new Map<string, Set<Element>>();
  /** Server-rendered hosts per family that no directive has claimed yet (dehydrated). */
  readonly #serverHeld = new Map<string, Set<Element>>();
  readonly #refs = new Map<string, ComponentRef<unknown>>();
  readonly #loading = new Set<string>();

  /** Client only, at bootstrap: count every server-rendered instance until a directive claims it. */
  holdServerInstances(): void {
    // PROTOTYPE switch: `?hold=off` shows Angular's own count (measurement 7 baseline).
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
      this.#set(this.#live, family).add(host);
    }

    this.#load(families);
  }

  release(host: Element, families: readonly string[]): void {
    for (const family of families) {
      this.#live.get(family)?.delete(host);

      if (this.#count(family) === 0 && this.#refs.has(family)) {
        void this.#unload(family);
      }
    }
  }

  #count(family: string): number {
    const held = this.#serverHeld.get(family);

    for (const element of held ?? []) {
      if (!element.isConnected) {
        held!.delete(element);
      }
    }

    return (this.#live.get(family)?.size ?? 0) + (held?.size ?? 0);
  }

  /** Creates the missing carriers, in the order given, once all of them have loaded. */
  #load(families: readonly string[]): void {
    const missing = families.filter((f) => !this.#refs.has(f) && !this.#loading.has(f));

    if (missing.length === 0) {
      return;
    }

    const carriers = missing.map((f) => this.#carriers[f]);
    const create = (types: Carrier[]) => {
      missing.forEach((family, i) => {
        this.#loading.delete(family);

        if (this.#count(family) > 0 && !this.#refs.has(family)) {
          // 195: the library-owned structure sheet goes with the consumer's theme carrier.
          // PROTOTYPE switch `?order=structure-first` inserts the structure <style> first.
          const structure = nfsStructureCarriers[family];
          // PROTOTYPE switch `?structure=off`: theme carriers only (184 with sublayers), to separate layering from the split.
          const withStructure = this.#document.location.search.includes('structure=off') ? undefined : structure;
          const pair = this.#structureFirst ? [withStructure, types[i]] : [types[i], withStructure];
          const refs = pair
            .filter((t): t is Carrier => !!t)
            .map((t) => createComponent(t, { environmentInjector: this.#injector }));
          this.#refs.set(family, { destroy: () => refs.forEach((r) => r.destroy()) } as ComponentRef<unknown>);

          // `repair`: Angular's record still holds the element we removed, so it did not re-add it.
          const detached = this.#detached.get(family);

          if (detached && !detached.isConnected) {
            this.#document.head.append(detached);
          }

          this.#detached.delete(family);
        }
      });
    };

    missing.forEach((f) => this.#loading.add(f));

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

  async #unload(family: string): Promise<void> {
    if (this.#unloadMode === 'animations' || this.#unloadMode === 'repair') {
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
    } else if (this.#unloadMode === 'private') {
      while (allLeavingAnimations.size > 0) {
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
    }

    if (this.#count(family) === 0) {
      this.#refs.get(family)?.destroy();
      this.#refs.delete(family);

      // `repair`: if Angular skipped removeStyles, take the element out of the DOM ourselves.
      const style = this.#unloadMode === 'repair' ? this.#styleOf(family) : undefined;

      if (style) {
        style.remove();
        this.#detached.set(family, style);
      }
    }
  }

  readonly #detached = new Map<string, HTMLStyleElement>();

  /** The family's <style>, found by the library's own `@layer nfs.<family>` wrapper. */
  #styleOf(family: string): HTMLStyleElement | undefined {
    return [...this.#document.head.querySelectorAll('style')].find((s) =>
      s.textContent!.startsWith(`@layer nfs.${family}{`),
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

/** Called from a family directive's constructor. */
export function useNfsFamilyStyles(...families: string[]): void {
  const styles = inject(NfsFamilyStyles);
  const host = inject(ElementRef).nativeElement as Element;
  styles.acquire(host, families);
  inject(DestroyRef).onDestroy(() => styles.release(host, families));
}

/** Research M1, for measurement 10: one carrier per directive instance, Angular counts. */
export function useNfsFamilyStylesPerInstance(family: string): void {
  const carrier = inject(nfsFamilyCarriersToken)[family] as Carrier;
  const ref = createComponent(carrier, { environmentInjector: inject(EnvironmentInjector) });
  inject(DestroyRef).onDestroy(() => ref.destroy());
}
