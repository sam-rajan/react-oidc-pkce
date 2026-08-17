import { FC, PropsWithChildren, useEffect, useReducer } from "react"
import { OidcConfig } from "./auth/config";
import { flowController } from "./reducer";
import { OIDCContext } from "./context";

interface AuthProps extends PropsWithChildren {
    oidcConfig: OidcConfig
}

const OIDCContextProvider: FC<AuthProps> = (props) => {
    const initialState: any = { config: props.oidcConfig };
    const [state, action] = useReducer(flowController, initialState)
    
    useEffect(() => {
        const url = new URL(window.location.href)
        const redirectUrl = new URL(props.oidcConfig.redirectUrl)
        const isRedirectMatch = url.origin === redirectUrl.origin && url.pathname === redirectUrl.pathname

        if (isRedirectMatch &&
            url.searchParams.get('code') &&
            url.searchParams.get('state')) {
            action({ type: "TOKEN"})
            return
        }

        if (props.oidcConfig.autoTokenRefresh) {
            action({ type: "REFRESHER"})
        }
    }, [])

    return (<OIDCContext.Provider value={{state: state, action: action}}>{props.children}</OIDCContext.Provider>)
}

export default OIDCContextProvider;