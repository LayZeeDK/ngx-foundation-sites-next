# Shared Resources Design Principles

## Separation of Concerns

### What Goes in Shared Resources (Model-Agnostic)

These are **generic procedures** that work identically regardless of model:

| Resource                   | Why Shared                                                           |
| -------------------------- | -------------------------------------------------------------------- |
| `verification-workflow.md` | `npm run test/lint/build` works the same for any model               |
| `ignore-patterns.md`       | Technology patterns don't depend on AI model                         |
| `commit-templates.md`      | Conventional commit format is model-agnostic (except co-author line) |
| `error-handling.md`        | Error response format is standardized                                |
| `task-parsing-schema.md`   | JSON schema is model-independent                                     |
| `implementation-patterns/` | Pattern templates are reusable (how to apply them differs)           |

### What Stays in Command Files (Model-Specific)

These are **optimization strategies** unique to each model:

| Model          | Unique Optimizations                                                  | Location                           |
| -------------- | --------------------------------------------------------------------- | ---------------------------------- |
| **Sonnet 4.5** | Error-First TDD, 16K extended thinking, parallel tool use, 1M context | `implement-sonnet-4-5.md`          |
| **Opus 4.5**   | First-Try Correctness, Medium effort (76% savings), vision for UI     | `implement-opus-4-5.md`            |
| **Haiku 4.5**  | Step-bounded reasoning (3-5 steps), concise prompts, 2-5× speed       | `implement-tasks-for-haiku-4-5.md` |

---

## How Commands Use Shared Resources

Commands **reference** shared resources for generic procedures, then **add** their own optimizations:

### Example: Sonnet 4.5 Using Shared Verification

```markdown
## Phase 4: Integration Verification

**Reference**: See `shared/verification-workflow.md` for standard steps.

### Sonnet-Specific Additions:

**Use extended thinking** (8K budget) to reflect:

<extended_thinking_prompt_integration>
Think deeply about:

1. Integration issues - do tasks work together?
2. Edge cases - all handled from spec?
   ...
   </extended_thinking_prompt_integration>
```

### Example: Opus 4.5 Using Shared Verification

```markdown
## Phase 4: Integration Verification

**Reference**: See `shared/verification-workflow.md` for standard steps.

### Opus-Specific Additions:

**Use extended thinking** (8K budget) - prefer "evaluate" over "think":

<extended_thinking_prompt_integration>
Evaluate deeply:

1. Integration - do tasks work together correctly?
   ...
   </extended_thinking_prompt_integration>

**Note**: Opus 4.5 is more sensitive to prompt language than previous models.
```

---

## Model-Specific Optimization Matrix

| Aspect                      | Sonnet 4.5       | Opus 4.5                  | Haiku 4.5           |
| --------------------------- | ---------------- | ------------------------- | ------------------- |
| **Implementation Strategy** | Error-First TDD  | First-Try Correctness     | Pattern-Based       |
| **Extended Thinking**       | 8K-16K budgets   | 16K-32K budgets           | 2K-4K (sparingly)   |
| **Effort Parameter**        | N/A              | Medium default (beta)     | N/A                 |
| **Context Window**          | 200K or 1M       | 200K or 1M                | 200K                |
| **Reasoning Style**         | Step-by-step     | Deep evaluation           | Bounded (3-5 steps) |
| **Verification Timing**     | After each error | After full implementation | After each task     |
| **Cost/Speed**              | Balanced         | Premium/Slower            | Fast/Cheap          |

---

## When to Update Shared vs Command

### Update Shared Resource When:

- Verification command changes (e.g., new test framework)
- New technology patterns discovered (e.g., new language)
- Commit format evolves (e.g., new conventional commit type)
- Error handling format standardized

### Update Command File When:

- Model-specific optimization discovered
- Extended thinking budget needs adjustment
- New model capability to leverage (e.g., effort parameter)
- Model-specific prompt sensitivity found

---

## Reference Syntax

Commands reference shared resources using this pattern:

```markdown
**Reference**: See `shared/[resource].md` for [what it provides].

### Model-Specific Additions:

[Model-specific content here]
```

This clearly separates:

1. What's reusable across all models
2. What's optimized for this specific model

---

## Benefits

1. **Single source of truth** - Generic procedures updated once
2. **Model optimizations preserved** - Each command retains unique strategies
3. **Easier maintenance** - Change verification workflow? Update one file
4. **Clear documentation** - Obvious what's shared vs model-specific
5. **Future-proof** - New models can reuse shared resources with own optimizations
