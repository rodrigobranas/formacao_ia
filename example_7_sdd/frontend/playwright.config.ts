import { defineConfig } from '@playwright/test'

const MOCK_URL = 'http://localhost:4555'

// E2E runs the real backend against a mock Open-Meteo upstream (see
// e2e/support/mock-open-meteo.mjs). Tests share one backend + one stateful mock,
// so they run serially and reset upstream state before each test.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'node e2e/support/mock-open-meteo.mjs',
      url: `${MOCK_URL}/__health`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        OPEN_METEO_GEOCODING_URL: `${MOCK_URL}/v1/search`,
        OPEN_METEO_FORECAST_URL: `${MOCK_URL}/v1/forecast`,
        OPEN_METEO_AIR_QUALITY_URL: `${MOCK_URL}/v1/air-quality`,
      },
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
