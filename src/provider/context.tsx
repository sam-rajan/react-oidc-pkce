import React, { createContext } from "react"
import { Flow } from "./reducer"

export interface OidcContextState {
    state: any,
    action: React.Dispatch<Flow>
}

export const OIDCContext = createContext<OidcContextState | undefined>(undefined)
