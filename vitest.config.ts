import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  optimizeDeps: {
    entries: [],
  },
  test: {
    testTimeout: 30_000,
    name: 'unit',
    exclude: defaultExclude,
  },
})
