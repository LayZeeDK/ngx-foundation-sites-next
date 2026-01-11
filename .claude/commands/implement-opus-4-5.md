---
description: Execute implementation plan with Opus 4.5 optimizations - medium effort for token efficiency, first-try correctness, vision for UI
---

<role>
You are an expert implementation agent executing a systematic task-by-task implementation workflow, optimized for Claude Opus 4.5's strengths: state-of-the-art coding (80.9% SWE-bench), first-try correctness, superior logical planning, and effort parameter token efficiency.
</role>

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Opus 4.5 Optimization Strategy

**Key Optimizations Applied**:

1. **Medium Effort (Default)** - 76% token savings, matches Sonnet 4.5 best performance
2. **First-Try Correctness** - Trust expert coding, implement fully then test (vs error-first)
3. **Parallel Context Loading** - Load files simultaneously (10-20x speedup)
4. **Extended Thinking** - 16K-32K budgets for complex tasks
5. **Calibrated System Prompts** - Normal language (Opus more sensitive than previous models)
6. **Vision for UI** - Screenshot comparison for Foundation component matching
7. **Minimal Implementation** - OUT OF SCOPE list prevents over-engineering

**Unique Opus 4.5 Features**:

- **Effort parameter** (beta) - Control token usage (low/medium/high)
- **First-try correctness** - Higher success rate than Sonnet on complex tasks
- **Superior logical planning** - Track intricate conditions better
- **Enhanced vision** - Improved image processing for UI development

**Reference**: See `prompt-engineering/CLAUDE-OPUS-4-5-IMPLEMENTATION-OPTIMIZATION.md` for detailed strategies

## Path Grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths
- Treat paths from `.specify/scripts/powershell/check-prerequisites.ps1 -Json` as **only source of truth**
- If unclear, STOP and re-run script or ask user

---

## Phase 1: Deep Context Gathering

<phase_1_context>

### Step 1.1: Run Prerequisites Check

```bash
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse: `FEATURE_DIR`, `AVAILABLE_DOCS`

### Step 1.2: Parallel Artifact Loading

**Load ALL artifacts SIMULTANEOUSLY**:

```typescript
// Execute in SINGLE message (parallel tool use)
Read(FEATURE_DIR + '/spec.md');
Read(FEATURE_DIR + '/plan.md');
Read(FEATURE_DIR + '/tasks.md');
Read(FEATURE_DIR + '/data-model.md'); // if exists
Read(FEATURE_DIR + '/contracts/*.md'); // if exists
Read(FEATURE_DIR + '/research.md'); // if exists
Read('CONSTITUTION.md');
```

**Speedup**: ~10-20x faster than sequential

### Step 1.3: Extended Thinking - Architecture Understanding

**Use extended thinking** (8K budget):

<extended_thinking_prompt>
Evaluate deeply:

1. **Architecture**: What's the overall design approach?
2. **Dependencies**: What are critical file/component dependencies?
3. **Edge Cases**: What error conditions need handling?
4. **Testing Strategy**: What's the test coverage requirement?
5. **Complexity Assessment**: Which tasks need high effort vs medium?

After evaluating, summarize understanding.
</extended_thinking_prompt>

**Note**: Use "evaluate" not "think" (Opus 4.5 word sensitivity)

**Output to user**:

```
✅ Context loaded (parallel tool use: 8 artifacts in ~15 seconds)

**Summary**:
- Feature: [name]
- Tasks: [count] ([P0] P0, [P1] P1, [P2] P2)
- Architecture: [summary]
- Complex tasks requiring high effort: [list]

Ready to proceed.
```

</phase_1_context>

---

## Phase 2: Setup Verification

<phase_2_setup>

### Step 2.1: Check Checklists Status

IF `FEATURE_DIR/checklists/` exists:

- Count total, completed, incomplete per checklist
- Display table
- **If incomplete**: STOP and ask "Proceed anyway? (yes/no)"
- **If complete**: Proceed automatically

### Step 2.2: Project Setup Verification

**Detection & Creation**:

- git repo? → .gitignore
- Dockerfile? → .dockerignore
- eslint.config.\*? → verify ignores
- package.json? → .npmignore (if publishing)

**Patterns** (from plan.md):

- Node.js/TypeScript: `node_modules/`, `dist/`, `*.log`, `.env*`
- Universal: `.DS_Store`, `*.tmp`, `.vscode/`

### Step 2.3: Create TODO List

```typescript
TodoWrite([
  { content: 'Setup verification', status: 'completed', activeForm: 'Setting up verification' },
  { content: 'T1.1: [description]', status: 'pending', activeForm: 'Implementing T1.1' },
  // ... all tasks
]);
```

</phase_2_setup>

---

## Phase 3: Implementation (First-Try Correctness)

<phase_3_implementation>

### Implementation Constraints

**OUT OF SCOPE** (do NOT implement unless in tasks.md):

- ❌ Performance optimizations beyond requirements
- ❌ Refactoring existing working code
- ❌ Additional features
- ❌ Documentation beyond JSDoc on changed functions
- ❌ Extra error handling beyond spec
- ❌ Additional tests beyond coverage requirements

**IN SCOPE**:

- ✅ Exact requirements from tasks.md
- ✅ Tests specified in tasks.md
- ✅ Error handling from spec.md
- ✅ Accessibility from spec.md
- ✅ Type safety

### Implementation Loop (FOR EACH Task)

#### Step 3.1: Determine Effort Level

**Effort configuration** (Opus 4.5 unique feature):

| Task Type                     | Effort | Extended Thinking | Rationale                           |
| ----------------------------- | ------ | ----------------- | ----------------------------------- |
| **Simple (boilerplate)**      | Medium | None              | Standard quality, 76% token savings |
| **Moderate (standard logic)** | Medium | 8K-16K            | Balanced (default)                  |
| **Complex (state, errors)**   | Medium | 16K-32K           | Deep reasoning with efficiency      |
| **Critical (production)**     | High   | 32K-64K           | Maximum quality, first-try critical |

**Default**: Medium effort + 16K extended thinking

**Override to High**: Task marked "critical" in tasks.md OR user requests

**⚠️ Note**: Effort parameter is **beta** (requires `anthropic_beta: effort-2025-11-24`)

#### Step 3.2: Implement (Trust First-Try Correctness)

**Opus 4.5 approach** (different from Sonnet error-first):

##### For Complex Tasks:

1. **Enable extended thinking** (16K-32K budget)
2. **Implement complete solution** (handle edge cases proactively)
3. **Run tests to verify**
4. **Higher probability of passing first try**

**Example**:

```typescript
// Opus 4.5 implements with edge cases on first try
export class NfsAccordion {
  readonly #items = signal<NfsAccordionItem[]>([]);
  readonly multiExpand = input(false);

  toggle(item: NfsAccordionItem) {
    // Edge case 1: disabled state (Opus adds proactively)
    if (item.disabled()) return;

    if (!this.multiExpand()) {
      // Edge case 2: exclusive mode (Opus handles correctly first try)
      this.#items().forEach((i) => {
        if (i !== item) i.expanded.set(false);
      });
    }

    item.expanded.update((e) => !e);
  }
}
```

##### For Simple Tasks:

1. **Medium effort, no extended thinking**
2. **Implement directly**
3. **Run tests**

#### Step 3.3: Verification

**Run tests after implementation**:

```bash
npm run test -- [test-file]
```

**IF tests fail**:

- Opus's first-try rate is high, but not 100%
- Fix issues
- Re-run
- Mark complete only when passing

**IF tests pass**:

- Mark task [X] in tasks.md immediately
- Update TodoWrite
- Continue to next task

</phase_3_implementation>

---

## Phase 4: Integration Verification

<phase_4_verification>

### Step 4.1: Run Full Suite

```bash
npm run test  # IF failures: fix before proceeding
npm run lint  # IF errors: fix before proceeding
npm run build # IF fails: fix before proceeding
```

### Step 4.2: Extended Thinking - Integration Analysis

**Use extended thinking** (8K budget):

<extended_thinking_prompt_integration>
Evaluate deeply:

1. **Integration**: Do tasks work together correctly?
2. **Edge cases**: All edge cases from spec handled?
3. **Accessibility**: ARIA attributes correctly applied?
4. **Performance**: Any obvious issues?
5. **Test coverage**: Critical paths covered?

After evaluating, report concerns or confirm readiness.
</extended_thinking_prompt_integration>

**Note**: Use "evaluate" not "think" (Opus 4.5 sensitivity)

</phase_4_verification>

---

## Phase 5: Completion & Documentation

<phase_5_completion>

### Step 5.1: Update tasks.md

Ensure ALL tasks marked [X]

### Step 5.2: Create Git Commit

```bash
git add [files]

git commit -m "$(cat <<'EOF'
feat([component]): implement [feature name]

Implement [N] tasks from tasks.md:
- [T1.1 brief]
- [T1.2 brief]

Tests: [N] new (all passing)
Coverage: [X]%

[If applicable]
BREAKING CHANGES:
- **[component]**: [description]
  - Migration: [how to update]

Closes: #[issue]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Step 5.3: Report Summary

```
🎉 Implementation Complete!

**Summary**:
- Tasks: [X]/[Y]
- Priority: [P0/P1/P2 breakdown]
- Tests: ✅ [N] passing
- Linting: ✅ Clean
- Build: ✅ Successful
- Effort: Medium (76% token savings)
- First-try success rate: [%]

**Next Steps**:
- Create PR
- Run gap analysis to verify no regressions
```

</phase_5_completion>

---

## Progress Tracking

**Use TodoWrite throughout**:

```typescript
// Mark complete IMMEDIATELY after finishing
TodoWrite([
  { content: 'T1.1: Component', status: 'completed', activeForm: 'Implementing T1.1' },
  { content: 'T1.2: Methods', status: 'in_progress', activeForm: 'Implementing T1.2' },
]);
```

**Conversational updates**:

```
✅ T1.2 complete - Methods implemented with edge case handling

- Implementation: toggle(), up(), down() (disabled state handled)
- Tests: 3 new (all passing first try)
- Time: 3 minutes

Moving to T1.3...
```

---

## Error Handling

**Opus 4.5 has higher first-try success**, but errors can still occur:

### Compilation Errors

```
❌ Compilation failed

Error: Type 'boolean' not assignable to 'string'
Location: accordion.ts:51

Fix: Adjusting type...
✅ Fixed - recompiling
```

### Test Failures

```
❌ Tests failed: 1 failing

Failure: Expected aria-expanded="true" but got "false"

Fix: Opus missed this edge case, adjusting...
✅ Fixed - all passing
```

**Note**: Opus's failure rate is lower than Sonnet, but still test everything

---

## Success Criteria

✅ All tasks marked [X] in tasks.md
✅ All tests passing
✅ Linting clean
✅ Build successful
✅ Git commits created
✅ TodoWrite reflects completion

---

## Optimization Impact

**vs. Standard `/speckit.implement`**:

| Metric                | Standard | Opus 4.5 Optimized          | Improvement       |
| --------------------- | -------- | --------------------------- | ----------------- |
| **Context loading**   | 3-5 min  | 15-30 sec                   | 10-20x faster     |
| **First-try success** | Moderate | Higher (expert coder)       | Fewer iterations  |
| **Token usage**       | Baseline | 76% fewer (medium effort)   | Huge cost savings |
| **Complex debugging** | Good     | Superior (logical planning) | Better            |
| **Code quality**      | Good     | State-of-the-art (80.9%)    | Best              |

**vs. `/implement-sonnet-4-5`**:

| Metric             | Sonnet 4.5 | Opus 4.5 (medium effort) | Trade-off         |
| ------------------ | ---------- | ------------------------ | ----------------- |
| **SWE-bench**      | 77.2%      | 80.9%                    | +3.7 points       |
| **Speed**          | Faster     | Slower                   | Quality > speed   |
| **Cost**           | $3/$15     | $5/$25                   | Premium pricing   |
| **First-try rate** | Good       | Excellent                | Fewer iterations  |
| **Token usage**    | Standard   | 76% fewer (medium)       | Better efficiency |

**When to Use Opus 4.5**: Complex reasoning, first-try critical, deep debugging
**When to Use Sonnet 4.5**: Daily work, speed matters, cost-sensitive

---

## Related Commands

- `/speckit.implement` - Standard (not optimized)
- `/implement-sonnet-4-5` - Sonnet 4.5 optimized (faster, cheaper, good for daily work)
- `/implement-gpt-5-1-codex` - GPT-5.1-Codex optimized (400K context)
- `/analyze-brief-gpt-5-mini` - Verify no gaps after implementation

---

## Notes

- **Effort parameter**: Medium default (beta feature: `anthropic_beta: effort-2025-11-24`)
- **Context**: 200K (standard) or 1M (Claude Code, premium: 2x input/1.5x output)
- **Extended thinking**: 16K-32K budgets for complex tasks
- **First-try correctness**: Higher than Sonnet - trust complete implementations
- **Token efficiency**: 76% fewer tokens at medium vs high effort
- **System prompt**: Use normal language (Opus more sensitive than previous)
- **Vision**: Leverage for UI component development (screenshot comparison)

**Best for**: Complex reasoning, state-of-the-art coding, first-try correctness critical

---

**Reference Documentation**: `prompt-engineering/CLAUDE-OPUS-4-5-IMPLEMENTATION-OPTIMIZATION.md`

**Optimization Source**: Anthropic docs (Effort, Extended Thinking, Prompting), performance analysis (DataStudios, Cosmic, DataCamp) (2026)
