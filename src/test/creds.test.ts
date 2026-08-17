/**
 * @jest-environment jsdom
 */

import { parseToken } from '../provider/auth/creds';

describe('parseToken', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('should return null for a key that has not been stored', () => {
        expect(parseToken('someKey')).toBeNull();
    });

    it('should return the stored value for a key that exists', () => {
        sessionStorage.setItem('someKey', 'someValue');

        expect(parseToken('someKey')).toBe('someValue');
    });
});
