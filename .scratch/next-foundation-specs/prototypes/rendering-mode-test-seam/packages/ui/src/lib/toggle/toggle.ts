import { Directive, afterNextRender, model, signal } from '@angular/core';

/**
 * PROTOTYPE: a class-toggling directive for the rendering-mode test seam.
 *
 * - `is-active` is a host class binding on signal state, so it is in the server HTML.
 * - `click` is a host listener, so the server annotates the host with `jsaction` and the
 *   early event contract replays a pre-hydration click.
 * - `data-ready` is set in `afterNextRender`, which never runs on the server; its presence
 *   tells a test whether the code ran in server mode (`ngServerMode`) or client mode.
 */
@Directive({
  selector: '[nfsToggle]',
  host: {
    '[class.is-active]': 'active()',
    '[attr.data-ready]': 'ready() ? "" : null',
    '(click)': 'toggle()',
  },
})
export class NfsToggle {
  readonly active = model(false);
  protected readonly ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  toggle(): void {
    this.active.update((value) => !value);
  }
}
