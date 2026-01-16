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
