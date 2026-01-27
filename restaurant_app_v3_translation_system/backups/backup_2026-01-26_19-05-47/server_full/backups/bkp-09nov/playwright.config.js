// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'Dev-Files/03-Teste/tests',
  testMatch: '**/*.spec.js',
  ignoreSnapshots: true,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Explicitly ignore Jest directories and backup archives
  testIgnore: [
    '**/__tests__/**',
    'Dev-Files/07-Backups/**',
    'Dev-Files/05-Scripturi-Temporare/**',
    'docs/**',
  ],
});

