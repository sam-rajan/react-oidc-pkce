import { AUTH_DATA, clearPendingAuthData, isCredentialsValid, persistToken } from "./creds";
import { setupRefresher } from "./refresh";
import { callBackInvoker } from "./callback";
import { exchangeForToken, TokenResponse } from "./exchange";
import { decodeJwtPayload } from "./utils";
import { OidcState } from "../state";


export const fetchToken = (state: OidcState) => {

    if (isCredentialsValid()) {
        callBackInvoker(state.callback, 'SUCCESS')
        return
    }

    const url = new URL(window.location.href)
    const oidcConfig = state.config

    const cleanUp = () => {
        clearPendingAuthData()
        url.searchParams.delete('code')
        url.searchParams.delete('state')
        window.history.replaceState(null, '', url.toString())
    }

    let authData: { state: string, codeVerifier: string, nonce: string } | null = null
    try {
        const rawAuthData = sessionStorage.getItem(AUTH_DATA)
        authData = rawAuthData ? JSON.parse(rawAuthData) : null
    } catch {
        authData = null
    }

    if (!authData || url.searchParams.get('state') !== authData.state) {
        cleanUp()
        callBackInvoker(state.callback, 'FAILED')
        return
    }

    var data = new URLSearchParams();
    data.append("grant_type", "authorization_code")
    data.append("redirect_uri", oidcConfig.redirectUrl)
    data.append("code", url.searchParams.get("code") as string)
    data.append("code_verifier", authData.codeVerifier)

    exchangeForToken(oidcConfig, data).then((result: TokenResponse) => {
        const idTokenPayload = decodeJwtPayload(result.id_token)
        if (idTokenPayload?.nonce !== authData!.nonce) {
            cleanUp()
            callBackInvoker(state.callback, 'FAILED')
            return
        }

        persistToken(result)
        cleanUp()
        callBackInvoker(state.callback, 'SUCCESS')
        if (state.config.autoTokenRefresh) {
            setupRefresher(state)
        }
    }, (error: unknown) => {
        console.error("Error:", error);
        cleanUp()
        callBackInvoker(state.callback, 'FAILED')
    })
}
