# Pattern C: Add Test (Storybook)

Add a Storybook story with play function for interaction testing.

## Purpose

Create an interactive test that documents and verifies component behavior.

## When to Use

- Task says "add test", "create story", or "verify behavior"
- Component has Storybook stories file
- Testing user interactions or state changes

## Steps

### Step 1: Load Story File

```typescript
Read('[component].stories.ts');
```

### Step 2: Identify Test Pattern

Analyze existing stories (3-step):

1. Find stories with play functions
2. Extract play function structure
3. Identify common patterns (within, userEvent, expect)

### Step 3: Generate New Test Story

```typescript
export const [StoryName]: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Get element by semantic role
    const element = canvas.getByRole('[role]', { name: /[name]/ });

    // 2. Perform user action
    await userEvent.[action](element);

    // 3. Assert expected result
    await expect(element).to[assertion];
  },
};
```

### Step 4: Insert Story

Add before export default or at end of stories:

```typescript
Edit(
  file_path: "[stories path]",
  old_string: "[insertion context - e.g., last story definition]",
  new_string: "[existing content]\n\n[new story]"
)
```

### Step 5: Verify

```bash
# Run Storybook tests for specific story
npx nx test-storybook ngx-foundation-sites --story="[StoryName]"
```

## Success Criteria

- [ ] Story added with play function
- [ ] Uses semantic queries (getByRole, getByText)
- [ ] Uses userEvent for interactions
- [ ] Uses expect for assertions
- [ ] Test passes in Storybook
- [ ] No AXE accessibility violations

## Common Testing Patterns

### Click Interaction

```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button', { name: /toggle/i });

  await userEvent.click(button);
  await expect(button).toHaveAttribute('aria-expanded', 'true');
};
```

### Keyboard Interaction

```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const element = canvas.getByRole('button');

  element.focus();
  await userEvent.keyboard('{Enter}');
  await expect(element).toHaveAttribute('aria-expanded', 'true');
};
```

### State Change Verification

```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const panel = canvas.getByRole('region');

  // Initial state
  await expect(panel).not.toBeVisible();

  // Trigger change
  await userEvent.click(canvas.getByRole('button'));

  // Final state
  await expect(panel).toBeVisible();
};
```

### Accessibility Check

```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const element = canvas.getByRole('button');

  // Interaction
  await userEvent.click(element);

  // Verify ARIA
  await expect(element).toHaveAttribute('aria-expanded', 'true');
  await expect(element).toHaveAccessibleName();
};
```

## Query Priority

Use queries in this order (most to least preferred):

1. `getByRole` - Semantic, accessible
2. `getByLabelText` - Form elements
3. `getByText` - Text content
4. `getByTestId` - Last resort

## Error Recovery

If test fails:

1. Check element is rendered (not conditionally hidden)
2. Verify role and name match actual DOM
3. Check for async timing issues (add await)
4. Inspect rendered DOM in Storybook
