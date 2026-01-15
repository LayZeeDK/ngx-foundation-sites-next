# Analyze Haiku 4.5

Cross-artifact consistency and quality analysis optimized for Claude Haiku 4.5.

## Overview

This skill analyzes `spec.md`, `plan.md`, and `tasks.md` to identify inconsistencies, duplications, ambiguities, and gaps before implementation. It's a **read-only** analysis that produces a structured report with actionable findings.

## When to Use

- **After task generation** — Run after `/speckit.tasks` or `/tasks-haiku-4-5` completes
- **Before implementation** — Catch issues before `/speckit.implement`
- **Quality gate** — Verify consistency across design artifacts

## Invocation

```bash
/analyze-haiku-4-5
```

Or with arguments:

```bash
/analyze-haiku-4-5 Focus on coverage gaps only
```

## Detection Passes

| Pass  | What It Detects                                  |
| ----- | ------------------------------------------------ |
| **A** | Duplication — Near-duplicate requirements        |
| **B** | Ambiguity — Vague terms, unresolved placeholders |
| **C** | Underspecification — Missing objects, criteria   |
| **D** | Constitution Alignment — MUST violations         |
| **E** | Coverage Gaps — Requirements without tasks       |
| **F** | Inconsistency — Terminology drift, conflicts     |

## Severity Levels

| Level        | Meaning                                    |
| ------------ | ------------------------------------------ |
| **CRITICAL** | Blocks implementation — must resolve first |
| **HIGH**     | Should resolve before implementation       |
| **MEDIUM**   | Recommended to address                     |
| **LOW**      | Optional improvements                      |

## Handoffs

After analysis, you can:

- **Prepare Remediation** → `/analyze-prepare-reported-gaps-for-implementation`
- **Refine Specification** → `/speckit.specify`
- **Begin Implementation** → `/speckit.implement`

## Haiku 4.5 Optimizations

| Optimization             | Implementation                     |
| ------------------------ | ---------------------------------- |
| **Extended Thinking**    | 4K budget for semantic edge cases  |
| **Structured Outputs**   | JSON schema with Markdown fallback |
| **Step-Bounded**         | 9 explicit steps                   |
| **FOR EACH Patterns**    | Mechanical detection passes        |
| **Validation Checklist** | 9-point verification               |

## Performance

- **Speed**: 20-35 seconds
- **Cost**: ~$0.04-0.05 per run
- **Quality**: 90%+ of Sonnet for bounded detection

## Comparison to /speckit.analyze

| Aspect                | /speckit.analyze | /analyze-haiku-4-5   |
| --------------------- | ---------------- | -------------------- |
| **Model**             | Default (Sonnet) | Haiku 4.5 (enforced) |
| **Cost**              | ~$0.10-0.15      | ~$0.04-0.05          |
| **Speed**             | 30-60s           | 20-35s               |
| **Extended thinking** | Not specified    | 4K budget            |
| **Structured output** | No               | Yes (beta)           |
| **Handoffs**          | No               | Yes                  |

## When to Use Sonnet Instead

Use `/speckit.analyze` (Sonnet) when:

- Feature artifacts exceed 200K tokens combined
- Complex constitution reasoning required
- Deep architectural conflict detection needed
- Premium accuracy required for sign-off
