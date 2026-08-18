# Changelog

All notable changes to this project are documented in this file.

## [1.1.0]

### Added
- `logout()` on `useAuthContext()` — clears the locally stored session and invokes the registered callback with `'LOGGED_OUT'`.
- Public `OidcConfig`, `AuthorizeOptions`, and `TokenResponse` types are now exported from the package.
- CI workflow that runs the test suite and build on every push/PR.

### Security
- The PKCE code verifier and nonce are now generated with `crypto.getRandomValues` instead of `Math.random()`.
- The `id_token`'s `nonce` claim is now validated against the value generated at authorize-time; a mismatch is treated as a failed login.
- Session clearing is now scoped to this library's own storage keys instead of wiping all of `sessionStorage`.
- Redirect URI matching now requires an exact origin+path match instead of a substring check.
- The authorization code/state are stripped from the URL, and pending auth data is cleared from storage, after every callback outcome.
- A missing or malformed callback state (e.g. a bare or replayed redirect URL) now fails gracefully instead of throwing.
- Resolved all `npm audit` findings (18 → 0), including moving the one runtime dependency, `uuid`, off a version with a moderate-severity advisory.

### Fixed
- Background token refresh failures now invoke the registered callback with `'FAILED'` instead of only logging to the console.
- The scheduled refresh timer is now cancelled on unmount, logout, and re-authorization instead of leaking.
- `exchangeForToken` now accepts any 2xx response instead of only exactly `200`.
- Fixed a dead null-check in `parseToken`.
- Fixed the CommonJS build (`require('react-oidc-pkce')`) returning `undefined` for both exports.
- The internal reducer is now a pure function, so it can no longer double-fire side effects (e.g. exchanging a single-use authorization code twice) under React Strict Mode.

### Changed
- Removed all remaining `any` types in favor of real interfaces.
- The published package now ships only the built output — not source, tests, or tooling config.
