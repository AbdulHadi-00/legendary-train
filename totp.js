// totp.js - RFC 6238 HMAC-SHA1 TOTP & Base32 Engine for Profile Lock Pro

const TOTP = {
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',

    generateBase32Secret(length = 16) {
        let secret = '';
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            secret += this.alphabet[randomValues[i] % this.alphabet.length];
        }
        return secret;
    },

    base32ToBytes(base32) {
        const cleanBase32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
        let bits = '';
        for (let i = 0; i < cleanBase32.length; i++) {
            const val = this.alphabet.indexOf(cleanBase32[i]);
            bits += val.toString(2).padStart(5, '0');
        }
        const bytes = new Uint8Array(Math.floor(bits.length / 8));
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
        }
        return bytes;
    },

    async generateTOTP(secret, timeWindowOffset = 0) {
        try {
            const keyBytes = this.base32ToBytes(secret);
            if (keyBytes.length === 0) return null;

            const epoch = Math.floor(Date.now() / 1000);
            const timeStep = Math.floor(epoch / 30) + timeWindowOffset;

            // 8-byte big endian array for counter
            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            view.setUint32(4, timeStep, false); // high 32 bits remain 0

            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBytes,
                { name: 'HMAC', hash: { name: 'SHA-1' } },
                false,
                ['sign']
            );

            const signature = await crypto.subtle.sign('HMAC', cryptoKey, buffer);
            const hmac = new Uint8Array(signature);

            const offset = hmac[hmac.length - 1] & 0x0f;
            const code = ((hmac[offset] & 0x7f) << 24) |
                         ((hmac[offset + 1] & 0xff) << 16) |
                         ((hmac[offset + 2] & 0xff) << 8) |
                         (hmac[offset + 3] & 0xff);

            const otp = (code % 1000000).toString().padStart(6, '0');
            return otp;
        } catch (err) {
            console.error("TOTP Generation Error:", err);
            return null;
        }
    },

    async verifyTOTP(secret, userCode) {
        if (!secret || !userCode || userCode.length !== 6) return false;
        const cleanCode = userCode.trim();
        
        // Check current 30s window as well as -1 and +1 for clock drift tolerance
        for (let offset of [0, -1, 1]) {
            const validCode = await this.generateTOTP(secret, offset);
            if (validCode === cleanCode) {
                return true;
            }
        }
        return false;
    }
};

if (typeof window !== 'undefined') {
    window.TOTP = TOTP;
}
