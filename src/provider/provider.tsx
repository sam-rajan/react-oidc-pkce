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
        if (url.href.includes(props.oidcConfig.redirectUrl) &&
            url.searchParams.get('code') != null &&
            url.searchParams.get('state') != null) { 
            action({ type: "TOKEN"})
        } 
        
        if (props.oidcConfig.autoTokenRefresh) {
            action({ type: "REFRESHER"})
        }
    }, [])

    return (<OIDCContext.Provider value={{state: state, action: action}}>{props.children}</OIDCContext.Provider>)
}

export default OIDCContextProvider;