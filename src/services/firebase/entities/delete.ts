"use server";

// Local Imports
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getEntitiesPath, organisationsCol } from "@/constants/collections";
import { FieldValue } from "firebase-admin/firestore";

export async function deleteEntity({
    organisationId,
    entityId,
}: {
    organisationId: string;
    entityId: string;
}): Promise<{ success?: boolean; error?: string }> {
    try {
        // Use subcollection path: organisations/{organisationId}/entities
        const entitiesPath = getEntitiesPath(organisationId);
        const entityRef = firestoreAdmin.collection(entitiesPath).doc(entityId);

        await entityRef.delete();

        // Decrement entities count on organisation
        const orgRef = firestoreAdmin.collection(organisationsCol).doc(organisationId);
        await orgRef.update({
            entities: FieldValue.increment(-1),
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting entity:", error);
        return { error: error instanceof Error ? error.message : "Failed to delete entity" };
    }
}

// Legacy alias for backwards compatibility
export const deleteProduct = deleteEntity;
