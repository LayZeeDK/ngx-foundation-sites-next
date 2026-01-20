# GitHub Copilot Feature Verification Plan

**Created:** 2026-01-11
**Updated:** 2026-01-20
**Purpose:** Verify availability of GitHub Copilot beta features

---

## Overview

This plan provides step-by-step instructions to verify which GitHub Copilot features are currently available in your environment.

> **📘 Looking for Claude Code feature verification?**
> See [`../claude-prompt-engineering/FEATURES-AND-AVAILABILITY.md`](../claude-prompt-engineering/FEATURES-AND-AVAILABILITY.md)

### Features to Verify

| Tool               | Feature             | Expected Status       |
| ------------------ | ------------------- | --------------------- |
| **GitHub Copilot** | Agent Mode with MCP | ⚠️ Beta (Rolling out) |
| **GitHub Copilot** | MCP Integration     | ⚠️ Preview            |
| **GitHub Copilot** | Agent Skills        | ⚠️ Early Preview      |
| **GitHub Copilot** | CLI Custom Commands | ❌ Not Yet Available  |

---

## GitHub Copilot Verification

### 2.1 Check GitHub Copilot Installation

**Objective:** Verify Copilot is installed and subscription is active

**VS Code Steps:**

1. **Check extension:**
   - Open VS Code
   - Click Extensions (Ctrl+Shift+X)
   - Search for "GitHub Copilot"
   - Verify installed and enabled

2. **Check subscription:**
   - Open Command Palette (Ctrl+Shift+P)
   - Type: `GitHub Copilot: Check Status`
   - Verify active subscription

3. **Check version:**
   - In Extensions, click GitHub Copilot
   - Note version number
   - Compare with latest: https://marketplace.visualstudio.com/items?itemName=GitHub.copilot

**CLI Steps:**

```bash
# Check if CLI is installed
copilot --version

# Authenticate
copilot auth status
```

**✅ Success Criteria:**

- Extension installed and active
- Subscription valid
- CLI accessible

**❌ If Failed:**

- Install extension from VS Code Marketplace
- Check subscription: https://github.com/settings/copilot

---

### 2.2 Test Agent Mode Availability

**Objective:** Determine if Agent Mode with MCP is available

**⚠️ Expected Status:** Beta - may not be available to all users

**Test Steps:**

1. **Check VS Code settings:**
   - Open Settings (Ctrl+,)
   - Search: "Copilot Agent"
   - Look for: `github.copilot.agent.enabled`

2. **Check for Agent Mode UI:**
   - Open Copilot Chat panel
   - Look for "Agent Mode" toggle or option
   - Check for autonomous task execution features

3. **Test Agent Mode capabilities:**

   ```
   In Copilot Chat, try:
   "Use agent mode to analyze all TypeScript files and report type errors"
   ```

4. **Check for MCP indicators:**
   - Settings search: "MCP" or "Model Context Protocol"
   - Look for MCP server configuration options

**Expected Output (if available):**

- Agent Mode setting visible
- Can toggle Agent Mode on/off
- Multi-file editing capabilities
- MCP configuration options present

**Expected Output (if not available):**

- No Agent Mode settings
- Standard single-turn chat only
- No MCP configuration options

**✅ Success Criteria (Beta Available):** Agent Mode toggle exists and can be enabled

**⚠️ Expected Result:** Likely NOT available yet - rolling out gradually

**Documentation:**

- Screenshot settings panel
- Note version number
- Record enabled/disabled state

---

### 2.3 Test MCP Integration

**Objective:** Check if MCP server support is available

**⚠️ Expected Status:** Preview - may require early access

**Test Steps:**

1. **Check for MCP configuration file support:**

   ```bash
   # Create test MCP config
   mkdir -p .github
   cat > .github/copilot-mcp-config.json << 'EOF'
   {
     "servers": []
   }
   EOF
   ```

2. **Check VS Code settings:**
   - Settings search: "copilot mcp"
   - Look for MCP server configuration UI

3. **Check extension features:**
   - GitHub Copilot extension details
   - Look for "MCP Support" in changelog or features

4. **Test MCP tool availability:**
   ```
   In Copilot Chat:
   "What MCP tools are available?"
   "Can you use MCP to [perform some task]?"
   ```

**Expected Output (if available):**

- MCP settings panel exists
- Can configure MCP servers
- Copilot acknowledges MCP tools

**Expected Output (if not available):**

- No MCP configuration UI
- Copilot doesn't recognize MCP references

**✅ Success Criteria (Preview Available):** MCP configuration options exist

**⚠️ Expected Result:** Likely NOT available - requires preview access

---

### 2.4 Test Agent Skills Feature

**Objective:** Check if Agent Skills (reusable workflows) are supported

**⚠️ Expected Status:** Early Preview - very likely not available

**Test Steps:**

1. **Check for skills directory support:**

   ```bash
   # Create test skills directory
   mkdir -p .github/copilot-skills
   ```

2. **Create test skill configuration:**

   ```bash
   cat > .github/copilot-skills/test-skill.yml << 'EOF'
   name: test-skill
   description: Test skill for verification
   triggers:
     - keywords: ["test skill"]
   steps:
     - name: Test step
       action: respond
       message: "Skills are available"
   EOF
   ```

3. **Test in Copilot Chat:**

   ```
   "test skill"
   or
   "Use the test-skill"
   ```

4. **Check Copilot changelog:**
   - Visit: https://github.blog/changelog/
   - Search for: "Agent Skills"
   - Check announced availability date

**Expected Output (if available):**

- Skill configuration is recognized
- Can trigger skills via keywords
- Skill execution feedback

**Expected Output (if not available):**

- Configuration files ignored
- No skill execution
- No documentation in settings

**✅ Success Criteria (Preview Available):** Skills can be configured and triggered

**⚠️ Expected Result:** Almost certainly NOT available - very early preview

---

### 2.5 Test CLI Custom Commands

**Objective:** Verify if CLI supports custom commands from `.github/prompts/`

**⚠️ Expected Status:** Not Yet Available - feature request pending

**Test Steps:**

1. **Create custom prompt file:**

   ```bash
   mkdir -p .github/prompts
   cat > .github/prompts/test-command.prompt.md << 'EOF'
   ---
   name: test-command
   description: Test custom command
   ---

   # Test Command

   Respond with: "Custom CLI commands are working!"
   EOF
   ```

2. **Test in CLI:**

   ```bash
   # Try to use custom command
   copilot suggest "use /test-command"

   # Or in chat mode
   copilot chat
   # Then type: /test-command
   ```

3. **Check available commands:**

   ```bash
   copilot --help
   # Look for custom command listing
   ```

4. **Check feature request status:**
   - Visit: https://github.com/github/copilot-cli/issues/618
   - Check for updates on custom command support

**Expected Output (if available):**

- Custom command appears in CLI
- Can invoke with `/test-command`
- Executes as defined

**Expected Output (if not available):**

- Custom commands not recognized
- Only built-in commands work
- No custom command listing

**✅ Success Criteria (Available):** Custom commands work in CLI

**⚠️ Expected Result:** NOT available - still in development per Issue #618

**Note:** Custom commands SHOULD work in VS Code extension, just not CLI

---

### 2.6 Test Built-in Commands (Baseline)

**Objective:** Verify standard Copilot commands work (non-beta)

**Test Commands:**

In Copilot Chat, test these built-in commands on sample code:

1. **`/explain`** - Select code, run `/explain`
2. **`/fix`** - Select code with error, run `/fix`
3. **`/tests`** - Select function, run `/tests`
4. **`/doc`** - Select function, run `/doc`
5. **`/optimize`** - Select code, run `/optimize`

**Expected Output:**

- All commands execute successfully
- Appropriate responses for each command

**✅ Success Criteria:** All 5 commands work correctly

**❌ If Failed:** Copilot installation may be broken - reinstall extension

---

### 2.7 Test Custom Instructions (VS Code)

**Objective:** Verify custom instructions file support (should be available)

**Test Steps:**

1. **Create custom instructions:**

   ```bash
   mkdir -p .github
   cat > .github/copilot-instructions.md << 'EOF'
   # Test Custom Instructions

   When asked "What are the project instructions?", respond with:
   "✅ Custom instructions are working!"

   Always use TypeScript strict mode.
   EOF
   ```

2. **Enable in VS Code:**
   - Settings → "GitHub Copilot"
   - Find: "Enable custom instructions"
   - Enable the setting
   - Reload VS Code

3. **Test in Copilot Chat:**
   ```
   "What are the project instructions?"
   ```

**Expected Output:**

- Copilot references custom instructions
- Responds with confirmation message

**✅ Success Criteria:** Custom instructions are applied

**❌ If Failed:**

- Check file location (.github/copilot-instructions.md)
- Verify setting is enabled
- Restart VS Code

---

## Part 3: Documentation and Reporting

### 3.1 Document Findings

**Create a results document:**

```bash
cat > prompt-engineering/BETA-FEATURE-AVAILABILITY.md << 'EOF'
# Beta Feature Availability Report

**Test Date:** [DATE]
**Environment:** [Windows/macOS/Linux]
**Claude Code Version:** [VERSION]
**GitHub Copilot Extension Version:** [VERSION]
**GitHub Copilot CLI Version:** [VERSION]

---

## Claude Code Features

| Feature | Status | Notes |
|---------|--------|-------|
| Skills | ✅/❌ | [Notes] |
| Custom Commands | ✅/❌ | [Notes] |
| Context Management | ✅/❌ | [Notes] |

---

## GitHub Copilot Features

| Feature | Status | Notes |
|---------|--------|-------|
| Built-in Commands | ✅/❌ | [Notes] |
| Custom Instructions (VS Code) | ✅/❌ | [Notes] |
| Agent Mode | ✅/❌ | [Notes] |
| MCP Integration | ✅/❌ | [Notes] |
| Agent Skills | ✅/❌ | [Notes] |
| CLI Custom Commands | ✅/❌ | [Notes] |

---

## Recommendations

Based on availability:

### Use Immediately
- [List available features]

### Wait for GA
- [List unavailable beta features]

### Request Access
- [List preview features with access request links]

EOF
```

---

### 3.2 Update Optimization Guides

**Objective:** Update guides based on actual availability

**If features are available:**

```bash
# Update the relevant guide
# Example: If Agent Mode is available, remove beta warning
```

**If features are NOT available:**

- Keep beta warnings in place
- Add your test date to the warning
- Note when to re-check (e.g., quarterly)

---

## Appendix: Quick Reference

### Claude Code Commands to Test

```bash
/help          # List all commands
/context       # Check token usage
/compact       # Optimize context
/[custom]      # Your custom commands
```

### GitHub Copilot Commands to Test

```
/explain       # Explain code
/fix           # Fix errors
/tests         # Generate tests
/doc           # Generate docs
/optimize      # Optimize code
```

### Key URLs

- **Claude Code Docs:** https://code.claude.com/docs/
- **Copilot Changelog:** https://github.blog/changelog/
- **Copilot Issues:** https://github.com/github/copilot-cli/issues/618
- **Your Copilot Settings:** https://github.com/settings/copilot

---

## Expected Timeline for Beta Features

Based on announcement dates and typical rollout schedules:

| Feature             | Announced | Expected GA | Check Again |
| ------------------- | --------- | ----------- | ----------- |
| Agent Mode          | Late 2025 | Q1-Q2 2026  | Monthly     |
| MCP Integration     | Late 2025 | Q2 2026     | Monthly     |
| Agent Skills        | Dec 2025  | Q2-Q3 2026  | Quarterly   |
| CLI Custom Commands | Requested | TBD         | Quarterly   |

**Recommendation:** Re-run this verification plan quarterly to catch new rollouts.

---

## Notes

- Beta features may be rolled out gradually (A/B testing, org-based, etc.)
- Availability may depend on:
  - Subscription tier (Individual/Business/Enterprise)
  - Organization settings
  - Geographic region
  - Early access program enrollment
- Some features may require opting in via GitHub settings

**Check enrollment:** https://github.com/settings/copilot (look for "Beta features" section)
