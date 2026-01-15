# Claude 4.5 (Sonnet & Haiku) Prompt Optimization Guide

**Models**:

- Claude Sonnet 4.5 (1M context, extended thinking, agentic workflows)
- Claude Haiku 4.5 (500K context, 2x speed, 3x cost savings vs Sonnet)

**Cost**:

- Sonnet 4.5: 1x baseline
- Haiku 4.5: 0.33x (3x cheaper)

**Use cases**:

- Sonnet 4.5: Complex reasoning, code implementation, multi-step agentic workflows
- Haiku 4.5: Fast iteration, high-volume workloads, 90% of Sonnet's agentic performance

---

## Model Characteristics

### Claude Sonnet 4.5

1. **1M context window** - Currently in beta for tier 4 organizations (500K for Enterprise)
2. **Context awareness** - Explicitly tracks remaining token budget during conversations
3. **Extended thinking** - Deep reasoning capabilities with configurable thinking budgets (1K-32K+ tokens)
4. **Agentic excellence** - State-of-the-art on SWE-bench Verified (77.2%) with extended focus observed for more than 30 hours on complex, multi-step tasks
5. **Tool use optimization** - Enhanced tool calling with context editing features
6. **Precise instruction following** - Claude 4.x trained to follow instructions literally, not inferentially

**Sources**:

- [Context windows - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/context-windows)
- [Introducing Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5)

### Claude Haiku 4.5

1. **500K context window** - Half of Sonnet's but sufficient for most tasks
2. **2x speed improvement** - Faster inference compared to Sonnet 4.5
3. **3x cost savings** - More economical for high-volume workflows
4. **90% agentic performance** - Nearly matches Sonnet's agentic coding capabilities
5. **Ideal for iteration** - Best for tight feedback loops and rapid development
6. **Short, specific prompts** - Optimized for concise, explicit instructions

**Sources**:

- [Prompt Strategies That Work Best with Claude Haiku 4.5](https://sider.ai/blog/ai-tools/prompt-strategies-that-work-best-with-claude-haiku-4_5)
- [ClaudeLog - Agent Engineering](https://claudelog.com/mechanics/agent-engineering/)

---

## Optimization 1: Structured Prompting with XML Tags

### The Technique

**Use XML tags to structure prompts** with clear sections and boundaries.

**Research Finding**:

> "Claude 4.x models have been trained on structured prompts and know how to parse them. XML works great, as does JSON or other labeled prompting."

**Sources**:

- [The Claude Sonnet 4.5 Prompting Playbook](https://www.pantaleone.net/blog/post/claude-sonnet-4-5-system-prompt-analysis)
- [Claude AI Prompting Techniques](https://www.datastudios.org/post/claude-ai-prompting-techniques-structure-examples-and-best-practices)

### Why It Works

Claude 4.x models are explicitly trained to recognize and parse structured formats:

- ✅ **Clear boundaries** - `<task>`, `<rules>`, `<examples>` create explicit sections
- ✅ **Hierarchical organization** - Nested tags for complex instructions
- ✅ **Improved parsing** - Model reliably extracts information from tagged sections
- ✅ **System-level structure** - Place tone, policy, and tool-use rules in system prompts

### Implementation Pattern

```markdown
<role>
You are a mechanical gap detector analyzing Angular components against Foundation for Sites specifications.
</role>

<task>
Execute a 6-step workflow to identify implementation gaps:
1. Load constitutional requirements
2. Parse spec.md for functional requirements (FR-XXX)
3. Search implementation files for evidence
4. Score validation quality (0-10 scale)
5. Generate gap report for missing/incomplete items
6. Output structured markdown report
</task>

<constraints>
- Gap titles: 5-8 words maximum
- Priority justifications: ≤20 words
- Fix descriptions: ≤40 words
- Minimum validation score: 6/10
- No prose outside structured sections
</constraints>

<examples>
<example>
<input>
FR-042: "Component MUST expose toggle() method"
</input>
<search_result>
Found: toggle() { this.expanded.set(!this.expanded()) }
</search_result>
<verdict>
IMPLEMENTED - No gap
</verdict>
</example>
</examples>

<output_format>

## Validated Gaps (NEW)

### GAP-N: Title (5-8 words)

**Evidence:**

- **Spec**: FR-XXX at spec.md:line
- **Implementation**: NOT FOUND in [files searched]
- **Validation Score**: N/10

**Priority**: P0/P1/P2 (≤20 words justification)

**Smallest Fix**: (≤40 words)
</output_format>
```

### Haiku 4.5 Variation

For Haiku, keep XML structure but make it **more concise**:

```markdown
<role>Gap detector for Angular components</role>

<task>
6-step workflow:
1. Load requirements
2. Parse FR-XXX from spec
3. Search implementation
4. Score validation (0-10)
5. Generate gaps
6. Output report
</task>

<constraints>
Title: ≤8 words | Priority: ≤20 words | Fix: ≤40 words | Min score: 6/10
</constraints>
```

**Key difference**: Haiku prefers **terse XML** with fewer words per section.

---

## Optimization 2: Direct Communication (Skip Preamble)

### The Technique

**Be direct and skip preambles** - Claude 4.x is optimized for efficiency.

**Research Finding**:

> "Be direct and skip the preamble—the model is optimized for efficiency. Ask explicitly for formats you want (bullets, tables, code blocks). Add complexity to your prompts when you want detailed responses."

**Source**: [We Tested 25 Popular Claude Prompt Techniques](https://www.dreamhost.com/blog/claude-prompt-engineering/)

### Why It Works

Claude 4.x models don't benefit from polite preambles or pleasantries:

- ✅ **Faster inference** - Less text to process means faster responses
- ✅ **Clearer intent** - Direct commands eliminate ambiguity
- ✅ **Explicit formats** - State exactly what format you want
- ✅ **No filler** - Model won't generate unnecessary introductions

### Implementation Pattern

#### ❌ With Preamble (Don't Use)

```markdown
Hello Claude! I hope you're doing well today. I have a task for you that I think would be really helpful. If you don't mind, could you please help me analyze the accordion component? I'd really appreciate it if you could identify any gaps between the specification and implementation. Thank you so much for your help!

Please follow these steps...
```

#### ✅ Direct (Use This)

```markdown
Analyze accordion component for implementation gaps.

**Input**: spec.md, accordion.component.ts
**Output**: Gap report in markdown format with validation scores
**Format**: Use structured sections (Evidence, Priority, Fix)

Execute 6-step workflow:

1. Load FR-XXX requirements
2. Search implementation files
3. Score validation (0-10)
4. Generate gap list
5. Validate scores ≥6/10
6. Output report
```

### Format Specification

**Be explicit about desired formats**:

```markdown
❌ "Give me the results"
✅ "Output results as a markdown table with columns: ID, Title, Priority, Score"

❌ "Explain the gaps"
✅ "For each gap, use this format: ### GAP-N: Title
**Evidence:** [3 bullet points]
**Priority:** P0/P1/P2
**Fix:** [1-2 sentences]"

❌ "Make it detailed"
✅ "Add complexity: For each gap, include: - Exact line numbers from spec - All files searched - Keyword matches found/not found - Constitutional requirement violated"
```

---

## Optimization 3: Extended Thinking for Complex Tasks

### The Technique

**Use extended thinking mode** for complex reasoning, coding, and multi-step tasks.

**Research Finding**:

> "Anthropic's Claude 4 announcement showed substantial performance gains with extended thinking enabled, with scores improving significantly on the AIME 2025 math competition. Effectiveness rating: 10/10 for complex reasoning, 3/10 for simple queries."

**Sources**:

- [Extended thinking tips - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips)
- [Claude's extended thinking](https://www.anthropic.com/news/visible-extended-thinking)
- [We Tested 25 Popular Claude Prompt Techniques](https://www.dreamhost.com/blog/claude-prompt-engineering/)

### Why It Works

Extended thinking allows Claude to:

- ✅ **Reason before responding** - Shows internal thought process
- ✅ **Handle complexity** - Breaks down multi-step problems systematically
- ✅ **Improve accuracy** - Catches errors through deliberate reasoning
- ✅ **Optimize tool use** - Reflects after tool calls before proceeding

### Budget Management

**Thinking budget configuration**:

```yaml
thinking_budget:
  minimum: 1024 tokens
  recommended_start: 1024 tokens
  complex_tasks: 16384+ tokens
  maximum: 32768 tokens (use batch processing above this)
```

**Budget guidelines**:

- Start at **1024 tokens** (minimum) and increase incrementally
- Use **16K+ tokens** for complex tasks (coding, multi-step reasoning)
- **Higher budgets** enable comprehensive reasoning with diminishing returns
- **Above 32K**: Use batch processing to avoid networking issues

**Source**: [Extended thinking tips - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips)

### Prompting Strategies

**High-level instructions work best**:

```markdown
❌ Step-by-step prescriptive (Don't Use):
"First, read the file. Then, identify the class. Then, find the methods. Then, check each method signature. Then, compare to Foundation docs..."

✅ High-level goal (Use This):
"Analyze this component deeply and identify all gaps between the implementation and Foundation for Sites API requirements. Think through the problem systematically."
```

**Research Finding**:

> "Claude often performs better with high level instructions to just think deeply about a task rather than step-by-step prescriptive guidance. The model's creativity in approaching problems may exceed a human's ability to prescribe the optimal thinking process."

**Source**: [Extended thinking tips - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips)

### Multishot with Extended Thinking

**Show examples of thinking patterns**:

```markdown
<thinking_example>
<problem>Check if toggle() method exists in accordion.component.ts</problem>

<thinking>
I need to:
1. Search the file for "toggle()" method signature
2. Check if it's public (part of API)
3. Verify it matches Foundation's toggle() behavior
4. Look for any conditional logic (disabled state, etc.)
</thinking>

<search>
grep -n "toggle()" accordion.component.ts
</search>

<result>
Line 145: toggle() { this.expanded.set(!this.expanded()) }
</result>

<conclusion>
FOUND - toggle() exists at line 145, is public, flips expanded state
</conclusion>
</thinking_example>

Now apply this thinking pattern to analyze the actual component...
```

### When to Use Extended Thinking

| Task Type                | Extended Thinking           | Rationale                                   |
| ------------------------ | --------------------------- | ------------------------------------------- |
| **Gap validation**       | ✅ **Yes (16K budget)**     | Requires reasoning about gaps, edge cases   |
| **Code implementation**  | ✅ **Yes (16K+ budget)**    | Complex logic, error handling, architecture |
| **Multi-step workflows** | ✅ **Yes (8K-16K budget)**  | Sequential tool use with reflection         |
| **Gap detection**        | ⚠️ **Optional (4K budget)** | Mostly pattern matching, some reasoning     |
| **Task generation**      | ❌ **No**                   | Mechanical transformation, no reasoning     |
| **Template filling**     | ❌ **No**                   | Simple substitution                         |

### Best Practices

**DO**:

- ✅ Use English for thinking (performs best in English)
- ✅ Start with larger budgets (16K+) for complex tasks, adjust based on results
- ✅ Provide high-level goals rather than step-by-step instructions
- ✅ Use for coding, math, physics, and complex tool use

**DON'T**:

- ❌ Pass Claude's extended thinking back in user text block (degrades performance)
- ❌ Prefill extended thinking (explicitly not allowed)
- ❌ Manually change output text following thinking block (causes model confusion)
- ❌ Use for simple pattern-matching tasks

**Sources**:

- [Extended thinking tips - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips)
- [Building with extended thinking - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)

---

## Optimization 4: Precise Instruction Following (Literal, Not Inferential)

### The Technique

**Be extremely explicit** - Claude 4.x follows instructions literally.

**Research Finding**:

> "Claude 4.x models have been trained for more precise instruction following than previous generations of Claude models. Earlier versions would infer your intent and expand on vague requests, but Claude 4.x takes you literally and does exactly what you ask for, nothing more."

**Sources**:

- [Prompting best practices - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)
- [The Claude Sonnet 4.5 Prompting Playbook](https://www.pantaleone.net/blog/post/claude-sonnet-4-5-system-prompt-analysis)

### Why It Works

Claude 4.x is trained to follow instructions precisely:

- ✅ **No inference** - Won't guess what you "probably meant"
- ✅ **Exact execution** - Does exactly what you specify
- ✅ **Clear constraints** - Respects stated boundaries strictly
- ✅ **Format adherence** - Follows specified output formats exactly

### Implementation Pattern

#### ❌ Vague/Inferential (Claude 3.x style)

```markdown
"Analyze the component and find any issues"
→ Claude 3.x would infer: Check for bugs, style issues, best practices, etc.
→ Claude 4.x: What kind of issues? Code quality? Spec gaps? Performance?
```

#### ✅ Explicit/Literal (Claude 4.x style)

```markdown
"Analyze accordion.component.ts for implementation gaps relative to spec.md.

**Specific focus**:

1. Check if all FR-XXX requirements from spec.md are implemented
2. Verify Foundation API methods exist (up(), down(), toggle())
3. Confirm Foundation events are emitted ((up), (down) outputs)
4. Validate ARIA attributes from @angular/aria directives

**Out of scope**:

- Code quality issues
- Performance optimization
- Style/formatting
- Architectural improvements

**Output**: Gap report with only unimplemented spec requirements."
```

### Explicit Examples

**Provide concrete examples** - Claude 4.x pays close attention to details:

```markdown
<good_gap_example>

### GAP-1: Foundation API Methods Missing

**Evidence:**

- **Spec**: FR-042 at spec.md:178 - "Component MUST expose up(), down(), toggle()"
- **Implementation**:
  - Searched: accordion-item.component.ts (lines 1-245)
  - Found: expanded signal, but NO public methods
  - Searched: accordion-item.directive.ts
  - Found: No methods
- **Validation Score**: 8/10 (exact spec + complete search + explicit NOT FOUND)

**Priority**: P0 - Breaks Foundation API parity (constitutional requirement CA-009)

**Smallest Fix**: Add three public methods to NfsAccordionItemDef class: up() sets expanded=false, down() sets expanded=true, toggle() flips state.
</good_gap_example>

<bad_gap_example>

### GAP-1: Missing methods

**Evidence**: Some methods are missing

**Priority**: High

**Fix**: Add the methods
</bad_gap_example>

Use the "good_gap_example" format. Do NOT use the "bad_gap_example" format.
```

**Research Finding**:

> "Be careful with examples: Claude 4.x models pay close attention to details and examples as part of their precise instruction following capabilities. Ensure that your examples align with the behaviors you want to encourage and minimize behaviors you want to avoid."

**Source**: [Prompting best practices - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)

### Motivation and Context

**Explain WHY, not just WHAT**:

```markdown
❌ Without motivation:
"Don't report gaps for documentation requirements."

✅ With motivation:
"Don't report gaps for documentation requirements because documentation gaps will be handled by a separate documentation audit workflow. This gap analysis focuses only on code implementation gaps to avoid duplicate tracking."
```

**Research Finding**:

> "Providing context or motivation behind your instructions, such as explaining to Claude why such behavior is important, can help Claude 4.x models better understand your goals and deliver more targeted responses."

**Source**: [Prompting best practices - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)

---

## Optimization 5: Context Management & Token Budget Awareness

### The Technique

**Leverage Claude 4.5's context awareness** and use context editing techniques.

**Research Finding**:

> "Claude 4.5 models feature context awareness, explicitly informing the model about its remaining context so it can take maximum advantage of the available tokens. This enables these models to track their remaining context window ('token budget') throughout a conversation."

**Sources**:

- [Context windows - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/context-windows)
- [Claude Sonnet 4.5: Context Window Expansion](https://www.datastudios.org/post/claude-sonnet-4-5-context-window-expansion-caching-and-tool-use-upgrades)

### Context Sizes

| Model          | Context Window | Availability                           |
| -------------- | -------------- | -------------------------------------- |
| **Sonnet 4.5** | 1M tokens      | Beta (tier 4 orgs, custom rate limits) |
| **Sonnet 4.5** | 500K tokens    | Enterprise plans                       |
| **Haiku 4.5**  | 500K tokens    | Generally available                    |

### Context Editing

**Research Finding**:

> "Context editing automatically clears stale tool calls and results from within the context window when approaching token limits, removing stale content while preserving the conversation flow. Context editing alone delivered a 29% improvement in agent performance, and in a 100-turn web search evaluation, it enabled agents to complete workflows while reducing token consumption by 84%."

**Source**: [Managing context on the Claude Developer Platform](https://www.anthropic.com/news/context-management)

**Implementation**: Context editing is **automatic** in Claude Code - no manual configuration needed.

### Token Counting

**Use token counting API** to plan usage:

```typescript
// Estimate tokens before sending
const estimate = await anthropic.count_tokens({
  messages: messages,
  system: system_prompt,
});

if (estimate.input_tokens > 450000) {
  // Approaching 500K limit for Haiku/Enterprise Sonnet
  // Consider: Progressive disclosure, chunking, or switching to Sonnet 1M
}
```

**Source**: [Context windows - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/context-windows)

### Progressive Disclosure

For features >500K tokens, load content in chunks:

```markdown
<progressive_disclosure>

## Step 1: Load Core Artifacts (First Pass)

Load in this order:

1. spec.md (requirements) - ~50K tokens
2. plan.md (architecture) - ~30K tokens
3. CONSTITUTION.md (rules) - ~10K tokens
4. File list (paths only) - ~5K tokens

**Total**: ~95K tokens

## Step 2: Load Implementation (Second Pass)

Load only files mentioned in spec/plan:

- accordion.component.ts
- accordion-item.directive.ts
- accordion.types.ts

**Incremental**: +60K tokens (~155K total)

## Step 3: Deep Dive (Third Pass)

Load related files only if gaps detected:

- Tests (\*.spec.ts)
- Stories (\*.stories.ts)
- Styles (\*.scss)

**Incremental**: +80K tokens (~235K total)
</progressive_disclosure>
```

**When to use progressive disclosure**:

- ✅ Features >500K tokens
- ✅ Complex codebases with many files
- ✅ Multi-phase analysis workflows

---

## Optimization 6: Agentic Workflow Patterns

### The Technique

**Design prompts for agentic workflows** using Claude Code's feedback loop pattern.

**Research Finding**:

> "Agents often operate in a specific feedback loop: gather context → take action → verify work → repeat. This foundational pattern underpins most agentic applications."

**Sources**:

- [Building effective agents - Anthropic](https://www.anthropic.com/research/building-effective-agents)
- [Optimizing Agentic Coding: How to use Claude Code](https://research.aimultiple.com/agentic-coding/)

### Core Pattern

```markdown
<agentic_workflow>

## Phase 1: Gather Context (Research-First)

Before taking action:

1. Read spec.md to understand requirements
2. Read plan.md to understand architecture
3. Glob for existing implementation files
4. Read CONSTITUTION.md for project rules

**Rationale**: "Without initial research and planning steps, Claude tends to jump straight to coding a solution; asking Claude to research and plan first significantly improves performance for problems requiring deeper thinking upfront."

## Phase 2: Take Action

Execute the task with full context:

1. Analyze gaps between spec and implementation
2. Generate structured gap report
3. Write to gap-analysis-report.md

## Phase 3: Verify Work

Self-validate before completing:

1. Check all gaps have FR-XXX references
2. Verify validation scores ≥6/10
3. Confirm no known gaps duplicated
4. Validate output format matches template

## Phase 4: Repeat (If Needed)

If verification fails:
→ Return to Phase 2 with corrections
→ Re-verify until passing
</agentic_workflow>
```

**Source**: [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)

### Custom Slash Commands

**Store reusable workflows** in `.claude/commands/`:

```markdown
<!-- .claude/commands/analyze-gaps.md -->

# Analyze Implementation Gaps

You are a gap analysis agent. Execute this workflow:

## 1. Research Phase

- Read spec.md for FR-XXX requirements
- Read implementation files
- Load CONSTITUTION.md for rules

## 2. Analysis Phase

- For each FR-XXX: Search implementation
- Score validation quality (0-10)
- Identify gaps (score <6 or NOT FOUND)

## 3. Report Phase

- Generate gap-analysis-report.md
- Use structured format (Evidence, Priority, Fix)

## 4. Validation Phase

- All gaps have FR-XXX? ✓
- All scores ≥6/10? ✓
- No duplicates? ✓
```

**Usage**: Type `/analyze-gaps` in Claude Code to invoke.

**Research Finding**:

> "For repeated workflows—debugging loops, log analysis, etc.—store prompt templates in Markdown files within the .claude/commands folder, which become available through the slash commands menu and can be checked into git."

**Source**: [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)

### Test-Driven Development

**Write tests before implementation**:

```markdown
<tdd_workflow>

## Step 1: Define Expected Behavior

Based on FR-042: "Component MUST expose toggle() method"

Expected:

- toggle() method exists on component class
- Calling toggle() flips expanded state
- Respects disabled state (no-op if disabled)

## Step 2: Write Tests

Ask Claude to write tests first:
"Write Storybook interaction tests for accordion toggle() method. Expected behavior:

1. toggle() flips expanded from false→true
2. toggle() flips expanded from true→false
3. toggle() is no-op when disabled=true

Use Storybook play functions with userEvent and expect() assertions."

## Step 3: Implement to Pass Tests

"Now implement the toggle() method to make these tests pass. Add to NfsAccordionItem class."

**Rationale**: "Ask Claude to write tests based on expected input/output pairs, being explicit about doing test-driven development so that it avoids creating mock implementations."
</tdd_workflow>
```

**Source**: [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## Optimization 7: Tool Use & Specification Optimization

### The Technique

**Give tool definitions the same prompt engineering attention** as main prompts.

**Research Finding**:

> "Start with simple prompts, optimize them with comprehensive evaluation, and add multi-step agentic systems only when simpler solutions fall short. Tool definitions and specifications should be given just as much prompt engineering attention as your overall prompts."

**Source**: [Building effective agents - Anthropic](https://www.anthropic.com/research/building-effective-agents)

### Tool Definition Pattern

#### ❌ Vague Tool Description

```json
{
  "name": "search_files",
  "description": "Search for content in files",
  "input_schema": {
    "pattern": "string",
    "path": "string"
  }
}
```

#### ✅ Explicit Tool Description

```json
{
  "name": "search_files",
  "description": "Search for exact text patterns in implementation files using ripgrep. Returns matching lines with line numbers. Use this to verify if a requirement from spec.md is implemented in code.

**When to use**:
- Checking if a method exists (search for 'methodName(')
- Finding ARIA attributes (search for 'aria-expanded')
- Locating event emitters (search for 'Output()')

**Output format**:
- Returns: file_path:line_number:matching_line
- If no matches: Returns empty array

**Example**:
Input: pattern='toggle()', path='packages/accordion/'
Output: ['accordion.component.ts:145: toggle() { this.expanded.set(!this.expanded()) }']",

  "input_schema": {
    "type": "object",
    "properties": {
      "pattern": {
        "type": "string",
        "description": "Exact text or regex pattern to search for. Use literal strings for method names. Examples: 'toggle()', 'aria-expanded', '@Output()'"
      },
      "path": {
        "type": "string",
        "description": "Directory path to search within. Use specific component directories. Example: 'packages/accordion/src/'"
      }
    },
    "required": ["pattern", "path"]
  }
}
```

### Multi-Step Tool Use

**Use extended thinking between tool calls**:

```markdown
<tool_use_with_thinking>
**Task**: Find all Foundation API methods in accordion component

**Step 1**: Search for toggle()
<tool_call>search_files(pattern="toggle()", path="packages/accordion/")</tool_call>

**Thinking after Step 1**:
Found toggle() at line 145. Now I need to check for up() and down() methods as well. These are mentioned in FR-042 together.

**Step 2**: Search for up()
<tool_call>search_files(pattern="up()", path="packages/accordion/")</tool_call>

**Thinking after Step 2**:
No results for up(). This is a gap. But let me verify down() as well before concluding.

**Step 3**: Search for down()
<tool_call>search_files(pattern="down()", path="packages/accordion/")</tool_call>

**Conclusion**:

- toggle() ✓ FOUND (line 145)
- up() ✗ NOT FOUND
- down() ✗ NOT FOUND
  Gap: Missing up() and down() methods (P0)
  </tool_use_with_thinking>
```

**Research Finding**:

> "Claude 4.x models offer thinking capabilities that can be especially helpful for tasks involving reflection after tool use or complex multi-step reasoning, and you can guide its initial or interleaved thinking for better results."

**Source**: [Prompting best practices - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)

---

## Optimization 8: Haiku 4.5 Specific Optimizations

### The Technique

**Use Haiku 4.5 for speed-critical workflows** with optimized prompting.

**Research Finding**:

> "Claude Haiku 4.5 (released October 2025) has transformed agent engineering economics by delivering 90% of Sonnet 4.5's agentic coding performance at 2x the speed and 3x cost savings. It's engineered for speed, low latency, and cost efficiency—ideal for rapid iteration, high-volume workloads, and tight feedback loops."

**Source**: [ClaudeLog - Agent Engineering](https://claudelog.com/mechanics/agent-engineering/)

### Haiku Optimization Patterns

#### 1. Short, Specific Prompts

```markdown
❌ For Haiku (Too Verbose):
"I would appreciate it if you could help me analyze the accordion component implementation. Please take your time to thoroughly examine the code and identify any potential gaps between the specification document and the current implementation. Make sure to check all the requirements carefully and provide detailed evidence for each gap you find."

✅ For Haiku (Concise):
"Analyze accordion component for spec gaps.

**Input**: spec.md, accordion.component.ts
**Output**: Gap report (Evidence, Priority, Fix)
**Format**:

- Gap title: ≤8 words
- Evidence: Spec line + search results
- Priority: P0/P1/P2 + ≤20 word justification
- Fix: ≤40 words

Execute 6-step workflow from PROCEDURE.md."
```

**Research Finding**:

> "Short, specific prompts with explicit roles, constraints, and structured outputs work best. Use checklists, step limits, and JSON schemas to boost accuracy and consistency."

**Source**: [Prompt Strategies That Work Best with Claude Haiku 4.5](https://sider.ai/blog/ai-tools/prompt-strategies-that-work-best-with-claude-haiku-4_5)

#### 2. Explicit Roles and Objectives

```markdown
<role>Mechanical gap detector</role>

<objective>
Find unimplemented FR-XXX requirements from spec.md
</objective>

<success_criteria>

- All gaps have FR-XXX reference
- Validation score ≥6/10 per gap
- No known gap duplicates
- Output: structured markdown
  </success_criteria>

<constraints>
- Concise titles (≤8 words)
- Brief justifications (≤20 words)
- Terse fixes (≤40 words)
- No prose outside structure
</constraints>
```

**Research Finding**:

> "Specify audience, format, length, and must-have elements with crisp constraints that Haiku 4.5 thrives on. Keep roles and objectives explicit in the system-style setup to guide decoding, reduce drift, and improve repeatability across calls."

**Source**: [Prompt Strategies That Work Best with Claude Haiku 4.5](https://sider.ai/blog/ai-tools/prompt-strategies-that-work-best-with-claude-haiku-4_5)

#### 3. Checklists for Complex Tasks

```markdown
<task_checklist>

## Gap Analysis Checklist

For each requirement in spec.md:

- [ ] Extract FR-XXX ID and description
- [ ] Extract keywords (method names, ARIA attributes, events)
- [ ] Search implementation files for keywords
- [ ] Evaluate: FOUND vs NOT FOUND
- [ ] If NOT FOUND: Score validation quality (0-10)
- [ ] If score ≥6: Add to gap report
- [ ] If score <6: Skip (insufficient evidence)
- [ ] Check against KNOWN_GAPS registry
- [ ] If duplicate: Skip (already tracked)
- [ ] If new: Add to report with structure
      </task_checklist>

Use this checklist for every requirement.
```

**Research Finding**:

> "Checklists compress complex tasks into reliable, verifiable subtasks."

**Source**: [Prompt Strategies That Work Best with Claude Haiku 4.5](https://sider.ai/blog/ai-tools/prompt-strategies-that-work-best-with-claude-haiku-4_5)

---

## Optimization 9: Chain-of-Thought with Prefilling

### The Technique

**Use prefilling to guide Claude's reasoning** before it generates output.

**Research Finding**:

> "The prompt improver adds a dedicated section for Claude to think through problems systematically before responding to improve accuracy and reliability."

**Source**: [Use our prompt improver to optimize your prompts - Claude Docs](https://console.anthropic.com/docs/en/build-with-claude/prompt-engineering/prompt-improver)

### Implementation Pattern

```markdown
<system>
You are a gap analysis agent. Before outputting the gap report, think through the analysis step-by-step.
</system>

<user>
Analyze accordion component for gaps between spec.md and implementation.
</user>

<assistant>
Let me think through this systematically:

<thinking>
1. First, I'll load spec.md and extract all FR-XXX requirements
2. For each requirement, I'll identify keywords to search for
3. I'll search the implementation files for evidence
4. I'll score the validation quality (0-10 scale)
5. For gaps with score ≥6, I'll add to the report
6. I'll check against known gaps to avoid duplicates
7. Finally, I'll generate the structured gap report
</thinking>

Now let me execute this plan:

[Claude continues with actual analysis...]
```

### Multishot Examples

**Show Claude how to think**:

```markdown
<example_1>
<user>Check if toggle() method exists</user>

<assistant>
<thinking>
Step 1: Define search criteria
- Keyword: "toggle()"
- Expected location: Component class or directive
- Expected signature: Public method, no parameters or optional parameters

Step 2: Search implementation

- Search path: packages/accordion/
- Pattern: "toggle()"

Step 3: Evaluate results

- If found: Verify it's public, check signature
- If not found: This is a gap
  </thinking>

<action>
Search files for "toggle()" in packages/accordion/
</action>

<result>
Found: accordion.component.ts:145: toggle() { this.expanded.set(!this.expanded()) }
</result>

<conclusion>
✓ IMPLEMENTED - toggle() exists at line 145, is public, matches Foundation API
</conclusion>
</assistant>
</example_1>

Now apply this thinking pattern to all FR-XXX requirements...
```

**Research Finding**:

> "Adding examples to prompts is one of the most effective ways to improve model response quality, and you can now manage examples in a structured format directly in the Workbench."

**Source**: [Prompting best practices - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)

---

## Optimization 10: Memory & Session Management

### The Technique

**Use memory.md for project continuity** and `/clear` for fresh starts.

**Research Finding**:

> "A dedicated memory.md document captures the current state of the project, functioning as a continuity layer, especially when development is distributed across multiple working sessions. Fresh sessions using /clear reduced prompt-drift and prevented context contamination from earlier tasks."

**Sources**:

- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
- [How Anthropic teams use Claude Code](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code)

### Memory.md Pattern

```markdown
<!-- memory.md -->

# Project Memory: ngx-foundation-sites Accordion Component

## Current Status (2026-01-10)

**Phase**: Gap remediation (P0 gaps)
**Last completed**: GAP-1 (Foundation API methods) ✓
**In progress**: GAP-2 (Foundation API outputs)
**Blocked**: None

## Context for Next Session

**What we're building**: Angular accordion component with Foundation for Sites styling

**Recent decisions**:

- Use @angular/aria for ARIA attributes (decided 2026-01-08)
- Directives over components where possible (CA-003)
- Foundation CSS classes applied to host (no custom styling unless necessary)

**Known issues**:

- SSR compatibility needs testing (flagged in GAP-8)
- Keyboard navigation uses deprecated patterns (GAP-5, deferred to P2)

**Files modified this session**:

- accordion-item.component.ts (added toggle(), up(), down())
- accordion-item.component.spec.ts (added method tests)
- accordion-item.stories.ts (added interaction tests)

## Next Actions

1. Implement Foundation event outputs ((up), (down))
2. Update Storybook stories with event examples
3. Run full test suite
4. Re-run /analyze-gaps to verify fixes
```

### Session Management

**When to use `/clear`**:

```markdown
✅ Use /clear for:

- Starting a new feature (avoid context contamination)
- After completing a major phase (fresh start)
- When Claude seems confused or references old context
- Before running /analyze-gaps (clean slate)

❌ Don't use /clear for:

- In the middle of implementing a feature
- When you need context from previous steps
- During debugging (context is helpful)
```

**Research Finding**:

> "Fresh sessions using /clear reduced prompt-drift and prevented context contamination from earlier tasks."

**Source**: [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## Model Selection Matrix

### When to Use Sonnet 4.5

| Use Case                    | Why Sonnet                           | Budget                     |
| --------------------------- | ------------------------------------ | -------------------------- |
| **Gap validation**          | Requires reasoning about edge cases  | Extended thinking (16K)    |
| **Code implementation**     | Complex logic, error handling        | Extended thinking (16K+)   |
| **Architectural decisions** | Weighing trade-offs, design patterns | Extended thinking (8K-16K) |
| **Multi-file refactoring**  | Understanding dependencies, impacts  | Standard                   |
| **Complex debugging**       | Root cause analysis, reproduction    | Extended thinking (8K)     |
| **Long-context analysis**   | Features >500K tokens (1M context)   | Standard                   |

**Cost**: 1x baseline

### When to Use Haiku 4.5

| Use Case                  | Why Haiku                               | Optimization                 |
| ------------------------- | --------------------------------------- | ---------------------------- |
| **Gap detection**         | 90% of Sonnet's performance, 3x cheaper | Short prompts, checklists    |
| **Task generation**       | Mechanical transformation               | Explicit format, constraints |
| **Rapid iteration**       | 2x faster for feedback loops            | Concise, terse prompts       |
| **High-volume workflows** | Cost efficiency at scale                | Batch processing             |
| **Template filling**      | Pattern matching, substitution          | Explicit templates           |
| **Medium-context**        | Features <500K tokens                   | Standard prompts             |

**Cost**: 0.33x (3x cheaper than Sonnet)

**Performance**: 90% of Sonnet 4.5's agentic coding performance

**Source**: [ClaudeLog - Agent Engineering](https://claudelog.com/mechanics/agent-engineering/)

### Decision Tree

```
Feature complexity assessment:
├─ Requires deep reasoning? → Sonnet 4.5 (extended thinking)
├─ Requires 1M context? → Sonnet 4.5 (1M window)
├─ Speed is critical? → Haiku 4.5 (2x faster)
├─ High-volume (>100 requests)? → Haiku 4.5 (3x cheaper)
├─ Agentic coding task? → Haiku 4.5 (90% performance, much cheaper)
└─ Default for complex work → Sonnet 4.5
```

---

## Real-World Application Examples

### Example 1: Gap Analysis Agent (Haiku 4.5)

**Use case**: Detect implementation gaps against spec
**Model**: Haiku 4.5 (fast, cost-effective, 90% performance)
**Optimizations applied**: 1, 2, 4, 8

```markdown
<role>Mechanical gap detector</role>

<task>
6-step workflow:
1. Load spec.md FR-XXX requirements
2. Extract keywords per requirement
3. Search implementation for keywords
4. Score validation (0-10)
5. Generate gaps (score ≥6)
6. Output structured markdown
</task>

<constraints>
Title: ≤8 words | Priority: ≤20 words | Fix: ≤40 words | Min score: 6/10
</constraints>

<output_format>

### GAP-N: Title

**Evidence:**

- **Spec**: FR-XXX at spec.md:line
- **Implementation**: NOT FOUND in [files]
- **Validation Score**: N/10

**Priority**: P0/P1/P2 (justification)

**Smallest Fix**: (description)
</output_format>

Execute workflow. Use checklists for each requirement.
```

**Performance**: 10-20 seconds for small features (<500K tokens)

### Example 2: Gap Validation Agent (Sonnet 4.5)

**Use case**: Validate gaps have enough evidence and aren't duplicates
**Model**: Sonnet 4.5 (reasoning required)
**Optimizations applied**: 1, 2, 3, 4, 5

```markdown
<role>
You are a gap validation specialist with deep reasoning capabilities.
</role>

<task>
Validate gaps in gap-analysis-report.md against KNOWN_GAPS registry.

**Validation criteria**:

1. Gap has validation score ≥6/10
2. Gap is not duplicate of known gap
3. Gap has constitutional requirement violated
4. Fix is smallest possible change
5. Evidence is complete (spec + search results)

Use extended thinking to reason about edge cases.
</task>

<known_gaps_registry>
[Load from previous validation]
</known_gaps_registry>

<instructions>
For each gap in report:
1. Think deeply about whether gap is valid
2. Check keyword overlap with known gaps (≥50% = duplicate)
3. Verify constitutional requirements cited
4. Evaluate if fix is truly "smallest"
5. Score gap as VALID, INVALID, or DUPLICATE

Output: GAPS_VALIDATION.md with reasoning for each decision
</instructions>
```

**Extended thinking budget**: 16K tokens
**Performance**: 2-5 minutes for comprehensive validation

### Example 3: Code Implementation Agent (Sonnet 4.5)

**Use case**: Implement gap fixes with TDD
**Model**: Sonnet 4.5 (coding requires reasoning)
**Optimizations applied**: 1, 2, 3, 4, 6

```markdown
<role>
You are an expert Angular developer implementing component fixes using TDD.
</role>

<agentic_workflow>

## Phase 1: Research (Gather Context)

1. Read GAPS_REMEDIATION.md for gap details
2. Read component implementation files
3. Read Foundation for Sites docs for expected behavior
4. Read CONSTITUTION.md for project rules

## Phase 2: Test First (TDD)

1. Write Storybook interaction tests for expected behavior
2. Run tests - verify they fail
3. Document expected vs actual behavior

## Phase 3: Implement

1. Add/modify code to make tests pass
2. Follow Angular best practices (signals, ChangeDetectionStrategy.OnPush)
3. Apply Foundation CSS classes (no custom styling)
4. Use @angular/aria for accessibility

## Phase 4: Verify

1. Run tests - verify they pass
2. Run linter - fix issues
3. Run build - ensure no errors
4. Take screenshot for visual verification
   </agentic_workflow>

<extended_thinking>
Think deeply about:

- Edge cases (disabled state, SSR, animations)
- Accessibility implications
- Performance considerations
- Foundation API parity
  </extended_thinking>

Execute TDD workflow for GAP-N from REMEDIATION_CHECKLIST.md.
```

**Extended thinking budget**: 16K+ tokens
**Performance**: 5-15 minutes per gap (including tests)

---

## Best Practices Summary

### For Sonnet 4.5

1. **Use extended thinking** for complex reasoning (16K+ budget)
2. **Structure with XML** for clear sections and boundaries
3. **Be explicit** - Sonnet follows instructions literally
4. **Leverage 1M context** for large features (beta/custom limits)
5. **Design agentic workflows** - research → action → verify → repeat
6. **Optimize tool definitions** - treat them like prompts
7. **Use memory.md** for session continuity

### For Haiku 4.5

1. **Keep prompts short** - concise, terse, explicit
2. **Use checklists** for complex tasks
3. **Define explicit roles** and objectives upfront
4. **Specify strict constraints** (word limits, formats)
5. **Leverage 90% performance** at 3x cost savings
6. **Ideal for iteration** - rapid feedback loops
7. **Use for mechanical tasks** - transformations, pattern matching

### Universal Best Practices (Both Models)

1. **Skip preambles** - be direct
2. **XML structure** - `<role>`, `<task>`, `<constraints>`, `<output_format>`
3. **Provide motivation** - explain WHY, not just WHAT
4. **Show examples** - Claude 4.x learns from concrete examples
5. **Validate with checklists** - self-correction before output
6. **Session management** - use `/clear` to prevent drift
7. **Progressive disclosure** - chunk large features (>500K tokens)

---

## Common Pitfalls to Avoid

### ❌ Pitfall 1: Relying on Inference (Claude 3.x habits)

```markdown
❌ BAD (Claude 3.x style): "Analyze the component"
→ Claude 4.x: What kind of analysis? What am I looking for?

✅ GOOD (Claude 4.x style): "Analyze accordion.component.ts for implementation gaps relative to spec.md. Check if all FR-XXX requirements are implemented. Output gap report with Evidence, Priority, and Fix sections."
```

### ❌ Pitfall 2: Verbose Prompts for Haiku

```markdown
❌ BAD for Haiku: [500-word explanation with background context and detailed reasoning]

✅ GOOD for Haiku: "Analyze accordion for spec gaps. Input: spec.md, accordion.ts. Output: Gap report (Evidence, Priority, Fix). Format: Title ≤8 words, Priority ≤20 words, Fix ≤40 words."
```

### ❌ Pitfall 3: Not Using Extended Thinking for Complex Tasks

```markdown
❌ BAD: [Standard prompt for gap validation requiring reasoning about duplicates]
→ May miss subtle overlaps, make incorrect judgments

✅ GOOD: [Enable extended thinking with 16K budget]
→ Reasons deeply about keyword overlaps, edge cases, validates thoroughly
```

### ❌ Pitfall 4: Passing Extended Thinking Back to Model

```markdown
❌ BAD:
<user>
Here's what you thought last time:
<thinking>[previous thinking block]</thinking>
Now continue...
</user>

✅ GOOD:
<user>
Last session you determined GAP-1 was valid. Continue with GAP-2.
[Don't include the thinking block]
</user>
```

**Source**: [Extended thinking tips - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips)

### ❌ Pitfall 5: Ignoring Context Management

```markdown
❌ BAD: [Keep adding to conversation without /clear for 50+ turns]
→ Context contamination, prompt drift, irrelevant old context

✅ GOOD: [Use /clear between major phases, maintain memory.md for continuity]
→ Fresh context per feature, consistent behavior
```

---

## Research Sources

### Anthropic Official Documentation

- [Prompting best practices - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices) - Claude 4.x literal instruction following, examples, motivation
- [Extended thinking tips - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips) - Budget management, prompting strategies, best practices
- [Context windows - Claude Docs](https://docs.claude.com/en/docs/build-with-claude/context-windows) - Context sizes, token counting, context awareness
- [Building with extended thinking - Claude Docs](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) - Extended thinking API, configuration
- [Use our prompt improver to optimize your prompts - Claude Docs](https://console.anthropic.com/docs/en/build-with-claude/prompt-engineering/prompt-improver) - Chain-of-thought, multishot examples

### Anthropic Research & Engineering

- [Building effective agents - Anthropic](https://www.anthropic.com/research/building-effective-agents) - Agentic workflow patterns, tool definitions
- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices) - Research-first approach, TDD, custom slash commands
- [How Anthropic teams use Claude Code](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code) - Real-world workflows, memory.md, session management
- [Introducing Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5) - Model capabilities, performance characteristics
- [Claude's extended thinking](https://www.anthropic.com/news/visible-extended-thinking) - Extended thinking announcement, use cases
- [Managing context on the Claude Developer Platform](https://www.anthropic.com/news/context-management) - Context editing, 29% performance improvement, 84% token reduction

### Third-Party Analysis & Guides

- [The Claude Sonnet 4.5 Prompting Playbook](https://www.pantaleone.net/blog/post/claude-sonnet-4-5-system-prompt-analysis) - XML structuring, system prompt analysis
- [We Tested 25 Popular Claude Prompt Techniques](https://www.dreamhost.com/blog/claude-prompt-engineering/) - Direct communication, extended thinking effectiveness (10/10 vs 3/10)
- [Prompt Strategies That Work Best with Claude Haiku 4.5](https://sider.ai/blog/ai-tools/prompt-strategies-that-work-best-with-claude-haiku-4_5) - Short prompts, checklists, explicit constraints
- [ClaudeLog - Agent Engineering](https://claudelog.com/mechanics/agent-engineering/) - Haiku 4.5 economics (90% performance, 3x savings)
- [Claude AI Prompting Techniques](https://www.datastudios.org/post/claude-ai-prompting-techniques-structure-examples-and-best-practices) - XML tags, structured prompting
- [Optimizing Agentic Coding: How to use Claude Code](https://research.aimultiple.com/agentic-coding/) - Agentic workflow loop (gather → act → verify → repeat)
- [Claude Sonnet 4.5: Context Window Expansion](https://www.datastudios.org/post/claude-sonnet-4-5-context-window-expansion-caching-and-tool-use-upgrades) - Context awareness, token budget tracking
- [Mastering Claude's Context Window: A 2025 Deep Dive](https://sparkco.ai/blog/mastering-claudes-context-window-a-2025-deep-dive) - Context window strategies

### Model Comparisons & Performance

- [Introducing Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5) - Extended focus (30+ hours), state-of-the-art coding performance
- [Claude Sonnet 4.5 analysis - Braintrust](https://www.braintrust.dev/blog/claude-sonnet-4-5-aspirational-evals) - Performance data: 12.6% avg improvement, 29.6% score improvement
- [Fifty Claude Sonnet 4.5 Prompts That Actually Pull Their Weight](https://sider.ai/blog/ai-tools/fifty-claude-sonnet-4_5-prompts-that-actually-pull-their-weight) - Real-world prompt examples
- [PromptHub Blog: Everything You Need to Know about Claude 4.5](https://www.prompthub.us/blog/everything-you-need-to-know-about-claude-4-5) - Comprehensive overview

### AWS & Enterprise

- [Introducing Claude Sonnet 4.5 in Amazon Bedrock - AWS](https://aws.amazon.com/blogs/aws/introducing-claude-sonnet-4-5-in-amazon-bedrock-anthropics-most-intelligent-model-best-for-coding-and-complex-agents/) - Best for coding and complex agents

---

## Quick Reference Card

### Sonnet 4.5 Optimization Checklist

```
✅ XML structure (<role>, <task>, <constraints>, <output_format>)
✅ Skip preamble (direct, explicit instructions)
✅ Extended thinking for complex tasks (16K+ budget)
✅ Literal instructions (no inference, be explicit)
✅ Context awareness (track token budget)
✅ Agentic workflow (research → action → verify → repeat)
✅ Tool definitions optimized (treat like prompts)
✅ Motivation provided (explain WHY)
✅ Concrete examples (show, don't just describe)
✅ Memory.md for continuity
✅ /clear between major phases
```

**Result**: Best-in-class coding performance with deep reasoning capabilities.

---

### Haiku 4.5 Optimization Checklist

```
✅ Short, specific prompts (concise, terse)
✅ Explicit roles and objectives
✅ Checklists for complex tasks
✅ Strict constraints (word limits, formats)
✅ XML structure (but more concise than Sonnet)
✅ Skip preamble (even more direct)
✅ Mechanical tasks (90% of Sonnet's performance)
✅ Rapid iteration (2x faster)
✅ Cost-effective (3x cheaper)
```

**Result**: 90% of Sonnet's agentic performance at 2x speed and 3x cost savings.

---

## Complete Workflow Example: Gap Analysis → Validation → Implementation

### Step 1: Gap Detection (Haiku 4.5 - Fast & Cost-Effective)

```bash
# Use Haiku 4.5 for gap detection (mechanical task)
claude analyze-gaps --model haiku-4.5

# Optimizations: Short prompts, checklists, explicit constraints
# Time: 10-20 seconds
# Cost: 0.33x
# Output: gap-analysis-report.md
```

### Step 2: Gap Validation (Sonnet 4.5 - Reasoning Required)

```bash
# Use Sonnet 4.5 for validation (requires reasoning)
claude validate-gaps --model sonnet-4.5 --extended-thinking 16384

# Optimizations: Extended thinking, deep reasoning about duplicates/edge cases
# Time: 2-5 minutes
# Cost: 1x
# Output: GAPS_VALIDATION.md, REMEDIATION_CHECKLIST.md
```

### Step 3: Implementation (Sonnet 4.5 - Complex Coding)

```bash
# Use Sonnet 4.5 for implementation (TDD, complex logic)
claude implement-gaps --model sonnet-4.5 --extended-thinking 16384

# Optimizations: Agentic workflow, TDD, extended thinking
# Time: 5-15 minutes per gap
# Cost: 1x
# Output: Fixed code, passing tests, commits
```

### Step 4: Re-validation (Haiku 4.5 - Quick Check)

```bash
# Use Haiku 4.5 to verify fixes (fast iteration)
claude analyze-gaps --model haiku-4.5

# Time: 10-15 seconds
# Cost: 0.33x
# Output: "✅ No new gaps detected!"
```

**Total cost**: ~1.66x (mostly Sonnet for reasoning/implementation, Haiku for mechanical tasks)
**Total time**: ~10-25 minutes (depending on gap complexity)
**Optimization benefit**: 3x cost savings on mechanical tasks by using Haiku instead of Sonnet

---

**Last Updated**: 2026-01-10
**Maintained by**: SpecKit contributors
**Models covered**: Claude Sonnet 4.5, Claude Haiku 4.5 (Claude 4.x series)
