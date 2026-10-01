import { Routes } from '@angular/router';
import { BenchPage } from './bench-page';
import { ClientDeferPage } from './client-defer-page';
import { LifecyclePage } from './lifecycle-page';
import { OrderPage } from './order-page';
import { SsrPage } from './ssr-page';

export const appRoutes: Routes = [
  { path: 'lifecycle', component: LifecyclePage },
  { path: 'ssr', component: SsrPage },
  { path: 'client-defer', component: ClientDeferPage },
  { path: 'order', component: OrderPage },
  { path: 'order-ssr-normal', component: OrderPage, data: { ssr: 'normal' } },
  { path: 'order-ssr-reversed', component: OrderPage, data: { ssr: 'reversed' } },
  { path: 'bench', component: BenchPage },
];
