---
status: accepted
---

# Utility families: one directive per Foundation export mixin, set through Utility attributes

[ADR 0039](0039-directives-manage-every-foundation-class.md) gives Foundation's utility families directives, and the Prototyping Utilities alone print 123 classes, 357 with their breakpoint flags on, none of which names an element of a component. We decided, in [Spec: Prototyping Utilities](../issues/102-spec-prototyping-utilities.md), that a family of Utility classes that stand alone becomes one attribute directive per Foundation export mixin (`foundation-prototype-spacing` is `NfsPrototypeSpacing`), whose inputs are Utility attributes: each input's public name is also one of the directive's attribute selectors, `nfs`-prefixed and named after the class it sets (`nfsMarginTop="1"` for `.margin-top-1`, `nfsBordered` for `.bordered`), typed like a Variant input ([ADR 0040](0040-variant-input-types.md)), with its responsive forms as a Breakpoint rules object or query on the same attribute. Within a family the directive resolves overlapping classes per side, so Foundation's source order never decides, and the family's Library mixin prints out-of-order responsive rules again in order. The export mixin is the unit a consumer includes, and its classes are the ones that overlap; the `nfs` prefix keeps a utility from capturing another directive's input (`position`, `size`, `color`) or a native attribute (`width`, `height`).

## Considered options

- One directive for the whole page with plain inputs (`<div nfsPrototype margin="1" position="relative">`): rejected. `position` would also feed a Dropdown pane or Tooltip on the element, `width` would capture an image's attribute, and every instance would create every input of the page.
- One directive per class or per attribute: rejected. Dozens of imports, and overlapping attributes (`nfsMargin`, `nfsMarginTop`) could not see each other to resolve the overlap.
- Binding each attribute's class as written: rejected. Measured in three engines, Foundation's source order makes `margin-2 margin-top-1` a 2rem top margin and keeps `medium-margin-1` over `large-margin-0` at large widths.

## Consequences

- The Float Classes and Typography Helpers specs follow this shape. Two families of the same wave take the other shapes the scope clause names: the Flexbox Utilities' roles (flex parent, flex child) keep building-blocks 1.4's Structural class shape, and the Visibility Classes, whose templates all decide whether an element shows, keep one directive with Foundation's `showFor` and `hideFor` words. In every shape an un-prefixed input shares no name with another directive's input on the same element, or its spec reports the case.
- Value and attribute aliases take suffixes (`Name`, `Count`, `Input`, `Value`), so they never collide with the directive classes.
- A Runtime-check handle of a directive that several attributes create is named after the directive class.
- 2026-09-28 ([Re-run: Visibility Classes spec for the print classes](../issues/143-rerun-visibility-classes-print.md)): a Foundation mixin whose classes take two shapes is split by shape. `foundation-print-styles` prints `.show-for-print` and `.hide-for-print`, which decide whether an element shows, so they are the `print` condition of `nfsVisibility`'s `showFor` and `hideFor`, not a directive of their own; its stand-alone `.print-break-inside` follows clause 1 with the [Spec: Typography Helpers](../issues/106-spec-typography-helpers.md)'s directives.
- 2026-09-29 ([Decide: checks move to a later milestone](../issues/158-decide-checks-move-to-a-later-milestone.md)): the consequence that names a Runtime-check handle after the directive class applies when the [Spec: Runtime checks (later milestone)](../issues/162-spec-runtime-checks-later-milestone.md) lands; the first milestone creates no handle.
