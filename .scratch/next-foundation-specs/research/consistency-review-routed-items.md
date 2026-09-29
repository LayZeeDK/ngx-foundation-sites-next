# Items routed to [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md) (Consistency review: the class-rule wave)

Evidence sweep across `EFFORT/issues/*.md`, `EFFORT/research/*.md`, `EFFORT/audits/*.md`, and the specs' Notes
for every item another ticket routed to [133](../issues/133-consistency-review-class-rule-wave.md). Collected only;
no item is decided here.

Method: `EFFORT/audits/*.md` (0001-0007) predate the class-rule wave and its tickets (79, 107-150) and refer only to
the earlier [Consistency review and bundle index](../issues/36-consistency-review.md); they carry no item for 133
(checked: no "class-rule wave" or "133" hit resolves to an actual routing statement there). A bare "133" almost
never means the ticket (it is overwhelmingly a line number or a browser version); the reliable marker is the literal
link text `Consistency review: the class-rule wave`, found in 63 issue/research files, plus four spec Notes that use
the equivalent short form "the class-rule consistency review". Two sequencing-only mentions (issues 79 and 81, and
part of 136/137) say only that 133 waits on another ticket; they carry no checkable item and are not rows below.

## Table

| id | source (ticket or file, section, line) | item | specs it touches | kind | status |
| --- | --- | --- | --- | --- | --- |
| R1 | issues/104:156-162 (own text); issues/82:143; issues/93:157; issues/94:158; issues/114:116; issues/115:108; issues/125:163 | Replace the "`nfsShowForSr` ... until that spec names it" / "a placeholder" qualifier wording (Visibility Classes' own directive is already named `nfsShowForSr`; only the qualifier text needs removing) in Abide, Button Group, Badge, Label, Drilldown Menu, Responsive Menu, Orbit. | visibility-classes, abide, button-group, badge, label, drilldown-menu, responsive-menu, orbit | placeholder name | open |
| R2 | issues/109:150; issues/110:162; issues/116:125; issues/118:118,160-163; issues/130:131 | Check that the four Motion inputs share one pair type (`NfsMotionPair`, proposal 2/3) and one consumer-class form (leading dot vs. object); that no spec still writes an `nfs-` class as a Motion value ("the Toggler, Dropdown, and Responsive Toggle specs do today"). | toggler, reveal, responsive-toggle, dropdown, triggers | cross-spec wording | open |
| R3 | issues/85:189; issues/112:128; issues/113:210; issues/114:116; issues/115:108; issues/132:164 | Check that no menu spec's example writes `menu`, `vertical`, `nested`, `is-active`, `align-*`, `submenu-toggle-text`, or `js-drilldown-back`, and that every plugin root's `hostDirectives` exposes the Menu's five inputs under the same names. | menu, accordion-menu, dropdown-menu, drilldown-menu, responsive-menu, nested-menu | cross-spec wording | open |
| R4 | issues/86:219-220; issues/95:187; issues/112:128; issues/115:108; issues/124:105 | "The exact-luminance helper of proposal 4 replaces Foundation's `color-luminance()`" in every spec's compile-time contrast check ("Button, Forms, Close Button, Menu, Tabs, Accordion, Abide, Orbit, Slider, Off-canvas, Reveal, Dropdown Menu, Responsive Toggle", plus Top Bar, Progress Bar, Accordion Menu, Responsive Menu), with quoted ratios rechecked (Slider's 1.31:1/3.76:1; menus' 4.65:1 not 4.59:1). | button, forms, close-button, menu, tabs, accordion, abide, orbit, slider, off-canvas, reveal, dropdown-menu, responsive-toggle, top-bar, progress-bar, accordion-menu, responsive-menu | contrast figure | open |
| R5 | issues/93:157; issues/94:158 | "Check that every Storybook override that merges `$foundation-palette` states which palettes it reaches (Callout and Progress Bar directly; not Badge, Label, or Button)." | badge, label, callout, progress-bar, button | shared-document rule | open |
| R6 | issues/93:157; issues/94:158 | "Check that the specs relying on `color-pick-contrast()` (Button, Button Group, Label) take a position on the measured wrong pick" (Badge and Label already corrected their own pick per their tickets; Button Group is unconfirmed). | button, button-group, label, badge | contrast figure | open |
| R7 | issues/126:87; specs/equalizer.md:128 | "Replace the placeholders `nfsGridX`, `nfsCell`, `size`, `up`, `nfsFlexContainer`, `direction`, `nfsFlexChild`, `nfsCard`, `nfsCardDivider`, `nfsCardSection`, `nfsRow`, and `nfsColumn` in the Equalizer spec once their specs publish, and restore the gutters in the examples." | equalizer, xy-grid, flexbox-utilities, card, float-grid | placeholder name | open -- specs/equalizer.md:128 still reads "the class-rule consistency review aligns this spec's examples if their final names differ" |
| R8 | issues/123:109 | "Replace the placeholders `nfsCallout`, its `color`, `ngx-foundation-sites/callout`, `nfsShowForSr`, `nfsGridX`, and `nfsCell` in the Abide spec." | abide, callout, visibility-classes, xy-grid | placeholder name | open |
| R9 | issues/98:157; issues/106:158 | "Replace the three placeholder names in the Forms spec" (`nfsGridX`/`nfsCell` for XY Grid; `nfsTextAlign` for Typography Helpers -- [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md) gives the literal replacement sentence). | forms, xy-grid, typography-helpers | placeholder name | open |
| R10 | issues/91:116,152; specs/media-object.md:440 | "The `nfsThumbnail` placeholder; the Menu's `align`" (whether a menu's inherited `text-align: right` changes its look, decided by the review) "; the 1.13 refinement." | media-object, thumbnail, flexbox-utilities, menu | placeholder name | open |
| R11 | issues/120:145; specs/sticky.md:409 | "That the neighbour names of decision 9 match the XY Grid and Thumbnail specs once published." | sticky, xy-grid, thumbnail, magellan, toggler | placeholder name | open -- specs/sticky.md:409 still says "aligned by the class-rule consistency review" |
| R12 | issues/121:86; specs/smooth-scroll.md:112 | "Check `NfsMenu`, `orientation`, and `NfsTopBar` in this spec against the published Menu and Top Bar specs." | smooth-scroll, menu, top-bar | placeholder name | open -- specs/smooth-scroll.md:112 still says "aligns this spec's examples if their final names differ" |
| R13 | issues/127:110 | "Once the Table spec names its hover Variant input, the [review] may show it there" (Interchange's `httpResource` example writes a plain `<table>`). | interchange, table | placeholder name | open -- precondition met (Table spec 92 already names the input `hover`); interchange.md's example not yet updated |
| R14 | issues/83:152 | "Check that every 2.5.8 row that names a close button (Off-canvas, Reveal, Toggler, Triggers, Button, Callout) points to the `nfs-close-button` floor, and that no container spec adds its own close-button target-size rule." | close-button, off-canvas, reveal, toggler, triggers, button, callout | cross-spec wording | open |
| R15 | issues/138:278; research/out-of-scope-triage-2.md:135; issues/148:109-115 | Orbit's unmeasured forced-colours bullets, measured against the treatments Switch (D12), Slider (rule 13), Progress Bar (D16), and Top Bar (D16) already give; plus 148's own findings: Playwright's WebKit matches the media query but forces no colour; `forced-color-adjust: none` needs a system colour on every selector, more specific ones included (Top Bar's `.menu-icon.dark::after` missed `$black`); a transparent border still draws in the forced border colour; Firefox's `Highlight`-on-`Canvas` emulation (2.941:1) diverges from the real Windows 11 themes (6.799-11.806:1) the Switch's and Slider's e2e assertions rely on. | orbit, switch, slider, progress-bar, top-bar | forced colours | open |
| R16 | issues/138:279; research/out-of-scope-triage-2.md:136 | "The three `hidden`-attribute notes (thumbnail-7, float-classes-4, flexbox-utilities-6) should point at each other and at the Toggler's `.is-hidden`. That is a wording check for the same review." | thumbnail, float-classes, flexbox-utilities, toggler | cross-spec wording | open |
| R17 | issues/82:143 | "`exportAs` is set on `nfsButton` and `nfsCloseButton` but not on `nfsButtonGroup` or the Forms directives, each for a stated reason" and "check that no spec's example sets `size` on an `nfsButton` inside `nfsButtonGroup`." | button-group, button, close-button, forms | cross-spec wording | open |
| R18 | issues/82:143 | "Replace the `nfsAlign` ... placeholder[]" (Button Group's own alignment input). | button-group | placeholder name | open |
| R19 | issues/82:143 | "List Aria's Toolbar as unused by the Button Group spec, with the reason that it is a different pattern and not a fallback." | button-group | other | open |
| R20 | issues/84:165 | Two custom-drawn form controls draw focus rings differently (Slider's library `2px solid $black` ring offset 2 px; Switch's `$input-border-focus` offset `$switch-paddle-offset`); "the review decides whether to align them." | switch, slider | cross-spec wording | open |
| R21 | issues/84:165 | "It also checks the Table D row, the README row, and the overrides lines." | switch | shared-document rule | open |
| R22 | issues/86:220; issues/117:157 | Check that no spec writes `.top-bar`, `.top-bar-*`, `.title-bar`, `.title-bar-*`, `.menu-icon`, or `dark` as a class; that every `$topbar-background: $white` line where a Top Bar shows submenus has its `$topbar-submenu-background` companion; that no spec still cites `nfs-responsive-toggle` or a panel-scoped rule for an Off-canvas close button/menu icon (see also R53). | top-bar, responsive-toggle, off-canvas, dropdown-menu, triggers | cross-spec wording | open |
| R23 | issues/87:143 | Check that no pagination example writes `current`, `disabled`, `ellipsis`, `pagination-previous`, `pagination-next`, or `text-center`, and replace the `nfsTextAlign` placeholder with the published name. | pagination, typography-helpers | placeholder name | open |
| R24 | issues/88:149 | Check that no breadcrumbs example writes `breadcrumbs`, `disabled`, `current`, or `show-for-sr`; every trail sits in a named `nav`; the landmark check's condition and wording match the Pagination's. | breadcrumbs, pagination, visibility-classes | cross-spec wording | open |
| R25 | issues/89:173 | The Storybook `$anchor-color` override raises the link colour of every story, so spec texts quoting Foundation's default link ratios stay true for defaults but not for stories; `close-button--closable` and `callout--closable` render one Foundation example with different assertions; check that no container spec other than Callout adds a close-button room rule without the hook's reasoning (Reveal, Off-canvas headings could meet the same 1.4.12 overlap). | callout, close-button, reveal, off-canvas | shared-document rule | open |
| R26 | issues/90:149 | Check whether other Foundation containers that clip with `overflow: hidden` (the XY Grid's frame, Orbit, Drilldown, the off-canvas wrappers, the Responsive Embed) can cut off text under 1.4.12 as the Card does; replace the placeholders above once their specs publish; check the Storybook override comment and the `nfs-card` include (proposal 7); the Callout's `$light-gray` figure. | card, xy-grid, orbit, drilldown-menu, off-canvas, responsive-embed, callout | cross-spec wording | open |
| R27 | issues/92:179 | Check that no spec writes `.hover`, `.unstriped`, `.striped`, `.stack`, `.scroll`, or `.table-scroll`; that building-blocks 1.10's Names wording (proposal 3) matches every spec; that the 1.13 exception (proposal 4) is worded the same wherever restated; that the Storybook overrides carry `$show-header-for-stacked: true`. | table | cross-spec wording | open |
| R28 | issues/93:157 | Check that no spec writes `.badge` or a palette class on a badge. | badge | naming | open |
| R29 | issues/94:158 | Check that Badge and Label agree on the link-host check; that no spec quotes Foundation's Custom Colors forms with `!default` or a parenthesised `map-remove` list; whether any other component on an `a` host with a one-class colour (a Callout on a link, a Thumbnail link) meets the same `a:hover, a:focus` override. | label, badge, callout, thumbnail | cross-spec wording | open |
| R30 | issues/95:187 | Check that no spec writes `.progress`, `.progress-meter`, `.progress-meter-text`, or a palette class on `<progress>`; every story with a progress bar or meter shows its Visible value; the one-writer exception is worded the same in building-blocks 1.13, ADR 0040, and the tooling spec; the Storybook alert override's reach (callouts, badges, labels) is reflected in their stories' figures. (Whether the Slider's forced-colours rule needs a Progress Bar counterpart is already decided here: not needed.) | progress-bar, badge, label, callout, slider | cross-spec wording | open |
| R31 | issues/96:150 | "The fixture app gets a Responsive Embed route with counted embed requests; check proposals 1 to 10; the Card's note (proposal 9)." | responsive-embed, card | test or story | open |
| R32 | issues/97:139 | "Apply proposal 6; check the Card, Sticky, and Toggler thumbnail examples against the project's image rule (`ngSrc` with `width` and `height`); check other specs that put a thumbnail inside a plain link, which check 3 now reports." | thumbnail, card, sticky, toggler | cross-spec wording | open |
| R33 | issues/98:157 | "Check that `nfs-abide` and `nfs-forms` no longer check the same settings; add the Forms spec to the README index." | forms, abide | shared-document rule | open |
| R34 | issues/99:181; issues/100:209 | "Check same-element input names across specs" (proposed change 3/4) -- building-blocks 1.4's rule that a template match discards a host-directive match on a shared input name. | xy-grid, float-grid, flex-grid, card, equalizer | naming | open |
| R35 | issues/100:209 | "The shared-name decisions above": Reveal's `.reveal.collapse`/`.reveal .column` rules share names with Float Grid's classes and are scoped so they never interact; Reveal's `collapse` input and the row's never share an element. | float-grid, reveal | cross-spec wording | open |
| R36 | issues/100:209; issues/101:179; issues/103:180; issues/104:156; issues/105:117 | "The Storybook preview order (proposed change 6)"; "align the Storybook title group for utility families and layout systems"; Float Classes' scaffolding uses `nfsFloat`/`nfsClearfix` -- feeding one `storybook-conventions.md` section 8 demo-scaffolding rewrite. | float-grid, flex-grid, flexbox-utilities, visibility-classes, float-classes | shared-document rule | open |
| R37 | issues/103:180 | "Align the beside-or-hosted choice of the grid, Flex Grid, and Media Object specs with decision 8." | flexbox-utilities, xy-grid, flex-grid, media-object | cross-spec wording | open |
| R38 | issues/103:180 | "Replace the three placeholders (table above)" in the Flexbox Utilities spec; "rewrite section 8's scaffolding list." | flexbox-utilities | placeholder name | open |
| R39 | issues/104:184 | Check that no spec writes a Visibility class outside rendered output and copied-class cases; that `nfsShowForSr` and `nfsVisibility` carry no placeholder qualifier; that no spec puts `nfsVisibility` on a Responsive Toggle or Drilldown-level element; and, with the other utility-family specs of this wave, whether their directive names follow one rule. | visibility-classes, responsive-toggle, drilldown-menu, flexbox-utilities, float-classes, typography-helpers, prototyping-utilities | naming | open |
| R40 | issues/120:145 | Check that no spec writes `.sticky`, `.sticky-container`, or a Sticky State class, or sends consumer CSS to `.is-stuck`; that every `nfsStickyContainer` in any spec's examples/stories spans more than its sticky element (the Top Bar example of proposal 4 did not); the inline overflow values of `sticky--overflow-hidden-ancestor` against storybook-conventions.md section 8 as rewritten. | sticky, top-bar | cross-spec wording | open |
| R41 | issues/102:122 | "Sticky D19 and the `sticky--overflow-hidden-ancestor` story: the first overflow value can now be `nfsOverflow=\"hidden\"`; `overflow: clip` stays inline ... The Sticky re-run left this to the consistency review." | sticky, prototyping-utilities | naming | open |
| R42 | issues/102:123 | "The `position: relative` containing block can be `nfsPosition=\"relative\"`; the `overflow: auto` scroller, the pane width, the trigger coordinates, and the tall body stay inline, since Foundation's default lists have no class for them." | anchored-pane, prototyping-utilities | naming | open |
| R43 | issues/102:125 | Proposed replacement of XY Grid's D3 rejected-alternative parenthesis: "(an invented name for two classes that come from no setting or loop)." | xy-grid, prototyping-utilities | naming | open |
| R44 | issues/108:149 | "Check the XY Grid names in the Tabs examples and the recipe-CSS convention (change 6)." | tabs, xy-grid | naming | open |
| R45 | issues/108:149 | "`nfs-tabs` checks only the `primary` pair, not D17's plain-strip pairs. The review decides whether `nfs-tabs` adds that check" (a gap predating this ticket). | tabs | other | open |
| R46 | issues/111:85 | Check that `simple` and `primary` stay aligned with the Tabs spec's names, types, and `nfs-tabs` rules; check dev check 7 against BB 1.4 (proposal 4; else list as a recorded departure); the equal-heights recipe relies on the rendered structure the spec documents. | responsive-accordion-tabs, tabs | cross-spec wording | open |
| R47 | issues/113:210; issues/115:108; issues/132:163 | Check that no spec still describes the right-hand section as a DOM walk alone or a token alone; that the Top Bar ADR carries the revised text of change 5; that the "Base side" has one source across Nested menu, Dropdown Menu, Top Bar, and Responsive Menu; and that ADR 0042's "told apart" holds only at the top level and for button parents, for an open nested Hybrid item's current-link fill. | dropdown-menu, top-bar, nested-menu, responsive-menu | cross-spec wording | open |
| R48 | issues/122:122 | Check the names above against the published Menu, Top Bar, and XY Grid specs; the State-class reading of ADR 0039 (decision 6) against every re-run; and every spec or ticket that still cites a duplicate-directive error for a template match beside a host-directive match (decision 7). | magellan, menu, top-bar, xy-grid, smooth-scroll | shared-document rule | partially fixed -- Magellan's and Smooth Scroll's own re-runs already correct their duplicate-directive-error text; other specs/tickets citing the same stale claim are not yet swept |
| R49 | issues/110:162 | "That the ADR 0039 State-class clarification lists `html`." | reveal | shared-document rule | open |
| R50 | issues/110:162 | "That every Reveal mention elsewhere (Close Button, Triggers, Off-canvas) writes `<dialog nfsReveal>` without a class." | reveal, close-button, triggers, off-canvas | cross-spec wording | open |
| R51 | issues/131:104; issues/118:163 | Check that no `class="dropdown-pane"` remains in any example (Anchored pane, Tooltip, Triggers, Dropdown); [Re-run: Anchored pane (shared utility) spec under the class rule](../issues/131-rerun-anchored-pane-class-rule.md) marks its own part "(done here; DRP's check)". | anchored-pane, tooltip, triggers, dropdown | naming | open -- disputed: `class="dropdown-pane"` literal text still appears at specs/anchored-pane.md:371 and specs/dropdown.md:385,513, though as deliberate "a copied class is not reported" illustrations; the review should confirm whether these count as compliant |
| R52 | issues/131:104 | Check that the specs citing "What each consumer maps" or "ARIA requirements it imposes on consumers" by heading read the renamed headings; that "consumer" in the shared-utility specs means the application, as ADR 0039 uses it. | anchored-pane, breakpoint-service, triggers, nested-menu | naming | open |
| R53 | issues/116:125; issues/117:157 | Check that no spec cites `nfs-responsive-toggle` for a menu icon or includes it without an argument (see also R22). | responsive-toggle, off-canvas, top-bar, triggers | cross-spec wording | open |
| R54 | issues/116:125 | Building-blocks 1.6 rule 5 and the Breakpoint service's consumer rule 3 ("bind no consumer Motion class" under reduced motion) should also mean the library classes mapped from Motion names; the Responsive Toggle and the Dropdown pane skip both today. | responsive-toggle, dropdown | shared-document rule | open |
| R55 | issues/116:125 | "This spec's 2.4.11 e2e case, which names 'a story variant with a sticky title bar' without a Story id, gets one (a gap from before this re-run)." | responsive-toggle | test or story | open |
| R56 | issues/117:157 | Check that every Off-canvas panel in any spec's examples binds `position`; that the Top Bar's `stackedFor` and these Options agree on the Zero-breakpoint report (a development warning and `[]` needs). | off-canvas, top-bar | cross-spec wording | open |
| R57 | issues/119:126 | Check that building-blocks 1.4 lists the Tooltip's legacy classes as dropped (proposal 2); that inputs taking the consumer's own classes (`toggler`, `templateClasses`, `parentClass`, the Motion dot form) use one term (proposal 5) and agree on which library names each reports; that no spec's consumer CSS recipe selects `.tooltip` or an `nfs-` class. | tooltip, toggler, dropdown | shared-document rule | open |
| R58 | issues/126:87 | "Noted while reading, not changed": the Playwright 1.4.10 case runs "every story" at 320 px while the stories stay multi-column at every width for the narrow test runner; a long word in a callout about 100 px wide could overflow, so the case may need breakpoint-aware variants. | equalizer | test or story | open |
| R59 | issues/129:116 | Check that every directive with a Variant property calls `nfsVariantCheck`, that no `include()` names a flag-gated property, and that every missing-property test sits in its own file. | breakpoint-service (+ every spec with a Variant property, e.g. badge, label, button, table, orbit) | test or story | open |
| R60 | issues/124:105; issues/128:90 | `NfsButton` and `NfsSlider` each carry both boolean conventions (`booleanAttribute` and `nfsVariantBoolean` on different inputs), the case ADR 0040's recorded dissent names as its reopening trigger. | button, slider | shared-document rule | open |
| R61 | issues/125:162 | "Check that the five class-only directives have the Slider fill's DI shape everywhere they are cited." | orbit, slider | cross-spec wording | open |
| R62 | issues/125:162 | "Check that every spec whose translucent colour sits over images composites over `#fff` and `#000` if proposal 3 is adopted." | orbit | contrast figure | open |
| R63 | issues/125:162 | "Check that Table A's Orbit row matches the spec." | orbit | shared-document rule | open |
| R64 | issues/127:113 | "The Toggler, Sticky, Orbit, and Equalizer specs: their plain `<img src>` examples fall under proposal 5 if adopted (Orbit's `[attr.loading]` binding would give way to `NgOptimizedImage`'s own `loading`); [the review] can check every spec against it." | toggler, sticky, orbit, equalizer, interchange | cross-spec wording | open |
| R65 | issues/130:131 | Check that no spec shows `animate.enter`/`animate.leave` with an `nfs-*` class in consumer code (this spec was the only one that did); that every Trigger in every spec's examples sits on `nfsButton`, `nfsCloseButton`, `nfsMenuIcon`, a link, or a bare native button, with no class; the Top Bar and Off-canvas names above; the **Motion class** definition (proposal 6). | triggers, top-bar, off-canvas, reveal, dropdown, tooltip, close-button, button | cross-spec wording | open |
| R66 | issues/107:82 | "The re-runs of the Nested menu, Accordion Menu, Drilldown Menu, Dropdown Menu, Responsive Menu, Toggler, Slider, Tooltip, Off-canvas, and Button: proposal 1, if adopted, gives their static-class reads one rule; [the review] can check each applied it." | nested-menu, accordion-menu, drilldown-menu, dropdown-menu, responsive-menu, toggler, slider, tooltip, off-canvas, button | cross-spec wording | open |
| R67 | issues/136:132,192; issues/137:22 | README open list, class-rule wave item 5: append "resolved; its prototype ... is open" once [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](../issues/137-prototype-variant-declaration-tooling.md)'s already-answered prototype fully graduates; fold its verdict into the Variant declaration tooling spec too. | variant-declaration-tooling | shared-document rule | open |
| R68 | issues/139:366 | Dropdown pane and Off-canvas panel both null-bind `autofocus` on hosts that cannot take focus, yet D13 rules it out (dev check 6) while Off-canvas documents it (Usage example); "the review confirms the difference or aligns the two specs; LOW impact." | dropdown, off-canvas | cross-spec wording | open |
| R69 | issues/139:368 | "Confirm after the edits that no spec's Rendered HTML or server-HTML comment shows an `align` or `autofocus` attribute that a directive now removes, and that the Slider's list of kept static input attributes no longer names `disabled=\"\"`." | slider (+ every spec with a Rendered HTML/server-HTML comment showing align/autofocus) | naming | open |
| R70 | issues/139:358-359,369 | README open list item 7: append "Resolved 2026-09-28: the rule is building-blocks 1.4's ..., and the Menu keeps `align`, which `NfsMenu` removes from the rendered HTML"; the architecture guide's P9 and question 9 should no longer say the question is pending. | menu | shared-document rule | open |
| R71 | issues/143:141 | "No spec writes `show-for-print` or `hide-for-print` outside rendered output and copied-class cases (a search of the effort found them only in the Typography Helpers spec and ticket, as proposals)." | visibility-classes, typography-helpers | naming | open |
| R72 | issues/144:118 | "No spec writes `print-break-inside` or `ir` in consumer markup (found only in the Typography Helpers and Visibility specs, their tickets, ADR 0044, and the map; no `class=\"... ir ...\"` anywhere)." | typography-helpers, visibility-classes | naming | open |
| R73 | issues/146:148 | "When it rechecks quoted ratios, the typography greys are `#666666` (5.693:1 on the page), not `#737373`" -- while the Forms and the Breadcrumbs keep `#737373` for their own, untinted settings. | typography-helpers, forms, breadcrumbs, callout, card, table | contrast figure | open |
| R74 | issues/147:114 | "The Table D row; and whether other specs' name checks that read text content state the same image-`alt` limit" (Switch's fieldset/legend check has a stated false-positive limit on an image-only legend). | switch, label, badge, breadcrumbs, pagination | other | open |

Total: 74 items. Open: 74 (of which R48 is partially fixed by two of its five specs, and R51's "done here" self-report
does not match the current spec text -- see notes). Already fixed: 0. No item found already fully resolved: [Consistency review: the class-rule wave](../issues/133-consistency-review-class-rule-wave.md)
itself is still `Status: open`, and every spec Notes reference I could cross-check (equalizer.md:128, media-object.md:440,
sticky.md:409, smooth-scroll.md:112) still carries the future-tense "the class-rule consistency review aligns/replaces
..." wording, confirming the wave has not yet applied its own routed fixes.

## Open items grouped by spec

- **abide**: R1, R4, R8, R33
- **accordion**: R4
- **accordion-menu**: R3, R4, R66
- **anchored-pane**: R42, R51, R52
- **badge**: R1, R5, R6, R28, R29, R30, R59, R74
- **breadcrumbs**: R24, R73, R74
- **breakpoint-service**: R52, R59
- **button**: R4, R5, R6, R14, R17, R59, R60, R65, R66
- **button-group**: R1, R6, R17, R18, R19
- **callout**: R5, R14, R25, R26, R29, R30, R73
- **card**: R7, R26, R31, R32, R34, R73
- **close-button**: R14, R17, R25, R50, R65
- **drilldown-menu**: R1, R3, R26, R39, R66
- **dropdown**: R2, R51, R54, R57, R65, R68
- **dropdown-menu**: R3, R4, R22, R47, R66
- **equalizer**: R7, R34, R58, R64
- **flex-grid**: R34, R36, R37
- **flexbox-utilities**: R7, R10, R16, R36, R37, R38, R39
- **float-classes**: R16, R36, R39
- **float-grid**: R7, R34, R35, R36
- **forms**: R4, R9, R17, R33, R73
- **interchange**: R13, R64
- **label**: R1, R5, R6, R29, R30, R59, R74
- **magellan**: R11, R48
- **media-object**: R10, R37
- **menu**: R3, R4, R10, R12, R48, R70
- **nested-menu**: R3, R52, R66
- **off-canvas**: R4, R14, R22, R25, R26, R53, R56, R65, R66, R68
- **orbit**: R1, R4, R15, R26, R59, R61, R62, R63, R64
- **pagination**: R23, R24, R74
- **progress-bar**: R4, R5, R15, R30
- **prototyping-utilities**: R39, R41, R42, R43
- **responsive-accordion-tabs**: R46
- **responsive-embed**: R26, R31
- **responsive-menu**: R1, R3, R4, R47, R66
- **responsive-toggle**: R4, R22, R39, R53, R54, R55
- **reveal**: R2, R4, R14, R25, R35, R49, R50, R65
- **slider**: R4, R15, R20, R60, R61, R66, R69
- **smooth-scroll**: R12, R48
- **sticky**: R11, R32, R40, R41, R64
- **switch**: R15, R20, R21, R74
- **tabs**: R4, R44, R45, R46
- **table**: R13, R27, R59, R73
- **thumbnail**: R10, R11, R16, R29, R32
- **toggler**: R2, R11, R14, R16, R32, R57, R64, R66
- **tooltip**: R51, R57, R65, R66
- **top-bar**: R4, R12, R15, R22, R40, R47, R48, R53, R56, R65
- **triggers**: R2, R14, R50, R51, R52, R53, R65
- **typography-helpers**: R9, R23, R39, R71, R72, R73
- **variant-declaration-tooling**: R67
- **visibility-classes**: R1, R8, R24, R36, R39, R71, R72
- **xy-grid**: R7, R8, R9, R11, R26, R34, R37, R43, R44, R48

Checked against the full 52-file `specs/` directory listing: every spec has at least one routed item above (after
adding `smooth-scroll`, which R12 and R48 touch). None of the 52 specs is absent from this index.

## Cross-spec and shared-document items (separate index)

Every row above that touches two or more specs, or a shared document (`building-blocks.md`, `storybook-conventions.md`,
`README.md`, an ADR, `map.md`, `architecture-guide-review.md`), repeated here as one flat list for a coordinator who
does not want to walk every spec heading:

R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R20, R21, R22, R23, R24, R25, R26, R27,
R29, R30, R31, R32, R33, R34, R35, R36, R37, R39, R40, R41, R42, R43, R44, R46, R47, R48, R49, R50, R51, R52, R53,
R54, R56, R57, R59, R60, R61, R64, R65, R66, R67, R68, R69, R70, R71, R72, R73, R74.

Single-spec items (kept only under their one spec heading above, not repeated here): R18, R19, R28, R38, R45, R55,
R58, R62, R63.

### Five largest cross-spec items (by distinct specs touched)

1. **R4** -- exact-luminance helper rollout and ratio recheck -- 17 specs (button, forms, close-button, menu, tabs,
   accordion, abide, orbit, slider, off-canvas, reveal, dropdown-menu, responsive-toggle, top-bar, progress-bar,
   accordion-menu, responsive-menu).
2. **R66** -- static-class-read "proposal 1" rollout -- 10 specs (nested-menu, accordion-menu, drilldown-menu,
   dropdown-menu, responsive-menu, toggler, slider, tooltip, off-canvas, button).
3. **R26** -- overflow-hidden container clipping under 1.4.12 -- 7 specs (card, xy-grid, orbit, drilldown-menu,
   off-canvas, responsive-embed, callout).
4. **R65** -- Trigger hosts stay class-free everywhere -- 8 specs (triggers, top-bar, off-canvas, reveal, dropdown,
   tooltip, close-button, button).
5. **R3** -- menu-family class-rule compliance -- 6 specs (menu, accordion-menu, dropdown-menu, drilldown-menu,
   responsive-menu, nested-menu); tied with **R64** -- image-rule sweep -- 5 specs plus honourable mentions **R2**
   (Motion pair type, 5 specs) and **R15** (forced colours, 5 specs).
