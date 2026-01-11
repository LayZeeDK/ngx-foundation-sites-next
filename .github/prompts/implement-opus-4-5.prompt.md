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
2. **First-Try Correctness** - Trust expert coding, implement fully then test
3. **Parallel Context Loading** - Load files simultaneously (10-20x speedup)
4. **Extended Thinking** - 16K-32K budgets for complex tasks
5. **Calibrated System Prompts** - Normal language (Opus more sensitive)
6. **Vision for UI** - Screenshot comparison for Foundation matching
7. **Minimal Implementation** - OUT OF SCOPE list prevents over-engineering

**Unique Opus 4.5 Features**:

- **Effort parameter** (beta) - Control token usage (low/medium/high)
- **First-try correctness** - Higher success rate on complex tasks
- **Superior logical planning** - Track intricate conditions better
- **Enhanced vision** - Improved image processing for UI

**Reference**: `prompt-engineering/CLAUDE-OPUS-4-5-IMPLEMENTATION-OPTIMIZATION.md`

## Path Grounding

- Treat paths from `.specify/scripts/powershell/check-prerequisites.ps1 -Json` as **only source of truth**
- Do NOT guess or "fix up" paths
- If unclear, STOP and re-run script

---

## Phase 1: Deep Context Gathering

<phase_1_context>

### Step 1.1: Run Prerequisites

```bash
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse: `FEATURE_DIR`, `AVAILABLE_DOCS`

### Step 1.2: Parallel Artifact Loading

**Load ALL SIMULTANEOUSLY**:

```typescript
Read(FEATURE_DIR + '/spec.md');
Read(FEATURE_DIR + '/plan.md');
Read(FEATURE_DIR + '/tasks.md');
Read(FEATURE_DIR + '/data-model.md'); // if exists
Read('CONSTITUTION.md');
```

**Speedup**: ~10-20x faster

### Step 1.3: Extended Thinking - Architecture

**Use extended thinking** (8K budget):

<extended_thinking_prompt>
Evaluate deeply:

1. Architecture approach
2. Critical dependencies
3. Edge cases needing handling
4. Test coverage requirement
5. Complexity assessment per task

After evaluating, summarize.
</extended_thinking_prompt>

**Note**: Use "evaluate" not "think" (Opus 4.5 word sensitivity)

</phase_1_context>

---

## Phase 2: Setup Verification

<phase_2_setup>

### Check Checklists

IF `FEATURE_DIR/checklists/` exists:

- Count total, completed, incomplete
- Display table
- **If incomplete**: STOP, ask "Proceed? (yes/no)"
- **If complete**: Proceed automatically

### Verify Ignore Files

- git repo? → .gitignore
- Dockerfile? → .dockerignore
- eslint.config? → verify ignores
- package.json? → .npmignore

**Common Patterns by Technology** (from plan.md tech stack):

- **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
- **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
- **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
- **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
- **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
- **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
- **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
- **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
- **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
- **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
- **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `Makefile`, `config.log`, `.idea/`, `*.log`, `.env*`
- **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
- **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
- **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

**Tool-Specific Patterns**:

- **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
- **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
- **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
- **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

**If ignore file already exists**: Verify contains essential patterns, append missing critical ones only
**If ignore file missing**: Create with full pattern set for detected technology

### Create TODO List

```typescript
TodoWrite([
  { content: 'Setup', status: 'completed', activeForm: 'Setting up' },
  { content: 'T1.1: [task]', status: 'pending', activeForm: 'Implementing T1.1' },
]);
```

</phase_2_setup>

---

## Phase 3: Implementation (First-Try Correctness)

<phase_3_implementation>

### Implementation Constraints

**OUT OF SCOPE**:

- ❌ Performance optimizations beyond requirements
- ❌ Refactoring existing code
- ❌ Additional features
- ❌ Extra documentation
- ❌ Extra error handling
- ❌ Additional tests

**IN SCOPE**:

- ✅ Exact requirements from tasks.md
- ✅ Tests from tasks.md
- ✅ Error handling from spec.md
- ✅ Accessibility from spec.md

### Implementation Loop

#### Step 3.1: Determine Effort

| Task Type    | Effort | Extended Thinking | Rationale                  |
| ------------ | ------ | ----------------- | -------------------------- |
| **Simple**   | Medium | None              | 76% token savings          |
| **Moderate** | Medium | 8K-16K            | Balanced (default)         |
| **Complex**  | Medium | 16K-32K           | Deep reasoning + efficient |
| **Critical** | High   | 32K-64K           | Maximum quality            |

**Default**: Medium effort + 16K thinking

**⚠️ Beta**: Effort parameter requires `anthropic_beta: effort-2025-11-24`

#### Step 3.2: Implement (First-Try Approach)

**Opus 4.5 strength - implement complete solution**:

1. **Enable extended thinking** (16K-32K for complex)
2. **Implement fully** (handle edge cases proactively)
3. **Run tests**
4. **High probability passing first try**

**Example** (Opus handles edge cases first try):

```typescript
export class NfsAccordion {
  toggle(item: NfsAccordionItem) {
    if (item.disabled()) return; // Edge case 1 (added proactively)

    if (!this.multiExpand()) {
      // Edge case 2 (exclusive mode - correct first try)
      this.#items().forEach((i) => {
        if (i !== item) i.expanded.set(false);
      });
    }

    item.expanded.update((e) => !e);
  }
}
```

#### Step 3.3: Verify & Mark Complete

```bash
npm run test -- [file]
```

**IF pass**: Mark [X] in tasks.md, update TodoWrite, continue
**IF fail**: Fix, re-run (Opus's failure rate is low)

</phase_3_implementation>

---

## Phase 4: Integration Verification

<phase_4_verification>

### Run Full Suite

```bash
npm run test
npm run lint
npm run build
```

### Extended Thinking (8K)

<extended_thinking_prompt_integration>
Evaluate:

1. Integration correctness
2. Edge cases coverage
3. Accessibility compliance
4. Test coverage adequacy

Report concerns or confirm ready.
</extended_thinking_prompt_integration>

</phase_4_verification>

---

## Phase 5: Completion

### Update & Commit

Mark all tasks [X] in tasks.md

Create commit:

```bash
git commit -m "$(cat <<'EOF'
feat([component]): implement [feature]

Implement [N] tasks
Tests: [N] new (passing)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Report

```
✅ Complete!

Tasks: [X]/[Y]
Tests: ✅ [N] passing
Effort: Medium (76% token savings)
```

---

## Success Criteria

✅ All tasks complete in tasks.md
✅ Tests passing
✅ Linting clean
✅ Build successful
✅ Commit created
✅ Summary reported

---

## Optimization Impact

**vs. Sonnet 4.5**:

| Metric        | Sonnet 4.5 | Opus 4.5 (medium) | Difference        |
| ------------- | ---------- | ----------------- | ----------------- |
| **SWE-bench** | 77.2%      | 80.9%             | +3.7 points       |
| **First-try** | Good       | Excellent         | Fewer iterations  |
| **Tokens**    | Standard   | 76% fewer         | Huge savings      |
| **Cost**      | $3/$15     | $5/$25            | Premium           |
| **Speed**     | Faster     | Slower            | Quality trade-off |

**When to Use Opus**: Complex reasoning, first-try critical, deep debugging
**When to Use Sonnet**: Daily work, speed matters, cost-sensitive

---

## Related Commands

- `/speckit.implement` - Standard
- `/implement-sonnet-4-5` - Sonnet optimized (daily work)
- `/implement-gpt-5-1-codex` - GPT-5.1-Codex (400K context)

---

## Notes

- **Effort**: Medium default (76% token savings, beta: `effort-2025-11-24`)
- **Context**: 200K only (GitHub Copilot does NOT support 1M)
- **Progressive disclosure**: REQUIRED for >200K features
- **Extended thinking**: 16K-32K for complex tasks
- **First-try**: Higher success rate, trust complete implementations
- **System prompts**: Use normal language (more sensitive than previous)
- **Word choice**: Use "evaluate" not "think" when extended thinking disabled

**Best for**: State-of-the-art coding, complex reasoning, first-try correctness

---

**Reference**: `prompt-engineering/CLAUDE-OPUS-4-5-IMPLEMENTATION-OPTIMIZATION.md`

**Sources**: Anthropic docs (Effort, Extended Thinking, Prompting best practices) (2026)
