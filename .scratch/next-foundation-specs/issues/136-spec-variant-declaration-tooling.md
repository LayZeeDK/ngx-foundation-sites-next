# 136. Spec: Variant declaration tooling

Type: grilling
Status: resolved
Blocked by: 81
Labels: wayfinder:grilling
Map: ../map.md

## Question

Graduated on 2026-09-27 from [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) and ADR 0040: what does the library ship so that a consumer's Variant declaration file is written from its Sass and kept in step with it, and so that the library's own Variant types stay extendable? Publish `specs/variant-declaration-tooling.md`, a shared-utility spec like the [Spec: Breakpoint service (shared utility)](53-spec-breakpoint-service.md). It owns:

- everything the primary entry point `ngx-foundation-sites` holds for Variant typing: the registries, `NfsOverridableStringUnion`, `NfsOverridableCount`, `NfsVariantBoolean` with `nfsVariantBoolean`, the Class breakpoint types, and the manifest of registries with their default names;
- the shared core, the setup generator exposed as a schematic, the Nx task sync generator, and the Architect builder, with their commands, options, and messages;
- the output format and its determinism;
- the `targetDefaults` and `angular.json` setup;
- the CI steps;
- the shared-library rule;
- the build assertion on the emitted typings.

## How to work it

Run `/grill-with-docs` (self-grilling, both sides), then publish with `/to-spec` in the map's spec shape. Read first: the Answer of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) and ADR 0040; `research/typed-variant-inputs.md`, `research/variant-typing-alternatives.md`, and `research/variant-typing-sync-tooling.md`; ADR 0039; ADR 0005 and the Breakpoint service spec; `map.md` Notes (the user's rule that code generation ships as an Nx generator wrapped and exposed as an Angular CLI schematic, the veto on anything that writes into `node_modules`, and directive composition over subclassing). Its prototype questions are SYNC's unknowns 1 to 3 and 8: the dev server's stale diagnostics, Vitest and Storybook with the declaration file, the standalone compile against complex build configurations, and a measured e2e in which `CI=true nx build` against a stale file is caught by `nx sync:check`. It adds one spec to the map's Destination (52) unless the orchestrator carries it as part of an existing shared-utility spec; the judge recommends a separate spec, because no existing spec owns workspace tooling. Graduate a prototype ticket for them if the spec needs measured answers. Model: Opus 5.5.

## Answer

Model: Opus 5.5. Worked AFK under the map's override: `/grill-with-docs` (the `/grilling` interview played on both sides, with `/domain-modeling` for the glossary), then `/to-spec`. Spec: [specs/variant-declaration-tooling.md](../specs/variant-declaration-tooling.md).

Sources read: the Answer and probes of [Decide: typed Variant inputs over open Sass maps](81-decide-typed-variant-inputs-open-sass-maps.md) (cited "T"), ADR 0040, ADR 0039, ADR 0012, ADR 0005, the Breakpoint service spec, `research/typed-variant-inputs.md` ("D"), `research/variant-typing-alternatives.md` ("ALT"), `research/variant-typing-sync-tooling.md` ("SYNC"), `research/tooling-baseline.md`, `storybook-conventions.md`, building-blocks 1.3, 1.4, 1.7, 1.9, 1.13, 1.14, `CONTEXT.md`, and `map.md` Notes; Nx 23.2.1 source read with `git show 23.2.1:<path>` in `d:/projects/github/nrwl/nx` (`packages/nx/src/utils/sync-generators.ts`, `packages/nx/src/tasks-runner/run-command.ts`, `packages/nx/src/project-graph/utils/project-configuration/target-defaults.ts` and `target-merging.ts`, `packages/nx/src/command-line/generate/generator-utils.ts`, `packages/nx/src/command-line/run/executor-utils.ts`, `packages/nx/src/devkit-exports.ts`, `packages/js/src/generators/typescript-sync/typescript-sync.ts`, `packages/js/generators.json`, and `astro-docs/src/content/docs/reference/project-configuration.mdoc`); Foundation 6.9.0's Sass in `d:/projects/github/foundation/foundation-sites/scss` (every setting in the spec's table, the Prototyping lists re-read in `scss/prototype/`).

### Probes (this ticket)

Run under `D:/tmp/nfs-wave-136/` (not committed) with Dart Sass 1.104.1, TypeScript 6.0.3, and `@angular/core` 22.2.0 types through a junction to `D:/tmp/nfs-ct-prototype/node_modules`, removed afterwards (the target was left intact).

| Id | Question | Result |
| --- | --- | --- |
| E1 | How does Dart Sass print a Variant property list, and the empty list? (agrees with the Button re-run's finding, recorded in ADR 0040 while this ticket ran, that each mixin joins names with `space`) | `#{list.join((), map-keys($p), space)}` prints `primary purple` in expanded and compressed output; plain `#{map-keys($p)}` prints `primary, purple`; colour-name keys print as written (`purple teal white`). `#{()}` and `#{join((), (), space)}` are errors: "() isn't a valid CSS value." `#{unquote('')}` prints `--nfs-a: ;` (expanded) and `--nfs-a: ` (compressed). A count prints bare (`--nfs-grid-columns: 16`). |
| E2 | Does the typings check's probe shape work, and do the count helpers hold? | With stand-in typings (registries, `NfsOverridableStringUnion`, `NfsRange`, `NfsOverridableCountValue`, `NfsOverridableCount`, the Class breakpoint types, a directive with `InputSignal` and `InputSignalWithTransform` members) and a generated-shape declaration file (a sentinel in every names registry, `warning: false`, `count: 16`): the sentinel reached a name input, a query input (`'nfsProbeSentinel only'`), a rules input (`{nfsProbeSentinel: 3}`), and a count input (`16`, `'16'`); `warning`, a misspelt name, `17`, a misspelt rules key, and a misspelt modifier failed (every `@ts-expect-error` used); `primary` still compiled. Without the declaration file every sentinel line failed against the alias names (`NfsButtonColor \| undefined`), so the program fails closed. `NfsWriteType<S> = S extends InputSignalWithTransform<unknown, infer W> ? W : never` inferred `never`; with `any` in place of `unknown` it inferred the write type. |
| E3 | Open-typing opt-out beside the generated file | A separate module declaring `[name: string]: boolean` in `NfsButtonPaletteOverrides` merged with the generated `warning: false`: any string compiled, a number failed. The same with `[name: string]: true` also compiled, but only because `skipLibCheck: true` skips the `.d.ts` conflict; so conflicting members across declaration files pass silently under the CLI default. |
| E4 | Numeric-like names | `'33': true` added and `'50': false` removed as intended; bare `33: true` dropped out of the string union, and bare `50: false` beside the string default `'50'` collapsed the whole union to `never`. |
| E5 | Range depth | `NfsRange<1, 100>` and `NfsRange<1, 999>` compiled, `1000` was rejected by `NfsRange<1, 999>`, `NfsRange<0, 3>` accepts `0`. |

Source facts that decided points (Nx 23.2.1):

- `getSyncGeneratorChanges` keeps a result only if it has an error or `changes.length > 0`: a sync generator is out of sync only when it changes the tree or throws.
- `SyncError` and `SyncGeneratorResult` come from `@nx/devkit/internal` (`typescript-sync.ts:17`); `errorToString` prints a plain `Error`'s message (stack only with `--verbose`).
- `run-command.ts:687-689`: `if (nxArgs.skipSync || isCI()) return`; non-TTY exits 1 before the `applyChanges` branch; the prompt text suggests `sync.applyChanges`.
- `resolveTargetDefault` (`target-defaults.ts`): "the executor key (when the target has that executor and the key exists) wins, then the exact target-name key ... the first key with any matching entry wins".
- The project configuration reference at 23.2.1 lists `syncGenerators` among the arrays that accept the `"..."` spread.
- `readGeneratorsJson` reads `packageJson.generators ?? packageJson.schematics` and treats `generators` entries as native (`isNgCompat` otherwise); `readExecutorJson` reads `packageJson.executors ?? packageJson.builders`, with `builders` entries as Angular-compatible.
- `@nx/js:typescript-sync` reads the project graph with `createProjectGraphAsync()` and is `"hidden": true`.

### Grilling record

Each question was argued from both sides; the answer is the one settled.

1. Separate spec or part of the Breakpoint service spec? For folding: the runtime checks live in `ngx-foundation-sites/media-query` beside the drift check. Against: that spec owns runtime behaviour; the tooling is workspace code with its own commands and tests, and the judge recommended a separate spec. Settled: separate (D1); the runtime checks stay with the Breakpoint service.
2. What exactly is in the primary entry point? For putting family aliases there too: one import for consumers. Against: every entry point's types would live in one file, and ADR 0040 only needs the registries in one module. Settled: registries, helpers, Class breakpoint types, `NfsFoundationPaletteColor` (the base of three chained registries), `NfsVariantBoolean` and `nfsVariantBoolean`; family aliases in their entry points (D2).
3. Is `NfsOverridableCount` the count or the range? ADR 0040 calls it the range, but offsets need 0 to N-1 and spacers 0 to N. Settled: the range with a `Start` parameter, plus `NfsOverridableCountValue` and `NfsRange` to build the others (D3; E2, E5).
4. Which settings are registries? Candidates beyond D's inventory: `$breakpoints`, the fill, flags, renames, `$offcanvas-sizes`. Settled: the 26 of the spec's table; the others change class existence, name Structural classes, or feed behaviour Options (D4).
5. Manifest form and home: a TypeScript constant would need Angular code loaded in Node; two files would be two lists. Settled: one JSON document in the package, read by the tooling from its own location, not exported, with `uses` for the typings check (D5).
6. How is a chained registry diffed? Against library defaults, every parent name would be repeated in every child registry. Settled: against the base setting's found names, or its defaults when the base's property is absent (D6).
7. The empty list: `none` could be a palette name, and Sass rejects `#{()}` (E1). Settled: whitespace only, written with `unquote('')`; readers accept commas and line breaks (D7).
8. Missing properties: failing on each would force every Library mixin into every application. Settled: the registry stays at its defaults; only zero properties fails (D8).
9. Bytes or meaning? A byte check is exact, but Prettier, CRLF checkouts, and hand-written files all differ in bytes. Settled: meaning, through TypeScript's parser; the renderer is still deterministic, and a model-equal file is never rewritten (D9, D10).
10. Formatting: Nx's `formatFiles` exists only under Nx. Settled: the workspace's Prettier from the shared core in both entry points (D11).
11. May the tooling overwrite a hand-written file? For: one owner. Against: it destroys the consumer's content, and ADR 0040 supports hand-written files. Settled: ownership by header; hand-written files are only checked (D10).
12. Where does the open-typing opt-out live? Inside the generated file it is lost on regeneration. Settled: a separate module with `[name: string]: boolean` (D12; E3).
13. Numeric names: settled quoted, always (D13; E4).
14. Where does per-project configuration live, since the sync generator gets only the tree? `nx.json` `sync.generatorOptions` is Nx-only; the header would hide configuration in a comment. Settled: the `nfs-variants` target's options, in both workspace kinds (D14).
15. `targetDefaults` keyed by executor (the typing decision's Answer) or per-project entries? For `targetDefaults`: no `project.json` edits, measured working (SYNC 4.1). Against: Nx uses the executor key alone when it exists, so the new entry silently drops a workspace's `build` defaults (`dependsOn: ['^build']`, `cache`, `inputs`); SYNC 4.1 measured that the entry reaches the targets, not what it does to defaults keyed by target name. Settled: per-project `syncGenerators` with the `"..."` spread (D15), and a dated amendment to the typing decision's Answer (below).
16. Which targets? `build`, `serve`, `test` alone would leave library builds and Storybook reading a stale file. Settled: the executor list and Storybook and `typecheck` targets of the spec (D16).
17. Should setup set `sync.applyChanges: true`? It is workspace-wide and changes every other sync generator's behaviour. Settled: only with `--applyChanges` (D17).
18. How does the sync generator fail? `SyncError` is only in `@nx/devkit/internal`; failures reported as out-of-sync details would not count, since Nx counts only tree changes. Settled: one plain `Error` listing every project with its fix; the run's other changes are reapplied by the next run (D18).
19. Which stylesheets and configuration? Compiling every configuration costs a compile per configuration on every task. Settled: injected Sass global stylesheets under the named or default configuration, a warning (M11) for configurations that change styles, and `stylesheets` to override (D19).
20. How faithful must the Sass resolution be? `@angular/build`'s Sass service is private. Settled: re-implement its rules as importers and confirm them in the prototype (D20).
21. Shared libraries: include applications' files (ADR 0040's "merges them") or give the library its own? Merging hides count conflicts under `skipLibCheck` (E3). Settled: the library's own file from a named build target or stylesheet; the tooling never builds a merged program (D21).
22. Package shape and dependencies: a separate tooling package would be a second version to keep in step with the manifest; `dependencies` on `nx` would install it for everyone. Settled: CommonJS tooling in the package, one collection for generators and schematics, one Architect builder for both workspace kinds, optional peers with M9 (D22, D23).
23. CI: settled `nx sync:check`, `nx run-many -t nfs-variants -c check`, or `ng run <project>:nfs-variants:check` as its own step; the setup generator prints it and edits no CI file (D24).
24. npm scripts: settled opt-in (D25).
25. The build assertion: a name check alone misses an intermediate alias or a transform parameter printed resolved. Settled: the alias-name check plus two generated probe programs plus the manifest-to-Sass compile (D26; E2).
26. Testing layers: no story, browser, or Playwright case exists for workspace tooling. Settled: node-level Vitest, the workspace e2e included, stated per ADR 0018's four layers (D27).
27. The dev server's stale diagnostics: a watcher was not adopted (ADR 0040). Settled: document the restart; the prototype looks for a cause and a fix (D28).
28. Library upgrades: a migration schematic is redundant when the comparison reports every change and unknown registries fail (D29).
29. Glossary: "drift" appears across the bundle with no definition, and the manifest is new. Settled: two terms, Variant manifest and Declaration drift (proposed below).
30. Does anything meet the ADR bar? The per-project registration and comparison by meaning are reversible inside the tooling. Settled: no new ADR; a dated note on ADR 0040.

### Decisions

1. A separate shared-utility spec (D1).
2. The primary entry point holds the 26 Variant registries, `NfsOverridableStringUnion`, `NfsOverridableCount`, `NfsOverridableCountValue`, `NfsRange`, `NfsClassBreakpoint`, `NfsClassBreakpointQuery`, `NfsClassBreakpointRules`, `NfsFoundationPaletteColor`, `NfsVariantBoolean`, and `nfsVariantBoolean`, and imports nothing at runtime (D2, D3).
3. The 26 registries of the spec's settings table, named mechanically, with their Variant properties and defaults; no registry for `$breakpoints`, the fills, flags, renames, or `$offcanvas-sizes` (D4).
4. The Variant manifest: one JSON document in the package with setting, registry, property, kind, defaults or count, base, mixins, and uses (D5); chained registries are diffed against their base's found names (D6).
5. The Variant property format: names separated by whitespace or commas, a bare count from 0 to 999, whitespace only for the empty list; a gated family gets a property of its own (D7).
6. A missing property leaves its registry at the defaults; zero properties fails with M3 (D8).
7. The Variant declaration file's format: header, `import`, one `declare module` block, registries by name, additions sorted then removals in base order, quoted non-identifier names, LF, formatted by the workspace's Prettier; compared by meaning; written only when generated or absent and only when its model differs (D9 to D11, D13).
8. The open-typing opt-out is a separate consumer module with `[name: string]: boolean` (D12).
9. Each project's configuration is its `nfs-variants` target (`buildTarget` or `stylesheets` with `includePaths`, and a `check` configuration), read by the builder and the sync generator (D14).
10. The sync generator is registered on each covered project's own targets with the `"..."` spread, never through `targetDefaults`; `sync.applyChanges` only on request (D15 to D17).
11. The sync generator reads the project graph, writes changed generated files, and throws one plain `Error` for every failing project (D18).
12. Sources: injected Sass global stylesheets of the build target under its named or default configuration; the importers follow the application builder's resolution (D19, D20).
13. The shared-library rule: a library project gets its own file from a named build target or stylesheet; no merged programs; ngx-foundation-sites itself needs none (D21).
14. Packaging: CommonJS tooling inside the package, one collection (`generators` and `schematics`), one Architect builder; optional peers loaded on demand (D22, D23).
15. CI steps and npm scripts as in the spec (D24, D25).
16. The Variant typings check: alias names in the emitted typings, two sentinel probe programs from the manifest, and the manifest-to-Sass compile (D26).
17. Testing: node-level Vitest and a workspace e2e; no story, browser-level, or Playwright case (D27).
18. The dev-server restart note, pending the prototype (D28); upgrades need no migration (D29).
19. The ticket's list says the prototype takes "SYNC's unknowns 1 to 3 and 8", but SYNC's unknown 8 is the production opt-in's tree-shaking under the real application builder, a runtime-check question for [Re-run: Breakpoint service (shared utility) spec under the class rule](129-rerun-breakpoint-service-class-rule.md); the `CI=true` e2e the ticket names is residual risk (b) of the typing decision, and the prototype below takes it.

### Triage

| Item | Impact | Confidence | Outcome |
| --- | --- | --- | --- |
| Registry list, names, properties, defaults (decision 3) | HIGH: public API for 25 specs and 26 re-runs | HIGH: the mechanical rule of building-blocks 1.3 and Foundation 6.9.0's Sass re-read | decided |
| Helper types (decision 2) | HIGH: public API | HIGH: measured (T round 2; E2, E5) | decided |
| Variant property format (decision 5) | HIGH: every Library mixin and runtime check follows it | HIGH: the Sass output measured (E1); the browser read-back measured by [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md) in three engines (an empty list and a missing property both read as the empty string; ADR 0040's dated note, which appeared while this ticket ran) | decided |
| Manifest (decision 4) | MEDIUM: package-internal, not exported | HIGH | decided |
| File format, comparison by meaning, ownership (decisions 7, 8) | MEDIUM: reversible inside the tooling | HIGH: Nx's out-of-sync rule read in source; E3, E4 | decided |
| `nfs-variants` target as configuration (decision 9) | MEDIUM: workspace configuration surface | HIGH: `typescript-sync` reads the graph the same way | decided |
| Per-project registration with the spread (decision 10) | MEDIUM: the setup's output, re-runnable | HIGH from source and the 23.2.1 reference; not measured end to end | decided; prototype question 5 |
| Failure handling (decision 11) | LOW | HIGH (source) | decided |
| Sources and Sass resolution (decision 12) | MEDIUM: fixable in a patch release | MEDIUM: not measured beyond SYNC's one case | decided under the triage rule; prototype question 3 |
| Shared-library rule (decision 13) | MEDIUM | HIGH: E3 and SYNC 4.4 | decided |
| Packaging and dependencies (decision 14) | MEDIUM | HIGH (source; SYNC 5.3) | decided; prototype question 6 |
| Typings check (decision 16) | LOW: library-internal | HIGH (E2) | decided |
| Dev-server note (decision 18) | LOW | MEDIUM | decided; prototype question 1 |

No item is HIGH impact with NOT-HIGH confidence, so nothing is OPEN FOR HUMAN. Overall: impact HIGH (new public API), confidence HIGH for the decisions, MEDIUM for the measurements the prototype takes.

### Prototype needed

Proposed ticket, for the orchestrator to create, blocked by this ticket; [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) should wait on it:

"Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces". Type: prototype. Model: Opus 5.5 (question 1 needs a root cause, not only a measurement). Question: build the shared core, the setup generator and schematic, the sync generator, and the Architect builder as [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md) describes, over a stand-in package with the spec's primary-entry-point types, a few registries, their Library mixins, and one directive per shape; pack it; and measure in scratch workspaces (Nx 23.2.1 with `@nx/angular` 23.2.1, and Angular CLI 22.2.0):

1. SYNC unknown 1: after the declaration file changes during `ng serve` and `nx serve`, which rewrites the dev server re-checks, why only the first, and whether a `/// <reference path>` from the application's entry file, a `files` entry, or anything else makes every rewrite reach the template diagnostics. Verdict: the spec's restart note stands, or the setup generator adds the fix.
2. SYNC unknown 2: whether `@angular/build:unit-test` and `@nx/angular:unit-test` (Vitest, browser mode and jsdom) and `@storybook/angular-vite` (`storybook dev`, `storybook build`, the `@storybook/addon-vitest` run, and the docgen controls of a Variant input) see the declaration file: a declared name compiles or appears, and a program without the file fails closed.
3. SYNC unknown 3: whether the core's compile reproduces the application builder's for `@import 'ngx-foundation-sites'` through the package's `sass` export condition, `pkg:` URLs, a `~` prefix, `includePaths`, several global stylesheets, an `inject: false` entry, and a configuration that overrides `styles`, comparing the properties the core reads with those in the built `styles.css` in each case.
4. The e2e the typing decision's residual risk (b) asks for: commit an in-step file, remove `warning` from the Sass, show `CI=true nx build` passing against the stale file, `nx sync:check` exiting 1 with the spec's detail line, `nx sync` rewriting the file, and the next build failing with TS2322 on `color="warning"`.
5. That per-project `"syncGenerators": ["...", "ngx-foundation-sites:variant-types-sync"]` keeps a workspace's `targetDefaults.build` (`dependsOn: ['^build']`) and an executor-keyed `targetDefaults` entry, while an executor-keyed entry added for the sync generator would drop the name-keyed defaults (`nx show project --json`).
6. That `convertNxGenerator` runs the setup generator in a plain Angular CLI workspace (targets in `angular.json`, the file, the npm scripts), that `ng run <app>:nfs-variants:check` runs without `nx` installed, and that Nx runs the same builder as an Angular-compatible builder (`nx run <app>:nfs-variants:check`).

A seventh question drafted here (the browser's read-back of the empty list) was answered while this ticket ran by [Re-run: Button spec under the class rule](128-rerun-button-class-rule.md): an empty list and a missing property both read as the empty string in three engines (ADR 0040, dated note). The spec cites it.

Captured under `prototypes/variant-declaration-tooling/` with a README (question, how to run, verdict). A failed case graduates a re-run of this spec, or a text correction the prototype's triage decides.

### Proposed changes to shared files

Paths are relative to the effort root; links inside each quoted text are relative to the file it goes into.

1. `building-blocks.md` 1.13, replace the bullet that begins "- The Variant declaration file: the library's generator reads" with:

   "- The Variant declaration file: the library's tooling reads the Variant properties from a compile of the project's global stylesheet, writes the consumer's `src/nfs-variants.d.ts`, the file that augments the Variant registries, and compares it with the Sass by meaning. It is kept in step by an Nx task sync generator registered on each covered project's own targets, with `nx sync:check` as a required CI step, or on the Angular CLI by the Architect builder behind each project's `nfs-variants` target, whose `check` configuration runs in CI. A shared library whose own programs use names Foundation's defaults lack gets a file of its own. The [Spec: Variant declaration tooling](issues/136-spec-variant-declaration-tooling.md) fixes the commands, options, file format, Variant property format, and messages."

2. `building-blocks.md` 1.13, in the bullet that begins "- Variant properties: each Library mixin", replace "A family that a Sass flag gates writes an empty list while the flag is off, and" with "A family that a Sass flag gates gets a Variant property of its own, written as the empty list (whitespace only) while the flag is off and read only by the runtime checks, and".

3. `building-blocks.md` 1.4, append to the bullet that begins "  - Authoring: every Variant input declares explicit type arguments": " The assertion is the Variant typings check of the [Spec: Variant declaration tooling](issues/136-spec-variant-declaration-tooling.md), which also compiles probe programs generated from the Variant manifest, in which a declared name must reach every listed input and misspelt, removed, and out-of-range values must fail. Each Open Variant family row of a spec's class mapping (1.14 item 2) names a registry of that spec's settings table and becomes one `uses` entry of the manifest."

4. `building-blocks.md` Part 3, replace "Four, each a directive or service spec written with the same shape as a plugin spec and consumed by the plugin specs listed:" with "Five, each written with the same shape as a plugin spec and consumed by the specs listed:", and add after item 4:

   "5. **Variant declaration tooling** (the Variant registries and helper types in the primary entry point, the Variant manifest, and the setup generator and schematic, the Nx task sync generator, and the Architect builder that write the consumer's Variant declaration file from its compiled Sass and check it in CI). Consumers: every spec with an Open Variant family (the registries and their Variant properties) and every spec with a boolean or responsive Variant (`nfsVariantBoolean`, the Class breakpoint types). Decided in ADR 0040; the [Spec: Variant declaration tooling](issues/136-spec-variant-declaration-tooling.md) fixes the API and the tooling."

   And a Table C row:

   "| Variant declaration tooling | Types in the primary entry point (26 Variant registries, `NfsOverridableStringUnion`, `NfsOverridableCount`, `NfsOverridableCountValue`, `NfsRange`, the Class breakpoint types, `NfsFoundationPaletteColor`, `NfsVariantBoolean` and `nfsVariantBoolean`); the Variant manifest; the setup generator and schematic `ngx-foundation-sites:variant-types`, the Nx task sync generator `ngx-foundation-sites:variant-types-sync`, and the Architect builder `ngx-foundation-sites:variant-types` behind each project's `nfs-variants` target | Types, one pure function, and Node workspace tooling; no directive, service, or token: typing needs only the types, and keeping the file in step is a workspace task (ADR 0040) | Not an Implementation level choice: declaration merging for the types, Node tooling over the Sass JavaScript API, TypeScript's parser, `@nx/devkit`, and `@angular-devkit/architect` | Sass `compile` with importers, TypeScript `createSourceFile`, `createProjectGraphAsync`, `convertNxGenerator`, `createBuilder`, Prettier when present | None |"

5. `CONTEXT.md`, Angular side, replace the **Variant declaration file** definition line with "The `nfs-variants.d.ts` at the source root of a consumer's application, or of a shared library whose own programs use names Foundation's defaults lack, generated from its Sass by the library's tooling or written by hand, that augments the Variant registries; kept in step by a sync step and checked for Declaration drift in CI." and add after its `_Avoid_` line:

   ```markdown
   **Variant manifest**:
   The library's list of its Variant registries, each with its Sass setting, its Variant property, its default names or count, and the Variant inputs that follow it; the one list the library's Sass, types, and tooling agree on.
   _Avoid_: registry list, variant config, schema

   **Declaration drift**:
   A difference between a Variant declaration file and the Variant properties of the Sass it mirrors: a name one has and the other lacks, a differing count, or a registry the library does not have.
   _Avoid_: stale types, out of sync (Nx's word for any sync generator), mismatch
   ```

6. `adr/0040-variant-input-types.md`, Consequences, append:

   "- 2026-09-27 ([Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md)): the tooling is specified. The sync generator is registered on each covered project's own targets with Nx's `"..."` array spread, not through `targetDefaults` keyed by executor, because Nx uses the executor key alone when it exists and would drop a workspace's defaults keyed by target name. The declaration file is compared with the Sass by meaning, so formatting and hand-written layout never count as drift, and the tooling rewrites only a file it generated. A shared library whose own programs use names the defaults lack gets a declaration file of its own, from a named application build target or stylesheet; the tooling never builds a program that merges several applications' files, whose conflicting counts `skipLibCheck: true` hides."

7. `issues/81-decide-typed-variant-inputs-open-sass-maps.md`, append after its Answer's "Gist for Decisions so far":

   "### Amendment, 2026-09-27 (tooling spec)

   The [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md) replaces two details of this Answer's "Synchronisation and CI steps". The setup generator registers the sync generator on each covered project's own targets with Nx's `"..."` spread, not through `targetDefaults` keyed by executor: Nx 23.2.1 resolves target defaults by the executor key alone when it exists (`resolveTargetDefault`), so the entries proposed here would drop a workspace's `build` defaults. It also adds the `nfs-variants` target to Nx projects, where it carries each project's options for the sync generator. The exact diff check becomes a comparison by meaning, so a formatter's output and a hand-written file's layout never count as drift. The rest of the Answer stands."

8. `README.md`:
   - Shared utilities: replace "Four utilities earn their own spec (building-blocks Part 3); the plugin specs call their APIs as these specs define them." with "Five utilities earn their own spec (building-blocks Part 3); the plugin and component specs call their APIs as these specs define them." and add the row "| Variant declaration tooling (the Variant registries, `ngx-foundation-sites:variant-types`, `nfs-variants`) | [specs/variant-declaration-tooling.md](specs/variant-declaration-tooling.md) | Types and one pure function in the primary entry point; Node workspace tooling ([ADR 0040](adr/0040-variant-input-types.md)) | [Variant typing sync tooling](research/variant-typing-sync-tooling.md); [typed Variant inputs](research/typed-variant-inputs.md); [Variant typing alternatives](research/variant-typing-alternatives.md) | the graduated prototype (title above) | Every spec with a Variant family; the Breakpoint service's runtime checks (the Variant property format) |".
   - Destination and "How to read" item 5: the published count goes from 26 to 27 (the four shared utilities and this one).
   - Open list, the class-rule wave item 5: append ": resolved; its prototype, [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](issues/<number>-<slug>.md), is open."

9. `issues/129-rerun-breakpoint-service-class-rule.md`, How to work it, append: "Also read the [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md): the runtime checks parse Variant properties with its Variant property format (names separated by whitespace or commas, a bare count, whitespace only as the empty list, which computed style returns as the empty string, as it does for a missing property; ADR 0040's dated note from the Button re-run), import the Class breakpoint types from the primary entry point, and read `--nfs-breakpoint-classes` as the property of the `$breakpoint-classes` registry. SYNC's unknown 8, the production opt-in's tree-shaking under the real application builder with an `InjectionToken`, is this re-run's to measure or to hand to a prototype."

10. `issues/133-consistency-review-class-rule-wave.md`: add the new prototype's number to `Blocked by`, and append to How to work it: "Check that every Open Variant family row of every spec names a registry and Variant property of the settings table in the [Spec: Variant declaration tooling](136-spec-variant-declaration-tooling.md) and is listed in its manifest's `uses`, that each Library mixin that writes a registry's property is in that registry's `mixins`, and that no spec declares a registry of its own."

11. `storybook-conventions.md` section 5, append after the paragraph on `_settings-overrides.scss` (the one that says every override is a consumer-side setting): "Settings overrides change Variant values, never Variant names, so the library's Storybook program needs no Variant declaration file. A story that shows a name Foundation's defaults lack would need a file generated from `preview.scss` (the shared-library rule of the [Spec: Variant declaration tooling](issues/136-spec-variant-declaration-tooling.md))."

12. `map.md`: the Decisions-so-far line below, and the graduation of the prototype ticket.

### What other specs need from this one

- Every spec with an Open Variant family: name the registry and Variant property exactly as the settings table does; list, per family row, the directive, input, alias, and shape (name, query, rules, count) for the manifest's `uses`; keep the authoring rule so the typings check covers the input; declare no registry. A family whose setting is missing from the table proposes a row here.
- Every spec with a Library mixin that writes a registry's property: print it in the Variant property format (space-separated names, a bare count, `unquote('')` for the empty list, never `#{()}`), and name the mixin for the registry's `mixins`. A flag-gated family gets a property of its own, never an empty registry property.
- The Button, Button Group, Badge, Label, Callout, Progress Bar, Close Button, Dropdown, Responsive Embed, grid, flexbox, and Prototyping specs: their registries are in the table; the grid, flexbox, Prototyping, and Button Group specs name their mixins.
- The Breakpoint service re-run: item 9 above.
- Every spec with a boolean Variant: `input<boolean, NfsVariantBoolean>(false, {transform: nfsVariantBoolean})` from the primary entry point; every count family builds its range with `NfsOverridableCount`, `NfsOverridableCountValue`, and `NfsRange`.
- Every spec's stories keep Foundation's default Variant names.

### Gist for Decisions so far

(Paths relative to the effort root.)

- [Spec: Variant declaration tooling](issues/136-spec-variant-declaration-tooling.md) -- the primary entry point holds the 26 Variant registries (tabled with their Sass settings and Variant properties), the union and range helpers, the Class breakpoint types, and `nfsVariantBoolean`; a Variant manifest in the package lists every registry and the inputs that follow it; one shared core behind the setup generator and schematic, the Nx task sync generator, and the Architect builder of each project's `nfs-variants` target writes the Variant declaration file deterministically and compares it by meaning, rewriting only files it generated; the sync generator is registered on each project's own targets with Nx's `"..."` spread, because `targetDefaults` keyed by executor would drop a workspace's `build` defaults; CI runs `nx sync:check` or `ng run <app>:nfs-variants:check`; a shared library gets its own file from a named build target or stylesheet; the Variant typings check compiles sentinel probes against the packed typings; impact HIGH, confidence HIGH, nothing OPEN FOR HUMAN; a prototype measures the dev server, Vitest and Storybook, the Sass resolution, and the `CI=true` e2e. Spec: [specs/variant-declaration-tooling.md](specs/variant-declaration-tooling.md).
