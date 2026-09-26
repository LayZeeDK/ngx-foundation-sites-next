import { Routes } from '@angular/router';
import { InterchangePage } from './interchange-page/interchange-page';
import { InterchangePageFallback } from './interchange-page-fallback/interchange-page-fallback';

export const routes: Routes = [
  { path: 'csr', component: InterchangePage },
  { path: 'ssr', component: InterchangePage },
  { path: 'prerendered', component: InterchangePage },
  { path: 'csr-fallback', component: InterchangePageFallback },
  { path: 'ssr-fallback', component: InterchangePageFallback },
  { path: 'prerendered-fallback', component: InterchangePageFallback },
];
