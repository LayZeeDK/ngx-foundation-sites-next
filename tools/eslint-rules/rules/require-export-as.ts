/**
 * ESLint rule to enforce exportAs property on all components and directives.
 *
 * This rule ensures all Angular components and directives in the library define
 * an `exportAs` property, enabling consumers to access instances via template
 * reference variables (e.g., `<input nfsTooltip #tip="nfsTooltip">`).
 *
 * Uses @angular-eslint/utils for Angular-specific AST utilities.
 */

import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, Selectors } from '@angular-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nfs/require-export-as"
export const RULE_NAME = 'require-export-as';

type MessageIds = 'missingExportAs';

export const rule = ESLintUtils.RuleCreator(() => __filename)<[], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require exportAs property on components and directives for template reference access',
    },
    schema: [],
    messages: {
      missingExportAs:
        'Components and directives must define exportAs to allow template reference access.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      // Single selector matches both @Component and @Directive decorators
      [Selectors.COMPONENT_OR_DIRECTIVE_CLASS_DECORATOR](
        node: TSESTree.Decorator,
      ) {
        // Get the decorator argument using angular-eslint utility
        // Returns undefined if there's no object argument (e.g., @Component(someVariable))
        const decoratorArg = ASTUtils.getDecoratorArgument(node);
        if (!decoratorArg) {
          // Can't validate non-object arguments - skip
          return;
        }

        // Use angular-eslint utility to extract the exportAs property value
        const exportAs = ASTUtils.getDecoratorPropertyValue(node, 'exportAs');

        if (!exportAs) {
          context.report({
            node,
            messageId: 'missingExportAs',
          });
        }
      },
    };
  },
});
