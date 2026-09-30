# Spec: Variant declaration tooling (shared utility)

Ticket: [Spec: Variant declaration tooling](../issues/136-spec-variant-declaration-tooling.md). Targets Angular 22.2, Nx 23.2, TypeScript 6.0.x, Dart Sass 1.104 (the version `@angular/build` 22.2.0 loads), Storybook 10.6 with `@storybook/angular-vite`, Vitest 4.1.x, and Foundation for Sites 6.9.0 Sass. Decided upstream in ADR 0040 (Variant input types), ADR 0039 (the class rule), ADR 0012 (Sass packaging, with its dated note on the Variant properties), and ADR 0005 (the Breakpoint source of truth, with its dated note on `--nfs-breakpoint-classes`); the decision log with sources is in the ticket answer.

Evidence is cited as: T, the probes of [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md) (the typing decision), round 1 cases J and round 2 cases A, B, C, K, O, and R; SYNC and ALT, the sync-tooling and alternatives research of [Research: further typing and synchronisation options for Variant inputs](../issues/135-research-further-variant-typing-options.md), with their section numbers; D, the first dossier of [Research: typed Variant inputs over open Sass maps](../issues/80-research-typed-variant-inputs-open-sass-maps.md); and "this ticket's probe", the measurements in this spec's ticket answer (Dart Sass 1.104.1, TypeScript 6.0.3, `@angular/core` 22.2.0 types). Nx behaviour is cited from Nx 23.2.1's source by function name.

## Problem Statement

Under the class rule a consumer writes no Foundation class; every Variant class is set by a Variant input whose type is closed (ADR 0040). Many Variant names are not Foundation's to fix: a developer adds `purple` to `$button-palette`, drops `warning` from `$label-palette`, adds `xlarge` to `$breakpoint-classes`, or adds a `huge` size to `$button-sizes`, exactly as Foundation's docs teach. The library's types only know Foundation's defaults, so the developer's own names reach the Variant inputs only through the Variant declaration file, which augments the library's Variant registries.

Writing and keeping that file by hand does not work well:

- The file is a mirror of the Sass. When the Sass gains a name, a template that uses it fails to compile until someone declares it. When the Sass loses a name, the file still declares it, templates keep compiling, and the element renders with a class the CSS no longer has. Nothing tells the developer.
- Nx runs sync generators before local tasks, but no task runs one when `CI` is set: a build in CI passed against a stale file and shipped a Variant with no class (measured, SYNC 4.2). The file CI builds against must already be in step when it is committed.
- The Angular CLI has no target dependencies at all: a bare `ng build` or `ng serve` runs nothing first.
- Some names generate classes only under a Sass flag, some families chain (`$button-palette` defaults to `$foundation-palette`), and Foundation's docs let a palette lose names as well as gain them. A hand-written file easily gets one of these wrong, and one easy mistake (a file with no `import`) silently replaces the library's types.
- A shared library in an Nx workspace is compiled, tested, and type-checked in programs that see no application's declaration file, so its own type checks reject the names its applications use. Storybook's own compile checks neither templates nor story arguments, so only a type check of its TypeScript configuration sees a declaration file there.
- The library itself can break the whole scheme without noticing: TypeScript's declaration emit may print an input's type as Foundation's resolved default union, and then no consumer declaration reaches that input.
- Every Library mixin writes a Variant property, every component spec types inputs over a registry, and the generator must know every registry with its setting, property, and default names. Without one list, these drift apart inside the library.

Developers need the library to write the Variant declaration file from their Sass, keep it in step before the tasks that read it, cover shared libraries, and never freeze Foundation's defaults into its own typings.

## Solution

The library ships, inside its own package, everything a consumer needs to write and keep the Variant declaration file, plus the types those files augment:

- The primary entry point `ngx-foundation-sites` holds the first milestone's 10 Variant registries (one empty interface per Sass setting whose names become Variant classes), the helper type that builds closed unions over them (`NfsOverridableStringUnion`), the Class breakpoint types (`NfsClassBreakpoint`, `NfsClassBreakpointQuery`, `NfsClassBreakpointRules`), `NfsFoundationPaletteColor`, and `NfsVariantBoolean` with its transform `nfsVariantBoolean`. Of the Variant pieces there, everything is a type except that one pure function; the primary entry point also holds the Motion name types, the pair type `NfsMotionPair`, and their pure functions `nfsMotionClasses` and `nfsMotionPairClasses`, which `building-blocks.md` 1.6 rule 4 defines for every Motion input and which are not Variant tooling ([Re-run: Reveal spec under the class rule](../issues/110-rerun-reveal-class-rule.md)).
- The Variant manifest, shipped in the same package version, lists every registry with its Sass setting, its Variant property, its default names, the setting whose names are its defaults (`$button-palette` builds on `$foundation-palette`), the Library mixins that write its property, and the Variant inputs that follow it.
- One shared core compiles a project's global stylesheet with the Sass JavaScript API, reads the Variant properties from the compiled CSS, works out what the declaration file must say, reads what the existing generated file says, and writes when the two differ. Three thin entry points sit over it:
  - a setup generator, `ngx-foundation-sites:variant-types`, an Nx generator exposed to the Angular CLI as a schematic, which adds an `nfs-variants` target to each project, writes its first Variant declaration file, and in Nx registers the sync generator on the project's own targets;
  - an Nx task sync generator, `ngx-foundation-sites:variant-types-sync`, which keeps every project's file in step before its build, serve, test, and Storybook tasks;
  - an Architect builder, `ngx-foundation-sites:variant-types`, behind the `nfs-variants` target, which rewrites the file (`ng run <app>:nfs-variants`), on the Angular CLI and under Nx alike.
- The file is written deterministically and compared by meaning, not by bytes, so a formatter or a line-ending conversion never causes a rewrite. The tooling rewrites only a file it generated itself; a hand-written file is never overwritten.
- The generated file is committed with the Sass change that changed it: outside CI, Nx rewrites it before the registered tasks, and on the Angular CLI the `nfs-variants` target or the optional npm `pre` scripts do; CI builds against the committed file.
- A shared library whose own programs use names the defaults lack gets a Variant declaration file of its own, generated from an application build target it names or from its own stylesheet, such as its Storybook preview stylesheet.
- The library's own pipeline runs the Variant typings check after its build: the emitted typings name each listed input's alias, and a generated probe program proves that a declared name reaches every listed input and that misspelt and removed values still fail.
- The families a later milestone adds bring their own registries, and with their count registries the count kind of every piece above (Later milestone, under Implementation Decisions).

## User Stories

1. As an application developer on Nx, I want one command that sets up the Variant declaration file for every application, so that I do not write the registry augmentation myself.
2. As an application developer on the Angular CLI, I want the same setup through `ng generate`, so that the tooling is not Nx-only.
3. As an application developer, I want the file generated from my compiled Sass, so that the names I add with Foundation's `map-merge` are the names my templates may use.
4. As an application developer, I want a name I removed from a palette to stop compiling, so that I never ship an element whose class my CSS no longer has.
5. As an application developer who added `xlarge` to `$breakpoint-classes`, I want `expanded="xlarge down"` and `{xlarge: 6}` to compile, so that my responsive Variants follow my breakpoints.
6. As an application developer who added a `huge` size to `$button-sizes`, I want `size="huge"` to compile on buttons and fail on callouts, so that each size family follows its own setting.
7. As an application developer who added `purple` to `$foundation-palette`, I want Button, Badge, and Label to accept `purple` too, so that the palettes chain as Foundation's Sass defaults chain.
8. As an application developer who gave `$button-palette` its own map without `purple`, I want `purple` to fail on buttons while it still works on callouts, so that each family follows its own setting.
9. As an application developer on Nx, I want the file rewritten before `nx build`, `nx serve`, and `nx test` when my Sass changed, so that local tasks never run against stale types.
10. As an application developer on Nx, I want the choice between Nx's prompt and automatic syncing, so that I decide how much Nx does for me without the library changing a workspace-wide setting behind my back.
11. As an application developer, I want the docs to say that the generated file is committed with the Sass change that changed it, so that CI, where Nx runs no sync generator, builds against a file in step.
12. As an application developer, I want each rewrite to name the file, the project, the stylesheet, and the names that changed, so that I see what a Sass change did to my types.
13. As an application developer on the Angular CLI, I want an `nfs-variants` target per application that rewrites the file, so that the file stays in step without Nx.
14. As an application developer on the Angular CLI, I want optional npm `pre` scripts that regenerate the file, so that `npm run build`, `npm start`, and `npm test` keep it in step.
15. As an application developer, I want the setup docs to name the import and the includes my stylesheet needs, so that a missing `@import 'ngx-foundation-sites';` does not look like a typing bug.
16. As an application developer, I want a family I did not include in my Sass to keep Foundation's defaults, without any error, so that I include only the Library mixins I use.
17. As an application developer, I want the generated file to be stable byte for byte for the same Sass and formatter settings, so that it does not churn in my diffs.
18. As an application developer who runs Prettier on everything, I want the generated file to come out already formatted and to stay in step after Prettier touches it, so that the formatter and the sync never fight.
19. As an application developer on Windows with `core.autocrlf`, I want line endings never to count as drift, so that checkouts on another platform stay in sync.
20. As an application developer who prefers to write the file by hand, I want the tooling never to overwrite my hand-written file, so that I keep control.
21. As an application developer who writes the file by hand, I want the docs to list the registry names the library has, so that a typo in a registry name does not declare a new, unused interface.
22. As an application developer who writes the file by hand, I want the docs to say that it starts with `import 'ngx-foundation-sites';`, so that I avoid the ambient-module trap that replaces the library's types.
23. As an application developer who wants open typing for one palette, I want a documented opt-out that survives regeneration, so that I can accept any string there on purpose.
24. As an application developer with several global stylesheets, I want the tooling to read every injected Sass stylesheet of my build and tell me when two of them disagree, so that the file follows what my application really loads.
25. As an application developer with a lazily loaded theme stylesheet, I want to name which stylesheets the file follows, so that a theme switched at runtime does not decide my types by accident.
26. As an application developer whose production configuration changes `styles`, I want a warning naming that configuration, so that I know the file follows the default configuration only.
27. As an application developer, I want the tooling to resolve `@import 'ngx-foundation-sites'`, `foundation-sites/...`, `pkg:` URLs, and my `includePaths` the way the application builder does, so that the file follows the same compile as my build.
28. As a developer of a shared Nx library, I want my library's type check, tests, and stories to accept the names of the application it is tested against, so that my library's own programs do not reject names its applications use.
29. As a developer of a shared Nx library with its own Storybook stylesheet, I want the library's file generated from that stylesheet, so that my stories and their controls show the names my stories' CSS has.
30. As a developer of a shared library used by applications with different palettes, I want each application's build to stay the authority, so that a name one application lacks fails in that application's build even when the library accepts it.
31. As a developer in a workspace with several applications, I want one `nx sync` to update every application's file, so that one command covers the workspace.
32. As a developer whose one application's Sass is broken, I want the error to name that application and its fix, so that I know why every task stopped.
33. As a developer running `ng serve` or `nx serve`, I want the dev server to re-check my templates after the Variant declaration file is rewritten, so that stale template errors in the terminal do not mislead me.
34. As a developer running git hooks or an agent shell, I want the docs to say to run `nx sync` first, so that a non-interactive run does not stop on an out-of-sync workspace.
35. As an Angular CLI developer, I want the schematic to tell me which packages to install when `nx` is missing, so that its dependency is explicit, and I want the `nfs-variants` target to work without Nx, so that a workspace without Nx stays lean.
36. As an application developer upgrading ngx-foundation-sites, I want the next sync to rewrite the generated file for every change in the library's registries and defaults, so that an upgrade never leaves my file out of step.
37. As an application developer, I want the setup command to be idempotent, so that I can re-run it after adding an application.
38. As a library maintainer, I want one manifest that lists every registry with its setting, property, defaults, and the inputs that follow it, so that the Sass, the types, and the generator cannot drift apart.
39. As a library maintainer, I want a check after every build that fails when an emitted Variant input type no longer names its alias or no longer accepts a declared name, so that declaration emit never freezes Foundation's defaults.
40. As a library maintainer, I want a Sass compile test that fails when a Library mixin's Variant property disagrees with the manifest's defaults, so that the property and the manifest stay one list.
41. As a component spec author, I want a published table of registry, setting, and property names, so that my spec's class mapping names them exactly.
42. As a component spec author, I want `nfsVariantBoolean` and the union helper in one place, so that every boolean Variant and every open family parses values the same way.
43. As a test author, I want the shared core's pure functions testable in Node, and the generators testable against a virtual workspace tree, so that most cases run without installing anything.
44. As a security-conscious maintainer, I want the tooling never to write into `node_modules` and never to add a runtime dependency to applications, so that the user's veto and the bundle size both hold.
45. As a developer reading a generated file, I want its header to name the stylesheet it came from and the command that regenerates it, so that I never edit it by hand by mistake.

## Implementation Decisions

### Foundation contract: the settings that become Variant registries

Foundation 6.9's Sass settings whose names become Variant class names in the first milestone's families (D section 2, re-checked against Foundation 6.9.0's Sass). The later milestone adds the settings of its families (Later milestone, below). Each is one Variant registry, named by the mechanical rule of building-blocks 1.3 (`Nfs` + PascalCase of the setting + `Overrides`), and one Variant property (`--nfs-` + the setting's name). "Defaults" are the names that generate a class, in Foundation's order; a key such as `default` that Foundation reads as the base look and gives no class is not a name.

| Sass setting | Registry | Variant property | Kind | Defaults | Base | Families |
| --- | --- | --- | --- | --- | --- | --- |
| `$foundation-palette` | `NfsFoundationPaletteOverrides` | `--nfs-foundation-palette` | names | `primary secondary success warning alert` | none | Callout, Progress Bar (`.progress` and native `<progress>`) |
| `$button-palette` | `NfsButtonPaletteOverrides` | `--nfs-button-palette` | names | Foundation's defaults | `$foundation-palette` | Button, Button Group |
| `$badge-palette` | `NfsBadgePaletteOverrides` | `--nfs-badge-palette` | names | Foundation's defaults | `$foundation-palette` | Badge |
| `$label-palette` | `NfsLabelPaletteOverrides` | `--nfs-label-palette` | names | Foundation's defaults | `$foundation-palette` | Label |
| `$button-sizes` | `NfsButtonSizesOverrides` | `--nfs-button-sizes` | names | `tiny small large` | none | Button, Button Group |
| `$callout-sizes` | `NfsCalloutSizesOverrides` | `--nfs-callout-sizes` | names | `small large` | none | Callout |
| `$closebutton-size` | `NfsClosebuttonSizeOverrides` | `--nfs-closebutton-size` | names | `small medium` | none | Close Button |
| `$dropdown-sizes` | `NfsDropdownSizesOverrides` | `--nfs-dropdown-sizes` | names | `tiny small large` | none | Dropdown pane |
| `$responsive-embed-ratios` | `NfsResponsiveEmbedRatiosOverrides` | `--nfs-responsive-embed-ratios` | names | `widescreen` | none | Responsive Embed |
| `$breakpoint-classes` | `NfsBreakpointClassesOverrides` | `--nfs-breakpoint-classes` | names | `small medium large` | none | every responsive Variant (Class breakpoints) |

Settings that are deliberately not registries:

- `$breakpoints`: behaviour Options keep the open `NfsBreakpointName` (ADR 0005, ADR 0040). The Zero breakpoint's name in Media Object's `stack-for-<zero>` needs no registry: `stackFor` is typed `NfsClassBreakpoint`, and the directive builds the class from `nfsBreakpointsToken`'s Zero breakpoint ([Spec: Media Object](../issues/91-spec-media-object.md), D2).
- `$offcanvas-sizes` and `$offcanvas-vertical-sizes`: keyed by breakpoint, they produce media queries, not classes.
- `$button-fill`: the fills `solid`, `hollow`, `clear` are a Closed Variant family whatever the setting says (ADR 0039, dated note).
- Flags that gate a family's classes (`$button-responsive-expanded`, `$global-flexbox`): they change whether classes exist, not which names they have, so the types do not change, and the tooling reads nothing for them. A gated family never writes a registry's property, such as `--nfs-breakpoint-classes`, empty.
- Class-name renames (`$maincontent-class`): they rename Structural classes, which directives bind; a renamed `$maincontent-class` is the [Spec: Off-canvas](../issues/25-spec-off-canvas.md)'s to decide.

A component spec declares no registry (the typing decision). A spec whose family needs a setting missing from this table proposes a new row for this spec.

### Registry to property and input mapping: the Variant manifest

The Variant manifest is a JSON document inside the package, read by the tooling from its own install location, never exported through the package's `exports` and never loaded by application code. It is the one list the library's Sass, types, generator, and typings check agree on. Its shape:

```ts
interface NfsVariantManifest {
  readonly version: 1;
  readonly registries: readonly NfsVariantManifestRegistry[];
}

interface NfsVariantManifestRegistry {
  readonly registry: string; // 'NfsButtonPaletteOverrides'
  readonly setting: string; // '$button-palette'
  readonly property: string; // '--nfs-button-palette'
  readonly kind: 'names'; // the later milestone adds 'count' (Later milestone, below)
  readonly defaults: readonly string[]; // the names that generate a class, in Foundation's order
  readonly base?: string; // a setting whose effective names are this registry's defaults: '$foundation-palette'
  readonly mixins: readonly string[]; // the Library mixins that write the property: ['nfs-button']
  readonly uses: readonly NfsVariantManifestUse[];
}

interface NfsVariantManifestUse {
  readonly entryPoint: string; // 'ngx-foundation-sites/button'
  readonly directive: string; // 'NfsButton'
  readonly input: string; // 'color'
  readonly alias: string; // 'NfsButtonColor': the exported alias the input's write type names
  readonly shape: 'name' | 'query' | 'rules'; // how the input takes this registry's names
}
```

- One entry per row of the table above, in that order. `mixins` and `uses` are filled from the component specs: every Open Variant family row of a component spec's class mapping (building-blocks 1.14 item 2) becomes one `uses` entry per registry it reads. An input whose values come from two registries (an open family's names and, as the keys of a Breakpoint rules object, the Class breakpoints) appears under both.
- Known `mixins` today: `nfs-callout` and `nfs-progress-bar` write `--nfs-foundation-palette` (the exception to one writer per property for a setting no entry point owns), and `nfs-callout` writes `--nfs-callout-sizes` alone; `nfs-button` writes `--nfs-button-palette` and `--nfs-button-sizes`; `nfs-badge`, `nfs-label`, `nfs-close-button`, `nfs-dropdown-pane`, and `nfs-responsive-embed` write their settings; `nfs-breakpoint-properties` writes `--nfs-breakpoint-classes`. `nfs-button-group` writes none: it reads `nfs-button`'s ([Spec: Button Group](../issues/82-spec-button-group.md), D11).
- Known `uses` under `NfsBreakpointClassesOverrides` ([Re-run: Off-canvas spec under the class rule](../issues/117-rerun-off-canvas-class-rule.md)): `{entryPoint: 'ngx-foundation-sites/off-canvas', directive: 'NfsOffCanvas', input: 'revealOn', alias: 'NfsClassBreakpoint', shape: 'name'}` and the same for `inCanvasOn`; `position` is closed and has no entry.
- Known `uses` under `NfsResponsiveEmbedRatiosOverrides` ([Spec: Responsive Embed](../issues/96-spec-responsive-embed.md)): `{entryPoint: 'ngx-foundation-sites/responsive-embed', directive: 'NfsResponsiveEmbed', input: 'ratio', alias: 'NfsResponsiveEmbedRatio', shape: 'name'}`.
- The later milestone's families fill the `mixins` and `uses` of their own rows, and add their `uses` under `NfsBreakpointClassesOverrides`, from their specs (Later milestone, below).
- `base` records Foundation's chained defaults: `$button-palette`, `$badge-palette`, and `$label-palette` default to `$foundation-palette`, so their aliases build on `NfsFoundationPaletteColor` (T, B01).

### Later milestone: the registries of the later families and the count kind

Planned and implemented in a later milestone, with the XY, Float, and Flex Grids, the Prototyping Utilities, and the Flexbox Utilities (2026-09-30, [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)); until then a consumer writes those families' Foundation classes as normal classes, and no first-milestone registry is a count. The later milestone adds:

1. These registries, in this order after the first milestone's rows, each with its Variant property:

   | Sass setting | Registry | Variant property | Kind | Defaults | Base | Families |
   | --- | --- | --- | --- | --- | --- | --- |
   | `$prototype-display` | `NfsPrototypeDisplayOverrides` | `--nfs-prototype-display` | names | `inline inline-block block table table-cell` | none | Prototyping Utilities |
   | `$prototype-position` | `NfsPrototypePositionOverrides` | `--nfs-prototype-position` | names | `static relative absolute fixed` | none | Prototyping Utilities |
   | `$prototype-overflow` | `NfsPrototypeOverflowOverrides` | `--nfs-prototype-overflow` | names | `visible hidden scroll` | none | Prototyping Utilities |
   | `$prototype-sizes` | `NfsPrototypeSizesOverrides` | `--nfs-prototype-sizes` | names | `25 50 75 100` | none | Prototyping Utilities |
   | `$prototype-text-decoration` | `NfsPrototypeTextDecorationOverrides` | `--nfs-prototype-text-decoration` | names | `overline underline line-through` | none | Prototyping Utilities |
   | `$prototype-text-transformation` | `NfsPrototypeTextTransformationOverrides` | `--nfs-prototype-text-transformation` | names | `lowercase uppercase capitalize` | none | Prototyping Utilities |
   | `$prototype-style-type-unordered` | `NfsPrototypeStyleTypeUnorderedOverrides` | `--nfs-prototype-style-type-unordered` | names | `disc circle square` | none | Prototyping Utilities |
   | `$prototype-style-type-ordered` | `NfsPrototypeStyleTypeOrderedOverrides` | `--nfs-prototype-style-type-ordered` | names | `decimal lower-alpha lower-latin lower-roman upper-alpha upper-latin upper-roman` | none | Prototyping Utilities |
   | `$prototype-arrow-directions` | `NfsPrototypeArrowDirectionsOverrides` | `--nfs-prototype-arrow-directions` | names | `down up right left` | none | Prototyping Utilities |
   | `$grid-columns` | `NfsGridColumnsOverrides` | `--nfs-grid-columns` | count | 12 | none | XY Grid |
   | `$xy-block-grid-max` | `NfsXyBlockGridMaxOverrides` | `--nfs-xy-block-grid-max` | count | 8 | none | XY Grid |
   | `$grid-column-count` | `NfsGridColumnCountOverrides` | `--nfs-grid-column-count` | count | 12 | none | Float Grid, Flex Grid |
   | `$block-grid-max` | `NfsBlockGridMaxOverrides` | `--nfs-block-grid-max` | count | 8 | none | Float Grid, Flex Grid |
   | `$grid-column-gutter` (its keys, while a map) | `NfsGridColumnGutterOverrides` | `--nfs-grid-column-gutter` | names | `small medium` | none | Float Grid |
   | `$flex-source-ordering-count` | `NfsFlexSourceOrderingCountOverrides` | `--nfs-flex-source-ordering-count` | count | 6 | none | Flexbox Utilities |
   | `$prototype-spacers-count` | `NfsPrototypeSpacersCountOverrides` | `--nfs-prototype-spacers-count` | count | 3 | none | Prototyping Utilities |

   A single-length `$grid-column-gutter` generates no `.gutter-*` class, so the Float Grid's Library mixin writes `--nfs-grid-column-gutter` as the empty list and the generated file declares `small: false` and `medium: false`. The `mixins` and `uses` of these rows come from those families' specs. The `$grid-column-count` and `$block-grid-max` rows each list the Float and Flex Grids' two mixins, the second exception to one writer per property.
2. Settings that stay deliberately not registries, beside the first milestone's: the `$prototype-*-breakpoints`, `$xy-grid`, and `$flexbox-responsive-breakpoints` flags (they gate classes); `$grid-column-alias` and the Float Grid's class-name parameters (renames of classes directives bind, left unsupported by the Float Grid); `$prototype-sizing` (its names are CSS properties that become attribute names, which a template cannot grow from Sass).
3. The count kind: `kind: 'count'` with `count: number` (Foundation's default) in the manifest, `shape: 'count'` for a use, the `count := a whole number from 0 to 999` production of the Variant property format (a Library mixin writes a count as a bare whole number), the one member `count: N` of a count registry in the Variant declaration file and its reader (a whole-number literal), the drift row "The counts differ | wrong range | `count is <file> in the file and <sass> in <property>`", message M10 ("<property> is '<value>' in <stylesheet>; a count must be a whole number from 0 to 999.") for a count outside 0 to 999 or not a whole number, and the expected model's rule that a count registry records `count` when it differs from the default.
4. The count helpers of the primary entry point (D3), measured by this ticket's probe with TypeScript 6.0.3 (`count: 16` accepted 16 and `'16'` and rejected 17; ranges up to 999 compiled):

   ```ts
   type NfsBelow<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : NfsBelow<N, [...Acc, Acc['length']]>;
   /** The integers Start..End. */
   export type NfsRange<Start extends number, End extends number> = Exclude<NfsBelow<End> | End, NfsBelow<Start>>;
   /** A count registry's `count` member, else the library default D. */
   export type NfsOverridableCountValue<D extends number, R> = R extends { count: infer N extends number } ? N : D;
   /** The range Start..count of a count registry (Start is 1 unless given). */
   export type NfsOverridableCount<D extends number, R, Start extends number = 1> = NfsRange<Start, NfsOverridableCountValue<D, R>>;
   ```

   Ranges for the count families are built from these helpers by their specs: sizes `NfsOverridableCount<12, NfsGridColumnsOverrides>` (1 to 12), offsets `Exclude<NfsOverridableCount<12, NfsGridColumnsOverrides, 0>, NfsOverridableCountValue<12, NfsGridColumnsOverrides>>` (0 to 11), spacers `NfsOverridableCount<3, NfsPrototypeSpacersCountOverrides, 0>` (0 to 3). A count family's transform, keywords (`auto`, `shrink`), and static-attribute strings are its spec's. `NfsBelow` stays module-local, as the other unexported helpers do.
5. The typings check's count clauses: with no declaration file, the default count of each count registry is assignable to each of its uses' write types and the default count plus 1 is not; with the generated probe file, which sets every count registry's `count` to its default plus 4, the raised count is assignable to every count use and the raised count plus 1 is not.
6. The tests' count cases: the property reader's count and invalid count (M10), the expected model's counts at the default and not, the renderer's and reader's `count` member, the drift row, and the Sass fixture `$grid-columns: 16`.

### Hierarchy and package shape

There is no directive family. The pieces, all in the one `ngx-foundation-sites` package:

```
ngx-foundation-sites (primary entry point)
  Variant registries (10 empty interfaces), helper type, Class breakpoint types,
  NfsFoundationPaletteColor, NfsVariantBoolean + nfsVariantBoolean
      ^ import type (no runtime import)                      ^ import (one pure function)
      |                                                      |
ngx-foundation-sites/<entry point>: family aliases (NfsButtonColor, NfsCalloutSize, NfsLabelColor) and Variant inputs

Workspace tooling (Node, CommonJS, not an Angular entry point):
  Variant manifest (JSON)
  shared core: resolve sources, compile Sass, read Variant properties, expected model,
               parse declaration file, compare, render, format
    <- setup generator  ngx-foundation-sites:variant-types       (package "generators": Nx; "schematics": Angular CLI via convertNxGenerator)
    <- sync generator   ngx-foundation-sites:variant-types-sync  (package "generators", hidden)
    <- builder          ngx-foundation-sites:variant-types       (package "builders": Angular CLI and Nx)
```

- Family aliases live in their component's entry point (building-blocks 1.3); the primary entry point holds only what several entry points share: the registries, the helper, the Class breakpoint types, and `NfsFoundationPaletteColor`, the base of three chained registries. A family alias another entry point needs is imported as a type from its own entry point (Button Group's colour from `ngx-foundation-sites/button`).
- The primary entry point imports nothing at runtime. `nfsVariantBoolean` is written without `@angular/core`, so a secondary entry point's import of it adds a few bytes and no Angular code to its chunk, and per-plugin `@defer` splitting is untouched (type-only imports added no runtime import to a secondary's FESM bundle, T round 2).
- One collection file carries both the Nx `generators` entries (native implementations) and the Angular CLI `schematics` entries (the same generator wrapped with `convertNxGenerator`); the package's `generators` and `schematics` fields both point at it. Nx reads `generators` first and treats those entries as native, and the Angular CLI reads `schematics` (Nx `readGeneratorsJson`, `getGeneratorInformation`). The sync generator is marked hidden, as `@nx/js:typescript-sync` is.
- The builder is a plain Architect builder. The package declares it under `builders`, which the Angular CLI runs, and which Nx also runs as an Angular-compatible builder when a package has no `executors` field (Nx `readExecutorJson`: `packageJson.executors ?? packageJson.builders`, then `isNgCompat`). There is no separate Nx executor.
- The tooling is compiled to CommonJS by its own TypeScript step and added to the package beside the Angular entry points; ng-packagr does not build it.

### API: the primary entry point

Types (the registry shapes were measured: T round 2 across a real ng-packagr 22.2 package, and this ticket's probe with TypeScript 6.0.3, where a declared sentinel name reached a name, query, and rules input; the same probe's count measurements belong to the later milestone's count helpers, below):

```ts
type NfsOverwrite<T, U> = Omit<T, keyof U> & U;
type NfsTrueKeys<T> = Extract<{ [K in keyof T]: true extends T[K] ? K : never }[keyof T], string>;
/** Foundation's default names T with the registry U applied: `name: true` adds, `name: false` removes. */
export type NfsOverridableStringUnion<T extends string, U = {}> = NfsTrueKeys<NfsOverwrite<Record<T, true>, U>>;

export interface NfsFoundationPaletteOverrides {}
// ... one empty interface per row of the settings table ...
export interface NfsBreakpointClassesOverrides {}

export type NfsFoundationPaletteColor = NfsOverridableStringUnion<'primary' | 'secondary' | 'success' | 'warning' | 'alert', NfsFoundationPaletteOverrides>;
export type NfsClassBreakpoint = NfsOverridableStringUnion<'small' | 'medium' | 'large', NfsBreakpointClassesOverrides>;
export type NfsClassBreakpointQuery<M extends 'up' | 'only' | 'down'> = NfsClassBreakpoint | `${NfsClassBreakpoint} ${M}`;
export type NfsClassBreakpointRules<V> = { readonly [K in NfsClassBreakpoint]?: V };

export type NfsVariantBoolean = boolean | '' | 'true' | 'false' | null | undefined;
export function nfsVariantBoolean(value: NfsVariantBoolean): boolean;
```

- `nfsVariantBoolean` returns `true` for `true`, `''` (the bare attribute), and `'true'`, and `false` for `false`, `'false'`, `null`, and `undefined`: `booleanAttribute`'s results over a typed parameter, so `dropdown="flase"` fails to compile (T, J05 against J09). A boolean Variant input is declared `input<boolean, NfsVariantBoolean>(false, {transform: nfsVariantBoolean})`.
- The helper aliases that are not exported (`NfsOverwrite`, `NfsTrueKeys`) stay module-local in the typings, as the probe's did across ng-packagr.
- The library's lint configuration allows empty interfaces for the registries.
- Every Variant input follows building-blocks 1.4's authoring rule (explicit type arguments that name exported aliases); the Variant typings check below enforces it.

### API: the Variant property format

The grammar of a Variant property, which the Library mixins write and the generator reads:

```
value  := names | empty
names  := name (sep name)*
sep    := one or more whitespace characters or commas
name   := one class-name token, as Sass prints a map key or list item
empty  := whitespace only
```

- Library mixins write names as a space-separated list on `:root` and the empty list as whitespace only. Dart Sass 1.104 rejects `#{()}` ("() isn't a valid CSS value", measured), so a mixin prints an empty list with `unquote('')`, which compiles to `--nfs-x: ;` expanded and `--nfs-x: ` compressed (measured). In the browser, computed style returns the empty string for an empty list and for a missing property alike (measured in Chromium 153, Firefox 155, and WebKit 26.6 by [Re-run: Button spec under the class rule](../issues/128-rerun-button-class-rule.md); ADR 0040, dated note), so the generator reads the compiled CSS text, which tells the two apart.
- The reader also accepts commas, because Sass prints `map-keys()` as a comma list, and line breaks, because an unoptimized build breaks long lists (SYNC 3). Duplicate names are dropped; order is kept.
- Colour-name keys (`purple`, `teal`, `white`) print as written in both output styles (measured, SYNC 3 and this ticket's probe); reading the compiled text avoids the custom-function trap where they arrive as colours.
- A property appears once per compile. If a compile prints one property twice with different values (a setting reassigned between two includes), the reader reports it rather than guessing.

### API: the Variant declaration file

One file per project that needs one, named `nfs-variants.d.ts` at the project's source root (ADR 0040). Its generated form:

```ts
// Generated by ngx-foundation-sites from <stylesheet>. Do not edit; run `nx sync` or `nx run shop:nfs-variants` to update it.
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsBreakpointClassesOverrides {
    xlarge: true;
  }
  interface NfsButtonPaletteOverrides {
    purple: true;
    warning: false;
  }
  interface NfsResponsiveEmbedRatiosOverrides {
    'ultra-wide': true;
  }
}

// Makes a running dev server re-check templates after every change to this file.
declare global {}
```

Format rules, which make the output deterministic for the same Sass, library version, and formatter settings:

- The first line is the header: `// Generated by ngx-foundation-sites from <sources>. Do not edit; run <command> to update it.` `<sources>` lists the compiled stylesheets as workspace-relative paths with `/`, joined by `, ` (shown as `<stylesheet>` in this spec's examples). `<command>` depends only on the workspace kind, so every writer prints the same header: `` `nx sync` or `nx run <project>:nfs-variants` `` in an Nx workspace (one with `nx.json`), and `` `ng run <project>:nfs-variants` `` on the Angular CLI. The header carries no library version, so an upgrade that changes nothing else rewrites nothing. The header is not part of the compared model; only its first words mark ownership.
- Then `import 'ngx-foundation-sites';`, which makes the file a module; without it, `declare module` is an ambient module that replaces the library's types (TS2305, ALT 2.3).
- Then one `declare module 'ngx-foundation-sites'` block. Inside it, one interface per registry that differs from its defaults, ordered by registry name in code-unit order; a registry equal to its defaults is left out, and the block may be empty.
- In a names registry, added names come first as `name: true`, sorted in code-unit order, then removed names as `name: false`, in the order the registry's defaults list them (the base setting's effective order for a chained registry).
- A name is written as an identifier when it is one (letters, digits, `_`, `$`, not starting with a digit), and as a single-quoted string otherwise (`'extra-large': true`, `'33': true`). Numeric-like names are always quoted: in this ticket's probe a bare numeric addition (`33: true`) dropped out of the string union, and a bare numeric removal of a default (`50: false`) collapsed the whole union to `never`, while the quoted forms added and removed as intended.
- Then a blank line, the comment `// Makes a running dev server re-check templates after every change to this file.`, and `declare global {}`. An empty global augmentation makes TypeScript's builder treat each change to the file as affecting every file (`isFileAffectingGlobalScope`, checked before its `isolatedModules` shortcut), and `@angular/build`'s dev server computes template diagnostics only for affected files, so every rewrite reaches the templates' diagnostics under `ng serve` and `nx serve` (measured by [Prototype: Variant declaration tooling in real Nx and Angular CLI workspaces](../issues/137-prototype-variant-declaration-tooling.md), question 1; without it only the dev server's first incremental rebuild re-checks templates). The line is part of the rendered format, not of the compared model: a generated file without it is not rewritten for it alone, and the next rewrite adds it.
- UTF-8 without a byte order mark, LF line endings, two-space indent, a final newline.
- After rendering, the text is formatted with the workspace's own Prettier and its configuration when Prettier resolves from the workspace root and does not ignore the file; otherwise it is written as rendered. So the file matches the consumer's formatter and `prettier --check` stays green.

Ownership and reading:

- The tooling owns a file whose first line starts with `// Generated by ngx-foundation-sites`, or a file that does not exist yet. It never overwrites any other file: a file without the header is hand-written, and the tooling leaves it alone.
- Reading a generated file uses TypeScript's parser alone (`createSourceFile`, no program, no type checker). It records every interface inside every `declare module 'ngx-foundation-sites'` block (several blocks merge, as TypeScript merges them), and for each interface its name, and each member as a name with the literal type `true` or `false`. Comments, blank lines, and an empty `declare global {}` are ignored. A generated file edited into anything the reader cannot model (a member typed with anything but those literals, a derived type, a bare numeric key, an interface the manifest lacks) differs from the expected model and is rewritten.
- Comparison is by meaning: the expected model from the Sass against the file's model, registry by registry. Formatting, quotes, member order, and line endings never count. A generated file is rewritten only when the models differ; a model-equal file is left untouched, so a formatter's changes never cause churn.
- A hand-written file follows the rules of the generated form, as documented usage: `import 'ngx-foundation-sites';` or another top-level `import` or `export` first, because without one its `declare module` is an ambient module that replaces the library's types (TS2305); interfaces only inside the `declare module 'ngx-foundation-sites'` block, each named after a registry of the settings table above (an interface of another name declares a new, unused interface); members `name: true` or `name: false`, numeric names quoted (`'33': true`). The consumer keeps it in step with the Sass by hand.

Declaration drift, what the file and the Sass can disagree on, and the line the sync generator's summary (M1) gives each difference a rewrite removes:

| Drift | Effect while it lasts | Summary line |
| --- | --- | --- |
| The Sass generates a name the file does not declare | a template using it fails to compile (loud) | `add <name>: true` |
| The file declares a name the Sass does not generate | compiles, renders a class with no CSS (silent) | `remove <name>: true` |
| The Sass removed a default the file keeps | compiles, renders nothing (silent) | `add <name>: false` |
| The file removes a default the Sass generates | a template using it fails (loud) | `remove <name>: false` |

The open-typing opt-out (ADR 0040) lives in a separate, hand-written module of the consumer's, never in the generated file, as `[name: string]: boolean` inside the registry. The `boolean` form merges with the generated file's `name: false` members; a `[name: string]: true` signature conflicts with them, and the Angular CLI's default `skipLibCheck: true` hides that conflict (measured).

### API: the shared core

Pure functions over a small file-system interface (read, exists, write), so the Nx entry points pass Nx's `Tree` and the builder passes the real file system; the Sass compile reads the real file system in both.

1. Resolve the sources of a project from its `nfs-variants` target options:
   - With `buildTarget` (default `<project>:build`): read that target's options merged with its configuration, the one the `buildTarget` string names or else the target's `defaultConfiguration` (Angular's own merge: base options, then the configuration's). Take every global stylesheet entry of `styles` whose input ends in `.scss` or `.sass` and that is injected (a string entry, or an object without `inject: false`), and `stylePreprocessorOptions.includePaths` as load paths. A configuration of the same target that overrides `styles` or `stylePreprocessorOptions` produces warning M11.
   - With `stylesheets` (and optional `includePaths`): exactly those files, for a library project or a lazily loaded stylesheet. `stylesheets` and `buildTarget` are exclusive.
2. Compile each source with the Sass compiler the application builder itself loads, resolved from `@angular/build`: `sass-embedded`, its dependency, or its pure-JS `sass` dependency when `NG_BUILD_SASS_EMBEDDED` is `0` or `false` (`@angular/build` 22.2.0 `src/utils/environment-options.js`), through `initAsyncCompiler()`, because the importer is asynchronous. Options: `style: 'expanded'`, the load paths, Sass warnings silenced (Foundation's `@import` and global-function deprecations), and the application builder's importer (`src/tools/esbuild/stylesheets/sass-language.js`): relative imports as Sass does them; every bare specifier, and every `pkg:` URL with `pkg:` removed, resolved from the importing file's directory by esbuild's resolver (the esbuild `@angular/build` depends on, called through a context whose plugin exposes `build.resolve`) with the builder's stylesheet options, `conditions: ['style', 'sass', 'less']` plus `production` or `development` by the build's style optimization, `mainFields: ['style', 'sass']`, and `resolveExtensions: []` (`src/tools/esbuild/stylesheets/bundle-options.js`), which is how `@import 'ngx-foundation-sites';` reaches the library's `_index.scss` through the `sass` export condition (ADR 0012); then the builder's deep-import fallback (the package root found through `<name>/package.json`, plus the rest of the path); then the load paths. There is no `~` handling and no Sass `NodePackageImporter`: the builder strips no `~` from Sass imports, and `NodePackageImporter` prefers a package's `sass` field where the builder takes `style` (both measured by the prototype, which found the core's properties equal to the built `styles.css` in eight cases).
3. Read the Variant properties: for each registry of the manifest, find its property's declarations in the compiled CSS and parse the value with the Variant property format. A registry whose property is absent from every source is absent: its registry stays empty (Foundation's defaults), because a project includes only the Library mixins it uses; a stylesheet that prints no Variant property at all leaves every registry at Foundation's defaults. The documented setup is `@import 'ngx-foundation-sites';` after the Foundation imports and the Library mixin of each family the consumer customises (for example `@include nfs-button;`). When two sources print the same property with different values, the project fails with M12.
4. Build the expected model. A names registry with a `base` compares against the base setting's found names, or the base's defaults when the base's property was not found (its registry then stays empty, so its alias still means the defaults); any other names registry compares against its own defaults. Added names are the found names outside those, and removed names are those not found.
5. Parse the existing generated file (above).
6. Compare the models and list the drift.
7. Render and format (above).
8. Messages (below).

### API: the setup generator and schematic

`nx g ngx-foundation-sites:variant-types` in an Nx workspace, `ng g ngx-foundation-sites:variant-types` on the Angular CLI (the same Nx generator through `convertNxGenerator`).

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `projects` | `string[]` | every application project with an Angular application build target | The projects to set up |
| `buildTarget` | `string` | `<project>:build` for an application | The build target whose global stylesheets and Sass options the tooling compiles; for a library, the build target of the application it is tested against. Only with one project |
| `stylesheets` | `string[]` | none | Workspace-relative stylesheets to compile instead of a build target's, such as a library's Storybook preview stylesheet. Only with one project; exclusive with `buildTarget` |
| `includePaths` | `string[]` | none | Sass load paths for `stylesheets` |
| `sync` | `boolean` | `true` in an Nx workspace, ignored elsewhere | Register the sync generator on the project's targets |
| `applyChanges` | `boolean` | `false` | Nx only: set `sync.applyChanges: true` in `nx.json`, so tasks apply every sync generator's changes without a prompt |
| `npmScripts` | `boolean` | `false` | Angular CLI only: add or extend `prebuild`, `prestart`, and `pretest` to run each project's `nfs-variants` target |

What it does, per project, and idempotently:

1. Resolve and compile the sources (core 1 to 4). A project that fails (M8, M12) is skipped with its message, and nothing is written for it; the generator fails only when no project succeeds.
2. Add the `nfs-variants` target if the project has none:

   ```json
   "nfs-variants": {
     "executor": "ngx-foundation-sites:variant-types",
     "options": { "buildTarget": "shop:build" }
   }
   ```

   in `project.json` (Nx, `executor`) or `angular.json` (Angular CLI, `builder` for `executor`), with `stylesheets` and `includePaths` in place of `buildTarget` when given. On the Angular CLI the generator edits `angular.json` itself: `@nx/devkit`'s `getProjects` and `readProjectConfiguration` read an `angular.json` project (with `builder` renamed to `executor`), but `updateProjectConfiguration` writes a project without a `project.json` into the root `package.json`'s `nx` field (measured by the prototype). Nx caches nothing for this target.
3. Write the Variant declaration file when it is absent or generated; keep a hand-written one untouched and list it in the summary (M13).
4. Make every TypeScript configuration of the project that type-checks it see the file: the `tsConfig` of each target the sync generator is registered on (below) and the project's Storybook TypeScript configuration when it has one. A configuration whose `include` or `files` already matches the file is left alone; the generator adds the file to `include` of any other and reports each edit. A library build target (`@nx/angular:package`, `@nx/angular:ng-packagr-lite`) is the exception: ng-packagr sets the program's root names to the entry file (ng-packagr 22.2.0 `src/lib/ts/tsconfig.js`), so `include` and `files` never reach it; the generator adds the file's path relative to that `tsConfig` (`./src/nfs-variants.d.ts`) to its `compilerOptions.types`, and only reports the edit when the configuration lists no `types`, since adding the option there would switch off automatic `@types` inclusion (measured by the prototype: the library build failed with TS2322 on a declared name while its `include` matched the file, and passed with the `types` entry, which the emitted typings do not reference). The Angular CLI and Nx application templates already include the file (`src/**/*.ts` in the application program, `src/**/*.d.ts` in the test program; verified by the typing decision and by the prototype's unit-test runs).
5. Nx with `sync` on: for each of the project's targets whose executor type-checks it (the table below), add `"syncGenerators": ["...", "ngx-foundation-sites:variant-types-sync"]` to that target in `project.json`, keeping anything already listed. The `"..."` spread keeps the generators that `targetDefaults` and inferred targets contribute (Nx 23.2.1 project configuration reference: `syncGenerators` accepts the array spread).
6. Nx with `applyChanges`: set `sync.applyChanges: true`.
7. Angular CLI with `npmScripts`: add `"prebuild": "ng run shop:nfs-variants"` and the same for `prestart` and `pretest`, one `ng run` per project joined with `&&`, appended with `&&` to an existing script.
8. Under Nx, format the edited files with `formatFiles` (Nx writes JSON unformatted; the Angular CLI formats a schematic's output with the workspace's Prettier itself, `@angular/cli` 22.2.0 `src/utilities/prettier.js`). Then print the summary (M13): what it wrote and edited, the hand-written files it kept, and the dev-server note.

Targets that get the sync generator (by executor, plus Storybook's inferred targets by name):

| Executor or target | Why |
| --- | --- |
| `@angular/build:application`, `@nx/angular:application`, `@angular-devkit/build-angular:application` | the build type-checks templates |
| `@angular/build:dev-server`, `@nx/angular:dev-server`, `@angular-devkit/build-angular:dev-server` | `nx serve` syncs once at start (SYNC 4.3) |
| `@angular/build:unit-test`, `@nx/angular:unit-test`, `@angular/build:karma` | the test program includes the file |
| `@nx/angular:package`, `@nx/angular:ng-packagr-lite` | a library build compiles its own templates |
| targets named `storybook`, `build-storybook`, `test-storybook`, `typecheck` | Storybook's program and plain TypeScript checks read the registries too |

Why per-project registration and not `targetDefaults` keyed by executor: Nx resolves target defaults by choosing one key, the executor key first when it exists, then the exact target name, and uses only the entries of that key (Nx `resolveTargetDefault`: "the executor key (when the target has that executor and the key exists) wins, then the exact target-name key"). An entry added under `@angular/build:application` would therefore replace, for every such target, a workspace's existing `build` defaults (`dependsOn: ['^build']`, `cache`, `inputs`), silently. Registration on the covered project's own targets touches no other project and keeps every default. Measured by the prototype with `nx show project --json`: per-project entries with the spread kept name-keyed defaults (`dependsOn`, `cache`, `inputs`), the executor-keyed `@angular/build:application` entry that Nx 23.2.1's `angular-monorepo` preset writes, another tool's executor-keyed `syncGenerators`, and the inferred Storybook targets; executor-keyed entries added for the sync generator dropped the name-keyed `dependsOn` and `inputs`, and Nx 23.2.1 warned that 'an executor key hides the target name key entirely'.

### API: the Nx task sync generator

`ngx-foundation-sites:variant-types-sync`, registered by the setup generator, run by Nx before each registered task outside CI and by `nx sync`.

- Nx calls it with the tree alone. It reads the project graph (`createProjectGraphAsync()`, as `@nx/js:typescript-sync` does), so inferred targets count, and covers every project that has a target whose executor is `ngx-foundation-sites:variant-types`, with that target's `options`. One run covers the whole workspace.
- For each project it runs core 1 to 6. A generated or missing file whose model differs is written into the tree (rendered and formatted); anything else is left untouched. Nx counts a sync generator as out of sync only when it changes the tree or throws (Nx `getSyncGeneratorChanges` keeps a result only if it has an error or `changes.length > 0`), so a model-equal file is in sync whatever its bytes.
- It returns `outOfSyncMessage` (M1) and one `outOfSyncDetails` line per changed file (M1), which Nx prints when it prompts before a task or stops one.
- A hand-written file is left untouched.
- Failures: a project whose compile fails (M8) or whose sources disagree (M12). The generator collects every project's failure and throws one plain `Error` listing each project with its fix (M2). It does not use Nx's `SyncError`, which only `@nx/devkit/internal` exports; Nx prints a plain error's message the same way (`errorToString`). A throw discards that run's other changes; they are applied by the first run after the fix.
- What Nx does around it (measured on Nx 23.2.1, SYNC 4.2 and 4.3, and read in the task runner's source): in a terminal, Nx prompts before applying unless `sync.applyChanges` is `true`; outside a terminal without `CI` (git hooks, agent shells, IDE tasks) it stops the task on any drift, whatever `applyChanges` says; with `CI` set it skips task sync generators entirely. With the daemon on, each batch of workspace file changes reruns it in the background, one Sass compile per covered project (0.6 to 0.8 s each with `foundation-everything` and `sass-embedded` on win32-arm64, measured by the prototype; the pure-JS `sass` asynchronous compiler took 8.5 to 9.5 s for the same compile); results reach disk only when a command flushes them.

### API: the Architect builder

`ngx-foundation-sites:variant-types`, the executor of every `nfs-variants` target.

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `buildTarget` | `string` | `<project>:build` | As in the setup generator |
| `stylesheets` | `string[]` | none | As in the setup generator |
| `includePaths` | `string[]` | none | As in the setup generator |

- `ng run shop:nfs-variants`, `nx run shop:nfs-variants`: writes the file when it is absent or generated and its model differs; leaves a hand-written file untouched; succeeds silently when in step.
- It reads the build target's options through Architect (`context.getTargetOptions`, which applies the configuration the `buildTarget` string names, else the target's `defaultConfiguration`: Architect 0.2202.0 `getOptionsForTarget`), so it compiles with the application's own `styles` and Sass options.
- Its schema's `$schema` is `http://json-schema.org/draft-07/schema`. A schema naming `https://json-schema.org/schema` made `ng run` fetch the URL and fail with a 301 and exit 127 (measured, SYNC 5.1).
- It imports neither `nx` nor `@nx/devkit`, so the builder runs on an Angular CLI workspace with only `@angular-devkit/architect`, which the CLI installs.

### Workspace configuration

- Nx: the setup generator writes the `nfs-variants` target and the per-target `syncGenerators` entries in `project.json`, and `sync.applyChanges` in `nx.json` only when asked. It adds no `targetDefaults` entry.
- Angular CLI: the `nfs-variants` target in `angular.json`, optional npm scripts, nothing else.
- Dependencies: the Variant tooling adds no dependency to applications and no `dependencies` entry to the package. It loads, only when it runs: `sass-embedded` (or `sass`) and `esbuild`, both dependencies of `@angular/build`, and `typescript` (in every Angular workspace), `@angular-devkit/architect` (the builder), `nx` and `@nx/devkit` (the generators; optional peer dependencies of the package at the Nx major the release is tested with, `^23.0.0` first), and `prettier` if installed. A missing package ends the run with M9 naming the install command. The schematic therefore needs `nx` and `@nx/devkit` as development dependencies on an Angular CLI workspace (36 MB on win32-arm64, SYNC 5.3); the builder does not.
- Nothing is ever written under `node_modules` (veto C).

### Keeping the file in step (documented usage)

- The generated file is committed with the Sass change that changed it. Tasks skip sync generators in CI, and a build against a stale file passes and ships a Variant with no class (SYNC 4.2), so CI builds against the committed file; Nx Cloud distributed agents set CI variables too.
- Nx: outside CI, the sync generator runs before every registered task. Local non-interactive runs (git hooks, agent shells) run `npx nx sync` first, because Nx stops a task on drift outside a terminal. A workspace that declines the sync generator runs `npx nx run-many -t nfs-variants` after a Sass change.
- Angular CLI: `npx ng run <project>:nfs-variants` after a Sass change, or the optional npm `pre` scripts.
- The setup generator edits no CI file.

### Shared libraries (the shared-library rule)

- A library project needs a Variant declaration file only when its own programs (its build, type check, tests, or Storybook) use names Foundation's defaults lack. It gets one exactly as an application does: its own `nfs-variants` target, with `buildTarget` naming the application build target it is tested against, or `stylesheets` (and `includePaths`) naming its own stylesheet, typically its Storybook preview stylesheet. The file sits at the library's source root, where the library's programs include it.
- No program merges several applications' files. Merging adds every application's names and removes every application's removals, and a member that differs between two files (`purple: true` in one, `purple: false` in the other) is a declaration conflict that the default `skipLibCheck: true` hides (this ticket's probe: conflicting members across `.d.ts` files compiled without a diagnostic under `skipLibCheck: true`).
- Each application's own build stays the authority: a library component that uses `purple` compiles in the library and in `shop`, and fails in `admin`, whose Sass lacks it (SYNC 4.4, measured on the stand-in).
- Storybook: `@storybook/angular-vite` 10.6 compiles stories in JIT mode by default and reported no template diagnostics with `jit: false` either, so `storybook dev`, `storybook build`, and the `@storybook/addon-vitest` run neither check a Variant name nor fail without the file; a story's `args` are checked only by a type check of the Storybook TypeScript configuration (a `typecheck` target running `tsc -p .storybook/tsconfig.json`; measured: TS2322 on `color: 'purple'` without the setup's `include` edit, clean with it). Its docgen skips type aliases declared in declaration files, so a Variant input typed with an alias from the installed package gets no select control (a JSON editor), with or without the file; such a story lists `argTypes.<input>.options` itself. An alias declared in the project's own source gets an enum of its names, including names that a declaration file in the source tree adds (all measured by the prototype).
- ngx-foundation-sites itself needs no Variant declaration file: its stories and tests use Foundation's default names, and its Storybook settings change values, never names ([Storybook conventions for the new library](../issues/58-storybook-conventions.md), section 5).

### Messages

Every message starts with `ngx-foundation-sites:` and names the project, the file, and the stylesheet where it has them.

| Id | When | Text (placeholders in angle brackets) |
| --- | --- | --- |
| M1 | Nx sync, changed files | Message: "the Variant declaration files no longer match the Sass they are generated from." Detail per file: "<file> (<project>, from <sources>): <drift summary>" |
| M2 | the sync generator's thrown error | "could not keep the Variant declaration files in step for <n> project(s):" then "<project>: <message>" per project |
| M8 | Sass compile error | "compiling <stylesheet> for <project> failed: <Sass message and span>" |
| M9 | missing package | "the <generator, schematic, or builder> needs <package>. Install it: npm install --save-dev <packages>" |
| M11 | a configuration changes the styles (warning) | "the <configuration> configuration of <buildTarget> changes styles or stylePreprocessorOptions; <file> follows <used configuration>." |
| M12 | sources disagree | "<property> lists different names in <stylesheet A> and <stylesheet B>; name the one to follow in the nfs-variants target's stylesheets option." |
| M13 | setup summary | what was written and edited per project, each hand-written file it kept, and, for a kept file that has no global augmentation, "Add declare global {} to <file>, or restart the dev server after the file changes." |

### Comparison with Angular Material, the CDK, and prior art

| Concern | Prior art | This tooling | Why |
| --- | --- | --- | --- |
| Typed theme names | MUI and Mantine: declaration merging into empty `...Overrides` interfaces, written by hand | The same registry shape (`name: true`/`false`), with the file generated from the Sass | Foundation's names live in Sass, so a hand list goes stale (ADR 0040) |
| Code generation | Chakra `typegen` writes into the installed package; Panda `codegen` writes a folder in the project | Writes one file in the project's source tree | Writing into `node_modules` is vetoed |
| Keeping in step | `@nx/js:typescript-sync` (a sync generator reading the project graph) | A task sync generator reading the project graph | Nx's own mechanism for files generated before tasks |
| Schematics | Angular Material ships `ng add` and `ng generate` schematics written for the devkit | One Nx generator exposed as a schematic through `convertNxGenerator` | The user's rule: Nx generator first |
| Build-time hooks | `@angular/build` 22.2 has no hook in its Sass compile; code plugins never see it | A separate step before tasks, and a committed file | Regenerating inside the build is not adopted (ADR 0040) |

Borrowed: MUI's registry semantics, typed-scss-modules' write-only-when-different, `typescript-sync`'s project-graph reading. Not borrowed: generated narrowing directives, an ESLint rule, a language-service plugin, a watcher, a wrapper around the application builder (all not adopted by ADR 0040).

### Implementation level and primitives

Implementation level: not an Implementation level choice, as building-blocks Table C records for this utility: the order of native platform, `@angular/aria`, `@angular/cdk`, and custom Angular ranks the primitives a directive or component is built on, and nothing here is one or runs in a browser. The types are declaration merging, and the tooling is Node code. The browser target does not apply; the tooling runs in Node at development and CI time. Primitives: the Sass JavaScript API (`initAsyncCompiler`, `compileAsync`, a file importer), esbuild's `build.resolve` from the esbuild `@angular/build` depends on, TypeScript's parser (`createSourceFile` only), `@nx/devkit` (`Tree`, `createProjectGraphAsync`, project configuration helpers, `convertNxGenerator`), `@angular-devkit/architect` (`createBuilder`, `getTargetOptions`, `getProjectMetadata`), and Prettier when present. On the Angular side: TypeScript types and one pure function; no `@angular/aria`, CDK, or runtime Angular API.

### ARIA and keyboard

None: nothing here renders.

### WCAG 2.2 AA

No criterion applies: the tooling and the types render nothing and change no markup. The accessibility of each Variant (contrast, target size) belongs to its component spec and its Library mixin; a consumer name added through the declaration file gets the same rules, because the mixin reads the same Sass.

### Rendered output

The only output is the Variant declaration file (the API section). The Variant properties it reads are written by the component specs' Library mixins and by `nfs-breakpoint-properties` (ADR 0012, dated note); this spec fixes their format and nothing else.

### Animation

None: nothing here renders, so there is no State class, Motion class, or reduced-motion rule (Sass, item 4).

### Rendering modes

The types have no runtime. `nfsVariantBoolean` is a pure function with the same result on the server and in the browser, so a Variant input's class is in server HTML exactly as on the client. The tooling runs before builds, never in an application.

### The Variant typings check (the build assertion)

After every library build, before tests that consume the package and before publishing, a Node step checks the packed typings against the manifest's `uses`:

1. Names: for each use, the emitted typings of its entry point declare the directive's input with an `InputSignal` or `InputSignalWithTransform` whose write type argument names the use's alias (read from the typings' syntax tree with TypeScript's parser).
2. Behaviour: two generated probe programs, type-checked with `tsc` against the packed package resolved through its `exports`:
   - with no declaration file: every default name of each registry is assignable to each of its uses' write types, and the sentinel name is not;
   - with a generated declaration file that adds the sentinel `nfsProbeSentinel` to every registry and removes every default: the sentinel is assignable to every name, query, and rules use (a rules use as the key `{nfsProbeSentinel: ...}`), and a removed default and a misspelt name are not (`@ts-expect-error`, so an unexpected pass fails as TS2578).
   - The write type is read as `S extends InputSignalWithTransform<any, infer W> ? W : never` from the directive's public input member, which is what the template type check assigns to (measured with `@angular/core` 22.2.0 types: `unknown` in place of `any` infers `never`).
3. Sass: compiling Foundation 6.9's defaults with `@import 'ngx-foundation-sites';` and every Library mixin prints, for every registry, exactly the manifest's defaults in the Variant property format, and each registry's property is printed by exactly the mixins its `mixins` field names.

A failure names the use and what went wrong. The check lives in the library's own workspace; consumers never run it.

## Testing Decisions

A good test asserts what a developer observes: the file the tooling writes, the exit status and message of a command, the diagnostics TypeScript reports against the file, and the workspace configuration the setup leaves; never the core's internal data structures. Prior art: Nx's own generator tests on a virtual tree (`createTreeWithEmptyWorkspace`), Nx plugin workspace e2e tests, Architect's `TestingArchitectHost`, and the probes of [Decide: typed Variant inputs over open Sass maps](../issues/81-decide-typed-variant-inputs-open-sass-maps.md) and [Research: further typing and synchronisation options for Variant inputs](../issues/135-research-further-variant-typing-options.md), whose cases the tests keep.

### 1. Story play function

No stories: nothing here renders. The component specs' stories use Foundation's default names, so the library's Storybook program needs no declaration file.

### 2. Browser-level test (Vitest browser mode, `npx nx test <lib>`)

No cases: nothing here touches the DOM. `nfsVariantBoolean` is pure logic (layer 3).

### 3. Node-level Vitest

In the library's `test` target (`<name>.spec.ts` beside the tooling source), and, for the workspace cases, in the tooling e2e project's `e2e` target, which also runs Vitest in Node. SSR smoke: none, because nothing here renders on the server; `nfsVariantBoolean`'s server behaviour is its pure result.

Pure logic (table-driven):

- `nfsVariantBoolean` over its whole parameter type.
- The Variant property reader: space and comma lists, line breaks, duplicates, the empty list (`--nfs-x: ;` and compressed `--nfs-x: `), a property printed twice with different values (M12), colour-name keys.
- The expected model: additions and removals, a chained registry against a found base, against a missing base, and a base-added name removed by the child (`purple: false` on buttons), a missing property leaving the registry empty, zero properties leaving every registry empty.
- The renderer: the header per workspace kind (the same from the sync generator and the builder), registry and member order, identifier and quoted keys (`'extra-large'`, `'ultra-wide'`, `'33'`), the empty block, LF and final newline; the same model renders the same bytes twice.
- The reader: generated files; several `declare module` blocks; CRLF; single and double quotes; a generated file edited into a derived member type, a bare numeric key, or an unknown interface compares unequal and is rewritten.
- The comparison: each drift row of the table; a Prettier-reformatted generated file compares equal; a model-equal file is not rewritten.

Generators and builder:

- Setup generator on a virtual tree (Nx and Angular CLI layouts): targets written in `project.json` and `angular.json`; `syncGenerators` entries with the spread added only to the listed executors and Storybook targets, existing entries kept; no `targetDefaults` change; `sync.applyChanges` only with the flag; npm scripts added and appended; tsconfig includes added only where missing; a hand-written file kept untouched and listed in the summary; a failing project skipped; a second run changes nothing.
- Sync generator on a virtual tree with a stubbed project graph: in step (no tree change), drifted (one change, M1 details), a formatted but model-equal file (no change), several projects in one run, a failing project (one thrown error listing it, M2).
- Builder under `TestingArchitectHost`: in step (no write), drifted (one write), a hand-written file left untouched, the configuration merge, M11.

Sass fixtures (real Dart Sass 1.104 over Foundation 6.9.0 and the library's `_index.scss`): the first dossier's customised settings (`purple` added to `$button-palette`, `warning` removed from `$label-palette`, a `huge` size, `xlarge` added to `$breakpoint-classes`) produce the expected file; a flag-off family prints the empty list; the manifest-to-Sass check of the typings check, item 3.

The Variant typings check (items 1 and 2) runs as its own target after the library build, in CI and before publishing.

Workspace e2e (the tooling e2e project, against the packed package installed into scratch workspaces created per run):

- Nx 23.2 workspace, two applications and a shared library: `nx g ngx-foundation-sites:variant-types` writes both files and the targets; after `warning` is removed from one application's Sass, `CI=true nx build <app>` passes against the stale file (the hazard committing the file in step removes); `nx sync` rewrites it, with the file and `warning: false` in its M1 details; `nx build <app>` then fails with TS2322 on the template's `color="warning"`; the library with its own `nfs-variants` target from an application's build target type-checks a template that uses that application's name.
- The same workspace with an existing `targetDefaults.build` entry (`dependsOn: ['^build']`): after setup, `nx show project <app> --json` still lists that `dependsOn` and lists the sync generator on `build`, `serve`, and `test`.
- Angular CLI 22.2 workspace: `ng g ngx-foundation-sites:variant-types --npm-scripts` with `nx` and `@nx/devkit` installed writes `angular.json` and the scripts; after a Sass change `ng run <app>:nfs-variants` rewrites the file and `npm run build` regenerates it first; without `nx` installed, the schematic ends with M9 while the `nfs-variants` target still runs.
- Dev server: under `ng serve` and `nx serve`, five alternating rewrites of the generated file (a Sass edit, then `ng run <app>:nfs-variants` or `nx sync`) each change the template diagnostics (TS2322 appears and disappears), also after a component edit spent the first incremental rebuild; a file without `declare global {}` keeps its cached diagnostics in that case (the control).

### 4. Playwright e2e

No cases: nothing here runs in a browser. The workspace e2e above takes its place, in node-level Vitest, because every case is a command and its output.

## Out of Scope

- Writing the Variant properties: each Library mixin's spec owns its rules; this spec fixes the property names and format.
- The family aliases, input names, value shapes, transforms, and class mappings of each Variant family: the component specs.
- An `ng add` or `nx add` entry for the whole library: additive in any release (ADR 0045), and such an entry would also have to decide the Sass import, the settings overrides, and the `nx` and `@nx/devkit` development dependencies the schematic needs on an Angular CLI workspace, which no spec has designed; the setup generator is the install step. A migration for the Variant declaration file: the next sync rewrites the generated file for any registry change an upgrade brings (D29); a hand-written file is the consumer's to update. The library's own migrations follow ADR 0045 (Nx migrations in the package's `migrations.json`, reused as `ng update` migrations) and arrive with the first release that needs one, because `nx migrate` and `ng update` read the migrations of the version they move to; a renamed registry interface follows ADR 0045's deprecation rule, because a hand-written file (ADR 0040) keeps the old name.
- A watch mode, an esbuild plugin, a builder that wraps `@angular/build:application`, an ESLint rule, a language-service plugin, generated narrowing directives, a provider or theme constant as the source of names, and the reverse direction (TypeScript or design tokens as the source): not adopted by ADR 0040.
- Merging several applications' files into one program: merging adds every application's names and removes every application's removals, and conflicting members pass unseen under `skipLibCheck: true` (Implementation Decisions; ADR 0040, dated note).
- Editing CI configuration files: CI configuration is the workspace's own, and the tooling writes only files it generated (ADR 0040, dated note).
- Caching the sync generator's Sass compile between daemon runs: each run costs one compile per covered project in the background; add a cache keyed on the loaded Sass files if that cost is ever measured as a problem.

## Further Notes

### Design decisions

| # | Decision | Chosen | Alternatives not taken, and why |
| --- | --- | --- | --- |
| D1 | Spec home | A shared-utility spec of its own | Inside the Breakpoint service spec (it owns runtime behaviour, not workspace tooling; the judge's recommendation) |
| D2 | Primary entry point | The first milestone's 10 registries, the union helper, the Class breakpoint types, `NfsFoundationPaletteColor`, `NfsVariantBoolean` and `nfsVariantBoolean`; no runtime Angular import | Family aliases there too (couples every entry point's types to one file); registries per entry point (ADR 0040 chose one module to augment) |
| D3 | Count helpers | Added by the later milestone with its count registries (2026-09-30, [Decide: grids, typography, and utilities move to a later milestone](../issues/174-decide-grids-typography-utilities-later-milestone.md)): `NfsOverridableCount<D, R, Start = 1>` as the range, `NfsOverridableCountValue`, `NfsRange` | Only the range (no way to build offsets 0 to N-1); a helper per family shape (more exports for one idea); shipping them in the first milestone, where no registry is a count (types and tests nothing uses) |
| D4 | Registry list | The 10 settings of the table, named mechanically; the later milestone adds the 16 of its families (2026-09-30) | Registries for `$breakpoints`, flags, or renames (behaviour Options, class existence, and Structural classes are not Variant names) |
| D5 | Manifest | One JSON document in the package with setting, property, kind, defaults, base, mixins, uses | A TypeScript constant (the generator would load Angular code in Node); separate files for the generator and the typings check (two lists) |
| D6 | Chained registries | Diffed against the base setting's effective names | Diffed against library defaults only (would repeat every parent name in every child registry) |
| D7 | Property format | Whitespace or comma list, whitespace-only empty list; the later milestone adds a bare count | `none` as the empty marker (a possible palette name); comma lists only (Library mixins print space lists) |
| D8 | Missing property | Registry stays at its defaults; with zero properties every registry does | Fail on each missing property (forces every Library mixin into every application) |
| D9 | Comparison | By meaning, after parsing with TypeScript's parser | Byte comparison (rewrites after Prettier or a CRLF checkout) |
| D10 | Rewrites | Only a generated or absent file, only when its model differs | Always rewrite (churn and a fight with formatters); overwrite hand-written files (destroys the consumer's content) |
| D11 | Formatting | The workspace's Prettier when it resolves | Nx `formatFiles` in Nx only (the builder would write another format) |
| D12 | Open-typing opt-out | A separate consumer module with `[name: string]: boolean` | Inside the generated file (lost on regeneration); `true` index signatures (conflict with removals, hidden by `skipLibCheck`) |
| D13 | Numeric names | Always quoted | Bare keys (drop out of the union, or collapse it to `never`, measured) |
| D14 | Per-project configuration | The `nfs-variants` target's options, read by the builder and by the sync generator | `nx.json` `sync.generatorOptions` (Nx only; the Angular CLI needs the target anyway); a header that records its sources (configuration hidden in a comment) |
| D15 | Sync registration | Per covered target in `project.json` with the `"..."` spread | `targetDefaults` keyed by executor (the typing decision's first proposal; shadows a workspace's `build` defaults, Nx's key precedence); global sync generators (never run before tasks) |
| D16 | Registered targets | Application, dev-server, unit-test, Karma, and package builders, and `storybook`, `build-storybook`, `test-storybook`, `typecheck` | Only `build`, `serve`, `test` (library builds and Storybook would read a stale file) |
| D17 | `sync.applyChanges` | Left alone unless `--applyChanges` | Always set (changes every sync generator in the workspace, not just this one) |
| D18 | Sync failures | Collected and thrown as one plain `Error` | `SyncError` (only in `@nx/devkit/internal`); reporting failures as out-of-sync details (Nx counts only tree changes as out of sync) |
| D19 | Sources | The build target's injected Sass global stylesheets under the named or default configuration; `stylesheets` to override | Every configuration compiled and required to agree (a compile per configuration on every task for a rare case); the built CSS (only after a build) |
| D20 | Sass resolution | The application builder's importer re-implemented over its own esbuild resolver and stylesheet options, compiled with the Sass compiler it loads (`sass-embedded`), confirmed by the prototype in eight cases | `@angular/build`'s private Sass service (not public API); Node resolution with Sass's `NodePackageImporter` and `~` stripping (both differ from the builder, measured) |
| D21 | Shared libraries | A file of the library's own, from a named build target or stylesheet | Including applications' files (merging hides member conflicts under `skipLibCheck`); no file (the library's own type checks reject application names) |
| D22 | Packaging | CommonJS tooling beside the Angular entry points; generators and schematics in one collection; one Architect builder for both workspace kinds | A separate tooling package (a second version to keep in step with the manifest); an Nx executor beside the builder (two implementations of the same rewrite) |
| D23 | Dependencies | Optional peers loaded on demand, M9 when missing | `dependencies` on `nx` and `@nx/devkit` (installs them for every consumer, used or not) |
| D24 | Keeping in step | The sync generator before tasks outside CI and the `nfs-variants` target; the generated file is committed, and CI builds against it | Regenerating inside the build (`@angular/build` has no Sass hook, tasks skip sync generators in CI, and the CLI has no target dependencies) |
| D25 | npm scripts | Opt-in `--npmScripts` | Always (edits `package.json` scripts for users who run `ng` directly) |
| D26 | Build assertion | Alias names in the emitted typings plus two probe programs from the manifest, plus the manifest-to-Sass compile | The alias-name check alone (misses an intermediate alias or a transform's parameter printed resolved while the input still names its alias); template fixtures per input (needs a selector and element per directive) |
| D27 | Testing layers | Node-level Vitest, workspace e2e included; no story, browser, or Playwright case | A Playwright runner for command tests (no browser behaviour to test) |
| D28 | Dev server | The generated file ends with `declare global {}`, so every rewrite reaches the dev server's template diagnostics (measured by the prototype) | A restart note (the dev server re-checks templates after a rewrite only in its first incremental rebuild, when the placeholder type-check shims are replaced); a shipped watcher; a `/// <reference path>` from the entry file or a `files` entry (measured: neither changes which files are affected) |
| D29 | Library upgrades | The next sync rewrites the generated file for every registry and default change | A migration schematic for the file (the semantic comparison already rewrites it; the library's own migrations are ADR 0045's) |

### Usage examples

A consumer's settings and the file the tooling writes from them:

```scss
// the application's global stylesheet
@import 'foundation-sites/scss/settings/settings';
$button-palette: map-merge($foundation-palette, (purple: #7a3fbf));
$label-palette: map-merge(map-remove($foundation-palette, warning), (alert: #bf3f2c));
$breakpoint-classes: (small medium large xlarge);
$button-sizes: map-merge($button-sizes, (huge: 1.5rem));
@import 'foundation-sites/scss/foundation';
@import 'ngx-foundation-sites';

@include foundation-everything;
@include nfs-breakpoint-properties;
@include nfs-button;
@include nfs-label;
```

```ts
// Generated by ngx-foundation-sites from <stylesheet>. Do not edit; run `nx sync` or `nx run shop:nfs-variants` to update it.
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsBreakpointClassesOverrides {
    xlarge: true;
  }
  interface NfsButtonPaletteOverrides {
    purple: true;
  }
  interface NfsButtonSizesOverrides {
    huge: true;
  }
  interface NfsLabelPaletteOverrides {
    warning: false;
  }
}

// Makes a running dev server re-check templates after every change to this file.
declare global {}
```

Setting up an Nx workspace:

```
npx nx g ngx-foundation-sites:variant-types
```

Setting up an Angular CLI workspace:

```
npm install --save-dev nx @nx/devkit
npx ng g ngx-foundation-sites:variant-types --npm-scripts
npx ng run shop:nfs-variants   # after a Sass change, or through the npm pre scripts
```

A shared library tested against `shop`, and a library with its own Storybook stylesheet:

```
npx nx g ngx-foundation-sites:variant-types --projects=ui --build-target=shop:build
npx nx g ngx-foundation-sites:variant-types --projects=ui-kit --stylesheets=<the library's Storybook preview stylesheet> --include-paths=<Foundation's scss folder>
```

Open typing for one palette, in a module of the consumer's own beside the generated file:

```ts
import 'ngx-foundation-sites';

declare module 'ngx-foundation-sites' {
  interface NfsButtonPaletteOverrides {
    [name: string]: boolean; // any string compiles for buttons; a name the CSS lacks renders a class with no CSS
  }
}
```

What `nx sync` reports (M1) when it rewrites the file after `purple` was dropped from `$button-palette` and `warning` put back into `$label-palette`:

```
ngx-foundation-sites: the Variant declaration files no longer match the Sass they are generated from.
  <file> (shop, from <stylesheet>): NfsButtonPaletteOverrides: remove purple: true; NfsLabelPaletteOverrides: remove warning: false
```

### Sass

Sass. The consumer compiles Foundation's Sass from its own settings; the library imports no Foundation code and copies no Foundation rule. This utility has no Library mixin and emits no CSS: there is no `nfs-variant-types` mixin.

1. Rules: none.
2. Reuse: it reads the consumer's compiled Sass, never a setting directly, so every Foundation setting and every `map-merge` or `map-remove` the consumer writes reaches the file by construction.
3. Properties the directives write: none.
4. Motion classes and reduced motion: none.
5. What breaks when an include is missing: the registry of every property that include writes stays at Foundation's defaults, so a custom name fails to compile (loud) and a default name compiles. With no include at all, every registry stays at Foundation's defaults; the documented setup includes the Library mixin of every family the consumer customises.
6. Variant properties: it writes none and reads all of them, every property of the settings table in the Variant property format.

### Tooling changes to adopt when they arrive

- An `@angular/build` hook inside its Sass compile: the file could be regenerated inside the build instead of beside it.
- Nx running task sync generators in CI (its docs describe a dry run that 23.2.1 does not perform): CI would then keep the file in step itself, not only through the committed file.
- Foundation moving to Sass modules: the tooling compiles whatever the consumer's stylesheet loads, so only the Library mixins change (ADR 0012).
- TypeScript 7's native port: the registry shapes are language features; the language service's completion of registry names is re-measured then.
