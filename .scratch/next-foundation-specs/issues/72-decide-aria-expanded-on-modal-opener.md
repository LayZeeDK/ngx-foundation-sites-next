# 72. Decide: `aria-expanded` on a modal dialog's opener

Type: grilling
Status: open
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

Should a Trigger that opens a modal dialog (a modal Reveal, a modal Off-canvas panel, a Dropdown pane with `role="dialog"` and `trapFocus`) render `aria-expanded`? The [Spec: Triggers (shared utility)](54-spec-triggers.md) renders it on every `dialog`-role Trigger (its decision 18) and left the point OPEN FOR HUMAN in the trap quadrant (building-blocks Part 4, OPEN FOR HUMAN item 1): HIGH impact because the Trigger role union is a public contract every Openable inherits, NOT-HIGH confidence because the sources disagree. The alternative is a fifth role value (or a modal flag on the `dialog` role) that omits `aria-expanded` on modal openers, matching Foundation and the APG's modal dialog examples, while non-modal dialogs keep it.

Decide it with the panel the map's "Open-decision pass" note prescribes: an evidence dossier, four panelists (Opus and Fable, two adversarial), and a judge. The decision must say exactly what the Triggers spec, the three Openable specs, building-blocks 1.8 and Part 4, and the README open list change to.

## How to work it

The orchestrator runs the panel. The evidence dossier goes to `research/decision-aria-expanded-modal-opener.md`: WAI-ARIA 1.2 and 1.3 draft text on `aria-expanded` and `aria-haspopup="dialog"`; the APG modal dialog examples and any APG guidance on openers; ARIA in HTML; the Foundation 6.9 source for Reveal, Off-canvas, and Dropdown openers; what Angular Material, CDK Dialog, and other major design systems (for example GOV.UK, USWDS, Adobe Spectrum, GitHub Primer, Radix) render on modal openers; published screen-reader support data (a11ysupport.io, PowerMapper) and expert writing on announcing `aria-expanded` for a control whose popup takes focus and makes the rest inert; and the effort's own evidence (the Triggers spec decisions 16 to 20, the Reveal and Off-canvas specs, their prototypes). The judge writes the `## Answer` here.
