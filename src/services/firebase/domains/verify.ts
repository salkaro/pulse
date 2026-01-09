"use server";

import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getDomainsPath } from "@/constants/collections";
import { IDomain, IDNSRecord } from "@/models/domain";
import dns from "dns";
import { promisify } from "util";

const resolveTxt = promisify(dns.resolveTxt);
const resolveMx = promisify(dns.resolveMx);
const resolveCname = promisify(dns.resolveCname);

export async function verifyDomain(organisationId: string, domainId: string): Promise<{ success?: boolean; error?: string; domain?: IDomain }> {
    try {
        const domainsPath = getDomainsPath(organisationId);
        const domainRef = firestoreAdmin.collection(domainsPath).doc(domainId);
        const domainDoc = await domainRef.get();

        if (!domainDoc.exists) {
            return { error: "Domain not found" };
        }

        const domain = domainDoc.data() as IDomain;
        const updatedRecords: IDNSRecord[] = [];
        let allRecordsVerified = true;

        // Verify each DNS record
        for (const record of domain.dnsRecords) {
            let verified = false;

            try {
                if (record.type === "TXT") {
                    const txtRecords = await resolveTxt(record.name);
                    const flatRecords = txtRecords.map(r => r.join(''));

                    // Check if the expected value exists in DNS
                    verified = flatRecords.some(r => r.includes(record.value) || record.value.includes(r));
                } else if (record.type === "MX") {
                    const mxRecords = await resolveMx(record.name);
                    verified = mxRecords.some(mx => mx.exchange === record.value);
                } else if (record.type === "CNAME") {
                    const cnameRecords = await resolveCname(record.name);
                    verified = cnameRecords.includes(record.value);
                }
            } catch (error) {
                // DNS lookup failed, record not verified
                verified = false;
            }

            updatedRecords.push({
                ...record,
                verified
            });

            if (!verified) {
                allRecordsVerified = false;
            }
        }

        // Update domain with verification results
        const now = Date.now();
        const updates: Partial<IDomain> = {
            dnsRecords: updatedRecords,
            lastVerificationAttempt: now,
            updatedAt: now
        };

        // Check if ownership record is verified
        const ownershipRecord = updatedRecords.find(r => r.purpose === "ownership");
        if (ownershipRecord?.verified) {
            updates.verificationStatus = "verified";
            updates.verifiedAt = now;

            // Enable email only if all email-related records are verified
            const emailRecords = updatedRecords.filter(r =>
                r.purpose === "spf" || r.purpose === "dkim" || r.purpose === "dmarc"
            );
            const allEmailRecordsVerified = emailRecords.every(r => r.verified);
            updates.emailEnabled = allEmailRecordsVerified;
        } else {
            updates.verificationStatus = "pending";
        }

        await domainRef.update(updates);

        const updatedDomain = {
            ...domain,
            ...updates
        } as IDomain;

        return { success: true, domain: updatedDomain };
    } catch (error) {
        console.error("Error verifying domain:", error);
        return { error: error instanceof Error ? error.message : "Failed to verify domain" };
    }
}
