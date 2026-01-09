---
description: Generate a structured implementation gap analysis for cross-artifact validation using a non-reasoning model (GPT-4.1 or Gemini 3 Pro).
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Path grounding (CRITICAL)

- Do **not** guess or "fix up" filesystem paths (e.g. avoid fallback paths like `/Users/...`).
- Treat paths emitted by the `.specify` PowerShell scripts (`-Json` output) as the **only source of truth**; use them verbatim.
- If a required path is missing/unclear, STOP and re-run the prerequisite script (or ask the user) instead of synthesizing a path.

## Goal

Generate a high-accuracy implementation gap analysis by following a structured 6-step validation workflow. This command is designed for **non-reasoning models** (GPT-4.1, Gemini 3 Pro) that can follow mechanical procedures reliably but lack deep reasoning. The output is a validation-ready brief for a reasoning model (Sonnet 4.5, Opus 4.5, GPT-5.2) to perform final gap validation.

## Operating Constraints

**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured analysis report with evidence scoring.

**Model Selection**: This agent is optimized for GPT-4.1 (zero-cost 1M context) or Gemini 3 Pro. Use reasoning models (Sonnet/Opus) for the validation step (`/speckit.analyze`).

## Execution Steps

### 0. Initialize Analysis Context

Run `./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` once from repo root and parse JSON for FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:

- SPEC = FEATURE_DIR/spec.md
- PLAN = FEATURE_DIR/plan.md
- TASKS = FEATURE_DIR/tasks.md
- CONTRACTS = FEATURE_DIR/contracts/ (if exists)

Abort with an error message if spec.md, plan.md, or tasks.md are missing.

### 1. Load Artifacts

Load these files in full:

- spec.md (all requirements, user stories, success criteria)
- plan.md (architecture, implementation notes)
- tasks.md (task list with IDs)
- Any implementation files provided by user (e.g., component TS, templates, stories)

### 2. Execute Structured Analysis

Follow the 6-step workflow defined next.

#### STEP 0: Requirement Filtering (MANDATORY FIRST PASS)

Exclude from gap analysis:

- ✂️ **Documentation-only**: Requirements with "documentation MUST" / "document that" / "README"
- ✂️ **Manual testing**: "tested via", "manual QA", "verify with"
- ✂️ **Success criteria**: Requirements in "Success Criteria" or "Measurable Outcomes" sections
- ✂️ **Out of scope**: Requirements in "Out of Scope" / "Non-Goals" / "Future Enhancements"

**CRITICAL**: If a requirement says "MUST document", it's a documentation task, NOT an implementation gap.

#### STEP 1: Extract Requirements (scan spec.md)

For each requirement found (AFTER Step 0 filtering):

- REQ-[ID]: [description]
- Type: [CODE if needs implementation | TEST if needs test coverage | CONFIG if needs configuration]
- Mandatory: [YES if "MUST"/"shall"/FR-XXX, NO if "MAY"/"optional"]
- Location: spec.md:[line]

List 15-20 CODE/TEST requirements only.

#### STEP 2: Check Implementation (one requirement at a time)

##### 2.1 Intent Check (BLOCKING — must pass to continue)

```
□ Does spec say "opt-in" / "CSS-only" / "handled by [framework]"?
   YES → Mark "Not a gap (intentional design)" → SKIP TO NEXT REQUIREMENT

□ Does spec say "prefer @angular/aria" / "use @angular/cdk" / "leverage framework"?
   YES → Check delegation in Step 2.2

□ Does spec clarify "manual testing" / "tested via @for" / "manual QA"?
   YES → Mark "Not a gap (manual validation, not code)" → SKIP TO NEXT REQUIREMENT
```

##### 2.2 Framework Delegation Check

```
If requirement mentions ARIA/keyboard/focus:
   Search for: @angular/aria, AccordionGroup, AccordionTrigger, AccordionPanel
   If FOUND → Mark "✅ Delegated to @angular/aria (correct per constitution)"

If requirement mentions "lifecycle" / "@defer" / "retention":
   Search template for: @defer (when
   If FOUND → Mark "✅ Framework-provided via @defer" → SKIP TO NEXT REQUIREMENT
```

##### 2.3 Code Search (only if 2.1 and 2.2 don't skip)

```
1. Extract 3-5 unique keywords from requirement
2. Search in order:
   a. Component TS files
   b. Template files
   c. Stories
   d. Test files
3. Record: Found in [file:line:column] with [exact matching text]
   OR: NOT FOUND after searching [list files searched]
```

##### 2.4 Status Assignment

```
✅ Fully implemented: [file:line with exact code snippet]
⚠️ Partially implemented: [specify EXACT missing parts with line references]
❌ Not found: [list files searched, keywords used]
🔀 Delegated: [framework + directive name + file:line]
🚫 Not a gap: [reason: CSS-only / opt-in / manual test / documentation]
```

#### STEP 3: Gap List (only ❌ or ⚠️ items)

**CRITICAL EVIDENCE REQUIREMENT**: Each gap MUST have exact spec location + exact search results.

```
GAP-[N]: [REQ-ID] - [one sentence]
Evidence:
  - Spec: [FR-XXX at spec.md:LINE with "exact quote"]
  - Tasks: [T-XXX at tasks.md:LINE with "exact task description"]
  - Search: [keywords] in [file1, file2, file3]
    Results: "NOT FOUND" OR [file:line with partial match explanation]
  - Checked contracts/: [YES/NO + result]
  Priority: [P0=MUST + blocking | P1=should + important | P2=nice-to-have]

Fix: [1-2 sentence description of smallest fix]
```

**Maximum 10 gaps** (highest priority first).

#### STEP 4: Anti-False-Positive Check (BLOCKING)

For EACH gap, verify ALL checkboxes. If ANY checkbox is UNCHECKED, REMOVE the gap from final list.

```
Gap [N]: [title]
□ Confirmed spec does NOT say "CSS-only" / "opt-in" / "manual test"?
□ Confirmed NOT delegated to @angular/aria or @angular/cdk?
□ Confirmed requirement type is "MUST" (not "MAY" / "should consider")?
□ Searched contracts/ folder? [YES + result]
□ Searched test/story files? [YES + result]
□ Confirmed NOT a documentation-only requirement?
□ Confirmed has EXACT spec line number + EXACT search file list?

All checked → ✅ KEEP GAP
Any unchecked → ❌ REMOVE FROM FINAL LIST (mark "FALSE POSITIVE")
```

#### STEP 5: Validation Rubric (Score Each Gap)

For each gap that passed Step 4, calculate a validation score (0-10):

```
Gap [N]: [title]

Evidence Quality (0-10 scale):
  □ +2: Has exact spec.md line number with FR-XXX reference?
  □ +2: Has exact tasks.md task ID (T-XXX) reference?
  □ +2: Lists ALL files searched with keywords used?
  □ +1: Shows "NOT FOUND" or partial match with explanation?
  □ +1: Checked contracts/ folder?
  □ +1: Checked test/story files?
  □ +1: Priority has justification (why P0/P1/P2)?

Total Score: [X]/10

Confidence Level:
  - 9-10: HIGH (all evidence present)
  - 6-8: MEDIUM (key evidence present, minor gaps)
  - 0-5: LOW (missing critical evidence) → REMOVE FROM FINAL LIST
```

**Only gaps scoring 6+ proceed to final output.**

#### STEP 6: Final Output

### Validated Gaps (passed Step 4 checks + scored 6+)

[List only gaps that passed ALL Step 4 checks AND scored 6+ in validation rubric]

**For each gap, include:**

- Gap title + one-sentence description
- Evidence section (spec line, tasks reference, search results)
- Validation score [X]/10
- Priority justification
- Smallest fix (1-2 sentences)

### False Positives Removed (failed Step 4 checks or scored <6)

[List gaps removed + which check failed or why score was too low]

### Summary

- Total requirements scanned: [N]
- Filtered in Step 0: [N documentation/manual test]
- Gaps claimed: [N]
- Gaps validated (score 6+): [N]
- False positives removed: [N]
- Accuracy: [validated gaps / claimed gaps] = [X]%

---

## FORBIDDEN (never report as gaps):

- ❌ "Animation hooks missing" when spec says "CSS-only" / "Foundation CSS handles"
- ❌ "ARIA live region missing" when spec says "opt-in via announce input"
- ❌ "Performance test missing" when spec says "tested via @for" / "manual QA"
- ❌ "Documentation missing" (wrong artifact type)
- ❌ "@defer lifecycle not explicit" when template uses @defer (framework provides this)
- ❌ "Keyboard navigation instant" when delegated to @angular/aria
- ❌ "Foundation CSS classes missing" when code uses @angular/aria directives (they add classes)

## REQUIRED EVIDENCE (every gap must have):

✅ Exact spec.md line number with FR-XXX quote
✅ Exact tasks.md task ID (T-XXX) reference
✅ Exact list of files searched with keywords
✅ Priority with justification (P0=MUST, P1=should, P2=nice)
✅ Validation score ≥ 6/10

---

## Next Actions

After generating the brief:

1. Save it to a temporary location (do not write to repo)
2. Instruct user to review the validated gaps (score 6+)
3. Suggest running `/speckit.analyze` with a reasoning model to perform final validation
4. Provide this prompt for the reasoning model:

```
/speckit.analyze

Use the attached GPT-4.1 analysis brief as the primary input. Validate each claimed gap against the source artifacts.

Deliver:
- A prioritized list of real inconsistencies/gaps (with exact file + heading/line pointers)
- For each gap: why it matters, and the smallest fix (spec vs plan vs tasks)
- Call out any "false positives" from the brief and why they're false
```

## Context

$ARGUMENTS
