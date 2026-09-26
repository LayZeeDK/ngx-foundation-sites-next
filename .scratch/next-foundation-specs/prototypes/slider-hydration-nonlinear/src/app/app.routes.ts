import { Routes } from '@angular/router';
import { Home } from './home';
import { RtlDemo } from './rtl-demo';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'rtl', component: RtlDemo },
];
