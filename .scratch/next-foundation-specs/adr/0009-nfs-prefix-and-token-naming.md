---
status: accepted
---

# `Nfs` class prefix and camelCase `nfsXToken` injection tokens

The Angular v20 style guide drops type suffixes and favours bare class names, and the neighbouring libraries name their tokens differently: CDK and Material use `SCREAMING_SNAKE` with a `MAT_`/`CDK_` prefix, and Aria exports unprefixed `SCREAMING_SNAKE` tokens (`ACCORDION_GROUP`) and bare classes (`Tabs`, `Tab`, `Menu`, `Option`). We decided that every class carries the `Nfs` prefix plus the PascalCase of the Foundation structural class it sits on (`NfsAccordionTitle`, `NfsDropdownPane`), and that every injection token is camelCase with a `Token` suffix (`nfsAccordionToken`, `nfsTooltipDefaultsToken`). Why: the library imports Aria's bare classes through `hostDirectives`, so bare names would collide (`research/di-and-composition-patterns.md` 8; the angular-developer skill's naming-conventions reference, "Avoid Namespace Collisions"), and the token form is this repo's rule (AGENTS.md Design Philosophy 6), which keeps the `Token` suffix of the lightweight-injection-token guide's `LibHeaderToken` example (`research/di-and-composition-patterns.md` 1). Both are deliberate deviations recorded so nobody "fixes" them; `building-blocks.md` 1.3 applies them.

## Considered options

- v20 bare class names (`AccordionTitle`): rejected because of the collisions with Aria's exports.
- `NFS_ACCORDION` tokens in the CDK and Material style: rejected because the repo rule already fixes camelCase with `Token`, and mixing both forms in one library would leave consumers guessing.
