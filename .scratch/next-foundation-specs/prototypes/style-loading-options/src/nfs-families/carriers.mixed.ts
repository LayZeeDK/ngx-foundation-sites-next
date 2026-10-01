// PROTOTYPE ONLY: option C. The `mixed` build swaps this in: lazy by default, and the consumer
// opts the dropdown pane family in to `eager` because its first use comes from a click.
import { NfsFamilyCarriers } from '../lib/family-styles';
import DropdownStyles from './dropdown';

export const carriers: NfsFamilyCarriers = {
  button: () => import('./button'),
  callout: () => import('./callout'),
  dropdown: DropdownStyles, // eager opt-in
  menu: () => import('./menu'),
  'dropdown-menu': () => import('./dropdown-menu'),
};
