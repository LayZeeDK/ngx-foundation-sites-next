# GitHub Copilot Tools Comparison

**Created:** 2026-01-11
**Purpose:** Clarify the difference between two different "GitHub Copilot CLI" tools

---

## Critical Distinction

GitHub provides **TWO different command-line tools** that are both called "GitHub Copilot CLI":

1. **`gh copilot`** - GitHub CLI Extension (limited)
2. **`copilot`** - Standalone Agentic CLI (full-featured)

These are **completely different tools** with vastly different capabilities.

---

## Feature Comparison Matrix

| Feature | `gh copilot` | `copilot` |
|---------|-------------|-----------|
| **Full Name** | GitHub Copilot for GitHub CLI | GitHub Copilot CLI (Standalone) |
| **Installation** | `gh extension install github/gh-copilot` | Separate installation |
| **Version** | v1.1.1 (2025-06-17) | v0.0.377 (latest) |
| **Primary Purpose** | Command suggestions/explanations | Full agentic coding assistant |
| **MCP Support** | ❌ NO | ✅ YES |
| **Agent Mode** | ❌ NO | ✅ YES |
| **Multi-Model** | ❌ NO (GPT-4 only) | ✅ YES (Claude, GPT, Gemini) |
| **Tool Execution** | ❌ NO | ✅ YES (file, shell, git, MCP) |
| **Interactive Mode** | ❌ NO | ✅ YES |
| **Session Management** | ❌ NO | ✅ YES |
| **Custom Instructions** | ❌ NO | ✅ YES (AGENTS.md) |
| **Config File** | ❌ None | ✅ ~/.copilot/ |
| **Security Controls** | ❌ Minimal | ✅ Comprehensive |
| **Use Case** | Quick command help | Full development workflows |

---

## Tool 1: `gh copilot` (GitHub CLI Extension)

### What It Is
A simple GitHub CLI extension that provides command suggestions and explanations.

### Installation
```bash
gh extension install github/gh-copilot
```

### Available Commands
```bash
gh copilot suggest   # Suggest shell commands
gh copilot explain   # Explain commands
gh copilot config    # Configure options
gh copilot alias     # Generate shell aliases
```

### Example Usage
```bash
# Get command suggestion
$ gh copilot suggest "git command to undo last commit"
Suggestion: git reset --soft HEAD~1

# Explain a command
$ gh copilot explain "docker run -it ubuntu bash"
Explanation: Runs Ubuntu container interactively with bash shell...
```

### Limitations
- ❌ No MCP server support
- ❌ No autonomous agent capabilities
- ❌ No file operations
- ❌ No session management
- ❌ Single-turn interactions only
- ❌ No custom instructions
- ❌ Limited model selection

### When to Use
- Quick command suggestions
- Command explanations
- Simple one-off queries
- You already use GitHub CLI for other tasks

---

## Tool 2: `copilot` (Standalone CLI)

### What It Is
A full-featured agentic AI coding assistant that can autonomously perform multi-step development tasks.

### Installation
Separate installation (via VS Code extension or standalone installer)

### Check Version
```bash
copilot --version
# Output: 0.0.377
```

### Available Models
**14 models to choose from:**
- Claude: Sonnet 4.5, Haiku 4.5, Opus 4.5, Sonnet 4
- GPT: 5.2, 5.1, 5, 5.1-codex-max, 5.1-codex, 5.1-codex-mini, 5-mini, 4.1
- Gemini: 3 Pro Preview

### Core Capabilities

#### 1. Agent Mode (Interactive & Non-Interactive)
```bash
# Start interactive session
copilot

# Execute prompt and auto-approve
copilot -p "Fix the bug in main.js" --allow-all-tools

# Resume most recent session
copilot --continue

# Resume with session picker
copilot --resume
```

#### 2. MCP (Model Context Protocol) Integration
```bash
# Configure MCP servers in ~/.copilot/mcp-config.json
{
  "mcpServers": {
    "my-server": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@my/mcp-server"],
      "tools": ["*"]
    }
  }
}

# Use with additional MCP config
copilot --additional-mcp-config @/path/to/extra-mcp.json

# Disable specific MCP server
copilot --disable-mcp-server my-server

# Enable all GitHub MCP tools
copilot --enable-all-github-mcp-tools
```

#### 3. Tool Execution
The agent can:
- ✅ Read files
- ✅ Write files
- ✅ Execute shell commands
- ✅ Run git operations
- ✅ Call MCP server tools
- ✅ Fetch from URLs

#### 4. Security Controls
```bash
# Allow specific directories
copilot --add-dir ~/projects

# Allow all paths
copilot --allow-all-paths

# Allow/deny specific tools
copilot --allow-tool 'read' --allow-tool 'write'
copilot --deny-tool 'shell(rm *)'

# Allow/deny URLs
copilot --allow-url github.com
copilot --deny-url malicious-site.com
```

#### 5. Model Selection
```bash
# Use Claude Sonnet 4.5
copilot --model claude-sonnet-4.5

# Use GPT-5.1 Codex
copilot --model gpt-5.1-codex

# Use Gemini
copilot --model gemini-3-pro-preview
```

#### 6. Custom Instructions
```bash
# Loads from AGENTS.md in project
copilot

# Use specific custom agent
copilot --agent my-agent

# Disable custom instructions
copilot --no-custom-instructions
```

### Configuration Files
```
~/.copilot/
├── config.json              # Main configuration
├── mcp-config.json          # MCP server configurations
├── session-state/           # Session history
├── command-history-state.json  # Command history
└── logs/                    # Debug logs
```

### Example config.json
```json
{
  "model": "gpt-5-mini",
  "banner": "never",
  "render_markdown": true,
  "trusted_folders": [
    "/path/to/project1",
    "/path/to/project2"
  ],
  "allowed_urls": [
    "https://docs.anthropic.com",
    "https://platform.openai.com"
  ]
}
```

### Example Workflows

#### Workflow 1: Fix a Bug
```bash
$ copilot -i "Fix the authentication bug in login.ts"

# Agent will:
1. Read login.ts
2. Analyze the code
3. Identify the bug
4. Propose a fix
5. Ask permission to apply
6. Apply the fix
7. Run tests (if configured)
```

#### Workflow 2: Multi-File Refactoring
```bash
$ copilot --allow-all-tools -p "Refactor user service to use async/await"

# Agent will:
1. Scan all related files
2. Identify callback patterns
3. Convert to async/await
4. Update calling code
5. Update tests
6. Report changes
```

#### Workflow 3: Use MCP Server Tools
```bash
$ copilot -i "Use the Angular CLI to generate a new component called UserProfile"

# If angular-cli MCP server is configured:
1. Agent calls MCP tool to run ng generate
2. Component is created with proper structure
3. Agent reports what was created
```

### When to Use
- ✅ Multi-step development tasks
- ✅ Autonomous code refactoring
- ✅ Complex debugging workflows
- ✅ Using MCP server integrations
- ✅ Session-based development
- ✅ Projects with custom instructions (AGENTS.md)

---

## Which Tool Should You Use?

### Use `gh copilot` Extension If:
- You need quick command suggestions
- You want command explanations
- You already use GitHub CLI
- You don't need autonomous execution
- Simple one-off queries

### Use `copilot` Standalone CLI If:
- ✅ **You need autonomous agent capabilities** (RECOMMENDED)
- ✅ **You want MCP server integration** (RECOMMENDED)
- ✅ **You have custom instructions (AGENTS.md)** (RECOMMENDED)
- ✅ **You want multi-model support** (RECOMMENDED)
- ✅ **You need session management** (RECOMMENDED)
- ✅ **You want tool execution** (RECOMMENDED)
- ✅ **You do complex multi-step development** (RECOMMENDED)

---

## Verification Error Explanation

### What Happened
In the initial verification, I tested **`gh copilot`** (GitHub CLI extension) instead of **`copilot`** (standalone CLI).

This led to completely incorrect conclusions:
- ❌ Incorrectly concluded MCP was "not available"
- ❌ Incorrectly concluded Agent Mode was "not available"
- ❌ Incorrectly marked features as "beta" when they're production-ready in standalone CLI

### Why the Confusion
Both tools can be referred to as "GitHub Copilot CLI" in documentation, leading to ambiguity about which tool is being discussed.

### Corrected Understanding
The user was correctly using the **standalone `copilot` CLI** (v0.0.377) with:
- ✅ 6 configured MCP servers
- ✅ Full Agent Mode capabilities
- ✅ Multi-model support
- ✅ Custom instructions via AGENTS.md

**All features are production-ready and available.**

---

## Quick Reference

### Check Which Tool You Have

```bash
# GitHub CLI extension
$ gh copilot --version
version 1.1.1 (2025-06-17)

# Standalone CLI
$ copilot --version
0.0.377
Commit: 4a0b36b
```

### Find Installation Location

```bash
# GitHub CLI extension
$ gh extension list | grep copilot
gh copilot  github/gh-copilot  v1.1.1

# Standalone CLI
$ where copilot  # Windows
$ which copilot  # macOS/Linux
```

### Check Configuration

```bash
# GitHub CLI extension
# No configuration file

# Standalone CLI
$ ls ~/.copilot/
config.json  mcp-config.json  session-state/  logs/
```

---

## Migration: gh copilot → copilot

If you're currently using `gh copilot` and want the full features of the standalone `copilot` CLI:

### Step 1: Check if Already Installed
```bash
copilot --version
```

If not installed, install from VS Code or standalone installer.

### Step 2: Configure MCP Servers
Create `~/.copilot/mcp-config.json`:
```json
{
  "mcpServers": {
    "example": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "tools": ["*"]
    }
  }
}
```

### Step 3: Configure Settings
Create `~/.copilot/config.json`:
```json
{
  "model": "gpt-5-mini",
  "trusted_folders": ["/path/to/projects"],
  "allowed_urls": ["https://docs.example.com"]
}
```

### Step 4: Start Using
```bash
# Instead of: gh copilot suggest "command"
# Use: copilot -i "suggest a command to..."

# Instead of: gh copilot explain "command"
# Use: copilot -i "explain this command: ..."
```

---

## Summary

| Aspect | `gh copilot` | `copilot` |
|--------|-------------|-----------|
| **Complexity** | Simple | Advanced |
| **Setup** | Easy | Requires configuration |
| **Features** | Limited | Comprehensive |
| **Use Case** | Quick help | Full development |
| **MCP** | ❌ NO | ✅ YES |
| **Agent Mode** | ❌ NO | ✅ YES |
| **Recommended For** | Beginners | Power users |

**Bottom Line:**
- Use `gh copilot` for simple command suggestions
- Use `copilot` (standalone) for serious development work with MCP, Agent Mode, and multi-model support

**Your Current Setup:**
- ✅ Using `copilot` standalone CLI (correct choice for your needs)
- ✅ 6 MCP servers configured
- ✅ Full Agent Mode capabilities
- ✅ Production-ready setup
