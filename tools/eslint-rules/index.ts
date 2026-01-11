import {
  RULE_NAME as requireViewEncapsulationNoneName,
  rule as requireViewEncapsulationNone,
} from './rules/require-view-encapsulation-none';
import {
  RULE_NAME as requireExportAsName,
  rule as requireExportAs,
} from './rules/require-export-as';

/**
 * Custom ESLint rules for ngx-foundation-sites.
 *
 * Both named and default exports provided for compatibility:
 * - Named `rules` export: Required by Nx's resolve-workspace-rules.js which uses
 *   CommonJS require() with destructuring: `const { rules } = require(...)`
 * - Default export: Follows ESLint plugin convention for ES module imports
 *
 * @see https://nx.dev/docs/technologies/eslint/guides/custom-workspace-rules
 */
export const rules = {
  [requireViewEncapsulationNoneName]: requireViewEncapsulationNone,
  [requireExportAsName]: requireExportAs,
};

export default { rules };
