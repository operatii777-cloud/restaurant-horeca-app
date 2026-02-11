
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    use: {
        baseURL: 'http://localhost:3008',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'msedge',
            use: {
                ...devices['Desktop Edge'],
                channel: 'msedge'
            },
        },
        {
            name: 'chrome',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',
            },
        },
    ],
});
