"use server";

import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getDomainsPath } from "@/constants/collections";

export async function deleteDomain(organisationId: string, domainId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const domainsPath = getDomainsPath(organisationId);
        await firestoreAdmin.collection(domainsPath).doc(domainId).delete();

        return { success: true };
    } catch (error) {
        console.error("Error deleting domain:", error);
        return { error: error instanceof Error ? error.message : "Failed to delete domain" };
    }
}
