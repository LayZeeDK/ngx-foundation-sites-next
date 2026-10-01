// PROTOTYPE ONLY: option B. The `eager` build swaps this in, so every carrier ships in main.js.
import { NfsFamilyCarriers } from '../lib/family-styles';
import ButtonStyles from './button';
import CalloutStyles from './callout';
import DropdownStyles from './dropdown';
import DropdownMenuStyles from './dropdown-menu';
import MenuStyles from './menu';

export const carriers: NfsFamilyCarriers = {
  button: ButtonStyles,
  callout: CalloutStyles,
  dropdown: DropdownStyles,
  menu: MenuStyles,
  'dropdown-menu': DropdownMenuStyles,
};
