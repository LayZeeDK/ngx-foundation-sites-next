import { Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/core';

/**
 * PROTOTYPE (throwaway). The root component sets a `.nfs-hydrating` class on
 * <html> synchronously (before Angular bootstraps, see index.html inline
 * script) and this constructor removes it in the first afterNextRender --
 * the "CSS-gate" suppression approach under test for animate.enter (see
 * pages/full/full.css `.nfs-fade-in-gated`).
 */
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly #document = inject(DOCUMENT);

  constructor() {
    // Naive CSS gate: default (mixedReadWrite) phase. Angular's own
    // animate.enter class-adding is *also* deferred to an afterNextRender
    // callback (packages/core/src/animation/queue.ts scheduleAnimationQueue,
    // mixedReadWrite phase, registered the first time an animate.enter
    // instruction runs). Because this callback is registered first (the root
    // component constructs before any routed page), it runs first in the
    // same phase, so the gate is already lifted before Angular adds the
    // enter classes -- this variant is expected NOT to suppress the
    // animation (see README).
    afterNextRender(() => {
      this.#document.documentElement.classList.remove('nfs-hydrating');
    });

    // Read-phase CSS gate: the `read` phase runs strictly after
    // `mixedReadWrite` in the same render pass, i.e. after Angular's
    // animation queue has already added the enter classes -- this variant is
    // the one under test for "can a directive suppress the hydration
    // animation via a CSS gate".
    afterNextRender({
      read: () => {
        this.#document.documentElement.classList.remove('nfs-hydrating-read');
      },
    });

    // Delayed CSS gate: removed 700ms later, well after the read-phase
    // variant already proved the classes are present before any gate can be
    // lifted. Tests whether the gate at least *postpones* the animation
    // (changing `animation-name` from `none` back to a real keyframe name
    // is itself a fresh animation start per the CSS Animations spec) rather
    // than permanently suppressing it.
    afterNextRender(() => {
      setTimeout(() => {
        this.#document.documentElement.classList.remove('nfs-hydrating-delayed');
      }, 700);
    });
  }
}
