"use server";

// Local Imports
import { IConnection, ConnectionType } from "@/models/connection";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { getConnectionsPath } from "@/constants/collections";
import { decrypt } from "@/lib/encryption";

export async function retrieveConnectionByType({
    organisationId,
    type,
}: {
    organisationId: string;
    type: ConnectionType;
}): Promise<IConnection | null> {
    try {
        // Use subcollection path: organisations/{organisationId}/connections
        const connectionsPath = getConnectionsPath(organisationId);
        const snapshot = await firestoreAdmin
            .collection(connectionsPath)
            .where("type", "==", type)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const connection = snapshot.docs[0].data() as IConnection;

        // Decrypt tokens for use
        if (connection.accessToken) {
            connection.accessToken = decrypt(connection.accessToken);
        }
        if (connection.refreshToken) {
            connection.refreshToken = decrypt(connection.refreshToken);
        }

        return connection;
    } catch (error) {
        console.error("Error retrieving connection:", error);
        return null;
    }
}

export async function retrieveConnectionStatus({
    organisationId,
    type,
}: {
    organisationId: string;
    type: ConnectionType;
}): Promise<{ connected: boolean; connection?: IConnection }> {
    try {
        // Use subcollection path: organisations/{organisationId}/connections
        const connectionsPath = getConnectionsPath(organisationId);
        const snapshot = await firestoreAdmin
            .collection(connectionsPath)
            .where("type", "==", type)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return { connected: false };
        }

        const connection = snapshot.docs[0].data() as IConnection;
        return {
            connected: connection.status === "connected",
            connection: {
                ...connection,
                // Don't send encrypted tokens to the client
                accessToken: undefined,
                refreshToken: undefined,
            },
        };
    } catch (error) {
        console.error("Error checking connection status:", error);
        return { connected: false };
    }
}

export async function retrieveConnection({
    organisationId,
    connectionId,
}: {
    organisationId: string;
    connectionId: string;
}): Promise<IConnection | null> {
    try {
        // Use subcollection path: organisations/{organisationId}/connections
        const connectionsPath = getConnectionsPath(organisationId);
        const docRef = firestoreAdmin.collection(connectionsPath).doc(connectionId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        const connection = snapshot.data() as IConnection;

        // Decrypt tokens for use
        if (connection.accessToken) {
            connection.accessToken = decrypt(connection.accessToken);
        }
        if (connection.refreshToken) {
            connection.refreshToken = decrypt(connection.refreshToken);
        }

        return connection;
    } catch (error) {
        console.error("Error retrieving connection:", error);
        return null;
    }
}

export async function retrieveAllConnections({
    organisationId,
}: {
    organisationId: string;
}): Promise<IConnection[]> {
    try {
        // Use subcollection path: organisations/{organisationId}/connections
        const connectionsPath = getConnectionsPath(organisationId);
        const snapshot = await firestoreAdmin
            .collection(connectionsPath)
            .get();

        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map((doc) => {
            const connection = doc.data() as IConnection;
            // Don't send encrypted tokens to the client
            return {
                ...connection,
                accessToken: undefined,
                refreshToken: undefined,
            };
        });
    } catch (error) {
        console.error("Error retrieving connections:", error);
        return [];
    }
}
