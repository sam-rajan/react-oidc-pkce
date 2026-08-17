import { EXPIRES_IN, REFRESH_TOKEN, isCredentialsValid, parseToken, persistToken } from "./creds";
import { exchangeForToken, TokenResponse } from "./exchange";
import { callBackInvoker } from "./callback";
import { OidcState } from "../state";

export function clearRefreshTimer(state?: { refreshTimerRef?: OidcState['refreshTimerRef'] } | null): void {
    if (state?.refreshTimerRef?.current) {
        clearTimeout(state.refreshTimerRef.current)
        state.refreshTimerRef.current = null
    }
}

export const setupRefresher = (state: OidcState) => {

    if (!isCredentialsValid()) {
        return
    }

    var expiry = parseToken(EXPIRES_IN)
    var remainingTime = ((expiry == null ? 0 : Date.parse(expiry)) - new Date().getTime()) - 120000
    remainingTime = remainingTime < 0 ? 0 : remainingTime
    state.refreshTimerRef.current = setTimeout(() => rotateAccessToken(state, parseToken(REFRESH_TOKEN)), remainingTime)
}

const rotateAccessToken = (state: OidcState, refreshToken: string | null) => {
    if (!refreshToken) {
        return
    }

    var data = new URLSearchParams()
    data.append("grant_type", "refresh_token")
    data.append("refresh_token", refreshToken)
    exchangeForToken(state.config, data).then((result: TokenResponse) => {
        persistToken(result)
        if (state.config.autoTokenRefresh) {
            setupRefresher(state)
        }
    }, (error: unknown) => {
        console.error("Error:", error)
        callBackInvoker(state.callback, 'FAILED')
    })
}
