/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import useAuthContext from '../provider/hook';
import { OIDCContext } from '../provider/context';
import { parseToken, isCredentialsValid } from '../provider/auth/creds';

jest.mock('../provider/auth/creds', () => ({
    parseToken: jest.fn(),
    isCredentialsValid: jest.fn(),
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    ID_TOKEN: 'idToken',
}));

describe('useAuthContext', () => {
    it('should throw when used outside OIDCContextProvider', () => {
        const { result } = renderHook(() => {
            try {
                return useAuthContext();
            } catch (e) {
                return e as Error;
            }
        });

        expect(result.current).toBeInstanceOf(Error);
    });

    describe('inside a provider', () => {
        const mockAction = jest.fn();
        const wrapper = ({ children }: PropsWithChildren) => (
            <OIDCContext.Provider value={{ state: {} as any, action: mockAction }}>
                {children}
            </OIDCContext.Provider>
        );

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should dispatch AUTHORIZE with the given force flag', () => {
            const { result } = renderHook(() => useAuthContext(), { wrapper });

            result.current.authorize({ force: true });

            expect(mockAction).toHaveBeenCalledWith({ type: 'AUTHORIZE', isForce: true });
        });

        it('should default isForce to false when force is not provided', () => {
            const { result } = renderHook(() => useAuthContext(), { wrapper });

            result.current.authorize({});

            expect(mockAction).toHaveBeenCalledWith({ type: 'AUTHORIZE', isForce: false });
        });

        it('should dispatch REGISTER with the given callback', () => {
            const { result } = renderHook(() => useAuthContext(), { wrapper });
            const cb = jest.fn();

            result.current.registerCallback(cb);

            expect(mockAction).toHaveBeenCalledWith({ type: 'REGISTER', callback: cb });
        });

        it('should dispatch LOGOUT', () => {
            const { result } = renderHook(() => useAuthContext(), { wrapper });

            result.current.logout();

            expect(mockAction).toHaveBeenCalledWith({ type: 'LOGOUT' });
        });

        it('should read tokens via parseToken with the right storage keys', () => {
            (parseToken as jest.Mock).mockImplementation((key: string) => `value-${key}`);
            const { result } = renderHook(() => useAuthContext(), { wrapper });

            expect(result.current.getAccessToken()).toBe('value-accessToken');
            expect(result.current.getRefreshToken()).toBe('value-refreshToken');
            expect(result.current.getIdToken()).toBe('value-idToken');
        });

        it('should reflect isCredentialsValid for isAuthValid', () => {
            (isCredentialsValid as jest.Mock).mockReturnValue(true);
            const { result } = renderHook(() => useAuthContext(), { wrapper });

            expect(result.current.isAuthValid()).toBe(true);
        });
    });
});
