---
name: implement-reported-gaps
description: Execute gap fixes from gap-analysis-report.md with automatic model selection based on finding complexity. Optimized for Sonnet 4.5 orchestration with extended thinking, parallel context loading, and intelligent routing to haiku/sonnet/opus workers. Includes two-phase execution for documentation and code implementation.
model_override: claude-sonnet-4-5
handoffs:
  - label: Re-analyze Gaps
    agent: analyze-report-gaps-haiku-4-5
    prompt: Run gap analysis again to verify fixes
---

# Gap Implementation Orchestrator

Execute gap fixes from `gap-analysis-report.md` with automatic model selection based on finding complexity. This skill implements a **smart dispatcher pattern** optimized for Sonnet 4.5 with **two-phase execution**:

1. **Phase 1**: Documentation resolution (spec.md, plan.md, tasks.md)
2. **Phase 2**: Code implementation (when findings require source code changes)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               /implement-reported-gaps (Sonnet 4.5)             │
│                      Orchestrator Skill                         │
│           Extended Thinking + Parallel Context Loading          │
│                                                                 │
│  1. Read context in parallel (gap-report + spec + tasks)        │
│  2. Parse findings table → extract ID, Severity, Category       │
│  3. Classify with extended thinking → assign target model       │
│  3.5. Detect code implementation + complexity scoring           │
│  4. Generate model-optimized prompts for each finding           │
│  5. Spawn Task agents (dependency-aware batching)               │
│  6. Track progress with adaptive retry reasoning                │
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

<sonnet_optimization>
This skill is optimized for Sonnet 4.5's capabilities:

- **Parallel tool use**: Load multiple files in single tool batch (5-20x faster)
- **Extended thinking**: Use 4K-8K budgets for nuanced classification decisions
- **Reasoning-enhanced batching**: Analyze file dependencies before spawning tasks
- **Adaptive retry**: Diagnose failures before deciding retry strategy
  </sonnet_optimization>

### Step 1: Auto-Detect Feature Directory and Load Context

<task>
Locate feature directory and load all context files in parallel.
</task>

<phase name="setup" parallel_tools="true">
Execute these operations in parallel:

1. Run: `git branch --show-current` to get feature name
2. Once FEATURE_DIR is known, load these files SIMULTANEOUSLY:
   - `{FEATURE_DIR}/gap-analysis-report.md` (primary input)
   - `{FEATURE_DIR}/spec.md` (for requirement cross-references)
   - `{FEATURE_DIR}/tasks.md` (for existing task status)

**Why parallel**: Sonnet 4.5 can process multiple Read tool calls in one batch,
reducing context loading time from 3 sequential calls to 1 parallel batch.
</phase>

<output_format>
FEATURE_DIR: specs/{feature}
REPORT_PATH: specs/{feature}/gap-analysis-report.md
Context loaded: gap-analysis-report.md, spec.md, tasks.md
</output_format>

### Step 2: Parse Gap Report with Context Awareness

<task>
Parse findings table with awareness of spec requirements and existing tasks.
</task>

<action_steps extended_thinking="4K">

1. Find table starting with `| ID  | Category` in gap-analysis-report.md
2. FOR EACH row in table:
   - Extract: ID, Category, Severity, Location(s), Summary, Recommendation
   - Cross-reference Location with spec.md to understand requirement context
   - Check tasks.md to see if related tasks already exist
   - Store as structured finding object with enriched context
3. Count findings by severity: HIGH, MEDIUM, LOW

**Extended thinking**: Use this budget to identify:

- Findings that reference the same spec requirements
- Findings that might conflict if resolved in parallel
- Findings where spec context changes the apparent complexity
  </action_steps>

<output_format>
Parsed N findings:

- HIGH: X findings (IDs: ...)
- MEDIUM: Y findings (IDs: ...)
- LOW: Z findings (IDs: ...)

Context enrichment:

- Findings referencing same spec section: [groups]
- Potential conflicts detected: [if any]
  </output_format>

### Step 3: Classify Findings → Target Model (with Extended Thinking)

<task>
Apply classification with reasoning to assign optimal target model for each finding.
</task>

<classification_strategy extended_thinking="4K">
FOR EACH finding:

**Base severity rules**:

- IF severity == "LOW": base_model = "haiku"
- ELSE IF severity == "MEDIUM" AND category IN ["Inconsistency"]: base_model = "haiku"
- ELSE IF severity == "MEDIUM": base_model = "sonnet"
- ELSE IF severity == "HIGH": base_model = "opus"

**Complexity scoring** (use extended thinking to evaluate):
Calculate complexity_score (0-10) based on:

- Cross-file impact mentioned in Recommendation? → +2 points
- Requires understanding Angular patterns? → +2 points
- Involves error handling strategy? → +1 point
- Requires new class/interface design? → +3 points
- Multiple locations mentioned? → +1 point
- Recommendation is vague/underspecified? → +2 points

**Model adjustment**:

- IF base_model == "haiku" AND complexity_score >= 4: upgrade to "sonnet"
- IF base_model == "sonnet" AND complexity_score >= 7: upgrade to "opus"
- IF base_model == "opus" AND complexity_score <= 3: consider "sonnet" (cost savings)

**Document reasoning** for non-obvious classifications:

- Why was model upgraded/downgraded?
- What complexity factors influenced the decision?
  </classification_strategy>

<output_format>
Classification results:

- haiku tasks: [IDs] (N findings)
- sonnet tasks: [IDs] (N findings)
- opus tasks: [IDs] (N findings)

Classification reasoning (for non-obvious decisions):

- {ID}: Upgraded from {base} to {final} because {reason}
  </output_format>

### Step 3.5: Detect Code Implementation Requirements (with Complexity Scoring)

<task>
Determine which findings require source code changes vs documentation-only changes.
For code changes, assess complexity to determine optimal model routing.
</task>

<sonnet_advantage>
Sonnet 4.5 can reason about code complexity better than mechanical pattern matching.
Use extended thinking (4K) to evaluate:

- Is the code change truly mechanical, or does it require understanding context?
- Will this change affect other files that aren't mentioned?
- Does the recommendation assume knowledge that needs to be discovered?
  </sonnet_advantage>

<detection_rules>
FOR EACH finding:
requiresCodeImplementation = FALSE
isHaikuSafeCodeChange = FALSE

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

<haiku_safe_code_criteria>
IF requiresCodeImplementation == TRUE AND model == "haiku":
// Check if Haiku can safely handle this code change
isHaikuSafeCodeChange = TRUE IF ALL of these conditions are met:

1. **Remediation doc exists** with exact code to insert:
   - Check for {FEATURE_DIR}/{ID}-REMEDIATION.md file
   - OR Recommendation contains verbatim code block (`typescript...`)

2. **Single-file change**:
   - Location references exactly ONE source file
   - No cross-file coordination needed

3. **Single-location change**:
   - Location specifies a single line number or small range (≤10 lines)
   - Not "multiple locations" or "throughout the file"

4. **Additive only**:
   - Recommendation uses words: "add", "insert", "include"
   - NOT modifying existing logic: "change", "modify", "replace", "refactor"

5. **No new imports needed** OR import explicitly specified:
   - Code uses only existing dependencies
   - OR Recommendation explicitly states the import to add

IF any condition is NOT met:
isHaikuSafeCodeChange = FALSE → upgrade to Sonnet
</haiku_safe_code_criteria>

<output_format>
Code implementation detection:

- Documentation-only: [IDs] (N findings) → Phase 1
- Requires code changes: [IDs] (N findings) → Phase 2
  - Haiku-safe (mechanical): [IDs] (N findings) → haiku
  - Requires reasoning: [IDs] (N findings) → sonnet/opus (upgraded if needed)

Complexity reasoning (for code changes):

- {ID}: complexity_score={N}, model={final} because {reason}
  - Example: "E01: complexity_score=3, model=haiku because exact code provided in recommendation"
  - Example: "E02: complexity_score=6, model=sonnet because requires understanding Angular DI patterns"
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

#### Code Implementation Prompt Template (Haiku - Mechanical Insertions)

<code_implementation_template_haiku>
FOR findings with requiresCodeImplementation=TRUE AND isHaikuSafeCodeChange=TRUE, use Haiku with this template:

**Haiku 4.5 Code Optimizations Applied:**

- XML tags for explicit structure boundaries
- Step-bounded actions (exactly 4 steps)
- Exact code provided (no generation needed)
- Verification checklist
- Anti-goals to prevent scope creep

```xml
<role>
You are a code insertion assistant. Your task is to insert exact code at a specific location.
Output: File edits only. No explanations.
</role>

<task>
Insert code for finding {ID}: {Summary}
</task>

<source_file>
Path: {file_path}
Location: line {line_number}
</source_file>

<exact_code_to_insert>
{exact_code}
</exact_code_to_insert>

<action_steps>
Execute EXACTLY these steps:
1. Read {file_path} lines {line_number - 5} to {line_number + 10} to see context
2. Identify the exact insertion point matching the code block in context
3. Use Edit tool with:
   - old_string: the existing code block where insertion goes
   - new_string: existing code + inserted code (preserve indentation)
4. Verify edit succeeded (no error returned)
</action_steps>

<constraints>
- Insert ONLY the exact code provided above
- Do NOT modify any other code
- Do NOT add comments beyond what's in the exact code
- Do NOT change indentation of surrounding code
- Maximum 1 Edit operation
</constraints>

<success_criteria>
- [ ] Edit tool returned success
- [ ] Code inserted at correct location
- [ ] Surrounding code unchanged
- [ ] Indentation matches context
</success_criteria>

<anti_goals>
- Do NOT explain what you're doing
- Do NOT ask for confirmation
- Do NOT suggest improvements
- Do NOT create remediation documents
- Do NOT add error handling beyond the exact code
</anti_goals>
```

REPLACE placeholders:

- {ID} = finding ID from table column 1
- {Summary} = finding Summary from table column 5
- {file_path} = source file path from Location
- {line_number} = line number from Location
- {exact_code} = verbatim code from remediation doc or Recommendation code block
  </code_implementation_template_haiku>

#### Code Implementation Prompt Template (Sonnet - Code Changes)

<code_implementation_template_sonnet>
FOR findings with requiresCodeImplementation=TRUE AND (model IN ["sonnet"] OR (model == "haiku" AND isHaikuSafeCodeChange=FALSE)), use Sonnet with this template:

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

#### Spawning Task Agents (Dependency-Aware Batching)

<task_spawning>

<sonnet_batching_strategy extended_thinking="4K">
**Before spawning, analyze file dependencies**:

1. Group findings by target file (extract from Location field)
2. Identify findings that modify the SAME file → must be sequential
3. Identify findings that modify DIFFERENT files → can be parallel
4. Maximum 10 concurrent Tasks per batch

**Batching logic**:

```
file_groups = group_findings_by_target_file(findings)
parallel_batch = []
sequential_queue = []

FOR EACH file, findings_for_file IN file_groups:
  IF len(findings_for_file) == 1:
    parallel_batch.append(findings_for_file[0])  # Safe to parallelize
  ELSE:
    sequential_queue.extend(findings_for_file)   # Must be sequential (same file)

# Spawn parallel batch (up to 10)
# Then process sequential queue one at a time
```

</sonnet_batching_strategy>

FOR Phase 1 (Documentation):

1. Select template based on target model
2. Fill template with finding data
3. Spawn Task with:
   - subagent_type: "general-purpose"
   - model: "{target_model}" (haiku, sonnet, or opus)
   - prompt: "{filled_template}"
   - run_in_background: true (for task isolation)

**Dependency-aware parallelism**:

- Findings targeting DIFFERENT files → spawn in parallel (up to 10 concurrent)
- Findings targeting SAME file → spawn sequentially (avoid edit conflicts)
- If parallel batch > 10: split into sub-batches of 10

Wait for Phase 1 to complete before Phase 2.

FOR Phase 2 (Code Implementation):

1. Select code implementation template based on model AND isHaikuSafeCodeChange:

   | Original Model | isHaikuSafeCodeChange | Use Template | Spawn Model |
   | -------------- | --------------------- | ------------ | ----------- |
   | haiku          | TRUE                  | Haiku Code   | haiku       |
   | haiku          | FALSE                 | Sonnet Code  | sonnet      |
   | sonnet         | -                     | Sonnet Code  | sonnet      |
   | opus           | -                     | Opus Code    | opus        |

2. Fill template with finding data
3. For Haiku code tasks: extract exact_code from remediation doc or Recommendation
4. Spawn Task with:
   - subagent_type: "general-purpose"
   - model: determined from table above
   - prompt: "{filled_code_template}"
   - run_in_background: true (for task isolation)

**Dependency-aware parallelism** (same logic as Phase 1):

- Code findings targeting DIFFERENT files → parallel (Haiku mechanical insertions)
- Code findings targeting SAME file → sequential (avoid conflicts)
- Sonnet/Opus code Tasks typically sequential due to complexity

**Task isolation**: Using `run_in_background: true` prevents cascading failures
where one Task error terminates all running Tasks.
</task_spawning>

### Step 6: Track Progress

<task>
Collect results from background Tasks and update TodoWrite.
</task>

<action_steps>

1. Since Tasks use `run_in_background: true`, collect results using TaskOutput:

   ```
   FOR EACH spawned Task:
     result = TaskOutput({
       task_id: task.id,
       block: true,      // Wait for completion
       timeout: 120000   // 2 minute timeout per task
     })
   ```

2. When Task returns success:
   - Mark corresponding finding as completed in TodoWrite
   - Note the model used, phase, and outcome

3. When Task returns failure:
   - Keep finding as in_progress
   - Apply retry pattern from Error Handling section
   - Note the error for reporting

4. Continue until all Tasks complete or max retries exceeded
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

## Error Handling

<error_handling>

### Adaptive Retry with Reasoning (Sonnet Enhancement)

<adaptive_retry extended_thinking="2K">
Sonnet 4.5 can reason about failures before deciding retry strategy.

FOR EACH spawned Task:
IF Task fails:

1. **Analyze failure** (use extended thinking):
   - What type of error occurred? (rate limit, timeout, bad request, other)
   - What was the task complexity? (LOW/MEDIUM/HIGH)
   - Is this a pattern? (multiple failures on same file/model?)
   - What's the likely root cause?

2. **Decide retry strategy based on analysis**:

   | Error Type        | Task Complexity | Strategy                                |
   | ----------------- | --------------- | --------------------------------------- |
   | 429 (rate limit)  | LOW             | Wait + retry (standard backoff)         |
   | 429 (rate limit)  | HIGH            | Consider model upgrade instead of retry |
   | Timeout           | Simple task     | Retry with same timeout                 |
   | Timeout           | Complex task    | Increase timeout, don't just retry      |
   | 400 (bad request) | Any             | Diagnose cause - may need prompt fix    |
   | 3+ failures       | Same file       | Escalate (likely file format issue)     |
   | 3+ failures       | Same model      | Consider model upgrade                  |

3. **Execute strategy**:
   - IF retrying: Wait 2^attempt \* 1000ms (max 32s) + jitter (±25%)
   - IF upgrading model: Regenerate prompt for new model, spawn new Task
   - IF escalating: Log diagnostic info, mark for manual review

4. **Max retries**: 3 per task (across all strategies)
   </adaptive_retry>

### Graceful Degradation

<fallback_strategy>
IF Task repeatedly fails on specified model:

1. Primary: Try with specified model
2. Fallback 1: If rate limited, wait with exponential backoff
3. Fallback 2: For haiku failures on complex tasks, upgrade to sonnet
4. Fallback 3: For sonnet failures on very complex tasks, consider opus
5. Final: Report failure with diagnostic reasoning (why each strategy failed)
   </fallback_strategy>

### Background Task Output Collection

Since Tasks use `run_in_background: true`, collect results using TaskOutput:

```
FOR EACH spawned Task:
  result = TaskOutput({
    task_id: task.id,
    block: true,      // Wait for completion
    timeout: 120000   // 2 minute timeout (adjust for complex tasks)
  })
  IF result.status == "success":
    Mark finding as resolved
  ELSE:
    Apply adaptive retry with reasoning
```

</error_handling>

---

## Known Issues and Workarounds

<known_issues>

### Issue: Model Parameter May Be Ignored (GitHub #12063)

**Problem**: Task tool's `model` parameter may be ignored, defaulting to the parent model regardless of specification.

**Impact**: Cost savings from model routing may not materialize if all Tasks run on the parent model.

**Workaround**:

- Monitor actual model usage via logs/metrics
- If cost savings aren't materializing, verify model selection
- Consider using custom subagents with explicit model configuration in `.claude/agents/`

**Reference**: [GitHub Issue #12063](https://github.com/anthropics/claude-code/issues/12063)

### Issue: Haiku MCP Tool Reference Error (GitHub #14863)

**Problem**: Haiku subagents fail with "tool_reference blocks not supported" when the parent has many MCP tools configured and MCP Tool Search is active.

**Cause**: MCP Tool Search returns `tool_reference` blocks that Haiku cannot process correctly.

**Workarounds**:

1. **Pre-load MCP tools before spawning Haiku Tasks**:

   ```
   Before spawning Haiku Task:
   1. Call MCPSearch to discover needed tools
   2. Ensure tools are loaded into context
   3. Spawn Haiku Task (tools now available without tool_reference)
   ```

2. **Upgrade to Sonnet for MCP-dependent operations**:

   ```
   IF finding requires MCP tools AND model == "haiku":
     Upgrade to sonnet for safety
   ```

3. **Use project-specific MCP configuration**:
   - Create `.mcp.json` with minimal servers for the project
   - Disable unused MCP servers

**Reference**: [GitHub Issue #14863](https://github.com/anthropics/claude-code/issues/14863)
**Documentation**: See [CLAUDE-CODE-MCP-SEARCH.md](../../../prompt-engineering/CLAUDE-CODE-MCP-SEARCH.md) for details

### Issue: Cascading Failures (GitHub #6594)

**Problem**: In some versions, one Task failure can terminate all running Tasks.

**Mitigation**: This skill uses `run_in_background: true` for all spawned Tasks, which provides isolation. Each Task runs independently and one failure doesn't affect others.

**Reference**: [GitHub Issue #6594](https://github.com/anthropics/claude-code/issues/6594)

### Issue: 10 Task Parallelism Cap

**Problem**: Claude Code limits concurrent Tasks to 10. Additional Tasks queue.

**Mitigation**: This skill batches findings into groups of 10 when count exceeds the limit.

</known_issues>

---

## Classification Reference

| Severity | Category           | Target Model | Code Model (if needed)      | Rationale                        |
| -------- | ------------------ | ------------ | --------------------------- | -------------------------------- |
| LOW      | Any                | haiku        | haiku (if safe) OR → sonnet | Mechanical work, pattern-based   |
| MEDIUM   | Inconsistency      | haiku        | haiku (if safe) OR → sonnet | Search/replace, cross-reference  |
| MEDIUM   | CoverageGap        | sonnet       | sonnet                      | Requires implementation decision |
| MEDIUM   | Underspecification | sonnet       | sonnet                      | Requires context synthesis       |
| HIGH     | Any                | opus         | opus                        | Requires judgment, deep analysis |

### Haiku-Safe Code Change Criteria

Haiku can handle code changes when ALL conditions are met:

| Criterion               | Requirement                                     | Example                                            |
| ----------------------- | ----------------------------------------------- | -------------------------------------------------- |
| **Exact code provided** | Remediation doc or code block in Recommendation | `this.#errorHandler.handleError(...)`              |
| **Single file**         | Location references ONE source file             | `accordion.ts:283` ✅, `accordion.ts + item.ts` ❌ |
| **Single location**     | One line/small range (≤10 lines)                | `line 283-288` ✅, `multiple locations` ❌         |
| **Additive only**       | Insert/add code, not modify logic               | `add call` ✅, `change behavior` ❌                |
| **No new imports**      | OR import explicitly specified                  | Uses existing `#errorHandler` ✅                   |

**If ANY criterion fails**: Upgrade haiku → sonnet for safety.

## Cost Estimation

### Orchestrator Cost (Sonnet 4.5)

| Component              | Cost           | Notes                                         |
| ---------------------- | -------------- | --------------------------------------------- |
| Context loading        | $0.01-0.02     | Parallel reads (gap-report, spec, tasks)      |
| Classification         | $0.02-0.03     | Extended thinking (4K) for complexity scoring |
| Task spawning          | $0.02-0.03     | Dependency analysis, prompt generation        |
| **Orchestrator Total** | **$0.05-0.08** | ~$0.03-0.05 more than Haiku orchestrator      |

### Spawned Task Costs

| Phase             | Model  | Cost/Finding | Overhead | Typical Count | Subtotal       |
| ----------------- | ------ | ------------ | -------- | ------------- | -------------- |
| Docs              | haiku  | $0.01-0.02   | +$0.01   | 3-4           | $0.06-0.12     |
| Docs              | sonnet | $0.05-0.10   | +$0.02   | 1-2           | $0.07-0.24     |
| Docs              | opus   | $0.50-1.00   | +$0.10   | 1             | $0.60-1.10     |
| Code              | haiku  | $0.02-0.03   | +$0.01   | 1-2           | $0.03-0.08     |
| Code              | sonnet | $0.08-0.15   | +$0.02   | 1-2           | $0.10-0.34     |
| Code              | opus   | $0.75-1.50   | +$0.10   | 0-1           | $0.00-1.60     |
| **Spawned Total** |        |              |          | ~9            | **$0.86-3.48** |

### Total Cost Summary

| Component     | Cost Range     | % of Total |
| ------------- | -------------- | ---------- |
| Orchestrator  | $0.05-0.08     | ~2-3%      |
| Spawned Tasks | $0.86-3.48     | ~97-98%    |
| **Total**     | **$0.91-3.56** |            |

**Note**: Each Task spawns with ~20K token overhead (~$0.01-0.10 depending on model).

**Comparison**:

- All findings on Opus = ~$4.50-9.00 (4-5x more expensive)
- Haiku orchestrator = ~$0.02-0.03 (saves ~$0.03-0.05, but MCP incompatible)

**Cost savings from Haiku code tasks**: ~$0.05-0.12 per finding (vs Sonnet upgrade)

## Why Sonnet for Orchestration

| Aspect                  | Sonnet Advantage                                                 |
| ----------------------- | ---------------------------------------------------------------- |
| **MCP Support**         | Full Tool Search compatibility (Haiku fails with tool_reference) |
| **Parallel Tools**      | 5-20x faster context loading via parallel Read/Glob calls        |
| **Extended Thinking**   | 4K-8K budgets for nuanced classification decisions               |
| **Complexity Scoring**  | Reasons about task complexity, not just pattern matching         |
| **Dependency Analysis** | Understands file dependencies for smarter batching               |
| **Adaptive Retry**      | Diagnoses failures before deciding retry strategy                |
| **Better Prompts**      | Generates richer, context-aware prompts for spawned tasks        |

The orchestrator benefits from Sonnet's reasoning capabilities:

1. **Parallel context loading**: Read gap-report + spec + tasks in one batch
2. **Nuanced classification**: Complexity scoring beyond IF/ELSE rules
3. **Dependency-aware batching**: Same-file findings spawn sequentially
4. **Adaptive error handling**: Reasons about failures before retry

**Cost impact**: ~$0.03-0.05 more per run (~1-3% of total), but:

- Eliminates MCP Tool Search failures (#14863)
- Faster execution via parallel tool use
- Better classification reduces rework

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
