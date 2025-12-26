# Phase 8: JS-Native Private Fields Migration ✅

**Goal:** Migrate from TypeScript's `private` keyword to JavaScript-native `#` private fields for true runtime privacy.

## 8.1 Background

TypeScript's `private` keyword is erased at compile time — runtime code can still access these fields. ES2022 introduced `#` private fields which are enforced at runtime, providing true encapsulation.

## 8.2 Migration Summary

| File                             | Members Migrated                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `accordion.ts`                   | `#deepLinkService`, `#destroyRef`, `#lastExpandedPanelId`, `#initialHashProcessed` |
| `accordion.ts`                   | `#handleInitialHash()`, `#setupHashChangeListener()`                               |
| `accordion-deep-link.service.ts` | `#document`                                                                        |

## 8.3 Angular Limitation

Angular's signal-based queries (`viewChild`, `contentChild`, `contentChildren`) cannot use ES private fields because Angular needs compile-time access to decorate these members.

**Exception kept with TypeScript `private`:**

```typescript
/**
 * Reference to the AccordionGroup directive for programmatic control.
 * Note: Uses TypeScript `private` instead of `#` because Angular's
 * `viewChild` requires compile-time access to the field.
 */
private readonly accordionGroup = viewChild(AccordionGroup);
```

## 8.4 Files Modified

| File                             | Change                                        |
| -------------------------------- | --------------------------------------------- |
| `AGENTS.md`                      | Added coding guideline for `#` private fields |
| `accordion.ts`                   | Migrated 6 members to `#` syntax              |
| `accordion-deep-link.service.ts` | Migrated 1 member to `#` syntax               |

## 8.5 Visibility Guidelines

Use these guidelines for class member visibility:

| Visibility           | Usage                                                           | Example                               |
| -------------------- | --------------------------------------------------------------- | ------------------------------------- |
| **`#` (ES private)** | Truly private members not accessed by templates or Angular APIs | `#deepLinkService`                    |
| **`protected`**      | Members accessed by templates OR Angular signal queries         | `viewChild`, `contentChildren`        |
| **`public`**         | Component's public API                                          | `input()`, `output()`, public methods |

> **Do NOT** use TypeScript's `private` keyword — use `#` for true runtime privacy instead.
