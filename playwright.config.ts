import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? 'github' : 'line',
  use: { baseURL: 'http://127.0.0.1:8787', trace: 'retain-on-failure' },
  projects: [{
    name: 'mobile-chromium',
    use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } },
  }],
  webServer: {
    command: 'npm run build && npm start',
    port: 8787,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
