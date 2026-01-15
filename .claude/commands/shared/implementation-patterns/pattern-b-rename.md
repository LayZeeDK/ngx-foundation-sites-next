# Pattern B: Rename/Update

Rename an identifier or update a value across multiple files.

## Purpose

Consistently rename or update occurrences across the codebase.

## When to Use

- Task says "rename", "update", or "change"
- Multiple files may be affected
- Need to ensure no occurrences are missed

## Steps

### Step 1: Identify All Occurrences

Search in relevant file types:

1. Implementation files (`.ts`, `.component.ts`, `.directive.ts`)
2. Template files (`.html`)
3. Test/story files (`.spec.ts`, `.stories.ts`)

```typescript
Grep(
  pattern: "oldName",
  path: "packages/[project]/src/lib/[component]/",
  output_mode: "files_with_matches"
)
```

### Step 2: Sort Occurrences by File

Group by file path and order:

1. Implementation files (source of truth)
2. Templates (depend on implementation)
3. Tests (verify implementation)
4. Stories (document implementation)

### Step 3: Edit Each File Sequentially

```typescript
// File 1: Implementation
Edit(
  file_path: "[path]",
  old_string: "[exact old text with context]",
  new_string: "[exact new text with context]"
)

// File 2: Template
Edit(
  file_path: "[path]",
  old_string: "[exact old text]",
  new_string: "[exact new text]"
)

// Continue for all files...
```

**Tip**: Use `replace_all: true` for simple renames within a single file.

### Step 4: Verify Complete Replacement

```typescript
Grep(
  pattern: "oldName",
  path: "packages/[project]/src/lib/[component]/",
  output_mode: "files_with_matches"
)
// Should return no matches
```

### Step 5: Run Tests

```bash
npm run test -- [component-name]
npm run lint
```

## Success Criteria

- [ ] All occurrences replaced (grep returns empty)
- [ ] TypeScript compilation succeeds
- [ ] Tests pass
- [ ] Linting passes
- [ ] No commented-out old names (unless intentional documentation)

## Common Variations

### Rename with Type Update

If renaming also changes the type:

```typescript
// Old
readonly oldName = input<string>('');

// New
readonly newName = input<boolean>(false);
```

Update both name AND type in all usages.

### Rename Across Public API

If renaming affects public API:

1. Update index.ts exports
2. Update any documentation
3. Consider adding to BREAKING CHANGES in commit
4. Update CHANGELOG.md

### Case-Sensitive Rename

Be careful with case variations:

- `oldName` (camelCase in code)
- `old-name` (kebab-case in templates)
- `OldName` (PascalCase in types)

Search for all case variations.

## Error Recovery

If some occurrences missed:

1. Re-run grep to find remaining
2. Check for case variations
3. Check in comments and strings
4. Verify template bindings use correct case
