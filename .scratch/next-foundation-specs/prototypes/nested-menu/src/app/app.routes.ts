import { Routes } from '@angular/router';
import { AccordionPage, DrilldownPage, DropdownPage, IndexPage, ResponsivePage } from './pages';

export const routes: Routes = [
  { path: '', component: IndexPage },
  { path: 'accordion', component: AccordionPage },
  { path: 'drilldown', component: DrilldownPage },
  { path: 'dropdown', component: DropdownPage },
  { path: 'dropdown-edge', component: DropdownPage, data: { edge: true } },
  { path: 'responsive', component: ResponsivePage, data: { rules: 'drilldown medium-dropdown' } },
  { path: 'responsive-accordion', component: ResponsivePage, data: { rules: 'accordion medium-dropdown' } },
];
