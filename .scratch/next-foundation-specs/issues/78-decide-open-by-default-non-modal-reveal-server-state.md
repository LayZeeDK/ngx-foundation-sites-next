# 78. Decide: the server state of an open-by-default non-modal Reveal's Trigger

Type: grilling
Status: open
Blocked by: 72
Labels: wayfinder:grilling
Map: ../map.md

## Question

Graduated on 2026-09-27 from follow-up 1 of [Decide: `aria-expanded` on a modal dialog's opener](72-decide-aria-expanded-on-modal-opener.md). A Reveal with `[overlay]="false"` and `[isOpen]="true"` ships its Trigger with `aria-expanded="true"` next to a `<dialog>` the server keeps closed (the [Spec: Reveal](18-spec-reveal.md) binds nothing to `open`), until hydration and permanently without JavaScript, so the Trigger announces a state the page does not have. What does the Reveal spec do about it? The candidates the decision ticket named: (a) the Reveal exposes to its Triggers an open state that reads `false` until the dialog has been shown, separate from the `isOpen` model (check what that needs from the `NfsOpenable` contract in the [Spec: Triggers (shared utility)](54-spec-triggers.md), whose Openables provide `nfsOpenableToken` with `useExisting` and whose `isOpen` member is the Openable's own signal); (b) the spec documents the pre-hydration mismatch in its Rendered HTML and SSR smoke; and any better option the sources support, for example rendering the non-modal dialog open on the server (a `<dialog open>` is a non-modal shown dialog; check what `show()`, `showModal()`, and hydration do with an element that already has `open`, and how a later `close()` interacts with a bound attribute).

The user ruled that this pass resolves everything autonomously. Rate the item under the map's triage rule; if it lands in the trap quadrant, the orchestrator runs a panel, otherwise decide it here.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides, with one pass arguing against your own first answer) against the HTML standard's dialog section, the Angular hydration and event-replay sources, the Triggers and Reveal specs, ADR 0007, ADR 0031, ADR 0036, and the Reveal dialog prototype's capture. Measure what a candidate needs in Chromium, Firefox, and WebKit if the sources do not settle it (a throwaway page under `D:/tmp/nfs-decision-reveal-open/`, ports 4800-4809). Edit `specs/reveal.md` (and `specs/triggers.md` only if the decision changes the Openable contract) in place, append the Answer here with the decision, the evidence, the dissent from your adversarial pass, `### Triage`, and the exact changes made, and add a dated amendment to the Reveal and, if touched, the Triggers spec tickets. Never edit `map.md`, `building-blocks.md`, `README.md`, or ADRs; never commit.
