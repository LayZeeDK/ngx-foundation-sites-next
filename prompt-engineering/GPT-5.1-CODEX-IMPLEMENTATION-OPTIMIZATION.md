# GPT-5.1-Codex Implementation Optimization Guide

**Model**: GPT-5.1-Codex (400K context, adaptive reasoning)

**Purpose**: Optimize `/implement-gpt-5-1-codex` command for systematic code implementation with GPT-5.1-Codex's strengths

**Related Commands**: `/speckit.implement`, `/implement-sonnet-4-5`, `/implement-tasks-for-haiku-4-5`

**Note**: This guide documents **GPT-5.1-Codex** features. For GPT-5.1-Codex-Max (with compaction), see "Max-Only Features" section at end.

---

## Model Characteristics for Implementation

### GPT-5.1-Codex Implementation Strengths

1. **Adaptive Reasoning** - Automatically adjusts reasoning depth (no steering needed)
2. **400K Context Window** - 2x larger than Sonnet 4.5 (200K) and Haiku 4.5 (200K)
3. **Bias Toward Action** - Persists until tasks are fully handled end-to-end
4. **Engineering Quality Standards** - Optimizes for correctness, clarity, reliability over speed
5. **Multimodal Support** - Handles images/screenshots for UI development
6. **Tool Integration** - Built-in search, dependency installation, environment setup

**Sources**:

- [GPT-5.1 Codex Model | OpenAI API](https://platform.openai.com/docs/models/gpt-5.1-codex)
- [GPT-5-Codex Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide)
- [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide) - General Codex best practices

### Context Window Strategy

**Context Window**: **400K tokens** (standard)

| Feature          | Specification                           | Implementation Impact                     |
| ---------------- | --------------------------------------- | ----------------------------------------- |
| **Base Context** | 400K tokens (2x larger than Sonnet 4.5) | Can load larger features without chunking |
| **Max Output**   | 128K tokens                             | Large code generation supported           |

**Source**: [GPT-5.1 Codex Model | OpenAI API](https://platform.openai.com/docs/models/gpt-5.1-codex)

**For GitHub Copilot Users** (using GPT-5.1-Codex):

- **<400K tokens**: Standard workflow
- **>400K tokens**: Use progressive disclosure (chunk into phases)

**Note**: For tasks >400K tokens requiring automatic multi-window operation, use **GPT-5.1-Codex-Max** (see "Max-Only Features" section).

---

## Implementation-Specific Optimizations

### Optimization 1: Remove Guidance Rather Than Add It

**Research Finding**:

> "Because GPT-5-Codex was trained for optimal agentic coding, prompt tuning will more often mean removing guidance than adding it."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

#### Implementation Pattern

**❌ Over-Specified (Don't Do This)**:

```markdown
You are an implementation agent. Follow these steps:

1. First, read the tasks.md file carefully
2. Then, for each task, think about what it means
3. After thinking, decide if you need to write tests
4. If yes, write the tests first
5. Then implement the code
6. Then run the tests
7. If tests fail, fix them
8. Mark the task complete
9. Move to next task
10. Repeat until all tasks done
```

**✅ Minimal Guidance (Do This)**:

```markdown
Execute all tasks from tasks.md in order. Use TDD where specified. Mark tasks complete as you finish them.
```

**Why this works**:

- GPT-5.1-Codex-Max is trained on real-world software engineering workflows
- It already knows TDD patterns, test-first development, incremental progress
- Over-specification constrains its adaptive reasoning
- Minimal guidance lets it apply optimal approach per task

---

### Optimization 2: Adaptive Reasoning (No Steering Needed)

**Research Finding**:

> "Adaptive reasoning is now the default in GPT-5-Codex. GPT-5-Codex adjusts automatically: for a question like 'How do I undo the last commit but keep all changes staged?', it responds quickly without extra steering. For more complex coding tasks, it takes the time it needs and uses tools as appropriate."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

#### Implementation Pattern

**❌ Manual Reasoning Steering (Don't Do This)**:

```markdown
For simple tasks (T1.1, T1.2): Implement quickly without deep analysis
For complex tasks (T2.1, T2.2): Think deeply, consider edge cases, reason about architecture
```

**✅ Let Model Adapt (Do This)**:

```markdown
Execute tasks from tasks.md. The model will automatically adjust reasoning depth based on task complexity.
```

**Reasoning Effort Settings** (GPT-5.1-Codex):

| Setting    | Use Case                                | Latency     | Quality      | Availability    |
| ---------- | --------------------------------------- | ----------- | ------------ | --------------- |
| **Medium** | Daily driver (scaffolding, endpoints)   | Fast        | Balanced     | ✅ Codex        |
| **High**   | Complex refactors, deep debugging       | Slower      | Higher       | ✅ Codex        |
| **None**   | Simple queries (not for implementation) | Fastest     | Autocomplete | ✅ Codex        |
| ~~xHigh~~  | ~~Legacy pipelines, race conditions~~   | ~~Slowest~~ | ~~Highest~~  | ❌ **Max-Only** |

**Recommendation**: Use **Medium** for `/implement-gpt-5-1-codex` (balances speed & quality)

**Note**: **xHigh reasoning effort** is only available in GPT-5.1-Codex-Max (not GPT-5.1-Codex)

**Sources**:

- [GPT-5.1 Codex Model | OpenAI API](https://platform.openai.com/docs/models/gpt-5.1-codex) - Supports none, medium, high
- [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide) - General guidance

---

### Optimization 3: Bias Toward Action & Persistence

**Research Finding**:

> "Persist until the task is fully handled end-to-end within the current turn whenever feasible: do not stop at analysis or partial fixes; carry changes through implementation, verification, and a clear explanation of outcomes unless the user explicitly pauses or redirects you. Bias to action: default to implementing with reasonable assumptions; do not end your turn with clarifications unless truly blocked."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

#### Implementation Pattern

```markdown
<action_bias_instructions>

## Persistence Requirements

**Carry tasks to completion**:

- ✅ Implement the full task (not just analysis)
- ✅ Write tests AND implementation
- ✅ Run tests to verify
- ✅ Fix failures until passing
- ✅ Mark task complete in tasks.md
- ✅ Report clear outcome

**Do NOT stop at**:

- ❌ "I would implement X by doing Y" (implement it!)
- ❌ "The tests might fail because..." (run them and find out!)
- ❌ "You should consider..." (make the decision and proceed!)

**Only stop for clarification if**:

- Truly blocked (missing required information)
- Ambiguous requirement with multiple valid interpretations
- User explicitly asks to pause

## Reasonable Assumptions

**Make reasonable assumptions and proceed**:

- File locations (follow project conventions)
- Test naming (follow existing patterns)
- Import paths (analyze existing imports)
- Styling (match existing code style)

**Document assumptions made** in commit messages or comments.

</action_bias_instructions>
```

**Why this works**:

- GPT-5.1-Codex-Max can work autonomously for 24+ hours
- Bias toward action enables continuous progress
- Persistence ensures tasks are completed, not abandoned
- Reasonable assumptions prevent blocking on minor decisions

---

### Optimization 4: Engineering Quality Standards

**Research Finding**:

> "Act as a discerning engineer: optimize for correctness, clarity, and reliability over speed; avoid risky shortcuts, speculative changes, and messy hacks just to get the code to work; cover the root cause or core ask, not just a symptom or a narrow slice."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

#### Implementation Pattern

```markdown
<quality_standards>

## Engineering Principles

**Optimize for**:

- ✅ **Correctness** - Code works as specified
- ✅ **Clarity** - Easy to understand and maintain
- ✅ **Reliability** - Handles edge cases and errors
- ✅ **Root cause fixes** - Address underlying issues

**Avoid**:

- ❌ **Risky shortcuts** - Quick fixes that create tech debt
- ❌ **Speculative changes** - "Maybe this will work" approaches
- ❌ **Messy hacks** - Code that "just works" but is unmaintainable
- ❌ **Symptom fixes** - Addressing visible issue without fixing root cause

## Quality Checklist (Per Task)

Before marking task complete:

- [ ] Code is correct (meets spec requirements)
- [ ] Code is clear (follows project conventions, has JSDoc)
- [ ] Code is reliable (handles errors, edge cases from spec)
- [ ] Root cause addressed (not just surface-level fix)
- [ ] Tests pass and cover critical paths
- [ ] No messy hacks or speculative changes

</quality_standards>
```

**Why this works**:

- Prevents technical debt accumulation
- Ensures maintainable codebase
- Reduces need for future refactoring
- Aligns with professional engineering standards

---

### Optimization 5: Tool Usage Optimization

**Research Finding**:

> "When searching for text or files, prefer using `rg` or `rg --files` respectively because `rg` is much faster than alternatives like `grep`. If a tool exists for an action, prefer to use the tool instead of shell commands."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

#### Tool Preference Hierarchy

**For File Search**:

1. ✅ `rg --files` (fastest)
2. ⚠️ `find` (slower, but more flexible)
3. ❌ `ls -R` (slowest, avoid)

**For Content Search**:

1. ✅ `rg <pattern>` (fastest, supports regex)
2. ⚠️ `grep -r <pattern>` (slower)
3. ❌ Manual file-by-file search (slowest)

**For File Operations**:

- ✅ Use specialized tools when available (Grep tool, Glob tool, Read tool)
- ⚠️ Use shell commands only when tool doesn't exist
- ❌ Don't reinvent tools with bash scripts

**GitHub Copilot Context**:

- GitHub Copilot provides tools via `@workspace` agent
- Use `@workspace` commands for workspace-wide operations
- Prefer agent tools over manual bash commands

---

### Optimization 6: Progressive Disclosure for Large Features

**For GPT-5.1-Codex** (400K context limit without compaction):

When features exceed 400K tokens, use **progressive disclosure** strategy.

#### Implementation Pattern

```markdown
<progressive_disclosure_workflow>

## When to Use Progressive Disclosure

**For features >400K tokens** (GPT-5.1-Codex without compaction):

- Split into phases (Core → Directives → Integration)
- Implement and commit each phase separately
- Context resets between phases

**Note**: GPT-5.1-Codex-Max has compaction and doesn't need this

## Phase-Based Implementation

**Phase 1: Core Component** (load only core files)

- accordion.component.ts
- accordion.types.ts
- Basic tests

**Phase 2: Directives** (load directive files)

- accordion-item.directive.ts
- accordion-content.directive.ts
- Directive tests

**Phase 3: Integration** (load integration files)

- Styles
- Stories
- E2E tests

## State Preservation Strategy

**Use external state files** for cross-phase tracking:

1. **tasks.md** - Mark phases complete: `[X] Phase 1: Core`
2. **Git commits** - One commit per phase with task IDs
3. **IMPLEMENTATION_NOTES.md** - Document decisions between phases

## Best Practices

1. **Commit after each phase** (enables context reset)
2. **Mark phase tasks complete** in tasks.md
3. **Include phase number in commits** (Phase 1/3, Phase 2/3, etc.)
4. **Load ONLY necessary files per phase** (not full codebase)

</progressive_disclosure_workflow>
```

---

### Optimization 7: Reasoning Effort Configuration

**Research Finding**:

> "We recommend 'medium' reasoning effort as a good all-around interactive coding model that balances intelligence and speed, while you can use high or xhigh reasoning effort for your hardest tasks."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

#### Reasoning Effort Decision Matrix

| Task Type                       | Reasoning Effort | Rationale                            |
| ------------------------------- | ---------------- | ------------------------------------ |
| **Scaffold feature flag**       | Medium           | Straightforward boilerplate          |
| **Wire API endpoint**           | Medium           | Standard pattern application         |
| **Clean up helper module**      | Medium           | Refactoring with clear scope         |
| **Complex refactor**            | High             | Architecture decisions needed        |
| **Deep debugging**              | High             | Root cause analysis required         |
| **Legacy data pipeline**        | High             | Complex untangling, many edge cases  |
| **Fragile domain layer**        | High             | High-risk changes, careful reasoning |
| **Race condition (under load)** | High             | Subtle timing issues, deep analysis  |

**For `/implement-gpt-5-1-codex`**:

- **Default**: Medium reasoning effort
- **Override to High**: For tasks marked "complex" in tasks.md or deep debugging

**Token Efficiency**:

> "GPT-5.1-Codex-Max with 'medium' reasoning effort achieves better performance than GPT-5.1-Codex with the same reasoning effort, while using 30% fewer thinking tokens."

**Source**: [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)

---

## Complete Implementation Workflow Example

### Medium Feature Implementation (~200K tokens, 400K context)

````markdown
## Phase 1: Context Loading (1 minute)

**File loading** (use `rg --files` pattern):

```bash
rg --files | grep -E '(spec|plan|tasks)\.md'
```
````

**Read artifacts**:

- spec.md, plan.md, tasks.md
- CONSTITUTION.md for project rules

**No explicit reasoning steering** - model adapts automatically

**Output**: "Ready to implement. 8 tasks identified."

---

## Phase 2: Implementation (Bias Toward Action)

### Task T1.1: Component Class

**Adaptive reasoning** (model determines depth):

- Simple task → fast implementation
- No manual steering needed

**Implementation** (persist to completion):

```typescript
// Don't stop at analysis - implement it!
@Component({
  selector: 'nfs-accordion',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsAccordion {}
```

**Verification** (carry through to completion):

```bash
npm run test -- accordion.component.spec.ts
# ✅ Pass - mark task complete immediately
```

**Quality check**:

- ✅ Correct (meets spec)
- ✅ Clear (follows conventions)
- ✅ Reliable (OnPush, standalone)
- ✅ Root cause (implements requirement, not workaround)

**State tracking**:

```bash
# Edit tasks.md to mark [X]
# Continue to next task without waiting for user confirmation
```

---

### Task T1.2: Methods (Adaptive Reasoning)

**Model automatically determines**:

- Moderate complexity → medium reasoning depth
- No explicit steering from prompt

**Implementation**:

```typescript
export class NfsAccordionItem {
  readonly expanded = signal(false);

  toggle() {
    this.expanded.update((e) => !e);
  }

  // Handle edge case: disabled state
  up() {
    if (!this.disabled()) {
      this.expanded.set(false);
    }
  }

  down() {
    if (!this.disabled()) {
      this.expanded.set(true);
    }
  }
}
```

**Engineering quality**:

- ✅ Handles edge case (disabled state) proactively
- ✅ Clear method names matching Foundation API
- ✅ No messy hacks or shortcuts

**Persist to completion**:

- Run tests
- Fix any failures
- Mark complete
- Continue immediately to next task

---

## Phase 3: Completion

**Minimal guidance needed**:

```markdown
All tasks complete. Creating commit.
```

**Model persists to completion**:

- Creates commit with conventional format
- Includes task summary
- Reports final status

---

**Total time**: ~35 minutes
**Context used**: ~200K tokens (within 400K limit)
**Reasoning effort**: Medium (balanced, adaptive)
**Quality**: High (engineering standards applied)
**Persistence**: Full end-to-end completion

````

---

## Model Selection Matrix (GPT-5.1-Codex)

| Feature Characteristics          | GPT-5.1-Codex                           | Alternative                                     |
| -------------------------------- | --------------------------------------- | ----------------------------------------------- |
| **Small feature (<200K tokens)** | ✅ Excellent (adaptive reasoning)       | GPT-5 Mini (faster, cheaper)                    |
| **Medium feature (200K-400K)**   | ✅ **Best Choice** (400K context)       | Sonnet 4.5 (similar performance, 200K context)  |
| **Large feature (400K-1M)**      | ⚠️ Progressive disclosure required     | GPT-5.1-Codex-Max (compaction), Sonnet 4.5 1M  |
| **Very large (1M+)**             | ❌ Not feasible (use Max)               | GPT-5.1-Codex-Max (compaction)                  |
| **Multi-hour implementation**    | ✅ Good (within 400K context)           | GPT-5.1-Codex-Max (24+ hours), Sonnet 4.5       |
| **Simple boilerplate**           | ⚠️ Use GPT-5 Mini (Codex overkill)     | GPT-5 Mini, Haiku 4.5                           |

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Over-Specifying Guidance

```markdown
❌ BAD: [500-word prompt with step-by-step instructions]
"First read tasks.md. Then for each task, think about..."

✅ GOOD: "Execute tasks from tasks.md using TDD."
````

**Solution**: Trust adaptive reasoning, remove guidance

---

### ❌ Pitfall 2: Manual Reasoning Steering

```markdown
❌ BAD: "For simple tasks use minimal reasoning. For complex tasks think deeply."

✅ GOOD: [No reasoning steering - model adapts automatically]
```

**Solution**: Let model adjust reasoning depth automatically

---

### ❌ Pitfall 3: Stopping at Analysis

```markdown
❌ BAD Model Output:
"I would implement this feature by creating a component with..."
[Stops without implementing]

✅ GOOD Model Output:
"Implementing feature..." [Creates component, tests, verifies, marks complete]
```

**Solution**: Use "bias toward action" instruction in prompt

---

### ❌ Pitfall 4: Using Slow Tools

```markdown
❌ BAD: grep -r "pattern" .
⚠️ OK: find . -name "\*.ts"
✅ GOOD: rg "pattern"
✅ BEST: rg --files | grep "\.ts$"
```

**Solution**: Specify tool preferences in prompt

---

## Success Metrics

After optimization, expect:

**Speed**:

- Medium reasoning: Balanced (similar to Sonnet 4.5)
- High reasoning: 2-3x slower but higher quality

**Quality**:

- Engineering standards applied by default
- Root cause fixes (not symptoms)
- Edge case handling proactive
- No messy hacks or shortcuts

**Autonomy**:

- Multi-hour continuous operation (within 400K context)
- Full end-to-end task completion
- Bias toward action (no premature stopping)

**Cost**:

- Medium reasoning: Moderate (balanced)
- High reasoning: Higher (but worth it for complex tasks)

---

## Real-World Performance

### Multi-Component Refactor (350K tokens)

**Feature size**: ~350K tokens (within 400K context)
**Reasoning effort**: Medium
**Duration**: 2.5 hours continuous

**Results**:

- Implementation: Complete (8 components refactored)
- Tests: 100% passing
- Quality: High (engineering standards maintained)
- Progressive disclosure: Not needed (fit within 400K)

**Key insight**: 400K context sufficient for most multi-component refactors

---

### Complex Debugging Task (Race Condition)

**Feature size**: ~150K tokens
**Reasoning effort**: High
**Duration**: 45 minutes

**Results**:

- Root cause: Identified (timing issue in event handler)
- Fix: Correct (addressed async race condition)
- Tests: Added to prevent regression
- Quality: Excellent (no shortcuts taken)

**Key insight**: High reasoning for subtle bugs requiring deep analysis

---

## Research Sources

### OpenAI Official

- [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/) - Model capabilities, compaction, performance
- [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide) - Best practices, reasoning effort, tool usage
- [GPT-5.1 Codex Model | OpenAI API](https://platform.openai.com/docs/models/gpt-5.1-codex) - API access, capabilities
- [GPT-5-Codex Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide) - General Codex optimization

### Analysis & Guides

- [GPT-5.1-Codex-Max: Long-Horizon Coding with Compaction](https://www.gend.co/blog/gpt-5-1-codex-max-compaction) - Compaction deep dive
- [GPT-5.1 Codex-Max: Agentic Coding Complete Guide](https://www.digitalapplied.com/blog/gpt-5-1-codex-max-agentic-coding-guide) - Agentic workflow patterns
- [GPT-5.1-Codex-Max Analysis: A New Standard for Agentic Coding](https://www.remio.ai/post/gpt-5-1-codex-max-analysis-a-new-standard-for-agentic-coding) - Performance analysis
- [OpenAI Debuts GPT-5.1-Codex-Max - MarkTechPost](https://www.marktechpost.com/2025/11/19/openai-debuts-gpt-5-1-codex-max-a-long-horizon-agentic-coding-model-with-compaction-for-multi-window-workflows/) - Multi-window workflows

### Comparisons

- [GPT-5.1-Codex-Max vs GPT-5 Mini | Galaxy.ai](https://blog.galaxy.ai/compare/gpt-5-1-codex-max-vs-gpt-5-mini) - Context window comparison
- [Compare GPT-5.1 Codex and GPT-5 Mini | Appaca](https://www.appaca.ai/resources/llm-comparison/gpt-5.1-codex-vs-gpt-5-mini) - Capability comparison

---

## Quick Reference Card

### GPT-5.1-Codex Optimization Checklist

```
✅ Remove guidance (trust adaptive reasoning)
✅ No reasoning steering (model adapts automatically)
✅ Bias toward action (persist to completion)
✅ Engineering quality standards (correctness, clarity, reliability)
✅ Tool optimization (rg over grep, specialized tools over bash)
✅ External state files (tasks.md progress tracking)
✅ Medium reasoning effort (default, balanced)
✅ High for complex tasks (deep debugging, race conditions)
```

**Result**: Multi-hour autonomous operation with engineering quality standards.

---

## Max-Only Features (Not in GPT-5.1-Codex)

The following features are **ONLY** available in **GPT-5.1-Codex-Max**, not in GPT-5.1-Codex:

### 1. Context Compaction

**What it is**: Automatic multi-window operation that enables working over millions of tokens
**Benefit**: Tasks >400K tokens can continue without manual chunking
**Availability**: ❌ **NOT** in GPT-5.1-Codex, ✅ **ONLY** in GPT-5.1-Codex-Max

> "Compaction enables GPT‑5.1-Codex-Max to complete tasks that would have previously failed due to context-window limits by pruning its history while preserving the most important context over long horizons."

**Source**: [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)

### 2. xHigh Reasoning Effort

**What it is**: Extended reasoning mode beyond "high" for maximum quality
**Benefit**: 5x deeper analysis for legacy pipelines, race conditions under load
**Availability**: ❌ **NOT** in GPT-5.1-Codex (supports none/medium/high only), ✅ **ONLY** in GPT-5.1-Codex-Max

**Source**: [GPT-5.1 Codex Model | OpenAI API](https://platform.openai.com/docs/models/gpt-5.1-codex)

### 3. 30% Token Efficiency Improvement

**What it is**: Achieves better performance with 30% fewer thinking tokens
**Benefit**: Lower costs for complex reasoning tasks
**Availability**: ❌ **NOT** in GPT-5.1-Codex, ✅ **ONLY** in GPT-5.1-Codex-Max

> "GPT-5.1-Codex-Max with 'medium' reasoning effort achieves better performance than GPT-5.1-Codex with the same reasoning effort, while using 30% fewer thinking tokens."

**Source**: [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)

### 4. 24+ Hour Autonomous Operation

**What it is**: Can work continuously for over 24 hours on single tasks
**Benefit**: Complete multi-day refactors without intervention
**Availability**: Partial in GPT-5.1-Codex (multi-hour), ✅ Full 24+ hours **ONLY** in GPT-5.1-Codex-Max

**Source**: [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)

### When to Use Max vs. Regular Codex

| Scenario                    | GPT-5.1-Codex      | GPT-5.1-Codex-Max  | Why                           |
| --------------------------- | ------------------ | ------------------ | ----------------------------- |
| **<400K tokens**            | ✅ **Best Choice** | ⚠️ Overkill        | Regular Codex sufficient      |
| **400K-1M tokens**          | ⚠️ Manual chunking | ✅ **Best Choice** | Max's compaction auto-handles |
| **>1M tokens**              | ❌ Not feasible    | ✅ **Only Option** | Max's multi-window capability |
| **Simple-medium tasks**     | ✅ **Best Choice** | ⚠️ Overkill        | Save costs, similar quality   |
| **Complex race conditions** | ✅ High reasoning  | ✅ xHigh reasoning | Max has extra reasoning depth |
| **Multi-day refactors**     | ⚠️ Limited         | ✅ **Best Choice** | Max's 24+ hour autonomy       |

---

**Last Updated**: 2026-01-11
**Maintained by**: SpecKit contributors
**Optimizations**: 7 implementation-specific techniques for GPT-5.1-Codex
