import { Directive, input, model, output } from '@angular/core';

/**
 * PROTOTYPE: class-toggling disclosure button.
 * input: the id of the controlled panel; model: expanded; output: toggled.
 */
@Directive({
  selector: 'button[nfsDisclosure]',
  exportAs: 'nfsDisclosure',
  host: {
    type: 'button',
    class: 'nfs-disclosure',
    '[class.is-active]': 'expanded()',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-controls]': 'controls()',
    '(click)': 'toggle()',
  },
})
export class NfsDisclosure {
  readonly controls = input.required<string>({ alias: 'nfsDisclosure' });
  readonly expanded = model(false);
  readonly toggled = output<boolean>();

  toggle(): void {
    this.expanded.update((value) => !value);
    this.toggled.emit(this.expanded());
  }
}
