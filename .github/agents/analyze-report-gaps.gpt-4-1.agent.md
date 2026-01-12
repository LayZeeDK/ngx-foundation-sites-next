---
description: Generate a structured implementation gap analysis for large features (>180K tokens) using GPT-4.1's 1M context. For small-medium features (<180K tokens), use /analyze-report-gaps.gpt-5-mini (2-3x faster). Optimized for GPT-4.1's non-reasoning, long-context capabilities.
model: gpt-4.1
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
- GAPS_REMEDIATION = FEATURE_DIR/GAPS_REMEDIATION.md (if exists)
- REMEDIATION_CHECKLIST = FEATURE_DIR/REMEDIATION_CHECKLIST.md (if exists)

Abort with an error message if spec.md, plan.md, or tasks.md are missing.

### 0.5. Load Existing Remediation Documents (MANDATORY)

**Purpose**: Check for existing gap tracking documents to avoid re-flagging known gaps.

**Step 0.5.1**: Check if GAPS_REMEDIATION.md exists

```bash
# Check if file exists
ls FEATURE_DIR/GAPS_REMEDIATION.md
```

- If **file exists**: Proceed to Step 0.5.2
- If **file does NOT exist**: Skip to Step 1 (no known gaps to skip)

**Step 0.5.2**: Load Known Gaps Registry

If GAPS_REMEDIATION.md exists, extract all documented gaps and create a registry:

```
For each section starting with "### GAP-":
1. Extract Gap ID: GAP-N (where N is a number)
2. Extract Gap Title: The text after "GAP-N: "
3. Extract Status: Line starting with "**Status**: "
4. Extract Evidence keywords: Extract all keywords mentioned in "**Evidence**" section

Create registry entry:
{
  id: "GAP-N",
  title: "[extracted title]",
  status: "[NOT IMPLEMENTED | PARTIAL | TRACKED AS T###]",
  keywords: ["keyword1", "keyword2", "keyword3"]
}
```

**Example extraction:**

```markdown
### GAP-1: Foundation API Methods Missing on Item

**Status**: NOT IMPLEMENTED
**Evidence**:

- **Spec**: FR-075 at spec.md:530
- **Tasks**: T140-T142 at tasks.md:477-479
```

**Registry entry:**

```
{
  id: "GAP-1",
  title: "Foundation API Methods Missing on Item",
  status: "NOT IMPLEMENTED",
  keywords: ["down()", "up()", "toggle()", "methods", "NfsAccordionItemDef"]
}
```

**Step 0.5.3**: Create Known Gaps List

Store all extracted gap IDs for quick lookup:

```
KNOWN_GAPS = ["GAP-1", "GAP-2", "GAP-3", ...]
```

**Step 0.5.4**: Output Confirmation

Tell user how many known gaps were loaded:

```
✅ Loaded [N] known gaps from GAPS_REMEDIATION.md
   Will skip these during analysis to avoid re-flagging.
```

If no remediation doc exists:

```
ℹ️  No GAPS_REMEDIATION.md found - this is a first-time analysis.
```

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

**BEFORE adding each gap to the list, check against known gaps registry from Step 0.5:**

```
For each potential gap:

1. Extract gap keywords from your search (e.g., "down()", "up()", "multiExpand")

2. Check if it matches a known gap:

   FOR EACH entry in KNOWN_GAPS registry:
     IF (gap keywords match ≥50% of known gap keywords)
     OR (gap title is ≥70% similar to known gap title):
       → SKIP THIS GAP
       → Add to "Skipped Known Gaps" section (see below)
       → Do NOT add to new gaps list
       → Continue to next potential gap

3. If NO match found in KNOWN_GAPS:
   → This is a NEW gap
   → Add to new gaps list with full evidence (below)
```

**For NEW gaps (not in known gaps registry):**

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

**For KNOWN gaps (matched in registry):**

Add to separate section:

```
SKIPPED: [known gap title]
Reason: Already documented in GAPS_REMEDIATION.md as [GAP-ID]
Status: [status from registry]
```

**Maximum 10 NEW gaps** (highest priority first).

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

#### STEP 6: Write Report to Temporary File

**INSTRUCTIONS**: You will write the complete gap analysis report to a temporary markdown file. Use the template below EXACTLY. Replace every [placeholder] with your analysis results.

**File path**: `gap-analysis-report.md` (temporary file in current directory)

**Action**: Use the Write tool to create this file with the content below (with [placeholders] filled in).

---

**Template for gap-analysis-report.md:**

```markdown
## Analysis Mode

[If GAPS_REMEDIATION.md was found in Step 0.5:]
**⚠️ INCREMENTAL ANALYSIS MODE**: Existing gap remediation document found. This analysis will only report NEW gaps not already tracked in `GAPS_REMEDIATION.md`.

**Known gaps loaded**: [N] gaps from GAPS_REMEDIATION.md
**Purpose**: Avoid re-flagging documented gaps that are already being tracked/fixed.

[If no GAPS_REMEDIATION.md found:]
**FIRST-TIME ANALYSIS MODE**: No existing gap remediation document found. This is a complete gap analysis.

---

## Validated Gaps (NEW)

[If NEW gaps found:]

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

[Copy the gap structure above for GAP-2, GAP-3, etc. - one section per NEW gap scoring 6+]

[If NO new gaps found:]
✅ **No new gaps detected.** All identified issues are already documented in GAPS_REMEDIATION.md.

---

## Skipped Known Gaps

[If gaps were skipped because they matched KNOWN_GAPS registry:]

The following gaps were detected but SKIPPED because they are already documented in `GAPS_REMEDIATION.md`:

1. **[Gap title]** - Already tracked as GAP-[N] (Status: [status from registry])
2. **[Gap title]** - Already tracked as GAP-[N] (Status: [status from registry])
   [etc.]

**Reference**: See `GAPS_REMEDIATION.md` for details on these known gaps and their remediation status.

[If no gaps were skipped:]
None - all detected gaps are new.

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
- **Known gaps loaded** (Step 0.5): [number from GAPS_REMEDIATION.md OR 0 if no doc exists]
- **Gaps initially identified**: [number]
- **Skipped known gaps**: [number matched in registry]
- **NEW gaps validated (score 6+)**: [number]
- **False positives removed**: [number]
- **Accuracy rate**: [validated / (identified - skipped)] = [percentage]%

---

**END OF REPORT. DO NOT ADD ANYTHING AFTER THIS LINE.**
```

---

**After writing the file, tell the user:**

[If GAPS_REMEDIATION.md existed (incremental mode):]
"✅ Incremental gap analysis complete. Report saved to `gap-analysis-report.md`

**Mode**: Incremental (loaded [N] known gaps from GAPS_REMEDIATION.md)
**Result**: [X] NEW gaps found, [Y] known gaps skipped

[If X > 0:]
Please review the NEW gaps - existing gaps are already tracked in GAPS_REMEDIATION.md.

[If X = 0:]
✅ No new gaps detected! All identified issues are already documented in GAPS_REMEDIATION.md."

[If no GAPS_REMEDIATION.md (first-time mode):]
"✅ Gap analysis complete. Report saved to `gap-analysis-report.md`

**Mode**: First-time analysis
**Result**: [X] gaps validated

Please review the validated gaps with full evidence, validation scores, and priority justifications."

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

After completing Steps 0-5, go to STEP 6 and **WRITE THE REPORT TO A FILE**.

**STEP 6 is a file-writing operation**. Use the Write tool to create `gap-analysis-report.md` with the template (all [placeholders] replaced with your data).

Do NOT output the report content to the user directly - write it to the file first, then tell the user where to find it.

---

# ⚠️ EXECUTION CHECKLIST BEFORE RESPONDING ⚠️

**Your workflow:**

1. Complete Step 0 (Initialize - load paths)
2. Complete Step 0.5 (Load existing GAPS_REMEDIATION.md if exists, create KNOWN_GAPS registry)
3. Complete Steps 1-5 (Analysis - check each gap against KNOWN_GAPS registry in Step 3)
4. Use Write tool to create `gap-analysis-report.md` with the filled-in template
5. Tell user based on mode (incremental vs first-time) and results (new gaps vs no new gaps)

**CRITICAL for Step 3**: Before adding each gap, check if it matches KNOWN_GAPS registry. If match found, add to "Skipped Known Gaps" section instead of "Validated Gaps (NEW)" section.

**Do NOT write a summary to the user.** Write the full report to the file, then tell them the mode and counts.

**Do NOT output:**

- ❌ "Accordion implementation gap analysis complete. 10 validated gaps found..."
- ❌ Bullet-point summary of gaps
- ❌ Any text other than "Report saved to gap-analysis-report.md"

**DO output:**

- ✅ Use Write tool with file path `gap-analysis-report.md`
- ✅ File content = template with ALL [placeholders] filled in
- ✅ Then tell user where to find the report

---

Checklist (verify before responding):

- [ ] Completed Step 0 (loaded artifact paths)
- [ ] Completed Step 0.5 (checked for GAPS_REMEDIATION.md, created KNOWN_GAPS registry if exists)
- [ ] Completed Steps 1-5 (extracted requirements, checked against KNOWN_GAPS, scored NEW gaps only)
- [ ] Checked each gap in Step 3 against KNOWN_GAPS registry (skipped matches)
- [ ] Called Write tool to create `gap-analysis-report.md`
- [ ] File contains the COMPLETE template with ALL [placeholders] filled in
- [ ] File has "Analysis Mode" section (INCREMENTAL or FIRST-TIME)
- [ ] File has "Skipped Known Gaps" section (with list of matched gaps OR "None")
- [ ] File has "Validated Gaps (NEW)" section (with NEW gaps only OR "No new gaps detected")
- [ ] Told user correct mode (incremental vs first-time) and counts

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

## ✅ REQUIRED FILE STRUCTURE

The file `gap-analysis-report.md` must contain:

**Required sections** (in this order):

1. `## Validated Gaps` - with GAP-1, GAP-2, etc. sections (each with Evidence, Validation Score, Priority, Fix)
2. `## False Positives Removed` - list of removed gaps or "None"
3. `## Summary` - statistics with bullet points
4. `**END OF REPORT**` - final line

**If the file contains "10 validated gaps found" or any bullet list without Evidence sections, you did it WRONG.**

Go back to STEP 6, use Write tool, and put the full template in the file.

---

# 🛑 STOP READING. EXECUTE STEP 6 NOW. 🛑

1. Go to STEP 6
2. Use Write tool to create `gap-analysis-report.md`
3. File content = template with ALL [placeholders] filled in
4. Tell user: "✅ Gap analysis complete. Report saved to `gap-analysis-report.md`"

**Do NOT output the report content to the user. Write it to the file.**

---

# GPT-4.1 Specific Optimizations (1M Context, Non-Reasoning)

## Optimization 1: Sandwich Method (Instructions at Beginning AND End)

**Research**: [GPT-4.1 Prompting Guide](https://cookbook.openai.com/examples/gpt4-1_prompting_guide) - "sandwich method works best for long context"

**What this means**:

- ✅ Instructions at **beginning** (already present above)
- ✅ Instructions at **END** (critical reminder below)

### 🔁 END-OF-PROMPT INSTRUCTION SUMMARY (Sandwich Method)

**CRITICAL REMINDER**: You are GPT-4.1 analyzing implementation gaps. Your task:

1. **Execute Steps 0-6 mechanically** (no creative interpretation)
2. **Use Write tool** to create `gap-analysis-report.md` with COMPLETE template
3. **Include ALL gap sections** with Evidence, Validation Score, Priority, Fix
4. **Do NOT summarize** - write full structured report to file
5. **Tell user**: Mode (incremental/first-time) and counts only

**Literal instruction following**: GPT-4.1 does EXACTLY what instructions say. Do NOT:

- ❌ Infer user intent beyond explicit instructions
- ❌ Add helpful explanations not requested
- ❌ Summarize when instructions say "write complete report"
- ❌ Output report content to user (write to file only)

**Required output**:

```
✅ [Incremental/First-time] gap analysis complete. Report saved to gap-analysis-report.md
Mode: [mode]
Result: [counts]
```

**File must contain**:

- Analysis Mode section
- Validated Gaps (NEW) section with FULL evidence for each gap
- Skipped Known Gaps section
- False Positives Removed section
- Summary section with accurate counts

**Go to STEP 6 now and write the file.**

---

## Optimization 2: Long-Context Performance (1M Token Handling)

**Research**: [GPT-4.1 Technical Analysis](https://trickle.so/blog/inside-gpt-4-1-technical-analysis) - "GPT-4.1 retrieves accurately at all positions up to 1M"

**Optimization for 1M context**:

### Progressive Disclosure Strategy

When loading large features (>500K tokens):

```
STEP 1: Load minimal sections first
- spec.md: Load only "Functional Requirements" section (not examples/prose)
- plan.md: Load only "Phases" and "Architecture" (skip detailed notes)
- tasks.md: Load only task IDs and descriptions (skip checkpoints)

STEP 2: Search implementation
- Use Grep tool for keyword search (don't load entire files)
- Only Read full files when grep finds matches

STEP 3: Load contracts on-demand
- Only load contracts when gap validation requires them
- Use Glob to find, Read specific contracts only
```

**Why this works**:

- ✅ GPT-4.1 handles 1M tokens well, but chunking improves performance
- ✅ Progressive loading keeps working memory focused
- ✅ On-demand reading reduces total context

### Long-Context Retrieval Best Practices

**Research**: GPT-4.1 "consistently retrieves information accurately at all positions"

**How to leverage**:

1. **Place critical instructions at BOTH ends** (sandwich method ← applied above)
2. **Use markdown headers** for section navigation (`## Step 0`, `## Step 1`, etc.)
3. **Reference by heading** when instructions span long distance ("See Step 2.3 above")
4. **Repeat key constraints** in each step (don't assume GPT-4.1 remembers from earlier)

**Example**:

```markdown
## STEP 3: Gap List

**REMINDER from Step 0.5**: Check against KNOWN_GAPS registry before adding each gap.

FOR EACH potential gap:
Check KNOWN_GAPS (loaded in Step 0.5)
IF match found: SKIP
ELSE: Add to gap list
```

---

## Optimization 3: Literal Instruction Following

**Research**: [PromptHub GPT-4.1 Guide](https://www.prompthub.us/blog/the-complete-guide-to-gpt-4-1-models-performance-pricing-and-prompting-tips) - "GPT-4.1 won't follow implicit rules—it does exactly what you tell it"

**Critical for GPT-4.1**:

### Explicit Commands (Not Implicit)

```
❌ Implicit: "Identify gaps intelligently"
✅ Explicit: "FOR EACH requirement: EXTRACT keywords → SEARCH files → IF NOT FOUND: add to gap list"

❌ Implicit: "Handle errors gracefully"
✅ Explicit: "IF spec.md not found: STOP, OUTPUT 'spec.md not found', EXIT"

❌ Implicit: "Write a good report"
✅ Explicit: "Use Write tool, file path = gap-analysis-report.md, content = template with ALL [placeholders] filled"
```

### No Inference Assumptions

**GPT-4.1 does NOT**:

- ❌ Infer what "good quality" means → Specify validation score ≥ 6/10
- ❌ Guess which gaps to prioritize → Specify "P0 first, then P1, then P2"
- ❌ Assume structured output → Provide exact template with [placeholders]

**All instructions MUST be explicit.**

---

## Optimization 4: Structured Formatting for Long Context

**Research**: [GPT-4.1 Guide](https://www.godofprompt.ai/blog/gpt-4-1-prompting-guide) - "Use markdown titles, backticks, XML tags"

**Already applied** (no changes needed):

- ✅ Markdown headers for major sections (`## Step 0`, `### 2.1`, etc.)
- ✅ Backtick blocks for code/commands
- ✅ Numbered/bulleted lists for procedures
- ✅ XML examples for structured data (gap registry)

**Why this works**:

- GPT-4.1 navigates long context using structural markers
- Headers enable "jump to section" retrieval
- Consistent formatting improves accuracy

---

# 🔁 FINAL EXECUTION REMINDER (End of Sandwich)

**You are GPT-4.1 with 1M context. Execute this workflow EXACTLY:**

```
□ Step 0: Load paths
□ Step 0.5: Load KNOWN_GAPS registry (if exists)
□ Step 1: Extract requirements from spec.md (filter docs/manual tests)
□ Step 2: Check implementation (keyword search, mark ✅/⚠️/❌/🔀/🚫)
□ Step 3: Build gap list (check KNOWN_GAPS, skip matches, build NEW gaps)
□ Step 4: Anti-false-positive validation (7-point checklist per gap)
□ Step 5: Validation scoring (arithmetic 0-10, keep only ≥6)
□ Step 6: Write gap-analysis-report.md (Use Write tool with COMPLETE template)
```

**Critical constraints**:

- Maximum 10 NEW gaps (skip known gaps)
- Each gap MUST have FR-XXX + T-XXX + file search + score ≥6
- Write FULL report to file (not summary)
- Tell user: mode + counts (not report content)

**Literal following**:

- Do EXACTLY what each step says
- Do NOT add helpful extras
- Do NOT infer unstated requirements
- Do NOT summarize unless explicitly instructed

**Output**:

```
✅ [Mode] gap analysis complete. Report saved to gap-analysis-report.md
Mode: [INCREMENTAL or FIRST-TIME]
Result: [counts]
```

**Execute STEP 6 now. Use Write tool. Write complete report.**
