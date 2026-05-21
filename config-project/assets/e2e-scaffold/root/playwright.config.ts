import { defineConfig, devices } from '@playwright/test';

const frontendPort = process.env.FRONTEND_PORT ?? '{{frontendPort}}';
const backendPort = process.env.BACKEND_PORT ?? '{{backendPort}}';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'list' : 'html',
  use: {
    baseURL: `http://localhost:${frontendPort}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: '{{backendDevCommand}}',
          url: `http://localhost:${backendPort}`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: '{{frontendDevCommand}}',
          url: `http://localhost:${frontendPort}`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ],
});
