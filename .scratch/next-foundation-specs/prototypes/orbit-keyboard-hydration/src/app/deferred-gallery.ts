import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Orbit } from './orbit';

// PROTOTYPE fixture: the whole carousel inside `@defer (hydrate on viewport)`, pushed
// below the fold by a filler, so the hydrate trigger has something to observe.
@Component({
  selector: 'app-deferred-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Orbit],
  template: `
    <div class="fixture-filler" style="height: 150vh" data-testid="pre-defer-filler"></div>
    @defer (hydrate on viewport) {
      <app-orbit />
    } @placeholder {
      <div class="orbit-placeholder" style="height: 484px" data-testid="orbit-placeholder"></div>
    }
  `,
})
export class DeferredGallery {}
