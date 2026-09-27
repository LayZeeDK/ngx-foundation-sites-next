# 85. Spec: Menu

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

What Angular directives (preferred) or components give Foundation for Sites 6.9's Menu to the next, from-scratch ngx-foundation-sites repo, under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? Foundation's docs page is `docs/pages/menu.md` and its Sass is `scss/components/_menu.scss, components/_menu-icon.scss` in the 6.9.0 clone. Publish `specs/menu.md`.

Known from the triage: The plugin menus (Accordion Menu, Dropdown Menu, Drilldown, Responsive Menu, and the Nested menu roots) must bind `.menu` too under the class rule: say how they relate to this directive (hosting it as a host directive, or binding the class themselves), and how a current-page item is marked without a consumer-written `.is-active`.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides) over the questions this component raises, then publish with `/to-spec` in the map's spec shape; the [Spec: Button](37-spec-button.md) is the nearest precedent. Read first: ADR 0039; the answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (how a Variant input is typed, including over open Sass maps); `research/out-of-scope-triage.md` (every row and dissent that names this component); `research/foundation-component-catalogue.md` and `research/out-of-scope-exclusions.md` (its rows and ids); `map.md` Notes (standing preferences, target platform, spec shape, rendering modes, the triage rule, the Out-of-scope triage note); `building-blocks.md`; `CONTEXT.md`; ADR 0001, ADR 0012, and ADR 0022. Cover: one directive per Structural class and what else each owns (the ARIA, `type` default, or development and compile-time checks the documented markup lacks for WCAG 2.2 AA, ADR 0022); every Variant as a typed input by the decision above; State classes as host bindings; the Sass mixin only where custom CSS or checks are needed (ADR 0012); the rendering-mode contract; stories with play functions and axe; e2e only where Storybook cannot reach. Record the decisions in this ticket's Answer, and propose shared-file changes (a building-blocks row, glossary terms) for the orchestrator. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Resolved 2026-09-27, AFK under the map's override: self-grilled on both sides against Foundation 6.9.0's menu docs page and Sass, the Angular 22.2.x source, the Angular Material 22.2.x source, ADR 0039, ADR 0040, building-blocks 1.4 (including the initial-state rule the Accordion re-run added in commit `46b7d0a`), and the published menu specs, with two measured probes. Spec: [specs/menu.md](../specs/menu.md).

### Grilling record

Round 1 (the frontier: prerequisites all settled by ADR 0039 and ADR 0040):
- Q1. Which Structural classes, and which directives bind them? `.menu` (`ul[nfsMenu]`) and `.menu-text` (`li[nfsMenuText]`). `.menu-centered` is a deprecated back-compatibility wrapper absent from the docs page (no directive); `.menu-icon` is shown on the Top Bar page (the [Spec: Top Bar](86-spec-top-bar.md) owns it, as that ticket already says).
- Q2. Component or directive? Directives: nothing is generated (ADR 0001).
- Q3. Implementation level? Native platform. Aria's `ngMenuBar`, `ngMenu`, and `ngToolbar` apply roles the APG rejects for site navigation (ADR 0004); CDK has nothing to do.
- Q4. How is the current page marked without a consumer-written `.is-active`? Options argued: (a) a `current` input on an item directive binding `.is-active`; (b) a link directive with Material's `activated` input (class plus `aria-current`, `MatListItem`'s shape); (c) `routerLinkActive="is-active"` (a Foundation class name as an input value, forbidden by ADR 0039); (d) `aria-current` on the link as the only source, styled by the library with Foundation's own `menu-state-active`. Settled: (d). It closes Foundation's 1.3.1 gap by construction, needs no directive on `li` or `a`, matches the Tabs nav bar's `nfs-tabs` rule (its D18) and AGENTS.md's listed reason for custom CSS (bridging ARIA attributes to Foundation's class-based styling), and the Router already writes the attribute (`ariaCurrentWhenActive`).
- Q5. How do the menu Plugins relate to `NfsMenu`: host it, bind `.menu` themselves, or have the consumer write it beside them? Settled: host it, after measuring Angular 22's host-directive de-duplication (Probe 1).
- Q6. Variant inputs and types? Building-blocks 1.4 applied: `orientation` (the name ticket 81 already fixed for the menu specs), `expanded`, `simple`, `nested`, `align`, `iconPosition`.

Round 2:
- Q7. `nested`: explicit boolean or derived from an enclosing `NfsMenu` through DI? Explicit. Foundation writes the class explicitly, and a menu inside a Dropdown pane inside a menu item would pick up the indentation from DI.
- Q8. Offer `.<bp>-simple`? No. Foundation's rule for it includes `menu-expand`, not `menu-simple` (a defect in the 6.9.0 menu partial), so it renders the expanded layout, which `expanded="<bp>"` names.
- Q9. `alignment` or `align`? `align`: the Dropdown Menu's `alignment` Option (`'auto' | 'left' | 'right'`) sits on the same `ul` once the root hosts `NfsMenu`, and one binding would reach both inputs.
- Q10. One icon input or two? One, `iconPosition`, binding `.icons` and `.icon-<position>`, the pair the docs ask for; `.icon-*` alone works only under a back-compatibility flag marked for removal.
- Q11. The coordinator's initial-state rule: strip copied classes or let them through? Strip. One class record holds every owned class, `true` or `false` (with the responsive keys for every non-zero breakpoint of `nfsBreakpointsToken`'s map), so the inputs are the one source; a development warning names the input (Probe 1, cases `copied` and `copied-hosted`). A record of set keys only was rejected: a copied `vertical` would beat `orientation="horizontal"`, because `.vertical` comes later in Foundation's CSS.
- Q12. `NfsSubmenu`: which Menu inputs, and who binds `nested` and `vertical`? Recommended for the Nested menu re-run: host `NfsMenu` exposing `align` and `iconPosition`, and bind `nested` and `vertical` itself; Foundation's plugin docs write both on accordion and drilldown submenus, the mode CSS resets the nested margin per mode (`$dropdownmenu-nested-margin`, `$drilldown-nested-margin`: 0), and a dropdown submenu is `display: block` or `none`, so neither changes it. A host's own class bindings beat the hosted `NfsMenu`'s `false` keys (Probe 1, `sub` and `sub-map`).
- Q13. Smooth Scroll and Magellan: host `NfsMenu` or sit beside it? Beside (the Smooth Scroll re-run's decision stands; its names `nfsMenu` and `orientation` are this spec's). One of its reasons is wrong: `nfsMenu` written beside a hosting directive is not NG0309 in Angular 22 (Probe 1, `template-and-host`); a correction is proposed below.

Round 3:
- Q14. Which WCAG 2.2 AA gaps does the documented markup leave? 1.3.1 (visual-only current state; closed by Q4); 2.5.8 (simple menus stacked or wrapped: 16 px rows touching; the spacing exception fails); nothing else at Foundation's defaults (current link 4.59:1 text, 4.59:1 fill against the page, 38.4 px rows).
- Q15. A Library mixin? Yes, `nfs-menu`: the `aria-current` rule, block padding for simple rows, and compile-time checks (1.4.3 current text, 1.4.1 current fill against `$body-background`, 2.5.8 rows). No Variant properties of its own: the only open family is the breakpoint keys, whose `--nfs-breakpoint-classes` `nfs-breakpoint-properties` writes.
- Q16. Tokens? None. `NfsMenuText` looks its menu up by class in development builds only (for its warning); the hosting roots inject `NfsMenu` by class with `self: true`. No Defaults token (Menu has no Options).
- Q17. Development checks? The copied host class (naming the input), a copied leaf `is-active` without `aria-current` (naming `aria-current`), and `nfsMenuText` outside a menu.
- Q18. Router recipe? `routerLinkActive ariaCurrentWhenActive="page"`, with `{exact: true}` on the root link. `isActive()` only in routed components: in an application shell it reads no navigation at the first client render and would drop the server's `aria-current` at hydration (the Accordion Menu spec's finding); `RouterLinkActive` does nothing until the initial navigation completes, so the server's attribute survives (read in `router_link_active.ts`, `update()` returns early while `router.navigated` is false).
- Q19. Landmark and roles? The consumer's named `nav`; no `role` added (WebKit keeps a `list-style: none` list a list only inside a `nav`, as the Nested menu spec records).
- Q20. Rendering modes? Host bindings only, no listeners: server HTML final, nothing to replay, no hydration boundary for a plain menu.
- Q21. Tests? The four layers; e2e only for three-engine geometry, the focus ring on the filled link, reflow at 320 px, and the fixture app.

The frontier is empty; nothing is left `OPEN FOR HUMAN`.

### Decisions

1. `NfsMenu` (`ul[nfsMenu]`, `exportAs: 'nfsMenu'`) binds `.menu`; `NfsMenuText` (`li[nfsMenuText]`) binds `.menu-text`; both in the secondary entry point `ngx-foundation-sites/menu`. Directives only; implementation level native platform; no listeners, no template, no Parent or Defaults token, no models, outputs, or methods.
2. Variant inputs, all closed or over `NfsClassBreakpoint`: `orientation` (`NfsMenuOrientationInput`: `'horizontal' | 'vertical'` or `NfsClassBreakpointRules` of them; a Zero-breakpoint key sets the bare class), `expanded` (`NfsMenuExpandedInput`: `NfsVariantBoolean | NfsClassBreakpointQuery<'up'>`, because Foundation generates only min-width forms), `simple` and `nested` (`NfsVariantBoolean` through `nfsVariantBoolean`), `align` (`'left' | 'right' | 'center'`), `iconPosition` (`'left' | 'right' | 'top' | 'bottom'`, binding `.icons` too). `.<bp>-simple` is not offered (Foundation defect). Defaults set no class.
3. Binding rule: one computed record holding every owned Menu class, `true` when set, `false` otherwise, including `<bp>-horizontal`, `<bp>-vertical`, `<bp>-expanded`, and `<bp>-simple` for every breakpoint of `nfsBreakpointsToken`'s map above the Zero breakpoint; copied Foundation Menu classes are stripped on server and client, a redundant `menu` and the consumer's own classes stay (measured). The Zero breakpoint is the token map's key whose value is 0.
4. The current page is `aria-current` on its link, never a class. `nfs-menu` emits `.menu a[aria-current]:where(:not([aria-current='false']):not([aria-current=''])) { @include menu-state-active; }`, at the specificity of Foundation's `.menu .is-active > a`. Router: `routerLinkActive ariaCurrentWhenActive="page"`.
5. The Accordion Menu, Drilldown, and Dropdown Menu roots host `NfsMenu` through `hostDirectives`, exposing `orientation`, `expanded`, `simple`, `align`, and `iconPosition` under their own names; Responsive Menu gets one merged `NfsMenu` through its three roots; `NfsSubmenu` hosts it exposing `align` and `iconPosition` and binds `nested` and `vertical` itself; `nfsMenu` written beside a root is harmless. A root reads the inputs through `inject(NfsMenu, {self: true})` (the Dropdown Menu's Base side reads `align()` instead of a static `align-right`). Smooth Scroll and Magellan stay beside `nfsMenu`.
6. `nfs-menu` also adds `.menu.simple a { padding-block: max(0px, (24px - 1em) / 2); }` (2.5.8) and stops the compile with `@error` when the current text is under 4.5:1 on `$menu-item-background-active`, that fill is under 3:1 against `$body-background`, or `1rem` plus twice the first value of `$menu-items-padding` is under 24 px. Every menu Plugin's consumer includes it. No Variant properties of its own.
7. Development checks (client, once each): a copied Foundation Menu class on the host names its input; a leaf `li` with `is-active` or `active` and no `aria-current` names `aria-current`; `nfsMenuText` outside a menu. Runtime checks: `strictVariantNames` for breakpoint keys and queries missing from `--nfs-breakpoint-classes` and for unmapped values; `strictVariantProperties` for a missing `--nfs-breakpoint-classes`.
8. Rendering modes: host bindings only; the server HTML is final; nothing replays; a plain menu needs no hydration boundary; `hydrate never` keeps the look and working links.
9. Not produced: `.active`, `.menu-centered`, `.icon-*` without `.icons`; `.menu-icon` belongs to the Top Bar spec; `ol` hosts and `role="list"` are out.

### Measurements

Both probes ran under `D:/tmp/nfs-wave-85/` (not committed); the `node_modules` junction to the rendering-mode seam prototype's Angular 22.2.0 install was removed afterwards.

Probe 1, `ng/`: `ngc` 22.2.0 with `strictTemplates` over a stand-in `NfsMenu` (`host: {class: 'menu', '[class]': record}`), two roots hosting it with `inputs: ['orientation', 'align']` and reading it through `inject(NfsMenu, {self: true})`, a Responsive-Menu-shaped directive hosting both roots, and two submenu-shaped directives; then `renderApplication` in the server platform.
- Compiles; the server HTML: `plain` `class="menu app-own vertical"`; `hosted` `menu align-right` and the root read `right`; `dedup` (two roots on one element) `menu align-center vertical`, both roots read the same value, and the constructor ran once for the element (`["plain","hosted","dedup",...]`, one entry per element); `template-and-host` (`rootA nfsMenu`) no NG0309, one instance; `sub` and `sub-map` `menu align-left nested vertical` and `menu align-right nested submenu vertical` (the host's `[class.x]` and `[class]` map beat the hosted `false` keys); `copied` (`class="vertical medium-vertical menu app-own"`, no input) `menu app-own`; `copied-hosted` `menu`.
- Negative compile: `<ul resp [orientation]="'diagonal'">` and `<ul rootA [align]="'middle'">` both fail with TS2322 naming the alias, through two and one levels of host directives.
- Source: `host_directives_feature.ts` `trackHostDirectiveDef` merges repeated host directives and skips a template-matched one; commit `9c55fcb3e6` "feat(core): de-duplicate host directives" is in every tag from `v22.0.0-next.7` and `v22.0.0` (the Nested menu spec's "22.1" is a slip).

Probe 2, `sass/`: Dart Sass (`D:/tmp/nfs-ct-prototype`'s install) over the Foundation 6.9.0 clone's `scss`, `foundation-menu` then a draft `nfs-menu`. Defaults: current text 4.5865:1, fill against the page 4.5865:1, row 2.4rem; emitted `.menu a[aria-current]:where(:not([aria-current=false]):not([aria-current=""])) { background: #1779ba; color: #fefefe; }` and `.menu.simple a { padding-block: max(0px, (24px - 1em) / 2); }` after Foundation's `.menu.simple a { padding: 0 }`. `#787878` fails the text check at 4.4842:1 (which `color-contrast()` would round to 4.5); `#f0f0f0` fails the fill check at 1.13:1; `#8a8a8a` compiles (Foundation picks the dark text, 5.73:1; fill 3.42:1); `$menu-items-padding: 0.2rem 1rem` fails the row check at 1.4rem.

### Triage

| Decision | Impact | Confidence | Outcome and evidence |
| --- | --- | --- | --- |
| 4, current page as `aria-current` styled by `nfs-menu` | HIGH: every menu Plugin, the Top Bar, and consumer markup inherit it | HIGH: WCAG 1.3.1 and the APG's `aria-current`; the Tabs nav bar precedent; AGENTS.md's listed reason for custom CSS; the rule compiled over Foundation's settings (Probe 2); `RouterLinkActive` source read | Decided |
| 5, the menu roots and `NfsSubmenu` host `NfsMenu` | HIGH: five specs' APIs | HIGH: measured in Angular 22.2.0 under strict templates and a server render (Probe 1); the de-duplication source and commit read | Decided |
| 2, input names and types | HIGH: public API | HIGH: building-blocks 1.4 applied rule by rule; `orientation` fixed by ticket 81; `align` forced by the Dropdown Menu's `alignment` Option; `.<bp>-simple` defect read in the Sass | Decided |
| 3, strip copied classes | MEDIUM | HIGH: building-blocks 1.4's new rule; measured (Probe 1) | Decided |
| 6, `nfs-menu` padding rule and checks | LOW: one mixin, reversible | HIGH: the 2.5.8 failure follows from Foundation's zero padding and WCAG's spacing geometry; the checks measured (Probe 2); e2e measures the rows | Decided |
| 7, 8, 9 | LOW | HIGH | Decided |

Nothing is left `OPEN FOR HUMAN`, and no prototype ticket is needed: the one design question needing a measurement was measured here.

### The coordinator's initial-state rule and the Smooth Scroll names

- The rule of building-blocks 1.4 is applied: no directive reads a static Foundation class; the current page at first paint is written as `aria-current`, the attribute that owns the state; copied Menu classes on the host are stripped (decision 3, measured) and reported once in development builds naming the input; a copied `is-active` on a leaf item, which `NfsMenu` does not bind and so cannot strip, is reported naming `aria-current`.
- The Smooth Scroll re-run's `<ul nfsMenu nfsSmoothScroll>` and `orientation="vertical"` are this spec's names; its examples need no change. Only its D13 reason about NG0309 needs the correction below.

### Proposed shared-file changes (for the orchestrator)

1. `building-blocks.md`, Table D, the Menu row: fill the empty cells with:

   > | Menu | `docs/pages/menu.md` | [Spec: Menu](issues/85-spec-menu.md) | `ul[nfsMenu]` (`.menu`; Variant inputs `orientation`, `expanded`, `simple`, `nested`, `align`, `iconPosition`); `li[nfsMenuText]` (`.menu-text`); hosted by the Accordion Menu, Drilldown, and Dropdown Menu roots and by `ul[nfsSubmenu]`, and through the roots by Responsive Menu; written beside `nfsSmoothScroll` and `nfsMagellan` | Directives (ADR 0001, ADR 0039); nothing is generated | Native platform: HTML lists and links; Aria's menu, menubar, and toolbar are rejected for site navigation (ADR 0004), and CDK has nothing to do | Host bindings over `input()` signals and one `computed` class record holding every owned class as `true` or `false` (copied classes are stripped); `nfsBreakpointsToken` for the Zero breakpoint; the `nfs-menu` Library mixin: the current link's look from `aria-current` through Foundation's `menu-state-active`, block padding to 24 px rows on simple menus, and compile-time checks for 1.4.3, 1.4.1, and 2.5.8 | None of its own: a list of links in a named `nav`, Disclosure Navigation once a menu Plugin root is present; the current page is `aria-current` on its link |

2. `building-blocks.md` 1.9 DI patterns, new bullet after "Composition, never subclassing":

   > - Hosting a class directive (2026-09-27, [Spec: Menu](issues/85-spec-menu.md)): a directive whose element is always another component's Structural class hosts that component's directive through `hostDirectives` and exposes its Variant inputs under their own names, so the class and its Variants have one owner: the Accordion Menu, Drilldown, and Dropdown Menu roots and `NfsSubmenu` host `NfsMenu`. Since Angular 22.0 a directive reached several times through host directives on one element is created once with the exposed input maps merged (one input exposed under two names is an error), and a template match of the same directive discards its host-directive matches, so a consumer who also writes it gets no NG0309; a host's own class bindings override its host directive's. All three were measured with Angular 22.2.0 in the Menu ticket. A behaviour that may sit on any element (Smooth Scroll, Magellan) is written beside the class directive instead.

3. `building-blocks.md` 1.10 Accessibility baseline, new bullet after the "Names" bullet:

   > - Current page (2026-09-27, [Spec: Menu](issues/85-spec-menu.md)): a menu, a Top Bar menu, and every menu Plugin mark the current page with `aria-current` on its link, written by the consumer or by the Router's `RouterLinkActive` with `ariaCurrentWhenActive="page"`, never with a class. The `nfs-menu` Library mixin gives such a link Foundation's active look through Foundation's `menu-state-active` mixin, at the specificity of Foundation's `.menu .is-active > a`, so the look and the announcement have one source (1.3.1), as the Tabs nav bar does in `nfs-tabs`. Every menu Plugin's markup is a Menu, so its consumers include `nfs-menu`. `.is-active` stays a State class the Nested menu binds for open parents and submenus.

4. `CONTEXT.md`, Foundation side, new term after **CSS-only component**:

   > **Menu**:
   > Foundation's `ul.menu` list of links: the CSS-only component whose class and Variants the Menu directive sets, and the markup of every menu Plugin's root and submenus; distinct from the ARIA `menu` role, which no menu uses.
   > _Avoid_: nav list, menubar, ARIA menu (for this)

   Angular side, new term after **Open path**:

   > **Current link**:
   > The link a menu marks as the page the reader is on, with `aria-current` present and not `false`; the library gives it Foundation's active menu look, so no class marks it.
   > _Avoid_: active item, is-active item, selected link

5. New ADR (the orchestrator numbers it), "Menu Plugin roots and submenus host the Menu directive", `status: accepted`:

   > # Menu Plugin roots and submenus host the Menu directive
   >
   > Every menu Plugin's root and submenu is Foundation's `ul.menu`, and the class rule gives `.menu` and its Variant classes to one directive ([ADR 0039](0039-directives-manage-every-foundation-class.md)). We decided that the Accordion Menu, Drilldown, and Dropdown Menu roots and `NfsSubmenu` host `NfsMenu` through `hostDirectives`, exposing its Variant inputs under their own names (a submenu only `align` and `iconPosition`, binding `nested` and `vertical` itself), and that Responsive Menu gets one `NfsMenu` through its three roots, because Angular 22.0 creates a directive reached several times through host directives once, with the input maps merged, and lets a template match win over host-directive matches, as measured with Angular 22.2.0 in [Spec: Menu](../issues/85-spec-menu.md).
   >
   > ## Considered options
   >
   > - Each root binding `.menu` and declaring the Variant inputs itself: five copies of one input set.
   > - The consumer writing `nfsMenu` beside every root: two attributes for one element, and a forgotten one leaves the menu unstyled. Still allowed, and harmless.
   > - Hosting in behaviours that may sit on any element (Smooth Scroll, Magellan): rejected in their specs, because their containers need not be menus.
   >
   > ## Consequences
   >
   > - A root reads the Menu's inputs through `inject(NfsMenu, {self: true})`; the Dropdown Menu's Base side reads `align()` instead of a static `align-right`.
   > - Every root exposes the Menu's inputs under their own names, because one input exposed under two names on one element is a compile-time and runtime error.
   > - Reopened if Angular drops host-directive de-duplication.

6. New ADR (the orchestrator numbers it), "A menu's current page is its link's `aria-current`, styled with Foundation's active look", `status: accepted`:

   > # A menu's current page is its link's `aria-current`, styled with Foundation's active look
   >
   > Foundation marks the current page with `.is-active` on its `li`, a visual state assistive technology never hears, and the class rule forbids consumers to write it, even as an input value such as `routerLinkActive="is-active"` ([ADR 0039](0039-directives-manage-every-foundation-class.md)). We decided that every menu marks the current page with `aria-current` on its link, and that the `nfs-menu` Library mixin gives that link Foundation's active look through Foundation's own `menu-state-active` mixin at the specificity of Foundation's `.menu .is-active > a`, so one attribute gives the announcement and the look, and the Router writes it through `RouterLinkActive`'s `ariaCurrentWhenActive` ([Spec: Menu](../issues/85-spec-menu.md)).
   >
   > ## Considered options
   >
   > - A `current` input on an item directive that binds `.is-active`: a second source beside `aria-current`, and a directive on every plain `li`.
   > - A link directive with Material's `activated` input, binding a class and `aria-current`: a directive on every link for a state the attribute already holds.
   >
   > ## Consequences
   >
   > - `.is-active` stays a State class the Nested menu binds for open parents and submenus, so the current page and the Dropdown Menu's open parent, which Foundation marks alike, are told apart.
   > - Every menu Plugin's consumer includes `nfs-menu`.
   > - A copied `is-active` on a leaf item is reported in development builds.

7. `adr/0004-menus-use-disclosure-navigation.md`, Consequences, append:

   > - 2026-09-27 ([Spec: Menu](../issues/85-spec-menu.md)): the roots and submenus of the directive family host the Menu directive, which binds `.menu` and its Variant classes, and the current page is `aria-current` on its link, styled by `nfs-menu` (the two new ADRs).

8. `specs/smooth-scroll.md`, D13, Rejected alternative cell: replace "and makes a consumer's `nfsMenu` written beside it Angular's development-mode NG0309 error, a directive matched twice on one element" with:

   > and adds nothing a consumer's `nfsMenu` written beside it does not already give (writing both is not an error: since Angular 22.0 a template match discards host-directive matches of the same directive, measured in [Spec: Menu](../issues/85-spec-menu.md))

   The Magellan re-run's working copy of `specs/magellan.md` repeats the claim in its "Beside, not hosting (D17)" paragraph; replace "and a consumer's `nfsMenu` written beside it would be Angular's development-mode NG0309 error, a directive matched twice on one element;" with:

   > and it would add nothing a consumer's `nfsMenu` beside it does not give (writing both would not be an error: since Angular 22.0 a template match discards host-directive matches of the same directive, measured in [Spec: Menu](../issues/85-spec-menu.md));

   Both specs' decision to sit beside `nfsMenu` stands on their first reason.

9. `storybook-conventions.md` section 5, in the `preview.scss` block after `@include nfs-accordion;`, add:

   > `@include nfs-menu; // Menu: the current link's look from aria-current and simple-menu rows; every menu--* story and every menu Plugin story`

10. `README.md`: the two ADR index rows and the ADR count, as the orchestrator numbers them.

### What other specs need from this one

- [Re-run: Nested menu (shared utility) spec under the class rule](132-rerun-nested-menu-class-rule.md): `NfsSubmenu` hosts `NfsMenu` exposing `align` and `iconPosition` and binds `nested` and `vertical` itself (the recommendation of Q12; measured that the host's bindings win); the roots host `NfsMenu` (decision 5); the Base side reads `inject(NfsMenu, {self: true}).align()` in place of `HostAttributeToken('class')` and `align-right`; the static `is-active` seed goes (building-blocks 1.4); the class maps no longer need to preserve consumer-written `menu`, `nested`, `vertical`, or a current-page `is-active`; every current-page example and story uses `aria-current` only; its "Angular 22.1's host directive de-duplication" is 22.0.
- [Re-run: Accordion Menu spec under the class rule](112-rerun-accordion-menu-class-rule.md), [Re-run: Dropdown Menu spec under the class rule](113-rerun-dropdown-menu-class-rule.md), [Re-run: Drilldown Menu spec under the class rule](114-rerun-drilldown-menu-class-rule.md): the root hosts `NfsMenu` with the five inputs; `class="vertical menu"` becomes `orientation="vertical"`; `routerLinkActive="is-active"` on a leaf `li` goes, replaced by `aria-current` on the link; the Sass subsection adds `@include nfs-menu;`. The Dropdown Menu re-run decides whether a current top-level link keeps the Menu's active fill (what `nfs-menu` gives) or gets Foundation's `$dropdown-menu-item-color-active` on `$dropdown-menu-item-background-active` through an `nfs-dropdown-menu` rule on `.dropdown.menu > li > a[aria-current]`; the Menu fill separates the current page from the open parent, which Foundation marks with the same `.is-active`.
- [Re-run: Responsive Menu spec under the class rule](115-rerun-responsive-menu-class-rule.md): one `NfsMenu` arrives through the three roots (measured); `vertical medium-horizontal` becomes `[orientation]="{small: 'vertical', medium: 'horizontal'}"`.
- [Spec: Top Bar](86-spec-top-bar.md): `.menu-icon` and `.menu-icon.dark` are its; `li[nfsMenuText]` gives the site title in a Top Bar menu; its own contrast checks cover the current link's fill against `$topbar-background` (3.76:1 with Foundation's defaults, above 3:1) if it wants that pair checked, since `nfs-menu` compares with `$body-background` only.
- [Re-run: Magellan spec under the class rule](122-rerun-magellan-class-rule.md): `<ul nfsMenu nfsMagellan>`; its `.is-active` plus `aria-current` markers get the same look from both rules and never trigger the copied-marker warning.
- [Re-run: Off-canvas spec under the class rule](117-rerun-off-canvas-class-rule.md): menus inside panels are `ul[nfsMenu]` with `orientation="vertical"`.
- [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the Menu declares no registry and uses `NfsBreakpointClassesOverrides` through `NfsClassBreakpoint`. Its `expanded` transform is a pure function in the menu entry point composing `nfsVariantBoolean` (boolean-like values) with the query string (otherwise); the [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md) needs the same shape for its `expanded` (with `only` and `down`), so the tooling spec may hoist one shared transform, parameter `NfsVariantBoolean | NfsClassBreakpointQuery<M>`, into the primary entry point beside `nfsVariantBoolean`; the Menu spec then uses it unchanged.
- [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md): the Menu reports breakpoint keys and queries to `strictVariantNames` and a missing `--nfs-breakpoint-classes` to `strictVariantProperties` through whatever reporting call that spec defines; the Menu reads `nfsBreakpointsToken` for the Zero breakpoint and the Breakpoint map's keys.
- [Spec: Flexbox Utilities](103-spec-flexbox-utilities.md): Foundation's flex classes define the same `.align-left`, `.align-right`, and `.align-center` names, and a horizontal flexbox menu's `align` moves its items only through them (`foundation-flex-classes`); its alignment directive is not written on a `ul[nfsMenu]`, whose `align` binds those classes (both directives on one element would bind the same class keys).
- [Spec: Visibility Classes](104-spec-visibility-classes.md): its screen-reader-only directive names icon-only menu links.
- [Spec: Pagination](87-spec-pagination.md) and [Spec: Breadcrumbs](88-spec-breadcrumbs.md): for consistency, the current page's announcement is `aria-current`, the same source as the Menu's; their `.current` classes are theirs to bind.
- [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md): check that no menu spec's example writes `menu`, `vertical`, `nested`, `align-*`, or `is-active` for a current page, and that the plugin roots' `hostDirectives` expose the Menu's inputs under the same names.

### Gist for Decisions so far

- [Spec: Menu](issues/85-spec-menu.md) -- `ul[nfsMenu]` binds `.menu` and every Menu Variant from typed inputs (`orientation` with Breakpoint rules, `expanded` with a min-width query, `simple`, `nested`, `align`, `iconPosition`; Foundation's defective `.<bp>-simple` not offered) through one class record that strips copied classes, and `li[nfsMenuText]` binds `.menu-text`; the current page is `aria-current` on its link, which `nfs-menu` styles with Foundation's `menu-state-active` (no `.is-active` for anyone to write), plus 24 px simple-menu rows and compile-time contrast and row checks; the Accordion Menu, Drilldown, and Dropdown Menu roots and `NfsSubmenu` host `NfsMenu`, and Responsive Menu gets one through its roots, measured on Angular 22.2.0's host-directive de-duplication; impact HIGH, confidence HIGH; two ADRs proposed. Spec: [specs/menu.md](specs/menu.md).
