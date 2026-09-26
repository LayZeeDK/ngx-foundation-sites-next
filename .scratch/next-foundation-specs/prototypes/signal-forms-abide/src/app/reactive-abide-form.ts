// PROTOTYPE fixture: the same directives under Reactive Forms (NgControl courtesy path).
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NfsAbide, NfsAbideInput } from './abide/abide';

@Component({
  selector: 'app-reactive-abide-form',
  imports: [ReactiveFormsModule, NfsAbide, NfsAbideInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="rf" nfsAbide aria-labelledby="rf-h">
      <h2 id="rf-h" class="h4">Reactive Forms (NgControl courtesy)</h2>
      <div data-abide-error class="alert callout" role="alert" hidden>
        <p>There are some errors in your form.</p>
      </div>
      <label>
        Name
        <input type="text" nfsAbideInput formControlName="name" required />
        <span class="form-error">A name is required.</span>
      </label>
      <div>
        <label for="rf-email">Email</label>
        <input id="rf-email" type="email" nfsAbideInput formControlName="email" />
        <span class="form-error">Enter a valid email address.</span>
      </div>
      <button type="submit" class="button">Submit</button>
    </form>
  `,
})
export class ReactiveAbideForm {
  // updateOn 'blur' is the Reactive Forms counterpart of debounce(path, 'blur').
  protected readonly rf = new FormGroup(
    {
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
    },
    { updateOn: 'blur' },
  );
}
