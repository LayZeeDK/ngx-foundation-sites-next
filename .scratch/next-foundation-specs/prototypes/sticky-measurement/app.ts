import { Component, afterNextRender, signal } from '@angular/core';

import { nfsMediaQueryIs } from './sticky/breakpoints';
import { NfsSticky } from './sticky/nfs-sticky';
import { NfsStickyContainer } from './sticky/nfs-sticky-container';
import { canonicalizeStickyOn } from './sticky/state';

@Component({
  imports: [NfsSticky, NfsStickyContainer],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly eventLog = signal<string[]>([]);

  constructor() {
    // Test hook only: exposes the SAME module the directive uses for its independent JS
    // breakpoint gate, so case 4's Playwright test compares the CSS gate against this rather
    // than reimplementing the breakpoint math a second time in the test file.
    afterNextRender(() => {
      (window as unknown as { nfsGateMatches: (raw: string) => boolean }).nfsGateMatches = (raw: string) =>
        nfsMediaQueryIs(canonicalizeStickyOn(raw));
    });
  }

  protected log(caseId: string, kind: 'stuck' | 'unstuck', edge: string): void {
    this.eventLog.update((entries) => [...entries, `${caseId}: ${kind}(${edge})`]);
  }
}
