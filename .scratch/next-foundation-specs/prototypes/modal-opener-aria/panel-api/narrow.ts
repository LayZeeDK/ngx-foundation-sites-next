// Option B1 shipped with five values; a consumer wrapper returns 'modal-dialog'.
// Then the library removed the value (B1 -> A after release).
type NfsTriggerRole = 'disclosure' | 'dialog' | 'toggle-button' | 'none';
type Signal<T> = () => T;

interface NfsOpenable {
  readonly triggerRole: Signal<NfsTriggerRole>;
}

export class AppConfirm implements NfsOpenable {
  readonly triggerRole: Signal<NfsTriggerRole> = () => 'modal-dialog';
}
