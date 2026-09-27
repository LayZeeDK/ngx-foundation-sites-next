// Option B1: the wrapper forwards one member and can never disagree with its Reveal.
type NfsTriggerRole = 'disclosure' | 'dialog' | 'modal-dialog' | 'toggle-button' | 'none';
type Signal<T> = () => T;

interface NfsOpenable {
  readonly triggerRole: Signal<NfsTriggerRole>;
}

class NfsReveal implements NfsOpenable {
  readonly overlay: Signal<boolean> = () => true;
  readonly triggerRole: Signal<'dialog' | 'modal-dialog'> = () => (this.overlay() ? 'modal-dialog' : 'dialog');
}

export class AppConfirm implements NfsOpenable {
  readonly reveal = new NfsReveal();
  readonly triggerRole: Signal<NfsTriggerRole> = () => this.reveal.triggerRole();
}
