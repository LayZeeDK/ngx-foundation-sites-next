// PROTOTYPE -- throwaway. Answers: do explicit label/error/alert directives (ADR 0026) and
// a ready gate (ADR 0027) work for radio groups, checkbox groups, select, textarea, and a
// custom FormValueControl; does event-based pre-hydration value adoption work for every
// native input type and Reactive Forms; does the ready-gated submit block a pre-hydration
// click and Enter.
import {
  afterNextRender,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  HostAttributeToken,
  inject,
  InjectionToken,
  input,
  signal,
  type Signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FORM_FIELD, validate, type SchemaPath } from '@angular/forms/signals';

/** Abide's `data-validate-on`: `'fieldChange'` (default) or anything else = manual. */
export type NfsAbideValidateOn = 'fieldChange' | null;
export type NfsAbideA11yErrorLevel = 'assertive' | 'polite' | 'off';

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

/** The one error-state policy (Material `ErrorStateMatcher` shape); see the prototype 49 README. */
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
export const nfsAbideLabelToken = new InjectionToken<NfsAbideLabel>('nfsAbideLabelToken');

// ponytail: module counter, client-only (ids referenced only from a host binding written
// after the first client render); the library would use CDK _IdGenerator.
let nextErrorId = 0;

@Directive({
  selector: 'form[nfsAbide]',
  exportAs: 'nfsAbide',
  providers: [{ provide: nfsAbideToken, useExisting: NfsAbide }],
  // Replay-safe: no preventDefault(); FormRoot / FormGroupDirective own submission.
  host: { '(submit)': 'submitted.set(true)' },
})
export class NfsAbide {
  readonly validateOn = input<NfsAbideValidateOn>('fieldChange');
  readonly liveValidate = input(false, { transform: booleanAttribute });
  readonly validateOnBlur = input(false, { transform: booleanAttribute });
  readonly a11yErrorLevel = input<NfsAbideA11yErrorLevel>('assertive');

  /** PROTOTYPE knob: which adoption strategy case 2 exercises for this form's fields. */
  readonly adoptionMode = input<'event' | 'controlValue'>('event');

  readonly submitted = signal(false);
  readonly policy: Signal<NfsAbidePolicy> = computed(() => ({
    validateOn: this.validateOn(),
    liveValidate: this.liveValidate(),
    validateOnBlur: this.validateOnBlur(),
  }));

  readonly #ready = signal(false);
  /** false on the server and until the first client render callback, then true. */
  readonly ready: Signal<boolean> = this.#ready;

  readonly #inputs = signal<readonly NfsAbideInput[]>([]);
  readonly invalid = computed(() => this.#inputs().some((i) => i.status().invalid));
  /** `nfsAbideAlert` shows while the form is invalid after a submit. */
  readonly showAlert = computed(() => this.submitted() && this.invalid());

  constructor() {
    afterNextRender(() => this.#ready.set(true));
  }

  register(i: NfsAbideInput): () => void {
    this.#inputs.update((list) => [...list, i]);

    return () => this.#inputs.update((list) => list.filter((x) => x !== i));
  }
}

@Directive({
  // The plain attribute selector lets a custom FormValueControl component apply this
  // directive as a hostDirective on its own host element, alongside [formField], which
  // provides FORM_FIELD on that same element (Signal Forms' FormUiControl contract is not
  // limited to input/textarea/select). Native-only behaviour below is guarded by tagName.
  selector:
    'input[nfsAbideInput], textarea[nfsAbideInput], select[nfsAbideInput], [nfsAbideInput]',
  exportAs: 'nfsAbideInput',
  host: {
    '[class.is-invalid-input]': 'errorState()',
    '[attr.aria-invalid]': 'ariaInvalid()',
    '[attr.aria-describedby]': 'describedBy()',
    // Replayable native events; neither handler calls preventDefault().
    '(change)': 'changed.set(true)',
    '(keydown.enter)': 'flushBeforeImplicitSubmit()',
  },
})
export class NfsAbideInput {
  // Signal Forms first (same-element self-injection, Material's MatInput shape) ...
  readonly #field = inject(FORM_FIELD, { self: true, optional: true });
  // ... NgControl as a courtesy for Reactive Forms. (On a [formField] element NgControl is
  // FormField's InteropNgControl, so FORM_FIELD must be checked first.)
  readonly #ngControl = this.#field ? null : inject(NgControl, { self: true, optional: true });
  readonly #abide = inject(nfsAbideToken, { optional: true });
  readonly #enclosingLabel = inject(nfsAbideLabelToken, { optional: true, skipSelf: true });
  /** Consumer ids (hints); Material MatInput `userAriaDescribedBy` shape. */
  readonly userDescribedBy = input<string | null>(null, { alias: 'aria-describedby' });
  readonly #el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly changed = signal(false);

  /** Bumped by Reactive Forms `control.events`; Reactive state has no public signals. */
  readonly #rfVersion = signal(0);

  /**
   * submit() touches the whole tree but flushes only the root's debounced sync, so a value
   * still buffered by debounce(path, 'blur') in the focused field would be validated stale on
   * an Enter-key submit. keydown runs before the implicit submission; touching the field
   * (public FieldState.markAsTouched) flushes it. Per the spec, only on `input` hosts, only
   * under Signal Forms (a Reactive FormGroupDirective already syncs pending values on submit).
   */
  protected flushBeforeImplicitSubmit(): void {
    if (this.#field && this.#el.tagName === 'INPUT') {
      this.#field.state().markAsTouched();
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
      this.#abide?.policy() ?? {
        validateOn: 'fieldChange',
        liveValidate: false,
        validateOnBlur: false,
      },
      this.#abide?.submitted() ?? false,
    ),
  );

  /** WAI-ARIA: aria-invalid is not supported on input[type=radio] (radiogroup takes it). */
  readonly #isRadio = (this.#el as HTMLInputElement).type === 'radio';
  readonly ariaInvalid = computed(() => (this.errorState() && !this.#isRadio ? 'true' : null));

  readonly #errors = signal<readonly NfsFormErrorLike[]>([]);
  readonly describedBy = computed(() => {
    const visible = this.#errors()
      .filter((e) => e.visible())
      .map((e) => e.id());

    return [this.userDescribedBy(), ...visible].filter(Boolean).join(' ') || null;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    const unregisterForm = this.#abide?.register(this);
    const unregisterLabel = this.#enclosingLabel?.registerInput(this);
    destroyRef.onDestroy(() => {
      unregisterForm?.();
      unregisterLabel?.();
    });

    // --- Pre-hydration value adoption (event-based, per spec: dispatch input/change so the
    // bound control parses the saved value through its own accessor) ---
    // Hydration reuses the server node, so at construction it still holds what the user typed
    // or checked before hydration; the forms library's first write then overwrites it with the
    // model value. Server and fresh client nodes hold '' / false here, so this is a no-op there.
    // input[type=file] and select[multiple] are skipped (spec); a custom control's host has no
    // native .value/.checked, so it is skipped here too (OPEN item, see README).
    const native = this.#el;
    const tag = native.tagName;
    const asInput = native as HTMLInputElement;
    const asSelect = native as HTMLSelectElement;
    const asValued = native as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const isCheckable = tag === 'INPUT' && (asInput.type === 'checkbox' || asInput.type === 'radio');
    const isTextLike = tag === 'INPUT' && !isCheckable && asInput.type !== 'file';
    const isSelectOrArea = tag === 'SELECT' || tag === 'TEXTAREA';
    const skip = (tag === 'SELECT' && asSelect.multiple) || (tag === 'INPUT' && asInput.type === 'file');
    const preHydration: unknown = skip
      ? undefined
      : isCheckable
        ? asInput.checked
        : isTextLike || isSelectOrArea
          ? asValued.value
          : undefined;

    afterNextRender(() => {
      if (preHydration === undefined) {
        return;
      }

      const emptyOrUnchecked = isCheckable ? preHydration === false : preHydration === '';
      if (emptyOrUnchecked) {
        return;
      }

      const currentlyMatches = isCheckable
        ? asInput.checked === preHydration
        : asValued.value === preHydration;
      if (currentlyMatches) {
        return;
      }

      const mode = this.#abide?.adoptionMode() ?? 'event';
      if (mode === 'controlValue' && this.#field) {
        // Fallback per spec: FieldState.controlValue.set() (public API), marks dirty like typing.
        this.#field.state().controlValue.set(preHydration);

        return;
      }

      if (isCheckable) {
        asInput.checked = preHydration as boolean;
        native.dispatchEvent(new Event('input', { bubbles: true }));
        native.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        asValued.value = preHydration as string;
        native.dispatchEvent(new Event('input', { bubbles: true }));
        // Reactive Forms with updateOn 'blur' commits on the next real blur, matching what
        // typing would have produced; Signal Forms' debounce(path, 'blur') is the same.
      }
    });

    // Reactive Forms courtesy: state follows control.events (no public field-state signals).
    afterNextRender(() => {
      const control = this.#ngControl?.control;
      if (control) {
        const sub = control.events.subscribe(() => this.#rfVersion.update((v) => v + 1));
        destroyRef.onDestroy(() => sub.unsubscribe());
        this.#rfVersion.update((v) => v + 1);
      }
    });
  }

  /** Called by `NfsFormError` to link itself to this field; returns the unregister fn. */
  registerError(e: NfsFormErrorLike): () => void {
    this.#errors.update((list) => [...list, e]);

    return () => this.#errors.update((list) => list.filter((x) => x !== e));
  }
}

/** What `NfsAbideInput` needs from a linked `NfsFormError` (kept narrow to avoid an import cycle). */
interface NfsFormErrorLike {
  readonly visible: Signal<boolean>;
  readonly id: Signal<string>;
}

@Directive({
  selector: 'label[nfsAbideLabel]',
  exportAs: 'nfsAbideLabel',
  providers: [{ provide: nfsAbideLabelToken, useExisting: NfsAbideLabel }],
  host: { '[class.is-invalid-label]': 'resolvedField()?.errorState() ?? false' },
})
export class NfsAbideLabel {
  /** Bare attribute (a static string, always `''` in practice) -> undefined: the field
   * registered inside this label. Angular types a static attribute as `string`, not the `''`
   * literal, so the transform must accept any string. */
  readonly field = input<NfsAbideInput | undefined, NfsAbideInput | string | undefined>(undefined, {
    alias: 'nfsAbideLabel',
    transform: (v) => (typeof v === 'string' ? undefined : v),
  });
  readonly #registered = signal<NfsAbideInput | undefined>(undefined);
  readonly resolvedField = computed(() => this.field() ?? this.#registered());

  constructor() {
    afterNextRender(() => {
      if (!this.resolvedField()) {
        // eslint-disable-next-line no-console
        console.warn('[nfsAbideLabel] resolved no field (dev-mode check).');
      }
    });
  }

  /** Called by an `NfsAbideInput` constructed inside this label. */
  registerInput(i: NfsAbideInput): () => void {
    this.#registered.set(i);

    return () => this.#registered.update((cur) => (cur === i ? undefined : cur));
  }
}

@Directive({
  selector: '[nfsFormError]',
  exportAs: 'nfsFormError',
  host: {
    class: 'form-error',
    '[id]': 'id()',
    '[class.is-visible]': 'visible()',
    '[attr.role]': 'role()',
  },
})
export class NfsFormError implements NfsFormErrorLike {
  /** Bare attribute (a static string) -> undefined: the enclosing `nfsAbideLabel`'s field. */
  readonly field = input<NfsAbideInput | undefined, NfsAbideInput | string | undefined>(undefined, {
    alias: 'nfsFormError',
    transform: (v) => (typeof v === 'string' ? undefined : v),
  });
  /** Abide's `data-form-error-on`: the error kind(s) this message is for; null = any. */
  readonly formErrorOn = input<string | readonly string[] | null>(null);
  readonly id = input(`nfs-form-error-${nextErrorId++}`);

  readonly #enclosingLabel = inject(nfsAbideLabelToken, { optional: true });
  readonly #staticRole = inject(new HostAttributeToken('role'), { optional: true });
  readonly role = computed(() => this.#staticRole ?? 'alert');

  readonly resolvedField = computed(() => this.field() ?? this.#enclosingLabel?.resolvedField());
  readonly visible = computed(() => {
    const f = this.resolvedField();
    if (!f?.errorState()) {
      return false;
    }

    const on = this.formErrorOn();
    if (on === null) {
      return true;
    }

    const kinds = f.status().kinds;
    const wanted = Array.isArray(on) ? on : [on];

    return wanted.some((k) => kinds.includes(k));
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    let unregister: (() => void) | undefined;
    effect(() => {
      unregister?.();
      unregister = this.resolvedField()?.registerError(this);
    });
    destroyRef.onDestroy(() => unregister?.());

    afterNextRender(() => {
      if (!this.resolvedField()) {
        // eslint-disable-next-line no-console
        console.warn('[nfsFormError] resolved no field (dev-mode check).');
      }
    });
  }
}

@Directive({
  selector: '[nfsAbideAlert]',
  host: {
    '[hidden]': '!showAlert()',
    '[attr.role]': 'role()',
  },
})
export class NfsAbideAlert {
  readonly #abide = inject(nfsAbideToken);
  readonly #staticRole = inject(new HostAttributeToken('role'), { optional: true });
  readonly showAlert = computed(() => this.#abide.showAlert());
  readonly role = computed(() => {
    if (this.#staticRole) {
      return this.#staticRole;
    }

    const level = this.#abide.a11yErrorLevel();

    return level === 'assertive' ? 'alert' : level === 'polite' ? 'status' : null;
  });
}
