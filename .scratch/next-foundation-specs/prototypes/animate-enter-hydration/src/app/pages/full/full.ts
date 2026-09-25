import { Component, signal, afterNextRender } from '@angular/core';

/**
 * PROTOTYPE (throwaway) -- animate.enter at hydration, "full hydration" route.
 * Cases:
 *  - case1-static: animate.enter bound to a plain string, present in server HTML.
 *  - case1-suppressed: animate.enter bound to a signal that starts empty (never
 *    flips true for this element) -- tests whether an empty-until-afterNextRender
 *    signal suppresses the hydration-time animation.
 *  - case1-cssgate: animate.enter bound to a plain string, but the class's
 *    keyframe is disabled by a `html.nfs-hydrating` ancestor selector that the
 *    root component removes in its first afterNextRender -- tests the CSS-gate
 *    suppression approach.
 *  - case4-control: created client-side ~50ms after hydration (never server-
 *    rendered) -- the control case for "does a genuinely new element animate".
 */
@Component({
  selector: 'app-full',
  template: `
    <h1>Full hydration harness</h1>

    <div class="box" animate.enter="nfs-fade-in" data-testid="case1-static">
      case1-static
    </div>

    <div
      class="box"
      [animate.enter]="suppressedClasses()"
      data-testid="case1-suppressed"
    >
      case1-suppressed
    </div>

    <div
      class="box nfs-fade-in-gated"
      animate.enter="nfs-fade-in-gated"
      data-testid="case1-cssgate"
    >
      case1-cssgate (mixedReadWrite-phase gate; expected to still animate)
    </div>

    <div
      class="box nfs-fade-in-gated-read"
      animate.enter="nfs-fade-in-gated-read"
      data-testid="case1-cssgate-read"
    >
      case1-cssgate-read (read-phase gate)
    </div>

    <div
      class="box nfs-fade-in-gated-delayed"
      animate.enter="nfs-fade-in-gated-delayed"
      data-testid="case1-cssgate-delayed"
    >
      case1-cssgate-delayed (gate lifted 700ms later)
    </div>

    @if (clientCreated()) {
      <div class="box" animate.enter="nfs-fade-in" data-testid="case4-control">
        case4-control
      </div>
    }

    <button type="button" data-testid="create-client-element" (click)="clientCreated.set(true)">
      create client element now
    </button>
  `,
  styleUrl: './full.css',
})
export class FullPage {
  protected readonly suppressedClasses = signal('');
  protected readonly clientCreated = signal(false);

  constructor() {
    // ponytail: auto-fire the control case shortly after hydration so Playwright
    // does not have to synchronize a click for the common path; the button above
    // still lets a human (or a test) trigger it directly.
    afterNextRender(() => {
      setTimeout(() => this.clientCreated.set(true), 50);
    });
  }
}
