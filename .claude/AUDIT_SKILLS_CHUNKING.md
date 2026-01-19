# Audit ALL Skills for Large File Chunking Issues

> **Purpose**: Identify and fix skills (any model) that may use suboptimal chunking strategies for large files (>25K tokens)
> **Context**: Production incident (2026-01-19) revealed `/analyze-report-gaps-haiku-4-5` used header-only reads via Grep instead of content reads, causing false positives
> **Scope**: ALL skills that read spec.md, plan.md, tasks.md, or other large files — not just Haiku 4.5 skills
> **Status**: `/analyze-report-gaps-haiku-4-5` fixed and improved with semantic section reading (reference implementation)
> **Next Step**: Audit remaining skills (Haiku, Sonnet, Opus, model-agnostic) for similar vulnerabilities

**IMPORTANT**: These anti-patterns are **model-agnostic**. The Read tool's 25K token limit and Anthropic's semantic chunking guidance apply to ALL Claude models, not just Haiku.

---

## Background: What We Discovered

### Production Incident (2026-01-19)

**Symptom**: `/analyze-report-gaps-haiku-4-5` flagged C01 (ID stability scope) as CRITICAL blocker

**Root Cause**:
- When spec.md exceeded Read tool's 25K token limit, skill fell back to `Grep(pattern: "^#{1,3}\s+")` to read headers only
- This missed clarifications added via `/speckit.clarify` (appear as paragraphs under headers)
- Analysis flagged already-resolved issues as open

**Fix Applied**:
1. Initial fix (commit `f550caf`): Prevented Grep-headers-only failure with fixed 700-line chunking
2. Research-backed improvement (commit `4d5975f`): Semantic section reading aligned with Anthropic guidance

**Documentation Created**:
- `prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md` - Comprehensive research compilation

---

## Anthropic's Official Guidance

From [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval):

✅ **RECOMMENDED**:
- "Semantic chunking" (by meaning/section) over fixed-size chunks
- Chunk size: "Usually no more than a few hundred tokens" for RAG
- Natural boundaries prevent context loss

❌ **AVOID**:
- Arbitrary fixed-size chunks (risk splitting semantic units)
- Using Grep for content loading (only loads structure, not content)
- Large chunks (>5K tokens) without semantic justification

---

## Your Task: Audit ALL Skills for Chunking Issues

### Step 1: Identify Skills That Read Large Files

**Find ALL skills that read spec.md, plan.md, tasks.md, or other potentially large files**:

```bash
# Find skills that use Read tool on large files
grep -r "Read.*spec\.md\|Read.*plan\.md\|Read.*tasks\.md\|Read.*constitution\.md" .claude/skills --include="*.md" -l
```

**Also check skills by model** (to ensure comprehensive coverage):

```bash
# Haiku 4.5 skills
grep -r "model_override.*haiku-4.5" .claude/skills --include="*.md" -l

# Sonnet 4.5 skills
grep -r "model_override.*sonnet-4.5" .claude/skills --include="*.md" -l

# Opus 4.5 skills
grep -r "model_override.*opus-4.5" .claude/skills --include="*.md" -l

# Model-agnostic skills (speckit.*)
ls .claude/skills/speckit.*/SKILL.md
```

**Expected skills to audit** (as of 2026-01-19):

**Haiku 4.5**:
- `/analyze-report-gaps-haiku-4-5` ✅ FIXED (reference implementation)
- `/clarify-haiku-4-5` ❓ NEEDS AUDIT
- `/tasks-haiku-4-5` ❓ NEEDS AUDIT
- `/specify-haiku-4-5` ❓ NEEDS AUDIT
- `/analyze-haiku-4-5` ❓ NEEDS AUDIT (non-report version)

**Sonnet 4.5**:
- `/implement-sonnet-4-5` ❓ NEEDS AUDIT
- (any others discovered)

**Opus 4.5**:
- `/implement-opus-4-5` ❓ NEEDS AUDIT
- (any others discovered)

**Model-Agnostic**:
- `/speckit.specify` ❓ NEEDS AUDIT
- `/speckit.clarify` ❓ NEEDS AUDIT
- `/speckit.analyze` ❓ NEEDS AUDIT
- `/speckit.tasks` ❓ NEEDS AUDIT
- (any others discovered)

---

### Why These Anti-Patterns Are Model-Agnostic

**Question**: Why audit Sonnet/Opus skills if they're more capable?

**Answer**: These anti-patterns are **prompt/strategy issues**, not model capability issues:

| Anti-Pattern | Why It Affects All Models |
|--------------|---------------------------|
| **Grep-for-content** | If the prompt says "use Grep to read structure," even Opus will do it wrong |
| **No chunking strategy** | Read tool's 25K token limit is a Claude Code constraint, not a model limit |
| **Large fixed chunks** | Splitting mid-requirement is bad practice regardless of model intelligence |
| **No validation** | Any model can proceed with incomplete data if the prompt doesn't require validation |

**Key Insight**: A more capable model might better understand complex requirements or generate more accurate code, but if the **prompt structure** is flawed (e.g., uses Grep for content), even Opus will follow that instruction.

**Anthropic's Guidance Applies to ALL Models**:
- Semantic chunking recommendation: Universal
- "Few hundred tokens" chunk size: Universal
- Natural boundary preservation: Universal

---

### Step 2: Check Each Skill for Vulnerable Patterns

For each skill (regardless of model), search for these **ANTI-PATTERNS**:

#### ❌ Anti-Pattern 1: Grep for Content Loading

**Search for**:
```bash
grep -i "grep.*pattern.*#" <SKILL_FILE>
```

**Red flags**:
- `Grep(pattern: "^#{1,3}\s+")` - Reads headers only
- `Grep(pattern: "^#")` - Same issue
- Using Grep output as primary content source (not boundary discovery)

**Check**: Does the skill use Grep to READ content or to DISCOVER boundaries?
- ✅ OK: `Grep(pattern: "^#", -n: true)` → Then `Read(offset, limit)` for content
- ❌ BAD: `Grep(pattern: "^#")` → Process Grep output as content

---

#### ❌ Anti-Pattern 2: Large Fixed Chunks Without Semantic Justification

**Search for**:
```bash
grep -i "chunk.*700\|chunk_size.*700\|limit.*700" <SKILL_FILE>
```

**Red flags**:
- Fixed chunks >500 lines (~3.5K+ tokens) without semantic boundaries
- No mention of section-based reading
- Arbitrary line-count divisions

**Check**: Does the skill justify large chunk sizes?
- ✅ OK: "Read by semantic sections (User Stories, Requirements)"
- ❌ BAD: "Read in 700-line chunks" with no semantic rationale

---

#### ❌ Anti-Pattern 3: No Content Validation

**Search for**:
```bash
grep -i "validation\|verify.*content\|check.*loaded" <SKILL_FILE>
```

**Red flags**:
- No validation step after loading artifacts
- No check for "Can you quote specific content?"
- Proceeds directly to processing without verifying content vs structure

**Check**: Does the skill validate content was loaded?
- ✅ OK: Step 2b validation checklist (like `/analyze-report-gaps-haiku-4-5`)
- ❌ BAD: Loads artifacts → immediately processes without validation

---

#### ❌ Anti-Pattern 4: No Chunking Strategy for Large Files

**Search for**:
```bash
grep -i "Read.*spec.md\|Read.*plan.md\|Read.*tasks.md" <SKILL_FILE>
```

**Red flags**:
- `Read("spec.md")` without offset/limit parameters
- No fallback strategy documented for files >25K tokens
- Assumes all files fit in single Read call

**Check**: Does the skill handle large files?
- ✅ OK: Documents chunking strategy (semantic or fixed with overlap)
- ⚠️ MEDIUM: Only reads small files (plan.md, tasks.md typically <10K tokens)
- ❌ BAD: Reads spec.md without chunking strategy

---

### Step 3: Evaluate Each Finding

For each anti-pattern found, classify severity:

| Severity | Criteria | Example |
|----------|----------|---------|
| **CRITICAL** | Uses Grep for content loading (will miss clarifications) | `Grep(pattern: "^#") → process_requirements(output)` |
| **HIGH** | Reads spec.md without chunking strategy (will fail on large specs) | `Read("spec.md")` with no offset/limit fallback |
| **MEDIUM** | Uses large fixed chunks without semantic boundaries | `Read(offset=0, limit=700)` with no section-based rationale |
| **LOW** | No content validation (might proceed with incomplete data) | Loads artifacts → immediate processing without validation |

---

### Step 4: Recommended Fixes

**For CRITICAL (Grep-for-content)**:
1. Replace with semantic section reading (see reference implementation below)
2. Add content validation checkpoint
3. Test on large spec.md file (>1,000 lines)

**For HIGH (No chunking strategy for spec.md)**:
1. Add semantic section reading for spec.md
2. Keep single Read for small files (plan.md, tasks.md)
3. Document file size assumptions

**For MEDIUM (Large fixed chunks)**:
1. Switch to semantic section reading (Anthropic-recommended)
2. OR add overlap to fixed chunks (50 lines / ~350 tokens)
3. Document rationale in optimization notes

**For LOW (No validation)**:
1. Add Step Nb: Content Validation checkpoint
2. Require "Can you quote specific content?" test
3. Retry with correct strategy if validation fails

---

## Reference Implementation: Semantic Section Reading

**From**: `.claude/skills/analyze-report-gaps-haiku-4-5/SKILL.md` (Step 2)

```markdown
### Step 2: Load Artifacts (Semantic Section Strategy)

<context_loading>
**Semantic Section Reading Strategy** (use when file exceeds 25K token limit):

Based on research-backed best practices from [CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md](../../../prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md).

# Step 1: Discover section boundaries
Grep(
  pattern: "^#{1,3}\s+",
  path: file_path,
  output_mode: "content",
  -n: true  # Include line numbers
)

# Output example:
# 118:### User Story 1 - Basic Accordion
# 439:## Requirements (mandatory)
# 706:### Accessibility Requirements

# Step 2: Parse section ranges
FOR EACH header line in grep_output:
  EXTRACT line_number, header_text
  CALCULATE section_start = line_number
  CALCULATE section_end = next_header_line_number - 1 (or EOF)
  STORE sections_map[header_text] = {start, end, lines: end - start}

# Step 3: Read relevant sections only
FOR EACH section IN sections_map WHERE section is relevant:
  Read(
    file_path,
    offset=section.start,
    limit=section.lines
  )
  EXTRACT requirements/entities from content
  ACCUMULATE into semantic models

# Step 4: Skip irrelevant sections
# Example: Skip "Goals and Non-Goals" section if only analyzing requirements

**Benefits**:
- ✅ Semantic boundaries: Never split mid-requirement
- ✅ No overlap needed: Natural section boundaries prevent context loss
- ✅ Efficient: Skip irrelevant sections (e.g., prose, examples)
- ✅ Aligned with Anthropic guidance: Semantic chunking over arbitrary splits
</context_loading>

### Step 2b: Content Loading Validation (MANDATORY)

<critical>
**BEFORE proceeding to Step 3, verify you loaded CONTENT not just STRUCTURE.**

This validation step prevents the common failure mode of reading headers only via Grep.
</critical>

<validation_checklist>
**For spec.md**:
- [ ] Did you extract requirement DESCRIPTIONS (not just FR-XXX identifiers)?
- [ ] Did you capture clarification blocks (if any exist)?
- [ ] Can you quote a specific requirement's imperative phrase?

**If you answered "NO" to any question above**:
1. STOP immediately
2. Re-read the affected file using semantic section reading (Step 2 strategy)
3. Validate again before proceeding

**Common Failure Pattern to Avoid**:
```
❌ WRONG: Using Grep(pattern: "^#{1,3}\s+") to read headers only
✅ CORRECT: Using Read(file, offset, limit) to read content in sections
```
</validation_checklist>

<evaluation_criteria>
**Success**: You can quote specific content (requirements, tasks, principles) verbatim
**Failure**: You only have identifiers/headers but not the content under them
</evaluation_criteria>
```

---

## Deliverables

For each skill audited, provide:

### 1. Audit Report

**Format**:
```markdown
# Haiku 4.5 Skills Chunking Audit Report

**Date**: 2026-01-XX
**Auditor**: [Your name/model]
**Skills Audited**: [N] skills

---

## Summary

| Skill | Status | Critical | High | Medium | Low | Action Required |
|-------|--------|----------|------|--------|-----|-----------------|
| `/clarify-haiku-4-5` | ❌ NEEDS FIX | 1 | 0 | 0 | 0 | Replace Grep-for-content |
| `/tasks-haiku-4-5` | ✅ CLEAN | 0 | 0 | 0 | 0 | None |
| `/specify-haiku-4-5` | ⚠️ MEDIUM | 0 | 0 | 1 | 0 | Add semantic chunking |

---

## Detailed Findings

### `/clarify-haiku-4-5`

**Status**: ❌ NEEDS FIX

**Findings**:
1. **CRITICAL**: Lines 150-160 use `Grep(pattern: "^#")` to load spec.md content
   - **Impact**: Will miss clarifications added via `/speckit.clarify`
   - **Evidence**: [paste code snippet]
   - **Recommendation**: Replace with semantic section reading

2. **LOW**: No content validation checkpoint
   - **Impact**: May proceed with incomplete data
   - **Recommendation**: Add Step Nb validation checklist

**Recommended Actions**:
1. Implement semantic section reading (see reference implementation)
2. Add content validation checkpoint
3. Update optimization notes with research references
4. Test on accordion spec.md (1,324 lines) to verify

---

### `/tasks-haiku-4-5`

**Status**: ✅ CLEAN

**Analysis**:
- Only reads tasks.md (~800 lines, ~15K tokens)
- Single Read call without chunking
- File size consistently under 25K token limit
- No action required

**Recommendation**: Monitor if tasks.md grows beyond 1,500 lines (~30K tokens)

---

[Continue for each skill...]
```

---

### 2. Pull Request (if fixes required)

**For each skill needing fixes**:

1. **Update skill file** with semantic section reading
2. **Update optimization notes** referencing research documentation
3. **Add/update validation checkpoint**
4. **Commit with detailed message**:

```bash
git commit -m "fix(skill-name): adopt semantic section reading per Anthropic guidance

AUDIT FINDING:
Skill used [anti-pattern X] which can cause [specific impact].

CHANGES:
1. Replaced [old approach] with semantic section reading
2. Added content validation checkpoint (Step Nb)
3. Updated optimization notes with research references

VALIDATION:
- Tested on [example file] ([N] lines)
- Verified content capture (can quote requirements verbatim)
- Cost impact: [same/negligible increase]

See: prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md

Related: #[issue] (if tracking in GitHub)
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
"
```

---

### 3. Documentation Updates (if new patterns found)

**If you discover new anti-patterns or edge cases**:

1. **Update** `prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md`:
   - Add to "Anti-Patterns" section
   - Include example from audited skill
   - Document recommended fix

2. **Update** `prompt-engineering/HAIKU-4-5-COMMAND-OPTIMIZATION-RECOMMENDATIONS.md`:
   - Add "Context Loading" best practice if not present
   - Reference chunking strategies document

---

## Success Criteria

**Audit Complete When**:
- ✅ All skills that read large files identified and checked (Haiku, Sonnet, Opus, model-agnostic)
- ✅ Each finding classified by severity
- ✅ Audit report written with actionable recommendations
- ✅ CRITICAL/HIGH issues fixed (PR submitted)
- ✅ Documentation updated (if new patterns found)

**Quality Checks**:
- ✅ Can quote specific anti-patterns from skill code
- ✅ Recommendations include reference implementation snippets
- ✅ Cost/performance impact estimated for each fix
- ✅ Test plan included for each fix (e.g., "test on 1,324-line spec.md")

---

## References

### Project Documentation
- `prompt-engineering/CLAUDE-LARGE-FILE-CHUNKING-STRATEGIES.md` - Comprehensive research
- `.claude/skills/analyze-report-gaps-haiku-4-5/SKILL.md` - Reference implementation
- `prompt-engineering/CLAUDE-HAIKU-4-5-OPTIMIZATION.md` - Haiku 4.5 best practices

### Anthropic Official
- [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) - Semantic chunking guidance
- [Files API Documentation](https://platform.claude.com/docs/en/build-with-claude/files) - File handling patterns

### Related Commits
- `f550caf` - Initial fix: Prevent Grep-headers-only failure
- `4d5975f` - Research-backed improvement: Semantic section reading

---

**Good Hunting! 🔍**

_Remember: The goal is not perfection, but preventing production incidents like 2026-01-19 where resolved issues were flagged as critical due to incomplete content loading._
