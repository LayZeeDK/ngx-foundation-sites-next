import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NfsMagellanLite } from '../magellan-lite';
import { NfsSmoothScroll } from '../smooth-scroll';

@Component({
  selector: 'app-page-a',
  imports: [RouterLink, NfsSmoothScroll, NfsMagellanLite],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-a.html',
  styleUrl: './page-a.scss',
})
export class PageA {
  protected readonly updateHistory =
    inject(ActivatedRoute).snapshot.queryParamMap.get('historyMode') === 'push';

  // Base-href-safe in-page hrefs (the spec's own usage-example recipe): pathname + search, so a
  // query string set at runtime (?restoration=, ?mixin=) is still present on the href and the
  // click stays a same-document navigation instead of a full reload with a differing query.
  protected readonly path = inject(Location).path();
}
