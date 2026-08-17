import { setupRefresher, clearRefreshTimer } from '../provider/auth/refresh';
import { isCredentialsValid, parseToken } from '../provider/auth/creds';
import { exchangeForToken } from '../provider/auth/exchange';
import * as invoker from '../provider/auth/callback';
import { OidcConfig } from '../provider/auth/config';

const buildConfig = (overrides: Partial<OidcConfig> = {}): OidcConfig => ({
    oidcUrl: 'http://example.com/oidc',
    clientId: 'mockClientId',
    redirectUrl: 'http://example.com/callback',
    scope: 'mockScope',
    autoTokenRefresh: false,
    ...overrides,
});

jest.mock('../provider/auth/creds', () => ({
    isCredentialsValid: jest.fn(),
    parseToken: jest.fn(),
    persistToken: jest.fn(),
    EXPIRES_IN: 'expiresIn',
    REFRESH_TOKEN: 'refreshToken',
}));
jest.mock('../provider/auth/exchange', () => ({
    exchangeForToken: jest.fn(),
}));
jest.mock('../provider/auth/callback');

describe('setupRefresher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should not schedule a refresh when credentials are invalid', () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(false);
        const state = { config: buildConfig(), callback: jest.fn(), refreshTimerRef: { current: null } };

        setupRefresher(state);

        expect(state.refreshTimerRef.current).toBeNull();
    });

    it('should schedule a refresh and record the timer handle when credentials are valid', () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(true);
        (parseToken as jest.Mock).mockImplementation((key: string) =>
            key === 'expiresIn' ? new Date(Date.now() + 300000).toISOString() : 'mockRefreshToken'
        );
        const state = { config: buildConfig(), callback: jest.fn(), refreshTimerRef: { current: null } };

        setupRefresher(state);

        expect(state.refreshTimerRef.current).not.toBeNull();
    });

    it('should invoke the callback with FAILED when a background refresh fails', async () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(true);
        (parseToken as jest.Mock).mockImplementation((key: string) =>
            key === 'expiresIn' ? new Date(Date.now() + 300000).toISOString() : 'mockRefreshToken'
        );
        (exchangeForToken as jest.Mock).mockRejectedValue(new Error('refresh failed'));
        const state = { config: buildConfig(), callback: jest.fn(), refreshTimerRef: { current: null } };

        setupRefresher(state);
        jest.runOnlyPendingTimers();
        await Promise.resolve();
        await Promise.resolve();

        expect(invoker.callBackInvoker).toHaveBeenCalledWith(state.callback, 'FAILED');
    });
});

describe('clearRefreshTimer', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('should clear a pending timer and reset the ref', () => {
        jest.useFakeTimers();
        const timerId = setTimeout(() => {}, 1000);
        const state = { refreshTimerRef: { current: timerId } };

        clearRefreshTimer(state);

        expect(state.refreshTimerRef.current).toBeNull();
    });

    it('should be a no-op when there is no pending timer', () => {
        expect(() => clearRefreshTimer({ refreshTimerRef: { current: null } })).not.toThrow();
        expect(() => clearRefreshTimer({})).not.toThrow();
    });
});
