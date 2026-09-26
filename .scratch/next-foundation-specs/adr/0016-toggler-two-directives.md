---
status: accepted
---

# Toggler is two directive classes behind one `nfsToggler` attribute, chosen by the presence of `toggler`

Foundation's Toggler is one plugin with two modes: `data-toggler=".class"` switches a class, and `data-toggler data-animate="in out"` shows and hides the element. The building-blocks map gives the modes different state (`active` in class mode, `isOpen` in visibility mode, `building-blocks.md` 1.4) and different Trigger roles (`toggle-button` and `disclosure`), while the Openable contract every Trigger reads fixes one member name, `isOpen` (ADR 0013). We decided that visibility mode is `NfsToggler` with selector `[nfsToggler]:not([toggler])` and an `isOpen` model, and class mode is `NfsClassToggler` with selector `[nfsToggler][toggler]`, an `active` model, and a read-only `isOpen` mirror of it; both export `nfsToggler`. Why: one class cannot declare `isOpen` both as visibility mode's two-way model and as class mode's read-only mirror, and two models of one state would need synchronising; the selector split puts exactly one Openable on each element, gives each mode only its own inputs and outputs (`animate`, `opened`, `closed` exist only where they mean something), and fixes the mode at compile time, as Foundation fixed it at init. Angular's selector matching sees both a static `toggler` attribute and a `[toggler]` binding, and `:not()` in directive selectors is established Angular practice (`NgForm`'s `form:not([ngNoForm])`).

## Considered options

- One `NfsToggler` class whose `isOpen` model also means "class applied" in class mode: rejected, because it drops the `active` name the map and the audit settled on and calls a layout switch "open".
- One class with both `isOpen` and `active` models kept in sync: rejected, because it needs two-way synchronisation between models, emits both change outputs for one change, and leaves the Openable's `isOpen` a writable second path into class mode.
- A `mode` input: rejected, because the mode would become dynamic, both modes' members would exist on every instance, and the Trigger role would change at runtime for no Foundation use case.

## Consequences

- Consumers import both directives from `ngx-foundation-sites/toggler`; a class-mode element whose directive was not imported does nothing, as with any directive that is not imported.
- A default `toggler` class cannot come from a Defaults token, because it would have to change which directive matches; `nfsTogglerDefaultsToken` carries `animate` only.
- `#t="nfsToggler"` works in both modes, so Triggers and consumer code need not know the mode.
