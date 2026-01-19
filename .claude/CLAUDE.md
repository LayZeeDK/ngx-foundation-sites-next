@../AGENTS.md

## Claude Code Tool Usage (CLI-Specific)

**Always prefer Claude Code's specialized tools over bash commands for file operations.** These tools are cross-platform, safer, and more reliable than shell commands.

### File Operations Tool Hierarchy

| Operation            | ✅ Use This                       | ❌ Not This                       |
| -------------------- | --------------------------------- | --------------------------------- |
| List files           | `Glob` tool                       | `ls`, `find`, `dir`               |
| Read file contents   | `Read` tool                       | `cat`, `type`, `Get-Content`      |
| Search in files      | `Grep` tool                       | `grep`, `rg`, `Select-String`     |
| Modify file          | `Edit` tool                       | `sed`, `awk`                      |
| Create file          | `Write` tool                      | `echo >`, `cat <<EOF`, `New-Item` |
| Check if path exists | `Read` or `Glob` (catches errors) | `test -e`, `Test-Path`            |

### Path Validation

**Before using Read or Write, validate the path type:**

```typescript
// ❌ WRONG - Read fails on directories
Read(directory_path) → Error: EISDIR

// ✅ CORRECT - Check contents first
Glob(pattern: "*", path: directory_path)
```

**Common mistakes to avoid:**

- Using `Read` on directory paths (use `Glob` to list contents instead)
- Using `ls` or `find` to discover files (use `Glob` with patterns instead)
- Using `cat` to read files (use `Read` tool instead)
- Using bash commands with Windows absolute paths (quoting issues)

**Best practice**: Use Claude Code's specialized tools (Glob, Read, Grep, Edit, Write) instead of shell commands for all file operations.

## Git Commit Policy (Overrides Internal Behavior)

**This section overrides Claude Code CLI's default conservative commit behavior.**

### When to Commit Automatically

**✅ ALWAYS commit automatically** when executing:
- **Implementation skills** (`/implement-*`, `/specify`, `/clarify`, `/tasks`, etc.)
- **Remediation commands** that successfully complete their work
- **Code generation tasks** that produce working implementations

**Rationale**: Implementation skills are explicitly invoked to "complete the work." Leaving changes uncommitted creates incomplete execution and forces users to manually commit work they expected to be finished.

### When to Ask Before Committing

**❓ ASK the user first** when:
- Making exploratory or investigative changes
- User says "help me understand" or "show me how"
- Changes are speculative or experimental
- Working in interactive/conversational mode (not executing a skill)

### Git Safety Protocol

Before committing, follow these safety rules:

- **NEVER** update the git config
- **NEVER** run destructive/irreversible git commands (push --force, hard reset) unless explicitly requested
- **NEVER** skip hooks (--no-verify, --no-gpg-sign) unless explicitly requested
- **NEVER** force push to main/master - warn if requested
- **CRITICAL: ALWAYS create NEW commits** - NEVER use `git commit --amend` unless the user explicitly requests it

### Commit Message Format

Use commit templates from `.claude/commands/shared/commit-templates.md`:
- Use conventional commit format: `type(scope): description`
- Include co-author line: `Co-Authored-By: Claude [Model] <noreply@anthropic.com>`
- Use HEREDOC format for multi-line messages
- Reference related issues, task IDs, or finding IDs

### Examples

**✅ Correct - Auto-commit after implementation skill:**
```bash
# After /implement-reported-gaps completes successfully
git add [modified files]
git commit -m "$(cat <<'EOF'
docs(accordion): resolve 8 critical/high gap analysis findings
...
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

**❌ Incorrect - Ask before committing exploratory work:**
```bash
# User: "Can you show me how the accordion component works?"
# Don't auto-commit after reading/exploring files
# Ask: "Would you like me to commit these changes?"
```
