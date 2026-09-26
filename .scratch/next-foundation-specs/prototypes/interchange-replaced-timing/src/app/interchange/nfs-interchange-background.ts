import { Directive, afterRenderEffect, booleanAttribute, computed, effect, inject, input, output, signal } from '@angular/core';
import { NfsMediaQuery } from '../media-query/nfs-media-query';
import { NfsInterchangeRule } from './nfs-interchange-outlet';

// PROTOTYPE (throwaway, re-run of ticket 67). Background mode, which the
// first prototype did not build. `naive` emits from an afterRenderEffect that
// reads `selected()` (the spec as published); otherwise the rendered-rule
// handoff: an effect() records `selected()` in `#rendered` during change
// detection (the same pass that applies the host style binding), and the
// render callback emits only when `#rendered` equals `selected()`.
const UNSET_BG = Symbol('unset-bg');

@Directive({
  selector: '[nfsInterchangeBg]',
  host: { '[style.background-image]': 'backgroundImage()' },
})
export class NfsInterchangeBackground {
  readonly rules = input.required<readonly NfsInterchangeRule<string>[]>({ alias: 'nfsInterchangeBg' });
  readonly naive = input(false, { transform: booleanAttribute });
  readonly replaced = output<NfsInterchangeRule<string> | undefined>();

  readonly #mq = inject(NfsMediaQuery);

  readonly selected = computed<NfsInterchangeRule<string> | undefined>(() => {
    let match: NfsInterchangeRule<string> | undefined;

    for (const rule of this.rules()) {
      if (this.#mq.atLeast(rule[1])) {
        match = rule;
      }
    }

    return match;
  });

  protected readonly backgroundImage = computed(() => {
    const rule = this.selected();

    return rule ? `url("${rule[0]}")` : null;
  });

  readonly #rendered = signal<NfsInterchangeRule<string> | undefined | typeof UNSET_BG>(UNSET_BG);
  #lastEmitted: NfsInterchangeRule<string> | undefined | typeof UNSET_BG = UNSET_BG;

  constructor() {
    effect(() => {
      this.#rendered.set(this.selected());
    });

    afterRenderEffect({
      mixedReadWrite: () => {
        const selected = this.selected();
        const rendered = this.naive() ? selected : this.#rendered();

        if (rendered === UNSET_BG || rendered !== selected || rendered === this.#lastEmitted) {
          return;
        }

        this.#lastEmitted = rendered;
        this.replaced.emit(rendered);
      },
    });
  }
}
