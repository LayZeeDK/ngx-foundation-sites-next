// PROTOTYPE (throwaway): its own file so the @defer block has a real lazy dependency.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SiteMenu } from './site-menu';

@Component({
  selector: 'app-deferred-menu',
  imports: [SiteMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-site-menu [current]="current()" />`,
})
export class DeferredMenu {
  readonly current = input(false);
}
