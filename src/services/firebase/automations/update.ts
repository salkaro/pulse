"use server";

// Local Imports
import { IEmailTemplate } from "@/models/automation";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getAutomationsPath } from "@/constants/collections";

export async function updateAutomation({
    organisationId,
    entityId,
    automationId,
    emailTemplate,
}: {
    organisationId: string;
    entityId: string;
    automationId: string;
    emailTemplate?: IEmailTemplate;
}): Promise<{ success?: boolean; error?: string }> {
    try {
        const automationsPath = getAutomationsPath(organisationId, entityId);
        const automationRef = firestoreAdmin.collection(automationsPath).doc(automationId);

        const updateData: any = {};

        if (emailTemplate) {
            updateData.emailTemplate = emailTemplate;
        }

        await automationRef.update(updateData);

        return { success: true };
    } catch (error) {
        console.error("Error updating automation:", error);
        return { error: error instanceof Error ? error.message : "Failed to update automation" };
    }
}
