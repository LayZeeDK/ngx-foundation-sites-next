# Analyze Gaps Skill

Validates gap analysis reports and creates remediation documentation.

## Quick Start

```bash
# In Claude Code CLI
/analyze-gaps
```

```bash
# In GitHub Copilot CLI
gh copilot slash analyze-gaps
```

## What It Does

1. **Validates** each claimed gap from `gap-analysis-report.md`
2. **Scores** confidence (0-10) based on evidence quality
3. **Creates** `GAPS_REMEDIATION.md` (comprehensive tracking)
4. **Creates** `REMEDIATION_CHECKLIST.md` (step-by-step implementation guide)
5. **Updates** spec.md, plan.md, tasks.md with cross-references
6. **Commits** in 4 logical increments

## When to Use

- **After** running `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` (or manual gap analysis)
- **Before** implementing fixes (creates actionable checklists)
- To prevent future `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` from re-flagging known gaps

## Example Output

From accordion gap analysis:
- **7 validated gaps** (3 P0, 3 P1, 1 P2) with evidence scores 6-10/10
- **4 false positives** correctly identified
- **GAPS_REMEDIATION.md** (377 lines) with evidence chains
- **REMEDIATION_CHECKLIST.md** (635 lines) with code snippets
- **182-minute fix estimate** (P0=32min, P1=135min, P2=15min)
- **4 clean commits** with conventional format

## Success Criteria

Future analysis tools should:
- Find "NOT IMPLEMENTED - TRACKED" markers
- Not re-flag false positives
- Reference GAPS_REMEDIATION.md for details

## Related Commands

- `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` - Generates initial gap report (run first)
- `/speckit.implement` - Executes remediation checklist (run after)
- `/speckit.analyze` - Pre-implementation consistency check (different purpose)
