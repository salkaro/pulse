"use server";

import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getDomainsPath } from "@/constants/collections";
import { ICreateDomainInput, IDomain } from "@/models/domain";
import { generateDKIMSelector, generateDNSRecords, generateVerificationToken, isValidDomain, normalizeDomain } from "@/utils/dns";
import { generateDKIMKeyPair } from "@/utils/dkim";

export async function createDomain(input: ICreateDomainInput): Promise<{ success?: boolean; error?: string; domain?: IDomain }> {
    try {
        const { domain, organisationId, createdBy } = input;

        // Normalize and validate domain
        const normalizedDomain = normalizeDomain(domain);
        if (!isValidDomain(normalizedDomain)) {
            return { error: "Invalid domain format" };
        }

        const domainsPath = getDomainsPath(organisationId);
        const domainsRef = firestoreAdmin.collection(domainsPath);

        // Check if domain already exists
        const existingDomain = await domainsRef.where("domain", "==", normalizedDomain).get();
        if (!existingDomain.empty) {
            return { error: "Domain already exists" };
        }

        // Generate verification token and DKIM selector
        const verificationToken = generateVerificationToken();
        const dkimSelector = generateDKIMSelector();

        // Generate DKIM key pair (2048-bit RSA)
        const dkimKeys = generateDKIMKeyPair(2048);

        // Generate DNS records with the DKIM public key
        const dnsRecords = generateDNSRecords(normalizedDomain, verificationToken, dkimSelector, dkimKeys.publicKeyForDNS);

        const now = Date.now();
        const domainDoc = domainsRef.doc();

        const newDomain: IDomain = {
            id: domainDoc.id,
            domain: normalizedDomain,
            organisationId,
            verificationStatus: "pending",
            verificationToken,
            dnsRecords,
            emailEnabled: false,
            dkimSelector,
            dkimPrivateKey: dkimKeys.privateKey,
            dkimPublicKey: dkimKeys.publicKey,
            createdAt: now,
            updatedAt: now,
            createdBy
        };

        await domainDoc.set(newDomain);

        return { success: true, domain: newDomain };
    } catch (error) {
        console.error("Error creating domain:", error);
        return { error: error instanceof Error ? error.message : "Failed to create domain" };
    }
}
