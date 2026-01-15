# Pattern D: Update Documentation

Update documentation files (Markdown, JSDoc, comments).

## Purpose

Keep documentation in sync with implementation changes.

## When to Use

- Task says "update docs", "document", or "add to README"
- Implementation changes require documentation updates
- API changes need to be reflected in docs

## Steps

### Step 1: Load Documentation File

```typescript
Read('[doc-file].md');
// OR for inline docs
Read('[source-file].ts');
```

### Step 2: Identify Update Location

Analyze document structure (3-step):

1. Find relevant section header
2. Locate insertion/replacement point
3. Verify context matches task description

### Step 3: Generate Documentation Content

Follow existing documentation style:

- Use consistent heading levels
- Match existing code block formatting
- Include examples if applicable
- Maintain markdown formatting

### Step 4: Update Using Edit

```typescript
Edit(
  file_path: "[doc path]",
  old_string: "[section to update - include enough context]",
  new_string: "[updated section with same context boundaries]"
)
```

### Step 5: Verify

- [ ] Markdown syntax valid
- [ ] Code examples formatted correctly
- [ ] Links are valid (if any)
- [ ] Consistent with surrounding documentation
- [ ] No broken references

## Success Criteria

- [ ] Content is clear and accurate
- [ ] Examples work (if provided)
- [ ] Formatting is consistent with document
- [ ] No broken links
- [ ] Spelling and grammar correct

## Common Documentation Types

### API Documentation (JSDoc)

````typescript
/**
 * Brief description of the method.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @example
 * ```typescript
 * component.methodName('value');
 * ```
 * @public
 */
````

### README Section

```markdown
## Feature Name

Brief description of the feature.

### Usage

\`\`\`typescript
// Example code
\`\`\`

### Options

| Option       | Type   | Default   | Description  |
| ------------ | ------ | --------- | ------------ |
| `optionName` | `type` | `default` | What it does |
```

### Changelog Entry

```markdown
## [Version] - YYYY-MM-DD

### Added

- New feature description

### Changed

- What changed and why

### Fixed

- Bug that was fixed

### Breaking Changes

- **component**: Old API → New API
  - Migration: How to update
```

### Inline Comment

```typescript
// Explanation of why this code exists
// or how it works for non-obvious logic
```

## Documentation Best Practices

1. **Be concise** - Say what's needed, no more
2. **Use examples** - Show, don't just tell
3. **Stay current** - Update when code changes
4. **Link related** - Cross-reference related docs
5. **Test examples** - Ensure code samples work

## Error Recovery

If documentation update fails:

1. Check markdown syntax (use linter if available)
2. Verify code examples compile
3. Check links resolve correctly
4. Preview rendered markdown
