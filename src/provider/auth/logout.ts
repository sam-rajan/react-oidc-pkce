import { clearAuthSession } from "./creds";
import { callBackInvoker } from "./callback";

export const logout = (state: any) => {
    clearAuthSession()
    callBackInvoker(state.callback, 'LOGGED_OUT')
}
