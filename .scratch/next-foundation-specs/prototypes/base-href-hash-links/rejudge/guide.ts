import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IN_PAGE_RULE, NfsSmoothScroll } from '../smooth-scroll';

@Component({
  selector: 'app-guide',
  imports: [RouterLink, NfsSmoothScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 data-testid="guide-marker">Guide, rule {{ rule }}</h1>
    <p>recipe path field: <span data-testid="path">{{ path }}</span></p>
    <p>
      <a routerLink="/param-a/y" data-testid="go-a-y">go to /param-a/y</a>
      <a routerLink="/param-b/y" data-testid="go-b-y">go to /param-b/y</a>
    </p>

    <nav aria-label="Container host">
      <ul nfsSmoothScroll data-testid="container">
        <li><a href="#s2" data-testid="c-bare">container, bare #s2</a></li>
        <li><a [href]="path + '#s3'" data-testid="c-safe">container, base-href-safe #s3</a></li>
        <li><a [href]="livePath() + '#s3'" data-testid="c-live">container, live-call recipe #s3</a></li>
        <li><a [href]="urlPath() + '#s3'" data-testid="c-url">container, onUrlChange recipe #s3</a></li>
      </ul>
      <a routerLink="/param-b/y" [queryParams]="{ q: 1 }" data-testid="go-b-yq">go to /param-b/y?q=1</a>
    </nav>
    <p><a nfsSmoothScroll href="#s4" data-testid="l-bare">link host, bare #s4</a></p>
    <p><a href="#s2" data-testid="plain-bare">no directive, bare #s2</a></p>
    <p><a [href]="path + '#s3'" data-testid="plain-safe">no directive, base-href-safe #s3</a></p>
    <p><a routerLink="." fragment="s3" data-testid="router-link">routerLink with fragment s3</a></p>

    @defer (hydrate on interaction) {
      <div data-testid="defer-container-block">
        <ul nfsSmoothScroll data-testid="defer-container">
          <li><a href="#s5" data-testid="dc-bare">deferred container, bare #s5</a></li>
        </ul>
      </div>
    }
    @defer (hydrate on interaction) {
      <div data-testid="defer-link-block">
        <a nfsSmoothScroll href="#s6" data-testid="dl-bare">deferred link host, bare #s6</a>
      </div>
    }
    @defer (hydrate never) {
      <div data-testid="never-block">
        <ul nfsSmoothScroll data-testid="never-container">
          <li><a href="#s2" data-testid="nc-bare">hydrate never container, bare #s2</a></li>
        </ul>
      </div>
    }

    @for (n of sections; track n) {
      <section [id]="'s' + n" class="filler">
        <h2>Guide section {{ n }}</h2>
        <p><a href="https://example.com/" [attr.data-testid]="'inside-s' + n">first link inside s{{ n }}</a></p>
      </section>
    }
  `,
})
export class Guide {
  protected readonly rule = inject(IN_PAGE_RULE);
  protected readonly sections = [1, 2, 3, 4, 5, 6];
  readonly #location = inject(Location);
  // The Smooth Scroll spec's base-href-safe recipe, read once (the spec's usage example).
  protected readonly path = this.#location.prepareExternalUrl(this.#location.path());

  // The Smooth Scroll and Magellan specs' recipe at HEAD (after the ruling): a signal updated from Location.onUrlChange.
  readonly #currentPath = () => this.#location.prepareExternalUrl(this.#location.path());
  protected readonly urlPath = signal(this.#currentPath());

  constructor() {
    inject(DestroyRef).onDestroy(this.#location.onUrlChange(() => this.urlPath.set(this.#currentPath())));
  }

  // angular.dev's form: a call in the template, re-evaluated whenever this view is checked.
  protected livePath(): string {
    return this.#location.prepareExternalUrl(this.#location.path());
  }
}
