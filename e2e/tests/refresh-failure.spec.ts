import { test, expect } from "@playwright/test"
import { MOCK_OIDC_URL } from "../ports.mjs"

test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_OIDC_URL}/_control/reset`)
    await request.post(`${MOCK_OIDC_URL}/_control/expires-in`, { data: { seconds: 5 } })
})

test("a failed background refresh notifies the app via the FAILED callback", async ({ page, request }) => {
    await page.goto("/")
    await page.getByTestId("login-button").click()
    await expect(page.getByTestId("auth-status")).toHaveText("SUCCESS")

    await request.post(`${MOCK_OIDC_URL}/_control/token-error`, { data: { grantType: "refresh_token" } })

    await expect(page.getByTestId("auth-status")).toHaveText("FAILED", { timeout: 10000 })
})
