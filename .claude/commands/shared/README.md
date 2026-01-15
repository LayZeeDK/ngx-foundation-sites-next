# Shared Command Resources

This directory contains reusable resources shared across implementation commands.

## Contents

| Resource                   | Description                                 | Used By           |
| -------------------------- | ------------------------------------------- | ----------------- |
| `task-parsing-schema.md`   | JSON schema for structured task extraction  | Sonnet, Opus      |
| `verification-workflow.md` | Standard test/lint/build verification steps | All               |
| `ignore-patterns.md`       | Technology-specific ignore file patterns    | All               |
| `commit-templates.md`      | Conventional commit message formats         | All               |
| `error-handling.md`        | Standard error handling patterns            | All               |
| `implementation-patterns/` | Reusable implementation patterns (A-E)      | Haiku, extensible |

## Usage

Commands reference these shared resources to:

1. **Reduce duplication** - Common patterns maintained in one place
2. **Ensure consistency** - All commands use identical verification workflows
3. **Simplify maintenance** - Update once, applies everywhere

## Pattern Reference

Commands reference shared patterns with a Markdown include syntax:

```markdown
**Reference**: See `shared/verification-workflow.md` for detailed steps
```

Claude Code interprets these references and loads the appropriate context when needed.

## Versioning

These shared resources should be updated when:

- New verification steps are added to the workflow
- Technology-specific patterns are discovered
- Commit message formats evolve
- Implementation patterns are refined

All changes should be tested with each command that references them.
