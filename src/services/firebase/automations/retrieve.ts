"use server";

// Local Imports
import { IAutomation } from "@/models/automation";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getAutomationsPath } from "@/constants/collections";

export async function retrieveAutomations({
    organisationId,
    entityId,
}: {
    organisationId: string;
    entityId: string;
}): Promise<{ automations: IAutomation[] | null; error: string | null }> {
    try {
        const automationsPath = getAutomationsPath(organisationId, entityId);
        const snapshot = await firestoreAdmin
            .collection(automationsPath)
            .orderBy("createdAt", "desc")
            .get();

        if (snapshot.empty) {
            return { automations: [], error: null };
        }

        const automations = snapshot.docs.map((doc) => doc.data() as IAutomation);

        return { automations, error: null };
    } catch (error) {
        console.error("Error retrieving automations:", error);
        return {
            automations: null,
            error: error instanceof Error ? error.message : "Failed to retrieve automations",
        };
    }
}

export async function retrieveAutomation({
    organisationId,
    entityId,
    automationId,
}: {
    organisationId: string;
    entityId: string;
    automationId: string;
}): Promise<{ automation: IAutomation | null; error: string | null }> {
    try {
        const automationsPath = getAutomationsPath(organisationId, entityId);
        const docRef = firestoreAdmin.collection(automationsPath).doc(automationId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return { automation: null, error: "Automation not found" };
        }

        const automation = snapshot.data() as IAutomation;

        return { automation, error: null };
    } catch (error) {
        console.error("Error retrieving automation:", error);
        return {
            automation: null,
            error: error instanceof Error ? error.message : "Failed to retrieve automation",
        };
    }
}
