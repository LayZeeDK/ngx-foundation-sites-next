import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, type Routes } from '@angular/router';
import { CASES } from './cases';

const ids = Object.keys(CASES);

@Component({
  selector: 'app-index',
  imports: [RouterLink],
  template: `<ul>
    @for (id of ids; track id) {
      <li><a [routerLink]="'/' + id">{{ id }}</a> (<a [routerLink]="'/csr/' + id">csr</a>)</li>
    }
  </ul>`,
})
export class IndexPage {
  protected readonly ids = ids;
}

const caseRoutes: Routes = Object.entries(CASES).map(([path, component]) => ({ path, component }));

// Every case twice: server-rendered and hydrated, and client-only under csr/.
export const routes: Routes = [
  { path: '', component: IndexPage },
  ...caseRoutes,
  { path: 'csr', children: caseRoutes },
];

@Component({ selector: 'app-root', imports: [RouterOutlet], template: `<router-outlet />` })
export class App {}
