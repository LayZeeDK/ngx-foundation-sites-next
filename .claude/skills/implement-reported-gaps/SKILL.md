---
name: implement-reported-gaps
description: Execute gap fixes from gap-analysis-report.md with automatic model selection based on finding complexity. Optimized for Haiku 4.5 orchestration with intelligent routing to haiku/sonnet/opus workers. Includes two-phase execution for documentation and code implementation.
model_override: claude-haiku-4.5
handoffs:
  - label: Re-analyze Gaps
    agent: analyze-report-gaps-haiku-4-5
    prompt: Run gap analysis again to verify fixes
---

# Gap Implementation Orchestrator

Execute gap fixes from `gap-analysis-report.md` with automatic model selection based on finding complexity. This skill implements a **smart dispatcher pattern** optimized for Haiku 4.5 with **two-phase execution**:

1. **Phase 1**: Documentation resolution (spec.md, plan.md, tasks.md)
2. **Phase 2**: Code implementation (when findings require source code changes)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               /implement-reported-gaps (Haiku 4.5)              │
│                      Orchestrator Skill                         │
│                                                                 │
│  1. Read gap-analysis-report.md (auto-detect from git branch)   │
│  2. Parse findings table → extract ID, Severity, Category       │
│  3. Score each finding → assign target model                    │
│  3.5. Detect code implementation requirements                   │
│  4. Generate model-optimized prompts for each finding           │
│  5. Spawn Task agents (Phase 1: docs, Phase 2: code)            │
│  6. Track progress, validate completion                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Task(haiku)     │ │ Task(sonnet)    │ │ Task(opus)      │
│ LOW findings    │ │ MEDIUM findings │ │ HIGH findings   │
│ Mechanical work │ │ Standard impl   │ │ Judgment calls  │
│ + Code impl     │ │ + Code impl     │ │ + Code impl     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## When to Use

- **After** `/analyze-report-gaps-haiku-4-5` generates `gap-analysis-report.md`
- When ready to implement gap fixes across spec/plan/tasks files AND source code
- For cost-efficient execution with automatic model routing

## Goal

Parse gap analysis findings, classify by complexity, detect code implementation needs, spawn model-optimized Task agents in two phases, track progress, and validate completion.

---

## Execution Steps

<critical>
Execute EXACTLY these 9 steps in order. Do NOT skip steps. Do NOT add extra steps.
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

### Step 3.5: Detect Code Implementation Requirements

<task>
Determine which findings require source code changes vs documentation-only changes.
</task>

<critical>
This step is ESSENTIAL to avoid creating remediation documents when code changes are needed.
</critical>

<detection_rules>
FOR EACH finding:
requiresCodeImplementation = FALSE

// Check Location for source code files
IF Location CONTAINS any of [".ts:", ".js:", ".tsx:", ".jsx:", ".scss:", ".css:", ".html:"]:
AND Location does NOT contain ["spec.md", "plan.md", "tasks.md", "README", "CHANGELOG"]:
requiresCodeImplementation = TRUE

// Check Recommendation for implementation keywords
IF Recommendation CONTAINS any of:
["implement", "add method", "add function", "add property", "add call",
"modify code", "fix code", "update code", "change implementation",
"ErrorHandler", "handleError", "inject", "add import"]:
requiresCodeImplementation = TRUE

// Check Category for implementation indicators
IF category == "CoverageGap" AND Recommendation mentions specific code locations:
requiresCodeImplementation = TRUE
</detection_rules>

<output_format>
Code implementation detection:

- Documentation-only: [IDs] (N findings) → Phase 1
- Requires code changes: [IDs] (N findings) → Phase 2
  </output_format>

### Step 4: Create TodoWrite Tracking

<task>
Create TODO list with one item per finding, indicating phase.
</task>

<action_steps>

1. Call TodoWrite with all findings as pending tasks
2. Include finding ID, target model, and phase in each task
3. Format: "{ID}: {Summary (truncated)} [{model}] [Phase {1|2}]"
   </action_steps>

### Step 5: Generate Prompts and Spawn Tasks (Phase 1: Documentation)

<task>
FOR EACH documentation-only finding, generate model-optimized prompt and spawn Task agent.
</task>

<critical>
- Spawn PARALLEL Tasks for independent findings targeting the same model
- Use SEQUENTIAL Tasks when findings have dependencies
- Include exact file paths and line numbers from finding Location(s)
- Do NOT create remediation documents for documentation-only findings
</critical>

#### Haiku Prompt Template (LOW/Mechanical - Documentation)

<haiku_template>
FOR findings targeting model="haiku" AND requiresCodeImplementation=FALSE, use this template:

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
- Do NOT create remediation documents
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
- Do NOT create *-REMEDIATION.md files
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

#### Sonnet Prompt Template (MEDIUM/Standard - Documentation)

<sonnet_template>
FOR findings targeting model="sonnet" AND requiresCodeImplementation=FALSE, use this template:

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
- Creating remediation documents
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
- Do NOT create *-REMEDIATION.md files
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

#### Opus Prompt Template (HIGH/Judgment - Documentation)

<opus_template>
FOR findings targeting model="opus" AND requiresCodeImplementation=FALSE, use this template:

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
Do NOT create remediation documents - implement the fix directly.
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

### Step 5.5: Generate Prompts and Spawn Tasks (Phase 2: Code Implementation)

<task>
FOR EACH finding with requiresCodeImplementation=TRUE, generate code-aware prompt and spawn Task agent.
</task>

<critical>
- Phase 2 runs AFTER Phase 1 completes
- Code implementation Tasks use specialized prompts with verification steps
- Always use Sonnet or Opus for code changes (never Haiku for production code)
- Include lint/type-check verification
</critical>

#### Code Implementation Prompt Template (Sonnet - Code Changes)

<code_implementation_template_sonnet>
FOR findings with requiresCodeImplementation=TRUE AND model IN ["haiku", "sonnet"], use Sonnet with this template:

**Sonnet 4.5 Optimizations Applied:**

- Phase-based implementation with thinking checkpoints
- Parallel file loading (10-20x faster context building)
- Extended thinking budget (8K-16K for complex code)
- Error-first TDD approach
- Explicit OUT OF SCOPE constraints (prevents scope creep)

```markdown
<role>
You are an implementation agent executing systematic code changes.
Extended thinking budget: 8K tokens for context, 16K for complex logic.
</role>

<finding id="{ID}" severity="{Severity}" category="{Category}">

## Problem Statement

{Summary}

## Source Code Location(s)

{Location}

## Feature Directory

{FEATURE_DIR}

## Required Change

{Recommendation}

</finding>

<implementation_phases>

<phase name="context" parallel_tools="true" extended_thinking="8K">
## Phase 1: Context Loading (PARALLEL)

Read these files SIMULTANEOUSLY in a single message:

- The source file(s) mentioned in Location
- {FEATURE_DIR}/spec.md (search for requirement ID if mentioned)
- Related test files (_.spec.ts, _.stories.ts)

After reading, think about:

- What's the root cause of this gap?
- What's the minimal code change needed?
- What could go wrong?
  </phase>

<phase name="implementation" extended_thinking="16K">
## Phase 2: Implementation (Error-First TDD)

1. **Write test first** (if behavior change):
   - Add test case in spec.ts or Storybook play function
   - Test should fail initially (expected)

2. **Implement minimal fix**:
   - Use Edit tool with precise old_string/new_string
   - Include necessary imports
   - Follow existing code patterns

3. **Run test immediately**:
   - Verify test passes
   - If fails, fix before continuing
     </phase>

<phase name="verification" extended_thinking="none">
## Phase 3: Verification

1. Read modified file to confirm change applied
2. Check TypeScript compilation: `npx tsc --noEmit {file_path}`
3. Verify the change addresses the finding
   </phase>

</implementation_phases>

<constraints>
**IN SCOPE** (implement ONLY these):
- Exact change from Recommendation
- Tests if behavior changes
- JSDoc for public API additions
- Necessary imports

**OUT OF SCOPE** (do NOT implement):

- Refactoring surrounding code
- Performance optimizations
- Additional error handling beyond spec
- Documentation beyond JSDoc
- Creating remediation documents
  </constraints>

<success_criteria>

- [ ] Test written (if behavior change)
- [ ] Code change at correct location
- [ ] Test passes
- [ ] No TypeScript errors
- [ ] Change addresses finding
      </success_criteria>

<anti_goals>

- Do NOT create \*-REMEDIATION.md files
- Do NOT ask for confirmation
- Do NOT suggest additional improvements
- Do NOT modify unrelated code
- Do NOT batch tasks - implement this finding only
  </anti_goals>
```

REPLACE placeholders:

- {ID} = finding ID from table column 1
- {Summary} = finding Summary from table column 5
- {Severity} = finding Severity from table column 3
- {Category} = finding Category from table column 2
- {Location} = finding Location from table column 4
- {Recommendation} = finding Recommendation from table column 6
- {FEATURE_DIR} = from Step 1
- {file_path} = extract file path from Location
  </code_implementation_template_sonnet>

#### Code Implementation Prompt Template (Opus - Complex Code Changes)

<code_implementation_template_opus>
FOR findings with requiresCodeImplementation=TRUE AND model="opus", use this template:

**Opus 4.5 Optimizations Applied:**

- Medium effort parameter (76% fewer tokens, matches Sonnet best performance)
- Calibrated language (no "MUST"/"CRITICAL" - Opus is sensitive to aggressive prompts)
- "Consider/Evaluate/Analyze" word choice (not "think" when possible)
- First-try correctness approach (trust expert judgment, less iteration)
- Extended thinking budget (16K-32K for complex code reasoning)
- Vision capability mention for UI-related findings

```markdown
<role>
You are an expert code implementation agent with deep reasoning capabilities.
Use medium effort for optimal token efficiency.
Extended thinking budget: 16K-32K tokens for complex analysis.
</role>

<finding id="{ID}" severity="HIGH" category="{Category}">

## Problem Statement

{Summary}

## Source Code Location(s)

{Location}

## Feature Directory

{FEATURE_DIR}

## Required Change

{Recommendation}

</finding>

<implementation_strategy>

## Phase 1: Deep Code Analysis (Extended Thinking: 16K)

Read source files in parallel, then evaluate:

- What is the current behavior at this location?
- What should the behavior be after the fix?
- What's the minimal code change to achieve this?
- Are there edge cases to handle proactively?
- Could this change affect existing functionality?

Assess the impact on:

- Related components in the codebase
- Existing tests and behavior
- Future maintenance

## Phase 2: First-Try Implementation

Leverage your expert coding capabilities:

1. Implement the complete solution (high first-try correctness)
2. Use Edit tool with precise old_string/new_string
3. Include necessary imports if required
4. Add JSDoc comments for public API additions
5. Handle edge cases proactively (Opus strength)

Note: Opus 4.5 has higher first-try success rate than other models.
Implement the full solution, then verify once.

## Phase 3: Verification

After implementation:

1. Read the modified file to confirm correctness
2. Verify change addresses the finding requirement
3. Check existing patterns are preserved
4. If UI-related: consider taking screenshot to compare before/after

</implementation_strategy>

<constraints>
Implement only what's needed for this finding.
Preserve existing code architecture and patterns.
Follow the project's TypeScript/Angular conventions.
Do not create remediation documents - implement directly.
</constraints>

<deliverables>
- Code change implemented correctly
- Verification that change addresses finding
- Edge cases handled (leverage Opus's proactive handling)
</deliverables>

<guidance>
Trust your expert judgment for implementation details.
Opus 4.5 has state-of-the-art coding capability (80.9% SWE-bench).
Implement the complete solution on first try, then verify once.
Make the change directly - do not create documentation files.
If the change requires multiple edits, make them all in sequence.
</guidance>
```

REPLACE placeholders:

- {ID} = finding ID from table column 1
- {Summary} = finding Summary from table column 5
- {Category} = finding Category from table column 2
- {Location} = finding Location from table column 4
- {Recommendation} = finding Recommendation from table column 6
- {FEATURE_DIR} = from Step 1
  </code_implementation_template_opus>

#### Spawning Task Agents

<task_spawning>
FOR Phase 1 (Documentation):

1. Select template based on target model
2. Fill template with finding data
3. Spawn Task with:
   - subagent_type: "general-purpose"
   - model: "{target_model}" (haiku, sonnet, or opus)
   - prompt: "{filled_template}"

Spawn independent haiku Tasks in PARALLEL.
Wait for Phase 1 to complete before Phase 2.

FOR Phase 2 (Code Implementation):

1. Select code implementation template based on model
2. For haiku-classified findings requiring code: use Sonnet (upgrade for safety)
3. Fill template with finding data
4. Spawn Task with:
   - subagent_type: "general-purpose"
   - model: "sonnet" or "opus" (never haiku for code)
   - prompt: "{filled_code_template}"

Spawn code Tasks SEQUENTIALLY to avoid conflicts.
</task_spawning>

### Step 6: Track Progress

<task>
Update TodoWrite as each Task completes.
</task>

<action_steps>

1. When Task returns success:
   - Mark corresponding finding as completed in TodoWrite
   - Note the model used, phase, and outcome
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

1. Count completed vs failed Tasks by phase
2. FOR EACH failed Task:
   - Log finding ID, phase, and error
   - Include in failure report
3. Calculate success rate per phase and overall
   </action_steps>

<output_format>
Completion status:

- Phase 1 (Documentation): X/Y resolved
- Phase 2 (Code): X/Y resolved
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

| Phase | Model  | Findings | Resolved | Failed |
| ----- | ------ | -------- | -------- | ------ |
| Docs  | haiku  | N        | X        | Y      |
| Docs  | sonnet | N        | X        | Y      |
| Docs  | opus   | N        | X        | Y      |
| Code  | sonnet | N        | X        | Y      |
| Code  | opus   | N        | X        | Y      |
| TOTAL |        | N        | X        | Y      |

### Resolved Findings

- {ID}: {Summary} ✅ [Phase {1|2}]

### Failed Findings (if any)

- {ID}: {Summary} - {error_reason} [Phase {1|2}]

### Cost Efficiency

- Estimated cost: $X.XX
- All-opus comparison: $Y.YY
- Savings: Z%

### Next Steps

IF all resolved:

- Run `/analyze-report-gaps-haiku-4-5` to verify no regressions
- Run `npm run lint` and `npm run test` to verify code changes
  ELSE:
- Review failed findings manually
- Re-run skill or address failures individually
  </output_format>

---

## Classification Reference

| Severity | Category           | Target Model | Code Impl? | Rationale                        |
| -------- | ------------------ | ------------ | ---------- | -------------------------------- |
| LOW      | Any                | haiku        | → sonnet   | Mechanical work, pattern-based   |
| MEDIUM   | Inconsistency      | haiku        | → sonnet   | Search/replace, cross-reference  |
| MEDIUM   | CoverageGap        | sonnet       | sonnet     | Requires implementation decision |
| MEDIUM   | Underspecification | sonnet       | sonnet     | Requires context synthesis       |
| HIGH     | Any                | opus         | opus       | Requires judgment, deep analysis |

**Note**: Haiku-classified findings that require code changes are upgraded to Sonnet for safety.

## Cost Estimation

| Phase     | Model  | Cost/Finding | Typical Count | Subtotal       |
| --------- | ------ | ------------ | ------------- | -------------- |
| Docs      | haiku  | $0.01-0.02   | 3-4           | $0.03-0.08     |
| Docs      | sonnet | $0.05-0.10   | 1-2           | $0.05-0.20     |
| Docs      | opus   | $0.50-1.00   | 1             | $0.50-1.00     |
| Code      | sonnet | $0.08-0.15   | 1-2           | $0.08-0.30     |
| Code      | opus   | $0.75-1.50   | 0-1           | $0.00-1.50     |
| **TOTAL** |        |              | ~9            | **$0.66-3.08** |

Compare: All findings on Opus = ~$4.50-9.00

## Why Haiku for Orchestration

| Aspect            | Why Haiku Works                      |
| ----------------- | ------------------------------------ |
| Parsing           | Reading markdown table is mechanical |
| Classification    | Scoring formula is explicit IF/ELSE  |
| Code detection    | Pattern matching on file extensions  |
| Template filling  | Mechanical substitution              |
| Task spawning     | Structured tool calls                |
| Progress tracking | Checklist updates                    |

The orchestrator does NOT need deep reasoning - it's a **dispatcher** that:

1. Parses structured input
2. Applies explicit rules
3. Detects code vs documentation needs
4. Generates structured output (Task calls)

## Example Usage

```bash
# In Claude Code CLI
/implement-reported-gaps

# Auto-detects from git branch: 002-accordion-component
# Reads: specs/002-accordion-component/gap-analysis-report.md
# Classifies 9 findings → 4 haiku, 3 sonnet, 2 opus
# Detects 2 findings require code changes
# Phase 1: Spawns Tasks for 7 documentation findings
# Phase 2: Spawns Tasks for 2 code implementation findings
# Reports completion with cost metrics
```

## Related Commands

- `/analyze-report-gaps-haiku-4-5` - Generates gap-analysis-report.md (run first)
- `/analyze-haiku-4-5` - Terminal-only analysis (no file output)
- `/speckit.analyze` - Sonnet-based analysis

## Success Criteria

After execution:

✅ **All findings classified** with correct target model
✅ **Code implementation needs detected** accurately
✅ **Phase 1 Tasks spawned** for documentation fixes
✅ **Phase 2 Tasks spawned** for code changes (with model upgrade for safety)
✅ **Progress tracked** via TodoWrite with phase indicators
✅ **Completion validated** with success/failure counts per phase
✅ **Summary generated** with cost metrics
✅ **No remediation documents created** - all fixes implemented directly
