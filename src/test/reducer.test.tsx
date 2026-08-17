import { flowController } from '../provider/reducer';

// Deliberately no jsdom environment here: if flowController still triggered
// side effects (fetchToken/startAuthFlow/setupRefresher/logout all touch
// window/sessionStorage), calling it below would throw in a bare node
// environment. That it doesn't is itself proof the reducer is now pure.

describe('flowController', () => {
    const baseState = {
        config: { oidcUrl: 'https://oidc.example.com', clientId: 'mockClientId', redirectUrl: 'http://example.com/callback', scope: 'mockScope' },
        callback: undefined,
        refreshTimerRef: { current: null },
    };

    it('should update the callback on REGISTER while preserving config and refreshTimerRef', () => {
        const cb = jest.fn();

        const result = flowController(baseState, { type: 'REGISTER', callback: cb });

        expect(result).toEqual({ callback: cb, config: baseState.config, refreshTimerRef: baseState.refreshTimerRef });
    });

    it('should pass state through unchanged for TOKEN, AUTHORIZE, REFRESHER and LOGOUT', () => {
        const actions = [
            { type: 'TOKEN' as const },
            { type: 'AUTHORIZE' as const, isForce: false },
            { type: 'REFRESHER' as const },
            { type: 'LOGOUT' as const },
        ];

        actions.forEach((action) => {
            const result = flowController(baseState, action);
            expect(result).toEqual({ config: baseState.config, callback: baseState.callback, refreshTimerRef: baseState.refreshTimerRef });
        });
    });

    it('should be safe to invoke the same action twice with the same result (React Strict Mode double-invoke)', () => {
        const first = flowController(baseState, { type: 'TOKEN' });
        const second = flowController(baseState, { type: 'TOKEN' });

        expect(first).toEqual(second);
    });
});
