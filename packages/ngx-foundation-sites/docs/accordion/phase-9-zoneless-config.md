# Phase 9: Zoneless Angular Configuration ✅

**Goal:** Configure Storybook to use Angular 21's default zoneless change detection and remove the legacy Zone.js dependency.

## 9.1 Background

**Angular 21** makes zoneless change detection the default. Previously, Angular relied on Zone.js to detect changes by monkey-patching browser APIs (setTimeout, Promise, addEventListener, etc.).

**Benefits of zoneless Angular:**

- **Signal-based reactivity**: Components using signals (`signal()`, `computed()`, `input()`, `output()`) automatically notify Angular when state changes
- **Smaller bundle size**: Removing Zone.js saves ~35-40KB from production builds
- **Better debugging**: Without monkey-patching, browser DevTools show cleaner stack traces
- **Improved performance**: No Zone.js overhead for change detection scheduling

## 9.2 Context

Since Angular 21:

1. Zoneless is the **default** change detection mechanism
2. `@angular/core` marks `zone.js` as **optional** in `peerDependenciesMeta`
3. Components using signals work seamlessly without Zone.js

## 9.3 Implementation

### 9.3.1 Enable `experimentalZoneless` in Storybook Executors

**File:** `packages/ngx-foundation-sites/project.json`

Added `experimentalZoneless: true` to both Storybook targets:

```json
{
  "storybook": {
    "executor": "@storybook/angular:start-storybook",
    "options": {
      "experimentalZoneless": true
      // ... other options
    }
  },
  "build-storybook": {
    "executor": "@storybook/angular:build-storybook",
    "options": {
      "experimentalZoneless": true
      // ... other options
    }
  }
}
```

### 9.3.2 Remove `zone.js` Dependency

**File:** `package.json`

Removed `zone.js` from dependencies:

```diff
  "dependencies": {
    "@angular/common": "~21.0.6",
    "@angular/core": "~21.0.6",
    // ... other deps
-   "zone.js": "0.16.0"
  }
```

**Why this is safe:**

1. `@angular/core@21` declares `zone.js` as **optional** in `peerDependenciesMeta`
2. No source files import `zone.js` directly
3. All components use signals for change detection

## 9.4 Verification

| Check                   | Result           |
| ----------------------- | ---------------- |
| `npm install`           | ✅ No warnings   |
| `build-storybook`       | ✅ Passed        |
| `test-static-storybook` | ✅ 19 tests pass |
| E2E tests               | ✅ 7 tests pass  |
| Storybook dev server    | ✅ Working       |
| Accordion click events  | ✅ Working       |
| Console errors          | ✅ None          |

## 9.5 Files Modified

| File                                         | Change                                                       |
| -------------------------------------------- | ------------------------------------------------------------ |
| `packages/ngx-foundation-sites/project.json` | Added `experimentalZoneless: true` to both Storybook targets |
| `package.json`                               | Removed `zone.js` dependency                                 |

## 9.6 Notes

- **Library consumers** can still use Zone.js in their applications if needed — this only affects the library's development/testing environment
- **Angular 21 default**: Zoneless is now the default change detection strategy; this configuration aligns the library with modern Angular standards
- **Unit tests** already use `provideZonelessChangeDetection()` (configured in Phase 5.1)
