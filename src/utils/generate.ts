import { IToken } from '@/models/token';
import { randomBytes } from 'crypto';
import { apiTokenAccessLevels } from '@/constants/access';
const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateInviteCode(length = 10): string {
    return Array.from({ length }, () => ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)]).join('')
}


/**
 * Generates a random alphanumeric string of given length.
 */
export function randomAlphaNumeric(length: number): string {
    const bytes = randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
        // Map byte to 0-61
        const idx = bytes[i] % ALPHANUM.length;
        result += ALPHANUM[idx];
    }
    return result;
}

/**
 * Generates an API key composed of alphanumeric characters only.
 * Appends the two-digit access level code at the end.
 */
export function generateApiKey(
    accessLevel: keyof typeof apiTokenAccessLevels,
): IToken {
    // Generate 64-character random part
    const randomPart = randomAlphaNumeric(64);
    const levelCode = apiTokenAccessLevels[accessLevel];
    const apiKey = `${randomPart}${levelCode}`;

    return {
        id: apiKey,
        createdAt: Date.now(),
    };
}