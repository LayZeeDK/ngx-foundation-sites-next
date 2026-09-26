// PROTOTYPE (throwaway). One page, two accordions and two tab sets under
// Foundation markup, plus a state readout. See ../../README.md.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NFS_ACCORDION } from './nfs/accordion';
import { NFS_TABS } from './nfs/tabs';

@Component({
  selector: 'app-root',
  imports: [NFS_ACCORDION, NFS_TABS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  protected readonly a1 = signal(true);
  protected readonly a2 = signal(false);
  protected readonly a3 = signal(false);
  protected readonly selected = signal<string | undefined>('panel1');
}
