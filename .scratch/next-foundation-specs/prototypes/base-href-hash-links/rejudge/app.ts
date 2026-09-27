import { Location } from '@angular/common';
import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NfsSmoothScroll } from './smooth-scroll';

// Re-judge of ticket 74: the shell starts navigations from outside the routed (OnPush) page, and
// carries a link built from the spec's current recipe (a signal updated from Location.onUrlChange).
@Component({
  imports: [RouterOutlet, RouterLink, NfsSmoothScroll],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly #location = inject(Location);
  readonly #currentPath = () => this.#location.prepareExternalUrl(this.#location.path());
  protected readonly path = signal(this.#currentPath());

  constructor() {
    inject(DestroyRef).onDestroy(this.#location.onUrlChange(() => this.path.set(this.#currentPath())));
    // Marks the end of full-application hydration for the e2e cases.
    afterNextRender(() => {
      (window as unknown as { __hydrated?: boolean }).__hydrated = true;
    });
  }
}
