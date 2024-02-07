import { randomString, arrayBufferToBase64 } from '../provider/auth/utils';

describe('randomString', () => {
    it('should generate a random string of specified length', () => {
        const length = 10;
        const generatedString = randomString(length);

        expect(generatedString).toHaveLength(length);
    });

    it('should generate a random string of specified length for various input lengths', () => {
        const lengths = [5, 10, 15, 20];

        lengths.forEach((length) => {
            const generatedString = randomString(length);
            expect(generatedString).toHaveLength(length);
        });
    });

    // Add more test cases as needed
});

describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to Base64 string', () => {
        const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
        const base64String = arrayBufferToBase64(buffer);

        expect(base64String).toBe('SGVsbG8');
    });

    it('should convert ArrayBuffer to Base64 string for different input buffers', () => {
        const buffers = [
            new Uint8Array([72, 101, 108, 108, 111]).buffer,
            new Uint8Array([84, 101, 115, 116]).buffer,
        ];

        const expectedResults = [
            'SGVsbG8',
            'VGVzdA',
        ];

        buffers.forEach((buffer, index) => {
            const base64String = arrayBufferToBase64(buffer);
            expect(base64String).toBe(expectedResults[index]);
        });
    });

});
