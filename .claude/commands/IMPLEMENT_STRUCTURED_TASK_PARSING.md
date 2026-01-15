# Implementation Plan: Structured Task Parsing for `/implement-sonnet-4-5`

**Date**: 2026-01-15
**Optimized For**: Claude Sonnet 4.5
**Estimated Duration**: 20 minutes
**Risk Level**: Low (includes fallback to current behavior)
**Beta Feature**: Structured Outputs (verified available via `--json-schema` flag)

---

## Overview

Replace text-based task parsing with structured JSON parsing using the `--json-schema` beta feature for improved reliability and validation.

**Changes**:
1. Replace Step 3.0 with structured parsing approach (lines 240-248)
2. Add JSON schema for task validation
3. Include fallback for beta feature stability
4. Update references to mention structured parsing capability

**Impact**: Reduces task parsing errors, validates structure, improves maintainability.

---

## Phase 1: Context Gathering (Parallel + Extended Thinking)

**Goal**: Understand current implementation and sample tasks.md structure

<phase name="context_gathering" extended_thinking="8K">

### Step 1.1: Parallel Load Current Sections

**Execute in SINGLE message** (parallel tool use):

```typescript
Read('.claude/commands/implement-sonnet-4-5.md', offset=240, limit=60);  // Current Step 3.0
Read('.claude/commands/implement-sonnet-4-5.md', offset=28, limit=10);   // References section
```

### Step 1.2: Load Sample Tasks File

Find and read a sample tasks.md to understand actual structure:

```typescript
Glob(pattern: "**/tasks.md");
// Select most recent tasks.md from results
Read('path/to/recent/tasks.md', limit=100);  // Read first 100 lines for structure
```

### Step 1.3: Extended Thinking - Schema Design

**Use extended thinking** (8K budget) to design optimal schema:

<extended_thinking_prompt>

Analyze the tasks.md structure and design a JSON schema that:

1. **Captures all essential information**:
   - Task IDs (pattern: T001, T002a, etc.)
   - Descriptions (single line)
   - File paths (optional array)
   - Parallel markers (detect [P] suffix)
   - Dependencies (detect "depends on T00X")
   - Phase grouping (Setup, Tests, Core, Integration, Polish)

2. **Validates structure**:
   - Task IDs must match pattern: ^T\\d{3}[a-z]?$
   - Phases must have valid names
   - Dependencies must reference existing task IDs
   - Required vs optional fields

3. **Handles edge cases**:
   - Missing file paths (make optional)
   - No explicit dependencies (empty array)
   - Phase headers vs task items
   - Comments or notes in tasks.md

4. **Balances strictness**:
   - Strict enough to catch errors
   - Flexible enough for variations
   - Required fields vs optional fields

After thinking, finalize the JSON schema structure.

</extended_thinking_prompt>

**Expected Result**: Validated schema design ready for implementation

</phase>

**Duration**: 3-4 minutes

---

## Phase 2: Schema Design and Documentation

**Goal**: Create the JSON schema and parsing instructions

### Step 2.1: Define JSON Schema

**Schema design** (based on Phase 1 extended thinking):

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "phases": {
      "type": "array",
      "description": "Logical phases for task execution",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Phase name (Setup, Tests, Core, Integration, Polish)",
            "enum": ["Setup", "Tests", "Core Implementation", "Integration", "Polish", "Verification", "Documentation"]
          },
          "tasks": {
            "type": "array",
            "description": "Tasks within this phase",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "description": "Unique task ID (T001, T002a, etc.)",
                  "pattern": "^T\\d{3}[a-z]?$"
                },
                "description": {
                  "type": "string",
                  "description": "Task description (single line)"
                },
                "filePaths": {
                  "type": "array",
                  "description": "Files to modify (optional)",
                  "items": { "type": "string" },
                  "default": []
                },
                "isParallel": {
                  "type": "boolean",
                  "description": "Can run in parallel with other [P] tasks",
                  "default": false
                },
                "dependencies": {
                  "type": "array",
                  "description": "Task IDs this depends on",
                  "items": {
                    "type": "string",
                    "pattern": "^T\\d{3}[a-z]?$"
                  },
                  "default": []
                },
                "complexity": {
                  "type": "string",
                  "description": "Estimated complexity (for extended thinking)",
                  "enum": ["simple", "moderate", "complex"],
                  "default": "moderate"
                },
                "estimatedMinutes": {
                  "type": "number",
                  "description": "Time estimate in minutes",
                  "minimum": 1
                },
                "status": {
                  "type": "string",
                  "description": "Current status",
                  "enum": ["pending", "in_progress", "completed"],
                  "default": "pending"
                }
              },
              "required": ["id", "description"],
              "additionalProperties": false
            },
            "minItems": 1
          }
        },
        "required": ["name", "tasks"],
        "additionalProperties": false
      },
      "minItems": 1
    }
  },
  "required": ["phases"],
  "additionalProperties": false
}
```

### Step 2.2: Create Compact Schema Version

**For embedding in command file** (minified):

```json
{"type":"object","properties":{"phases":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string","enum":["Setup","Tests","Core Implementation","Integration","Polish","Verification","Documentation"]},"tasks":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string","pattern":"^T\\\\d{3}[a-z]?$"},"description":{"type":"string"},"filePaths":{"type":"array","items":{"type":"string"},"default":[]},"isParallel":{"type":"boolean","default":false},"dependencies":{"type":"array","items":{"type":"string","pattern":"^T\\\\d{3}[a-z]?$"},"default":[]},"complexity":{"type":"string","enum":["simple","moderate","complex"],"default":"moderate"}},"required":["id","description"],"additionalProperties":false},"minItems":1}},"required":["name","tasks"],"additionalProperties":false},"minItems":1}},"required":["phases"],"additionalProperties":false}
```

**Duration**: 2-3 minutes

---

## Phase 3: Implementation - Replace Step 3.0

**Goal**: Update command file with structured parsing approach

### Step 3.1: Design New Step 3.0 Content

**New section text**:

```markdown
### Step 3.0: Parse Task Structure with Structured Outputs (Beta)

**Use structured outputs for reliable task extraction** (beta feature with fallback):

<task_parsing_with_structured_outputs>

#### Primary Method: Structured JSON Parsing

**JSON Schema** (validates task structure):

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
            "enum": ["Setup", "Tests", "Core Implementation", "Integration", "Polish", "Verification", "Documentation"]
          },
          "tasks": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": { "type": "string", "pattern": "^T\\\\d{3}[a-z]?$" },
                "description": { "type": "string" },
                "filePaths": { "type": "array", "items": { "type": "string" }, "default": [] },
                "isParallel": { "type": "boolean", "default": false },
                "dependencies": { "type": "array", "items": { "type": "string" }, "default": [] },
                "complexity": { "type": "string", "enum": ["simple", "moderate", "complex"], "default": "moderate" }
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

**Parsing Instructions**:

When reading tasks.md, extract tasks into the validated JSON structure above. For each task:

1. **Extract task ID**: Look for pattern `T001`, `T002a`, etc. (required)
2. **Extract description**: The text after the task ID (required)
3. **Detect parallel marker**: If line ends with `[P]`, set `isParallel: true`
4. **Extract file paths**: Look for file paths in description (optional)
5. **Detect dependencies**: Look for "depends on T00X" or "after T00X" (optional)
6. **Infer complexity**:
   - "simple" - Single file, <10 lines, no tests
   - "moderate" - Multiple files OR tests OR 10-50 lines
   - "complex" - State management, accessibility, error handling, >50 lines
7. **Group by phase**: Setup → Tests → Core → Integration → Polish

**Expected Result**: Validated JSON with all tasks structured and ready for iteration

#### Fallback Method: Text-Based Parsing

⚠️ **If structured outputs fail** (beta feature unavailable or error):

Fall back to text-based parsing:

1. Read tasks.md sequentially
2. Parse phase headers (## Phase Name)
3. Extract task lines (- [ ] T00X: Description)
4. Manually extract IDs, descriptions, markers
5. Build task array in memory

**Fallback preserves all current behavior** - no functionality loss if beta feature unavailable.

</task_parsing_with_structured_outputs>

#### Benefits of Structured Parsing

**Reliability** ✅:
- Guaranteed schema validation
- No parsing errors from markdown formatting variations
- Type-safe task ID pattern validation

**Performance** ⚡:
- Single-pass extraction (no multi-read parsing)
- Validated JSON ready for iteration
- Reduces error rate in task parsing

**Maintainability** 🔧:
- Schema documents expected task structure
- Easier to extend with new task properties
- Clear contract between tasks.md and implementation

#### Usage in Implementation Loop

After parsing, iterate through `phases → tasks`:

```typescript
for (const phase of parsedTasks.phases) {
  console.log(`Starting phase: ${phase.name}`);

  for (const task of phase.tasks) {
    console.log(`Task ${task.id}: ${task.description}`);

    // Use structured data
    if (task.isParallel) { /* handle parallel */ }
    if (task.dependencies.length > 0) { /* check deps */ }
    if (task.complexity === 'complex') { /* use extended thinking */ }

    // Implement task...
  }
}
```
```

### Step 3.2: Execute Replacement

**Use Edit tool**:

```typescript
Edit(
  file_path: '.claude/commands/implement-sonnet-4-5.md',
  old_string: '### Step 3.0: Parse Task Structure from tasks.md\n\nBefore starting the implementation loop, extract and understand:\n\n- **Task phases**: Setup, Tests, Core, Integration, Polish\n- **Task dependencies**: Sequential vs parallel execution rules\n- **Task details**: ID, description, file paths, parallel markers [P]\n- **Execution flow**: Order and dependency requirements',
  new_string: '<INSERT NEW SECTION FROM STEP 3.1 HERE>'
);
```

**Note**: The actual edit will use the complete markdown text designed in Step 3.1

**Duration**: 3-4 minutes

---

## Phase 4: Update References Section

**Goal**: Document structured outputs in beta features list

### Step 4.1: Read Current References

```typescript
Read('.claude/commands/implement-sonnet-4-5.md', offset=28, limit=12);
```

### Step 4.2: Update Structured Outputs Line

**Current**:
```markdown
  - ✅ **Structured Outputs** - Available but not yet implemented in this command
```

**New**:
```markdown
  - ✅ **Structured Outputs** - Used for task parsing in Step 3.0 (lines 240+) with fallback
```

**Use Edit tool**:

```typescript
Edit(
  file_path: '.claude/commands/implement-sonnet-4-5.md',
  old_string: '  - ✅ **Structured Outputs** - Available but not yet implemented in this command',
  new_string: '  - ✅ **Structured Outputs** - Used for task parsing in Step 3.0 (lines 240+) with fallback'
);
```

**Duration**: 1 minute

---

## Phase 5: Verification (Parallel + Extended Thinking)

**Goal**: Validate all changes are correct and complete

<phase name="verification" extended_thinking="4K">

### Step 5.1: Parallel Read Modified Sections

**Execute in SINGLE message**:

```typescript
Read('.claude/commands/implement-sonnet-4-5.md', offset=240, limit=120);  // New Step 3.0 (much longer)
Read('.claude/commands/implement-sonnet-4-5.md', offset=28, limit=12);     // Updated references
```

### Step 5.2: Extended Thinking - Validate Changes

**Use extended thinking** (4K budget) to validate:

<extended_thinking_prompt_validation>

Review the modified sections and verify:

1. **Schema Correctness**:
   - Is the JSON schema valid?
   - Does it capture all task properties?
   - Are required fields correct?
   - Is the pattern for task IDs correct?

2. **Implementation Completeness**:
   - Are parsing instructions clear?
   - Is the fallback method documented?
   - Does it preserve current behavior if beta fails?
   - Is the benefits section accurate?

3. **Integration with Existing Flow**:
   - Does Step 3.0 flow into Step 3.1 naturally?
   - Are line number references accurate?
   - Does it match the command's tone/style?

4. **No Regressions**:
   - Can users still use the command without structured outputs?
   - Is the fallback clear and complete?
   - Are there any breaking changes?

Flag any issues found.

</extended_thinking_prompt_validation>

### Step 5.3: Verification Checklist

- [ ] Step 3.0 now has structured parsing section with schema
- [ ] JSON schema is valid and properly escaped
- [ ] Fallback method is documented
- [ ] Benefits section explains advantages
- [ ] Usage example shows how to iterate through parsed tasks
- [ ] References section updated to show structured outputs is used
- [ ] No line number conflicts or formatting issues

### Step 5.4: Test JSON Schema Validity

Validate the schema is syntactically correct:

```bash
# Save schema to temp file and validate with node
echo '<SCHEMA_JSON>' > /tmp/task-schema.json
node -e "JSON.parse(require('fs').readFileSync('/tmp/task-schema.json', 'utf8'))"
```

**Expected**: No errors (JSON is valid)

</phase>

**Duration**: 4-5 minutes

---

## Phase 6: Documentation and Commit

**Goal**: Document changes and create clean commit

### Step 6.1: Add Implementation Notes

Consider adding a note in the command about beta feature status:

**Location**: After Step 3.0, before Implementation Loop

```markdown
**⚠️ Beta Feature Note**: Structured outputs is a beta feature (verified 2026-01-15). If unavailable, the command automatically falls back to text-based parsing with no loss of functionality.
```

### Step 6.2: Commit Changes

```bash
git add .claude/commands/implement-sonnet-4-5.md

git commit -m "$(cat <<'EOF'
feat(commands): add structured task parsing with JSON schema validation

Replace text-based task parsing with structured JSON parsing using
--json-schema beta feature for improved reliability and validation.

CHANGES:

Step 3.0: Parse Task Structure (Lines 240-248)
- OLD: Text-based parsing with manual extraction
- NEW: Structured JSON parsing with schema validation
- Added comprehensive JSON schema for task structure
- Validates: task IDs, phases, dependencies, parallel markers
- Includes fallback to text-based parsing for beta stability

References Section:
- Updated structured outputs status from "not yet implemented" to "used"
- Documents usage in Step 3.0 with fallback mention

FEATURES:

JSON Schema validates:
- Task IDs: Pattern ^T\d{3}[a-z]?$ (T001, T002a, etc.)
- Phases: Enum of valid phase names
- Dependencies: References to other task IDs
- Parallel markers: Boolean flag from [P] suffix
- Complexity: Enum (simple, moderate, complex)

Benefits:
✅ Reliability - Guaranteed structure validation
✅ Performance - Single-pass extraction vs multi-read
✅ Maintainability - Schema documents expected format
✅ Type Safety - Pattern validation for IDs

Fallback Strategy:
⚠️ If structured outputs unavailable (beta feature):
- Automatically falls back to text-based parsing
- Preserves all current behavior
- No functionality loss

RISK: Low
- Beta feature has fallback to current behavior
- No breaking changes
- Improves reliability when available

Beta Feature: Structured Outputs (verified available 2026-01-15)
See: prompt-engineering/README.md#beta-feature-availability
EOF
)"
```

**Duration**: 3-4 minutes

---

## Phase 7: Testing and Validation (Optional)

**Goal**: Test with actual tasks.md file

### Step 7.1: Test Structured Parsing

If you want to validate the schema works:

```bash
# Test with actual tasks.md
cd <feature-directory>

# Use structured parsing
claude --print --model sonnet --output-format json \
  --json-schema '<MINIFIED_SCHEMA>' \
  "Parse this tasks.md file into JSON following the schema. Extract all phases, tasks, IDs, descriptions, file paths, parallel markers [P], dependencies, and infer complexity." \
  < tasks.md
```

**Expected**: Valid JSON output with `structured_output` field

### Step 7.2: Test Fallback Behavior

Verify text-based parsing still works:

```bash
# Simulate fallback (don't use --json-schema)
claude --print --model sonnet \
  "Parse tasks.md: extract task IDs, descriptions, phases. Format as list." \
  < tasks.md
```

**Expected**: Text-based output with all tasks listed

**Duration**: 3-5 minutes (optional)

---

## Success Criteria

**Command improvements**:
1. ✅ Step 3.0 uses structured outputs with JSON schema
2. ✅ Schema validates task structure (IDs, phases, dependencies)
3. ✅ Fallback documented and preserves current behavior
4. ✅ Benefits section explains advantages
5. ✅ References updated to reflect structured outputs usage

**Reliability gains**:
- ✅ Guaranteed task ID pattern validation
- ✅ Phase name validation
- ✅ Dependency validation (must reference valid task IDs)
- ✅ Single-pass parsing (no multi-read loops)

**No regressions**:
- ✅ Fallback to text-based parsing if beta unavailable
- ✅ No breaking changes to command flow
- ✅ All existing features preserved

---

## Rollback Procedure

If structured parsing causes issues:

### Option 1: Revert Commit

```bash
git revert HEAD
```

### Option 2: Emergency Hotfix

**Quick fix** (if only structured parsing is problematic):

```markdown
### Step 3.0: Parse Task Structure from tasks.md

⚠️ **TEMPORARY**: Structured outputs disabled due to issues. Using text-based parsing.

Before starting the implementation loop, extract and understand:
- **Task phases**: Setup, Tests, Core, Integration, Polish
- **Task dependencies**: Sequential vs parallel execution rules
- **Task details**: ID, description, file paths, parallel markers [P]
- **Execution flow**: Order and dependency requirements
```

**Risk**: Low - fallback is built into the design

---

## Time Estimates

| Phase | Duration | Cumulative |
|-------|----------|------------|
| **Phase 1: Context Gathering** | 3-4 min | 3-4 min |
| **Phase 2: Schema Design** | 2-3 min | 5-7 min |
| **Phase 3: Implementation** | 3-4 min | 8-11 min |
| **Phase 4: Update References** | 1 min | 9-12 min |
| **Phase 5: Verification** | 4-5 min | 13-17 min |
| **Phase 6: Commit** | 3-4 min | 16-21 min |
| **Phase 7: Testing (optional)** | 3-5 min | 19-26 min |

**Total**: 16-21 minutes (19-26 with optional testing)

---

## Sonnet 4.5 Optimizations Applied

✅ **Parallel Tool Use**
- Phase 1: Load command sections + sample tasks.md simultaneously
- Phase 5: Verify both modified sections simultaneously

✅ **Extended Thinking**
- Phase 1: 8K budget for schema design (complex task)
- Phase 5: 4K budget for validation (moderate complexity)
- Not used in mechanical phases (2, 3, 4, 6)

✅ **Clear Phases**: 7 distinct phases with specific goals

✅ **Built-In Verification**: Phase 5 validates all changes + extended thinking review

✅ **Fallback Strategy**: Preserves current behavior if beta feature fails

✅ **Minimal Scope**: Only adds structured parsing, no other enhancements

---

## Risk Assessment

**Risk Level**: Low

**Mitigations**:
1. ✅ **Fallback to current behavior** - If beta feature unavailable
2. ✅ **No breaking changes** - Text-based parsing still documented
3. ✅ **Schema validation** - Extended thinking validates correctness
4. ✅ **Optional testing phase** - Can validate before deploying
5. ✅ **Easy rollback** - Single commit to revert

**Beta Feature Stability**:
- ✅ Verified available as of 2026-01-15
- ⚠️ May change (beta status)
- ✅ Fallback ensures no disruption if removed

---

## Decision Point

**Before implementing, consider**:

**Pros**:
- ✅ Significantly improves parsing reliability
- ✅ Validates task structure automatically
- ✅ Single-pass extraction (performance)
- ✅ Schema documents expected format
- ✅ Fallback preserves current behavior

**Cons**:
- ⚠️ Beta feature may change
- ⚠️ Adds complexity to Step 3.0
- ⚠️ Requires schema maintenance if task format evolves

**Recommendation**:
- **Implement if**: Task parsing errors are common, or task format is complex
- **Defer if**: Current text-based parsing works well, or prefer to wait for beta→GA

---

**Ready to implement**: All steps documented, schema designed, fallback included, 16-21 min estimated
