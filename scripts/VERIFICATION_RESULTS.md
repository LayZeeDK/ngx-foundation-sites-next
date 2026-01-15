# Beta Feature Verification Results

**Date**: 2026-01-15
**Environment**: Claude Code CLI
**Model**: Claude Sonnet 4.5

---

## Summary

| Feature | Status | Verified By | Notes |
|---------|--------|-------------|-------|
| **Extended Thinking** | ✅ Available | Direct usage test | Successfully demonstrated with extended thinking enabled |
| **1M Context Window** | ✅ Available | User confirmation | Available for Sonnet 4.5 (no longer tier 4 restricted) |
| **Structured Outputs** | ✅ Available | CLI `--json-schema` flag | Successfully tested, returns validated JSON in `structured_output` field |
| **Effort Parameter** | ❌ Unavailable | CLI `--betas` flag test | Requires API key setup (not available with subscription-only) |

---

## Detailed Results

### 1. Extended Thinking ✅

**Status**: Available
**Test Method**: Direct conversation usage
**Result**: Claude Code successfully enabled extended thinking when requested

**Evidence**:
- Prompt: "Explain quantum computing with extended thinking enabled"
- Response included extended thinking content
- Feature works as documented in prompt-engineering guides

**Availability**: Standard tier (no upgrade required)

---

### 2. 1M Context Window ✅

**Status**: Available
**Test Method**: User confirmation
**Result**: 1M context window is available for Sonnet 4.5

**Documentation Reference**:
- File: `prompt-engineering/CLAUDE-4-5-OPTIMIZATION.md`, line 24
- Previous status: "Currently in beta for tier 4 organizations"
- Current status: Available (no longer restricted)

**Availability**: Standard tier for Sonnet 4.5

---

### 3. Effort Parameter (Opus 4.5) ❌

**Status**: Unavailable (requires API key)
**Test Method**: CLI `--betas` flag
**Limitation**: Requires API key setup, not available with subscription-only access

**Test Command Attempted**:
```bash
claude --print --model opus --betas effort-2025-11-24 "Your prompt"
```

**Error Received**:
```
Warning: Custom betas are only available for API key users. Ignoring provided betas.
```

**Test Procedure** (for users with API access):
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-opus-4.5',
  max_tokens: 1024,
  anthropic_beta: 'effort-2025-11-24',
  effort: 'medium',
  messages: [
    { role: 'user', content: 'Explain TypeScript generics' }
  ],
});

console.log(message);
```

**Documentation Reference**:
- File: `prompt-engineering/CLAUDE-OPUS-4-5-IMPLEMENTATION-OPTIMIZATION.md`
- Beta header required: `anthropic_beta: "effort-2025-11-24"`
- Controls token usage: low/medium/high
- 76% token reduction at medium effort

**Availability**: Beta feature, requires:
1. Opus 4.5 model access
2. Beta header in API request
3. May require beta program enrollment

**Stability Warning**: ⚠️ BETA feature - API may change without notice

---

### 4. Structured Outputs (Haiku 4.5) ✅

**Status**: Available
**Test Method**: CLI `--json-schema` flag
**Result**: Successfully validated JSON output via CLI

**Test Command**:
```bash
claude --print --model haiku --output-format json \
  --json-schema '{"type":"object","properties":{"language":{"type":"string"},"features":{"type":"array","items":{"type":"string"}}},"required":["language","features"]}' \
  "Describe TypeScript with language name and 3 features"
```

**Successful Response Structure**:
```json
{
  "type": "result",
  "subtype": "success",
  "structured_output": {
    "language": "TypeScript",
    "features": [
      "Static Type Checking - ...",
      "Advanced Type System - ...",
      "Modern JavaScript Features - ..."
    ]
  }
}
```

**Test Procedure** (for users with API access):
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-haiku-4.5',
  max_tokens: 1024,
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'user_info',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        },
        required: ['name', 'age']
      }
    }
  },
  messages: [
    { role: 'user', content: 'User: John Doe, Age: 30' }
  ],
});

console.log(message);
```

**Documentation Reference**:
- File: `prompt-engineering/CLAUDE-HAIKU-4-5-OPTIMIZATION.md`, lines 1239-1240
- Provides JSON schema validation
- Beta feature

**Availability**: Beta feature, **NOT RECOMMENDED for production**

**Recommendation**: ⚠️ Use with caution - beta features may change

---

## Recommendations

### For Standard Claude Code Users

1. ✅ **Use Extended Thinking** - Available and stable
   - Most valuable feature for complex tasks
   - No upgrade required
   - Configurable budgets (1K-64K tokens)

2. ✅ **Use 1M Context Window** - Available for Sonnet 4.5
   - Excellent for large codebases
   - No longer restricted to tier 4

3. ✅ **Use Structured Outputs (with caution)** - Available via CLI!
   - Works with `--json-schema` flag
   - Beta feature - test thoroughly before production use
   - More reliable than prompt-based JSON formatting
   - Example: `claude --print --json-schema '{...}' "prompt"`

4. ❌ **Skip Effort Parameter** - Requires API key
   - Only available with API key setup
   - Not accessible with subscription-only access
   - Alternative: Use Haiku for cost savings instead

### For API Users

If you have direct Anthropic API access:

1. **Test Effort Parameter** - Potentially valuable for cost savings
   - 76% token reduction at medium effort
   - Matches Sonnet performance with fewer tokens
   - ⚠️ Use cautiously (beta feature)

2. **Consider Structured Outputs** - Available but use cautiously
   - CLI access via `--json-schema` flag
   - Beta feature - test thoroughly
   - More reliable than prompt-based JSON
   - Good for well-defined data extraction tasks

---

## Next Steps

### Update Documentation

- [x] Update `prompt-engineering/README.md` with verified results
- [x] Create verification results file
- [ ] Optional: Add beta feature usage examples to guides

### Re-verify Periodically

Beta features may transition to general availability:
- Re-run verification quarterly
- Update documentation when features change status
- Monitor Anthropic's official announcements

---

## Script Information

**Verification Script**: `scripts/verify-beta-features.ts`
**Usage**: `npx tsx scripts/verify-beta-features.ts`
**Purpose**: Provides manual testing instructions for all beta features

---

**Last Updated**: 2026-01-15
**Verified By**: Claude Code user testing + direct conversation verification
