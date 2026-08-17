import { Flow } from "./reducer"
import { OidcState } from "./state"
import { fetchToken } from "./auth/token"
import { startAuthFlow } from "./auth/authorize"
import { setupRefresher } from "./auth/refresh"
import { logout } from "./auth/logout"

export function runSideEffect(action: Flow, state: OidcState): void {
    switch (action.type) {
        case 'TOKEN':
            fetchToken(state)
            break
        case 'AUTHORIZE':
            startAuthFlow(state, action.isForce)
            break
        case 'REFRESHER':
            setupRefresher(state)
            break
        case 'LOGOUT':
            logout(state)
            break
    }
}
