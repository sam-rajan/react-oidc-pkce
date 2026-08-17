import { OidcState } from "./state"

export type Flow =    { type: "REGISTER"; callback: (result: string) => void | undefined }
                    | { type: "SUCCESS" | "FAILED" | "TOKEN" | "REFRESHER" | "LOGOUT" }
                    | { type: "AUTHORIZE"; isForce: boolean}

export function flowController(state: OidcState, action: Flow): OidcState {

    const mutate: OidcState = {
        config: state.config,
        callback: state.callback,
        refreshTimerRef: state.refreshTimerRef
    }
    switch (action.type) {
        case 'REGISTER': {
            return {
                callback: action.callback,
                config: state.config,
                refreshTimerRef: state.refreshTimerRef
            };
        }
        case 'TOKEN':
        case 'AUTHORIZE':
        case 'REFRESHER':
        case 'LOGOUT': {
            return mutate
        }
        default:
            return state
    }
}