/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { viteRequire } from 'vite-require'

export default defineConfig({
  esbuild: {
    target: 'node20'
  },
  plugins: [viteRequire()],
  test: {
    include: ['**/*.test.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      provider: 'istanbul'
    }
  }
})
