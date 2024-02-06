export const TOKEN = "token"
export const AUTH_DATA = "authData"

export const ACCESS_TOKEN = "accessToken"
export const EXPIRES_IN = "expiresIn"
export const ID_TOKEN = "idToken"
export const REFRESH_TOKEN = "refreshToken"


export function isCredentialsValid(): boolean {
    const expiry = sessionStorage.getItem(EXPIRES_IN)
    if (expiry === null) {
        return false
    }

    const expiryDate = new Date(expiry)
    if (new Date() > expiryDate) {
        return false
    }

    return true
}

export function parseToken(type: string): string | null{
    return sessionStorage.getItem(type) === undefined ? null : sessionStorage.getItem(type) as string
}

export function persistToken(token: any) {
    const expiry = new Date()
    expiry.setTime(expiry.getTime() + Number(token.expires_in) * 1000)
    sessionStorage.setItem(EXPIRES_IN, expiry.toISOString())
    sessionStorage.setItem(ACCESS_TOKEN, token.access_token)
    sessionStorage.setItem(ID_TOKEN, token.id_token)

    if (token.refresh_token) {
        sessionStorage.setItem(REFRESH_TOKEN, token.refresh_token)
    }
}