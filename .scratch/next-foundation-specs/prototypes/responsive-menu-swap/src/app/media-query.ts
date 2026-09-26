// PROTOTYPE (throwaway): the smallest NfsMediaQuery that follows specs/breakpoint-service.md
// (copied from the ResponsiveAccordionTabs prototype): the token with the px map and the
// Server breakpoint, the TransferState handoff, the Server breakpoint on the client until
// the first afterNextRender earlyRead callback (ADR 0014), then live through CDK MediaMatcher.
// Only what ResponsiveMenu needs: current, serverBreakpoint, breakpoints, resolve, the parser.
import {
  DestroyRef,
  InjectionToken,
  Injector,
  Service,
  TransferState,
  afterNextRender,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { nfsLog } from './instrument';

export type NfsBreakpointName = string;
export type NfsBreakpointMap = Readonly<Record<NfsBreakpointName, number>>;
export interface NfsBreakpoints {
  map: NfsBreakpointMap;
  serverBreakpoint?: NfsBreakpointName;
}
export type NfsBreakpointRules<M extends string> = Readonly<Partial<Record<NfsBreakpointName, M>>>;

export const nfsDefaultBreakpointMap: NfsBreakpointMap = Object.freeze({
  small: 0,
  medium: 640,
  large: 1024,
  xlarge: 1200,
  xxlarge: 1440,
});

export const nfsBreakpointsToken = new InjectionToken<NfsBreakpoints>('nfsBreakpointsToken', {
  providedIn: 'root',
  factory: () => ({ map: nfsDefaultBreakpointMap }),
});

const serverBreakpointKey = makeStateKey<string>('nfsServerBreakpoint');

/** Split at the last hyphen; a bare mode applies from the Zero breakpoint. */
export function parseNfsBreakpointRules<M extends string>(
  rules: string | NfsBreakpointRules<M>,
  modes: readonly M[],
  breakpoints: readonly NfsBreakpointName[],
): NfsBreakpointRules<M> {
  if (typeof rules !== 'string') {
    return rules;
  }

  const result: Record<string, M> = {};

  for (const token of rules.trim().split(/\s+/).filter(Boolean)) {
    const cut = token.lastIndexOf('-');
    const bp = cut < 0 ? breakpoints[0] : token.slice(0, cut);
    const mode = (cut < 0 ? token : token.slice(cut + 1)) as M;

    if (!modes.includes(mode) || !breakpoints.includes(bp)) {
      console.warn(`nfs: unknown breakpoint rule token "${token}"`);
      continue;
    }

    result[bp] = mode;
  }

  return result;
}

@Service()
export class NfsMediaQuery {
  readonly #config = inject(nfsBreakpointsToken);
  readonly #sorted = Object.entries(this.#config.map).sort((a, b) => a[1] - b[1]);
  readonly breakpoints: readonly NfsBreakpointName[] = this.#sorted.map(([name]) => name);
  /** The breakpoint the service started from (ADR 0032): transferred, else the token's, else the Zero breakpoint. */
  readonly serverBreakpoint: NfsBreakpointName = this.#initial();
  readonly #current = signal<NfsBreakpointName>(this.serverBreakpoint);
  readonly current = this.#current.asReadonly();

  constructor() {
    const matcher = inject(MediaMatcher);
    const destroyRef = inject(DestroyRef);
    nfsLog({ kind: 'mq-ctor' });

    // Going live: first earlyRead after the next application render. Never runs on the
    // server (afterNextRender is a no-op there).
    afterNextRender(
      {
        earlyRead: () => {
          const lists = this.#sorted.map(([name, px]) => ({
            name,
            mql: matcher.matchMedia(`only screen and (min-width: ${px / 16}em)`),
          }));
          const update = () => {
            const match = lists.filter((l) => l.mql.matches).at(-1);

            if (match) {
              this.#current.set(match.name);
            }
          };

          update();
          nfsLog({ kind: 'mq-live', current: this.#current() });

          for (const l of lists) {
            l.mql.addEventListener('change', update);
          }

          destroyRef.onDestroy(() => lists.forEach((l) => l.mql.removeEventListener('change', update)));
        },
      },
      { injector: inject(Injector) },
    );
  }

  /** Largest rule breakpoint at or below `at` (default `current`), by map order. */
  resolve<M extends string>(rules: NfsBreakpointRules<M>, at: NfsBreakpointName = this.#current()): M | undefined {
    const index = this.breakpoints.indexOf(at);
    let mode: M | undefined;

    for (let i = 0; i <= index; i++) {
      mode = rules[this.breakpoints[i]] ?? mode;
    }

    return mode;
  }

  #initial(): NfsBreakpointName {
    const state = inject(TransferState);
    const zero = this.#sorted.find(([, px]) => px === 0)?.[0] ?? 'small';
    const fallback = this.#config.serverBreakpoint ?? zero;
    const value = state.get(serverBreakpointKey, fallback);
    // Symmetric write: serialised on the server, never on the client.
    state.set(serverBreakpointKey, value);

    return this.breakpoints.includes(value) ? value : fallback;
  }
}
