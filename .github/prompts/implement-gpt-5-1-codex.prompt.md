---
description: Execute implementation plan with GPT-5.1-Codex optimizations - minimal guidance, adaptive reasoning, bias toward action, 400K context
---

Execute all tasks from tasks.md in order. Use TDD where specified. Mark tasks complete as you finish them.

## GPT-5.1-Codex Optimization Strategy

**Core Principle**: GPT-5.1-Codex is trained for agentic coding - remove guidance, trust adaptive reasoning, persist to completion.

**Key Optimizations**:

1. **Minimal Guidance** - Remove prescriptive steps (model knows agentic workflows)
2. **Adaptive Reasoning** - No steering needed (auto-adjusts depth)
3. **Bias Toward Action** - Persist until fully complete (no stopping at analysis)
4. **Engineering Quality** - Root cause fixes, no shortcuts/hacks
5. **Tool Optimization** - `rg` over grep, specialized tools over bash
6. **400K Context** - 2x larger than Sonnet 4.5 (progressive disclosure for >400K)

**Reference**: `prompt-engineering/GPT-5.1-CODEX-IMPLEMENTATION-OPTIMIZATION.md`

---

## Path Grounding (CRITICAL)

- Treat paths from `.specify/scripts/powershell/check-prerequisites.ps1 -Json` as **only source of truth**
- Do NOT guess or "fix up" paths
- If unclear, STOP and re-run script or ask user

---

## Workflow

### 1. Run Prerequisites & Load Context

```bash
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse: `FEATURE_DIR`, `AVAILABLE_DOCS`

**Load artifacts** (read all that exist):

```typescript
Read(FEATURE_DIR + '/spec.md'); // REQUIRED
Read(FEATURE_DIR + '/plan.md'); // REQUIRED
Read(FEATURE_DIR + '/tasks.md'); // REQUIRED
Read(FEATURE_DIR + '/data-model.md'); // if exists
Read(FEATURE_DIR + '/contracts/*.md'); // if exists
Read(FEATURE_DIR + '/research.md'); // if exists
Read(FEATURE_DIR + '/quickstart.md'); // if exists
Read('CONSTITUTION.md'); // project rules
```

**Note**: GPT-5.1-Codex's adaptive reasoning will determine what's important - just load everything.

---

### 2. Check Checklists Status

IF `FEATURE_DIR/checklists/` exists:

**Count items** per checklist:

- Total: Lines matching `- [ ]` or `- [X]` or `- [x]`
- Completed: Lines matching `- [X]` or `- [x]`
- Incomplete: Lines matching `- [ ]`

**Display table**:

```
| Checklist | Total | Completed | Incomplete | Status |
|-----------|-------|-----------|------------|--------|
| ux.md     | 12    | 12        | 0          | ✓ PASS |
| test.md   | 8     | 5         | 3          | ✗ FAIL |
```

**If any incomplete**:

- STOP and ask: "Some checklists are incomplete. Proceed anyway? (yes/no)"
- Wait for user response

**If all complete**: Proceed automatically

---

### 3. Project Setup Verification

**Detect and create/verify ignore files**:

**Detection logic**:

```bash
# Git repo? → .gitignore
git rev-parse --git-dir 2>/dev/null

# Check for: Dockerfile* → .dockerignore
# Check for: .eslintrc* or eslint.config.* → .eslintignore or verify ignores
# Check for: .prettierrc* → .prettierignore
# Check for: package.json → .npmignore (if publishing)
```

**Common patterns** (from plan.md tech stack):

- **Node.js/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
- **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
- **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `.swp`, `.vscode/`, `.idea/`

**If exists**: Verify contains essential patterns, append missing critical ones only
**If missing**: Create with full pattern set

---

### 4. Parse tasks.md Structure

**Extract** (GPT-5.1-Codex will do this automatically):

- Task phases: Setup, Tests, Core, Integration, Polish
- Task dependencies: Sequential vs parallel `[P]`
- Task details: ID, description, file paths
- Execution order

---

### 5. Execute Implementation (Bias Toward Action)

**Persistence requirements** (CRITICAL):

- ✅ Implement full task (not "I would do X...")
- ✅ Write tests AND implementation
- ✅ Run tests to verify
- ✅ Fix failures until passing
- ✅ Mark [X] in tasks.md IMMEDIATELY after completion
- ✅ Report clear outcome

**Only stop if truly blocked** (missing info, ambiguous requirement)

---

**FOR EACH task in tasks.md (in order)**:

#### Task Execution

**Adaptive reasoning** (automatic - no steering):

- Simple task → fast implementation
- Complex task → deeper analysis
- Model determines depth automatically

**Engineering quality standards**:

- ✅ Correctness (meets spec)
- ✅ Clarity (follows conventions)
- ✅ Reliability (handles errors/edge cases)
- ✅ Root cause (not symptom fix)

**Avoid**:

- ❌ Risky shortcuts
- ❌ Speculative changes
- ❌ Messy hacks
- ❌ Symptom-only fixes

**Implementation approach**:

- IF task requires tests: Write test → run → fix errors → repeat until passing
- IF no tests: Implement → run linter → verify build
- Mark [X] in tasks.md immediately after completion
- Continue to next task without waiting

**Respect dependencies**:

- Sequential tasks: Complete in order
- Parallel tasks `[P]`: Can implement simultaneously
- File-based: Tasks on same file must be sequential

---

### 6. Progress Tracking

**Report after each completed task**:

```
✅ T1.2 complete - Added expand(), collapse(), toggle() methods

- Implementation: 3 methods in accordion-item.ts
- Tests: 3 new (all passing)
- Time: 3 minutes

Moving to T1.3...
```

**Halt execution if non-parallel task fails**
**For parallel tasks**: Continue with successful, report failed ones

---

### 7. Verification

**Run full suite**:

```bash
npm run test   # All tests must pass
npm run lint   # No errors
npm run build  # Must succeed
```

**DO NOT proceed if failures**

**Verify**:

- All required tasks completed
- Features match specification
- Tests pass and meet coverage requirements
- Implementation follows technical plan

---

### 8. Completion

**Update tracking**:

- All tasks marked [X] in tasks.md
- Create git commit (conventional format)

**Commit format**:

```bash
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
  - Migration: [update instructions]

Closes: #[issue]

Co-Authored-By: GPT-5.1-Codex <noreply@openai.com>
EOF
)"
```

**Report final status**:

```
✅ Implementation complete!

Tasks: [X]/[Y]
Tests: ✅ [N] passing
Linting: ✅ Clean
Build: ✅ Successful
Commits: [N]

Next: Create PR or run gap analysis
```

---

## Tool Preferences (GPT-5.1-Codex Optimized)

**File search**: `rg --files` (fastest)
**Content search**: `rg <pattern>` (faster than grep)
**File operations**: Use specialized tools (Read, Edit, Glob, Grep) over bash

**Why**: GPT-5.1-Codex training emphasizes tool efficiency

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

---

## Context Management

### For Features <400K Tokens

Standard workflow - no special handling

### For Features >400K Tokens

**Use progressive disclosure** (GPT-5.1-Codex does NOT have compaction):

**Phase 1**: Core component files
**Phase 2**: Directive files
**Phase 3**: Integration files

**Commit after each phase** (enables context reset)

**Note**: GPT-5.1-Codex-Max has compaction (auto multi-window), but GPT-5.1-Codex does NOT

---

## Implementation Constraints (Prevent Over-Engineering)

**OUT OF SCOPE** (do NOT implement unless in tasks.md):

- ❌ Performance optimizations beyond requirements
- ❌ Refactoring existing working code
- ❌ Additional features "while we're here"
- ❌ Documentation beyond JSDoc on changed functions
- ❌ Extra error handling beyond spec
- ❌ Additional tests beyond coverage

**IN SCOPE**:

- ✅ Exact requirements from tasks.md
- ✅ Tests specified in tasks.md
- ✅ Error handling from spec.md
- ✅ Accessibility from spec.md
- ✅ Type safety for changed code

---

## Success Criteria

✅ All tasks marked [X] in tasks.md
✅ All tests passing (npm run test)
✅ Linting clean (npm run lint)
✅ Build successful (npm run build)
✅ Git commits created (conventional format)
✅ User receives completion summary

---

## Optimization Impact

**vs. Standard `/speckit.implement`**:

| Metric              | Standard | GPT-5.1-Codex Optimized | Improvement        |
| ------------------- | -------- | ----------------------- | ------------------ |
| **Guidance needed** | High     | Minimal                 | Faster setup       |
| **Reasoning**       | Manual   | Adaptive (automatic)    | No steering needed |
| **Persistence**     | Moderate | Bias toward action      | Full completion    |
| **Quality**         | Good     | Engineering standards   | Better             |
| **Context**         | 200K     | 400K                    | 2x larger          |
| **Setup time**      | 5-10 min | 1-2 min                 | Minimal guidance   |

**Total improvement**: Faster setup (minimal prompts), better quality (engineering standards), larger context (400K)

---

## Related Commands

- `/speckit.implement` - Standard implementation (not Codex-optimized)
- `/implement-sonnet-4-5` - Sonnet 4.5 optimization (Claude Code & GitHub Copilot)
- `/implement-opus-4-5` - Opus 4.5 optimization (state-of-the-art coding)
- `/implement-reported-gaps` - Gap remediation specialized
- `/analyze-brief-gpt-5-mini` or `/analyze-brief-gpt-4-1` - Verify no gaps after implementation

---

## Notes

- **Model**: GPT-5.1-Codex (NOT Max - no compaction, no xhigh reasoning)
- **Reasoning effort**: Medium (balanced) - auto-configured, no steering
- **Context**: 400K tokens (2x Sonnet 4.5)
- **Progressive disclosure**: Required for >400K tokens (no compaction)
- **Quality**: Engineering standards built-in (correctness, clarity, reliability)
- **Persistence**: Full end-to-end completion (no premature stopping)
- **Tool optimization**: `rg` preferred over grep (faster)

**Key GPT-5.1-Codex characteristics**:

- Adaptive reasoning (auto-adjusts depth)
- Bias toward action (persist to completion)
- Trained for agentic coding (remove guidance)
- Supports none/medium/high reasoning effort
- 400K context window (no compaction beyond this)

**Max-only features** (NOT available):

- ❌ Context compaction (multi-window for >400K)
- ❌ xHigh reasoning effort
- ❌ 30% token efficiency improvement
- ❌ 24+ hour autonomous operation

**Reference Documentation**: `prompt-engineering/GPT-5.1-CODEX-IMPLEMENTATION-OPTIMIZATION.md`

**Optimization Source**: OpenAI Cookbook, GPT-5.1-Codex API docs, agentic coding research (2026)
