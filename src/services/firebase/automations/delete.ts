"use server";

// Local Imports
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getAutomationsPath } from "@/constants/collections";

export async function deleteAutomation({
    organisationId,
    entityId,
    automationId,
}: {
    organisationId: string;
    entityId: string;
    automationId: string;
}): Promise<{ success?: boolean; error?: string }> {
    try {
        const automationsPath = getAutomationsPath(organisationId, entityId);
        const automationRef = firestoreAdmin.collection(automationsPath).doc(automationId);

        await automationRef.delete();

        return { success: true };
    } catch (error) {
        console.error("Error deleting automation:", error);
        return { error: error instanceof Error ? error.message : "Failed to delete automation" };
    }
}
