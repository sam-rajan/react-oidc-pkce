import React, { createContext } from "react"
import { Flow } from "./reducer"
import { OidcState } from "./state"

export interface OidcContextState {
    state: OidcState,
    action: React.Dispatch<Flow>
}

export const OIDCContext = createContext<OidcContextState | undefined>(undefined)
