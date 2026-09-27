# 78. Decide: the server state of an open-by-default non-modal Reveal's Trigger

Type: grilling
Status: resolved
Blocked by: 72
Labels: wayfinder:grilling
Map: ../map.md

## Question

Graduated on 2026-09-27 from follow-up 1 of [Decide: `aria-expanded` on a modal dialog's opener](72-decide-aria-expanded-on-modal-opener.md). A Reveal with `[overlay]="false"` and `[isOpen]="true"` ships its Trigger with `aria-expanded="true"` next to a `<dialog>` the server keeps closed (the [Spec: Reveal](18-spec-reveal.md) binds nothing to `open`), until hydration and permanently without JavaScript, so the Trigger announces a state the page does not have. What does the Reveal spec do about it? The candidates the decision ticket named: (a) the Reveal exposes to its Triggers an open state that reads `false` until the dialog has been shown, separate from the `isOpen` model (check what that needs from the `NfsOpenable` contract in the [Spec: Triggers (shared utility)](54-spec-triggers.md), whose Openables provide `nfsOpenableToken` with `useExisting` and whose `isOpen` member is the Openable's own signal); (b) the spec documents the pre-hydration mismatch in its Rendered HTML and SSR smoke; and any better option the sources support, for example rendering the non-modal dialog open on the server (a `<dialog open>` is a non-modal shown dialog; check what `show()`, `showModal()`, and hydration do with an element that already has `open`, and how a later `close()` interacts with a bound attribute).

The user ruled that this pass resolves everything autonomously. Rate the item under the map's triage rule; if it lands in the trap quadrant, the orchestrator runs a panel, otherwise decide it here.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides, with one pass arguing against your own first answer) against the HTML standard's dialog section, the Angular hydration and event-replay sources, the Triggers and Reveal specs, ADR 0007, ADR 0031, ADR 0036, and the Reveal dialog prototype's capture. Measure what a candidate needs in Chromium, Firefox, and WebKit if the sources do not settle it (a throwaway page under `D:/tmp/nfs-decision-reveal-open/`, ports 4800-4809). Edit `specs/reveal.md` (and `specs/triggers.md` only if the decision changes the Openable contract) in place, append the Answer here with the decision, the evidence, the dissent from your adversarial pass, `### Triage`, and the exact changes made, and add a dated amendment to the Reveal and, if touched, the Triggers spec tickets. Never edit `map.md`, `building-blocks.md`, `README.md`, or ADRs; never commit.

## Answer

Worked on 2026-09-27 by one agent on Opus 5.5, playing both sides of the grilling and then arguing against its own first answer. Measurements: Chromium 153.0.8010.12, Firefox 155.0, and WebKit 26.6 through Playwright 1.63.0, on Angular 22.2.0 with TypeScript 6.0.3 and Foundation 6.9.0 Sass; cited as "P n" (platform) and "A n" (Angular) from the Measurement section below.

### Decision

Neither routed fix. A non-modal Reveal that is open at its first render is rendered shown: the host binds `[attr.open]` to a value fixed at the first render (`''` when `isOpen` is true and `overlay` is false then, absent otherwise, from a `computed` that reads both untracked, so it never re-evaluates). The server HTML is then the shown non-modal dialog that `show()` would make, and the `dialog`-role Trigger's `aria-expanded="true"` is true from the first paint, with JavaScript and without it. Its first render callback does not call `show()` and emits no `opened`; it places focus as an open does only when nothing else has focus (`body`, or the host after HTML `autofocus` focused it at load), and leaves focus the user put elsewhere before hydration. A modal Reveal keeps its closed server HTML (D17's reason stands for it). The Openable contract does not change, so the [Spec: Triggers (shared utility)](54-spec-triggers.md) is not edited.

### Evidence

1. The defect is real and has a second half. With the spec as it was, the server HTML carries a Trigger at `aria-expanded="true"` beside a `<dialog>` without `open` (A1, three engines), the dialog stays hidden without JavaScript while the Trigger still says expanded (A2), and Chromium's platform tree exposes the Trigger as `expanded: true` while the dialog it names is absent from the tree; Playwright's snapshot agrees in Firefox and WebKit (P6). The second half: a Trigger click before hydration meets a hidden dialog, the dialog appears at hydration, and the replayed `toggle()` closes it at once, so a click meant to open ends closed (A5 `spec` variant, three engines; Angular replays after `appRef.whenStable()`, `packages/core/src/hydration/event_replay.ts:160-175`, after the first render callbacks).
2. The effort's own rules ask for the shown dialog. Building-blocks 1.11 decision 1 ("Server output is the first paint") and decision 2 ("Open-at-first-paint content renders on the server"); ADR 0008 rejected Aria's deferred content because an open-by-default panel "would be empty for crawlers and no-JS users and pop in after hydration"; the Triggers spec requires every Openable to "keep `isOpen` a model whose server value is its first-paint state" (Consumers subsection) and promises final ARIA in server HTML (its user story 31). The closed non-modal dialog broke all three; the shown one meets them.
3. The platform allows it, and only for the non-modal case. The HTML standard's `show()` steps begin "If this has an `open` attribute and is modal of this is false, then return", while "show a modal dialog" throws `InvalidStateError` for an open non-modal dialog (HTML Standard 4.11.4, fetched through markdown.new). Measured: `show()` on a dialog parsed with `open` returns with no event and no focus move (P1), `showModal()` throws `InvalidStateError` (P2), in three engines. So `<dialog open>` is exactly the non-modal state, and the rendering-modes research's reason for a closed server dialog ("the `open` attribute alone is non-modal", section 7, Reveal row) is a modal-only reason, as D17 always said.
4. Hydration keeps it, and nothing fires. Angular writes every attribute binding on its first client pass, because the binding slot starts as `NO_CHANGE` (`packages/core/src/render3/instructions/attribute.ts:26-42`); a value equal to the server's is `setAttribute('open', '')` on an element that has it, which the standard's dialog attribute change steps ignore (they run setup only when the old value is null). Measured: no `toggle`, `close`, or `beforetoggle` event, the dialog stays shown, no hydration error, `componentsSkippedHydration` 0 (P3, A3). A client whose first state is closed makes hydration remove `open`, which hides the dialog without a `close` event, as the standard's note on removing the attribute says (P4, A6).
5. A later close is final. `dialog.close()` on the server-shown dialog fires `close` and sets `returnValue` (P3); the fixed binding value never changes, so no later change detection writes `open` back, and `show()` reopens it normally (A4). Binding `open` to `isOpen` instead would remove the attribute in the change detection after a close request, before the exit animation, and without a `close` event (P4), breaking the directive's own close path.
6. A pre-hydration Trigger click now does what the user saw: the dialog was visible and the Trigger said expanded, and the replayed toggle closes it (A5 `candidate` variant, three engines).
7. Focus. With focus on `body` at hydration, the first render callback moves focus into the dialog; with focus in a page field the user typed into before hydration, focus and the typed value stay (A3, A9). The rule is needed because the Light dismiss focus rule closes an entry on any `focusin` outside it (Anchored pane spec, Light dismiss rule 4): without focus inside, a keyboard user's first Tab to anything before the dialog closes it. A static `autoFocus` attribute is HTML's `autofocus`, and a dialog parsed open is focused itself at page load in all three engines (P5); the callback removes the attribute and moves focus to the `autoFocus` target (A10). No `opened` for the initial state follows the Toggler ("no emission for the initial state") and the Dropdown pane ("`opened` is not emitted for it").
8. Without JavaScript the shown dialog can be closed by a `<form method="dialog">` button, natively (A2 `candidateAfterFormClose`, three engines).
9. One refinement I tried failed, and the spec records the gap instead. A `<form method="dialog">` press before hydration closes the dialog natively, and hydration then writes `open` again and shows it, in all three engines; an adoption step in the first render callback cannot see the earlier close, because Angular writes the attribute before any render callback (A7, both `adopt` variants end open). Static attributes behave the same, because Angular sets them up for a claimed element too (`packages/core/src/render3/instructions/shared.ts:596-599`). So `nfsClose`, whose click replays, is the close control of a Reveal that can be open at first paint.
10. The modal path is unchanged: closed on the server, `:modal` with focus inside after hydration (A1, A8).

### Grilling log

Each question asked, and the answer settled on.

1. What is false today, exactly? The Trigger's `aria-expanded="true"` beside a closed dialog, until hydration and for good without JavaScript (evidence 1).
2. Is only the announcement wrong? No: a pre-hydration Trigger click inverts the user's intent (evidence 1).
3. Which candidates? (a) a separate shown state for Triggers; (b) document the mismatch; (c) render `open` on the server; (d) omit `aria-expanded` on the server; (e) forbid `[isOpen]="true"` with `overlay: false`. (d) is out: the Triggers spec requires final ARIA in server HTML, the Trigger role comes from `overlay` only (ADR 0036), and Firefox infers 'collapsed' from `aria-haspopup` alone (the decision ticket's measurement). (e) is out: both inputs are public, and Foundation's `overlay: false` plus a programmatic open is a supported combination.
4. What does (a) need from `NfsOpenable`? A Trigger bound as `[nfsToggle]="note"` receives the `NfsReveal` instance, whose `isOpen` member is its model, so the Trigger reads the model. A different value needs either a new state member on the interface, read by every Trigger (a change to ADR 0013's contract, six Openables, ADR 0036's wrapper rule, and the wrapper example), or a Reveal whose `isOpen` member is not its model (breaks building-blocks 1.3 naming and `[(isOpen)]`). `toggle()` would still read the model, so the replayed click still closes the dialog, and the pop-in at hydration stays.
5. What does (b) cost? A documented breach of the Triggers spec's first-paint rule and building-blocks 1.11 decision 1, permanent without JavaScript, plus the click inversion and the pop-in.
6. Can the server render `open`, and what do `show()`, `showModal()`, and hydration do with it? Yes; evidence 3 and 4.
7. How is `open` bound so that it survives hydration and never fights `close()`? A value fixed at the first render; evidence 4 and 5.
8. What does the first render callback do? Record the stack entry and restore target, close others under `multipleOpened: false`, register with Light dismiss; no `show()`, no `opened`; focus only when nothing else has it (evidence 7).
9. What about a static `autoFocus`? Evidence 7 (P5, A10).
10. What if the client's first state differs from the server's? Hydration removes `open` without a `close` event, so no `closed` fires (evidence 4).
11. What if the user closes the dialog natively before hydration? It comes back at hydration; documented, `nfsClose` is the close control (evidence 9).
12. What about no JavaScript, and small screens? Shown; Foundation's small-only rule makes it full screen below medium; closable only by a `<form method="dialog">` button. Recorded as the main dissent.
13. What about `deepLink`? Its first-render hash read closes a Reveal the hash does not name, so a first-paint dialog would disappear at hydration; the spec says not to combine `deepLink` with `[isOpen]="true"`.
14. Does anything change for modal Reveals? No (evidence 10). The spec now says that a modal Reveal open by default is the one case whose server `isOpen` differs from its first paint, and that its `modal-dialog` Triggers render nothing from `isOpen`.
15. Does the Openable contract change? No, so the Triggers spec and its ticket are not touched.
16. ADR? No: the decision is not hard to reverse (one binding and one branch, no public API), so the ADR bar is not met; D17 and D22 in the spec carry the reasoning.

### Adversarial pass

Arguing against the first answer:

- (b) keeps one simple rule, "the server dialog is always closed, and only the directive writes `open`", while (c) adds a binding that must never change, a second first-render path with its own focus rule, an `autofocus` correction, a pre-hydration undo for `<form method="dialog">`, and a `deepLink` caveat, all for one rare input combination whose mismatch lasts only until hydration for users with JavaScript. Weighed: the "always closed" rule was never a requirement; the recorded requirements say the opposite (evidence 2). The first-render path and its focus rule replace behaviour (b) also has in a worse form: under (b) the dialog pops in at hydration, the open steals focus from wherever the user was, and the pre-hydration click inverts. The binding is one line and is guarded by a browser-level test that no later change detection writes `open`.
- No JavaScript on a phone: below medium, Foundation makes every Reveal full screen, so a no-JavaScript user sees only the dialog and can close it only if the consumer wrote a `<form method="dialog">` button; under (b) the page stays readable. Weighed: JavaScript is a relied-upon technology for an Angular application; the consumer asked for the dialog to be open; a JavaScript user sees the same full-screen dialog a moment later under (b) anyway, so (b) delays the obstruction rather than avoiding it. Not overridden on evidence, only on the effort's rules: this is the dissent below.
- The pre-hydration `<form method="dialog">` undo (A7) is a new failure that (b) cannot have. Weighed: it needs a native form close pressed in the hydration window; the documented close control replays correctly (A5); recorded in the spec.
- Modal and non-modal Reveals now render `[isOpen]="true"` differently. Weighed: the difference is the platform's (evidence 3), and D17 states it.
- (a) is the smallest change that fixes the announcement alone. Weighed: it changes a public contract (HIGH impact) and leaves the pop-in and the click inversion (grilling 4).

### Dissent

- Strongest: without JavaScript, and before hydration on a slow phone, a non-modal Reveal open by default is a full-screen box the user cannot dismiss, except through a `<form method="dialog">` button the consumer may not have written; the closed server dialog of (b) never blocks the page. Reopens on: evidence (a usability finding or a platform guideline) that a visible first-paint dialog that cannot yet be dismissed harms users more than a hidden one beside a Trigger announcing "expanded".
- The `<form method="dialog">` undo (evidence 9). Reopens on: Angular gaining a way to keep an attribute a user changed before hydration, which would also let the spec recommend that button for no-JavaScript dismissal without the undo.

### Triage

- Impact: MEDIUM. The server HTML and first-render behaviour of one input combination of the Reveal change; no input, output, member, contract, or vocabulary changes; no other spec inherits it (the Dropdown pane and Off-canvas already render their first-paint state); reversing it is one binding and one branch and breaks no consumer's compilation.
- Confidence: HIGH. Each mechanism is settled by the HTML standard and the Angular 22.2 source and measured in three engines (54 of 54 tests); the decision follows building-blocks 1.11 decisions 1 and 2, ADR 0008, and the Triggers spec's first-paint rule, keeps D17's modal reason, and contradicts no ADR (ADR 0007, 0031, and 0036 are unaffected: `show()` remains the mechanism for later opens, Light dismiss still dismisses the dialog, and the `dialog` Trigger role still renders `aria-expanded`).
- Not the trap quadrant, so no panel; decided here.

### Changes made

`specs/reveal.md`:

- Problem Statement, the server-rendered paragraph: "closed" becomes "closed unless it is a non-modal dialog that is open by default"; "an open-by-default dialog must become modal" becomes "an open-by-default modal dialog must become modal".
- Solution, last sentence: the server HTML is the dialog with its content, closed, or shown when a non-modal Reveal is open at its first render, so its Trigger's `aria-expanded="true"` is true from the first paint.
- User stories: 41 says "modal"; new story 46 (a non-modal Reveal open by default shown in the server HTML).
- Model, outputs, methods, `opened` row: not emitted for a non-modal Reveal open at first paint.
- Behaviour: new "Open at first paint (non-modal only)" bullet after Opening (evidence 7); the deep-linking bullet says a first-paint dialog closes at hydration when the hash does not name it, so `deepLink` is not combined with `[isOpen]="true"`.
- Primitives: the untracked `computed` for the first-render `open` binding.
- ARIA table, `open` row: set by `showModal()`/`show()`, and bound only for a non-modal Reveal open at its first render, from a value fixed then.
- Rendered HTML: the modal example's note says only a non-modal Reveal binds `open`; two comments on the non-modal example (its server and hydrated `open` with the Trigger at `aria-expanded="true"`; the modal counterpart without `open`).
- Rendering modes: the server bullet (modal closed with the `InvalidStateError` reason; non-modal first-paint `open` and its binding; the modal open-by-default note on `isOpen`; the no-JavaScript residue), the full-hydration bullet (the rewrite fires nothing; a closed client first state removes `open` without `close`; no rewrite after a later close), the event-replay bullet (the pre-hydration Trigger click in both designs; the host listeners of a first-paint dialog; no Light dismiss before hydration; the `<form method="dialog">` undo), and the `@defer` bullet (dehydrated and `hydrate never` server states).
- Testing Decisions: `reveal--without-overlay` gains an open-at-first-render case; a new browser-level bullet "Open at first paint"; the SSR smoke gains a non-modal open-by-default fixture that carries `open` beside a Trigger at `aria-expanded="true"` (and names the modal one as modal); the prerendered fixture app gains that Reveal with an `nfsToggle` Trigger and a `<form method="dialog">` button, with JavaScript-disabled, hydration, and pre-hydration-click assertions.
- Design decisions: D17 rewritten (modal closed; non-modal open at first render shown; the rejected alternatives: `open` for modal Reveals, a closed non-modal dialog, a separate shown state for Triggers, documenting the mismatch, binding `open` to `isOpen`); new D22 (no re-show, no `opened`, focus only when nothing else has it).

`issues/18-spec-reveal.md`: a dated amendment listing the above and closing the open follow-up routed there.

Not changed: `specs/triggers.md` and `issues/54-spec-triggers.md` (the contract is unchanged).

### Proposed shared-document changes

For the orchestrator, who owns these files. (Paths relative to the effort root; links inside proposed ADR text are relative to `adr/`.)

1. `building-blocks.md`, Table B, Reveal row, Rendering column: replace "Server output: `<dialog class="reveal">` closed (no `open` attribute), content rendered for SEO;" with "Server output: `<dialog class="reveal">` with its content, closed (no `open` attribute) except a non-modal Reveal open at its first render, which carries `open` bound from a value fixed at that render, so its Trigger's `aria-expanded="true"` is true from the first paint;", and replace "open-by-default calls `showModal()` in the first `afterRenderEffect` run after hydration, without an enter animation (the `open` attribute alone is non-modal)" with "a modal Reveal open by default calls `showModal()` in the first `afterRenderEffect` run after hydration, without an enter animation (the `open` attribute alone is non-modal, and `showModal()` throws on it); a non-modal one open at first paint is not re-shown and takes focus at hydration only when nothing else has it". Reason: evidence 3 to 7.
2. `building-blocks.md`, 1.11 decision 5: after "Document-level handlers (Light dismiss, outside click, global Escape) do not replay, which is correct: nothing is open before hydration." add "The exceptions, a Dropdown pane and a non-modal Reveal open at first paint, cannot be dismissed that way until hydration." Reason: the Dropdown spec already records its case; this decision adds the Reveal's.
3. `research/angular-rendering-modes.md`, section 7 per-directive checklist, Reveal row: a dated note "Note (2026-09-27, from [Decide: the server state of an open-by-default non-modal Reveal's Trigger](../issues/78-decide-open-by-default-non-modal-reveal-server-state.md)): the `open`-alone reason applies to modal Reveals; a non-modal Reveal open at its first render is rendered with `open` on the server." Reason: the row's reason reads as if it covered every Reveal.
4. `README.md`: no change needed; this item was not on its open list.

Follow-up outside this decision, not decided (for the orchestrator to route or drop): a Reveal opened at its first render (modal, or non-modal with focus placed from `body`) has no Trigger to return focus to, so the restore target is the element focused then, usually `body`, and closing it leaves focus on `body`; the Off-canvas spec falls back to its first registered Trigger in that case, and the Reveal's restore rule has no such step. This exists without this decision.

### Measurement

Throwaway workspace `D:/tmp/nfs-decision-reveal-open/app` (an Angular CLI 22.2.0 SSR application copied from the Reveal dialog prototype's skeleton, `provideClientHydration()` with event replay, zoneless, development build so `ngDevMode` counters exist). Files: `src/app/probe-reveal.ts` (a probe with only the parts the question needs: the fixed `open` binding, the first-paint path, `show()`/`close()` sync, a native-close listener, a Trigger probe with a `click` host listener), `src/app/case-page.ts` and `case-page-af.ts` (query parameters `variant=spec|candidate`, `diverge=1`, `adopt=0`, `modal=1`; the `/af` route has a static `autofocus` on the dialog), `public/platform.html`, `autofocus.html`, `ax.html` (plain pages), `e2e/decision.spec.ts` (18 tests times 3 engines), `src/index.html` (a script that logs dialog events from the first byte). Run: `npx ng build --configuration development`, then `PORT=4800 NG_ALLOWED_HOSTS="localhost,127.0.0.1" node dist/app/server/server.mjs`, then `npx playwright test`. Final run: 54 passed, `D:/tmp/nfs-decision-reveal-open/run2.log` (`run1.log` is the first run, before the focus rule was refined). The server and browsers were stopped. Evidence capture of these files: [prototypes/reveal-open-first-paint/](../prototypes/reveal-open-first-paint/README.md).

| Case | Result, identical in Chromium, Firefox, and WebKit unless noted |
| --- | --- |
| P1 `show()` on a dialog parsed with `open` | Returns, no event, still open, not `:modal`, focus unmoved |
| P2 `showModal()` on it | Throws `InvalidStateError` |
| P3 `setAttribute('open', '')` on it, then `close('x')`, then `show()` | No event for the attribute write; `close()` fires `close`, `returnValue` is `x`; `show()` fires `toggle` and focuses the first button |
| P4 `removeAttribute('open')` | Hidden (`display: none`), no `close` event; `show()` works afterwards |
| P5 static `autofocus` on a dialog parsed open | The dialog element itself has focus after load |
| P6 accessibility | Chromium tree: the Trigger beside the open dialog `expanded: true` with the dialog exposed; the Trigger beside the closed dialog `expanded: true` with no dialog in the tree; Playwright snapshots agree in Firefox and WebKit |
| A1 server HTML | Candidate: `<dialog ... class="reveal without-overlay" open="">` and the Trigger `aria-expanded="true"`; spec variant: no `open`, Trigger `aria-expanded="true"`; modal: no `open` |
| A2 JavaScript disabled | Candidate shown, Trigger expanded; spec variant hidden, Trigger expanded; the candidate's `<form method="dialog">` button closes it |
| A3 hydration | Still open, no dialog event, `hydratedComponents` 2, `componentsSkippedHydration` 0, no console error, `jsaction` gone; focus from `body` moved to the close button |
| A4 later close, two change detections, reopen | Closed with one `close` event; `open` stays absent; the Trigger reopens it through `show()` with focus inside |
| A5 Trigger click before hydration (bundle held 2 s) | Candidate: dialog visible and Trigger expanded at the click, closed after replay; spec variant: dialog hidden at the click, shown at hydration, then closed by the replayed toggle |
| A6 client first state closed, server open | Hydration removes `open`, no `close` event, Trigger `aria-expanded="false"`; the Trigger then opens it |
| A7 `<form method="dialog">` press before hydration | Closed natively at the press, open again after hydration with or without the adoption step |
| A8 modal open by default | No `open` on the server; `:modal` with focus inside after hydration |
| A9 focus in a page field before hydration | Focus and the typed value stay in the field; the dialog stays open |
| A10 static `autofocus`, before and after hydration | Before: the dialog itself focused; after: the close button focused and the attribute gone |

The engines are newer than the Browser target. The decision does not depend on `show()` returning early (the first-paint path never calls it); it depends on `showModal()` throwing for an open dialog, which the standard required before the current wording as well, and on attribute writes, which carry no dialog side effect beyond the setup and cleanup steps.

### Gist for the map's Decisions so far

- [Decide: the server state of an open-by-default non-modal Reveal's Trigger](issues/78-decide-open-by-default-non-modal-reveal-server-state.md) -- a non-modal Reveal open at its first render is rendered shown: `[attr.open]` bound from a value fixed at that render, so the server HTML is the shown non-modal dialog and its Trigger's `aria-expanded="true"` is true from the first paint; the first render callback does not re-show it, emits no `opened`, and takes focus only when nothing else has it; modal Reveals stay closed on the server; a `<form method="dialog">` close before hydration is undone by hydration, so `nfsClose` is the close control; the Openable contract is unchanged; measured in three engines (54 of 54); impact MEDIUM, confidence HIGH; no ADR. Spec: [specs/reveal.md](specs/reveal.md).

### Follow-up decided by the orchestrator, 2026-09-27

The answer routed one follow-up: a Reveal open at its first render has no Trigger to return focus to, so its restore rule found no usable target and closing it left focus on `body`. Decided under the triage rule (impact LOW: an internal fallback step, no API change; confidence HIGH: WCAG 2.4.3 and the APG dialog pattern ask for a logical place when the invoking element is missing, and the [Spec: Off-canvas](25-spec-off-canvas.md) already falls back to its first registered Trigger): the Reveal's restore order becomes `restoreFocus` (selector or element), the `trigger` passed to `open()`, the element focused when the Reveal opened when that was not `body`, then the first registered Trigger, and in development mode closing with no usable target logs a warning naming the `restoreFocus` input. Applied to the restore bullet of `specs/reveal.md`.
