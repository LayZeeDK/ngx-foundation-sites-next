import { Component, signal } from '@angular/core';
import { NfsSticky } from './sticky/nfs-sticky';
import { NfsStickyContainer } from './sticky/nfs-sticky-container';

@Component({
  imports: [NfsSticky, NfsStickyContainer],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly eventLog = signal<string[]>([]);

  protected log(caseId: string, kind: 'stuck' | 'unstuck', edge: string): void {
    this.eventLog.update((entries) => [...entries, `${caseId}: ${kind}(${edge})`]);
  }
}
