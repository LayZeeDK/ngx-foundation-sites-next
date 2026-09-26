import {
  DOCUMENT,
  Directive,
  EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { NfsMediaQuery } from '../media-query/nfs-media-query';
import { nfsProbeInit, nfsProbeMark } from '../render-probe';
import { NfsInterchangeRule } from './nfs-interchange-outlet';

// PROTOTYPE (throwaway, re-run of ticket 67). The candidate fix sketched by
// the outlet-hydration prototype, for comparison: effect() swaps only until
// the outlet's first render callback (server HTML and the hydration pass);
// from then on one afterRenderEffect (mixedReadWrite) checks focus, swaps,
// moves focus, and emits in one synchronous body. `detect` adds an explicit
// `detectChanges()` on the new view before focus and emission; without it
// the new view has had only its creation pass when `replaced` fires.
const UNSET_CANDIDATE = Symbol('unset-candidate');

@Directive({
  selector: 'ng-container[nfsInterchangeCandidate]',
  exportAs: 'nfsInterchange',
})
export class NfsInterchangeOutletCandidate {
  readonly rules = input.required<readonly NfsInterchangeRule<TemplateRef<unknown>>[]>({
    alias: 'nfsInterchangeCandidate',
  });

  readonly detect = input(false, { transform: booleanAttribute });

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

  #live = false;
  #renderedTemplate: TemplateRef<unknown> | undefined;
  #view: EmbeddedViewRef<unknown> | undefined;
  #lastEmitted: NfsInterchangeRule<TemplateRef<unknown>> | undefined | typeof UNSET_CANDIDATE = UNSET_CANDIDATE;

  constructor() {
    effect(() => {
      if (this.#live) {
        return;
      }

      this.#swap(this.selected(), 'effect');
    });

    afterRenderEffect({
      mixedReadWrite: () => {
        this.#live = true;
        const selected = this.selected();
        const active = this.#document.activeElement;
        const focusWasInside =
          !!active && !!this.#view?.rootNodes.some((node: Node) => node === active || node.contains?.(active));

        if (this.#swap(selected, 'callback') && this.detect()) {
          this.#view?.detectChanges();
        }

        if (selected === this.#lastEmitted) {
          return;
        }

        this.#lastEmitted = selected;

        if (focusWasInside && this.#document.activeElement === this.#document.body) {
          this.#firstTabbable()?.focus();
        }

        nfsProbeMark(this.#probe, `replaced-candidate:${selected?.[1] ?? 'none'}`);
        this.replaced.emit(selected);
      },
    });
  }

  #swap(selected: NfsInterchangeRule<TemplateRef<unknown>> | undefined, from: string): boolean {
    const template = selected?.[0];

    if (template === this.#renderedTemplate) {
      return false;
    }

    this.#vcr.clear();
    this.#renderedTemplate = template;
    this.#view = template ? this.#vcr.createEmbeddedView(template) : undefined;
    nfsProbeMark(this.#probe, `outlet-swap-candidate:${from}:${selected?.[1] ?? 'none'}`);

    return true;
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
