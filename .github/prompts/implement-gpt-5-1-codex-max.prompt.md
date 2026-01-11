---
description: Execute implementation plan with GPT-5.1-Codex-Max optimizations - compaction for multi-window operation, xhigh reasoning for critical tasks, 30% token efficiency
---

Execute all tasks from tasks.md in order. Use TDD where specified. Mark tasks complete as you finish them.

## GPT-5.1-Codex-Max Optimization Strategy

**Core Principle**: Codex-Max is trained for long-horizon agentic coding with automatic multi-window operation via compaction.

**Max-Specific Features**:

1. **Context Compaction** - Automatic multi-window for >400K tokens (millions of tokens supported)
2. **xHigh Reasoning** - Extra high effort for critical/legacy/security code
3. **30% Token Efficiency** - Better performance with 30% fewer tokens than regular Codex
4. **24+ Hour Autonomy** - Observed working independently for over 24 hours
5. **Minimal Guidance** - Same as regular Codex (remove prescriptive steps)
6. **Adaptive Reasoning** - Same as regular Codex (auto-adjusts depth)
7. **Bias Toward Action** - Same as regular Codex (persist to completion)
8. **Engineering Quality** - Same as regular Codex (root cause, no hacks)

**Reference**: `prompt-engineering/GPT-5.1-CODEX-MAX-IMPLEMENTATION-OPTIMIZATION.md`

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

Parse: `FEATURE_DIR`, `AVAILABLE_DOCS` (all paths must be absolute)

For single quotes in args like "I'm Groot", use: `'I'\''m Groot'` (or double-quote: `"I'm Groot"`)

**Load implementation context** (read all that exist):

- **REQUIRED**: Read tasks.md for complete task list and execution plan
- **REQUIRED**: Read plan.md for tech stack, architecture, file structure
- **IF EXISTS**: Read data-model.md for entities and relationships
- **IF EXISTS**: Read contracts/ for API specifications and test requirements
- **IF EXISTS**: Read research.md for technical decisions and constraints
- **IF EXISTS**: Read quickstart.md for integration scenarios
- **REQUIRED**: Read CONSTITUTION.md for project rules

**Note**: Load everything - Codex-Max's compaction will automatically handle if >400K tokens

---

### 2. Check Checklists Status

IF `FEATURE_DIR/checklists/` exists:

**Scan all checklist files** in checklists/ directory

**For each checklist, count**:

- Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
- Completed items: Lines matching `- [X]` or `- [x]`
- Incomplete items: Lines matching `- [ ]`

**Create status table**:

```
| Checklist    | Total | Completed | Incomplete | Status |
|--------------|-------|-----------|------------|--------|
| ux.md        | 12    | 12        | 0          | ✓ PASS |
| test.md      | 8     | 5         | 3          | ✗ FAIL |
| security.md  | 6     | 6         | 0          | ✓ PASS |
```

**Calculate overall status**:

- **PASS**: All checklists have 0 incomplete items
- **FAIL**: One or more checklists have incomplete items

**If any checklist is incomplete**:

- Display table with incomplete item counts
- **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
- Wait for user response before continuing
- If user says "no" or "wait" or "stop", halt execution
- If user says "yes" or "proceed" or "continue", proceed to step 3

**If all checklists are complete**:

- Display table showing all checklists passed
- Automatically proceed to step 3

---

### 3. Project Setup Verification

**REQUIRED**: Create/verify ignore files based on actual project setup

**Detection & Creation Logic**:

- Check if repository is git repo (create/verify .gitignore if so):

  ```bash
  git rev-parse --git-dir 2>/dev/null
  ```

- Check if Dockerfile\* exists or Docker in plan.md → create/verify .dockerignore
- Check if .eslintrc\* exists → create/verify .eslintignore
- Check if eslint.config.\* exists → ensure the config's `ignores` entries cover required patterns
- Check if .prettierrc\* exists → create/verify .prettierignore
- Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
- Check if terraform files (\*.tf) exist → create/verify .terraformignore
- Check if .helmignore needed (helm charts present) → create/verify .helmignore

**If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
**If ignore file missing**: Create with full pattern set for detected technology

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

---

### 4. Parse tasks.md Structure

**Extract** (Codex-Max adaptive reasoning will process this):

- **Task phases**: Setup, Tests, Core, Integration, Polish
- **Task dependencies**: Sequential vs parallel execution rules `[P]`
- **Task details**: ID, description, file paths, parallel markers
- **Execution flow**: Order and dependency requirements

---

### 5. Execute Implementation (Bias Toward Action)

**Persistence requirements** (CRITICAL for long-horizon tasks):

- ✅ Implement full task (not "I would do X..." - DO IT)
- ✅ Write tests AND implementation
- ✅ Run tests to verify
- ✅ Fix failures until passing
- ✅ Mark [X] in tasks.md IMMEDIATELY after completion (critical for compaction)
- ✅ Report clear outcome

**Only stop if truly blocked** (missing info, ambiguous requirement)

**Implementation execution rules**:

- **Setup first**: Initialize project structure, dependencies, configuration
- **Tests before code**: Write tests for contracts, entities, integration where specified
- **Core development**: Implement models, services, CLI commands, endpoints
- **Integration work**: Database connections, middleware, logging, external services
- **Polish and validation**: Unit tests, performance optimization, documentation

---

**FOR EACH task in tasks.md** (in order):

#### Task Execution

**Adaptive reasoning** (automatic - no steering):

- Simple task → fast implementation
- Complex task → deeper analysis
- Critical task → consider xHigh reasoning
- Model determines depth automatically

**Reasoning effort configuration** (Codex-Max):

| Task Type                     | Reasoning | Rationale                                        |
| ----------------------------- | --------- | ------------------------------------------------ |
| **Simple (boilerplate)**      | Medium    | Fast, balanced                                   |
| **Moderate (standard logic)** | Medium    | **Default** (30% more efficient than regular)    |
| **Complex (refactors)**       | High      | Architecture decisions needed                    |
| **Critical (security)**       | **xHigh** | Maximum quality, legacy/security/race conditions |
| **Legacy systems**            | **xHigh** | Careful analysis, high-risk changes              |
| **Race conditions**           | **xHigh** | Subtle timing issues, deep debugging             |

**Default**: Medium reasoning effort (30% more efficient than regular Codex)

**Engineering quality standards**:

- ✅ **Correctness** - Meets spec requirements
- ✅ **Clarity** - Follows project conventions
- ✅ **Reliability** - Handles errors/edge cases from spec
- ✅ **Root cause** - Fix underlying issue, not symptom

**Avoid**:

- ❌ Risky shortcuts
- ❌ Speculative changes ("maybe this will work")
- ❌ Messy hacks (code that "just works")
- ❌ Symptom-only fixes

**Implementation approach**:

- IF task requires tests: Write test → run → fix errors → repeat until passing
- IF no tests required: Implement → run linter → verify build
- **Mark [X] in tasks.md IMMEDIATELY** after completion (critical for compaction state)
- Continue to next task without waiting

**Respect dependencies**:

- Sequential tasks: Complete in order
- Parallel tasks `[P]`: Can implement simultaneously
- File-based coordination: Tasks affecting same files must run sequentially

---

### 6. Compaction Awareness (Max-Specific)

**Automatic compaction** (no manual intervention):

- Engages automatically near 400K token limit
- Preserves: Task list, progress, objectives, architecture understanding
- Prunes: Verbose history, intermediate outputs
- Continues seamlessly with fresh context window
- Repeats until task complete

**Critical for long-horizon tasks**:

**External state preservation**:

1. **tasks.md** - Mark tasks [X] IMMEDIATELY (survives compaction)
2. **Git commits** - Commit every 3-5 tasks (NOT at end - compaction will prune history)
3. **Progress reports** - After each task (objectives preserved through compaction)

**Why this matters**:

- Compaction prunes conversation history
- External files (tasks.md, git) are NOT pruned
- Enables recovery and continuity across windows

---

### 7. Progress Tracking & Error Handling

**Report progress after each completed task**:

```
✅ T1.2 complete - Added expand(), collapse(), toggle() methods

- Implementation: 3 methods in accordion-item.ts
- Tests: 3 new (all passing)
- Time: 3 minutes

Moving to T1.3...
```

**Halt execution if any non-parallel task fails**
**For parallel tasks `[P]`**: Continue with successful tasks, report failed ones
**Provide clear error messages** with context for debugging
**Suggest next steps** if implementation cannot proceed

**IMPORTANT**: For completed tasks, mark [X] in tasks.md IMMEDIATELY

---

### 8. Completion Validation

**Verify all required tasks completed**:

- All tasks marked [X] in tasks.md
- Features match original specification
- Tests pass and coverage meets requirements
- Implementation follows technical plan

**Run full verification**:

```bash
npm run test   # All tests must pass
npm run lint   # No errors allowed
npm run build  # Must succeed
```

**DO NOT proceed to commit if failures exist**

---

### 9. Final Completion

**Create git commit** (conventional format):

```bash
git add [relevant files]

git commit -m "$(cat <<'EOF'
feat([component]): implement [feature name]

Implement [N] tasks from tasks.md:
- [T1.1 brief description]
- [T1.2 brief description]
- [T1.3 brief description]

Tests: [N] new tests (all passing)
Coverage: [X]%

[If applicable]
BREAKING CHANGES:
- **[component]**: [description of breaking change]
  - Migration: [how to update code]

Closes: #[issue-number]

Co-Authored-By: GPT-5.1-Codex-Max <noreply@openai.com>
EOF
)"
```

**Report final status with summary**:

```
✅ Implementation complete!

Tasks completed: [X]/[Y]
Priority: [P0/P1/P2 breakdown]
Implementation time: [actual]
Tests: ✅ [N] passing
Linting: ✅ Clean
Build: ✅ Successful
Compactions: [N] automatic (if >400K tokens)
Reasoning: Medium (xHigh for [N] critical tasks)

Next: Create PR or run gap analysis
```

---

## Tool Preferences (Codex-Max Optimized)

**File search**: `rg --files` (fastest)
**Content search**: `rg <pattern>` (faster than grep)
**File operations**: Use specialized tools (Read, Edit, Glob, Grep) over bash

**Why**: GPT-5.1-Codex training emphasizes tool efficiency

**Source**: [GPT-5.1-Codex-Max Prompting Guide | OpenAI Cookbook](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)

---

## Context Management (Compaction)

### For Features <400K Tokens

Standard workflow - compaction not needed (but Max still 30% more efficient)

### For Features 400K-1M Tokens

**Compaction automatically engages**:

- Near 400K limit: First compaction
- Preserves critical context (~50-70K tokens)
- Fresh window: Continue with 330-350K available
- May compact 1-2 more times before completion

**User experience**: Transparent (no notification, no manual triggers)

### For Features >1M Tokens (Multi-Window)

**Compaction enables multi-hour operation**:

- May engage 3-5+ times during implementation
- Each compaction preserves task progress
- External state (tasks.md, git commits) critical
- Model maintains objective across all windows

**Example**: 1.5M token project-scale refactor:

- Hour 0-4: Window 1 (T1-T10 complete) → Compaction #1
- Hour 4-10: Window 2 (T11-T22 complete) → Compaction #2
- Hour 10-16: Window 3 (T23-T30 complete) → Compaction #3
- Hour 16-20: Window 4 (Verification + commit)
- Total: 4 windows, autonomous operation, zero intervention

---

## Implementation Constraints (Prevent Over-Engineering)

**OUT OF SCOPE** (do NOT implement unless explicitly in tasks.md):

- ❌ Performance optimizations beyond requirements
- ❌ Refactoring existing working code
- ❌ Additional features "while we're here"
- ❌ Documentation beyond JSDoc on changed functions
- ❌ Extra error handling beyond spec requirements
- ❌ Additional tests beyond coverage requirements

**IN SCOPE** (implement ONLY these):

- ✅ Exact requirements from tasks.md
- ✅ Tests specified in tasks.md
- ✅ Error handling specified in spec.md
- ✅ Accessibility requirements from spec.md
- ✅ Type safety for changed code

---

## xHigh Reasoning Usage (Max-Only Feature)

**When to use xHigh** (not available in regular Codex):

- ✅ Task marked "critical" in tasks.md
- ✅ Security-sensitive code (authentication, authorization, encryption)
- ✅ Legacy system refactors (undocumented, fragile)
- ✅ Race conditions or timing bugs
- ✅ Data migration (risk of data loss)
- ✅ Multi-component coordination (complex state management)

**When NOT to use xHigh**:

- ❌ Simple boilerplate tasks
- ❌ Standard CRUD operations
- ❌ UI component implementation
- ❌ Test writing (unless testing critical security)

**xHigh characteristics**:

- Latency: 5-10x slower than medium
- Quality: Maximum (best first-try correctness)
- Tokens: Higher (extended thinking)
- Worth it: Critical code, high-risk changes

**Example**:

```markdown
Task: Implement authentication token validation with refresh logic

Assessment: Security-critical, timing-sensitive
→ Use xHigh reasoning

xHigh output:

- Analyzes all attack vectors (token theft, replay, timing attacks)
- Designs secure refresh flow (rotation, revocation)
- Implements with edge cases (expired, malformed, concurrent refresh)
- Adds comprehensive security tests

Result: Correct on first try, zero security issues
```

---

## Success Criteria

✅ All tasks marked [X] in tasks.md
✅ All tests passing (npm run test)
✅ Linting clean (npm run lint)
✅ Build successful (npm run build)
✅ Git commits created (conventional format, incremental)
✅ User receives completion summary
✅ Compaction handled automatically (if >400K tokens)
✅ External state preserved (tasks.md, git history)

---

## Optimization Impact

**vs. Standard `/speckit.implement`**:

| Metric                    | Standard | GPT-5.1-Codex-Max           | Improvement          |
| ------------------------- | -------- | --------------------------- | -------------------- |
| **Guidance needed**       | High     | Minimal                     | Faster setup         |
| **Reasoning**             | Manual   | Adaptive                    | No steering          |
| **Persistence**           | Moderate | Bias toward action          | Full completion      |
| **Quality**               | Good     | Engineering standards       | Better               |
| **Context**               | 200K     | **Millions** (compaction)   | **Unlimited** 🔥     |
| **Max tokens**            | 200K     | **No limit** (multi-window) | **Project-scale** 🔥 |
| **Autonomy**              | Hours    | **24+ hours**               | **Long-horizon** 🔥  |
| **Critical task quality** | Good     | **xHigh available**         | **Maximum** 🔥       |

🔥 = Max-only feature

**vs. `/implement-gpt-5-1-codex` (regular Codex)**:

| Feature               | Regular Codex           | Codex-Max                        | Max Advantage  |
| --------------------- | ----------------------- | -------------------------------- | -------------- |
| **Context limit**     | 400K (hard ceiling)     | **Millions** (compaction) 🔥     | Multi-window   |
| **Token efficiency**  | Baseline                | **30% better** 🔥                | Cost savings   |
| **Reasoning efforts** | none, medium, high      | none, medium, high, **xHigh** 🔥 | Critical tasks |
| **Max autonomy**      | Multi-hour (400K limit) | **24+ hours** 🔥                 | Project-scale  |
| **Best for**          | <400K tokens            | **>400K tokens** 🔥              | Large features |

---

## Related Commands

- `/speckit.implement` - Standard implementation (not Codex-optimized)
- `/implement-gpt-5-1-codex` - Regular Codex (<400K tokens, no compaction)
- `/implement-sonnet-4-5` - Sonnet 4.5 optimization (Claude Code & GitHub Copilot)
- `/implement-opus-4-5` - Opus 4.5 optimization (state-of-the-art coding)
- `/analyze-brief-gpt-5-mini` or `/analyze-brief-gpt-4-1` - Verify no gaps after implementation

---

## Notes

- **Model**: GPT-5.1-Codex-Max (NOT regular Codex - has compaction, xHigh, 30% efficiency)
- **Reasoning effort**: Medium default (xHigh for critical tasks marked in tasks.md)
- **Context**: 400K base + automatic compaction for unlimited tokens
- **Compaction**: Automatic (no configuration), transparent (no notification)
- **External state**: CRITICAL - mark tasks [X] immediately, commit every 3-5 tasks
- **Quality**: Engineering standards built-in (correctness, clarity, reliability)
- **Persistence**: 24+ hour autonomous operation supported
- **Tool optimization**: `rg` preferred over grep (faster)

**Codex-Max vs. Regular Codex**:

**Use Codex-Max when**:

- ✅ Feature >400K tokens (compaction needed)
- ✅ Multi-hour autonomous operation desired
- ✅ Critical/security code (xHigh reasoning)
- ✅ Legacy system refactor (xHigh reasoning)
- ✅ Project-scale changes (multi-window)

**Use Regular Codex when**:

- ✅ Feature <400K tokens (Max overkill)
- ✅ Cost-sensitive (Max premium vs regular)
- ✅ Simple-moderate complexity

**Max-only features** (NOT in regular Codex):

- ✅ Context compaction (multi-window operation)
- ✅ xHigh reasoning effort
- ✅ 30% token efficiency improvement
- ✅ 24+ hour autonomous operation

**Reference Documentation**: `prompt-engineering/GPT-5.1-CODEX-MAX-IMPLEMENTATION-OPTIMIZATION.md`

**Optimization Source**: OpenAI (Building with Codex-Max, Prompting Guide, System Card), analysis sources (Gend.co, CometAPI, Apidog) (2026)
