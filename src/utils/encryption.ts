"use server"

import crypto from 'crypto';

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Get encryption key from environment variable
 */
function getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    return key;
}

/**
 * Derive a key from the master key and salt using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt text using AES-256-GCM
 * @param text - Plain text to encrypt
 * @returns Encrypted text in format: salt:iv:tag:encryptedData (base64 encoded)
 */
export async function excryptText(text: string): Promise<string> {
    try {
        const masterKey = getEncryptionKey();

        // Generate random salt and IV
        const salt = crypto.randomBytes(SALT_LENGTH);
        const iv = crypto.randomBytes(IV_LENGTH);

        // Derive key from master key and salt
        const key = deriveKey(masterKey, salt);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Get authentication tag
        const tag = cipher.getAuthTag();

        // Combine salt, iv, tag, and encrypted data
        const result = `${salt.toString('base64')}:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;

        return result;
    } catch (error) {
        throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Decrypt text that was encrypted with excryptText
 * @param excryptedText - Encrypted text in format: salt:iv:tag:encryptedData
 * @returns Decrypted plain text
 */
export async function decryptText(excryptedText: string): Promise<string> {
    try {
        const masterKey = getEncryptionKey();

        // Split the encrypted text into components
        const parts = excryptedText.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted text format');
        }

        const [saltB64, ivB64, tagB64, encryptedData] = parts;

        // Convert from base64
        const salt = Buffer.from(saltB64, 'base64');
        const iv = Buffer.from(ivB64, 'base64');
        const tag = Buffer.from(tagB64, 'base64');

        // Derive the same key using salt
        const key = deriveKey(masterKey, salt);

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        // Decrypt the text
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}   