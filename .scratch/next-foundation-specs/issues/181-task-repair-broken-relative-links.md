# 181. Task: repair the broken relative links

Type: task
Status: open
Blocked by: 180
Labels: wayfinder:task
Map: ../map.md

## Question

Which relative links in the bundle do not resolve, and what do they become, so the bundle moves to the new repository with a working trail?

A sweep on 2026-09-30 found about 800 relative links in `issues/`, `audits/`, and `research/` that do not resolve from the file they sit in; none in `specs/`, `adr/`, `README.md`, `building-blocks.md`, `CONTEXT.md`, `architecture-guide.md`, or `storybook-conventions.md`. Most sit inside a ticket's quoted proposal or gist line, written for the document the text goes into, which [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) ruled is the bundle's form ("the bundle quotes text in the form of the document it goes into"); those stay. The rest are real breaks, for example `issues/75-evidence-aria-fallback-confirmation.md` linking `issues/33-spec-orbit.md` from inside `issues/`.

## How to work it

Opus at low effort, AFK, after the consistency review so its new text is swept too. Classify every relative link and heading anchor in every Markdown file of the bundle: it resolves from its own file; it sits in quoted text for another document and resolves from that document (kept); it is a placeholder or example (`...`, `link`, `issues/<number>-<slug>.md`), which becomes code text; or it is broken, and is repointed to the file it means so it resolves from its own file. A link to a renamed file is repointed to the current name. The captured WebAIM page (`prototypes/slider-vertical-orientation/panel-a11y/webaim10.md`) is a verbatim fetch whose site-root links audit 0007 recorded; it is left as captured. A script under the session scratchpad lists every class with counts, and passes when no link is in the broken class.
