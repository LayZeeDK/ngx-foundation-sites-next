# Plan: Simplify NfsStyleLoader - Move RTL Logic to Storybook

## Status: ✅ Implemented

---

## Context

The current `NfsStyleLoader` includes RTL-awareness (MutationObserver for `dir` attribute changes, automatic stylesheet swapping). This works for Storybook but complicates consumer setup by requiring both LTR and RTL CSS files.

**Two different use cases:**

| Use Case            | Requirement                                                 |
| ------------------- | ----------------------------------------------------------- |
| **Production Apps** | Choose ONE direction at build time via `_nfs-settings.scss` |
| **Storybook**       | Dynamic RTL switching for testing/documentation             |

## Goal

Simplify `NfsStyleLoader` for production consumers while keeping RTL testing capability in Storybook.

---

## Files Modified

### 1. Simplified NfsStyleLoader Service ✅

**File:** `packages/ngx-foundation-sites/src/lib/core/nfs-style-loader.service.ts`

Removed RTL logic (MutationObserver, `#currentDirection`, `#getDirectionalHref`, etc.):

```typescript
import { Injectable, inject, DestroyRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface StyleLinkRef {
  element: HTMLLinkElement;
  count: number;
}

/**
 * Service for dynamically loading component stylesheets via `<link>` tags.
 *
 * **Platform-scoped**: Uses `providedIn: 'platform'` to ensure a single instance
 * across all Angular roots. This is important in Storybook where each story
 * runs in its own root injector but should share stylesheet management.
 *
 * **Reference-counted**: First component instance loads the stylesheet,
 * last instance removes it on destroy.
 */
@Injectable({ providedIn: 'platform' })
export class NfsStyleLoader {
  readonly #document = inject(DOCUMENT);
  readonly #linkRefs = new Map<string, StyleLinkRef>();

  constructor() {
    // Register cleanup when platform injector is destroyed
    inject(DestroyRef).onDestroy(() => this.#removeAllStylesheets());
  }

  load(id: string, href: string): void {
    const existing = this.#linkRefs.get(id);
    if (existing) {
      existing.count++;
      return;
    }

    const link = this.#document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = `nfs-style-${id}`;
    this.#document.head.appendChild(link);
    this.#linkRefs.set(id, { element: link, count: 1 });
  }

  unload(id: string): void {
    const existing = this.#linkRefs.get(id);
    if (!existing) return;

    existing.count--;
    if (existing.count === 0) {
      existing.element.remove();
      this.#linkRefs.delete(id);
    }
  }

  #removeAllStylesheets(): void {
    for (const [, ref] of this.#linkRefs) {
      ref.element.remove();
    }
    this.#linkRefs.clear();
  }
}
```

---

### 2. Added RTL Switching to Storybook preview.ts ✅

**File:** `packages/ngx-foundation-sites/.storybook/preview.ts`

Added vanilla JS MutationObserver to swap NFS stylesheets when direction changes:

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// RTL Stylesheet Swapping (Storybook-only)
// ═══════════════════════════════════════════════════════════════════════════════
// Watches document.dir and swaps /nfs-*.css ↔ /nfs-*-rtl.css
// This enables the Storybook direction toolbar to work with NfsStyleLoader

let rtlObserver: MutationObserver | null = null;

function swapNfsStylesheets(direction: string) {
  document.querySelectorAll<HTMLLinkElement>('link[id^="nfs-style"]').forEach((link) => {
    const href = link.href;
    if (direction === 'rtl' && !href.includes('-rtl.css')) {
      link.href = href.replace('.css', '-rtl.css');
    } else if (direction !== 'rtl' && href.includes('-rtl.css')) {
      link.href = href.replace('-rtl.css', '.css');
    }
  });
}

function setupRtlStyleSwapping() {
  // Clean up any existing observer (important for HMR)
  teardownRtlStyleSwapping();

  let currentDirection = document.documentElement.dir || 'ltr';

  rtlObserver = new MutationObserver(() => {
    const newDirection = document.documentElement.dir || 'ltr';
    if (newDirection !== currentDirection) {
      currentDirection = newDirection;
      swapNfsStylesheets(newDirection);
    }
  });

  rtlObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dir'],
  });
}

function teardownRtlStyleSwapping() {
  if (rtlObserver) {
    rtlObserver.disconnect();
    rtlObserver = null;
  }
}

// Initialize on module load
setupRtlStyleSwapping();

// Cleanup on HMR (Webpack)
// @ts-expect-error - module.hot is Webpack-specific
if (module.hot) {
  // @ts-expect-error - module.hot is Webpack-specific
  module.hot.dispose(() => {
    teardownRtlStyleSwapping();
  });
}
```

---

### 3. Updated consumer-test-app project.json ✅

**File:** `apps/consumer-test-app/project.json`

Removed RTL bundleName entries from default config. RTL is now a separate build configuration:

```json
{
  "styles": [
    "apps/consumer-test-app/src/styles.scss",
    {
      "input": "dist/packages/ngx-foundation-sites/scss/accordion.scss",
      "bundleName": "nfs-accordion",
      "inject": false
    },
    {
      "input": "dist/packages/ngx-foundation-sites/scss/button.scss",
      "bundleName": "nfs-button",
      "inject": false
    }
  ],
  "configurations": {
    "rtl": {
      "stylePreprocessorOptions": {
        "includePaths": ["apps/consumer-test-app/src/styles-rtl", "apps/consumer-test-app/src/styles", "dist/packages/ngx-foundation-sites/scss/defaults", "dist/packages/ngx-foundation-sites/scss", "node_modules"]
      }
    }
  }
}
```

**Key change:** RTL consumers use a separate `styles-rtl/` folder with `$global-text-direction: rtl`.

---

## RTL Support Summary

### For Production Consumers

Consumers choose direction **at build time** via their `_nfs-settings.scss`:

```scss
// src/styles/_nfs-settings.scss
$global-text-direction: rtl; // or ltr (default)
```

The compiled CSS will have correct RTL positioning. **No runtime switching needed.**

### For Storybook

RTL switching is handled by `preview.ts`:

1. Direction toolbar changes `document.documentElement.dir`
2. MutationObserver detects the change
3. `swapNfsStylesheets()` updates all `<link>` hrefs to `-rtl.css` variants

---

## Teardown Verification

| Aspect                | Status                             |
| --------------------- | ---------------------------------- |
| **Storybook Builder** | Webpack (via `@storybook/angular`) |
| **HMR API**           | `module.hot.dispose()`             |
| **Cleanup**           | `observer.disconnect()` + `null`   |

### Edge Cases Handled

| Edge Case            | How Handled                                    |
| -------------------- | ---------------------------------------------- |
| Multiple HMR cycles  | `setupRtlStyleSwapping()` calls teardown first |
| Observer not created | `if (rtlObserver)` guard                       |
| Full page refresh    | New page = fresh state                         |

---

## Verification Checklist

- [x] NfsStyleLoader simplified (RTL logic removed)
- [x] Storybook preview.ts has MutationObserver for RTL
- [x] consumer-test-app has separate RTL configuration
- [ ] Storybook: Direction toolbar switches accordion +/- icons correctly
- [ ] Storybook: RTL story shows correct text alignment
- [ ] consumer-test-app: Builds and displays styled components
- [ ] consumer-test-app: RTL build (separate config) works correctly

---

## Related Documentation

- See `STYLESHEET_SIMPLIFICATION_PLAN.md` for the broader simplification effort
- See README.md for updated consumer documentation
