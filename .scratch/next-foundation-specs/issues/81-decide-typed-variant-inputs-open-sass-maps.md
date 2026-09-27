# 81. Decide: typed Variant inputs over open Sass maps

Type: grilling
Status: open
Blocked by: 80
Labels: wayfinder:grilling
Map: ../map.md

## Question

How is a Variant input typed under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010), both for closed sets Foundation's Sass fixes (`stacked`, `vertical`, `hollow`) and for open Sass maps the consumer extends (palette colours, button sizes, breakpoints)? The user vetoed consumer-side TypeScript `namespace` or `module` augmentation. The user settled the veto's reach on 2026-09-27: it rules out every way of changing the library's types from outside the consumer's own code, namely declaration merging (`declare module`, `declare namespace`), a tsconfig `paths` entry that remaps a library type module (O7), and a generator that overwrites a type file inside the installed package (Chakra's `typegen` approach). Consumer-local code stays: a subclass (O4), a narrowing directive (O5), a typed factory (O6), a closed or open union (O1, O2), a development-mode check (O10), and a generator that writes into the consumer's own source tree (O9 feeding O4 to O6). The answer is the ADR every spec and re-run ticket in this wave types its Variant inputs by, including the input naming (`color`, `size`, `fill`, boolean modifiers or enums), how a responsive Variant (`.small-expanded`, `.medium-horizontal`) is expressed, and what development-mode check catches a value the consumer's Sass does not generate.

## How to work it

Decided by a panel under the map's Open-decision pass note: the dossier is [Research: typed Variant inputs over open Sass maps](80-research-typed-variant-inputs-open-sass-maps.md)'s `research/typed-variant-inputs.md`; four lenses (API design; consumer ergonomics and migration; adversarial against every option that asks the consumer for code per directive; adversarial against every option that lets a typo compile or blocks a custom name), all on Opus 5.5 because Fable credit ran out on 2026-09-27 and the user's rule is that Opus, never Sonnet, takes Fable's seats; then an Opus 5.5 judge who weighs the arguments, records the dissent, writes the ADR (proposed as `adr/proposed-<slug>.md` in the ADR-FORMAT shape), and lists the changes to ADR 0039, building-blocks, and the glossary.
