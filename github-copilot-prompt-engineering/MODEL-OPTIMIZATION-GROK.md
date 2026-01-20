# Grok Code Fast 1 Prompt Optimization Guide

**Last Updated:** 2026-01-20

This document provides optimization strategies for Grok Code Fast 1, xAI's agentic coding model optimized for iterative tool-using workflows.

---

## Model Characteristics

| Attribute | Value |
|-----------|-------|
| **Context Window** | 256,000 tokens |
| **Throughput** | ~92 tokens/second (4x faster than competing models) |
| **Cache Hit Rate** | 90%+ with consistent conversation structure |
| **Cost** | 0x in GitHub Copilot (VS Code only, not CLI yet) |
| **Best For** | Agentic coding workflows, iterative bug fixes, scaffolding |

### Key Capabilities

1. **Agentic coding specialist** - Built from scratch for iterative, tool-using workflows
2. **256K context window** - Handles large repositories and long files coherently
3. **92 tokens/second throughput** - Up to 4x faster than competing agentic models
4. **Native tool-calling** - First-party support; designed with tool-calling in mind
5. **Exposed reasoning traces** - Visible via streaming mode
6. **90%+ cache hit rates** - Dramatic cost/latency reduction in multi-turn workflows

**Performance**: **70.8% on SWE-Bench Verified** using xAI's internal harness. Delivers **4x speed at 1/10th cost** of other leading agentic models.

**Source**: [Grok Code Fast 1 | xAI](https://x.ai/news/grok-code-fast-1)

---

## Quick Reference

| Optimization | Description | Priority |
|-------------|-------------|----------|
| [Native Tool-Calling](#optimization-1-native-tool-calling-not-xml) | Use SDK functions, not XML | Critical |
| [Detailed System Prompts](#optimization-2-detailed-system-prompts) | Thorough task description | Critical |
| [Setup + Tools + Example](#optimization-3-setup--tools--example-pattern) | Three-part prompt structure | High |
| [Preserve Prompt History](#optimization-4-preserve-prompt-history-for-caching) | Maximize cache hits | High |
| [Agentic Over One-Shot](#optimization-5-agentic-over-one-shot) | Use for iterative tasks | High |
| [Rapid Iteration](#optimization-6-rapid-iteration-strategy) | Quick attempts, refine | Medium |
| [Context Structuring](#optimization-7-xmlmarkdown-context-structuring) | XML/Markdown for clarity | Medium |
| [Reasoning Traces](#optimization-8-access-reasoning-traces) | Use streaming mode | Medium |
| [Plan-First Execution](#optimization-9-plan-first-execution) | Prevent over-editing | Medium |
| [Scope Boundaries](#optimization-10-scope-and-file-boundaries) | Explicit file paths | High |

---

## Optimization 1: Native Tool-Calling (Not XML)

### The Technique

**Use native function calling** instead of XML-based tool-call outputs.

**Research Finding**:

> "grok-code-fast-1 offers first-party support for native tool-calling and was specifically designed with it in mind. Use it instead of XML-based tool-call outputs, which may hurt performance."

**Source**: [Prompt Engineering for Grok Code Fast 1 | xAI](https://docs.x.ai/docs/guides/grok-code-prompt-engineering)

### Why It Works

grok-code-fast-1 was built with native tool-calling as the primary integration method:
- **Trained on function calling** - The model architecture expects native tool calls
- **XML hurts performance** - Forces the model off its optimization path
- **Better structured outputs** - Native calls produce cleaner tool invocations

### Implementation Pattern

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.x.ai/v1",
    api_key=os.environ["XAI_API_KEY"],
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read a file from the codebase",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "File path to read"}
                },
                "required": ["path"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="grok-code-fast-1",
    messages=[{"role": "user", "content": "Read the main config file"}],
    tools=tools,
    tool_choice="auto"
)
```

### Tool Choice Modes

| Mode | Behavior |
|------|----------|
| `"auto"` (default) | Model decides whether to call tools |
| `"required"` | Force tool calls (may cause hallucination) |
| `{"type": "function", "function": {"name": "..."}}` | Force specific function |
| `"none"` | Disable tool calling |

---

## Optimization 2: Detailed System Prompts

### The Technique

**Write thorough system prompts** describing the task, expectations, and edge cases.

**Research Finding**:

> "Be thorough and give many details in your system prompt. A well-written system prompt which describes the task, expectations, and edge-cases the model should be aware of can make a night-and-day difference."

**Source**: [Prompt Engineering for Grok Code Fast 1 | xAI](https://docs.x.ai/docs/guides/grok-code-prompt-engineering)

### Why It Works

grok-code-fast-1's speed allows for richer context without latency penalties:
- **Detail prevents ambiguity** - Explicit expectations reduce hallucination
- **Edge cases are handled** - Model knows what to watch for
- **Constraints focus behavior** - Prevents over-editing or under-delivering

### Implementation Pattern

```markdown
You are a senior TypeScript engineer working on [PROJECT_NAME].

## Your capabilities:
- Read files using the `read_file` tool
- Edit files using the `edit_file` tool
- Run tests using the `run_tests` tool
- Search codebase using the `grep` tool

## Task requirements:
[Specific task description with concrete deliverables]

## Constraints:
- Produce minimal patches (unified diff format)
- Include tests for any new functionality
- Follow existing code style (see .editorconfig)

## Edge cases to handle:
- Empty input arrays should return []
- Invalid paths should raise FileNotFoundError
- Network timeouts should retry 3 times

## Output format:
- Patch: unified diff
- Rationale: 1-2 sentences
- Tests: pytest function names
```

---

## Optimization 3: Setup + Tools + Example Pattern

### The Technique

**Structure prompts in 3 parts**: Short setup, tool/ability spec, and concrete example.

**Research Finding**:

> "A reliable prompt pattern has three parts: Short setup (one or two lines describing the repository context and goal), Tool/ability spec (what the model can call or what files you want modified), and Concrete example (one short exemplar of the desired output format)."

**Source**: [Grok-code-fast-1 Prompt Guide - CometAPI](https://www.cometapi.com/grok-code-fast-1-prompt-guide/)

### Why It Works

grok-code-fast-1's speed makes short, iterative prompts efficient:
- **Short scaffold** - Minimal overhead per interaction
- **Tool enumeration** - Model knows available actions
- **Example steers format** - One exemplar is enough to guide output

### Implementation Pattern

````markdown
## Setup
Repository: my-project (TypeScript library)
Goal: Fix form keyboard navigation bug

## Tools Available
- `read_file(path)` - Read file contents
- `edit_file(path, changes)` - Apply changes to file
- `run_tests(pattern)` - Run matching tests
- `grep(query)` - Search codebase

## Expected Output Format

```diff
--- a/src/form/form.component.ts
+++ b/src/form/form.component.ts
@@ -145,7 +145,7 @@
-    if (event.key === 'Enter') {
+    if (event.key === 'Enter' || event.key === ' ') {
```

Rationale: Space key should also toggle form per WCAG 2.1
Test: test_form_keyboard_space
````

---

## Optimization 4: Preserve Prompt History for Caching

### The Technique

**Keep context consistent** to maximize cache hits and reduce latency.

**Research Finding**:

> "Cache hits are a big contributor to fast inference speed. In agentic tasks, most of the prefix remains the same and is automatically retrieved from cache. Avoid changing or augmenting prompt history, as that could lead to cache misses and slower inference."

**Source**: [Prompt Engineering for Grok Code Fast 1 | xAI](https://docs.x.ai/docs/guides/grok-code-prompt-engineering)

### Why It Works

xAI achieves **90%+ cache hit rates** with launch partners:
- **Cached input tokens cost $0.02/1M** (vs $0.20/1M uncached)
- **Faster inference** - Cached context doesn't need reprocessing
- **Agentic workflows benefit most** - Sequential tool calls share prefix

### Implementation Pattern

#### DO: Consistent Conversation Structure

```python
messages = [
    {"role": "system", "content": system_prompt},  # Always same
    {"role": "user", "content": initial_task},     # Same prefix
    {"role": "assistant", "content": step_1_response},
    {"role": "user", "content": step_1_result},
    {"role": "assistant", "content": step_2_response},
    {"role": "user", "content": step_2_result},    # Only this grows
]
```

#### DON'T: Random Prompt Modifications

```python
# BAD: Inserting new context breaks cache
messages.insert(1, {"role": "system", "content": "Additional context..."})

# BAD: Modifying existing messages
messages[0]["content"] = updated_system_prompt

# BAD: Clearing and rebuilding
messages = rebuild_conversation(new_context)
```

#### Cache-Friendly File References

```markdown
# GOOD: Reference files by path (loaded via tools)
Reference @errors.ts to add proper error handling to @sql.ts

# BAD: Embedding entire file contents in prompts
Here is the content of errors.ts: [5000 lines...]
```

---

## Optimization 5: Agentic Over One-Shot

### The Technique

**Use grok-code-fast-1 for agentic workflows**, not one-shot queries.

**Research Finding**:

> "Use grok-code-fast-1 for agentic-style tasks rather than one-shot queries. Grok 4 models are more suited for one-shot Q&A while grok-code-fast-1 is ideal for navigating large codebases with tools."

**Source**: [Prompt Engineering for Grok Code Fast 1 | xAI](https://docs.x.ai/docs/guides/grok-code-prompt-engineering)

### Why It Works

grok-code-fast-1's architecture is optimized for iterative tool-calling:
- **Interleaved reasoning** - Thinks while calling tools
- **Speed advantage** - Rapid iteration costs less time/money
- **Cache benefits** - Consistent context improves with each step

### Model Selection Guide

| Task Type | Best Model | Rationale |
|-----------|------------|-----------|
| **Agentic coding** | grok-code-fast-1 | Designed for iterative tool use |
| **One-shot Q&A** | Grok 4 | Better for single-turn reasoning |
| **Complex reasoning** | Claude Sonnet 4.5 | Extended thinking capability |
| **Large context (>256K)** | GPT-4.1 | 1M context window |

### Agentic Task Examples

**grok-code-fast-1 excels at**:
- Bug fixes with search → read → edit → test cycles
- Scaffolding new features with iterative tool calls
- Test writing with incremental coverage checking
- Documentation updates after code changes

**Better for Grok 4 / Claude / GPT-5**:
- Architecture planning (one-shot design)
- Deep algorithmic reasoning
- Multi-file refactors requiring global view

---

## Optimization 6: Rapid Iteration Strategy

### The Technique

**Fire quick attempts and refine** rather than crafting perfect prompts.

**Research Finding**:

> "grok-code-fast-1 is highly efficient, delivering up to 4x the speed and 1/10th the cost of other leading agentic models. Take advantage of rapid, cost-effective iteration to refine queries."

**Source**: [Prompt Engineering for Grok Code Fast 1 | xAI](https://docs.x.ai/docs/guides/grok-code-prompt-engineering)

### Why It Works

Traditional prompting advice (spend 20 minutes crafting perfect prompt) doesn't apply:
- **4x speed** - Iterations complete in seconds
- **1/10th cost** - Many attempts still cheaper than one Sonnet call
- **Learning from failures** - Refine based on actual output

### Implementation Pattern

```markdown
## Attempt 1 (10 seconds)
Prompt: "Fix the authentication bug"
Result: Fixed wrong bug, broke tests

## Attempt 2 (10 seconds)
Prompt: "Fix the JWT validation bug in auth.ts line 45, don't touch the session code"
Result: Good fix, but missing error handling

## Attempt 3 (10 seconds)
Prompt: "Add try/catch around the JWT validation at auth.ts:45, return 401 on failure"
Result: Clean implementation
```

**Total: 30 seconds, $0.003** vs crafting one perfect prompt for 5 minutes.

---

## Optimization 7: XML/Markdown Context Structuring

### The Technique

**Use XML tags or Markdown headings** to structure large context blocks.

**Research Finding**:

> "grok-code-fast-1 is accustomed to seeing a lot of context in the initial user prompt. Use XML tags or Markdown-formatted content to mark various sections and add clarity."

**Source**: [Prompt Engineering for Grok Code Fast 1 | xAI](https://docs.x.ai/docs/guides/grok-code-prompt-engineering)

### Why It Works

The 256K context window handles large inputs, but structure aids parsing:
- **Section markers** help the model navigate
- **Labeled content** reduces ambiguity
- **Consistent format** improves extraction accuracy

### Implementation Pattern

#### XML-Style Structuring

```xml
<repository_context>
  <name>my-project</name>
  <tech_stack>Angular, TypeScript, Foundation CSS</tech_stack>
  <conventions>
    - Use signals for state management
    - Prefer directives over components
    - Follow Foundation's CSS class naming
  </conventions>
</repository_context>

<current_task>
  <goal>Fix form keyboard navigation</goal>
  <affected_files>
    - packages/lib/src/form/form.component.ts
    - packages/lib/src/form/form-item.directive.ts
  </affected_files>
</current_task>

<constraints>
  <must_follow>WCAG 2.1 keyboard navigation requirements</must_follow>
  <must_not_break>Existing click handlers</must_not_break>
</constraints>
```

#### Markdown-Style Structuring

```markdown
## Repository Context
- **Name**: my-project
- **Stack**: Angular, TypeScript, Foundation CSS
- **Conventions**: Signals, directives over components, Foundation CSS classes

## Current Task
**Goal**: Fix form keyboard navigation

**Affected Files**:
- `packages/lib/src/form/form.component.ts`
- `packages/lib/src/form/form-item.directive.ts`

## Constraints
- MUST follow WCAG 2.1 keyboard navigation
- MUST NOT break existing click handlers
```

---

## Optimization 8: Access Reasoning Traces

### The Technique

**Use streaming mode** to access the model's reasoning process.

**Research Finding**:

> "The thinking trace is exposed via `chunk.choices[0].delta.reasoning_content`. Thinking traces are only accessible when using streaming mode."

**Source**: [Grok Code Fast 1 - OpenRouter](https://openrouter.ai/x-ai/grok-code-fast-1)

### Why It Works

Visible reasoning provides better steerability:
- **Debug failures** - See why the model made decisions
- **Guide next iteration** - Refine based on reasoning
- **Validate correctness** - Check the logic, not just output

### Implementation Pattern

```python
stream = client.chat.completions.create(
    model="grok-code-fast-1",
    messages=messages,
    stream=True
)

reasoning = []
content = []

for chunk in stream:
    delta = chunk.choices[0].delta

    # Capture reasoning trace
    if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
        reasoning.append(delta.reasoning_content)

    # Capture final content
    if delta.content:
        content.append(delta.content)

print("Reasoning:", "".join(reasoning))
print("Output:", "".join(content))
```

---

## Optimization 9: Plan-First Execution

### The Technique

**Request a short plan before code generation** to prevent over-editing.

**Research Finding**:

> "For multi-file refactors, use two-stage prompts—request plan first, then execution. This reduces accidental overreach."

**Source**: [Grok-code-fast-1 Prompt Guide - CometAPI](https://www.cometapi.com/grok-code-fast-1-prompt-guide/)

### Why It Works

grok-code-fast-1 is "zealous and iterative" - without constraints it can over-edit:
- **Plan validates scope** - Confirm before executing
- **Short plans (3 items max)** - Keeps focus narrow
- **Execution is bounded** - Follow the approved plan

### Implementation Pattern

#### Stage 1: Planning

```markdown
## Request

Before making changes, provide a 3-item plan:
1. What files will be modified?
2. What specific changes will be made?
3. What will NOT be changed?

Do not write any code yet.
```

#### Stage 2: Execution

```markdown
## Approved Plan
1. Modify `auth.ts` to add JWT validation
2. Add `try/catch` around line 45
3. Leave session handling untouched

## Instruction
Execute the plan above. Do not deviate.
```

---

## Optimization 10: Scope and File Boundaries

### The Technique

**Explicitly specify file paths and modification scope** in prompts.

**Research Finding**:

> "In Cursor/Windsurf/Cline, Grok is zealous and iterative, even excellent when your prompts specify scope and file boundaries. Without constraints, it can over-edit."

**Source**: [Grok-code-fast-1 Prompt Guide - CometAPI](https://www.cometapi.com/grok-code-fast-1-prompt-guide/)

### Why It Works

Clear boundaries prevent scope creep:
- **File paths** - Tell it exactly where to work
- **Function names** - Narrow to specific code sections
- **Negative constraints** - Explicitly state what NOT to touch

### Implementation Pattern

#### Good: Explicit Scope

```markdown
## Task
Fix the `handleKeydown` function in `form.component.ts`

## Scope
- ONLY modify lines 140-165
- ONLY the handleKeydown function
- DO NOT touch: constructor, ngOnInit, ngOnDestroy
- DO NOT add new imports
```

#### Good: File References

```markdown
Reference @errors.ts to add proper error handling to @sql.ts
```

Using `@filename` notation:
- Keeps file content out of prompt (cache-friendly)
- Tools can load files dynamically
- Clearer than embedded content

#### Bad: Vague Scope

```markdown
# BAD: No boundaries
"Fix the keyboard handling"

# BAD: Too broad
"Improve the form component"

# BAD: Implicit scope
"Make error handling better"
```

---

## Performance Characteristics

### Speed Benchmarks

| Metric | Value |
|--------|-------|
| **Throughput** | ~92 tokens/second |
| **Context window** | 256K tokens |
| **Cache hit rate** | 90%+ (with launch partners) |
| **Relative speed** | 4x faster than competing agentic models |

### Cost Analysis

| Environment | Cost |
|-------------|------|
| **GitHub Copilot (VS Code)** | **0x (free)** |
| **GitHub Copilot CLI** | Not available yet |
| xAI API - Input (uncached) | $0.20 / 1M |
| xAI API - Input (cached) | $0.02 / 1M |
| xAI API - Output | $1.50 / 1M |

### Quality Benchmarks

| Benchmark | Score |
|-----------|-------|
| **SWE-Bench Verified** | 70.8% |
| vs Claude Sonnet 4 | -1.9% (72.7%) |
| vs GPT-5 | -4.1% (74.9%) |

**Trade-off**: Slightly lower quality, dramatically lower cost and latency.

---

## When to Use Grok Code Fast 1

### ✅ Excellent For

1. **Routine bug fixes** - Quick search → read → edit → test cycles
2. **Scaffolding** - Generate boilerplate with iterative refinement
3. **Test writing** - Build coverage incrementally
4. **Documentation updates** - Sync docs after code changes
5. **High-volume grunt work** - Tasks that need speed over perfection

### ❌ Better Alternatives

| Task | Use Instead | Reason |
|------|-------------|--------|
| Deep algorithms | Claude Opus 4.5 | Extended thinking |
| Multi-file refactors | Claude Sonnet 4.5 | Better global reasoning |
| Architecture planning | Grok 4 | One-shot design |
| >256K context | GPT-4.1 | 1M context window |
| Production-critical | Claude Opus 4.5 | First-try correctness |

---

## Common Pitfalls to Avoid

### ❌ Pitfall 1: XML Tool Outputs

```markdown
BAD: Using XML for tool calls
<function_call><name>read_file</name><args>{"path": "src/auth.ts"}</args></function_call>

GOOD: Native function calling via SDK
tools=[{"type": "function", "function": {...}}]
```

### ❌ Pitfall 2: Breaking Cache with Context Changes

```markdown
BAD: Inserting new messages mid-conversation
BAD: Modifying system prompt between calls
BAD: Embedding file contents instead of using tools

GOOD: Consistent conversation structure
GOOD: Reference files via @filename notation
GOOD: Let tools load file contents dynamically
```

### ❌ Pitfall 3: One-Shot Queries

```markdown
BAD: Using grok-code-fast-1 for single-turn Q&A
"Explain how authentication works in this codebase"

GOOD: Using grok-code-fast-1 for iterative tasks
"Find the auth code, trace the JWT flow, and fix the validation bug"
```

### ❌ Pitfall 4: No Scope Boundaries

```markdown
BAD: "Improve the error handling"
GOOD: "Add try/catch to validateJWT in auth.ts lines 45-50, return 401 on failure"
```

### ❌ Pitfall 5: Over-Engineering Prompts

```markdown
BAD: Spending 20 minutes crafting the perfect prompt
GOOD: Quick attempt → refine based on output → iterate

Total time: 30 seconds for 3 iterations
Total cost: $0.003
```

---

## Quick Reference Card

### Grok Code Fast 1 Optimization Checklist

```
✅ Native tool-calling (not XML)
✅ Detailed system prompt (task, expectations, edge cases)
✅ Setup + Tools + Example structure
✅ Consistent conversation (preserve cache)
✅ Agentic workflows (not one-shot)
✅ Rapid iteration (quick attempts, refine)
✅ XML/Markdown context structuring
✅ Streaming for reasoning traces
✅ Plan-first for multi-file changes
✅ Explicit scope and file boundaries
```

### Model Selection Quick Guide

```
IF task is iterative bug fix/scaffolding/tests:
   USE grok-code-fast-1 (fast + cheap)

ELSE IF task needs deep reasoning:
   USE Claude Sonnet 4.5 (extended thinking)

ELSE IF task is one-shot Q&A:
   USE Grok 4 (better single-turn)

ELSE IF context > 256K:
   USE GPT-4.1 (1M context)
```

---

## Integration Guides

### GitHub Copilot (VS Code) - 0x Cost

1. Ensure Grok Code Fast 1 is enabled (Admin policy for Business/Enterprise)
2. Select from model picker (Chat, Agent, Edit modes)
3. Available in VS Code, Visual Studio, JetBrains, Xcode, Eclipse
4. **Not available in GitHub Copilot CLI yet**

**Cost**: Free (0x) with your GitHub Copilot subscription

### Direct API

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.x.ai/v1",
    api_key=os.environ["XAI_API_KEY"],
)

response = client.chat.completions.create(
    model="grok-code-fast-1",
    messages=[{"role": "user", "content": "Fix the bug..."}],
    tools=tools,  # Function definitions
    tool_choice="auto"
)
```

---

## Research Sources

**Primary Sources**:
- [Grok Code Fast 1 | xAI](https://x.ai/news/grok-code-fast-1) - Official announcement, architecture, benchmarks
- [Prompt Engineering for Grok Code Fast 1 | xAI](https://docs.x.ai/docs/guides/grok-code-prompt-engineering) - Official prompt engineering guide
- [Function Calling | xAI](https://docs.x.ai/docs/guides/function-calling) - Native tool-calling documentation
- [Grok Code Fast 1 - OpenRouter](https://openrouter.ai/x-ai/grok-code-fast-1) - API specifications, parameters

**Third-Party Analysis**:
- [Grok-code-fast-1 Prompt Guide - CometAPI](https://www.cometapi.com/grok-code-fast-1-prompt-guide/) - Comprehensive prompt patterns
- [xAI's Prompt Engineering Guide - PromptLayer](https://blog.promptlayer.com/xais-prompt-engineering-guide-for-grok-code-fast-1/) - Best practices summary
- [Grok Code Fast 1 Coding Evaluation - 16x Engineer](https://eval.16x.engineer/blog/grok-code-fast-1-coding-evaluation-results) - Real-world performance

**Comparative Analysis**:
- [Grok Code Fast 1 vs Claude Sonnet 4 - Galaxy.ai](https://blog.galaxy.ai/compare/claude-sonnet-4-vs-grok-code-fast-1) - Model comparison
- [Grok Code Fast 1 vs GPT-5 Mini - Galaxy.ai](https://blog.galaxy.ai/compare/gpt-5-mini-vs-grok-code-fast-1) - Cost/performance trade-offs

---

## Related Documents

- [MODEL-OPTIMIZATION-GPT-5-MINI.md](./MODEL-OPTIMIZATION-GPT-5-MINI.md) - Alternative fast model
- [MODEL-OPTIMIZATION-GPT-4-1.md](./MODEL-OPTIMIZATION-GPT-4-1.md) - For larger context (1M)
- [MODEL-FRONTMATTER.md](./MODEL-FRONTMATTER.md) - How to specify models in agent/prompt files
