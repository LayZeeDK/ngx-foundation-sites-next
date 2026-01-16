---
name: implement-reported-gaps
description: Execute gap fixes from gap-analysis-report.md with automatic model selection based on finding complexity. Optimized for Haiku 4.5 orchestration with intelligent routing to haiku/sonnet/opus workers.
model_override: claude-haiku-4.5
handoffs:
  - label: Re-analyze Gaps
    agent: analyze-report-gaps-haiku-4-5
    prompt: Run gap analysis again to verify fixes
---

# Gap Implementation Orchestrator

Execute gap fixes from `gap-analysis-report.md` with automatic model selection based on finding complexity. This skill implements a **smart dispatcher pattern** optimized for Haiku 4.5.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               /implement-reported-gaps (Haiku 4.5)              │
│                      Orchestrator Skill                         │
│                                                                 │
│  1. Read gap-analysis-report.md (auto-detect from git branch)   │
│  2. Parse findings table → extract ID, Severity, Category       │
│  3. Score each finding → assign target model                    │
│  4. Generate model-optimized prompts for each finding           │
│  5. Spawn Task agents with model parameter                      │
│  6. Track progress, validate completion                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Task(haiku)     │ │ Task(sonnet)    │ │ Task(opus)      │
│ LOW findings    │ │ MEDIUM findings │ │ HIGH findings   │
│ Mechanical work │ │ Standard impl   │ │ Judgment calls  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## When to Use

- **After** `/analyze-report-gaps-haiku-4-5` generates `gap-analysis-report.md`
- When ready to implement gap fixes across spec/plan/tasks files
- For cost-efficient execution with automatic model routing

## Goal

Parse gap analysis findings, classify by complexity, spawn model-optimized Task agents, track progress, and validate completion.

---

## Execution Steps

<critical>
Execute EXACTLY these 8 steps in order. Do NOT skip steps. Do NOT add extra steps.
</critical>

### Step 1: Auto-Detect Feature Directory

<task>
Locate gap-analysis-report.md using git branch name.
</task>

<action_steps>

1. Run: `git branch --show-current`
2. Parse branch name to extract feature (format: `NNN-feature-name`)
3. Construct path: `specs/{feature}/gap-analysis-report.md`
4. If file not found, check `specs/*/gap-analysis-report.md` for matches
   </action_steps>

<output_format>
FEATURE_DIR: specs/{feature}
REPORT_PATH: specs/{feature}/gap-analysis-report.md
</output_format>

### Step 2: Read and Parse Gap Report

<task>
Read gap-analysis-report.md and extract the Findings table.
</task>

<action_steps>

1. Read file at REPORT_PATH
2. Find table starting with `| ID  | Category`
3. FOR EACH row in table:
   - Extract: ID, Category, Severity, Location(s), Summary, Recommendation
   - Store as structured finding object
4. Count findings by severity: HIGH, MEDIUM, LOW
   </action_steps>

<output_format>
Parsed N findings:

- HIGH: X findings (IDs: ...)
- MEDIUM: Y findings (IDs: ...)
- LOW: Z findings (IDs: ...)
  </output_format>

### Step 3: Classify Findings → Target Model

<task>
Apply classification formula to assign target model for each finding.
</task>

<classification_rules>
FOR EACH finding:
IF severity == "LOW":
model = "haiku"
ELSE IF severity == "MEDIUM" AND category IN ["Inconsistency"]:
model = "haiku"
ELSE IF severity == "MEDIUM":
model = "sonnet"
ELSE IF severity == "HIGH":
model = "opus"
</classification_rules>

<output_format>
Classification results:

- haiku tasks: [IDs] (N findings)
- sonnet tasks: [IDs] (N findings)
- opus tasks: [IDs] (N findings)
  </output_format>

### Step 4: Create TodoWrite Tracking

<task>
Create TODO list with one item per finding.
</task>

<action_steps>

1. Call TodoWrite with all findings as pending tasks
2. Include finding ID and target model in each task
3. Format: "{ID}: {Summary (truncated)} [{model}]"
   </action_steps>

### Step 5: Generate Prompts and Spawn Tasks

<task>
FOR EACH finding, generate model-optimized prompt and spawn Task agent.
</task>

<critical>
- Spawn PARALLEL Tasks for independent findings targeting the same model
- Use SEQUENTIAL Tasks when findings have dependencies
- Include exact file paths and line numbers from finding Location(s)
</critical>

#### Haiku Prompt Template (LOW/Mechanical)

<haiku_template>
FOR findings targeting model="haiku", use this exact template:

```xml
<role>
You are an implementation assistant resolving specification gaps.
Output: Exact file edits only. No explanations.
</role>

<task>
Resolve finding {ID}: {Summary}
</task>

<context>
File: {Location}
Category: {Category}
Feature directory: {FEATURE_DIR}
</context>

<action_steps>
Execute exactly these steps:
1. Read {file_path} at line {line_number}
2. Identify the exact text to change based on recommendation
3. Use Edit tool with old_string/new_string
4. Verify edit succeeded (no error returned)
</action_steps>

<recommendation>
{Recommendation}
</recommendation>

<constraints>
- Maximum 3 file edits
- Use Edit tool (NOT Write tool)
- Do NOT modify unrelated sections
- Do NOT add explanatory comments to code
</constraints>

<success_criteria>
- [ ] Edit tool returned success
- [ ] Change at correct location
- [ ] No unrelated changes
</success_criteria>

<anti_goals>
- Do NOT explain what you're doing
- Do NOT ask for confirmation
- Do NOT suggest additional improvements
</anti_goals>
```

REPLACE placeholders:

- {ID} = finding ID from table column 1
- {Summary} = finding Summary from table column 5
- {Location} = finding Location from table column 4
- {Category} = finding Category from table column 2
- {Recommendation} = finding Recommendation from table column 6
- {FEATURE_DIR} = from Step 1
- {file_path} = extract file path from Location (format: file.md:line)
- {line_number} = extract line number from Location
  </haiku_template>

#### Sonnet Prompt Template (MEDIUM/Standard)

<sonnet_template>
FOR findings targeting model="sonnet", use this exact template:

```markdown
<role>
You are an implementation agent executing systematic gap resolution.
</role>

<implementation_phases>

<phase name="context">
Read these files in parallel to understand the problem:
- {Location} (finding location)
- Related files mentioned in recommendation

Think about:

- What's the root cause of this finding?
- What's the minimal fix?
- What could go wrong?
  </phase>

<phase name="implementation">
## Finding: {ID} - {Summary}

**Severity**: {Severity}
**Category**: {Category}
**Location**: {Location}
**Feature directory**: {FEATURE_DIR}

### Recommendation

{Recommendation}

### Implementation Approach

1. **Read current state** at {Location}
2. **Implement minimal fix** per recommendation
3. **Verify immediately** - read file to confirm change applied

### Out of Scope

- Refactoring beyond the fix
- Additional features
- Unrelated improvements
- Documentation beyond what's specified
  </phase>

<phase name="verification">
After implementation:
- [ ] Fix addresses the finding
- [ ] No unintended side effects
- [ ] Related files updated if cross-referenced
</phase>

</implementation_phases>

<constraints>
- Implement ONLY what's needed for this finding
- Do NOT add error handling beyond what's specified
- Do NOT refactor adjacent code
</constraints>
```

REPLACE placeholders:

- {ID} = finding ID from table column 1
- {Summary} = finding Summary from table column 5
- {Severity} = finding Severity from table column 3
- {Category} = finding Category from table column 2
- {Location} = finding Location from table column 4
- {Recommendation} = finding Recommendation from table column 6
- {FEATURE_DIR} = from Step 1
  </sonnet_template>

#### Opus Prompt Template (HIGH/Judgment)

<opus_template>
FOR findings targeting model="opus", use this exact template:

```markdown
<role>
You are an expert implementation agent with deep reasoning capabilities.
Use medium effort for token efficiency.
</role>

<finding id="{ID}" severity="HIGH" category="{Category}">

## Problem Statement

{Summary}

## Location(s)

{Location}

## Feature Directory

{FEATURE_DIR}

## Recommendation

{Recommendation}

</finding>

<implementation_strategy>

## Phase 1: Deep Analysis

Consider these questions:

- What's the root cause of this finding?
- What are the possible resolution approaches?
- What are the tradeoffs of each approach?
- What could go wrong with each approach?

Evaluate the impact on:

- Other components in the codebase
- Existing tests and behavior
- Future maintenance

## Phase 2: Resolution

Based on your analysis:

1. Choose the best resolution approach
2. Implement the solution
3. Document your decision rationale if non-obvious

## Phase 3: Verification

After implementation:

- Verify the finding is resolved
- Check for unintended side effects
- Update related files for consistency

</implementation_strategy>

<deliverables>
- Resolution implemented
- Decision rationale (if significant choice)
- Related files updated
</deliverables>

<guidance>
Trust your expert judgment.
Implement complete solution, then verify once.
If the finding involves documentation consistency, ensure all cross-references are updated.
</guidance>
```

REPLACE placeholders:

- {ID} = finding ID from table column 1
- {Summary} = finding Summary from table column 5
- {Category} = finding Category from table column 2
- {Location} = finding Location from table column 4
- {Recommendation} = finding Recommendation from table column 6
- {FEATURE_DIR} = from Step 1
  </opus_template>

#### Spawning Task Agents

<task_spawning>
FOR EACH finding:

1. Select template based on target model
2. Fill template with finding data
3. Spawn Task with:
   - subagent_type: "general-purpose"
   - model: "{target_model}" (haiku, sonnet, or opus)
   - prompt: "{filled_template}"

Spawn independent haiku Tasks in PARALLEL (same message, multiple Task tool calls).
Spawn sonnet/opus Tasks after haiku Tasks complete if there are dependencies.
</task_spawning>

### Step 6: Track Progress

<task>
Update TodoWrite as each Task completes.
</task>

<action_steps>

1. When Task returns success:
   - Mark corresponding finding as completed in TodoWrite
   - Note the model used and outcome
2. When Task returns failure:
   - Keep finding as in_progress
   - Note the error for reporting
3. Continue until all Tasks complete
   </action_steps>

### Step 7: Validate Completion

<task>
Verify all spawned Tasks completed successfully.
</task>

<action_steps>

1. Count completed vs failed Tasks
2. FOR EACH failed Task:
   - Log finding ID and error
   - Include in failure report
3. Calculate success rate
   </action_steps>

<output_format>
Completion status:

- Total findings: N
- Resolved: X (list IDs)
- Failed: Y (list IDs with reasons)
- Success rate: Z%
  </output_format>

### Step 8: Summary Report

<task>
Generate final summary with metrics and recommendations.
</task>

<output_format>

## Gap Implementation Complete

**Feature**: {feature_name}
**Report**: {REPORT_PATH}

### Execution Summary

| Model  | Findings | Resolved | Failed |
| ------ | -------- | -------- | ------ |
| haiku  | N        | X        | Y      |
| sonnet | N        | X        | Y      |
| opus   | N        | X        | Y      |
| TOTAL  | N        | X        | Y      |

### Resolved Findings

- {ID}: {Summary} ✅

### Failed Findings (if any)

- {ID}: {Summary} - {error_reason}

### Cost Efficiency

- Estimated cost: $X.XX
- All-opus comparison: $Y.YY
- Savings: Z%

### Next Steps

IF all resolved:

- Run `/analyze-report-gaps-haiku-4-5` to verify no regressions
  ELSE:
- Review failed findings manually
- Re-run skill or address failures individually
  </output_format>

---

## Classification Reference

| Severity | Category           | Target Model | Rationale                        |
| -------- | ------------------ | ------------ | -------------------------------- |
| LOW      | Any                | haiku        | Mechanical work, pattern-based   |
| MEDIUM   | Inconsistency      | haiku        | Search/replace, cross-reference  |
| MEDIUM   | CoverageGap        | sonnet       | Requires implementation decision |
| MEDIUM   | Underspecification | sonnet       | Requires context synthesis       |
| HIGH     | Any                | opus         | Requires judgment, deep analysis |

## Cost Estimation

| Model     | Cost/Finding | Typical Count | Subtotal       |
| --------- | ------------ | ------------- | -------------- |
| haiku     | $0.01-0.02   | 4-5           | $0.04-0.10     |
| sonnet    | $0.05-0.10   | 2-3           | $0.10-0.30     |
| opus      | $0.50-1.00   | 1-2           | $0.50-2.00     |
| **TOTAL** |              | ~9            | **$0.66-2.43** |

Compare: All findings on Opus = ~$4.50-9.00

## Why Haiku for Orchestration

| Aspect            | Why Haiku Works                      |
| ----------------- | ------------------------------------ |
| Parsing           | Reading markdown table is mechanical |
| Classification    | Scoring formula is explicit IF/ELSE  |
| Template filling  | Mechanical substitution              |
| Task spawning     | Structured tool calls                |
| Progress tracking | Checklist updates                    |

The orchestrator does NOT need deep reasoning - it's a **dispatcher** that:

1. Parses structured input
2. Applies explicit rules
3. Generates structured output (Task calls)

## Example Usage

```bash
# In Claude Code CLI
/implement-reported-gaps

# Auto-detects from git branch: 002-accordion-component
# Reads: specs/002-accordion-component/gap-analysis-report.md
# Classifies 9 findings → 4 haiku, 3 sonnet, 2 opus
# Spawns Tasks with model-optimized prompts
# Reports completion with cost metrics
```

## Related Commands

- `/analyze-report-gaps-haiku-4-5` - Generates gap-analysis-report.md (run first)
- `/analyze-haiku-4-5` - Terminal-only analysis (no file output)
- `/speckit.analyze` - Sonnet-based analysis

## Success Criteria

After execution:

✅ **All findings classified** with correct target model
✅ **All Tasks spawned** with model-optimized prompts
✅ **Progress tracked** via TodoWrite
✅ **Completion validated** with success/failure counts
✅ **Summary generated** with cost metrics
