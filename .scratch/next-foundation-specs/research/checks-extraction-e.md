# Checks extraction: group e

Group: e. Files: `specs/responsive-toggle.md`, `specs/reveal.md`, `specs/slider.md`, `specs/smooth-scroll.md`, `specs/sticky.md`, `specs/switch.md`, `specs/table.md`, `specs/tabs.md`, `specs/thumbnail.md`. Commit read: `ba07780` (`ba07780a8335fefd0ca33c2ea08fa9a992ef99c0`). Classification rule source: ticket 158, [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), Decision item 1, applied per the boundary-call rule in [Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md).

Every kind other than the five named (forgotten-import, family, misuse, runtime, build-time) is out of scope for this manifest. Where a file states only that no check of a kind applies (a disclaimer of absence, not a check), that sentence is recorded as a Mention under the nearest related check, not as its own kind subsection, and noted in this header for that file.

## specs/responsive-toggle.md

### forgotten-import: In-family checks

Location: `### Hierarchy and DI shape`, lines 130-133.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsResponsiveToggle` calls `nfsDirectiveCheck('NfsResponsiveToggle')`: no parent check (it injects no parent); no child probes: the bare `nfsToggle` on the menu icon and the Top Bar spec's directives beside and inside the bar belong to the Triggers and Top Bar families, and an Openable probes no Trigger ([Spec: Triggers (shared utility)](../issues/54-spec-triggers.md)); peers: its menu, by the required reference `[nfsResponsiveToggle]="menu"` with `#menu="nfsResponsiveToggleMenu"`, so a forgotten `NfsResponsiveToggle` fails to compile with NG8002 and a forgotten `NfsResponsiveToggleMenu` with NG8003; `strictParents` changes nothing.
  - `NfsResponsiveToggleMenu` calls `nfsDirectiveCheck('NfsResponsiveToggleMenu')`: no parent check (it injects none; the bar reaches it by that reference and registers with it); no child probes (a Top Bar or Menu inside it is its own family); peers: the bar, by the same reference; `strictParents` changes nothing. Development check 3 (no registered title bar) reads a registration and keeps its message: the shared spec's rule silences a check that finds a peer by registration only where the element it looks for carries the peer directive's attribute, and check 3 looks for no element: the bar reaches the menu only through the required reference `[nfsResponsiveToggle]="menu"`, whose forgotten import on either side fails to compile (NG8002, NG8003).
  - No Responsive Toggle directive sits on `ng-template` or `ng-container`.
````

Tests and stories: none dedicated; NG8002/NG8003 are Angular's own compiler diagnostics, not asserted by a library test in this file.

Needs: `nfsDirectiveCheck` (forgotten-import checks shared utility); the required typed template reference `[nfsResponsiveToggle]="menu"` / `#menu="nfsResponsiveToggleMenu"` that the Angular compiler itself enforces.

Rule as documented usage: A `[nfsResponsiveToggle]` bar and its `[nfsResponsiveToggleMenu]` target must both be imported and referenced by the required template reference, or the template fails to compile.

Mentions: none beyond this block.

### family: Development check 3 (no registered title bar)

Location: `### API`, "Development-mode checks" list item 3, line 203; discussed further in `### Hierarchy and DI shape`, line 132 (explaining why it is not folded into the forgotten-import machinery).

Text:

````
3. The menu has no registered title bar after the first render, or a second title bar registers with a menu that already has one.
````

Tests and stories: no story or layer-2 case names "check 3" specifically; the reverse-link registration itself is covered under "2. Browser-level test", "Reverse link: the menu's classes are present in the first rendered pass with the bar before, after, and around the menu (`@if`); swapping the bound menu moves the registration; destroying the bar unregisters." (line 408), which exercises the mechanism the check watches but does not assert the warning text.

Needs: the reverse-link registration effect (bar registers itself with the menu's registry signal); the registry signal itself.

Rule as documented usage: none -- the required typed reference already makes an unregistered pairing a compile error (NG8002/NG8003); this check catches only the runtime residue of a reference resolving to an instance that never completed registration, which the rewritten spec has nothing to state as consumer-facing documented usage beyond "reference a menu declared in the same template."

Mentions: line 132 (Hierarchy and DI shape, explains why check 3 is kept as its own check rather than merged into the forgotten-import mechanism).

### misuse: Development check 1 (copied Visibility class or is-open)

Location: `### API`, "Development-mode checks" list item 1, line 201.

Text:

````
1. A copied class, read through `HostAttributeToken('class')` in a field initialiser that runs only in development builds, because after render the class list no longer shows the copy: a Visibility class (`show-for-*`, `hide-for-*`, and their `-only` forms) on the bar or the menu, or `is-open` on the menu. The class records have already stripped the Responsive Toggle's own family (`hide-for-*` on the bar, `show-for-*` and `is-open` on the menu); any other Visibility class stays and fights the switch. The warning names `hideFor`, or `[(isOpen)]` for `is-open`, and says to remove the class (building-blocks 1.4; Foundation's FOUC recipe written as classes).
````

Tests and stories: "2. Browser-level test", line 410: "Class records: a static `class="hide-for-large app-bar"` on a bar with `hideFor="medium"`, and `class="show-for-medium is-open"` on a closed menu, are stripped and the Application class stays, with the default Breakpoint map and with a provided `nfsBreakpointsToken` whose map adds `xlarge`; check 1 warns once for each host; a copied `show-for-large` on the bar stays and is reported."

Needs: `HostAttributeToken('class')` (development builds only); the per-host computed class record.

Rule as documented usage: Do not write a Foundation Visibility class (`hide-for-*`, `show-for-*`, their `-only` forms) or `is-open` on the bar or the menu; set `hideFor` and use `[(isOpen)]` instead.

Mentions: line 346 (Rendered HTML example, "The copied `hide-for-medium` on the bar is of the Responsive Toggle's own family there... development check 1 reports the copy"); line 462 (Further Notes design-decision table row "Copied Visibility classes and `is-open`").

### misuse: Development check 2 (hideFor is the Zero breakpoint)

Location: `### API`, "Development-mode checks" list item 2, line 202.

Text:

````
2. `hideFor` is the Zero breakpoint.
````

Tests and stories: none named explicitly by number; covered generically under "2. Browser-level test", line 413: "Development checks: each of the five warnings fires once for its case and not for the correct markup; nothing is checked when `ngDevMode` is false or during a server render."

Needs: the Breakpoint map (`nfsBreakpointsToken`) and its Zero breakpoint entry.

Rule as documented usage: Do not set `hideFor` to the Zero breakpoint; the bar would never show.

Mentions: none additional.

### misuse: Development check 4 (animate value starts no animation)

Location: `### API`, "Development-mode checks" list item 4, line 204.

Text:

````
4. Run in the completion effect's read phase that measures a phase's animation, not in the first render callback: a non-empty `animate` half whose classes start no CSS animation when their phase begins (a Motion name without the `nfs-motion` include, a dot-form class without `@keyframes`, a Motion UI transition class given in the dot form); a dot-form class that starts with `nfs-`: "write the library's Motion name without its prefix: animate="fade-in""; and a value that does not split into one entering and one leaving value (three or more tokens, or a leaving value before an entering one), which the type admits only through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`): "animate takes one entering and one leaving value". The first case reads "animate="hinge-in-from-top spin-out" started no animation: include nfs-motion, or give your own class @keyframes". The phase still completes at once. This is the Toggler's check 4 and the Reveal's check 3 in this plugin's words.
````

Tests and stories: "2. Browser-level test", line 403: "Motion values: ... a value of another shape, reached through `$any()` or through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`), animates nothing and warns once (check 4)."; line 404: "Completion: ... a Motion name whose keyframes are absent from the test document completes at once and warns (check 4)."

Needs: `nfs-motion` Sass include; `getComputedStyle` reads of `animation-name`/`animation-duration`/etc.; the `NfsMotionPair` type's dot-form escape hatch.

Rule as documented usage: Include `nfs-motion` (or give a dot-form class its own `@keyframes`) so a Motion name given to `animate` actually starts an animation; give `animate` exactly one entering and one leaving value.

Mentions: lines 403, 404 (Testing Decisions).

### misuse: Development check 5 (missing Visibility class)

Location: `### API`, "Development-mode checks" list item 5, line 205; the "No Runtime check" disclaimer immediately after it, line 207.

Text:

````
5. Missing Visibility class: after the first render, below `hideFor` with the menu closed, the menu's computed `display` is not `none`; or at and above `hideFor`, the bar's is not `none`. The message names both fixes: include `foundation-visibility-classes`, and for a `hideFor` outside `$breakpoint-classes`, `@include nfs-responsive-toggle(<bp>)` or add the breakpoint to `$breakpoint-classes`.
````

Text (disclaimer, associated Mention, not a separate check):

````
No Runtime check is requested: this plugin has no Variant input, and `hideFor` reads no Variant property, because its classes come either from Foundation's `$breakpoint-classes` loop or from this plugin's opt-in include; check 5 measures the result of both.
````

Tests and stories: no story or layer-2 case names "check 5" by number explicitly; generically covered by line 413 (as above).

Needs: `foundation-visibility-classes` Foundation export mixin; the opt-in `nfs-responsive-toggle` Library mixin; `getComputedStyle` reads of the bar's and menu's `display`.

Rule as documented usage: Include `foundation-visibility-classes`, and for a `hideFor` outside `$breakpoint-classes`, either `@include nfs-responsive-toggle(<bp>)` or add the breakpoint to `$breakpoint-classes`.

Mentions: line 207 (the "No Runtime check" sentence, which explicitly ties itself to "check 5 measures the result of both" -- recorded here because it names a Runtime check that does not exist for this plugin, not because it is itself a check); Sass subsection item 5, `### Sass`, line 599, "Missing include: with a `hideFor` outside `$breakpoint-classes` and neither the include nor the setting change... the development-mode check (Missing Visibility class) names both fixes."; `## Out of Scope`, line 448, "A dev-mode check that the Breakpoint map and the Sass breakpoints agree: the Breakpoint service's `strictBreakpointSync` Runtime check owns it." -- a mention of a Runtime check owned entirely by another spec (the Breakpoint service, a shared-utility spec outside group e's file list); its full text is not in this file, so no `runtime`-kind subsection is created for it here; the re-run sweep for this file should drop the sentence per the ruling's Decision item 2 (no spec depends on a deferred check), and the shared-documents sweep is the one that owns the Breakpoint service's own spec text.

Boundary call: check 5's message names a Sass include as its fix, which could suggest `build-time`, but the check itself is a runtime DOM measurement (`getComputedStyle` in a development-only render callback), not a Sass `@error`/`@warn`; classified `misuse` because it reads only the page's computed state, per the order forgotten-import > family > misuse > runtime > build-time.

### build-time: nfs-responsive-toggle mixin's argument checks

Location: `### Sass`, Further Notes, item 1, line 595 (and the brief mention at `### Sass and custom CSS`, line 377).

Text:

````
A name already in `$breakpoint-classes` is skipped (Foundation emits it); the first key of `$breakpoints` (the Zero breakpoint, for which Foundation emits no `hide-for`/`show-for` pair) and a name missing from `$breakpoints` stop the compile with `@error`; an include without an argument stops it too (Sass's missing-argument error), because the mixin has nothing else to emit.
````

Tests and stories: "3. Node-level Vitest", line 420: "Sass compile ... a breakpoint already in `$breakpoint-classes` emits no Visibility class; the Zero breakpoint and an unknown name fail the compile with `@error`; an include without an argument fails the compile."

Needs: the `nfs-responsive-toggle($hide-for)` Library mixin itself; the consumer's `$breakpoints` and `$breakpoint-classes` settings.

Rule as documented usage: Call `@include nfs-responsive-toggle(<bp>...)` with at least one argument naming a breakpoint that exists in `$breakpoints`, is not the Zero breakpoint, and is not already in `$breakpoint-classes`.

Mentions: line 420 (Node-level Vitest, Sass compile test).

### Kept (not a check)

- Required parent injections and NG0201: none (Responsive Toggle injects no parent; only the peer reference is compiler-enforced, recorded above).
- ARIA and focus behaviour: the Trigger's `aria-expanded`/`aria-controls`, the focus-persistence rule (`### Focus rule`, lines 221-227).
- Typed inputs and their compile errors: `hideFor: NfsBreakpointName`; `animate: NfsMotionPair` (a misspelt Motion name, a leaving name in the entering place, Motion UI's `fast`/`slow` modifiers, or a library class name fail to compile, lines 179, 468).
- Library mixins' CSS rules: the two Visibility class rules `nfs-responsive-toggle` emits (`### Sass`, item 1).
- The library's own tests of its components' behaviour and accessibility: the four testing layers under `## Testing Decisions`.

## specs/reveal.md

Reveal has no `In-family checks` section and no ADR 0046 machinery beyond one development-only token description; confirmed by search (no hits for `nfsDirectiveCheck`, `strictParents`, or `In-family` in this file).

### forgotten-import: nfsRevealToken development-only description

Location: `### Hierarchy and DI shape`, line 161.

Text:

````
`nfsRevealToken = new InjectionToken<NfsReveal>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsRevealToken (provided by NfsReveal from 'ngx-foundation-sites/reveal' on an ancestor element declared in the same template)" : '')`, its description in development builds only, in a token file that imports only types (building-blocks 1.9, ADR 0009): a component projected into the dialog injects it with `{optional: true}` to call `close(result)`, the declarative counterpart of injecting Material's `MatDialogRef`.
````

Tests and stories: none dedicated (a token description string is read from the thrown error text, not asserted in this file's test layers).

Needs: the `nfsRevealToken` `InjectionToken`; `ngDevMode`.

Rule as documented usage: none -- a component that injects `nfsRevealToken` outside a Reveal gets `undefined` (it is injected `{optional: true}`), so there is no compile-time or throw-time signal for the consumer to act on; the description exists only to help a developer reading the token's own definition.

Mentions: none beyond this line.

### misuse: Dev-mode check 1 (no accessible name)

Location: `### API`, "Behaviour" list, the "Dev-mode checks" paragraph (numbered items run through the whole paragraph beginning "Dev-mode checks, only when `ngDevMode` is on..."), item (1).

Text:

````
(1) No `aria-labelledby` and no `aria-label` on the host;
````

Tests and stories: "2. Browser-level test", line 538: "Dev-mode checks: each of the nine warnings fires once for its case and not for correct markup ... nothing is checked when `ngDevMode` is false."; WCAG table row "1.3.1 Info and Relationships, 4.1.2 Name, Role, Value", line 372: "Dev checks 1 and 2".

Needs: the host's static `aria-labelledby`/`aria-label` attributes, read in `afterNextRender`.

Rule as documented usage: Give the dialog a name with `aria-labelledby` pointing at its visible title, or `aria-label`.

Mentions: WCAG table row (line 372).

### misuse: Dev-mode check 2 (alertdialog with no aria-describedby)

Location: same paragraph, item (2).

Text:

````
(2) `role` is `'alertdialog'` and there is no `aria-describedby`;
````

Tests and stories: same generic coverage (line 538); WCAG table row (line 372, "Dev checks 1 and 2").

Needs: the host's `role` and `aria-describedby` attributes.

Rule as documented usage: When `role="alertdialog"`, give the dialog a description with `aria-describedby`.

Mentions: line 372.

### misuse: Dev-mode check 3 (animationIn/animationOut start no animation)

Location: same paragraph, item (3); also `### Sass`, item 5, line 784 ("What breaks without the include").

Text:

````
(3) a non-empty `animationIn` or `animationOut` whose classes start no CSS animation when their phase begins (a consumer class without `@keyframes`, a Motion UI transition class given in the dot form, or a Motion name without the `nfs-motion` include): "animationIn="spin-in" started no animation: include nfs-motion, or give your own class @keyframes", the phase completing at once as before; and a dot-form class that starts with `nfs-`: "write the library's Motion name without its prefix: animationIn="fade-in"";
````

Tests and stories: "2. Browser-level test", line 538: "a dot-form class without keyframes and a dot-form `.nfs-fade-in` do [warn]"; the check runs "in the open and close sync's `read` phase" per the Render hooks table (line 306).

Needs: `nfs-motion` Sass include; `getComputedStyle` reads of the host's animation properties.

Rule as documented usage: Include `nfs-motion` (or give a dot-form `animationIn`/`animationOut` class its own `@keyframes`) so the value actually animates; write the library's Motion name without its `nfs-` prefix.

Mentions: line 306 (Render hooks table), line 784 (Sass, "what breaks without the include").

### misuse: Dev-mode check 4 (deepLink with a generated id)

Location: same paragraph, item (4).

Text:

````
(4) `deepLink` with a generated id;
````

Tests and stories: generic coverage, line 538.

Needs: the `id` input's generated-vs-consumer-supplied state.

Rule as documented usage: Give a `deepLink`-enabled Reveal a consumer-supplied `id`.

Mentions: none additional.

### misuse: Dev-mode check 5 (tabindex attribute on the dialog)

Location: same paragraph, item (5).

Text:

````
(5) a `tabindex` attribute on the dialog (HTML forbids it on `<dialog>`);
````

Tests and stories: generic coverage, line 538.

Needs: the host's static `tabindex` attribute.

Rule as documented usage: Do not put a `tabindex` attribute on the `<dialog>` element; HTML forbids it.

Mentions: none additional.

### misuse: Dev-mode check 6 (nothing tabbable inside the dialog)

Location: same paragraph, item (6).

Text:

````
(6) at open, nothing tabbable inside the dialog (the APG strongly recommends a visible close button, and without one every engine focuses the dialog box);
````

Tests and stories: `### Focus`, "`'first-tabbable'` ... When nothing qualifies, focus is left where the browser put it and dev check 6 fires." (line 275); generic coverage line 538.

Needs: CDK `InteractivityChecker`.

Rule as documented usage: Give the dialog at least one tabbable descendant (a visible close button is the APG's recommendation).

Mentions: line 275 (`### Focus`).

### family: Dev-mode check 7 (no usable restore-focus target)

Location: same paragraph, item (7); detailed further in `### Focus`, line 282.

Text:

````
(7) at close, with `restoreFocus` not `false`, no usable restore target (the `restoreFocus` target, the `trigger`, the element focused at open, and the first registered Trigger outside the dialog, each missing or unfocusable): the warning names the `restoreFocus` input;
````

Tests and stories: "2. Browser-level test", line 534: "restore to the `trigger`, to the element focused before open, to a `restoreFocus` selector and element, not when focus has moved elsewhere, and up the fallback chain when the target was inside a closed Reveal; to the first registered Trigger outside the dialog (not a bare `nfsClose` registered before it inside) when the Reveal was open at its first render and focus sat on `body`, and the development warning when no target is usable; `restoreFocus` false moves nothing."

Needs: `registerTrigger` (the Reveal's Trigger registry, a peer registration mechanism shared with the Triggers spec); the `restoreFocus` input; the recorded `trigger`/element-focused-at-open state.

Rule as documented usage: When `restoreFocus` is not `false`, ensure at least one of the `restoreFocus` target, the `trigger` passed to `open()`, the element focused when the Reveal opened, or a registered Trigger outside the dialog stays focusable.

Mentions: `### Focus`, line 282 (full restore-focus fallback chain).

Boundary call: this check reads both the Reveal's own recorded state (the `trigger` argument, the element focused at open) and a peer's registration (the first registered Trigger, via `registerTrigger`, a mechanism the ruling's family definition names as "registration checks"). Classified `family` because it consults the Trigger registry as a fallback source, per the order forgotten-import > family > misuse.

### misuse: Dev-mode check 8 (copied Foundation or library class)

Location: same paragraph, item (8).

Text:

````
(8) the host's static `class` holds a Foundation or library class the directive sets (a size name, `collapse`, `without-overlay`, `is-opening`, `is-closing`, or an `nfs-` class), read through `HostAttributeToken('class')` in a field initialiser that exists only in development builds, because a stripped class is gone from the element by the first render: "class="tiny" is set by nfsReveal: bind size="tiny" instead", naming each class with its input (`[overlay]="false"` for `without-overlay`, the Motion inputs for an `nfs-` class, none for a State class); a redundant `reveal` merges with the static host class and is not reported (building-blocks 1.4, the initial-state rule; the Button spec's copied-class check).
````

Tests and stories: "2. Browser-level test", line 538: "check 8 fires for `class="tiny reveal"` naming `size="tiny"`, for `class="without-overlay"` naming `[overlay]="false"`, and for `class="nfs-fade-in"`, and not for `class="reveal"` or a consumer class".

Needs: `HostAttributeToken('class')` (development builds only).

Rule as documented usage: Do not copy a Foundation or library class (`tiny`/`small`/`large`/`full`, `collapse`, `without-overlay`, `is-opening`, `is-closing`, an `nfs-` Motion class) onto the `<dialog>`; bind `size`, `collapse`, `overlay`, `animationIn`, or `animationOut` instead.

Mentions: user story 49, line 76; D26, line 622.

### misuse: Dev-mode check 9 (static autoFocus attribute on a Reveal open at first render)

Location: same paragraph, item (9); design decision D12, line 608.

Text:

````
(9) A static `autoFocus` attribute on a Reveal open at its first render, read with `HostAttributeToken('autoFocus')` in a field initialiser that exists only in development builds: "bind [autoFocus] or set it in nfsRevealDefaultsToken: in client rendering the browser acts on the autofocus attribute when the dialog is inserted, before the directive removes it".
````

Tests and stories: "2. Browser-level test", line 525: "with a static `autoFocus` attribute and focus on the host it moves focus to the `autoFocus` target and the attribute is gone, and dev check 9 warns once (a bound `[autoFocus]` does not warn)".

Needs: `HostAttributeToken('autoFocus')` (development builds only).

Rule as documented usage: Set `autoFocus` by binding (`[autoFocus]="..."`) or through `nfsRevealDefaultsToken`, never as a static attribute, on a Reveal that can be open at its first render.

Mentions: `### Focus`, line 280; D12, line 608.

### build-time: nfs-reveal mixin's close-glyph and dialog-edge contrast checks

Location: `### WCAG 2.2 AA criteria`, row "1.4.11 Non-text Contrast", line 374; `### Sass`, item (1), table row "-", line 774; D19, line 615.

Text:

````
It stops the compile with `@error` naming the setting when a close-glyph ratio is under 3, as the `nfs-off-canvas` mixin does for the same glyph, and emits `@warn` naming the setting when the dialog-edge ratio is under 3 (axe has no 1.4.11 rule); node-level Sass test
````

Text (Sass table row):

````
`@error` naming the setting when the ratio of `$closebutton-color` against `$reveal-background`, or of `$closebutton-color-hover` against `$reveal-background`, is under 3; `@warn` when the ratio of `$reveal-background` against `$reveal-overlay-background` composited over `$body-background` is under 3
````

Tests and stories: "3. Node-level Vitest", line 547: "a theme with `$closebutton-color` or `$closebutton-color-hover` under 3:1 against `$reveal-background` stops the compile with the `@error` naming the setting, and a backdrop that leaves the dialog under 3:1 against the dimmed page produces the matching `@warn`."

Needs: the `nfs-reveal` Library mixin; the library's internal exact-WCAG-formula contrast helper; `$closebutton-color`, `$closebutton-color-hover`, `$reveal-background`, `$reveal-overlay-background`, `$body-background`.

Rule as documented usage: Keep `$closebutton-color` and `$closebutton-color-hover` at 3:1 or better against `$reveal-background`; keep the dialog's edge (`$reveal-background`) at 3:1 or better against the page dimmed by the backdrop.

Mentions: D19, line 615; D28, line 624.

### Kept (not a check)

- Required parent injections and NG0201: none (Reveal has no required parent).
- ARIA and focus behaviour: `### ARIA and keyboard`, `### Focus` sections (tab wrap, initial focus placement, restore-focus chain apart from check 7's warning).
- Typed inputs and their compile errors: `size: NfsRevealSize`, `animationIn: NfsMotionIn`, `animationOut: NfsMotionOut` (a misspelt name, a leaving name on `animationIn`, `fast`/`slow` modifiers, or a library class name fail to compile; D24, line 620).
- Library mixins' CSS rules and Variant properties: the eight `nfs-reveal` rules (`### Sass`, item 1); "(6) Variant properties: none" (line 786) -- a disclaimer, not a check.
- The library's own tests: the four testing layers under `## Testing Decisions`, and the manual release test.

## specs/slider.md

### forgotten-import: In-family checks and nfsSliderToken description

Location: `### Hierarchy and DI shape`, line 158 (token description), lines 165-169 (In-family checks bullets).

Text (token description):

````
Parent handle: `nfsSliderToken = new InjectionToken<NfsSlider>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsSliderToken (provided by NfsSlider from 'ngx-foundation-sites/slider' on an ancestor element declared in the same template)" : '')`, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in the plugin's token file with an `import type` of the class; `NfsSlider` provides it with `useExisting`. A handle injects it without `optional`, so a handle outside a slider fails at construction with NG0201, which prints that description (building-blocks 1.9: the child cannot exist alone; a lone range input needs no directive).
````

Text (In-family checks):

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsSlider` calls `nfsDirectiveCheck('NfsSlider', {children: ['NfsSliderHandle', 'NfsSliderFill']})`: no parent check; it probes the Handles and the fill, which matters for a Handle bound with `[formField]`, because a range input without `NfsSliderHandle` takes that binding on the native element path and compiles without a word; no peers; `strictParents` changes nothing.
  - `NfsSliderHandle` calls `nfsDirectiveCheck('NfsSliderHandle')`: parent check none, because its `nfsSliderToken` injection is required and NG0201 is the report, with the token's description; no child probes; no peers (its sibling Handle comes from the container's handle list, not from a reference); `strictParents` changes nothing.
  - `NfsSliderFill` calls `nfsDirectiveCheck('NfsSliderFill', {parent: {directives: ['NfsSlider'], found, alone}})`, where `found` says whether its development-only `inject(nfsSliderToken, {optional: true})` returned the slider and `alone` is "The nfs-slider Library mixin positions a fill only inside a slider (.slider > .slider-fill), so this one never shows the selected part of the track.": the parent check replaces development check 6, so a fill outside any slider reports once (M5 with that sentence), a fill inside a slider element but declared in another template reports M4, and a fill inside an `nfsSlider` element whose `NfsSlider` import was forgotten reports the container (M2); no child probes; no peers; under `strictParents` it throws M8 at construction when the lookup found no slider, in development builds only. The fill follows the Handles' same-template rule (Rendering modes, Hydration boundary), so M4's template-outlet fix is the one the Handles need anyway.
  - No Slider directive sits on `ng-template` or `ng-container`.
````

Tests and stories: "2. Browser-level test", line 512: "Dev-mode checks: each of the first five fires once for its case and not for a correct slider; the fill's In-family parent check (check 6) reports a `span[nfsSliderFill]` declared outside any `nfsSlider` once, with the family's sentence, and not one inside, and with `provideNfsRuntimeChecks({strictParents: true})` that fill throws M8 at construction; no warning fires during a server render."

Needs: `nfsDirectiveCheck`; `nfsSliderToken`; `provideNfsRuntimeChecks({strictParents: true})`.

Rule as documented usage: A `span[nfsSliderFill]` must sit inside an `nfsSlider` element declared in the same template; a `NfsSliderHandle` must sit inside an `nfsSlider` element (NG0201 otherwise).

Mentions: line 241 ("in development builds only it injects `nfsSliderToken` (`{optional: true}`) for its In-family parent check"); note that a former "development check 6" for the fill (a `span[nfsSliderFill]` with no `nfsSlider` in its declaration-site injector) was folded into this parent check on 2026-09-29 and is no longer a check of its own -- recorded here, not as a separate misuse/family entry.

### family: Dev check 1 (a third handle)

Location: `### API`, "Dev-mode checks" paragraph, item (1), line 251.

Text:

````
(1) a third handle;
````

Tests and stories: "2. Browser-level test", line 510: "Registration: a first handle inserted later with `@if` takes DOM order after the next render; a third handle reports a dev error."

Needs: the container's handle-registration list (signal).

Rule as documented usage: A slider holds at most two handles (one for a single value, two for a range).

Mentions: none additional.

Boundary call: this check counts the container's own registered children, which could be read as the directive's own state; classified `family` because it is a registration/count check across the container-and-handles family, matching the ruling's "registration checks" example.

### misuse: Dev check 2 (handle with no accessible name)

Location: same paragraph, item (2).

Text:

````
(2) a handle with no accessible name (no `labels`, `aria-label`, `aria-labelledby`, or `title`);
````

Tests and stories: "2. Browser-level test", line 512 (generic coverage); WCAG table row "4.1.2 Name, Role, Value", line 354.

Needs: the handle's `labels`, `aria-label`, `aria-labelledby`, `title`.

Rule as documented usage: Give every handle a name through `<label for>`, `aria-label`, `aria-labelledby`, or `title`.

Mentions: line 354.

### misuse: Dev check 3 (another writer changed the handle's native value or bounds)

Location: same paragraph, item (3); elaborated at line 250 (Signal Forms schema bounds).

Text:

````
(3) another writer changed the handle's native value or its `min`/`max` without a user event (an assistive-technology set arrives as a trusted `input` event, a user event; the rule's own write is a directive-made change), with the hint "a built-in ControlValueAccessor (add ngNoCva) or a schema min()/max() rule";
````

Tests and stories: "2. Browser-level test", line 511: "`nfsAbideInput` beside `nfsSliderHandle` compiles in either attribute order..." wait, actually: line 511 covers Forms; the direct case is under Development-mode checks generic coverage, line 512.

Needs: the last native value/bounds the directive itself wrote or read, compared against an untrusted programmatic write.

Rule as documented usage: Do not write the handle's native `value`, `min`, or `max` from outside the directive (add `ngNoCva` to opt a Reactive/template-driven Forms accessor out, or remove a schema `min()`/`max()` rule; the scale is `start`/`end` on the container).

Mentions: line 250 ("Signal Forms schema bounds").

### family: Dev check 4 (first handle's value exceeds the second's)

Location: same paragraph, item (4).

Text:

````
(4) the first handle's value exceeds the second's;
````

Tests and stories: line 245: "A pair whose first value exceeds the second is not reordered; dev mode warns."

Needs: both handles' `value` models (read from the container's handle list).

Rule as documented usage: Keep the first handle's value at or below the second handle's value; the directive does not reorder them.

Mentions: line 245.

Boundary call: this check compares two peer Handles' values; it could be read as either handle's own directive reading only its own input, but it is an order check across two peer `NfsSliderHandle` instances via the container's registered handle list, matching the ruling's family definition ("order checks") more precisely than a directive reading only its own host. Classified `family`.

### misuse: Dev check 5 (Foundation class copied from Foundation's markup)

Location: same paragraph, item (5).

Text:

````
(5) a Foundation class copied from Foundation's markup (building-blocks 1.4, the initial-state rule), from the static class list read at construction: `vertical` on the container, which the binding strips, names the `vertical` input; `disabled` on the container, stripped too, names the `disabled` input; `slider-handle` on a Handle, which no directive binds or strips, says to remove it, because Foundation's span-handle rules would reach the input; a redundant `slider` on the container or `slider-fill` on the fill merges with the static host class and is not reported;
````

Tests and stories: "2. Browser-level test", line 503: "Copied Foundation classes: a static `class="vertical"` or `class="disabled"` on the container is stripped ... and each is reported once, naming its input; a static `class="slider-handle"` on a Handle stays and is reported once; a redundant `class="slider"` on the container and `class="slider-fill"` on the fill merge with no warning; a consumer's own class on any of them stays with no warning."

Needs: `HostAttributeToken('class')` (development builds only, on `NfsSlider` and `NfsSliderHandle`).

Rule as documented usage: Do not copy `vertical` or `disabled` onto the slider container (bind `vertical`/`disabled` instead); do not copy `slider-handle` onto a Handle (Foundation's span-handle rules, including its `transition`, would reach the native input).

Mentions: line 503; D12, line 585.

### build-time: nfs-slider mixin's contrast and focus-ring checks (rule 0a)

Location: `### Sass`, item (1), table row "0a", `### WCAG 2.2 AA criteria` rows "2.4.7 Focus Visible" and "1.4.11 Non-text Contrast", lines 347, 350; D17, D26.

Text:

````
| 0a | None (a compile-time check, emits no CSS) | `@error` when the unrounded ratio of `$slider-fill-background` against `$slider-background`, of `$slider-handle-background` against `$slider-background`, or of the colour of `$input-border-focus` (read with Foundation's `get-border-value()`) against `$body-background` (the focus ring of rule 6, WCAG 2.4.7 and 1.4.11), computed with the exact WCAG relative-luminance formula by the library's internal contrast helper (`math.pow`; a translucent colour composited over `$body-background` first), is below 3, naming the setting | WCAG 2.2 AA 1.4.11; Foundation's defaults reach 1.31:1 for the fill and nothing in Foundation checks it; a dark `$body-background` would otherwise compile a focus ring that cannot be seen (D26); axe has no rule for it; Foundation's `color-contrast()` is not used because it rounds to one decimal and would pass a ratio as low as 2.95, nor its `color-luminance()`, whose approximate power passes pairs the exact formula fails (D17) |
````

Also the 24 px thumb-height check, `### Sass`, item (1), rule "5a", and the forced-colours rule "13" is a CSS rule, not a check (kept separately, listed below).

Tests and stories: "3. Node-level Vitest", line 521: "Sass compile test: compiling Foundation 6.9 plus the library with Foundation's default slider colours stops with the `@error` naming `$slider-fill-background` (1.31:1); with a passing fill it emits the `nfs-slider` rules and no copy of a Foundation rule; a thumb colour below 3:1 against the track stops with the `@error` naming `$slider-handle-background`; ... with `$input-border-focus: 1px solid $black` and `$body-background: #0a0a0a` (and passing slider colours) the compile stops naming `$input-border-focus`".

Needs: the `nfs-slider` Library mixin; the library's internal exact-WCAG-formula contrast helper; `$slider-fill-background`, `$slider-handle-background`, `$slider-background`, `$input-border-focus`, `$body-background`.

Rule as documented usage: Keep `$slider-fill-background` and `$slider-handle-background` at 3:1 or better against `$slider-background`; keep `$input-border-focus` at 3:1 or better against `$body-background`.

Mentions: D17, line 590; WCAG table rows, lines 347, 350.

### Kept (not a check)

- Required parent injections and NG0201: `NfsSliderHandle` injecting `nfsSliderToken` (captured above as forgotten-import).
- ARIA and focus behaviour: `### ARIA and keyboard` (native slider role, value text, key table).
- Typed inputs and their compile errors: `vertical: NfsVariantBoolean` (`vertical="flase"` fails to compile, line 74, D23).
- Library mixins' CSS rules and Variant properties: the fourteen `nfs-slider` rules (`### Sass`, item 1), including rule 5a (24 px thumb floor, a CSS rule not a check) and rule 13 (forced-colours system colours); "(6) Variant properties: none" (line 702) -- a disclaimer, not a check.
- The library's own tests: the four testing layers under `## Testing Decisions`, and the manual release test.

## specs/smooth-scroll.md

Smooth Scroll has no family: "No parent, no children, no Parent token, no providers, no host directives" (`### Hierarchy and DI shape`, line 123); confirmed by search (no hits for `nfsDirectiveCheck`, `strictParents`, or `In-family`).

### misuse: Development-mode check (href resolves to another document under base href)

Location: `### API`, "Development-mode checks" list, first item, lines 161-163.

Text:

````
- An `href` that starts with `#` but resolves to another document (the `<base href>` case), found at first render or when such a link is clicked: "nfsSmoothScroll does not handle this link: `<base href>` resolves "<raw href>" to <resolved URL>, another document, so it navigates there in every rendering mode (a link host inside a dehydrated block does nothing); bind the current path (`routerLink` with `fragment`, or an `href` built from the current path)". Once per link.
````

Tests and stories: "2. Browser-level test", line 335: "the `<base href>` warning also fires, once, when such a link is clicked, including on a link host whose click arrives with `defaultPrevented` already `true`, which is otherwise not handled."; play function `smooth-scroll--router-link-fragment`, line 323.

Needs: `a.href` (resolved) vs. the document URL; the raw `href` attribute (read only for the message).

Rule as documented usage: Do not write a bare `#id` link inside `nfsSmoothScroll` on a route other than the base URL (under `<base href>`); bind the current path, or use `routerLink` with `fragment`.

Mentions: D9, line 391; user stories 16, 51.

### misuse: Development-mode check (handled link's fragment names no element)

Location: same list, second item, line 164.

Text:

````
- A handled link whose fragment names no element: "no element with id '<id>'". Once per link.
````

Tests and stories: `smooth-scroll--link-filters` play function, line 320 ("a link to a missing id is not handled"); browser-level test, line 329.

Needs: HTML's indicated-part resolution (id lookup, or `a[name]` fallback).

Rule as documented usage: Give every in-page link's fragment a matching `id` (or `a[name]`) in the document.

Mentions: user story 15.

### misuse: Development-mode check (link host with no in-page links)

Location: same list, third item, line 165.

Text:

````
- A link host that is not an `a` element and contains no link: "nfsSmoothScroll on <tag> has no in-page links". Once.
````

Tests and stories: browser-level test generic coverage, line 335.

Needs: the host's tag name and its `a[href]` descendants.

Rule as documented usage: Put `nfsSmoothScroll` on an `a[href]` element, or on a container that holds at least one in-page link.

Mentions: none additional.

### Kept (not a check)

- Required parent injections: none (no family).
- ARIA and focus behaviour: `### ARIA and keyboard`, `### Focus` sections.
- Typed inputs and their compile errors: none (SmoothScroll takes no inputs, D11, line 393).
- Library mixins' CSS rules: the one `nfs-smooth-scroll` rule (`### Sass`).
- The library's own tests: the four testing layers under `## Testing Decisions`.

## specs/sticky.md

### forgotten-import: In-family checks

Location: `### Hierarchy and DI shape`, line 135.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsStickyContainer` calls `nfsDirectiveCheck('NfsStickyContainer', {children: ['NfsSticky']})` and probes the `nfsSticky` elements inside it; `NfsSticky` calls `nfsDirectiveCheck('NfsSticky')` and probes nothing (its sentinels are its own elements and carry no directive attribute). Neither has a parent check, because neither injects a parent (above): a sticky element may sit in any parent, and development warning 1 reads the parent's computed `position` from the DOM, leaving a parent that carries `nfsStickyContainer` without `.sticky-container`, a forgotten `NfsStickyContainer`, to the `strictDirectiveImports` check and the static check. No peer is linked by reference or value (`#s="nfsSticky"` is the consumer's read, and the bar, callout, and cell directives written beside belong to their own families); `strictParents` changes nothing.
````

Tests and stories: none dedicated in this file (`strictDirectiveImports` and the static check are the shared utility's own tests).

Needs: `nfsDirectiveCheck`; `strictDirectiveImports`.

Rule as documented usage: none -- a forgotten `NfsStickyContainer` import is caught by the shared `strictDirectiveImports` Runtime check and the static CI check, not by anything this spec asks the consumer to write differently.

Mentions: cross-referenced by development warning 1 (below), which explicitly defers the "forgotten import" case to this machinery.

### family: Development warning 1 (parent not positioned)

Location: `### API`, "Development-mode warnings" list, item 1, line 169.

Text:

````
1. The parent element's computed `position` is `static`: "ngx-foundation-sites: the parent of an nfsSticky element is not positioned. Add nfsStickyContainer to the parent so the Sticky state is measured correctly." Not given when the parent carries the `nfsStickyContainer` attribute without `.sticky-container`: that is a forgotten `NfsStickyContainer` import, which the `strictDirectiveImports` Runtime check reports once on the parent with the import to add, and the static check in CI, so the warning never asks for a directive already written.
````

Tests and stories: "2. Browser-level test", line 345: "Development warnings: each of the five fires once for its case and not for the correct case; warning 1 is also silent for a parent that carries `nfsStickyContainer` without the directive".

Needs: the parent element's computed `position` (`getComputedStyle`).

Rule as documented usage: Put `nfsStickyContainer` on the sticky element's parent.

Mentions: line 135 (In-family checks, explaining the exception for a forgotten import).

### family: Development warning 2 (parent no taller than the element)

Location: same list, item 2, line 170.

Text:

````
2. The parent's content height is not larger than the element's height: "... this nfsSticky element's Sticky range is its parent, which is no taller than the element, so it never sticks. Make the parent span the range you want (Foundation's topAnchor/btmAnchor recipe)."
````

Tests and stories: generic coverage, line 345.

Needs: the parent's content height and the element's own height (`getBoundingClientRect` or equivalent).

Rule as documented usage: Size the parent (the Sticky range) taller than the sticky element itself.

Mentions: user story 21, line 39.

### misuse: Development warning 3 (overflow: hidden ancestor)

Location: same list, item 3, line 171.

Text:

````
3. The nearest scroll container is an element with computed `overflow` `hidden` in either axis: "... an ancestor with overflow: hidden (<selector-ish description>) is the scroll container of this nfsSticky element, so it cannot stick while the page scrolls. Use overflow: clip on that ancestor if it only needs to clip."
````

Tests and stories: story `sticky--overflow-hidden-ancestor`, line 329; "2. Browser-level test" generic coverage, line 345.

Needs: the scroll-container walk (nearest ancestor whose computed `overflow-x`/`overflow-y` is neither `visible` nor `clip`).

Rule as documented usage: Give a clipping ancestor `overflow: clip` instead of `overflow: hidden` when it only needs to clip.

Mentions: user story 20, line 38; D20, line 411.

Boundary call: the offending ancestor is not necessarily the `nfsStickyContainer` parent (it is "the nearest scroll container", found by a generic DOM walk up from the parent) and Sticky has no directive family spanning arbitrary ancestors; classified `misuse` (reads the page) rather than `family`, unlike warnings 1 and 2, which name the parent specifically.

### misuse: Development warning 4 (leftover anchor attributes)

Location: same list, item 4, line 172.

Text:

````
4. The host carries `data-anchor`, `data-top-anchor`, or `data-btm-anchor`: "... Foundation's anchor Options are not supported; the Sticky range is the parent element. Size or place the parent to span the range."
````

Tests and stories: generic coverage, line 345.

Needs: the host's static `data-anchor`, `data-top-anchor`, `data-btm-anchor` attributes.

Rule as documented usage: Remove `data-anchor`, `data-top-anchor`, and `data-btm-anchor`; size or place the parent to span the wanted range instead.

Mentions: D3, line 394.

### misuse: Development warning 5 (focused element hidden behind a stuck element)

Location: same list, item 5, line 173.

Text:

````
5. While the element is stuck, a newly focused element (checked in the animation frame after a `focusin` on the document, so the browser's scroll-into-view has happened) lies entirely inside the stuck element's rectangle and outside the element itself: "... a focused element is hidden behind a stuck nfsSticky element (WCAG 2.4.11). Add scroll-padding-top (or scroll-padding-bottom for stickTo bottom) of at least the stuck element's height plus its inset to the scroll container." The `focusin` listener exists only in development builds and only while the element is stuck; it is added in code, so it never replays.
````

Tests and stories: "2. Browser-level test", line 345: "warning 5 fires when a focused link ends up entirely under a stuck bar without `scroll-padding` and not with it, and its `focusin` listener is absent while the element is not stuck."; e2e "Focus not obscured (2.4.11)" on `sticky--navigation`, line 361.

Needs: a development-only `focusin` listener on `document`; the stuck element's rectangle vs. the newly focused element's rectangle.

Rule as documented usage: Add `scroll-padding-top` (or `scroll-padding-bottom` for `stickTo="bottom"`) of at least the stuck element's height plus its inset to the scroll container.

Mentions: user stories 33, 39, lines 51, 57; D15, line 406.

### Kept (not a check)

- Required parent injections and NG0201: none (Sticky has no required parent; captured as forgotten-import above).
- ARIA and focus behaviour: `### ARIA and keyboard` (no APG pattern; focus unaffected).
- Typed inputs and their compile errors: none of Sticky's Options are Variant inputs (no Variant class exists, D16).
- Library mixins' CSS rules and Variant properties: the `nfs-sticky` mixin's two rules (`### Sass`); "6. Variant properties: none" (line 529) -- a disclaimer, not a check.
- The library's own tests: the four testing layers under `## Testing Decisions`.

## specs/switch.md

### forgotten-import: In-family checks

Location: `### Hierarchy and DI shape`, lines 129-134.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsSwitch` calls `nfsDirectiveCheck('NfsSwitch', {children: ['NfsSwitchInput', 'NfsSwitchPaddle']})`: no parent check; it probes the input and the paddle; no peers; `strictParents` changes nothing.
  - `NfsSwitchInput` calls `nfsDirectiveCheck('NfsSwitchInput')`: no parent check (no directive of the family injects another: the cascade does the parent's work), no child probes; peers: its paddle, linked by the paddle's `for` (a value), which check 6 reads from the paddle's side and check 2 from the input's; `strictParents` changes nothing.
  - `NfsSwitchPaddle` calls `nfsDirectiveCheck('NfsSwitchPaddle', {children: ['NfsSwitchActive', 'NfsSwitchInactive']})`: no parent check; it probes the two inner labels; peers: its input, as above; `strictParents` changes nothing.
  - `NfsSwitchActive` and `NfsSwitchInactive` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
  - Check 6 reads the DOM alone, so it also takes a previous sibling that carries the `nfsSwitchInput` attribute as the input: an input whose `NfsSwitchInput` import was forgotten carries the attribute without the class, `NfsSwitch`'s probe reports it once (M2), and check 6 adds no second report saying the paddle does not follow its input, which it does. No Switch directive sits on `ng-template` or `ng-container`.
````

Tests and stories: "2. Browser-level test", line 378: "a paddle after an input that carries `nfsSwitchInput` while the test host does not import `NfsSwitchInput` is silent, and `NfsSwitch` reports that input once (M2)."

Needs: `nfsDirectiveCheck`.

Rule as documented usage: A `label[nfsSwitchPaddle]` and its `input[nfsSwitchInput]` must both be imported.

Mentions: D19, line 458.

### misuse: NfsSwitch copied-class check

Location: `### API per directive`, table row for `NfsSwitch`'s "Development check" column, line 156.

Text:

````
A static class list holding `tiny`, `small`, or `large` warns once: "class="small" is set by nfsSwitch: bind size="small" instead"
````

Tests and stories: "2. Browser-level test", line 379: "`NfsSwitch` check: `class="switch small"` warns once naming `size`; `class="switch"` and the consumer's own class do not."; "3. Node-level Vitest", line 385 (SSR smoke: "no copied `small` on the stripped container").

Needs: the size Variant class record; the host's static `class` list.

Rule as documented usage: Do not copy `tiny`, `small`, or `large` onto `nfsSwitch`; bind `size` instead.

Mentions: user story 16, line 51.

### misuse: Dev check 1 (no accessible name)

Location: `### API per directive`, "Development checks, in one `afterNextRender`..." list, item 1, line 166.

Text:

````
1. No accessible name: nothing names the input, taken in accessible-name order from the text of the elements `aria-labelledby` references, a non-blank `aria-label`, the text of its `labels` outside `aria-hidden="true"` subtrees, then `title`, where text also counts the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` (building-blocks 1.10, Names): "nfsSwitchInput: this switch has no accessible name; add a visible <label for="<id>"> before the switch, or aria-labelledby to visible text (WCAG 1.3.1, 3.3.2, 4.1.2)".
````

Tests and stories: "2. Browser-level test", line 376: "no name warns once; `aria-label=""` warns; `aria-labelledby` at a missing id warns; a visible `<label for>`, `aria-labelledby` at visible text, and a non-blank `aria-label` are silent; a visible `<label for>` that holds only an `img` with a non-blank `alt` is silent"; WCAG table row "3.3.2 Labels or Instructions" and "4.1.2", lines 255, 257.

Needs: the input's `aria-labelledby`, `aria-label`, `labels`, `title`.

Rule as documented usage: Name every switch with a visible `<label for>` before it, or `aria-labelledby` to visible text.

Mentions: user story 8, line 43; D5, line 444.

### misuse: Dev check 2 (paddle text joins the name)

Location: same list, item 2, line 167.

Text:

````
2. Paddle text in the name: the input has no `aria-labelledby` and no non-blank `aria-label`, and its `nfsSwitchPaddle` label holds text outside `aria-hidden="true"` subtrees, or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` (Foundation's `.show-for-sr` pattern): "nfsSwitchInput: text inside the paddle label joins this switch's name, and sighted users never see it: it names the switch without a visible label, or repeats a visible one; put the name in a visible <label for="<id>"> or aria-labelledby, and leave the paddle without text (WCAG 3.3.2, 2.5.3)". The inner labels are `aria-hidden` and never trigger it.
````

Tests and stories: "2. Browser-level test", line 376: "hidden text in the paddle warns with the paddle-text message, alone and beside a visible label, and so does an `img` with a non-blank `alt` in the paddle; inner labels alone in the paddle are silent; `aria-labelledby` or `aria-label` silences the paddle-text warning"; WCAG table rows "3.3.2" and "2.5.3 Label in Name", lines 255-256.

Needs: the paddle's (`nfsSwitchPaddle`) text content outside `aria-hidden` subtrees.

Rule as documented usage: Leave the paddle label without text; put the switch's name in a visible `<label for>` or `aria-labelledby`.

Mentions: user story 9, line 44; D4, line 443.

Boundary call: this check reads content held by a peer directive (the paddle, linked by `for`) to determine whether it affects the input's own accessible name; the In-family checks bullet (above) explicitly notes "check 2 from the input's [side]", i.e. it is the input's own check into its accessible-name computation, which draws on associated labels the same way dev check 1 does. Classified `misuse` (the input's own naming correctness, matching check 1) rather than `family`, though the text it reads belongs to a peer.

### misuse: Dev check 3 (static type missing or wrong)

Location: same list, item 3, line 168.

Text:

````
3. Static `type`: the static `type` attribute (from `HostAttributeToken`) is missing or is neither `checkbox` nor `radio`: "nfsSwitchInput: write type="checkbox" or type="radio" as a static attribute; a switch is one of the two, and Angular Forms picks its checkbox and radio value accessors from the static attribute".
````

Tests and stories: "2. Browser-level test", line 376: "no static `type`, `type="text"`, and `[type]="'checkbox'"` warn; `type="checkbox"` and `type="radio"` are silent".

Needs: `HostAttributeToken('type')` (development builds only, optional).

Rule as documented usage: Write `type="checkbox"` or `type="radio"` as a static attribute on `nfsSwitchInput`.

Mentions: user story 5, line 40; D2, line 441.

### misuse: Dev check 4 (role="switch" on a radio)

Location: same list, item 4, line 169.

Text:

````
4. Radio role: `type="radio"` with `role="switch"`: "nfsSwitchInput: role="switch" is not allowed on a radio (ARIA in HTML); a radio switch keeps its radio role".
````

Tests and stories: "2. Browser-level test", line 376: "`role="switch"` on a radio warns and on a checkbox is silent".

Needs: the input's static `type` and `role` attributes.

Rule as documented usage: Do not put `role="switch"` on a `type="radio"` switch.

Mentions: user story 11, line 46; D3, line 442.

### family: Dev check 5 (radio switches in no named group)

Location: same list, item 5, line 170.

Text:

````
5. Radio group: the input's `type` is `radio`, and no ancestor that holds every radio of its group is a named group. The group is HTML's radio button group: the radios in the same tree with the same form owner (`form`) and the same non-empty `name`; a radio without a `name` is a group of one. A named group is a `fieldset` without a `role` attribute, or an element whose `role` is `group` or `radiogroup`, with a name taken in accessible-name order from the text of the elements its `aria-labelledby` references, a non-blank `aria-label`, for a `fieldset` the text of its first `legend` child outside `aria-hidden="true"` subtrees, then `title`, where text also counts the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"`. Only the group's first `nfsSwitchInput` host in tree order reports, so a group warns once: "nfsSwitchInput: the radio switches with name="<name>" have no named group around them, so assistive technology announces no question for them; put them in a <fieldset> whose first child is a <legend> stating the question, as every example does (WCAG 1.3.1)", with `id="<id>"` in place of the name for a radio without one. Each radio switch reads its group once, as rendered at its own first render.
````

Tests and stories: "2. Browser-level test", line 377 (extensive, 24 grouping patterns); WCAG table row "1.3.1 Info and Relationships", line 254.

Needs: HTML's radio button group (same form owner and `name`); the `fieldset`/`role="group"`/`role="radiogroup"` ancestor lookup and its accessible name.

Rule as documented usage: Put radio switches that share a `name` inside a `fieldset` whose first child is a `legend` stating the question (or another named group/radiogroup ancestor).

Mentions: user stories 4, 12, 21, lines 39, 47, 56; D16, line 455; out-of-scope item, line 423.

### family: Dev check 6 (paddle link)

Location: `### API per directive`, table row for `NfsSwitchPaddle`'s "Development check" column, line 158; full text at item 6, line 171.

Text:

````
6. Paddle link (on `NfsSwitchPaddle`): the paddle's previous element sibling is not an `nfsSwitchInput` host (seen as the class it binds, or as the `nfsSwitchInput` attribute, which an input whose import was forgotten still carries and `NfsSwitch`'s In-family probe reports), or the paddle's `control` is not that input: "nfsSwitchPaddle: the paddle label must directly follow its nfsSwitchInput and name it with for="<id>"; Foundation selects the switch's states with input:checked ~ .switch-paddle and input:checked + label, and without the link a press on the track does not reach the input (WCAG 2.5.8)".
````

Tests and stories: "2. Browser-level test", line 378: "a paddle directly after its input with a matching `for` is silent; a missing `for`, a `for` naming another input, and an element between input and paddle each warn once".

Needs: DOM sibling order (paddle's `previousElementSibling`); the paddle's `control` (via `for`).

Rule as documented usage: Write the paddle `<label>` directly after its `nfsSwitchInput` in the DOM, naming it with `for="<id>"`.

Mentions: user story 18, line 53.

### build-time: nfs-switch mixin's contrast, focus-ring, and size checks

Location: `### Sass`, item (1)(d), lines 551-552; WCAG table rows "1.4.11", "2.4.7", "1.4.3", "2.5.8", lines 248-253; D11.

Text:

````
(d) Compile-time checks that emit no CSS, with the unrounded ratio of the library's exact relative-luminance helper (`math.pow`), never Foundation's `color-luminance()` or `color-contrast()`: one `@error` listing every failing item, each with the setting and the ratio: `$switch-background`, `$switch-background-focus`, `$switch-background-active`, and `$switch-background-active-focus` each under 3:1 against `$body-background`, or `$switch-paddle-background` under 3:1 against any of them (1.4.11); the colour of `$input-border-focus`, read with Foundation's `get-border-value()`, under 3:1 against `$body-background` (2.4.7, 1.4.11); `$switch-height-tiny`, `$switch-height-small`, `$switch-height`, or `$switch-height-large` under 24 px, a rem value converted at the consumer's `$global-font-size` through Foundation's `rem-calc()` and a px value read as it is (2.5.8). One `@warn` listing `$white` inner-label text under 4.5:1 on `$switch-background` or `$switch-background-focus` (the inactive word) and on `$switch-background-active` or `$switch-background-active-focus` (the active word) (1.4.3).
````

Tests and stories: "3. Node-level Vitest", lines 386-394 (full Sass compile test list, e.g. "Foundation's defaults plus `@include nfs-switch;` stop with one `@error` naming `$switch-background` against `$body-background` (1.625:1)...").

Needs: the `nfs-switch` Library mixin; the library's exact-WCAG-formula contrast helper; `$switch-background`, `$switch-background-focus`, `$switch-background-active`, `$switch-background-active-focus`, `$switch-paddle-background`, `$input-border-focus`, `$body-background`, `$switch-height*`, `$global-font-size`.

Rule as documented usage: Keep every track colour at 3:1 or better against the page and the knob; keep `$input-border-focus` at 3:1 or better against `$body-background`; keep every `$switch-height*` setting at 24 px or more; keep inner-label text at 4.5:1 or better against its track.

Mentions: D10, D11, lines 449-450; user stories 25, 26, 31, 32.

### Kept (not a check)

- Required parent injections and NG0201: none (the cascade, not DI, does the family's work; no parent injection exists).
- ARIA and focus behaviour: `### ARIA and keyboard`, `### When to add role="switch"`.
- Typed inputs and their compile errors: `size: NfsSwitchSize` (D7, line 446).
- Library mixins' CSS rules and Variant properties: the `nfs-switch` rules (a), (b), (c) (`### Sass`, item 1); "6. Variant properties: none" (line 556) -- a disclaimer, not a check.
- The library's own tests: the four testing layers under `## Testing Decisions`, and the manual release test.

## specs/table.md

### forgotten-import: In-family checks

Location: `### Hierarchy and DI shape`, line 108.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsTableScroll` calls `nfsDirectiveCheck('NfsTableScroll', {children: ['NfsTable']})` and probes an `nfsTable` inside it, so a forgotten `NfsTable` in a wrapper is reported, as is an `nfsTable` on an element other than a `table`; a plain table carries no attribute and is never reported. `NfsTable` calls `nfsDirectiveCheck('NfsTable')` and probes nothing, because the caption, row groups, rows, and cells carry no directive. Neither has a parent check, because neither injects a parent and a table outside a wrapper is Foundation's usual form; neither has a peer linked by reference or value (a region's `aria-labelledby` names the consumer's caption, not a directive); `strictParents` changes nothing. The entry point imports `nfsDirectiveCheck` from `ngx-foundation-sites/media-query` for this call alone; the call sits behind the inline `ngDevMode` guard, so a production build keeps nothing of it.
````

Tests and stories: none dedicated in this file.

Needs: `nfsDirectiveCheck`.

Rule as documented usage: none -- this catches a forgotten `NfsTable` import inside a wrapper; nothing new for the consumer to write.

Mentions: line 104 ("Only the wrapper's development In-family check names `NfsTable`, to probe an `nfsTable` inside it").

### misuse: NfsTable Dev check 1 (no accessible name)

Location: `### API: NfsTable`, "Development-mode checks" list, item 1, line 149.

Text:

````
1. No accessible name (D9): the name from the text of the elements `aria-labelledby` references, then a non-blank `aria-label`, then the `<caption>`'s text, then a non-blank `title`, where text also counts the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` (building-blocks 1.10, Names), is empty: "nfsTable: this table has no accessible name; give it a <caption> (APG Table pattern). With scroll it is a focus stop, and a focus stop needs a name (WCAG 4.1.2)." Checked at the first render, because the name must be in server HTML.
````

Tests and stories: "2. Browser-level test", line 335: "`NfsTable` with a `<caption>`, `aria-labelledby` at text, or `aria-label` is silent, and so is a `<caption>` that holds only an `img` with a non-blank `alt`, and with none warns once".

Needs: the table's `aria-labelledby`, `aria-label`, `<caption>`, `title`.

Rule as documented usage: Give every `<table>` an accessible name -- a `<caption>`, `aria-labelledby`, or `aria-label`.

Mentions: D9, line 395.

### misuse: NfsTable Dev check 2 (hidden header or footer on a stacked table)

Location: same list, item 2, line 150.

Text:

````
2. Hidden header or footer on a stacked table (D8): while `stack()` is set, its `tHead` or `tFoot` computes `display: none`: "nfsTable: this stacked table hides its <thead> (set $show-header-for-stacked: true) / its <tfoot> (add @include nfs-table; after foundation-table), so its column headers or footer are lost below $table-stack-breakpoint (WCAG 1.3.1, 1.4.10)." It can fire only in a render made while the page is below the stack breakpoint; the e2e layer covers the narrow viewport.
````

Tests and stories: "2. Browser-level test", line 335: "a `stack` table rendered in a test page whose stylesheet hides its `tfoot` warns once naming `@include nfs-table;`, and one that hides its `thead` warns naming `$show-header-for-stacked: true`".

Needs: the table's own computed `display` of `thead`/`tfoot`.

Rule as documented usage: Set `$show-header-for-stacked: true` and include `nfs-table` so a stacked table keeps its column headers and footer.

Mentions: D8, line 394.

### misuse: NfsTable Dev check 3 (both stripe inputs set)

Location: same list, item 3, line 151.

Text:

````
3. Both stripe inputs (D5): `striped()` and `unstriped()` are both set: "nfsTable: striped and unstriped are both set; set the one that names the look you want."
````

Tests and stories: "2. Browser-level test", line 335: "`striped` with `unstriped` warns once".

Needs: the `striped` and `unstriped` inputs.

Rule as documented usage: Set only one of `striped` or `unstriped`, not both.

Mentions: user story 13, line 39; D5, line 391.

### misuse: NfsTable Dev check 4 (copied Variant classes)

Location: same list, item 4, line 152.

Text:

````
4. Copied classes (D12): a static class list that holds `hover`, `unstriped`, `striped`, `stack`, or `scroll` warns once, naming each class with its input, for example "class="hover stack" is set by nfsTable: bind hover and stack instead". Those classes are stripped (the bindings above), so the table loses the look until the input is bound. A copied `table-scroll` on a table is not one of `NfsTable`'s classes and is not reported.
````

Tests and stories: "2. Browser-level test", line 335: "`class="hover stack"` warns once naming `hover` and `stack`, and the consumer's own classes are not reported".

Needs: `HostAttributeToken('class')` (development builds only, on `NfsTable`).

Rule as documented usage: Do not copy `hover`, `unstriped`, `striped`, `stack`, or `scroll` onto `<table>`; bind the matching input instead.

Mentions: user story 12, line 38; D12, line 398.

### misuse: NfsTableScroll Dev check (no accessible name)

Location: `### API: NfsTableScroll`, line 167.

Text:

````
Development-mode check (D9), in one `afterNextRender` that exists only when `ngDevMode` is on, once per instance: the name from `aria-labelledby` text (an image's non-blank `alt`, or the non-blank `aria-label` of an element with `role="img"`, counting as text), a non-blank `aria-label`, or a non-blank `title` is empty: "nfsTableScroll: this scroll region has no accessible name; point aria-labelledby at its table's <caption> or add aria-label (WCAG 4.1.2; WAI-ARIA: authors MUST give each element with role region a brief label). Its content does not name it." A `region` is named by its author only, and axe checks no region name (measured).
````

Tests and stories: "2. Browser-level test", line 335: "`NfsTableScroll` with `aria-labelledby` at the caption or `aria-label` is silent, and with none, `aria-label=""`, or `aria-labelledby` at a missing id warns once".

Needs: the wrapper's `aria-labelledby`, `aria-label`, `title`.

Rule as documented usage: Point `aria-labelledby` at the table's `<caption>`, or add `aria-label`, on every `div[nfsTableScroll]`.

Mentions: user story 14, line 40; D9, line 395.

### build-time: nfs-table mixin's stacked-header and contrast checks

Location: `### Sass`, item (1)(b), line 465; WCAG table rows "1.3.1" and "1.4.3", lines 227, 229; D7, D11.

Text:

````
(b) Compile-time checks that emit no CSS: one `@error` that lists each failure, computed by the library's exact relative-luminance helper (`math.pow`), unrounded, which composites a translucent colour over `$body-background` first: `$show-header-for-stacked` is not `true` (D7); and every pair under 4.5:1 of `$body-font-color` on `$table-background` and `$table-row-hover` and, while `$table-stripe` is `even` or `odd`, on `$table-striped-background` and `$table-row-stripe-hover`; `$table-head-font-color` on `$table-head-background` and `$table-head-row-hover`; `$table-foot-font-color` on `$table-foot-background` and `$table-foot-row-hover`; and `$anchor-color` and `$anchor-color-hover` on each of those eight backgrounds (D11). Each failure names the settings and the ratio.
````

Tests and stories: "3. Node-level Vitest", line 343: "Foundation's defaults plus `@include nfs-table;` stop with one `@error` naming `$show-header-for-stacked` and seven `$anchor-color` pairs...".

Needs: the `nfs-table` Library mixin; the library's exact-WCAG-formula contrast helper; `$show-header-for-stacked`, `$body-font-color`, the eight table background settings, `$table-head-font-color`, `$table-foot-font-color`, `$anchor-color`, `$anchor-color-hover`.

Rule as documented usage: Set `$show-header-for-stacked: true`; keep body text, header/footer text, and links at 4.5:1 or better on every table background, at rest and on hover.

Mentions: D7, D11, lines 393, 397; user stories 16, 17, 18.

### Kept (not a check)

- Required parent injections and NG0201: none (no parent DI relationship).
- ARIA and focus behaviour: `### ARIA and keyboard` (native table semantics, `tabindex="0"` scroll regions).
- Typed inputs and their compile errors: the five boolean Variant inputs (`stack="flase"` fails to compile, D2, line 388).
- Library mixins' CSS rules and Variant properties: the one `table.stack tfoot` rule (`### Sass`, item 1(a)); "6. Variant properties: none" (line 470) -- a disclaimer, not a check.
- The library's own tests: the four testing layers under `## Testing Decisions`.

## specs/tabs.md

### forgotten-import: In-family checks and token descriptions

Location: `### Hierarchy and DI shape`, line 156 (token descriptions), lines 165-173 (In-family checks bullets).

Text (token descriptions):

````
The two parent tokens carry a description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `nfsTabsGroupToken = new InjectionToken<NfsTabsGroup>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsTabsGroupToken (provided by NfsTabsGroup from 'ngx-foundation-sites/tabs' on an ancestor element declared in the same template)" : '')`, and `nfsTabsToken` the same with "nfsTabsToken (provided by NfsTabs from 'ngx-foundation-sites/tabs' on an ancestor element declared in the same template)"; the Defaults token is not a parent token.
````

Text (In-family checks):

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsTabsGroup` calls `nfsDirectiveCheck('NfsTabsGroup', {children: ['NfsTabs', 'NfsTabsContent', 'NfsTabsPanel']})`: no parent check (it has no parent); it probes the strip, the content box, and the panels, the three parts that inject its token, a tab set nested in a panel keeping its own; no peers; `strictParents` changes nothing.
  - `NfsTabs` calls `nfsDirectiveCheck('NfsTabs', {children: ['NfsTabsTitle', 'NfsTab']})`: parent check none, because its `nfsTabsGroupToken` injection is required and NG0201 is the report; it probes the titles, which inject nothing, and the tabs, which inject its token; no peers; `strictParents` changes nothing.
  - `NfsTabsTitle` calls `nfsDirectiveCheck('NfsTabsTitle')`: no parent check (it injects no parent; the strip probes it); no child probes (the strip probes its tab); no peers; `strictParents` changes nothing.
  - `NfsTab` calls `nfsDirectiveCheck('NfsTab')`: parent check none, because its `nfsTabsToken` injection is required; no child probes; peers: its panel, paired by `value`, which no probe checks (Aria warns on a repeated value); `strictParents` changes nothing. Its development warning for a tab whose parent element is not an `li[nfsTabsTitle]` reads the element and the attribute, so a title whose `NfsTabsTitle` import was forgotten does not trip it: an `li` that carries the `nfsTabsTitle` attribute without `.tabs-title` is a forgotten import, which the strip's probe reports once (M2), the shared spec's rule for a family check that reports placement from the DOM alone.
  - `NfsTabsContent` calls `nfsDirectiveCheck('NfsTabsContent')`: parent check none, because its `nfsTabsGroupToken` injection is required, with the token's description; no child probes (the group probes the panels, which register with the group, not with the content box); no peers; `strictParents` changes nothing.
  - `NfsTabsPanel` calls `nfsDirectiveCheck('NfsTabsPanel')`: parent check none, because its `nfsTabsGroupToken` injection is required; no child probes; peers: its tab, by `value`; `strictParents` changes nothing.
  - `NfsTabsLazyContent` sits on `ng-template` and calls nothing, so only the static check sees a forgotten one.
  - The NG0201 a developer sees: `NfsTabs`, `NfsTab`, and `NfsTabsPanel` host Aria's `TabList`, `Tab`, and `TabPanel`, which inject Aria's own `TABS` or `TAB_LIST` token without `optional`, and Angular runs a host directive's constructor before its host's (the directive composition guide, "Directive execution order"). A strip or panel outside a group, or a tab outside a strip, including under an element whose `NfsTabsGroup` or `NfsTabs` import was forgotten, therefore throws Aria's NG0201 for `TABS` or `TAB_LIST`, which names no library directive, before the part's own injection runs, and the view throws before the probes or `strictDirectiveImports` see a render. The two descriptions are printed where the library's injection is the first to fail: `NfsTabsContent` outside a group (it hosts nothing), and a part under a consumer's own Aria `ngTabs` or `ngTabList`. The static check reports a forgotten `NfsTabsGroup` or `NfsTabs` (NFS9001).
````

Tests and stories: "2. Browser-level test", line 516: "a tab inside an `li[nfsTabsTitle]` whose `NfsTabsTitle` import is missing from the test host does not warn as a tab outside a title, and the strip's probe reports the title once."

Needs: `nfsDirectiveCheck`; `nfsTabsGroupToken`; `nfsTabsToken`; `strictDirectiveImports`; the static check (NFS9001).

Rule as documented usage: `NfsTabsGroup` must enclose `NfsTabs`, `NfsTabsContent`, and every `NfsTabsPanel`; every `NfsTab` must sit inside `NfsTabs`.

Mentions: none additional.

### misuse: Dev-mode check (tab list has no accessible name)

Location: `### API`, "Dev-mode checks (one `afterRenderEffect`...)" paragraph, first clause, line 242.

Text:

````
Dev-mode checks (one `afterRenderEffect`, only when `ngDevMode` is on, each warning once per instance): the strip has neither `aria-label` nor `aria-labelledby`;
````

Tests and stories: "2. Browser-level test", line 516 (generic coverage of "no list name"); WCAG table row "4.1.2", line 361.

Needs: the strip's `aria-label`/`aria-labelledby`.

Rule as documented usage: Give every `ul[nfsTabs]` a name with `aria-label` or `aria-labelledby`.

Mentions: user story 24, line 58.

### misuse: Dev-mode check (generated panel id under deepLink)

Location: same paragraph, second clause, line 242.

Text:

````
a generated panel id while `deepLink` is on;
````

Tests and stories: generic coverage, line 516.

Needs: the panel's `id` (generated vs. consumer-supplied, tested against Aria's `ng-tabpanel-` prefix).

Rule as documented usage: Give every panel a consumer-supplied `id` when `deepLink` is on.

Mentions: line 238 ("Panel ids must be consumer-supplied; a panel whose id is generated ... triggers a dev-mode warning while `deepLink` is on").

### misuse: Dev-mode check (static autoFocus attribute on the strip)

Location: same paragraph, third clause, line 242; D25, line 592.

Text:

````
a static `autoFocus` attribute on the strip, read with `inject(new HostAttributeToken('autoFocus'), {optional: true})` in a field initialiser that runs only when `ngDevMode` is on, naming `[autoFocus]="true"` and `nfsTabsDefaultsToken` (D25).
````

Tests and stories: "2. Browser-level test", line 516: "a static `autoFocus` on the strip [warns], while a bound `[autoFocus]="true"` does not warn".

Needs: `HostAttributeToken('autoFocus')` (development builds only).

Rule as documented usage: Set `autoFocus` by binding (`[autoFocus]="true"`) or through `nfsTabsDefaultsToken`, never as a static attribute.

Mentions: D25, line 592.

### misuse: Copied-class check (NfsTabs, NfsTabsTitle, NfsTabsContent, NfsTabsPanel)

Location: `### API`, the paragraph beginning "Copied-class check (development builds only...)", line 243.

Text:

````
Copied-class check (development builds only, the Accordion spec's dev check 7 applied here): `NfsTabs`, `NfsTabsTitle`, `NfsTabsContent`, and `NfsTabsPanel` each read their host's static `class` with `inject(new HostAttributeToken('class'), {optional: true})` in a field initialiser that runs only when `ngDevMode` is on, because the rendered class list no longer shows a class the host binding has stripped, and each warns once in its first render callback when that list holds, as a whole token, a class it binds dynamically. The message names the input to bind: `is-active` on a title or a panel, "select the tab with `selected` on `ul[nfsTabs]`"; `vertical` on the strip or the content box, "set `orientation="vertical"` on `ul[nfsTabs]`"; `simple` or `primary` on the strip, "bind `simple`" or "bind `primary`". Structural classes written redundantly (`class="tabs"`, `class="tabs-panel"`) merge with the static host classes and are not reported.
````

Tests and stories: "2. Browser-level test", line 508: "a host that copies `class="is-active"` onto a title and a panel, `class="vertical simple primary"` onto the strip, and `class="vertical"` onto the content box renders none of those classes, leaves the first tab selected and the strip horizontal, and warns once per directive, naming the input to bind; `class="tabs"` on the strip and `class="tabs-panel"` on a panel are not reported."

Needs: `HostAttributeToken('class')` (development builds only, on all four directives).

Rule as documented usage: Do not copy `is-active`, `vertical`, `simple`, or `primary` onto Tabs elements; select the tab with `selected`, set `orientation="vertical"`, or bind `simple`/`primary` instead.

Mentions: D24, line 591.

### family: NfsTab Dev warning (tab's parent element is not li[nfsTabsTitle])

Location: `### API`, `NfsTab` bullet, line 259.

Text:

````
Dev mode warns on an `href`, and on a tab whose parent element is not an `li[nfsTabsTitle]` (an `li` without `role="presentation"` inside a `tablist` breaks the required-children rule), tested with the selector on the element and its attribute, not with `.tabs-title`, so a title whose import was forgotten is left to the strip's In-family probe (Hierarchy and DI shape).
````

Tests and stories: covered implicitly by "2. Browser-level test", line 516 (the forgotten-import exception); no dedicated case named for the plain "wrong parent element" scenario, beyond generic warning coverage.

Needs: the tab's parent element (`NfsTab.parentElement`) and whether it carries `nfsTabsTitle`.

Rule as documented usage: Write every `a[nfsTab]` as the direct child of an `li[nfsTabsTitle]`.

Mentions: none additional.

Boundary call: this check reads the tab's parent element, which fits the ruling's family definition ("DOM-only placement checks") more than a directive reading only its own host; classified `family`.

### misuse: NfsTab Dev warning (href on a tab)

Location: same bullet, line 259.

Text:

````
No `href`: a tab carries no `href`. Aria's click handling does not cancel navigation, so an `href="#panel2"` would jump and change the hash behind `deepLink`'s back. Dev mode warns on an `href`,
````

Tests and stories: same generic coverage as above; no dedicated case named.

Needs: the tab's static `href` attribute.

Rule as documented usage: Do not write `href` on `a[nfsTab]`.

Mentions: none additional.

### build-time: nfs-tabs mixin's contrast checks (D23, D26)

Location: `### Sass and custom CSS` (main paragraph) and the full `### Sass` text near the end of Further Notes; `### WCAG 2.2 AA` rows "1.4.3" and "1.4.11", lines 354-355; D23, D26.

Text:

````
The mixin also stops the compile with `@error` when `$tab-content-background` is under 3:1 against `$primary-color`, by the exact unrounded ratio of the library's internal contrast helper (building-blocks 1.10), naming both settings. It also stops the compile with `@error` on every strip, naming the setting: `$tab-color` under 4.5:1 against `$tab-background`, `scale-color($tab-color, $lightness: -14%)` under 4.5:1 against `$tab-item-background-hover`, `$tab-active-color` under 4.5:1 against `$tab-background-active`, and `$tab-background-active` under 3:1 against `$tab-background` (D17, D26); and on a `primary` bar when `color-pick-contrast($primary-color)` is under 4.5:1 against `$primary-color` or `smart-scale($primary-color)`.
````

Tests and stories: "3. Node-level Vitest", line 526: "`nfs-tabs` included after `foundation-tabs` under the required settings emits exactly the `simple` and `primary` rules, and stops the compile with its `@error` when `$tab-content-background` is under 3:1 against `$primary-color`... Foundation's default tab colours stop the compile naming `$tab-active-color` and `$tab-background-active`; D17's settings compile."

Needs: the `nfs-tabs` Library mixin; the library's exact-WCAG-formula contrast helper; `$tab-content-background`, `$tab-color`, `$primary-color`, `$tab-background`, `$tab-item-background-hover`, `$tab-background-active`, `$tab-active-color`; Foundation's `color-pick-contrast()`, `smart-scale()`.

Rule as documented usage: Set `$tab-background-active: $primary-color; $tab-active-color: $white;` (D17) so the plain strip's selected/hover/text pairs reach 4.5:1 and its selected-look contrast reaches 3:1; on a `primary` bar, no extra setting is required -- `nfs-tabs` repaints the selected tab from the panel's own colours (D23).

Mentions: D17, D23, D26, lines 584, 590, 593.

### Kept (not a check)

- Required parent injections and NG0201: `NfsTabs`/`NfsTab`/`NfsTabsPanel`/`NfsTabsContent` injecting `nfsTabsGroupToken`/`nfsTabsToken` (captured as forgotten-import above); Aria's own `TABS`/`TAB_LIST` NG0201 (also captured above).
- ARIA and focus behaviour: `### ARIA and keyboard` (Aria's tablist/tab/tabpanel roles, key table, known deviation on roving tab stop).
- Typed inputs and their compile errors: `orientation`, `simple: NfsVariantBoolean`, `primary: NfsVariantBoolean` (`simple="flase"` fails to compile, D21, line 588).
- Library mixins' CSS rules and Variant properties: the `.tabs.simple` and `.tabs.primary` rules (`### Sass`); the nav-bar recipe (consumer Sass, not a Library mixin, D18).
- Aria's own duplicate-`value` warning (line 231): Angular's `@angular/aria` dependency's own dev-mode diagnostic, not a check this library adds or could defer -- kept as platform behaviour, not extracted.
- The library's own tests: the four testing layers under `## Testing Decisions`, and the manual release test.

## specs/thumbnail.md

Thumbnail is explicitly standalone: "One directive, with no parent, no children, no Parent token, no providers, and no host directives. Nothing finds a thumbnail through DI." (`### Hierarchy and DI shape`, line 93); confirmed by search (no hits for `nfsDirectiveCheck`, `strictParents`, or `In-family`). No Library mixin exists for Thumbnail (`### Sass`, "there is no `nfs-thumbnail` mixin"), so no build-time checks.

### misuse: Dev check 1 (no text alternative)

Location: `### API: NfsThumbnail`, "Development-mode checks" list, item 1, line 115.

Text:

````
1. No text alternative (1.1.1): the host, when it is an `img`, or an `img` inside the host has no `alt` attribute, and carries none of a non-blank `aria-label`, `aria-labelledby`, or `title`, `role="none"`, `role="presentation"`, or `aria-hidden="true"`: "nfsThumbnail: this image has no alt attribute; describe what it shows, or write alt="" when the text beside it already says it (WCAG 1.1.1)". `alt=""` is silent.
````

Tests and stories: "2. Browser-level test", line 245: "Check 1: an image host without `alt` warns once; `alt="Neptune"`, `alt=""`, `aria-hidden="true"`, `role="presentation"`, and a non-blank `aria-label` are silent; a wrapper and a link whose inner image lacks `alt` warn."; WCAG table row "1.1.1", line 163.

Needs: the host's or its inner `img`'s `alt`, `aria-label`, `aria-labelledby`, `title`, `role`, `aria-hidden`.

Rule as documented usage: Give every thumbnail image an `alt` attribute -- descriptive, or `alt=""` when the text beside it already says it, or when it is decoration.

Mentions: user story 9, line 37; D4, line 298.

### misuse: Dev check 2 (link that is not one, or has no name)

Location: same list, item 2, line 116.

Text:

````
2. A link that is not one, or has no name (2.1.1, 2.4.4, 4.1.2): on an `a` host with no `href`: "nfsThumbnail: a link without href is not focusable; give it its destination, or use <button type="button"> for an action (WCAG 2.1.1)"; on an `a` host with an `href` whose name is blank, meaning no non-blank `aria-label`, no `aria-labelledby` naming text, no non-blank text outside `aria-hidden="true"` subtrees, and no image there with a non-blank `alt` or `aria-label`: "nfsThumbnail: this linked thumbnail has no accessible name; its image's alt names the link's destination (WCAG 2.4.4, 4.1.2)". The name test is a heuristic over accname's main sources, silent whenever any of them is present.
````

Tests and stories: "2. Browser-level test", line 246: "Check 2: an `a` host without `href` warns with the placeholder message; with `href` and an image `alt=""` it warns with the name message; with `href` and an image `alt="Neptune"`, with an `aria-label` on the link, or with visible text in the link it is silent; an `href` from `routerLink` counts."; WCAG table rows "2.4.4"/"4.1.2" and "2.1.1", lines 164-165.

Needs: the `a` host's `href`; its accessible name (own `aria-label`, `aria-labelledby`, visible text, or its image's `alt`/`aria-label`).

Rule as documented usage: Give every Linked thumbnail a real `href`; name it through its image's `alt` (or the link's own text/`aria-label`).

Mentions: user stories 11, 12, lines 39-40; D4, line 298.

### misuse: Dev check 3 (thumbnail inside a plain link)

Location: same list, item 3, line 117.

Text:

````
3. Inside a plain link (2.4.7): a host that is not an `a` and has an `a[href]` ancestor: "nfsThumbnail: put nfsThumbnail on the link, not on the image or wrapper inside it: <a href="..." nfsThumbnail><img ...></a>. Inside a plain link the thumbnail loses Foundation's hover and focus shadow, and Firefox draws the link's focus ring as a band across the picture (WCAG 2.4.7)". It also catches a thumbnail inside a linked thumbnail, whose two frames would double.
````

Tests and stories: "2. Browser-level test", line 247: "Check 3: `nfsThumbnail` on an image or a `span` inside `<a href>` warns once; on the link itself it is silent; inside a link that carries `nfsThumbnail` it warns; inside a `button` it is silent."; WCAG table row "2.4.7 Focus Visible", line 166.

Needs: the host's tag and its `a[href]` ancestor chain.

Rule as documented usage: Put `nfsThumbnail` on the link itself, not on the image or wrapper inside a plain `<a href>`.

Mentions: D3, D7, lines 297, 301.

### Kept (not a check)

- Required parent injections: none (standalone directive).
- ARIA and focus behaviour: `### ARIA and keyboard` (native image/link/figure roles, focus-ring geometry notes).
- Typed inputs and their compile errors: none (Thumbnail takes no inputs, D2, line 296).
- Library mixins' CSS rules and Variant properties: none exist for Thumbnail ("Rules: none", `### Sass`, item 1).
- `NgOptimizedImage`'s own NG02952 sizing warning (D5): Angular's own dependency diagnostic, not a check this library adds; the file explicitly declines to duplicate it as a library check ("A development check that predicts `NgOptimizedImage`'s NG02952 on a thumbnail: it would duplicate Angular's own check", Out of Scope, line 280) -- kept as platform behaviour, not extracted.
- The library's own tests: the four testing layers under `## Testing Decisions`.

## Counts

Per kind (all nine files):

| Kind | Count |
| --- | --- |
| forgotten-import | 7 |
| family | 9 |
| misuse | 39 |
| runtime | 0 |
| build-time | 6 |
| **Total** | **61** |

Per file:

| File | forgotten-import | family | misuse | runtime | build-time | Total |
| --- | --- | --- | --- | --- | --- | --- |
| responsive-toggle.md | 1 | 1 | 4 | 0 | 1 | 7 |
| reveal.md | 1 | 1 | 8 | 0 | 1 | 11 |
| slider.md | 1 | 2 | 3 | 0 | 1 | 7 |
| smooth-scroll.md | 0 | 0 | 3 | 0 | 0 | 3 |
| sticky.md | 1 | 2 | 3 | 0 | 0 | 6 |
| switch.md | 1 | 2 | 5 | 0 | 1 | 9 |
| table.md | 1 | 0 | 5 | 0 | 1 | 7 |
| tabs.md | 1 | 1 | 5 | 0 | 1 | 8 |
| thumbnail.md | 0 | 0 | 3 | 0 | 0 | 3 |
| **Total** | **7** | **9** | **39** | **0** | **6** | **61** |

`runtime` is 0 across every group-e file: none of these nine specs defines its own ADR 0040 Runtime check. Several files carry a disclaimer sentence that no Runtime check applies ("No Runtime check is requested/reports/exists...") -- these are recorded as Mentions under the nearest related check, never as a `runtime`-kind subsection, because there is no check text to extract. One file (responsive-toggle.md, line 448) names a Runtime check owned entirely by another spec (the Breakpoint service's `strictBreakpointSync`); its full text is not in this file and is not this sweep's to extract (the Breakpoint service is a shared-utility spec, not one of group e's nine files).

## Boundary calls

Every check that fit two kinds by its wording, and the call made (forgotten-import first, then family, then misuse, then runtime, then build-time, per the order in the ruling):

1. **responsive-toggle.md**, Development check 5 (Missing Visibility class): its message names a Sass include as the fix, which could suggest `build-time`, but the check itself is a runtime DOM measurement (`getComputedStyle` in a development-only render callback), not a Sass `@error`/`@warn`. Called `misuse` (reads only the page).
2. **reveal.md**, Dev-mode check 7 (no usable restore-focus target): reads both the Reveal's own recorded state (the `trigger` argument, the element focused at open) and a peer's registration (the first registered Trigger, via `registerTrigger`). Called `family` (registration checks are family's canonical example, and family precedes misuse in the order).
3. **slider.md**, Dev check 1 (a third handle): counts the container's own registered handle list. Called `family` (a registration/count check across the container-and-handles family), not `misuse` (the container's "own" state).
4. **slider.md**, Dev check 4 (first handle's value exceeds the second's): compares two peer Handles' values via the container's registered list. Called `family` (an order check across peers), not `misuse` (each handle reading only its own value).
5. **sticky.md**, Development warning 3 (overflow: hidden ancestor): reads an arbitrary ancestor (the nearest scroll container), not necessarily the `nfsStickyContainer` parent that warnings 1 and 2 name. Called `misuse` (reads the page), not `family`, because the ancestor is not a defined family member the way the parent is.
6. **switch.md**, Dev check 2 (paddle text joins the name): reads content held by a peer directive (the paddle, linked by `for`) to determine the input's own accessible name; the file itself describes this as "check 2 from the input's [side]". Called `misuse` (the input's own naming correctness, matching check 1's classification), not `family`, though the text it reads belongs to a peer.
7. **tabs.md**, `NfsTab` dev warning (tab's parent element is not `li[nfsTabsTitle]`): reads the tab's parent element. Called `family` (a DOM-only placement check), not `misuse`.

No check in these nine files fit both `forgotten-import` and another kind at once, other than the machinery itself (In-family checks bullets, token descriptions) being self-evidently `forgotten-import` by the ruling's own naming.

## What was unsure

- The switch.md Dev check 2 boundary call (item 6 above) is the least settled of the seven: an equally defensible reading classifies it `family`, since it literally reads a peer's content, and the ruling's order (forgotten-import > family > misuse) would then place it in `family`. It was kept `misuse` because the file's own words tie it to "the input's [side]" of the peer relationship (paired with check 6, "the paddle's side"), suggesting the spec itself treats check 2 as the input's own naming check rather than a family placement/registration check. A re-run sweep should treat this as the one call most likely to be revisited.
- reveal.md's Dev-mode check 7 (item 2 above) is similarly close: three of its four candidate restore targets (`restoreFocus`, the `trigger` argument, the element focused at open) are the Reveal's own recorded state, and only the fourth (the first registered Trigger) is a peer reached through the Trigger registry. It was still called `family` because that registry is explicitly a registration mechanism and the order rule favors `family` whenever any part of what a check reads is a peer.
- No check across the nine files needed a `runtime` classification; every "no Runtime check" sentence found was confirmed to be a disclaimer of absence, never a check specification, by reading its surrounding paragraph in full (not just the matched line).

## Verify

Searched every file (Grep tool, case-sensitive except where the pattern used `[Ff]`) for: `nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `In-family`, `Forgotten import`, `forgotten import`, `Selector manifest`, `nfsReportForgottenPeer`, `Runtime check`, `provideNfsRuntimeChecks`, `@error`, `@warn`, `dev check`, `development check`, `Dev-mode check`, `development warning`, `warns`, `console.warn`, `sync:check`, `check mode`, `missing-imports`, plus a second pass for `nfsReportForgottenPeer`, `Selector manifest`, `missing-imports`, `strictBreakpointSync`, `host record` across all nine files at once.

Positive control: the combined pattern returned dozens of hits per file (shown as line numbers with content in the tool output above, e.g. 27 hits in responsive-toggle.md, 20 in reveal.md, 25 in slider.md), confirming the search itself works on this file set and a zero-hit result elsewhere is not being caused by a broken pattern.

Results, per term, for terms whose hits needed explicit accounting beyond what a file's per-check "Text"/"Mentions" fields already cover:

- `nfsDirectiveCheck`, `strictParents`, `In-family`: every hit falls inside a file's "In-family checks" bullet list (captured verbatim as that file's `forgotten-import` entry) or, for slider.md, inside the `NfsSliderFill` line and the "In-family parent check" cross-reference at line 241 (captured in the Mentions of the slider.md forgotten-import entry).
- `strictDirectiveImports`: appears in responsive-toggle.md line 131-132 (inside the In-family checks text, captured verbatim) and in sticky.md lines 135 and 169 (In-family checks text, and Development warning 1's exception, both captured).
- `provideNfsRuntimeChecks`: one hit, slider.md line 512, inside the fill's In-family parent check description under `strictParents` -- captured in the slider.md forgotten-import entry's Text and Rule.
- `Selector manifest`, `nfsReportForgottenPeer`, `missing-imports`, `host record`: zero hits across all nine files (confirmed by a combined-pattern search reported above); these are shared-utility-spec-level terms (ADR 0046, ticket 150, ticket 157) that none of the nine component specs names directly. Not a gap: the ruling's forgotten-import definition bundles several shared mechanisms under one kind, and only the mechanisms these nine files actually invoke (`nfsDirectiveCheck`, `strictParents`, the M7 token descriptions, `strictDirectiveImports`) needed extracting here.
- `Runtime check`: every hit is a disclaimer of absence ("No Runtime check is requested/reports/exists", "takes no part in the Runtime checks", "requests no Runtime check", etc.) except responsive-toggle.md line 448, which names another spec's Runtime check by name. All are recorded as Mentions under the nearest check in each file's section above; none states an actual Runtime check owned by these nine files, so no `runtime`-kind subsection exists anywhere in this manifest.
- `@error`, `@warn`: every hit falls inside a file's `build-time` entry (the one Library-mixin contrast/presence-marker check per file that has one) or inside that file's "Kept" list pointing at the mixin's non-check CSS rules (rules that emit CSS, not `@error`/`@warn`). Files with zero `build-time` checks (smooth-scroll.md, sticky.md, thumbnail.md) had zero `@error`/`@warn` hits, confirmed by the per-file greps.
- `dev check`, `development check`, `Dev-mode check`, `development warning`, `warns`, `console.warn`: every hit is either inside a numbered/lettered check's own Text, inside that check's Tests-and-stories or Mentions field (a later paragraph or table row referring back to "check N"), or inside the file's user-stories list (recorded as a Mention where the check exists, e.g. responsive-toggle.md user story 27, switch.md user stories 5/8/9/11/12/18, thumbnail.md user stories 9/11/12/13). No file had a numbered dev check whose number never appeared in a subsection heading above.
- `sync:check`, `check mode`: zero hits across all nine files (these are Variant-declaration-tooling terms from ADR 0046/the tooling spec, ticket 136, not used by any of these nine component specs, which is correct: none of the nine defines a Variant-declaration CI sync check).

No hit was left unaccounted for.
