import { test, expect } from "@playwright/test"
import { MOCK_OIDC_URL } from "../ports.mjs"

test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_OIDC_URL}/_control/reset`)
})

test("logs out and clears the session", async ({ page }) => {
    await page.goto("/")
    await page.getByTestId("login-button").click()
    await expect(page.getByTestId("auth-status")).toHaveText("SUCCESS")

    await page.getByTestId("logout-button").click()
    await expect(page.getByTestId("auth-status")).toHaveText("LOGGED_OUT")

    const hasAccessToken = await page.evaluate(() => sessionStorage.getItem("accessToken") !== null)
    expect(hasAccessToken).toBe(false)
})
