---
description: Execute implementation plan with GPT-5.1-Codex optimizations - minimal guidance, adaptive reasoning, bias toward action
---

Execute all tasks from tasks.md in order. Use TDD where specified. Mark tasks complete as you finish them.

## GPT-5.1-Codex Optimization Strategy

**Key Characteristics** (trust these, don't over-specify):

- **Adaptive Reasoning**: Model adjusts depth automatically - no manual steering needed
- **Bias Toward Action**: Persist until tasks fully complete - no stopping at analysis
- **Engineering Quality**: Optimize for correctness, clarity, reliability (not speed shortcuts)
- **400K Context**: 2x larger than Sonnet 4.5, progressive disclosure for >400K features

**Optimizations Applied**:

1. **Minimal Guidance** - Trained for agentic coding, remove prescriptive steps
2. **No Reasoning Steering** - Adaptive reasoning adjusts automatically
3. **Persist to Completion** - Carry through implementation → verification → outcome
4. **Quality Standards** - Root cause fixes, no messy hacks or speculative changes
5. **Tool Optimization** - Use `rg` for search (faster than grep), specialized tools over bash

**Reference**: `prompt-engineering/GPT-5.1-CODEX-IMPLEMENTATION-OPTIMIZATION.md`

---

## Path Grounding

- Treat paths from `.specify/scripts/powershell/check-prerequisites.ps1 -Json` as **only source of truth**
- Do NOT guess or "fix up" paths
- If unclear, STOP and re-run script or ask user

---

## Phase 1: Load Context

### Step 1.1: Run Prerequisites

```bash
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse: `FEATURE_DIR`, `AVAILABLE_DOCS`

### Step 1.2: Load Artifacts

**Read all simultaneously** (adaptive reasoning will determine what's important):

```typescript
Read(FEATURE_DIR + '/spec.md');
Read(FEATURE_DIR + '/plan.md');
Read(FEATURE_DIR + '/tasks.md');
Read(FEATURE_DIR + '/data-model.md'); // if exists
Read('CONSTITUTION.md');
```

**Output summary** (brief): Feature name, task count (P0/P1/P2), architecture approach

---

## Phase 2: Project Setup

### Check Checklists (if exists)

IF `FEATURE_DIR/checklists/` exists:

- Count total, completed, incomplete items per checklist
- Display table (Checklist | Total | Completed | Incomplete | Status)
- **If incomplete**: STOP and ask "Proceed anyway? (yes/no)"
- **If complete**: Proceed automatically

### Verify Ignore Files

Detect and create/verify based on project:

- git repo? → .gitignore
- Dockerfile? → .dockerignore
- eslint.config.\*? → verify ignores entries
- package.json? → .npmignore (if publishing)

**Patterns** (from plan.md tech stack):

- Node.js/TypeScript: `node_modules/`, `dist/`, `*.log`, `.env*`
- Universal: `.DS_Store`, `*.tmp`, `.vscode/`

---

## Phase 3: Implementation (Bias Toward Action)

### Persistence Requirements

**Carry tasks to completion** (do NOT stop early):

- ✅ Implement full task (not just analysis: "I would do X...")
- ✅ Write tests AND implementation
- ✅ Run tests to verify
- ✅ Fix failures until passing
- ✅ Mark [X] in tasks.md immediately
- ✅ Report clear outcome

**Only stop if truly blocked** (missing required info, ambiguous with multiple valid paths)

### Implementation Loop

FOR EACH task in tasks.md (in order):

#### Step 3.1: Adaptive Reasoning (Automatic)

Model determines complexity automatically - **no manual steering**:

- Simple task → fast implementation
- Complex task → deeper analysis

**DO NOT** add reasoning instructions - trust adaptive behavior

#### Step 3.2: Implement with Quality Standards

**Engineering principles**:

- ✅ **Correctness** - Meets spec requirements
- ✅ **Clarity** - Follows project conventions
- ✅ **Reliability** - Handles errors/edge cases from spec
- ✅ **Root cause** - Fix underlying issue, not symptom

**Avoid**:

- ❌ Risky shortcuts
- ❌ Speculative changes ("maybe this will work")
- ❌ Messy hacks (code that "just works")
- ❌ Symptom fixes (addressing visible issue without root cause)

#### Step 3.3: Verification

**IF task requires tests**:

1. Write test (Storybook play function or unit test)
2. Run test → capture error
3. Fix ONLY that error
4. Repeat until passing

**IF no tests required**:

1. Implement directly
2. Run linter
3. Verify build

#### Step 3.4: Mark Complete

**IMMEDIATELY** after task complete:

```typescript
Edit(
  file_path: FEATURE_DIR + '/tasks.md',
  old_string: '- [ ] T1.1: [description]',
  new_string: '- [X] T1.1: [description]'
);
```

**Continue to next task** without waiting

---

## Phase 4: Verification

### Run Full Suite

```bash
npm run test  # IF failures: fix before proceeding
npm run lint  # IF errors: fix before proceeding
npm run build # IF fails: fix before proceeding
```

**DO NOT** mark verification complete if failures exist

---

## Phase 5: Completion

### Create Git Commit

**Conventional format**:

```bash
git add [relevant files]

git commit -m "$(cat <<'EOF'
feat([component]): implement [feature name]

Implement [N] tasks from tasks.md:
- [T1.1 brief]
- [T1.2 brief]

Tests: [N] new (all passing)
Coverage: [X]%

Co-Authored-By: GPT-5.1-Codex <noreply@openai.com>
EOF
)"
```

### Report Summary

```
✅ Implementation complete!

Tasks: [X]/[Y]
Tests: [N] passing
Time: [actual]
```

---

## Tool Preferences

**File search**: `rg --files` (fastest)
**Content search**: `rg <pattern>` (faster than grep)
**File operations**: Use specialized tools (Read, Edit, Glob, Grep) over bash

---

## Context Management

### For Features <400K Tokens

Standard workflow - no special handling needed

### For Features >400K Tokens

**Use Progressive Disclosure**:

1. **Phase 1**: Core component files
2. **Phase 2**: Directive files
3. **Phase 3**: Integration files

**Commit after each phase** (enables context reset)

**Note**: GPT-5.1-Codex does NOT have compaction (Max-only feature)

---

## Success Criteria

✅ All tasks marked [X] in tasks.md
✅ All tests passing
✅ Linting clean
✅ Build successful
✅ Git commit created (conventional format)
✅ User receives summary

---

## Optimization Impact

**vs. Standard `/speckit.implement`**:

| Metric              | Standard | GPT-5.1-Codex Optimized | Improvement     |
| ------------------- | -------- | ----------------------- | --------------- |
| **Guidance needed** | High     | Minimal                 | Faster setup    |
| **Reasoning**       | Manual   | Adaptive (automatic)    | No steering     |
| **Persistence**     | Moderate | Bias toward action      | Full completion |
| **Quality**         | Good     | Engineering standards   | Better          |
| **Context**         | 200K     | 400K                    | 2x larger       |

---

## Related Commands

- `/speckit.implement` - Standard implementation (not Codex-optimized)
- `/implement-sonnet-4-5` - Sonnet 4.5 optimization
- `/implement-reported-gaps` - Gap remediation specialized
- `/analyze-brief-gpt-5-mini` - Verify no new gaps after implementation

---

## Notes

- **Reasoning effort**: Medium (balanced) - no manual configuration needed
- **Context**: 400K tokens (GitHub Copilot standard)
- **Progressive disclosure**: Required for features >400K (no compaction)
- **Quality**: Engineering standards built-in (correctness, clarity, reliability)
- **Persistence**: Full end-to-end completion (no premature stopping)

**Reference Documentation**: `prompt-engineering/GPT-5.1-CODEX-IMPLEMENTATION-OPTIMIZATION.md`

**Optimization Source**: OpenAI Cookbook, GPT-5.1-Codex API docs (2026)
