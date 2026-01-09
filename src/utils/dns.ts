import { IDNSRecord } from "@/models/domain";
import { randomAlphaNumeric } from "./generate";
import { createDKIMRecordValue } from "./dkim";

export function generateVerificationToken(): string {
    return randomAlphaNumeric(32);
}

export function generateDKIMSelector(): string {
    return `mail${Date.now().toString(36)}`;
}

export function generateDNSRecords(domain: string, verificationToken: string, dkimSelector: string, dkimPublicKey: string): IDNSRecord[] {
    const records: IDNSRecord[] = [];

    // 1. Domain Ownership Verification (TXT record)
    records.push({
        type: "TXT",
        name: `_verification.${domain}`,
        value: `verification-token=${verificationToken}`,
        purpose: "ownership",
        verified: false
    });

    // 2. SPF Record (TXT record)
    records.push({
        type: "TXT",
        name: domain,
        value: "v=spf1 include:_spf.google.com ~all",
        purpose: "spf",
        verified: false
    });

    // 3. DKIM Record (TXT record) with real RSA key
    const dkimRecordValue = createDKIMRecordValue(dkimPublicKey);
    records.push({
        type: "TXT",
        name: `${dkimSelector}._domainkey.${domain}`,
        value: dkimRecordValue,
        purpose: "dkim",
        verified: false
    });

    // 4. DMARC Record (TXT record)
    records.push({
        type: "TXT",
        name: `_dmarc.${domain}`,
        value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; fo=1; adkim=s; aspf=s; pct=100; ri=86400`,
        purpose: "dmarc",
        verified: false
    });

    // 5. MX Record (for receiving emails)
    records.push({
        type: "MX",
        name: domain,
        value: `mail.${domain}`,
        priority: 10,
        purpose: "mx",
        verified: false
    });

    return records;
}

export function normalizeDomain(domain: string): string {
    // Remove protocol if present
    domain = domain.replace(/^https?:\/\//, '');

    // Remove www. prefix if present
    domain = domain.replace(/^www\./, '');

    // Remove trailing slash
    domain = domain.replace(/\/$/, '');

    // Remove port if present
    domain = domain.split(':')[0];

    // Convert to lowercase
    domain = domain.toLowerCase();

    return domain;
}

export function isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
}
