import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NfsSmoothScroll } from '../smooth-scroll';

// Recipe staleness under component reuse (dossier open unknown 6): /docs/:id reuses this
// component when only :id changes. "once" is the Smooth Scroll spec's recipe (a field read
// at construction); "live" follows Location.onUrlChange.
@Component({
  selector: 'app-docs',
  imports: [RouterLink, NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 data-testid="docs-marker">Docs {{ instance }}</h1>
    <p><a routerLink="/docs/y" data-testid="to-y">go to /docs/y (same route config)</a></p>
    <ul nfsSmoothScroll>
      <li><a [href]="once + '#s3'" data-testid="once">recipe read once, #s3</a></li>
      <li><a [href]="live() + '#s3'" data-testid="live">recipe following onUrlChange, #s3</a></li>
    </ul>
    @for (n of sections; track n) {
      <section [id]="'s' + n" class="filler"><h2>Docs section {{ n }}</h2></section>
    }
  `,
})
export class Docs {
  protected readonly sections = [1, 2, 3, 4, 5, 6];
  protected readonly instance = Math.random().toString(36).slice(2, 7);
  readonly #location = inject(Location);
  readonly #current = () => this.#location.prepareExternalUrl(this.#location.path());
  protected readonly once = this.#current();
  protected readonly live = signal(this.#current());

  constructor() {
    inject(DestroyRef).onDestroy(this.#location.onUrlChange(() => this.live.set(this.#current())));
  }
}
