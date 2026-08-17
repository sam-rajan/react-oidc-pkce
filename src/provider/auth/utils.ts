const RANDOM_STRING_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"

export function randomString(length: number): string {
    const randomValues = new Uint8Array(length)
    window.crypto.getRandomValues(randomValues)

    let result = ""
    for (let i = 0; i < length; i++) {
        result += RANDOM_STRING_CHARS[randomValues[i] % RANDOM_STRING_CHARS.length]
    }

    return result
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";


    var bytes = new Uint8Array(buffer),
        i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
        base64 = base64.substring(0, base64.length - 1);
    } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2);
    }

    return base64;
}

export function decodeJwtPayload(token: string): any {
    const payload = token.split(".")[1]
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=")
    return JSON.parse(atob(padded))
}