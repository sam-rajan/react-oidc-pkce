import { OidcContextState } from "../context";
import { EXPIRES_IN, REFRESH_TOKEN, isCredentialsValid, parseToken, persistToken } from "./creds";
import { exchangeForToken } from "./exchange";

export const setupRefresher = async (oidcContextState: OidcContextState) => {

    if (!isCredentialsValid()) {
        return
    }

    var expiry = parseToken(EXPIRES_IN)
    var remainingTime = ((expiry == null ? 0 : Date.parse(expiry)) - new Date().getTime()) - 120000 
    remainingTime = remainingTime < 0 ? 0 : remainingTime
    setTimeout(() => rotateAccessToken(oidcContextState, parseToken(REFRESH_TOKEN)), remainingTime)
}

const rotateAccessToken = (state: any, refreshToken: string | null) => {
    if (!refreshToken) {
        return
    }

    var data = new URLSearchParams()
    data.append("grant_type", "refresh_token")
    data.append("refresh_token", refreshToken)
    exchangeForToken(state.config, data).then((result: any) => {
        persistToken(result)
        if (state.config.autoTokenRefresh) {
            setupRefresher(state)
        }
    }, (error: any) => {
        console.error("Error:", error)
    })
}