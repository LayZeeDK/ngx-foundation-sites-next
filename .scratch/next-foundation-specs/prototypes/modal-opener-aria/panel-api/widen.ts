// Option A shipped with four values; a consumer wrote an exhaustive switch.
// Then the library widened the union to five (A -> B1 after release).
type NfsTriggerRole = 'disclosure' | 'dialog' | 'modal-dialog' | 'toggle-button' | 'none';

export function ariaFor(role: NfsTriggerRole): string {
  switch (role) {
    case 'disclosure':
      return 'expanded,controls';
    case 'dialog':
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
