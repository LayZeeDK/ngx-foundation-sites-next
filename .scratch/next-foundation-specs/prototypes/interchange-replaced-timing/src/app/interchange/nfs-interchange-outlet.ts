import {
  DOCUMENT,
  Directive,
  EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { NfsBreakpointName } from '../media-query/nfs-breakpoints-token';
import { NfsMediaQuery } from '../media-query/nfs-media-query';
import { nfsProbeInit, nfsProbeMark } from '../render-probe';

// PROTOTYPE (throwaway, re-run of ticket 67). The mechanism chosen for the
// Interchange spec's decision 12: "rendered-rule handoff".
// - The swap stays in change detection, on both platforms: an effect()
//   compares the selected template with the rendered one and swaps the
//   ViewContainerRef (the path the outlet-hydration prototype verified for
//   server HTML, hydration, and first paint). Before clearing, it records
//   whether the live activeElement is inside the view it is about to remove
//   (only then does that view still exist). It then records the rule it
//   rendered in the private `#rendered` signal.
// - One afterRenderEffect, mixedReadWrite phase, reads `#rendered` and acts
//   only when `#rendered` equals `selected()`: it moves focus (first tabbable
//   element of the new view, only when focus was inside the removed view and
//   has fallen to <body>), then emits `replaced`.
// Why this orders correctly: a signal write inside an earlier-phase render
// callback (the Breakpoint service's earlyRead handoff) dirties `selected`,
// which reaches this render callback in the same AfterRenderManager.execute()
// batch, before the change-detection pass that swaps. That batch sees
// `#rendered !== selected()` and does nothing; the swap effect's write to
// `#rendered` re-dirties the callback, and ApplicationRef.synchronizeOnce()
// runs render hooks only after a pass that leaves no view dirty, so the new
// view's update pass (bindings, @if, child inputs) is done first.
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
  readonly #checker = inject(InteractivityChecker);
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

  readonly #rendered = signal<NfsInterchangeRule<TemplateRef<unknown>> | undefined | typeof UNSET>(UNSET);

  #renderedTemplate: TemplateRef<unknown> | undefined;
  #view: EmbeddedViewRef<unknown> | undefined;
  #focusWasInside = false;
  #lastEmitted: NfsInterchangeRule<TemplateRef<unknown>> | undefined | typeof UNSET = UNSET;

  readonly #instanceId = ++instanceCounter;

  constructor() {
    nfsProbeMark(this.#probe, `outlet-ctor:${this.#instanceId}`);

    effect(() => {
      const selected = this.selected();
      const template = selected?.[0];

      if (template !== this.#renderedTemplate) {
        const active = this.#document.activeElement;

        if (active && this.#view?.rootNodes.some((node: Node) => node === active || node.contains?.(active))) {
          this.#focusWasInside = true;
        }

        this.#vcr.clear();
        this.#renderedTemplate = template;
        this.#view = template ? this.#vcr.createEmbeddedView(template) : undefined;
        nfsProbeMark(this.#probe, `outlet-swap:${selected?.[1] ?? 'none'}`);
      }

      this.#rendered.set(selected);
    });

    afterRenderEffect({
      mixedReadWrite: () => {
        const rendered = this.#rendered();

        if (rendered === UNSET || rendered !== this.selected() || rendered === this.#lastEmitted) {
          return;
        }

        this.#lastEmitted = rendered;

        if (this.#focusWasInside) {
          this.#focusWasInside = false;
          const active = this.#document.activeElement;

          if (!active || active === this.#document.body) {
            this.#firstTabbable()?.focus();
          }
        }

        nfsProbeMark(this.#probe, `replaced:${rendered?.[1] ?? 'none'}`);
        this.replaced.emit(rendered);
      },
    });
  }

  #firstTabbable(): HTMLElement | undefined {
    for (const node of this.#view?.rootNodes ?? []) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      for (const candidate of [node, ...Array.from(node.querySelectorAll<HTMLElement>('*'))]) {
        if (this.#checker.isTabbable(candidate)) {
          return candidate;
        }
      }
    }

    return undefined;
  }
}
