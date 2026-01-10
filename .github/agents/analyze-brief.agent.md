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

**IMPORTANT**: After completing all steps below, you MUST output the complete structured report to the user as specified in STEP 6. Do NOT output only a summary. The detailed gap analysis IS your response.

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

#### STEP 6: Copy This Template and Fill It In

**INSTRUCTIONS**: Copy the template below EXACTLY. Replace every [placeholder] with your analysis results. Do NOT write a summary instead.

---

## Validated Gaps

### GAP-1: [Write the gap title here]

**Evidence:**
- **Spec**: [FR-XXX] at spec.md:[line number] with "[exact quote from spec]"
- **Tasks**: [T-XXX] at tasks.md:[line number] with "[exact task description]"
- **Search**: Keywords [[keyword1, keyword2, keyword3]] searched in:
  - [filename] (line [X]): [search result - "FOUND" or "NOT FOUND"]
  - [filename2] (line [Y]): [search result]
- **Contracts**: [YES - checked contracts/filename.ts line X / NO - no contracts folder]

**Validation Score**: [X]/10 ([HIGH or MEDIUM] confidence)

**Priority**: [P0 or P1 or P2] - [1 sentence justifying priority]

**Fix**: [1-2 sentences describing smallest code change needed]

---

[Copy the gap structure above for GAP-2, GAP-3, etc. - one section per gap scoring 6+]

---

## False Positives Removed

[If gaps failed validation, list them:]
- **GAP-[N]**: [Title] - Failed because: [which Step 4 check failed]

[If no false positives:]
None - all identified gaps passed validation.

---

## Summary

- **Total requirements scanned**: [number]
- **Filtered in Step 0**: [number] documentation/manual test requirements
- **Gaps initially identified**: [number]
- **Gaps validated (score 6+)**: [number]
- **False positives removed**: [number]
- **Accuracy rate**: [validated / identified] = [percentage]%

---

**END OF REPORT. DO NOT ADD ANYTHING AFTER THIS LINE.**

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

## Output Requirements (CRITICAL)

After completing Steps 0-5, go to STEP 6 and **COPY THE TEMPLATE**.

**STEP 6 is a fill-in-the-blanks template**. Do NOT write a summary. Copy the template and replace every [placeholder] with your data.

---

# ⚠️ EXECUTION CHECKLIST BEFORE RESPONDING ⚠️

**Your response to the user MUST be the filled-in template from STEP 6.**

**Do NOT write:**
- ❌ "Accordion implementation gap analysis complete."
- ❌ "10 validated gaps found:"
- ❌ "Key gaps: rename multiExpandable, add methods"
- ❌ Any bullet-point summary

**DO write:**
- ✅ Copy the entire template from STEP 6
- ✅ Replace every [placeholder] with your data
- ✅ Include ALL gaps (not just a list of titles)
- ✅ Start with `## Validated Gaps` (first line)
- ✅ End with `**END OF REPORT**` (last line)

---

Checklist (verify before responding):

- [ ] Completed Steps 0-5 (loaded files, extracted requirements, checked implementation, scored gaps)
- [ ] Copied the STEP 6 template in full
- [ ] Filled in ALL [placeholders] for EVERY gap scoring 6+
- [ ] Did NOT write a summary instead of the template

---

## ❌ FORBIDDEN OUTPUT PATTERNS

Do NOT write these patterns:

```
❌ "Accordion implementation gap analysis complete."
❌ "8 validated gaps found:"
❌ "Key gaps: rename multiExpandable, add methods"
❌ "Ready for targeted fixes—let me know which gap(s) to address first."
❌ "- 3 P0 (API parity: input naming, missing methods)"
```

These are summaries. Step 6 requires writing the full structured report with evidence for each gap.

---

## ✅ REQUIRED OUTPUT STRUCTURE

Your response must be the STEP 6 template with all [placeholders] filled in.

**Required sections** (in this order):
1. `## Validated Gaps` - with GAP-1, GAP-2, etc. sections (each with Evidence, Validation Score, Priority, Fix)
2. `## False Positives Removed` - list of removed gaps or "None"
3. `## Summary` - statistics with bullet points
4. `**END OF REPORT**` - final line

**If you wrote "10 validated gaps found" or any bullet list without Evidence sections, you did it WRONG.**

Go back to STEP 6 and copy the template.

---

# 🛑 STOP READING. START WRITING YOUR RESPONSE NOW. 🛑

Go to STEP 6. Copy the template. Fill in every [placeholder].

Your first line of output must be: `## Validated Gaps`

Your last line of output must be: `**END OF REPORT. DO NOT ADD ANYTHING AFTER THIS LINE.**`
