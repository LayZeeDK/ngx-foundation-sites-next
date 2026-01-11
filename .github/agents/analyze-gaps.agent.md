---
description: Validates gap analysis reports from /analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1 and creates comprehensive remediation documentation. Prevents future analysis tools from re-flagging known gaps by establishing single source of truth tracking.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Prerequisites

Before running this agent:

1. `gap-analysis-report.md` exists in repo root (from `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` or manual analysis)
2. Feature specs exist in `specs/<feature>/` (spec.md, plan.md, tasks.md)
3. Implementation files exist for validation

## Goal

Create remediation documentation that **prevents future `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` runs from re-flagging these gaps as new issues**. Establish a single source of truth for gap tracking.

## Validation Methodology

For each claimed gap in `gap-analysis-report.md`:

### Step 1: Verify the Gap Exists

- **Read spec.md** for FR-XXX, CA-XXX, AR-XXX requirements
- **Read tasks.md** for task IDs (T###)
- **Read contracts/** (if present) for API definitions
- **Confirm** requirement exists and is NOT marked as optional/stretch goal

### Step 2: Search Implementation

- **Use Grep tool** to search implementation files with exact keywords
- **Document results**: "FOUND at line X" or "NOT FOUND"
- **Search multiple files** to confirm absence
- Example: Searching for `down()` method → search for `down()`, `down(`, `method down`

### Step 3: Build Evidence Chain

Create full traceability:

```
FR-075 (spec.md:530) → T140 (tasks.md:477) → NfsAccordionItemApi (contracts/accordion-api.ts:146) → NOT FOUND in accordion-item-def.ts:1-58
```

### Step 4: Score Confidence (0-10 scale)

- **10/10**: Exact line numbers + contract verified + comprehensive search
- **9/10**: Exact line numbers + contract verified
- **8/10**: Task IDs + grep confirmed
- **7/10**: Plan references + indirect task mentions
- **6/10**: Indirect references only
- **0-5/10**: Insufficient evidence (reject as low-quality)

### Step 5: Assess Impact

Why does this gap matter?

- Breaks constitutional requirement (CA-XXX)
- Violates accessibility standard (WCAG, ARIA)
- Prevents Foundation JS migration
- Silent failures confuse developers
- Limits feature functionality

### Step 6: Identify Smallest Fix

Three options:

1. **Implementation fix**: Add missing code (provide snippet)
2. **Spec clarification**: Requirement is optional/out-of-scope (update spec.md)
3. **Task documentation**: Already implemented differently (update tasks.md with ⚠️ note)

## Deliverables

Create these documents in `specs/<feature>/`:

### 1. GAPS_REMEDIATION.md (Comprehensive Tracking)

**Purpose**: Single source of truth for `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` to check before flagging gaps.

**Required Sections**:

- **Purpose**: Why this document exists
- **P0 - BLOCKING**: Critical gaps with evidence chains
- **P1 - IMPORTANT**: Important gaps with evidence chains
- **P2 - POLISH**: Nice-to-have gaps
- **False Positives**: Claimed gaps that are working as designed
- **Remediation Roadmap**: Phased approach with time estimates
- **Validation Methodology**: 6-step process used
- **For `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` Tool**: Instructions for future analysis

**Per-Gap Structure**:

````markdown
### GAP-N: [Descriptive Title]

**Status**: NOT IMPLEMENTED | PARTIAL | TRACKED AS T###
**Validation Score**: N/10
**Evidence**:

- **Spec**: FR-XXX at spec.md:line — "[requirement quote]"
- **Tasks**: T### at tasks.md:line
- **Contract**: Interface at contracts/file.ts:line
- **Implementation**: Search in file.ts (lines X-Y) found NO [keyword]

**Impact**: [What breaks without this fix]

**Fix**:

```typescript
// Exact code snippet with file path
```
````

**Estimated Time**: X minutes
**Violates**: FR-XXX, CA-XXX, AR-XXX

````

### 2. REMEDIATION_CHECKLIST.md (Implementation Guide)

**Purpose**: Step-by-step developer checklist with exact code snippets.

**Per-Gap Structure**:
```markdown
### ✅ Checklist: GAP-N - [Title] (X min)

**BREAKING CHANGE** (if applicable)

- [ ] **Step 1**: [Exact action]
  ```typescript
  // FROM:
  [current code]

  // TO:
  [fixed code]
````

- [ ] **Step 2**: [Next action]
      [Instructions]

- [ ] **Step 3**: Add unit tests

  ```typescript
  it('should...', () => {
    // Test code
  });
  ```

- [ ] **Step 4**: Run tests to verify
  ```bash
  npm run test
  ```

**Verification**: [How to confirm fix worked]

````

**Include**:
- Post-Remediation Validation section
- Total Estimated Time vs Actual Time tracking

### 3. Update Existing Spec Artifacts

**spec.md** - Add Known Gaps section:
```markdown
**Known Gaps in Current Implementation**: See **[GAPS_REMEDIATION.md](./GAPS_REMEDIATION.md)** for comprehensive tracking.

### P0 - BLOCKING (X min)
1. **GAP-N**: [Brief description] (violates FR-XXX) — X min
````

**plan.md** - Update Known Implementation Gaps section with same structure.

**tasks.md** - Add inline warnings:

```markdown
- [ ] T021 Implement inputs ⚠️ **NAMING GAP**: See GAPS_REMEDIATION.md GAP-3.
```

**gap-analysis-report.md** - Add superseded notice at top:

```markdown
**⚠️ SUPERSEDED**: This analysis has been validated and consolidated into **[specs/<feature>/GAPS_REMEDIATION.md]** for ongoing tracking.
```

## False Positive Analysis

For each claimed gap that's NOT actually a gap:

1. **Verify it's working as designed**:
   - Check spec Goals/Non-Goals
   - Check constitutional requirements
   - Check architectural decisions in plan.md

2. **Document why it's not a gap**:
   - Cite exact spec.md:line
   - Quote relevant Goals/Non-Goals section
   - Explain architectural decision

3. **Add to "Not Gaps" section** in GAPS_REMEDIATION.md

**Common False Positives**:

- Features in Non-Goals (e.g., animation hooks when spec says "CSS-only")
- Optional features marked as "stretch" in spec
- Features delegated to framework primitives (@angular/aria)
- Implementation differs from plan but meets requirements

## Commit Strategy

Create **exactly 4 commits** in this order:

### Commit 1: Core Tracking Document

```bash
git commit -m "docs(feature): add validated gap analysis with remediation tracker

- Add GAPS_REMEDIATION.md with evidence-based gap tracking
- Document N validated gaps (X P0, Y P1, Z P2) with fix estimates
- Validation scores N/10 with 6-step methodology
- Total fix time: P0=Xmin, P0+P1=Ymin, P0+P1+P2=Zmin

Validation methodology: Cross-artifact analysis (spec vs contracts vs implementation)
Purpose: Single source of truth for /analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Commit 2: Implementation Guide

```bash
git commit -m "docs(feature): add detailed remediation implementation checklist

Create step-by-step guide with exact code snippets, before/after examples,
verification criteria, and post-remediation validation for all N gaps.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Commit 3: Cross-References

```bash
git commit -m "docs(feature): update spec/plan/tasks with gap references

- Update spec.md with GAPS_REMEDIATION.md reference
- Update plan.md Known Implementation Gaps section
- Add inline warnings to affected tasks (e.g., T021 ⚠️ NAMING GAP)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Commit 4: Supersede Report

```bash
git commit -m "docs(feature): mark gap analysis report as superseded

Add notice at top directing readers to GAPS_REMEDIATION.md for ongoing tracking.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Execution Steps

### 1. Locate Gap Analysis Report

```bash
# Check if gap-analysis-report.md exists in repo root
ls gap-analysis-report.md
```

If not found, ask user to provide path or run `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` first.

### 2. Identify Feature

Read `gap-analysis-report.md` to determine which feature is being analyzed.
Typical format: "**Component**: NfsAccordion" or similar.

### 3. Load Source Artifacts

Read in this order (progressive disclosure):

- `specs/<feature>/spec.md` (requirements)
- `specs/<feature>/tasks.md` (task tracking)
- `specs/<feature>/contracts/*.ts` (API definitions, if present)
- Implementation files (only sections needed for validation)

### 4. Validate Each Claimed Gap

For each gap in `gap-analysis-report.md`:

1. **Extract claim**: What is missing? (e.g., "down() method not implemented")
2. **Find requirement**: Search spec.md for FR-XXX reference
3. **Find task**: Search tasks.md for task ID
4. **Find contract**: Search contracts/ for interface definition
5. **Search implementation**: Use Grep to confirm presence/absence
6. **Score confidence**: Apply 0-10 rubric
7. **Assess impact**: Why does this matter?
8. **Determine fix**: Code snippet or documentation update?

### 5. Identify False Positives

For each claimed gap that validation disproves:

- Find spec citation proving it's working as designed
- Document in "False Positives" section
- Explain why analysis tool incorrectly flagged it

### 6. Create GAPS_REMEDIATION.md

Use Write tool to create comprehensive tracking document with all validated gaps.

### 7. Create REMEDIATION_CHECKLIST.md

Use Write tool to create step-by-step implementation guide.

### 8. Update Spec Artifacts

Use Edit tool to update:

- spec.md (add Known Gaps section)
- plan.md (update Known Implementation Gaps)
- tasks.md (add inline warnings to affected tasks)
- gap-analysis-report.md (add superseded notice)

### 9. Commit in 4 Increments

Use Bash tool to create commits with exact messages above.

## Output Format

Deliver in this order:

### Part 1: Conversational Summary

```markdown
I've validated the gap analysis report against source artifacts. Here's what I found:

## ✅ Validated Gaps (N real gaps)

**P0 - BLOCKING (X min)**:

- GAP-1: [Title] (Validation: 10/10, violates FR-XXX)
- GAP-2: [Title] (Validation: 9/10, violates CA-XXX)

**P1 - IMPORTANT (X min)**:

- GAP-3: [Title] (Validation: 8/10)

**P2 - POLISH (X min)**:

- GAP-4: [Title] (Validation: 7/10)

## ❌ False Positives (N claimed gaps that are working as designed)

1. **Animation hooks**: Spec explicitly states CSS-only (Goals/Non-Goals:575)
2. **ARIA live regions**: Opt-in via `announce` input (tracked as T196-T199)

## 📊 Summary

- Total claimed gaps: X
- Real gaps: N (validation score 7-10/10)
- False positives: M
- Total remediation time: P0=Xmin | P1=Ymin | P2=Zmin
```

### Part 2: Create Documents

- Create GAPS_REMEDIATION.md
- Create REMEDIATION_CHECKLIST.md

### Part 3: Update Artifacts

- Update spec.md
- Update plan.md
- Update tasks.md
- Update gap-analysis-report.md

### Part 4: Commit

- 4 commits with conventional format

## Success Criteria

Future `/analyze-brief-gpt-5-mini or /analyze-brief-gpt-4-1` runs should:

- ✅ Find "NOT IMPLEMENTED - TRACKED" markers instead of discovering "new" gaps
- ✅ Reference GAPS_REMEDIATION.md for detailed tracking
- ✅ Not re-flag false positives documented in "Not Gaps" section
- ✅ See evidence chains with validation scores
- ✅ Find actionable guidance in REMEDIATION_CHECKLIST.md

## Operating Constraints

- **Documentation only**: Do NOT modify implementation code
- **Evidence-based**: Every gap must have FR → Task → Contract → Implementation chain
- **Validation scores**: Use 0-10 scale, reject gaps with score < 6
- **False positive rigorous**: Require spec citations to disprove claimed gaps
- **Commit discipline**: Exactly 4 commits with conventional format

## Best Practices for Claude Sonnet 4.5

### Do's ✅

- **Progressive disclosure**: Read artifacts incrementally
- **Grep extensively**: Search multiple files to confirm "NOT FOUND"
- **Be skeptical**: Validate every claim; 30-40% may be false positives
- **Cite precisely**: Always include exact file:line numbers
- **Think in evidence chains**: FR → Task → Contract → Implementation
- **Score confidently**: Distinguish high-quality (9-10) from uncertain (6-7)

### Don'ts ❌

- **Don't skip validation**: Never copy gaps without verifying
- **Don't guess**: Mark low scores or reject if unsure
- **Don't modify implementation**: Only create documentation
- **Don't over-document**: Focus on actionable gaps only
- **Don't re-flag false positives**: Document them clearly

## Example Session

**Input**:

```text
/analyze-gaps
```

**Expected Output**:

1. Validation summary: 7 real gaps (3 P0, 3 P1, 1 P2) + 4 false positives
2. GAPS_REMEDIATION.md created (377 lines)
3. REMEDIATION_CHECKLIST.md created (635 lines)
4. spec.md updated with gap reference
5. plan.md updated with gap reference
6. tasks.md updated with inline warnings
7. gap-analysis-report.md marked superseded
8. 4 git commits

**Total time**: ~10-15 minutes for analysis + documentation

## Context

$ARGUMENTS
