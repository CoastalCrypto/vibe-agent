import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [
      ['tests/src/**', 'jsdom'],
    ],
    setupFiles: ['tests/setup.ts'],
  },
})
