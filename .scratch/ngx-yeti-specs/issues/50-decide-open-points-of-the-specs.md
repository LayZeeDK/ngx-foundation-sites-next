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

## Decisions: the remaining layouts, recipes, setup, and the first components, 2026-10-03

Decided by the orchestrator under full AFK mode (map, Standing rulings). None of these is the user's ruling. The numbering continues from the section above. "As the writer recommended" means the recommendation under the ticket's `### Open`, which holds the full text. The batch is tickets 38 (setup), 59 (grid), 61 (layer), 62 (masonry), 63 (overlay), 64 (scroller), 65 (sidebar), 66 (stack), 67 (timeline), 68 (hero), 69 (media), 70 (shell), 72 (affix), 74 (badge), and 75 (breadcrumbs). Decisions 46, 47, and 48 are trap-quadrant decisions (HIGH impact, confidence below HIGH). Each carries the writer's options record, as the map's "Trap-quadrant decisions in full AFK mode" ruling asks.

### Cross-cutting

45. **The style loader's API** (ticket 38 point 1; MEDIUM impact, MEDIUM confidence). As the writer recommended, option (i): a secondary entry point `ngx-yeti/styles` exports `provideYetiStyles`, its configuration type, and `injectYetiItemStyles(item: YetiComponentName): void`. The helper registers the release on `DestroyRef` and then acquires. An item's root directive calls `injectYetiItemStyles('<item>')` as the last statement of its constructor, after anything that can throw (decision 42). The root service stays unexported, and `preload` is typed `readonly YetiComponentName[]`. Reason: it mirrors `ngx-yeti/generated-ids` and `ngx-yeti/fragment-links`, and keeps the primary entry point types-only. Every item spec links [setup](../specs/setup.md) for the loader and does not restate it; this was already in the writers' brief.
46. **A consumer's `aria-describedby` on a control that a package directive also describes** (ticket 72 point 1; HIGH impact, MEDIUM confidence; trap quadrant). Option A, and the general rule: a package directive that binds `aria-describedby` on a control takes an input aliased `aria-describedby` and merges the consumer's ids with its own (the hint's and the error's), consumer's ids first, as Material's `userAriaDescribedBy` does. It never replaces the consumer's ids. The field spec (ticket 83) states it for `yetiFieldControl`, with an e2e case asserting no `NG05xx` and the merged value after hydration. This was already in the writers' brief. The writer's record, from [ticket 72](72-spec-affix.md):
   - **Question.** Yeti asks the developer to give a meaningful `span` an id and list it in the control's `aria-describedby` (`affix/manifest.json` `a11y.notes`). Part 2 row 22 keeps that attribute the consumer's. But inside a package field the control carries `yetiFieldControl`, which binds `aria-describedby` from the hint's and error's ids (Part 2 row 33; ADR 0020 point 2). A bound `aria-describedby` replaces the consumer's static one, and building-blocks' "Hydration constraints (2026-10-03)" bullet says a consumer writes no static attribute that a directive binds. As the records stand, the prefix silently falls out of the control's description inside every package field, which is where Yeti says the affix usually sits (WCAG 1.3.1).
   - **Option A (chosen): the field's control directive composes the consumer's ids.** It declares an input aliased `aria-describedby`, the consumer writes `aria-describedby="price-unit"` on the control, and the directive binds the consumer's ids followed by the hint's and the error's. This is Material's shape (`NC/src/material/input/input.ts:243` `userAriaDescribedBy`; `form-field.ts:759` `_syncDescribedByIds`) and the old bundle's abide decision 12 ([research/yeti-validate-and-signal-forms.md](../research/yeti-validate-and-signal-forms.md) line 119). Approved because it keeps Yeti's documented markup working unchanged, needs no affix code, and serves any consumer description, not only the affix's. The static attribute is written back at hydration and replaced by the composed value in the same pass, the same shape as decision 9, so the field spec's e2e should assert no `NG05xx` and the composed value after hydration.
   - **Option B: a usage rule only, "inside a package field, say the unit in the label".** The manifest's second form ("Price in dollars"). Dismissed as the only answer: it removes Yeti's first documented form, and a domain or long suffix reads badly in a label. It stays in the spec as the form that is always correct.
   - **Option C: a part directive on the attachment `span`** (`[yetiAffixAddon]`) that generates an id and registers it with `yetiFieldToken`, so the field's control directive adds it. Dismissed: Part 2 row 22 makes the affix class only and says the consumer's id does the job; it adds a part, a cross-item DI link, and a generated id for a case a consumer id already covers.
   - **Evidence and confidence.** The collision is read from Part 2 rows 22 and 33 and ADR 0020 point 2. Material's composition is read at `708d4c6e2`. The field spec (ticket 83) was being written in parallel, so whether it already chose A was not known; that is why confidence is MEDIUM.
   - **To overrule.** For B: replace usage rule 3's field case with "say the unit in the label", remove the description assertion from `affix--default` and use the label in the examples. For C: add `YetiAffixAddon` to sections 2 to 4, use [generated-ids](../specs/generated-ids.md), and amend Part 2 row 22. Either way the field spec states the matching rule.
47. **A sticky child over stacked content** (ticket 65 point 1; HIGH impact, MEDIUM confidence; trap quadrant). Option A: usage rule 4, a layer-4 Shift+Tab walk asserted with the rule followed and recorded with Yeti's defaults, and no package CSS. One new shared ledger row, [A11Y-22](../ledger.md), "a stuck sticky child can obscure focus": owned by `sidebar` and shared with `stack` and `shell`, WCAG 2.2 2.4.11 and 1.4.10, verified *inferred*, tested by L4. Part 2 rows 15, 16, and 20 name it. The writer's record, from [ticket 65](65-spec-sidebar.md):
   - **Question.** Side by side, a sticky child covers nothing. Once the pair has stacked, a sticky child that comes first in the stacked order sits above the content scrolling under it (`[data-sticky]` has `z-index: 2`, `Y/src/layouts/attributes.css:333-342`). A control that focus scrolls into view stops at `--yeti-scroll-padding` from the top, which defaults to the sticky offset (`Y/src/tokens/space.css:56-69`), so Shift+Tab can put a focused link entirely behind the stuck child (WCAG 2.2 2.4.11). A sticky child taller than the viewport also keeps its own lower content out of reach until the container ends (1.4.10 at 320 x 256). Ticket 17 measured the sidebar example clean, but that example has no sticky child. What does the package do?
   - **Option A (chosen): a usage rule, a ledger row, and a layer-4 measurement; no package CSS.** Usage rule 4: stick only a child that fits the smallest supported viewport, and where a stuck first child sits above stacked content, set `--yeti-scroll-padding` on the root to at least its height, or stick only a child that comes last. A new ledger row, owned by `sidebar` (WCAG 2.2 2.4.11 and 1.4.10; Yeti does what its CSS says; the package adds the usage rule; verified *inferred*; tested by L4), which `stack` and `shell` share. Layer 4 asserts the Shift+Tab walk with the rule followed and records the walk with Yeti's defaults. Approved because it follows decision 32 (a usage rule where the package cannot fix Yeti's CSS without its private tokens) and decision 17 (every gap found is a row, with no unmeasured CSS), and uses Yeti's own tokens for this exact purpose (`Y/src/tokens/tokens.json:125-126`, `Y/src/guides/layouts.md:115`).
   - **Option B: a package rule in `@layer ngx-yeti`** under the user's ruling "Accessibility CSS: Yes." (map, Standing rulings). Dismissed for now: CSS cannot tell when the sidebar has stacked, because the switch is flex-basis arithmetic with no container query, and a rule that unsticks children everywhere removes the feature side by side. A scroll-state container query (`@container scroll-state(stuck: top)`) could react to the stuck state, but it is not in the Baseline 2025 target (inferred, not checked against web-features data).
   - **Option C: remove the `sticky` input from `YetiSidebarChild`.** Dismissed: it breaks ticket 26 row 60 and ADR 0003 point 2 (every marker set from a typed input), and leaves the consumer no way to write the marker.
   - **Option D: no row and no rule, treating it as Yeti's design.** Dismissed: decision 32 dismissed the same option ("the package's AA requirement is never a recommendation"), and decision 17 dismissed "no row" because the ledger records Yeti's gaps too.
   - **Evidence and confidence.** The stacking geometry and the z-index: read in `sidebar.css` and `attributes.css` (HIGH). That focus scrolling honours the root scroll padding and so leaves a focused link under the stuck child: inferred from the CSS scroll-padding model, not measured (MEDIUM). Whether a usage rule meets the map's accessibility line: a reading of the records, with decision 32 as precedent (MEDIUM).
   - **To overrule.** For B, add the rule to the package's accessibility stylesheet, set A11Y-22's "What the package adds" to it, and turn layer 4's recorded walk into an assertion. For D, remove usage rule 4's second sentence, the row, and the layer-4 walk. If the recorded walk shows a focused link fully hidden even with the usage rule followed, A fails and B (or a new decision) is needed. Any change applies to `stack` (decision 49) and `shell` (decision 48) too.
48. **A sticky shell region over stacked content** (ticket 70 point 1; HIGH impact, MEDIUM confidence; trap quadrant). Option A: follow decision 47. Usage rule 7 as written, the shared row A11Y-22, and the layer-4 Shift+Tab walk asserted with the rule followed and recorded with Yeti's defaults. The writer's record, from [ticket 70](70-spec-shell.md):
   - **Question.** Once the body row has stacked (below about twice `width` plus the gap), a sticky `nav` comes first and sits above `main` while `main` scrolls under it (`[data-sticky]` has `z-index: 2`, `Y/src/layouts/attributes.css:333-342`). A control that focus scrolls into view stops at `--yeti-scroll-padding`, which defaults to the sticky offset (`Y/src/tokens/space.css:56-69`), so Shift+Tab can leave a focused link entirely behind the stuck `nav` (WCAG 2.2 2.4.11). A sticky `aside` comes last and has no later content in the body row to cover (inferred from sticky positioning within its containing block). A sticky region taller than the viewport keeps its own lower content out of reach (1.4.10). A page-top bar that sticks above the whole shell, as in Yeti's starter, raises the same question for every control on the page.
   - **Option A (chosen): follow ticket 65's option A.** Usage rule 7 as written (stick only a region that fits the smallest viewport; where a stuck `nav` sits above stacked content, set `--yeti-scroll-padding` on `:root` to at least its height, or stick only the `aside`), the ledger row ticket 65 proposes, shared by `sidebar`, `stack`, and `shell`, and the layer-4 Shift+Tab walk asserted with the rule followed and recorded with Yeti's defaults. Approved because it is one decision for three items whose sticky CSS is the same always-loaded rule, and it follows decisions 17 and 32.
   - **Option B: a package rule in `@layer ngx-yeti`.** Dismissed for the reason ticket 65 gives: CSS cannot tell when the body row has stacked, because the switch is flex-basis arithmetic with no container query, so a rule that unsticks regions would also remove the feature side by side.
   - **Option C: a shell-only answer that differs from the sidebar's.** Dismissed: the geometry and the rule are the same, and two answers for one rule would confuse consumers who build a shell from a stack and a sidebar (Yeti's docs, "Built from primitives").
   - **Evidence and confidence.** The stacking geometry, the z-index, and the order of `nav` before `main`: read in `shell.css` and `attributes.css` (HIGH). That focus scrolling leaves a link under the stuck region: inferred from the scroll-padding model, not measured (MEDIUM).
   - **To overrule.** Whatever overrules decision 47 applies here unchanged: replace usage rule 7, the section 7 rows for 1.4.10 and 2.4.11, and the layer-4 walk with that decision's text.
49. **A pinned stack child and WCAG 2.4.11** (ticket 66 point 1; MEDIUM impact, MEDIUM confidence). Option (a), revised to cite the shared row: a usage rule that the consumer sets `--yeti-scroll-padding` on `:root` to at least the pinned child's height, and a layer-4 Tab case. No ledger row of the stack's own: the stack shares A11Y-22, owned by `sidebar` (decision 47), because its `sticky` is the same always-loaded rule. Reason: Yeti's own token comment names this use, the [fragment-links](../specs/fragment-links.md) spec already leaves sticky offsets to the consumer (its usage rule 4), and the offset depends on content only the consumer knows.
50. **`fill` on an element that is both a `stack` and an overlay's held child** (ticket 63 point 1; MEDIUM impact, HIGH confidence). As the writer recommended: keep both input names (building-blocks 1.3: input names follow Yeti's), and state the same usage rule in both specs: put the stack inside the held child, never `yetiStack` with `fill` on a filled held child. The [stack](../specs/stack.md) spec carries the mirror rule. Reason: measured in Chromium and Firefox, a `.stack` held child with `data-fill` in a 200 px box was 800 px tall, and a usage rule covers the one case a rename would.

### grid (ticket 59)

51. **An `ol` cell's `start`** (point 1; LOW, HIGH). As the writer recommended, option (i): bind `'[attr.start]': 'null'` on every host, since `start` means nothing on any other element, and a consumer sets an `ol` cell's own first number with `value` on its first `li`.
52. **The grid's manifest `support` list** (point 2; LOW, MEDIUM). The grid joins [upstream-bugs.md](../upstream-bugs.md) row Y8: its list omits container queries (the fold and tracks modes) and subgrid (`data-rows`). Verified *read*, no minimal reproduction, not filed. The package does nothing either way.

### masonry (ticket 62)

53. **The reading-order risk is a ledger row** (point 1; MEDIUM, MEDIUM). As the writer recommended: new row [A11Y-23](../ledger.md), owned by `masonry`, WCAG 2.2 1.3.2 and 2.4.3, "What the package adds": none, usage rules 3 and 4 state the author's responsibility; verified *read*; tested by L1 and L4 (`masonry--order`). The package adds no CSS or code. Part 2 row 12's usage rule now covers both paths (the fallback's column-first order and the native path's steps between tracks) and names the row. Reason: the ledger records every gap found in Yeti, whether or not the package closes it, with A11Y-10b as the author-owned precedent.
54. **Native masonry in building-blocks 1.2's table** (point 2; LOW, HIGH). Added to the column "Yeti guards it in CSS with a stated fallback": native masonry (`grid-template-rows: masonry`, `Y/src/layouts/masonry/masonry.css:29`), with the multi-column fallback, where items read down each column.

### layer (ticket 61)

55. **Contrast over a translucent scrim** (point 1; MEDIUM, MEDIUM). Option (a): composite the scrim's computed colour over pure black and over pure white and assert at least 4.5:1 against both, in the light and dark schemes. Reason: it bounds every picture, needs no image decoding, and holds for any theme.
56. **No focusable control under a later opaque child** (point 2; LOW, HIGH). A usage rule only, with no ledger row and no check (WCAG 2.2 2.4.11). The covered form in the loading-message example is `inert`.
57. **Ledger A11Y-10b's "What Yeti does" cell** (point 3; LOW, HIGH). Rewritten as the writer recommended: Yeti adds a scrim to a `figure`'s caption, and other text over an image is the author's (`layer/manifest.json:72`; `layer.css:24-34`). A docs-inconsistency row, [upstream-bugs.md](../upstream-bugs.md) Y11, records that the manifest's a11y note says the layer adds no scrim while its CSS scrims a `figure`'s direct-child `figcaption`. Verified *read*, not filed. The spec's usage rule 3 is unchanged.

### stack (ticket 66)

Point 1 is decision 49. The `fill` mirror rule is decision 50.

58. **The rule's line under WCAG 1.4.11** (point 2; LOW, MEDIUM). As the writer recommended: the line is decorative ("Purely visual" in the manifest), so no play function asserts a ratio and there is no ledger row.

### sidebar (ticket 65)

Point 1 is decision 47.

### scroller (ticket 64)

59. **Hosts limited to `div` and `section`** (point 1; MEDIUM, MEDIUM). Usage rule 1 as written: the static `role="region"` replaces a list's or table's own role, so the scroller never goes on a `ul`, `ol`, or `table`; a wide table goes inside it as its one child.
60. **The `justify` type's name** (point 2; LOW, HIGH). The named type `YetiScrollerJustify`, declared as `Extract<YetiJustify, 'start' | 'center' | 'end'>` and exported beside the re-exported vocabulary types. The consistency review aligns the [cluster](../specs/cluster.md) spec's inline wording with it.
61. **No other `display`-setting layout on the scroller's element** (point 3; LOW, HIGH). Usage rule 5 as written; `yetiBox` beside it stays allowed.
62. **A 3:1 focus-ring assertion** (point 4; LOW, MEDIUM). `scroller--keyboard` asserts at least 3:1 between the ring and the background behind it with the exact WCAG formula (WCAG 1.4.11; ADR 0015 point 3).

### timeline (ticket 67)

63. **The guide's `li[yetiTimelineEntry]` example** (point 1; LOW, HIGH). Removed from [architecture-guide.md](../architecture-guide.md)'s glossary row for a part directive: at the pin no timeline entry carries a marker, so the directive does not exist.
64. **The rail and the dots under WCAG 1.4.11** (point 2; LOW, MEDIUM). Decorative, as the manifest says: no assertion and no ledger row. Usage rule 7 keeps status and meaning out of the dots.
65. **Another item on an entry** (point 3; LOW, MEDIUM). Usage rule 6 as written: put another item inside the `li`, not on it.
66. **A timeline in a shrink-to-fit parent** (point 4; LOW, MEDIUM). Usage rule 8 as written, plus one layer-4 measurement in three engines, a timeline inside a `cluster`, to confirm the collapse.

### overlay (ticket 63)

Point 1 is decision 50.

67. **Yeti's docs veil is as tall as the viewport** (point 2; LOW, HIGH). A Yeti row, [upstream-bugs.md](../upstream-bugs.md) Y10: the veil in `Y/src/layouts/overlay/docs.md` takes `.cover`'s `min-block-size: var(--yeti-cover-height)`, `100dvh` by default, so it is 800 px tall over a 76 px form at an 800 px viewport. Verified *measured* (Chromium and Firefox); the minimal reproduction is the docs snippet itself; no upstream report unless the user confirms one. The spec's veil example already sets `--yeti-cover-height: auto`.

### setup (ticket 38)

Point 1 is decision 45. Points 2 to 7 are decided as the writer recommended:

68. **The accessibility stylesheet's specifier** (point 2; MEDIUM, MEDIUM). `@import 'ngx-yeti/accessibility.css';`, published through the package's `exports` map.
69. **No generator in the first milestone** (point 3; MEDIUM, MEDIUM). The documentation is the setup; an Nx generator, reused as `ng add`, is for a later milestone.
70. **The Tailwind form** (point 4; MEDIUM, MEDIUM). The documentation leads with C2 (no preflight) and documents C1 beside it with its two measured losses and no fix. Layer 4 tests both under a second build configuration of the one fixture app, with a check that the `ngx-yeti` cascade layer keeps its place.
71. **Stray and leaked item links around a consumer `@boundary`** (point 5; LOW, MEDIUM). Documented, no change.
72. **Upstream bug A4** (point 6; MEDIUM, LOW). The documentation describes the bug and the `inlineCritical: false` option without recommending either setting; layer 4 counts the token-less frames in each engine with inlining on and off.
73. **What `provideYetiStyles({ url })` accepts** (point 7; LOW, MEDIUM). A path relative to `<base href>` only; an absolute URL is not supported or tested.

### hero (ticket 68)

74. **Y9 gains the hero's rows** (point 1; LOW, HIGH). [upstream-bugs.md](../upstream-bugs.md) row Y9 now also records that the committed guide's `data-min` row lists only `grid, masonry` and its `data-span` row only `columns (> *)` with values `1` to `6`, while the generated guide lists `hero (> *)` in both and `span`'s twelve values. No upstream report.
75. **`NgOptimizedImage` on a direct child** (point 2; MEDIUM, MEDIUM). Usage rule 11 as written: a direct `img` child takes `width` and `height` with the image's ratio equal to the hero's `ratio`; where they must differ, wrap it and use decision 35's form (`fill` plus `position: relative` on the wrapper); never `fill` on a direct child; `priority` on the opening picture. The `hero--optimized-image` story records both forms' console output. If the direct form warns anyway, the rule becomes "expect the development-mode warning when the ratios differ".
76. **The caption's contrast assertion** (point 3; LOW, MEDIUM). Kept in `hero--caption` at 4.5:1 in light and dark (decision 8): it costs one helper call and catches a pin move that lowers the muted token's contrast.

### badge (ticket 74)

77. **The badge's hosts** (point 1; LOW, MEDIUM). Usage rule 1 as written: a non-interactive inline element (`span`, `strong`, `em`, `small`, `mark`, `data`, or `time`), never a link, a button, or a form control. HTML `size` is `inert` on every one of them.
78. **Forced colours** (point 2; LOW, MEDIUM). No ledger row and no package CSS, after decisions 26 and 30. Layer 4 asserts the text's contrast under `forcedColors: 'active'` and records the border's computed colour and a screenshot in three engines.

### media (ticket 69)

79. **Ledger A11Y-10d's "What Yeti does" cell** (point 1; LOW, HIGH). Rewritten as the writer recommended, like decisions 23 and 24: text beside a cropped picture on the page surface; axe left `color-contrast` incomplete on the example's heading as partially obscured, cause not traced.
80. **`NgOptimizedImage` for the figure** (point 2; MEDIUM, MEDIUM). Usage rule 6 as written: a direct-child `img` takes `width` and `height` from the image file and never `fill`; a wrapped figure uses decision 35's form, `fill` plus `position: relative` on the wrapper.
81. **`side` against WCAG 1.3.2 and 2.4.3** (point 3; MEDIUM, MEDIUM). Usage rule 4 as written (the author puts the figure where it is read), no ledger row and no package code. Test layer 1 keeps its assertions that tree order equals DOM order and that a focusable figure keeps its source place in the Tab sequence.
82. **No `yetiFrame` or `yetiStack` on the media's own children** (point 4; LOW, MEDIUM). Usage rule 8 as written, pointing to the composed form; `yetiBox` on the body stays allowed.

### affix (ticket 72)

Point 1 is decision 46.

### shell (ticket 70)

Point 1 is decision 48. Points 2 to 5 are decided as the writer recommended:

83. **Where `yetiShell` goes** (point 2; MEDIUM, HIGH). Option (a): the outermost `div` of the root component's template. Yeti's reset zeroes `body`'s margin, so that host matches `body.shell`.
84. **The `router-outlet` inside `main`** (point 3; MEDIUM, MEDIUM). Usage rule 3 as written, and the layer-4 variant fixture that measures the outlet as a direct body-row child.
85. **The skip link in `index.html`** (point 4; MEDIUM, HIGH). Usage rule 5 as written: the skip link is `body`'s first child in `index.html`, pointing at an `id` on `main`, because Yeti's skip-link rule matches only `body > a[href^="#"]:first-child`. The [setup](../specs/setup.md) spec's skip-link example carries the same note.
86. **The `center` and `shell` order in two other specs** (point 5; LOW, HIGH). Corrected: Yeti's order keeps a center centred inside a `stack`, but a center placed directly in a `shell` has 0 margins in Yeti's order (ticket 23, measured), as in full Yeti. The [center](../specs/center.md) spec's user story 11 and section 13 and the [setup](../specs/setup.md) spec's "The loader's behaviour" item 5 now say so. No package CSS: the package reproduces Yeti, and the shell spec's usage rule 9 puts a center inside `main`.

### breadcrumbs (ticket 75)

87. **Which `aria-current` form the examples lead with** (point 1; MEDIUM, MEDIUM). Form (a), the consumer's binding on the last step from the trail's data. Form (b), `RouterLinkActive` with exact matching, is documented beside it, and layer 3 checks that its attribute is in the server HTML. If that check fails, form (b) becomes a client-rendered-only usage rule and leaves the JavaScript-off e2e case.
88. **Forced colours and the current step** (point 2; LOW, MEDIUM). No ledger row and no package CSS now; layer 4 asserts that the weight difference survives `forcedColors: 'active'`. If it fails, a ledger row owned by `breadcrumbs` and one `@layer ngx-yeti` rule follow, after A11Y-1f.
89. **The separator** (point 3; LOW, MEDIUM). Decoration: no contrast assertion.
90. **A `routerLink` step inside `hydrate never`** (point 4; MEDIUM, LOW). Usage rule 10 as written, and layer 4 records what a click does. If the click is held and never replayed, usage rule 10 extends to plain `href` links without `routerLink` inside `hydrate never`.

### Applied

- [ledger.md](../ledger.md): new A11Y-22 (decisions 47 to 49) and A11Y-23 (decision 53); A11Y-10b (decision 57) and A11Y-10d (decision 79) rewritten.
- [upstream-bugs.md](../upstream-bugs.md): Y8 gains the grid (decision 52); Y9 gains the hero's `data-min` and `data-span` (decision 74); new Y10 (decision 67) and Y11 (decision 57).
- [building-blocks.md](../building-blocks.md): 1.2's table (decision 54); Part 2 row 12 (decision 53), and rows 15, 16, and 20 name A11Y-22 (decisions 47 to 49).
- [architecture-guide.md](../architecture-guide.md): the `li[yetiTimelineEntry]` example removed (decision 63).
- [specs/center.md](../specs/center.md) user story 11 and section 13, and [specs/setup.md](../specs/setup.md) "The loader's behaviour" item 5 (decision 86); the setup spec's skip-link example (decision 85).
- The specs for grid, masonry, layer, stack, sidebar, scroller, timeline, overlay, hero, media, shell, setup, badge, affix, and breadcrumbs: every "(open: see ticket)" mark replaced by its decision. Their tickets mark each open point decided.
