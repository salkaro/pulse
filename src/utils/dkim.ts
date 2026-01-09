import crypto from 'crypto';

export interface DKIMKeyPair {
    privateKey: string;
    publicKey: string;
    publicKeyForDNS: string;
}

/**
 * Generates a DKIM RSA key pair for email authentication
 * @param keySize - RSA key size in bits (1024 or 2048 recommended, 2048 is more secure)
 * @returns DKIMKeyPair object with private key, public key, and DNS-formatted public key
 */
export function generateDKIMKeyPair(keySize: number = 2048): DKIMKeyPair {
    // Generate RSA key pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: keySize,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    // Extract the public key for DNS (remove headers and newlines)
    const publicKeyForDNS = extractPublicKeyForDNS(publicKey);

    return {
        privateKey,
        publicKey,
        publicKeyForDNS
    };
}

/**
 * Extracts and formats the public key for DNS TXT record
 * Removes PEM headers/footers and newlines, keeping only the base64 key data
 */
function extractPublicKeyForDNS(publicKey: string): string {
    return publicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .trim();
}

/**
 * Creates a DKIM DNS record value from a public key
 * @param publicKeyForDNS - Base64 encoded public key without PEM headers
 * @param keyType - Key type (default: rsa)
 * @returns Formatted DKIM record value for DNS
 */
export function createDKIMRecordValue(publicKeyForDNS: string, keyType: string = 'rsa'): string {
    return `v=DKIM1; k=${keyType}; p=${publicKeyForDNS}`;
}

/**
 * Validates a DKIM private key format
 */
export function isValidDKIMPrivateKey(privateKey: string): boolean {
    return privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
           privateKey.includes('-----END PRIVATE KEY-----');
}

/**
 * Validates a DKIM public key format
 */
export function isValidDKIMPublicKey(publicKey: string): boolean {
    return publicKey.includes('-----BEGIN PUBLIC KEY-----') &&
           publicKey.includes('-----END PUBLIC KEY-----');
}
