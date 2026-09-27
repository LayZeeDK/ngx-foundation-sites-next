// Option B2: an optional modality member. A wrapper that forgets to forward it
// compiles, and the Trigger silently renders the non-modal output.
type NfsTriggerRole = 'disclosure' | 'dialog' | 'toggle-button' | 'none';
type Signal<T> = () => T;

interface NfsOpenable {
  readonly triggerRole: Signal<NfsTriggerRole>;
  readonly modal?: Signal<boolean>;
}

class NfsReveal implements NfsOpenable {
  readonly triggerRole: Signal<NfsTriggerRole> = () => 'dialog';
  readonly modal: Signal<boolean> = () => true;
}

export class AppConfirm implements NfsOpenable {
  readonly reveal = new NfsReveal();
  readonly triggerRole: Signal<NfsTriggerRole> = () => 'dialog';
  // `modal` not forwarded: no compile error
}

export function rendersExpanded(o: NfsOpenable): boolean {
  return o.triggerRole() === 'dialog' && !(o.modal?.() ?? false);
}
