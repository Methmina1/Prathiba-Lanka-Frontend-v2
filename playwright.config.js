import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const DEV_PORT = 5173

/**
 * Browser tests come in two suites.
 *
 * `chromium` (tests/e2e) runs against the production build (`vite preview`) with the API mocked per
 * test, so it exercises the real bundle and catches what the server-side render check cannot: layout,
 * computed styles, clicks and navigation. It needs no backend, which is why CI runs it.
 *
 * `live` (tests/live) drives the same bundle against a **real** backend and a real database, by role:
 * a guest enquiry, a customer booking and review, an admin confirming and moderating. It writes to
 * that database - every record it creates carries a run marker and is deleted again at the end of the
 * run (see the cleanup in tests/live/roles.spec.js), and it points at the dev server because the API
 * only allows the dev origin (`localhost:5173`) through CORS.
 *
 *   npm run test:e2e            mocked, headless - what CI runs
 *   npm run test:roles          live, against a running backend
 *   npm run test:e2e -- --ui    watch mode with a browser
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } } },
    {
      name: 'live',
      testDir: './tests/live',
      // A full journey per role, waiting on a real backend and a real database: give it room. One
      // worker, in file order, because the customer's booking is what the admin then confirms.
      fullyParallel: false,
      workers: 1,
      timeout: 90_000,
      expect: { timeout: 10_000 },
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 950 }, baseURL: `http://localhost:${DEV_PORT}` },
    },
  ],

  webServer: [
    {
      command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      // The live suite needs the dev origin, which is the one the backend's CORS configuration
      // allows. Started only when it is not already running.
      command: `npm run dev -- --port ${DEV_PORT} --strictPort`,
      url: `http://localhost:${DEV_PORT}`,
      reuseExistingServer: true,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
})
