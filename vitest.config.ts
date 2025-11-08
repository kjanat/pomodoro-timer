import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@js': path.resolve(__dirname, './src/js'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    reporters: process.env.CI
      ? [
          'github-actions',
          ['junit', { outputFile: './reports/vitest.junit.xml' }],
          'tree',
        ]
      : ['default', 'html'],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/js/**/*.ts'],
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
})
