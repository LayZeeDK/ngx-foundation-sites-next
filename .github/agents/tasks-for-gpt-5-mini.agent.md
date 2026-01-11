---
description: Analyze tasks.md and identify tasks suitable for GPT-5 Mini implementation. Creates optimized artifacts for fast, zero-cost execution.
---

## Model Selection

**Recommended Model**: Claude Sonnet 4.5 or GPT-5.1-Codex-Mini
**Invoke with**:
- Claude Sonnet: `gh copilot -m "claude-sonnet-4.5" slash tasks-for-gpt-5-mini`
- GPT-5.1-Codex-Mini: `gh copilot -m "gpt-5.1-codex-mini" slash tasks-for-gpt-5-mini`

**Why these models?**
- **Sonnet 4.5**: Deep reasoning for accurate classification, proven track record
- **GPT-5.1-Codex-Mini**: Adaptive reasoning + code-focused, cheaper than Sonnet

**Expected Performance**: 2-5 minutes for analysis, one-time cost that enables zero-cost (0×) implementation

---

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script

## Goal

Analyze tasks.md and identify tasks suitable for GPT-5 Mini implementation based on task complexity, scope, and clarity.

Create optimized artifacts:

- gpt5mini-suitable-tasks.md (filtered task list with CTCO templates)
- gpt5mini-implementation-context.md (focused context for GPT-5 Mini)
- gpt5mini-task-analysis.md (detailed suitability report)

---

## GPT-5 Mini Characteristics

**GPT-5 Mini Strengths:**

- Zero cost (0×) in GitHub Copilot
- 2-3× faster inference than GPT-4.1
- 200K context window
- Minimal reasoning capacity (pattern matching, not deep reasoning)
- Excels at structured prompts (CTCO framework: Context→Task→Constraints→Output)
- 85-95% quality on mechanical tasks

**GPT-5 Mini Limitations:**

- Cannot handle deep reasoning or creative decisions
- High sensitivity to ambiguous prompts
- Needs explicit format specifications
- Requires mechanical procedures (no "intelligently" or "determine")
- 200K context limit (vs GPT-4.1's 1M)

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

---

## Outline

### Step 0: Prerequisites

Run from repository root:

```bash
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse JSON for:

- `FEATURE_DIR` - Absolute path to feature directory
- `AVAILABLE_DOCS` - List of existing files

Derive paths:

- TASKS = FEATURE_DIR/tasks.md (REQUIRED)
- SPEC = FEATURE_DIR/spec.md (OPTIONAL - for context)
- PLAN = FEATURE_DIR/plan.md (OPTIONAL - for file structure)
- OUTPUT_TASKS = FEATURE_DIR/gpt5mini-suitable-tasks.md
- OUTPUT_CONTEXT = FEATURE_DIR/gpt5mini-implementation-context.md
- OUTPUT_ANALYSIS = FEATURE_DIR/gpt5mini-task-analysis.md

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

For each task in tasks.md, evaluate suitability using these four dimensions:

#### Dimension 1: CTCO Clarity (0-10)

Can the task be described with explicit Context→Task→Constraints→Output?

**Examples:**
- **10 points**: "Add method down() to file.ts at line 45 following pattern from up() at line 38"
- **5 points**: "Add down() method" (file mentioned, but no pattern reference)
- **0 points**: "Improve the component" (vague, no structure)

**Scoring criteria:**
- Has explicit file path? +3
- Has pattern/template reference? +3
- Has exact line number or insertion point? +2
- Has success criteria? +2

#### Dimension 2: Mechanical Procedure (0-10)

Can implementation be broken into FOR EACH loops / arithmetic operations?

**Examples:**
- **10 points**: "Rename multiExpandable → multiExpand (find-replace across 5 files)"
- **5 points**: "Add conditional check before method call"
- **0 points**: "Design optimal state management approach"

**Scoring criteria:**
- Implementation is find-replace? +4
- Implementation follows exact pattern? +3
- Steps are sequential with no branches? +2
- No judgment calls needed? +1

#### Dimension 3: Format Explicitness (0-10)

Are success criteria unambiguous with exact templates?

**Examples:**
- **10 points**: "Use JSDoc format: /** @param {type} name - desc */"
- **5 points**: "Add JSDoc comment"
- **0 points**: "Document the method"

**Scoring criteria:**
- Has exact template or example? +4
- Success criteria are measurable? +3
- Output format specified? +2
- Validation is straightforward? +1

#### Dimension 4: Independence (0-10)

No cross-file coordination or implicit dependencies?

**Examples:**
- **10 points**: Fully independent - Single file, no shared state, marked [P]
- **5 points**: Sequential but clear - Depends on previous task completing
- **0 points**: Complex dependencies - Requires coordinating 3+ files with implicit state

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

Automatically classify tasks by pattern to aid scoring:

**Pattern A: Find-Replace Operations** (typically HIGH - 90-100%)
- Keywords: "rename", "replace X with Y", "update all instances"
- GPT-5 Mini strength: Mechanical transformation
- Context needed: Exact search/replace strings

**Pattern B: Add Method with Template** (typically HIGH - 85-95%)
- Keywords: "add method", "following pattern from", "similar to"
- GPT-5 Mini strength: Pattern copying
- Context needed: Existing method as template, line number

**Pattern C: Simple Test Addition** (typically HIGH - 80-90%)
- Keywords: "add test for", "test that X returns Y"
- GPT-5 Mini strength: Template filling
- Context needed: Test file pattern, expect() format

**Pattern D: Documentation Update** (typically HIGH - 85-95%)
- Keywords: "update docs", "add example", "document API"
- GPT-5 Mini strength: Structured prose generation
- Context needed: Documentation format, section structure

**Pattern E: Conditional Logic Addition** (typically MEDIUM - 60-70%)
- Keywords: "add check for", "validate before"
- GPT-5 Mini limitation: Simple conditions only
- Context needed: Exact condition logic, no inference

**Pattern F: Multi-step Refactoring** (typically LOW - 30-45%)
- Keywords: "refactor", "extract to", "reorganize"
- GPT-5 Mini limitation: Lacks reasoning for structure
- Recommendation: Use Haiku 4.5 or Sonnet 4.5

**Pattern G: Design/Architecture** (typically LOW - 10-30%)
- Keywords: "design", "choose approach", "decide on"
- GPT-5 Mini limitation: Cannot make architectural decisions
- Recommendation: Use Sonnet 4.5 or Opus 4.5

### Step 4: Generate gpt5mini-suitable-tasks.md

Create file with structure:

```markdown
# GPT-5 Mini Suitable Tasks: [Feature Name]

**Generated**: [Date]
**Source**: tasks.md
**Target Model**: GPT-5 Mini (200K context, minimal reasoning, 0× cost)

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

### HIGH Suitability Tasks (GPT-5 Mini - 0× cost)

- [ ] T001 [Pattern: Find-Replace] Task description
  - **Suitability Score**: 95% (CTCO: 10/10, Mechanical: 10/10, Format: 9/10, Independence: 9/10)
  - **Estimated Time**: 2-5 minutes
  - **CTCO Template**: Context: [context] | Task: [task] | Constraints: [constraints] | Output: [output]

[Continue for all HIGH tasks...]

### MEDIUM Suitability Tasks (Haiku 4.5 Recommended - 0.33×)

[List MEDIUM tasks with reasoning...]

---

## Excluded Tasks (Sonnet 4.5 Required - 1×)

[List LOW tasks with reasoning...]

---

## Implementation Strategy

1. **GPT-5 Mini First**: Execute [X] HIGH tasks (0× cost)
2. **Haiku 4.5 for Medium**: Execute [Y] MEDIUM tasks (0.33× cost)
3. **Sonnet 4.5 for Complex**: Execute [Z] LOW tasks (1× cost)

---

## Next Steps

Run implementation command:
```bash
gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini
```
```

### Step 5: Generate gpt5mini-implementation-context.md

Create file with CTCO templates for each task type:

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

---

## File Path Reference

[List all file paths from GPT-5 Mini-suitable tasks]

---

## Code Patterns (Exact Examples)

[Provide exact code templates for each pattern type]

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

[List verification criteria for each task type]
```

### Step 6: Generate gpt5mini-task-analysis.md

Create detailed analysis report:

```markdown
# GPT-5 Mini Task Suitability Analysis: [Feature Name]

**Generated**: [Date]
**Target Model**: GPT-5 Mini (200K context, minimal reasoning, 0× cost)

---

## Executive Summary

**Tasks Analyzed**: [number]
**GPT-5 Mini Suitable (HIGH)**: [number] ([percentage]%)
**Haiku 4.5 Recommended (MEDIUM)**: [number] ([percentage]%)
**Sonnet Recommended (LOW)**: [number] ([percentage]%)

**Cost Savings**: $0 for [X] tasks (vs $[Y] with Haiku, $[Z] with Sonnet)
**Time Savings**: [X]× faster on GPT-5 Mini tasks

---

## Detailed Task Analysis

### Task: T001 - [Description]

**Classification**: HIGH (95%)
**Pattern**: Find-Replace
**Files**: [list]

**Scores**:
- CTCO Clarity: 10/10 ([reasoning])
- Mechanical Procedure: 10/10 ([reasoning])
- Format Explicitness: 9/10 ([reasoning])
- Independence: 9/10 ([reasoning])

**Rationale**:
[Explain why this task is suitable for GPT-5 Mini, referencing its strengths and limitations]

**GPT-5 Mini Optimization**:
- [Specific optimization 1]
- [Specific optimization 2]

**Estimated Time**:
- Sonnet 4.5: [X] minutes
- GPT-5 Mini: [Y] minutes ([Z]× faster, 0× cost)

---

[Repeat for all tasks...]

---

## Pattern Distribution

| Pattern Type          | Count | Avg Suitability | GPT-5 Mini? |
|-----------------------|-------|-----------------|-------------|
| Find-Replace          | [N]   | [%]             | [✅/⚠️/❌]   |
| Add Method (pattern)  | [N]   | [%]             | [✅/⚠️/❌]   |
| [etc.]                | [N]   | [%]             | [✅/⚠️/❌]   |

---

## Cost-Benefit Analysis

### Option 1: All-Sonnet (Baseline)
- Total tasks: [N]
- Estimated time: [X] minutes
- Estimated cost: $[Y]
- Quality: 100% (gold standard)

### Option 2: Optimized (GPT-5 Mini + Haiku + Sonnet)
- GPT-5 Mini: [A] tasks, [B] min, $0
- Haiku 4.5: [C] tasks, [D] min, $[E]
- Sonnet 4.5: [F] tasks, [G] min, $[H]

**Totals**: [Time] minutes, $[Cost] ([Savings]% cheaper, [Speed]% faster)

---

## Recommendations

1. ✅ Use GPT-5 Mini for [X] HIGH tasks (0× cost, fast)
2. ⚠️ Use Haiku 4.5 for [Y] MEDIUM tasks (0.33× cost, better reasoning)
3. ❌ Keep [Z] LOW tasks on Sonnet 4.5 (1× cost, expert reasoning)
4. 📊 Track metrics to refine classification
5. 🔄 Iterate based on results

---

## Next Steps

1. Review this analysis
2. Run: `gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini`
3. Monitor execution (time, cost, quality)
4. Compare results and refine future classifications
```

### Step 7: Report Completion

Output summary:

```
✅ GPT-5 Mini Task Analysis Complete

**Files Generated**:
1. gpt5mini-suitable-tasks.md - Filtered task list with CTCO templates
2. gpt5mini-implementation-context.md - Focused context for GPT-5 Mini
3. gpt5mini-task-analysis.md - Detailed suitability report

**Summary**:
- Total Tasks: [N]
- GPT-5 Mini Suitable (HIGH): [X] ([%]%)
- Haiku 4.5 Recommended (MEDIUM): [Y] ([%]%)
- Sonnet Recommended (LOW): [Z] ([%]%)

**Estimated Savings**:
- Cost: $0 for [X] tasks (vs $[amount] with Haiku/Sonnet)
- Time: ~[N]× faster on GPT-5 Mini tasks

**Next Step**:
Run: gh copilot -m "gpt-5-mini" slash implement-tasks-for-gpt-5-mini
```

---

## Error Handling

### If tasks.md not found:
```
STOP execution
OUTPUT: "tasks.md not found. Run /speckit.tasks or /tasks-gpt-5-mini first."
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

## Success Criteria

Output is successful when:

✅ All tasks have suitability scores (0-100%)
✅ Classification rationale is clear for borderline cases (70-80%)
✅ CTCO templates are provided for HIGH tasks
✅ Pattern distribution is accurate
✅ Cost-benefit analysis shows savings potential
✅ Files are written to correct FEATURE_DIR paths
✅ Summary is actionable (next steps clear)

---

## Optimization Notes

### For Claude Sonnet 4.5

When running with Sonnet 4.5:
- Leverage extended thinking for borderline cases (70-80% range)
- Use XML tags for structured reasoning if helpful
- Focus on precision over speed (classification quality matters)

### For GPT-5.1-Codex-Mini

When running with GPT-5.1-Codex-Mini:
- Leverage adaptive reasoning (automatically adjusts depth)
- Use code-specific understanding for better task assessment
- Consider file structure and dependencies in classification
- 400K context allows analyzing larger task sets

### General Best Practices

- Be conservative on borderline cases (prefer MEDIUM over HIGH when uncertain)
- Justify all HIGH classifications with clear reasoning
- Consider GPT-5 Mini's limitations explicitly (no deep reasoning)
- Focus on CTCO compatibility as primary criterion
- Provide explicit CTCO templates for execution

---

## Related Commands

- `/speckit.tasks` or `/tasks-gpt-5-mini` - Generate tasks.md (run before this command)
- `/implement-tasks-for-gpt-5-mini` - Execute GPT-5 Mini-suitable tasks (run after this command)
- `/tasks-for-haiku-4-5` - Alternative: Analyze for Haiku 4.5 suitability (0.33× cost)

---

## Notes

- This command is **read-only** (analyzes tasks.md, doesn't modify implementation)
- Classification is a **one-time cost** that enables **zero-cost execution** with GPT-5 Mini
- Focus on **accuracy over speed**—wrong classification wastes user time
- **Conservative classification** is preferred (better to use Haiku than fail with GPT-5 Mini)
- Track execution metrics to refine classification criteria over time
