"use server";

// Local Imports
import { firestoreAdmin, admin } from "@/lib/firebase/config-admin";
import { getConnectionsPath } from "@/constants/collections";

export async function updateConnection({
    connectionId,
    organisationId,
    updates,
}: {
    connectionId: string;
    organisationId: string;
    updates: {
        entityId?: string | null;
        status?: string;
        lastSyncedAt?: number;
        error?: string;
        [key: string]: unknown;
    };
}): Promise<{ success: boolean; error: string | null }> {
    try {
        // Use subcollection path: organisations/{organisationId}/connections
        const connectionsPath = getConnectionsPath(organisationId);
        const connectionRef = firestoreAdmin.collection(connectionsPath).doc(connectionId);

        // Check if connection exists
        const doc = await connectionRef.get();
        if (!doc.exists) {
            return { success: false, error: "Connection not found" };
        }

        // Filter out undefined values and convert null to FieldValue.delete()
        const filteredUpdates: Record<string, unknown> = {};
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                // Use FieldValue.delete() to actually remove the field from Firestore
                filteredUpdates[key] = value === null ? admin.firestore.FieldValue.delete() : value;
            }
        });

        await connectionRef.update(filteredUpdates);

        return { success: true, error: null };
    } catch (error) {
        console.error("Error updating connection:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update connection",
        };
    }
}
