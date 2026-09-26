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
} from '@angular/core';
import { NfsMediaQuery } from '../media-query/nfs-media-query';
import { nfsProbeInit, nfsProbeMark } from '../render-probe';
import { NfsInterchangeRule } from './nfs-interchange-outlet';

// PROTOTYPE (throwaway). Fallback per specs/interchange.md decision table
// row 11: "the outlet compares and swaps in ngDoCheck ... reading selected()
// there; the public API does not change." Only the swap trigger moves from
// a plain effect() to ngDoCheck -- `replaced` still emits from
// afterRenderEffect, unchanged. This is the fix for the ordering finding in
// NfsInterchangeOutlet (README.md "What went wrong"): ngDoCheck runs as
// part of change detection itself, so the DOM swap it performs is always
// complete before any afterRenderEffect (a render callback, which runs only
// after change detection finishes) can read the result.
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

  #renderedTemplate: TemplateRef<unknown> | undefined;
  #lastEmitted: NfsInterchangeRule<TemplateRef<unknown>> | undefined | typeof UNSET_DOCHECK = UNSET_DOCHECK;

  constructor() {
    // Unchanged from the primary directive: replaced (and, in the full
    // spec, the focus rule) still emits from a render callback, "starting
    // with the first client render". Never runs on the server.
    afterRenderEffect(() => {
      const selected = this.selected();

      if (selected === this.#lastEmitted) {
        return;
      }

      this.#lastEmitted = selected;
      nfsProbeMark(this.#probe, `replaced-docheck:${selected?.[1] ?? 'none'}`);
      this.replaced.emit(selected);
    });
  }

  // Runs on the server too (a standard CD lifecycle hook, same category as
  // ngOnInit): this is what puts the Server breakpoint's template into the
  // server HTML in this fallback, exactly as the plain effect() did in the
  // primary directive. Runs synchronously as part of change detection,
  // strictly before any afterRenderEffect for the same pass.
  ngDoCheck(): void {
    const selected = this.selected();
    const template = selected?.[0];

    if (template === this.#renderedTemplate) {
      return;
    }

    this.#vcr.clear();
    this.#renderedTemplate = template;

    if (template) {
      this.#vcr.createEmbeddedView(template);
    }

    nfsProbeMark(this.#probe, `outlet-docheck-swap:${selected?.[1] ?? 'none'}`);
  }
}

const UNSET_DOCHECK = Symbol('unset-docheck');
