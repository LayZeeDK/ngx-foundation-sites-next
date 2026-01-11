---
name: spec.taskstoissues
description: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
agent: spec.issues
tools: ['github/github-mcp-server/issue_write']
---

## User Input

```
$ARGUMENTS
```

You must consider the user input before proceeding.

## Task

Convert all tasks in `tasks.md` into GitHub issues, preserving task metadata and respecting repository safety rules.

## Execution Steps

1. **Initialize Context**  
   Run:  
   `./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`  
   Extract:
   - `FEATURE_DIR`
   - `AVAILABLE_DOCS`
   - Path to `tasks.md`  
     All paths must be absolute.

2. **Determine Git Remote**  
   Run:

   ```
   git config --get remote.origin.url
   ```

   - Proceed only if the remote is a GitHub URL.
   - Halt with an error if the remote is missing or not GitHub.

3. **Load Tasks**
   - Read the tasks file from the path provided by the prerequisite script.
   - Parse each task line, extracting:
     - Task ID
     - `[P]` marker
     - `[US#]` story label
     - Description
     - File paths

4. **Create GitHub Issues**  
   For each parsed task:
   - Use the MCP `issue_write` tool to create an issue in the repository matching the Git remote.
   - Issue title:
     ```
     {TaskID}: {Description}
     ```
   - Issue body must include:
     - Original task line
     - Story label (if present)
     - Parallelization notes
     - File paths
     - Any inferred dependencies

5. **Safety Enforcement**
   - Never create issues in a repository that does not match the Git remote.
   - Never proceed if the remote is not GitHub.
   - Stop immediately on any safety violation.

6. **Report**  
   Output:
   - List of created issue numbers or URLs
   - Summary of any skipped tasks
   - Confirmation of the target repository
