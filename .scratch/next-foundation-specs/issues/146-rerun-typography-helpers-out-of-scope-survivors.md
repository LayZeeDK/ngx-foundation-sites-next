# 146. Re-run: Typography Helpers spec, out-of-scope survivors

Type: grilling
Status: resolved
Blocked by: none
Labels: wayfinder:grilling
Map: ../map.md

## Question

[Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) upheld out-of-scope survivors for the [Spec: Typography Helpers](106-spec-typography-helpers.md). What does the spec become with them, under the class rule (ADR 0039), the architecture guide, and ADR 0045 (a changed default after the first release waits for an Angular major, so defaults are settled now)?

## How to work it

Revise `specs/typography-helpers.md` in place and append a dated `### Amendment, 2026-09-28 (out-of-scope survivors)` to the [Spec: Typography Helpers](106-spec-typography-helpers.md) ticket. The items, evidence, and every point this re-run must decide are in that triage ticket's Answer, section "Survivors: proposed re-run tickets", item 1; read it in full, with `research/out-of-scope-triage-2.md` and the three lens files it cites. It also edits the one bullet each named there in `specs/callout.md` and `specs/card.md`, and confirms or amends the triage's shared-file proposals for the blockquote check (the map's base-styles line, building-blocks, and the Storybook override) with quoted text. Measure what the triage marks as unmeasured before deciding it. Run `/grill-with-docs` (self-grilling, both sides) and publish with `/to-spec`. Every item you keep or add in Out of Scope carries a reason and a category from `research/out-of-scope-exclusions.md`.

## Answer

Resolved 2026-09-28 (Opus 5.5, AFK: both sides of the grilling played against the sources). Spec revised in place: [specs/typography-helpers.md](../specs/typography-helpers.md). Amendment: [Spec: Typography Helpers](106-spec-typography-helpers.md), "Amendment, 2026-09-28 (out-of-scope survivors)". Bullets edited: `specs/callout.md` (Out of Scope, typography colours inside callouts) and `specs/card.md` (Out of Scope, typography colours other than the card's own).

Sources read: the [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md) Answer (Decisions 1 and 2, the survivors' item 1, the folded-in texts, and the shared-file proposals); `research/out-of-scope-triage-2.md` (sections 2, 3.1, 3.2, 7); the three lenses (`research/out-of-scope-lens-2-api.md`, `-scope.md`, `-a11y.md`); `research/out-of-scope-exclusions.md` (the categories); the spec and its ticket with the print re-run's amendment; the Callout spec (D7, D8, Out of Scope) and the Card spec (D8, D9, Out of Scope); the Table spec's eight backgrounds (its 1.4.3 row and D11); the Off-canvas and Top Bar specs' required `$white`; ADR 0012, ADR 0022 (with its dated notes), ADR 0039, ADR 0045; the architecture guide's P17, P18, and P26; building-blocks 1.10 and Table D; the map's accessibility preference, triage rule, and base-styles line; `storybook-conventions.md` section 5; Foundation 6.9.0's `scss/typography/_base.scss` (the `blockquote` rule prints `$blockquote-color` on the `blockquote` and its `p`; `cite` and `code` extend the helpers' placeholders, so their colours are printed by `foundation-typography-helpers`), `_helpers.scss`, `scss/components/_callout.scss`, `_card.scss`, `_table.scss`, `_title-bar.scss`, `_tooltip.scss`, and `scss/settings/_settings.scss`.

### Measurements

Dart Sass 1.104.1 over the Foundation 6.9.0 clone with `foundation-everything`; Playwright 1.63.0 with Chromium 153, Firefox 155, and WebKit 26.6; axe-core 4.13.0 (`color-contrast`); a 1100 px page with the greys (a heading `small`, a `p.subheader`, a `cite`, and a `blockquote` holding a `p` and a `cite`) on the page, in a callout of each palette colour and without one, in a card divider and section, and in a `table.hover`'s head, odd and even body rows, and footer, each row also run under the pointer; ratios by the exact WCAG formula over the computed colours. Scripts under `D:/tmp/nfs-wave-146/`, not committed. The three engines agree on every value.

- The claim the triage left unmeasured for input-1 holds: with the three greys the spec required (`#737373`) and `$blockquote-color` at Foundation's `$dark-gray`, axe fails the blockquote's text on the page (3.42) in all three engines. Blockquote text is 16 px, body size, so 4.5:1 applies.
- The greys' backgrounds, as rendered: the page `#fefefe`; a callout without a colour `#ffffff`; the tints primary `#d7ecfa`, secondary `#eaeaea`, success `#e1faea`, warning `#fff3d9`, alert `#f7e4e1`; the card divider `#e6e6e6`; the table head `#f8f8f8` (`#f3f3f3` under the pointer), a plain row under the pointer `#f9f9f9`, stripes and footer `#f1f1f1` (`#ececec` under the pointer); the title bar and tooltip `#0a0a0a`. The accordion content, tabs panels, Reveal, and dropdown pane are `#fefefe`, and the Off-canvas and Top Bar specs require `$white`.
- `#737373` on those light backgrounds: 4.742 (plain callout), 3.899, 3.941, 4.304, 4.307, 3.870 (tints), 3.799 (card divider), 4.465 and 4.273 (head), 4.504 (plain row under the pointer), 4.198 and 4.014 (stripes and footer). axe fails the 10 under 4.5:1 in three engines. The triage's list matched every at-rest value but left out the hover states, where the stripes and footer drop to 4.014:1.
- `#666666` on the same backgrounds: 5.693 (page), 5.742, 4.721, 4.773, 5.212, 5.215, 4.686, 4.601 (card divider, the lowest), 5.407, 5.175, 5.454, 5.084, 4.860. axe reports nothing on any of the 13 light backgrounds, at rest or under the pointer, in three engines. It fails only the title bar (3.448:1).
- Candidates: `#676767` is the lightest grey step at 4.5:1 on `#e6e6e6` (4.532:1); `#797979` is the darkest at 4.5:1 on `#0a0a0a` (4.548:1); Foundation's `$dark-gray` is 5.735:1 there. No grey passes both `#e6e6e6` and `#0a0a0a`.
- The other colours `foundation-typography-base` prints, on Foundation's defaults: `$anchor-color` 4.647:1 on the page, `$keystroke-color` on `$keystroke-background` 15.863:1, `$header-color` `inherit`.

### Grilling record

Round 1 (the check; the class rule, the Variant rules, and ADR 0045 taken as decided):

1. Does `$blockquote-color` get a check at all? For: the map's accessibility preference and P17 never leave a failing Foundation default as advice; ADR 0012 pairs a Library mixin with the export mixin, and `foundation-typography-base` prints the `blockquote` rule; ADR 0045 makes a new compile stop after the first release an Angular-major change. Against: base element styles are out of scope, with no class. Resolved: the map's reason rules out a directive, not a check (the triage's Decision 1); a check, no directive.
2. Its shape? One `@error` in `nfs-typography-base` listing every failing pair, as `nfs-typography-helpers` and the other Library mixins do, through the library's exact helper (translucent colours composited, unrounded).
3. Its threshold? 4.5:1 whatever the size: the text is body size, and D9 already rejects 3:1 because the greys sit on any element.
4. Should the check cover every colour `foundation-typography-base` prints, links, `kbd`, and a `$header-color` that is not `inherit`? For: D9 checks `$code-color`, which passes on Foundation's defaults; ADR 0045 fixes the timing, so a check not added now waits for an Angular major. Against: `$code-color` is the colour of this spec's own classes, while base element styles stay out except where a colour fails on Foundation's defaults (the map's line as the triage words it); these colours pass there; axe `color-contrast` reports a failing link or `kbd` wherever one renders; P17 asks for a compile-time check where axe has no rule. Resolved: not checked; D9's rejected alternatives record it (`scope-boundary`).
5. The blockquote's 1 px `$medium-gray` side border (1.625:1)? Out: 1.4.11 covers visual information needed to identify a component or state, and a quotation is identified by the element and its indented text (the triage; `platform-or-a11y`).

Round 2 (greys on containers; hangs on round 1):

6. Where does the requirement live? The 1.4.3 row states it, the Sass subsection carries the ratio table, and D23 records the decision, following ADR 0022's dated note (a requirement on content the directives cannot read is stated, shown, and asserted).
7. Which backgrounds? The 13 light ones measured above, hover states included, which the triage's list lacked because the Table spec keeps `hover` and checks all eight of its backgrounds. Every other container the specs keep is white.
8. Which grey on Foundation's defaults, `#737373` (the triage's starting text) or `#666666`? For `#737373`: it is closer to Foundation's lighter look, it is the page minimum (4.701:1), and it is the grey the Forms and Breadcrumbs specs require for their own settings. For `#666666`: `#737373` fails 10 of the 13 light container backgrounds, so the spec's own required settings would break the requirement it states wherever a subheader, citation, quotation, or heading `small` sits in a callout, a card divider, or a table; the bundle already picks one site-wide value that holds on every container for the link colour (the Callout's D8, the Card's D9, the Table's D11) instead of the page minimum; and only with `#666666` in the Storybook overrides can a story assert the requirement without an axe failure. `#676767` would pass with 0.032 to spare; `#666666` keeps a margin and is the grey the triage named. Resolved: `#666666` for all four greys. The compile threshold does not change, so a consumer who keeps `#737373` still compiles and owns the container requirement. This amends the triage's starting text, which named `#737373` as required.
9. Shown and asserted where? `typography-helpers--composition` puts the greys on the two lowest ratios, a card divider (4.601:1) and an alert callout (4.686:1), under axe, with computed-colour assertions; the recipe is the required-settings block of the Sass subsection. The triage asked whether a recipe or `--composition` should show it; both do.
10. A container check? No: the triage rules out a `@warn` or `@error` in `nfs-callout`, `nfs-card`, and `nfs-table`, and one in this spec's mixins would stop builds for greys a site never puts in a container, since a mixin cannot tell which containers a site uses; axe has the rule (P17). D23 records both (`other`).
11. Dark containers? A title bar or tooltip (`#0a0a0a`) needs `#797979` or lighter; no one grey serves both kinds; because the settings colour the greys everywhere, a grey there is the consumer's own rule on its own content. Stated in the 1.4.3 row and the Sass subsection.

Round 3 (text, tests, shared files):

12. The Callout and Card bullets: each says the greys are the Typography Helpers' concern, checked on the page only, required to reach 4.5:1 on the container too, and set to `#666666`, which does (4.686:1 on the alert tint, 4.601:1 on the divider); each keeps its container's own check (Callout D7, Card D8); both carry `scope-boundary`.
13. Tests: the compile cases name `$blockquote-color` (alone, and with the heading `small`); `#737373` compiles too, which documents that the check reads the page only; the `--code-and-citations` and `--print-breaks` play functions assert the blockquote's colour; `--composition` asserts the containers.
14. The shared-file proposals: the map line and Table D row are confirmed as the triage words them; the building-blocks 1.10 bullet and the Storybook block are amended for `#666666`; the Storybook include comment is confirmed.
15. ADR or glossary? Neither: the check and the requirement are reversible library Sass and spec text, and the rule that brings a failing base element colour into a check is the map's line. No new term.

The frontier is empty.

### Decisions

1. **The blockquote check.** Checks-only `nfs-typography-base` stops the compile with one `@error` listing every pair under 4.5:1, `$header-small-font-color` and `$blockquote-color` against `$body-background`, by the library's exact helper, unrounded, at 4.5:1 whatever the size; it emits no CSS, and no directive is added (spec D9, Sass rule 1(b), the 1.4.3 row).
2. **Not checked:** the other colours `foundation-typography-base` prints (`$anchor-color` and its hover colour on the page, `$keystroke-color`, a set `$header-color`), which pass on Foundation's defaults (`scope-boundary`, D9); the blockquote's side border (`platform-or-a11y`, Out of Scope).
3. **Required settings on Foundation's defaults:** the four greys at `#666666`, amending the triage's `#737373`:

   ```scss
   // #666666 is 5.693:1 on the page and at least 4.601:1 on every light container background (D23)
   $subheader-color: #666666; // nfs-typography-helpers: $dark-gray is 3.423:1 on $body-background
   $cite-color: #666666; // nfs-typography-helpers: also the look of every cite element
   $header-small-font-color: #666666; // nfs-typography-base: $medium-gray is 1.625:1
   $blockquote-color: #666666; // nfs-typography-base: $dark-gray is 3.423:1 on $body-background
   ```

4. **Greys on container backgrounds** (spec D23): a stated 1.4.3 requirement with no compile check. The Sass subsection's table gives `#737373` and `#666666` on every light container background, hover states included; `#666666` passes all 13; a dark container needs `#797979` or lighter in the consumer's own rule; any other pair is axe's to report. Rejected, each with its category in D23: `#737373` with `#666666` named for containers (`platform-or-a11y`), a `@warn` or `@error` in the container mixins (`other`), container checks in this spec's mixins (`other`), and one grey for light and dark containers (`platform-or-a11y`).
5. **Shown and asserted:** `typography-helpers--composition` (card divider, alert callout); the blockquote colour in `--code-and-citations` and `--print-breaks`; the compile tests.
6. **Out of Scope:** the base-styles bullet now says base element styles get no directive and that `nfs-typography-base` checks the two base colours that fail on Foundation's defaults (`scope-boundary`); the side-border bullet is new (`platform-or-a11y`).
7. **Callout and Card bullets** rewritten to point to the requirement (below, as edited).
8. No ADR, no glossary term, no prototype.

The Callout bullet, as edited:

> - Checks of typography colours inside callouts: headings take the callout's checked text colour (`$header-color: inherit`), and the greys of a heading `small`, a subheader, a `cite`, or a `blockquote` are the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s, checked on the page only; that spec requires them to reach 4.5:1 on a callout's tint too and sets them to `#666666` on Foundation's defaults, which does (4.686:1 at worst, on the alert tint), while `nfs-callout` checks what Foundation's callout markup puts on its backgrounds (D7). The Card, Media Object, and other containers with their own docs pages belong to their own specs. Category: `scope-boundary`.

The Card bullet, as edited:

> - Checks of typography colours other than the card's own text and link colours: `$header-color` inherits the card's text colour, and the greys of a heading `small`, a subheader, a `cite`, or a `blockquote` are the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s, checked on the page only; that spec requires them to reach 4.5:1 on the card divider (`$card-divider-background`, `$light-gray`) too and sets them to `#666666` on Foundation's defaults, which does (4.601:1), while `nfs-card` checks what Foundation's card markup puts on its backgrounds (D8). Category: `scope-boundary`.

### Triage

Under the map's quadrant:

| Item | Impact | Confidence | Outcome |
| --- | --- | --- | --- |
| 1. The `$blockquote-color` check | MEDIUM: a new compile stop on Foundation's defaults; after the first release it waits for an Angular major (ADR 0045) | HIGH: measured failing in three engines; the mixin and its check shape exist; the triage's Decision 1, with every lens agreeing | Decided |
| 2. No check for links, `kbd`, or a set heading colour | MEDIUM: declining a check now means adding it waits for an Angular major | HIGH: the map's base-styles line as the triage words it brings in only colours that fail on the defaults, and these pass (4.647:1, 15.863:1); axe has the rule (P17) | Decided |
| 3. `#666666` in place of `#737373` | LOW: a documented value and a Storybook override; the check's threshold does not change, so no build that compiles today stops, and the value can change later without breaking one | HIGH: measured on 13 backgrounds in three engines; the link-colour precedent of the Callout, Card, and Table; ADR 0022's dated note | Decided; it amends the triage's starting text |
| 4. The container requirement with no check | LOW: spec text | HIGH: the triage's Decision 2, re-measured with hover states | Decided |
| 5. Tests and the side border | LOW | HIGH | Decided |

Nothing is OPEN FOR HUMAN. No prototype is needed: every open measurement (T2 section 7, input-1, callout-7, card-7) was taken.

### Proposed shared-file changes (for the orchestrator)

1. `map.md`, Out of scope, the base-styles line (`:311`): confirmed as the triage words it. After "a spec that relies on a base element style documents it" insert:

   > ; where a colour those rules print fails WCAG 2.2 AA on Foundation's defaults, the Library mixin of the export mixin that prints it checks it (`nfs-typography-base` for `$header-small-font-color` and `$blockquote-color`, [Triage: out-of-scope items across the specs](issues/138-triage-out-of-scope-across-specs.md))

2. `building-blocks.md` 1.10, the Typography Helpers bullet (`:186`): amended from the triage's text for `#666666`. Replace "Foundation's `$dark-gray` subheaders and citations are 3.423:1 and its `$medium-gray` heading `small` text 1.625:1 on the page, which axe fails in three engines, so `nfs-typography-helpers` stops the compile when `$subheader-color` or `$cite-color` is under 4.5:1 against `$body-background` or `$code-color` under 4.5:1 against `$code-background`, and checks-only `nfs-typography-base` does when `$header-small-font-color` is under 4.5:1; the consumer must set all three to `#737373` (4.701:1) on Foundation's defaults, mirrored in the Storybook settings overrides." with:

   > Foundation's `$dark-gray` subheaders, citations, and blockquote text are 3.423:1 and its `$medium-gray` heading `small` text 1.625:1 on the page, which axe fails in three engines, so `nfs-typography-helpers` stops the compile when `$subheader-color` or `$cite-color` is under 4.5:1 against `$body-background` or `$code-color` under 4.5:1 against `$code-background`, and checks-only `nfs-typography-base` does when `$header-small-font-color` or `$blockquote-color` is under 4.5:1 against `$body-background`; the consumer must set all four greys to `#666666` (5.693:1) on Foundation's defaults, mirrored in the Storybook settings overrides. The greys are checked on the page only; inside a container they need 4.5:1 on its background as well, which `#666666` gives on every light container background the specs keep (4.601:1 at worst, on a card divider, where `#737373` is 3.799:1), a requirement the spec states.

3. `building-blocks.md`, Table D, the Typography Helpers row (`:369`): confirmed. Replace "(one `@error` over heading `small` contrast)" with "(one `@error` over heading `small` and `blockquote` text contrast)".

4. `storybook-conventions.md` section 5, `preview.scss` (`:128`): confirmed. Replace the comment "// Typography Helpers: the heading small-text contrast check" with "// Typography Helpers: the heading small-text and blockquote contrast checks".

5. `storybook-conventions.md` section 5, `_settings-overrides.scss` (`:244` to `:250`): amended from the triage's added block. Replace the block from "// color-contrast (1.4.3): Foundation's $dark-gray subheaders and citations" through "$header-small-font-color: #737373;" with:

   ```scss
     // color-contrast (1.4.3): Foundation's $dark-gray subheaders, citations, and blockquote text are 3.423:1 and its
     // $medium-gray heading small text 1.625:1 on the page (axe fails them in three engines), and nfs-typography-helpers
     // and nfs-typography-base stop the compile. #666666, not the page's minimum #737373, because the greys must also
     // reach 4.5:1 inside callouts, card dividers, and table rows (4.601:1 at worst). Spec: Typography Helpers,
     // typography-helpers--subheader, --code-and-citations, --typescale, --composition, and --print-breaks; also every
     // story with a cite, a blockquote, or a small inside a heading.
     $subheader-color: #666666;
     $cite-color: #666666;
     $header-small-font-color: #666666;
     $blockquote-color: #666666;
   ```

6. [Spec: Callout](89-spec-callout.md) and [Spec: Card](90-spec-card.md) tickets, one dated note each, as the triage's fixer adds them to other tickets:

   > ### Note, 2026-09-28 (out-of-scope survivors)
   >
   > - 2026-09-28: the Out of Scope bullet on typography colours is corrected by [Re-run: Typography Helpers spec, out-of-scope survivors](146-rerun-typography-helpers-out-of-scope-survivors.md), from [Triage: out-of-scope items across the specs](138-triage-out-of-scope-across-specs.md): the greys inside the container are the Typography Helpers' requirement, met by the `#666666` it requires.

7. `map.md`, Decisions so far: the gist below. The [Spec: Typography Helpers](106-spec-typography-helpers.md) line there still says "three colours are required (`#737373`)"; the new line supersedes it, and the orchestrator may append "(four at `#666666` since [Re-run: Typography Helpers spec, out-of-scope survivors](issues/146-rerun-typography-helpers-out-of-scope-survivors.md))" to it.

No `CONTEXT.md` term and no ADR.

### What other specs need from this one

- The Callout and the Card: their bullets are edited here; their checks (Callout D7, Card D8) and required settings are unchanged.
- The Table: nothing. Its Out of Scope has no typography-colour bullet, and the requirement's table lists its eight backgrounds.
- The Forms and the Breadcrumbs keep `#737373` for their own settings (`$input-placeholder-color` on the field, `$breadcrumbs-item-color-disabled` on the page), which sit on no tinted container; the Storybook overrides carry both greys.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): when it rechecks quoted ratios, the typography greys are `#666666` (5.693:1 on the page), not `#737373`.

### Gist for Decisions so far

- [Re-run: Typography Helpers spec, out-of-scope survivors](issues/146-rerun-typography-helpers-out-of-scope-survivors.md) -- checks-only `nfs-typography-base` also stops the compile on `$blockquote-color` (`$dark-gray`, 3.423:1 on the page, failing axe in three engines), with no directive, while the other colours of `foundation-typography-base` pass on the defaults and stay unchecked; the four greys are required at `#666666`, not `#737373`, because `#737373` fails 10 of the 13 light container backgrounds the specs keep (3.799:1 on a card divider, 4.014:1 on a hovered table stripe) and `#666666` passes all 13 (4.601:1 at worst), measured in three engines; the spec states the greys-on-containers requirement with no container check, and `--composition` asserts it; the blockquote's side border stays out (1.4.11); the Callout and Card bullets point to the requirement; impact MEDIUM, confidence HIGH; no ADR. Spec: [specs/typography-helpers.md](specs/typography-helpers.md).

### Note, 2026-09-29 (architecture audit)

- 2026-09-29: the fixer items of [Audit: the specs against the architecture guide](142-audit-specs-against-architecture-guide.md) are applied to the spec.

### Amendment, 2026-09-29 (consistency review)

From [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), phase 2 (group f), applying the coordinator's decisions ([research/consistency-review-decisions.md](../research/consistency-review-decisions.md)) and the review's checks CR-A to CR-D; `specs/typography-helpers.md` was revised in place. The evidence for each change is in [research/consistency-review-group-f.md](../research/consistency-review-group-f.md).

- No decided item changes the spec.
- The Sass subsection's contrast check names Foundation's `color-luminance()` and `color-contrast()` as not used, beside the exact helper it already named (the review's R4, S1 or its equivalent).
- CR-C: D4's "the published placeholders already use `nfsTextAlign`" states the fact: the Forms, Pagination, Flexbox Utilities, Float Classes, and Prototyping Utilities specs write `nfsTextAlign`.
- CR-B: a table of the other families' classes the examples and stories use (Pagination, XY Grid, Card, Callout).
- Unchanged: R4 (figures), R9/R23, R39, R59, R71/R72, R73; CR-A, CR-D; the In-family line.
- Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-29 (exportAs on every directive)

- [Decide: an exportAs on every directive](156-decide-exportas-on-every-directive.md): `NfsTextAlignment`, `NfsTypographyHelpers`, `NfsNoBullet`, `NfsTypographyBase`, and `NfsPrintStyles` each gain an `exportAs` for the first time, each its class name with a lowercase first letter; D17 no longer lists `exportAs` among what the family lacks.

### Amendment, 2026-09-29 (checks move to a later milestone)

From [Re-run: specs without checks, group f](170-rerun-specs-without-checks-group-f.md), under [Decide: checks move to a later milestone](158-decide-checks-move-to-a-later-milestone.md); `specs/typography-helpers.md` was revised in place. What left the spec, per check:

- Forgotten-import checks, to [Re-run: forgotten-import checks spec for the later milestone](164-rerun-forgotten-import-checks-later-milestone.md): the In-family line of the five directives, and the Notes' `strictDirectiveImports` and static-check sentence. An "Imports (documented usage)" bullet says what a forgotten import does.
- Misuse warnings, to [Spec: misuse warnings (later milestone)](161-spec-misuse-warnings-later-milestone.md): check 1 (copied classes) with its development-only `HostAttributeToken('class')` and `ElementRef` reads, and check 2 (an unreachable or unnamed code block), with their browser-level cases.
- Runtime checks, to [Spec: Runtime checks (later milestone)](162-spec-runtime-checks-later-milestone.md): `NfsTextAlignment`'s `nfsVariantCheck('nfsTextAlign')` with its requests and browser-level cases (D15 rewritten to the Variant property the types come from).
- Build-time checks, to [Spec: build-time checks (later milestone)](163-spec-build-time-checks-later-milestone.md): the `@error` of `nfs-typography-helpers` (subheader, citation, and code colours) and all of `nfs-typography-base` (heading `small` and blockquote colours), with their Sass compile cases. `nfs-typography-base` held only checks, so the first milestone has no such mixin (ADR 0012); `nfs-typography-helpers` keeps its grid margin rules. The four greys and the code colour are required settings (D9, D23 rewritten; the Sass subsection, the 1.4.3 row, and the Out of Scope base-styles line).
- Each other rule is documented usage now: two numbered rules in the API (classes through their attributes; the code block's Scroll region recipe), user stories 5, 21, 22, 27, 28, 29, and 33, and D10, D12, D14, D21, and D22.
- Unchanged: every attribute, class, recipe, and measurement. Impact LOW, confidence HIGH; nothing OPEN FOR HUMAN.

### Amendment, 2026-09-30 (later-milestone families)

From [Re-run: grid, typography, and utility specs for the later milestone](175-rerun-grid-typography-utility-specs-later-milestone.md), under [Decide: grids, typography, and utilities move to a later milestone](174-decide-grids-typography-utilities-later-milestone.md): `specs/typography-helpers.md` is marked as a later-milestone spec; its design is unchanged.

- A `Milestone: later` line under the Ticket line, and a closing Problem Statement paragraph: the spec is planned and implemented in a later milestone of the implementing repository, because the user ruled on 2026-09-30 that the grids, Typography Helpers, and the Utilities leave the first milestone to make it simpler and more minimal, each a whole and separate spec; until then a consumer, and the library's own stories, write Foundation's Typography Helpers classes as normal classes with Foundation's global styles loaded, and no first-milestone spec assumes the spec, names its directives, or links to it.
- Restated: the Problem Statement's `.no-bullet` bullet no longer counts the Card among the specs that leave list markers to this spec (the Card's list of cards gets `nfsNoBullet` when the spec lands), and D4's rationale no longer says the Forms and Pagination specs write `nfsTextAlign` (they get it back then).
- Added: Further Notes, What the later milestone changes, per spec: per first-milestone spec, the Typography Helpers classes it writes in the first milestone and the directives that replace them, read from the directives each spec wrote before the ruling.
- No directive, input, class, ARIA row, story, or test changes. Impact LOW, confidence HIGH (a user ruling applied); nothing OPEN FOR HUMAN.
