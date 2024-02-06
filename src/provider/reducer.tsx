import { fetchToken } from "./auth/token"
import { startAuthFlow } from "./auth/authorize"
import { setupRefresher } from "./auth/refresh";

export type Flow =    { type: "REGISTER"; callback: (result: string) => void | undefined }
                    | { type: "SUCCESS" | "FAILED" | "TOKEN" | "REFRESHER" }
                    | { type: "AUTHORIZE"; isForce: boolean}

export function flowController(state: any, action: Flow) {

    const mutate = {
        config: state.config,
        callback: state.callback
    }
    switch (action.type) {
        case 'REGISTER': {
            return {
                callback: action.callback,
                config: state.config
            };
        }
        case 'TOKEN': {
            fetchToken(state)
            return mutate
        }
        case 'AUTHORIZE': {
            startAuthFlow(state, action.isForce)
            return mutate
        }
        case 'REFRESHER': {
            setupRefresher(state)
            return mutate
        }
    }
}