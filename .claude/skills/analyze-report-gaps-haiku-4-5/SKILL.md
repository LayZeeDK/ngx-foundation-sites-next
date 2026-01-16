---
description: Cross-artifact consistency analysis with file output (Haiku 4.5). Same 6-pass analysis as /analyze-haiku-4-5, but ALWAYS outputs to gap-analysis-report.md.
model_override: claude-haiku-4.5
handoffs:
  - label: Refine Specification
    agent: speckit.specify
    prompt: Update spec to address critical analysis findings
  - label: Begin Implementation
    agent: speckit.implement
    prompt: Start implementation (if no critical issues found)
---

# Specification Analysis with File Output - Haiku 4.5 Optimized

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
- **OUTPUT TO FILE**: Write analysis report to `gap-analysis-report.md` (MANDATORY)
  </goal>

<anti_goals>

- Do NOT output report to terminal only — MUST write to file
- Do NOT modify implementation files (spec.md, plan.md, tasks.md)
- Do NOT guess file paths — use script output verbatim
  </anti_goals>

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
**FILE OUTPUT REQUIRED**: You MUST use the Write tool to create `gap-analysis-report.md` in the feature directory.

**Constitution Authority**: The project constitution (`.specify/memory/constitution.md`) is **non-negotiable**. Constitution conflicts are automatically CRITICAL severity. If a principle needs to change, that must occur in a separate, explicit constitution update outside this analysis.

**Token Efficiency**: Limit findings to 50 total. Aggregate remainder in overflow summary.

**Deterministic Output**: Rerunning without changes should produce consistent IDs and counts.
</constraints>

---

## Execution Steps

### Step 1: Setup & Path Discovery (AUTO-DETECT)

<task>
**IMMEDIATELY** run the prerequisite check. Do NOT ask the user which feature to analyze.
The script auto-detects the feature from the current git branch.
</task>

<critical>
**NO USER CONFIRMATION REQUIRED**: Execute this command as your FIRST action.
The script uses `git rev-parse --abbrev-ref HEAD` to detect the branch (e.g., `002-accordion-component`)
and derives the feature directory automatically (`specs/002-accordion-component/`).
</critical>

<evaluation_criteria>
**Success**: Script executes, JSON output parsed, FEATURE_DIR extracted
**Failure**: Asking "Which feature?" or "What should I analyze?" BEFORE running the script
</evaluation_criteria>

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
- `OUTPUT` = FEATURE_DIR/gap-analysis-report.md (WILL BE CREATED)

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

### Step 7: Write Analysis Report to File (MANDATORY)

<critical>
**THIS STEP IS MANDATORY**: You MUST use the Write tool to create the gap-analysis-report.md file.
Do NOT output the report to terminal only. The file output IS the primary deliverable.
</critical>

<task>
Use the Write tool to create `gap-analysis-report.md` in FEATURE_DIR with ALL sections below.
</task>

<evaluation_criteria>
**Success**: File `gap-analysis-report.md` created in FEATURE_DIR using Write tool
**Failure**: Outputting report to terminal without creating file
</evaluation_criteria>

**File path**: `[FEATURE_DIR]/gap-analysis-report.md`

**Write the following template with ALL placeholders filled:**

```markdown
# [Feature Name] Specification Analysis Report

**Analysis Date**: [YYYY-MM-DD]
**Analyst**: Claude Haiku 4.5
**Method**: 6-pass cross-artifact consistency analysis

---

## Findings

| ID  | Category | Severity | Location(s) | Summary | Recommendation |
| --- | -------- | -------- | ----------- | ------- | -------------- |

[One row per finding, max 50 rows]

---

## Coverage Summary

| Requirement Key | Has Task? | Task IDs | Notes |
| --------------- | --------- | -------- | ----- |

[One row per requirement]

---

## Constitution Alignment Issues

[List CRITICAL violations, or "None detected" if clean]

## Unmapped Tasks

[List orphan tasks, or "None detected" if clean]

---

## Metrics

- **Total Requirements**: [N]
- **Total Tasks**: [N]
- **Coverage %**: [N]% (requirements with ≥1 task)
- **Ambiguity Count**: [N]
- **Duplication Count**: [N]
- **Critical Issues**: [N]

---

## Next Actions

[Based on severity - if CRITICAL exists, recommend resolving before implementation]

**Suggested Commands**:
[List relevant /speckit.* commands based on findings]

---

## Validation Methodology

This analysis followed a 6-pass detection workflow:

1. **Pass A (Duplication)**: Near-duplicate requirements
2. **Pass B (Ambiguity)**: Vague terms, unresolved placeholders
3. **Pass C (Underspecification)**: Missing objects, criteria
4. **Pass D (Constitution Alignment)**: MUST violations
5. **Pass E (Coverage Gaps)**: Requirements without tasks
6. **Pass F (Inconsistency)**: Terminology drift, conflicts

**Evidence Quality**: All findings include:

- ✅ Exact file:line locations
- ✅ Category classification
- ✅ Severity assignment
- ✅ Actionable recommendation

---

**END OF REPORT.**
```

---

### Step 8: Provide Completion Summary

<task>
After writing the file, output a brief completion summary to the user.
</task>

**Output format**:

```
✅ Analysis report saved to: [FEATURE_DIR]/gap-analysis-report.md

**Summary**:
- Total findings: [N]
- Critical issues: [N]
- High priority: [N]
- Coverage: [N]%

[IF CRITICAL issues exist:]
⛔ CRITICAL issues found. Resolve before /speckit.implement:
  - [ID]: [recommendation]

[IF only HIGH/MEDIUM:]
⚠️ HIGH priority issues found. Recommend addressing before implementation.

[IF clean:]
✅ No critical or high-priority issues. Safe to proceed with /speckit.implement
```

---

### Step 9: Offer Follow-Up Actions

<remediation_offer>
After completion summary, offer follow-up options:

"Would you like me to:"

- Suggest concrete edits for the top N issues
- Run /speckit.specify to refine the specification
- Proceed to /speckit.implement (if no critical issues)

**IMPORTANT**: Do NOT apply edits automatically. Only suggest for user review.
</remediation_offer>

---

## Validation Checklist

<validation_checklist>
Before completing, verify:

- [ ] All 6 detection passes executed
- [ ] Finding IDs are stable (category prefix + sequence)
- [ ] Severity assigned to all findings
- [ ] Total findings ≤ 50 (overflow aggregated in summary)
- [ ] Coverage summary includes all requirements
- [ ] Metrics calculated correctly
- [ ] Constitution violations marked CRITICAL
- [ ] **Used Write tool to create gap-analysis-report.md**
- [ ] Next actions based on actual findings
- [ ] Completion summary output to user
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

- **NEVER ask the user which feature to analyze** — run the prerequisite script FIRST; it auto-detects from git branch
- **ALWAYS use Write tool** to create gap-analysis-report.md — file output is MANDATORY
- **NEVER output report to terminal only** — the file IS the primary deliverable
- **NEVER modify spec.md, plan.md, or tasks.md** — analysis is non-destructive
- **NEVER hallucinate missing sections** (report accurately if absent)
- **ALWAYS prioritize constitution violations** (these are CRITICAL)
- **ALWAYS use stable IDs** (deterministic on rerun)
- **LIMIT findings to 50** (aggregate overflow in summary)
- If zero issues found: Output success report with coverage statistics
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
