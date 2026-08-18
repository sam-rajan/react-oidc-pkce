import { test, expect } from "@playwright/test"
import { MOCK_OIDC_URL, FIXTURE_APP_URL } from "../ports.mjs"

test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_OIDC_URL}/_control/reset`)
})

test("a bare callback URL with no prior authorize attempt fails without crashing", async ({ page }) => {
    await page.goto(`${FIXTURE_APP_URL}/callback?code=forged-code&state=forged-state`)
    await expect(page.getByTestId("auth-status")).toHaveText("FAILED")
})
