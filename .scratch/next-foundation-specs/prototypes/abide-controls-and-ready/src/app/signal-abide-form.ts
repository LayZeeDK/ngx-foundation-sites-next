// PROTOTYPE fixture: explicit label/error/alert directives (ADR 0026) and the ready gate
// (ADR 0027) over radio group, checkbox group (min count), select, textarea, and a custom
// FormValueControl, plus the original text/password/checkbox fields, on Signal Forms.
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import {
  applyWhen,
  debounce,
  email,
  form,
  FormField,
  FormRoot,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import {
  NfsAbide,
  NfsAbideAlert,
  NfsAbideInput,
  NfsAbideLabel,
  NfsFormError,
  nfsEqualTo,
} from './abide/abide';
import { StarRating } from './abide/star-rating';

@Component({
  selector: 'app-signal-abide-form',
  imports: [
    FormField,
    FormRoot,
    NfsAbide,
    NfsAbideAlert,
    NfsAbideInput,
    NfsAbideLabel,
    NfsFormError,
    StarRating,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      [formRoot]="f"
      nfsAbide
      #abide="nfsAbide"
      [liveValidate]="live()"
      [validateOnBlur]="blur()"
      [adoptionMode]="adoption()"
      [attr.aria-labelledby]="key() + '-h'"
    >
      <h2 [id]="key() + '-h'" class="h4">{{ heading() }}</h2>
      <div nfsAbideAlert class="alert callout">
        <p>There are some errors in your form.</p>
      </div>

      <!-- Wrapping label (Abide docs markup): text input, fieldChange timing via debounce. -->
      <label nfsAbideLabel>
        Email
        <input
          type="email"
          nfsAbideInput
          [formField]="f.email"
          [aria-describedby]="key() + '-email-hint'"
        />
        <span nfsFormError formErrorOn="required">Enter your email address.</span>
        <span nfsFormError formErrorOn="email">Enter a complete email address.</span>
      </label>
      <p class="help-text" [id]="key() + '-email-hint'">We never share it.</p>

      <!-- label[for]: typed template references (ADR 0026 link kind 2). -->
      <div>
        <label [for]="key() + '-password'" [nfsAbideLabel]="pw">Password</label>
        <input
          [id]="key() + '-password'"
          type="password"
          nfsAbideInput
          #pw="nfsAbideInput"
          [formField]="f.password"
        />
        <span [nfsFormError]="pw">A password is required.</span>
      </div>

      <div>
        <label [for]="key() + '-confirm'" [nfsAbideLabel]="pw2">Repeat password</label>
        <input
          [id]="key() + '-confirm'"
          type="password"
          nfsAbideInput
          #pw2="nfsAbideInput"
          [formField]="f.confirm"
        />
        <span [nfsFormError]="pw2" formErrorOn="required">Repeat the password.</span>
        <span [nfsFormError]="pw2" formErrorOn="equalTo">The passwords do not match.</span>
      </div>

      <!-- Radio group: one nfsAbideLabel per option, one nfsFormError by typed reference. -->
      <fieldset>
        <legend [id]="key() + '-plan-legend'">Plan</legend>
        <label nfsAbideLabel>
          <input
            type="radio"
            value="basic"
            nfsAbideInput
            #planField="nfsAbideInput"
            [formField]="f.plan"
          />
          Basic
        </label>
        <label nfsAbideLabel>
          <input type="radio" value="pro" nfsAbideInput [formField]="f.plan" />
          Pro
        </label>
        <label nfsAbideLabel>
          <input type="radio" value="enterprise" nfsAbideInput [formField]="f.plan" />
          Enterprise
        </label>
        <span [nfsFormError]="planField" formErrorOn="required">Choose a plan.</span>
      </fieldset>

      <!-- Checkbox group with a minimum count: one validate() rule per box (spec usage note). -->
      <fieldset>
        <legend [id]="key() + '-topics-legend'">Topics (pick at least 2)</legend>
        <label nfsAbideLabel>
          <input
            type="checkbox"
            nfsAbideInput
            #topicsField="nfsAbideInput"
            [formField]="f.topics.news"
          />
          News
        </label>
        <label nfsAbideLabel>
          <input type="checkbox" nfsAbideInput [formField]="f.topics.offers" />
          Offers
        </label>
        <label nfsAbideLabel>
          <input type="checkbox" nfsAbideInput [formField]="f.topics.events" />
          Events
        </label>
        <span [nfsFormError]="topicsField" formErrorOn="minRequired">Pick at least 2 topics.</span>
      </fieldset>

      <!-- select -->
      <div>
        <label [for]="key() + '-country'" [nfsAbideLabel]="country">Country</label>
        <select
          [id]="key() + '-country'"
          nfsAbideInput
          #country="nfsAbideInput"
          [formField]="f.country"
        >
          <option value="">Choose one</option>
          <option value="dk">Denmark</option>
          <option value="us">United States</option>
        </select>
        <span [nfsFormError]="country">Choose your country.</span>
      </div>

      <!-- textarea -->
      <div>
        <label [for]="key() + '-bio'" [nfsAbideLabel]="bio">Bio (min 10 characters)</label>
        <textarea [id]="key() + '-bio'" nfsAbideInput #bio="nfsAbideInput" [formField]="f.bio">
        </textarea>
        <span [nfsFormError]="bio" formErrorOn="required">Tell us something about you.</span>
        <span [nfsFormError]="bio" formErrorOn="minLength">At least 10 characters, please.</span>
      </div>

      <!-- custom FormValueControl (hostDirectives; case 1 coverage only, see README). Linked
           by the wrapping label (DI), not a typed reference: a template reference variable on
           the hostDirective's exportAs crashed the compiler (OPEN item, see README). -->
      <label nfsAbideLabel>
        Rate your interest
        <app-star-rating nfsAbideInput [formField]="f.rating" />
        <span nfsFormError>Pick at least one star.</span>
      </label>

      <label nfsAbideLabel>
        <input type="checkbox" nfsAbideInput [formField]="f.terms" />
        I accept the terms
        <span nfsFormError>Accept the terms to continue.</span>
      </label>

      <button type="submit" class="button" [disabled]="!abide.ready()">Submit</button>
      <output [id]="key() + '-result'">{{ result() }}</output>
    </form>
  `,
})
export class SignalAbideForm {
  readonly key = input.required<string>();
  readonly heading = input.required<string>();
  readonly live = input(false);
  readonly blur = input(false);
  /** PROTOTYPE knob for case 2: 'event' (the spec's design) or the controlValue.set() fallback. */
  readonly adoption = input<'event' | 'controlValue'>('event');

  protected readonly result = signal('');
  protected readonly model = signal({
    email: '',
    password: '',
    confirm: '',
    plan: '',
    topics: { news: false, offers: false, events: false },
    country: '',
    bio: '',
    rating: 0,
    terms: false,
  });
  protected readonly f = form(
    this.model,
    (p) => {
      required(p.email);
      email(p.email);
      required(p.password);
      required(p.confirm);
      nfsEqualTo(p.confirm, p.password);
      required(p.plan);
      required(p.country);
      required(p.bio);
      minLength(p.bio, 10);
      // 0 is not "empty" to required() (matches native <input type=number>), so this is a
      // plain validate() rule targeted by formErrorOn="required", per the spec's data-validator
      // recipe (a custom validator is an ordinary validate() rule whose kind markup targets).
      validate(p.rating, ({ value }) => (value() >= 1 ? null : { kind: 'required' }));
      required(p.terms);
      // Abide's data-min-required="2" as a validate() rule on each box (spec usage example).
      for (const box of [p.topics.news, p.topics.offers, p.topics.events] as const) {
        validate(box, ({ valueOf }) =>
          Object.values(valueOf(p.topics)).filter(Boolean).length >= 2
            ? null
            : { kind: 'minRequired' },
        );
      }
      // Abide's fieldChange timing for text values: commit on blur unless liveValidate.
      applyWhen(
        p,
        () => !this.live(),
        (q) => {
          debounce(q.email, 'blur');
          debounce(q.password, 'blur');
          debounce(q.confirm, 'blur');
          debounce(q.bio, 'blur');
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
