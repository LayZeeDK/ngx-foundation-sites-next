import { defineConfig } from 'vitest/config';

// PROTOTYPE: worst case for ngServerMode leaks -- every spec file in one worker, in sequence.
export default defineConfig({
  test: {
    maxWorkers: 1,
  },
});
