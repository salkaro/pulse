"use server";

// Local Imports
import { IAutomation, AutomationType } from "@/models/automation";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getAutomationsPath } from "@/constants/collections";

export async function createAutomation({
    organisationId,
    entityId,
    type,
}: {
    organisationId: string;
    entityId: string;
    type: AutomationType;
}): Promise<{ automation?: IAutomation; error?: string }> {
    try {
        const automationsPath = getAutomationsPath(organisationId, entityId);
        const automationRef = firestoreAdmin.collection(automationsPath).doc();
        const now = Date.now();

        const automation: IAutomation = {
            id: automationRef.id,
            type,
            entityId,
            createdAt: now,
        };

        await automationRef.set(automation);

        return { automation };
    } catch (error) {
        console.error("Error creating automation:", error);
        return { error: error instanceof Error ? error.message : "Failed to create automation" };
    }
}
