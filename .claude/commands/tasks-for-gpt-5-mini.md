---
description: Analyze tasks.md and identify tasks suitable for GPT-5 Mini implementation. Creates optimized artifacts for fast, zero-cost execution.
---

## Model Selection

**Optimized For**: Claude Sonnet 4.5
**Expected Performance**: 2-5 minutes for analysis, one-time cost that enables zero-cost (0×) implementation

**Why Sonnet**: Task classification requires reasoning about complexity and suitability—Sonnet's deep reasoning ensures accurate classification that maximizes GPT-5 Mini's strengths while avoiding its limitations.

---

## Goal

<goal>
Analyze tasks.md and identify tasks suitable for GPT-5 Mini implementation based on:
- GPT-5 Mini's minimal reasoning capacity
- CTCO framework compatibility
- Mechanical procedure feasibility
- Format explicitness requirements

Create optimized artifacts:

- gpt5mini-suitable-tasks.md (filtered task list with CTCO templates)
- gpt5mini-implementation-context.md (focused context for GPT-5 Mini)
- gpt5mini-task-analysis.md (detailed suitability report)
  </goal>

## GPT-5 Mini Characteristics

<model_profile>
**GPT-5 Mini Strengths:**

- Zero cost (0×) in GitHub Copilot
- 2-3× faster inference than GPT-4.1
- 200K context window
- Minimal reasoning capacity (pattern matching, not deep reasoning)
- Excels at structured prompts (CTCO framework, XML scaffolding)
- 85-95% quality on mechanical tasks

**GPT-5 Mini Limitations:**

- Cannot handle deep reasoning or creative decisions
- High sensitivity to ambiguous prompts
- Needs explicit format specifications
- Requires mechanical procedures (no "intelligently" or "determine")
- 200K context limit (vs GPT-4.1's 1M or Sonnet's 1M)

**Optimal Task Characteristics:**

- ✅ CTCO-compatible (Context→Task→Constraints→Output structure)
- ✅ Mechanical procedures (FOR EACH loops, arithmetic scoring)
- ✅ Pattern-based implementations (follow existing code)
- ✅ Explicit formats (exact templates, word limits)
- ✅ Single-file edits with clear file paths
- ✅ Documentation updates with structure
- ✅ Simple test additions following patterns
- ✅ Find-replace operations
- ✅ Template filling

**Unsuitable Task Characteristics:**

- ❌ Architectural decisions or design trade-offs
- ❌ Multi-file refactoring with implicit dependencies
- ❌ Complex synthesis across multiple documents
- ❌ Creative problem-solving
- ❌ Ambiguous requirements needing clarification
- ❌ Tasks requiring >200K context
  </model_profile>

---

## Prerequisites

Run from repository root:

```bash
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON output for:**

- `FEATURE_DIR` - Absolute path to feature directory
- `AVAILABLE_DOCS` - List of existing files

**Derive paths:**

- `TASKS` = FEATURE_DIR/tasks.md (REQUIRED)
- `SPEC` = FEATURE_DIR/spec.md (OPTIONAL - for context)
- `PLAN` = FEATURE_DIR/plan.md (OPTIONAL - for file structure)
- `OUTPUT_TASKS` = FEATURE_DIR/gpt5mini-suitable-tasks.md
- `OUTPUT_CONTEXT` = FEATURE_DIR/gpt5mini-implementation-context.md
- `OUTPUT_ANALYSIS` = FEATURE_DIR/gpt5mini-task-analysis.md

---

## Analysis Workflow

<workflow>

### Step 1: Load Context Documents

Load in this order:

1. **tasks.md** (REQUIRED):
   - Parse all task phases
   - Extract task IDs, descriptions, file paths, markers
   - Identify dependencies and parallel opportunities

2. **spec.md** (OPTIONAL):
   - Load user stories for context
   - Understand feature requirements

3. **plan.md** (OPTIONAL):
   - Load tech stack and file structure
   - Understand project architecture

### Step 2: Classify Tasks Using 4-Dimension Scoring

For each task in tasks.md, score 0-10 on these dimensions:

#### Dimension 1: CTCO Clarity (0-10)

Can the task be described with explicit Context→Task→Constraints→Output?

- **10**: Perfect CTCO fit - "Add method down() to file.ts at line 45 following pattern from up() at line 38"
- **5**: Partial CTCO - "Add down() method" (file mentioned, but no pattern reference)
- **0**: No CTCO - "Improve the component" (vague, no structure)

**Scoring criteria:**

- Has explicit file path? +3
- Has pattern/template reference? +3
- Has exact line number or insertion point? +2
- Has success criteria? +2

#### Dimension 2: Mechanical Procedure (0-10)

Can implementation be broken into FOR EACH loops / arithmetic operations?

- **10**: Pure mechanical - "Rename multiExpandable → multiExpand (find-replace across 5 files)"
- **5**: Some logic - "Add conditional check before method call"
- **0**: Creative reasoning - "Design optimal state management approach"

**Scoring criteria:**

- Implementation is find-replace? +4
- Implementation follows exact pattern? +3
- Steps are sequential with no branches? +2
- No judgment calls needed? +1

#### Dimension 3: Format Explicitness (0-10)

Are success criteria unambiguous with exact templates?

- **10**: Exact template - "Use JSDoc format: /\*_ @param {type} name - desc _/"
- **5**: Format mentioned - "Add JSDoc comment"
- **0**: Format unclear - "Document the method"

**Scoring criteria:**

- Has exact template or example? +4
- Success criteria are measurable? +3
- Output format specified? +2
- Validation is straightforward? +1

#### Dimension 4: Independence (0-10)

No cross-file coordination or implicit dependencies?

- **10**: Fully independent - Single file, no shared state, marked [P]
- **5**: Sequential but clear - Depends on previous task completing
- **0**: Complex dependencies - Requires coordinating 3+ files with implicit state

**Scoring criteria:**

- Single file edit? +4
- No shared state? +3
- Marked [P] (parallel)? +2
- No implicit dependencies? +1

#### Calculate Suitability Score

```
total_score = ctco_clarity + mechanical_procedure + format_explicitness + independence
suitability_percentage = (total_score / 40) * 100
```

**Classification:**

- **HIGH** (≥75%): Perfect for GPT-5 Mini - fast, reliable, zero-cost
- **MEDIUM** (50-74%): Use Haiku 4.5 instead (better reasoning, worth 0.33×)
- **LOW** (<50%): Use Sonnet 4.5 (needs deep reasoning)

### Step 3: Detect Task Patterns

Automatically classify tasks by pattern:

<task_patterns>

**Pattern A: Find-Replace Operations** (HIGH - typically 90-100%)

- Keywords: "rename", "replace X with Y", "update all instances"
- GPT-5 Mini strength: Mechanical transformation
- Context needed: Exact search/replace strings

**Pattern B: Add Method with Template** (HIGH - typically 85-95%)

- Keywords: "add method", "following pattern from", "similar to"
- GPT-5 Mini strength: Pattern copying
- Context needed: Existing method as template, line number

**Pattern C: Simple Test Addition** (HIGH - typically 80-90%)

- Keywords: "add test for", "test that X returns Y"
- GPT-5 Mini strength: Template filling
- Context needed: Test file pattern, expect() format

**Pattern D: Documentation Update** (HIGH - typically 85-95%)

- Keywords: "update docs", "add example", "document API"
- GPT-5 Mini strength: Structured prose generation
- Context needed: Documentation format, section structure

**Pattern E: Conditional Logic Addition** (MEDIUM - typically 60-70%)

- Keywords: "add check for", "validate before"
- GPT-5 Mini limitation: Simple conditions only
- Context needed: Exact condition logic, no inference

**Pattern F: Multi-step Refactoring** (LOW - typically 30-45%)

- Keywords: "refactor", "extract to", "reorganize"
- GPT-5 Mini limitation: Lacks reasoning for structure
- Recommendation: Use Haiku 4.5 or Sonnet 4.5

**Pattern G: Design/Architecture** (LOW - typically 10-30%)

- Keywords: "design", "choose approach", "decide on"
- GPT-5 Mini limitation: Cannot make architectural decisions
- Recommendation: Use Sonnet 4.5 or Opus 4.5

</task_patterns>

### Step 4: Generate Artifacts

Create three output files:

1. **gpt5mini-suitable-tasks.md** - Filtered task list
2. **gpt5mini-implementation-context.md** - CTCO templates for execution
3. **gpt5mini-task-analysis.md** - Detailed classification report

</workflow>

---

## Output Structures

### Artifact 1: gpt5mini-suitable-tasks.md

<output_template_1>

````markdown
# GPT-5 Mini Suitable Tasks: [Feature Name]

**Generated**: [Date]
**Source**: tasks.md
**Target Model**: GPT-5 Mini (200K context, minimal reasoning, 0× cost)

**Optimization Strategy**: Zero-cost execution for mechanical, pattern-based tasks

---

## Task Summary

- **Total Tasks in tasks.md**: [number]
- **GPT-5 Mini Suitable (HIGH)**: [number] ([percentage]%)
- **Haiku 4.5 Recommended (MEDIUM)**: [number] ([percentage]%)
- **Sonnet Recommended (LOW)**: [number] ([percentage]%)

**Estimated Savings**:

- **Cost**: $0 for [number] HIGH tasks (vs $[amount] with Haiku)
- **Time**: ~[X]× faster than manual implementation

---

## Phase 1: [Phase Name]

**Overall Suitability**: [HIGH/MEDIUM/LOW]

### HIGH Suitability Tasks (GPT-5 Mini - 0× cost)

- [ ] T001 [Pattern: Find-Replace] Rename multiExpandable → multiExpand
  - **Suitability Score**: 95% (CTCO: 10/10, Mechanical: 10/10, Format: 9/10, Independence: 9/10)
  - **Estimated Time**: 2-5 minutes
  - **CTCO Template**: Context: 5 files need renaming | Task: Find-replace operation | Constraints: Preserve case sensitivity | Output: Updated files

- [ ] T002 [Pattern: Add Method] Add down() method following up() pattern
  - **Suitability Score**: 88% (CTCO: 9/10, Mechanical: 10/10, Format: 10/10, Independence: 7/10)
  - **Estimated Time**: 5-10 minutes
  - **CTCO Template**: Context: up() method exists at line 38 | Task: Copy and adapt for down() | Constraints: Same signature, opposite behavior | Output: New method at line 45

### MEDIUM Suitability Tasks (Haiku 4.5 Recommended - 0.33×)

- [ ] T015 [Pattern: Refactor] Extract validation logic to service
  - **Suitability Score**: 65% (CTCO: 7/10, Mechanical: 5/10, Format: 8/10, Independence: 6/10)
  - **Reason**: Needs light reasoning for extraction boundaries
  - **Haiku Advantage**: Better at structural changes

---

## Excluded Tasks (Sonnet 4.5 Required - 1×)

- [ ] T030 [LOW: 35%] Design state management approach
  - **Reason**: Architectural decision, requires trade-off analysis
  - **Sonnet Advantage**: Extended thinking, deep reasoning

---

## Implementation Strategy

1. **GPT-5 Mini First**: Execute [X] HIGH tasks in parallel (0× cost, [Y] minutes total)
2. **Haiku 4.5 for Medium**: Execute [Z] MEDIUM tasks (0.33× cost, [W] minutes)
3. **Sonnet 4.5 for Complex**: Hand off [N] LOW tasks (1× cost, expert reasoning)

**Expected Performance**:

- Total time: ~[X] minutes (vs [Y] minutes with all-Sonnet)
- Total cost: $0 for HIGH + $[amount] for MEDIUM/LOW
- Quality: 90-95% match with Sonnet on suitable tasks

---

## Next Steps

Run implementation command:

```bash
# Claude Code
/implement-tasks-for-gpt-5-mini

# GitHub Copilot
gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini
```
````

````
</output_template_1>

### Artifact 2: gpt5mini-implementation-context.md

<output_template_2>

```markdown
# GPT-5 Mini Implementation Context: [Feature Name]

**Purpose**: Provide minimal, focused context for GPT-5 Mini task execution

---

## CTCO Templates (Per Task Type)

### Template: Find-Replace Operation

**Context**: You have [N] files that need renaming from [old] to [new]
**Task**: Execute find-replace operation with exact string matching
**Constraints**:
- Preserve case sensitivity
- Only replace exact matches (not partial)
- Update imports/exports if needed
**Output**: Write updated files with all occurrences replaced

**Example**:
- Old: `multiExpandable`
- New: `multiExpand`
- Files: accordion.component.ts, accordion-item-def.ts, accordion.stories.ts

---

### Template: Add Method

**Context**: You have method [existing_method] at [file:line] as a pattern
**Task**: Create new method [new_method] following the same pattern
**Constraints**:
- Same signature structure (params, return type)
- Same JSDoc format
- Similar implementation (adapt behavior)
- Add at [line_number]
**Output**: Write file with new method added

**Example**:
- Existing: `up()` at accordion-item-def.ts:38
- New: `down()` at accordion-item-def.ts:45
- Pattern: `up()` sets `expanded.set(false)`, so `down()` sets `expanded.set(true)`

---

### Template: Add Test

**Context**: You have test file [file] with existing test pattern
**Task**: Add new test for [functionality]
**Constraints**:
- Follow existing play function structure
- Use userEvent for interactions
- Use expect() for assertions
- Test must pass
**Output**: Updated test file with new test case

**Example**:
- Test file: accordion.stories.ts
- Existing test: tests `up()` method
- New test: test `down()` method with same structure

---

## File Path Reference

**All file paths from GPT-5 Mini-suitable tasks:**

- packages/ngx-foundation-sites/src/lib/accordion/accordion.component.ts
- packages/ngx-foundation-sites/src/lib/accordion/accordion-item-def.ts
- packages/ngx-foundation-sites/src/lib/accordion/accordion.stories.ts
- [etc.]

---

## Code Patterns (Exact Examples)

### Pattern: Public Method

```typescript
/**
 * [Brief description]
 * @public
 */
methodName(): ReturnType {
  if (this.disabled()) return; // Check disabled state
  this.state.set(value); // Update state
}
````

### Pattern: Storybook Test

```typescript
export const StoryName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /pattern/ });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  },
};
```

---

## Constraints (CRITICAL)

- **NO** architectural changes beyond task scope
- **NO** creative decisions or "improvements"
- **FOLLOW** existing patterns exactly
- **PRESERVE** code style and formatting
- **VERIFY** TypeScript compilation after each change
- **STOP** if task is ambiguous (report blocker)

---

## Success Criteria (Per Task Type)

**Add Method**:

- [ ] Method added with correct signature
- [ ] JSDoc comment follows format
- [ ] TypeScript compilation succeeds
- [ ] Method exported if needed

**Add Test**:

- [ ] Test added to correct story
- [ ] Test uses userEvent for interactions
- [ ] Test uses expect() for assertions
- [ ] Test passes in Storybook

**Find-Replace**:

- [ ] All occurrences replaced
- [ ] Case sensitivity preserved
- [ ] No partial matches replaced
- [ ] TypeScript compilation succeeds

````
</output_template_2>

### Artifact 3: gpt5mini-task-analysis.md

<output_template_3>

```markdown
# GPT-5 Mini Task Suitability Analysis: [Feature Name]

**Generated**: [Date]
**Analyzer**: Claude Sonnet 4.5
**Target Model**: GPT-5 Mini (200K context, minimal reasoning, 0× cost)

---

## Executive Summary

**Tasks Analyzed**: [number]
**GPT-5 Mini Suitable (HIGH)**: [number] ([percentage]%)
**Haiku 4.5 Recommended (MEDIUM)**: [number] ([percentage]%)
**Sonnet Recommended (LOW)**: [number] ([percentage]%)

**Cost Savings**:
- $0 for [X] GPT-5 Mini tasks (vs $[Y] with Haiku, $[Z] with Sonnet)
- ROI: This analysis cost $[amount], saves $[amount] on execution

**Time Savings**:
- [X]× faster on GPT-5 Mini tasks (2-5 min vs 5-10 min with Sonnet)

---

## Detailed Task Analysis

### Task: T001 - Rename multiExpandable → multiExpand

**Classification**: HIGH (95%)
**Pattern**: Find-Replace
**Files**: 5 files (accordion.component.ts, accordion-item-def.ts, etc.)

**Scores**:
- CTCO Clarity: 10/10 (exact search/replace strings, all files listed)
- Mechanical Procedure: 10/10 (pure find-replace, no branching)
- Format Explicitness: 9/10 (case sensitivity specified)
- Independence: 9/10 (no dependencies, can run first)

**Rationale**:
This is a perfect GPT-5 Mini task. Find-replace operations are purely mechanical—no reasoning required. GPT-5 Mini can handle this with CTCO structure:
- Context: 5 files need renaming
- Task: Replace all instances of multiExpandable with multiExpand
- Constraints: Preserve case, exact matches only
- Output: Updated files

**GPT-5 Mini Optimization**:
- Provide explicit file list (no searching)
- Specify exact strings (no inference)
- Include case sensitivity rule
- Verify with TypeScript compilation

**Estimated Time**:
- Sonnet 4.5: 3-5 minutes
- GPT-5 Mini: 2-3 minutes (1.5× faster, 0× cost)

---

[Repeat for each task...]

---

## Pattern Distribution

| Pattern Type          | Count | Avg Suitability | GPT-5 Mini? |
|-----------------------|-------|-----------------|-------------|
| Find-Replace          | 3     | 95%             | ✅ Yes      |
| Add Method (pattern)  | 8     | 88%             | ✅ Yes      |
| Add Test (pattern)    | 5     | 85%             | ✅ Yes      |
| Update Docs           | 4     | 92%             | ✅ Yes      |
| Conditional Logic     | 6     | 62%             | ⚠️ Haiku    |
| Refactor              | 3     | 45%             | ❌ Sonnet   |
| Architecture          | 2     | 28%             | ❌ Sonnet   |

---

## Cost-Benefit Analysis

### Option 1: All-Sonnet (Baseline)

- Total tasks: [N]
- Estimated time: [X] minutes
- Estimated cost: $[Y]
- Quality: 100% (gold standard)

### Option 2: Optimized (GPT-5 Mini + Haiku + Sonnet)

- GPT-5 Mini tasks: [A] (HIGH suitability)
  - Time: [B] minutes
  - Cost: $0
- Haiku 4.5 tasks: [C] (MEDIUM suitability)
  - Time: [D] minutes
  - Cost: $[E]
- Sonnet 4.5 tasks: [F] (LOW suitability)
  - Time: [G] minutes
  - Cost: $[H]

**Totals**:
- Time: [B+D+G] minutes (vs [X] minutes) → [percentage]% faster
- Cost: $[E+H] (vs $[Y]) → [percentage]% cheaper
- Quality: 90-95% on GPT-5 Mini tasks, 100% on others

---

## Recommendations

1. ✅ **Use GPT-5 Mini for [X] HIGH tasks** (0× cost, 2-5× speedup)

2. ⚠️ **Use Haiku 4.5 for [Y] MEDIUM tasks** (0.33× cost, better reasoning)

3. ❌ **Keep [Z] LOW tasks on Sonnet 4.5** (1× cost, expert reasoning)

4. 📊 **Track metrics** to refine classification:
   - GPT-5 Mini execution time vs estimates
   - Quality (tests passing, rework needed)
   - Cost savings vs estimates

5. 🔄 **Iterate** based on results:
   - If GPT-5 Mini excels on MEDIUM tasks, lower threshold
   - If GPT-5 Mini struggles on certain HIGH patterns, adjust scoring

---

## Next Steps

1. **Review this analysis** - validate classifications
2. **Run GPT-5 Mini execution**: `/implement-tasks-for-gpt-5-mini`
3. **Monitor execution** - track time, cost, quality
4. **Compare results** - refine future classifications
````

</output_template_3>

---

## Extended Thinking Configuration

<extended_thinking>

**Budget**: 4K-8K tokens (moderate reasoning)

**When to use extended thinking:**

1. Analyzing ambiguous task descriptions
2. Determining pattern fit for edge cases
3. Assessing implicit dependencies
4. Justifying classification borderline cases (70-80% range)

**Prompt snippet:**

```xml
<thinking budget="6K">
For ambiguous tasks, use extended thinking to:
1. Analyze multiple interpretations
2. Assess CTCO compatibility
3. Consider GPT-5 Mini limitations
4. Justify final classification
</thinking>
```

</extended_thinking>

---

## Path Grounding

<path_protocol>

**CRITICAL**: Do **not** guess or "fix up" filesystem paths.

**Rules**:

1. Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
2. Use paths verbatim (no normalization, no assumptions)
3. If required path missing/unclear, STOP and re-run prerequisite script
4. Never construct paths manually (always use script output)

**Example**:

```bash
# Run prerequisite
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks

# Parse JSON
{
  "FEATURE_DIR": "D:/projects/repo/specs/002-accordion",
  "AVAILABLE_DOCS": ["spec.md", "plan.md", "tasks.md"]
}

# Derive paths (do NOT guess)
TASKS = D:/projects/repo/specs/002-accordion/tasks.md  # From FEATURE_DIR + "tasks.md"
```

</path_protocol>

---

## Error Handling

### If tasks.md not found:

```
STOP execution
OUTPUT: "tasks.md not found. Run /speckit.tasks first."
EXIT
```

### If context exceeds 200K:

```
IF estimated_tokens > 180000:
  WARN: "Feature may exceed GPT-5 Mini's 200K context limit"
  SUGGEST: "Consider splitting feature or using GPT-4.1 (1M context)"
```

### If all tasks score LOW:

```
IF all_tasks_below_50_percent:
  OUTPUT: "No tasks suitable for GPT-5 Mini (all require reasoning)"
  RECOMMEND: "Use standard /speckit.implement with Sonnet 4.5"
```

---

## Notes

- This command uses **Sonnet 4.5's extended thinking** for accurate classification
- Classification is a **one-time cost** that enables **zero-cost execution** with GPT-5 Mini
- Focus on **precision over speed**—wrong classification reduces GPT-5 Mini benefits
- **Justify borderline cases** (70-80% range) with extended thinking
- **Be conservative**—when in doubt, classify as MEDIUM (Haiku) rather than HIGH (GPT-5 Mini)

---

## Related Commands

- `/speckit.tasks` - Generate tasks.md (run before this command)
- `/implement-tasks-for-gpt-5-mini` - Execute GPT-5 Mini-suitable tasks (run after this command)
- `/tasks-for-haiku-4-5` - Alternative: Analyze for Haiku 4.5 suitability (0.33× cost)
