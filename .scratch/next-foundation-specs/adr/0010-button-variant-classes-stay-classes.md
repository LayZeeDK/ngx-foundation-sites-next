---
status: accepted
---

# Variant classes stay consumer-written classes

Foundation's appearance classes on a Structural class (on `.button`: the sizes from `$button-sizes`, the colors from `$button-palette`, `.hollow`, `.clear`, and `.solid` depending on `$button-fill`, `.expanded` and its responsive forms, `.dropdown`, `.arrow-only`) are generated from Sass maps and settings the consumer owns, carry no behaviour, and are already bindable with Angular's `[class.x]` syntax. We decided that a directive does not mirror a Variant class as an input; the consumer writes it as a static or bound class, exactly as Foundation documents it. An input that sets a Variant class is allowed only when the directive's own behaviour depends on that state (for example an orientation that changes arrow-key handling), and then the input binds the class.

## Considered options

- Typed inputs per class family (`size`, `color`, and a `fill` enum, as the building-blocks matrix sketched for Button, and as Material does with `matButton="outlined"` and `color`): rejected because Material's classes are private while Foundation's are the public contract, so an input would be a second spelling of the same thing; the value sets are open (custom palette colors, custom sizes, `.solid` existing only when `$button-fill` is not `solid`, responsive `-expanded` classes behind a Sass flag), so the types would either lie or collapse to `string`; and the repo's API-design skill already says "CSS class is purely for styling (no behavior): apply class directly, no directive needed".
- A runtime defaults token for appearance: rejected; the defaults are Sass settings (`$button-fill`, `$button-background`, the `default` size), and a runtime default would emit classes that fight them.

## Consequences

- Storybook stories map their args to classes in the story template instead of to inputs.
- Other specs apply the same test to their Variant classes (Reveal sizes, Menu and Tabs orientation classes, Callout-like colors): purely visual stays a class; behaviour-changing becomes an input that binds the class.
