# 187. Task: remove the Float Grid and Flex Grid from the bundle

Type: task
Status: claimed
Blocked by:
Labels: wayfinder:task
Map: ../map.md

## Question

The user ruled the Float Grid and Flex Grid out of scope. What has to change so that no current document of the bundle specifies, depends on, or counts them, and the XY Grid stays the only grid?

## User ruling, 2026-10-01

The user wrote, verbatim:

> Exclude Float Grid and Flex Grid support because they have been deprecated since Foundation 6.4 (released June 2017) according to their documentation pages. Only support XY Grid which is their documented replacement.

Checked against the 6.9.0 clone: "From Foundation v6.4, the Float Grid is disabled by default, replaced by the new [XY Grid](xy-grid.html)" (`docs/pages/grid.md:21`), and the same sentence for the Flex Grid (`docs/pages/flex-grid.md:34`).

## How to work it

The work is done, not decided. The two specs, `specs/float-grid.md` and `specs/flex-grid.md`, are deleted. Their tickets, [Spec: Float Grid](100-spec-float-grid.md) and [Spec: Flex Grid](101-spec-flex-grid.md), stay resolved as history and get a dated note pointing here. Every current document that names either grid is brought in line: the later-milestone check specs (family checks, runtime checks, misuse warnings, forgotten-import checks), the Equalizer, Flexbox Utilities, Variant declaration tooling, Typography Helpers, XY Grid, Float Classes, Visibility Classes, and Prototyping Utilities specs, building-blocks, the glossary, the architecture guide, ADRs 0012, 0021, 0039, and 0040 (dated notes, as for every earlier ruling), the Storybook conventions, the README, and the map. Resolved tickets, research files, audits, and prototypes are history and stay as they are. Where a document used a Float or Flex Grid class as an example of a later-milestone class a consumer writes, it uses an XY Grid class instead.
