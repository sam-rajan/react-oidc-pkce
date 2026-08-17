import { exchangeForToken } from '../provider/auth/exchange';
import { OidcConfig } from '../provider/auth/config';

const mockConfig: OidcConfig = {
    oidcUrl: 'http://example.com/oidc',
    clientId: 'mockClientId',
    redirectUrl: 'http://example.com/callback',
    scope: 'mockScope',
};

describe('exchangeForToken', () => {
    beforeEach(() => {
        (global as any).fetch = jest.fn();
    });

    it('should resolve with the parsed JSON body for any 2xx response', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 201,
            json: () => Promise.resolve({ access_token: 'a' }),
        });

        const result = await exchangeForToken(mockConfig, new URLSearchParams());

        expect(result).toEqual({ access_token: 'a' });
    });

    it('should throw for a non-2xx response', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 400,
            text: () => Promise.resolve('invalid_grant'),
        });

        await expect(exchangeForToken(mockConfig, new URLSearchParams())).rejects.toThrow('invalid_grant');
    });
});
