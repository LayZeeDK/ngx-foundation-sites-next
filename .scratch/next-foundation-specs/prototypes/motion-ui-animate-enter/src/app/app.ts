import { Component, signal } from '@angular/core';

/**
 * Mirrors building-blocks.md 1.6 rule 1 for a persistent element that stays
 * in the DOM and changes state through a bound class: wait for
 * animationend (filtered by event.target) before treating the state change
 * as complete, and race it against a fallback timer of the declared
 * duration plus 100ms so a stylesheet that dropped the animation still
 * completes (Material's mechanic, R:material 0.2 item 3).
 */
class StateBoxController {
  readonly isOpen = signal(false);
  readonly completion = signal<{ via: 'animationend' | 'fallback'; atMs: number } | null>(null);

  #openedAt = 0;
  #fallbackTimer: ReturnType<typeof setTimeout> | undefined;

  /** The nfs-fade-in duration this directive declares (1.6 rule 1's "declared duration"). */
  static readonly #DECLARED_DURATION_MS = 500;
  static readonly #FALLBACK_BUFFER_MS = 100;

  open(): void {
    this.completion.set(null);
    this.isOpen.set(true);
    this.#openedAt = performance.now();

    clearTimeout(this.#fallbackTimer);
    this.#fallbackTimer = setTimeout(
      () => this.completion.set({ via: 'fallback', atMs: performance.now() - this.#openedAt }),
      StateBoxController.#DECLARED_DURATION_MS + StateBoxController.#FALLBACK_BUFFER_MS,
    );
  }

  onAnimationEnd(event: AnimationEvent, host: EventTarget | null): void {
    if (event.target !== host) {
      return;
    }

    clearTimeout(this.#fallbackTimer);
    this.completion.set({ via: 'animationend', atMs: performance.now() - this.#openedAt });
  }

  reset(): void {
    clearTimeout(this.#fallbackTimer);
    this.isOpen.set(false);
    this.completion.set(null);
  }
}

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  // Case 1: animate.enter/animate.leave on inserted and removed elements,
  // one signal per box so each keyframe pair can be toggled independently.
  // Boxes start hidden so a test can click to insert (animate.enter) and
  // click again to remove (animate.leave) instead of racing initial render.
  protected readonly showFadeBox = signal(false);
  protected readonly showSlideBox = signal(false);
  protected readonly showHingeSpinBox = signal(false);

  protected toggle(box: 'fade' | 'slide' | 'hingeSpin'): void {
    switch (box) {
      case 'fade': {
        this.showFadeBox.update((shown) => !shown);

        break;
      }

      case 'slide': {
        this.showSlideBox.update((shown) => !shown);

        break;
      }

      case 'hingeSpin': {
        this.showHingeSpinBox.update((shown) => !shown);

        break;
      }
    }
  }

  // Case 2: persistent elements, State class plus fallback timer.
  protected readonly normalStateBox = new StateBoxController();
  protected readonly brokenStateBox = new StateBoxController();

  // Case 4: consumer-supplied Motion UI transition classes under animate.enter.
  protected readonly showMotionUiClassBox = signal(false);
  protected readonly showSoloTransitionBox = signal(false);

  protected toggleMotionUiClassBox(): void {
    this.showMotionUiClassBox.update((shown) => !shown);
  }

  protected toggleSoloTransitionBox(): void {
    this.showSoloTransitionBox.update((shown) => !shown);
  }
}
