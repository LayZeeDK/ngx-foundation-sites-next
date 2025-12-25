import {
  RULE_NAME as requireViewEncapsulationNoneName,
  rule as requireViewEncapsulationNone,
} from './rules/require-view-encapsulation-none';

// Export rules for loadWorkspaceRules to consume
// See: https://nx.dev/docs/technologies/eslint/guides/custom-workspace-rules
export default {
  rules: { [requireViewEncapsulationNoneName]: requireViewEncapsulationNone },
};
