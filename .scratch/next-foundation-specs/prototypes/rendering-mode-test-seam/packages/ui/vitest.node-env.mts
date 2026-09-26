import { defineConfig } from 'vitest/config';

// PROTOTYPE: probe whether the builder's specs run in Vitest's plain `node` environment (no jsdom).
export default defineConfig({
  test: {
    environment: 'node',
  },
});
