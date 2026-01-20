# GitHub Copilot Features and Availability

> **Audience**: Developers using GitHub Copilot CLI and VS Code
> **Purpose**: Feature reference with availability status
> **Last Updated**: 2026-01-20
> **CLI Version Verified**: 0.0.382

---

## Quick Reference

| Feature | CLI | VS Code | Status |
|---------|-----|---------|--------|
| MCP Integration | ✅ | ✅ | **GA** |
| Agent Mode | ✅ | ✅ | **GA** |
| Multi-Model (14) | ✅ | ✅ | **GA** |
| Custom Agents | ✅ | ✅ | **GA** |
| Skills | ✅ | Early Preview | **GA in CLI** |
| Custom Instructions | ✅ | ✅ | **GA** |
| Session Management | ✅ | N/A | **GA** |
| Context Management | ✅ | N/A | **GA** |
| Slash Commands | N/A | ✅ | **GA** |
| Prompt Files | N/A | ✅ | **GA** |

---

## Available Models (14 Total)

### Free Models (0x Cost)

| Model | Context | Best For |
|-------|---------|----------|
| **gpt-4.1** | 1M | Large features requiring long-context analysis |
| **gpt-5-mini** | 200K | Fast analysis, cost-effective tasks |

### Premium Models

| Model | Type | Context | Best For |
|-------|------|---------|----------|
| gpt-5 | General | 200K | General-purpose tasks |
| gpt-5.1 | General | 200K | General-purpose tasks |
| gpt-5.2 | General | 200K | Latest general model |
| gpt-5.1-codex-mini | Coding | 200K | Quick code fixes |
| gpt-5.1-codex | Coding | 400K | Standard implementation |
| gpt-5.1-codex-max | Coding | 400K+ | Multi-file, long-horizon tasks |
| gpt-5.2-codex | Coding | 400K | Latest codex model |
| claude-haiku-4.5 | Fast | 200K | Quick analysis, cost-effective |
| claude-sonnet-4 | Balanced | 200K | Complex reasoning |
| claude-sonnet-4.5 | Balanced | 200K | Latest balanced model |
| claude-opus-4.5 | Capable | 200K | Most capable, extended thinking |
| gemini-3-pro-preview | Preview | 200K | Preview access |

---

## CLI Features (All GA)

> **Note**: This section covers the **standalone `copilot` CLI**—a full agentic AI assistant. This is different from `gh copilot` (GitHub CLI extension), which only provides command suggestions.

### 1. MCP Integration

**Status**: ✅ **GA**

The Model Context Protocol allows connecting external tools and services.

**Configuration File**: `~/.copilot/mcp-config.json`

**Commands**:
```
/mcp show       # Display configured servers
/mcp add        # Add new MCP server
/mcp edit       # Modify server configuration
/mcp delete     # Remove MCP server
/mcp disable    # Temporarily disable server
/mcp enable     # Re-enable disabled server
```

**CLI Flags**:
```bash
--additional-mcp-config <json>  # Add MCP servers for session
--disable-mcp-server <name>     # Disable specific server
--disable-builtin-mcps          # Disable built-in servers
--enable-all-github-mcp-tools   # Enable all GitHub tools
--add-github-mcp-tool <tool>    # Add specific GitHub tool
--add-github-mcp-toolset <set>  # Add GitHub toolset
```

---

### 2. Agent Mode

**Status**: ✅ **GA**

Agent Mode enables autonomous multi-step task execution with tool calling.

**Interactive Mode**:
```bash
copilot                           # Start interactive session
copilot -i "Fix the bug"          # Interactive with initial prompt
```

**Non-Interactive Mode**:
```bash
copilot -p "Fix the bug" --allow-all-tools  # Execute and exit
```

**Capabilities**:
- ✅ File operations (read, write, edit)
- ✅ Shell command execution
- ✅ Git operations
- ✅ MCP server tools
- ✅ GitHub API (via built-in MCP)
- ✅ Web fetching (with URL allowlists)

---

### 3. Multi-Model Support

**Status**: ✅ **GA**

Switch between 14 models based on task requirements.

**Selection Methods**:
```bash
copilot --model claude-sonnet-4.5   # CLI flag
/model                               # Interactive command
```

**Configuration** (`~/.copilot/config.json`):
```json
{
  "model": "gpt-5-mini"
}
```

---

### 4. Custom Agents

**Status**: ✅ **GA**

Load specialized agent behaviors from `AGENTS.md` and related files.

**Usage**:
```bash
copilot --agent <agent-name>  # CLI flag
/agent                         # Browse and select in session
```

---

### 5. Tool Execution & Security

**Status**: ✅ **GA**

Granular control over which tools the agent can use.

**Allow Tools**:
```bash
--allow-tool [tools...]         # Allow specific tools
--allow-all-tools               # Allow all (required for -p mode)
--allow-all-paths               # Disable path verification
--allow-all-urls                # Allow all URL fetching
--allow-all                     # Allow everything (alias: --yolo)
```

**Deny Tools**:
```bash
--deny-tool [tools...]          # Deny specific tools
--deny-url [urls...]            # Deny specific URLs
```

**Examples**:
```bash
# Allow git but deny push
copilot --allow-tool 'shell(git:*)' --deny-tool 'shell(git push)'

# Allow all file editing
copilot --allow-tool 'write'

# Allow specific MCP tool
copilot --allow-tool 'MyMCP(specific_tool)'
```

**Directory Control**:
```bash
--add-dir <directory>           # Add allowed directory
--disallow-temp-dir             # Prevent temp access
```

---

### 6. Session Management

**Status**: ✅ **GA**

Resume previous conversations and share sessions.

**Resumption**:
```bash
copilot --continue              # Resume most recent session
copilot --resume                # Session picker
copilot --resume <sessionId>    # Resume specific session
```

**Sharing**:
```bash
copilot --share                 # Share session
copilot --share-gist            # Share as GitHub Gist
/share                          # Share from interactive mode
```

**Storage**:
- Session state: `~/.copilot/session-state/`
- Command history: `~/.copilot/command-history-state.json`

---

### 7. Custom Instructions

**Status**: ✅ **GA**

Automatically load project-specific instructions.

**Default Behavior**: Loads `AGENTS.md` from project root

**Flags**:
```bash
--no-custom-instructions        # Disable automatic loading
```

---

### 8. Skills

**Status**: ✅ **GA**

Manage and invoke reusable skill workflows.

**Commands**:
```
/skills list                    # List available skills
/skills info <name>             # Skill details
/skills add                     # Add new skill
/skills remove <name>           # Remove skill
/skills reload                  # Refresh skill registry
```

---

### 9. Context Management

**Status**: ✅ **GA**

Monitor and optimize conversation context.

**Commands**:
```
/context                        # View current context usage
/compact                        # Optimize/reduce context
```

---

### 10. Interactive Commands Reference

All commands available in interactive mode:

```
/add-dir            /agent              /clear              /compact
/context            /cwd                /delegate           /exit
/share              /feedback           /help               /list-dirs
/login              /logout             /mcp                /model
/reset-allowed-tools                    /session            /skills
/terminal-setup     /theme              /usage              /user
```

---

## VS Code Features

### GA Features

| Feature | Location | Description |
|---------|----------|-------------|
| **Agent Mode + MCP** | Copilot Chat | Full agentic capabilities with tool execution |
| **Custom Instructions** | `.github/copilot-instructions.md` | Project-wide conventions |
| **Slash Commands** | Copilot Chat | `/explain`, `/fix`, `/tests`, `/doc`, `/optimize` |
| **Prompt Files** | `.github/prompts/*.prompt.md` | Reusable task prompts |
| **Custom Agents** | `.github/agents/*.agent.md` | Specialized AI personas |

### Beta/Preview Features

| Feature | Status | Expected GA | Notes |
|---------|--------|-------------|-------|
| **Agent Skills** | Early Preview | Q2-Q3 2026 | Limited access |

**How to Check Feature Access**:
1. VS Code Settings → Search "Copilot"
2. Look for agent and MCP configuration options
3. Visit https://github.com/settings/copilot for account settings

---

## Verification Commands

### Check Installation

```bash
copilot --version
# Expected: 0.0.382 or later
```

### Test Model Selection

```bash
# Free models (no premium required)
copilot --model gpt-4.1
copilot --model gpt-5-mini

# Premium models (requires active subscription)
copilot --model claude-sonnet-4.5
copilot --model gpt-5.1-codex
```

### Test Interactive Commands

```bash
copilot
# Then try:
/help           # List all commands
/context        # Check context usage
/model          # Switch models
/mcp show       # Display MCP servers
/skills list    # List available skills
```

### Verify MCP Configuration

```bash
# Check config file exists
cat ~/.copilot/mcp-config.json

# List configured servers in session
copilot
/mcp show
```

---

## CLI vs VS Code Comparison

| Capability | `copilot` CLI | VS Code |
|------------|---------------|---------|
| **Agent Mode** | ✅ GA | ✅ GA |
| **MCP Integration** | ✅ GA | ✅ GA |
| **Skills** | ✅ GA | Early Preview |
| **Session Resume** | ✅ GA | N/A |
| **Context Management** | ✅ GA | N/A |
| **Model Selection** | ✅ GA (14 models) | ✅ GA |
| **Custom Instructions** | ✅ GA (AGENTS.md) | ✅ GA (.github/) |
| **Slash Commands** | Via `/command` | ✅ GA |
| **GUI/Panel** | N/A | ✅ |

**Recommendation**: For full agentic capabilities, use the standalone `copilot` CLI. For integrated IDE experience with code completion, use VS Code.

---

## Important: `copilot` vs `gh copilot`

These are **two different tools**:

| Aspect | `copilot` (Standalone) | `gh copilot` (Extension) |
|--------|------------------------|--------------------------|
| **Type** | Full agentic assistant | GitHub CLI extension |
| **MCP Support** | ✅ Yes | ❌ No |
| **Agent Mode** | ✅ Yes | ❌ No |
| **Tool Execution** | ✅ Full | ❌ None |
| **Models** | 14 (Claude, GPT, Gemini) | GPT-4 variants only |
| **Primary Use** | Autonomous coding tasks | Command suggestions |
| **Config Location** | `~/.copilot/` | N/A |

**This document covers the standalone `copilot` CLI only.**

---

## Version Information

| Component | Value |
|-----------|-------|
| **Current Version** | 0.0.382 |
| **Config Directory** | `~/.copilot/` |
| **MCP Config** | `~/.copilot/mcp-config.json` |
| **Session State** | `~/.copilot/session-state/` |
| **Logs** | `~/.copilot/logs/` |

---

## Related Documentation

- **[CLI-TOOLS-COMPARISON.md](./CLI-TOOLS-COMPARISON.md)** — Detailed `copilot` vs `gh copilot` comparison
- **[AGENTS-AND-WORKFLOWS.md](./AGENTS-AND-WORKFLOWS.md)** — Agent Mode best practices
- **[COMMANDS-AND-CUSTOM-INSTRUCTIONS.md](./COMMANDS-AND-CUSTOM-INSTRUCTIONS.md)** — Custom instructions reference
- **Model Guides**:
  - [MODEL-OPTIMIZATION-GPT-4-1.md](./MODEL-OPTIMIZATION-GPT-4-1.md) — GPT-4.1 (1M context, free)
  - [MODEL-OPTIMIZATION-GPT-5-MINI.md](./MODEL-OPTIMIZATION-GPT-5-MINI.md) — GPT-5 Mini (free)
  - [MODEL-OPTIMIZATION-GPT-5-1-CODEX.md](./MODEL-OPTIMIZATION-GPT-5-1-CODEX.md) — Codex models

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-20 | Initial creation from verified local testing |

---

**Maintainer**: Project documentation team
**Verification Method**: Local CLI testing (`copilot --help`, `copilot --version`)
