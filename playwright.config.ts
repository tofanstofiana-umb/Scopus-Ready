import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

Object.assign(process.env, loadEnv("test", process.cwd(), ""));

const externalBaseUrl = process.env.E2E_BASE_URL;
const baseURL = externalBaseUrl || "http://localhost:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "node node_modules/next/dist/bin/next start -p 3100",
        url: baseURL,
        reuseExistingServer: false,
      },
});
