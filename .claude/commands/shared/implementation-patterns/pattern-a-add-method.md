# Pattern A: Add Method/Property

Add a method or property to an existing class.

## Purpose

Insert new functionality into an existing class while maintaining code style consistency.

## When to Use

- Task says "add", "create", or "implement" a method/property
- Target class already exists
- Single file modification (primarily)
- Clear method signature from task description

## Steps

### Step 1: Load Target File

```typescript
Read(file_path);
```

### Step 2: Identify Insertion Point

Analyze class structure (3-step reasoning):

1. Find similar methods in the same class
2. Identify class structure (properties → methods → end)
3. Locate insertion point (end of methods section, before closing brace)

### Step 3: Extract Pattern from Similar Method

- Copy JSDoc format
- Copy method signature style
- Copy implementation structure
- Note visibility modifiers used

### Step 4: Generate New Method

Follow the extracted pattern:

```typescript
/**
 * [Description from task]
 * @public
 */
methodName(params): ReturnType {
  // Implementation following existing patterns
}
```

### Step 5: Insert Using Edit Tool

```typescript
Edit(
  file_path: "[absolute path]",
  old_string: "[exact closing brace context]",
  new_string: "[new method + closing brace]"
)
```

**Note**: Include enough context in `old_string` to make it unique.

### Step 6: Verify

```bash
# TypeScript compilation
npx tsc --noEmit --project [tsconfig-path]

# If tests exist for this component
npm run test -- [component-name]
```

## Success Criteria

- [ ] Method added with JSDoc matching existing style
- [ ] TypeScript compilation succeeds
- [ ] Method signature matches task requirements
- [ ] Visibility modifier correct (public/protected/private)
- [ ] Existing tests still pass
- [ ] New method follows existing code patterns

## Common Variations

### Adding a Property (Signal)

```typescript
readonly propertyName = input(defaultValue);
// OR
readonly propertyName = signal(defaultValue);
```

### Adding an Output

```typescript
readonly eventName = output<PayloadType>();
```

### Adding a Computed Property

```typescript
readonly computedName = computed(() => {
  return this.dependency() ? 'value1' : 'value2';
});
```

## Error Recovery

If insertion fails:

1. Check `old_string` is unique in file
2. Verify closing brace context is correct
3. Try including more surrounding context
