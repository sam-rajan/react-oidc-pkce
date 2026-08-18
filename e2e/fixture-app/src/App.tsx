import { useEffect, useState } from "react"
import { OIDCContextProvider, useAuthContext } from "react-oidc-pkce"

const oidcConfig = {
    oidcUrl: import.meta.env.VITE_OIDC_URL,
    clientId: "test-client",
    redirectUrl: import.meta.env.VITE_REDIRECT_URL,
    scope: "openid",
    autoTokenRefresh: true,
}

function AuthPanel() {
    const auth = useAuthContext()
    const [status, setStatus] = useState("idle")

    useEffect(() => {
        auth.registerCallback((result) => setStatus(result))
    }, [])

    return (
        <div>
            <p data-testid="auth-status">{status}</p>
            <p data-testid="access-token">{auth.getAccessToken() ?? ""}</p>
            <button data-testid="login-button" onClick={() => auth.authorize({ force: false })}>Login</button>
            <button data-testid="logout-button" onClick={() => auth.logout()}>Logout</button>
        </div>
    )
}

export default function App() {
    return (
        <OIDCContextProvider oidcConfig={oidcConfig}>
            <AuthPanel />
        </OIDCContextProvider>
    )
}
