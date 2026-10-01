# Audit 0012: the lazy styles research wave

Date: 2026-10-01
Auditor: audit judge (Opus 5.5), one pass with no sweepers; read-only except this file

## Scope

Everything below was audited as committed at HEAD `60b9ca6` ("claim the lazy family styles prototype"). The working tree was clean at the start of the run (`git status --porcelain` empty), so the files read equal the commit. [Prototype: a directive that loads and unloads its family's consumer-compiled styles](../issues/184-prototype-lazy-family-styles.md) is being worked by another session; it was audited as committed, `Status: claimed`, with no `prototypes/lazy-family-styles/` folder in the tree.

The wave is every commit in `89b4592..60b9ca6`: 4 commits, `git diff --name-status 89b4592 60b9ca6` over 8 files (7 added, 1 modified, none deleted). It holds:

- `5a34dd0`, which charts the user's lazy family styles ruling of 2026-10-01: the Destination sentence, the Notes bullet, the Not yet specified patch, and five tickets, [Research: loading and unloading component styles from directives in Angular 22.2](../issues/182-research-lazy-style-loading-from-directives.md), [Research: splitting Foundation 6.9's CSS per family](../issues/183-research-foundation-sass-per-family-split.md), [Prototype: a directive that loads and unloads its family's consumer-compiled styles](../issues/184-prototype-lazy-family-styles.md), [Decide: how first-milestone directives load and unload their family styles](../issues/185-decide-lazy-family-styles.md), and [Decide: how later-milestone families manage their styles](../issues/186-decide-later-milestone-family-styles.md);
- `1ec9784`, which resolves ticket 183 with `research/foundation-sass-per-family.md`;
- `6d37fde`, which resolves ticket 182 with `research/lazy-style-loading.md` and adds points 6 to 10 to ticket 184;
- `60b9ca6`, which claims ticket 184.

What was checked:

1. The wayfinder process: ticket headers and types, `Blocked by` edges, claim before work, each resolved ticket's Answer and its one gist in Decisions so far, gists against their tickets and findings, Not yet specified and Out of scope, the Destination edit, and the new Notes bullet.
2. Research quality: every claim in the two findings files cited or labelled measured; 33 citations spot-checked against the local clones; findings that decide what they should not; contradictions between the two files, and with ADR 0008, ADR 0012, ADR 0040, ADR 0045, building-blocks, the architecture guide, the glossary (`CONTEXT.md`), and `storybook-conventions.md`, that the new tickets do not name.
3. The user's ruling, quoted in ticket 185, against every place it is restated: the map's Notes and Destination, tickets 182, 184, and 186, and the commit bodies.
4. Hygiene: the four commit messages, banned words and the banned pair in every changed file and message, non-ASCII characters, relative links in the changed files, and the README's index statements.

Governing rules: `/wayfinder`, `/research`, `docs/agents/issue-tracker.md` (Wayfinding operations), and `map.md` (Where things live, Model per ticket, Audits, Orchestration rules with the Commits rule). Severity definitions and the report shape follow [audit 0011](0011-final-wave.md).

## Method

The judge read the five tickets at `60b9ca6` in full, the two findings files in full, the map's diff and its Notes, Decisions so far, Not yet specified, and Out of scope, audit 0011 in full, ADR 0008 and ADR 0012, architecture guide P18, building-blocks 1.13, the glossary's Library mixin entry, and the Storybook preview conventions. Every candidate was re-read in the file at HEAD before it was kept.

Spot checks of citations (33, all against the clones at the commits the findings name: `angular/angular` `5db6fc4` on `22.2.x`, `angular/components` `708d4c6` on `22.2.x`, `foundation-sites` `337be7a`, which is `v6.9.0-1` with no `scss/` change since the tag):

- `lazy-style-loading.md`, Angular (13): `dom_renderer.ts:58-74` (default `true`), `:680-685` (the `allLeavingAnimations.size === 0` guard), `shared_styles_host.ts:80-85` (links keyed by file name), `:151-157` (`removeStyles`, no guard), `:240-248` (nonce, `ng-app-id` on the server), `browser.ts:276-278`, `private_export.ts:15` (the private `SharedStylesHost` export), `longest_animation.ts:171` (the app-wide set), `transfer_state.ts:166` (`<APP_ID>-state`), `construction.ts:247`, `node_manipulation.ts:360-363`, `host_directives_feature.ts:289-290` with error 310 at `errors.ts:61`. All hold.
- `lazy-style-loading.md`, components (6): `style-loader.ts:21-30` and `:46-68` (once per application, destroyed only with the application), `badge.ts:69-77` (`_MatBadgeStyleLoader`, `selector: '[matBadge]'`), `badge.ts:171-173`, `structural-styles.ts:15-21`, `_token-utils.scss:7-11`. All hold. The quoted breaking-change note of `df21d2b09` does not match its source word for word (L3).
- `lazy-style-loading.md`, Foundation (3): `_global.scss:223-231` (the `button` reset), `typography/_base.scss:343-346` (`a`), `_callout.scss:53`. All hold; the ticket's Answer files the `a` rule under the wrong mixin (L2).
- `foundation-sass-per-family.md` (11): `package.json:3` (6.9.0), `foundation.scss:80-91` (`$global-flexbox: true !global`), `:137-141` (menu order), `_button-group.scss:19` and `:215-216`, `typography/_base.scss:433-438` (`@extend %cite-block`), `_drilldown.scss:121`, `_dropdown-menu.scss:145-146` and `:241-248`, `_menu.scss:489-501`, `_global.scss:140-146`; zero `@keyframes` under `scss/` (exit 1, no match). All hold. The prior-art file `taiga-ui-cdk-directives-with-styles.mjs` was read in `D:/tmp/nfs-182-priorart` (M2).
- One measured claim was re-measured: the list of `foundation-everything`'s includes (`foundation.scss:92-155`) against the 50 rows of the per-family table, and `rg -l '\.float-left'` over the research's own outputs in `D:/tmp/f183/out-default` (M3).

Mechanical checks, run by the judge (scripts in the session scratchpad, `a0012/`):

- Banned words and the banned pair (`rg -i -w` over the 8 changed files and the 4 commit messages written to files with `git log -1 --format=%B`): none (exit 1). Control: a file holding "wired" (one hit).
- Non-ASCII: the barred o (U+0275) that prefixes Angular's private exports six times (part of the identifier, which a reader searches for as written) and the section sign five times in `research/lazy-style-loading.md:107-108` (L5).
- `links.mjs` over the 8 changed files, resolving each `[text](target)` outside code from its own file and each anchor against the target's headings: 461 links, none broken (exit 0). Control: one resolving and one missing target (one flagged, exit 1).
- Counts: `issues/` 186 tickets, 184 claimed, 185 and 186 open, the rest resolved; Decisions so far 183 lines, one each for tickets 182 and 183, none for 184 to 186; `research/` 75 files; the quoted later-milestone sentence of ticket 186 matches ticket 185's quote byte for byte (`rg -F`, one hit in each).

The ruling's original message was not available to the judge, so ticket 185's quote is taken as the source; every restatement was read against it.

The judge ran no identity scan of the files or the commits; the orchestrator runs it. This file carries no email-shaped token and no host name.

Convention in this file: links inside quoted replacement text are written relative to the target file, ready to paste, so they do not resolve from here; every other link is relative to this file. Where a Fix corrects a claim in a resolved ticket or its findings, the claim stays as written and a dated note follows it, as the fixer of audit 0011 did.

### Candidates dropped

- Claims of tickets 182 and 183 were not committed before their research ran. The tracker rule is "set `Status: claimed` and save before any work"; it does not require a commit, the claim cannot be seen in history either way, and the map's Commits rule makes one resolved ticket one commit. Ticket 184's claim is its own commit, before any prototype file exists.
- The gists of tickets 182 and 183 run to five and six sentences with figures. The map's gists have carried figures since the first waves (ticket 181's gist gives four counts), and audit 0011 read that form as true; L1 takes up only the sentence that decides.
- The commit bodies of `1ec9784` and `6d37fde` name the models that resolved the research. That is provenance the map's Model per ticket rule asks each answer to record, and earlier commits do the same; there is no trailer or attribution line.
- Ticket 182's Answer says the strongest candidate is M1. The ticket's question and ticket 184 both ask for a ranking ("the strongest candidate"), and the findings file says it decides nothing; a ranking of options is evidence for ticket 185, not a decision.
- The Notes bullet's "unload them when no instance remains" and "Families moved to a later milestone keep relying on the consumer's global stylesheet": the first spells out the "unload" the user asked about, and the second is the user's "are assumed to depend on the consumer loading styles in their global stylesheets", with ticket 186 named for the half the user left open.

## Summary

| Severity | Count |
| --- | --- |
| High | 0 |
| Medium | 5 |
| Low | 7 |
| Total | 12 |

Severity definitions (as in audit 0009):

- High: a document the next repository would read as written would be misled (every spec and building-blocks are read by the implementer), or it contradicts a user rule or an ADR.
- Medium: a skill or map rule is broken in a way that weakens the bundle, without by itself planting a wrong fact in a spec; a false resolution-log claim and a false index count are rated here, and so is a narrow wrong fact that the reader meets as a contradiction or a visible compile error (audit 0009's M4 and M5).
- Low: hygiene.

The main pattern: the research is well sourced. Every one of the 33 citations checked holds, every measured claim names the probe or fixture behind it, and both files decide nothing. Where the wave goes wrong is in the layer that summarises the research for the decision. A Notes bullet filed under the user's ruling says the ruling overrides ADR 0012, which the user did not say and the strongest candidate may not need (M1). Ticket 182's Answer and gist say no library unloads, against the findings' own prior-art table (M2). One measured claim of the per-family file is false, because three of `foundation-everything`'s includes were never compiled alone (M3), and ticket 186 relies on sizes that file does not have (M4). The decision ticket and the fog also leave out three records both findings files say assume one global compile, and the README was not brought up to date with the five new tickets (both M5). No spec, ADR, or building-blocks line changed in the wave, so nothing the implementer reads is wrong yet, and there is no High finding. Every Fix is a text edit; none needs a ticket, none changes a decided rule, and this audit adds no OPEN FOR HUMAN item.

## Findings

### M1. The map's Notes bullet, filed under the user's ruling, says the ruling overrides ADR 0012 and P18

- File: `map.md:62` (Standing preferences, "Lazy family styles").
- Rule: the brief's check that the user's ruling is represented faithfully, with nothing added as if the user said it; the map's own ranking (a conflict with an ADR is settled by a record, and ticket 185 is that record); `/wayfinder`, "a decision lives in exactly one place -- its ticket".
- Evidence: the bullet opens "(user ruling, 2026-10-01, quoted in ...)" and goes on "The ruling overrides \"No library component or directive carries `styles`\" in [ADR 0012](adr/0012-sass-packaging.md) and the matching rule in architecture guide P18." The quoted ruling in ticket 185 names neither record. Ticket 185's question keeps the point open ("What replaces or amends [ADR 0012](../adr/0012-sass-packaging.md) ..."), and the research's strongest candidate, a carrier component "compiled in the consumer's project" (ticket 182, Answer, second bullet), is not a library component, so ADR 0012's sentence may stay true as written. ADR 0012 carries no dated note from this wave.
- Fix: in `map.md:62`, replace "The ruling overrides \"No library component or directive carries `styles`\" in [ADR 0012](adr/0012-sass-packaging.md) and the matching rule in architecture guide P18." with "The ruling cannot be met under \"No library component or directive carries `styles`\" in [ADR 0012](adr/0012-sass-packaging.md) and the matching rule in architecture guide P18 as they read today; whether the decision supersedes them, amends them, or keeps them true with styles compiled in the consumer's project is the decision ticket's (orchestrator's reading, not the user's words)."
- Handling: fixers (text edit).

### M2. Ticket 182's Answer and its gist say no library unloads styles; the findings' own table says Taiga's older directive does

- File: `issues/182-research-lazy-style-loading-from-directives.md:33`; `map.md:351`; `research/lazy-style-loading.md:123`.
- Rule: the gist and the Answer record what the findings found (`/wayfinder`, "Refer by name" and "The map body"); `/research`, each claim follows its source.
- Evidence: the prior-art table gives Taiga UI 5.26.0 "An older `TuiWithStyles` directive created and destroyed per instance" and, under "Counts and unloads", "yes per instance for the older directive" (`research/lazy-style-loading.md:120`). The judge read the extracted package (`D:/tmp/nfs-182-priorart/@taiga-ui__cdk/package/fesm2022/taiga-ui-cdk-directives-with-styles.mjs`): its constructor calls `createComponent` for each provided style component and `ngOnDestroy` destroys each ref, which is M1, and M1 unloads on the last destroy through `SharedStylesHost` (measured, section 3.2). Against that, the ticket's Answer says "No library found counts and unloads on the last destroy", the map's gist says "No library surveyed unloads styles", and the findings' last prior-art line says "No library found counts instances and unloads on the last destroy through a shared counter." The decision ticket loses the one shipped precedent for its strongest candidate.
- Fix:
  - `research/lazy-style-loading.md:123`: after "... through a shared counter." add "Note, 2026-10-01 (audit 0012): Taiga's older `TuiWithStyles` directive is the exception. It creates one hidden component per instance and destroys it in `ngOnDestroy` (`taiga-ui-cdk-directives-with-styles.mjs:9-16`), which is M1, so Angular's own count unloads its styles on the last destroy (inferred from 3.2's measurement). No library found keeps a count of its own."
  - `issues/182-research-lazy-style-loading-from-directives.md:33`: after "No library found counts and unloads on the last destroy." add " Note, 2026-10-01 (audit 0012): Taiga's older `TuiWithStyles` directive does, as M1 (one carrier per instance, destroyed with it); see the findings' section 7."
  - `map.md:351`: replace "No library surveyed unloads styles." with "Only Taiga's older `TuiWithStyles` directive unloads, as M1 does."
- Handling: fixers (text edits).

### M3. The per-family findings say every rule of `foundation-everything` is in one standalone compile; the Float Classes were never compiled alone

- File: `research/foundation-sass-per-family.md:17`, `:158`; `issues/183-research-foundation-sass-per-family-split.md:30`.
- Rule: `/research`, each claim follows its source; a measured claim must hold against the measurement.
- Evidence: `foundation-everything` always includes `foundation-float-classes` (`FDN/scss/foundation.scss:151`), and includes `foundation-flex-grid` when `$flex` is true and `$xy-grid` false (`:107`) and `foundation-prototype-classes` when `$prototype` is true (`:154`). None of the three is a row of the 50-mixin table, and none has an output file in `D:/tmp/f183/out-default` (51 files: the 49 mixins that compiled, `foundation-everything`, and `_import_only_`). Measured by the judge: `rg -l '\.float-left'` over that folder finds only `foundation-everything.css`. So "Every one of the 1,373 rules of `foundation-everything` also appears in the standalone compile of exactly one export mixin" (`:17`), "All 1,373 distinct rules ... appear in a standalone compile of one export mixin" (`:158`), and the Answer's "all 1,373 rules of `foundation-everything` are in one standalone compile each" (`:30`) are false for the Float Classes' rules. The three missing mixins belong to later-milestone families, which is where [Decide: how later-milestone families manage their styles](../issues/186-decide-later-milestone-family-styles.md) needs their figures (M4).
- Fix:
  - `research/foundation-sass-per-family.md`, after item 2 of section 1 (`:17`) and after the Rules bullet of 3.5 (`:158`), add: "Note, 2026-10-01 (audit 0012): the 50 compiled mixins leave out three that `foundation-everything` can include: `foundation-float-classes` (always, `FDN/scss/foundation.scss:151`), `foundation-flex-grid` (`:107`), and `foundation-prototype-classes` (`:154`). The Float Classes' rules (`.float-left`, `.float-right`, `.float-center`, `.clearfix`) are in `foundation-everything.css` and in no standalone output (`rg -l '\.float-left' FX/out-default`), so the 1,373 rules are not all in one standalone compile. All three are later-milestone families."
  - `issues/183-research-foundation-sass-per-family-split.md:30`: after the bullet, add "Note, 2026-10-01 (audit 0012): not for the Float Classes; `foundation-float-classes`, `foundation-flex-grid`, and `foundation-prototype-classes` were not compiled alone (findings, section 1 item 2, dated note)."
- Handling: fixers (text edits).

### M4. Ticket 186 relies on sizes for the Prototyping Utilities that the per-family findings do not have

- File: `issues/186-decide-later-milestone-family-styles.md:19`.
- Rule: a ticket's How to work it states true facts about its inputs (audit 0009's Medium definition: a narrow wrong fact the reader meets as a contradiction).
- Evidence: point 3 says "Weigh that against their size, which [Research: splitting Foundation 6.9's CSS per family](183-research-foundation-sass-per-family-split.md) measures (the grids' and Prototyping Utilities' output is large)." Written in `5a34dd0`, before ticket 183 resolved. The findings measure four of the eight later-milestone families alone: the XY Grid (`foundation-xy-grid-classes`, 35,747 bytes minified), the Float Grid (`foundation-grid`, 17,567), the Flexbox Utilities (`foundation-flex-classes`, 2,343), and the Visibility Classes (`foundation-visibility-classes`, 2,557) (`research/foundation-sass-per-family.md:45-48`), plus `foundation-typography` as a whole. The Flex Grid, the Prototyping Utilities, the Typography Helpers alone, and the Float Classes have no row (M3).
- Fix: in `issues/186-decide-later-milestone-family-styles.md:19`, replace "measures (the grids' and Prototyping Utilities' output is large)." with "measures for four of the eight: the XY Grid (35,747 bytes minified), the Float Grid (17,567), the Flexbox Utilities (2,343), and the Visibility Classes (2,557). The Flex Grid, the Prototyping Utilities, the Typography Helpers, and the Float Classes were not compiled alone; compile them the same way when this ticket is worked."
- Handling: fixers (text edit; ticket 186 is open, so the edit is in place).

### M5. The decision ticket and the fog leave out three records that both findings files say assume one global compile, and the README's index is out of date

- File: `issues/185-decide-lazy-family-styles.md` (How to work it, points 1 to 6); `map.md:355` (Not yet specified); `README.md:3`, `:22`, `:173`.
- Rule: the brief's check that contradictions the research found are named by the new tickets; `/wayfinder`, Fog of war (Not yet specified holds the area to revisit); the README indexes the bundle and its statements are true (audit 0009's Medium definition: a false index count).
- Evidence:
  - The Variant declaration tooling reads the Variant properties "from a compile of the project's global stylesheet" (building-blocks 1.13, the Variant declaration file bullet; [ADR 0040](../adr/0040-variant-input-types.md); `specs/variant-declaration-tooling.md:29`). Both findings files name the clash: `research/foundation-sass-per-family.md:187` (open unknown 5) and `research/lazy-style-loading.md:134`.
  - The Storybook preview builds every story on `@include foundation-everything($prototype: true);` with every `nfs-<plugin>` include after it, "as ADR 0012 requires" (`storybook-conventions.md:97`, `:122`, `:268-269`).
  - `foundation-everything` forces `$global-flexbox: true !global` and per-family includes do not (`research/foundation-sass-per-family.md:21`, `:162`), so a consumer who leaves the global path changes the Menu's output when its settings say `false`.
  - Ticket 185's six points and the Not yet specified patch name ADR 0012, P18, building-blocks 1.13, and the glossary's Library mixin entry, but none of the three above, and ticket 184 measures none of them.
  - `README.md:3` says "`issues/` holds 181 tickets, all resolved"; there are 186, with 184 claimed and 185 and 186 open. `:22` says "73 research files"; there are 75. `:173` says "Open: none". The wave did not touch the README.
- Fix:
  - `issues/185-decide-lazy-family-styles.md`, after point 6, add: "7. The records that assume one global compile, which both research files flag: the Variant declaration tooling reads the Variant properties from a compile of the project's global stylesheet (building-blocks 1.13; [ADR 0040](../adr/0040-variant-input-types.md); `specs/variant-declaration-tooling.md:29`); the Storybook preview includes `foundation-everything` and every Library mixin after it (`storybook-conventions.md:97`, `:122`, `:268-269`); and `foundation-everything` forces `$global-flexbox: true`, which per-family includes do not ([research/foundation-sass-per-family.md](../research/foundation-sass-per-family.md), 3.5)."
  - `map.md:355`: replace "building-blocks 1.13, and the glossary's Library mixin entry" with "building-blocks 1.13 (with its Variant declaration file bullet), ADR 0040 and the Variant declaration tooling spec, `storybook-conventions.md`'s preview, and the glossary's Library mixin entry".
  - `README.md:3`: replace "`issues/` holds 181 tickets, all resolved;" with "`issues/` holds 186 tickets, all resolved but the three of the lazy family styles question (184 to 186);".
  - `README.md:22`: replace "73 research files." with "75 research files."
  - `README.md:173`: replace "Open: none; the last two tickets," with "Open: [Prototype: a directive that loads and unloads its family's consumer-compiled styles](issues/184-prototype-lazy-family-styles.md), [Decide: how first-milestone directives load and unload their family styles](issues/185-decide-lazy-family-styles.md), and [Decide: how later-milestone families manage their styles](issues/186-decide-later-milestone-family-styles.md), after the two research tickets of the lazy family styles question; before them, the last two tickets,".
  - Add a README section for the wave in the form of the later-waves sections (`README.md:223`), listing tickets 182 to 186; L6 below adds this audit to it.
- Handling: fixers (text edits).

### L1. Ticket 183's gist decides where the Library mixins live

- File: `map.md:350`.
- Rule: `/wayfinder`, the map gists and links, and a decision lives in its ticket; ticket 183, "Decide nothing".
- Evidence: the gist ends "Library mixins that win by coming after their export mixin must share its file." The findings say only that "A per-family file that contains `foundation-<x>` then `nfs-<x>` keeps those orders; two files loaded in arbitrary order do not" (`research/foundation-sass-per-family.md:171`), and the other research names a second route, an `@layer` order declared first (`research/lazy-style-loading.md:110`). The gist also says twice that the drilldown and dropdown menus need `foundation-menu`.
- Fix: in `map.md:350`, replace "Library mixins that win by coming after their export mixin must share its file." with "A Library mixin that wins by coming after its export mixin keeps that order when both sit in one file, and loses it when two files load in any order." and delete "The accordion, drilldown, and dropdown menus need `foundation-menu`, Button Group needs Button, and Slider needs range input." in favour of "The accordion menu also needs `foundation-menu`, Button Group needs Button, and Slider needs range input."
- Handling: fixers (text edit).

### L2. Ticket 182's Answer files Foundation's `a` rule under the global resets

- File: `issues/182-research-lazy-style-loading-from-directives.md:34`.
- Rule: the Answer records what the findings found.
- Evidence: "Foundation's unlayered global resets (`button`, `a`) would therefore beat layered family rules". The findings give the `button` reset in `foundation-global-styles` (`FDN/scss/_global.scss:223-231`, checked) and `a { color: $anchor-color }` in typography (`FDN/scss/typography/_base.scss:343-346`, checked), `research/lazy-style-loading.md:111`; `_global.scss` has no `a` rule. Typography is a later-milestone family whose output stays global (`research/foundation-sass-per-family.md:19`).
- Fix: replace "Foundation's unlayered global resets (`button`, `a`)" with "Foundation's unlayered tag rules (the `button` reset of its global styles, typography's `a`)", followed by "Note, 2026-10-01 (audit 0012): reworded; `a` comes from typography, not the global styles." if the fixers keep the original in place.
- Handling: fixers (text edit).

### L3. A quoted breaking-change note differs from its source

- File: `research/lazy-style-loading.md:74`.
- Rule: `/research`, each claim follows its source; a quotation reproduces it.
- Evidence: the file quotes `df21d2b09` as "The overlay styles are now loaded slightly later than before which can change their specificity"; the commit body reads "The overlay stays are now loaded slightly later than before which can change their specificity." (`git show -s df21d2b09` in `angular/components`). The fix of the source's typo is silent.
- Fix: replace "\"The overlay styles are now loaded" with "\"The overlay stays [styles] are now loaded".
- Handling: fixers (text edit).

### L4. Ticket 183's open unknown on shared settings is answered by ticket 182, and neither record says so

- File: `issues/183-research-foundation-sass-per-family-split.md:36`; `research/foundation-sass-per-family.md:185`.
- Rule: `/wayfinder`, Work through the map, step 5 (update the parts of the map an answer changes).
- Evidence: ticket 183's open unknowns include "how an application build would give each family file the same settings"; `research/lazy-style-loading.md:86` answers it for one family: "`includePaths` plus one `@import 'settings'` per family file does it" (measured with `$callout-sizes`). Ticket 183's Answer and its findings still list it as open, and ticket 184 does not carry it.
- Fix: after open unknown 3 in `research/foundation-sass-per-family.md:185`, add "Note, 2026-10-01 (audit 0012): measured for one family in [research/lazy-style-loading.md](lazy-style-loading.md), 5.2: the application builder passes `stylePreprocessorOptions.includePaths` to every component stylesheet, and one `@import 'settings'` per family file applies the consumer's settings." Add the same note, with the link written from `issues/`, after the Open unknowns bullet of ticket 183's Answer.
- Handling: fixers (text edits).

### L5. Section signs in the lazy-loading findings

- File: `research/lazy-style-loading.md:107-108`.
- Rule: the hygiene check of audits 0009 to 0011 (no non-ASCII character); the user's preference for ASCII in committed artifacts so a literal `rg` search matches.
- Evidence: five section signs (U+00A7), before "6.4.1", "6.4.3", "6.4.4.2", "6.1", and "6.4.3 note". The six private-API prefix letters (U+0275) in the file and the ticket are part of Angular's exported names (the private `SharedStylesHost` export) and stay.
- Fix: replace each section sign with "section " (for example "section 6.4.1").
- Handling: fixers (text edit).

### L6. The claim commit has no body, and this audit makes a README statement false when it lands

- File: commit `60b9ca6`; `README.md:24`.
- Rule: map, Orchestration rules, Commits ("a Conventional Commit (`docs(wayfinder): ...`) with a body that gives the why"); the README indexes the bundle (audit 0011, L6).
- Evidence: `git log -1 --format=%B 60b9ca6` is the subject alone. The other three messages have bodies that give the why. `README.md:24` says "eleven compliance audits (... and the final wave)", which is false once this file lands.
- Fix: if the branch is not yet pushed, reword `60b9ca6` with `git history reword` (as for audit 0011's group g commit) to add a body such as "Ticket 184 is unblocked now that both research tickets are resolved; claiming it first keeps a parallel session off it while the prototype is built." Otherwise record the gap in the Resolution log. When this file lands, `README.md:24`: replace "eleven compliance audits (" with "twelve compliance audits (" and "and the final wave)" with "the final wave, and the lazy styles research wave)", and name [Audit 0012: the lazy styles research wave](audits/0012-lazy-styles-research-wave.md) in the README section M5 adds.
- Handling: orchestrator (the commit) and fixers (the README).

### L7. Ticket 184, point 2: "a `animate.leave` animation"

- File: `issues/184-prototype-lazy-family-styles.md:18`.
- Rule: hygiene.
- Evidence: "including after a `animate.leave` animation finishes".
- Fix: replace "after a `animate.leave` animation" with "after an `animate.leave` animation". The ticket is claimed by another session; apply after that session commits, or leave it to that session.
- Handling: fixers (text edit, after ticket 184's session commits).

## Verified OK

The process:

1. Ticket headers: all five carry `Type:`, `Status:`, `Blocked by:`, `Labels: wayfinder:<type>`, and `Map: ../map.md` in the form of tickets 174 and 181; the types match the labels (two research, one prototype, two grilling).
2. `Blocked by` edges: 184 by 182 and 183, 185 by 184, 186 by 185; 182 and 183 by none. Ticket 184 was unblocked when it was claimed (both blockers `resolved` at `6d37fde`).
3. Claim before work: ticket 184's claim is its own commit, and the tree at `60b9ca6` holds no `prototypes/lazy-family-styles/` folder.
4. Each resolved ticket (182, 183) has an `## Answer`, `Status: resolved`, and exactly one gist in Decisions so far (183 lines in all, one per ticket), linked by its title; each resolving commit carries the ticket, its findings file, and its gist line, as the map's Commits rule asks. `6d37fde` also adds points 6 to 10 to ticket 184, the graduation step 5 of Work through the map asks for.
5. Out of scope still holds: the base element styles line says Global Styles and Typography Base have nothing for a directive to manage, which ticket 183 measured (45 of 49 global rules are tag or attribute rules).
6. The Destination sentence adds the one condition the ruling implies for the specs and links the decision ticket by name.

The ruling:

7. Ticket 185 quotes the ruling as a block, and its sentence "The requirement itself is settled: first-milestone families manage their styles lazily" says no more than the quote. Ticket 186 quotes the later-milestone sentence byte for byte. Tickets 182 and 184 restate only the first-milestone requirement. The Notes bullet's "this is a library-wide requirement" and "Forms may be an exception" follow the quote; M1 is the one addition.

The research:

8. Both findings files open by saying they decide nothing, name their sources with commits and versions, and label each probe result "measured" and each source reading "inferred" or cite `file:line`. The 33 citations checked hold, apart from the quotation in L3. The two files agree with each other on the order pair (`foundation-menu` before the drilldown and dropdown menus), on the `$callout-sizes` and custom-settings evidence that the consumer's settings reach a per-family compile, and on the Variant declaration generator as an open unknown.
9. Against the records: ADR 0012's reason (library-built CSS renders Foundation's defaults) is restated, not contradicted, by both files; ADR 0008's rendering-modes contract is named by ticket 185 point 4, and the two measured gaps that strain it (a leave animation stopping removal, dehydrated instances not counted) are points 6 and 7 of ticket 184; ADR 0045 is named by tickets 185 and 186 for the global path and for moving later-milestone styles; `@layer` is Baseline widely available on the map's Browser support date across the core table, as the map's rule requires (`research/lazy-style-loading.md:107`).

Hygiene:

10. No banned word and no banned pair in the 8 files or the 4 commit messages; every subject is a lower-case `docs(wayfinder): ...`; no trailer or attribution line; every relative link in the changed files resolves from its own file (461 links).

## Resolution log

The orchestrator applied the fixes on 2026-10-01, each as the finding's Fix states unless noted.

- M1: applied. The map's Notes bullet now says the ruling cannot be met under ADR 0012 and P18 as they read today, and leaves supersede, amend, or keep to the decision ticket, marked as the orchestrator's reading.
- M2: applied to the findings (section 7), ticket 182's Answer, and the map's gist. The gist reads "as the carrier does" in place of "as M1 does", because the map does not define M1.
- M3: applied to the findings (section 1 item 2, and 3.5's Rules bullet, where the note leads the bullet) and to ticket 183's Answer.
- M4: applied to ticket 186, point 3.
- M5: applied. Ticket 185 has point 7; the map's Not yet specified names the Variant declaration tooling, ADR 0040, and the Storybook preview; the README's counts, Open list, and a new section for the lazy family styles question are updated.
- L1: applied to ticket 183's gist.
- L2: applied to ticket 182's Answer, with the reason in brackets in place of a separate note.
- L3: applied.
- L4: applied to the findings (open unknown 3) and ticket 183's Answer.
- L5: applied; the five section signs read "section".
- L6: the README count and audit list are applied. The claim commit `60b9ca6` is not reworded: rewording also rewrites the audit commit after it while a prototype session is editing the working tree, and the gap is a missing body on a one-line status change. Recorded here instead.
- L7: deferred to the commit that resolves ticket 184, since that ticket is claimed by a running session.
