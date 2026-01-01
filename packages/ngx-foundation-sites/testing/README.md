# ngx-foundation-sites/testing

Testing utilities for ngx-foundation-sites. Use this secondary entry point in test environments where component styles are bundled directly (Storybook, unit tests).

## Installation

This entry point is included with the main package:

```bash
npm install ngx-foundation-sites
```

## Usage

### Storybook

```typescript
// .storybook/preview.ts
import { applicationConfig } from '@storybook/angular';
import { provideNfsTesting } from 'ngx-foundation-sites/testing';

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideNfsTesting()],
    }),
  ],
};

export default preview;
```

### Unit Tests

```typescript
import { TestBed } from '@angular/core/testing';
import { provideNfsTesting } from 'ngx-foundation-sites/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideNfsTesting()],
  });
});
```

## Exports

| Export | Description |
|--------|-------------|
| `provideNfsTesting()` | Returns `EnvironmentProviders` that configure all testing services |
| `NfsTestingStyleLoader` | No-op style loader for bundled environments |

## Why Use This?

In production, `NfsStyleLoader` dynamically loads component CSS from `/assets/ngx-foundation-sites/<component>.css`. In test environments where styles are bundled via webpack or other bundlers, this causes 404 errors.

`provideNfsTesting()` replaces the production style loader with a no-op implementation that prevents these errors.
