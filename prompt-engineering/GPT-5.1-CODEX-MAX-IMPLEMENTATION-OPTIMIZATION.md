# GPT-5.1-Codex-Max Implementation Optimization Guide

**Model**: GPT-5.1-Codex-Max (400K base context, compaction for multi-window operation, xhigh reasoning)

**Purpose**: Optimize `/implement-gpt-5-1-codex-max` command for long-horizon, multi-hour implementation tasks

**Related Commands**: `/speckit.implement`, `/implement-gpt-5-1-codex` (regular Codex without Max features)

**Note**: This guide documents **GPT-5.1-Codex-Max** features. For regular GPT-5.1-Codex (without compaction), see `GPT-5.1-CODEX-IMPLEMENTATION-OPTIMIZATION.md`

---

## Model Characteristics for Implementation

### GPT-5.1-Codex-Max Implementation Strengths

1. **Context Compaction** - First model natively trained for multi-window operation (millions of tokens)
2. **24+ Hour Autonomous Operation** - Observed working independently for over 24 hours
3. **30% More Token-Efficient** - Better performance with 30% fewer thinking tokens than GPT-5.1-Codex
4. **xHigh Reasoning Effort** - Extra high reasoning beyond "high" for maximum quality
5. **Adaptive Reasoning** - Auto-adjusts depth (same as regular Codex)
6. **Bias Toward Action** - Persists to completion (same as regular Codex)
7. **Engineering Quality** - Root cause fixes, no shortcuts (same as regular Codex)

**Sources**:

- [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)
- [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)
- [GPT-5.1-Codex-Max: Long-Horizon Coding with Compaction](https://www.gend.co/blog/gpt-5-1-codex-max-compaction)

### Context Window Strategy (Max-Specific)

**Base Context**: 400K tokens
**With Compaction**: Millions of tokens (multi-window operation)

| Feature Type        | Regular Codex                    | Codex-Max                                             |
| ------------------- | -------------------------------- | ----------------------------------------------------- |
| **<400K tokens**    | ✅ Standard workflow             | ✅ Standard workflow (Max overkill)                   |
| **400K-1M tokens**  | ⚠️ Progressive disclosure needed | ✅ **Compaction auto-engages** (transparent)          |
| **1M+ tokens**      | ❌ Not feasible                  | ✅ **Multi-window operation** (unique capability)     |
| **Multi-hour work** | ⚠️ Limited (400K ceiling)        | ✅ **24+ hour autonomy** (compaction preserves state) |

**How Compaction Works**:

> "In Codex applications, GPT-5.1-Codex-Max automatically compacts its session when it approaches its context window limit, giving it a fresh context window. It repeats this process until the task is completed."

**Source**: [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)

**What Compaction Preserves**:

- ✅ Current task objective and goals
- ✅ Progress tracking (completed tasks)
- ✅ Error history and fixes applied
- ✅ Project architecture understanding
- ✅ Critical context from earlier work

**What Compaction Prunes**:

- ❌ Verbose tool outputs from early phases
- ❌ Detailed intermediate step history
- ❌ Redundant context

**User Experience**: Completely transparent (no notification, no configuration)

---

## Max-Only Optimizations (Not in Regular Codex)

### Optimization 1: Compaction-Aware Workflows

**Max-Specific Feature**: Automatic multi-window operation

**Research Finding**:

> "Compaction unlocks significantly longer effective context windows, where user conversations can persist for many turns without hitting context window limits or long context performance degradation, and agents can perform very long trajectories that exceed a typical context window for long-running, complex tasks."

**Source**: [GPT-5.1-Codex-Max: Long-Horizon Coding with Compaction](https://www.gend.co/blog/gpt-5-1-codex-max-compaction)

#### Implementation Pattern

````markdown
<compaction_workflow>

## Automatic Multi-Window Operation

**For features >400K tokens** (compaction auto-engages):

NO manual intervention needed:

- Model automatically compacts near 400K limit
- Preserves task objectives and progress
- Prunes verbose history
- Continues seamlessly with fresh context window
- Repeats until task complete

## State Preservation Strategy

**External state files are CRITICAL** for compaction:

1. **tasks.md** - Mark tasks [X] immediately (preserved through compaction)
2. **Git commits** - Commit incrementally (every 3-5 tasks, not at end)
3. **Progress reports** - After each task (compaction preserves objectives)

**Why external state matters**:

- Compaction prunes detailed history
- External files (tasks.md, git history) survive compaction
- Enables recovery of full context if needed

## Long-Horizon Task Pattern

**For multi-hour implementations** (>400K tokens):

```markdown
Task: Refactor authentication system across 15 components

Hour 1-4: Core authentication logic

- Compaction engages at 400K (after ~5-6 components)
- Preserves: "Refactor auth system" objective
- Prunes: Detailed implementation history of first 5 components
- Continues with fresh context

Hour 5-12: Integration and testing

- Compaction may engage 2-3 more times
- Preserves: Progress (10/15 components done), test results
- Prunes: Verbose test output logs

Hour 12-24: Polish and verification

- Final compaction if needed
- Preserves: Task completion status
- Model persists to final commit and summary
```
````

**User experience**: No interruptions, no manual checkpoints, completely autonomous

</compaction_workflow>

````

---

### Optimization 2: xHigh Reasoning Effort (Max-Only)

**Max-Specific Feature**: Extended reasoning mode beyond "high"

**Research Finding**:

> "OpenAI introduced a new Extra High ('xhigh') reasoning effort specifically for non-latency-sensitive tasks. For deep debugging, complex refactors, or when you want the model to think harder and you don't care about response latency, switch to high or xhigh modes."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

#### Reasoning Effort Decision Matrix (Codex-Max)

| Task Type                       | Reasoning Effort | Rationale                                     |
| ------------------------------- | ---------------- | --------------------------------------------- |
| **Scaffold feature flag**       | Medium           | Straightforward boilerplate                   |
| **Wire API endpoint**           | Medium           | Standard pattern application                  |
| **Clean up helper module**      | Medium           | Refactoring with clear scope                  |
| **Complex refactor**            | High             | Architecture decisions needed                 |
| **Deep debugging**              | High             | Root cause analysis required                  |
| **Legacy data pipeline**        | **xHigh** 🔥     | Complex untangling, many edge cases           |
| **Fragile domain layer**        | **xHigh** 🔥     | High-risk changes, careful reasoning needed   |
| **Race condition (under load)** | **xHigh** 🔥     | Subtle timing issues, deep analysis required  |
| **Multi-component refactor**    | **xHigh** 🔥     | Coordination across many files                |
| **Vulnerability remediation**   | **xHigh** 🔥     | Security-critical, must be correct first try  |

**🔥 = Max-only feature (not available in regular Codex)**

#### Implementation Pattern

```markdown
<xhigh_reasoning_strategy>

## For `/implement-gpt-5-1-codex-max`

**Default**: Medium reasoning (most tasks)

**Override to High**:
- Tasks marked "complex" in tasks.md
- Deep debugging scenarios
- Multi-file refactoring

**Override to xHigh** (Max-only):
- Tasks marked "critical" in tasks.md
- Legacy code requiring careful analysis
- Race conditions or timing-sensitive bugs
- Security-critical implementations
- Fragile systems with high failure risk

## Trade-offs

**xHigh reasoning**:
- ✅ Maximum quality (best first-try correctness)
- ✅ Deep analysis (catches subtle edge cases)
- ✅ Security-aware (better vulnerability detection)
- ❌ Slower response (5-10x latency vs medium)
- ❌ Higher token cost (more thinking tokens)

**When worth it**: Quality-critical code, production systems, security

**When NOT worth it**: Simple tasks, prototyping, iterative development

</xhigh_reasoning_strategy>
````

---

### Optimization 3: 30% Token Efficiency (Max vs. Regular Codex)

**Max-Specific Advantage**: Better performance with fewer tokens

**Research Finding**:

> "GPT-5.1-Codex-Max with 'medium' reasoning effort achieves better performance than GPT-5.1-Codex with the same reasoning effort, while using 30% fewer thinking tokens."

**Source**: [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)

#### Cost Optimization Pattern

```markdown
<token_efficiency>

## Cost Comparison (Same Task)

| Model             | Reasoning | Thinking Tokens | Performance | Cost Efficiency |
| ----------------- | --------- | --------------- | ----------- | --------------- |
| GPT-5.1-Codex     | Medium    | 100K            | Baseline    | 1.0x            |
| GPT-5.1-Codex-Max | Medium    | 70K             | Better      | **0.7x** 🎯     |
| GPT-5.1-Codex-Max | xHigh     | 200K            | Best        | 2.0x (premium)  |

🎯 = 30% cost savings at same reasoning level

## Optimization Strategy

**For most tasks**:

- Use Codex-Max with medium reasoning
- 30% cheaper than regular Codex
- Better performance

**For critical tasks**:

- Use Codex-Max with xhigh reasoning
- Worth the premium cost
- Maximum quality and first-try correctness

**For simple tasks**:

- Use GPT-5 Mini or Haiku 4.5 instead
- Codex-Max is overkill

</token_efficiency>
```

---

## Shared Optimizations (Same as Regular Codex)

### Optimization 4: Remove Guidance Rather Than Add It

Same as GPT-5.1-Codex - trust agentic training, use minimal prompts

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

### Optimization 5: Adaptive Reasoning (No Steering)

Same as GPT-5.1-Codex - model auto-adjusts depth

### Optimization 6: Bias Toward Action & Persistence

Same as GPT-5.1-Codex - persist to full completion

### Optimization 7: Engineering Quality Standards

Same as GPT-5.1-Codex - correctness, clarity, reliability

### Optimization 8: Tool Usage Optimization

Same as GPT-5.1-Codex - `rg` over grep, specialized tools

---

## Complete Long-Horizon Implementation Workflow

### Very Large Feature (800K tokens, compaction engaged)

```markdown
## Configuration

**Model**: GPT-5.1-Codex-Max
**Reasoning effort**: Medium (default) with xHigh for critical tasks
**Context**: 400K base + compaction (auto multi-window)
**Expected duration**: 6-12 hours

---

## Phase 1: Initial Context Loading (400K used)

**Hour 0-1: Load complete feature context**

- Read ALL spec artifacts (spec, plan, tasks, data-model, contracts, research, quickstart)
- Read ALL implementation files for 15 components
- Read test suite
- Total: ~380K tokens

**Compaction status**: Not yet triggered (under 400K)

---

## Phase 2: Core Implementation (Compaction Trigger #1)

**Hour 1-4: Implement first 6 components**

- T1.1-T1.6: Core component implementations
- Tests for each component
- Context grows to ~395K tokens
- **Compaction triggers** near 400K

**What compaction does**:

- Preserves: Task list (T1.1-T1.6 marked [X]), current objective
- Prunes: Detailed implementation history, verbose test outputs
- Result: Fresh context window, ~50K tokens of critical context preserved
- User experience: Seamless, no notification

**Hour 4-8: Continue with components 7-12**

- Context starts fresh at ~50K
- Loads new component files as needed
- Marks T1.7-T1.12 complete
- **Compaction triggers again** near 400K

---

## Phase 3: Integration & Testing (Compaction Trigger #2)

**Hour 8-12: Integration work**

- Integration tests across all 15 components
- Context: Fresh from second compaction
- Preserves: All tasks marked [X], integration test results
- **Compaction may trigger** if integration complex

---

## Phase 4: Completion

**Hour 12+: Verification and commits**

- Run full test suite
- Create comprehensive commit
- Report final summary

**Total compactions**: 2-3 automatic compactions
**User intervention**: Zero (completely autonomous)
**Tasks completed**: 15/15 components refactored

---

**Total time**: ~12 hours autonomous
**Context windows**: 3 windows via compaction
**Reasoning effort**: Medium (3 tasks used xHigh for critical sections)
**Quality**: High (all tests passing, no shortcuts)
```

---

## xHigh Reasoning Examples

### Example 1: Race Condition Debugging

```markdown
**Task**: Fix race condition in event handler (only appears under load)

**Reasoning effort**: xHigh

**Why xHigh needed**:

- Timing-sensitive (requires deep analysis of async flows)
- Only reproduces under load (edge case)
- High failure risk if wrong diagnosis

**xHigh reasoning output**:

1. Analyzes event handler timing (5 min deep thinking)
2. Identifies 3 possible race conditions
3. Traces async execution flow across 8 files
4. Determines root cause: Promise.all() missing await in middleware
5. Implements fix with comprehensive test
6. Verifies fix handles all load scenarios

**Latency**: 15 minutes (vs 3 min with medium)
**Quality**: Correct on first try (vs 2-3 iterations with medium)
**Worth it**: Yes (critical bug, high-risk fix)
```

### Example 2: Legacy Data Pipeline Refactor

```markdown
**Task**: Untangle legacy ETL pipeline with circular dependencies

**Reasoning effort**: xHigh

**Why xHigh needed**:

- 10+ year old code, undocumented
- Circular dependencies across 20 modules
- Business-critical (can't break production)

**xHigh reasoning output**:

1. Maps entire dependency graph (10 min analysis)
2. Identifies circular loops (3 found)
3. Designs phased refactor strategy (break loops incrementally)
4. Implements phase 1 (break loop A)
5. Runs tests, verifies no regressions
6. Continues with phases 2-3

**Latency**: 45 minutes total (vs 10 min with medium, but would fail)
**Quality**: Zero production issues (vs high risk with medium)
**Worth it**: Absolutely (business-critical system)
```

---

## Model Selection: Max vs. Regular Codex

### When to Use Codex-Max

| Scenario                       | Regular Codex   | Codex-Max              | Why Max Wins                     |
| ------------------------------ | --------------- | ---------------------- | -------------------------------- |
| **<400K tokens, simple**       | ✅ **Best**     | ⚠️ Overkill            | Save cost, regular sufficient    |
| **<400K tokens, complex**      | ✅ Good         | ✅ **Better**          | 30% more efficient, same quality |
| **400K-1M tokens**             | ❌ Must chunk   | ✅ **Only viable**     | Compaction auto-handles          |
| **1M+ tokens (project-scale)** | ❌ Not possible | ✅ **Only option**     | Multi-window unique capability   |
| **Multi-hour refactor**        | ⚠️ Limited      | ✅ **Designed for**    | 24+ hour autonomy                |
| **Critical/security code**     | ⚠️ No xHigh     | ✅ **xHigh available** | Maximum quality for critical     |
| **Legacy system refactor**     | ⚠️ No xHigh     | ✅ **xHigh available** | Deep analysis for complexity     |

### Cost-Benefit Analysis

**Regular GPT-5.1-Codex**:

- **Best for**: <400K tokens, simple-moderate complexity
- **Cost**: Lower (no compaction overhead)
- **Limitation**: 400K hard ceiling

**GPT-5.1-Codex-Max**:

- **Best for**: >400K tokens, complex tasks, critical code
- **Cost**: 30% cheaper at medium effort (vs regular Codex)
- **Benefit**: Unlimited tokens via compaction, xHigh reasoning

**Decision**: Use Max for features >400K OR when xHigh reasoning needed

---

## Complete Implementation Workflow Example

### Project-Scale Refactor (1.2M tokens total)

```markdown
## Task: Refactor authentication system (15 components, 80 files, 3 databases)

**Configuration**:

- Model: GPT-5.1-Codex-Max
- Reasoning: Medium (xHigh for security-critical sections)
- Expected: 16-20 hours autonomous operation
- Compaction: Will engage 2-3 times

---

## Hour 0-4: Initial Context & Core Auth (Window 1)

**Load full context** (360K tokens):

- All 80 files
- All spec/plan/task artifacts
- Database schemas
- API contracts

**Implement core auth** (T1.1-T1.8):

- User authentication service
- Token generation/validation
- Password hashing (xHigh reasoning - security critical)
- Session management

**Compaction trigger #1** (~390K tokens):

- Preserves: Task progress (T1.1-T1.8 done), core auth architecture
- Prunes: Detailed implementation history
- Fresh window: ~60K critical context

---

## Hour 4-10: Component Integration (Window 2)

**Continue in fresh context**:

- Loads integration files as needed
- Implements T1.9-T1.20 (component integration)
- Runs integration tests
- Context grows to ~380K

**Compaction trigger #2**:

- Preserves: All task progress, test results, auth architecture
- Prunes: Intermediate integration steps
- Fresh window: ~70K critical context

---

## Hour 10-16: Database Migration (Window 3)

**Continue in fresh context**:

- Implements T2.1-T2.8 (database migration)
- Migration scripts (xHigh reasoning - data loss risk)
- Rollback procedures
- Verification queries

**Compaction trigger #3**:

- Preserves: Migration strategy, all completed tasks
- Prunes: Detailed SQL generation history

---

## Hour 16-20: Final Verification & Commit

**Final phase**:

- Run full test suite (all 200+ tests)
- Verify no regressions
- Create comprehensive commit
- Report completion

---

**Total time**: 18 hours (autonomous, no interruptions)
**Context windows**: 4 windows (3 compactions)
**Tokens processed**: ~1.2M total
**Tasks completed**: 36/36
**Tests**: 200+ all passing
**Compaction overhead**: Transparent (user saw continuous progress)
**Quality**: Production-ready, zero regressions
```

**Key insight**: Task that would be impossible for regular Codex (400K limit) completed autonomously by Codex-Max via compaction.

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Using Max for Small Features

```markdown
❌ BAD: Use Codex-Max for 80K token feature

✅ GOOD: Use regular GPT-5.1-Codex (or GPT-5 Mini)

- Max's compaction is overkill
- Regular Codex sufficient
- Save cost
```

**Solution**: Reserve Max for >400K tokens OR when xHigh reasoning needed

---

### ❌ Pitfall 2: Not Using External State Files

```markdown
❌ BAD: Rely only on conversation history (will be pruned by compaction)

✅ GOOD: Use external state files

- Mark tasks [X] in tasks.md immediately
- Commit every 3-5 tasks
- Progress persists through compaction
```

**Solution**: External state (tasks.md, git) is CRITICAL for compaction

---

### ❌ Pitfall 3: Using xHigh for Everything

```markdown
❌ BAD: Set xHigh reasoning for all tasks (wastes time/tokens)

✅ GOOD: Use xHigh selectively

- Medium for most tasks
- High for complex
- xHigh only for critical/security/legacy
```

**Solution**: xHigh is powerful but expensive - use strategically

---

### ❌ Pitfall 4: Manual Compaction Triggers

```markdown
❌ BAD: Try to manually trigger compaction

✅ GOOD: Let compaction happen automatically

- Engages near 400K limit
- Transparent to user
- No configuration needed
```

**Solution**: Trust automatic compaction, don't interfere

---

## Success Metrics

After optimization, expect:

**Autonomy**:

- 24+ hour continuous operation (compaction enables)
- Multi-window task completion
- Zero manual intervention required

**Quality**:

- Engineering standards maintained across windows
- Compaction preserves critical context
- xHigh reasoning for critical sections

**Scale**:

- Features >400K tokens: Feasible (compaction)
- Project-scale refactors: Supported (multi-window)
- Multi-hour implementations: Autonomous

**Cost**:

- 30% cheaper than regular Codex (medium effort)
- xHigh reasoning: Premium (worth it for critical code)

---

## Real-World Performance

### Multi-Codebase Refactor (GPT-5.1-Codex-Max)

**Task**: Refactor spanning two codebases with three coordinated agents

**Configuration**:

- Model: GPT-5.1-Codex-Max
- Reasoning: Medium (xHigh for coordination logic)
- Compaction: Engaged 2 times

**Results**:

- Success: Complete refactor across both codebases
- Compactions: 2 automatic compactions during execution
- Quality: All tests passing, zero regressions
- Autonomy: Completed without human intervention

**Source**: Based on Terminal Bench performance data

---

## Research Sources

### OpenAI Official

- [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/) - Model announcement, compaction, capabilities
- [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide) - Best practices, reasoning effort, xHigh
- [GPT-5.1-Codex-Max System Card | OpenAI](https://openai.com/index/gpt-5-1-codex-max-system-card/) - Technical details

### Analysis & Guides

- [GPT-5.1-Codex-Max: Long-Horizon Coding with Compaction](https://www.gend.co/blog/gpt-5-1-codex-max-compaction) - Compaction deep dive
- [What are GPT-5.1-Codex-Max and How to Use it? - CometAPI](https://www.cometapi.com/what-are-gpt-5-1-codex-max-and-how-to-use-it/) - Usage guide
- [How to Use GPT-5.1-Codex-Max - Apidog](https://apidog.com/blog/use-gpt-5-1-codex-max/) - Implementation patterns

### Performance & News

- [OpenAI Releases GPT-5.1-Codex-Max - CyberPress](https://cyberpress.org/openai-releases-gpt-5-1-codex-max/) - Release announcement
- [OpenAI Makes Coding Leap - eWEEK](https://www.eweek.com/news/openai-gpt-codex-max-launch/) - Performance analysis

---

## Quick Reference Card

### GPT-5.1-Codex-Max Optimization Checklist

```
✅ Use for >400K tokens (compaction auto-handles multi-window)
✅ Use external state files (tasks.md, git - survive compaction)
✅ Commit incrementally (every 3-5 tasks, not at end)
✅ Medium reasoning default (30% more efficient than regular Codex)
✅ xHigh for critical tasks (legacy, security, race conditions)
✅ Remove guidance (same as regular Codex)
✅ Trust adaptive reasoning (same as regular Codex)
✅ Bias toward action (same as regular Codex)
✅ Engineering quality (same as regular Codex)
✅ Tool optimization (rg, specialized tools)
```

**Result**: Multi-window autonomous operation for project-scale implementations

---

## Comparison: Regular Codex vs. Codex-Max

| Feature                    | GPT-5.1-Codex      | GPT-5.1-Codex-Max                |
| -------------------------- | ------------------ | -------------------------------- |
| **Context (base)**         | 400K               | 400K                             |
| **Context (with feature)** | 400K (hard limit)  | **Millions** (compaction) 🔥     |
| **Reasoning efforts**      | none, medium, high | none, medium, high, **xHigh** 🔥 |
| **Token efficiency**       | Baseline           | **30% better** 🔥                |
| **Max autonomy**           | Multi-hour (400K)  | **24+ hours** 🔥                 |
| **Best for**               | <400K tokens       | **>400K tokens** 🔥              |
| **Cost** (medium effort)   | 1.0x               | **0.7x** (30% cheaper) 🔥        |

🔥 = Max-only feature

---

**When to Use Max**:

- ✅ Features >400K tokens (compaction required)
- ✅ Multi-hour autonomous implementations
- ✅ Critical/security code (xHigh reasoning)
- ✅ Legacy system refactors (xHigh reasoning)
- ✅ Project-scale changes

**When to Use Regular Codex**:

- ✅ Features <400K tokens
- ✅ Cost-sensitive projects
- ✅ Simple-moderate complexity

---

**Last Updated**: 2026-01-11
**Maintained by**: SpecKit contributors
**Optimizations**: 8 total (3 Max-specific + 5 shared with regular Codex)
