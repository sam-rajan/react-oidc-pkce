import { AUTH_DATA, isCredentialsValid, persistToken } from "./creds";
import { OidcConfig } from "./config";
import { setupRefresher } from "./refresh";
import { callBackInvoker } from "./callback";
import { exchangeForToken } from "./exchange";


export const fetchToken = (state: any) => {

    if (isCredentialsValid()) {
        callBackInvoker(state.callback, 'SUCCESS')
        return
    }

    const url = new URL(window.location.href)
    const authData = JSON.parse(sessionStorage.getItem(AUTH_DATA) as string)
    const oidcConfig = state.config as OidcConfig

    if (url.searchParams.get('state') !== authData.state) {
        callBackInvoker(state.callback, 'FAILED')
        return
    }

    var data = new URLSearchParams();
    data.append("grant_type", "authorization_code")
    data.append("redirect_uri", oidcConfig.redirectUrl)
    data.append("code", url.searchParams.get("code") as string)
    data.append("code_verifier", authData.codeVerifier)

    exchangeForToken(oidcConfig, data).then((result: any) => {
        persistToken(result)
        callBackInvoker(state.callback, 'SUCCESS')
        if (state.config.autoTokenRefresh) {
            setupRefresher(state)
        }
    }, (error: any) => {
        console.error("Error:", error);
        callBackInvoker(state.callback, 'FAILED')
    })
}







