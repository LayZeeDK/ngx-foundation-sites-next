import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-b',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Page B</h1>
    <p><a routerLink="/page-a" data-testid="to-page-a">Back to Page A</a></p>
  `,
})
export class PageB {}
