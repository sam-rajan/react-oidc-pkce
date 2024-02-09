import { v4 as uuidv4 } from 'uuid';
import { AUTH_DATA, isCredentialsValid } from "./creds";
import { arrayBufferToBase64, randomString } from "./utils";
import { OidcConfig } from "./config";
import { callBackInvoker } from "./callback";

export const startAuthFlow = async (oidcState: any, force: boolean) => {
    
    if (isCredentialsValid() && !force) {
        callBackInvoker(oidcState.callback, 'SUCCESS')
        return
    }

    var config: OidcConfig = oidcState.config as OidcConfig
    sessionStorage.clear()
    const authUrl = new URL(config.oidcUrl + "/authorize")
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("client_id", config.clientId)
    authUrl.searchParams.append("redirect_uri", config.redirectUrl)
    const state = uuidv4()
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("scope", config.scope)
    authUrl.searchParams.append("code_challenge_method", "S256")
    
    const codeVerifier = randomString(64)
    const data = new TextEncoder().encode(codeVerifier)
    const codeChallenge = await window.crypto.subtle.digest("SHA-256", data)
    
    authUrl.searchParams.append("code_challenge", arrayBufferToBase64(codeChallenge))
    const nonce = randomString(32)
    authUrl.searchParams.append("nonce", nonce)
    
    const authData = {
        state: state,
        codeVerifier: new TextDecoder().decode(data),
        nonce : nonce
    }

    sessionStorage.setItem(AUTH_DATA, JSON.stringify(authData))
    window.location.href = authUrl.toString() 
}
