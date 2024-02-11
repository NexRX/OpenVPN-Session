/// <reference types="vitest" />
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    target: 'node20',
  },
  test: {
    include: ['**/*.test.ts'],
    environment: 'node',
    globals: true,
  }
})
