import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { caseNames } from './app.routes';

/** The shell holds no library directive, so a page's own markup decides what is instantiated. */
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav>
      @for (name of caseNames; track name) {
        <a [routerLink]="'/' + name">{{ name }}</a>
        {{ ' ' }}
      }
    </nav>
    <main><router-outlet /></main>
  `,
})
export class App {
  protected readonly caseNames = caseNames;
}
