# 133. Consistency review: the class-rule wave

Type: grilling
Status: open
Blocked by: 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 134, 136, 137, 138, 139, 142, 143, 144
Labels: wayfinder:grilling
Map: ../map.md

## Question

Do the 25 new specs, the 26 re-run specs, ADR 0039, the typed-input ADR, building-blocks, the glossary, and the bundle index (`README.md`) agree with each other and with the class rule of the user's ruling on 2026-09-27 ([Triage the out-of-scope Foundation components and variants](79-triage-out-of-scope-components-and-variants.md)): consumers write no Foundation or NFS class; every Structural class is bound by its directive, every Variant class is set by a typed input, every State class is a host binding, and layout systems and utility families get directives too (ADR 0039, which supersedes ADR 0010)? No consumer-written Foundation or NFS class may remain in any spec's examples.

## How to work it

As the [Consistency review and bundle index](36-consistency-review.md) did: read every spec in full, check each against building-blocks, the ADRs, and the glossary, fix what is wrong in place with a dated amendment in each spec's ticket, and bring `README.md` (the spec count, the index, the ADR list) up to date. An audit of the wave follows it (map Notes, Audits). Model: Opus 5.5.
