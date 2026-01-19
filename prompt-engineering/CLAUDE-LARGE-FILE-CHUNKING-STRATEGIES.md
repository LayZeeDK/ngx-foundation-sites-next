# Claude Large File Chunking Strategies

> **Audience**: Skill developers, prompt engineers working with large documents
> **Purpose**: Research-backed strategies for reading large files (>25K tokens) with Claude
> **Last Updated**: 2026-01-19
> **Related**: [CLAUDE-HAIKU-4-5-OPTIMIZATION.md](./CLAUDE-HAIKU-4-5-OPTIMIZATION.md), [CLAUDE-4-5-OPTIMIZATION.md](./CLAUDE-4-5-OPTIMIZATION.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Anthropic's Official Guidance](#anthropics-official-guidance)
3. [Chunking Strategies Comparison](#chunking-strategies-comparison)
4. [Strategy 1: Semantic Section Chunking (Recommended)](#strategy-1-semantic-section-chunking-recommended)
5. [Strategy 2: Fixed-Size with Overlap](#strategy-2-fixed-size-with-overlap)
6. [Strategy 3: Adaptive Chunking](#strategy-3-adaptive-chunking)
7. [Strategy 4: Parallel File Loading](#strategy-4-parallel-file-loading)
8. [Tool-Specific Constraints](#tool-specific-constraints)
9. [Cost-Performance Trade-offs](#cost-performance-trade-offs)
10. [Implementation Patterns](#implementation-patterns)
11. [Anti-Patterns](#anti-patterns)
12. [References](#references)

---

## Overview

When processing large documents with Claude (spec files, logs, codebases), chunking strategies significantly impact:
- **Accuracy**: Semantic boundaries prevent context loss
- **Cost**: Fewer/larger chunks vs. more/smaller chunks
- **Latency**: Sequential reads vs. parallel processing
- **Quality**: Preservation of relationships across chunk boundaries

**Key Constraint**: Claude Code's Read tool has a **~25,000 token limit** per call. Files exceeding this limit require chunking strategies.

---

## Anthropic's Official Guidance

### RAG (Retrieval-Augmented Generation) Context

From [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) (Anthropic, 2024):

**Chunk Size Recommendation**:
> "Chunks are usually no more than a few hundred tokens when breaking down knowledge bases."

**Example Configuration** (from Anthropic's analysis):
- **Chunk size**: 800 tokens
- **Document size**: 8K tokens
- **Context instructions**: 50 tokens per chunk
- **Total context per chunk**: ~100 tokens

**Philosophy**:
> "The choice of chunk size, chunk boundary, and chunk overlap can affect retrieval performance. It's worth experimenting on your use case."

**Key Takeaway**: Anthropic recommends **semantic chunking** (by meaning/section) over fixed-size chunking, with experimentation for optimal parameters.

---

### Contextual Retrieval Benefits

**Prompt Caching Integration**:
- Load document into cache once
- Reference cached content for each chunk
- 90% cost savings on cache hits
- Enables low-cost contextual retrieval

**Hybrid Retrieval**:
- Combine BM25 (keyword matching) + embeddings (semantic search)
- Rerank results to reduce context (20 chunks → 5 best)
- Faster processing with smaller context

---

## Chunking Strategies Comparison

| Strategy | Chunk Size | Overlap | API Calls | Accuracy | Use Case |
|----------|------------|---------|-----------|----------|----------|
| **Semantic (Section-Based)** | Variable (200-800 lines) | None (natural boundaries) | 3-5 | ✅ High | Structured docs (specs, markdown) |
| **Fixed-Size (Large)** | 700 lines (~5K tokens) | None | 2 | ⚠️ Medium | Minimize API calls, simple content |
| **Fixed-Size (Small) + Overlap** | 300 lines (~2K tokens) | 50 lines (~350 tokens) | 4-5 | ✅ High | Dense content, critical accuracy |
| **Adaptive** | Variable by density | Optional | 3-6 | ✅ High | Mixed content types |
| **Parallel** | N/A (multiple files) | N/A | N (parallel) | ✅ High | Multiple independent files |

---

## Strategy 1: Semantic Section Chunking (Recommended)

### Overview

**Principle**: Split documents at natural semantic boundaries (sections, headers, logical units) rather than arbitrary line counts.

**Best For**:
- ✅ Structured markdown files (spec.md, plan.md)
- ✅ Code files with clear function/class boundaries
- ✅ Documents with hierarchical headers (##, ###)

**Alignment**: Matches Anthropic's "semantic chunking" recommendation

---

### Implementation Algorithm

```markdown
### Step 1: Identify Section Boundaries

Use Grep to extract headers with line numbers:

```bash
Grep(
  pattern: "^#{1,3}\s+",
  path: "spec.md",
  output_mode: "content",
  -n: true  # Include line numbers
)
```

**Output**:
```
450:## Functional Requirements
680:## Non-Functional Requirements
820:## User Stories
1100:## Acceptance Criteria
```

### Step 2: Calculate Section Ranges

Parse Grep output into section ranges:

```python
sections = [
  {"name": "Functional Requirements", "start": 450, "end": 679},
  {"name": "Non-Functional Requirements", "start": 680, "end": 819},
  {"name": "User Stories", "start": 820, "end": 1099},
  {"name": "Acceptance Criteria", "start": 1100, "end": EOF}
]
```

### Step 3: Read Each Section Independently

```python
FOR section IN sections:
  IF section is relevant to task:  # Filter irrelevant sections
    lines_to_read = section.end - section.start
    content = Read(
      file_path="spec.md",
      offset=section.start,
      limit=lines_to_read
    )
    EXTRACT requirements/entities from content
    ACCUMULATE into semantic models
```

---

### Benefits

✅ **Semantic coherence**: Never split mid-requirement or mid-story
✅ **No overlap needed**: Natural boundaries prevent context loss
✅ **Efficient**: Skip irrelevant sections (e.g., only read Requirements, not Goals/Non-Goals)
✅ **Debuggable**: Clear section names make errors traceable
✅ **Aligned with Anthropic guidance**: "Semantic boundaries" over arbitrary splits

---

### Example: spec.md (1,324 lines)

**Naive 700-line chunking**:
- Chunk 1: Lines 1-700 (contains partial FR section)
- Chunk 2: Lines 700-1324 (FR section split across boundary)
- **Risk**: FR-050a clarification might span chunks, causing incomplete extraction

**Semantic section chunking**:
- Section 1: User Stories (lines 118-438, 320 lines)
- Section 2: Functional Requirements (lines 439-705, 266 lines)
- Section 3: Accessibility Requirements (lines 706-749, 43 lines)
- Section 4: Component API (lines 758-976, 218 lines)
- **Result**: Each requirement fully contained in one chunk

---

### Cost Analysis

**Fixed 700-line chunks**:
- 2 Read calls × ~5K tokens = 10K input tokens
- Cost: ~$0.010 (at $1/M input tokens)

**Semantic section chunks**:
- 5 Read calls × ~2K tokens average = 10K input tokens
- Cost: ~$0.010 (same cost, better accuracy)

**Conclusion**: No cost penalty for semantic chunking when total tokens are similar.

---

## Strategy 2: Fixed-Size with Overlap

### Overview

**Principle**: Split documents at fixed line counts with overlapping regions to prevent boundary context loss.

**Best For**:
- ⚠️ Unstructured documents (logs, plain text)
- ⚠️ When semantic boundaries are unclear
- ⚠️ Dense content where every token matters

---

### Implementation Algorithm

```python
# Configuration
chunk_size = 300 lines  # ~2K tokens (aligns with Anthropic's "few hundred tokens")
overlap = 50 lines      # ~350 tokens (catches boundary context)
total_lines = get_line_count(file_path)

# Read overlapping chunks
FOR offset IN range(0, total_lines, chunk_size - overlap):
  limit = min(chunk_size, total_lines - offset)
  content = Read(file_path, offset=offset, limit=limit)

  # Process chunk
  EXTRACT entities from content

  # Deduplicate overlap region
  IF offset > 0:
    DISCARD first `overlap` lines (already processed in previous chunk)
```

---

### Trade-offs

**Pros**:
- ✅ Catches context spanning chunk boundaries
- ✅ Works for unstructured content
- ✅ Smaller chunks align with Anthropic guidance

**Cons**:
- ❌ More API calls (4-5 vs. 2)
- ❌ Redundant processing (overlap regions processed twice)
- ❌ Complexity: Deduplication logic required

---

### Example: spec.md (1,324 lines)

**Configuration**:
- chunk_size = 300 lines
- overlap = 50 lines
- effective_stride = 250 lines

**Chunks**:
1. Lines 0-300
2. Lines 250-550 (50-line overlap with chunk 1)
3. Lines 500-800 (50-line overlap with chunk 2)
4. Lines 750-1050 (50-line overlap with chunk 3)
5. Lines 1000-1324 (50-line overlap with chunk 4)

**Cost**:
- 5 Read calls × ~2K tokens = 10K input tokens
- Overlap: ~1K tokens processed twice
- Total cost: ~$0.011 (10% increase vs. semantic chunking)

---

## Strategy 3: Adaptive Chunking

### Overview

**Principle**: Adjust chunk size dynamically based on content density and type.

**Best For**:
- ✅ Mixed-content documents (prose + code + requirements)
- ✅ When optimizing for both cost and accuracy

---

### Implementation Algorithm

```python
# Configuration
chunk_configs = {
  "prose": 700 lines,        # ~5K tokens (overview, goals sections)
  "requirements": 300 lines,  # ~2K tokens (FR-XXX, NFR-XXX)
  "code": 200 lines,          # ~1.5K tokens (examples, snippets)
}

FOR section IN sections:
  content_type = classify_section(section.name)
  chunk_size = chunk_configs[content_type]

  IF section.length > chunk_size:
    # Split large sections
    FOR offset IN range(section.start, section.end, chunk_size):
      Read(file_path, offset=offset, limit=chunk_size)
  ELSE:
    # Read entire section
    Read(file_path, offset=section.start, limit=section.length)
```

---

### Benefits

✅ **Optimized**: Small chunks for dense content, large chunks for prose
✅ **Cost-effective**: Minimize API calls where possible
✅ **Flexible**: Adapts to document structure

---

## Strategy 4: Parallel File Loading

### Overview

**Principle**: When analyzing multiple files, read them in parallel rather than sequentially.

**Best For**:
- ✅ Multi-file analysis (spec.md + plan.md + tasks.md)
- ✅ Codebase exploration (multiple source files)
- ✅ Maximizing throughput

**Reference**: [CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md](./CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md)

---

### Implementation Pattern

**❌ Sequential (Slow)**:
```python
spec = Read("spec.md")
plan = Read("plan.md")
tasks = Read("tasks.md")
# Total time: T1 + T2 + T3
```

**✅ Parallel (Fast)**:
```python
# Single message with multiple Read calls
Read("spec.md")
Read("plan.md")
Read("tasks.md")
# Total time: max(T1, T2, T3) ≈ T1 (if T1 is longest)
```

**Speedup**: 3× faster for 3 files (assuming similar file sizes)

---

### Combining Strategies

**Parallel + Semantic Chunking**:

```python
# Read multiple files in parallel, each using semantic chunking
PARALLEL:
  Read("spec.md", offset=450, limit=230)  # Functional Requirements section
  Read("plan.md", offset=0, limit=289)    # Full file
  Read("tasks.md", offset=0, limit=820)   # Full file
```

**Result**: Maximum throughput with semantic coherence

---

## Tool-Specific Constraints

### Claude Code Read Tool

**Hard Limits**:
- **Token limit**: ~25,000 tokens per Read call
- **Line limit**: No explicit limit (token-based)
- **File size**: Unlimited (can read in chunks)

**Parameters**:
```typescript
Read(
  file_path: string,    // Absolute or relative path
  offset?: number,      // Starting line (0-indexed)
  limit?: number        // Number of lines to read
)
```

**Error Handling**:
- **EISDIR**: Attempted to read a directory (use Glob instead)
- **Token limit exceeded**: File content > 25K tokens (use chunking)
- **File not found**: Invalid path

---

### Grep Tool (NOT Recommended for Content Loading)

**Purpose**: Search for patterns, NOT load full content

**Why NOT to use for chunking**:
- ❌ `Grep(pattern: "^#")` reads headers only, misses content
- ❌ Misses clarifications added via `/speckit.clarify` (appear under headers)
- ❌ Cannot extract full requirement descriptions

**Correct Usage**:
- ✅ Find section boundaries (header line numbers)
- ✅ Search for specific patterns (FR-XXX identifiers)
- ✅ Extract metadata (line numbers, file paths)

**Example Failure** (2026-01-19 Production Incident):
```python
# ❌ WRONG: Only captures headers, misses content
headers = Grep(pattern: "^#{1,3}\s+", output_mode: "content")
# Result: "## Functional Requirements" but not FR-017a details

# ✅ CORRECT: Use Grep for boundaries, Read for content
boundaries = Grep(pattern: "^#{1,3}\s+", output_mode: "content", -n: true)
content = Read(file_path, offset=450, limit=230)  # Read FR section
```

---

## Cost-Performance Trade-offs

### Scenario 1: Structured Spec File (1,324 lines, ~26K tokens)

| Strategy | API Calls | Input Tokens | Cost | Accuracy | Latency |
|----------|-----------|--------------|------|----------|---------|
| **Semantic (5 sections)** | 5 | 10,000 | $0.010 | ✅ High | ~2s |
| **Fixed 700-line** | 2 | 10,000 | $0.010 | ⚠️ Medium | ~1s |
| **Fixed 300-line + overlap** | 5 | 11,000 | $0.011 | ✅ High | ~2s |
| **Grep headers only** | 1 | 500 | $0.0005 | ❌ Low | ~0.5s |

**Recommendation**: **Semantic chunking** (best accuracy, same cost as fixed, negligible latency increase)

---

### Scenario 2: Unstructured Log File (10,000 lines, ~60K tokens)

| Strategy | API Calls | Input Tokens | Cost | Accuracy | Latency |
|----------|-----------|--------------|------|----------|---------|
| **Fixed 300-line + overlap** | 34 | 66,000 | $0.066 | ✅ High | ~8s |
| **Fixed 700-line** | 15 | 60,000 | $0.060 | ⚠️ Medium | ~5s |
| **Adaptive (by log level)** | 20 | 62,000 | $0.062 | ✅ High | ~6s |

**Recommendation**: **Adaptive** (balance cost and accuracy for mixed content)

---

### Scenario 3: Multiple Small Files (3 files, each ~5K tokens)

| Strategy | API Calls | Input Tokens | Cost | Accuracy | Latency |
|----------|-----------|--------------|------|----------|---------|
| **Sequential** | 3 | 15,000 | $0.015 | ✅ High | ~3s |
| **Parallel** | 3 | 15,000 | $0.015 | ✅ High | ~1s |

**Recommendation**: **Parallel** (3× faster, same cost/accuracy)

---

## Implementation Patterns

### Pattern 1: Semantic Section Reading (Recommended for Specs)

```markdown
### Step 2: Load Artifacts (Semantic Section Strategy)

<task>
Read spec.md by semantic sections to preserve requirement boundaries.
</task>

<critical>
NEVER use Grep for content loading. Use it ONLY for section boundary discovery.
</critical>

**Algorithm**:

1. **Discover section boundaries**:
   ```
   Grep(pattern: "^#{1,3}\s+", path: "spec.md", output_mode: "content", -n: true)
   ```

   Output: List of headers with line numbers
   ```
   118:### User Story 1 - Basic Accordion
   439:## Requirements (mandatory)
   706:### Accessibility Requirements
   ```

2. **Parse section ranges**:
   ```python
   sections = [
     {"name": "User Stories", "start": 118, "end": 438},
     {"name": "Requirements", "start": 439, "end": 705},
     {"name": "Accessibility", "start": 706, "end": 749},
   ]
   ```

3. **Read relevant sections**:
   ```
   FOR section IN sections WHERE section.relevant_to_task:
     lines = section.end - section.start
     Read(file_path="spec.md", offset=section.start, limit=lines)
     EXTRACT entities from content
     ACCUMULATE into semantic models
   ```

4. **Validate content (not structure)**:
   - ✅ Can quote requirement descriptions (not just FR-XXX IDs)
   - ✅ Can reference clarifications (if present)
   - ✅ Can extract acceptance criteria

<validation_criteria>
**Success**: Can quote specific requirement content verbatim
**Failure**: Only have section headers without body content
</validation_criteria>
```

---

### Pattern 2: Fixed-Size with Overlap (for Unstructured Content)

```markdown
### Step 2: Load Large Unstructured File

<task>
Read log file using fixed-size chunks with overlap to prevent context loss.
</task>

**Configuration**:
- Chunk size: 300 lines (~2K tokens, aligns with Anthropic guidance)
- Overlap: 50 lines (~350 tokens)
- Effective stride: 250 lines

**Algorithm**:

1. **Get file size**:
   ```bash
   total_lines=$(wc -l < error.log)
   ```

2. **Calculate chunks**:
   ```python
   chunk_size = 300
   overlap = 50
   stride = chunk_size - overlap
   num_chunks = ceiling(total_lines / stride)
   ```

3. **Read overlapping chunks**:
   ```
   FOR i IN range(0, num_chunks):
     offset = i * stride
     limit = min(chunk_size, total_lines - offset)
     content = Read("error.log", offset=offset, limit=limit)

     # Deduplicate overlap region
     IF i > 0:
       SKIP first `overlap` lines (processed in previous chunk)

     PROCESS content
   ```
```

---

### Pattern 3: Parallel Multi-File Loading

```markdown
### Step 2: Load Multiple Files in Parallel

<task>
Read spec.md, plan.md, tasks.md simultaneously for maximum throughput.
</task>

**Implementation**:

```
# Single message with parallel Read calls
Read("specs/002-accordion-component/spec.md")
Read("specs/002-accordion-component/plan.md")
Read("specs/002-accordion-component/tasks.md")
Read(".specify/memory/constitution.md")

# All files load simultaneously
# Total time: max(T_spec, T_plan, T_tasks, T_const) ≈ T_spec
```

**Speedup**: 4× faster than sequential (for 4 files)
```

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Grep for Content Loading

**Problem**: Using Grep with header patterns to "read" file content

**Example**:
```python
# ❌ WRONG: Only captures headers
content = Grep(pattern: "^#{1,3}\s+", output_mode: "content")
# Result: List of section titles, NOT section content
```

**Why It Fails**:
- Misses all content under headers (requirements, clarifications, descriptions)
- Especially bad for `/speckit.clarify` additions (appear as paragraphs under headers)
- Creates false positives in analysis (flags resolved issues as open)

**Correct Approach**:
```python
# ✅ CORRECT: Grep for boundaries, Read for content
boundaries = Grep(pattern: "^#{1,3}\s+", -n: true)  # Get line numbers
content = Read(file_path, offset=450, limit=230)    # Read section body
```

**Production Incident** (2026-01-19):
- Skill used Grep for headers when spec.md exceeded 25K tokens
- Missed clarifications added via `/speckit.clarify`
- Flagged resolved issue (C01 ID stability) as CRITICAL
- Root cause: Interpreted "minimal context" as "structure only"

---

### ❌ Anti-Pattern 2: Large Fixed Chunks Without Overlap

**Problem**: 700-line chunks (5K tokens) without overlap

**Why It's Suboptimal**:
- Exceeds Anthropic's "few hundred tokens" guidance by 10-25×
- Risk of splitting semantic units (requirements, stories) across boundaries
- No recovery mechanism for boundary context loss

**When Acceptable**:
- Simple, repetitive content (e.g., CSV files)
- Cost-sensitive applications (minimize API calls)
- Low-criticality analysis

**Better Approach**: Use semantic chunking or add overlap

---

### ❌ Anti-Pattern 3: Sequential File Reads

**Problem**: Reading multiple independent files sequentially

**Example**:
```python
# ❌ SLOW: Sequential reads
spec = Read("spec.md")     # Wait for completion
plan = Read("plan.md")     # Then read plan
tasks = Read("tasks.md")   # Then read tasks
# Total time: T1 + T2 + T3
```

**Better Approach**:
```python
# ✅ FAST: Parallel reads (single message)
Read("spec.md")
Read("plan.md")
Read("tasks.md")
# Total time: max(T1, T2, T3)
```

---

### ❌ Anti-Pattern 4: No Content Validation

**Problem**: Proceeding to processing without verifying content was loaded (not just structure)

**Example**:
```python
# ❌ NO VALIDATION
headers = load_file_somehow(file_path)
process_requirements(headers)  # Assumes requirements are in `headers`
```

**Better Approach**:
```python
# ✅ WITH VALIDATION
content = Read(file_path, offset, limit)

# Validation checkpoint
IF cannot_quote_specific_requirement(content):
  ERROR("Content validation failed: loaded structure only")
  RETRY with correct chunking strategy

process_requirements(content)
```

---

## References

### Official Anthropic Documentation

- [Introducing Contextual Retrieval - Anthropic](https://www.anthropic.com/news/contextual-retrieval)
- [Files API - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/files)
- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Building Agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

### Community Resources

- [How Claude Processes Long Documents (100K+ Tokens)](https://claude-ai.chat/guides/how-claude-processes-long-documents/)
- [Claude AI File Upload and Reading: formats, limits, and operational structure](https://www.datastudios.org/post/claude-ai-file-upload-and-reading-formats-limits-and-operational-structure)
- [Automatic Chunking for Large Files/Prompts - GitHub Discussion](https://github.com/Kilo-Org/kilocode/discussions/589)
- [Contextual retrieval in Anthropic using Amazon Bedrock Knowledge Bases](https://aws.amazon.com/blogs/machine-learning/contextual-retrieval-in-anthropic-using-amazon-bedrock-knowledge-bases/)

### Related Project Documentation

- [CLAUDE-HAIKU-4-5-OPTIMIZATION.md](./CLAUDE-HAIKU-4-5-OPTIMIZATION.md) - Haiku-specific optimization patterns
- [CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md](./CLAUDE-SONNET-4-5-IMPLEMENTATION-OPTIMIZATION.md) - Parallel loading patterns
- [CLAUDE-4-5-OPTIMIZATION.md](./CLAUDE-4-5-OPTIMIZATION.md) - General Claude 4.5 techniques

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-19
**Maintainer**: Spec Kit Team
**Status**: Production-Ready
