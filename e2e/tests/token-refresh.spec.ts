import { test, expect } from "@playwright/test"
import { MOCK_OIDC_URL } from "../ports.mjs"

test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_OIDC_URL}/_control/reset`)
    // A short expiry makes setupRefresher's "120s before expiry" buffer
    // clamp to 0, so the background refresh fires almost immediately
    // instead of requiring the test to wait for real time to pass.
    await request.post(`${MOCK_OIDC_URL}/_control/expires-in`, { data: { seconds: 5 } })
})

test("automatically refreshes the access token before it expires", async ({ page }) => {
    await page.goto("/")
    await page.getByTestId("login-button").click()
    await expect(page.getByTestId("auth-status")).toHaveText("SUCCESS")

    const initialToken = await page.evaluate(() => sessionStorage.getItem("accessToken"))

    await expect(async () => {
        const currentToken = await page.evaluate(() => sessionStorage.getItem("accessToken"))
        expect(currentToken).not.toBeNull()
        expect(currentToken).not.toBe(initialToken)
    }).toPass({ timeout: 10000 })
})
