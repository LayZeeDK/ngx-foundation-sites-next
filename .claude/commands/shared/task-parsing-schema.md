# Task Parsing Schema

Structured JSON schema for reliable task extraction from `tasks.md`.

## JSON Schema Definition

```json
{
  "type": "object",
  "properties": {
    "phases": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "enum": ["Setup", "Foundational", "Tests", "Core Implementation", "Integration", "Polish", "Verification", "Documentation"]
          },
          "tasks": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": { "type": "string", "pattern": "^T\\d{3}[a-z]?$" },
                "description": { "type": "string" },
                "filePaths": { "type": "array", "items": { "type": "string" }, "default": [] },
                "isParallel": { "type": "boolean", "default": false },
                "dependencies": { "type": "array", "items": { "type": "string" }, "default": [] },
                "complexity": { "type": "string", "enum": ["simple", "moderate", "complex"], "default": "moderate" },
                "status": { "type": "string", "enum": ["pending", "completed"], "default": "pending" }
              },
              "required": ["id", "description"]
            }
          }
        },
        "required": ["name", "tasks"]
      }
    }
  },
  "required": ["phases"]
}
```

## Parsing Instructions

When reading tasks.md, extract tasks into the validated JSON structure above. For each task:

1. **Extract task ID**: Look for pattern `T001`, `T002a`, etc. (required)
2. **Extract description**: The text after the task ID (required)
3. **Detect parallel marker**: If line contains `[P]`, set `isParallel: true`
4. **Extract file paths**: Look for paths like `packages/...` or `src/...` in description (optional)
5. **Detect dependencies**: Look for "depends on T00X", "after T00X", or "Blocking" (optional)
6. **Extract status**: `[x]` = `completed`, `[ ]` = `pending`
7. **Infer complexity**:
   - "simple" - Single file, <10 lines, verification tasks
   - "moderate" - Multiple files OR tests OR 10-50 lines
   - "complex" - State management, accessibility, error handling, >50 lines
8. **Group by phase**: Setup → Foundational → Tests → Core → Integration → Polish

## Benefits of Structured Parsing

| Benefit             | Description                                          |
| ------------------- | ---------------------------------------------------- |
| **Reliability** ✅  | Guaranteed schema validation, no markdown edge cases |
| **Performance** ⚡  | Single-pass extraction vs multi-read parsing         |
| **Type Safety** 🔒  | Pattern validation for task IDs (T001, T002a)        |
| **Maintainable** 🔧 | Schema documents expected task structure             |

## Usage in Implementation Loop

After parsing, iterate through `phases → tasks`:

```typescript
for (const phase of parsedTasks.phases) {
  // Phase: Setup, Tests, Core Implementation, etc.
  for (const task of phase.tasks) {
    if (task.status === 'completed') continue; // Skip completed tasks

    // Use structured data for smart decisions
    if (task.isParallel) {
      /* can batch with other [P] tasks */
    }
    if (task.dependencies.length > 0) {
      /* verify deps completed first */
    }
    if (task.complexity === 'complex') {
      /* use extended thinking */
    }

    // Implement task...
  }
}
```

## Fallback Method

⚠️ **If structured outputs fail** (beta feature unavailable or error):

Fall back to text-based parsing:

1. Read tasks.md sequentially
2. Parse phase headers (`## Phase N: Name`)
3. Extract task lines (`- [ ] T00X [P?] Description`)
4. Manually extract IDs, descriptions, markers
5. Build task array in memory

**Fallback preserves all current behavior** - no functionality loss if beta feature unavailable.

## Beta Feature Note

Structured outputs is a beta feature (verified 2026-01-15). If unavailable, commands automatically fall back to text-based parsing with no loss of functionality.
