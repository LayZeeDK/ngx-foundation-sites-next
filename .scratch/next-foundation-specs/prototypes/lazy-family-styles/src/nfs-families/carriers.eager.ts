// PROTOTYPE ONLY: the `eager` build swaps this in, so the carriers ship in main.js (M1).
import { NfsFamilyCarriers } from '../lib/family-styles';
import ButtonStyles from './button';
import CalloutStyles from './callout';
import DropdownMenuStyles from './dropdown-menu';
import MenuStyles from './menu';

export const carriers: NfsFamilyCarriers = {
  button: ButtonStyles,
  callout: CalloutStyles,
  menu: MenuStyles,
  'dropdown-menu': DropdownMenuStyles,
};
