# /analyze-report-gaps-haiku-4-5

Cross-artifact consistency analysis with **file output** - optimized for Claude Haiku 4.5.

## Overview

This skill performs the **same 6-pass cross-artifact consistency analysis** as `/speckit.analyze` and `/analyze-haiku-4-5`, but ALWAYS outputs to a file artifact instead of terminal-only.

## Comparison

| Skill                                | Analysis    | Output            | Model            |
| ------------------------------------ | ----------- | ----------------- | ---------------- |
| `/speckit.analyze`                   | Full 6-pass | Terminal only     | Sonnet (default) |
| `/analyze-haiku-4-5`                 | Full 6-pass | Terminal only     | Haiku 4.5        |
| **`/analyze-report-gaps-haiku-4-5`** | Full 6-pass | **File artifact** | Haiku 4.5        |

## When to Use

Use this skill instead of `/analyze-haiku-4-5` when you need:

- **Programmatic handoffs** - Pass analysis results to another skill or workflow
- **Tracking over time** - Compare analysis results across iterations
- **Documentation** - Include gap analysis in project artifacts
- **CI/CD integration** - Generate artifact for automated pipelines

## Output

Creates `gap-analysis-report.md` in the feature directory:

```
specs/<feature>/gap-analysis-report.md
```

## Detection Passes

The skill performs 6 detection passes (identical to `/speckit.analyze`):

| Pass | Category               | What It Finds                        |
| ---- | ---------------------- | ------------------------------------ |
| A    | Duplication            | Near-duplicate requirements          |
| B    | Ambiguity              | Vague terms, unresolved placeholders |
| C    | Underspecification     | Missing objects, criteria            |
| D    | Constitution Alignment | MUST violations                      |
| E    | Coverage Gaps          | Requirements without tasks           |
| F    | Inconsistency          | Terminology drift, conflicts         |

## Output Structure

```markdown
# [Feature] Specification Analysis Report

**Analysis Date**: YYYY-MM-DD
**Analyst**: Claude Haiku 4.5

## Findings

| ID      | Category    | Severity | Location(s)  | Summary | Recommendation |
| ------- | ----------- | -------- | ------------ | ------- | -------------- |
| GAP-001 | Duplication | HIGH     | spec.md:L120 | ...     | ...            |

## Coverage Summary

| Requirement Key | Has Task? | Task IDs | Notes |
| --------------- | --------- | -------- | ----- |

## Metrics

- Total Requirements: N
- Total Tasks: N
- Coverage %: N%
- Critical Issues: N

## Next Actions

[Based on severity - CRITICAL blocks implementation]
```

## Haiku 4.5 Optimizations

This skill uses Haiku 4.5-specific optimizations:

- **Step-bounded reasoning** (9 explicit steps)
- **FOR EACH patterns** for mechanical iteration
- **XML tags** (`<task>`, `<critical>`, `<evaluation_criteria>`)
- **Anti-goals** to prevent common failure modes
- **Auto-detection** from git branch (no user confirmation)

## Related Skills

- `/analyze-haiku-4-5` - Same analysis, terminal output only
- `/speckit.analyze` - Same analysis, Sonnet model
- `/analyze-prepare-reported-gaps-for-implementation` - Creates remediation checklist from this report
