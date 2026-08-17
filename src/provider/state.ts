import { OidcConfig } from "./auth/config"

export interface OidcState {
    config: OidcConfig
    callback?: (result: string) => void
    refreshTimerRef: { current: ReturnType<typeof setTimeout> | null }
}
