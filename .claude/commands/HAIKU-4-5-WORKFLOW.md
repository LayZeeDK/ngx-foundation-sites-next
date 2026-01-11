# Haiku 4.5 Workflow Guide

**Purpose**: Accelerate implementation using Claude Haiku 4.5's speed and cost advantages for suitable tasks.

**Performance**: 2-5× faster, 66% cheaper than Sonnet 4.5 on focused, bounded tasks.

---

## Overview

The Haiku 4.5 workflow adds intelligent task classification and execution optimization to the SpecKit workflow. It identifies which tasks can be executed faster and cheaper with Haiku 4.5 while maintaining quality.

### Key Benefits

| Benefit            | Details                                                        |
| ------------------ | -------------------------------------------------------------- |
| **Speed**          | 2-5× faster execution on suitable tasks                        |
| **Cost Savings**   | 66% cheaper ($1/$5 vs $3/$15 per 1M tokens)                    |
| **Quality**        | 90-95% of Sonnet performance on pattern-based tasks            |
| **ROI**            | Best for features with many mechanical tasks                   |
| **Risk Reduction** | Pre-classification ensures Haiku only gets tasks it can handle |

---

## Workflow Comparison

### Standard SpecKit Workflow (Sonnet Only)

```
/speckit.tasks → /speckit.implement (Sonnet 4.5)
                 ↓
                 All tasks executed with Sonnet
                 Time: 100% baseline
                 Cost: 100% baseline
```

### Haiku-Optimized Workflow (Hybrid)

```
/speckit.tasks → /tasks-for-haiku-4-5 (Sonnet analysis)
                 ↓
                 Task classification + focused context
                 ↓
                 ┌─────────────────────────────────────┐
                 │                                     │
                 ↓                                     ↓
         /implement-haiku-4-5              /speckit.implement
         (Haiku 4.5)                       (Sonnet 4.5)
         ↓                                 ↓
         HIGH/MEDIUM tasks                 LOW suitability tasks
         Time: 20-40% of baseline          Time: 100% baseline
         Cost: 33% of baseline             Cost: 100% baseline
                 ↓                                 ↓
                 └──────────────┬──────────────────┘
                                ↓
                        Feature Complete
                        Overall time: 40-70% of baseline
                        Overall cost: 50-80% of baseline
```

---

## Commands

### `/tasks-for-haiku-4-5`

**Purpose**: Analyze tasks and identify which are suitable for Haiku 4.5.

**Model**: Sonnet 4.5 (analysis requires reasoning)

**Input**: tasks.md (from `/speckit.tasks`)

**Output**:

- `haiku-suitable-tasks.md` - Filtered task list with suitability scores
- `haiku-implementation-context.md` - Focused context for Haiku execution
- `haiku-task-analysis.md` - Detailed analysis report

**Classification Criteria**:

| Suitability | Score  | Characteristics                            | Recommendation                  |
| ----------- | ------ | ------------------------------------------ | ------------------------------- |
| **HIGH**    | ≥75%   | Pattern-based, single-file, clear scope    | ✅ Use Haiku                    |
| **MEDIUM**  | 50-74% | Light reasoning, moderate scope            | ⚠️ Haiku with extended thinking |
| **LOW**     | <50%   | Complex reasoning, architectural decisions | ❌ Use Sonnet                   |

**Example HIGH Suitability Tasks**:

- Add method following existing pattern
- Rename variable across multiple files
- Add Storybook test from template
- Update documentation with examples

**Example LOW Suitability Tasks**:

- Design state management approach
- Refactor multi-file component hierarchy
- Implement complex error recovery logic
- Make architectural trade-off decisions

---

### `/implement-haiku-4-5`

**Purpose**: Execute Haiku-suitable tasks with Haiku 4.5 optimizations.

**Model**: Haiku 4.5 (fast, cost-effective execution)

**Input**: haiku-suitable-tasks.md, haiku-implementation-context.md

**Optimization Techniques**:

1. **Concise context loading** - Only focused patterns, not full spec
2. **Step-bounded reasoning** - 3-5 steps maximum per task
3. **Pattern-based execution** - Mechanical application of templates
4. **Extended thinking** - 2K-4K budget for MEDIUM tasks
5. **Systematic verification** - After each task, not batched

**Execution Patterns**:

| Pattern                  | Typical Time (Haiku) | Speedup vs Sonnet |
| ------------------------ | -------------------- | ----------------- |
| Add Method               | 1-2 minutes          | 2-3×              |
| Rename/Update            | 2-3 minutes          | 2×                |
| Add Test (Storybook)     | 3-5 minutes          | 2-3×              |
| Update Documentation     | 1-2 minutes          | 2-4×              |
| Refactor (with thinking) | 8-12 minutes         | 1.5-2×            |

**Output**:

- Implemented code changes
- Updated tracking documents
- Git commit with performance metrics
- Detailed performance report

---

## Usage Examples

### Example 1: Small Feature (Button Component)

**Scenario**: 47 tasks total, mostly pattern-based additions

**Step 1**: Generate tasks

```bash
/speckit.tasks
```

**Step 2**: Classify for Haiku

```bash
/tasks-for-haiku-4-5
```

**Result**:

- HIGH suitability: 32 tasks (68%)
- MEDIUM suitability: 8 tasks (17%)
- LOW suitability: 7 tasks (15%)

**Step 3**: Execute Haiku tasks

```bash
/implement-haiku-4-5
```

**Performance**:

- Haiku execution: 45 minutes (40 tasks)
- Estimated Sonnet: 120 minutes
- **Speedup: 2.7×**
- **Cost savings: $12.50 (66% on 40 tasks)**

**Step 4**: Execute remaining tasks

```bash
/speckit.implement
```

(Will skip already-completed tasks)

**Total Performance**:

- Combined time: 85 minutes (vs 180 minutes all-Sonnet)
- **Overall speedup: 2.1×**
- **Cost savings: $8.33 (overall 31%)**

---

### Example 2: Large Feature (Accordion Component)

**Scenario**: 127 tasks, mixed complexity

**Classification Results**:

- HIGH: 48 tasks (38%) - Add methods, tests, rename inputs
- MEDIUM: 35 tasks (28%) - Moderate refactoring, ErrorHandler integration
- LOW: 44 tasks (34%) - Deep link system, complex state management

**Haiku Execution**:

- HIGH tasks: 72 minutes
- MEDIUM tasks (with extended thinking): 195 minutes
- **Total Haiku: 267 minutes**

**Sonnet Execution** (LOW tasks):

- Complex tasks: 380 minutes

**If all Sonnet** (baseline):

- Estimated: 950 minutes (15.8 hours)

**Hybrid Performance**:

- Combined: 647 minutes (10.8 hours)
- **Speedup: 1.47×**
- **Cost savings: $35 (22%)**

**Why lower overall speedup?**

- Feature has high proportion (34%) of complex tasks requiring Sonnet
- Haiku still accelerates 66% of tasks significantly
- Cost savings focused on the parallelizable portion

---

### Example 3: Documentation-Heavy Feature

**Scenario**: API reference update, 89 tasks

**Classification Results**:

- HIGH: 78 tasks (88%) - Documentation updates, example additions
- MEDIUM: 8 tasks (9%) - Complex examples needing light reasoning
- LOW: 3 tasks (3%) - API design decisions

**Haiku Execution**:

- HIGH tasks: 95 minutes (avg 1.2 min/task)
- MEDIUM tasks: 48 minutes
- **Total Haiku: 143 minutes**

**Sonnet Execution** (LOW tasks):

- Design tasks: 45 minutes

**If all Sonnet** (baseline):

- Estimated: 534 minutes

**Hybrid Performance**:

- Combined: 188 minutes
- **Speedup: 2.8×**
- **Cost savings: $42 (66%)**

**Why high speedup?**

- Documentation tasks are ideal for Haiku (pattern-based, clear scope)
- 97% of tasks suitable for Haiku
- Maximum benefit from Haiku's speed advantage

---

## Decision Matrix: When to Use Haiku Workflow

### ✅ **Use Haiku Workflow When:**

1. **High proportion of mechanical tasks** (>50% pattern-based)
   - Method additions following clear patterns
   - Variable/property renames across files
   - Test additions from templates
   - Documentation updates

2. **Clear, bounded task scope**
   - Each task has explicit file paths
   - Acceptance criteria are unambiguous
   - Dependencies are well-defined

3. **Time is important**
   - Tight deadlines benefit from 2-5× speedup
   - Fast iteration needed

4. **Cost optimization is priority**
   - High-volume projects
   - Budget constraints
   - 66% savings adds up at scale

### ⚠️ **Consider Carefully When:**

1. **Mixed complexity** (30-50% complex tasks)
   - Hybrid workflow still beneficial but gains reduced
   - Need to manage two execution streams

2. **Novel implementation patterns**
   - No existing code to reference
   - Haiku may struggle without clear patterns

3. **First-time feature in codebase**
   - Architectural decisions needed upfront
   - May want Sonnet for consistency

### ❌ **Skip Haiku Workflow When:**

1. **High proportion of complex tasks** (>50% requiring reasoning)
   - Architectural design
   - Complex refactoring
   - Novel algorithms
   - Standard Sonnet workflow simpler

2. **Small task count** (<20 tasks)
   - Classification overhead not worth it
   - Use Sonnet directly

3. **Highly interconnected tasks**
   - Complex dependencies across tasks
   - Reasoning about global state
   - Sonnet handles coordination better

---

## Best Practices

### 1. Run Classification Early

```bash
# After generating tasks, immediately classify
/speckit.tasks
/tasks-for-haiku-4-5
```

**Benefit**: Understand task distribution before committing to approach.

### 2. Review Classification Results

Check `haiku-task-analysis.md` for:

- Task distribution (HIGH/MEDIUM/LOW percentages)
- Estimated time savings
- Cost savings projection

**Decision**: If <40% HIGH suitability, consider skipping Haiku workflow.

### 3. Execute Haiku Tasks First

```bash
# Haiku tasks first (fast, parallel where possible)
/implement-haiku-4-5

# Then Sonnet for complex tasks
/speckit.implement
```

**Benefit**: Quick wins first, momentum on feature progress.

### 4. Track Performance Metrics

After Haiku execution, note:

- Actual time vs estimates
- Speedup achieved
- Cost savings realized
- Quality (tests passing, compilation success)

**Benefit**: Refine future classifications based on real data.

### 5. Provide Feedback

Update `haiku-task-analysis.md` with:

- Tasks that were easier/harder than classified
- Patterns that work particularly well with Haiku
- Edge cases discovered

**Benefit**: Improve classification accuracy over time.

---

## Common Patterns and Performance

### Pattern A: Add Method/Property

**Haiku Performance**: ⭐⭐⭐⭐⭐ (Excellent)

- Avg time: 1-2 minutes
- Speedup: 2-3× vs Sonnet
- Reliability: 95%+

**Why Haiku excels**:

- Clear template from existing methods
- Bounded scope (single method)
- Verification straightforward (TypeScript compilation)

### Pattern B: Rename/Update

**Haiku Performance**: ⭐⭐⭐⭐ (Very Good)

- Avg time: 2-3 minutes
- Speedup: 2× vs Sonnet
- Reliability: 90%+

**Why Haiku excels**:

- Mechanical find-replace operation
- Clear success criteria (grep returns empty)
- Verification automated

### Pattern C: Add Test (Storybook)

**Haiku Performance**: ⭐⭐⭐⭐ (Very Good)

- Avg time: 3-5 minutes
- Speedup: 2-3× vs Sonnet
- Reliability: 85-90%

**Why Haiku excels**:

- Strong patterns from existing tests
- play function structure well-defined
- Clear assertions

**Watch out for**:

- Complex interactions (may need extended thinking)
- Novel assertion patterns

### Pattern D: Update Documentation

**Haiku Performance**: ⭐⭐⭐⭐⭐ (Excellent)

- Avg time: 1-2 minutes
- Speedup: 2-4× vs Sonnet
- Reliability: 95%+

**Why Haiku excels**:

- Pattern-based prose generation
- Code examples from existing docs
- Clear success criteria (markdown valid)

### Pattern E: Refactor (MEDIUM)

**Haiku Performance**: ⭐⭐⭐ (Good with Extended Thinking)

- Avg time: 8-12 minutes
- Speedup: 1.5-2× vs Sonnet
- Reliability: 75-85%

**Why Haiku is moderate**:

- Requires extended thinking (2K-4K budget)
- More complex reasoning needed
- Higher verification overhead

**Recommendation**: Use extended thinking budget, verify carefully.

---

## Troubleshooting

### Issue: Haiku Task Classification Too Conservative

**Symptom**: Only 20-30% tasks classified as HIGH suitability when many seem simple.

**Solution**:

1. Review `haiku-task-analysis.md` scoring details
2. Check if tasks lack clear file paths (reduces score)
3. Verify pattern recognition criteria
4. Manually adjust classification if confident

**Risk**: Haiku may struggle if classification is loosened too much.

---

### Issue: Haiku Execution Slower Than Expected

**Symptom**: Tasks taking 2-3× longer than estimates.

**Possible Causes**:

1. **Pattern mismatch**: No existing code to reference
2. **Hidden complexity**: Task description underspecified
3. **Context loading**: Too much context, slowing inference
4. **Extended thinking needed**: Task requires reasoning beyond mechanical

**Solution**:

- Check `haiku-implementation-context.md` for relevant patterns
- Consider moving task to Sonnet if repeatedly slow
- Update classification for similar future tasks

---

### Issue: Compilation/Test Failures After Haiku

**Symptom**: Tests fail or TypeScript doesn't compile.

**Diagnosis** (3-step):

1. Check pattern adherence - did Haiku follow template exactly?
2. Verify context - were all necessary patterns provided?
3. Review task scope - was task too complex for Haiku?

**Solution**:

- If pattern deviation: Fix manually, improve context for next time
- If context missing: Update `haiku-implementation-context.md`
- If complexity issue: Reclassify similar tasks as MEDIUM/LOW

---

### Issue: Task Classified LOW but Seems Simple

**Symptom**: Task like "Add input property" marked as LOW suitability.

**Possible Reasons**:

1. Missing file path in task description (reduces Scope Clarity score)
2. No existing pattern reference (reduces Pattern Recognition score)
3. Implicit dependencies (reduces Dependencies score)

**Solution**:

1. Check task description specificity
2. Add explicit file paths if missing
3. Reference existing patterns in context
4. Manually reclassify if justified

---

## Performance Expectations

### By Task Pattern

| Pattern                | Haiku Avg | Sonnet Avg | Speedup | Reliability |
| ---------------------- | --------- | ---------- | ------- | ----------- |
| Add Method             | 1.5 min   | 4 min      | 2.7×    | 95%         |
| Rename/Update          | 2.5 min   | 5 min      | 2×      | 90%         |
| Add Test (Storybook)   | 4 min     | 10 min     | 2.5×    | 87%         |
| Update Documentation   | 1.5 min   | 5 min      | 3.3×    | 95%         |
| Refactor (w/ thinking) | 10 min    | 18 min     | 1.8×    | 80%         |

### By Feature Complexity

| Feature Type               | Haiku Suitable | Expected Speedup | Cost Savings |
| -------------------------- | -------------- | ---------------- | ------------ |
| **UI Component (simple)**  | 70-80%         | 2-3×             | 50-60%       |
| **UI Component (complex)** | 40-50%         | 1.5-2×           | 25-35%       |
| **Documentation**          | 85-95%         | 2.5-3.5×         | 60-70%       |
| **API Implementation**     | 30-40%         | 1.3-1.7×         | 20-30%       |
| **Refactoring**            | 20-30%         | 1.2-1.5×         | 15-25%       |

### Overall Expectations

**Realistic targets**:

- **Speedup**: 1.5-2× on average features (depends on task mix)
- **Cost savings**: 25-40% on average features
- **Quality**: 90-95% match with Sonnet on suitable tasks

**Best case** (documentation-heavy, pattern-based):

- **Speedup**: 2.5-3×
- **Cost savings**: 60-70%

**Worst case** (complex, novel implementation):

- **Speedup**: 1.1-1.3×
- **Cost savings**: 10-20%

---

## Related Documentation

- **[CLAUDE-HAIKU-4-5-OPTIMIZATION.md](../prompt-engineering/CLAUDE-HAIKU-4-5-OPTIMIZATION.md)** - Comprehensive Haiku optimization techniques
- **[CLAUDE-4-5-OPTIMIZATION.md](../prompt-engineering/CLAUDE-4-5-OPTIMIZATION.md)** - General Claude 4.5 optimization strategies
- **[HAIKU-4-5-COMMAND-OPTIMIZATION-RECOMMENDATIONS.md](../prompt-engineering/HAIKU-4-5-COMMAND-OPTIMIZATION-RECOMMENDATIONS.md)** - Applying optimizations to commands
- **[SPECKIT_GUIDE.md](../SPECKIT_GUIDE.md)** - Complete SpecKit workflow documentation

---

## Appendix: Task Classification Scoring Algorithm

```python
def calculate_suitability(task):
    # Scope Clarity (0-10)
    scope_clarity = 0
    if task.has_explicit_file_path:
        scope_clarity += 5
    if task.has_clear_action_verb:
        scope_clarity += 3
    if task.has_acceptance_criteria:
        scope_clarity += 2

    # Complexity (0-10)
    complexity = 10  # Start at 10, deduct for complexity
    if task.requires_reasoning:
        complexity -= 5
    if task.has_conditional_logic:
        complexity -= 2
    if task.requires_algorithm_design:
        complexity -= 3

    # Dependencies (0-10)
    dependencies = 10  # Start at 10, deduct for dependencies
    if task.has_blocking_dependencies:
        dependencies -= 3
    if task.requires_multi_file_coordination:
        dependencies -= 4
    if task.has_implicit_dependencies:
        dependencies -= 3

    # Pattern Recognition (0-10)
    pattern_recognition = 0
    if task.has_existing_pattern_in_codebase:
        pattern_recognition += 5
    if task.follows_established_convention:
        pattern_recognition += 3
    if task.has_template_reference:
        pattern_recognition += 2

    # Calculate total score
    total_score = scope_clarity + complexity + dependencies + pattern_recognition
    suitability_percentage = (total_score / 40) * 100

    # Classify
    if suitability_percentage >= 75:
        return "HIGH", suitability_percentage
    elif suitability_percentage >= 50:
        return "MEDIUM", suitability_percentage
    else:
        return "LOW", suitability_percentage
```

---

**Last Updated**: 2026-01-11
**Version**: 1.0.0
**Maintainer**: SpecKit Team
