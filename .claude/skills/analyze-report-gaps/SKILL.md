---
name: analyze-report-gaps
description: Gap analysis orchestrator with structured JSON output (via CLI --json-schema). Wraps analyze-report-gaps-haiku-4-5 skill. Falls back to markdown if structured outputs fail.
model_override: claude-sonnet-4-5
handoffs:
  - label: Implement Gap Fixes
    agent: implement-reported-gaps
    prompt: Fix gaps from the analysis report
  - label: Re-analyze (Standard)
    agent: analyze-report-gaps-haiku-4-5
    prompt: Run standard analysis (markdown output)
---

# Gap Analysis with Structured Outputs (Orchestrator)

## Purpose

This orchestrator skill enables structured JSON output for gap analysis by wrapping the `analyze-report-gaps-haiku-4-5` skill in a CLI invocation with the `--json-schema` flag.

**Problem Solved**: Skills cannot enable `--json-schema` at runtime; this requires CLI-level invocation.

**Solution**: Orchestrator spawns a subprocess calling `claude --json-schema` with the skill prompt.

## Architecture

```
Orchestrator (Sonnet) → Bash subprocess → claude CLI --json-schema → Haiku skill → JSON output
```

## When to Use

- **Use this**: When you want JSON output from gap analysis for reliable machine parsing
- **Use standard skill**: When markdown output is sufficient (human review only)

## Execution Steps

### Step 1: Detect Feature Directory

Run prerequisite script to auto-detect feature from git branch:

```bash
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly -RequireTasks -IncludeTasks
```

Parse JSON output to extract:
- `FEATURE_DIR`: Output directory for gap report
- `FEATURE_SPEC`: Path to spec.md (for validation)
- `IMPL_PLAN`: Path to plan.md (for validation)
- `TASKS`: Path to tasks.md (for validation)

Store paths for Step 3 (validation) and Step 4 (output).

---

### Step 2: Prepare JSON Schema

Embed the complete JSON schema for gap analysis output:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "feature_name": {"type": "string"},
    "analysis_date": {"type": "string", "format": "date"},
    "analyst": {"type": "string", "const": "Claude Haiku 4.5"},
    "method": {"type": "string", "const": "6-pass cross-artifact consistency analysis"},
    "findings": {
      "type": "array",
      "maxItems": 50,
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "pattern": "^[DAUCGI]\\d{2}$"},
          "category": {"type": "string", "enum": ["Duplication", "Ambiguity", "Underspecification", "ConstitutionAlignment", "CoverageGap", "Inconsistency"]},
          "severity": {"type": "string", "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]},
          "locations": {"type": "array", "items": {"type": "string"}},
          "summary": {"type": "string"},
          "recommendation": {"type": "string"}
        },
        "required": ["id", "category", "severity", "locations", "summary", "recommendation"]
      }
    },
    "coverage_summary": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "requirement_key": {"type": "string"},
          "has_task": {"type": "boolean"},
          "task_ids": {"type": "array", "items": {"type": "string"}},
          "notes": {"type": "string"}
        },
        "required": ["requirement_key", "has_task", "task_ids"]
      }
    },
    "constitution_issues": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "principle": {"type": "string"},
          "violation": {"type": "string"},
          "location": {"type": "string"}
        },
        "required": ["principle", "violation", "location"]
      }
    },
    "unmapped_tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "task_id": {"type": "string"},
          "description": {"type": "string"}
        },
        "required": ["task_id", "description"]
      }
    },
    "metrics": {
      "type": "object",
      "properties": {
        "total_requirements": {"type": "integer", "minimum": 0},
        "total_tasks": {"type": "integer", "minimum": 0},
        "coverage_percentage": {"type": "number", "minimum": 0, "maximum": 100},
        "ambiguity_count": {"type": "integer", "minimum": 0},
        "duplication_count": {"type": "integer", "minimum": 0},
        "critical_issues": {"type": "integer", "minimum": 0}
      },
      "required": ["total_requirements", "total_tasks", "coverage_percentage", "critical_issues"]
    },
    "next_actions": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["feature_name", "analysis_date", "analyst", "method", "findings", "metrics"]
}
```

**Schema must be minified** (no whitespace) for CLI invocation. Use this minified version:

```json
{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"feature_name":{"type":"string"},"analysis_date":{"type":"string","format":"date"},"analyst":{"type":"string","const":"Claude Haiku 4.5"},"method":{"type":"string","const":"6-pass cross-artifact consistency analysis"},"findings":{"type":"array","maxItems":50,"items":{"type":"object","properties":{"id":{"type":"string","pattern":"^[DAUCGI]\\d{2}$"},"category":{"type":"string","enum":["Duplication","Ambiguity","Underspecification","ConstitutionAlignment","CoverageGap","Inconsistency"]},"severity":{"type":"string","enum":["CRITICAL","HIGH","MEDIUM","LOW"]},"locations":{"type":"array","items":{"type":"string"}},"summary":{"type":"string"},"recommendation":{"type":"string"}},"required":["id","category","severity","locations","summary","recommendation"]}},"coverage_summary":{"type":"array","items":{"type":"object","properties":{"requirement_key":{"type":"string"},"has_task":{"type":"boolean"},"task_ids":{"type":"array","items":{"type":"string"}},"notes":{"type":"string"}},"required":["requirement_key","has_task","task_ids"]}},"constitution_issues":{"type":"array","items":{"type":"object","properties":{"principle":{"type":"string"},"violation":{"type":"string"},"location":{"type":"string"}},"required":["principle","violation","location"]}},"unmapped_tasks":{"type":"array","items":{"type":"object","properties":{"task_id":{"type":"string"},"description":{"type":"string"}},"required":["task_id","description"]}},"metrics":{"type":"object","properties":{"total_requirements":{"type":"integer","minimum":0},"total_tasks":{"type":"integer","minimum":0},"coverage_percentage":{"type":"number","minimum":0,"maximum":100},"ambiguity_count":{"type":"integer","minimum":0},"duplication_count":{"type":"integer","minimum":0},"critical_issues":{"type":"integer","minimum":0}},"required":["total_requirements","total_tasks","coverage_percentage","critical_issues"]},"next_actions":{"type":"array","items":{"type":"string"}}},"required":["feature_name","analysis_date","analyst","method","findings","metrics"]}
```

---

### Step 3: Invoke Claude CLI with --json-schema (Primary Path)

**Use Bash tool** to call `claude` CLI with structured outputs:

```bash
# Minified schema (from Step 2)
SCHEMA='{"$schema":"http://json-schema.org/draft-07/schema#","type":"object","properties":{"feature_name":{"type":"string"},"analysis_date":{"type":"string","format":"date"},"analyst":{"type":"string","const":"Claude Haiku 4.5"},"method":{"type":"string","const":"6-pass cross-artifact consistency analysis"},"findings":{"type":"array","maxItems":50,"items":{"type":"object","properties":{"id":{"type":"string","pattern":"^[DAUCGI]\\d{2}$"},"category":{"type":"string","enum":["Duplication","Ambiguity","Underspecification","ConstitutionAlignment","CoverageGap","Inconsistency"]},"severity":{"type":"string","enum":["CRITICAL","HIGH","MEDIUM","LOW"]},"locations":{"type":"array","items":{"type":"string"}},"summary":{"type":"string"},"recommendation":{"type":"string"}},"required":["id","category","severity","locations","summary","recommendation"]}},"coverage_summary":{"type":"array","items":{"type":"object","properties":{"requirement_key":{"type":"string"},"has_task":{"type":"boolean"},"task_ids":{"type":"array","items":{"type":"string"}},"notes":{"type":"string"}},"required":["requirement_key","has_task","task_ids"]}},"constitution_issues":{"type":"array","items":{"type":"object","properties":{"principle":{"type":"string"},"violation":{"type":"string"},"location":{"type":"string"}},"required":["principle","violation","location"]}},"unmapped_tasks":{"type":"array","items":{"type":"object","properties":{"task_id":{"type":"string"},"description":{"type":"string"}},"required":["task_id","description"]}},"metrics":{"type":"object","properties":{"total_requirements":{"type":"integer","minimum":0},"total_tasks":{"type":"integer","minimum":0},"coverage_percentage":{"type":"number","minimum":0,"maximum":100},"ambiguity_count":{"type":"integer","minimum":0},"duplication_count":{"type":"integer","minimum":0},"critical_issues":{"type":"integer","minimum":0}},"required":["total_requirements","total_tasks","coverage_percentage","critical_issues"]},"next_actions":{"type":"array","items":{"type":"string"}}},"required":["feature_name","analysis_date","analyst","method","findings","metrics"]}'

# Invoke skill via CLI with structured outputs
claude --print \
  --model haiku \
  --output-format json \
  --json-schema "$SCHEMA" \
  "/analyze-report-gaps-haiku-4-5" \
  > "${FEATURE_DIR}/gap-analysis-cli-output.json"

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ CLI invocation succeeded"
  CLI_SUCCESS=true
else
  echo "❌ CLI invocation failed"
  CLI_SUCCESS=false
fi
```

**Expected output format** (if successful):

```json
{
  "structured_output": {
    "feature_name": "...",
    "analysis_date": "...",
    "findings": [...],
    "metrics": {...}
  }
}
```

---

### Step 4: Extract and Write Structured Output (If Step 3 Succeeded)

**IF CLI_SUCCESS == true**:

Parse the CLI output and extract the `structured_output` field:

```bash
# Extract structured_output field using jq
jq '.structured_output' "${FEATURE_DIR}/gap-analysis-cli-output.json" \
  > "${FEATURE_DIR}/gap-analysis-report.json"

# Validate JSON structure
if [ $? -eq 0 ]; then
  echo "✅ Structured output extracted to gap-analysis-report.json"
  echo "📊 Validating findings count..."
  FINDINGS_COUNT=$(jq '.findings | length' "${FEATURE_DIR}/gap-analysis-report.json")
  echo "   Found: $FINDINGS_COUNT findings"

  # Cleanup temporary file
  rm "${FEATURE_DIR}/gap-analysis-cli-output.json"

  STRUCTURED_SUCCESS=true
else
  echo "❌ JSON extraction failed"
  STRUCTURED_SUCCESS=false
fi
```

---

### Step 5: Fallback to Markdown (If CLI or Extraction Failed)

**IF CLI_SUCCESS == false OR STRUCTURED_SUCCESS == false**:

Fall back to standard skill invocation (produces markdown):

```
Structured outputs failed. Falling back to markdown output.

Reason: [CLI invocation error OR JSON extraction error]

Running standard analysis skill...
```

Use the **Skill tool** to invoke `analyze-report-gaps-haiku-4-5`:

```
Skill(skill: "analyze-report-gaps-haiku-4-5")
```

This will produce `gap-analysis-report.md` using the skill's built-in markdown template.

---

### Step 6: Provide Completion Summary

**IF STRUCTURED_SUCCESS == true** (JSON output):

```
✅ Gap analysis complete with structured outputs

📄 Output: ${FEATURE_DIR}/gap-analysis-report.json

📊 Summary:
   - Total findings: [N]
   - Critical issues: [N]
   - Coverage: [X]%

🔍 JSON structure validated against schema
✨ Ready for machine parsing by /implement-reported-gaps

Next: Run /implement-reported-gaps to fix findings
```

**IF fallback to markdown**:

```
✅ Gap analysis complete (markdown output)

📄 Output: ${FEATURE_DIR}/gap-analysis-report.md

⚠️ Structured outputs not available (using markdown fallback)

📊 Summary:
   [Extract from markdown report]

Next: Run /implement-reported-gaps to fix findings
```

---

## Error Handling

<error_scenarios>

**Scenario 1**: `claude` command not found

```
Error: claude CLI not available in PATH
Fallback: Invoke skill directly (markdown output)
```

**Scenario 2**: `--json-schema` flag not supported

```
Error: Structured outputs beta not available
Fallback: Invoke skill directly (markdown output)
```

**Scenario 3**: CLI returns malformed JSON

```
Error: Invalid JSON structure in CLI output
Fallback: Invoke skill directly (markdown output)
```

**Scenario 4**: Schema validation fails

```
Error: Output doesn't match schema (missing required fields)
Fallback: Invoke skill directly (markdown output)
```

</error_scenarios>

---

## Validation Checklist

Before completing, verify:

- [ ] Feature directory detected from git branch
- [ ] CLI invocation attempted first (primary path)
- [ ] IF CLI succeeded: JSON extracted to gap-analysis-report.json
- [ ] IF CLI succeeded: Findings count validated
- [ ] IF CLI failed: Fallback skill invoked (markdown output)
- [ ] Completion summary shows correct output path (.json or .md)
- [ ] User knows next action (/implement-reported-gaps)

---

## Benefits of This Orchestrator

1. **Enables structured outputs** without modifying the base skill
2. **Graceful fallback** ensures reliability (markdown always works)
3. **Transparent to consumers** (`/implement-reported-gaps` handles both formats)
4. **Testable** (can verify both paths: JSON success and markdown fallback)
5. **Model-optimized** (Sonnet orchestrates, Haiku analyzes)

---

## Limitations

**Cannot run nested**: This orchestrator calls `claude` CLI, which means:
- It cannot be invoked FROM another `claude --json-schema` call (nesting limit)
- It works in Claude Code interactive sessions (orchestrator runs, spawns CLI)
- It does NOT work if you try: `claude --json-schema ... "/analyze-with-structured-outputs"` (redundant)

**Recommendation**: Use `/analyze-with-structured-outputs` in interactive sessions, NOT via CLI wrapper.

---

## Related Skills

- **analyze-report-gaps-haiku-4-5**: Base skill (markdown output, can be invoked directly)
- **implement-reported-gaps**: Consumer skill (parses JSON or markdown reports)

---

## User Input

```text
$ARGUMENTS
```

Use arguments to:
- Override feature detection (specify feature directory manually)
- Force markdown output (skip CLI invocation attempt)
- Adjust schema validation strictness
