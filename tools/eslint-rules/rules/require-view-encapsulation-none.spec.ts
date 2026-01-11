import { RuleTester } from '@typescript-eslint/rule-tester';
import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { rule, RULE_NAME } from './require-view-encapsulation-none';

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
    // ✅ ViewEncapsulation.None is correct
    {
      code: `
        import { Component, ViewEncapsulation } from '@angular/core';

        @Component({
          selector: 'nfs-accordion',
          encapsulation: ViewEncapsulation.None,
        })
        class NfsAccordion {}
      `,
    },
    // ✅ Not a class - should be ignored
    {
      code: `const example = true;`,
    },
    // ✅ Not a Component decorator - should be ignored
    {
      code: `
        @Directive({
          selector: '[nfsHighlight]',
        })
        class NfsHighlight {}
      `,
    },
    // ✅ Component decorator without object argument - should be ignored
    {
      code: `
        @Component(someVariable)
        class DynamicComponent {}
      `,
    },
  ],
  invalid: [
    // ❌ Missing encapsulation property
    {
      code: `
        import { Component } from '@angular/core';

        @Component({
          selector: 'nfs-accordion',
        })
        class NfsAccordion {}
      `,
      errors: [{ messageId: 'missingEncapsulation' }],
    },
    // ❌ Using ViewEncapsulation.Emulated (default)
    {
      code: `
        import { Component, ViewEncapsulation } from '@angular/core';

        @Component({
          selector: 'nfs-accordion',
          encapsulation: ViewEncapsulation.Emulated,
        })
        class NfsAccordion {}
      `,
      errors: [
        { messageId: 'wrongEncapsulation', data: { actual: 'Emulated' } },
      ],
    },
    // ❌ Using ViewEncapsulation.ShadowDom
    {
      code: `
        import { Component, ViewEncapsulation } from '@angular/core';

        @Component({
          selector: 'nfs-accordion',
          encapsulation: ViewEncapsulation.ShadowDom,
        })
        class NfsAccordion {}
      `,
      errors: [
        { messageId: 'wrongEncapsulation', data: { actual: 'ShadowDom' } },
      ],
    },
    // ❌ Using a variable instead of ViewEncapsulation enum
    {
      code: `
        import { Component } from '@angular/core';
        const myEncapsulation = 2;

        @Component({
          selector: 'nfs-accordion',
          encapsulation: myEncapsulation,
        })
        class NfsAccordion {}
      `,
      errors: [{ messageId: 'missingEncapsulation' }],
    },
  ],
});
