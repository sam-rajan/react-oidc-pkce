export function randomString(length: number): string {
    const iteration = length / 10

    let randomString = ""
    for (let i = 0; i < iteration; i++) {
        randomString += Math.random().toString(36).substring(2)
    }

    randomString += Math.random().toString(36).substring(2)
    return randomString.substring(0, length)
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