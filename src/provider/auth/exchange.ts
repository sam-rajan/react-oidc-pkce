import { OidcConfig } from "./config"

export interface TokenResponse {
    access_token: string
    id_token: string
    refresh_token?: string
    expires_in: number | string
    token_type?: string
    scope?: string
}

export const exchangeForToken = async (oidcConfig: OidcConfig, data: URLSearchParams): Promise<TokenResponse> => {
    
    const tokenUrl = new URL(oidcConfig.oidcUrl + "/token")
    data.append("client_id", oidcConfig.clientId)
    data.append("scope", oidcConfig.scope)
    const response = await fetch(tokenUrl.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data.toString()
    })

    if (!response.ok) {
        throw new Error("Request Failed, Error:" + await response.text());
    }

    return await response.json();
}
