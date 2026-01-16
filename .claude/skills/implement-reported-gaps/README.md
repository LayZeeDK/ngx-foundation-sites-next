# Gap Implementation Orchestrator

Execute gap fixes from `gap-analysis-report.md` with automatic model selection and **two-phase execution**.

## Quick Start

```bash
# In Claude Code CLI
/implement-reported-gaps
```

## What It Does

1. **Auto-detects** feature directory from git branch
2. **Reads** gap-analysis-report.md and parses findings table
3. **Classifies** findings by complexity → assigns target model
4. **Detects** which findings require code changes vs documentation-only
5. **Phase 1**: Spawns Tasks for documentation fixes (spec.md, plan.md, tasks.md)
6. **Phase 2**: Spawns Tasks for code implementation (TypeScript, Angular files)
7. **Tracks** progress via TodoWrite with phase indicators
8. **Reports** completion with cost metrics

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│              /implement-reported-gaps (Haiku 4.5)              │
│                     Orchestrator Skill                         │
│                                                                │
│  Step 3.5: Detect code vs documentation needs                  │
└──────────────────────────┬─────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   Phase 1: Docs     Phase 1: Docs     Phase 1: Docs
   Task(haiku)       Task(sonnet)      Task(opus)
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
                    Phase 2: Code
                    Task(sonnet/opus)
```

## Two-Phase Execution

| Phase | Purpose                  | File Types                 | Models Used         |
| ----- | ------------------------ | -------------------------- | ------------------- |
| 1     | Documentation resolution | spec.md, plan.md, tasks.md | haiku, sonnet, opus |
| 2     | Code implementation      | .ts, .html, .scss          | sonnet, opus only   |

**Key**: Haiku-classified findings requiring code changes are **upgraded to Sonnet** for safety.

## Code Detection Rules

A finding requires code implementation if:

- Location references `.ts`, `.js`, `.tsx`, `.jsx`, `.scss`, `.css`, `.html` files
- Recommendation mentions: `implement`, `add method`, `ErrorHandler`, `handleError`, etc.
- Category is `CoverageGap` with specific code location references

## Classification Matrix

| Severity | Category           | Docs Model | Code Model | Rationale                 |
| -------- | ------------------ | ---------- | ---------- | ------------------------- |
| LOW      | Any                | haiku      | → sonnet   | Mechanical, pattern-based |
| MEDIUM   | Inconsistency      | haiku      | → sonnet   | Cross-reference updates   |
| MEDIUM   | CoverageGap        | sonnet     | sonnet     | Implementation decision   |
| MEDIUM   | Underspecification | sonnet     | sonnet     | Context synthesis         |
| HIGH     | Any                | opus       | opus       | Deep analysis, judgment   |

## Cost Efficiency

| Phase     | Model  | Cost/Finding | Typical Count | Subtotal       |
| --------- | ------ | ------------ | ------------- | -------------- |
| Docs      | haiku  | $0.01-0.02   | 3-4           | $0.03-0.08     |
| Docs      | sonnet | $0.05-0.10   | 1-2           | $0.05-0.20     |
| Docs      | opus   | $0.50-1.00   | 1             | $0.50-1.00     |
| Code      | sonnet | $0.08-0.15   | 1-2           | $0.08-0.30     |
| Code      | opus   | $0.75-1.50   | 0-1           | $0.00-1.50     |
| **TOTAL** |        |              | ~9            | **$0.66-3.08** |

Compare: All findings on Opus = ~$4.50-9.00

## Example Output

```
## Gap Implementation Complete

**Feature**: 002-accordion-component

### Execution Summary

| Phase | Model  | Findings | Resolved | Failed |
| ----- | ------ | -------- | -------- | ------ |
| Docs  | haiku  | 5        | 5        | 0      |
| Docs  | sonnet | 1        | 1        | 0      |
| Docs  | opus   | 2        | 2        | 0      |
| Code  | sonnet | 1        | 1        | 0      |
| TOTAL |        | 9        | 9        | 0      |

### Cost Efficiency
- Estimated cost: $1.25
- All-opus comparison: $6.75
- Savings: 81%
```

## Why Haiku for Orchestration

The orchestrator performs **mechanical operations**:

1. **Parse**: Extract structured data from markdown table
2. **Classify**: Apply IF/ELSE rules (deterministic)
3. **Detect**: Pattern match file extensions and keywords
4. **Fill templates**: Mechanical substitution
5. **Spawn Tasks**: Structured tool calls

This is exactly what Haiku 4.5 excels at—fast, cheap, reliable.

## Key Improvement: No More Remediation Documents

Previous behavior created `*-REMEDIATION.md` files for findings requiring code changes.

**New behavior**: Phase 2 spawns code implementation Tasks that make the changes directly.

| Before                          | After                              |
| ------------------------------- | ---------------------------------- |
| E01-REMEDIATION.md created      | Code change made directly          |
| Manual follow-up required       | Automatic implementation           |
| Finding marked "resolved" early | Finding resolved when code changes |

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
✅ Code implementation needs detected accurately
✅ Phase 1 Tasks spawned for documentation fixes
✅ Phase 2 Tasks spawned for code changes
✅ Progress tracked via TodoWrite with phase indicators
✅ Completion validated with success/failure counts per phase
✅ Summary generated with cost metrics
✅ No remediation documents created - all fixes implemented directly
