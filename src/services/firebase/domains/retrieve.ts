"use server";

import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getDomainsPath } from "@/constants/collections";
import { IDomain } from "@/models/domain";

export async function retrieveDomains(organisationId: string): Promise<{ success?: boolean; error?: string; domains?: IDomain[] }> {
    try {
        const domainsPath = getDomainsPath(organisationId);
        const domainsSnapshot = await firestoreAdmin.collection(domainsPath).orderBy("createdAt", "desc").get();

        const domains: IDomain[] = [];
        domainsSnapshot.forEach((doc) => {
            domains.push(doc.data() as IDomain);
        });

        return { success: true, domains };
    } catch (error) {
        console.error("Error retrieving domains:", error);
        return { error: error instanceof Error ? error.message : "Failed to retrieve domains" };
    }
}

export async function retrieveDomain(organisationId: string, domainId: string): Promise<{ success?: boolean; error?: string; domain?: IDomain }> {
    try {
        const domainsPath = getDomainsPath(organisationId);
        const domainDoc = await firestoreAdmin.collection(domainsPath).doc(domainId).get();

        if (!domainDoc.exists) {
            return { error: "Domain not found" };
        }

        return { success: true, domain: domainDoc.data() as IDomain };
    } catch (error) {
        console.error("Error retrieving domain:", error);
        return { error: error instanceof Error ? error.message : "Failed to retrieve domain" };
    }
}
