import { test, expect } from "@playwright/test"
import { MOCK_OIDC_URL, FIXTURE_APP_URL } from "../ports.mjs"

test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_OIDC_URL}/_control/reset`)
})

test("a URL that only substring-matches the redirect URL does not trigger a token exchange", async ({ page }) => {
    // "/callback-extra" contains "/callback" as a substring, but is not an
    // exact match for the configured redirect URI's path.
    await page.goto(`${FIXTURE_APP_URL}/callback-extra?code=some-code&state=some-state`)

    await page.waitForTimeout(500)
    await expect(page.getByTestId("auth-status")).toHaveText("idle")
})
