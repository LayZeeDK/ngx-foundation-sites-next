---
status: accepted
---

# Triggers reach Openables by typed reference or the Nearest Openable, through one interface token, never by id

Foundation's Triggers utility addresses targets by id strings (`data-toggle="a b"`) and talks to them through custom jQuery events (`research/foundation-utilities-conventions.md` 2.2). We decided that `nfsOpen`, `nfsClose`, and `nfsToggle` take a typed template reference to an Openable (or an array of them), that a bare `nfsClose` or `nfsToggle` acts on the Nearest Openable found with `inject(nfsOpenableToken, {optional: true, skipSelf: true})`, and that every Openable implements one small interface, `NfsOpenable` (`isOpen`, `id`, `triggerRole` as signals; `open(trigger?)`, `close(result?)`, `toggle(trigger?)`; optional `registerTrigger`), provided under the lightweight `nfsOpenableToken` with `useExisting`. Why: references are checked by the compiler under strict templates, need no unique ids (generated ids differ between server and client, `building-blocks.md` 1.5), need no registry that would miss Openables in dehydrated blocks, and follow the idiom of Material (`matMenuTriggerFor` typed by the `MatMenuPanel` interface), CDK, and Aria (`AccordionTrigger.panel`); template-reference scoping also stops a Trigger from naming an Openable inside a `@defer` block it is not in, which enforces half of the one-hydration-boundary rule (ADR 0008).

## Considered options

- Foundation's id strings resolved through a root registry service: rejected. Typos and duplicates fail silently, every Openable would need a consumer-supplied id, and a registry filled at construction is empty for Openables in dehydrated blocks, so a replayed click would find nothing. It would make linking across component boundaries easier; passing the `NfsOpenable` reference through an input covers that case.
- Custom DOM events on the target, as Foundation does: rejected. Untyped, and custom events are not replayed by Angular's event replay.
- DOM `closest()` for the bare form: rejected. It breaks with content projection, where Angular resolves against the declaration site, and needs the DOM, which a server render or a dehydrated block does not provide to the directive.
- An abstract class token (the lightweight-token guide's form): rejected. Consumers implement the contract in wrapper components and should not have to extend a library class; Material uses an interface for the same reason with `MatMenuPanel`.

## Consequences

- Consumers write `#x="nfsReveal"` (the directive's `exportAs`), not `#x`; the compiler reports the difference under strict templates, a dev-mode check reports it otherwise.
- Linking a Trigger in one component to an Openable in another passes the `NfsOpenable` through an input, or the wrapping component provides `nfsOpenableToken` itself.
- Every Openable spec states its Trigger role, the id `aria-controls` must name, and what it does with `trigger` and `result`.
- When Invoker Commands reach the browser target, Triggers may add `commandfor`, which needs consumer-supplied ids; the reference stays the API.
- 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): without strict templates, a target that is not an Openable gets no dev-mode report in the first milestone; the check is planned for a later milestone ([Spec: misuse warnings (later milestone)](../issues/161-spec-misuse-warnings-later-milestone.md)), and `#x="nfsReveal"` is documented usage.
