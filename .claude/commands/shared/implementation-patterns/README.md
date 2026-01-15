# Implementation Patterns

Reusable implementation patterns for common task types.

## Pattern Index

| Pattern                               | Use Case                              | Complexity |
| ------------------------------------- | ------------------------------------- | ---------- |
| [Pattern A](pattern-a-add-method.md)  | Add method/property to existing class | Simple     |
| [Pattern B](pattern-b-rename.md)      | Rename/update across files            | Simple     |
| [Pattern C](pattern-c-add-test.md)    | Add Storybook test with play function | Simple     |
| [Pattern D](pattern-d-update-docs.md) | Update documentation files            | Simple     |
| [Pattern E](pattern-e-refactor.md)    | Refactor code (moderate complexity)   | Moderate   |

## How Patterns Are Used

### Model-Specific Application

Each model applies patterns differently based on their optimization strategy:

| Model          | Pattern Application                                             |
| -------------- | --------------------------------------------------------------- |
| **Sonnet 4.5** | Error-first TDD - write test, run to fail, apply pattern to fix |
| **Opus 4.5**   | First-try correctness - apply pattern fully, then verify        |
| **Haiku 4.5**  | Step-bounded - follow pattern steps mechanically (3-5 max)      |

### Pattern Selection

Match tasks to patterns by analyzing the task description:

```
Task: "Add down() method to accordion-item" → Pattern A
Task: "Rename multiExpandable to multiExpand" → Pattern B
Task: "Add Storybook test for toggle()" → Pattern C
Task: "Update API documentation" → Pattern D
Task: "Extract method to separate class" → Pattern E
```

## Pattern Structure

Each pattern follows this structure:

1. **Purpose** - What this pattern accomplishes
2. **When to Use** - Task characteristics that match
3. **Steps** - Ordered implementation steps
4. **Verification** - How to verify success
5. **Success Criteria** - Checklist for completion

## Customization Points

Patterns are generic but have customization points:

- **File paths**: Specific to your project structure
- **Code style**: Match existing patterns in codebase
- **Test framework**: Storybook vs Jest vs Vitest
- **Verification commands**: Project-specific npm scripts
