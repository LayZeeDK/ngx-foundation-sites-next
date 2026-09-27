# 81. Decide: typed Variant inputs over open Sass maps

Type: grilling
Status: open
Blocked by: 80
Labels: wayfinder:grilling
Map: ../map.md

## Question

How is a Variant input typed under the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010), both for closed sets Foundation's Sass fixes (`stacked`, `vertical`, `hollow`) and for open Sass maps the consumer extends (palette colours, button sizes, breakpoints)? The user vetoed consumer-side TypeScript `namespace` or `module` augmentation. The answer is the ADR every spec and re-run ticket in this wave types its Variant inputs by, including the input naming (`color`, `size`, `fill`, boolean modifiers or enums), how a responsive Variant (`.small-expanded`, `.medium-horizontal`) is expressed, and what development-mode check catches a value the consumer's Sass does not generate.

## How to work it

Decided by a panel under the map's Open-decision pass note: the dossier is [Research: typed Variant inputs over open Sass maps](80-research-typed-variant-inputs-open-sass-maps.md)'s `research/typed-variant-inputs.md`; four lenses (API design on Fable 5.1; consumer ergonomics and migration on Opus 5.5; adversarial against the leading option on Fable 5.1; adversarial against the alternatives on Opus 5.5); then an Opus 5.5 judge who weighs the arguments, records the dissent, writes the ADR (proposed as `adr/proposed-<slug>.md` in the ADR-FORMAT shape), and lists the changes to ADR 0039, building-blocks, and the glossary.
