---
name: analyze-gaps
description: Validates gap analysis reports from /analyze-brief and creates comprehensive remediation documentation. Prevents future analysis tools from re-flagging known gaps by establishing single source of truth tracking. Use after /analyze-brief generates gap-analysis-report.md.
---

# Gap Analysis Validation & Remediation Documentation

Validates gap analysis reports and creates remediation tracking documents that prevent re-flagging.

## When to Use This Skill

- **After** running `/analyze-brief` (or equivalent manual analysis)
- When `gap-analysis-report.md` exists in repo root
- **Before** implementing gap fixes (creates actionable checklists)
- To establish single source of truth for gap tracking

## Prerequisites

1. `gap-analysis-report.md` exists with claimed gaps
2. Feature specs exist in `specs/<feature>/` (spec.md, plan.md, tasks.md)
3. Contracts exist in `specs/<feature>/contracts/` (optional but validates better with them)
4. Implementation files exist (for validation)

## Goal

Create remediation documentation that prevents future `/analyze-brief` runs from re-flagging these gaps as new issues.

## Validation Methodology

For each claimed gap in `gap-analysis-report.md`:

### Step 1: Verify the Gap Exists
- Read `spec.md` for FR-XXX, CA-XXX, AR-XXX requirements
- Read `tasks.md` for task IDs (T###)
- Read `contracts/` for API definitions
- Confirm requirement exists and is NOT marked as optional/stretch goal

### Step 2: Search Implementation
- Use **Grep** to search implementation files with exact keywords
- Document results: "FOUND at line X" or "NOT FOUND"
- Search multiple related files to confirm absence
- Example: `down()` method → search for `down()`, `down(`, `method down`

### Step 3: Build Evidence Chain
Create full traceability:
```
FR-075 (spec.md:530) → T140 (tasks.md:477) → NfsAccordionItemApi (contracts/accordion-api.ts:146) → NOT FOUND in accordion-item-def.ts:1-58
```

### Step 4: Score Confidence (0-10)
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

### 1. GAPS_REMEDIATION.md

**Purpose**: Single source of truth for `/analyze-brief` to check before flagging gaps.

**Structure**:

```markdown
# [Feature] Implementation Gaps - Remediation Tracker

**Last Validated**: YYYY-MM-DD
**Validation Method**: Cross-artifact analysis (spec.md vs implementation vs contracts)
**Source**: gap-analysis-report.md
**Status**: Remediation in progress

## Purpose
[Why this document exists]

## P0 - BLOCKING (X min total) 🚨

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

**Estimated Time**: X minutes
**Violates**: FR-XXX, CA-XXX

---

## P1 - IMPORTANT (X min total) ⚠️
[Same structure for P1 gaps]

## P2 - POLISH (X min total) 🔧
[Same structure for P2 gaps]

## False Positives (Working as Designed) ✅
[List claimed gaps that are NOT gaps with citations]

## Remediation Roadmap
[Phased approach with time estimates]

## Validation Methodology
[6-step process used]

## For `/analyze-brief` Tool
**When validating future implementation**:
1. Check this document FIRST before flagging gaps
2. Gaps marked "NOT IMPLEMENTED" are KNOWN and TRACKED
3. Only flag NEW gaps not listed here
```

### 2. REMEDIATION_CHECKLIST.md

**Purpose**: Step-by-step developer checklist with exact code snippets.

**Structure**:

```markdown
# Gap Remediation Implementation Checklist

## P0 - BLOCKING (X min total) 🚨

### ✅ Checklist: GAP-N - [Title] (X min)

- [ ] **Step 1**: [Exact action]
  ```typescript
  // FROM:
  [current code]

  // TO:
  [fixed code]
  ```

- [ ] **Step 2**: [Next action]
  [Instructions]

- [ ] **Step 3**: Run tests to verify
  ```bash
  npm run test
  ```

**Verification**: [How to confirm fix worked]

---

## Post-Remediation Validation
- [ ] Run full test suite
- [ ] Run linting
- [ ] Build library
- [ ] Update GAPS_REMEDIATION.md with ✅ FIXED markers
- [ ] Update CHANGELOG.md

**Total Estimated Time**: X minutes
**Actual Time**: _(fill in after completion)_
```

### 3. Update Existing Spec Artifacts

#### spec.md
Add section referencing GAPS_REMEDIATION.md:

```markdown
**Known Gaps in Current Implementation**: See **[GAPS_REMEDIATION.md](./GAPS_REMEDIATION.md)** for comprehensive tracking.

### P0 - BLOCKING (X min)
1. **GAP-N**: [Brief description] (violates FR-XXX) — X min
```

#### plan.md
Update "Known Implementation Gaps" section with same structure.

#### tasks.md
Add inline warnings to affected tasks:

```markdown
- [ ] T021 [US1] Implement inputs ⚠️ **NAMING GAP**: Implemented as `multiExpandable` (should be `multiExpand`). See GAPS_REMEDIATION.md GAP-3.
```

#### gap-analysis-report.md
Add superseded notice at top:

```markdown
**⚠️ SUPERSEDED**: This analysis has been validated and consolidated into **[specs/<feature>/GAPS_REMEDIATION.md](./specs/<feature>/GAPS_REMEDIATION.md)** for ongoing tracking. Refer to that document for current status.
```

## False Positive Analysis

For each claimed gap that's NOT actually a gap:

1. **Verify it's working as designed**:
   - Check spec Goals/Non-Goals
   - Check constitutional requirements
   - Check architectural decisions in plan.md

2. **Document why it's not a gap**:
   ```markdown
   ### False Positive: [Claimed Gap]
   - **Status**: Working as designed per spec.md:line X
   - **Reason**: [Explanation with citation]
   - **Evidence**: [Quote from spec/plan]
   ```

3. **Add to "Not Gaps" section** in GAPS_REMEDIATION.md

**Common False Positives**:
- Features explicitly listed in Non-Goals
- "Missing" features that are architectural decisions (e.g., CSS-only animations)
- Features marked as optional/stretch in spec
- Features delegated to framework primitives (@angular/aria)

## Commit Strategy

Create 4 logical commits:

```bash
# Commit 1: Core tracking document
git commit -m "docs(feature): add validated gap analysis with remediation tracker

- Add GAPS_REMEDIATION.md with evidence-based gap tracking
- Document N validated gaps (X P0, Y P1, Z P2) with fix estimates
- Validation scores N/10 with methodology documentation
- Total fix time: P0=Xmin, P0+P1=Ymin, P0+P1+P2=Zmin

Validation methodology: 6-step cross-artifact analysis
Purpose: Single source of truth for /analyze-brief

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Commit 2: Implementation guide
git commit -m "docs(feature): add detailed remediation implementation checklist

Create step-by-step guide with exact code snippets, verification criteria, and post-remediation validation steps for all N gaps.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Commit 3: Cross-references
git commit -m "docs(feature): update spec/plan/tasks with gap references

- Update spec.md with GAPS_REMEDIATION.md reference
- Update plan.md Known Implementation Gaps section
- Add inline warnings to affected tasks (e.g., T021)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Commit 4: Supersede original report
git commit -m "docs(feature): mark gap analysis report as superseded

Add notice directing readers to GAPS_REMEDIATION.md for ongoing tracking.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Output Format

Deliver in this order:

1. **Validation Summary** (conversational):
   - "I've validated the gap analysis report against source artifacts..."
   - List P0/P1/P2 gaps with evidence scores
   - Call out false positives with citations

2. **Create GAPS_REMEDIATION.md**:
   - Use Write tool
   - Include all sections

3. **Create REMEDIATION_CHECKLIST.md**:
   - Use Write tool
   - Detailed checklists per gap

4. **Update spec.md**:
   - Use Edit tool
   - Add gap reference section

5. **Update plan.md**:
   - Use Edit tool
   - Update Known Implementation Gaps

6. **Update tasks.md**:
   - Use Edit tool
   - Add inline warnings

7. **Update gap-analysis-report.md**:
   - Use Edit tool
   - Add superseded notice

8. **Commit in 4 increments**:
   - Use Bash tool with exact commit messages

## Success Criteria

Future `/analyze-brief` runs should:
- ✅ Find "NOT IMPLEMENTED - TRACKED" markers instead of discovering "new" gaps
- ✅ Reference GAPS_REMEDIATION.md for detailed tracking
- ✅ Not re-flag false positives documented in "Not Gaps" section
- ✅ See evidence chains with validation scores
- ✅ Find actionable fix guidance in REMEDIATION_CHECKLIST.md

## Example Usage

```text
/analyze-gaps

[Attach gap-analysis-report.md if needed, or skill will auto-locate it]
```

Expected output:
1. Validation summary with 7 real gaps + 4 false positives
2. GAPS_REMEDIATION.md (comprehensive tracking)
3. REMEDIATION_CHECKLIST.md (implementation guide)
4. Updated spec/plan/tasks artifacts
5. 4 git commits

Total time: ~10-15 minutes for analysis + documentation

## Best Practices

### For Claude Sonnet 4.5

- **Use progressive disclosure**: Read artifacts incrementally (spec → contracts → implementation)
- **Grep extensively**: Search multiple files to confirm "NOT FOUND" claims
- **Be skeptical**: Validate every claimed gap; 30-40% may be false positives
- **Cite precisely**: Always include exact file:line numbers
- **Think in evidence chains**: FR → Task → Contract → Implementation
- **Score confidently**: Use 0-10 scale to distinguish high-quality (9-10) from uncertain (6-7) findings

### Common Pitfalls to Avoid

- ❌ **Don't skip validation**: Never copy gaps from report without verifying
- ❌ **Don't guess**: If unsure, mark as low validation score or reject
- ❌ **Don't modify implementation**: This skill only creates documentation
- ❌ **Don't over-document**: Focus on actionable gaps, not theoretical improvements
- ❌ **Don't re-flag false positives**: Clearly document "Not Gaps" section

## Related Commands

- `/analyze-brief` - Generates initial gap-analysis-report.md (run this first)
- `/speckit.implement` - Executes remediation checklist (run after this skill)
- `/speckit.analyze` - Pre-implementation consistency check (different purpose)

## Notes

- This skill is **read-only for implementation**, **write-only for documentation**
- Designed for Sonnet 4.5's analytical + writing capabilities
- Optimized for accordion-style 180min (~3hr) gap remediation sessions
- Evidence scores distinguish high-confidence (9-10) from medium (6-8)
