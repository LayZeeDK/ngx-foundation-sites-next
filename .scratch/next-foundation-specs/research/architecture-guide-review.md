# Critic review: the directive and component architecture guide

Ticket: [Decide: the directive and component architecture guide](../issues/141-decide-directive-component-architecture-guide.md), step 3 (adversarial critic). Reviewed: `architecture-guide.md` as drafted on 2026-09-28. Written 2026-09-28.

## Method

- Read the guide in full, the three findings files of [Research: directive and component architecture principles for Angular UI libraries](../issues/140-research-directive-component-architecture-principles.md), the user draft, the map's Notes, `building-blocks.md` Part 1, ADRs 0001 to 0044 (0001, 0002, 0003, 0004, 0005, 0006, 0007, 0008, 0009, 0012, 0013, 0018, 0022, 0030, 0033, 0037, 0039 to 0044 in full), `CONTEXT.md` (every glossary term the guide names exists), `storybook-conventions.md`, and the open [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md).
- Applied the guide as an auditor to five sampled specs of different kinds: `specs/accordion.md` (Aria-hosted Plugin with a Wrapper component), `specs/reveal.md` (native-platform Plugin), `specs/dropdown-menu.md` (custom Plugin hosting another family), `specs/forms.md` (CSS-only, tag-styled elements), `specs/prototyping-utilities.md` (utility family). Spot checks where a principle made a claim about other specs: Toggler, Responsive Toggle, Flexbox Utilities, Visibility Classes, Triggers, Interchange, Nested menu, Slider, Close Button, Top Bar, Typography Helpers, Card, Thumbnail, Media Object, Responsive Embed, Tabs, Abide, Breakpoint service, Progress Bar, Orbit.
- Checked the guide's source citations in the local clones (Angular 22.2.x, components 22.2.x, Foundation 6.9.0, APG) and every Baseline date against `web-features` 3.40.0 (`data.json` downloaded from registry.npmjs.org and read by a scratch script).

Line numbers below are file line numbers. "Guide" quotes are from `architecture-guide.md`.

## Blockers

### 1. P9: the presentational-attribute rule states an undecided ticket as decided

- Kind: 3 and 4 (rewords a record that does not exist; adopts a rule the evidence has not settled).
- Severity: blocker.
- Evidence: Guide P9: "no input is named after a presentational HTML attribute"; Avoided: "an `align` input"; Sources: "`building-blocks.md` 1.4 (never after a presentational HTML attribute; ...)". No record has that text: `rg presentational` finds nothing in `building-blocks.md`, `adr/`, `CONTEXT.md`, or `storybook-conventions.md`. The rule is the Media Object ticket's proposal, which [issue 139](../issues/139-decide-inputs-named-like-presentational-attributes.md) is still deciding (`Status: claimed`, no Answer); its Question: "The Media Object named its input `alignment` instead and proposed a building-blocks 1.4 rule ... Which rule does the library adopt, and what does the Menu family's `align` input become?", and "The Menu's name is HIGH impact". The published Menu `align` input is hosted by every menu root and submenu (ADR 0041:7; `specs/dropdown-menu.md:145`, `:212`), so the audit would mark the Menu, Accordion Menu, Drilldown Menu, Dropdown Menu, Nested menu, and Responsive Menu specs short against a rule no one has decided.
- Smallest change: delete the clause, the `align` Avoided example, and the building-blocks citation; add "Input names that are also HTML presentational attributes: pending [Decide: inputs named like HTML presentational attributes](../issues/139-decide-inputs-named-like-presentational-attributes.md); not audited until it resolves."

### 2. P9 and the Kinds table: "a utility family's inputs are nfs-prefixed" contradicts ADR 0044

- Kind: 3 (rewords a recorded decision) and 5 (the Kinds row contradicts its own examples).
- Severity: blocker.
- Evidence: Guide P9: "A utility family's inputs are `nfs`-prefixed Utility attributes, so no utility captures another directive's input or a native attribute". Kinds row: "one directive per Foundation export mixin whose inputs are `nfs`-prefixed Utility attributes", with `[nfsFlexContainer]`, `[nfsFlexChild]`, and "`[nfsVisibility]` (`showFor`, `hideFor`)" as its examples. ADR 0044:17: "the Flexbox Utilities' roles ... keep building-blocks 1.4's Structural class shape, and the Visibility Classes ... keep one directive with Foundation's `showFor` and `hideFor` words. In every shape an un-prefixed input shares no name with another directive's input on the same element, or its spec reports the case." `building-blocks.md:46` says the same. The published inputs are un-prefixed: `specs/flexbox-utilities.md:153-166` (`direction`, `alignX`, `alignY`, `alignSelf`, `order`), `specs/visibility-classes.md:147-150` (`showFor`, `hideFor`, `invisible`, `visible`). `specs/prototyping-utilities.md:142-145` (rule 0) states the three shapes.
- Smallest change: P9: "A family of standalone Utility classes takes `nfs`-prefixed Utility attributes (ADR 0044); a family with roles or one effect keeps Foundation's words, and an un-prefixed input shares no name with another directive's input on the same element, or its spec reports the case (ADR 0044 Consequences)." Kinds row: the same three shapes.

### 3. P10: the `effect()` rule deletes building-blocks 1.5's two recorded exceptions and contradicts P4

- Kind: 3 (rewords a record), 2 (contradicts P4).
- Severity: blocker.
- Evidence: Guide P10: "`effect()` is never public API, never propagates state between signals, and never touches the DOM, `history`, or timers." `building-blocks.md:92`: "`effect` ... never to propagate state between signals ..., with two exceptions": the rendered-state signal, and "A reverse-link registration of a reference input with its target ... runs in an `effect` whose cleanup unregisters ... it writes only the target's registry signal". Published specs use both: `specs/triggers.md:205` ("one `effect()` for trigger registration ... the reverse-link exception of building-blocks 1.5"), `specs/responsive-toggle.md:211`, `specs/interchange.md:194`, `:202` ("One `effect()` writes `selected()` into the rendered-rule signal"), `:203` and D11 at `:446` (`ViewContainerRef.createEmbeddedView` from an `effect()`), `specs/nested-menu.md:245`. The guide's own P4: "a child linked by a reference input registers from an `effect` with cleanup". The Conflicts section presents P10 as only the stricter history-and-timers wording and does not mention that it also removes these exceptions.
- Smallest change: P10: "`effect()` is never public API and never writes `history` or starts a timer (building-blocks 1.11 decisions 3 and 4); otherwise it follows building-blocks 1.5: no DOM writes, no propagation between signals except the rendered-state signal and the reverse-link registration." Move the Avoided "an `effect()` that writes `history` or starts a timer" out of P12 so it is counted once (point 14).

### 4. P22: "anything crossing entry points goes through a lightweight token" and "used as types only" are false for the published specs

- Kind: 3 (rewords ADR 0040 and ADR 0043), 4 (forces spec changes the evidence does not support).
- Severity: blocker.
- Evidence: Guide P22: "the Variant registries and shared types live in the primary entry point and are used as types only; anything crossing entry points goes through a lightweight token typed with `import type`". ADR 0040:44 limits the type-only rule to "The Variant registries and the shared Variant types". The specs import values across entry points by design: `specs/forms.md:134` (`nfsVariantBoolean` from the primary entry point), `specs/prototyping-utilities.md:192` ("and `nfsVariantBoolean` as its one runtime import"), `specs/toggler.md:132` ("the two functions are the ones this entry point imports from there"), `specs/dropdown-menu.md:143-152` (hosts `NfsMenu` of `ngx-foundation-sites/menu`; `nfsMenuRootProviders` and `nfsLightDismiss` functions), `specs/reveal.md:154`, `specs/accordion.md:134` and `specs/breakpoint-service.md:616` (`inject(NfsMediaQuery)` by class). The token rule in the records covers parent handles and optional presence: ADR 0043:13 ("Injecting `NfsTopBarRight` by class: every menu bundle would keep the Top Bar's directive class"), `building-blocks.md:131`, and the lightweight-token guide itself (`NG/guide/di/lightweight-injection-tokens.md:71-93`: retention through a content query or `inject` of an optional part). Applied as written, the audit fails nearly every spec.
- Smallest change: "A class another entry point needs only to find an optional part or an ancestor goes through a lightweight token typed with `import type`; a required dependency (a hosted directive, the Breakpoint service, the Anchored pane functions, the primary entry point's transforms and mapping functions) is a value import by package path. Variant registries and Variant types are imported as types only (ADR 0040)."

### 5. P14: the drop clause is narrower than building-blocks 1.4's Dropped options list

- Kind: 3 (rewords a record), 4 (would force spec changes).
- Severity: blocker.
- Evidence: Guide P14: "every documented Foundation Option stays an input; an Option that exists only for jQuery, HTML strings, class names, or timing CSS or the browser now owns is dropped". `building-blocks.md:85` drops Options for more reasons: the markup is the switch (`parentLink`, `autoApplyClass`, `backButtonPosition`, Orbit `bullets` and `navButtons`), always on for WCAG or the APG (`hoverPane` "WCAG 1.4.13", `accessible`, `pauseOnHover` "always on, APG"), the platform mechanism cannot honour it (Sticky `anchor`, `topAnchor`, `btmAnchor`), dead (`invertVertical`), and `resetOnClose`, `appendTo`, `forceFollow`. Sampled specs drop on those grounds: `specs/dropdown-menu.md:93` (`clickOpen`: "a parent is a button, so a click always toggles"), `:99` (`forceFollow`), `specs/reveal.md:96` (`fullScreen`, replaced by `size="full"`), `:98` (`resetOnClose`), `:101` (`appendTo`: "the top layer needs no move"), `specs/accordion.md:99` (`deepLinkSmudgeOffset`: CSS `scroll-margin` owns it, which is not timing). "timing CSS or the browser now owns" also parses two ways.
- Smallest change: "Every Foundation Option is an input unless building-blocks 1.4 lists it as dropped or the spec's Dropped options give one of 1.4's reasons; each drop is listed with its reason."

### 6. P2 and decision question 3: the tag-styled rule condemns the Nested menu family

- Kind: 3 (widens ADR 0039's rule), 6 (no Kind covers the case).
- Severity: blocker.
- Evidence: Guide P2: "An element Foundation styles only by tag gets no directive until Foundation gives it a Variant class." Question 3: "an element styled by tag gets a directive only once Foundation gives it a Variant class, and none otherwise". ADR 0039:10 applies the rule to CSS-only markup ("`table` itself, `select`, checkboxes, radios, text inputs, bare `fieldset` and `legend`, native `<progress>` and `<meter>` get no directive: there is no class to manage"). ADR 0004:7 gives every menu `li` and parent button a directive ("one shared directive family (`nfsMenuItem`, `nfsSubmenu`, `nfsSubmenuToggle`)"); `specs/dropdown-menu.md:125`: "Every `li` | No class of its own | `NfsMenuItem` (`li[nfsMenuItem]`)", `:131` (`button[nfsSubmenuToggle]` on a parent that has no class). As written, the audit marks the five menu specs short, and question 3 answers "no directive" for a menu item when deciding a new spec. No Kind row describes a directive that owns behaviour and Foundation's State classes on an element without a Structural class.
- Smallest change: P2 and question 3: "An element Foundation styles only by tag and whose look nothing in the library changes gets no directive (ADR 0039); an element that carries Plugin behaviour or Foundation's State classes gets the directive that owns them (ADR 0004)." Add that case to the Kinds table.

## Majors

### 7. P2 against P6: "never split into two directives" contradicts "written beside"

- Kind: 2.
- Severity: major.
- Evidence: Guide P2: "the styling and the behaviour of one element are never split into two directives"; Avoided: "a styling directive and a behaviour directive as two kinds for one element". Guide P6 Preferred: "`<button nfsButton nfsToggle="pane">`; `<button nfsCloseButton nfsClose>`". `specs/forms.md:143` and `:148` put `nfsFormLabel` beside `nfsAbideLabel` on one `label`.
- Smallest change: P2: "the styling and the behaviour of one Structural class are never split into two directives; a free behaviour (P6) or another family's directive written beside is not a split."

### 8. Kinds table and P6: free behaviour directives do bind classes

- Kind: 5.
- Severity: major.
- Evidence: Kinds row "Free behaviour directive: Binds no class", with `nfsToggler` and `nfsResponsiveToggle` as examples; P6: "A behaviour that may sit on any element binds no class". `specs/toggler.md:109-110` (the Toggler binds `.is-hidden` and the Motion classes), `specs/responsive-toggle.md:89` ("binds only its Visibility classes, its State class, and its Motion classes"), `:99-101`; Magellan writes `.is-active` with `Renderer2` (ADR 0039:31). Only Triggers bind no class (`building-blocks.md:125`).
- Smallest change: "binds no Structural or Variant class; may bind State, Visibility, and Motion classes for its own state (Toggler, Responsive Toggle); a Trigger binds none (building-blocks 1.8)."

### 9. P11 and P12: two recorded ways of setting state are missing

- Kind: 3.
- Severity: major.
- Evidence: Guide P11: "otherwise the state lives in a signal and is reflected as Foundation's State class through a host binding"; "Where Foundation has no class for a state ..., the directive binds a `data-nfs-<state>` attribute". ADR 0039:31: a State class on an element with no library directive "is written by the directive that owns the state, with `Renderer2` from a render callback, and only for state that has no first-paint value" (Reveal `html`, Off-canvas `body`, Magellan links; `specs/reveal.md:127`, `:139`; `building-blocks.md:14`, `:95`). ADR 0033:7: "library-owned elements inside a Wrapper component may carry `nfs`-prefixed classes instead" (`specs/accordion.md:127`, `.nfs-accordion-content-shown`). The audit would flag Reveal, Off-canvas, Magellan, and Accordion.
- Smallest change: add both exceptions to P11, citing ADR 0039's dated note and ADR 0033.

### 10. P17: `inert` over `aria-hidden` without building-blocks 1.10's exceptions

- Kind: 3.
- Severity: major.
- Evidence: Guide P17: "hidden in-DOM content gets `inert`, not `aria-hidden`". `building-blocks.md:152`: "Exceptions: `<dialog>` and top-layer elements manage their own inertness, and the closed off-canvas panel relies on Foundation's `.off-canvas.is-closed { visibility: hidden }`, because an `inert` there would also disable a panel that `.reveal-for-<bp>` shows ... The Tooltip tip is `aria-hidden="true"` at all times, not to hide it but because its hidden description element carries the same text". The audit would flag Reveal, Off-canvas, and Tooltip.
- Smallest change: append "except the cases building-blocks 1.10 lists (dialogs, the closed Off-canvas panel, the Tooltip tip)".

### 11. P7: consumer hosting and wrapper components are recorded patterns, not violations

- Kind: 3 (drops 1.9's qualifier).
- Severity: major.
- Evidence: Guide P7: "no spec asks a consumer to subclass or wrap a library directive, and library directives are not extension points". `building-blocks.md:132`: "No spec asks a consumer to subclass or to wrap a library directive in order to type an input." Specs show consumer components hosting library directives: `specs/card.md:348`, `specs/thumbnail.md:339`, `specs/media-object.md:424`, `specs/responsive-embed.md:41` (user story 12: "I want my own component to host `NfsResponsiveEmbed` through `hostDirectives`"), `:129`, `:390`. ADR 0013:14 and `specs/triggers.md:54`, `:121`, `:124`, `:550`: consumers implement `NfsOpenable` in wrapper components.
- Smallest change: "No spec asks a consumer to subclass a library directive or to wrap one to retype an input (building-blocks 1.9); a consumer component may host a library directive through `hostDirectives` and may implement `NfsOpenable` (ADR 0013)."

### 12. P13: the `exportAs` rule is new, contradicted by the Toggler, and silent on directives without one; the naming rule omits 1.3's named cases

- Kind: 4 (unmarked new rule), 1 (the audit cannot tell whether a missing `exportAs` falls short), 3.
- Severity: major.
- Evidence: Guide P13: "`exportAs` is the directive's camelCase name". No record states it (the ADRs and `building-blocks.md` mention `exportAs` only per directive). `specs/toggler.md:107`, `:127`: `NfsClassToggler` exports `nfsToggler` (ADR 0016). Many specs have none: `specs/forms.md:182` ("Models, outputs, methods, and `exportAs`: none"), `specs/prototyping-utilities.md:196` ("no `exportAs` (it has no state or method to read)"), and directives in 20 more specs (`rg` for "exportAs: none" and "no `exportAs`"). The class-name rule ("`Nfs` plus the PascalCase of the Structural class (the plugin name where none exists; the export mixin's name without `foundation-` for a utility family)") omits the cases `building-blocks.md:45-46`, `:51` name: `NfsDropdownMenu` on `ul.dropdown.menu`, one `NfsOffCanvas` for two classes, `NfsFormLabel` after Foundation's mixin, `NfsPaginationEllipsis`, the shared `NfsRow` and `NfsColumn`, `NfsVisibility` after its docs page, the per-element `ul[nfsListStyleType]` and `ol[nfsListStyleType]`, and `NfsNoBullet` after its class.
- Smallest change: "`exportAs`, where a template needs the instance (state, methods, a Trigger target), is the directive's camelCase name or its family's (Toggler); none otherwise" marked New, or dropped; class names "follow building-blocks 1.3, including its named cases".

### 13. P23 against P4 and P24: "no check throws" while required injection throws NG0201

- Kind: 2.
- Severity: major.
- Evidence: Guide P23 lists "a child outside its parent" among misuses "reported, once and in development builds only" and says "no check throws". Guide P4: a child injects the token "required when it cannot exist alone", which throws NG0201 in every build. The specs rely on that: `specs/accordion.md:151` ("Children inject them without `optional` ... throws NG0201 anyway"), `specs/abide.md:155` ("an alert outside a form is an error (NG0201)"). P24's "a directive that needs a sibling or ancestor library directive reports its absence in development" has the same conflict.
- Smallest change: P23: "... a child outside a parent it may stand without (optional injection); a child that cannot stand alone is a required injection, whose NG0201 is the report." Same qualifier in P24.

### 14. Overlapping principles count one finding twice

- Kind: 2.
- Severity: major.
- Evidence: the same Avoided form, or the same rule, appears under two principles: `inject(NfsTopBarRight)` in P4 and P22; an `effect()` writing `history` in P10 and P12; Shadow DOM in P12 and P18; `:has()` and `:open` in P11 and P16; a `checked` model on the Switch in P11 and P20; `animate.enter` on a server-rendered element in P12 and P19; `<nfs-reveal>` in P1 and `<div nfsReveal>` in P5; a copied Foundation class under P3, P11 ("never read from a static class"), and P23. "How to audit" gives no tie-break.
- Smallest change: keep each Avoided form in one principle, and add to "How to audit": "A finding is recorded once, under the lowest-numbered principle it falls short of; other principles it touches are cited, not counted."

### 15. Kinds table and P18: one Library mixin per export mixin, not per entry point

- Kind: 3.
- Severity: major.
- Evidence: Kinds row: "one `nfs-<entry point>` mixin per entry point that needs custom CSS, compile-time checks, or Variant properties"; P18: "in an `nfs-<entry point>` Library mixin included after the matching export mixin". ADR 0012:29 (2026-09-28): "an entry point whose docs page covers several Foundation export mixins gets one Library mixin per export mixin, named after it and included after it" (`nfs-top-bar`, `nfs-title-bar`, `nfs-menu-icon`). `specs/typography-helpers.md:121`: "`nfs-typography-helpers` and `nfs-typography-base`, one per export mixin that needs one". The audit would flag Top Bar and Typography Helpers.
- Smallest change: "one Library mixin per Foundation export mixin that needs custom CSS, checks, or Variant properties, included after it (ADR 0012, dated note of 2026-09-28)".

### 16. P14: an input that traces to a hosted Aria input has no trace

- Kind: 1.
- Severity: major.
- Evidence: Guide P14: "Every input traces to a Foundation Option, a Variant family, an APG or WCAG requirement, or a Material precedent". Hosted Aria inputs trace to none of these: `specs/accordion.md:231` (per-title `disabled`, "New per item", Aria's), `:232` (`id`, Aria's), `:235` (`preserveContent`, "Name from Aria's DeferredContentAware"). P13's own naming order already names "the hosted Aria input's name".
- Smallest change: add "or a hosted `@angular/aria` input".

### 17. P14: "one API per concept, never two ways to do one thing" is untestable as written

- Kind: 1.
- Severity: major.
- Evidence: every Openable has `[(isOpen)]` and `open()`, `close()`, `toggle()` (`building-blocks.md:79`, `:125`); `specs/reveal.md:263` and `building-blocks.md:125` document `<form method="dialog">` beside `nfsClose` as "a platform alternative for close buttons"; the Accordion has `[(expanded)]` and `open()`, `close()`. Read literally, each is two ways to do one thing. The testable core is the critique's case (a public `collapsed` beside `expanded`) and building-blocks 1.4's predicate rule.
- Smallest change: "No two public members set or read one state under different names (a `collapsed` beside `expanded`); no cancelable event beside a predicate (building-blocks 1.4)."

### 18. P20: the rule and its Preferred example disagree on native controls

- Kind: 2 and 1.
- Severity: major.
- Evidence: Guide P20: "A styled native control (`input`, `select`, `textarea`, checkbox, radio) keeps its own value, `checked`, and forms directives and gets no value API from the library"; Preferred: "`NfsSliderHandle implements FormValueControl<number>` on `input[type=range]`". The Slider handle is a native input with a library `value` model (`specs/slider.md:197`, `:244`); the Switch keeps the native `checked` (`specs/switch.md:434`). The rule does not say which native controls get a value API.
- Smallest change: "A native control the library only styles (Forms, Switch) gets no value API; a native control whose value the library transforms (the Slider handle) implements one Signal Forms contract."

### 19. P25: the "public test surface" and its breaking-change rule are not recorded

- Kind: 3 and 4.
- Severity: major.
- Evidence: Guide P25: "The library's public test surface is Foundation's classes, ARIA, and State classes in the DOM, plus Story ids and arg names, whose rename is a breaking change"; Avoided: "a renamed Story id without a breaking note"; "whether harnesses ship later is a public-API decision a ticket makes". `storybook-conventions.md:39`: "renaming one is a breaking change to that spec's e2e tests"; `:312`: "an arg rename is a breaking change to the spec's e2e tests". Both are contracts between a spec's own test layers, not a consumer-facing surface or a semver commitment. `building-blocks.md:226` records only "DOM-first ... no custom harness classes in the first specs". The cited `storybook-conventions.md:298` is "A play function never:". The critique itself called it "a rule the guide states, not a new decision" and flagged that the effort records the harness question only for the first specs.
- Smallest change: restate the record (DOM-first assertions; no harness classes in the first specs; Story ids and arg names are the contract between a spec's test layers); move "the DOM is the public test surface, and a rename is breaking" to P26's provisional list, or mark it New.

### 20. "What this guide adds beyond the records" undercounts the new rules

- Kind: 4.
- Severity: major.
- Evidence: the section says "P21, the import array of P24, and P26 ... are new; every other principle restates a recorded decision". Rules found in no record: P9's presentational-attribute rule (point 1), P13's `exportAs` rule (point 12), P23's "no check throws", P25's public test surface (point 19), P24's "a directive that needs a sibling or ancestor library directive reports its absence in development", P4's registration "in `ngOnInit`" for every child (1.9 states it for ordered children; point 32), and the Idioms table's "a union-typed `computed` where a part has more than two named states" (the headless lens's section 7, no effort record). The Answer's triage would skip all of them.
- Smallest change: mark each "New" in its Decided-by line and list it in that section, or drop it.

### 21. Gap: P17 does not state ADR 0022's contrast formula, so the audit misses two sampled specs

- Kind: 6.
- Severity: major.
- Evidence: ADR 0022:23 (2026-09-28): "the compile-time checks compute the unrounded ratio with the exact WCAG formula through one library-internal helper (`math.pow`), not Foundation's `color-luminance()`"; `building-blocks.md:149`. Sampled specs still use `color-luminance()`: `specs/accordion.md:311`, `:560` (D19), `:675`; `specs/forms.md:225` ("Ratios were computed with Foundation 6.9.0's own `color-luminance()`"). P17 names only "a compile-time check where axe has no rule".
- Smallest change: add to P17: "computed with the exact WCAG formula of ADR 0022's dated note, never `color-luminance()` or `color-contrast()`".

### 22. Conflict 2: misreads the map, proposes an out-of-scope edit, and misses a third AGENTS.md conflict

- Kind: 7 (and 3).
- Severity: major.
- Evidence: Guide: "`AGENTS.md` governs the code in this repository, which the map rules neither a source nor a constraint; the Answer proposes a scoping sentence for `AGENTS.md`". `map.md:69` lists "the conventions in this repo's AGENTS.md (its component code is neither a source nor a constraint)" as a design criterion: the conventions are an input; only the component code is ruled out. `map.md:141` already treats AGENTS.md's confirm-before-fallback as human-only by kind, decided later by [Decide the `@angular/aria` fallback confirmation](../issues/75-evidence-aria-fallback-confirmation.md). The ticket's step 4 names the shared-file changes (the map's Notes precedence line; README); an edit to the repository's `AGENTS.md` is outside them. Missed conflict: `AGENTS.md:64` ("Use optional injection with `skipSelf` in child components") and `:81` (`NfsAccordionItem` injects `nfsAccordionToken` with `{ optional: true, skipSelf: true }`) against `building-blocks.md:131` (required when the child cannot exist alone), `specs/accordion.md:139`, `:151`, and P4's own Preferred "`NfsAccordionItem` injects it (required)", while P4 cites "AGENTS.md, Content Projection and DI" as Decided by.
- Smallest change: restate conflict 2 with the map's actual wording; replace the AGENTS.md edit with the planned precedence line in the map's Notes (the effort's specs follow the map's Implementation order and building-blocks 1.9 over AGENTS.md), leaving any AGENTS.md change to the orchestrator; add conflict 3 (the DI example) and drop AGENTS.md from P4's Decided by. Rating: impact MEDIUM (no published spec changes), confidence HIGH (map, building-blocks 1.9, [Decide the `@angular/aria` fallback confirmation](../issues/75-evidence-aria-fallback-confirmation.md)): decide, not OPEN FOR HUMAN.

### 23. P21 (new decision): the rule omits two known exceptions; the rating holds

- Kind: 7, 3, 6.
- Severity: major.
- Evidence: Guide P21: "The library renders no human-readable string of its own: every label, role description, and formatted value comes from consumer markup or a consumer function"; "Direction is read from `Directionality.valueSignal`". `specs/slider.md:258`: "for a non-linear handle without `displayWith`, the value as text" (a library-formatted string; the critique's principle K recorded it as an open point: "the spec does not say which locale formats it"). `building-blocks.md:99`: "Exception: the Slider reads the host's computed `direction` in client event handlers". The Why's "Angular Aria ships no strings" cites `NG/guide/aria/overview.md:62`, which says nothing about strings (a read of `NC/src/aria` finds no default label strings, so the claim holds by source reading). The rule is stated fairly as New otherwise: four published decisions carry it (`specs/close-button.md:315` D6, `specs/top-bar.md:474` D5, `specs/progress-bar.md:416` D12, `specs/orbit.md:556` D18).
- Smallest change: state both Slider exceptions (or require `displayWith` on a non-linear Slider and record the fallback's format as open); cite the `NC/src/aria` source reading. Rating: impact HIGH (every spec's naming and string API), confidence HIGH (four spec decisions, building-blocks 1.5 and 1.10): decided with the applied default is right.

### 24. P24 (provisional array): the stated precedent is wrong, and the naming choice belongs in the OPEN FOR HUMAN options

- Kind: 7 and 5.
- Severity: major.
- Evidence: Guide P24: "Two specs already export such an array"; the provisional name is `NFS_<PLUGIN>`. A third spec exports one under another naming: `specs/prototyping-utilities.md:192` ("`nfsPrototypeClasses`, a read-only array of the eighteen named after Foundation's `foundation-prototype-classes`, which a component lists in `imports`"). ADR 0009:12 rejected `NFS_ACCORDION` as a token name, and P13 avoids "`NFS_ACCORDION` as a token", so the array name also needs a rule. P24's first clause "A spec's usage examples import every directive they use" would flag every template-only snippet, which has no `imports` (for example `specs/accordion.md:616-638`). Checked facts: `NC/src/aria/accordion/public-api.ts` exports classes and tokens only, and no `NC/src/aria` file declares an NgModule or an exported array; `NC/src/material/button/button-module.ts:16-20` is an NgModule.
- Smallest change: "Three specs export an array: `NFS_ACCORDION`, `NFS_RESPONSIVE_ACCORDION_TABS`, and `nfsPrototypeClasses`"; put the name form among the OPEN FOR HUMAN options; limit clause 1 to TypeScript usage examples. Rating: impact HIGH (every entry point's exports), confidence NOT HIGH (the precedents disagree): OPEN FOR HUMAN is right.

## Minors

### 25. Conflict 1: fair on history and timers, incomplete on the exceptions

- Kind: 7.
- Severity: minor.
- Evidence: the statement is accurate for `history` and timers (`building-blocks.md:92` against `:205-206`; no spec uses an `effect()` for either: `rg` over `specs/` finds effects only for registration, the rendered-state signal, and Interchange's swap). It does not say that P10 also removes 1.5's two exceptions (point 3).
- Smallest change: the proposed 1.5 wording drops "(history writes, timers)" and keeps both exceptions. Rating: impact MEDIUM, confidence HIGH: decide.

### 26. P26 (provisional): untestable against a spec, mixes recorded rules, and its example contradicts the Reveal spec

- Kind: 1, 7.
- Severity: minor.
- Evidence: no spec has a deprecated API, so an auditor can rate only the "when the target moves" note. P26 folds recorded rules into a provisional principle: the Browser target follows Angular (`map.md:45`), `foundation-sites` is a peer at `^6.9.0` (ADR 0012:7). The Preferred example "`@deprecated Use size="full"` ... `readonly fullScreen`" implies a deprecated input that the Reveal spec never has (`specs/reveal.md:96`: "Dropped option: `size="full"` sets the `.full` Variant class"). The sources hold: `NG/reference/releases.md:116`, `:123`.
- Smallest change: move P26 to a "Release policy (OPEN FOR HUMAN)" section outside the audit, cite the recorded parts as recorded, and use a neutral example. Rating: impact HIGH, confidence NOT HIGH (no record): OPEN FOR HUMAN is right.

### 27. P13 and P4: three statements the sources do not bear out

- Kind: 5.
- Severity: minor.
- Evidence: P13: "methods and outputs use Material's vocabulary (`open()`, `close()`, `toggle()`, `expandAll()`, `collapseAll()`, ...)"; CDK and Material use `openAll()` and `closeAll()` (`NC/src/cdk/accordion/accordion.ts:51`, `:58`); `expandAll()` and `collapseAll()` are Aria's (`NC/src/aria/accordion/accordion-group.ts:133`, `:138`; `building-blocks.md:54`). P13: the token form "matches the lightweight-token guide's `LibHeaderToken`"; that token is a PascalCase abstract class (`NG/guide/di/lightweight-injection-tokens.md:97`, `:103`, `:179-186`); only the `Token` suffix matches (ADR 0009:7 says exactly that). P4 cites the same guide for "an `InjectionToken` typed with `import type`"; the guide shows an abstract class with `useExisting` (`:107`) and never mentions `import type`; ADR 0013:14 rejected the guide's form for `NfsOpenable`.
- Smallest change: "Aria's `expandAll()`/`collapseAll()`"; "keeps the `Token` suffix of `LibHeaderToken`"; cite `building-blocks.md:131` and ADR 0013 for the `InjectionToken` form.

### 28. Citations to correct

- Kind: 6 (missing or wrong sources).
- Severity: minor.
- Evidence: P10 `NG/packages/core/src/authoring/model/model_signal.ts` resolves under `adev/src/content/` by the guide's own key; the file is `packages/core/src/authoring/model/model_signal.ts:32-43` (content correct). P10's "effects run on the server" is not in `effect.md:19-32` or `:203-207` (`:205` says only that `afterRenderEffect` runs on the client); `research/angular-rendering-modes.md:55` states it. P8's "since Angular 22.0" is not in `directive-composition-api.md` (no version anywhere in the file); `CHANGELOG.md` 22.0.0 lists "de-duplicate host directives" (commit 9c55fcb3e6). P7 `NG/guide/components/inheritance.md:23-24`: the list is at `:25`. P25 `storybook-conventions.md:298` should be `:312`. P24 `NG/reference/errors/NG8002.md:5-12` gives the error ("bind to a property that does not exist"), not the "Can't bind" message the critique quoted.
- Smallest change: fix each path or line.

### 29. P23: "the e2e run sees none of them" holds only for the Storybook half

- Kind: 5.
- Severity: minor.
- Evidence: ADR 0018:24 speaks of "The static Storybook build"; `building-blocks.md:224` builds the fixture half "in the development configuration (needed for `ngDevMode` hydration stats)", so development checks run there.
- Smallest change: "the Storybook half of the e2e layer sees none of them".

### 30. P19: "a measured fallback timer" rewords building-blocks 1.6 rule 1

- Kind: 3.
- Severity: minor.
- Evidence: `building-blocks.md:107`: "A fallback timer of the declared duration plus 100 ms", measured only where the Motion class is consumer-chosen or the duration is a consumer Sass setting, "library-owned animations keep a declared duration". The sampled specs measure every time (`specs/reveal.md:461`; `specs/accordion.md:429`: "instead of using building-blocks 1.6 rule 1's 'declared duration'").
- Smallest change: quote rule 1, or list "measure always" as a proposed 1.6 change in the Answer, since the specs already do.

### 31. P18: "a measured value" flags the Reveal's offset properties

- Kind: 1.
- Severity: minor.
- Evidence: P18: "a `--nfs-*` property is an implementation channel for a measured value or a verification channel". `specs/reveal.md:491`, `:493`: `--nfs-reveal-top`, `--nfs-reveal-shift`, `--nfs-reveal-left` come from the `vOffset` and `hOffset` inputs. `building-blocks.md:232` gives "slider fill percentage", a computed value, as its example.
- Smallest change: "a runtime value CSS must read (a measurement or an input value)", or record the Reveal as a spec finding.

### 32. P4: registration "in `ngOnInit`" generalizes 1.9's ordered-children rule

- Kind: 3.
- Severity: minor.
- Evidence: `building-blocks.md:137` sets `ngOnInit` registration for ordered children; `specs/accordion.md:152` registers titles and contents "at construction" and needs no order.
- Smallest change: "ordered children register in `ngOnInit` (1.9); an unordered child may register at construction."

### 33. P8: drops the middle clause of 1.9's binding rule

- Kind: 3.
- Severity: minor.
- Evidence: P8: "holds only while the hosted value does not change after the host's last write or is derived from the same hosted signal". `building-blocks.md:139` has three clauses, including "or equals the wrapper's whenever it changes (the Tabs and Orbit bullet `tabindex` before and after Aria's first active item)".
- Smallest change: copy the three clauses.

### 34. P12: two rules weaker than 1.11

- Kind: 3.
- Severity: minor.
- Evidence: P12 forbids "`isPlatformBrowser` in templates"; `building-blocks.md:205` (decision 3): "`isPlatformBrowser` and `ngServerMode` are not used". P12's one-hydration-boundary rule omits decision 6's exception: "Magellan's sections ... may sit in any hydration boundary" (`:208`).
- Smallest change: adopt decision 3's wording and decision 6's exception.

### 35. Gaps the sampled specs raise that no principle answers

- Kind: 6.
- Severity: minor.
- Evidence: rules every sampled spec applies, with no principle: focus (`building-blocks.md:155`: roving `tabindex`, focus persistence, return to the invoker, never the dialog element); disabled (`:156`: `aria-disabled` and focusable for composite items, native `disabled` for standalone controls); ids (`:98`: consumer id wins, `_IdGenerator` prefixes, Aria's prefixes kept, deep links need consumer ids, ADR 0008:9); restoring globals on destroy (`:143`); keys (`:100`: `event.key`, `hasModifierKey`, no `keyCode`); output payloads (`:83`: aggregate outputs carry the item, item outputs are `void`); the rendered-state rule for render callbacks (`:94`); images (`:40`, `NgOptimizedImage`); a requirement on content the directives cannot read (ADR 0022:24); member visibility (AGENTS.md, cited by `specs/dropdown-menu.md:224`).
- Smallest change: one principle, "Shared baselines", that cites these sections by number, so the audit checks them without restating them.

### 36. Kinds table and "Not conflicts": two statements the records do not support

- Kind: 5.
- Severity: minor.
- Evidence: the Component row requires "that structure is not one plain element" and lists `NfsTooltipDescription`, which is one (ADR 0001:16 records it as a dated exception). "Not conflicts" dismisses the ecosystem lens's spinner case "because the library never adds markup Foundation does not have"; the Wrapper component's inner element (`specs/accordion.md:127`) and the Tooltip description element are library markup Foundation does not have.
- Smallest change: name the Tooltip exception in the row; give the spinner case the reason the records give: ADR 0001's cases are closed and a loading state is not Foundation's (map, Destination).

### 37. P16: "CDK is used where it is the smallest correct piece" has no test

- Kind: 1.
- Severity: minor.
- Evidence: `building-blocks.md:38` gives the test: `MediaMatcher`, `_IdGenerator`, `Directionality`, `InteractivityChecker`, `FocusTrap` only where native containment is unavailable; Overlay, Dialog, Menu, Accordion, and Listbox are not used.
- Smallest change: cite that list.

### 38. P3: "keeps the element structure of Foundation's docs" without the deltas

- Kind: 1.
- Severity: minor.
- Evidence: P5 and the specs change elements and add headings (`<a href="#">` becomes `<button>`, `div` becomes `dialog`, `h3 > button[nfsAccordionTitle]`); `building-blocks.md:22` lists them as deltas.
- Smallest change: "with the deltas each spec lists (building-blocks 1.1)".

### 39. Kinds table: two coordinating-directive examples coordinate nothing

- Kind: 5.
- Severity: minor.
- Evidence: `[nfsTopBarRight]`: nothing registers with it; a menu root reads its token for ancestry (ADR 0043:7). `ul[nfsDropdownMenu]`: "No plugin token (`nfsDropdownMenuToken`): nothing injects the Dropdown Menu root" (`specs/dropdown-menu.md:173`); `nfsMenuModeToken` comes from the Nested menu's factory provider (`:143`), not from `useExisting`.
- Smallest change: replace them with `[nfsTabsGroup]` and `ul[nfsSubmenu]`-style parents that children register with, or say "provides a token children or descendants read".

## Checks that held

- Baseline, `web-features` 3.40.0: `:dir()` high 2026-06-07; logical properties high 2024-03-20; `:has()` high 2026-06-19; `:open` low only (2026-05-11); Popover low only (2025-01-27); anchor positioning not Baseline; View Transitions, `@starting-style`, and `<details name>` low only; `<dialog>`, `:focus-visible`, size container queries, ResizeObserver, IntersectionObserver, `inert` (high 2025-10-11), and forced colours widely available before 2026-05-07. Every date and verdict in P11, P16, and P21 holds.
- Foundation 6.9.0: `_switch.scss:143`, `:153`, `:161`, `:167`; `_tabs.scss:102-103`; `_dropdown.scss:64`; `_accordion.scss:102`, `:116`, `:121`; `_card.scss:112-126` (no `.card-header`).
- APG: `read-me-first-practice.html:19` ("No ARIA is better than Bad ARIA") and `:26` ("A role is a promise").
- Angular and components: `directives/overview.md:17`; `accordion-group.ts:61-69`, `:63`, `:119`; `material/expansion/accordion.ts:32-40` (a directive); no non-spec `@Component` under `NC/src/aria`; `selectors.md:123-138`, `:140-143`; `hydration.md:103-121`, `:169`; `content-projection.md:255-269`; `directive-composition-api.md:22-33`, `:109-131`, `:170-266` (template match wins; NG8024); `CODING_STANDARDS.md` lines as cited; `inputs.md:237`, `:270`; `effect.md:19`, `:28-29`; `linked-signal.md:85-93`; `template-typecheck.md:248-265`; `accordion-trigger.ts:47`, `:50`, `:73`, `:85`; `a11y.md:58`, `:61`, `:66`; `creating-libraries.md:164`, `:171`, `:188`, `:203`; `style-guide.md:137-141`, `:153`; `enter-and-leave.md:28`; `forms/signals/migration.md:455-462`; `custom-controls.md:124-140`; `angular-package-format.md:148-154`; `focus-trap.ts:185`; `component-harnesses-overview.md:19`.
- P8 works as a test: applied to `specs/forms.md:148` and `:440`, it finds that the Forms spec's reason for not hosting `NfsFormLabel` ("writing both attributes throws NG0309") contradicts `building-blocks.md:133` and ADR 0041:7 (a template match discards the host-directive matches). That is a spec finding for the audit, not a guide problem.

## Verdict

Not ready. Count: 6 blockers, 18 majors, 15 minors. Ready after the six blockers (points 1 to 6) and the majors (points 7 to 24) are fixed: each blocker is a sentence-level change that brings a principle back to the recorded decision it cites, and points 20 and 22 to 24 decide what the ticket's Answer must triage. The minors can be applied in the same revision.
