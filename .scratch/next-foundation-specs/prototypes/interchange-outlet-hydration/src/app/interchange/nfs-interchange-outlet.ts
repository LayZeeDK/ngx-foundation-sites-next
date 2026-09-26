import {
  DOCUMENT,
  Directive,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { NfsBreakpointName } from '../media-query/nfs-breakpoints-token';
import { NfsMediaQuery } from '../media-query/nfs-media-query';
import { nfsProbeInit, nfsProbeMark } from '../render-probe';

// PROTOTYPE (throwaway). Minimal NfsInterchangeOutlet per specs/interchange.md
// (template mode) and ADR 0015: only breakpoint-name queries resolved through
// NfsMediaQuery.atLeast (the minimal NfsMediaQuery from the breakpoint handoff
// prototype exposes current/atLeast only) -- no named queries, raw media
// queries, or the unknown-name development warning, none of which this
// prototype's three questions depend on. No focus-on-swap rule either (out of
// scope for this ticket's three numbered cases; the spec's focus rule is a
// separate, untested concern here).
export type NfsInterchangeRule<T> = readonly [content: T, query: NfsBreakpointName];

const UNSET = Symbol('unset');
let instanceCounter = 0;

@Directive({
  selector: 'ng-container[nfsInterchange]',
  exportAs: 'nfsInterchange',
})
export class NfsInterchangeOutlet {
  readonly rules = input.required<readonly NfsInterchangeRule<TemplateRef<unknown>>[]>({
    alias: 'nfsInterchange',
  });

  readonly replaced = output<NfsInterchangeRule<TemplateRef<unknown>> | undefined>();

  readonly #mq = inject(NfsMediaQuery);
  readonly #vcr = inject(ViewContainerRef);
  readonly #document = inject(DOCUMENT);
  readonly #probe = nfsProbeInit(this.#document);

  /** Last matching rule wins, per specs/interchange.md's query resolution. */
  readonly selected = computed<NfsInterchangeRule<TemplateRef<unknown>> | undefined>(() => {
    let match: NfsInterchangeRule<TemplateRef<unknown>> | undefined;

    for (const rule of this.rules()) {
      if (this.#mq.atLeast(rule[1])) {
        match = rule;
      }
    }

    return match;
  });

  #renderedTemplate: TemplateRef<unknown> | undefined;
  #lastEmitted: NfsInterchangeRule<TemplateRef<unknown>> | undefined | typeof UNSET = UNSET;

  readonly #instanceId = ++instanceCounter;

  constructor() {
    nfsProbeMark(this.#probe, `outlet-ctor:${this.#instanceId}`);

    // Runs on the server too (specs/interchange.md, Implementation level,
    // "Template" bullet): this is what puts the Server breakpoint's template
    // into the server HTML. Compares the selected template with the one
    // currently rendered; clears and re-creates only when it differs.
    effect(() => {
      const selected = this.selected();
      const template = selected?.[0];

      nfsProbeMark(
        this.#probe,
        `outlet-effect-run:${this.#instanceId}:${selected?.[1] ?? 'none'}:sameTemplate=${template === this.#renderedTemplate}`,
      );

      if (template === this.#renderedTemplate) {
        return;
      }

      this.#vcr.clear();
      this.#renderedTemplate = template;

      if (template) {
        this.#vcr.createEmbeddedView(template);
      }

      nfsProbeMark(this.#probe, `outlet-swap:${selected?.[1] ?? 'none'}`);
    });

    // Never runs on the server (render callbacks don't run there); this is
    // what emits `replaced` "starting with the first client render" per the
    // spec's decision 12.
    afterRenderEffect(() => {
      const selected = this.selected();

      if (selected === this.#lastEmitted) {
        return;
      }

      this.#lastEmitted = selected;
      nfsProbeMark(this.#probe, `replaced:${selected?.[1] ?? 'none'}`);
      this.replaced.emit(selected);
    });
  }
}
