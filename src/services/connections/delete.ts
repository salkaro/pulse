"use server";

// Local Imports
import { ConnectionType } from "@/models/connection";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getConnectionsPath } from "@/constants/collections";

export async function deleteConnection({
    organisationId,
    type,
}: {
    organisationId: string;
    type: ConnectionType;
}): Promise<boolean> {
    try {
        // Use subcollection path: organisations/{organisationId}/connections
        const connectionsPath = getConnectionsPath(organisationId);
        const snapshot = await firestoreAdmin
            .collection(connectionsPath)
            .where("type", "==", type)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return false;
        }

        await snapshot.docs[0].ref.delete();
        return true;
    } catch (error) {
        console.error("Error deleting connection:", error);
        return false;
    }
}
