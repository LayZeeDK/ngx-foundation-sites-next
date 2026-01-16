# Gap Implementation Orchestrator

Execute gap fixes from `gap-analysis-report.md` with automatic model selection based on finding complexity.

## Quick Start

```bash
# In Claude Code CLI
/implement-reported-gaps
```

## What It Does

1. **Auto-detects** feature directory from git branch
2. **Reads** gap-analysis-report.md and parses findings table
3. **Classifies** findings by complexity → assigns target model
4. **Spawns** Task agents with model-optimized prompts
5. **Tracks** progress via TodoWrite
6. **Reports** completion with cost metrics

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│              /implement-reported-gaps (Haiku 4.5)              │
│                     Orchestrator Skill                         │
└──────────────────────────┬─────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   Task(haiku)       Task(sonnet)       Task(opus)
   LOW findings      MEDIUM findings    HIGH findings
```

## Classification Matrix

| Severity | Category           | Target Model | Work Type                 |
| -------- | ------------------ | ------------ | ------------------------- |
| LOW      | Any                | haiku        | Mechanical, pattern-based |
| MEDIUM   | Inconsistency      | haiku        | Cross-reference updates   |
| MEDIUM   | CoverageGap        | sonnet       | Implementation decision   |
| MEDIUM   | Underspecification | sonnet       | Context synthesis         |
| HIGH     | Any                | opus         | Deep analysis, judgment   |

## Cost Efficiency

| Model     | Cost/Finding | Typical Count | Subtotal       |
| --------- | ------------ | ------------- | -------------- |
| haiku     | $0.01-0.02   | 4-5           | $0.04-0.10     |
| sonnet    | $0.05-0.10   | 2-3           | $0.10-0.30     |
| opus      | $0.50-1.00   | 1-2           | $0.50-2.00     |
| **TOTAL** |              | ~9            | **$0.66-2.43** |

Compare: All findings on Opus = ~$4.50-9.00

## When to Use

- **After** `/analyze-report-gaps-haiku-4-5` generates gap-analysis-report.md
- When ready to implement gap fixes
- For cost-efficient execution with automatic model routing

## Example Output

```
## Gap Implementation Complete

**Feature**: 002-accordion-component
**Report**: specs/002-accordion-component/gap-analysis-report.md

### Execution Summary

| Model  | Findings | Resolved | Failed |
|--------|----------|----------|--------|
| haiku  | 4        | 4        | 0      |
| sonnet | 3        | 3        | 0      |
| opus   | 2        | 2        | 0      |
| TOTAL  | 9        | 9        | 0      |

### Cost Efficiency
- Estimated cost: $1.20
- All-opus comparison: $6.75
- Savings: 82%
```

## Why Haiku for Orchestration

The orchestrator performs **mechanical template-filling**, not creative reasoning:

1. **Parse**: Extract structured data from markdown table
2. **Classify**: Apply IF/ELSE rules (deterministic)
3. **Fill templates**: Mechanical substitution
4. **Spawn Tasks**: Structured tool calls

This is exactly what Haiku 4.5 excels at—fast, cheap, reliable.

## Related Commands

| Command                          | Purpose                         |
| -------------------------------- | ------------------------------- |
| `/analyze-report-gaps-haiku-4-5` | Generate gap-analysis-report.md |
| `/analyze-haiku-4-5`             | Terminal-only analysis          |
| `/speckit.analyze`               | Sonnet-based analysis           |
| **`/implement-reported-gaps`**   | Execute fixes (this command)    |

## Success Criteria

After execution:

✅ All findings classified with correct target model
✅ All Tasks spawned with model-optimized prompts
✅ Progress tracked via TodoWrite
✅ Completion validated with success/failure counts
✅ Summary generated with cost metrics
