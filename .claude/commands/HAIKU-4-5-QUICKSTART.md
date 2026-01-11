# Haiku 4.5 Quickstart

**Get 2-5× faster implementation with 66% cost savings on suitable tasks.**

---

## Quick Start (5 Steps)

### 1. Generate Tasks (Standard)

```bash
/speckit.tasks
```

**Output**: `specs/<feature>/tasks.md`

---

### 2. Classify Tasks for Haiku

```bash
/tasks-for-haiku-4-5
```

**Output**:

- `haiku-suitable-tasks.md` - Filtered tasks with scores
- `haiku-implementation-context.md` - Focused context
- `haiku-task-analysis.md` - Detailed analysis

**Review**: Check `haiku-task-analysis.md` for:

- % of HIGH suitability tasks (target: >50% for best ROI)
- Estimated time savings
- Cost savings

---

### 3. Execute Haiku Tasks (Fast & Cheap)

```bash
/implement-tasks-for-haiku-4-5
```

**Execution**:

- HIGH suitability: 2-5× faster than Sonnet
- MEDIUM suitability: 1.5-2× faster (with extended thinking)
- 66% cost savings

**Verification**: All tests pass, TypeScript compiles

---

### 4. Execute Remaining Tasks (Sonnet)

```bash
/speckit.implement
```

**Execution**:

- Automatically skips Haiku-completed tasks
- Executes LOW suitability tasks requiring deep reasoning

---

### 5. Review Performance

Check performance metrics in commit message:

- Actual speedup vs estimate
- Cost savings realized
- Quality metrics (tests, compilation)

---

## When to Use

**✅ Use Haiku Workflow**:

- > 50% pattern-based tasks (method additions, renames, tests, docs)
- Clear task scope (explicit file paths, acceptance criteria)
- Time or cost optimization is priority

**❌ Skip Haiku Workflow**:

- > 50% complex reasoning tasks (architecture, design, complex refactoring)
- <20 total tasks (classification overhead not worth it)
- First-time feature patterns (no existing code to reference)

---

## Performance Expectations

| Feature Type           | Haiku Suitable | Speedup  | Cost Savings |
| ---------------------- | -------------- | -------- | ------------ |
| UI Component (simple)  | 70-80%         | 2-3×     | 50-60%       |
| Documentation          | 85-95%         | 2.5-3.5× | 60-70%       |
| UI Component (complex) | 40-50%         | 1.5-2×   | 25-35%       |
| Refactoring            | 20-30%         | 1.2-1.5× | 15-25%       |

---

## Example: Button Component

**Tasks**: 47 total

**Classification**:

- HIGH: 32 (68%)
- MEDIUM: 8 (17%)
- LOW: 7 (15%)

**Performance**:

- Haiku: 45 minutes (40 tasks)
- Sonnet: 40 minutes (7 tasks)
- **Total: 85 minutes** (vs 180 all-Sonnet)
- **Speedup: 2.1×**
- **Savings: $8.33**

---

## Task Patterns (Haiku Excels At)

| Pattern           | Haiku Time | Sonnet Time | Speedup | Example                                  |
| ----------------- | ---------- | ----------- | ------- | ---------------------------------------- |
| **Add Method**    | 1-2 min    | 3-5 min     | 2-3×    | Add `down()` method                      |
| **Rename/Update** | 2-3 min    | 4-6 min     | 2×      | Rename `multiExpandable` → `multiExpand` |
| **Add Test**      | 3-5 min    | 8-12 min    | 2-3×    | Add Storybook play function              |
| **Update Docs**   | 1-2 min    | 4-6 min     | 2-4×    | Update API reference                     |

---

## Full Documentation

**Comprehensive guides**:

- **[HAIKU-4-5-WORKFLOW.md](./HAIKU-4-5-WORKFLOW.md)** - Complete workflow guide with examples
- **[CLAUDE-HAIKU-4-5-OPTIMIZATION.md](../prompt-engineering/CLAUDE-HAIKU-4-5-OPTIMIZATION.md)** - Haiku optimization techniques
- **[SPECKIT_GUIDE.md](../SPECKIT_GUIDE.md)** - Full SpecKit documentation

**Prompt engineering insights**:

- **[prompt-engineering/README.md](../prompt-engineering/README.md)** - Model selection matrix

---

## Tips

1. **Review classification** before executing - check suitability percentages
2. **Haiku first** - execute fast tasks first for quick wins
3. **Track metrics** - note actual vs estimated performance
4. **Refine over time** - adjust classification based on real results
5. **Don't force it** - if <40% suitable, use standard Sonnet workflow

---

**Questions?** See [HAIKU-4-5-WORKFLOW.md](./HAIKU-4-5-WORKFLOW.md) for detailed examples and troubleshooting.
