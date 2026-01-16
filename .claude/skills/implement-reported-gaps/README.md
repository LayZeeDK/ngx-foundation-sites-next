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
│  Step 3.5: Detect code vs docs + Haiku-safe code criteria      │
└──────────────────────────┬─────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   Phase 1: Docs     Phase 1: Docs     Phase 1: Docs
   Task(haiku)       Task(sonnet)      Task(opus)
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
   ┌───────────────────────┼───────────────────────┐
   ▼                       ▼                       ▼
Phase 2: Code         Phase 2: Code         Phase 2: Code
Task(haiku)           Task(sonnet)          Task(opus)
(mechanical only)     (reasoning needed)    (complex judgment)
```

## Two-Phase Execution

| Phase | Purpose                  | File Types                 | Models Used         |
| ----- | ------------------------ | -------------------------- | ------------------- |
| 1     | Documentation resolution | spec.md, plan.md, tasks.md | haiku, sonnet, opus |
| 2     | Code implementation      | .ts, .html, .scss          | haiku, sonnet, opus |

**Key**: Haiku handles code ONLY for mechanical insertions (exact code provided, single location, additive only).

## Code Detection Rules

A finding requires code implementation if:

- Location references `.ts`, `.js`, `.tsx`, `.jsx`, `.scss`, `.css`, `.html` files
- Recommendation mentions: `implement`, `add method`, `ErrorHandler`, `handleError`, etc.
- Category is `CoverageGap` with specific code location references

## Classification Matrix

| Severity | Category           | Docs Model | Code Model                  | Rationale                 |
| -------- | ------------------ | ---------- | --------------------------- | ------------------------- |
| LOW      | Any                | haiku      | haiku (if safe) OR → sonnet | Mechanical, pattern-based |
| MEDIUM   | Inconsistency      | haiku      | haiku (if safe) OR → sonnet | Cross-reference updates   |
| MEDIUM   | CoverageGap        | sonnet     | sonnet                      | Implementation decision   |
| MEDIUM   | Underspecification | sonnet     | sonnet                      | Context synthesis         |
| HIGH     | Any                | opus       | opus                        | Deep analysis, judgment   |

### Haiku-Safe Code Criteria

Haiku can handle code changes when **ALL** conditions are met:

| Criterion           | Requirement                                     | Example                               |
| ------------------- | ----------------------------------------------- | ------------------------------------- |
| **Exact code**      | Remediation doc or code block in Recommendation | `this.#errorHandler.handleError(...)` |
| **Single file**     | Location references ONE source file             | `accordion.ts:283` ✅                 |
| **Single location** | One line or small range (≤10 lines)             | `line 283-288` ✅                     |
| **Additive only**   | Insert/add code, not modify existing logic      | `add call` ✅, `change behavior` ❌   |
| **No new imports**  | OR import explicitly specified                  | Uses existing `#errorHandler` ✅      |

**If ANY criterion fails**: haiku → sonnet (upgrade for safety)

## Cost Efficiency

| Phase     | Model  | Cost/Finding | Overhead | Typical Count | Subtotal       |
| --------- | ------ | ------------ | -------- | ------------- | -------------- |
| Docs      | haiku  | $0.01-0.02   | +$0.01   | 3-4           | $0.06-0.12     |
| Docs      | sonnet | $0.05-0.10   | +$0.02   | 1-2           | $0.07-0.24     |
| Docs      | opus   | $0.50-1.00   | +$0.10   | 1             | $0.60-1.10     |
| Code      | haiku  | $0.02-0.03   | +$0.01   | 1-2           | $0.03-0.08     |
| Code      | sonnet | $0.08-0.15   | +$0.02   | 1-2           | $0.10-0.34     |
| Code      | opus   | $0.75-1.50   | +$0.10   | 0-1           | $0.00-1.60     |
| **TOTAL** |        |              |          | ~9            | **$0.86-3.48** |

Compare: All findings on Opus = ~$4.50-9.00

**Note**: Each Task spawns with ~20K token overhead. The "Overhead" column accounts for this.

**Haiku code savings**: ~$0.05-0.12 per mechanical insertion vs Sonnet

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

## Task Isolation & Error Handling

### Task Isolation

Tasks spawn with `run_in_background: true` for isolation:

- One Task failure doesn't terminate other running Tasks
- Results collected via TaskOutput tool after spawning

### Parallelism Limits

- **Maximum concurrent Tasks**: 10
- Findings are batched into groups of 10 when count exceeds limit
- Each batch completes before next batch spawns

### Error Handling

- **Retry pattern**: 429 errors retry with exponential backoff (max 3 attempts)
- **Graceful degradation**: Haiku failures may upgrade to Sonnet
- **Reporting**: Failed findings listed in summary with diagnostic info

## Known Issues

| Issue                                                                                           | Impact                           | Workaround                                   |
| ----------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------- |
| **Model param ignored** ([#12063](https://github.com/anthropics/claude-code/issues/12063))      | Cost savings may not materialize | Monitor logs; use custom subagents if needed |
| **Haiku MCP tool_reference** ([#14863](https://github.com/anthropics/claude-code/issues/14863)) | Haiku fails with many MCP tools  | Pre-load tools or upgrade to Sonnet          |
| **Cascading failures** ([#6594](https://github.com/anthropics/claude-code/issues/6594))         | One failure kills all Tasks      | Mitigated with `run_in_background: true`     |

See [CLAUDE-CODE-MCP-SEARCH.md](../../../prompt-engineering/CLAUDE-CODE-MCP-SEARCH.md) for MCP Tool Search details.

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
