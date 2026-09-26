// PROTOTYPE (throwaway) -- one page per rendering case. Route data `current: true` selects
// the markup with the static `is-active` section and the two-way [(expanded)].
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SiteMenu } from './site-menu';
import { DeferredMenu } from './deferred-menu';
import { NfsMediaQuery } from './media-query';

function isCurrent(): boolean {
  return inject(ActivatedRoute).snapshot.data['current'] === true;
}

/** /csr, /ssr, /prerendered (and /current variants): the menu at the top of the page. */
@Component({
  selector: 'app-menu-page',
  imports: [SiteMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>ResponsiveMenu swap prototype</h1>
    <app-site-menu [current]="current" />
    <p><a href="#after" data-testid="outside">Link after the menu</a></p>
  `,
})
export class MenuPage {
  protected readonly current = isCurrent();
}

/**
 * /deferred (and variants): the menu inside @defer (hydrate on viewport) below a spacer.
 * The page reads the Breakpoint service, so the service is live before the block hydrates.
 */
@Component({
  selector: 'app-deferred-page',
  imports: [DeferredMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>ResponsiveMenu in a hydrate-on-viewport block</h1>
    <p data-testid="page-breakpoint">page breakpoint={{ mq.current() }}</p>
    <div data-testid="spacer" style="height: 2000px">Scroll down</div>
    @defer (hydrate on viewport) {
      <app-deferred-menu [current]="current" />
    } @placeholder {
      <p>placeholder</p>
    }
    <p><a href="#after" data-testid="outside">Link after the menu</a></p>
  `,
})
export class DeferredPage {
  protected readonly mq = inject(NfsMediaQuery);
  protected readonly current = isCurrent();
}

/** /late: a client-created instance, added by a button after the service went live. */
@Component({
  selector: 'app-late-page',
  imports: [SiteMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>ResponsiveMenu created after hydration</h1>
    <p data-testid="page-breakpoint">page breakpoint={{ mq.current() }}</p>
    <p><button type="button" data-testid="show" (click)="shown.set(true)">Show menu</button></p>
    @if (shown()) {
      <app-site-menu [current]="current" />
    }
    <p><a href="#after" data-testid="outside">Link after the menu</a></p>
  `,
})
export class LatePage {
  protected readonly mq = inject(NfsMediaQuery);
  protected readonly shown = signal(false);
  protected readonly current = isCurrent();
}

@Component({
  selector: 'app-index',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Cases</h1>
    <ul>
      @for (path of paths; track path) {
        <li><a [routerLink]="path">{{ path }}</a></li>
      }
    </ul>
  `,
})
export class IndexPage {
  protected readonly paths = [
    '/csr', '/csr/current', '/ssr', '/ssr/current', '/prerendered', '/prerendered/current',
    '/deferred', '/deferred/current', '/deferred-prerendered', '/late', '/late/current',
  ];
}
