/**
 * ESLint rule to enforce ViewEncapsulation.None for ngx-foundation-sites components.
 *
 * This rule ensures all Angular components in the library use ViewEncapsulation.None
 * to reduce bundle size and simplify CSS selectors.
 *
 * Uses @angular-eslint/utils for Angular-specific AST utilities.
 */

import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, Selectors } from '@angular-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nfs/require-view-encapsulation-none"
export const RULE_NAME = 'require-view-encapsulation-none';

type MessageIds = 'missingEncapsulation' | 'wrongEncapsulation';

export const rule = ESLintUtils.RuleCreator(() => __filename)<[], MessageIds>({
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
      [Selectors.COMPONENT_CLASS_DECORATOR](node: TSESTree.Decorator) {
        // Get the decorator argument using angular-eslint utility
        // Returns undefined if there's no object argument (e.g., @Component(someVariable))
        const decoratorArg = ASTUtils.getDecoratorArgument(node);
        if (!decoratorArg) {
          // Can't validate non-object arguments - skip
          return;
        }

        // Use angular-eslint utility to extract the encapsulation property value
        const encapsulationValue = ASTUtils.getDecoratorPropertyValue(
          node,
          'encapsulation',
        );

        if (!encapsulationValue) {
          // No encapsulation property - report missing
          context.report({
            node,
            messageId: 'missingEncapsulation',
          });
          return;
        }

        // Check if it's ViewEncapsulation.None
        if (
          encapsulationValue.type === 'MemberExpression' &&
          encapsulationValue.object.type === 'Identifier' &&
          encapsulationValue.object.name === 'ViewEncapsulation' &&
          encapsulationValue.property.type === 'Identifier'
        ) {
          if (encapsulationValue.property.name !== 'None') {
            // Find the encapsulation property node for better error location
            const encapsulationProp = ASTUtils.getDecoratorProperty(
              node,
              'encapsulation',
            );
            context.report({
              node: encapsulationProp ?? node,
              messageId: 'wrongEncapsulation',
              data: { actual: encapsulationValue.property.name },
            });
          }
          // ViewEncapsulation.None is correct - no report
        } else {
          // Some other value (not ViewEncapsulation.X pattern)
          context.report({
            node,
            messageId: 'missingEncapsulation',
          });
        }
      },
    };
  },
});
