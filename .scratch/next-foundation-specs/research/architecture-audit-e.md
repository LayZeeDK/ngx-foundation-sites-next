# Architecture audit: group e

Group: e
Specs: responsive-toggle, reveal, slider, smooth-scroll, sticky, switch, table, tabs, thumbnail
Guide checked: architecture-guide.md, written 2026-09-28 (revised the same day after the critic's review) -- no later dated change found in the guide's text
Date: 2026-09-29

Method: each spec checked against every principle P1 through P26 (the guide's "Release policy" section is not audited), using the spec's class mapping, hierarchy and DI shape, API, ARIA and keyboard tables, rendered HTML, rendering modes, Sass subsection, and Testing Decisions. Findings are recorded once, under the lowest-numbered principle they fall short of. No case in this group needed the guide's Conflicts section to resolve an apparent shortfall.

## responsive-toggle.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| responsive-toggle-a1 | P24 | Hierarchy and DI shape (lines 110-129); API (lines 131-203, the five numbered "Development-mode checks") | "Development-mode checks (each warns once per instance...): 1. A copied class... 2. hideFor is the Zero breakpoint. 3. The menu has no registered title bar... 4. [animate check] 5. Missing Visibility class..." | The spec has two directives (NfsResponsiveToggle, NfsResponsiveToggleMenu) linked by a reference input (menu), so P24's family-spec rule requires one In-family-check line per part under Hierarchy and DI shape (nfsDirectiveCheck name; parent check or "none"; child probes or "none"; peers linked by reference/value; what strictParents changes or "nothing"). No such lines appear, and neither directive's API section shows a guarded nfsDirectiveCheck(...) call in its constructor -- the five listed checks are all bespoke, none is the forgotten-import check ADR 0046/P24 requires. | Add two lines under Hierarchy and DI shape (one per directive, peers by reference naming the other) and add the guarded nfsDirectiveCheck(...) call to each constructor. | yes -- shared-document rule (ADR 0046 / forgotten-import-checks.md's family-spec rule); same cause in all other 8 specs of this group (reveal, slider, smooth-scroll, sticky, switch, table, tabs, thumbnail) |

Other principles checked hard, no findings: P2, P9, P11, P12, P17, P19, P21, P22.

## reveal.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| reveal-a1 | P24 | Hierarchy and DI shape (no such line exists) | The section documents nfsOpenableToken, nfsRevealToken, injections, and NfsRevealStack, but never states that NfsReveal's constructor calls nfsDirectiveCheck('NfsReveal') behind the inline ngDevMode guard | P24 requires every library directive/component with an attribute selector to call nfsDirectiveCheck, and "a single directive's spec states only that it calls nfsDirectiveCheck with its name" (forgotten-import-checks.md, family rule). The word nfsDirectiveCheck does not appear anywhere in reveal.md. | Add one sentence to Hierarchy and DI shape: "NfsReveal's constructor calls nfsDirectiveCheck('NfsReveal') behind the inline ngDevMode guard." | yes -- shared-document rule; same cause in all other 8 specs of this group (responsive-toggle, slider, smooth-scroll, sticky, switch, table, tabs, thumbnail) |

Other principles checked hard, no findings: P1-P9 (shape, class mapping, DI/token shape, hostDirectives limits, name collisions), P10-P12 (signals API, state ownership, rendering modes -- SSR/hydration/replay sections hold up), P16-P20, P22, P25-P26.

## slider.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| slider-a1 | P24 | Hierarchy and DI shape (lines 146-164) | The section lists parent handle, registration, sibling discovery, Defaults token, forms, and injection, but has no In-family check line for NfsSlider, NfsSliderHandle, or NfsSliderFill, no development description for nfsSliderToken, and no statement that span[nfsSliderFill]'s optional nfsSliderToken injection throws under strictParents | span[nfsSliderFill] is one of the eight named families in forgotten-import-checks.md's strictParents table (nfsSliderToken, development only, "throws" under the flag) -- the ticket names Slider explicitly for this check. None of the required content (nfsDirectiveCheck calls, parent/child probe lines, the strictParents effect, the token's dev-only description) appears anywhere in the spec. | Add the three In-family check lines (one per directive, 5-item shape) under Hierarchy and DI shape, and one sentence: "span[nfsSliderFill]'s optional nfsSliderToken injection throws under strictParents." Give nfsSliderToken the typeof ngDevMode ... ? "..." : '' development description. | yes -- shared-document rule; same cause in all other 8 specs of this group (responsive-toggle, reveal, smooth-scroll, sticky, switch, table, tabs, thumbnail) |
| slider-a2 | P21 | ARIA row for [attr.aria-valuetext] (line 258); API description (line 48) | "for a non-linear handle without displayWith, the value as text" | P21 requires the library to render no human-readable string of its own; the guide's own Sources note names this exact gap as unresolved: "a non-linear Handle without displayWith speaks 'the value as text', whose locale format the Slider spec does not state (an open point for the audit)." The spec never says whether "the value as text" is String(value), value.toString(), or a locale-aware format, and no test or story pins the format. | Add one clause naming the exact conversion (for example String(value), no locale formatting, matching the native aria-valuenow fallback text) to the aria-valuetext row and to the API description text. | no |

Other principles checked hard, no findings: P1, P4, P6, P8-P12, P16-P20 (WCAG exact-formula contrast checks, Sass-mixin-only styling, animation-via-State-class rules, the Signal Forms contract on the handle), P22, P25-P26.

## smooth-scroll.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| smooth-scroll-a1 | P24 | Hierarchy and DI shape (lines 114-129); API (lines 130-165) | "Development-mode checks (only when ngDevMode is on...): An href that starts with # but resolves to another document... A handled link whose fragment names no element... A link host that is not an a element and contains no link..." | NfsSmoothScroll has an attribute selector, so P24 requires a guarded nfsDirectiveCheck call in its constructor and (single directive) a one-line statement of that under Hierarchy and DI shape. Neither appears; the listed checks are all bespoke to this directive's own behaviour, none is the forgotten-import check. | Add one line under Hierarchy and DI shape and the guarded call in the constructor. | yes -- shared-document rule; same cause in all other 8 specs of this group (responsive-toggle, reveal, slider, sticky, switch, table, tabs, thumbnail) |

Other principles checked hard, no findings: P2, P6, P9, P12, P16, P19, P21.

## sticky.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| sticky-a1 | P24 | Hierarchy and DI shape | "No parent token... nothing injects it, so it is not created." (no other DI text follows) | Two directives (NfsSticky, NfsStickyContainer); the spec never mentions nfsDirectiveCheck or In-family checks. P24 requires a multi-directive family spec to list its In-family checks under Hierarchy and DI shape, one line per part. Nothing of this appears. | Add two lines under Hierarchy and DI shape, one per directive, in the five-item shape, ending "strictParents: nothing." | yes -- shared-document rule; same cause in all other 8 specs of this group (responsive-toggle, reveal, slider, smooth-scroll, switch, table, tabs, thumbnail) |

Other principles checked hard, no findings: P1-P3, P9-P11 (data-nfs-sticky-on matches P11's preferred form exactly), P13-P14 (Dropped options listed with reasons -- a model example), P16-P20, P22-P23, P25-P26.

## switch.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| switch-a1 | P24 | Hierarchy and DI shape | "No injection tokens, providers, parent discovery, host directives, or Defaults token." | Five directives (NfsSwitch, NfsSwitchInput, NfsSwitchPaddle, NfsSwitchActive, NfsSwitchInactive); same absence of nfsDirectiveCheck / In-family check lines as every other spec in this group. | Add five lines under Hierarchy and DI shape, one per directive, in the five-item shape. | yes -- shared-document rule; same cause in all other 8 specs of this group (responsive-toggle, reveal, slider, smooth-scroll, sticky, table, tabs, thumbnail) |

Other principles checked hard, no findings: P1-P3, P9-P11 (matches P20's own worked example almost word for word), P13-P14, P16-P20 (P19 correctly "none" beyond reduced-motion), P22-P23, P25-P26.

## table.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| table-a1 | P24 | Hierarchy and DI shape | "The two directives do not know each other: no token, no parent handle, no content query." | Two directives (NfsTable, NfsTableScroll); same absence of nfsDirectiveCheck / In-family check lines as every other spec in this group. | Add two lines under Hierarchy and DI shape, one per directive, in the five-item shape. | yes -- shared-document rule; same cause in all other 8 specs of this group (responsive-toggle, reveal, slider, smooth-scroll, sticky, switch, tabs, thumbnail) |

Other principles checked hard, no findings: P1-P3, P9, P13-P14, P16-P18, P20, P22-P23, P25-P26.

## tabs.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| tabs-a1 | P24 | Hierarchy and DI shape (lines 143-164) | The section documents tokens, panel registry, tab-list registration, and Aria composition in prose, but never calls nfsDirectiveCheck, never gives nfsTabsGroupToken or nfsTabsToken a development-only description, and states no child probes for any of the seven directives (NfsTabsGroup, NfsTabs, NfsTabsTitle, NfsTab, NfsTabsContent, NfsTabsPanel, NfsTabsLazyContent) | Tabs has more than one directive, so P24's rule applies directly: every parent token needs a development-only description (both nfsTabsGroupToken and nfsTabsToken back required injections that throw NG0201, which prints the token's description per forgotten-import-checks.md), and each part needs its 5-item In-family check line. None of this is present. | Add seven In-family check lines under Hierarchy and DI shape (parent check "none" for each, since every parent injection here is required) and give nfsTabsGroupToken/nfsTabsToken the development description shape shown in forgotten-import-checks.md. | yes -- shared-document rule; same cause in all other 8 specs of this group (responsive-toggle, reveal, slider, smooth-scroll, sticky, switch, table, thumbnail) |

Other principles checked hard, no findings: P1-P9 (hostDirectives limits on the hosted Aria Tab/Tabs/TabPanel patterns), P10-P12, P16-P20, P22, P25-P26.

## thumbnail.md

| id | principle | section and line | what the spec says (quoted, short) | why it falls short | smallest change that meets the principle | cross-spec? |
| --- | --- | --- | --- | --- | --- | --- |
| thumbnail-a1 | P24 | Hierarchy and DI shape (lines 87-96); API (lines 98-118) | "Development-mode checks, in one afterNextRender read callback... 1. No text alternative... 2. A link that is not one, or has no name... 3. Inside a plain link..." | NfsThumbnail has an attribute selector, so P24 requires a guarded nfsDirectiveCheck call and a one-line statement under Hierarchy and DI shape. Neither appears; the listed checks are all bespoke to this directive's own behaviour. | Add one line under Hierarchy and DI shape and the guarded call in the constructor. | yes -- shared-document rule; same cause in all other 8 specs of this group (responsive-toggle, reveal, slider, smooth-scroll, sticky, switch, table, tabs) |

Other principles checked hard, no findings: P2, P9, P13, P17, P18, P21.

## Findings about the guide itself

1. **P19's reduced-motion clause does not carry forward a recorded exception.** P19 states the reduced-motion mechanism as a flat rule: "prefers-reduced-motion shortens every library animation to 1 ms." responsive-toggle.md's Animation subsection instead skips binding the Motion class entirely under reducedMotion(), citing an exception the Breakpoint service spec's "consumer rule 3" allows against building-blocks 1.6. P19's own text does not mention that exception, so a literal reading of P19 alone would misclassify responsive-toggle.md as falling short of P19 (skip, not a 1 ms shortening). This did not become a per-spec finding in this audit because the underlying rule (building-blocks 1.6, consumer rule 3) is a recorded decision that outranks the guide, so the spec meets the guide by that precedence rule -- but the guide's own P19 text should either cite the exception or point to building-blocks 1.6's rule 3 the way P21 cites its two recorded Slider exceptions, so a future reader of P19 alone does not need to already know about the exception to avoid a false finding.

No other guide problems found: every principle checked against these nine specs had a clear, testable criterion, and P21's "open point for the audit" note about the Slider's non-linear aria-valuetext format is the guide correctly flagging a known gap for the audit to confirm (done above as slider-a2), not a defect in the guide.
