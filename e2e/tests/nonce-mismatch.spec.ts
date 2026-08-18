import { test, expect } from "@playwright/test"
import { MOCK_OIDC_URL } from "../ports.mjs"

test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_OIDC_URL}/_control/reset`)
})

test("a mismatched id_token nonce fails the login and does not persist tokens", async ({ page, request }) => {
    await request.post(`${MOCK_OIDC_URL}/_control/bad-nonce`)

    await page.goto("/")
    await page.getByTestId("login-button").click()
    await expect(page.getByTestId("auth-status")).toHaveText("FAILED")

    const hasAccessToken = await page.evaluate(() => sessionStorage.getItem("accessToken") !== null)
    expect(hasAccessToken).toBe(false)
})
