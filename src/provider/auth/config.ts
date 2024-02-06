export interface OidcConfig {
    oidcUrl: string
    clientId: string
    redirectUrl: string
    scope: string
    autoTokenRefresh? : boolean
}