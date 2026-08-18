import { defineConfig, devices } from "@playwright/test"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { MOCK_OIDC_PORT, MOCK_OIDC_URL, FIXTURE_APP_PORT, FIXTURE_APP_URL, REDIRECT_URL } from "./ports.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

export default defineConfig({
    testDir: "./tests",
    workers: 1,
    reporter: "list",
    use: {
        baseURL: FIXTURE_APP_URL,
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    ],
    webServer: [
        {
            command: "node e2e/mock-oidc-server.mjs",
            cwd: ROOT,
            port: MOCK_OIDC_PORT,
            env: { MOCK_OIDC_PORT: String(MOCK_OIDC_PORT) },
            reuseExistingServer: !process.env.CI,
        },
        {
            command: "npx vite --config e2e/fixture-app/vite.config.ts",
            cwd: ROOT,
            port: FIXTURE_APP_PORT,
            env: {
                VITE_OIDC_URL: MOCK_OIDC_URL,
                VITE_REDIRECT_URL: REDIRECT_URL,
                FIXTURE_APP_PORT: String(FIXTURE_APP_PORT),
            },
            reuseExistingServer: !process.env.CI,
        },
    ],
})
