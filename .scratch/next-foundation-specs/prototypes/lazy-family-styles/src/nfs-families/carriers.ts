// CONSUMER FILE (a generator could write it): family name -> lazily loaded carrier.
import { NfsFamilyCarriers } from '../lib/family-styles';

export const carriers: NfsFamilyCarriers = {
  button: () => import('./button'),
  callout: () => import('./callout'),
  menu: () => import('./menu'),
  'dropdown-menu': () => import('./dropdown-menu'),
};
