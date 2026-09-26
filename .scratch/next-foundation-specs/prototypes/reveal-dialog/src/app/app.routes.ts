import { Routes } from '@angular/router';
import { Cases } from './cases';
import { OpenByDefault } from './open-by-default';

export const routes: Routes = [
  { path: '', component: Cases },
  { path: 'open-by-default', component: OpenByDefault },
];
