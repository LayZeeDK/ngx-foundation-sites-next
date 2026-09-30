# 181. Task: repair the broken relative links

Type: task
Status: resolved
Blocked by: 180
Labels: wayfinder:task
Map: ../map.md

## Question

Which relative links in the bundle do not resolve, and what do they become, so the bundle moves to the new repository with a working trail?

A sweep on 2026-09-30 found about 800 relative links in `issues/`, `audits/`, and `research/` that do not resolve from the file they sit in; none in `specs/`, `adr/`, `README.md`, `building-blocks.md`, `CONTEXT.md`, `architecture-guide.md`, or `storybook-conventions.md`. Most sit inside a ticket's quoted proposal or gist line, written for the document the text goes into, which [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) ruled is the bundle's form ("the bundle quotes text in the form of the document it goes into"); those stay. The rest are real breaks, for example `issues/75-evidence-aria-fallback-confirmation.md` linking `issues/33-spec-orbit.md` from inside `issues/`.

## How to work it

Opus at low effort, AFK, after the consistency review so its new text is swept too. Classify every relative link and heading anchor in every Markdown file of the bundle: it resolves from its own file; it sits in quoted text for another document and resolves from that document (kept); it is a placeholder or example (`...`, `link`, `issues/<number>-<slug>.md`), which becomes code text; or it is broken, and is repointed to the file it means so it resolves from its own file. A link to a renamed file is repointed to the current name. The captured WebAIM page (`prototypes/slider-vertical-orientation/panel-a11y/webaim10.md`) is a verbatim fetch whose site-root links audit 0007 recorded; it is left as captured. A script under the session scratchpad lists every class with counts, and passes when no link is in the broken class.

## Answer

Swept on 2026-09-30: 10,044 relative links and heading anchors outside code, in every Markdown file of the bundle except the captured WebAIM page.

| Class | Before | After |
| --- | --- | --- |
| 1. Resolves from its own file | 9,260 | 9,289 |
| 2. Quoted for another document, resolves from it (kept) | 749 | 751 (one is this ticket's gist line) |
| 3. Placeholder, now code text | 5 | 0 (5 now code text) |
| 4. Broken | 30 | 0 |

The class 2 links: 727 resolve from the bundle root (gist lines for `map.md`, this ticket's included, quoted `README.md`, `building-blocks.md`, and map text), 18 from `adr/` (quoted ADR amendments), and 6 from `issues/` (text audits 0008 and 0009 quote for tickets). The largest share sits in `research/consistency-review-decisions.md` (35), `issues/150-spec-forgotten-import-checks.md` (33), and `audits/0008-class-rule-wave.md` (33).

What the broken ones were:

- A bundle-root path (`issues/NN-...md`) in a ticket's own prose, outside the text it quotes, so it resolved only from the bundle root: 29 links in 14 tickets. Most name the map line or the ticket proposal an instruction points at. Example: `issues/36-consistency-review.md` line 90, "in the lines for the `[Spec: Breakpoint service (shared utility)](issues/53-spec-breakpoint-service.md)`", now `(53-spec-breakpoint-service.md)`. On lines that also carry quoted text (tickets 130, 156, and 157), only the links outside the quotes changed.
- A renamed file: 1. `research/out-of-scope-triage.md` line 92 quotes a map line whose ADR 0039 link used the old name `adr/0039-css-only-components-get-directives.md`; it now reads `adr/0039-directives-manage-every-foundation-class.md` and resolves from the bundle root (class 2).

The placeholders: `[38](...)` in audit 0001 (M7, a quote of a line that no longer reads so) and four `[Spec: Visibility Classes](...)` quotes of old spec text in ticket 104. Each is now code text.

Files changed: `audits/0001-research-wave.md`; `issues/` 36, 75, 83, 94, 104, 113, 115, 117, 130, 143, 144, 156, 157, 162, 163; `research/out-of-scope-triage.md`; this ticket. Only link targets changed, plus the backticks around the placeholders; each file keeps its line endings.

How the script checks: `classify.mjs` (session scratchpad) walks the bundle, skips fenced blocks and inline code, extracts every `[text](target)` without a URL scheme, and resolves the path from the file's folder and the anchor against the target's headings under GitHub's slug rules (duplicates get `-1`, `-2`). Each unresolved link is tried from the bundle root, `specs/`, `adr/`, and `issues/`, and looked up in a decisions file (file, line, link, class, target or replacement) built after reading each sentence; it exits non-zero when any link is broken or has no decision. `apply.mjs` edits the exact string on the recorded line and stops if it is not found the expected number of times. Positive control: a scratch bundle with one link that resolves, one quoted gist-form link with a class 2 decision, one placeholder with a class 3 decision, a link to a missing file, and a link to a missing anchor. The script reported 1, 1, and 1 in the first three classes, flagged both broken links (`missing-file`, `missing-anchor`), and exited 1. On the bundle after the repair it reports no class 4 and no unexplained link, and exits 0.

Seen, not changed: none in the bundle.

### Gist for Decisions so far

- [Task: repair the broken relative links](issues/181-task-repair-broken-relative-links.md) -- of 10,044 relative links, 30 were broken (29 bundle-root paths in a ticket's own prose, one old ADR 0039 name) and now resolve from their own files; five `(...)` placeholders are code text; 751 links in quoted text or gist lines keep the form of the document they go into.
