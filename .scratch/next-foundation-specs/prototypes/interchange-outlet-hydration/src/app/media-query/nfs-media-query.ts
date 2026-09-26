import { DOCUMENT, Injectable, TransferState, afterNextRender, inject, makeStateKey, signal } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { NfsBreakpointName, nfsBreakpointsToken } from './nfs-breakpoints-token';
import { nfsProbeInit, nfsProbeMark } from '../render-probe';

// PROTOTYPE (throwaway). Minimal NfsMediaQuery per specs/breakpoint-service.md
// and adr/0014-breakpoint-service-first-render-handoff.md: only `current` and
// `atLeast()`, the Server breakpoint handoff, and the TransferState round trip.
// No reducedMotion, is/upTo/only/resolve/matches/get, rule parsing, or the
// dev-mode drift check -- this prototype tests the render-timing handoff, not
// the full public surface.

const NFS_SERVER_BREAKPOINT_KEY = makeStateKey<NfsBreakpointName>('nfsServerBreakpoint');

@Injectable({ providedIn: 'root' })
export class NfsMediaQuery {
  readonly #breakpoints = inject(nfsBreakpointsToken);
  readonly #mediaMatcher = inject(MediaMatcher);
  readonly #transferState = inject(TransferState);
  readonly #document = inject(DOCUMENT);
  readonly #probe = nfsProbeInit(this.#document);

  readonly #names = (Object.keys(this.#breakpoints.map) as NfsBreakpointName[]).sort(
    (a, b) => this.#breakpoints.map[a] - this.#breakpoints.map[b],
  );

  readonly #zeroBreakpoint = this.#names[0];

  readonly #current = signal<NfsBreakpointName>(this.#initial());
  readonly current = this.#current.asReadonly();

  /** True while `current` is still the Server breakpoint's initial value, for the probe. */
  readonly #wentLive = signal(false);
  readonly wentLive = this.#wentLive.asReadonly();

  constructor() {
    nfsProbeMark(this.#probe, 'mq-ctor');

    // Going live: the first afterNextRender earlyRead callback (ADR 0014).
    // Registered here, in the constructor, so it is the first earlyRead
    // callback registered app-wide (the service is injected once, before
    // any consuming component's own render-probe hooks run).
    afterNextRender({
      earlyRead: () => this.#goLive(),
    });
  }

  #initial(): NfsBreakpointName {
    const transferred = this.#transferState.get(
      NFS_SERVER_BREAKPOINT_KEY,
      undefined as unknown as NfsBreakpointName,
    );
    const serverChoice =
      transferred && this.#names.includes(transferred)
        ? transferred
        : (this.#breakpoints.serverBreakpoint ?? this.#zeroBreakpoint);

    // Symmetric write (ADR 0014 / ADR 0005 decision 10): the server
    // serializes this into `ng-state`; on the client it is a harmless
    // overwrite of the value we just read (or the client token's default,
    // for a plain client-rendered route with no TransferState at all).
    this.#transferState.set(NFS_SERVER_BREAKPOINT_KEY, serverChoice);

    return serverChoice;
  }

  atLeast(name: NfsBreakpointName): boolean {
    return this.#names.indexOf(this.current()) >= this.#names.indexOf(name);
  }

  #goLive(): void {
    let live = this.#zeroBreakpoint;

    for (const name of this.#names) {
      const px = this.#breakpoints.map[name];
      const query = `(min-width: ${px / 16}em)`;

      if (this.#mediaMatcher.matchMedia(query).matches) {
        live = name;
      }
    }

    nfsProbeMark(this.#probe, 'mq-live-before-set');
    this.#current.set(live);
    this.#wentLive.set(true);
    nfsProbeMark(this.#probe, 'mq-live-after-set');
  }
}
