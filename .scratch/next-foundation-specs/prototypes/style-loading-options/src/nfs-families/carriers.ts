// CONSUMER FILE (a generator could write it): family name -> lazily loaded carrier.
// Options A (lazy on first use) and D (lazy, prefetched at idle) use this map.
import { NfsFamilyCarriers } from '../lib/family-styles';

export const carriers: NfsFamilyCarriers = {
  button: () => import('./button'),
  callout: () => import('./callout'),
  dropdown: () => import('./dropdown'),
  menu: () => import('./menu'),
  'dropdown-menu': () => import('./dropdown-menu'),
};
