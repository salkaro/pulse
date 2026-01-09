"use server";

// Local Imports
import { IConnection, ConnectionType } from "@/models/connection";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getConnectionsPath } from "@/constants/collections";
import { encrypt } from "@/lib/encryption";

export async function createConnection({
    organisationId,
    type,
    accessToken,
    refreshToken,
    stripeAccountId,
    googleEmail,
    expiresAt,
}: {
    organisationId: string;
    type: ConnectionType;
    accessToken: string;
    refreshToken?: string;
    stripeCustomerId?: string;
    stripeAccountId?: string;
    googleEmail?: string;
    expiresAt?: number;
}): Promise<IConnection | null> {
    try {
        // Use subcollection path: organisations/{organisationId}/connections
        const connectionsPath = getConnectionsPath(organisationId);
        const connectionRef = firestoreAdmin.collection(connectionsPath).doc();
        const now = Date.now();

        const connection: IConnection = {
            id: connectionRef.id,
            organisationId,
            type,
            status: "connected",
            accessToken: encrypt(accessToken),
            ...(refreshToken && { refreshToken: encrypt(refreshToken) }),
            ...(stripeAccountId && { stripeAccountId }),
            ...(googleEmail && { googleEmail }),
            connectedAt: now,
            lastSyncedAt: now,
            ...(expiresAt && { expiresAt }),
        };

        await connectionRef.set(connection);
        return connection;
    } catch (error) {
        console.error("Error creating connection:", error);
        return null;
    }
}
