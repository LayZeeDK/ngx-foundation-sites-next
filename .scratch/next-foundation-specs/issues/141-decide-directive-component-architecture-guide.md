# 141. Decide: the directive and component architecture guide

Type: grilling
Status: open
Blocked by: 140
Labels: wayfinder:grilling
Map: ../map.md

## Question

What guide of directive and component architecture principles does the library adopt, written from the three findings files of [Research: directive and component architecture principles for Angular UI libraries](140-research-directive-component-architecture-principles.md), which test the user's draft ([research/architecture-principles-user-draft.md](../research/architecture-principles-user-draft.md))?

## How to work it

1. An author (Fable 5.1: this ticket makes cross-cutting API-design calls) writes `architecture-guide.md` at the effort root: the principles, the layers, the decision framework, each principle with its rationale, a preferred and an avoided example in this library's `nfs` names, and its sources. Every principle is testable: an auditor can say of a spec whether it meets it.
2. Precedence: the user's rulings recorded in the map's Notes, the ADRs, and building-blocks outrank the draft. The user added the same day that Microsoft Copilot generated the draft with little to no research: it is a list of candidate principles and questions to test, with no weight of its own, and a principle enters the guide only on the research's evidence. Keeping, qualifying, or dropping a draft principle needs no more justification than the evidence gives; the draft's wording is not a default. Where the research argues that a recorded decision should change, the guide keeps the decision, states the conflict, and the Answer rates it under the map's triage rule; a HIGH impact change without HIGH confidence goes to the user as OPEN FOR HUMAN. Where the draft conflicts with a recorded decision, the recorded decision wins and the guide says so.
3. A critic (Opus 5.5, adversarial) reviews the draft guide against the research, the ADRs, and a sample of five published specs, looking for principles that are untestable, contradict each other, contradict a recorded decision, or would force a change the evidence does not support. The author answers each point and revises.
4. Answer: the guide's path, the critic's points and their resolution, the conflicts with their triage, the shared-file changes (the map's Notes gain the guide's precedence line; README lists the guide), and the map's gist line.
