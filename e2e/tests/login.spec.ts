import { test, expect } from "@playwright/test"
import { MOCK_OIDC_URL } from "../ports.mjs"

test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_OIDC_URL}/_control/reset`)
})

test("completes a full login flow and cleans up the callback URL", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId("auth-status")).toHaveText("idle")

    await page.getByTestId("login-button").click()
    await expect(page.getByTestId("auth-status")).toHaveText("SUCCESS")
    await expect(page.getByTestId("access-token")).not.toHaveText("")

    const url = new URL(page.url())
    expect(url.searchParams.get("code")).toBeNull()
    expect(url.searchParams.get("state")).toBeNull()

    const hasAccessToken = await page.evaluate(() => sessionStorage.getItem("accessToken") !== null)
    expect(hasAccessToken).toBe(true)
})
