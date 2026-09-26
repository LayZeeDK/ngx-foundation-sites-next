// PROTOTYPE fixture: the same explicit directives under Reactive Forms (NgControl courtesy),
// covering the same control kinds as the Signal Forms twin.
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NfsAbide,
  NfsAbideAlert,
  NfsAbideInput,
  NfsAbideLabel,
  NfsFormError,
} from './abide/abide';

/**
 * Reactive Forms' `data-min-required` counterpart: the error must be visible on each sibling
 * control (NfsAbideInput reads NgControl.control, a leaf, not the group), so the validator
 * reads the parent group and every sibling is re-validated whenever one of them changes.
 */
function minCountValidator(min: number) {
  return (control: AbstractControl) => {
    const parent = control.parent;
    if (!parent) {
      return null;
    }

    const count = Object.values(parent.value as Record<string, boolean>).filter(Boolean).length;

    return count >= min ? null : { minRequired: true };
  };
}

@Component({
  selector: 'app-reactive-abide-form',
  imports: [ReactiveFormsModule, NfsAbide, NfsAbideAlert, NfsAbideInput, NfsAbideLabel, NfsFormError],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="rf" (ngSubmit)="save()" nfsAbide #abide="nfsAbide" aria-labelledby="rf-h">
      <h2 id="rf-h" class="h4">Reactive Forms (NgControl courtesy)</h2>
      <div nfsAbideAlert class="alert callout">
        <p>There are some errors in your form.</p>
      </div>

      <label nfsAbideLabel>
        Name
        <input type="text" nfsAbideInput formControlName="name" required />
        <span nfsFormError>A name is required.</span>
      </label>

      <div>
        <label for="rf-email" [nfsAbideLabel]="rfEmail">Email</label>
        <input id="rf-email" type="email" nfsAbideInput #rfEmail="nfsAbideInput" formControlName="email" />
        <span [nfsFormError]="rfEmail">Enter a valid email address.</span>
      </div>

      <fieldset formGroupName="topics">
        <legend>Topics (pick at least 2)</legend>
        <label nfsAbideLabel>
          <input type="checkbox" nfsAbideInput #rfTopics="nfsAbideInput" formControlName="news" />
          News
        </label>
        <label nfsAbideLabel>
          <input type="checkbox" nfsAbideInput formControlName="offers" />
          Offers
        </label>
        <label nfsAbideLabel>
          <input type="checkbox" nfsAbideInput formControlName="events" />
          Events
        </label>
        <span [nfsFormError]="rfTopics">Pick at least 2 topics.</span>
      </fieldset>

      <fieldset>
        <legend>Plan</legend>
        <label nfsAbideLabel>
          <input type="radio" value="basic" nfsAbideInput #rfPlan="nfsAbideInput" formControlName="plan" />
          Basic
        </label>
        <label nfsAbideLabel>
          <input type="radio" value="pro" nfsAbideInput formControlName="plan" />
          Pro
        </label>
        <span [nfsFormError]="rfPlan">Choose a plan.</span>
      </fieldset>

      <div>
        <label for="rf-country" [nfsAbideLabel]="rfCountry">Country</label>
        <select id="rf-country" nfsAbideInput #rfCountry="nfsAbideInput" formControlName="country">
          <option value="">Choose one</option>
          <option value="dk">Denmark</option>
          <option value="us">United States</option>
        </select>
        <span [nfsFormError]="rfCountry">Choose your country.</span>
      </div>

      <div>
        <label for="rf-bio" [nfsAbideLabel]="rfBio">Bio</label>
        <textarea id="rf-bio" nfsAbideInput #rfBio="nfsAbideInput" formControlName="bio"></textarea>
        <span [nfsFormError]="rfBio">Tell us something about you.</span>
      </div>

      <button type="submit" class="button" [disabled]="!abide.ready()">Submit</button>
      <output id="rf-result">{{ result }}</output>
    </form>
  `,
})
export class ReactiveAbideForm {
  protected result = '';
  // updateOn 'blur' is the Reactive Forms counterpart of debounce(path, 'blur').
  protected readonly rf = new FormGroup(
    {
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      topics: new FormGroup({
        news: new FormControl(false, minCountValidator(2)),
        offers: new FormControl(false, minCountValidator(2)),
        events: new FormControl(false, minCountValidator(2)),
      }),
      plan: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      bio: new FormControl('', Validators.required),
    },
    { updateOn: 'blur' },
  );

  constructor() {
    const topics = this.rf.controls.topics;
    const destroyRef = inject(DestroyRef);
    const sub = topics.valueChanges.subscribe(() => {
      for (const c of Object.values(topics.controls)) {
        c.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    });
    destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected save(): void {
    this.result = 'submitted: ' + JSON.stringify(this.rf.value);
  }
}
