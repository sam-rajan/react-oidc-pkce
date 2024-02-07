/**
 * @jest-environment jsdom
 */

import { startAuthFlow } from '../provider/auth/authorize';
import { isCredentialsValid } from '../provider/auth/creds';
import { arrayBufferToBase64, randomString } from '../provider/auth/utils';
import { TextEncoder, TextDecoder } from 'text-encoding';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });


jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('mockState'),
}));

jest.mock('../provider/auth/creds', () => ({
    isCredentialsValid: jest.fn(),
    AUTH_DATA: 'mockAuthData',
}));

jest.mock('../provider/auth/utils', () => ({
    arrayBufferToBase64: jest.fn(),
    randomString: jest.fn(),
}));

const mockOidcState = {
    config: {
        oidcUrl: 'http://example.com/oidc',
        clientId: 'mockClientId',
        redirectUrl: 'http://example.com/callback',
        scope: 'mockScope',
    },
    callback: jest.fn(),
};

describe('startAuthFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should invoke callback with SUCCESS if credentials are valid and force is false', async () => {
        
        (isCredentialsValid as jest.Mock).mockReturnValueOnce(true);
        await startAuthFlow(mockOidcState, false);

        expect(mockOidcState.callback).toHaveBeenCalledWith('SUCCESS');
    });

    it('should redirect to authorization URL with correct parameters', async () => {
       
        (isCredentialsValid as jest.Mock).mockReturnValueOnce(false);
        (arrayBufferToBase64 as jest.Mock).mockReturnValue('mockCodeChallenge');
        (randomString as jest.Mock).mockReturnValue('mockNonce');
        await startAuthFlow(mockOidcState, true);
        expect(sessionStorage.clear).toHaveBeenCalled();
        expect(window.location.href).toBe('http://example.com/oidc/authorize?response_type=code&client_id=mockClientId&redirect_uri=http%3A%2F%2Fexample.com%2Fcallback&state=mockState&scope=mockScope&code_challenge_method=S256&code_challenge=mockCodeChallenge&nonce=mockNonce');
        expect(sessionStorage.setItem).toHaveBeenCalledWith('mockAuthData', JSON.stringify({
            state: 'mockState',
            codeVerifier: 'mockCodeVerifier',
            nonce: 'mockNonce',
        }));
    });
});