import { Component, signal } from '@angular/core';

/**
 * PROTOTYPE (throwaway) -- animate.enter at hydration under a prerendered route
 * (RenderMode.Prerender in app.routes.server.ts: SSR at build time, REQUEST null,
 * same rules as SSR otherwise per research/angular-rendering-modes.md section 1).
 */
@Component({
  selector: 'app-prerendered',
  template: `
    <h1>Prerendered hydration harness</h1>

    <div class="box" animate.enter="nfs-fade-in" data-testid="case3-static">
      case3-static
    </div>

    <div
      class="box"
      [animate.enter]="suppressedClasses()"
      data-testid="case3-suppressed"
    >
      case3-suppressed
    </div>

    <div
      class="box nfs-fade-in-gated"
      animate.enter="nfs-fade-in-gated"
      data-testid="case3-cssgate"
    >
      case3-cssgate
    </div>

    <div
      class="box nfs-fade-in-gated-read"
      animate.enter="nfs-fade-in-gated-read"
      data-testid="case3-cssgate-read"
    >
      case3-cssgate-read
    </div>
  `,
  styleUrl: '../full/full.css',
})
export class PrerenderedPage {
  protected readonly suppressedClasses = signal('');
}
