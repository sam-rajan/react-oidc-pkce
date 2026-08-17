import { clearAuthSession } from "./creds";
import { callBackInvoker } from "./callback";
import { clearRefreshTimer } from "./refresh";
import { OidcState } from "../state";

export const logout = (state: OidcState) => {
    clearRefreshTimer(state)
    clearAuthSession()
    callBackInvoker(state.callback, 'LOGGED_OUT')
}
