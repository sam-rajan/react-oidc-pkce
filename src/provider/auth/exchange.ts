import { OidcConfig } from "./config"

export const exchangeForToken = async (oidcConfig: OidcConfig, data: URLSearchParams): Promise<any> => {
    
    const tokenUrl = new URL(oidcConfig.oidcUrl)
    tokenUrl.pathname = "/token"
    data.append("client_id", oidcConfig.clientId)
    data.append("scope", oidcConfig.scope)
    const response = await fetch(tokenUrl.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data.toString()
    })

    if (response.status !== 200) {
        throw new Error("Request Failed, Error:" + await response.text());
    }

    return await response.json();
}
