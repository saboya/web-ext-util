import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    resolve: {
      alias: {
        '~': __dirname + '/src',
      },
    },
    test: {
      globals: true,
      include: [__dirname + '/test/node/**/*.{test,spec}.ts', __dirname + '/test/node/**/*.{test,spec}.tsx'],
      name: 'unit',
      environment: 'jsdom',
    },
  },
  {
    resolve: {
      alias: {
        '~': __dirname + '/src',
      },
    },
    test: {
      globals: true,
      include: [__dirname + '/test/browser/**/*.{test,spec}.ts', __dirname + '/test/browser/**/*.{test,spec}.tsx'],
      name: 'browser',
      browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        // https://vitest.dev/guide/browser/playwright
        instances: [
          {
            browser: 'chromium',
          },
        ],
      },
    },
  },
])
