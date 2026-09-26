import { Routes } from '@angular/router';
import { Demo } from './demo';
import { DeferredDemo } from './deferred-demo';
import { nfsRatGateToken } from './nfs/responsive-accordion-tabs';

const instanceGate = [{ provide: nfsRatGateToken, useValue: 'instance' as const }];

export const routes: Routes = [
  { path: '', component: Demo },
  { path: 'instance', component: Demo, providers: instanceGate },
  { path: 'prerendered', component: Demo },
  { path: 'client', component: Demo },
  { path: 'deferred', component: DeferredDemo },
  { path: 'deferred-instance', component: DeferredDemo, providers: instanceGate },
];
