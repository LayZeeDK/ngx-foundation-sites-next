# 50. Decide: the open points of the specs

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

Every spec ticket lists, under `### Open`, the points that no record settles. Under the user's full-AFK ruling (map, Standing rulings, 2026-10-03), the orchestrator decides each one. This ticket is where those decisions are recorded, one section per batch of specs. Each decision gives its reason and the record it changes. None of them is the user's ruling.

## Decisions: the shared specs (tickets 39 to 42), 2026-10-03

Decided by the orchestrator under full AFK mode.

1. **Scoping the Aria id provider** (ticket 39, point 1, HIGH impact, inferred). `provideYetiAriaIds()` answers only the hosted Aria directive's own id prefixes (`ng-tab-`, `ng-tabpanel-`, `ng-toolbar-widget-`, and whichever others the hosting spec lists). It passes every other call to the parent `_IdGenerator`, so Material, CDK, or Aria content inside the element is not affected. Reason: directive `providers` reach the element's content, and the package must not change ids it does not own. A layer-2 test nests a Material and a CDK id consumer inside a `yetiTabPanel`. Recorded as a note on ADR 0044.
2. **The fixture app's output mode** (ticket 39, point 2). The fixture app builds with `outputMode: 'server'`, with each route marked `RenderMode.Prerender` or `RenderMode.Server`. Each spec's e2e runs against both kinds of route, with JavaScript on and off. Reason: the JavaScript-off ruling covers SSR and prerendering, and the concurrent-request id test needs a running server; one app keeps a single fixture. Recorded as a note on ADR 0014.
3. **When `opened` and `closed` fire** (ticket 40, point 2). After the transition, using the building-blocks 1.6 timer, as the glossary and building-blocks 1.4 say. Reason: a consumer that moves focus or removes content then acts on settled UI, and two records already agree. Part 2 row 31 is corrected.
4. **A package-owned fragment link's `href`** (ticket 41, point 1). The directive reads the consumer's static `href` once through `HostAttributeToken('href')` and never binds `href`. Reason: the hydration rule forbids a static attribute that a directive also binds, and this attribute is never bound, never state, and equal on server and client. This is the one documented case of a consumer's static attribute that a directive reads. Recorded as a note on ADR 0023.
5. **The other open points of tickets 39 to 42** are decided as each writer recommended, for the writer's stated reason:
   - 39: points 3 to 7;
   - 40: points 1, 3, 4, and 5;
   - 41: points 2 to 5;
   - 42: points 1 to 6.

   This includes:
   - the e2e measurements for the first-navigation skip, for bare links in dehydrated blocks, and for fragment-only navigations;
   - the usage rules: no bound `[id]`, no `ngx-yeti-` id prefix in consumer ids, no consumer `id` on Aria-hosting parts, and no `HashLocationStrategy`;
   - renaming the toc's model away from `current`;
   - the `ngx-yeti/events` type-only entry point;
   - the guide's fix: the directive whose host renders an `id` generates it.

## Answer

2026-10-03: the decisions for the shared specs (tickets 39 to 42) are applied. Files changed:

- [ADR 0044](../adr/0044-generated-ids-count-per-application-and-are-adopted-at-hydration.md), [ADR 0014](../adr/0014-testing-stack-for-yeti.md), [ADR 0023](../adr/0023-fragment-links-are-same-document-links.md): a dated note each (decisions 1, 2, 4).
- [building-blocks.md](../building-blocks.md) Part 2 row 31: `opened` and `closed` fire after the transition (decision 3).
- [architecture-guide.md](../architecture-guide.md): the nav example; the directive whose host renders an `id` calls `injectYetiId`.
- [specs/generated-ids.md](../specs/generated-ids.md), [specs/events.md](../specs/events.md), [specs/fragment-links.md](../specs/fragment-links.md), [specs/navigation-close.md](../specs/navigation-close.md): every "(open: see ticket)" mark replaced by the decision.
- Tickets [39](39-spec-generated-ids.md), [40](40-spec-events.md), [41](41-spec-fragment-links.md), [42](42-spec-navigation-close.md): each open point marked decided.
- [ledger.md](../ledger.md) row A11Y-15: "Tested by" is L1 to L4, with the note that CDK's `closeOnNavigation` reacts only to `popstate`.

## Decisions: utilities and the first layouts (tickets 43 to 49, 51 to 58, 60, and 37), 2026-10-03

Decided by the orchestrator under full AFK mode (map, Standing rulings). None of these is the user's ruling. The numbering continues from the section above. "As the writer recommended" means the recommendation under the ticket's `### Open`, which holds the full text. Decisions 9, 12, 17, 21, and 32 are trap-quadrant decisions (HIGH impact, confidence below HIGH). Each carries the writer's options record, as the map's "Trap-quadrant decisions in full AFK mode" ruling asks.

### Cross-cutting

6. **Multi-part items: only the root directive marks its host and loads the item file** (ticket 52 point 1, ticket 55 point 2, ticket 57 point 1; MEDIUM impact, MEDIUM confidence). Only an item's root directive sets `data-ngx-yeti-item-<item>` and acquires the item file. Part and child directives (`YetiBreakoutChild`, `YetiBreakoutNote`, `YetiColumnsChild`, `YetiCoverChild`, and every part of a later spec) do neither. Reason: Yeti's rules for parts apply only under the root's class (`.breakout > [data-bleed]`, `.columns > [data-span]`, `.cover > [data-center]`), so a part's styles matter only while a root host is connected, and that host's own presence attribute keeps the link in every rendering mode (ADR 0060 point 4). A presence attribute on each part would add server HTML and a second acquisition that decides nothing. Recorded as dated notes on [ADR 0045](../adr/0045-each-item-marks-its-host-with-its-own-attribute.md) and [ADR 0060](../adr/0060-item-styles-are-counted-links-to-the-consumers-yeti-build.md) point 2. To overrule for one item: give its parts the static presence attribute and the acquire and release calls, and turn that spec's layer-2 case around.
7. **Any-element marker directives set no presence attribute and acquire no item file** (ticket 56 point 1; LOW impact, HIGH confidence). This covers all six: `yetiBorder`, `yetiPaint`, `yetiText`, `yetiShow`, `yetiHide`, and `yetiNumeric`. Their rules are in the always-loaded `layouts/attributes.css`, and the presence attribute exists only for the item-file removal check. ADR 0045 applies to item root directives only. Recorded as a note on ADR 0045. [Ticket 11](11-decide-spec-list.md)'s "part file" wording is corrected to **Item file**, the glossary's name (ticket 51's finding).
8. **Contrast threshold for text: 4.5:1** (ticket 46 point 1, ticket 52 point 2; MEDIUM impact, HIGH confidence). Play functions assert at least 4.5:1, with the exact WCAG formula on computed colours, for every text they check, in the light and dark schemes, unless a record says otherwise. Reason: the lede and the breakout heading count as large text only at the top of their fluid ranges, and a theme may lower the size token, so the stricter threshold holds for any size. If Yeti's default fails 4.5:1, the owning spec adds a package rule under the ledger row's A11Y-10a pattern. Already in the writers' brief.
9. **Static presentational attributes on `removed`-kind inputs** (ticket 55 point 1, ticket 60 point 1, ticket 54 point 1; HIGH impact, MEDIUM confidence; trap quadrant). An input named like an HTML presentational attribute (building-blocks 1.4's `removed` kind: `align` on eight items, `border` on the table, `start` on a grid child, and any other the specs name) may be written statically by the consumer (`align="center"`). The directive binds the HTML attribute to `null` and renders the `data-*` form. Each such spec adds an e2e case asserting that no frame paints with the HTML attribute present, and its SSR smoke writes the static form. If that case fails, the fallback is option B for every `removed`-kind spec. Already in the writers' brief. The writer's record, from [ticket 55](55-spec-columns.md) point 1 (ticket 60 point 1 repeats it for `icon`):
   - **Question.** Building-blocks 1.4 defines the `removed` kind for an input named like an HTML attribute (`'[attr.align]': 'null'`) and requires each spec's SSR smoke to write the static form and assert that the attribute is absent. So the records expect `align="center"` to be written statically. The building-blocks "Hydration constraints (2026-10-03)" bullet says a consumer writes no static attribute on an attribute a directive binds, because hydration writes it back. Ticket 33 read that such an attribute "is written back and removed again at hydration". Which rule wins for a `removed` input?
   - **Option A (chosen): accept the static form for `removed` inputs.** The server HTML has no `align`. Hydration writes it back, and the constant `null` binding removes it again in the same synchronous pass, so the final DOM equals the server's and no frame paints the hint between the two writes. Approved because it keeps `align="center"` working like every other static input (`columns="3"`, ADR 0070 rule 2), and the hint never reaches a painted frame or the server HTML. On a flex container a one-pass `text-align` hint would change no layout of the container itself (ticket 54).
   - **Option B: a usage rule that `removed`-kind inputs are bound only** (`[align]="'center'"`). A bound input renders no HTML attribute, so the `null` binding would never have anything to remove. Dismissed because it breaks the uniform static-input form for 10 inputs, contradicts building-blocks 1.4's SSR-smoke instruction, and the forbidden form fails silently: it renders the same final DOM.
   - **Option C: rename the inputs** (`alignment`). Dismissed because it breaks the map's Input naming record (Yeti's names in camelCase), and old ticket 139's rule exists so that the names can stay.
   - **Evidence and confidence.** Ticket 33's reading that the rewrite and the removal run in one synchronous hydration pass (read, not run). That no frame paints the hint is inferred. The fixture-app e2e in each spec checks it: no `NG05xx`, and no `align` after hydration.
   - **To overrule.** An implementer who prefers B replaces the spec's usage rule with "bind `align`; never write it statically", removes the static form from the SSR smoke and the e2e fixture, adds the same rule to the other `removed`-kind specs, and amends building-blocks 1.4 and architecture-guide P9. If the e2e case finds an `NG05xx` or a painted hint, B wins.
10. **The name-collision test covers every exported TypeScript name, against all 46 names `yeti.d.ts` exports** (ticket 51 point 2; MEDIUM impact, HIGH confidence). ADR 0080 point 4's list of five counts item classes only. At the pin `yeti.d.ts` exports these 46 names: YetiA YetiAlign YetiAttention YetiAttribute YetiAttributeType YetiChild YetiColumns YetiComponent YetiComponentName YetiEdge YetiEmphasis YetiEnter YetiEvent YetiFit YetiGap YetiHeight YetiJustify YetiKind YetiLift YetiManifest YetiMarker YetiModule YetiOrientation YetiPaint YetiPanel YetiPlacement YetiPrint YetiRatio YetiResize YetiRows YetiSelf YetiShape YetiSide YetiSizeControl YetiSlides YetiSpan YetiStart YetiSurface YetiToken YetiTokenCatalogue YetiTokenEntry YetiTracks YetiTrigger YetiVariant YetiWidth YetiWidthOrNone. Any class, type, or token a spec names that equals one of them takes `NgxYeti`. So the `[yetiPaint]` class is `NgxYetiPaint`, a sixth collision, from a marker directive, not an item. Names that a part or a package type could take and that are already Yeti's include `YetiSpan`, `YetiSlides`, `YetiTrigger`, `YetiPanel`, `YetiStart`, `YetiChild`, and `YetiEvent`. Recorded as dated notes on [ADR 0080](../adr/0080-yeti-prefix-ngx-yeti-runtime-names-ngxyeti-on-collision.md) and building-blocks 1.3. Already in the writers' brief.
11. **Class names of the any-element marker directives** (ticket 56 point 2; LOW impact, HIGH confidence). `Yeti` plus the PascalCase of the selector without its prefix: `YetiShow`, `YetiHide`, `YetiBorder`, `YetiText`, `YetiNumeric`, and `NgxYetiPaint` under decision 10. This mirrors building-blocks 1.3's `exportAs` rule. Recorded as notes on ADR 0080 and building-blocks 1.3.
12. **Two item directives on one host** (ticket 47 point 1, ticket 48 point 1, ticket 45 point 5; HIGH impact, MEDIUM confidence; trap quadrant). Option A: one presence attribute per item, `data-ngx-yeti-item-<item>`. The decision record, with the question, the five options and why each was approved or dismissed, the evidence, and how to overrule it, is [ADR 0045](../adr/0045-each-item-marks-its-host-with-its-own-attribute.md). The full analyses stay in tickets 47, 48, and 45. The specs written before ADR 0045 (`attention`, `billboard`, `enter`, `lede`, `lift`, `print`, `visually-hidden`) now use the per-item attribute.

### attention (ticket 43)

13. **The shake's transient overflow at 320 px** (point 1; LOW, MEDIUM). No ledger row, as the writer recommended: no content needs two-dimensional scrolling to be read, and the throw ends within the 600 ms gesture. Layer 4 asserts that the overflow is gone after the gesture.
14. **Hydration does not restart the gesture** (point 2; MEDIUM, MEDIUM). Accepted as inferred: hydration writes the same values again, which changes no computed style. Layer 4 asserts exactly one `animationstart` per host across load and hydration. If it fails, an upstream-bugs row is added and the point is revisited.
15. **A consumer's `--yeti-attention-duration`** (point 3; MEDIUM, HIGH). A usage rule: a consumer who sets the duration also sets it to `0.01ms` inside `@media (prefers-reduced-motion: reduce)`. No package code and no input (ADR 0004).
16. **`yetiAttention` beside `yetiEnter`** (point 4; LOW, MEDIUM). A usage rule: the two go on different elements, the gesture on a child of the entering element, because the entrance's `animation` replaces the pulse.

### billboard (ticket 44)

17. **WCAG 1.4.4 Resize Text under page zoom** (point 1; HIGH impact, MEDIUM confidence; trap quadrant). Option A: record and measure. New ledger row A11Y-20, owned by `billboard`, verified *inferred*, tested by L4. No package CSS until the spec's layer-4 zoom case has measured in three engines. The writer's record, from [ticket 44](44-spec-billboard.md):
   - **Question.** Does the billboard's fluid size shrink text under 200 % page zoom, in the middle of its ramp, and what does the package do about it? Ticket 17 lists "200 % zoom (1.4.4)" as not measured.
   - **Evidence (inferred from source, not run).** The billboard's middle size is `100cqi` times the pair's ceiling over `--yeti-fit-width`. Page zoom shrinks a fluid container in CSS pixels, and Yeti's fluid scale also steps down with the narrower CSS viewport. Take a default-pair heading in a 400 px fluid container at a 1280 px window: it sets about 44 px. At 200 % zoom it falls to its floor of about 17 CSS px, about 33 device px. That is smaller than before zooming. In a container of fixed width it grows only about 1.4 times. Body text is not affected the same way, because its fluid range is small (1 to 1.125 rem). Confidence MEDIUM: arithmetic from Yeti's CSS and scale at their defaults, not a measurement.
   - **Option A (chosen): record and measure.** Add ledger row A11Y-20 (billboard; WCAG 2.2 1.4.4; Yeti does what its `a11y` note says; the package adds nothing yet; verified *inferred*; tested by L4; owner billboard). Make the spec's layer-4 zoom case a measurement in three engines, and decide on a fix once it has run. Approved because it follows the ledger's rule that every gap found is a row whether or not it is closed, adds no unmeasured CSS, and keeps Yeti's look.
   - **Option B: add a package rule now.** One `@layer ngx-yeti` rule that raises the billboard's floor under zoom (for example, a `max()` of Yeti's clamp and a `rem` term), as the Accessibility CSS ruling allows. Dismissed because it is unmeasured, it changes Yeti's documented sizing for every consumer, and it writes against Yeti's private `--_yeti-fit-*` tokens or duplicates Yeti's clamp, which ADR 0004 and building-blocks 1.13 forbid.
   - **Option C: a usage rule only.** Document pairs with a narrow range, or fixed-width containers. Dismissed because the arithmetic shows a shrink even for the default pair in a fluid container, so a usage rule does not meet AA.
   - **Option D: no row.** Treat it as Yeti's design, on the strength of Yeti's "the clamp is the accessibility story". Dismissed because the ledger records Yeti's gaps too, and nothing has measured the claim at 200 %.
   - **To overrule.** For B, add the rule to the package's accessibility stylesheet, set A11Y-20's "What the package adds" to that rule, and make the layer-4 zoom case assert at least 200 %. For D, remove the zoom case's pass condition and the spec's 1.4.4 risk sentence. Filing upstream with Yeti needs the user's confirmation in every case.
18. **"Types only" and ADR 0060's loader** (point 2; LOW, HIGH). A note on building-blocks Part 2's "Types only" definition: acquiring the item file through ADR 0060's root styles service is the one injection every types-only item directive makes.

### enter (ticket 45)

19. **`arrived` is private** (point 1; LOW, HIGH). A private `#arrived` signal; `exportAs` exposes the inputs only. Yeti declares no event for `enter`, and a public member can be added later without a break.
20. **`once` after the first client render** (point 2; MEDIUM, MEDIUM). The arrival is one-way: once `arrived` is true, no value of `once` renders `data-once` again. A `once` that is `false` at the first client render counts as already arrived. Before the arrival, `once` toggles the attribute and the observer follows it. Reason: Yeti never puts the attribute back (`enter.js` header). Layer 2 covers both cases.
21. **A `once` element already in view when the app hydrates** (point 3; HIGH impact, MEDIUM confidence; trap quadrant). Options (a) and (c): keep Yeti's behaviour, add the usage rule that `once` is for content that starts below the fold, and have layer 4 record the delay between first paint and arrival for an in-view `once` element. The writer's record, from [ticket 45](45-spec-enter.md):
   - **Question.** A `once` element near the viewport when the app hydrates: what happens, and does the package change it?
   - **Option (a), chosen: like for like.** The observer reports the element at once after hydration. `data-once` goes, and the element jumps to its `from` keyframe (transparent, offset) and arrives. This is what `enter.js` does at load, only later. Approved because it keeps the replacement like for like, as building-blocks row 45 and ADR 0040 ask ("none (like-for-like)"). The cost is a visible flash on SSR and prerendered pages: content painted at first paint disappears at hydration and fades back. The delay is as long as hydration takes, where `enter.js` ran before or near first paint.
   - **Option (b): skip the arrival for an element that intersects on the observer's first callback.** Set `arrived` without letting the animation play, so the element stays as painted. This needs a way to remove `data-once` without starting the animation (a temporary `animation: none` style, or reading the first entry before the binding changes), which is new package behaviour on top of Yeti. Dismissed: it removes the flash, but it adds behaviour Yeti does not have, it needs an inline style or a second state, and ADR 0003 point 3 and building-blocks 1.6 point 1 say the directive adds no class or inline style for animation. It would also make a client-rendered page and an SSR page behave differently for the same markup.
   - **Option (c), chosen with (a): a usage rule only.** Document that `once` is for content that starts below the fold, and keep (a)'s behaviour. It costs nothing, but alone it only describes the problem; the spec already states it, quoting Yeti's "as it first comes near the viewport".
   - **Evidence and confidence.** `enter.js:23-31` and `enter.css:103-114` (read). That the observer reports an in-view element on its first callback is the platform's documented behaviour (read). The size of the visible gap under hydration is inferred, not measured: ticket 18 measured the race only for a below-the-fold element.
   - **To overrule.** An implementer who chooses (b) adds the skip in the observer's first callback, and records a new design decision and a ledger-neutral note. Because (b) adds a style write, they must also amend the ADR 0003 point 3 and building-blocks 1.6 point 1 statements for this directive, and change the layer 2 and layer 4 cases from "arrives after hydration" to "stays as painted".
22. **`animate.enter="enter"` beside `yetiEnter`** (point 4; LOW, MEDIUM). A usage rule: on an element it inserts, the consumer writes `yetiEnter`, which already plays on insertion, and never writes `animate.enter="enter"` beside `yetiEnter` on one element. Building-blocks 1.6 point 2's allowance stays for package host bindings.

Point 5 is decision 12.

### lede (ticket 46) and breakout (ticket 52)

Lede point 1 and breakout point 2 are decision 8. Breakout point 1 is decision 6.

23. **Ledger A11Y-10e's "What Yeti does" cell** (ticket 46 point 2; LOW, HIGH). Rewritten as the writer recommended: plain text on the page surface; axe left `color-contrast` incomplete on the example's heading as partially obscured, cause not traced.
24. **Ledger A11Y-10c's "What Yeti does" cell** (ticket 52 point 3; LOW, HIGH). Rewritten the same way for the breakout: Yeti's example has a bleeding image with no text over it.
25. **Incomplete manifest `support` lists** (ticket 46 point 3, ticket 52 point 4; LOW, MEDIUM). One upstream-bugs row, Y8: `lede`'s `support.unguarded` omits `text-wrap: pretty`, and `breakout`'s list, with the four other manifests [Research: Angular 22's browser baseline against what Yeti expects](01-research-browser-baseline-vs-yeti.md) names, omits `:has()` and container queries. Verified *read*, no minimal reproduction, not filed. The package does nothing either way.

### lift (ticket 47)

Point 1 is decision 12.

26. **Forced colours and the lift's shadow** (point 2; LOW, MEDIUM). No package CSS and no ledger row, as the writer recommended: the lift is decoration, the focus ring carries 2.4.7, and no AA criterion depends on a hover cue. The layer-4 forced-colours case measures that the ring remains.

### print (ticket 48)

Point 1 is decision 12.

### visually-hidden (ticket 49)

27. **The CDK comparison is not a ledger row** (point 1; LOW, MEDIUM). No ledger row and no package CSS; the spec's property-by-property table is the record. A later measured WCAG failure adds a row and one rule in `@layer ngx-yeti`.
28. **No input for showing the words on a condition** (point 2; MEDIUM, HIGH). No input: a consumer uses `@if` to render the words inside or outside a hidden element. Yeti declares no attribute for the item, and adding an input later is not breaking.

### box (ticket 51)

Point 2 is decision 10.

29. **A ledger row for the box's contrast gap** (point 1; MEDIUM, HIGH). New ledger row A11Y-21, owned by `box`: WCAG 2.2 1.4.3; Yeti documents that no text colour reaches full contrast on `grey-40` to `grey-60` (`color.md:80`); the package adds usage rules, the anti-pattern story, and play-function ratio assertions on every shown pair, with no package CSS; verified *read*; tested by L1. Reason: the ledger lists every accessibility gap found in Yeti, whether or not the package closes it.
30. **Forced colours on surfaces and paint** (point 3; LOW, MEDIUM). No ledger row and no package CSS: neither draws a state. The e2e case that records the border surviving `forcedColors: 'active'` stays.
31. **Which `yetiText` values the `box--text` story shows** (point 4; LOW, MEDIUM). The implementer measures them with the play function's formula: passing values go in `box--text`, failing ones in `box--anti-pattern-low-contrast`. The spec states no list.

### center (ticket 53)

32. **Ledger row A11Y-9, the 2 px overflow at 320 px** (point 1; HIGH impact, MEDIUM confidence; trap quadrant). Option C: a usage rule (no inline border and no `gapInline` on the center's own element; put them on a `yetiBox` inside it), an anti-pattern story for Yeti's composition, and a layer-4 `scrollWidth` assertion on the documented forms. Option B is not drafted now: asked whether to draft upstream issues for ledger rows A11Y-5 and A11Y-6, the user chose "Ledger only" (map, Standing rulings), and the orchestrator applies the same treatment to A11Y-9; filing would need the user's confirmation in any case. Option A2 is adopted later only if a layer-4 measurement passes in all three engines. A11Y-9 is updated. The writer's record, from [ticket 53](53-spec-center.md):
   - **Question.** The spec traced the cause (read, and it matches ticket 17's measured 322 px exactly): a center's content box is its container's width less two gutters, `content-box`, so its padding brings it back to exactly 100 %. `[data-border]` (always-loaded `layouts/attributes.css:465`, `--yeti-border-width` 1px) adds 2 × 1 px on top. A second path, inferred and not measured: `.box[data-gap-inline]` outranks `.center` in specificity, so on a `center box` element a `gapInline` larger than the gap overflows by the difference. `intrinsic` is not affected (inferred). It is Yeti's CSS, so the ledger's branch applies: "one rule in `@layer ngx-yeti` or an upstream fix (the user's confirmation to file)". Which one?
   - **Option A1: a package rule recomputing the width with the border.** `.center[data-border]:not([data-intrinsic])` with an inline size of 100 % less two gutters less two border widths. Dismissed: the gutter is a **Private token**, which the package never reads, writes, or names (ADR 0004; CONTEXT.md), and the user's "Accessibility CSS: Yes." ruling as recorded has rules "written against state hooks, not Yeti's internals". It also misses the `gapInline` path.
   - **Option A2: a package rule with a sizing keyword that fills the space left after padding and border** (`inline-size: stretch` on `.center[data-border]:not([data-intrinsic])`, or on every `.center`). Touches no private token and fixes both paths. Not approved now: unprefixed support in Firefox 145 and Safari 26.2 was not checked (confidence LOW), and whether it behaves inside a `stack` flex column, the reason Yeti set an explicit width, was not measured. Approve if a layer-4 measurement in the three engines shows it fills a center in block flow and in a stack with no overflow.
   - **Option B: an upstream fix in Yeti's `center.css`.** The right home for the fix, since Yeti's own example fails. It cannot be completed here: filing stays behind the user's confirmation (map, AFK override and Out of scope), and a fix arrives only with a pin move. The writer proposed a draft; the orchestrator does not draft it now (above).
   - **Option C (chosen): a usage rule, an anti-pattern story, and a layer-4 assertion.** No inline border and no `gapInline` on the center's own element; put them on a `yetiBox` inside it. Costs no CSS and no private token, keeps `yetiCenter yetiBox` (architecture-guide P6) valid, and meets 1.4.10 for every form the package documents. Its weakness: nothing stops a consumer from writing the overflowing form, because checks are a later milestone (map, Milestones).
   - **Option D: accept and document the gap as Yeti's.** Dismissed: the package's AA requirement is never a recommendation (map, Inherited preferences, Accessibility).
   - **Evidence and confidence.** Cause: HIGH (read in `center.css:5`, `:12`, `:15`, `attributes.css:465`, `surface.css:5`; arithmetic equals ticket 17's 322 px; not re-run). `gapInline` path: MEDIUM (specificity read, not measured). A2's engine support: LOW (not checked).
   - **To overrule.** An implementer who prefers a package rule writes A2 into the package's accessibility stylesheet in `@layer ngx-yeti`, removes the usage rule and the anti-pattern story, and turns the layer-4 case on Yeti's own composition into a pass assertion. One who prefers D removes the usage rule and records the gap as accepted in the ledger.

### cluster (ticket 54)

Point 1 is decision 9.

### columns (ticket 55)

Point 1 is decision 9; point 2 is decision 6.

33. **`data-threshold` on `columns` is not a container query** (point 3; LOW, HIGH). Building-blocks 1.7 and `architecture-guide.md` now say that the change is decided by the container's width: a container query on `nav`, flex-basis arithmetic on `columns`. The rules that follow stand unchanged.

### container (ticket 56)

Point 1 is decision 7; point 2 is decision 11.

### cover (ticket 57)

Point 1 is decision 6.

34. **Yeti's committed layouts guide is stale** (point 2; LOW, HIGH). A docs-only Yeti row in `upstream-bugs.md`, Y9: `src/guides/layouts.md` at the pin has no `data-height` row, while the generated docs have one. Verified *read*; no reproduction needed; no upstream report unless the user confirms one. The spec's reading that `.cover > *` and `.center` tie at equal specificity, so a center inside a cover keeps its inline centring only because ADR 0060 point 3 inserts `center.css` after `cover.css`, stands with its layer-4 case; it is added to ADR 0060's order-sensitive pairs in that record's note.

### frame (ticket 58)

35. **`NgOptimizedImage` inside a frame** (point 1; MEDIUM, MEDIUM). The usage rule as written: `fill`, plus `position: relative` on the frame in the consumer's own stylesheet. No package CSS and no host style binding. The `frame--optimized-image` story records both forms' console output; if `fill` misbehaves, the rule becomes "use `width` and `height`, and expect the development-mode warning".
36. **Embedded media reload at hydration** (point 2; MEDIUM, MEDIUM). The usage rule (a `video` takes `<source>` children; the `iframe` reload is documented) and the layer-4 case that counts loads across hydration. If the case confirms the `iframe` reload, an Angular row is added to `upstream-bugs.md`; filing needs the user's confirmation.
37. **Text inside a frame** (point 3; LOW, MEDIUM). The usage rule as written (text the reader needs goes beside the frame), with no ledger row and no package CSS, after the `masonry` precedent.

### icon (ticket 60)

Point 1 is decision 9.

38. **Target size of an icon-only control** (point 2; MEDIUM, MEDIUM). A usage rule, an icon-only `yetiButton` in the standalone story, and a play-function assertion that its box is at least 24 by 24 CSS pixels. No package CSS and no ledger row: a 24 px minimum on `.icon` would change Yeti's layout for icons in running text, where 2.5.8's inline exception applies.
39. **No `yetiIcon` on a table cell** (point 3; LOW, HIGH). The usage rule stays, because `yetiTableCell` declares `align` with a narrower type; the table spec (ticket 89) states the same rule from its side.
40. **Where an icon-only button's name sits** (point 4; LOW, HIGH). Both placements are accepted. The examples use the icon manifest's form (`role="img"` and `aria-label` on the SVG), and the tests assert the control's computed name, not where the label sits. The button spec (ticket 76) says the same.

### consumer boundaries (ticket 37)

These four were recorded in [ticket 37](37-prototype-consumer-boundaries-around-ngx-yeti.md)'s Answer; they are listed here so that this ticket holds every orchestrator decision.

41. **The package needs no change for consumer `@boundary` blocks.** Reason: the prototype measured no `NG05xx` in any mode, and every id stays unique.
42. **Every item directive acquires its item file after anything in its constructor that can throw**, so a constructor error leaks no count (measured: a client constructor error leaked one).
43. **The `setup` spec documents consumer boundaries**: the preload list as the cover for `$reset()`'s unstyled frames in WebKit, and the click made before hydration that a boundary loses.
44. **`demo` and every package template use no `@boundary`**, because upstream-bugs A8 leaves a half-built template that later requests cannot recover.

### Applied

- [ledger.md](../ledger.md): A11Y-9 (decision 32), A11Y-10c and A11Y-10e (decisions 23 and 24), new A11Y-20 (decision 17) and A11Y-21 (decision 29).
- [upstream-bugs.md](../upstream-bugs.md): Y8 (decision 25) and Y9 (decision 34).
- Dated notes on [ADR 0080](../adr/0080-yeti-prefix-ngx-yeti-runtime-names-ngxyeti-on-collision.md) (decisions 10 and 11), [ADR 0045](../adr/0045-each-item-marks-its-host-with-its-own-attribute.md) (decisions 6 and 7), and [ADR 0060](../adr/0060-item-styles-are-counted-links-to-the-consumers-yeti-build.md) (decisions 6, 7, and 34).
- [building-blocks.md](../building-blocks.md) 1.3 (decisions 10 and 11), 1.7 (decision 33), and the "Types only" definition (decision 18); [architecture-guide.md](../architecture-guide.md) (decision 33).
- [Ticket 11](11-decide-spec-list.md): "part file" now reads "item file" (decision 7).
- The specs for attention, billboard, enter, lede, lift, print, visually-hidden, box, breakout, center, cluster, columns, container, cover, frame, and icon: every "(open: see ticket)" mark replaced by its decision, and the old `data-ngx-yeti-item="<item>"` replaced by `data-ngx-yeti-item-<item>` (decision 12). Their tickets mark each open point decided.
