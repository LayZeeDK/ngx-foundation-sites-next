# 156. Decide: an exportAs on every directive

Type: grilling
Status: resolved
Blocked by: 133, 141
Labels: wayfinder:grilling
Map: ../map.md

## Question

Building-blocks 1.3 gives a directive an `exportAs` only where a template needs its instance: "a directive with no state or method to read has none" ([Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md), 2026-09-28). The [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md) read the consumer's own inputs as no state to read (its R17 and the closing pass's extension to twelve directives), and [Audit 0008: the class-rule wave](../audits/0008-class-rule-wave.md) (L4) removed four more. Should every directive have an `exportAs` instead?

## Answer

### User ruling, 2026-09-29

The user: "All directives get an `exportAs` unless you give me a good reason why not to." The orchestrator found no good reason, and the user approved the result.

### What was weighed

- The rule's source. The "no state or method to read" clause was an AFK decision in [Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md), not a user ruling, and it cites Angular Aria as its model ("as Aria names its own"). In the Angular components 22.2.x clone, Aria gives an `exportAs` to every public directive but one: 28 of its 30 directive files declare one, input-only parts included (`ngTabPanel`, `ngAccordionPanel`) and the `ng-template` directive `ngTabContent`; the two without one are `ngAccordionContent` and the private deferred-content directive. The precedent supports the ruling, not the old rule.
- Reversibility. Adding an `exportAs` later breaks nothing, and removing one later is a breaking change under [ADR 0045](../adr/0045-release-policy-devkit-version-scheme.md). That is a reason to choose with care, not a reason against a name chosen on purpose, and the name follows a fixed rule, so it adds no naming decision per directive.
- Components. A template reference without a value (`#ref`) on a component's element already returns the component, so an `exportAs` on a component adds a second way to reach it. That is not a reason to leave it out, and it keeps one rule for every class.
- Two classes with one name. The Float Grid's and the Flex Grid's `NfsRow` and `NfsColumn` share a class name and a selector (the [Spec: forgotten-import checks (shared utility)](150-spec-forgotten-import-checks.md), NFS9001 and M1/M2), so both export `nfsRow` and `nfsColumn`. A consumer uses one grid; where both entry points apply to one element, a template reference gets the first directive whose `exportAs` matches (Angular's template binder, `t2_binder.ts`, takes the first match), and the element is already a mistake the Flex Grid spec names.

### Decision

Every directive and component in the library has an `exportAs`. Its name is the class name with a lowercase first letter (`NfsTabsPanel` exports `nfsTabsPanel`, `NfsReveal` exports `nfsReveal`), or its family's where two classes share one attribute (both Toggler classes export `nfsToggler`, [ADR 0016](../adr/0016-toggler-two-directives.md)). An existing name that differs from this rule is kept where an ADR or ticket decided that name, and changed otherwise.

This supersedes: building-blocks 1.3's clause "a directive with no state or method to read has none" and its 2026-09-29 sentence on the consumer's own inputs; the matching clause of the architecture guide's P13; R17 of the consistency review and the closing pass's extension to twelve directives; and L4 of audit 0008. Those records stay as written, each with a dated pointer here.

### Changes to apply

1. `building-blocks.md` 1.3, the `exportAs` bullet: replace the text from "where a template needs the instance" to the end of the bullet with: "every directive and component has one (2026-09-29, user ruling, [Decide: an exportAs on every directive](issues/156-decide-exportas-on-every-directive.md)): the class name with a lowercase first letter (`nfsReveal`, `nfsTabsPanel`), or its family's where two classes share one attribute (both Toggler classes export `nfsToggler`, ADR 0016), as Aria gives its public directives one, input-only parts included (`ngTabPanel`, `ngAccordionPanel`). This replaces the 2026-09-28 rule that a directive with no state or method to read has none." Then make Table D and every other building-blocks row that says "no `exportAs`" or lists `exportAs` names agree.
2. `architecture-guide.md` P13: replace the `exportAs` clause ("`exportAs`, where a template needs the instance ... is the directive's camelCase name or its family's ...") with the rule above in the guide's words, change the example "no `exportAs` on `NfsCardDivider`" to "`exportAs: 'nfsCardDivider'`", and add one dated sentence to its sources line: "On 2026-09-29 the user ruled an `exportAs` on every directive ([Decide: an exportAs on every directive](issues/156-decide-exportas-on-every-directive.md)), which replaces the review's reading."
3. Every spec: each directive and component gets its `exportAs` by the rule, in every place the spec states it (the API heading or line, the class sketch comment, the Hierarchy lines, the member table's lead-in). Every "no `exportAs`" statement and every reason given for one goes; where a sentence gave that reason ("it owns no state or method a template could read"), the sentence goes with it. Each changed spec gets one line in a dated `### Amendment, 2026-09-29 (exportAs on every directive)` at the end of the ticket that holds its `### Amendment, 2026-09-29 (consistency review)`.
4. `map.md`: after the gist of [Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md), the words "the `exportAs` naming" gain "(later changed: an `exportAs` on every directive, [Decide: an exportAs on every directive](issues/156-decide-exportas-on-every-directive.md))"; in the gist of [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md), after "has an `exportAs` (twelve more)" add "(later reversed by the user: [Decide: an exportAs on every directive](issues/156-decide-exportas-on-every-directive.md))"; append this ticket's gist.
5. A dated pointer, `### Note, 2026-09-29 (exportAs on every directive)`, one line each, at the end of [Decide: the directive and component architecture guide](141-decide-directive-component-architecture-guide.md) and [Consistency review: the class-rule wave](133-consistency-review-class-rule-wave.md).
6. `README.md`: a new subsection after "Forgotten imports", "### User rulings after the audit (2 tickets, 2026-09-29; all resolved)", lists this ticket and [Decide: family checks report a forgotten peer themselves](157-decide-family-checks-report-forgotten-peers.md), each with one line; the "No work is open" paragraph and every ticket count the README gives stay true (157 tickets).

### Triage

A user ruling, so no triage decides it. Its reach: a public name on every directive before the first release; later removal of any of them is a breaking change under ADR 0045, which the ruling accepts. Nothing is OPEN FOR HUMAN.

### Gist for Decisions so far

- [Decide: an exportAs on every directive](issues/156-decide-exportas-on-every-directive.md) -- the user ruled that every directive and component has an `exportAs`, the class name with a lowercase first letter or the family's shared name (both Toggler classes, ADR 0016), as Angular Aria gives its public directives one, input-only parts included; this replaces building-blocks 1.3's "no state or method to read, no `exportAs`", the guide's P13 clause, the consistency review's R17 and its extension to twelve directives, and audit 0008's L4.
