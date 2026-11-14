/**
 * Vitest preset for the Norn apps. Merge it into an app's own config:
 *
 *   import base from '@norn-apps/config/vitest'
 *   import { defineConfig, mergeConfig } from 'vitest/config'
 *   export default mergeConfig(base, defineConfig({ test: { environment: 'jsdom' } }))
 *
 * @type {import('vitest/config').ViteUserConfig}
 */
const config = {
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts', 'worker/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
}

export default config
