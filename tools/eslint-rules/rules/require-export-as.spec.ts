import { RuleTester } from '@typescript-eslint/rule-tester';
import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { rule, RULE_NAME } from './require-export-as';

// Configure RuleTester to use vitest lifecycle hooks
RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
} as RuleTesterConfig);

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // ✅ Component with exportAs is correct
    {
      code: `
        import { Component } from '@angular/core';

        @Component({
          selector: 'nfs-accordion',
          exportAs: 'nfsAccordion',
        })
        class NfsAccordion {}
      `,
    },
    // ✅ Directive with exportAs is correct
    {
      code: `
        import { Directive } from '@angular/core';

        @Directive({
          selector: '[nfsTooltip]',
          exportAs: 'nfsTooltip',
        })
        class NfsTooltip {}
      `,
    },
    // ✅ Not a class - should be ignored
    {
      code: `const example = true;`,
    },
    // ✅ Not a Component or Directive decorator - should be ignored
    {
      code: `
        @Injectable({
          providedIn: 'root',
        })
        class MyService {}
      `,
    },
    // ✅ Component decorator without object argument - should be ignored
    {
      code: `
        @Component(someVariable)
        class DynamicComponent {}
      `,
    },
    // ✅ Directive decorator without object argument - should be ignored
    {
      code: `
        @Directive(someVariable)
        class DynamicDirective {}
      `,
    },
  ],
  invalid: [
    // ❌ Component missing exportAs property
    {
      code: `
        import { Component } from '@angular/core';

        @Component({
          selector: 'nfs-accordion',
        })
        class NfsAccordion {}
      `,
      errors: [{ messageId: 'missingExportAs' }],
    },
    // ❌ Directive missing exportAs property
    {
      code: `
        import { Directive } from '@angular/core';

        @Directive({
          selector: '[nfsTooltip]',
        })
        class NfsTooltip {}
      `,
      errors: [{ messageId: 'missingExportAs' }],
    },
    // ❌ Component with other properties but no exportAs
    {
      code: `
        import { Component, ViewEncapsulation } from '@angular/core';

        @Component({
          selector: 'nfs-modal',
          encapsulation: ViewEncapsulation.None,
          template: '<ng-content></ng-content>',
        })
        class NfsModal {}
      `,
      errors: [{ messageId: 'missingExportAs' }],
    },
    // ❌ Directive with other properties but no exportAs
    {
      code: `
        import { Directive } from '@angular/core';

        @Directive({
          selector: '[nfsHighlight]',
          standalone: true,
        })
        class NfsHighlight {}
      `,
      errors: [{ messageId: 'missingExportAs' }],
    },
  ],
});
