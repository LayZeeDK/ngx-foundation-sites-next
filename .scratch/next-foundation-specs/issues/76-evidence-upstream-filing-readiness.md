# 76. Upstream filing readiness

Type: research
Status: open
Blocked by: none
Labels: wayfinder:research
Map: ../map.md

## Question

The README open list names ten upstream filings that need the user's confirmation. The user decides whether to file; this ticket makes each one ready to decide in a minute. For each filing: does an issue or pull request already exist upstream (search the repository's issues and pull requests read-only), is the behaviour already fixed or changed on the upstream default branch or the latest release (read the clone's newer branches or the source on GitHub), is the claim still reproducible from the effort's evidence (cite the prototype capture), and what exactly would be filed (a filing-ready title and body in the repository's issue template shape, with a minimal reproduction description). End each with a recommendation: file, comment on an existing issue (link it), or do not file (with the reason), and a confidence rating.

## How to work it

Research only, by a `/research` subagent. Never create, comment on, or react to any upstream issue or pull request; use only read-only `gh` commands (`gh search issues`, `gh api` GET requests) and read-only web fetches. Write the findings and the drafts to `research/upstream-filing-readiness.md` and the `## Answer` here with one line per filing. The orchestrator carries the recommendations into the README's open list, still for the user to confirm.
