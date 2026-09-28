import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

/** Stand-in for a structural directive, so `*nfsShowFor` and `<ng-template [nfsShowFor]>` match it. */
@Directive({
  selector: '[nfsShowFor]',
})
export class NfsShowFor {
  readonly nfsShowFor = input.required<'medium' | 'large'>();
  readonly #template = inject(TemplateRef);
  readonly #container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      this.nfsShowFor();
      this.#container.clear();
      this.#container.createEmbeddedView(this.#template);
    });
  }
}
