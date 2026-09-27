// Soft reversal of B1: keep the value, deprecate it, render it as 'dialog'.
// Both the old wrapper and the old exhaustive switch still compile.
type NfsTriggerRole = 'disclosure' | 'dialog' | 'modal-dialog' | 'toggle-button' | 'none';
type Signal<T> = () => T;

interface NfsOpenable {
  readonly triggerRole: Signal<NfsTriggerRole>;
}

export class AppConfirm implements NfsOpenable {
  readonly triggerRole: Signal<NfsTriggerRole> = () => 'modal-dialog';
}

export function ariaFor(role: NfsTriggerRole): string {
  switch (role) {
    case 'disclosure':
      return 'expanded,controls';
    case 'dialog':
    case 'modal-dialog': // deprecated alias of 'dialog'
      return 'haspopup,controls,expanded';
    case 'toggle-button':
      return 'pressed';
    case 'none':
      return '';
    default: {
      const unreachable: never = role;
      return unreachable;
    }
  }
}
