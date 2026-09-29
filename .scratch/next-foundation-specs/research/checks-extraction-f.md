# Checks extraction: group f

Group: f. Commit read: ba07780 (branch wayfinder). Classification rule's source: [Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md), Decision item 1, read together with [Task: extract the checks from the specs](../issues/159-task-extract-checks-from-specs.md).

Files:

- `specs/toggler.md`
- `specs/tooltip.md`
- `specs/top-bar.md`
- `specs/triggers.md`
- `specs/typography-helpers.md`
- `specs/variant-declaration-tooling.md`
- `specs/visibility-classes.md`
- `specs/xy-grid.md`

Kind key: `forgotten-import`, `family`, `misuse`, `runtime`, `build-time`, matching ticket 158's Decision item 1 wording exactly.

---

## specs/toggler.md

### forgotten-import: In-family checks (NfsToggler, NfsClassToggler)

Location: "Hierarchy and DI shape", line 139.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsToggler` calls `nfsDirectiveCheck('NfsToggler')` and `NfsClassToggler` calls `nfsDirectiveCheck('NfsClassToggler')`, each with no parent check, no child probes, and no peers (a Trigger reaches either by template reference or as the Nearest Openable, links the Triggers spec lists), and `strictParents` changes nothing.
````

Tests and stories: none named in this file (the forgotten-import checks' own tests belong to the deferred forgotten-import spec, [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), issue 150, out of this group's files).

Needs: `nfsDirectiveCheck` (called with the class name and, where applicable, `children`); no Sass or CSS needed by this check.

Rule as documented usage: none (the check enforces nothing a consumer must do beyond importing the directives they use, which the first milestone accepts as a forgotten import with no report).

Mentions: none elsewhere in this file naming `nfsDirectiveCheck` for Toggler.

### misuse: Dev-mode check 1 (copied `is-hidden` in visibility mode)

Location: "API" > "Behaviour rules", line 221; also the API table row for `isOpen`, line 190; the design-decision row D19, line 474; and the "Foundation behaviour changed or dropped" bullet, line 598.

Text:

````
1. Visibility mode with `is-hidden` in the host's static `class`, copied from Foundation's markup: "is-hidden is bound by nfsToggler from isOpen, and a copied one is removed while the element is shown; write the hidden attribute or bind [isOpen]="false"". The static class list is read through `HostAttributeToken('class')` in a field initialiser that runs only in development builds, because after render the class list no longer shows the copied token (building-blocks 1.4; the Accordion spec's dev check 7).
````

Tests and stories: layer 2 (browser-level test), line 405: "A copied `is-hidden`: on an open visibility-mode host the class is stripped and check 1 warns once; on a host also written with `hidden` it stays bound and check 1 still warns; nothing is read or warned when `ngDevMode` is false." Layer 2 summary line 414 groups it as one of "the four warnings" tested for firing once per case and not for correct usage.

Needs: `HostAttributeToken('class')` read in a development-only field initialiser (a presence marker read only by this check); no Sass.

Rule as documented usage: a Toggler in visibility mode starts closed by writing the `hidden` attribute or binding `[isOpen]="false"`, never by writing `class="is-hidden"`.

Mentions: line 109 (CSS class mapping table, ".is-hidden" row: "A copied static `is-hidden` is stripped while the element is shown and reported (development check 1)"); line 190 (API table, `isOpen` row: "A static `class="is-hidden"` no longer seeds it (development check 1)").

### misuse: Dev-mode check 2 (class mode with static `animate` attribute)

Location: "API" > "Behaviour rules", line 222.

Text:

````
2. Class mode with a static `animate` attribute: "animate belongs to visibility mode and is ignored here; remove toggler" (Foundation let `animate` win, so a copied `data-toggler data-animate` pair lands here).
````

Tests and stories: layer 2, line 414 (grouped in "each of the four warnings").

Needs: reads the host's static `animate` attribute in class mode; no Sass.

Rule as documented usage: `animate` is only meaningful on a visibility-mode Toggler (the one written without `toggler`); a class-mode Toggler (written with `toggler`) ignores an `animate` attribute.

Mentions: none beyond the check's own paragraph.

### misuse: Dev-mode check 3 (class mode `toggler` naming a Foundation or library class)

Location: "API" > "Behaviour rules", line 223; also design-decision row D20, line 475.

Text:

````
3. Class mode whose `toggler` names a Foundation or library class the check knows. Foundation's hiding classes `is-hidden`, `hide`, and `invisible`: "use visibility mode, whose triggers announce shown and hidden". `expanded` (the Menu Variant of Foundation's own Toggler example) and any name starting `is-` (Foundation's State classes) or `nfs-` (the library's classes): "this class belongs to the directive that binds it: write toggler without a value and bind that directive's input from active, for example [expanded]="menuBar.active()" on nfsMenu". The check cannot know every Foundation class, because palette and size names come from the consumer's Sass; the rule itself is ADR 0039's.
````

Tests and stories: layer 2, line 414 (grouped); story `toggler--class-mode-initially-active`, line 388, demonstrates the correct (non-warning) case in words ("The story's text says the class is an Application class and carries no Foundation style") but does not itself assert the warning.

Needs: reads the directive's own `toggler` input value against a fixed known-class list; the "known-class check" pure function is named in "Implementation level and primitives", line 230 ("the known-class check of development check 3"), and tested in isolation at layer 3, line 420 ("the known-class check of development check 3").

Rule as documented usage: `toggler` takes only the consumer's own Application class names, never a Foundation hiding class, a State class (`is-*`), a library class (`nfs-*`), or a Foundation Variant class such as `expanded`; a Foundation Variant is switched by writing `toggler` with no value and binding the owning directive's own input from `active`.

Mentions: line 205 (API table, `toggler` row: "never a Foundation or library class (ADR 0039; development check 3)").

### misuse: Dev-mode check 4 (visibility mode `animate` that starts no animation, or a malformed pair)

Location: "API" > "Behaviour rules", line 224.

Text:

````
4. Visibility mode, run in the `read` phase that measures a phase's animation rather than in the `afterNextRender`: a non-empty `animate` whose classes start no CSS animation when their phase begins (a Motion name without the `nfs-motion` include, a class of the consumer's own without `@keyframes`, a Motion UI transition class given in the dot form), a dot-form class that starts with `nfs-`: "write the library's Motion name without its prefix: animate="fade-in""; and a value that does not split into one entering and one leaving value (three or more tokens, or a leaving value before an entering one), which the type admits only through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`), which reports "animate takes one entering and one leaving value". The first case reads "animate="fade-out" started no animation: include nfs-motion, or give your own class @keyframes". The phase still completes as before. This is the Reveal spec's check 3 in the Toggler's words, and the Dropdown pane's check 5.
````

Tests and stories: layer 2, line 408 ("...a value of another shape, reached through `$any()` or through a value that starts with a dot (`'.a .b .c'`, `'.a fade-in'`), animates nothing and warns once (check 4)"); layer 2, line 414 (grouped: "a Motion name with the `nfs-motion` output loaded does not warn, and the same name without it does").

Needs: the shared `nfsMotionPairClasses` pure function (splits `animate` into halves and maps each with `nfsMotionClasses`), and a computed-style read of `animation-name` in the `read` render phase; no Sass rule of its own (reads whatever `nfs-motion` compiled).

Rule as documented usage: `animate` takes one entering value and one leaving value, each either a Motion name the `nfs-motion` mixin has a keyframe for, or the consumer's own keyframe class written with a leading dot; a value shaped any other way (three or more tokens, a leaving name before an entering one) is not supported.

Mentions: line 191 (API table, `animate` row: "a value of another shape... animates nothing and warns once (check 4)").

### family: `NfsTopBarRight` reading - not present for Toggler

Not applicable: Toggler has no family/DOM-placement check of its own; it has no parent, child, or peer directive.

### runtime: Runtime checks - not present for Toggler

Not applicable: line 102 states plainly that Toggler "has no Variant input, no Variant registry or alias, no Variant property, and no involvement in the Runtime checks." No Runtime check exists for this file; the line is a non-applicability statement, not a check, and is listed in Kept below for the Verify step.

### build-time: Library mixin `@error`/`@warn` checks - not present for Toggler

Not applicable: "Sass" subsection, line 586: "No library CSS and no `nfs-toggler` mixin." Toggler has no Library mixin, so no `@error`/`@warn` check exists for it.

Kept (not a check), toggler.md:

- Line 102: Toggler explicitly has no Variant input, no Variant registry, no Variant property, and "no involvement in the Runtime checks" (a non-applicability statement, not a check).
- The Openable contract (`isOpen`, `id`, `triggerRole`, `open`/`close`/`toggle`), ARIA rendering by the Triggers, and focus-return behaviour (required behaviour, not a check).
- The animation phase machinery (`linkedSignal`, `afterRenderEffect` for completion) that plays and completes an animation (behaviour, not a check).
- `NfsTogglerDefaultsToken` and its `animate` default (a Defaults token, not a check).
- The `nfsMotionPairClasses`/`nfsMotionClasses` pure functions used both for normal class binding and, incidentally, by check 4 (the functions themselves are not checks; only the misuse detection built on top of them is).

Counts for toggler.md: forgotten-import 1, family 0, misuse 4, runtime 0, build-time 0. Total 5.

---

## specs/tooltip.md

Tooltip has no forgotten-import check declared in this file (no `nfsDirectiveCheck` call appears; verified by search, see Verify section). It has no family/peer/parent (line 145: "No parent or child directives, no content projection"), no Runtime check (line 120, line 589: "no Runtime check request"), and no Library mixin / build-time check (line 454: "No library CSS and no `nfs-tooltip` mixin"). All seven of its development checks are misuse.

### misuse: Dev-mode check 1 (host not interactive)

Location: "API" > "Behaviour rules", line 226; also line 570 (D5).

Text:

````
1. Host not interactive: not a native `button`, `a[href]`, `input` (other than `hidden`), `select`, `textarea`, or `summary`, and without an interactive ARIA role (`button`, `link`, `checkbox`, `radio`, `switch`, `tab`, `menuitem`, `option`, `combobox`, `textbox`, `searchbox`, `slider`, `spinbutton`, `treeitem`, `gridcell`). The message names the defined-term recipe (Further Notes).
````

Tests and stories: layer 2, line 506 ("each of the seven warnings fires once for its case (a `span` host, ...) and none for an `nfsButton` host with text and no class"); layer 1 does not test the check directly (`tooltip--defined-term` demonstrates the correct case).

Needs: reads only the host's own tag name and ARIA role; no Sass.

Rule as documented usage: `nfsTooltip` goes on an interactive host: a native `button`, `a[href]`, non-hidden `input`, `select`, `textarea`, `summary`, or an element with an interactive ARIA role.

Mentions: line 316 ("Hosts must be interactive elements (development warning otherwise)"); line 332 (WCAG table, 2.1.1 row: "Interactive hosts only (development warnings 1 and 2)"); line 547 (Out of Scope: "warned in development mode, because keyboard and touch users cannot reach them").

### misuse: Dev-mode check 2 (host not focusable)

Location: "API" > "Behaviour rules", line 227.

Text:

````
2. Host not focusable (`InteractivityChecker.isFocusable` false): a natively disabled button gets "use `disabledInteractive` so the tooltip stays reachable"; anything else gets "keyboard users cannot reach this tooltip".
````

Tests and stories: layer 2, line 506 ("a natively disabled button" is one of the seven cases).

Needs: CDK `InteractivityChecker.isFocusable`; no Sass.

Rule as documented usage: an interactive host must also be focusable; a disabled native button needs `disabledInteractive` to stay reachable while disabled.

Mentions: line 332 (WCAG table, "development warnings 1 and 2").

### misuse: Dev-mode check 3 (no text)

Location: "API" > "Behaviour rules", line 228.

Text:

````
3. No text: no `nfsTooltip` value and no static `title` at first render.
````

Tests and stories: layer 1, line 492 ("neither (development warning 3)"); layer 2, line 506 ("no text" case).

Needs: reads only the directive's own `tipText` input and the host's static `title`; no Sass.

Rule as documented usage: a tooltip needs text, given as the directive's value (`nfsTooltip="..."`) or the host's static `title`.

Mentions: none beyond its own paragraph.

### misuse: Dev-mode check 4 (no name of its own)

Location: "API" > "Behaviour rules", line 229.

Text:

````
4. No name of its own: a form control with no associated `label`, `aria-label`, or `aria-labelledby`, or another host with no text outside `aria-hidden="true"` subtrees, no `aria-label`/`aria-labelledby`, and no descendant with a non-empty `alt` or `aria-label`: "the tooltip is a description, not a name".
````

Tests and stories: layer 2, line 506 ("an icon button with no name" case).

Needs: reads only the host's own accessible-name sources (label associations, `aria-label`/`aria-labelledby`, content, descendant `alt`/`aria-label`); no Sass.

Rule as documented usage: give the host its own accessible name (a `label`, `aria-label`, `aria-labelledby`, or visible/alt text); the tooltip text is a description, never the name.

Mentions: line 330 (WCAG table, 4.1.2 row: "the development check reports a host with no name of its own").

### misuse: Dev-mode check 5 (host sits inside a `label`)

Location: "API" > "Behaviour rules", line 230; also line 415.

Text:

````
5. The host sits inside a `label`: the tip is inserted into the label, so a press on the tip is a press on the label (the tip is `aria-hidden` and the description element `hidden`, so neither joins the label's name).
````

Tests and stories: layer 2, line 506 ("a host inside a `label`" case).

Needs: reads only the host's own DOM ancestry to a `label` (its own content/page context); no Sass.

Rule as documented usage: a tooltip host inside a `<label>` should expect a press on the tooltip to activate the label; write labels with `for` where that is not wanted.

Mentions: line 415 ("A tip inside a wrapping `label` sits inside it, so a press on the tip is a press on the label; neither the `aria-hidden` tip nor the `hidden` description element joins the label's name; write labels with `for` (development warning 5)").

### misuse: Dev-mode check 6 (copied legacy position class)

Location: "API" > "Behaviour rules", line 231; also line 89, 95 (table), 112, 187, 198, 255, 391, 401, 443, 460, 502.

Text:

````
6. A copied legacy position class: a whole `top`, `bottom`, `left`, or `right` token in the host's static `class`, read with `inject(new HostAttributeToken('class'), {optional: true})` in a field initialiser that exists only under `ngDevMode` (the value is the template's static classes merged with the static host classes of the element's directives, none of which is a position name): "Foundation's legacy class `right` does not place the tooltip; write `position="right"`", once per class. Tokens are split on whitespace and compared whole, so `top-bar` and `righty` do not match (Foundation's regular expression matched `top-bar`). A redundant `has-tip` is not reported (building-blocks 1.4).
````

Tests and stories: layer 2, line 502 ("Copied classes (development check 6), with the static class read spied: `class="right"` warns once, naming `position="right"`; `class="top bottom"` warns once per class; `class="top-bar righty"` and the consumer's own `class="app-term"` warn nothing; nothing is read in a production build."); layer 3, line 514 ("the copied-class matcher of development check 6..."); layer 4, story only shows the correct usage (`tooltip--term-positions`, line 471).

Needs: `HostAttributeToken('class')` read in a development-only field initialiser (a presence marker read only by this check); no Sass.

Rule as documented usage: the tip's side is set with the `position` input, never with a legacy `top`/`bottom`/`left`/`right` class copied from Foundation's docs markup.

Mentions: line 89 (Foundation contract table, `position` row: "the legacy classes are not read, and a copied one is reported (development check 6)"); line 112 (mapping table: "a copied one is reported, naming `position` (development check 6)"); line 187 (API table, `position` row: "development check 6 reports a copied one"); line 255 (Render hooks table, "Development checks" row: "check 6's static-class read is a development-only field initialiser | One-shot DOM inspection, removed in production; the static class read is DI, safe on the server, and the warning waits for the client callback"); line 391 (usage example comment: "development check 6 warns once, naming position="right""); line 401 (usage example comment, same); line 443 ("in development builds also the static `class` for check 6, whose warning waits for the client render callback"); line 460 ("apart from the browser-level cases of development checks 6 and 7"); D9, line 574.

### misuse: Dev-mode check 7 (`templateClasses` naming the tip's own or an `nfs-` class)

Location: "API" > "Behaviour rules", line 232; also line 95 (table), 116, 198, 232, 391, 460, 503.

Text:

````
7. A `templateClasses` value, as it stands at the first render (static attribute, binding, or Defaults token), that names a class the tip binds itself or an `nfs-` class: "`templateClasses` takes your own classes; `align-left` belongs to the tip (use `alignment`)" for a pip class, "`tooltip` is bound by the tip" for `tooltip` and `has-tip`, and "`nfs-` classes are the library's" for the rest, once per class. The tip leaves those tokens out of its class list in every build, so the check only explains what happened. Other Foundation class names are not checked, because telling them from the consumer's own would put Foundation's class list in the development bundle (the Dropdown spec's `parentClass` reasoning); the rule is documented.
````

Tests and stories: layer 2, line 503 ("`templateClasses` filter (development check 7): `templateClasses="app-tip bottom align-left tooltip nfs-slide-in-down"` binds only `app-tip` beside the tip's own classes, and the pip classes stay the Placement's; one warning per dropped class; the same value from `nfsTooltipDefaultsToken` behaves the same; `templateClasses="app-tip"` warns nothing."); layer 3, line 514 ("the `templateClasses` filter (the tip's own classes and `nfs-` classes dropped, the consumer's own classes kept in order...)").

Needs: a pure filter function over the tip's own class list (`tooltip`, `has-tip`, the four positions, the five `align-*`) and any `nfs-` prefix; no Sass.

Rule as documented usage: `templateClasses` takes only the consumer's own classes on the tip, never a class the tip binds itself (`tooltip`, `has-tip`, a position or alignment pip class) or a library `nfs-` class.

Mentions: line 95 (Foundation contract table, `templateClasses` row); line 116 (mapping table row); line 198 (API table, `templateClasses` row); line 391 (usage example comment); line 460 (Testing Decisions intro); D7, line 572.

### misuse: Positioner-owned checks applied to Tooltip's own inputs (out-of-file boundary)

Location: API table, `vOffset`/`hOffset` row, line 189; "Development-mode checks" intro, line 233.

Text:

````
| `vOffset`, `hOffset` | `input()`, `numberAttribute` | `number` | token, else `0` | `data-v-offset`, `data-h-offset` | Negative values warn in dev mode (Positioner; WCAG 2.4.11) |
````

````
The Positioner adds its own three (same-axis alignment, negative offsets, tip not `position: absolute`).
````

Tests and stories: not tested in this file (owned by the Anchored pane / Positioner spec, issue 55, not in this group's file set).

Needs: defined and implemented in the Anchored pane / Positioner spec (issue 55), which is out of this sweep group's files; not fully specified here.

Rule as documented usage: `vOffset` and `hOffset` must not be negative (WCAG 2.4.11).

Mentions: line 328 (WCAG table, 2.4.11 row: "development warning below 0"); line 189.

Boundary call: this pair of checks (negative-offset warning, same-axis alignment, tip not `position: absolute`) is implemented and specified by the Anchored pane / Positioner shared utility (issue 55), not by tooltip.md itself; tooltip.md only names that Tooltip's own `vOffset`/`hOffset` inputs are subject to it. Recorded here as a mention/cross-reference rather than a full check entry, because its full text lives outside this group's files. If classified purely from what appears in this file, it would be `misuse` (reads only Tooltip's own inputs).

Kept (not a check), tooltip.md:

- Line 143, 145: no parent or child directives, no content projection - a design fact, not a check.
- Line 120, line 589 (D24): "no Variant input, no Variant registry, no Variant property, and no Runtime check request" for the Tooltip - non-applicability statement, not a check.
- Line 454: "No library CSS and no `nfs-tooltip` mixin" - no Library mixin exists, so no build-time check exists here.
- The Completion outputs (`opened`/`closed`), the animation phase machinery, and the `registerTrigger` contract (required behaviour, not checks).
- `nfsTooltipDefaultsToken` (a Defaults token, not a check).

Counts for tooltip.md: forgotten-import 0, family 0, misuse 7 (plus 1 boundary mention for the Positioner-owned pair), runtime 0, build-time 0. Total 7 full checks extracted, 1 cross-reference mention recorded.

---

## specs/top-bar.md

### forgotten-import: In-family checks (all nine directives) and `nfsTopBarRightToken`'s M7 description

Location: "Hierarchy and DI shape", lines 154, 158-162.

Text:

````
- `nfsTopBarRightToken` is the one token. It is a lightweight token (building-blocks 1.9): a menu root imports the token, not the directive class. Its description exists in development builds only, in the M7 form of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md): `new InjectionToken<NfsTopBarRight>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsTopBarRightToken (provided by NfsTopBarRight from 'ngx-foundation-sites/top-bar' on an ancestor element declared in the same template)" : '')`. A menu that reaches the right-hand section only through content projection finds no token; the Nested menu root then reads the section from the DOM after hydration and, in development builds, warns naming `alignment="right"`, which puts the side in the server HTML (D9). (The removed advice has no good value to offer: the token's value is the directive instance, and a second `nfsTopBarRight` inside the section binds `.top-bar-right` twice.)
````

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part. Each of the nine calls `nfsDirectiveCheck` with its class name; none injects a parent, so none has a parent check, and `strictParents` changes nothing for any of them:
  - `NfsTopBar`: `nfsDirectiveCheck('NfsTopBar', {children: ['NfsTopBarLeft', 'NfsTopBarRight', 'NfsTopBarTitle', 'NfsMenuIcon']})`, probing its sections, its title, and a menu icon inside it. No peers.
  - `NfsTitleBar`: `nfsDirectiveCheck('NfsTitleBar', {children: ['NfsTitleBarLeft', 'NfsTitleBarRight', 'NfsTitleBarTitle', 'NfsMenuIcon']})`, probing its sections, its title, and its menu icons. No peers.
  - `NfsTopBarLeft`, `NfsTopBarRight`, `NfsTitleBarLeft`, `NfsTitleBarRight`: no parent check, because a section injects no bar (D13); development check 7 reads its bar from the DOM. No child probes. No peers. `NfsTopBarRight` provides `nfsTopBarRightToken`, which the Nested menu root injects optionally as context, not as a parent, and which stays optional ([ADR 0043](../adr/0043-menu-root-top-bar-right-section-token.md)).
  - `NfsTopBarTitle`, `NfsTitleBarTitle`, `NfsMenuIcon`: leaves, with no parent check, no child probes, and no peers; the Trigger written beside a menu icon links to its Openable, not to the icon.
````

Tests and stories: not tested in this file for the checks themselves (the forgotten-import checks' own tests belong to issue 150, out of this group).

Needs: `nfsDirectiveCheck` per directive; `nfsTopBarRightToken`'s development-only description string (M7 form).

Rule as documented usage: none (a forgotten import of any of the nine directives, or of the menu root that reads `nfsTopBarRightToken`, is accepted with no report in the first milestone).

Mentions: line 25 ("nfsTopBarRight tells a menu inside it, through dependency injection..."); line 154 (full paragraph above); line 213 (development check 7's silence rule references `strictDirectiveImports`, cross-referenced below); line 403 (Rendering modes: "A menu projected into the section from another template has no token; its closed submenus change side once in the first render callback after hydration, which the Nested menu root reports in development."); D9, line 497.

### misuse: Dev-mode check 1 (menu icon, no accessible name)

Location: "Development checks and runtime checks", line 211.

Text:

````
1. `NfsMenuIcon`, no accessible name. The name, taken in accessible-name order from the text of the elements `aria-labelledby` references, then a non-blank `aria-label`, then text inside the button (visually hidden text included, `aria-hidden="true"` subtrees excluded), or the non-blank `alt` of an `img` or the non-blank `aria-label` of an element with `role="img"` inside it, then `title`, is empty: "nfsMenuIcon: this menu icon has no accessible name; point aria-labelledby at the title bar's title, or add aria-label, for example aria-label="Menu"". The [Spec: Close Button](../issues/83-spec-close-button.md)'s check 1, with the menu icon's wording.
````

Tests and stories: layer 2, line 438 ("each of checks 1 to 7 warns once for its case and not for correct markup (every name source, an `img` with `alt="Menu"` as the button's only content (silent), `aria-label=""`, an `aria-labelledby` to a missing id, ...)").

Needs: reads only the host's own accessible-name sources; no Sass.

Rule as documented usage: name the menu icon, with `aria-labelledby` pointing at the title bar's title, or with `aria-label`.

Mentions: line 254 (ARIA table, "Menu icon name" row: "checked in development"); line 275 (WCAG table, 4.1.2 row); line 570 (D5).

### misuse: Dev-mode check 2 (menu icon, symbol-only name)

Location: "Development checks and runtime checks", line 212.

Text:

````
2. `NfsMenuIcon`, a name, read as check 1 reads it, with no letter or digit (a pasted "U+2630" trigram, a dash): "nfsMenuIcon: this menu icon's name is only a symbol; name what it opens". The Close Button's check 2.
````

Tests and stories: layer 2, line 438 ("a symbol-only name").

Needs: reads only the host's own accessible name; no Sass.

Rule as documented usage: give the menu icon a name that says what it opens, not only a symbol (such as a pasted hamburger trigram).

Mentions: none beyond its own paragraph.

### misuse: Dev-mode check 3 (menu icon sharing an element with `nfsButton`/`nfsCloseButton`)

Location: "Development checks and runtime checks", line 213.

Text:

````
3. `NfsMenuIcon` whose host also carries `.button` or `.close-button`, or the `nfsButton` or `nfsCloseButton` attribute (`nfsButton` or `nfsCloseButton` on the same element; the attribute counts too, because the misuse stays once a forgotten `NfsButton` or `NfsCloseButton` import is added, and `strictDirectiveImports` reports that import on its own): "nfsMenuIcon and nfsButton on one element: .menu-icon and .button are separate class contracts; remove nfsButton" (or `nfsCloseButton`).
````

Tests and stories: layer 2, line 438 ("`nfsButton` and `nfsCloseButton` on the icon, also with `NfsButton` left out of the test host's imports").

Needs: reads only the host's own class list and attributes (a different family's directive attribute on the same element); no Sass.

Rule as documented usage: never put `nfsButton` or `nfsCloseButton` on the same element as `nfsMenuIcon`; `.menu-icon` and `.button`/`.close-button` are separate, one-directive-each class contracts.

Mentions: none beyond its own paragraph.

### misuse: Dev-mode check 4 (menu icon rendered box under 24 by 24 px)

Location: "Development checks and runtime checks", line 214.

Text:

````
4. `NfsMenuIcon` whose rendered box, read in the read phase when the button is rendered (a non-zero box), is under 24 by 24 CSS px: "nfsMenuIcon: the menu icon is <w> by <h> px, under the 24 by 24 px target size (WCAG 2.5.8); include @include nfs-menu-icon; after foundation-menu-icon". A hidden icon (a Title Bar hidden by the Responsive Toggle at a wide viewport) is not measured.
````

Tests and stories: layer 2, line 438 ("a box under 24 px with the mixin's rule absent from the test document, a hidden icon not measured"); layer 3 (Sass compile test) guards the rule the check depends on, line 447.

Needs: a rendered-box measurement (`getBoundingClientRect` or equivalent) in the read phase; depends on the `nfs-menu-icon` Library mixin's rule existing (see the build-time check below, which is the CSS this development check verifies against).

Rule as documented usage: include `@include nfs-menu-icon;` after `foundation-menu-icon` so every menu icon meets the 24 by 24 px minimum target size (WCAG 2.5.8).

Mentions: line 268 (WCAG table, 2.5.8 row: "development check 4"); D6, line 494.

### misuse: Dev-mode check 5 (copied Foundation class: `dark`, `stacked-for-<bp>`)

Location: "Development checks and runtime checks", line 215.

Text:

````
5. A copied Foundation class, read through `HostAttributeToken('class')` in development builds only: `dark` on the menu icon names `dark`; `stacked-for-<bp>` on the Top Bar names `stackedFor="<bp>"`. This is building-blocks 1.4's rule for copied classes; the binding rule has already stripped them.
````

Tests and stories: layer 2, line 438 ("copied classes"); layer 3, line 444 ("the copied classes absent and the Application class present").

Needs: `HostAttributeToken('class')` read in development builds only; no Sass.

Rule as documented usage: set `dark` through the `dark` input and stacking through the `stackedFor` input, never by copying Foundation's `dark` or `stacked-for-<bp>` classes into markup.

Mentions: line 125 (binding rule paragraph: "so a copied `stacked-for-*` class is stripped on the server and in the browser").

### misuse: Dev-mode check 6 (`NfsTopBar` `stackedFor` naming the Zero breakpoint)

Location: "Development checks and runtime checks", line 216.

Text:

````
6. `NfsTopBar` with `stackedFor` naming the Zero breakpoint: "Foundation generates no stacked-for-<zero>; the Top Bar stacks below $topbar-unstack-breakpoint".
````

Tests and stories: layer 2, line 438 ("a Zero-breakpoint `stackedFor`").

Needs: reads only the directive's own `stackedFor` input against `nfsBreakpointsToken`'s Zero breakpoint; no Sass.

Rule as documented usage: do not set `stackedFor` to the Zero breakpoint's name; Foundation generates no such class, and the bar already stacks below `$topbar-unstack-breakpoint`.

Mentions: line 103 (mapping table, `.stacked-for-<bp>` row: "the Zero breakpoint sets none and warns in development"); line 219 (Runtime checks paragraph: "development check 6 reports that one, so one mistake makes one report").

### family: Dev-mode check 7 (section outside its bar)

Location: "Development checks and runtime checks", line 217.

Text:

````
7. `NfsTopBarLeft` or `NfsTopBarRight` with no `.top-bar` ancestor, and `NfsTitleBarLeft` or `NfsTitleBarRight` with no `.title-bar` ancestor, read by DOM ancestry (D13): the warning says the section is laid out only inside its bar. The title directives are not checked, because Foundation styles their classes anywhere. An ancestor that carries the bar's attribute (`nfsTopBar`, `nfsTitleBar`) without its class counts as the bar, and the check stays silent: that bar's import is forgotten, which the runtime check `strictDirectiveImports` reports once on the bar element, so the check never says that a section is outside the bar it sits in.
````

Tests and stories: layer 2, line 438 ("sections inside and outside their bars, a section projected into a bar through a test layout component not reported, a section inside a bar whose `NfsTopBar` is not imported not reported by check 7").

Needs: reads the host's own DOM ancestry for the bar's static class or attribute (building-blocks 1.9's DOM-only placement check pattern); no Sass.

Rule as documented usage: a `nfsTopBarLeft`/`nfsTopBarRight` section must sit inside an `nfsTopBar` element, and a `nfsTitleBarLeft`/`nfsTitleBarRight` section inside an `nfsTitleBar` element, because Foundation's CSS lays them out only there.

Mentions: line 153 ("the sections' placement check reads the DOM in a development render callback (D13)"); D13, line 501.

Boundary call: classified `family` (a DOM-only placement check reading the host's ancestor bar), consistent with the ruling's example list ("DOM-only placement checks... of building-blocks 1.9") even though `NfsTopBarLeft`/`NfsTopBarRight` and `NfsTopBar` compose by placement rather than by a strict parent/child Angular relationship within one class family.

### family: Nested menu root's DOM-fallback placement check for the Top Bar's right-hand section (cross-spec)

Location: mentioned at lines 25, 154, 403, 472 (Out of Scope), and D9, line 497.

Text:

````
`nfsTopBarRight` tells a menu inside it, through dependency injection, that it sits in the Top Bar's right-hand section, so the Dropdown Menu can open its submenus to the left in the server HTML instead of after hydration. A menu that a layout component projects into the section from another template, which dependency injection cannot see, is read from the DOM by the Nested menu root after hydration, with a development warning.
````

````
A menu projected into the section from another template has no token; its closed submenus change side once in the first render callback after hydration, which the Nested menu root reports in development.
````

Tests and stories: not tested in top-bar.md itself; the menu root's own tests belong to the Dropdown Menu / Nested menu specs (issues 21, 56), which are not in this group's file set.

Needs: `nfsTopBarRightToken` (optional injection at construction, per the forgotten-import entry above) plus a DOM-ancestry fallback read after hydration; the check's message and full behaviour are specified by the Nested menu root's own spec, not by top-bar.md.

Rule as documented usage: a Dropdown Menu, Accordion Menu, Drilldown, or Responsive Menu root that sits in a Top Bar's right-hand section only through content projection (so dependency injection cannot see `nfsTopBarRightToken`) should expect its submenu side to flip once, in the first render callback after hydration; prefer `alignment="right"` on the menu root to avoid this.

Mentions: line 25 (Solution); line 154 (Hierarchy and DI shape); line 403 (Rendering modes); line 472 (Out of Scope: "the menus inside the bars and their Base side rule... which read `nfsTopBarRightToken` (D9)"); D9, line 497.

Boundary call: this check's implementing directive (the Nested menu root) is not declared in top-bar.md; its full specification belongs to the Dropdown Menu / Nested menu spec files (issues 21, 56), outside this sweep group. Recorded here because top-bar.md substantially describes its trigger condition and consequence (D9) and top-bar.md's own `nfsTopBarRightToken` is what the check reads. Classified `family` (a DOM-only placement/registration check) by the same reasoning as check 7 above, since it is, in effect, the Menu family's own development check reading whether it is properly placed relative to (an)other family's DOM context.

### runtime: `NfsTopBar`'s `nfsVariantCheck('nfsTopBar')` Runtime checks

Location: "Development checks and runtime checks", line 219.

Text:

````
Runtime checks ([ADR 0040](../adr/0040-variant-input-types.md), configured by `provideNfsRuntimeChecks` and `provideNfsProductionRuntimeChecks` of `ngx-foundation-sites/media-query`, whose spec defines how a directive reports): `NfsTopBar` creates the handle `nfsVariantCheck('nfsTopBar')` and, only while `stackedFor` is bound, calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('stackedFor', value, needs)` with `needs` `[{setting: 'breakpoint-classes', name: value}]` for a Class breakpoint above the Zero breakpoint and `[]` for the Zero breakpoint (development check 6 reports that one, so one mistake makes one report), as the [Spec: Off-canvas](../issues/25-spec-off-canvas.md) panel does for `revealOn` and `inCanvasOn`; `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list (drift between the Variant declaration file and the compiled Sass) and a value that is not one class token; and `strictVariantProperties` reports a missing `--nfs-breakpoint-classes`, naming `@include nfs-breakpoint-properties;`. `dark` is closed and needs none. They run in the browser after the first render, never on the server.
````

Tests and stories: layer 2, line 439 ("Runtime checks: with `--nfs-breakpoint-classes: small medium large` on the test document, `stackedFor="medium"` is silent and `'xlarge'` through `$any()` reports once under `strictVariantNames`; in a test file of its own, with the property absent and `stackedFor` bound, `strictVariantProperties` reports once, naming `nfs-breakpoint-properties`; an unbound `stackedFor` requests nothing.").

Needs: `nfsVariantCheck`, `provideNfsRuntimeChecks`/`provideNfsProductionRuntimeChecks`, `include()`/`value()` calls, and the `--nfs-breakpoint-classes` Variant property written by `nfs-breakpoint-properties`.

Rule as documented usage: none directly stated as documented usage beyond what `stackedFor`'s own input type already enforces at compile time; the Runtime check exists to catch drift between the consumer's Sass and the Variant declaration file, which the first milestone accepts unreported.

Mentions: line 141-143 (Hierarchy and DI shape code block, "uses:" list: "the runtime checks of `ngx-foundation-sites/media-query`").

### build-time: Library mixins' `@error`/`@warn` checks (`nfs-menu-icon`, `nfs-title-bar`, `nfs-top-bar`)

Location: WCAG table rows for 1.4.11 and 1.4.3 and 1.4.1 and 1.4.10 (lines 269-272); design decisions D7 and D8 (lines 495-496); "Sass" subsection (lines 575-607).

Text:

````
| 1.4.11 Non-text Contrast | The bars reach 3:1 against the surface they sit on, at rest and on hover. The light icon's `$titlebar-icon-color` and `$titlebar-icon-color-hover` against `$titlebar-background`: `nfs-title-bar` stops the compile with `@error`. The dark icon's `$black` and `$dark-gray` against `$body-background`: `nfs-menu-icon` warns (`@warn`), because a dark-page application may use only the light icon. A menu icon on the Top Bar: `nfs-top-bar` warns when neither icon reaches 3:1 at rest and on hover against `$topbar-background`, because an icon there is a placement Foundation's Sass allows (`.top-bar-title .menu-icon`) but its docs never show. axe has no 1.4.11 rule |
````

````
| 1.4.3 Contrast (Minimum) | Links reach 4.5:1 against the Top Bar and its submenus: `nfs-top-bar` stops the compile with `@error` naming the setting when `$anchor-color` is under 4.5:1 against `$topbar-background`, or against `$topbar-submenu-background` where that differs; a translucent bar is composited over `$body-background` first, and a translucent submenu background warns, because text over page content has no known contrast. The title text reaches 4.5:1 on the title bar: `nfs-title-bar` stops the compile when `$titlebar-color` is under 4.5:1 against `$titlebar-background`. Required setting: a bar background on which `$anchor-color` reaches 4.5:1, for example `$topbar-background: $white;`, and, when that override is written after Foundation's settings file is imported, `$topbar-submenu-background: $topbar-background;` too, because the settings file assigns the submenu background from the bar's value at import time. A Top Bar or Title Bar made sticky ([Spec: Sticky](../issues/28-spec-sticky.md)) that overlaps content while stuck needs an opaque bar background: a transparent `$topbar-background` passes this check against `$body-background`, not against the content a stuck bar covers. |
````

````
| 1.4.1 Use of Color | The current link's fill (`nfs-menu`'s `aria-current` look) differs from the bar by at least 3:1: `nfs-top-bar` stops the compile when `$menu-item-background-active` is under 3:1 against `$topbar-background` (and the submenu background where it differs), the pair the Menu spec leaves to this spec because `nfs-menu` compares with `$body-background` only |
````

````
| 1.4.10 Reflow | At 320 CSS px the sections are stacked (below `$topbar-unstack-breakpoint`) and the page does not scroll sideways; menus in the bar wrap. `nfs-top-bar` warns when `$topbar-unstack-breakpoint` is the Zero breakpoint, since the sections would then never stack | Passes: Foundation's docs example measures `scrollWidth` 320 at 320 px in three engines | e2e at 320 by 640 px on `top-bar--basic` and `top-bar--responsive`: `scrollWidth <= 320` |
````

Sass subsection (the mixins' own check lists):

````
`nfs-menu-icon`:

1. Rules: ... Checks that emit no CSS: `@warn` when `$black` or `$dark-gray`, the dark icon's colours, is under 3:1 against `$body-background` (1.4.11).
````

````
`nfs-title-bar`:

1. Rules: none. Checks that emit no CSS: `@error` when `$titlebar-color` is under 4.5:1 against `$titlebar-background` (1.4.3), or `$titlebar-icon-color` or `$titlebar-icon-color-hover` is under 3:1 against it (1.4.11).
````

````
`nfs-top-bar`:

1. Rules: none. Checks that emit no CSS, against `$topbar-background` and, where it differs, `$topbar-submenu-background`: `@error` when `$anchor-color` is under 4.5:1 (1.4.3) or `$menu-item-background-active` is under 3:1 (1.4.1, the current link's fill that `nfs-menu` draws); `@warn` when `$topbar-submenu-background` is translucent (1.4.3); `@warn` when neither the light icon (`$titlebar-icon-color`, `$titlebar-icon-color-hover`) nor the dark icon (`$black`, `$dark-gray`) reaches 3:1 at rest and on hover against `$topbar-background` (1.4.11); `@warn` when `$topbar-unstack-breakpoint` is the Zero breakpoint (1.4.10).
````

Tests and stories: layer 3 (node-level Sass compile tests), lines 447-450: contrast `@error`/`@warn` cases for `nfs-menu-icon`, `nfs-title-bar`, and `nfs-top-bar`, including the exact-formula helper's false-pass measurements (line 450).

Needs: `nfs-menu-icon`, `nfs-title-bar`, `nfs-top-bar` Library mixins; Foundation settings `$titlebar-icon-color`, `$titlebar-icon-color-hover`, `$black`, `$dark-gray`, `$body-background`, `$anchor-color`, `$topbar-background`, `$topbar-submenu-background`, `$menu-item-background-active`, `$titlebar-color`, `$titlebar-background`, `$topbar-unstack-breakpoint`.

Rule as documented usage: set `$topbar-background` (and, when overridden after the settings file, `$topbar-submenu-background` to match) so `$anchor-color` reaches 4.5:1 and `$menu-item-background-active` reaches 3:1 against the bar; keep `$titlebar-color` at 4.5:1 and the title bar's icon colours at 3:1 against `$titlebar-background`; a menu icon placed on the Top Bar, or a dark icon on a dark page, needs the same 3:1 check made by hand, since the mixin only warns there.

Mentions: D7, D8, line 495-496; the Sass subsection's "Required settings" code block, lines 608-618.

Kept (not a check), top-bar.md:

- The class-to-directive mapping (host bindings for the nine Structural/Variant classes) - behaviour, not a check.
- `nfsTopBarRightToken`'s function as a DI contract (apart from its M7 description text, already extracted above).
- The forced-colours menu-icon drawing (D16), the 24 px box rule (D6) - CSS rules, not checks (the box-size rule is what check 4 verifies against, but the rule itself is kept).
- ARIA rendering by the Triggers on a menu icon (required behaviour).

Counts for top-bar.md: forgotten-import 1 (covering all nine directives plus the token), family 2 (1 in-file, 1 cross-spec mention), misuse 6, runtime 1, build-time 1 (covering three mixins). Total check entries: 11.

---

## specs/triggers.md

### forgotten-import: In-family checks (NfsOpen, NfsClose, NfsToggle) and `nfsOpenableToken`'s M7 description

Location: "Hierarchy and DI shape", lines 130, 137-140.

Text:

````
- The contract is a lightweight token: `nfsOpenableToken = new InjectionToken<NfsOpenable>(typeof ngDevMode === 'undefined' || ngDevMode ? "nfsOpenableToken (provided by NfsReveal from 'ngx-foundation-sites/reveal', NfsOffCanvas from 'ngx-foundation-sites/off-canvas', NfsDropdownPane from 'ngx-foundation-sites/dropdown-pane', NfsToggler or NfsClassToggler from 'ngx-foundation-sites/toggler', NfsResponsiveToggle from 'ngx-foundation-sites/responsive-toggle', NfsTooltip from 'ngx-foundation-sites/tooltip', or a component that implements NfsOpenable, on an ancestor element declared in the same template)" : '')` typed by an exported interface, its description in development builds only (M7 of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in a token file that imports only types. The description names every library Openable and ends with the application's own implementations, because several directives provide the token and a consumer's wrapper component may too ([ADR 0013](../adr/0013-triggers-target-resolution.md)); the library injects it only optionally, so the description serves an application's own required `inject(nfsOpenableToken)`, and an Openable added in a later release adds itself to the list.
````

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), one line per part:
  - `NfsOpen` calls `nfsDirectiveCheck('NfsOpen')`: no parent check, because it injects no parent (its target is a required reference); no child probes; peers: its targets, linked by reference (`[nfsOpen]="signup"` with `#signup="nfsReveal"`, or an array of references), so a forgotten `NfsOpen` fails to compile with NG8002 on the binding and a forgotten Openable with NG8003 on the reference; `strictParents` changes nothing.
  - `NfsClose` calls `nfsDirectiveCheck('NfsClose')` and `NfsToggle` calls `nfsDirectiveCheck('NfsToggle')`: no parent check, because their Nearest Openable injection stays optional with a supported `null`: a bound target replaces it, and inputs are not set at construction, so construction cannot tell whether the Trigger needs the Nearest Openable and passes no parent. Development check 1, which runs after the inputs are set, stays the report for a bare Trigger with no Nearest Openable and no element around it that carries an Openable's attribute; where the enclosing element carries one whose directive was not imported, check 1 says nothing and `strictDirectiveImports` reports that element with the import to add (M1), the shared spec's rule for a check that finds a peer by registration. No child probes; peers: their bound targets, linked by reference as for `NfsOpen`; `strictParents` changes nothing (the kept-optional list of the forgotten-import checks spec).
  - An Openable probes no Trigger, and a Trigger probes nothing: a Trigger reaches its Openable by template reference or as the Nearest Openable, and the classes on its host belong to the directive beside it (`nfsButton`, `nfsCloseButton`, `nfsMenuIcon`), another family, so a bare `nfsClose` or `nfsToggle` whose import was forgotten is reported by `strictDirectiveImports` and the static check. No Trigger sits on `ng-template` or `ng-container`.
````

Tests and stories: not tested in this file for the checks themselves (issue 150's own tests, out of this group).

Needs: `nfsDirectiveCheck` per directive; `nfsOpenableToken`'s development-only description string (M7 form).

Rule as documented usage: none (a forgotten import of `NfsOpen`, `NfsClose`, `NfsToggle`, or any Openable is accepted with no report in the first milestone; template-reference typing already fails compilation for a forgotten Openable independently of this check, which is kept - see Kept below).

Mentions: line 93 ("Dropped options and behaviours" - not directly); line 208 (dev check 1's silence rule, cross-referenced below).

### misuse: Dev-mode check 1 (no target)

Location: "API" > "Dev-mode checks", line 208.

Text:

````
1. No target: a bare `nfsClose` or `nfsToggle` with no Nearest Openable, or `nfsOpen` bound to an empty value. A bare Trigger inside an element that carries an Openable's attribute (`nfsReveal`, `nfsOffCanvas`, `nfsOffCanvasAbsolute`, `nfsDropdownPane`, `nfsToggler`, `nfsResponsiveToggle`, `nfsTooltip`) where the shared verdict finds no instance of its directive is not reported: that Openable's import was forgotten, which `strictDirectiveImports` reports once on that element (M1), so the defect is reported once and this message never names the wrong fix ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), In-family checks, the rule for a check that finds a peer by registration).
````

Tests and stories: layer 2, line 381 ("Dev-mode checks: each of the five warnings fires once for its case and not for the correct case (a `<button type="button">`, an `<a href="/x">`, a `<button>` without `type` outside any form), and check 1 is silent for a bare `nfsClose` inside an element carrying `nfsToggler` whose `NfsToggler` is left out of the test host's imports.").

Needs: reads the Trigger's own resolved target (Nearest Openable via optional injection, or the bound target) and, to decide whether to stay silent, the shared forgotten-import verdict for an ancestor Openable's directive.

Rule as documented usage: a bare `nfsClose`/`nfsToggle` needs an enclosing Openable, and `nfsOpen` needs a non-empty target.

Mentions: none beyond its own paragraph and the layer 2 test.

Boundary call: this check's suppression logic (staying silent when the real cause is a forgotten import elsewhere) reads the forgotten-import mechanism's shared verdict (M1, `strictDirectiveImports`), which is `forgotten-import` kind; the check itself, judged by what it reads about the Trigger's own state (its target), is classified `misuse`.

### misuse: Dev-mode check 2 (not an Openable)

Location: "API" > "Dev-mode checks", line 209.

Text:

````
2. Not an Openable: a target without an `open` method (a template reference to the element).
````

Tests and stories: not explicitly named at layer 2 beyond the general "five warnings" statement (line 381); strict-templates already fails compilation for this case (line 200), so the check exists for non-strict-templates builds.

Needs: reads only the Trigger's own bound target's shape (whether it has an `open` method); no Sass.

Rule as documented usage: a Trigger's target must be a directive implementing `NfsOpenable` (`#pane="nfsDropdownPane"`), never a plain element reference.

Mentions: line 200 ("Without strict templates, the dev-mode check below reports both").

### misuse: Dev-mode check 3 (host cannot be operated from the keyboard)

Location: "API" > "Dev-mode checks", line 210.

Text:

````
3. Host cannot be operated from the keyboard: anything but `<button>`, `<a href>`, or `<input type="button|submit|reset">`; an `<a>` whose `href` is missing, empty, or `#` gets the message "use a button".
````

Tests and stories: layer 2, line 381 ("a `<button type="button">`, an `<a href="/x">`" as correct cases); layer 2, line 375 (`nfsOpenableToken` from an inner element).

Needs: reads only the Trigger's own host tag and attributes; no Sass.

Rule as documented usage: a Trigger goes on a native `<button>`, `<a href>`, or `<input type="button|submit|reset">`.

Mentions: line 275 (WCAG table, 2.1.1 row: "Hosts that cannot be operated from the keyboard (a `div`, an `<a>` without `href` or with `#`) get dev-mode check 3").

### misuse: Dev-mode check 4 (submit risk)

Location: "API" > "Dev-mode checks", line 211.

Text:

````
4. Submit risk: a `<button>` host with no `type` attribute whose `form` is not null.
````

Tests and stories: layer 2, line 381 ("a `<button>` without `type` outside any form" as the correct/silent case, implying the failing case is inside a form).

Needs: reads only the Trigger's own host's `type` attribute and its `form` property; no Sass.

Rule as documented usage: a `<button>` Trigger inside a `<form>` needs an explicit `type`, so it never submits the form by accident.

Mentions: D13, line 439.

### misuse: Dev-mode check 5 (mixed Trigger roles in an array)

Location: "API" > "Dev-mode checks", line 212.

Text:

````
5. Mixed Trigger roles in an array.
````

Tests and stories: layer 2, line 376 ("mixed roles in an array use the first target's role and warn").

Needs: reads only the Trigger's own bound array of targets and each target's `triggerRole`; no Sass.

Rule as documented usage: every target in an array Trigger should share one Trigger role; if they differ, the first target's role decides the rendered ARIA.

Mentions: line 201 ("Every target in an array should share one Trigger role; if they differ, the first target's role decides the ARIA and dev mode warns.").

### family / runtime / build-time - not present for Triggers

Not applicable: Triggers has no parent/child/peer development check of its own reading another Openable family's DOM state (its only checks are the five misuse checks and the forgotten-import checks above); no Variant class, so no Runtime check (line 97: "no Variant registry, no Variant property, and no Runtime check request"); no Library mixin, so no build-time check (Sass subsection, line 596: "No library CSS; there is no `nfs-triggers` mixin").

Kept (not a check), triggers.md:

- Line 97: "no Variant registry, no Variant property, and no Runtime check request" - non-applicability statement, not a check.
- The `NfsOpenable` contract itself (`isOpen`, `id`, `triggerRole`, `open`/`close`/`toggle`, `registerTrigger`) - required behaviour, not a check.
- ARIA rendering per Trigger role (the ARIA table) - required behaviour.
- Focus-return requirements inherited by every Openable spec - required behaviour, not a check.
- Strict-templates compile failures for a bad reference (NG8002/NG8003) - Angular's own diagnostics, not a library check.

Counts for triggers.md: forgotten-import 1 (covering NfsOpen, NfsClose, NfsToggle, and the token), family 0, misuse 5, runtime 0, build-time 0. Total 6.

---

## specs/typography-helpers.md

### forgotten-import: In-family checks (all five directives)

Location: "Hierarchy and DI shape", line 167; also line 593.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsTextAlignment`, `NfsTypographyHelpers`, `NfsNoBullet`, `NfsTypographyBase`, and `NfsPrintStyles` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
````

````
- A forgotten import: a static `nfsPrintBreakInside` without `NfsPrintStyles` in the template's `imports` sets nothing, and the loss shows only on paper; in development the `strictDirectiveImports` Runtime check reports the attribute on screen and the opt-in static check reports it in CI ([ADR 0046](../adr/0046-forgotten-imports-caught-by-checks.md)), the usage example names the import, and the `--print-breaks` e2e case covers the library's own stories (the architecture guide's P24).
````

Tests and stories: not tested in this file for the checks themselves (issue 150's own tests, out of this group).

Needs: `nfsDirectiveCheck` per directive; the `strictDirectiveImports` Runtime check and the static `missing-imports` builder check, both cited generically.

Rule as documented usage: none (a forgotten import of any of the five directives is accepted with no report in the first milestone).

Mentions: none beyond the two locations above.

### misuse: Dev-mode check 1 (copied classes, every directive)

Location: "API" > "Development-mode checks", line 208; design decision D14, line 457.

Text:

````
1. Copied classes, every directive (D14): a static class list that holds a class of the directive's own family with Foundation's names warns, naming the attribute to write ("class="text-center" is set by nfsTextAlign: write nfsTextAlign="center" instead"; "class="h2" is set by nfsHeadingSize: write nfsHeadingSize="2" instead"; "class="print-break-inside" is set by nfsPrintBreakInside: write nfsPrintBreakInside instead"; `medium-text-center` names the rules object). A copied class is not stripped, because the `[class]` list binds only the classes it sets, so it keeps styling until removed. Other classes are not reported.
````

Tests and stories: layer 2, line 393 ("Development checks: the copied-class check for one class of each directive, `print-break-inside` on an `nfsPrintBreakInside` host included (warns once, naming the attribute), and silence for a consumer class").

Needs: `HostAttributeToken('class')` read in a development-only field initialiser; no Sass.

Rule as documented usage: set the Typography Helpers family's classes through the matching Utility attribute (`nfsTextAlign`, `nfsHeadingSize`, `nfsSubheader`, etc.), never by writing Foundation's class name directly.

Mentions: D14, line 457.

### misuse: Dev-mode check 2 (unreachable code block)

Location: "API" > "Development-mode checks", line 209; design decision D10, line 453.

Text:

````
2. Unreachable code block, `NfsTypographyHelpers` while `nfsCodeBlock` is true (D10): the Prototyping Utilities' scroll-region check with the attribute's name: when the host's computed `overflow-x` or `overflow-y` is `auto` or `scroll` and its scroll size exceeds its client size on that axis, and the host has no `tabindex` attribute and no focusable descendant (`a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]` other than `-1`, `[contenteditable]`, none disabled): "nfsCodeBlock: this code block scrolls but a keyboard cannot reach it; add tabindex="0", role="region", and aria-label or aria-labelledby (WCAG 2.1.1; axe scrollable-region-focusable)". When the host has `tabindex` of 0 or more and no non-blank `aria-label` or `aria-labelledby`: "nfsCodeBlock: a focusable code block needs a name (WCAG 4.1.2)". An implementation may share one library-internal helper with `NfsPrototypeOverflow`.
````

Tests and stories: layer 2, line 393 ("the code block check for an overflowing block without `tabindex` and without focusable content (warns), with a link inside (silent), with `tabindex="0"` and no name (warns about the name), with `tabindex="0"`, `role="region"`, and `aria-labelledby` (silent), and for content that fits (silent)"); layer 1 (`typography-helpers--code-and-citations`, line 381) shows the correct, non-warning usage.

Needs: a computed-style scroll-size read shared with `NfsPrototypeOverflow` (the Prototyping Utilities' scroll-region check); reads only its own host and descendants; no Sass.

Rule as documented usage: an `nfsCodeBlock` element that scrolls needs `tabindex="0"`, `role="region"`, and a name (`aria-label` or `aria-labelledby`).

Mentions: D10, line 453; WCAG table, 2.1.1 row, line 261.

### runtime: `NfsTextAlignment`'s Runtime check

Location: "API" > "Runtime check (D15)", line 210; design decision D15, line 458.

Text:

````
- Runtime check (D15), `NfsTextAlignment` only, in the same read phase, and only while `nfsTextAlign` holds a rules key above the Zero breakpoint: `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('nfsTextAlign', value, needs)` with `{setting: 'breakpoint-classes', name: bp}` for each key above the Zero breakpoint, `[]` for the Zero breakpoint's key (its class always exists), and `null` for a value that maps to no class. `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list; `strictVariantProperties` reports a missing `@include nfs-breakpoint-properties;`. A bare value reads no property and makes no call. `NfsTypographyHelpers`, `NfsNoBullet`, `NfsTypographyBase`, and `NfsPrintStyles` have only closed families, read no Variant property, and make no call.
````

Tests and stories: layer 2, line 394 ("Runtime check: with a style block standing in for `--nfs-breakpoint-classes: small medium large`, `[nfsTextAlign]="{medium: 'center'}"` is silent; a key outside the property bound through a cast reports `strictVariantNames` once, naming `nfsTextAlign`, the value, and `$breakpoint-classes`; in a test file of its own, with no style block, one `strictVariantProperties` report names `@include nfs-breakpoint-properties;`; a bare `nfsTextAlign="center"` makes no request.").

Needs: `nfsVariantCheck('nfsTextAlign')` handle (line 165); `include()`/`value()` calls; the `--nfs-breakpoint-classes` Variant property written by `nfs-breakpoint-properties`.

Rule as documented usage: none directly stated beyond what the closed/typed input already enforces at compile time.

Mentions: line 165 ("creates the Runtime checks' handle `nfsVariantCheck('nfsTextAlign')`"); line 207 (the checks' read-phase gate, "the Variant check handle is not `null`").

### build-time: `nfs-typography-helpers` and `nfs-typography-base` `@error` checks

Location: "WCAG 2.2 AA" table, 1.4.3 row, line 260; design decision D9, line 452; "Sass" subsection, line 539.

Text:

````
| 1.4.3 Contrast (Minimum) | `$subheader-color`, `$cite-color`, `$header-small-font-color`, and `$blockquote-color` reach 4.5:1 against `$body-background`, and `$code-color` 4.5:1 against `$code-background`; `nfs-typography-helpers` and `nfs-typography-base` stop the compile otherwise (D9), at 4.5:1 whatever the size, because a subheader, citation, or quotation can sit on any element. A grey inside a container also reaches 4.5:1 against the container's background, which the compile does not check (D23; the ratios are in the Sass subsection). On Foundation's defaults the consumer sets the four greys to `#666666`: 5.693:1 on the page and at least 4.601:1 on every light container background the library's specs keep. A grey on a dark container, such as a title bar or a tooltip (`#0a0a0a`), needs `#797979` or lighter there |
````

````
2. A compile-time check that emits no CSS: one `@error` listing every pair under 4.5:1, `$subheader-color` and `$cite-color` against `$body-background`, `$code-color` against `$code-background`, each with the setting names and the ratio, computed by the library's exact relative-luminance helper (`math.pow`, a translucent colour composited over its background first), unrounded, never with Foundation's `color-luminance()`, whose approximate power overstates some ratios, or its `color-contrast()`, which rounds to one decimal (building-blocks 1.10). `nfs-typography-base`: one `@error` listing every pair under 4.5:1, `$header-small-font-color` and `$blockquote-color` against `$body-background`, computed the same way; it emits no CSS. Neither mixin checks a grey against a container's background (D23).
````

Tests and stories: layer 3, line 401-404 ("Sass compile, over Foundation 6.9.0's settings file and an overrides file after it... Foundation's defaults plus `@include nfs-typography-helpers;` stop with one `@error` naming `$subheader-color` and `$cite-color`..."); layer 1, `typography-helpers--composition`, line 382, demonstrates the greys passing on container backgrounds without failing the compile check (since the compile check reads the page only).

Needs: `nfs-typography-helpers`, `nfs-typography-base` Library mixins; Foundation settings `$subheader-color`, `$cite-color`, `$header-small-font-color`, `$blockquote-color`, `$code-color`, `$code-background`, `$body-background`.

Rule as documented usage: set `$subheader-color`, `$cite-color`, `$header-small-font-color`, and `$blockquote-color` to `#666666` (or another value reaching 4.5:1 on the page and on every light container background the library's specs keep), and keep `$code-color` at 4.5:1 against `$code-background`; a grey placed on a dark container needs a lighter value there, checked by hand (the compile does not check it).

Mentions: D9, line 452; D23, line 466; "Sass" subsection required-settings code block, lines 546-554.

Kept (not a check), typography-helpers.md:

- The five directives' class-binding behaviour (the Utility attribute mapping) - behaviour, not a check.
- The grid-margin-restoring rule of `nfs-typography-helpers` (D8) - a CSS rule, not a check.
- `nfsHeadingSize`'s preservation of the host's own heading level/role (D12) - a documented behaviour guarantee, not a check (explicitly "documented, not checked", line 455).
- The `role="list"` recipe for markerless lists (D11) - documented usage, explicitly not a check ("no check", D11 rationale).

Counts for typography-helpers.md: forgotten-import 1, family 0, misuse 2, runtime 1, build-time 1. Total 5.

---

## specs/variant-declaration-tooling.md

This entire spec is the Variant declaration tooling named by ticket 158's build-time bullet. Ticket 158 defers only its **check mode**; its **generate mode** (the setup generator, the sync generator's write behaviour, the Architect builder's default write mode, the declaration-file format and renderer) is explicitly kept in the first milestone (ticket 158, Decision item 3: "the tooling's generate mode"). The two are extracted separately below.

### build-time: CI check mode (`nx sync:check`, the Architect builder's `check` configuration) and its messages

Location: "Solution", lines 30-34; "API: the Nx task sync generator", lines 388-396 (the check-relevant parts); "API: the Architect builder", `check` option row and write/check-mode bullets, lines 402-411; "API: the Variant declaration file" > "Declaration drift" table, lines 312-323; "CI steps", lines 421-427; "Messages" table in full, lines 437-455; Comparison table, "Check mode" row, line 463; design decisions D9, D18, D24, lines 574, 583, 589; Testing Decisions layer 3 cases, lines 530-532, 540-543.

Text (Solution bullets):

````
- One shared core compiles a project's global stylesheet with the Sass JavaScript API, reads the Variant properties from the compiled CSS, works out what the declaration file must say, reads what the existing file says, and writes or compares. Three thin entry points sit over it:
  - a setup generator, `ngx-foundation-sites:variant-types`, an Nx generator exposed to the Angular CLI as a schematic, which adds an `nfs-variants` target to each project, writes its first Variant declaration file, and in Nx registers the sync generator on the project's own targets;
  - an Nx task sync generator, `ngx-foundation-sites:variant-types-sync`, which keeps every project's file in step before its build, serve, test, and Storybook tasks, and which `nx sync:check` runs in CI;
  - an Architect builder, `ngx-foundation-sites:variant-types`, behind the `nfs-variants` target, which rewrites the file (`ng run <app>:nfs-variants`) or fails on Declaration drift (`ng run <app>:nfs-variants:check`), on the Angular CLI and under Nx alike.
- The file is written deterministically and compared by meaning, not by bytes, so a formatter, line-ending conversion, or hand-written layout never counts as drift. The tooling rewrites only a file it generated itself; a hand-written file is checked just the same and never overwritten.
- CI runs `nx sync:check` (Nx) or `ng run <app>:nfs-variants:check` (Angular CLI) as its own step.
````

Text (Architect builder `check` option and modes):

````
| `check` | `boolean` | `false` | Compare only: succeed when the file matches the Sass, fail with the drift (M2) otherwise; never write |

- Write mode (`ng run shop:nfs-variants`, `nx run shop:nfs-variants`): writes the file when it is absent or generated and its model differs; fails with M4 on a drifted hand-written file; succeeds silently when in step.
````

Text (Nx task sync generator's check-relevant behaviour):

````
`ngx-foundation-sites:variant-types-sync`, registered by the setup generator, run by Nx before each registered task outside CI, by `nx sync`, and by `nx sync:check`.

- Nx calls it with the tree alone. It reads the project graph (`createProjectGraphAsync()`, as `@nx/js:typescript-sync` does), so inferred targets count, and covers every project that has a target whose executor is `ngx-foundation-sites:variant-types`, with that target's `options`. One run covers the whole workspace.
- For each project it runs core 1 to 6. A generated or missing file whose model differs is written into the tree (rendered and formatted); anything else is left untouched. Nx counts a sync generator as out of sync only when it changes the tree or throws (Nx `getSyncGeneratorChanges` keeps a result only if it has an error or `changes.length > 0`), so a model-equal file is in sync whatever its bytes.
- It returns `outOfSyncMessage` (M1) and one `outOfSyncDetails` line per changed file (M1), which `nx sync:check` prints.
- Failures: a project whose compile fails (M8), that has no Variant properties (M3), whose sources disagree (M12), whose count is invalid (M10), or whose file is hand-written and drifted (M4), or not a module (M5), or not readable (M6, M7). The generator collects every project's failure and throws one plain `Error` listing each project with its fix (M2). It does not use Nx's `SyncError`, which only `@nx/devkit/internal` exports; Nx prints a plain error's message the same way (`errorToString`). A throw discards that run's other changes; they are applied by the first run after the fix.
- What Nx does around it (measured on Nx 23.2.1, SYNC 4.2 and 4.3, and read in the task runner's source): in a terminal, Nx prompts before applying unless `sync.applyChanges` is `true`; outside a terminal without `CI` (git hooks, agent shells, IDE tasks) it stops the task on any drift, whatever `applyChanges` says; with `CI` set it skips task sync generators entirely. With the daemon on, each batch of workspace file changes reruns it in the background, one Sass compile per covered project (0.6 to 0.8 s each with `foundation-everything` and `sass-embedded` on win32-arm64, measured by the prototype; the pure-JS `sass` asynchronous compiler took 8.5 to 9.5 s for the same compile); results reach disk only when a command flushes them.
````

Text (Declaration drift table):

````
| Drift | Effect while it lasts | Reported as |
| --- | --- | --- |
| The Sass generates a name the file does not declare | a template using it fails to compile (loud) | `add <name>: true` |
| The file declares a name the Sass does not generate | compiles, renders a class with no CSS (silent) | `remove <name>: true` |
| The Sass removed a default the file keeps | compiles, renders nothing (silent) | `add <name>: false` |
| The file removes a default the Sass generates | a template using it fails (loud) | `remove <name>: false` |
| The counts differ | wrong range | `count is <file> in the file and <sass> in <property>` |
| The file declares a registry the manifest lacks | nothing happens (silent) | `<Name> is not a Variant registry of ngx-foundation-sites <version>` |
| An open registry (index signature) | any string compiles for that setting, by the consumer's choice | not drift; listed once as open |
````

Text (CI steps section):

````
- Nx: `npx nx sync:check` as its own step, before any task. It is required: tasks skip sync generators in CI, and a build against a stale file passes and ships a Variant with no class (SYNC 4.2). With Nx Cloud distributed agents it runs on the main job, since agents set CI variables too.
- Nx workspace that declines the sync generator: `npx nx run-many -t nfs-variants -c check`.
- Angular CLI: `npx ng run <project>:nfs-variants:check` for each project with an `nfs-variants` target.
- The setup generator prints the step (M13); it edits no CI file.
- Local non-interactive runs (git hooks, agent shells): `npx nx sync` first, because Nx stops a task on drift outside a terminal.
````

Text (Messages table, in full - "its messages" per ticket 158):

````
| Id | When | Text (placeholders in angle brackets) |
| --- | --- | --- |
| M1 | Nx sync, changed files | Message: "the Variant declaration files no longer match the Sass they are generated from." Detail per file: "<file> (<project>, from <sources>): <drift summary>" |
| M2 | check failure, or the sync generator's thrown error | "<file> no longer matches <sources>:" then one line per registry with its drift (table above), then "Run <command> to update it." For the thrown error: "could not keep the Variant declaration files in step for <n> project(s):" then "<project>: <message>" per project |
| M3 | no Variant property in any source | "<sources> of <project> print no Variant properties. Add `@import 'ngx-foundation-sites';` after your Foundation imports and include the Library mixins of the families you use (for example `@include nfs-button;`), or remove the project's nfs-variants target." |
| M4 | hand-written file with drift | "<file> was not generated by ngx-foundation-sites, so it is not rewritten. Make these edits:" then the drift lines, then "or delete it to let the tooling write it." |
| M5 | no `import` or `export` | "<file> has no import or export, so its declare module replaces the library's types. Add `import 'ngx-foundation-sites';` as its first statement." |
| M6 | unknown registry | "<file>:<line> declares <Name>, which is not a Variant registry of ngx-foundation-sites <version>." plus the nearest registry name when one is close |
| M7 | a member the reader cannot model | "<file>:<line>: <Registry>.<member> must be `true`, `false`, or (for count registries) `count: <whole number>`; quote numeric names ('25': true)." |
| M8 | Sass compile error | "compiling <stylesheet> for <project> failed: <Sass message and span>" |
| M9 | missing package | "the <generator, schematic, or builder> needs <package>. Install it: npm install --save-dev <packages>" |
| M10 | invalid count | "<property> is '<value>' in <stylesheet>; a count must be a whole number from 0 to 999." |
| M11 | a configuration changes the styles (warning) | "the <configuration> configuration of <buildTarget> changes styles or stylePreprocessorOptions; <file> follows <used configuration>." |
| M12 | sources disagree | "<property> lists different names in <stylesheet A> and <stylesheet B>; name the one to follow in the nfs-variants target's stylesheets option." |
| M13 | setup summary | what was written and edited per project, then "Add this step to CI: <step>." and, for each hand-written file it kept that has no global augmentation, "Add declare global {} to <file>, or restart the dev server after the file changes." |
````

Tests and stories: layer 3 (Node-level Vitest): line 531 ("Sync generator on a virtual tree with a stubbed project graph: in step (no tree change), drifted (one change, M1 details), a formatted but model-equal file (no change), several projects in one run, a failing project (one thrown error listing it, M2)."); line 532 ("Builder under `TestingArchitectHost`: write mode, check mode in step and drifted, a hand-written file, the configuration merge, M11."); workspace e2e, line 540 ("`nx sync:check` passes; removing `warning` from one application's Sass makes `nx sync:check` exit 1 with the file and `warning: false` in its details; `CI=true nx build <app>` passes against the stale file (the hazard the CI step exists for); `nx sync` rewrites it; `nx build <app>` then fails with TS2322 on the template's `color="warning"`..."); line 542 ("`ng run <app>:nfs-variants:check` passes in step and exits 1 after a Sass change").

Needs: the shared core (compile, read Variant properties, build expected model, parse existing file, compare, render); the Variant manifest JSON; the Declaration drift table's comparison rules; every message id M1-M13.

Rule as documented usage: none directly (this is workspace/CI tooling, not a directive's API); the underlying compile-time enforcement it protects is that a Variant input's declared name must exist in the consumer's compiled CSS, or the template fails to compile (kept, not itself a check - see Kept).

Mentions: line 463 (Comparison table: "`nx sync:check` and the builder's `check` configuration, by meaning"); D24, line 589 ("CI | `nx sync:check`, or the builder's `check` configuration, as its own step"); D18, line 583 (sync failures collected and thrown); D9, line 574 (comparison by meaning).

### build-time: The Variant typings check (the build assertion)

Location: "API: The Variant typings check (the build assertion)", lines 490-501.

Text:

````
After every library build, before tests that consume the package and before publishing, a Node step checks the packed typings against the manifest's `uses`:

1. Names: for each use, the emitted typings of its entry point declare the directive's input with an `InputSignal` or `InputSignalWithTransform` whose write type argument names the use's alias (read from the typings' syntax tree with TypeScript's parser).
2. Behaviour: two generated probe programs, type-checked with `tsc` against the packed package resolved through its `exports`:
   - with no declaration file: every default name of each names registry, and the default count of each count registry, is assignable to each of its uses' write types, and the sentinel name and the default count plus 1 are not;
   - with a generated declaration file that adds the sentinel `nfsProbeSentinel` to every names registry, removes every default, and sets every count registry's `count` to its default plus 4: the sentinel is assignable to every name, query, and rules use (a rules use as the key `{nfsProbeSentinel: ...}`), the raised count to every count use, and a removed default, a misspelt name, and the raised count plus 1 are not (`@ts-expect-error`, so an unexpected pass fails as TS2578).
   - The write type is read as `S extends InputSignalWithTransform<any, infer W> ? W : never` from the directive's public input member, which is what the template type check assigns to (measured with `@angular/core` 22.2.0 types: `unknown` in place of `any` infers `never`).
3. Sass: compiling Foundation 6.9's defaults with `@import 'ngx-foundation-sites';` and every Library mixin prints, for every registry, exactly the manifest's defaults or count in the Variant property format, and each registry's property is printed by exactly the mixins its `mixins` field names.

A failure names the use and what went wrong. The check lives in the library's own workspace; consumers never run it.
````

Tests and stories: line 536 ("The Variant typings check (items 1 and 2) runs as its own target after the library build, in CI and before publishing."); layer 3, line 534 (Sass fixtures: "the manifest-to-Sass check of the typings check, item 3").

Needs: the packed library build's emitted typings; the Variant manifest's `uses` entries; two generated TypeScript probe programs; a Sass compile of Foundation's defaults with every Library mixin.

Rule as documented usage: none (this is the library's own internal build gate, not a consumer-facing documented rule).

Mentions: D26, line 591 ("Build assertion | Alias names in the emitted typings plus two probe programs from the manifest, plus the manifest-to-Sass compile").

Boundary call: this is a distinct check from the consumer-facing `nx sync:check`/Architect `check` mode above (it runs inside the library's own release pipeline, never in a consumer workspace), but it is the same "check mode" family described by ticket 158's build-time bullet for the Variant declaration tooling, so it is recorded as a second build-time entry rather than folded into the first.

Kept (not a check), variant-declaration-tooling.md:

- The setup generator (`ngx-foundation-sites:variant-types`): writes the `nfs-variants` target, the first declaration file, tsconfig edits, npm scripts - generate mode, explicitly kept by ticket 158 item 3.
- The sync generator's write behaviour (rewriting a generated/absent file when its model differs, outside CI) - generate mode.
- The Architect builder's default write mode (`ng run shop:nfs-variants` with `check` unset or `false`) - generate mode.
- The primary entry point's API (the 26 Variant registries, `NfsOverridableStringUnion`, `NfsOverridableCount`, `NfsClassBreakpoint`, `NfsVariantBoolean`/`nfsVariantBoolean`) - types and one pure function, not a check.
- The Variant manifest's data shape (`NfsVariantManifest`, `NfsVariantManifestRegistry`, `NfsVariantManifestUse`) - a data structure the checks and the generator both read, not itself a check.
- The Variant declaration file's format rules (header, `declare module` block, `declare global {}`, formatting) - rendering rules for generate mode.
- The Variant property format grammar (names/count/empty) - a shared grammar both generate mode and the checks read, not itself a check.
- Workspace configuration (target registration, `syncGenerators` entries, `sync.applyChanges`) - generate mode.

Counts for variant-declaration-tooling.md: forgotten-import 0 (a mention of the Selector manifest / `missing-imports` builder appears, recorded below), family 0, misuse 0, runtime 0, build-time 2 (CI check mode with its full Messages table; the Variant typings check). Total 2 full checks extracted; the messages table inside the first entry stands for the "and its messages" clause of ticket 158's build-time bullet in full.

### forgotten-import: Selector manifest and `missing-imports` builder (cross-reference only)

Location: "Hierarchy and package shape", lines 136, 197-199; design decision D22, line 587.

Text:

````
The Variant manifest is a JSON document inside the package, read by the tooling from its own install location, never exported through the package's `exports` and never loaded by application code. It is the one list the library's Sass, types, generator, and typings check agree on. The package ships a second JSON document under the same rules, the Selector manifest of [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md), which the `ngx-foundation-sites:missing-imports` builder reads; that spec owns its shape and its build steps.
````

````
  Selector manifest (JSON), for the forgotten-import checks
    <- setup generator  ngx-foundation-sites:missing-imports   (package "generators"; "schematics" via convertNxGenerator)
    <- builder          ngx-foundation-sites:missing-imports   (package "builders": Angular CLI and Nx)
````

Tests and stories: none in this file (owned by issue 150).

Needs: the Selector manifest's shape and build steps are owned entirely by the forgotten-import checks spec (issue 150), not by this file.

Rule as documented usage: none stated here.

Mentions: D22, line 587 ("one Architect builder per tool for both workspace kinds (`variant-types`, and `missing-imports` of the forgotten-import checks)").

Boundary call: this file only names the Selector manifest and the `missing-imports` builder as a sibling piece of packaging infrastructure ("that spec owns its shape and its build steps"); it does not specify their content. Recorded as a cross-reference, not counted among this file's own check entries, since the actual check (the forgotten-import static check) belongs to issue 150's spec.

---

## specs/visibility-classes.md

### forgotten-import: In-family checks (NfsVisibility, NfsShowForSr, NfsShowOnFocus)

Location: "Hierarchy and DI shape", line 140.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)): `NfsVisibility`, `NfsShowForSr`, and `NfsShowOnFocus` each call `nfsDirectiveCheck` with their class name, with no parent check, no child probes, and no peers, and `strictParents` changes nothing.
````

Tests and stories: not tested in this file for the checks themselves (issue 150's own tests, out of this group).

Needs: `nfsDirectiveCheck` per directive.

Rule as documented usage: none (a forgotten import of any of the three directives is accepted with no report in the first milestone).

Mentions: none beyond its own paragraph.

### misuse: Dev-mode check 1 (copied classes)

Location: "API: NfsVisibility" > "Development-mode checks", line 179; design decision D8, line 472.

Text:

````
1. Copied classes (D8): a static class list holding a Visibility class warns, naming each class with the input to bind, for example "class="show-for-medium" is set by nfsVisibility: bind showFor="medium" instead". `show-for-sr` and `show-on-focus` name `nfsShowForSr` and `nfsShowOnFocus`; `show-for-ie` and `hide-for-ie` say "Internet Explorer detection matches no supported browser (-ms-high-contrast); remove the class". A copied class is not stripped, so it keeps styling until removed; one equal to a class the inputs select merges with it and is not reported; the consumer's own classes are not reported.
````

Tests and stories: layer 2, line 395 ("a static `class="show-for-medium hide-for-ie show-for-sr hide-for-print"` warns once, naming `showFor`, the IE removal, `nfsShowForSr`, and `hideFor="print"`").

Needs: `HostAttributeToken('class')` read in development builds only; no Sass.

Rule as documented usage: set Visibility classes through `nfsVisibility`'s `showFor`/`hideFor`/`invisible`/`visible` inputs, or through `nfsShowForSr`/`nfsShowOnFocus`, never by copying Foundation's class names; `.show-for-ie`/`.hide-for-ie` have no replacement (D6).

Mentions: D8, line 472.

### misuse: Dev-mode check 2 (a combination Foundation's CSS cannot give)

Location: "API: NfsVisibility" > "Development-mode checks", lines 180-185; design decisions D4 and D21, lines 468, 485.

Text:

````
2. A combination Foundation's CSS cannot give (D4, D21), one warning for the first rule that matches, in this order:
   1. `showFor` or `hideFor` holds `'landscape'` or `'portrait'` while the other input holds any value, except `showFor="portrait"` with `hideFor="print"`: "nfsVisibility: Foundation's show-for-landscape sets display: block !important where it shows the element, which overrides <the other class>; put one condition on a wrapper element".
   2. `showFor` holds `'dark-mode'` while `hideFor` holds any value but `'print'`: the same message, naming `show-for-dark-mode`.
   3. `showFor` holds `'print'` while `hideFor` holds any value: "nfsVisibility: showFor="print" shows this element only in print, where <the other class> either hides it as well or has no effect; remove hideFor or put it on a wrapper element".

   Measured in four engines under `foundation-everything`'s include order: the orientation and `show-for-dark-mode` pairs with a breakpoint class and `.hide` all fail by the override; `show-for-landscape` beside `hide-for-print` still prints, and `hide-for-landscape` or `hide-for-portrait` beside `show-for-print` shows the element on screen in one orientation; `show-for-print` beside a hide class up to `$print-breakpoint`, `.hide`, or `hide-for-print` never shows, and beside a hide class above `$print-breakpoint`, `hide-for-dark-mode`, or `hide-for-sticky` it prints as it would alone. `hideFor="dark-mode"` and the sticky conditions combine with a breakpoint class, and `hideFor="print"` combines with every breakpoint `showFor`, `showFor="sticky"`, `showFor="dark-mode"`, and `showFor="portrait"` (whose own rule already hides it in print), so none of those warns. Under the reverse include order (the Visibility classes before `foundation-typography`, measured) every `showFor="print"` pair prints as the element would alone and `showFor="landscape"` with `hideFor="print"` combines; the check still warns on them, because it cannot see the include order and each pair is then either pointless or right only by source order.
````

Tests and stories: layer 2, line 395 (extensive data-driven combination cases: warning pairs and silent pairs listed exhaustively).

Needs: reads only the directive's own `showFor` and `hideFor` inputs against each other; no Sass.

Rule as documented usage: do not combine `showFor`/`hideFor` `'landscape'`/`'portrait'`/`'dark-mode'` with another value on the same element (put one condition on a wrapper), and do not combine `showFor="print"` with any `hideFor` value.

Mentions: D4, D21, lines 468, 485.

### family: Dev-mode check 3 (a sticky condition out of place)

Location: "API: NfsVisibility" > "Development-mode checks", line 186.

Text:

````
3. A sticky condition out of place (D4): `showFor` or `hideFor` is `'sticky'` and no ancestor of the host carries `.sticky` (the class `nfsSticky` binds) or the `nfsSticky` attribute, or the host carries either itself: "nfsVisibility: showFor="sticky" reacts to an enclosing nfsSticky element's stuck state; put it on an element inside nfsSticky". A placement check reads the DOM alone (building-blocks 1.9). An ancestor that carries the `nfsSticky` attribute without `.sticky` is a Sticky element whose import was forgotten, which `strictDirectiveImports` reports once on that element, so this check stays silent there rather than naming the wrong fix (the one-report rule of the [Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)).
````

Tests and stories: layer 2, line 395 ("`showFor="sticky"` outside an element carrying `.sticky`, and on that element itself, warn once, and inside it is silent, as it is inside an element carrying `nfsSticky` whose `NfsSticky` is left out of the test host's imports").

Needs: reads the host's own DOM ancestry for a Sticky element's static class or attribute (a DOM-only placement check, building-blocks 1.9); no Sass.

Rule as documented usage: `showFor="sticky"`/`hideFor="sticky"` must sit on an element inside an `nfsSticky` element (not on the Sticky element itself).

Mentions: D4, line 468.

Boundary call: classified `family` because it reads DOM ancestry outside its own host (a Sticky-family element), consistent with the same reasoning applied to top-bar.md's section-placement check (check 7) and xy-grid.md's cell-placement check (check 2) below, even though `NfsVisibility` and `NfsSticky` are different Foundation component families composing only by placement.

### misuse: Dev-mode check 4 (a second owner)

Location: "API: NfsVisibility" > "Development-mode checks", line 187; design decision D7, line 471.

Text:

````
4. A second owner (D7): a class this directive lists is missing from the host's class list, or the host carries a Visibility class that neither this directive nor the static `class` attribute put there: "nfsVisibility: another directive on this element binds Visibility classes (<class>); put nfsVisibility on a wrapper element". The Responsive Toggle's class records, whose `false` entries win over a `true` in a lower-priority binding (Angular consults a binding's value unless it is `undefined`), are the case it catches.
````

Tests and stories: not explicitly separated at layer 2 (covered implicitly by the sibling test-directive cases at line 395's end: "a sibling test directive whose `[class]` binding sets `hide-for-large` to `false` and takes priority... warns once beside `hideFor="large"`, and one binding `hide-for-medium` beside `showFor="large"` warns once").

Needs: reads only the host's own resulting class list versus what `NfsVisibility` itself bound; no Sass.

Rule as documented usage: do not put `nfsVisibility` on the same element as a Plugin directive that already binds Visibility classes for its own behaviour (the Responsive Toggle's bar/menu, a Drilldown level); put `nfsVisibility` on a wrapper element instead.

Mentions: D7, line 471 ("`nfsVisibility` stays off their elements, which development check 4 reports").

### misuse: Dev-mode check 5 (`invisible` and `visible` both true)

Location: "API: NfsVisibility" > "Development-mode checks", line 188.

Text:

````
5. `invisible` and `visible` both true: "nfsVisibility: .visible overrides .invisible on the same element; set one".
````

Tests and stories: layer 2, line 395 ("`invisible` with `visible` warns once").

Needs: reads only the directive's own `invisible` and `visible` inputs; no Sass.

Rule as documented usage: set only one of `invisible`/`visible` on an element; `.visible` overrides `.invisible` on the same element, so combining them is pointless.

Mentions: D5, line 469.

### misuse: `NfsShowForSr`'s development check (D9)

Location: "API: NfsShowForSr", line 200; design decision D9, line 473.

Text:

````
- Development check (D9), once, in an `afterNextRender` created only when `ngDevMode` is on: the host, or an element inside it, is tabbable by CDK's `InteractivityChecker` (`isFocusable`, then `isTabbable`): "nfsShowForSr: <tag> is visually hidden but takes focus, so keyboard users land on a 1 by 1 px box they cannot see (WCAG 2.4.7). Keep the control visible and put the hidden text inside it; for a skip link, use nfsShowOnFocus". A host inside a focusable control (the text of a button) is silent: only the host and its descendants are checked.
````

Tests and stories: layer 2, line 396 ("on a `button`, on a `span` holding a link, and on a `.show-for-sr` file input, it warns once; on a `span` inside a button, on a `div role="status"`, and on a `span` holding a `tabindex="-1"` element, it is silent.").

Needs: CDK `InteractivityChecker` (`isFocusable`, `isTabbable`); reads only its own host and descendants; no Sass.

Rule as documented usage: never put visually hidden `nfsShowForSr` text on, or around, a focusable element; keep the control visible and put the hidden text inside it, or use `nfsShowOnFocus` for a skip link.

Mentions: line 266 (WCAG table, 2.4.7 row); D9, line 473.

### misuse: `NfsShowOnFocus`'s development check (D9)

Location: "API: NfsShowOnFocus", line 210; design decision D9, line 473.

Text:

````
- Development check (D9), once, in an `afterNextRender` created only when `ngDevMode` is on: the host is not tabbable by `NfsShowForSr`'s test. With a tabbable descendant: "nfsShowOnFocus: .show-on-focus shows only the element that has focus, so this <tag> stays hidden while its <a> has focus; put nfsShowOnFocus on the <a> itself". Without one: "nfsShowOnFocus: Tab never reaches this <tag>, so it never shows; use a link with an href or a button".
````

Tests and stories: layer 2, line 397 ("on a `p` holding a link it warns naming the link; on a `span` with no focusable content it warns that Tab never reaches it; on a link with an `href` and on a `button` it is silent.").

Needs: CDK `InteractivityChecker` (shared with `NfsShowForSr`'s test); reads only its own host and descendants; no Sass.

Rule as documented usage: `nfsShowOnFocus` goes directly on the focusable element itself (a link with `href` or a button), never on a wrapper around one.

Mentions: D9, line 473.

### runtime: `NfsVisibility`'s Runtime check (D11)

Location: "API: NfsVisibility", line 189; design decision D11, line 475.

Text:

````
- Runtime check (D11): in the same read phase, only while `showFor` or `hideFor` holds a Breakpoint query, `NfsVisibility` calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])`, then `value('showFor', value, needs)` and `value('hideFor', value, needs)` for each bound value: `[{setting: 'breakpoint-classes', name: <bp>}]` for a class of a breakpoint, `[]` for a condition, `.hide`, or the Zero breakpoint's `showFor` (whose meaning needs no class), and `null` for a value that maps to no class. `strictVariantNames` reports a breakpoint `--nfs-breakpoint-classes` does not list; `strictVariantProperties` reports a missing `@include nfs-breakpoint-properties;`. `invisible` and `visible` are closed and need no call. The directive writes no Variant property; `nfs-breakpoint-properties` is the one writer of `--nfs-breakpoint-classes` ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).
````

Tests and stories: layer 2, line 399 ("Runtime check: with `--nfs-breakpoint-classes: small medium large` on the test document, `showFor="medium"` is silent and `showFor="xlarge"` through a cast reports `strictVariantNames` once...").

Needs: `nfsVariantCheck('nfsVisibility')` handle (line 137); `include()`/`value()` calls; the `--nfs-breakpoint-classes` Variant property.

Rule as documented usage: none directly beyond what the closed/typed input already enforces at compile time.

Mentions: line 137 ("the Runtime checks' `nfsVariantCheck('nfsVisibility')` handle"); line 176 ("the Variant check reports it").

Kept (not a check), visibility-classes.md:

- The class-mapping and host bindings for `showFor`/`hideFor`/`invisible`/`visible`, `nfsShowForSr`, and `nfsShowOnFocus` - behaviour, not a check.
- The content rules of D14 (hidden content needs a displayed alternative, print content rules) - explicitly documented requirements with "no check" (D14 rationale: "the directive cannot read meaning, so the requirement is content").
- The skip-link recipe (D15) - documented usage, not a check.
- No Library mixin exists (Sass subsection: "No library CSS; there is no `nfs-visibility` mixin"), so no build-time check exists in this file.

Counts for visibility-classes.md: forgotten-import 1, family 1, misuse 6, runtime 1, build-time 0. Total 9.

---

## specs/xy-grid.md

### forgotten-import: In-family checks (all four directives, with child probes)

Location: "Hierarchy and DI shape", line 135.

Text:

````
- In-family checks ([Spec: forgotten-import checks (shared utility)](../issues/150-spec-forgotten-import-checks.md)), in development builds only: `NfsGridContainer` calls `nfsDirectiveCheck('NfsGridContainer', {children: ['NfsGridX', 'NfsGridY']})` and probes the grids it holds, because Foundation's container exists to contain a grid ("To contain it horizontally use the `grid-container` class") and reaches its padding grid through `.grid-container:not(.full) > .grid-padding-x`; `NfsGridX` and `NfsGridY` each probe their cells (`nfsDirectiveCheck('NfsGridX', {children: ['NfsCell']})`, and the same for `NfsGridY`); `NfsCell` calls `nfsDirectiveCheck('NfsCell')` and probes nothing, because a cell holds the consumer's content and a grid nested in it is a grid of its own, as the Accordion's content probes no nested accordion. No part has a parent check, because none injects a parent (a cell outside a grid is check 2's, read from the DOM), and none has a peer linked by reference or value; the probes read the DOM in development only, so production keeps no link (D14); `strictParents` changes nothing.
````

Tests and stories: not tested in this file for the checks themselves (issue 150's own tests, out of this group).

Needs: `nfsDirectiveCheck` per directive, with `children` probes for `NfsGridContainer`, `NfsGridX`, `NfsGridY`.

Rule as documented usage: none (a forgotten import of any of the four directives is accepted with no report in the first milestone).

Mentions: line 213 (development check 2's silence rule cross-references `strictDirectiveImports` and "the container's probe when a container holds it").

### misuse: Dev-mode check 1 (copied classes, all four directives)

Location: "API" > "Development-mode checks", line 212; design decision D7, line 473.

Text:

````
1. Copied classes, on all four directives: a static class list holding an XY Grid class the directive sets warns once, naming each class with its input, for example "class="medium-6 large-offset-2" is set by nfsCell: bind [size]="{medium: 6}" and [offset]="{large: 2}" instead". The patterns are built from the Breakpoint map's names (`nfsBreakpointsToken`): the size, offset, `up`, collapse, frame, and cell block templates, `auto`, `shrink`, the four gutter classes, `fluid`, `full`, and the static classes of the other three directives (`grid-x` copied onto `nfsGridY` names `nfsGridX`). The Flexbox Utilities' classes that Foundation's grid examples carry (`.align-*` and `.align-center-middle` on a grid, `.align-self-*` and `.<bp>-order-<n>` on a cell) are reported the same way, naming `nfsFlexAlign` or `nfsFlexChild` and the input to bind, as the Button Group reports them. A copied class is not stripped (D7); a redundant copy of the host's own static class is not reported; the consumer's own classes are not reported.
````

Tests and stories: layer 2, line 419 ("`class="cell medium-6 medium-offset-2 grid-margin-x"` on `nfsCell` warns once, naming `size`, `offset`, and `nfsGridX`'s `gridMarginX`, and the copied classes remain; a redundant `cell` does not warn; `grid-y` copied onto `nfsGridX` names `nfsGridY`; `class="align-center"` on `nfsGridX` and `class="small-order-2"` on `nfsCell` name `nfsFlexAlign` with `alignX` and `nfsFlexChild` with `order`").

Needs: `HostAttributeToken('class')` read in development builds only, built against `nfsBreakpointsToken`'s Breakpoint map for the templated names; no Sass.

Rule as documented usage: set XY Grid classes through the matching directive's inputs (`nfsGridContainer`/`nfsGridX`/`nfsGridY`/`nfsCell` and their Variant inputs), never by copying Foundation's class names; alignment and order classes belong to the Flexbox Utilities' `nfsFlexAlign`/`nfsFlexChild`, written beside the grid directives.

Mentions: D7, line 473; line 118 (binding rule paragraph).

### family: Dev-mode check 2 (placement: cell outside a grid, offset in a vertical grid)

Location: "API" > "Development-mode checks", line 213.

Text:

````
2. Placement, on `NfsCell`, read from the DOM at the first render, where an element is a grid when it carries `grid-x` or `grid-y` or the attribute `nfsGridX` or `nfsGridY`: a parent element that is no grid warns "nfsCell: this cell is not a direct child of nfsGridX or nfsGridY, so its size, offset, and gutters do not apply"; an `offset` whose parent carries `grid-y` or `nfsGridY` warns "nfsCell: offsets move cells sideways and work only in nfsGridX (Foundation: "X Grid only")". A parent that carries a grid's attribute without its class is a grid whose import was forgotten: the `strictDirectiveImports` Runtime check reports it once on that element, as do the container's probe when a container holds it and the static check in CI, so its cells stay silent instead of each warning, falsely, that it is outside a grid.
````

Tests and stories: layer 2, line 419 ("a cell whose parent has neither grid class warns once; a cell whose parent carries `nfsGridX` with `NfsGridX` left out of the test host's imports gives no placement warning; an `offset` in `nfsGridY` warns, and so does one under an `nfsGridY` whose directive is left out").

Needs: reads the host's own DOM ancestry (its parent element) for a grid's static class or attribute - a DOM-only placement check (building-blocks 1.9); no Sass.

Rule as documented usage: an `nfsCell` must be a direct child of an `nfsGridX` or `nfsGridY` element for its `size`, `offset`, and gutter inputs to apply, and `offset` works only in `nfsGridX` ("X Grid only" in Foundation's docs).

Mentions: line 11 (Problem Statement: "on a `.grid-y` they do nothing, silently"); D9, line 475.

Boundary call: classified `family` (a DOM-only placement check reading the host's parent element), the same reasoning applied to top-bar.md's check 7 and visibility-classes.md's check 3, though `NfsCell` and `NfsGridX`/`NfsGridY` compose loosely (any element with the class/attribute counts, not a strict Angular parent-child DI relationship).

### misuse: Dev-mode check 3 (cell block name)

Location: "API" > "Development-mode checks", line 214.

Text:

````
3. Cell block name, on `NfsCell`, whenever `cellBlock` or `cellBlockY` becomes set: a `div` or `section` host with neither a non-blank `aria-label` nor an `aria-labelledby` warns "nfsCell: a scrolling cell block is a region and needs a name: add aria-labelledby pointing at its heading (WCAG 4.1.2)"; an `aria-labelledby` naming no element in the document warns naming the missing ids. A host with a role of its own (`main`, `aside`, `nav`, `article`, `form`, a static `role`) is not asked for a name.
````

Tests and stories: layer 2, line 419 ("an unnamed `div` or `section` cell block warns, a named one, a `main` one, and an `aside` one do not; an `aria-labelledby` naming a missing id warns").

Needs: reads only its own host's `aria-label`/`aria-labelledby` and tag/role; no Sass.

Rule as documented usage: name a scrolling `div`/`section` cell block with `aria-labelledby` pointing at its heading (or `aria-label`); a host with its own landmark role (`main`, `aside`, `nav`, `article`, `form`) needs no added name.

Mentions: line 247 (ARIA table, cell block on `div` row); WCAG table, 4.1.2 row, line 267.

### misuse: Dev-mode check 4 (both container widths)

Location: "API" > "Development-mode checks", line 215; design decision D3, line 469.

Text:

````
4. Both container widths, on `NfsGridContainer`: `fluid` and `full` both set warns "nfsGridContainer: fluid has no effect beside full".
````

Tests and stories: layer 2, line 419 ("`fluid` with `full` warns").

Needs: reads only the directive's own `fluid` and `full` inputs; no Sass.

Rule as documented usage: set only one of `fluid`/`full` on `nfsGridContainer`; `.full`'s CSS rule wins when both are set, so `fluid` has no effect beside `full`.

Mentions: D3, line 469.

### misuse: Dev-mode check 5 (frame clipping)

Location: "API" > "Development-mode checks", line 216; design decision D10, line 476.

Text:

````
5. Frame clipping, on `NfsGridX` and `NfsGridY` while `gridFrame` is set (D10): a `ResizeObserver` on the host and its child elements, created in the read phase the first time `gridFrame` is set and disconnected on destroy, reads the host's computed `overflow`; while it is `hidden` and `scrollHeight` or `scrollWidth` exceeds the client size by more than 1 px, it warns once: "nfsGridY: this grid frame clips content at the current viewport (WCAG 1.4.10): make the cell that overflows a cell block (cellBlockY), or start the frame at a larger breakpoint (gridFrame="medium")".
````

Tests and stories: layer 2, line 419 ("a frame fixture of fixed height with `overflow: hidden` whose content is taller warns once and stays silent after later resizes (once per instance); a frame whose overflowing cell is a cell block does not warn").

Needs: a `ResizeObserver` on the host and its children, reading computed `overflow`, `scrollHeight`/`scrollWidth`, and client size; no Sass.

Rule as documented usage: a `gridFrame` cell whose content can outgrow its share should be a cell block (`cellBlockY`/`cellBlock`), or the frame should start at a larger breakpoint than the Zero breakpoint (`gridFrame="medium"`), so it never clips content (WCAG 1.4.10).

Mentions: D10, line 476; WCAG table, 1.4.10 row, line 270.

### runtime: Each directive's Runtime check

Location: "API" > "Runtime check", line 217.

Text:

````
- Runtime check, in the same read phase: each directive calls `include()` only while a value that reads a property is bound, because `nfs-xy-grid` carries no rule the grid needs (the Breakpoint service spec's rule for such directives): `NfsCell` calls `include('nfs-xy-grid', ['grid-columns'])` while `size` or `offset` holds a count, `NfsGridX` calls `include('nfs-xy-grid', ['xy-block-grid-max'])` while `up` is bound, and each calls `include('nfs-breakpoint-properties', ['breakpoint-classes'])` while a bound value names a Class breakpoint above the Zero breakpoint. Then `value(input, value, needs)` for each bound input, with the needs from the same mapping that sets its classes: a size `n` needs `{setting: 'grid-columns', name: n}`, an offset `n` needs `{setting: 'grid-columns', name: n + 1}`, an `up` count `n` needs `{setting: 'xy-block-grid-max', name: n}`, and every breakpoint above the Zero breakpoint needs `{setting: 'breakpoint-classes', name: bp}`; a Zero-breakpoint collapse needs `{setting: 'breakpoint-classes', name: <zero>}` too, because Foundation loops the collapse classes over `$breakpoint-classes` alone, while every other family adds the Zero breakpoint itself. A value that maps to no class passes `null`. `NfsGridContainer` makes no call: its families are closed (the Tabs precedent). `nfs-xy-grid` alone writes its two properties, so the one-writer rule holds. The report shape and configuration are the Runtime checks' ([Spec: Breakpoint service (shared utility)](../issues/53-spec-breakpoint-service.md)).
````

Tests and stories: layer 2, line 420 ("Runtime check: with a style block writing `--nfs-grid-columns: 12; --nfs-xy-block-grid-max: 8; --nfs-breakpoint-classes: small medium large;`, bound values within range are silent; `size` 13 and `up` 9 through a cast report `strictVariantNames` once each, naming `$grid-columns` and `$xy-block-grid-max`; an `xlarge` key through a cast reports naming `$breakpoint-classes`; in a test file of its own, with no properties, a cell with `size="6"` reports `strictVariantProperties` once naming `@include nfs-xy-grid;`...").

Needs: `nfsVariantCheck('nfsGridX')`, `nfsVariantCheck('nfsGridY')`, `nfsVariantCheck('nfsCell')` handles (line 133); `include()`/`value()` calls; the `--nfs-grid-columns`, `--nfs-xy-block-grid-max` Variant properties (written by `nfs-xy-grid`) and `--nfs-breakpoint-classes` (written by `nfs-breakpoint-properties`).

Rule as documented usage: none directly beyond what the closed/typed count and breakpoint inputs already enforce at compile time.

Mentions: line 133 ("the Runtime checks' handle, `nfsVariantCheck('nfsGridX')`, `nfsVariantCheck('nfsGridY')`, and `nfsVariantCheck('nfsCell')`"); line 208 ("under the closed types only a cast or `$any()` reaches that guard, and the Variant check reports it").

### build-time - not present for xy-grid

Not applicable: "Sass" subsection, line 584: "1. Rules: none." - `nfs-xy-grid` writes only two Variant properties and no CSS rule, so it has no `@error`/`@warn` check.

Kept (not a check), xy-grid.md:

- The class-mapping and host bindings for the four directives' Structural and Variant classes - behaviour, not a check.
- Cell block `tabindex`/`role` attribute bindings themselves (D8) - required behaviour ("attributes as host bindings in the server HTML"), not a check (the name requirement built on top of it, check 3 above, is the check).
- The `nfs-xy-grid` mixin's two Variant properties (`--nfs-grid-columns`, `--nfs-xy-block-grid-max`) - data the Runtime check and the Variant declaration tooling read, not itself a check.
- Foundation's own "X Grid only" restriction on offsets, collapse, and `up` (D16) - a design/typing decision (which inputs exist on which directive), not a check; the *misuse* of writing `offset` in a vertical grid is what check 2 (above, classified `family`) reports.

Counts for xy-grid.md: forgotten-import 1, family 1, misuse 4, runtime 1, build-time 0. Total 7.

---

## Overall counts

| Kind | toggler | tooltip | top-bar | triggers | typography-helpers | variant-decl-tooling | visibility-classes | xy-grid | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| forgotten-import | 1 | 0 | 1 | 1 | 1 | 0 (+1 cross-ref) | 1 | 1 | 6 (+1 cross-ref) |
| family | 0 | 0 | 2 | 0 | 0 | 0 | 1 | 1 | 4 |
| misuse | 4 | 7 (+1 boundary) | 6 | 5 | 2 | 0 | 6 | 4 | 34 (+1 boundary) |
| runtime | 0 | 0 | 1 | 0 | 1 | 0 | 1 | 1 | 4 |
| build-time | 0 | 0 | 1 | 0 | 1 | 2 | 0 | 0 | 4 |
| **Total** | **5** | **7 (+2 mentions)** | **11** | **6** | **5** | **2 (+1 cross-ref)** | **9** | **7** | **52 full entries (+4 mentions/cross-refs)** |

## Boundary calls (every one, collected)

1. **tooltip.md** - the Positioner-owned pair (negative-offset warning on `vOffset`/`hOffset`, same-axis alignment, tip not `position: absolute`) is implemented and specified by the Anchored pane / Positioner spec (issue 55), outside this group's files; recorded as a `misuse`-leaning cross-reference rather than a full check entry.
2. **top-bar.md** - check 7 (section outside its bar) classified `family` because it is a DOM-only placement check reading ancestor DOM state, even though `NfsTopBarLeft`/`NfsTopBarRight` and `NfsTopBar` compose by placement, not by a strict Angular parent/child relationship in one class family.
3. **top-bar.md** - the Nested menu root's DOM-fallback check for the Top Bar's right-hand section (D9) classified `family`; its full specification lives in the Dropdown Menu / Nested menu specs (issues 21, 56), outside this group; recorded here because top-bar.md's own `nfsTopBarRightToken` and its M7 description are what the check reads.
4. **triggers.md** - dev check 1 (no target)'s suppression logic reads the forgotten-import mechanism's shared verdict (M1, `strictDirectiveImports`); the check itself, judged by what it reads about the Trigger's own state, is classified `misuse`.
5. **variant-declaration-tooling.md** - the Variant typings check (the library's own post-build/pre-publish gate) is recorded as a second, distinct `build-time` entry from the consumer-facing `nx sync:check`/Architect `check` mode, because it runs only inside the library's own release pipeline.
6. **variant-declaration-tooling.md** - the Selector manifest and `ngx-foundation-sites:missing-imports` builder are named (packaging cross-reference) but not specified here; their shape and build steps belong to the forgotten-import checks spec (issue 150).
7. **visibility-classes.md** - dev check 3 (a sticky condition out of place) classified `family` for the same DOM-ancestry reasoning as top-bar.md's check 7.
8. **xy-grid.md** - dev check 2 (placement: cell outside a grid, offset in a vertical grid) classified `family` for the same DOM-ancestry reasoning.

## Verify

Searched each of the eight files for the required terms (`nfsDirectiveCheck`, `strictDirectiveImports`, `strictParents`, `In-family`, `Forgotten import`, `forgotten import`, `Selector manifest`, `nfsReportForgottenPeer`, `Runtime check`, `provideNfsRuntimeChecks`, `@error`, `@warn`, `dev check`, `development check`, `Dev-mode check`, `development warning`, `warns`, `console.warn`, `sync:check`, `check mode`, `missing-imports`), with a positive control (the same searches reliably found every check already catalogued above, and reported "Omitted long matching line" placeholders that were cross-checked against the full file reads already performed, not treated as evidence of absence).

- `nfsReportForgottenPeer`: zero hits in all eight files. Positive control: the term is defined in ADR 0046 (a different file); its absence here is consistent with none of these eight components being a "family" whose parent check itself reports a forgotten peer on the family's behalf (that mechanism belongs to the forgotten-import checks spec, issue 150, and to specs with true parent/child family checks such as Accordion, not represented in this group).
- `console.warn`: zero literal hits; the specs consistently say "warns" or "reports" rather than naming the call `console.warn` directly, except top-bar.md and triggers.md/xy-grid.md's "Development checks... through `console.warn`" line (top-bar.md line 209). Accounted for within each file's misuse checks above.
- `Selector manifest`: one hit, in variant-declaration-tooling.md (line 136, 197), recorded as a forgotten-import cross-reference above.
- `@error`/`@warn`: hits confirmed only in top-bar.md and typography-helpers.md (both have Library mixins with contrast checks), matching the two build-time entries recorded for those files. Toggler, Tooltip, Triggers, Visibility Classes, and XY Grid have no Library mixin (each file's own Sass subsection says so explicitly), so no `@error`/`@warn` hits were expected or found, except benign uses of the word "error" in prose (e.g., "the error Angular logs on a replayed `preventDefault()`" in triggers.md, not a Sass check) and "errorToString" in variant-declaration-tooling.md (an Nx API name, not a Sass directive).
- `check mode` / `sync:check`: hits confirmed only in variant-declaration-tooling.md, matching its two build-time entries.
- No hit in any of the eight files was left unaccounted: every match traced back either to a check already catalogued above, a "Kept (not a check)" line, or a boundary-call cross-reference.
