import {
  DOCUMENT,
  Directive,
  DoCheck,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NfsMediaQuery } from '../media-query/nfs-media-query';
import { nfsProbeInit, nfsProbeMark } from '../render-probe';
import { NfsInterchangeRule } from './nfs-interchange-outlet';

// PROTOTYPE (throwaway, re-run of ticket 67). The spec's ngDoCheck fallback
// with the same rendered-rule handoff as the primary outlet: the swap moves
// to ngDoCheck, which also records the rendered rule in `#rendered`; the
// render callback emits only when `#rendered` equals `selected()`. No focus
// rule here (the primary outlet carries it). Question this file answers:
// does the ngDoCheck swap still run at all once `replaced` no longer fires
// early? (In the first prototype, the early `replaced` handler's signal
// write was what re-checked the page and so ran ngDoCheck.)
const UNSET_DOCHECK = Symbol('unset-docheck');

@Directive({
  selector: 'ng-container[nfsInterchangeDoCheck]',
  exportAs: 'nfsInterchange',
})
export class NfsInterchangeOutletDoCheck implements DoCheck {
  readonly rules = input.required<readonly NfsInterchangeRule<TemplateRef<unknown>>[]>({
    alias: 'nfsInterchangeDoCheck',
  });

  readonly replaced = output<NfsInterchangeRule<TemplateRef<unknown>> | undefined>();

  readonly #mq = inject(NfsMediaQuery);
  readonly #vcr = inject(ViewContainerRef);
  readonly #document = inject(DOCUMENT);
  readonly #probe = nfsProbeInit(this.#document);

  readonly selected = computed<NfsInterchangeRule<TemplateRef<unknown>> | undefined>(() => {
    let match: NfsInterchangeRule<TemplateRef<unknown>> | undefined;

    for (const rule of this.rules()) {
      if (this.#mq.atLeast(rule[1])) {
        match = rule;
      }
    }

    return match;
  });

  readonly #rendered = signal<NfsInterchangeRule<TemplateRef<unknown>> | undefined | typeof UNSET_DOCHECK>(
    UNSET_DOCHECK,
  );

  #renderedTemplate: TemplateRef<unknown> | undefined;
  #lastEmitted: NfsInterchangeRule<TemplateRef<unknown>> | undefined | typeof UNSET_DOCHECK = UNSET_DOCHECK;

  constructor() {
    afterRenderEffect({
      mixedReadWrite: () => {
        const rendered = this.#rendered();

        if (rendered === UNSET_DOCHECK || rendered !== this.selected() || rendered === this.#lastEmitted) {
          return;
        }

        this.#lastEmitted = rendered;
        nfsProbeMark(this.#probe, `replaced-docheck:${rendered?.[1] ?? 'none'}`);
        this.replaced.emit(rendered);
      },
    });
  }

  ngDoCheck(): void {
    const selected = this.selected();
    const template = selected?.[0];

    if (template !== this.#renderedTemplate) {
      this.#vcr.clear();
      this.#renderedTemplate = template;

      if (template) {
        this.#vcr.createEmbeddedView(template);
      }

      nfsProbeMark(this.#probe, `outlet-docheck-swap:${selected?.[1] ?? 'none'}`);
    }

    this.#rendered.set(selected);
  }
}
