// PROTOTYPE -- throwaway. Answers: can a directive that self-injects the Signal Forms
// FORM_FIELD drive Foundation's Abide error contract under Abide's validate-on policy?
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  InjectionToken,
  input,
  Renderer2,
  signal,
  type Signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FORM_FIELD, validate, type SchemaPath } from '@angular/forms/signals';

/** Abide's `data-validate-on`: `'fieldChange'` (default) or anything else = manual. */
export type NfsAbideValidateOn = 'fieldChange' | null;

export interface NfsAbidePolicy {
  validateOn: NfsAbideValidateOn;
  liveValidate: boolean;
  validateOnBlur: boolean;
}

export interface NfsAbideFieldStatus {
  invalid: boolean;
  touched: boolean;
  dirty: boolean;
  /** A native `change` event has fired on the control (Abide's fieldChange trigger). */
  changed: boolean;
  /** Error kinds (Signal Forms `ValidationError.kind`, Reactive Forms error keys). */
  kinds: readonly string[];
}

/**
 * The one error-state policy (Material `ErrorStateMatcher` shape), pure so it can be
 * unit-tested and swapped. Abide validates on `change` (fieldChange), on `input`
 * (liveValidate) and on `blur` (validateOnBlur), and shows every error after submit.
 *
 * - fieldChange: a native `change` has fired (text: at commit; checkbox/radio/select: at
 *   click). Field state has no "committed change" signal: `dirty` flips on the first
 *   keystroke and `touched` on any blur, so `dirty && touched` shows errors while typing
 *   after an unchanged blur. The *value* the errors are computed from lags to commit because
 *   the schema applies `debounce(path, 'blur')` to textual paths when liveValidate is off.
 * - liveValidate: `dirty` (first keystroke), errors live because nothing is debounced.
 * - validateOnBlur: `touched` (also a blur with no change).
 */
export function nfsAbideErrorState(
  s: NfsAbideFieldStatus,
  p: NfsAbidePolicy,
  submitted: boolean,
): boolean {
  if (!s.invalid) {
    return false;
  }

  return (
    submitted ||
    (p.liveValidate && s.dirty) ||
    (p.validateOnBlur && s.touched) ||
    (p.validateOn === 'fieldChange' && s.changed)
  );
}

/** Abide's built-in `equalTo` validator as a cross-field Signal Forms schema rule. */
export function nfsEqualTo<T>(path: SchemaPath<T>, other: SchemaPath<T>, message?: string): void {
  validate(path, ({ value, valueOf }) =>
    value() === valueOf(other) ? null : { kind: 'equalTo', message },
  );
}

export const nfsAbideToken = new InjectionToken<NfsAbide>('nfsAbideToken');

// ponytail: module counter, client-only (ids are written in afterNextRender and only
// referenced from a host binding); the library would use CDK _IdGenerator.
let nextErrorId = 0;

@Directive({
  selector: 'form[nfsAbide]',
  exportAs: 'nfsAbide',
  providers: [{ provide: nfsAbideToken, useExisting: NfsAbide }],
  // Replay-safe: no preventDefault(); FormRoot / FormGroupDirective own submission.
  host: { '(submit)': 'submitted.set(true)' },
})
export class NfsAbide {
  /** Foundation `data-validate-on`. */
  readonly validateOn = input<NfsAbideValidateOn>('fieldChange');
  /** Foundation `data-live-validate`. */
  readonly liveValidate = input(false, { transform: booleanAttribute });
  /** Foundation `data-validate-on-blur`. */
  readonly validateOnBlur = input(false, { transform: booleanAttribute });

  /** PROTOTYPE knob only, to reproduce the stale-value Enter submit without the flush. */
  readonly flushOnSubmit = input(true, { transform: booleanAttribute });
  /** PROTOTYPE knob only, to reproduce the loss of pre-hydration input without the rescue. */
  readonly restorePreHydrationValue = input(true, { transform: booleanAttribute });

  readonly submitted = signal(false);
  readonly policy: Signal<NfsAbidePolicy> = computed(() => ({
    validateOn: this.validateOn(),
    liveValidate: this.liveValidate(),
    validateOnBlur: this.validateOnBlur(),
  }));

  readonly #inputs = signal<readonly NfsAbideInput[]>([]);
  readonly invalid = computed(() => this.#inputs().some((i) => i.status().invalid));
  /** `[data-abide-error]` shows while the form is invalid after a submit. */
  readonly showAlert = computed(() => this.submitted() && this.invalid());

  constructor() {
    const host = inject<ElementRef<HTMLFormElement>>(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    const alerts = signal<readonly Element[]>([]);
    afterNextRender(() => alerts.set([...host.querySelectorAll('[data-abide-error]')]));
    afterRenderEffect({
      write: () => {
        for (const el of alerts()) {
          if (this.showAlert()) {
            renderer.removeAttribute(el, 'hidden');
          } else {
            renderer.setAttribute(el, 'hidden', '');
          }
        }
      },
    });
  }

  register(i: NfsAbideInput): () => void {
    this.#inputs.update((list) => [...list, i]);

    return () => this.#inputs.update((list) => list.filter((x) => x !== i));
  }
}

@Directive({
  selector: 'input[nfsAbideInput], textarea[nfsAbideInput], select[nfsAbideInput]',
  host: {
    '[class.is-invalid-input]': 'errorState()',
    '[attr.aria-invalid]': 'errorState() ? "true" : null',
    '[attr.aria-describedby]': 'describedBy()',
    // Replayable native events; neither handler calls preventDefault().
    '(change)': 'changed.set(true)',
    '(keydown.enter)': 'flushBeforeImplicitSubmit()',
  },
})
export class NfsAbideInput {
  // Signal Forms first (same-element self-injection, Material's MatInput shape) ...
  readonly #field = inject(FORM_FIELD, { self: true, optional: true });
  // ... NgControl as a courtesy for Reactive / template-driven forms. (On a [formField]
  // element NgControl is FormField's InteropNgControl, so FORM_FIELD must be checked first.)
  readonly #ngControl = this.#field ? null : inject(NgControl, { self: true, optional: true });
  readonly #abide = inject(nfsAbideToken, { optional: true });
  /** Consumer ids (hints); Material MatInput `userAriaDescribedBy` shape. */
  readonly userDescribedBy = input<string | null>(null, { alias: 'aria-describedby' });
  readonly #el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly changed = signal(false);

  /** Bumped by Reactive Forms `control.events`; Reactive state has no public signals. */
  readonly #rfVersion = signal(0);

  /**
   * submit() touches the whole tree but flushes only the root's debounced sync, so a value
   * still buffered by debounce(path, 'blur') in the focused field would be validated stale
   * on an Enter-key submit. keydown runs before the implicit submission; touching the field
   * (public FieldState.markAsTouched) flushes it. Doing this in the form's (submit) listener
   * works only when NfsAbide's listener runs before FormRoot's, which follows import order.
   */
  protected flushBeforeImplicitSubmit(): void {
    if (this.#abide?.flushOnSubmit() ?? true) {
      this.#field?.state().markAsTouched();
    }
  }

  readonly status = computed<NfsAbideFieldStatus>(() => {
    if (this.#field) {
      const s = this.#field.state();

      return {
        invalid: s.invalid(),
        touched: s.touched(),
        dirty: s.dirty(),
        changed: this.changed(),
        kinds: s.errors().map((e) => e.kind),
      };
    }

    this.#rfVersion();
    const c = this.#ngControl?.control;

    return {
      invalid: !!c?.invalid,
      touched: !!c?.touched,
      dirty: !!c?.dirty,
      changed: this.changed(),
      kinds: Object.keys(c?.errors ?? {}),
    };
  });

  readonly errorState = computed(() =>
    nfsAbideErrorState(
      this.status(),
      this.#abide?.policy() ?? { validateOn: 'fieldChange', liveValidate: false, validateOnBlur: false },
      this.#abide?.submitted() ?? false,
    ),
  );

  readonly #label = signal<Element | null>(null);
  readonly #errors = signal<readonly Element[]>([]);
  /** Errors to show: all `.form-error`s, filtered by Abide's `data-form-error-on="<kind>"`. */
  readonly #visibleErrors = computed(() => {
    if (!this.errorState()) {
      return [];
    }

    const kinds = this.status().kinds;

    return this.#errors().filter((e) => {
      const on = e.getAttribute('data-form-error-on');

      return !on || kinds.includes(on);
    });
  });

  /** Consumer ids (hints) plus the ids of the errors currently shown. */
  readonly describedBy = computed(
    () =>
      [this.userDescribedBy(), ...this.#visibleErrors().map((e) => e.id)]
        .filter(Boolean)
        .join(' ') || null,
  );

  constructor() {
    const renderer = inject(Renderer2);
    const destroyRef = inject(DestroyRef);
    const unregister = this.#abide?.register(this);
    destroyRef.onDestroy(() => unregister?.());

    // Hydration reuses the server node, so at construction it still holds what the user
    // typed or checked before hydration; FormField's first update pass then overwrites it
    // with the model value, and the replayed input/change read the overwritten control.
    // Server and fresh client nodes hold '' / false here, so this is a no-op there.
    const native = this.#el as HTMLInputElement;
    const isCheck = native.type === 'checkbox';
    const preHydration: unknown = isCheck ? native.checked : native.value;
    afterNextRender(() => {
      const s = this.#field?.state();
      const restore = this.#abide?.restorePreHydrationValue() ?? true;
      if (s && restore && preHydration !== '' && preHydration !== false && native.type !== 'radio') {
        s.controlValue.set(preHydration); // public FieldState API; marks dirty like typing
      }
    });

    // Browser only: find Abide's label and errors the way Abide does
    // (label[for=id] in the form, else closest label; .form-error inside the parent,
    // plus [data-form-error-for=id] anywhere in the form).
    afterNextRender(() => {
      const el = this.#el;
      const form = el.closest('form');
      const byFor = el.id ? form?.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
      this.#label.set(byFor ?? el.closest('label'));
      // Abide's findFormError: siblings first, else anything inside the parent.
      const parent = el.parentElement;
      const siblings = [...(parent?.children ?? [])].filter(
        (c) => c !== el && c.matches('.form-error'),
      );
      const errors = new Set<Element>(
        siblings.length ? siblings : (parent?.querySelectorAll('.form-error') ?? []),
      );
      if (el.id) {
        form
          ?.querySelectorAll(`[data-form-error-for="${CSS.escape(el.id)}"]`)
          .forEach((e) => errors.add(e));
      }
      for (const e of errors) {
        if (!e.id) {
          renderer.setAttribute(e, 'id', `nfs-abide-error-${nextErrorId++}`);
        }
      }
      this.#errors.set([...errors]);

      const control = this.#ngControl?.control;
      if (control) {
        const sub = control.events.subscribe(() => this.#rfVersion.update((v) => v + 1));
        destroyRef.onDestroy(() => sub.unsubscribe());
        this.#rfVersion.update((v) => v + 1);
      }
    });

    afterRenderEffect({
      write: () => {
        const label = this.#label();
        if (label) {
          toggle(renderer, label, 'is-invalid-label', this.errorState());
        }
        const visible = this.#visibleErrors();
        for (const e of this.#errors()) {
          toggle(renderer, e, 'is-visible', visible.includes(e));
        }
      },
    });
  }
}

function toggle(renderer: Renderer2, el: Element, cls: string, on: boolean): void {
  if (on) {
    renderer.addClass(el, cls);
  } else {
    renderer.removeClass(el, cls);
  }
}
