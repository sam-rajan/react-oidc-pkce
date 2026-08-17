import { FC, PropsWithChildren, useEffect, useRef, useReducer } from "react"
import { OidcConfig } from "./auth/config";
import { flowController, Flow } from "./reducer";
import { runSideEffect } from "./effects";
import { clearRefreshTimer } from "./auth/refresh";
import { OIDCContext } from "./context";
import { OidcState } from "./state";

interface AuthProps extends PropsWithChildren {
    oidcConfig: OidcConfig
}

const OIDCContextProvider: FC<AuthProps> = (props) => {
    const initialState: OidcState = { config: props.oidcConfig, refreshTimerRef: { current: null } };
    const [state, dispatch] = useReducer(flowController, initialState)
    const stateRef = useRef(initialState)
    const hasHandledRedirect = useRef(false)

    const runAction = (action: Flow) => {
        dispatch(action)
        if (action.type === 'REGISTER') {
            stateRef.current = { ...stateRef.current, callback: action.callback }
        }
        runSideEffect(action, stateRef.current)
    }

    useEffect(() => {
        if (!hasHandledRedirect.current) {
            hasHandledRedirect.current = true

            const url = new URL(window.location.href)
            const redirectUrl = new URL(props.oidcConfig.redirectUrl)
            const isRedirectMatch = url.origin === redirectUrl.origin && url.pathname === redirectUrl.pathname

            if (isRedirectMatch &&
                url.searchParams.get('code') &&
                url.searchParams.get('state')) {
                runAction({ type: "TOKEN"})
            } else if (props.oidcConfig.autoTokenRefresh) {
                runAction({ type: "REFRESHER"})
            }
        }

        return () => clearRefreshTimer(state)
    }, [])

    return (<OIDCContext.Provider value={{state: state, action: runAction}}>{props.children}</OIDCContext.Provider>)
}

export default OIDCContextProvider;
