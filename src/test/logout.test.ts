import { logout } from '../provider/auth/logout';
import { clearAuthSession } from '../provider/auth/creds';
import * as invoker from '../provider/auth/callback';

jest.mock('../provider/auth/creds', () => ({
    clearAuthSession: jest.fn(),
}));
jest.mock('../provider/auth/callback');

describe('logout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should clear the auth session and invoke the callback with LOGGED_OUT', () => {
        const mockState = { callback: jest.fn() };

        logout(mockState);

        expect(clearAuthSession).toHaveBeenCalled();
        expect(invoker.callBackInvoker).toHaveBeenCalledWith(mockState.callback, 'LOGGED_OUT');
    });
});
