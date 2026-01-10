# Implement Gap Remediations Skill

Systematically executes gap fixes from REMEDIATION_CHECKLIST.md.

## Quick Start

```bash
# In Claude Code CLI
/implement-gap-remediations
```

```bash
# In GitHub Copilot CLI
gh copilot slash implement-gap-remediations
```

## What It Does

1. **Reads** REMEDIATION_CHECKLIST.md and GAPS_REMEDIATION.md
2. **Asks** user for scope (P0/P1/P2/specific gaps)
3. **Executes** each gap systematically with test verification
4. **Updates** tracking documents (status → ✅ FIXED)
5. **Commits** changes with conventional format

## When to Use

- **After** running `/analyze-gaps` (creates checklist)
- When ready to implement gap fixes
- For systematic, verified implementation

## Example Output

From accordion P0 gaps (32 min):

```
📋 Implementation Plan:
- Scope: P0 only (BLOCKING)
- Gaps: 3 (GAP-1, GAP-2, GAP-3)
- Estimated: 32 minutes

✅ GAP-3 complete (2 min) - multiExpandable renamed
✅ GAP-1 complete (10 min) - methods added
✅ GAP-2 complete (20 min) - outputs added

🎉 Implementation complete!
- Tests: ✅ passing
- Commits: 1 (P0 fixes)
- Status: 3 gaps marked FIXED
```

## Key Features

- **Test-gated**: Stops on test failures
- **Progress tracking**: TodoWrite shows real-time progress
- **Incremental commits**: One per priority level
- **Breaking changes**: Confirms with user, updates CHANGELOG.md

## Success Criteria

After execution:

✅ All selected gaps implemented
✅ Tests passing
✅ Tracking docs updated
✅ Git commits created

## Related Commands

- `/analyze-brief` - Generates gap report
- `/analyze-gaps` - Creates REMEDIATION_CHECKLIST.md
- Run this command to execute fixes
