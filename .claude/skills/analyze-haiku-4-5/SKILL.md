---
description: Cross-artifact consistency analysis (Haiku 4.5)
model_override: claude-haiku-4.5
handoffs:
  - label: Prepare Remediation
    agent: analyze-prepare-reported-gaps-for-implementation
    prompt: Create remediation checklist from analysis findings
    send: true
  - label: Refine Specification
    agent: speckit.specify
    prompt: Update spec to address critical analysis findings
  - label: Begin Implementation
    agent: speckit.implement
    prompt: Start implementation (if no critical issues found)
---

# Specification Analysis - Haiku 4.5 Optimized

## Model Configuration

**Model**: Claude Haiku 4.5
**Optimization Strategy**: Step-bounded detection passes, mechanical cross-reference mapping, structured severity assignment
**Extended Thinking**: Enabled (4K budget) for semantic analysis and edge case detection
**Structured Outputs**: Enabled with JSON Schema (beta) with text fallback
**Expected Performance**: 20-35 seconds, ~$0.04-0.05 per analysis (base + thinking)

<extended_thinking_config>
**Budget**: 4,096 tokens
**Rationale**: Multi-artifact correlation requires reasoning about implicit relationships, constitution alignment, and terminology drift detection
**Cost Impact**: +$0.02 per analysis run
</extended_thinking_config>

## Goal

<goal>
Identify inconsistencies, duplications, ambiguities, and underspecified items across the three core artifacts (`spec.md`, `plan.md`, `tasks.md`) before implementation.

**Task Type**: Structured detection passes + cross-reference mapping (suitable for Haiku with extended thinking)

- Load artifacts and build semantic models
- Run 6 detection passes (pattern-based with reasoning for edge cases)
- Assign severity levels using explicit heuristics
- Produce compact analysis report with actionable findings
- **STRICTLY READ-ONLY**: Do NOT modify any files
  </goal>

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Path Grounding (CRITICAL)

<path_rules>

- Do **not** guess or "fix up" filesystem paths
- Treat paths from PowerShell scripts (`-Json` output) as **only source of truth**
- Use paths verbatim
- If required path missing/unclear, STOP and re-run prerequisite script
- All file paths must be absolute
  </path_rules>

## Operating Constraints

<constraints>
**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured analysis report only.

**Constitution Authority**: The project constitution (`.specify/memory/constitution.md`) is **non-negotiable**. Constitution conflicts are automatically CRITICAL severity. If a principle needs to change, that must occur in a separate, explicit constitution update outside this analysis.

**Token Efficiency**: Limit findings to 50 total. Aggregate remainder in overflow summary.

**Deterministic Output**: Rerunning without changes should produce consistent IDs and counts.
</constraints>

---

## Execution Steps

### Step 1: Setup & Path Discovery

<task>
Run prerequisite check from repository root to get absolute paths.
</task>

```powershell
pwsh ./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

**Parse JSON output for**:

- `FEATURE_DIR`: Absolute path to feature directory
- `AVAILABLE_DOCS`: List of existing files

**Derive absolute paths**:

- `SPEC` = FEATURE_DIR/spec.md (REQUIRED)
- `PLAN` = FEATURE_DIR/plan.md (REQUIRED)
- `TASKS` = FEATURE_DIR/tasks.md (REQUIRED)
- `CONSTITUTION` = .specify/memory/constitution.md (REQUIRED)

**Error Handling**:

- If any REQUIRED file missing: ABORT with message instructing user to run missing prerequisite command
- Do NOT proceed with partial artifacts

**PowerShell String Escaping**:

- For single quotes in args: `'I'\''m Groot'` or `"I'm Groot"`

---

### Step 2: Load Artifacts (Progressive Disclosure)

<context_loading>
Load only the minimal necessary context from each artifact:

**From spec.md** (extract these sections):

- Overview/Context
- Functional Requirements (FR-XXX identifiers)
- Non-Functional Requirements (NFR-XXX identifiers)
- User Stories (US-XXX identifiers)
- Edge Cases (if present)
- Acceptance Criteria

**From plan.md** (extract these sections):

- Architecture/stack choices
- Data Model references
- Phase definitions
- Technical constraints
- Implementation approach

**From tasks.md** (extract these elements):

- Task IDs (T###)
- Descriptions
- Phase grouping
- Parallel markers [P]
- Referenced file paths
- Story labels [US#]

**From constitution** (extract these elements):

- Principle names
- MUST/SHOULD/MAY normative statements
- Quality gates
  </context_loading>

---

### Step 3: Build Semantic Models

<semantic_model_construction>
Create internal representations (do NOT include raw artifacts in output):

**Model 1: Requirements Inventory**

```
FOR EACH requirement in spec.md (FR-XXX, NFR-XXX):
  EXTRACT identifier
  EXTRACT imperative phrase
  GENERATE slug key (e.g., "User can upload file" → "user-can-upload-file")
  STORE in requirements_map[slug] = {id, phrase, type}
```

**Model 2: User Story Inventory**

```
FOR EACH user story in spec.md (US-XXX):
  EXTRACT identifier
  EXTRACT action description
  EXTRACT acceptance criteria
  STORE in stories_map[id] = {action, criteria[]}
```

**Model 3: Task Coverage Mapping**

```
FOR EACH task in tasks.md (T###):
  EXTRACT task_id, description, file_path, story_label
  FOR EACH requirement in requirements_map:
    IF task.description matches requirement.phrase keywords:
      ADD task_id to requirement.covered_by[]
  FOR EACH story in stories_map:
    IF task.story_label matches story.id:
      ADD task_id to story.covered_by[]
```

**Model 4: Constitution Rule Set**

```
FOR EACH principle in constitution:
  EXTRACT principle_name
  EXTRACT normative_level (MUST/SHOULD/MAY)
  EXTRACT statement
  STORE in rules[principle_name] = {level, statement}
```

</semantic_model_construction>

---

### Step 4: Execute Detection Passes

<detection_passes>
Run 6 detection passes in sequence. Use extended thinking for edge case detection.

**Pass A: Duplication Detection**

```
FOR EACH pair (req1, req2) in requirements_map:
  IF similarity(req1.phrase, req2.phrase) > 0.8:
    CREATE finding {
      category: "Duplication",
      items: [req1.id, req2.id],
      recommendation: "Merge phrasing; keep clearer version"
    }
```

**Similarity heuristics**:

- Same verb + same object = HIGH similarity
- Same object + different verb = MEDIUM similarity
- Overlapping keywords (>70%) = CHECK manually

---

**Pass B: Ambiguity Detection**

```
FOR EACH requirement in requirements_map:
  FOR EACH vague_term in ["fast", "scalable", "secure", "intuitive", "robust", "efficient", "flexible", "user-friendly"]:
    IF requirement.phrase contains vague_term:
      IF NOT has_measurable_criteria(requirement):
        CREATE finding {
          category: "Ambiguity",
          item: requirement.id,
          term: vague_term,
          recommendation: "Add measurable criteria (e.g., 'response time < 200ms')"
        }

FOR EACH artifact in [SPEC, PLAN, TASKS]:
  FOR EACH placeholder in ["TODO", "TKTK", "???", "<placeholder>", "TBD", "FIXME"]:
    IF artifact contains placeholder:
      CREATE finding {
        category: "Ambiguity",
        location: artifact + line_number,
        recommendation: "Resolve placeholder before implementation"
      }
```

---

**Pass C: Underspecification Detection**

```
FOR EACH requirement in requirements_map:
  IF has_verb(requirement.phrase) AND NOT has_object(requirement.phrase):
    CREATE finding {
      category: "Underspecification",
      item: requirement.id,
      issue: "Verb without object",
      recommendation: "Add specific object or outcome"
    }

FOR EACH story in stories_map:
  IF story.criteria is EMPTY or VAGUE:
    CREATE finding {
      category: "Underspecification",
      item: story.id,
      issue: "Missing acceptance criteria",
      recommendation: "Add testable acceptance criteria"
    }

FOR EACH task in tasks_map:
  IF task.file_path references component NOT in spec or plan:
    CREATE finding {
      category: "Underspecification",
      item: task.task_id,
      issue: "References undefined component",
      recommendation: "Define component in spec/plan or remove task"
    }
```

---

**Pass D: Constitution Alignment**

```
FOR EACH rule in constitution_rules WHERE rule.level == "MUST":
  FOR EACH requirement in requirements_map:
    IF requirement CONFLICTS WITH rule.statement:
      CREATE finding {
        category: "ConstitutionAlignment",
        severity: "CRITICAL",  # Always CRITICAL for MUST violations
        item: requirement.id,
        principle: rule.principle_name,
        recommendation: "Align requirement with constitution or update constitution separately"
      }

FOR EACH mandated_section in constitution.required_sections:
  IF mandated_section NOT IN spec.sections:
    CREATE finding {
      category: "ConstitutionAlignment",
      severity: "CRITICAL",
      issue: "Missing mandated section",
      recommendation: "Add required section to spec"
    }
```

---

**Pass E: Coverage Gap Detection**

```
FOR EACH requirement in requirements_map:
  IF requirement.covered_by is EMPTY:
    CREATE finding {
      category: "CoverageGap",
      item: requirement.id,
      issue: "Zero tasks cover this requirement",
      recommendation: "Add task(s) to implement requirement"
    }

FOR EACH task in tasks_map:
  IF task NOT mapped to ANY requirement or story:
    CREATE finding {
      category: "CoverageGap",
      item: task.task_id,
      issue: "Orphan task with no requirement mapping",
      recommendation: "Map to requirement or remove if unnecessary"
    }

FOR EACH nfr in requirements_map WHERE nfr.type == "NFR":
  IF nfr.covered_by is EMPTY:
    CREATE finding {
      category: "CoverageGap",
      item: nfr.id,
      issue: "Non-functional requirement not reflected in tasks",
      recommendation: "Add validation/implementation tasks for NFR"
    }
```

---

**Pass F: Inconsistency Detection**

```
# Terminology drift
FOR EACH concept across [SPEC, PLAN, TASKS]:
  IF same_concept has DIFFERENT names:
    CREATE finding {
      category: "Inconsistency",
      issue: "Terminology drift",
      variants: [name1, name2, ...],
      recommendation: "Normalize to single canonical term"
    }

# Data model misalignment
FOR EACH entity in plan.data_model:
  IF entity NOT referenced in spec:
    CREATE finding {
      category: "Inconsistency",
      item: entity,
      issue: "Entity in plan but absent from spec",
      recommendation: "Add to spec or remove from plan"
    }

# Task ordering contradictions
FOR EACH task_pair (taskA, taskB) in tasks_map:
  IF taskA.phase > taskB.phase AND taskA is_prerequisite_for taskB:
    CREATE finding {
      category: "Inconsistency",
      items: [taskA.id, taskB.id],
      issue: "Task ordering contradiction",
      recommendation: "Reorder tasks or add explicit dependency note"
    }

# Conflicting requirements
FOR EACH pair (req1, req2) in requirements_map:
  IF req1.constraint CONFLICTS WITH req2.constraint:
    CREATE finding {
      category: "Inconsistency",
      items: [req1.id, req2.id],
      issue: "Conflicting requirements",
      recommendation: "Resolve conflict - choose one approach"
    }
```

</detection_passes>

---

### Step 5: Assign Severity Levels

<severity_assignment>
Apply severity heuristics to all findings:

```
FOR EACH finding in findings[]:
  IF finding.category == "ConstitutionAlignment" AND rule.level == "MUST":
    finding.severity = "CRITICAL"
  ELSE IF finding.issue == "Zero coverage for core functionality":
    finding.severity = "CRITICAL"
  ELSE IF finding.category == "Duplication" OR finding.category == "Inconsistency" (conflicting):
    finding.severity = "HIGH"
  ELSE IF finding.category == "Ambiguity" AND term in ["secure", "scalable", "reliable"]:
    finding.severity = "HIGH"
  ELSE IF finding.category == "CoverageGap" AND requirement.type == "NFR":
    finding.severity = "MEDIUM"
  ELSE IF finding.category == "Underspecification" (edge case):
    finding.severity = "MEDIUM"
  ELSE:
    finding.severity = "LOW"
```

**Severity Definitions**:

| Severity     | Criteria                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| **CRITICAL** | Violates constitution MUST, missing core artifact, blocks baseline functionality |
| **HIGH**     | Duplicate/conflicting requirement, ambiguous security/performance, untestable AC |
| **MEDIUM**   | Terminology drift, missing NFR coverage, underspecified edge case                |
| **LOW**      | Style/wording improvements, minor redundancy                                     |

</severity_assignment>

---

### Step 6: Generate Stable Finding IDs

<id_generation>
Generate deterministic IDs for consistent reruns:

```
FOR EACH finding in findings[] (sorted by category, then location):
  category_prefix = first_letter(finding.category)  # D, A, U, C, G, I
  sequence_number = category_counter[category_prefix]++
  finding.id = category_prefix + zero_pad(sequence_number, 2)
  # Examples: D01, A01, A02, U01, C01, G01, I01
```

</id_generation>

---

### Step 7: Produce Analysis Report

<output_format>
**Attempt Structured Output first (beta), fall back to text if unavailable.**

<structured_output_schema>
If structured outputs available, use this JSON schema:

```json
{
  "type": "object",
  "properties": {
    "findings": {
      "type": "array",
      "maxItems": 50,
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "pattern": "^[DAUCGI]\\d{2}$" },
          "category": {
            "type": "string",
            "enum": ["Duplication", "Ambiguity", "Underspecification", "ConstitutionAlignment", "CoverageGap", "Inconsistency"]
          },
          "severity": { "type": "string", "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
          "location": { "type": "string" },
          "summary": { "type": "string", "maxLength": 100 },
          "recommendation": { "type": "string", "maxLength": 150 }
        },
        "required": ["id", "category", "severity", "summary", "recommendation"]
      }
    },
    "coverageSummary": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "requirementKey": { "type": "string" },
          "hasTask": { "type": "boolean" },
          "taskIds": { "type": "array", "items": { "type": "string" } },
          "notes": { "type": "string" }
        },
        "required": ["requirementKey", "hasTask"]
      }
    },
    "metrics": {
      "type": "object",
      "properties": {
        "totalRequirements": { "type": "integer", "minimum": 0 },
        "totalTasks": { "type": "integer", "minimum": 0 },
        "coveragePercent": { "type": "number", "minimum": 0, "maximum": 100 },
        "ambiguityCount": { "type": "integer", "minimum": 0 },
        "duplicationCount": { "type": "integer", "minimum": 0 },
        "criticalIssuesCount": { "type": "integer", "minimum": 0 }
      },
      "required": ["totalRequirements", "totalTasks", "coveragePercent", "criticalIssuesCount"]
    },
    "constitutionIssues": {
      "type": "array",
      "items": { "type": "string" }
    },
    "unmappedTasks": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["findings", "metrics"]
}
```

</structured_output_schema>

<fallback_text_format>
If structured outputs unavailable or fail, output Markdown:

## Specification Analysis Report

| ID  | Category              | Severity | Location(s)      | Summary                     | Recommendation                       |
| --- | --------------------- | -------- | ---------------- | --------------------------- | ------------------------------------ |
| A01 | Ambiguity             | HIGH     | spec.md:L45      | "fast" lacks metric         | Add measurable criteria (< 200ms)    |
| D01 | Duplication           | HIGH     | spec.md:L120,134 | Two similar requirements... | Merge phrasing; keep clearer version |
| G01 | CoverageGap           | MEDIUM   | FR-003           | Zero tasks for requirement  | Add task(s) to implement             |
| C01 | ConstitutionAlignment | CRITICAL | FR-007           | Violates accessibility MUST | Align with constitution requirement  |

(One row per finding; max 50 rows)

**Coverage Summary Table:**

| Requirement Key | Has Task? | Task IDs   | Notes                   |
| --------------- | --------- | ---------- | ----------------------- |
| user-can-login  | ✅        | T005, T006 |                         |
| user-can-export | ❌        |            | No implementation tasks |

**Constitution Alignment Issues:** (if any)

- C01: FR-007 violates "Accessibility First" MUST principle

**Unmapped Tasks:** (if any)

- T023: No requirement or story mapping found

**Metrics:**

- Total Requirements: [N]
- Total Tasks: [N]
- Coverage %: [N]% (requirements with ≥1 task)
- Ambiguity Count: [N]
- Duplication Count: [N]
- Critical Issues: [N]

</fallback_text_format>

</output_format>

---

### Step 8: Provide Next Actions

<next_actions>
Based on findings, output actionable recommendations:

```
IF criticalIssuesCount > 0:
  OUTPUT "⛔ CRITICAL issues found. Resolve before /speckit.implement:"
  FOR EACH finding WHERE severity == "CRITICAL":
    OUTPUT "  - " + finding.id + ": " + finding.recommendation

ELSE IF findings WHERE severity == "HIGH" exist:
  OUTPUT "⚠️ HIGH priority issues found. Recommend addressing before implementation:"
  FOR EACH finding WHERE severity == "HIGH" (limit 5):
    OUTPUT "  - " + finding.id + ": " + finding.recommendation

ELSE:
  OUTPUT "✅ No critical or high-priority issues. Safe to proceed with /speckit.implement"

OUTPUT "**Suggested Commands:**"
IF ambiguityCount > 0:
  OUTPUT "- Run /speckit.specify with refinement to clarify ambiguous requirements"
IF inconsistencyCount > 0:
  OUTPUT "- Run /speckit.plan to align architecture with spec"
IF coverageGapCount > 0:
  OUTPUT "- Manually edit tasks.md to add coverage for: [list uncovered requirements]"
```

</next_actions>

---

### Step 9: Offer Remediation

<remediation_offer>
After report, ask user:

"Would you like me to suggest concrete remediation edits for the top N issues?"

**Options**:

- Yes, suggest edits for top 5 issues
- Yes, suggest edits for CRITICAL issues only
- No, I'll review the report first

**IMPORTANT**: Do NOT apply remediation automatically. Only suggest edits for user review.
</remediation_offer>

---

## Validation Checklist

<validation_checklist>
Before outputting report, verify:

- [ ] All 6 detection passes executed
- [ ] Finding IDs are stable (category prefix + sequence)
- [ ] Severity assigned to all findings
- [ ] Total findings ≤ 50 (overflow aggregated in summary)
- [ ] Coverage summary includes all requirements
- [ ] Metrics calculated correctly
- [ ] Constitution violations marked CRITICAL
- [ ] No file modifications made (read-only analysis)
- [ ] Next actions based on actual findings
      </validation_checklist>

---

## Optimization Notes for Haiku 4.5

<optimization_strategy>
This command is optimized for Haiku 4.5's strengths:

1. **Mechanical Detection Passes**: 6 explicit passes with FOR EACH patterns
2. **Structured Severity Assignment**: Explicit heuristics, no ambiguity
3. **Step-Bounded Execution**: 9 concrete steps
4. **Cross-Reference Mapping**: Pattern-based requirement → task correlation
5. **Validation Checklist**: Structured verification before output
6. **XML-Style Structure**: Clear task boundaries and constraints
7. **Extended Thinking**: 4K budget for semantic edge cases

**Extended Thinking Benefits for Analyze**:

- Better detection of near-duplicates with different wording
- Improved constitution alignment reasoning
- More accurate terminology drift identification
- Edge case detection in underspecification

**Why 4K Budget (vs 2K for other commands)**:

- Analyze has 6 detection passes (more than tasks/clarify)
- Correlates 3 artifacts + constitution
- Constitution alignment requires normative reasoning
- Edge case detection is non-trivial

**Performance Expectations**:

- **Speed**: 20-35 seconds (with extended thinking)
- **Cost**: ~$0.04-0.05 per run (base $0.02 + thinking $0.02)
- **Quality**: 90%+ of Sonnet for structured detection
- **Best for**: Pattern-based consistency checking across artifacts

**Structured Outputs (Beta)**:

- Guarantees valid JSON format for findings
- Schema validates severity enums, ID patterns
- Fallback to Markdown if beta feature unavailable
- Zero parsing errors when available

**Comparison to Sonnet**:

- Haiku: Faster, cheaper, excellent for bounded detection passes
- Sonnet: Better at detecting implicit architectural conflicts
- For routine analysis: Haiku with extended thinking is optimal
- Escalate to Sonnet: >500K tokens, complex constitution reasoning

</optimization_strategy>

---

## Behavior Rules

<behavior_constraints>

- **NEVER modify files** (strictly read-only analysis)
- **NEVER hallucinate missing sections** (report accurately if absent)
- **ALWAYS prioritize constitution violations** (these are CRITICAL)
- **ALWAYS use stable IDs** (deterministic on rerun)
- **LIMIT findings to 50** (aggregate overflow in summary)
- If zero issues found: Output success report with coverage statistics
- If structured output fails: Fall back to Markdown format gracefully
- If artifacts missing: ABORT with clear instructions
  </behavior_constraints>

---

## Context for Analysis

```text
$ARGUMENTS
```

Use to adjust:

- Focus on specific detection passes
- Prioritize certain finding categories
- Adjust severity thresholds for domain
