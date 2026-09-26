// PROTOTYPE: compile-only check of the angular-developer skill's Signal Forms claims
// against @angular/forms/signals 22.2.0 (the build fails if a claim marked "clone says
// it compiles" does not). Never imported at runtime except for tree-shaken types.
import { signal } from '@angular/core';
import { form, pattern, submit, validate, validateAsync } from '@angular/forms/signals';

export function skillCheck(): void {
  const m = signal({ name: '' as string, nick: null as string | null });
  const f = form(m, (p) => {
    // Skill: "when is only available for required". Clone: BaseValidatorConfig.when on pattern too.
    pattern(p.name, /x/, { when: ({ value }) => value() !== '' });
    // Skill: "Do NOT return null from validators". Clone: ValidationSuccess = null | undefined | void.
    validate(p.name, () => null);
    // Skill documents validateAsync; it is exported as @publicApi 22.0.
    void validateAsync;
  });
  // Skill: submit(form, async () => ...). Clone: overload accepting the action function exists.
  void submit(f, async () => undefined);
}
