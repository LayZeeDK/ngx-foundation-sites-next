# Structured Outputs in Claude Commands/Skills

**Status**: Beta (verified 2026-01-20)
**Availability**: Claude Code CLI via `--json-schema` flag
**Reference**: See `FEATURES-AND-AVAILABILITY.md` for details

## Overview

Structured outputs with JSON Schema guarantee that Claude's responses match a predefined structure, eliminating parsing errors and enabling reliable machine-readable output. This beta feature is particularly valuable when command outputs are consumed by other commands.

## When to Use

Use structured outputs when:

- ✅ **Command outputs structured data** (tables, lists, classifications)
- ✅ **Output is consumed by other commands** (machine-readable format required)
- ✅ **Parsing reliability is critical** (avoid regex/markdown parsing fragility)
- ✅ **Model uses mechanical procedures** (Haiku 4.5 ideal for transformation tasks)

Do **NOT** use when:

- ❌ **Output is human-consumed documents** (spec.md, tasks.md, plan.md)
- ❌ **Output is conversational** (questions, explanations, clarifications)
- ❌ **Free-form creativity needed** (schema constraints would limit quality)
- ❌ **Output format varies by context** (dynamic structure based on user needs)

## Fallback Pattern (REQUIRED)

**Always implement fallback to text parsing.** Structured outputs are in beta and may not be available in all environments.

```
Try: Structured outputs with JSON schema
If: Parse error, schema mismatch, or feature unavailable
Then: Fallback to markdown/text parsing
```

**Example implementation**:

```typescript
IF structured_outputs_available:
  OUTPUT JSON matching schema
  WRITE to output-file.json
ELSE:
  OUTPUT markdown using template
  WRITE to output-file.md
```

## Claude Commands/Skills Using Structured Outputs

### 1. analyze-report-gaps-haiku-4-5

**File**: `.claude/skills/analyze-report-gaps-haiku-4-5/SKILL.md`

**Status**: ✅ Implemented with fallback

**Use Case**: Gap analysis report output

**Benefits**:
- Reliable findings table extraction for `/implement-reported-gaps`
- Type-validated severity levels and ID patterns
- Structured arrays for locations, recommendations, metrics
- Zero markdown table parsing ambiguity

**Schema**: See skill file for complete JSON schema (includes findings array, coverage summary, metrics)

**Output**:
- **Preferred**: `gap-analysis-report.json` (when structured outputs available)
- **Fallback**: `gap-analysis-report.md` (markdown template)

**Why Haiku 4.5 is ideal**:
- ✅ Mechanical transformation (gap detection → JSON structure)
- ✅ No creative decisions required (schema is explicit)
- ✅ Step-bounded reasoning maintained
- ✅ Enhances reliability without increasing complexity

### 2. implement-reported-gaps

**File**: `.claude/skills/implement-reported-gaps/SKILL.md`

**Status**: ✅ Updated to parse both JSON and markdown

**Use Case**: Parse gap reports from `analyze-report-gaps-haiku-4-5`

**Benefits**:
- Direct object access to findings (no regex parsing)
- Type safety from schema validation
- Faster parsing (JSON.parse vs markdown regex)
- Backward compatible with markdown format

**Format Detection** (Step 1.1):
```bash
if [ -f "gap-analysis-report.json" ]; then
  REPORT_FORMAT="json"
elif [ -f "gap-analysis-report.md" ]; then
  REPORT_FORMAT="markdown"
fi
```

**Parsing Logic** (Step 2.1):
```typescript
IF REPORT_FORMAT == "json":
  findings = JSON.parse(Read(REPORT_PATH)).findings
ELSE:
  findings = parseMarkdownTable(Read(REPORT_PATH))
```

### 3. implement-sonnet-4-5

**File**: `.claude/skills/implement-sonnet-4-5/SKILL.md` (lines 220-239)

**Status**: ✅ Already documented as optional

**Use Case**: Optional task parsing for implementation orchestration

**Approach**: Documented as optional optimization, not enforced

**Rationale**: Extended thinking already handles task complexity well; structured outputs provide marginal benefit

### 4. implement-opus-4-5

**File**: `.claude/skills/implement-opus-4-5/SKILL.md`

**Status**: Similar to Sonnet (optional, not prioritized)

**Use Case**: Expert-level implementations with first-try correctness

**Rationale**: Opus excels at text parsing; structured outputs provide minimal benefit for expert coding

## Commands NOT Using Structured Outputs

The following commands output human-consumed documents or conversational content, where structured outputs would provide no benefit:

| Command                  | Output Type      | Why Not Structured Outputs                    |
| ------------------------ | ---------------- | --------------------------------------------- |
| `tasks-haiku-4-5`        | Markdown         | Human-readable tasks.md document              |
| `clarify-haiku-4-5`      | Conversational   | Questions and clarifications (free-form)      |
| `specify-haiku-4-5`      | Markdown         | Specification document (spec.md)              |
| `checklist-haiku-4-5`    | Markdown         | Human-readable checklist                      |
| `analyze-haiku-4-5`      | Terminal output  | Terminal-only analysis (no file output)       |
| `foundation-api-design`  | Markdown         | Free-form API design document                 |

## JSON Schema Best Practices

### Schema Design Principles

1. **Explicit enums** for categorical values:
   ```json
   "severity": {"enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]}
   ```

2. **Pattern validation** for IDs:
   ```json
   "id": {"pattern": "^[DAUCGI]\\d{2}$"}
   ```

3. **Required fields** prevent missing data:
   ```json
   "required": ["id", "category", "severity", "recommendation"]
   ```

4. **Bounded arrays** prevent overflow:
   ```json
   "findings": {"maxItems": 50}
   ```

5. **Descriptive field names** (self-documenting):
   ```json
   "coverage_percentage": {"type": "number", "minimum": 0, "maximum": 100}
   ```

### Example Schema Template

See `.claude/skills/analyze-report-gaps-haiku-4-5/SKILL.md` Step 7 for a complete production schema.

## Testing Structured Outputs

### Validation Checklist

Before deploying structured outputs to a command:

- [ ] JSON schema validates against expected output
- [ ] All required fields are marked in schema
- [ ] Enums cover all possible values
- [ ] Pattern validation prevents malformed IDs
- [ ] Fallback to markdown/text works reliably
- [ ] Both formats produce identical semantic data
- [ ] Consuming commands handle both formats

### Test Both Paths

```bash
# Test 1: Structured outputs enabled (JSON)
# Verify gap-analysis-report.json created
# Verify schema validation passes

# Test 2: Structured outputs unavailable (fallback)
# Verify gap-analysis-report.md created
# Verify markdown parsing works

# Test 3: Consuming command (implement-reported-gaps)
# Verify JSON parsing works
# Verify markdown parsing still works (backward compatibility)
```

## Cost and Performance

### Structured Outputs Impact

**Cost**: No additional tokens for structured outputs (same as text output)

**Performance**: Marginally faster parsing on consumer side (JSON.parse vs regex)

**Reliability**: Significant improvement (zero parsing errors vs markdown ambiguity)

### Model Suitability

| Model           | Structured Outputs Benefit | Recommended Use Cases                   |
| --------------- | -------------------------- | --------------------------------------- |
| **Haiku 4.5**   | ⭐⭐⭐ High                | Mechanical transformations, gap reports |
| **Sonnet 4.5**  | ⭐⭐ Medium                | Classification, routing decisions       |
| **Opus 4.5**    | ⭐ Low                    | Expert coding (excels at text parsing)  |

## Migration Guide

### Adding Structured Outputs to Existing Commands

**Step 1**: Define JSON schema for output structure

**Step 2**: Update command to detect feature availability

**Step 3**: Implement JSON output path

**Step 4**: Maintain markdown fallback (mandatory)

**Step 5**: Update consuming commands to parse both formats

**Step 6**: Test both paths thoroughly

**Step 7**: Document beta status in skill file

### Example: Converting a Command

**Before** (markdown only):
```markdown
Write to output.md:
| ID | Category | Severity |
| -- | -------- | -------- |
| A01 | Ambiguity | HIGH |
```

**After** (structured outputs + fallback):
```typescript
IF structured_outputs_available:
  Write to output.json:
  {
    "findings": [
      {"id": "A01", "category": "Ambiguity", "severity": "HIGH"}
    ]
  }
ELSE:
  Write to output.md:
  | ID | Category | Severity |
  | -- | -------- | -------- |
  | A01 | Ambiguity | HIGH |
```

## Future Considerations

### When Structured Outputs Reach GA

Once structured outputs exit beta:

- [ ] Remove fallback requirement (JSON becomes primary)
- [ ] Deprecate markdown format for machine-consumed outputs
- [ ] Expand usage to more commands (tasks, classifications)
- [ ] Add schema validation to CI/CD pipelines
- [ ] Document GA status in FEATURES-AND-AVAILABILITY.md

### Commands to Consider for Structured Outputs (GA)

When GA, consider adding to:

- `tasks-haiku-4-5` - Task dependency graph as JSON
- Classification results in orchestrators
- Validation results (checklist outputs)

**Note**: Human-consumed documents (spec.md, plan.md) should remain markdown even after GA.

## References

- **Feature Availability**: `FEATURES-AND-AVAILABILITY.md`
- **Haiku Optimization**: `CLAUDE-HAIKU-4-5-OPTIMIZATION.md`
- **Implementation Examples**: See `.claude/skills/analyze-report-gaps-haiku-4-5/` and `.claude/skills/implement-reported-gaps/`

---

**Last Updated**: 2026-01-20
**Status**: Beta feature with mandatory fallback
**Maintainer**: Spec Kit Team
