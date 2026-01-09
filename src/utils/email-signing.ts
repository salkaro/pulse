import crypto from 'crypto';

export interface DKIMSignatureOptions {
    privateKey: string;
    selector: string;
    domain: string;
    headers: string[];
    body: string;
    canonicalization?: string;
}

/**
 * Generates a DKIM signature for an email
 * This is used when sending emails to authenticate that the email came from your domain
 *
 * @param options - DKIM signature options including private key, selector, domain, headers, and body
 * @returns DKIM-Signature header value
 */
export function generateDKIMSignature(options: DKIMSignatureOptions): string {
    const {
        privateKey,
        selector,
        domain,
        headers,
        body,
        canonicalization = 'relaxed/relaxed'
    } = options;

    const timestamp = Math.floor(Date.now() / 1000);
    const [headerCanon, bodyCanon] = canonicalization.split('/');

    // Canonicalize body
    const canonicalizedBody = canonicalizeBody(body, bodyCanon);

    // Generate body hash
    const bodyHash = crypto
        .createHash('sha256')
        .update(canonicalizedBody)
        .digest('base64');

    // Build the DKIM signature header (without the signature itself)
    const dkimHeader = [
        `v=1`,
        `a=rsa-sha256`,
        `c=${canonicalization}`,
        `d=${domain}`,
        `s=${selector}`,
        `t=${timestamp}`,
        `bh=${bodyHash}`,
        `h=${headers.join(':')}`,
        `b=`
    ].join('; ');

    // Canonicalize headers
    const canonicalizedHeaders = headers
        .map(header => canonicalizeHeader(header, headerCanon))
        .join('\r\n');

    // Create signature
    const dataToSign = canonicalizedHeaders + '\r\n' + dkimHeader;
    const signature = crypto
        .createSign('RSA-SHA256')
        .update(dataToSign)
        .sign(privateKey, 'base64');

    // Return complete DKIM-Signature header
    return `v=1; a=rsa-sha256; c=${canonicalization}; d=${domain}; s=${selector}; t=${timestamp}; bh=${bodyHash}; h=${headers.join(':')}; b=${signature}`;
}

/**
 * Canonicalizes email body according to DKIM specification
 */
function canonicalizeBody(body: string, canonicalization: string): string {
    if (canonicalization === 'simple') {
        // Simple canonicalization: just ensure CRLF line endings
        return body.replace(/\r?\n/g, '\r\n');
    } else {
        // Relaxed canonicalization
        return body
            .replace(/[ \t]+\r?\n/g, '\r\n') // Remove trailing whitespace
            .replace(/[ \t]+/g, ' ')          // Collapse whitespace
            .replace(/\r?\n/g, '\r\n');       // Normalize line endings
    }
}

/**
 * Canonicalizes email header according to DKIM specification
 */
function canonicalizeHeader(header: string, canonicalization: string): string {
    if (canonicalization === 'simple') {
        return header;
    } else {
        // Relaxed canonicalization
        const [name, ...valueParts] = header.split(':');
        const value = valueParts.join(':');

        return `${name.toLowerCase().trim()}:${value.replace(/[ \t]+/g, ' ').trim()}`;
    }
}

/**
 * Example usage when sending an email:
 *
 * const dkimSignature = generateDKIMSignature({
 *     privateKey: domain.dkimPrivateKey,
 *     selector: domain.dkimSelector,
 *     domain: domain.domain,
 *     headers: ['from', 'to', 'subject', 'date'],
 *     body: emailBody,
 *     canonicalization: 'relaxed/relaxed'
 * });
 *
 * // Add this as a header to your email:
 * // DKIM-Signature: ${dkimSignature}
 */
