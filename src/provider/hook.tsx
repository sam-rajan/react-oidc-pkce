import { useContext } from "react"
import { OIDCContext } from "./context"
import { parseToken, isCredentialsValid, ACCESS_TOKEN, REFRESH_TOKEN, ID_TOKEN } from "./auth/creds"

export interface AuthorizeOptions {
    force?: boolean
}

export default function useAuthContext() {
    const authState = useContext(OIDCContext)

    if (!authState) {
        throw new Error("Null Context, use OIDCContextProvider as a parent component");
    }

    return {
        authorize: (options: AuthorizeOptions) => {
            authState?.action({ type: 'AUTHORIZE', isForce: options.force ?? false })
        },
        getAccessToken: () => {
            return parseToken(ACCESS_TOKEN)
        },
        getRefreshToken: () => {
            return parseToken(REFRESH_TOKEN)
        },
        getIdToken: () => {
            return parseToken(ID_TOKEN)
        },
        isAuthValid: () => {
            return isCredentialsValid()
        },
        registerCallback: (authCallback: (result: string) => void) => {
            authState?.action({type: 'REGISTER', callback: authCallback})
        },
        logout: () => {
            authState?.action({ type: 'LOGOUT' })
        }
    }
}