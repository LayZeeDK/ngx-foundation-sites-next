/**
 * ESLint rule to enforce ViewEncapsulation.None for ngx-foundation-sites components.
 *
 * This rule ensures all Angular components in the library use ViewEncapsulation.None
 * to reduce bundle size and simplify CSS selectors.
 *
 * Based on angular-eslint selector patterns:
 * https://github.com/angular-eslint/angular-eslint/blob/main/packages/utils/src/eslint-plugin/selectors.ts
 */

import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-require-view-encapsulation-none"
export const RULE_NAME = 'require-view-encapsulation-none';

// AST selector pattern for @Component decorator on a class declaration
// Inspired by @angular-eslint/utils COMPONENT_CLASS_DECORATOR
const COMPONENT_CLASS_DECORATOR =
  'ClassDeclaration > Decorator[expression.callee.name="Component"]';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require ViewEncapsulation.None for component library components',
    },
    schema: [],
    messages: {
      missingEncapsulation:
        'Component must set encapsulation: ViewEncapsulation.None for the ngx-foundation-sites library.',
      wrongEncapsulation:
        'Component must use ViewEncapsulation.None, not ViewEncapsulation.{{ actual }}.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      [COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        // Get the decorator's arguments (the object passed to @Component)
        const expression = node.expression;
        if (expression.type !== 'CallExpression') return;

        const decoratorArg = expression.arguments[0];
        if (!decoratorArg || decoratorArg.type !== 'ObjectExpression') return;

        // Find encapsulation property in the decorator object
        const encapsulationProp = decoratorArg.properties.find(
          (prop): prop is TSESTree.Property =>
            prop.type === 'Property' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'encapsulation',
        );

        if (!encapsulationProp) {
          // No encapsulation property - report missing
          context.report({
            node,
            messageId: 'missingEncapsulation',
          });
          return;
        }

        // Check if it's ViewEncapsulation.None
        const value = encapsulationProp.value;
        if (
          value.type === 'MemberExpression' &&
          value.object.type === 'Identifier' &&
          value.object.name === 'ViewEncapsulation' &&
          value.property.type === 'Identifier'
        ) {
          if (value.property.name !== 'None') {
            context.report({
              node: encapsulationProp,
              messageId: 'wrongEncapsulation',
              data: { actual: value.property.name },
            });
          }
          // ViewEncapsulation.None is correct - no report
        } else {
          // Some other value (not ViewEncapsulation.X pattern)
          context.report({
            node: encapsulationProp,
            messageId: 'missingEncapsulation',
          });
        }
      },
    };
  },
});
