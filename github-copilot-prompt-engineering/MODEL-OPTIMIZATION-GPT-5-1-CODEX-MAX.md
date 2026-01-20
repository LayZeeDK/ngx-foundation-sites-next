# GPT-5.1-Codex-Max Prompt Optimization Guide

**Last Updated:** 2026-01-20

This document provides optimization strategies for GPT-5.1-Codex-Max, OpenAI's long-horizon coding model with context compaction for multi-window operation.

---

## Model Characteristics

| Attribute | Value |
|-----------|-------|
| **Context Window** | 400K base + compaction (millions of tokens) |
| **Reasoning** | Adaptive (none, medium, high, xHigh) |
| **Compaction** | ✅ First model with native multi-window operation |
| **Best For** | Very large features (>400K tokens), 24+ hour autonomous work |

### Key Capabilities (Max-Specific)

1. **Context Compaction** - First model natively trained for multi-window operation (millions of tokens)
2. **24+ Hour Autonomous Operation** - Observed working independently for over 24 hours
3. **30% More Token-Efficient** - Better performance with 30% fewer thinking tokens than GPT-5.1-Codex
4. **xHigh Reasoning Effort** - Extra high reasoning beyond "high" for maximum quality
5. **Adaptive Reasoning** - Auto-adjusts depth (same as regular Codex)
6. **Bias Toward Action** - Persists to completion (same as regular Codex)

**Sources**:
- [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)
- [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

---

## Quick Reference

| Optimization | Description | Priority |
|-------------|-------------|----------|
| [Compaction Awareness](#optimization-1-compaction-aware-workflows) | Multi-window operation | Critical |
| [xHigh Reasoning](#optimization-2-xhigh-reasoning-effort-max-only) | Extended analysis for critical tasks | High |
| [Token Efficiency](#optimization-3-30-token-efficiency) | Better performance, fewer tokens | Medium |
| [External State Files](#optimization-4-external-state-files-critical) | Survive compaction | Critical |
| [Incremental Commits](#optimization-5-incremental-commits) | Progress survives compaction | High |

Plus all optimizations from [GPT-5.1-Codex](./MODEL-OPTIMIZATION-GPT-5-1-CODEX.md)

---

## When to Use Codex-Max vs Regular Codex

| Scenario | Regular Codex | Codex-Max | Why |
|----------|---------------|-----------|-----|
| **<400K tokens, simple** | ✅ **Best** | ⚠️ Overkill | Save cost |
| **<400K tokens, complex** | ✅ Good | ✅ **Better** | 30% more efficient |
| **400K-1M tokens** | ❌ Must chunk | ✅ **Only viable** | Compaction auto-handles |
| **1M+ tokens (project-scale)** | ❌ Not possible | ✅ **Only option** | Multi-window capability |
| **Multi-hour refactor** | ⚠️ Limited | ✅ **Designed for** | 24+ hour autonomy |
| **Critical/security code** | ⚠️ No xHigh | ✅ **xHigh available** | Maximum quality |
| **Legacy system refactor** | ⚠️ No xHigh | ✅ **xHigh available** | Deep analysis |

---

## Optimization 1: Compaction-Aware Workflows

### The Technique

**Let compaction work automatically** - Codex-Max transparently handles multi-window operation.

**Research Finding**:

> "Compaction unlocks significantly longer effective context windows, where user conversations can persist for many turns without hitting context window limits or long context performance degradation, and agents can perform very long trajectories that exceed a typical context window for long-running, complex tasks."

**Source**: [GPT-5.1-Codex-Max: Long-Horizon Coding with Compaction](https://www.gend.co/blog/gpt-5-1-codex-max-compaction)

### How Compaction Works

> "In Codex applications, GPT-5.1-Codex-Max automatically compacts its session when it approaches its context window limit, giving it a fresh context window. It repeats this process until the task is completed."

**Source**: [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)

### What Compaction Preserves vs Prunes

**Preserved**:
- ✅ Current task objective and goals
- ✅ Progress tracking (completed tasks)
- ✅ Error history and fixes applied
- ✅ Project architecture understanding
- ✅ Critical context from earlier work

**Pruned**:
- ❌ Verbose tool outputs from early phases
- ❌ Detailed intermediate step history
- ❌ Redundant context

### Implementation Pattern

```markdown
## Automatic Multi-Window Operation

**For features >400K tokens** (compaction auto-engages):

NO manual intervention needed:
- Model automatically compacts near 400K limit
- Preserves task objectives and progress
- Prunes verbose history
- Continues seamlessly with fresh context window
- Repeats until task complete

## Long-Horizon Task Pattern

**For multi-hour implementations** (>400K tokens):

Hour 1-4: Core logic
- Compaction engages at 400K (after ~5-6 components)
- Preserves: Task objective, progress
- Prunes: Detailed implementation history
- Continues with fresh context

Hour 5-12: Integration and testing
- Compaction may engage 2-3 more times
- Preserves: Progress, test results
- Prunes: Verbose test output logs

Hour 12-24: Polish and verification
- Final compaction if needed
- Preserves: Task completion status
- Model persists to final commit and summary
```

**User experience**: No interruptions, no manual checkpoints, completely autonomous

---

## Optimization 2: xHigh Reasoning Effort (Max-Only)

### The Technique

**Use xHigh reasoning** for critical tasks requiring maximum quality.

**Research Finding**:

> "OpenAI introduced a new Extra High ('xhigh') reasoning effort specifically for non-latency-sensitive tasks. For deep debugging, complex refactors, or when you want the model to think harder and you don't care about response latency, switch to high or xhigh modes."

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

### Reasoning Effort Decision Matrix

| Task Type | Reasoning Effort | Rationale |
|-----------|------------------|-----------|
| **Scaffold feature flag** | Medium | Straightforward boilerplate |
| **Wire API endpoint** | Medium | Standard pattern application |
| **Complex refactor** | High | Architecture decisions needed |
| **Deep debugging** | High | Root cause analysis required |
| **Legacy data pipeline** | **xHigh** 🔥 | Complex untangling, many edge cases |
| **Fragile domain layer** | **xHigh** 🔥 | High-risk changes, careful reasoning |
| **Race condition (under load)** | **xHigh** 🔥 | Subtle timing issues, deep analysis |
| **Vulnerability remediation** | **xHigh** 🔥 | Security-critical, must be correct |

🔥 = Max-only feature (not available in regular Codex)

### Trade-offs

**xHigh reasoning**:
- ✅ Maximum quality (best first-try correctness)
- ✅ Deep analysis (catches subtle edge cases)
- ✅ Security-aware (better vulnerability detection)
- ❌ Slower response (5-10x latency vs medium)
- ❌ Higher token cost (more thinking tokens)

**When worth it**: Quality-critical code, production systems, security
**When NOT worth it**: Simple tasks, prototyping, iterative development

---

## Optimization 3: 30% Token Efficiency

### The Technique

**Use Codex-Max even for smaller tasks** when efficiency matters.

**Research Finding**:

> "GPT-5.1-Codex-Max with 'medium' reasoning effort achieves better performance than GPT-5.1-Codex with the same reasoning effort, while using 30% fewer thinking tokens."

**Source**: [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/)

### Cost Comparison

| Model | Reasoning | Thinking Tokens | Performance | Cost |
|-------|-----------|-----------------|-------------|------|
| GPT-5.1-Codex | Medium | 100K | Baseline | 1.0x |
| GPT-5.1-Codex-Max | Medium | 70K | Better | **0.7x** 🎯 |
| GPT-5.1-Codex-Max | xHigh | 200K | Best | 2.0x (premium) |

🎯 = 30% cost savings at same reasoning level

### Optimization Strategy

**For most tasks**:
- Use Codex-Max with medium reasoning
- 30% cheaper than regular Codex
- Better performance

**For critical tasks**:
- Use Codex-Max with xHigh reasoning
- Worth the premium cost
- Maximum quality and first-try correctness

**For simple tasks**:
- Use GPT-5 Mini or Haiku 4.5 instead
- Codex-Max is overkill

---

## Optimization 4: External State Files (Critical)

### The Technique

**Use external files to preserve state** across compaction events.

### Why This Matters

Compaction prunes detailed history, but external files survive:
- **tasks.md** - Mark tasks [X] immediately (preserved through compaction)
- **Git commits** - Commit incrementally (every 3-5 tasks)
- **Progress reports** - After each task (compaction preserves objectives)

### Implementation Pattern

```markdown
## State Preservation Strategy

**External state files are CRITICAL** for compaction:

1. **tasks.md** - Mark tasks [X] immediately
   - Compaction preserves task list
   - Progress tracking survives context reset

2. **Git commits** - Commit incrementally
   - Every 3-5 tasks, not at end
   - Git history survives compaction
   - Enables recovery of full context

3. **Progress reports** - After each task
   - Compaction preserves objectives
   - Clear status visible across windows
```

---

## Optimization 5: Incremental Commits

### The Technique

**Commit frequently** (every 3-5 tasks) rather than at the end.

### Why This Matters

- Git history survives compaction
- Enables recovery if issues arise
- Progress is durable across windows
- Easier to review changes

### Implementation Pattern

```markdown
## Incremental Commit Strategy

**Commit after every 3-5 tasks**:

Task T1.1-T1.3: Core setup
- Implement tasks
- Run tests
- Mark complete in tasks.md
- **Commit: "feat(component): add core setup (T1.1-T1.3)"**

Task T1.4-T1.7: Methods
- Implement tasks
- Run tests
- Mark complete
- **Commit: "feat(component): add methods (T1.4-T1.7)"**

[Compaction may occur here - commits are safe]

Task T1.8-T1.10: Integration
- Implement tasks
- Run tests
- Mark complete
- **Commit: "feat(component): add integration (T1.8-T1.10)"**
```

---

## Complete Long-Horizon Workflow Example

### Project-Scale Refactor (1.2M tokens total)

```markdown
## Task: Refactor authentication system (15 components, 80 files)

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
**Quality**: Production-ready, zero regressions
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

## Common Pitfalls to Avoid

### ❌ Pitfall 1: Using Max for Small Features

```markdown
❌ BAD: Use Codex-Max for 80K token feature
✅ GOOD: Use regular GPT-5.1-Codex (or GPT-5 Mini)

- Max's compaction is overkill
- Regular Codex sufficient
- Save cost
```

### ❌ Pitfall 2: Not Using External State Files

```markdown
❌ BAD: Rely only on conversation history (will be pruned by compaction)
✅ GOOD: Use external state files

- Mark tasks [X] in tasks.md immediately
- Commit every 3-5 tasks
- Progress persists through compaction
```

### ❌ Pitfall 3: Using xHigh for Everything

```markdown
❌ BAD: Set xHigh reasoning for all tasks (wastes time/tokens)
✅ GOOD: Use xHigh selectively

- Medium for most tasks
- High for complex
- xHigh only for critical/security/legacy
```

### ❌ Pitfall 4: Manual Compaction Triggers

```markdown
❌ BAD: Try to manually trigger compaction
✅ GOOD: Let compaction happen automatically

- Engages near 400K limit
- Transparent to user
- No configuration needed
```

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

| Feature | GPT-5.1-Codex | GPT-5.1-Codex-Max |
|---------|---------------|-------------------|
| **Context (base)** | 400K | 400K |
| **Context (with feature)** | 400K (hard limit) | **Millions** (compaction) 🔥 |
| **Reasoning efforts** | none, medium, high | none, medium, high, **xHigh** 🔥 |
| **Token efficiency** | Baseline | **30% better** 🔥 |
| **Max autonomy** | Multi-hour (400K) | **24+ hours** 🔥 |
| **Best for** | <400K tokens | **>400K tokens** 🔥 |
| **Cost** (medium effort) | 1.0x | **0.7x** (30% cheaper) 🔥 |

🔥 = Max-only feature

---

## Research Sources

**OpenAI Official**:
- [Building more with GPT-5.1-Codex-Max | OpenAI](https://openai.com/index/gpt-5-1-codex-max/) - Model announcement, compaction
- [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide) - Best practices, xHigh
- [GPT-5.1-Codex-Max System Card | OpenAI](https://openai.com/index/gpt-5-1-codex-max-system-card/) - Technical details

**Analysis & Guides**:
- [GPT-5.1-Codex-Max: Long-Horizon Coding with Compaction](https://www.gend.co/blog/gpt-5-1-codex-max-compaction) - Compaction deep dive
- [What are GPT-5.1-Codex-Max and How to Use it? - CometAPI](https://www.cometapi.com/what-are-gpt-5-1-codex-max-and-how-to-use-it/) - Usage guide
- [How to Use GPT-5.1-Codex-Max - Apidog](https://apidog.com/blog/use-gpt-5-1-codex-max/) - Implementation patterns

---

## Related Documents

- [MODEL-OPTIMIZATION-GPT-5-1-CODEX.md](./MODEL-OPTIMIZATION-GPT-5-1-CODEX.md) - For standard features (<400K tokens)
- [MODEL-OPTIMIZATION-GPT-4-1.md](./MODEL-OPTIMIZATION-GPT-4-1.md) - Alternative 1M context approach
- [MODEL-FRONTMATTER.md](./MODEL-FRONTMATTER.md) - How to specify models in agent/prompt files
