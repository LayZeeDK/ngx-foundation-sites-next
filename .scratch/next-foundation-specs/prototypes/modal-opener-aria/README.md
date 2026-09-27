# Modal opener ARIA: decisive files

Question: should a Trigger that opens a modal dialog (a modal Reveal with `overlay: true`, a modal Off-canvas panel, a `role="dialog"` Dropdown pane) render `aria-expanded`? Decided by [Decide: `aria-expanded` on a modal dialog's opener](../../issues/72-decide-aria-expanded-on-modal-opener.md).

## What this holds

The runnable workspaces stayed under `D:/tmp/` (`nfs-decision-aria-expanded/`, `nfs-panel-72-a11y/`, `nfs-panel-72-vsdefault/`, `nfs-panel-72-api/`); this folder keeps only the files the ticket's Why section cites as "verified", except the fetched `html-aam.html` and `aria2354.txt` of Why item 5 and the Chromium tree output behind Why item 1's `ignored=true (activeModalDialog)` (its values are in the dossier's section 2.4 table), which stay under `D:/tmp/` only, renamed into the sub-folders below (the `D:/tmp/` folder each file came from names the sub-folder). `events-chromium.txt` and `events-firefox.txt` were sanitized to ASCII (en/em dash and the Danish characters in a captured Chrome translate-bar string, from a Danish-locale Windows session, transliterated: `ae`, `a`, `o`).

- `case-a-modal-dialog/` (from `D:/tmp/nfs-decision-aria-expanded/`): `out-uia-chromium.txt`, `out-uia-firefox.txt` (the Windows UI Automation tree of the modal opener case, case A), `events-chromium.txt`, `events-firefox.txt` (accessibility event log while the dialog opens and closes).
- `panel-a11y/` (from `D:/tmp/nfs-panel-72-a11y/`): `out-measure.json` (Chromium's accessibility tree for cases I and J), `out-uia-chromium.txt`, `out-uia-firefox.txt` (the UI Automation trees for the same cases).
- `panel-vsdefault/` (from `D:/tmp/nfs-panel-72-vsdefault/`): `out-measure2-chromium.json`, `out-uia2-firefox.txt` (the vsdefault lens's Off-canvas Modal-mode probe: cases I to L in Chromium's tree, J and I in Firefox's UI Automation tree; in case J a Trigger outside `.off-canvas-content` keeps `expanded=true` while the content is inert, and in cases K and L the Trigger is exposed at 100 ms, before the content is inert, and ignored at 1200 ms; the Reveal with `[isOpen]="true"` server-rendered closed is case J under `panel-a11y/`).
- `panel-api/` (from `D:/tmp/nfs-panel-72-api/`): `tsconfig.json` (strict) plus `widen.ts`, `narrow.ts`, `deprecate.ts`, `b2-silent.ts`, `b1-forward.ts`, the five reversibility compile probes for `NfsTriggerRole`.

## How it was produced

- The UIA and MSAA outputs were captured with a Windows UI Automation client (`AxProbe.cs`/`uia-run.mjs`, not captured here) reading a probe page (`probe.html`, not captured here) served locally while Chromium and Firefox opened and closed the dialog case.
- The Chromium accessibility snapshots (`out-measure.json`, `out-measure2-chromium.json`) came from `measure.mjs`/`measure2.mjs` over the Chrome DevTools Protocol accessibility tree (not captured here).
- The compile probes were run with `tsc -p tsconfig.json` (strict) from the `panel-api/` folder; each file's expected pass or fail is stated in the ticket's Why item 4.
- Re-running needs the `D:/tmp/` workspaces named above; the drivers and probe pages are not captured, so this folder records outputs only.

## Verdict

The Trigger role union gains a fifth value, `modal-dialog` (`aria-haspopup="dialog"` and `aria-controls`, no `aria-expanded`), reported only where the platform makes every Trigger outside the Openable inert while it is open (a Reveal with `overlay: true`, and, after [Resolve the assistive-technology checks](../../issues/77-evidence-assistive-technology-checks.md)'s Modal inert set, an Off-canvas panel in Modal mode too); a non-modal Reveal and a `role="dialog"` Dropdown pane keep `dialog` with `aria-expanded`. Full reasoning, dissent, and Triage: [Decide: `aria-expanded` on a modal dialog's opener](../../issues/72-decide-aria-expanded-on-modal-opener.md).
