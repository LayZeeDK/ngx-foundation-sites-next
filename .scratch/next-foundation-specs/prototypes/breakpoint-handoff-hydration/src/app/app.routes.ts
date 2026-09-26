import { Routes } from '@angular/router';
import { BreakpointPage } from './breakpoint-page/breakpoint-page';

export const routes: Routes = [
  { path: 'csr', component: BreakpointPage },
  { path: 'ssr', component: BreakpointPage },
  { path: 'prerendered', component: BreakpointPage },
];
