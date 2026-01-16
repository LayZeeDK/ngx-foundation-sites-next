# Commit Message Templates

Conventional commit formats for implementation commands.

## Standard Feature Commit

```bash
git commit -m "$(cat <<'EOF'
feat([component]): implement [feature name]

Implement [N] tasks from tasks.md:
- [T1.1 brief description]
- [T1.2 brief description]
- [T1.3 brief description]

Tests: [N] new tests (all passing)
Coverage: [X]% (meets requirement)

[If applicable]
BREAKING CHANGES:
- **[component]**: [description of breaking change]
  - Migration: [how to update code]

Closes: #[issue-number]

Co-Authored-By: [Model Name] <noreply@anthropic.com>
EOF
)"
```

## Model-Specific Co-Author Lines

Use the appropriate co-author based on the model:

| Model             | Co-Author Line                                              |
| ----------------- | ----------------------------------------------------------- |
| Claude Sonnet 4.5 | `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` |
| Claude Opus 4.5   | `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`   |
| Claude Haiku 4.5  | `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`  |

## Breaking Change Commit

```bash
git commit -m "$(cat <<'EOF'
fix([component]): resolve P0 gaps - [brief description]

Implement P0 gap remediations from tasks.md:

- [GAP-ID]: [Description] (BREAKING CHANGE)
  - Update [files affected]
  - API now matches [standard] ([requirement IDs])

BREAKING CHANGES:
- **[component]**: [Old API] → [New API]
  - Migration: Replace [old usage] with [new usage] in templates

Fixes: [GAP-IDs]
Time: [X] minutes (estimated: [Y] minutes)

Co-Authored-By: [Model Name] <noreply@anthropic.com>
EOF
)"
```

## Per-Gap Remediation Commit

Use this template when implementing individual gaps from REMEDIATION_CHECKLIST.md:

```bash
git commit -m "$(cat <<'EOF'
[type]([component]): resolve GAP-[N] - [brief description]

Implement GAP-[N] from REMEDIATION_CHECKLIST.md:
- [Step 1 description]
- [Step 2 description]
- [Step 3 description]

Verification:
- ✅ Tests passing ([X]/[X])
- ✅ Linting clean
- ✅ Build successful
- ✅ E2E passing (if applicable)
- ✅ Accessibility clean (if applicable)

Violates: [FR-XXX], [CA-XXX]
Priority: [P0/P1/P2]
Estimated: [X] minutes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

**Type Selection**:
- P0 gaps → `fix([component])`
- P1 gaps → `feat([component])` or `refactor([component])`
- P2 gaps → `chore([component])` or `style([component])`

**Example**:

```bash
git commit -m "$(cat <<'EOF'
fix(accordion): resolve GAP-1 - add Foundation API methods

Implement GAP-1 from REMEDIATION_CHECKLIST.md:
- Add toggle() method to NfsAccordionItemDef
- Add down() method to NfsAccordionItemDef
- Add up() method to NfsAccordionItemDef

Verification:
- ✅ Tests passing (12/12)
- ✅ Linting clean
- ✅ Build successful

Violates: FR-075, CA-009
Priority: P0
Estimated: 10 minutes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Priority-Based Commits

### P0 (BLOCKING) Commit

```bash
git commit -m "$(cat <<'EOF'
fix([component]): resolve P0 blocking issues

Implement P0 (BLOCKING) tasks:
- [Task description 1]
- [Task description 2]

Tests: [N] new (all passing)
Priority: P0 - BLOCKING

Co-Authored-By: [Model Name] <noreply@anthropic.com>
EOF
)"
```

### P1 (IMPORTANT) Commit

```bash
git commit -m "$(cat <<'EOF'
feat([component]): resolve P1 improvements

Implement P1 (IMPORTANT) tasks:
- [Task description 1]
- [Task description 2]

Tests: [N] new (all passing)
Priority: P1 - IMPORTANT

Co-Authored-By: [Model Name] <noreply@anthropic.com>
EOF
)"
```

### P2 (POLISH) Commit

```bash
git commit -m "$(cat <<'EOF'
chore([component]): resolve P2 polish tasks

Implement P2 (POLISH) tasks:
- [Task description 1]
- [Task description 2]

Priority: P2 - POLISH

Co-Authored-By: [Model Name] <noreply@anthropic.com>
EOF
)"
```

## Haiku-Optimized Commit (Pattern-Based)

```bash
git commit -m "$(cat <<'EOF'
feat([component]): implement [X] Haiku-optimized tasks

Implemented using Claude Haiku 4.5 for focused, bounded tasks:

Pattern A (Add Method): [Y] tasks
- T001: [description]
- T002: [description]

Pattern B (Rename): [Z] tasks
- T010: [description]

Pattern C (Add Test): [W] tasks
- T020: [description]

**Performance Metrics**:
- Execution time: [X] minutes (vs estimated [Y] min with Sonnet)
- Speedup: [Z]× faster
- Cost: $[amount] (66% savings: $[saved])
- Quality: All tests passing, 0 compilation errors

Relates to: haiku-suitable-tasks.md

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
EOF
)"
```

## Completion Summary Template

Include this summary in final commit or PR description:

```markdown
🎉 Implementation Complete!

**Summary**:

- Tasks completed: [X]/[Y]
- Priority: [P0/P1/P2 breakdown]
- Implementation time: [estimated] vs [actual]
- Tests: ✅ [X] passing
- Linting: ✅ Clean
- Build: ✅ Successful
- Commits: [N] created

**Updated Documents**:

- ✅ tasks.md (all tasks marked [X])
- ✅ Git history (conventional commits)

**Next Steps**:

- Create PR for review
- Run gap analysis to verify no new gaps introduced
```

## Git Safety Protocol

Before committing, follow these rules:

- **NEVER** update the git config
- **NEVER** run destructive/irreversible git commands (like push --force, hard reset) unless explicitly requested
- **NEVER** skip hooks (--no-verify, --no-gpg-sign) unless explicitly requested
- **NEVER** force push to main/master - warn if requested
- **Avoid** git commit --amend unless ALL conditions are met:
  1. User explicitly requested amend, OR commit SUCCEEDED but pre-commit hook auto-modified files
  2. HEAD commit was created by you in this conversation
  3. Commit has NOT been pushed to remote
- If commit FAILED or was REJECTED by hook, **NEVER** amend - fix the issue and create a NEW commit
