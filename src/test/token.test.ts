/**
 * @jest-environment jsdom
 */

import { fetchToken } from '../provider/auth/token';
import { isCredentialsValid, persistToken, clearPendingAuthData } from '../provider/auth/creds';
import { exchangeForToken } from '../provider/auth/exchange';
import * as invoker from '../provider/auth/callback';

jest.mock('../provider/auth/creds', () => ({
    isCredentialsValid: jest.fn(),
    persistToken: jest.fn(),
    clearPendingAuthData: jest.fn(),
    parseToken: jest.fn(),
    AUTH_DATA: 'mockAuthData',
    EXPIRES_IN: 'expiresIn',
    REFRESH_TOKEN: 'refreshToken',
}));
jest.mock('../provider/auth/exchange', () => ({
    exchangeForToken: jest.fn(),
}));
jest.mock('../provider/auth/callback');

const mockState = {
    config: {
        oidcUrl: 'http://example.com/oidc',
        clientId: 'mockClientId',
        redirectUrl: 'http://example.com/callback',
        scope: 'mockScope',
        autoTokenRefresh: false,
    },
    callback: jest.fn(),
};

const VALID_ID_TOKEN = 'header.eyJub25jZSI6Im1vY2tOb25jZSJ9.signature';
const MISMATCHED_NONCE_ID_TOKEN = 'header.eyJub25jZSI6Indyb25nTm9uY2UifQ.signature';

const sessionStorageMock = {
    getItem: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
Object.defineProperty(window, 'history', { value: { replaceState: jest.fn() } });
Object.defineProperty(window, 'location', {
    value: { href: 'http://example.com/callback?code=myCode&state=mockState' },
    writable: true,
});

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('fetchToken', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.location.href = 'http://example.com/callback?code=myCode&state=mockState';
    });

    it('should invoke callback with SUCCESS without reading auth data if credentials are already valid', () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(true);

        fetchToken(mockState);

        expect(invoker.callBackInvoker).toHaveBeenCalledWith(mockState.callback, 'SUCCESS');
        expect(sessionStorageMock.getItem).not.toHaveBeenCalled();
    });

    it('should invoke callback with FAILED and not throw when AUTH_DATA is missing', () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(false);
        sessionStorageMock.getItem.mockReturnValue(null);

        expect(() => fetchToken(mockState)).not.toThrow();

        expect(invoker.callBackInvoker).toHaveBeenCalledWith(mockState.callback, 'FAILED');
        expect(clearPendingAuthData).toHaveBeenCalled();
        expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should invoke callback with FAILED when AUTH_DATA is present but unparsable', () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(false);
        sessionStorageMock.getItem.mockReturnValue('not-json');

        expect(() => fetchToken(mockState)).not.toThrow();

        expect(invoker.callBackInvoker).toHaveBeenCalledWith(mockState.callback, 'FAILED');
        expect(clearPendingAuthData).toHaveBeenCalled();
    });

    it('should invoke callback with FAILED when the state parameter does not match', () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(false);
        sessionStorageMock.getItem.mockReturnValue(JSON.stringify({ state: 'someOtherState', codeVerifier: 'v', nonce: 'n' }));

        fetchToken(mockState);

        expect(invoker.callBackInvoker).toHaveBeenCalledWith(mockState.callback, 'FAILED');
        expect(clearPendingAuthData).toHaveBeenCalled();
        expect(exchangeForToken).not.toHaveBeenCalled();
    });

    it('should invoke callback with FAILED and not persist tokens when the nonce does not match the id_token', async () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(false);
        sessionStorageMock.getItem.mockReturnValue(JSON.stringify({ state: 'mockState', codeVerifier: 'v', nonce: 'mockNonce' }));
        (exchangeForToken as jest.Mock).mockResolvedValue({ id_token: MISMATCHED_NONCE_ID_TOKEN, access_token: 'a' });

        fetchToken(mockState);
        await flushPromises();

        expect(persistToken).not.toHaveBeenCalled();
        expect(invoker.callBackInvoker).toHaveBeenCalledWith(mockState.callback, 'FAILED');
        expect(clearPendingAuthData).toHaveBeenCalled();
    });

    it('should persist tokens, clear auth data and clean up the URL on a successful exchange', async () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(false);
        sessionStorageMock.getItem.mockReturnValue(JSON.stringify({ state: 'mockState', codeVerifier: 'v', nonce: 'mockNonce' }));
        const tokenResponse = { id_token: VALID_ID_TOKEN, access_token: 'a', expires_in: 3600 };
        (exchangeForToken as jest.Mock).mockResolvedValue(tokenResponse);

        fetchToken(mockState);
        await flushPromises();

        expect(persistToken).toHaveBeenCalledWith(tokenResponse);
        expect(invoker.callBackInvoker).toHaveBeenCalledWith(mockState.callback, 'SUCCESS');
        expect(clearPendingAuthData).toHaveBeenCalled();
        expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should invoke callback with FAILED when the token exchange request fails', async () => {
        (isCredentialsValid as jest.Mock).mockReturnValue(false);
        sessionStorageMock.getItem.mockReturnValue(JSON.stringify({ state: 'mockState', codeVerifier: 'v', nonce: 'mockNonce' }));
        (exchangeForToken as jest.Mock).mockRejectedValue(new Error('exchange failed'));

        fetchToken(mockState);
        await flushPromises();

        expect(persistToken).not.toHaveBeenCalled();
        expect(invoker.callBackInvoker).toHaveBeenCalledWith(mockState.callback, 'FAILED');
        expect(clearPendingAuthData).toHaveBeenCalled();
    });
});
