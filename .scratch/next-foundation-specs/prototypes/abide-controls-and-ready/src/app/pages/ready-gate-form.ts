// PROTOTYPE fixture: the minimal ready-gated form for case 3 (ADR 0027). One text field so a
// pre-hydration Enter has something to submit through.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { NfsAbide, NfsAbideInput } from '../abide/abide';

@Component({
  selector: 'app-ready-gate-form',
  imports: [FormField, FormRoot, NfsAbide, NfsAbideInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formRoot]="f" nfsAbide #abide="nfsAbide" aria-label="Ready gate">
      <label>
        Email
        <input type="email" nfsAbideInput [formField]="f.email" />
      </label>
      <button type="submit" class="button" [disabled]="!abide.ready()">Submit</button>
      <output id="ready-gate-result">{{ result() }}</output>
    </form>
  `,
})
export class ReadyGateForm {
  protected readonly result = signal('');
  protected readonly model = signal({ email: '' });
  protected readonly f = form(
    this.model,
    (p) => {
      required(p.email);
      email(p.email);
    },
    {
      submission: {
        action: async () => {
          this.result.set('submitted: ' + JSON.stringify(this.model()));
        },
      },
    },
  );
}
