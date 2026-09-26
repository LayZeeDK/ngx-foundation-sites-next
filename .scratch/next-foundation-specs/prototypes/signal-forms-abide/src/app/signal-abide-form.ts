// PROTOTYPE fixture: Foundation's Abide docs markup on a Signal Forms model.
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import {
  applyWhen,
  debounce,
  email,
  form,
  FormField,
  FormRoot,
  pattern,
  required,
} from '@angular/forms/signals';
import { NfsAbide, NfsAbideInput, nfsEqualTo } from './abide/abide';

@Component({
  selector: 'app-signal-abide-form',
  imports: [FormField, FormRoot, NfsAbide, NfsAbideInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      [formRoot]="f"
      nfsAbide
      [liveValidate]="live()"
      [validateOnBlur]="blur()"
      [flushOnSubmit]="fixes()"
      [restorePreHydrationValue]="fixes()"
      [attr.aria-labelledby]="key() + '-h'"
    >
      <h2 [id]="key() + '-h'" class="h4">{{ heading() }}</h2>
      <div data-abide-error class="alert callout" role="alert" hidden>
        <p>There are some errors in your form.</p>
      </div>

      <!-- Wrapping label (Abide docs markup): label found by closest('label'). -->
      <label>
        Email
        <input type="email" nfsAbideInput [formField]="f.email" [aria-describedby]="key() + '-email-hint'" />
        <span class="form-error">Enter a valid email address.</span>
      </label>
      <p class="help-text" [id]="key() + '-email-hint'">We never share it.</p>

      <!-- label[for]: label found by for/id. Abide finds errors among siblings, so each field needs its own parent. -->
      <div>
        <label [for]="key() + '-password'">Password</label>
        <input [id]="key() + '-password'" type="password" nfsAbideInput [formField]="f.password" />
        <span class="form-error">A password is required.</span>
      </div>

      <!-- equalTo with per-kind errors (data-form-error-on). -->
      <div>
        <label [for]="key() + '-confirm'">Repeat password</label>
        <input [id]="key() + '-confirm'" type="password" nfsAbideInput [formField]="f.confirm" />
        <span class="form-error" data-form-error-on="required">Repeat the password.</span>
        <span class="form-error" data-form-error-on="equalTo">Passwords do not match.</span>
      </div>

      <!-- Optional pattern field whose error sits elsewhere (data-form-error-for). -->
      <div>
        <label [for]="key() + '-zip'">Postal code (4 digits, optional)</label>
        <input [id]="key() + '-zip'" type="text" inputmode="numeric" placeholder="1234" nfsAbideInput [formField]="f.zip" />
      </div>

      <!-- Checkbox: Abide validates it on click (change). -->
      <label>
        <input type="checkbox" nfsAbideInput [formField]="f.agree" />
        I agree
        <span class="form-error">You must agree.</span>
      </label>

      <p class="form-error" [attr.data-form-error-for]="key() + '-zip'">Use four digits.</p>

      <button type="submit" class="button">Submit</button>
      <output [id]="key() + '-result'">{{ result() }}</output>
    </form>
  `,
})
export class SignalAbideForm {
  readonly key = input.required<string>();
  readonly heading = input.required<string>();
  readonly live = input(false);
  readonly blur = input(false);
  /** PROTOTYPE: false turns the two prototype fixes off (Enter flush, pre-hydration rescue). */
  readonly fixes = input(true);

  protected readonly result = signal('');
  protected readonly model = signal({ email: '', password: '', confirm: '', zip: '', agree: false });
  protected readonly f = form(
    this.model,
    (p) => {
      required(p.email);
      email(p.email);
      required(p.password);
      required(p.confirm);
      nfsEqualTo(p.confirm, p.password);
      pattern(p.zip, /^\d{4}$/);
      required(p.agree);
      // Abide's `change` timing for text fields: commit the value on blur unless liveValidate.
      applyWhen(
        p,
        () => !this.live(),
        (q) => {
          debounce(q.email, 'blur');
          debounce(q.password, 'blur');
          debounce(q.confirm, 'blur');
          debounce(q.zip, 'blur');
        },
      );
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
