# Implementation Plan: Beta Feature Optimizations for `/implement-sonnet-4-5`

**Date**: 2026-01-15
**Optimized For**: Claude Sonnet 4.5
**Estimated Duration**: 7 minutes
**Risk Level**: None (documentation only)

---

## Overview

Implement 2 high-priority optimizations to make beta feature capabilities more visible in the `/implement-sonnet-4-5` command.

**Changes**:

1. Promote 1M context window from notes to key optimizations
2. Add beta feature reference section with verification links

**Impact**: Improves discoverability of major capabilities without changing command behavior.

---

## Phase 1: Read Current State (Parallel)

**Goal**: Load both sections that need modification

**Execute in SINGLE message** (parallel tool use):

```typescript
Read('.claude/commands/implement-sonnet-4-5.md', (offset = 19), (limit = 15)); // Key optimizations section
Read('.claude/commands/implement-sonnet-4-5.md', (offset = 28), (limit = 5)); // Reference section
Read('.claude/commands/implement-sonnet-4-5.md', (offset = 665), (limit = 5)); // Notes section with 1M context
```

**Expected Result**: 3 sections loaded simultaneously in ~2 seconds

---

## Phase 2: Optimization 1 - Promote 1M Context

**Goal**: Move 1M context from notes (line 666) to key optimizations (line 19-26)

### Change Location 1: Key Optimizations Section

**File**: `.claude/commands/implement-sonnet-4-5.md`
**Line**: 19-26

**Current**:

```markdown
**Key Optimizations Applied**:

1. **Parallel Context Loading** - Load multiple files simultaneously (10-20x speedup)
2. **Extended Thinking** - Use 16K budget for complex tasks, none for mechanical
3. **Error-First TDD** - Write tests, run to get error, fix ONLY that error, repeat
4. **Minimal Implementation** - OUT OF SCOPE list prevents over-engineering
5. **State Tracking** - Mark tasks [X] immediately after completion
6. **Phase-Based Workflow** - Research → Setup → Implement → Verify → Complete
```

**New**:

```markdown
**Key Optimizations Applied**:

1. **Parallel Context Loading** - Load multiple files simultaneously (10-20x speedup)
2. **Extended Thinking** - Use 16K budget for complex tasks, none for mechanical
3. **1M Context Window** - Available in Claude Code for large features (verified 2026-01-15)
   - Use for features >200K tokens (spec + plan + tasks + implementation files)
   - Premium pricing: 2x input / 1.5x output tokens
   - Eliminates progressive disclosure for most features
4. **Error-First TDD** - Write tests, run to get error, fix ONLY that error, repeat
5. **Minimal Implementation** - OUT OF SCOPE list prevents over-engineering
6. **State Tracking** - Mark tasks [X] immediately after completion
7. **Phase-Based Workflow** - Research → Setup → Implement → Verify → Complete
```

**Use Edit tool**:

```typescript
Edit(
  file_path: '.claude/commands/implement-sonnet-4-5.md',
  old_string: '**Key Optimizations Applied**:\n\n1. **Parallel Context Loading** - Load multiple files simultaneously (10-20x speedup)\n2. **Extended Thinking** - Use 16K budget for complex tasks, none for mechanical\n3. **Error-First TDD** - Write tests, run to get error, fix ONLY that error, repeat\n4. **Minimal Implementation** - OUT OF SCOPE list prevents over-engineering\n5. **State Tracking** - Mark tasks [X] immediately after completion\n6. **Phase-Based Workflow** - Research → Setup → Implement → Verify → Complete',
  new_string: '**Key Optimizations Applied**:\n\n1. **Parallel Context Loading** - Load multiple files simultaneously (10-20x speedup)\n2. **Extended Thinking** - Use 16K budget for complex tasks, none for mechanical\n3. **1M Context Window** - Available in Claude Code for large features (verified 2026-01-15)\n   - Use for features >200K tokens (spec + plan + tasks + implementation files)\n   - Premium pricing: 2x input / 1.5x output tokens\n   - Eliminates progressive disclosure for most features\n4. **Error-First TDD** - Write tests, run to get error, fix ONLY that error, repeat\n5. **Minimal Implementation** - OUT OF SCOPE list prevents over-engineering\n6. **State Tracking** - Mark tasks [X] immediately after completion\n7. **Phase-Based Workflow** - Research → Setup → Implement → Verify → Complete'
);
```

### Change Location 2: Update Notes Section

**File**: `.claude/commands/implement-sonnet-4-5.md`
**Line**: 666-667

**Current**:

```markdown
- **Context windows**: 200K (standard) or 1M (available in Claude Code, premium pricing: 2x input/1.5x output)
- For features >200K: Use 1M context or progressive disclosure (chunk into phases)
```

**New**:

```markdown
- **Context windows**: 200K (standard) or 1M (see optimization #3 above)
- For features >200K: See "1M Context Window" in Key Optimizations
```

**Use Edit tool**:

```typescript
Edit(
  file_path: '.claude/commands/implement-sonnet-4-5.md',
  old_string: '- **Context windows**: 200K (standard) or 1M (available in Claude Code, premium pricing: 2x input/1.5x output)\n- For features >200K: Use 1M context or progressive disclosure (chunk into phases)',
  new_string: '- **Context windows**: 200K (standard) or 1M (see optimization #3 above)\n- For features >200K: See "1M Context Window" in Key Optimizations'
);
```

---

## Phase 3: Optimization 2 - Add Beta Feature Reference

**Goal**: Document which beta features are used and link to verification results

### Change Location: Reference Section

**File**: `.claude/commands/implement-sonnet-4-5.md`
**Line**: 28

**Current**:

```markdown
**Reference**: See `prompt-engineering/CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md` for detailed optimization strategies
```

**New**:

```markdown
**References**:

- **Optimization Guide**: `prompt-engineering/CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md` - Detailed strategies
- **Beta Features** (verified 2026-01-15): `prompt-engineering/README.md#beta-feature-availability`
  - ✅ **Extended Thinking** (1K-64K budgets) - Used in phases 1, 3, 4 (lines 40, 219, 406)
  - ✅ **1M Context Window** - Available for large features (optimization #3)
  - ✅ **Structured Outputs** - Available but not yet implemented in this command
  - ❌ **Effort Parameter** - Requires API key (unavailable for subscription-only users)
```

**Use Edit tool**:

```typescript
Edit(
  file_path: '.claude/commands/implement-sonnet-4-5.md',
  old_string: '**Reference**: See `prompt-engineering/CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md` for detailed optimization strategies',
  new_string: '**References**:\n\n- **Optimization Guide**: `prompt-engineering/CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md` - Detailed strategies\n- **Beta Features** (verified 2026-01-15): `prompt-engineering/README.md#beta-feature-availability`\n  - ✅ **Extended Thinking** (1K-64K budgets) - Used in phases 1, 3, 4 (lines 40, 219, 406)\n  - ✅ **1M Context Window** - Available for large features (optimization #3)\n  - ✅ **Structured Outputs** - Available but not yet implemented in this command\n  - ❌ **Effort Parameter** - Requires API key (unavailable for subscription-only users)'
);
```

---

## Phase 4: Verification

**Goal**: Confirm changes are correct and complete

### Step 4.1: Read Modified Sections

**Execute in SINGLE message** (parallel tool use):

```typescript
Read('.claude/commands/implement-sonnet-4-5.md', (offset = 19), (limit = 20)); // Verify key optimizations
Read('.claude/commands/implement-sonnet-4-5.md', (offset = 28), (limit = 12)); // Verify references
Read('.claude/commands/implement-sonnet-4-5.md', (offset = 665), (limit = 5)); // Verify notes update
```

### Step 4.2: Verification Checklist

- [ ] Key optimizations now has 7 items (was 6)
- [ ] Item #3 is "1M Context Window" with 3 sub-bullets
- [ ] References section is now plural with 2 main items
- [ ] Beta features section lists all 4 features with status icons
- [ ] Notes section references optimization #3 (not duplicating content)

### Step 4.3: Check for Broken References

```bash
# Verify markdown links exist
grep -q "prompt-engineering/CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md" .claude/commands/implement-sonnet-4-5.md
grep -q "prompt-engineering/README.md#beta-feature-availability" .claude/commands/implement-sonnet-4-5.md
```

**Expected**: Both commands exit with code 0 (found)

---

## Phase 5: Commit Changes

**Goal**: Create single logical commit with clear message

### Commit Message

```bash
git add .claude/commands/implement-sonnet-4-5.md

git commit -m "$(cat <<'EOF'
feat(commands): promote 1M context and document beta features in implement-sonnet-4-5

Enhance visibility of major Claude Code capabilities in implementation command.

OPTIMIZATION 1: Promote 1M Context Window
- Move from notes (line 666) to key optimizations (new #3)
- Add detailed sub-bullets: use case, pricing, benefits
- Update notes section to reference optimization #3

OPTIMIZATION 2: Document Beta Feature Availability
- Expand "Reference" to "References" section
- Add beta features subsection with verification link
- List all 4 features with status and usage in command:
  ✅ Extended Thinking - Used (lines 40, 219, 406)
  ✅ 1M Context - Available (optimization #3)
  ✅ Structured Outputs - Available (not yet used)
  ❌ Effort Parameter - Unavailable (requires API key)

IMPACT:
- Users immediately see 1M context capability (was buried)
- Clear visibility into which beta features are actively used
- Links to verification results for feature availability details

RISK: None (documentation only, no behavior changes)

Based on: .claude/commands/OPTIMIZATION_OPPORTUNITIES.md analysis
EOF
)"
```

---

## Success Criteria

**Command now clearly shows**:

1. ✅ 1M context window as key optimization (#3)
2. ✅ Beta feature availability with verification links
3. ✅ Which features are actively used in the command
4. ✅ Notes section doesn't duplicate information

**File structure**:

- Key optimizations: 7 items (was 6)
- References: 2 sections (was 1)
- Notes: References optimization #3 (no duplication)

---

## Rollback Procedure

If changes cause issues:

```bash
# Revert commit
git revert HEAD

# Or reset to before changes
git reset --hard HEAD~1
```

**Risk**: Extremely low - documentation-only changes cannot break functionality

---

## Next Steps (Optional)

After implementing these high-priority changes:

1. **Test with users** - Gather feedback on visibility improvements
2. **Monitor usage** - See if 1M context adoption increases
3. **Consider structured outputs** - Medium priority enhancement (20 min)
   - See `OPTIMIZATION_OPPORTUNITIES.md` for detailed analysis
   - Requires schema design + fallback logic
   - Optional reliability improvement for task parsing

---

## Time Estimates

| Phase                            | Duration | Cumulative |
| -------------------------------- | -------- | ---------- |
| **Phase 1: Read**                | 30 sec   | 0:30       |
| **Phase 2: Edit Optimization 1** | 2 min    | 2:30       |
| **Phase 3: Edit Optimization 2** | 1 min    | 3:30       |
| **Phase 4: Verification**        | 2 min    | 5:30       |
| **Phase 5: Commit**              | 1 min    | 6:30       |

**Total**: ~7 minutes (as estimated)

---

## Sonnet 4.5 Optimizations Applied

✅ **Parallel Tool Use**

- Phase 1: Load 3 sections simultaneously
- Phase 4: Verify 3 sections simultaneously

✅ **Extended Thinking**: Not needed (mechanical edits, no complex reasoning)

✅ **Clear Phases**: 5 distinct phases with specific goals

✅ **Verification Built-In**: Phase 4 validates all changes

✅ **Minimal Implementation**: Only 2 high-priority changes, no scope creep

---

**Ready to implement**: All steps documented, no ambiguity, zero risk
